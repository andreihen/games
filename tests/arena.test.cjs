const { setup, assert, fs, path } = require('./harness.cjs');
const reports = [];
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
        D = await t.api('GameData').load('arena');
    const config = (seed = 'ARENA', n = 8, arena = 'forest', extra = {}) => ({
        seed,
        arena,
        characters: D.characters.slice(0, n),
        ...extra
    });
    await test('Arena: 144 competições completas em seis biomas, 2–48 participantes e três ritmos', () => {
        let events = 0;
        for (const arena of D.arenas)
            for (let s = 0; s < 24; s++) {
                const count = [2, 8, 24, 48][s % 4];
                const engine = E.create(
                    config(`SEED-${s}`, count, arena.id, {
                        pace: ['short', 'normal', 'slow'][s % 3],
                        hostility: ['calm', 'balanced', 'chaos'][s % 3],
                        alliances: s % 2 === 0,
                        humor: s % 2 !== 0
                    }),
                    D
                );
                let steps = 0,
                    previous = engine.current();
                while (!previous.finished) {
                    assert(++steps < 2500, 'Competição não termina');
                    const event = engine.step(),
                        now = engine.current();
                    E.invariant(now, D);
                    assert.equal(event.text.includes('{'), false, 'Template sem resolução');
                    for (const id of event.participants)
                        assert.equal(
                            previous.players.find((p) => p.id === id).status,
                            'alive',
                            'Morto participa'
                        );
                    if (event.participants.length === 2) {
                        const [a, b] = event.participants.map((id) =>
                            previous.players.find((p) => p.id === id)
                        );
                        assert.equal(a.location, b.location, 'Interação entre regiões distantes');
                    }
                    for (const change of event.changes.players) {
                        const before = previous.players.find((p) => p.id === change.id),
                            after = change.after;
                        if (before.location !== after.location)
                            assert(
                                previous.regions
                                    .find((r) => r.id === before.location)
                                    .links.includes(after.location)
                            );
                        if (before.status === 'dead') {
                            assert.deepEqual(
                                plain({ ...after, kills: before.kills }),
                                plain(before),
                                'Morto agiu depois da eliminação'
                            );
                            assert.equal(
                                after.kills - before.kills,
                                event.eliminations.filter(
                                    (id) =>
                                        now.players.find((p) => p.id === id).death.killer ===
                                        before.id
                                ).length
                            );
                        }
                        if (after.health > before.health) {
                            assert(after.health - before.health <= 24);
                            assert(
                                event.action === 'shelter' || event.changes.items.some(
                                    (c) =>
                                        c.before?.kind === 'med' &&
                                        c.before.charges > c.after.charges
                                )
                            );
                        }
                    }
                    assert.equal(
                        now.players.reduce((n, p) => n + p.kills, 0),
                        now.players.filter((p) => p.death?.killer && p.death.killer !== p.id).length
                    );
                    previous = now;
                    events++;
                }
                const survivors = previous.players.filter((p) => p.status === 'alive').length;
                assert(survivors <= 1);
                assert.equal(previous.eliminations.length, count - survivors);
                assert(previous.day <= 30);
                assert.equal(engine.summary().combat + engine.summary().environment, count - survivors);
                const end = engine.save();
                assert.equal(engine.step(), null);
                assert.equal(engine.save(), end);
            }
        console.log('EVENTOS VERIFICADOS ' + events);
    });
    await test('Arena: histórico imutável, mapa passado, save e continuação reproduzem exatamente a seed', () => {
        const a = E.create(config('REPLAY', 24), D),
            b = E.create(config('REPLAY', 24), D);
        const snapshots = [a.current()];
        for (let i = 0; i < 80; i++) {
            assert.deepEqual(plain(a.step()), plain(b.step()));
            snapshots.push(a.current());
        }
        for (const i of [0, 1, 17, 40, 80])
            assert.deepEqual(plain(a.viewAt(i)), plain(snapshots[i]));
        const copy = a.state;
        copy.history[1].text = 'Alterado';
        copy.players[0].health = 1;
        assert.notEqual(a.state.history[1].text, 'Alterado');
        const r = E.restore(a.save(), D),
            other = E.create(config('DIFFERENT', 24), D);
        assert.notDeepEqual(plain(a.current()), plain(other.current()));
        while (!a.current().finished) assert.deepEqual(plain(a.step()), plain(r.step()));
        assert.equal(r.save(), a.save());
        const final = E.restore(a.save(), D);
        assert.equal(final.save(), a.save());
        const invalid = JSON.parse(a.save());
        invalid.players[0].health = 99;
        assert.throws(() => E.restore(invalid, D));
        const altered = JSON.parse(a.save());
        altered.history[2].text = 'Uma história diferente';
        assert.throws(() => E.restore(altered, D), /histórico/);
        const initial = JSON.parse(a.save());
        initial.initial.players[0].energy = 80;
        // A copied initial snapshot must agree with the deterministic opening too.
        assert.throws(() => E.restore(initial, D));
    });
    await test('Arena: rejeita arma sem munição, aliança distante, cura sem item e IDs reservados sem mutação', () => {
        const chars = plain(D.characters.slice(0, 3));
        chars[0].starting = ['bow'];
        const e = E.create(config('RULES', 3, 'forest', { characters: chars }), D),
            before = e.save();
        assert.throws(() => e.execute('combat', chars[0].id, chars[1].id), /Condições/);
        assert.throws(() => e.execute('heal', chars[0].id), /Condições/);
        assert.equal(e.save(), before);
        const move = e.execute('move', chars[1].id);
        assert.equal(move.type, 'movement');
        const relocated = e.save();
        assert.throws(() => e.execute('alliance', chars[0].id, chars[1].id));
        assert.equal(e.save(), relocated);
        for (const id of ['r0', 'r6', 'spent'])
            assert.throws(() =>
                E.create(
                    config('BAD', 2, 'forest', { characters: [{ ...chars[0], id }, chars[1]] }),
                    D
                )
            );
        const duplicate = plain(chars.slice(0, 2));
        duplicate[1].id = duplicate[0].id;
        assert.throws(() => E.create(config('BAD', 2, 'forest', { characters: duplicate }), D));
        const ammo = plain(chars);
        ammo[0].starting = ['bow', 'arrows', 'knife'];
        const armed = require('./arena-fixtures.cjs').equippedScenario(t, E.create(config('AMMO', 3, 'city', { characters: ammo }), D), D);
        const p = armed.current().players[0],
            arrow = p.inventory.find((id) => armed.current().items[id].kind === 'arrows');
        armed.execute('combat', p.id, ammo[1].id);
        assert.equal(armed.current().items[arrow].charges, 3);
        assert.equal(E.normalizeGender('Genderless'), 'other');
        assert.equal(E.normalizeGender('Unknown'), 'unknown');
    });
    await test('Arena: adaptador opcional suporta resposta, 404, falha e retrato ausente sem carregar imagens externas', async () => {
        const access = t.api('ArenaAccess');
        let calls = 0;
        t.w.fetch = async (url, opts) => {
            calls++;
            assert(url.includes('name=Rick%20Sanchez'));
            assert.equal(opts.credentials, 'omit');
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    results: [
                        {
                            id: 1,
                            name: 'Rick Sanchez',
                            gender: 'Male',
                            image: 'https://example.invalid/image.png'
                        },
                        { id: 2, name: 'Original', gender: 'Unknown' }
                    ]
                })
            };
        };
        const rows = await access.searchRick('Rick Sanchez');
        assert.equal(rows.length, 2);
        assert.equal(rows[0].portrait, null);
        assert.equal(rows[1].gender, 'unknown');
        assert.deepEqual(plain(await access.searchRick('')), []);
        assert.equal(calls, 1);
        t.w.fetch = async () => ({ ok: false, status: 404 });
        assert.equal((await access.searchRick('Rick')).length, 0);
        t.w.fetch = async () => ({ ok: false, status: 500 });
        await assert.rejects(access.searchRick('Rick'), /catálogo local/);
        assert.equal(await access.portrait('missing'), null);
        await assert.rejects(access.putPortrait({ type: 'image/svg+xml', size: 5 }), /PNG/);
    });
    t.clean();
    await test('Arena: importação de JSON valida versão, conserva elenco e restaura o save; busca expira sem bloquear', async () => {
        const t = setup();
        await t.mount('survivalarena');
        const data = await t.api('GameData').load('arena');
        const E = t.api('ArenaEngine'),
            imported = E.validateConfig(
                { seed: 'IMPORT', arena: 'desert', characters: data.characters.slice(0, 3) },
                data
            );
        async function upload(value) {
            Object.defineProperty(t.$('#sa-import'), 'files', {
                configurable: true,
                value: [{ size: 200, text: async () => JSON.stringify(value) }]
            });
            t.$('#sa-import').dispatchEvent(new t.w.Event('change', { bubbles: true }));
            await t.flush();
        }
        await upload({ format: 'orbita-arena-config', version: 1, config: imported });
        assert.equal(t.$('#sa-seed').value, 'IMPORT');
        assert.equal(t.$('#sa-arena').value, 'desert');
        assert.equal(t.$$('.sa-cast-card').length, 3);
        await upload({
            format: 'orbita-roster',
            version: 1,
            characters: data.characters.slice(5, 10)
        });
        assert.equal(t.$$('.sa-cast-card').length, 5);
        await upload({ format: 'orbita-arena-config', version: 99, config: imported });
        assert(t.$('#sa-status').textContent.includes('incompatível'));
        assert.equal(t.$$('.sa-cast-card').length, 5);
        const simulation = E.create(imported, data);
        for (let i = 0; i < 15; i++) simulation.step();
        await upload({ format: 'orbita-arena-save', version: 1, world: simulation.state });
        assert.equal(
            JSON.stringify(JSON.parse(t.w.localStorage.getItem('orbita:arena:save'))),
            simulation.save()
        );
        t.click('#sa-prep');
        t.w.fetch = async (url) => ({
            ok: true,
            status: 200,
            json: async () =>
                url.includes('?embed=cast')
                    ? {
                          name: 'Example Show',
                          _embedded: {
                              cast: [
                                  {
                                      character: {
                                          id: 1,
                                          name: 'Example',
                                          image: { medium: 'https://example.org/photo.jpg' },
                                          url: 'https://example.org/character'
                                      },
                                      person: {}
                                  }
                              ]
                          }
                      }
                    : [
                          {
                              show: {
                                  id: 123,
                                  name: 'Example Show',
                                  premiered: '2007-01-01',
                                  image: { medium: 'https://example.org/poster.jpg' },
                                  url: 'https://example.org/show'
                              }
                          }
                      ]
        });
        t.input('#sa-api-query', 'Rick');
        t.submit('#sa-api-form');
        await t.flush();
        assert.equal(t.$$('#sa-api-results button').length, 1);
        t.click('#sa-api-results button');
        await t.flush();
        assert.equal(t.$$('#sa-catalog-grid [data-catalogadd]').length, 1);
        t.click('#sa-catalog-grid [data-catalogadd]');
        assert.equal(t.$$('.sa-cast-card').length, 4);
        t.w.fetch = async (url, { signal }) =>
            new Promise((resolve, reject) =>
                signal.addEventListener(
                    'abort',
                    () => reject(new t.w.DOMException('Cancelado', 'AbortError')),
                    { once: true }
                )
            );
        t.submit('#sa-api-form');
        await t.advance(30000);
        assert(t.$('#sa-status').textContent.includes('demorou demais'));
        t.clean();
    });
    await test('Arena: elenco, cotas e exclusões, edição segura, reprodução e retomar sem pontuação fictícia', async () => {
        const t = setup();
        await t.mount('survivalarena', 'easy', { count: '8' }, 'UI-ARENA');
        assert.equal(t.$$('.sa-cast-card').length, 8);
        t.$('#sa-quotas').checked = true;
        t.input('#sa-count', 4);
        t.input('#sa-male', 2);
        t.input('#sa-female', 2);
        t.input('#sa-other', 0);
        t.input('#sa-unknown', 0);
        t.input('#sa-exclude', 'Turma da Mônica');
        t.click('#sa-draw');
        assert.equal(t.$$('.sa-cast-card').length, 4);
        assert.equal(t.$('#sa-roster').textContent.includes('Turma da Mônica'), false);
        assert.equal(t.$$('.sa-cast-card').filter((p) => p.dataset.gender === 'female').length, 2);
        t.click(t.$('[data-edit]'));
        t.input('#sa-edit-form [name=name]', '<b>Original</b>');
        t.submit('#sa-edit-form');
        await t.flush();
        assert(t.$('#sa-roster').textContent.includes('<b>Original</b>'));
        assert.equal(t.$('#sa-roster b:not(.sa-avatar b)'), null);
        assert.equal(t.$('#sa-setup').inert, false);
        t.click('#sa-start');
        assert(!t.$('#sa-play').classList.contains('hidden'));
        t.click('#sa-auto');
        await t.advance(2400);
        const stored = JSON.parse(t.w.localStorage.getItem('orbita:arena:save'));
        assert(stored.history.length > 1);
        t.session.pause();
        await t.advance(6000);
        assert.equal(
            JSON.parse(t.w.localStorage.getItem('orbita:arena:save')).history.length,
            stored.history.length
        );
        t.session.resume();
        t.click('[data-tab=players]');
        const count = JSON.parse(t.w.localStorage.getItem('orbita:arena:save')).history.length;
        await t.advance(1600);
        assert.equal(
            JSON.parse(t.w.localStorage.getItem('orbita:arena:save')).history.length,
            count
        );
        t.click(t.$('[data-person]'));
        assert(t.$('#sa-detail-body').textContent.includes('Inventário'));
        t.click('#sa-detail-close');
        t.click('[data-tab=history]');
        t.click(t.$('[data-event="0"]'));
        assert(t.$('#sa-next').disabled);
        assert(t.$('#sa-view-message').textContent.includes('#0'));
        t.click('#sa-present');
        assert(!t.$('#sa-next').disabled);
        const saved = t.w.localStorage.getItem('orbita:arena:save');
        await t.mount('survivalarena');
        t.click('#sa-resume');
        assert.equal(t.w.localStorage.getItem('orbita:arena:save'), saved);
        let steps = 0;
        while (!t.$('#sa-next').disabled && steps++ < 100) t.click('#sa-day');
        assert(t.$('.sa-winner'));
        assert.equal(t.$$('.sa-ranking li').length, 4);
        assert.equal(t.outcomes.length, 0);
        t.click('[data-command=repeat]');
        assert.equal(t.$('#sa-alive-count').textContent, '4/4 vivos');
        t.clean();
    });
    await test('Arena: integração separa observação de dificuldade, jornada e desafio diário', async () => {
        const t = setup({ app: true });
        t.startApp();
        t.click(
            t.$('#category-tabs button[data-category="Simuladores"]') ||
                t.$$('#category-tabs button').find((b) => b.textContent.includes('Simuladores'))
        );
        assert.equal(t.$$('.game-card').length, 1);
        t.click('.game-launch');
        assert(
            t.$('#difficulty-select').closest('.setup-field')?.classList.contains('hidden') ||
                t.$('#difficulty-field').classList.contains('hidden')
        );
        const difficulty = t.api('DifficultyEngine');
        for (let i = 0; i < 50; i++)
            assert.notEqual(
                difficulty.choose(t.config, [], t.api('SeededRandom').create('J' + i)).id,
                'survivalarena'
            );
        t.click('#start-practice-game-btn');
        await t.flush();
        assert(t.$('#sa-start'));
        t.click('#sa-start');
        t.click('#quit-current-game');
        await t.flush();
        assert(!t.$('#phase-selection-screen').classList.contains('hidden'));
        t.clean();
    });
    fs.writeFileSync(path.join(__dirname, 'results/arena.json'), JSON.stringify(reports, null, 2));
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
