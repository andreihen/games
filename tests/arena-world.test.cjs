const { setup, assert, fs, path } = require('./harness.cjs');
const reports = [],
    plain = (v) => JSON.parse(JSON.stringify(v));
async function test(name, run) {
    try {
        await run();
        reports.push({ name, status: 'PASS' });
        console.log('PASS ' + name);
    } catch (e) {
        reports.push({ name, status: 'FAIL', error: e.stack });
        console.error(e);
    }
}
async function run() {
    const t = setup(),
        E = t.api('ArenaEngine'),
        D = await t.api('GameData').load('arena');
    const chars = (n, stat = 6) =>
        plain(D.characters.slice(0, n)).map((p) => ({
            ...p,
            attributes: Object.fromEntries(Object.keys(D.attributes).map((k) => [k, stat])),
            starting: ['knife']
        }));
    const cfg = (seed, characters, extra = {}) => ({
        seed,
        characters,
        arena: 'city',
        balance: false,
        startingKit: 'none',
        ...extra
    });
    const quiet = {
        ...D,
        events: D.events.map((e) => ({ ...e, weight: e.id === 'rest' ? 1 : 0 }))
    };
    function nextPeriod(e) {
        const period = e.current().period,
            day = e.current().day;
        while (!e.current().finished && e.current().period === period && e.current().day === day)
            e.step();
    }
    await test('Mundo: aliados exploram separadamente e apoiam combate somente quando presentes e disponíveis', () => {
        const p = chars(3, 10),
            e = require('./arena-fixtures.cjs').equippedScenario(t, E.create(cfg('GROUP-1', p, { incidents: 'low' }), quiet), quiet);
        e.execute('alliance', p[0].id, p[1].id);
        // Each participant may explore even after their companion has used an action.
        e.execute('move', p[1].id);
        assert.notEqual(e.current().players[0].location, e.current().players[1].location);
        assert(e.current().players[0].allies.includes(p[1].id));
        nextPeriod(e);
        const before = e.current(),
            move = e.execute('move', p[0].id),
            after = e.current();
        assert.deepEqual(plain(move.acted), [p[0].id]);
        assert(after.queue.includes(p[1].id));
        assert.notEqual(after.players[0].location, before.players[0].location);
        e.execute('rest', p[1].id);
        assert.throws(() => e.execute('combat', p[2].id, p[0].id), /Condições/);
        let fight;
        for (let seed = 0; seed < 32; seed++) {
            fight = require('./arena-fixtures.cjs').equippedScenario(t, E.create(cfg('GROUP-ATTACK-' + seed, p, { incidents: 'low' }), quiet), quiet);
            fight.execute('alliance', p[0].id, p[1].id);
            if (fight.current().players[0].allies.includes(p[1].id)) break;
        }
        assert(fight.current().players[0].allies.includes(p[1].id));
        nextPeriod(fight);
        const hit = fight.execute('combat', p[0].id, p[2].id);
        assert(hit.acted.includes(p[1].id));
        assert(hit.participants.includes(p[1].id));
        assert(hit.checks.some((c) => c.actor === p[1].id));
        assert.throws(() => fight.execute('combat', p[1].id, p[2].id));
        E.invariant(fight.current(), D);
    });
    await test('Mundo: grupos são consistentes, traidor abandona todos os aliados e só ataca no local', () => {
        const p = chars(4, 10);
        let e;
        for (let seed = 0; seed < 32; seed++) {
            e = require('./arena-fixtures.cjs').equippedScenario(t, E.create(cfg('BETRAY-GROUP-' + seed, p), quiet), quiet);
            e.execute('alliance', p[0].id, p[1].id);
            e.execute('alliance', p[2].id, p[1].id);
            if (e.current().players[0].allies.length === 2) break;
        }
        assert.equal(e.current().players[0].allies.length, 2);
        nextPeriod(e);
        const betrayal = e.execute('betray', p[0].id, p[1].id);
        assert.equal(e.current().players[0].allies.length, 0);
        assert(
            e
                .current()
                .players.slice(1)
                .every((x) => !x.allies.includes(p[0].id))
        );
        assert(betrayal.acted.includes(p[0].id));
        assert(betrayal.acted.every(id => betrayal.participants.includes(id)));
        E.invariant(e.current(), D);
    });
    await test('Mundo: explosivos são consumidos, atingem somente a região e têm fuga individual baseada em atributos', () => {
        let instant = false,
            higher = false,
            testedLocal = false;
        for (let seed = 0; seed < 24; seed++) {
            const p = chars(4, 1);
            p[0].starting = ['charge'];
            p[2].attributes.agility = 10;
            p[2].attributes.perception = 10;
            const e = require('./arena-fixtures.cjs').equippedScenario(t, E.create(cfg('AOE-' + seed, p), D), D);
            e.execute('move', p[3].id);
            const remote = plain(e.current().players[3]);
            const ev = e.execute('areaattack', p[0].id),
                w = e.current();
            assert.equal(ev.checks.length, 2);
            assert(!ev.participants.includes(p[3].id));
            assert.deepEqual(plain(w.players[3]), remote);
            assert(!w.players[0].inventory.some((id) => w.items[id].kind === 'charge'));
            assert.throws(() => e.execute('areaattack', p[0].id));
            higher ||=
                ev.checks.find((c) => c.actor === p[2].id).chance >
                ev.checks.find((c) => c.actor === p[1].id).chance;
            instant ||= w.players[1].status === 'dead' && w.players[1].death.kind === 'explosion';
            testedLocal = true;
            E.invariant(w, D);
        }
        assert(instant && higher && testedLocal);
    });
    await test('Mundo: nuvens persistem por região, fuga usa passagens e atributos; efeitos expiram e não alteram pontos base', () => {
        let found = false;
        for (let seed = 0; seed < 32 && !found; seed++) {
            const e = E.create(cfg('CLOUD-' + seed, chars(3, 1), { incidents: 'high' }), quiet);
            for (let n = 0; n < 60 && !e.current().finished; n++) {
                const ev = e.step(),
                    w = e.current();
                assert(w.regions.every((g) => g.risk >= 1 && g.risk <= 3));
                if (!ev.checks?.some((c) => c.label.includes('Escapar de nuvem'))) continue;
                const id = ev.participants[0],
                    p = w.players.find((x) => x.id === id);
                assert(ev.acted.includes(id));
                assert.equal(
                    Object.values(p.attributes).reduce((a, b) => a + b, 0),
                    6
                );
                const effective = E.effectiveAttributes(p);
                assert(Object.values(effective).every((v) => v >= 1 && v <= 10));
                if (p.effects.length) {
                    const initialDay = w.day,
                        initialPeriod = w.period;
                    while (
                        !e.current().finished &&
                        (e.current().day === initialDay || e.current().period === initialPeriod)
                    )
                        e.step();
                }
                assert.equal(E.restore(e.save(), quiet).save(), e.save());
                found = true;
                break;
            }
        }
        assert(found, 'Amostra precisa conter nuvem e resposta do NPC');
        const p = chars(2, 6);
        p[0].starting = ['adrenaline'];
        const e = require('./arena-fixtures.cjs').equippedScenario(t, E.create(cfg('BOOST', p, { incidents: 'low' }), quiet), quiet);
        e.execute('boost', p[0].id);
        assert.equal(E.effectiveAttributes(e.current().players[0]).agility, 9);
        assert.equal(e.current().players[0].attributes.agility, 6);
        for (let i = 0; i < 3; i++) nextPeriod(e);
        assert.equal(
            e.current().players[0].effects.filter((f) => f.name === 'adrenalina').length,
            0
        );
    });
    await test('Mundo: 24 competições auditam turnos, interações locais, duração, perigos, replay e exploração', () => {
        const metrics = {
            simulations: 0,
            events: 0,
            days: 0,
            combat: 0,
            environment: 0,
            groupActions: 0,
            areaAttacks: 0,
            hazards: 0,
            exploration: 0,
            restDay: 0,
            restNight: 0
        };
        for (let seed = 0; seed < 24; seed++) {
            const e = E.create(
                cfg('WORLD-' + seed, chars(12), {
                    arena: D.arenas[seed % 6].id,
                    incidents: seed % 2 ? 'high' : 'normal'
                }),
                D
            );
            let used = new Set(),
                before = e.current();
            while (!before.finished) {
                const ev = e.step(),
                    w = e.current();
                if (ev.type === 'period') used = new Set();
                else
                    for (const id of ev.acted) {
                        assert(!used.has(id), 'NPC teve duas ações no período');
                        used.add(id);
                    }
                if (ev.type !== 'period')
                    for (const id of ev.participants)
                        assert.equal(
                            before.players.find((p) => p.id === id).location,
                            before.players.find((p) => p.id === ev.participants[0]).location
                        );
                metrics.events++;
                metrics.groupActions += ev.acted.length > 1;
                metrics.areaAttacks +=
                    ev.checks?.some((c) => c.label.includes('explosão')) || false;
                metrics.hazards += ev.changes.regions.some((c) => c.after.environment);
                metrics.exploration += ev.action === 'explore';
                if (ev.text.includes('descans'))
                    metrics[ev.period === 'night' ? 'restNight' : 'restDay']++;
                E.invariant(w, D);
                before = w;
            }
            assert(before.day <= 16);
            assert(before.players.filter((p) => p.status === 'alive').length <= 1);
            assert.equal(E.restore(e.save(), D).save(), e.save());
            metrics.simulations++;
            metrics.days += before.day;
            metrics.combat += e.summary().combat;
            metrics.environment += e.summary().environment;
        }
        assert(
            metrics.areaAttacks > 0 &&
                metrics.groupActions > 0 &&
                metrics.hazards > 0 &&
                metrics.exploration > 0
        );
        assert(metrics.restNight > metrics.restDay);
        metrics.meanDays = metrics.days / metrics.simulations;
        metrics.meanEvents = metrics.events / metrics.simulations;
        console.log('MUNDO', JSON.stringify(metrics));
        fs.writeFileSync(
            path.join(__dirname, 'results/arena-world-balance.json'),
            JSON.stringify(metrics, null, 2)
        );
    });
    t.clean();
    await test('Filmes: busca confirma classe de filme, traduz papéis, separa personagem de ator e trata falhas', async () => {
        const x = setup(),
            A = x.api('ArenaAccess'),
            seen = [];
        const value = (v) => ({ rank: 'normal', mainsnak: { datavalue: { value: v } } });
        const entity = (id, name, claims) => ({ id, labels: { pt: { value: name } }, claims });
        const film = entity('Q10', 'Filme de teste', {
            P31: [value({ id: 'Q24869' })],
            P577: [value({ time: '+2001-01-01T00:00:00Z' })],
            P161: [
                {
                    ...value({ id: 'Q20' }),
                    qualifiers: { P453: [{ datavalue: { value: { id: 'Q30' } } }] }
                },
                value({ id: 'Q21' }),
                {
                    ...value({ id: 'Q21' }),
                    qualifiers: { P4633: [{ datavalue: { value: 'Capitã Lua' } }] }
                }
            ]
        });
        const records = {
            Q10: film,
            Q11: entity('Q11', 'Uma série', { P31: [value({ id: 'Q5398426' })] }),
            Q24869: entity('Q24869', 'Longa-metragem', { P279: [value({ id: 'Q11424' })] }),
            Q5398426: entity('Q5398426', 'Série', {}),
            Q20: entity('Q20', 'Nome do ator', { P18: [value('Portrait.jpg')] }),
            Q21: entity('Q21', 'Outra atriz', {}),
            Q30: entity('Q30', 'Personagem real da obra', {})
        };
        x.w.fetch = async (url) => {
            const u = new URL(url);
            assert.equal(u.searchParams.get('origin'), '*');
            seen.push(u);
            return {
                ok: true,
                json: async () =>
                    u.searchParams.get('action') === 'wbsearchentities'
                        ? { search: [{ id: 'Q10' }, { id: 'Q11' }] }
                        : {
                              entities: Object.fromEntries(
                                  u.searchParams
                                      .get('ids')
                                      .split('|')
                                      .map((id) => [id, records[id] || {}])
                              )
                          }
            };
        };
        const results = await A.searchMovies('Filme');
        assert.deepEqual(plain(results.map((p) => p.id)), ['Q10']);
        assert.equal(results[0].year, '2001');
        const cast = await A.movieCast('Q10');
        assert.deepEqual(plain(cast.characters.map((p) => p.name)), [
            'Personagem real da obra',
            'Capitã Lua'
        ]);
        assert.equal(cast.characters[0].imageKind, 'actor');
        assert(cast.characters[0].image.includes('Portrait.jpg'));
        assert.equal(cast.characters[1].image, null);
        assert(cast.characters.every((p) => p.type === 'movies' && p.gender === 'unknown'));
        assert(seen.some((u) => u.searchParams.get('language') === 'pt'));
        await assert.rejects(A.movieCast('../Q10'), /Filme inválido/);
        await assert.rejects(A.movieCast('Q11'), /não é um filme/);
        x.w.fetch = async () => ({ ok: false });
        await assert.rejects(A.searchMovies('Filme'), /indisponível/);
        x.clean();
    });
    await test('Mundo: interface possui filmes, efeitos e perigo; saves antigos preservam elenco e histórico', async () => {
        const x = setup();
        await x.mount('survivalarena');
        assert(x.$('#sa-api-kind option[value=movies]'));
        x.$('#sa-api-kind').value = 'movies';
        x.$('#sa-api-kind').dispatchEvent(new x.w.Event('change'));
        assert.equal(x.$('#sa-theme').value, 'movies');
        const E2 = x.api('ArenaEngine'),
            D2 = await x.api('GameData').load('arena');
        const legacy = plain(E2.create(cfg('OLD2', chars(2)), D2).state);
        legacy.version = 2;
        legacy.dataVersion = 'arena-2';
        x.w.localStorage.setItem(
            'orbita:arena:legacy-save',
            JSON.stringify({ ...legacy, version: 1 })
        );
        x.w.localStorage.setItem('orbita:arena:save', JSON.stringify(legacy));
        x.click('#sa-resume');
        assert(x.$('#sa-status').textContent.includes('Elenco anterior recuperado'));
        x.click('#sa-start');
        assert.equal(
            JSON.parse(x.w.localStorage.getItem('orbita:arena:legacy-save-v2')).version,
            2
        );
        assert.equal(JSON.parse(x.w.localStorage.getItem('orbita:arena:save')).version, E2.version);
        let exportedBlob;
        x.w.URL.createObjectURL = (blob) => {
            exportedBlob = blob;
            return 'blob:arena-test';
        };
        let revoked = false;
        x.w.URL.revokeObjectURL = () => { revoked = true; };
        x.w.HTMLAnchorElement.prototype.click = () => {};
        x.click('#sa-export-legacy');
        const exported = await new Promise((resolve, reject) => {
            const reader = new x.w.FileReader();
            reader.onload = () => resolve(JSON.parse(reader.result));
            reader.onerror = reject;
            reader.readAsText(exportedBlob);
        });
        assert.equal(
            exported.version,
            2,
            'Exportar o save anterior mais recente, mesmo havendo backup v1'
        );
        assert.deepEqual(exported.world, legacy);
        await x.advance(1000);
        assert(revoked);
        assert.equal(x.errors.length, 0);
        x.clean();
    });
    fs.writeFileSync(
        path.join(__dirname, 'results/arena-world.json'),
        JSON.stringify(reports, null, 2)
    );
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
