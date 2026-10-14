const { setup, assert, fs, path } = require('./harness.cjs');
const results = [];
async function test(name, fn) {
    try {
        await fn();
        results.push({ name, passed: true });
        console.log('PASS ' + name);
    } catch (error) {
        results.push({ name, passed: false, error: error.stack });
        console.error('FAIL ' + name, error);
    }
}
async function run() {
    await test('Cores: identidade, escala da mistura, limites e diferença perceptual', () => {
        const t = setup(),
            m = t.api('ColorMath');
        assert.equal(m.similarity([255, 0, 0], [255, 0, 0]), 100);
        assert(m.similarity([255, 0, 0], [0, 255, 0]) < 50);
        assert.deepEqual(Array.from(m.hsv(0, 100, 100)), [255, 0, 0]);
        assert.deepEqual(Array.from(m.hsv(120, 100, 100)), [0, 255, 0]);
        assert.deepEqual(Array.from(m.mix([[200, 120, 50]], [3])), [200, 120, 50]);
        assert.deepEqual(
            Array.from(
                m.mix(
                    [
                        [200, 30, 70],
                        [80, 150, 210]
                    ],
                    [1, 2]
                )
            ),
            Array.from(
                m.mix(
                    [
                        [200, 30, 70],
                        [80, 150, 210]
                    ],
                    [3, 6]
                )
            )
        );
        t.clean();
    });
    await test('Ateliê: toda cor alvo tem receita possível, cinco rodadas e pontuação', async () => {
        const t = setup(),
            m = t.api('ColorMath');
        for (const difficulty of ['easy', 'medium', 'hard', 'expert']) {
            await t.mount('colormix', difficulty, { mode: 'challenge' }, 'MIX-' + difficulty);
            for (let round = 0; round < 5; round++) {
                const colors = t
                    .$$('.pigment-dot')
                    .map((e) => e.style.background.match(/\d+/g).map(Number));
                const target = t.$('#mix-target').style.background.match(/\d+/g).map(Number);
                const units = { easy: 10, medium: 14, hard: 18, expert: 20 }[difficulty];
                let solution;
                function search(weights, left) {
                    if (solution) return;
                    if (weights.length === colors.length - 1) {
                        const w = [...weights, left];
                        if (m.similarity(m.mix(colors, w), target) === 100) solution = w;
                        return;
                    }
                    for (let n = 0; n <= left; n++) search([...weights, n], left - n);
                }
                search([], units);
                assert(solution, 'Cor inalcançável');
                solution.forEach((n, i) => {
                    for (let k = 0; k < n; k++) t.click(`[data-pigment="${i}"][data-change="1"]`);
                });
                t.click('#mix-check');
                assert(t.$('#mix-feedback').textContent.includes('100%'));
                assert(t.$('#mix-check').disabled);
                t.click('#mix-next');
            }
            assert.equal(t.outcomes[0][0], true);
        }
        t.clean();
    });
    await test('Ateliê: três avaliações, receita revelada e limpar sem consumir tentativa', async () => {
        const t = setup();
        await t.mount('colormix', 'expert');
        assert(t.$('#mix-check').disabled);
        t.click('[data-pigment="0"][data-change="1"]');
        t.click('#mix-clear');
        assert(t.$('#mix-check').disabled);
        t.click('[data-pigment="4"][data-change="1"]');
        for (let n = 0; n < 3; n++) t.click('#mix-check');
        assert(t.$('#mix-check').disabled);
        assert(t.$('#mix-feedback').textContent.includes('receita possível'));
        t.clean();
    });
    await test('Cor de Memória: referência escondida, cinco itens únicos e campanha perfeita', async () => {
        const t = setup(),
            cards = t.api('ColorMemoryCards');
        await t.mount('colormemory', 'hard', { pack: 'mixed', mode: 'memory' }, 'COLOR-BANK');
        const names = new Set();
        for (let round = 0; round < 5; round++) {
            const name = t.$('#cm-name').textContent;
            assert(!names.has(name));
            names.add(name);
            assert(!t.$('#cm-result').textContent.includes('Referência:'));
            const card = cards.find((c) => c.name === name);
            card.hsv.forEach((value, i) => t.input(`#cm-value-${i}`, value));
            t.click('#cm-submit');
            assert(t.$('#cm-phase').textContent.includes('100%'));
            t.click('#cm-submit');
            t.click('#cm-next');
        }
        assert.equal(t.outcomes.length, 1);
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    await test('Cor de Memória: observar, pausa, pista com desconto e cancelamento', async () => {
        const t = setup(),
            cards = t.api('ColorMemoryCards');
        await t.mount('colormemory', 'easy', { mode: 'study', pack: 'nature' });
        assert(t.$('#cm-submit').disabled);
        t.session.pause();
        await t.advance(5000);
        assert(t.$('#cm-submit').disabled);
        t.session.resume();
        await t.advance(3501);
        assert(!t.$('#cm-submit').disabled);
        const card = cards.find((c) => c.name === t.$('#cm-name').textContent);
        card.hsv.forEach((v, i) => t.input(`#cm-value-${i}`, v));
        t.click('#cm-hint');
        t.click('#cm-submit');
        assert(t.$('#cm-phase').textContent.includes('92% após'));
        await t.mount('colormemory', 'expert', { mode: 'study' });
        const html = t.$('#phase-display').innerHTML;
        t.session.destroy();
        await t.advance(5000);
        assert.equal(t.$('#phase-display').innerHTML, html);
        t.clean();
    });
    fs.writeFileSync(path.join(__dirname, 'results/colors.json'), JSON.stringify(results, null, 2));
    if (results.some((r) => !r.passed)) process.exitCode = 1;
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
