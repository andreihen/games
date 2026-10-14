const { setup, assert, fs, path } = require('./harness.cjs');
const crypto = require('node:crypto'),
    reports = [];
const plain = (v) => JSON.parse(JSON.stringify(v));
async function test(name, run) {
    try {
        await run();
        reports.push({ name, status: 'PASS' });
        console.log('PASS ' + name);
    } catch (error) {
        reports.push({ name, status: 'FAIL', error: error.stack });
        console.error(error);
    }
}
async function run() {
    const t = setup(),
        E = t.api('ArenaEngine'),
        D = await t.api('GameData').load('arena'),
        keys = Object.keys(D.attributes);
    const cfg = (seed = 'RPG-TEST', extra = {}) => ({
        seed,
        arena: 'city',
        characters: D.characters.slice(0, 8),
        ...extra
    });
    await test('RPG: orçamento exato e idempotente de 6–60 pontos, limites 1–10 e edição sem balanceamento', () => {
        const rng = t.api('SeededRandom').create('BUDGET');
        for (let budget = 6; budget <= 60; budget++)
            for (let i = 0; i < 25; i++) {
                const original = Object.fromEntries(keys.map((k) => [k, rng.int(1, 10)])),
                    attrs = E.balanceAttributes(original, budget);
                assert.equal(
                    Object.values(attrs).reduce((s, n) => s + n, 0),
                    budget
                );
                assert(Object.values(attrs).every((n) => Number.isInteger(n) && n >= 1 && n <= 10));
                assert.deepEqual(plain(E.balanceAttributes(attrs, budget)), plain(attrs));
            }
        const c = plain(D.characters.slice(0, 2));
        c[0].attributes = Object.fromEntries(keys.map((k) => [k, 10]));
        assert.equal(
            Object.values(
                E.create(cfg('RAW', { characters: c, balance: false }), D).current().players[0]
                    .attributes
            ).reduce((s, n) => s + n, 0),
            60
        );
    });
    await test('RPG: seis desenhos e quatro topologias conectadas, fontes reais, rotas abertas preservadas pelo cerco', () => {
        const unique = new Set();
        for (const a of D.arenas) {
            unique.add(JSON.stringify(E.mapFor(a.id, 'biome', D)));
            for (const topology of ['biome', 'grid', 'ring', 'branch']) {
                const map = E.mapFor(a.id, topology, D);
                assert(E.connected(map));
                assert(map.some((r) => r.waterSource));
                assert(map.some((r) => r.foodSource));
                const e = E.create(
                    cfg('MAP-' + a.id, {
                        arena: a.id,
                        topology,
                        characters: D.characters.slice(0, 2),
                        behavior: 'cautious',
                        hostility: 'calm'
                    }),
                    D
                );
                while (!e.current().finished) {
                    e.step();
                    assert(E.connected(e.current().regions, true));
                }
            }
        }
        assert.equal(unique.size, 6);
    });
    await test('RPG: fotos locais de todo o catálogo, identidade iCarly, proveniência e bytes originais', () => {
        const sources = JSON.parse(
            fs.readFileSync(path.join(t.root, 'src/assets/characters/sources.json'), 'utf8')
        );
        assert.equal(sources.length, D.characters.length);
        assert(D.characters.length >= 131);
        for (const c of D.characters) {
            assert(c.image.startsWith('./src/assets/characters/'));
            const row = sources.find((x) => x.id === c.id);
            assert(row);
            const bytes = fs.readFileSync(path.join(t.root, c.image));
            assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), row.sha256);
            assert.equal(bytes.length, row.bytes);
            assert(c.imageSource.startsWith('https://'));
        }
        assert.deepEqual(
            plain(
                D.characters
                    .filter((c) => c.type === 'tv' && c.universe === 'iCarly')
                    .map((c) => c.name)
                    .sort()
            ),
            ['Carly Shay', 'Freddie Benson', 'Gibby Gibson', 'Sam Puckett', 'Spencer Shay'].sort()
        );
    });
    await test('RPG: chances de ataque e persuasão usam atributos do ator e do alvo', () => {
        function duel(strength, social) {
            const chars = plain(D.characters.slice(0, 2));
            for (const c of chars) c.attributes = Object.fromEntries(keys.map((k) => [k, 3]));
            chars[0].attributes.strength = strength;
            chars[0].attributes.social = social;
            chars[0].starting = ['knife'];
            chars[1].starting = ['knife'];
            return require('./arena-fixtures.cjs').equippedScenario(t, E.create(
                cfg('ROLL', { characters: chars, balance: false, startingKit: 'none' }),
                D
            ), D);
        }
        const high = duel(10, 10),
            low = duel(1, 1);
        const a = high.current().players[0].id,
            b = high.current().players[1].id;
        const hit = high.execute('combat', a, b),
            miss = low.execute('combat', a, b);
        assert(hit.checks[0].chance > miss.checks[0].chance);
        assert.equal(hit.checks[0].dice, miss.checks[0].dice);
        const diplomat = duel(3, 10),
            quiet = duel(3, 1);
        const x = diplomat.execute('persuade', a, b),
            y = quiet.execute('persuade', a, b);
        assert(x.checks[0].chance > y.checks[0].chance);
        assert.equal(diplomat.current().players[0].allies.includes(b), x.checks[0].success);
    });
    await test('RPG: armadilhas consomem material, respeitam posição e registram teste de detecção', () => {
        let encountered = false;
        for (let i = 0; i < 24 && !encountered; i++) {
            const chars = plain(D.characters.slice(0, 2));
            chars[0].starting = ['rope', 'knife'];
            chars[1].starting = ['knife'];
            const e = require('./arena-fixtures.cjs').equippedScenario(t, E.create(
                    cfg('TRAP-' + i, {
                        characters: chars,
                        arena: 'forest',
                        startingKit: 'none',
                        behavior: 'aggressive'
                    }),
                    D
                ), D),
                [a, b] = e.current().players;
            e.execute('trap', a.id);
            assert.equal(e.current().players[0].inventory.length, 1);
            assert.equal(Object.values(e.current().traps).length, 1);
            // Arrange an opponent entering the trapped region through its actual connection.
            const scene = e.state;
            scene.players[1].location = scene.regions[0].links[0];
            scene.regions.forEach(g => { g.closed = g.id !== 'r0'; });
            const entering = t.w.ArenaFixture.fixtureAttach(scene, D);
            const move = entering.execute('move', b.id);
            if (move.checks.length) {
                encountered = true;
                assert.equal(Object.values(entering.current().traps)[0].active, false);
                assert.equal(entering.current().players[1].location, 'r0');
                assert(move.checks[0].label.includes('armadilha'));
                E.invariant(entering.current(), D);
            }
        }
        assert(encountered, 'Nenhuma armadilha encontrada na amostra');
    });
    await test('RPG: armas próprias e munição entram no estado e no replay; opções inválidas são rejeitadas', () => {
        const custom = {
                id: 'custom-1',
                name: 'Arco de treino',
                power: 12,
                attribute: 'agility',
                ammo: 'arrows'
            },
            chars = plain(D.characters.slice(0, 2));
        chars[0].starting = ['custom-1', 'arrows'];
        const e = E.create(
            cfg('CUSTOM', { characters: chars, customWeapons: [custom], weapons: ['custom-1'] }),
            D
        );
        assert.equal(e.current().players[0].inventory.length, 0);
        assert(Object.values(e.current().items).some(i => i.kind === custom.id && i.owner.startsWith('r')));
        for (let i = 0; i < 20 && !e.current().finished; i++) e.step();
        assert.equal(E.restore(e.save(), D).save(), e.save());
        assert.throws(() => E.create(cfg('BAD', { customWeapons: [{ ...custom, power: 99 }] }), D));
        assert.throws(() =>
            E.create(cfg('BAD', { customWeapons: [{ ...custom, id: 'knife' }] }), D)
        );
    });
    await test('RPG: perfis mudam decisões e frequência alta aumenta imprevistos em seeds fixas', () => {
        function sample(behavior, incidents) {
            let fights = 0,
                unexpected = 0,
                total = 0;
            for (let i = 0; i < 10; i++) {
                const e = E.create(cfg('PROFILE-' + i, { behavior, incidents }), D);
                for (let n = 0; n < 90 && !e.current().finished; n++) {
                    const event = e.step();
                    fights += event.type === 'conflict';
                    unexpected += event.type === 'story';
                    total++;
                }
            }
            return { fights: fights / total, unexpected: unexpected / total };
        }
        const aggressive = sample('aggressive', 'normal'),
            diplomat = sample('diplomat', 'normal'),
            high = sample('balanced', 'high'),
            low = sample('balanced', 'low');
        assert(aggressive.fights > diplomat.fights * 1.3);
        assert(high.unexpected > low.unexpected * 1.4);
        console.log('PERFIS', JSON.stringify({ aggressive, diplomat, high, low }));
    });
    await test('RPG: confrontos continuam relevantes na sobrevivência sem kits, em seis arenas', () => {
        let combat = 0,
            all = 0;
        const rows = [];
        for (const arena of D.arenas) {
            let c = 0,
                environment = 0;
            for (let i = 0; i < 8; i++) {
                const e = E.create(
                    cfg('BALANCE-' + i, { arena: arena.id, characters: D.characters.slice(0, 12) }),
                    D
                );
                while (!e.current().finished) e.step();
                c += e.summary().combat;
                environment += e.summary().environment;
            }
            combat += c;
            all += c + environment;
            rows.push({ arena: arena.id, combat: c, environment });
        }
        // Empty inventories and independent exploration allow more survival outcomes than the old armed opening.
        assert(combat / all > 0.35, `Confrontos perderam relevância: ${combat}/${all}`);
        console.log(
            'CAUSAS',
            JSON.stringify({ combat, total: all, ratio: combat / all, arenas: rows })
        );
        fs.writeFileSync(
            path.join(__dirname, 'results/arena-balance.json'),
            JSON.stringify({ combat, total: all, ratio: combat / all, arenas: rows }, null, 2)
        );
    });
    t.clean();
    await test('RPG: painel por obra, primeiro personagem editável, foto por URL, orçamento e arma configurável', async () => {
        const t = setup();
        await t.mount('survivalarena');
        t.$('#sa-theme').value = 'tv';
        t.$('#sa-theme').dispatchEvent(new t.w.Event('change'));
        t.$('#sa-universe').value = 'iCarly';
        t.$('#sa-universe').dispatchEvent(new t.w.Event('change'));
        assert.equal(t.$$('.sa-catalog-card').length, 5);
        t.click('#sa-replace-theme');
        assert.equal(t.$$('.sa-cast-card img').length, 5);
        t.click('#sa-clear-roster');
        t.click('#sa-add');
        t.input('#sa-edit-form [name=name]', 'Meu personagem');
        t.input('#sa-edit-form [name=image]', 'https://example.org/photo.png');
        t.submit('#sa-edit-form');
        await t.flush();
        assert(t.$('#sa-roster').textContent.includes('Meu personagem'));
        assert.equal(t.$('#sa-roster img').src, 'https://example.org/photo.png');
        t.click('#sa-add');
        t.submit('#sa-edit-form');
        await t.flush();
        t.input('#sa-budget', 42);
        t.$('#sa-budget').dispatchEvent(new t.w.Event('change'));
        assert(t.$('#sa-roster').textContent.includes('42 pontos'));
        t.input('#sa-weapon-form [name=weaponName]', 'Lança nova');
        t.submit('#sa-weapon-form');
        assert(t.$('#sa-weapons').textContent.includes('Lança nova'));
        t.click('#sa-start');
        const save = JSON.parse(t.w.localStorage.getItem('orbita:arena:save'));
        assert.equal(save.version, E.version);
        assert.equal(save.config.customWeapons.length, 1);
        assert(
            save.players.every((p) => Object.values(p.attributes).reduce((s, n) => s + n, 0) === 42)
        );
        t.clean();
    });
    await test('RPG: save antigo preservado, elenco recuperado e morto sempre com retrato sem cor', async () => {
        const t = setup(),
            data = await t.api('GameData').load('arena');
        const old = {
            version: 1,
            config: { seed: 'OLD', arena: 'city', characters: plain(data.characters.slice(0, 2)) },
            history: [{ text: 'histórico anterior' }]
        };
        t.w.localStorage.setItem('orbita:arena:save', JSON.stringify(old));
        await t.mount('survivalarena');
        t.click('#sa-resume');
        assert.equal(t.$$('.sa-cast-card').length, 2);
        assert.equal(t.w.localStorage.getItem('orbita:arena:save'), JSON.stringify(old));
        t.click('#sa-start');
        assert.deepEqual(JSON.parse(t.w.localStorage.getItem('orbita:arena:legacy-save')), old);
        while (!t.$('#sa-next').disabled) t.click('#sa-day');
        assert(t.$('.sa-ranking .sa-dead img'));
        assert(t.$('.sa-winner img'));
        t.clean();
    });
    fs.writeFileSync(
        path.join(__dirname, 'results/arena-rpg.json'),
        JSON.stringify(reports, null, 2)
    );
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
