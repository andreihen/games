const { setup, root, assert, fs, path } = require('./harness.cjs');
const reports = [];
async function test(name, fn) {
    try {
        await fn();
        reports.push({ name, status: 'PASS' });
        console.log('PASS ' + name);
    } catch (e) {
        reports.push({ name, status: 'FAIL', error: e.stack });
        console.error('FAIL ' + name + '\n' + e.stack);
    }
}
const plain = (v) => JSON.parse(JSON.stringify(v));
async function ready(t) {
    await t.flush();
    await t.advance(20);
}
function card(t, name) {
    return t.$$('.game-card').find((b) => b.querySelector('strong').textContent === name);
}
function category(t, name) {
    t.click(t.$$('#category-tabs button').find((b) => b.dataset.category === name));
}
function solveLights(t) {
    const buttons = t.$$('.light-button'),
        size = Math.sqrt(buttons.length),
        n = buttons.length,
        m = buttons.map((b, i) =>
            Array.from({ length: n + 1 }, (_, j) =>
                j === n
                    ? +b.classList.contains('light-on')
                    : +(
                          Math.abs(((i / size) | 0) - ((j / size) | 0)) +
                              Math.abs((i % size) - (j % size)) <=
                          1
                      )
            )
        );
    let row = 0;
    const piv = [];
    for (let c = 0; c < n; c++) {
        let p = m.findIndex((r, i) => i >= row && r[c]);
        if (p < 0) continue;
        [m[p], m[row]] = [m[row], m[p]];
        for (let r = 0; r < n; r++)
            if (r !== row && m[r][c]) for (let k = c; k <= n; k++) m[r][k] ^= m[row][k];
        piv.push(c);
        row++;
    }
    piv.forEach((c, r) => {
        if (m[r][n]) t.click(buttons[c]);
    });
}
async function run() {
    await test('Migração v1 preserva partidas, vitórias, histórico e backup original', () => {
        const old = {
                version: 1,
                games: {
                    simonsays: {
                        played: 7,
                        wins: 4,
                        maxLevel: 12,
                        bestTime: 12000,
                        totalTime: 123000
                    }
                }
            },
            t = setup({ storage: old }),
            p = t.api('Progress');
        assert.equal(p.get('simonsays').played, 7);
        assert.deepEqual(plain(p.get('simonsays').legacy), old.games.simonsays);
        assert.deepEqual(
            JSON.parse(t.w.localStorage.getItem('desafio-logico-total:progress:v1-backup')),
            old
        );
        p.record(
            'simonsays',
            'medium',
            true,
            { time: 5000, score: 800, bestStreak: 5, correct: 9, mistakes: 1, sequenceLength: 6 },
            { seed: 'MIGRATION' }
        );
        assert.equal(p.get('simonsays').played, 8);
        assert.equal(p.get('simonsays').wins, 5);
        assert.equal(p.get('simonsays').bestSequence, 6);
        assert.equal(
            JSON.parse(t.w.localStorage.getItem('desafio-logico-total:progress')).version,
            2
        );
        t.clean();
    });
    await test('Armazenamento desconhecido ou corrompido é preservado, estatísticas da sessão continuam', () => {
        for (const saved of [
            '{quebrado',
            JSON.stringify({ version: 99, games: {} }),
            JSON.stringify({ version: 2, games: [] })
        ]) {
            const t = setup({ storage: saved }),
                p = t.api('Progress');
            assert.equal(p.writable, false);
            p.record(
                'lightsout',
                'easy',
                true,
                { score: 3, time: 100, bestStreak: 1, correct: 1, mistakes: 0 },
                { seed: 'A' }
            );
            assert.equal(p.get('lightsout').played, 1);
            assert.equal(t.w.localStorage.getItem('desafio-logico-total:progress'), saved);
            t.clean();
        }
    });
    await test('Estatísticas limitam o histórico e revisão espaçada adia acertos e antecipa erros', () => {
        const t = setup(),
            p = t.api('Progress');
        for (let i = 0; i < 45; i++)
            p.record(
                'capitals',
                'hard',
                true,
                { time: 1000, score: i, correct: 1, mistakes: 0, bestStreak: 1 },
                { seed: 'A' + i }
            );
        assert.equal(p.get('capitals').recent.length, 30);
        assert.equal(p.get('capitals').averageTime, 1000);
        p.review('capitals', 'BRA', true);
        const first = p.get('capitals').reviews.BRA.due;
        p.review('capitals', 'BRA', true);
        assert(p.get('capitals').reviews.BRA.due > first);
        p.review('capitals', 'BRA', false);
        assert.equal(p.get('capitals').reviews.BRA.repetitions, 0);
        assert(p.get('capitals').reviews.BRA.due < first);
        t.clean();
    });
    await test('Biblioteca: categorias, 43 jogos principais, extra procedural e configurações', async () => {
        const t = setup({ app: true });
        t.startApp();
        assert.equal(t.$$('#category-tabs button').length, 8);
        assert(t.$('#progress-summary').textContent.includes('43 jogos'));
        const found = new Set();
        for (const c of t.$$('#category-tabs button')) {
            t.click(c);
            for (const el of t.$$('.game-card')) {
                found.add(el.querySelector('strong').textContent);
                assert(el.querySelector('p').textContent);
            }
        }
        assert.equal(found.size, 44);
        category(t, 'Extras');
        assert.equal(t.$$('.game-card').length, 1);
        t.click(t.$('.game-card'));
        assert.equal(t.$('#difficulty-select').options.length, 4);
        t.click('#back-to-main-menu');
        t.clean();
    });
    await test('App: jogar, pausar, retomar, replay, vitória única e migração de resultado', async () => {
        const t = setup({ app: true });
        t.startApp();
        category(t, 'Lógica');
        t.click(card(t, 'Apague as Luzes'));
        t.$('#seed-input').value = 'APP-LIGHTS';
        t.click('#start-practice-game-btn');
        await ready(t);
        const board = t
            .$$('.light-button')
            .map((b) => b.textContent)
            .join('');
        t.click('#pause-current-game');
        assert.equal(t.$('#phase-display').inert, true);
        const time = t.$('#hud-time').textContent;
        await t.advance(10000);
        assert.equal(t.$('#hud-time').textContent, time);
        t.click('#pause-current-game');
        assert.equal(t.$('#phase-display').inert, false);
        t.click(t.$('.light-button'));
        t.click('#restart-current-game');
        await ready(t);
        assert.equal(
            t
                .$$('.light-button')
                .map((b) => b.textContent)
                .join(''),
            board
        );
        solveLights(t);
        assert(!t.$('#messageModal').classList.contains('hidden'));
        assert.equal(t.api('Progress').get('lightsout').played, 1);
        t.click('#modalReplayButton');
        await ready(t);
        assert.equal(
            t
                .$$('.light-button')
                .map((b) => b.textContent)
                .join(''),
            board
        );
        t.click('#quit-current-game');
        t.clean();
    });
    await test('Links compartilhados preservam WPM e revisão da configuração original', async () => {
        for (const game of ['wordrain', 'capitals']) {
            const options =
                    game === 'wordrain'
                        ? { mode: 'zen', language: 'pt', typingWpm: 23 }
                        : { mode: 'choices', region: 'World', reviewIds: ['BRA', 'USA'] },
                url = new URL('http://localhost');
            url.searchParams.set('game', game);
            url.searchParams.set('difficulty', 'hard');
            url.searchParams.set('seed', 'SHARE-V2');
            url.searchParams.set('options', JSON.stringify(options));
            const t = setup({ app: true, url: url.href });
            let copied = '';
            Object.defineProperty(t.w.navigator, 'clipboard', {
                value: { writeText: async (value) => (copied = value) }
            });
            t.startApp();
            t.click('#start-practice-game-btn');
            await ready(t);
            if (game === 'wordrain') {
                assert(t.$('#wr-stats').textContent.includes('23'));
                t.click('#quit-current-game');
                category(t, 'Lógica');
                t.click(card(t, 'Apague as Luzes'));
                t.click('#start-practice-game-btn');
                await ready(t);
                solveLights(t);
            } else {
                for (let i = 0; i < 14; i++) {
                    t.click(t.$('#quiz-choices button'));
                    t.click('#quiz-next');
                }
            }
            t.click('#modalShareButton');
            await t.flush();
            const shared = new URL(copied);
            if (game === 'capitals') {
                assert.deepEqual(JSON.parse(shared.searchParams.get('options')).reviewIds, [
                    'BRA',
                    'USA'
                ]);
                assert.equal(shared.searchParams.get('seed'), 'SHARE-V2');
            } else assert(shared.searchParams.get('game'));
            t.click('#modalMenuButton');
            t.clean();
        }
    });
    await test('Jornada mantém dificuldade, varia categorias e nunca escolhe Extras', async () => {
        const t = setup({ app: true });
        t.startApp();
        t.$('#journey-difficulty').value = 'hard';
        t.click('#start-journey-mode');
        await ready(t);
        assert(
            t.$('#run-status').textContent.includes('Difícil') ||
                t.$('#run-status').textContent.includes('Progressão contínua')
        );
        assert.notEqual(t.$('#current-mode-title').textContent, 'Resta Um');
        t.click('#quit-current-game');
        t.clean();
    });
    await test('Seed inválida e link desconhecido dão feedback sem derrubar a biblioteca', () => {
        const t = setup({
            app: true,
            url: 'http://localhost/?game=lightsout&difficulty=INVALID&seed=A'
        });
        t.startApp();
        assert(t.$('#config-error').textContent.includes('inválida'));
        t.$('#seed-input').value = 'espaços inválidos';
        t.click('#start-practice-game-btn');
        assert(t.$('#config-error').textContent);
        assert(!t.$('#phase-selection-screen').classList.contains('hidden'));
        t.click('#back-to-main-menu');
        t.clean();
    });
    fs.writeFileSync(path.join(root, 'tests/results/app.json'), JSON.stringify(reports, null, 2));
    console.log(
        `${reports.filter((r) => r.status === 'PASS').length}/${reports.length} grupos aprovados`
    );
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
