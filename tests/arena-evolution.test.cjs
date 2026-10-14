const { setup, assert, fs, path } = require('./harness.cjs');
const plain = v => JSON.parse(JSON.stringify(v));
const reports = [];
async function test(name, run) {
    try { await run(); reports.push({ name, status: 'PASS' }); console.log('PASS ' + name); }
    catch (error) { reports.push({ name, status: 'FAIL', error: error.stack }); console.error(error); }
}
async function main() {
    const t = setup(), E = t.api('ArenaEngine'), A = t.api('ArenaAccess'), D = await t.api('GameData').load('arena');
    const config = (seed, n = 24, extra = {}) => ({ seed, arena: 'forest', characters: plain(D.characters.slice(0, n)), ...extra });
    await test('Evolução: vazio inicial, distribuição equilibrada, personalidade persistente e compatibilidade dos equipamentos antigos', () => {
        for (const n of [2, 12, 24, 48]) {
            const cfg = config('EMPTY-' + n, n, { behavior: 'random', startingKit: 'random' });
            cfg.characters[0].starting = ['knife', 'water', 'food', 'med'];
            cfg.characters[0].behavior = 'strategist';
            cfg.characters[0].district = 12;
            const e = E.create(cfg, D), w = e.current();
            assert(w.players.every(p => !p.inventory.length && !p.equipped));
            assert.equal(w.players[0].behavior, 'strategist');
            assert.equal(w.players[0].district, 12);
            assert.deepEqual(plain(w.config.characters[0].starting), cfg.characters[0].starting);
            assert(w.players.every(p => p.behavior !== 'random' && p.behavior !== 'inherit'));
            if (n >= 12) assert(new Set(w.players.map(p => p.behavior)).size >= 3);
            const districts = Array.from({ length: 12 }, (_, i) => w.players.filter(p => p.district === i + 1).length);
            assert(Math.max(...districts) - Math.min(...districts) <= 1);
            assert(Object.values(w.items).filter(i => i.owner === 'r0').length <= 4);
            assert(Object.values(w.items).every(i => i.origin.region === i.owner));
            const identities = w.players.map(p => [p.id, p.behavior, p.traits, p.district]);
            for (let i = 0; i < n * 2; i++) e.step();
            assert.deepEqual(plain(e.current().players.map(p => [p.id, p.behavior, p.traits, p.district])), plain(identities));
            assert.equal(E.restore(e.save(), D).save(), e.save());
        }
        assert.throws(() => E.create(config('BAD', 2, { characters: [{ ...D.characters[0], district: 13 }, D.characters[1]] }), D), /distrito/);
    });
    await test('Evolução: biblioteca independente, pastas, duplicações, conflitos de nome e importação sem substituição', async () => {
        const folder = A.createFolder('Jogos favoritos');
        const c = config('LIB', 2).characters[0]; c.behavior = 'cautious'; c.district = 7;
        const saved = A.saveCharacter(c, folder.id, D);
        c.name = 'Nome alterado na partida';
        assert.notEqual(A.library().characters[0].character.name, c.name);
        assert(A.saveCharacter(A.library().characters[0].character, folder.id, D).duplicate);
        assert.throws(() => A.createFolder('Jogos favoritos'), /existe/);
        A.renameFolder(folder.id, 'Heróis');
        A.moveCharacter(saved.id, 'folder-default');
        A.deleteFolder(folder.id);
        assert.equal(A.library().characters[0].folder, 'folder-default');
        assert.equal(A.library().characters[0].character.district, 7);
        const backup = await A.exportLibrary();
        await A.importLibrary(backup, D);
        assert.equal(A.library().characters.length, 1);
        const original = JSON.stringify(A.library());
        await assert.rejects(A.importLibrary({ ...backup, library: { ...backup.library, characters: [{ folder: 'missing', character: c }] } }, D));
        assert.equal(JSON.stringify(A.library()), original);
        A.deleteCharacter(saved.id); assert.equal(A.library().characters.length, 0);
        await A.importLibrary(backup, D); assert.equal(A.library().characters.length, 1);
    });
    await test('Evolução: distrito favorece confiança sem garantir aliança; grupos se unem com membros distantes e confiança parcial', () => {
        let same = 0, different = 0, merged = false;
        const quiet = { ...D, events: D.events.map(e => ({ ...e, weight: e.id === 'rest' ? 1 : 0 })) };
        for (let seed = 0; seed < 120; seed++) {
            for (const together of [true, false]) {
                const cfg = config('DISTRICT-' + seed, 2);
                cfg.characters[0].district = 1; cfg.characters[1].district = together ? 1 : 2;
                const e = E.create(cfg, D), [a, b] = e.current().players;
                e.execute('alliance', a.id, b.id);
                if (e.current().players[0].allies.length) together ? same++ : different++;
            }
            if (!merged) {
                const cfg = config('MERGE-' + seed, 4);
                cfg.characters.forEach(c => { c.attributes = Object.fromEntries(Object.keys(D.attributes).map(k => [k, 10])); });
                cfg.balance = false;
                const e = E.create(cfg, quiet), [a, b, c, d] = e.current().players;
                e.execute('alliance', a.id, b.id); e.execute('alliance', c.id, d.id);
                if (!e.current().players[0].allies.length || !e.current().players[2].allies.length) continue;
                e.execute('move', b.id);
                assert(e.current().players[0].allies.includes(b.id));
                while (e.current().period === 'opening') e.step();
                const ev = e.execute('alliance', a.id, c.id), w = e.current();
                if (w.players[0].allies.length !== 3) continue;
                assert(w.players.every(p => p.allies.length === 3));
                assert.equal(ev.participants.includes(b.id), false, 'Companheiro distante não participa fisicamente');
                assert(w.players[1].trust[c.id] < 25, 'União não cria confiança total');
                assert.throws(() => e.execute('share', d.id, b.id), /Condições/);
                E.invariant(w, D); merged = true;
            }
        }
        assert(same > different && same < 120 && different > 0);
        assert(merged, 'Amostra deve conter união de alianças com membro distante');
    });
    await test('Evolução: videogame confirmado retorna personagens, nunca dublador/desenvolvedor, sem foto quando ausente', async () => {
        const claim = id => ({ rank: 'normal', mainsnak: { datavalue: { value: { id } } } });
        const entity = (id, name, claims) => ({ id, labels: { pt: { value: name } }, claims });
        const entities = {
            Q10: entity('Q10', 'Jogo de teste', { P31: [claim('Q7889')], P674: [claim('Q20'), claim('Q21'), claim('Q22')], P178: [claim('Q30')], P725: [claim('Q31')] }),
            Q20: entity('Q20', 'Heroína', { P31: [claim('Q95074')] }),
            Q21: entity('Q21', 'Pessoa real', { P31: [claim('Q5')] }),
            Q22: entity('Q22', 'Companhia', { P31: [claim('Q4830453')] }),
            Q30: entity('Q30', 'Desenvolvedor', {}), Q31: entity('Q31', 'Dublador', {}),
            Q99: entity('Q99', 'Outra obra', { P31: [claim('Q11424')] }),
            Q95074: entity('Q95074', 'Personagem', {})
        };
        t.w.fetch = async url => {
            const u = new URL(url);
            return { ok: true, json: async () => u.searchParams.get('action') === 'wbsearchentities' ? { search: [{ id: 'Q10' }, { id: 'Q99' }] } :
                { entities: Object.fromEntries((u.searchParams.get('ids') || '').split('|').filter(id => entities[id]).map(id => [id, entities[id]])) } };
        };
        assert.deepEqual(plain((await A.searchGames('Jogo')).map(g => g.id)), ['Q10']);
        const cast = await A.gameCast('Q10');
        assert.deepEqual(plain(cast.characters.map(c => c.name)), ['Heroína']);
        assert.equal(cast.characters[0].image, null);
        assert.equal(cast.characters[0].type, 'games');
        await assert.rejects(A.gameCast('Q99'), /videogame/);
        t.w.fetch = async () => { throw Error('Rede indisponível'); };
        await assert.rejects(A.searchGames('Jogo'), /Rede/);
    });
    await test('Evolução: origem de recursos, fabricação, perigos, dispersão, diversidade e replay em 36 partidas', () => {
        const metrics = [], hazards = new Set(), actions = new Set();
        let fabricated = 0, shared = 0, defenses = 0, teleport = 0;
        for (const arena of D.arenas) for (const n of [2, 12, 24]) for (const seed of [0, 1]) {
            const e = E.create(config(`EVOLVE-${arena.id}-${n}-${seed}`, n, { arena: arena.id, behavior: 'random', incidents: 'normal', pace: 'normal' }), D);
            let before = e.current(), used = new Set(), earlyRegions = new Set(['r0']), consecutive = 0, repeated = 0, count = 0, lastText = '';
            while (!before.finished) {
                const ev = e.step(), w = e.current(); count++;
                E.invariant(w, D);
                if (ev.type === 'period') used = new Set();
                else for (const id of ev.acted) { assert(!used.has(id), 'Duas ações no mesmo período'); used.add(id); }
                for (const change of ev.changes.items) {
                    assert(w.regions.some(g => g.id === change.after.origin.region));
                    if (!change.before && w.players.some(p => p.id === change.after.owner)) {
                        assert(['gather', 'fish', 'salvage', 'craft'].includes(ev.action), 'Item concedido sem coleta/fabricação');
                        if (ev.action === 'craft') { fabricated++; assert(change.after.origin.inputs.every(id => w.items[id].owner === 'spent')); }
                    }
                }
                for (const c of ev.changes.players) if (c.before.location !== c.after.location) {
                    assert(before.regions.find(g => g.id === c.before.location).links.includes(c.after.location));
                    if (w.day <= 3) earlyRegions.add(c.after.location);
                }
                if (['share', 'trade', 'rescue', 'combat', 'scuffle', 'betray', 'areaattack', 'flee'].includes(ev.action))
                    for (const id of ev.participants) if (before.players.find(p => p.id === id).location !== before.players.find(p => p.id === ev.participants[0]).location) teleport++;
                ev.changes.regions.forEach(c => { if (c.after.environment) hazards.add(c.after.environment.kind); });
                shared += ev.action === 'share' || ev.action === 'rescue';
                defenses += ev.text.includes('proteger o companheiro');
                actions.add(ev.action);
                repeated += ev.text === lastText; lastText = ev.text;
                consecutive = Math.max(consecutive, w.players.filter(p => p.status === 'alive' && p.location === 'r0').length);
                assert(!/gastaram|usou o turno|Cada integrante mobilizado|Saúde −|Energia −/.test(ev.text));
                before = w;
                assert(count < 3000);
            }
            assert.equal(E.restore(e.save(), D).save(), e.save());
            metrics.push({ arena: arena.id, participants: n, seed, days: before.day, events: count,
                earlyRegions: earlyRegions.size, repeatedConsecutive: repeated, ...plain(e.summary()) });
        }
        assert.equal(teleport, 0);
        assert(fabricated > 0 && shared > 0 && defenses > 0);
        for (const kind of ['quake', 'landslide', 'lightning', 'horde', 'fire', 'flood']) assert(hazards.has(kind), kind);
        for (const action of ['salvage', 'craft', 'gather', 'fish', 'trade', 'shelter', 'flee']) assert(actions.has(action), action);
        assert(metrics.filter(m => m.participants >= 12).every(m => m.earlyRegions >= 4));
        fs.writeFileSync(path.join(__dirname, 'results/arena-evolution-balance.json'), JSON.stringify({ metrics, hazards: [...hazards], actions: [...actions].filter(Boolean), fabricated, shared, defenses }, null, 2));
        console.log('Evolução: ' + metrics.length + ' partidas, ' + fabricated + ' fabricações, ' + shared + ' ajudas, ' + defenses + ' defesas.');
    });
    t.clean();
    await test('Evolução: biblioteca na interface, edição independente, distritos e seleção preservada ao trocar áreas', async () => {
        const ui = setup(); await ui.mount('survivalarena');
        const count = ui.$$('.sa-cast-card').length;
        ui.click('[data-store]');
        ui.click('[data-preptab=library]');
        assert(ui.$('#sa-library-grid').textContent.includes('Adicionar ao elenco'));
        ui.click('[data-libraryedit]');
        ui.input('#sa-edit-form [name=name]', 'Nome salvo independente');
        ui.input('#sa-edit-form [name=district]', 9);
        ui.submit('#sa-edit-form'); await ui.flush();
        assert(ui.$('#sa-library-grid').textContent.includes('Nome salvo independente'));
        assert(!ui.$('#sa-roster').textContent.includes('Nome salvo independente'));
        ui.click('[data-libraryadd]');
        assert.equal(ui.$$('.sa-cast-card').length, count + 1);
        ui.click('[data-preptab=roster]');
        assert(ui.$('#sa-roster').textContent.includes('Distrito 9'));
        assert.equal(ui.$('#sa-kit').value, 'none');
        assert(ui.$('#sa-api-kind option[value=games]'));
        assert.equal(ui.errors.length, 0);
        ui.clean();
    });
    fs.writeFileSync(path.join(__dirname, 'results/arena-evolution.json'), JSON.stringify(reports, null, 2));
    if (reports.some(r => r.status === 'FAIL')) process.exitCode = 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
