const { setup, assert, fs, path, root } = require('./harness.cjs');
const plain = (x) => JSON.parse(JSON.stringify(x));
const reports = [];
async function test(name, fn) {
    try { await fn(); reports.push({ name, status: 'PASS' }); console.log('PASS ' + name); }
    catch (e) { reports.push({ name, status: 'FAIL', error: e.stack }); console.error('FAIL ' + name, e); }
}
function fen(text) {
    const [placement, turn, rights, ep, quiet] = text.split(' '), board = [];
    for (const ch of placement.replaceAll('/', '')) {
        if (/\d/.test(ch)) board.push(...Array(Number(ch)).fill(null));
        else board.push((ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase());
    }
    return { board, turn, rights: rights === '-' ? '' : rights,
        ep: ep === '-' ? -1 : (8 - Number(ep[1])) * 8 + 'abcdefgh'.indexOf(ep[0]), quiet: Number(quiet) || 0, ply: 0 };
}
const sq = (name) => (8 - Number(name[1])) * 8 + 'abcdefgh'.indexOf(name[0]);
function step(engine, state, from, to, promotion) {
    const move = engine.moves(state).find((m) => m.from === sq(from) && m.to === sq(to) && (!promotion || m.promotion === promotion));
    assert(move, `Lance ausente ${from}-${to}`);
    return engine.apply(state, move);
}
async function main() {
    await test('Xadrez: contagens perft conhecidas na abertura e no roque (Kiwipete)', () => {
        const t = setup(), c = t.api('ClassicChess');
        const perft = (s, depth) => depth ? c.moves(s).reduce((n, m) => n + perft(c.apply(s, m), depth - 1), 0) : 1;
        assert.deepEqual([1,2,3].map((d) => perft(c.initial(), d)), [20,400,8902]);
        const kiwi = fen('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
        assert.deepEqual([1,2].map((d) => perft(kiwi, d)), [48,2039]);
        const endings = fen('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1');
        assert.deepEqual([1,2,3].map((d) => perft(endings, d)), [14,191,2812]);
        t.clean();
    });
    await test('Xadrez: en passant, segurança do rei, quatro promoções e direitos de roque', () => {
        const t = setup(), c = t.api('ClassicChess');
        let state = fen('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');
        state = step(c, state, 'e5', 'd6');
        assert.equal(state.board[sq('d5')], null); assert.equal(state.board[sq('d6')], 'wP');
        assert(!c.moves(fen('k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 1')).some((m) => m.enPassant !== undefined));
        state = fen('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
        assert.deepEqual(plain(c.moves(state).filter((m) => m.from === sq('a7')).map((m) => m.promotion)).sort(), ['B','N','Q','R']);
        state = fen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
        state = step(c, state, 'e1', 'g1');
        assert.equal(state.board[sq('f1')], 'wR'); assert.equal(state.board[sq('h1')], null);
        assert.equal(state.rights, 'kq');
        assert(!c.moves(fen('r3k2r/8/8/8/8/5r2/8/R3K2R w KQkq - 0 1')).some((m) => m.to === sq('g1') && m.rookFrom !== undefined));
        const captureRook = step(c, fen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'), 'a1', 'a8');
        assert.equal(captureRook.rights, 'Kk');
        t.clean();
    });
    await test('Xadrez: mate, afogamento, material insuficiente e empates automáticos', () => {
        const t = setup(), c = t.api('ClassicChess');
        let s = c.initial();
        for (const [from, to] of [['f2','f3'],['e7','e5'],['g2','g4'],['d8','h4']]) s = step(c, s, from, to);
        assert.equal(c.outcome(s).winner, 'b');
        assert.equal(c.outcome(fen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')).winner, null);
        assert.equal(c.outcome(fen('7k/8/6K1/8/8/8/8/8 w - - 0 1')).winner, null);
        assert.equal(c.outcome({ ...c.initial(), quiet: 150 }).winner, null);
        assert.equal(c.outcome(c.initial(), 5).winner, null);
        assert.equal(c.outcome(c.initial(), 3), null);
        // Um en passant impossível não altera a identidade para repetição.
        assert.equal(c.key({ ...c.initial(), ep: sq('e6') }), c.key(c.initial()));
        t.clean();
    });
    await test('Damas: obrigatoriedade, captura para trás, maior sequência e damas voadoras', () => {
        const t = setup(), d = t.api('ClassicDraughts');
        assert.equal(d.moves(d.initial()).length, 7);
        const s = { board: Array(64).fill(null), turn: 'w', ply: 0, quiet: 0 };
        s.board[sq('c3')] = 'wM'; s.board[sq('d4')] = 'bM'; s.board[sq('f6')] = 'bM';
        s.board[sq('a3')] = 'wM'; s.board[sq('b4')] = 'bM';
        let moves = d.moves(s);
        assert(moves.every((m) => m.taken.length === 2));
        assert(moves.some((m) => m.from === sq('c3') && m.to === sq('g7')));
        const back = { ...s, board: Array(64).fill(null) };
        back.board[sq('e5')] = 'wM'; back.board[sq('d4')] = 'bM';
        assert.equal(d.moves(back)[0].to, sq('c3'));
        back.board[sq('e5')] = 'wK';
        assert(d.moves(back).some((m) => m.to === sq('a1')));
        const promotion = { ...s, board: Array(64).fill(null) };
        promotion.board[sq('b6')] = 'wM'; promotion.board[sq('c7')] = 'bM'; promotion.board[sq('e7')] = 'bM';
        moves = d.moves(promotion); assert.equal(moves[0].path.length, 2);
        const next = d.apply(promotion, moves[0]);
        assert.equal(next.board[sq('f6')], 'wM', 'Não coroar ao apenas passar pela última linha');
        assert.equal(next.board.filter(Boolean).length, 1);
        assert.equal(d.outcome(next).winner, 'w');
        t.clean();
    });
    await test('Campo Minado: primeira região segura, seed, abertura em cascata, bandeiras e finais', () => {
        const t = setup(), m = t.api('ClassicMines'), rng = t.api('SeededRandom');
        for (const tier of ['easy','medium','hard','expert']) {
            const p = t.api('DifficultyEngine').resolve('minesweeper', tier);
            const a = m.create(p.rows, p.cols, p.mines), b = m.create(p.rows, p.cols, p.mines);
            const first = Math.floor(a.cells.length / 2);
            m.reveal(a, first, rng.create('MINES')); m.reveal(b, first, rng.create('MINES'));
            assert.deepEqual(plain(a), plain(b)); assert(!a.over);
            assert.equal(a.cells.filter((c) => c.mine).length, p.mines);
            assert([first, ...m.neighbors(first, p.rows, p.cols)].every((i) => !a.cells[i].mine));
            const mine = a.cells.findIndex((c) => c.mine);
            m.flag(a, mine); m.reveal(a, mine, rng.create('M')); assert(!a.over);
            m.flag(a, mine); m.reveal(a, mine, rng.create('M')); assert(a.over && !a.won);
            b.cells.forEach((c, i) => { if (!c.mine) m.reveal(b, i, rng.create('M')); });
            assert(b.over && b.won);
        }
        const chord = m.create(3, 3, 1); chord.planted = true;
        chord.cells[0].mine = true; chord.cells[4].count = 1; chord.cells[4].open = true;
        chord.cells[1].flag = true;
        m.chord(chord, 4, rng.create('M')); assert(chord.over && !chord.won, 'Bandeira errada deve explodir');
        t.clean();
    });
    await test('Ludo: 2–4 participantes, saída com 6, captura, segurança e chegada exata', () => {
        const t = setup(), l = t.api('ClassicLudo');
        for (const n of [2,3,4]) assert.equal(l.initial(n).players.length, n);
        let s = l.initial(2); assert.equal(l.moves(s, 5).length, 0); assert.equal(l.moves(s, 6).length, 4);
        s = l.apply(s, l.moves(s, 6)[0], 6).state; assert.equal(s.turn, 0); assert.equal(s.players[0].pieces[0], 0);
        s.players[0].pieces[0] = 3; s.players[1].pieces[0] = 30; // Casa global 4, adversário amarelo.
        let result = l.apply(s, l.moves(s, 1)[0], 1);
        assert.equal(result.captured, 1); assert.equal(result.state.players[1].pieces[0], -1);
        s.players[0].pieces[0] = 7; s.players[1].pieces[0] = 34;
        result = l.apply(s, l.moves(s, 1)[0], 1); assert.equal(result.captured, 0);
        s.players[0].pieces = [56,56,56,54];
        assert.equal(l.moves(s, 3).length, 0);
        result = l.apply(s, l.moves(s, 2)[0], 2); assert.equal(result.state.winner, 0);
        assert.equal(new Set(l.track.map((p) => p.join(','))).size, 52);
        for (const color of [0,1,2,3]) for (let at = -1; at <= 56; at++) {
            const [r,c] = l.position(color, at); assert(r >= 0 && r < 15 && c >= 0 && c < 15);
        }
        t.clean();
    });
    await test('Bots: quatro níveis legais, escolhas táticas, seed repetível e cancelamento', async () => {
        const t = setup(), e = t.api('ClassicChess');
        const mate = fen('7k/8/5KQ1/8/8/8/8/8 w - - 0 1');
        for (const tier of ['easy','medium','hard','expert']) {
            await t.mount('chess', tier, { mode: 'friend' });
            const cfg = t.api('DifficultyEngine').resolve('chess', tier);
            let move, settled = false;
            t.api('ClassicAI').choose(e, mate, cfg, t.session).then((m) => { move = m; settled = true; });
            for (let n = 0; !settled && n < 200; n++) await t.advance(100);
            assert(settled); assert(e.moves(mate).some((m) => JSON.stringify(m) === JSON.stringify(move)));
            if (tier === 'expert') assert.equal(e.outcome(e.apply(mate, move)).winner, 'w');
        }
        for (const game of ['chess','draughts']) {
            await t.mount(game, 'expert', { side: 'black' });
            await t.advance(301); t.session.destroy(); const html = t.$('#phase-display').innerHTML;
            await t.advance(10000); assert.equal(t.$('#phase-display').innerHTML, html); assert.equal(t.jobs.size, 0);
        }
        const l = t.api('ClassicLudo'), s = l.initial(2); s.players[0].pieces = [54, 10, 0, -1];
        for (const tier of [1,2,3]) assert.equal(l.choose(s, 2, tier, t.api('SeededRandom').create('LUDO')).piece, 0);
        t.clean();
    });
    await test('Interface: multiplayer local, mate completo, desistência e bandeira no toque', async () => {
        const t = setup();
        await t.mount('chess', 'expert', { mode: 'friend' });
        const clickSquare = (name) => t.click(`[data-square="${sq(name)}"]`);
        for (const [from,to] of [['f2','f3'],['e7','e5'],['g2','g4'],['d8','h4']]) { clickSquare(from); clickSquare(to); }
        assert.equal(t.outcomes.length, 1); assert.equal(t.outcomes[0][1].winner, 'b');
        assert(t.$('#classic-status').textContent.includes('Xeque-mate'));
        await t.mount('draughts', 'hard', { mode: 'friend' });
        clickSquare('a3'); assert(t.$$('.legal-destination').length); clickSquare('b4');
        assert(t.$('#classic-status').textContent.includes('pretas')); assert.equal(t.jobs.size, 1); // Cronômetro global; nenhum bot local.
        t.click('#classic-resign'); assert.equal(t.outcomes.length, 0); t.click('#classic-cancel');
        t.click('#classic-resign'); t.click('#classic-resign'); assert.equal(t.outcomes[0][1].winner, 'w');
        await t.mount('minesweeper'); t.click('#mines-flag'); t.click('[data-cell="0"]');
        assert.equal(t.$('[data-cell="0"]').textContent, '⚑'); t.click('[data-cell="0"]');
        t.click('#mines-flag'); t.click('[data-cell="40"]'); assert(t.$$('.revealed').length > 1);
        t.clean();
    });
    await test('Ludo na interface: todos locais, mistura de bots, pausa, três seis e partida completa', async () => {
        const t = setup();
        for (const players of ['2','3','4']) {
            await t.mount('ludo', 'expert', { players, humans: players });
            assert.equal(t.$$('.ludo-token').length, Number(players) * 4);
            assert(t.$$('.ludo-player').every((p) => !p.textContent.includes('Bot')));
            assert.equal(t.jobs.size, 1); // Apenas o cronômetro global da sessão.
        }
        await t.mount('ludo', 'easy', { players: '2', humans: '2' });
        // A primeira sequência desta seed pode ser qualquer uma; todas as escolhas são feitas pela UI.
        for (let turn = 0; !t.outcomes.length && turn < 2000; turn++) {
            if (!t.$('#ludo-roll').disabled) t.click('#ludo-roll');
            const legal = t.$$('.ludo-token').filter((b) => !b.disabled).sort((a,b) => +b.dataset.progress - +a.dataset.progress);
            if (legal.length) t.click(legal[0]);
            await t.advance(900);
        }
        assert.equal(t.outcomes.length, 1); assert(t.outcomes[0][1].text.includes('venceu'));
        const rng = t.api('SeededRandom');
        let tripleSeed;
        for (let n = 0; n < 10000; n++) {
            const seed = `SIX${n}`, r = rng.create(seed);
            if ([r.int(1,6), r.int(1,6), r.int(1,6)].every((v) => v === 6)) { tripleSeed = seed; break; }
        }
        assert(tripleSeed);
        await t.mount('ludo', 'expert', { players: '2', humans: '2' }, tripleSeed);
        t.click('#ludo-roll'); t.click('#ludo-moves button');
        t.click('#ludo-roll'); t.click('#ludo-moves button');
        const progress = t.$$('.ludo-token').map((b) => b.dataset.progress);
        t.click('#ludo-roll'); assert(t.$('#ludo-status').textContent.includes('Três 6'));
        assert.deepEqual(t.$$('.ludo-token').map((b) => b.dataset.progress), progress);
        await t.advance(900); assert(t.$('#ludo-status').textContent.includes('Amarelo'));
        await t.mount('ludo', 'expert', { players: '4', humans: '2' });
        for (let n = 0; n < 30; n++) {
            if (!t.$('#ludo-roll').disabled) t.click('#ludo-roll');
            const legal = t.$$('.ludo-token').find((b) => !b.disabled); if (legal) t.click(legal);
            await t.advance(900);
        }
        t.session.pause(); const html = t.$('#phase-display').innerHTML;
        await t.advance(5000); assert.equal(t.$('#phase-display').innerHTML, html);
        t.session.resume(); await t.advance(1000); t.clean();
    });
    fs.writeFileSync(path.join(root, 'tests/results/classics.json'), JSON.stringify(reports, null, 2) + '\n');
    console.log(`${reports.filter((r) => r.status === 'PASS').length}/${reports.length} grupos aprovados`);
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
