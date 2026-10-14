const { setup, assert, fs, path } = require('./harness.cjs');
const reports = [];
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
function submitGuess(t, name) {
    t.input('#ded-input', name);
    t.submit('#ded-form');
}
async function ready(t) {
    await t.flush();
    assert(!t.$('#phase-display').textContent.includes('Preparando'));
}
async function run() {
    await test('Pokédex: 1025 espécies únicas, filtros de geração, comparação, palpite repetido, vitória e derrota', async () => {
        const t = setup(),
            all = await t.api('GameData').load('pokemon');
        assert.equal(all.length, 1025);
        assert.equal(new Set(all.map((p) => p.id)).size, 1025);
        const pika = all.find((p) => p.id === 25);
        assert.equal(pika.name, 'Pikachu');
        assert.equal(pika.height, 0.4);
        assert.equal(pika.weight, 6);
        assert.deepEqual(Array.from(pika.types), [13]);
        for (const difficulty of ['easy', 'expert']) {
            const bank = all.filter((p) => p.generation <= (difficulty === 'easy' ? 1 : 9));
            const secret = t
                .api('ReplayEngine')
                .deck(t.api('SeededRandom').create('TESTE-V2'), bank, [], (p) => String(p.id))
                .next();
            await t.mount('pokemon', difficulty);
            submitGuess(t, 'invalid');
            assert.equal(t.$$('.ded-row').length, 0);
            const wrong = bank.find((p) => p.id !== secret.id);
            submitGuess(t, wrong.name);
            assert.equal(t.$$('.ded-row').length, 1);
            const heightCell = t.$$('.ded-cell')[2];
            assert(
                heightCell.textContent.endsWith(
                    wrong.height === secret.height ? '✓' : wrong.height < secret.height ? '↑' : '↓'
                )
            );
            submitGuess(t, wrong.name);
            assert.equal(t.$$('.ded-row').length, 1);
            submitGuess(t, secret.alias);
            assert.equal(t.outcomes[0][0], true);
            await t.mount('pokemon', difficulty);
            for (const p of bank
                .filter((p) => p.id !== secret.id)
                .slice(0, difficulty === 'easy' ? 10 : 7))
                submitGuess(t, p.name);
            assert.equal(t.outcomes[0][0], false);
            assert(t.outcomes[0][1].text.includes(secret.name));
        }
        await t.mount('pokemon', 'easy', { generation: '9' });
        assert(t.$('#ded-count').textContent.includes('120 candidatos'));
        t.clean();
    });
    await test('Elementos: 118 símbolos únicos, níveis, nomes sem acentos e símbolos aceitos', async () => {
        const t = setup(),
            all = await t.api('GameData').load('elements');
        assert.equal(all.length, 118);
        assert.equal(new Set(all.map((p) => p.symbol)).size, 118);
        assert.equal(all[25].symbol, 'Fe');
        assert.equal(all[25].name, 'Ferro');
        assert.equal(all[117].period, 7);
        for (const difficulty of ['easy', 'medium', 'hard', 'expert']) {
            const tier = t.api('DifficultyEngine').index(difficulty),
                bank = all.slice(0, [20, 36, 86, 118][tier]);
            const secret = t
                .api('ReplayEngine')
                .deck(t.api('SeededRandom').create('TESTE-V2'), bank, [], (p) => String(p.id))
                .next();
            await t.mount('element', difficulty);
            submitGuess(t, secret.symbol);
            assert.equal(t.outcomes[0][0], true);
        }
        t.clean();
    });
    await test('Equação: precedência, divisão por zero, caracteres repetidos, inválidos sem custo e replay solucionável', async () => {
        const t = setup(),
            math = t.api('EquationPuzzle');
        assert.equal(math.evaluate('2+3*4'), 14);
        assert.equal(math.evaluate('8/2-1'), 3);
        assert.equal(math.evaluate('8/0'), null);
        assert.equal(math.evaluate('01+2'), null);
        assert.equal(math.evaluate('alert(1)'), null);
        assert.deepEqual(Array.from(math.feedback('111+2=113', '112+1=113')), [
            'exact',
            'exact',
            'present',
            'exact',
            'present',
            'exact',
            'exact',
            'exact',
            'exact'
        ]);
        for (const difficulty of ['easy', 'medium', 'hard', 'expert']) {
            const length = [5, 6, 7, 8][t.api('DifficultyEngine').index(difficulty)];
            await t.mount('equation', difficulty);
            t.input('#eq-input', '1/0=1');
            t.submit('#eq-form');
            assert.equal(t.$$('.equation-row').length, 0);
            const guesses = [];
            for (let a = 1; a <= 30; a++)
                for (let b = 1; b <= 30; b++) {
                    const g = `${a}+${b}=${a + b}`;
                    if (g.length === length) guesses.push(g);
                }
            for (const guess of guesses.slice(0, 8)) {
                if (!t.session.alive) break;
                t.input('#eq-input', guess);
                t.submit('#eq-form');
            }
            // Expert may need multiplication to produce an eight-character equality.
            if (t.session.alive)
                for (let a = 10; a <= 30 && t.session.alive; a++) {
                    const guess = `${a}*3=${a * 3}`;
                    if (guess.length !== length) continue;
                    t.input('#eq-input', guess);
                    t.submit('#eq-form');
                }
            assert(t.outcomes.length);
            const target = t.outcomes[0][1].text.match(/Equação: ([\d+*/=-]+)\./)[1];
            assert.equal(target.length, length);
            const [lhs, rhs] = target.split('=');
            assert.equal(math.evaluate(lhs), Number(rhs));
            await t.mount('equation', difficulty);
            t.input('#eq-input', target);
            t.submit('#eq-form');
            assert.equal(t.outcomes[0][0], true);
        }
        t.clean();
    });
    await test('Soma Exata: resolver pelas metas visíveis em quatro tamanhos, desfazer e aceitar soluções', async () => {
        const t = setup();
        for (const difficulty of ['easy', 'medium', 'hard', 'expert'])
            for (let seed = 0; seed < 3; seed++) {
                await t.mount('sumexact', difficulty, {}, 'SUM' + seed);
                const size = [3, 4, 5, 6][t.api('DifficultyEngine').index(difficulty)],
                    values = t.$$('.sum-cell').map((b) => Number(b.textContent));
                const targets = t.$$('.sum-total').map((e) => Number(e.textContent.split('/')[1]));
                const rows = targets.slice(0, size),
                    cols = targets.slice(size);
                const options = rows.map((target, r) =>
                    Array.from({ length: 1 << size }, (_, mask) => mask).filter(
                        (mask) =>
                            values
                                .slice(r * size, (r + 1) * size)
                                .reduce((s, v, c) => s + ((mask >> c) & 1 ? v : 0), 0) === target
                    )
                );
                let solution = null;
                function search(r, sums, masks) {
                    if (solution) return;
                    if (r === size) {
                        if (sums.every((v, c) => v === cols[c])) solution = masks;
                        return;
                    }
                    for (const mask of options[r]) {
                        const next = sums.map(
                            (v, c) => v + ((mask >> c) & 1 ? values[r * size + c] : 0)
                        );
                        if (next.some((v, c) => v > cols[c])) continue;
                        search(r + 1, next, [...masks, mask]);
                    }
                }
                search(0, Array(size).fill(0), []);
                assert(solution, 'Metas sem solução');
                t.session.pause();
                t.click(t.$('.sum-cell'));
                assert.equal(t.$('.sum-cell').getAttribute('aria-pressed'), 'false');
                t.session.resume();
                t.click(t.$('.sum-cell'));
                assert.equal(t.$('.sum-cell').getAttribute('aria-pressed'), 'true');
                t.click('#sum-undo');
                assert.equal(t.$('.sum-cell').getAttribute('aria-pressed'), 'false');
                for (let i = 0; i < values.length; i++)
                    if (!((solution[Math.floor(i / size)] >> i % size) & 1))
                        t.click(t.$$('.sum-cell')[i]);
                t.click('#sum-check');
                assert.equal(t.outcomes[0][0], true);
            }
        t.clean();
    });
    await test('Chuva: modo padrão realmente cai e espera; sobrevivência perde ao esgotar vidas', async () => {
        const t = setup();
        await t.mount('wordrain', 'easy', { mode: 'zen' });
        await t.advance(16);
        const initial = t.$('.falling-word').style.transform;
        await t.advance(3000);
        assert.notEqual(t.$('.falling-word').style.transform, initial);
        await t.advance(60000);
        assert.equal(t.outcomes.length, 0);
        assert.equal(t.$$('.falling-word').length, 1);
        t.input('#wr-input', t.$('.falling-word').textContent);
        assert(t.$('#wr-last').textContent.includes('concluída'));
        await t.mount('wordrain', 'easy', { mode: 'sprint' });
        t.input('#wr-input', t.$('.falling-word').textContent);
        await t.advance(61000);
        assert.equal(t.outcomes[0][0], false, 'Uma palavra não cumpre a meta do sprint');
        await t.mount('wordrain', 'easy', { mode: 'sprint' });
        for (let i = 0; i < 15; i++) {
            await t.advance(16);
            t.input('#wr-input', t.$('.falling-word').textContent);
        }
        await t.advance(61000);
        assert.equal(t.outcomes[0][0], true, 'Meta do sprint cumprida');
        await t.mount('wordrain', 'expert', { mode: 'survival' });
        await t.advance(120000);
        assert.equal(t.outcomes[0][0], false);
        assert(t.outcomes[0][1].metrics.missed >= 5);
        t.clean();
    });
    await test('Texto: parágrafos extensos, feedback, correção, pontuação e caixa exata em código', async () => {
        const t = setup();
        for (const language of ['pt', 'en', 'code']) {
            await t.mount('wordrain', 'expert', { mode: 'text', language });
            const text = t.$('#text-reference').textContent;
            assert(text.length > 650);
            assert(text.includes('\n\n'));
            t.input('#text-input', '!');
            assert.equal(t.$('#text-input').getAttribute('aria-invalid'), 'true');
            assert(t.$('.text-wrong'));
            const mistakes = t.session.score.snapshot().mistakes;
            t.input('#text-input', '');
            assert.equal(t.session.score.snapshot().mistakes, mistakes);
            await t.advance(60000);
            t.input('#text-input', text.slice(0, 10));
            assert.equal(Number(t.$('#text-progress').value), 10);
            t.input('#text-input', text);
            assert.equal(t.outcomes[0][0], true);
            assert(t.outcomes[0][1].metrics.wpm > 0);
        }
        t.clean();
    });
    await test('Navegação: recarregar desafio pelo URL, preservar modos, histórico e cache da página', async () => {
        const t = setup({ app: true });
        t.startApp();
        t.click(t.$$('.game-card').find((c) => c.textContent.includes('Soma Exata')));
        const setupState = structuredClone(t.w.history.state);
        t.click('#start-practice-game-btn');
        await ready(t);
        const playURL = t.w.location.href,
            playState = structuredClone(t.w.history.state);
        assert(playURL.includes('view=play'));
        assert.equal(playState.challenge.game, 'sumexact');
        t.click(t.$('.sum-cell'));
        const board = t.$('#sum-grid').innerHTML;
        t.w.dispatchEvent(new t.w.PageTransitionEvent('pagehide', { persisted: true }));
        await t.advance(10000);
        assert.equal(t.$('#sum-grid').innerHTML, board);
        t.w.dispatchEvent(new t.w.PageTransitionEvent('pageshow', { persisted: true }));
        assert.equal(t.$('#sum-grid').innerHTML, board);
        const reloaded = setup({ app: true, url: playURL });
        reloaded.startApp();
        await ready(reloaded);
        assert.equal(reloaded.$('#current-mode-title').textContent, 'Soma Exata');
        assert(!reloaded.$('#roguelike-game-area').classList.contains('hidden'));
        reloaded.click('#quit-current-game');
        reloaded.clean();
        t.w.dispatchEvent(new t.w.PopStateEvent('popstate', { state: setupState }));
        await t.flush();
        assert(!t.$('#phase-selection-screen').classList.contains('hidden'));
        t.w.dispatchEvent(new t.w.PopStateEvent('popstate', { state: playState }));
        await ready(t);
        assert(!t.$('#roguelike-game-area').classList.contains('hidden'));
        t.click('#quit-current-game');
        t.clean();
    });
    await test('Navegação: reabrir raiz retoma configuração, filtros e tolera estado inválido', async () => {
        const t = setup({ app: true });
        t.startApp();
        t.input('#game-search', 'pokémon');
        t.click(t.$('.game-card'));
        t.click('[data-option="generation"]');
        t.$('[data-option="generation"]').value = '9';
        t.$('[data-option="generation"]').dispatchEvent(new t.w.Event('change', { bubbles: true }));
        const saved = t.w.localStorage.getItem('desafio-logico-total:page');
        const next = setup({ app: true });
        next.w.localStorage.setItem('desafio-logico-total:page', saved);
        next.startApp();
        await next.flush();
        assert(!next.$('#phase-selection-screen').classList.contains('hidden'));
        assert.equal(next.$('[data-option="generation"]').value, '9');
        assert.equal(next.$('#game-search').value, 'pokémon');
        t.clean();
        next.clean();
        for (const value of [
            '{broken',
            JSON.stringify({ version: 999, screen: 'roguelike-game-area' })
        ]) {
            const bad = setup({ app: true });
            bad.w.localStorage.setItem('desafio-logico-total:page', value);
            bad.startApp();
            await bad.flush();
            assert(!bad.$('#game-main-menu').classList.contains('hidden'));
            bad.clean();
        }
    });
    fs.writeFileSync(
        path.join(__dirname, 'results/expansion.json'),
        JSON.stringify(reports, null, 2)
    );
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
