const { setup, assert, fs, path, root } = require('./harness.cjs');
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
function arithmetic(text) {
    text = text
        .replaceAll('−', '-')
        .replaceAll('×', '*')
        .replaceAll('÷', '/')
        .replace(/(\d+)²/g, '($1**2)');
    assert(/^[0-9()\s+*/.\-]+$/.test(text), text);
    return Function('return ' + text)();
}
function restoreOrder(t, row, original, leftButton) {
    for (let i = 0; i < original.length; i++) {
        let index = t.$$(row + ' button').findIndex((b) => b.textContent === original[i]);
        assert(index >= i);
        t.click(t.$$(row + ' button')[index]);
        while (index-- > i) t.click(leftButton);
    }
}
async function run() {
    await test('Arena: expressões independentes, quatro dificuldades, combo, erros, sprint e sobrevivência', async () => {
        const t = setup();
        for (const difficulty of ['easy', 'medium', 'hard', 'expert']) {
            await t.mount('mental_math', difficulty);
            while (!t.outcomes.length) {
                const value = arithmetic(t.$('#mm-problem').textContent);
                assert(Number.isInteger(value));
                assert(Math.abs(value) < 10000);
                t.input('#mm-answer', value);
                t.submit('#mm-form');
                t.submit('#mm-form');
                await t.advance(650);
            }
            assert.equal(t.outcomes[0][0], true);
            assert.equal(t.outcomes[0][1].metrics.accuracy, 100);
            assert(t.outcomes[0][1].metrics.bestStreak >= 10);
        }
        await t.mount('mental_math', 'easy', { mode: 'survival' });
        t.input('#mm-answer', '-9999');
        t.submit('#mm-form');
        await t.advance(650);
        assert(t.session.alive);
        assert.equal(t.session.score.snapshot().mistakes, 1);
        await t.advance(30000);
        assert.equal(t.outcomes[0][0], false);
        await t.mount('mental_math', 'easy', { mode: 'sprint' });
        await t.advance(60000);
        assert.equal(t.outcomes.length, 1);
        t.clean();
    });
    await test('Comparação, estimativa e operador: todas as rodadas têm respostas calculáveis e únicas', async () => {
        const t = setup();
        for (const id of ['compare', 'estimate', 'mutantoperator'])
            for (const difficulty of ['easy', 'expert']) {
                await t.mount(id, difficulty);
                let count = 0;
                while (!t.outcomes.length) {
                    let answer;
                    if (id === 'compare') {
                        const [a, b] = t.$('#quiz-visual').textContent.split('?').map(arithmetic);
                        answer = a === b ? '=' : a > b ? '>' : '<';
                    } else if (id === 'estimate') {
                        const product = arithmetic(t.$('#quiz-visual').textContent),
                            choices = t
                                .$$('#quiz-choices button')
                                .map((b) => +b.textContent)
                                .sort((a, b) => Math.abs(a - product) - Math.abs(b - product));
                        assert(Math.abs(choices[0] - product) < Math.abs(choices[1] - product));
                        answer = String(choices[0]);
                    } else {
                        let text = t.$('#quiz-visual').textContent;
                        for (const pair of t
                            .$('#quiz-prompt')
                            .textContent.matchAll(/([▲●■]) significa ([+−×])/g))
                            text = text.replaceAll(pair[1], pair[2]);
                        answer = arithmetic(text);
                    }
                    if (id === 'mutantoperator') {
                        t.input('#quiz-input', answer);
                        t.submit('#quiz-form');
                    } else
                        t.click(
                            t
                                .$$('#quiz-choices button')
                                .find((b) => b.textContent === String(answer))
                        );
                    assert(t.$('#quiz-feedback').textContent.startsWith('Correto.'));
                    t.click('#quiz-next');
                    assert(++count <= 20);
                }
                assert.equal(t.outcomes[0][1].metrics.accuracy, 100);
            }
        t.clean();
    });
    await test('Matrizes: soma, escalar, determinantes 2/3, elemento faltante, sistemas e transformação', async () => {
        const t = setup();
        function det(a) {
            if (a.length === 2) return a[0][0] * a[1][1] - a[1][0] * a[0][1];
            return (
                a[0][0] * a[1][1] * a[2][2] +
                a[0][1] * a[1][2] * a[2][0] +
                a[0][2] * a[1][0] * a[2][1] -
                a[0][2] * a[1][1] * a[2][0] -
                a[0][1] * a[1][0] * a[2][2] -
                a[0][0] * a[1][2] * a[2][1]
            );
        }
        for (const mode of ['addition', 'scalar', 'determinant', 'missing', 'system', 'transform'])
            for (const difficulty of ['easy', 'expert']) {
                await t.mount('matrix', difficulty, { mode });
                for (let k = 0; k < (difficulty === 'easy' ? 10 : 16); k++) {
                    const matrices = t.$$('.matrix-grid').map((el) => {
                            const n = Math.sqrt(el.children.length),
                                values = [...el.children].map((s) =>
                                    s.textContent === '?' ? '?' : +s.textContent
                                );
                            return Array.from({ length: n }, (_, r) =>
                                values.slice(r * n, (r + 1) * n)
                            );
                        }),
                        prompt = t.$('#quiz-prompt').textContent,
                        position = prompt.match(/\((\d+), (\d+)\)/);
                    let answer;
                    if (mode === 'determinant') answer = det(matrices[0]);
                    else if (mode === 'system') {
                        const equations = [...t.$('.equation-text').childNodes]
                                .filter((n) => n.nodeType === 3)
                                .map((n) =>
                                    n.textContent
                                        .match(/(-?\d+)x \+ \((-?\d+)\)y = (-?\d+)/)
                                        .slice(1)
                                        .map(Number)
                                ),
                            [[a, b, e], [c, d, f]] = equations;
                        const x = (e * d - b * f) / (a * d - b * c),
                            y = (a * f - e * c) / (a * d - b * c);
                        answer = prompt.includes('qual é y') ? y : x;
                        assert(Number.isInteger(answer));
                    } else if (mode === 'missing') {
                        const a = matrices[0],
                            b = matrices[1],
                            sum = matrices[2];
                        for (let r = 0; r < a.length; r++)
                            for (let c = 0; c < a.length; c++)
                                if (a[r][c] === '?') answer = sum[r][c] - b[r][c];
                    } else if (mode === 'scalar') {
                        const scalar = +t.$('#quiz-visual').textContent.match(/^(-?\d+)/)[1];
                        answer = scalar * matrices[0][+position[1] - 1][+position[2] - 1];
                    } else if (mode === 'transform') {
                        const factor = +prompt.match(/\((-?\d+)\)L₁/)[1],
                            column = +position[2] - 1;
                        answer = matrices[0][1][column] + factor * matrices[0][0][column];
                    } else
                        answer =
                            matrices[0][+position[1] - 1][+position[2] - 1] +
                            matrices[1][+position[1] - 1][+position[2] - 1];
                    t.input('#quiz-input', answer);
                    t.submit('#quiz-form');
                    assert(
                        t.$('#quiz-feedback').textContent.startsWith('Correto.'),
                        mode + ' ' + prompt
                    );
                    t.click('#quiz-next');
                }
                assert.equal(t.outcomes[0][0], true);
            }
        t.clean();
    });
    await test('Memória clássica é resolvida apenas observando cartas abertas', async () => {
        const t = setup();
        await t.mount('memory_game');
        const seen = new Map();
        let turns = 0;
        while (!t.outcomes.length) {
            const available = t.$$('.memory-card').filter((b) => !b.disabled);
            const first = available.find((b) => !seen.has(+b.dataset.card)) || available[0];
            t.click(first);
            seen.set(+first.dataset.card, first.textContent);
            let second = t
                .$$('.memory-card')
                .find((b) => !b.disabled && seen.get(+b.dataset.card) === first.textContent);
            if (!second)
                second =
                    t.$$('.memory-card').find((b) => !b.disabled && !seen.has(+b.dataset.card)) ||
                    t.$$('.memory-card').find((b) => !b.disabled);
            assert(second);
            t.click(second);
            seen.set(+second.dataset.card, second.textContent);
            await t.advance(801);
            assert(++turns < 50);
        }
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    await test('Diferenças: contagem 2/4/6/8, alterações reais e apresentação de memória', async () => {
        const t = setup();
        for (const [difficulty, count] of [
            ['easy', 2],
            ['medium', 4],
            ['hard', 6],
            ['expert', 8]
        ])
            for (let seed = 0; seed < 12; seed++) {
                await t.mount('subtledifference', difficulty, {}, 'DIFFERENCE' + seed);
                const a = t.$$('#scene-a button'),
                    b = t.$$('#scene-b button'),
                    changed = b.filter((el, i) => el.innerHTML !== a[i].innerHTML);
                assert.equal(changed.length, count);
                changed.forEach(t.click);
                assert.equal(t.outcomes[0][0], true);
            }
        await t.mount('subtledifference', 'easy', { mode: 'memory' });
        assert(t.$('#scene-b-wrap').classList.contains('hidden'));
        await t.advance(5000);
        assert(t.$('#scene-a-wrap').classList.contains('hidden'));
        assert(!t.$('#scene-b-wrap').classList.contains('hidden'));
        t.clean();
    });
    await test('Prateleira: cortina, mudanças reais e restauração com cliques', async () => {
        const t = setup();
        await t.mount('memoryshelf', 'expert', { mode: 'restore' });
        const snapshot = () =>
                t.$$('#ms-shelf button').map((b) => b.innerHTML + '|' + b.style.background),
            original = snapshot();
        await t.advance(5000);
        assert.equal(t.$('#ms-shelf').style.visibility, 'hidden');
        await t.advance(700);
        for (let i = 0; i < original.length; i++) {
            if (snapshot()[i] === original[i]) continue;
            const other = snapshot().findIndex((value, j) => j > i && value === original[i]);
            assert(other >= 0);
            t.click(t.$$('#ms-shelf button')[i]);
            t.click(t.$$('#ms-shelf button')[other]);
        }
        t.click('#ms-check');
        assert.equal(t.outcomes[0][0], true);
        await t.mount('memoryshelf', 'expert');
        const previous = snapshot();
        await t.advance(5700);
        const changed = snapshot().flatMap((value, i) => (value !== previous[i] ? [i] : []));
        assert.equal(changed.length, 4);
        changed.forEach((i) => t.click(t.$$('#ms-shelf button')[i]));
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    await test('Ordem Temporal: estímulos apresentados permitem restaurar a ordem por teclado/tela', async () => {
        const t = setup();
        let observed = [],
            last = '';
        t.watch(() => {
            const text = t.$('#temporal-stimulus')?.textContent || '';
            if (text && text !== 'Restaure a ordem' && text !== last && !observed.includes(text))
                observed.push(text);
            last = text;
        });
        await t.mount('temporalorder', 'hard', { stimulus: 'words' });
        assert.equal(observed.length, 6);
        restoreOrder(t, '#temporal-order', observed, '#temporal-left');
        t.click('#temporal-check');
        assert.equal(t.session.score.snapshot().correct, 1);
        t.clean();
    });
    await test('Memória espacial: posições, sequência, cores e obstáculos são reconstruíveis', async () => {
        for (const mode of ['positions', 'sequence', 'colors', 'obstacles']) {
            const t = setup();
            let observed = [];
            t.watch(() => {
                const colored = t
                    .$$('#spatial-grid button')
                    .flatMap((b, i) =>
                        b.style.background ? [{ cell: i, color: b.style.background }] : []
                    );
                for (const item of colored)
                    if (!observed.some((o) => o.cell === item.cell)) observed.push(item);
            });
            await t.mount('spatialmemory', 'easy', { mode });
            assert.equal(observed.length, 3);
            for (const item of observed) {
                if (mode === 'colors') {
                    const color = t
                        .$$('#spatial-colors button')
                        .find((b) => b.style.background === item.color);
                    assert(color);
                    t.click(color);
                }
                t.click(t.$$('#spatial-grid button')[item.cell]);
            }
            t.click('#spatial-check');
            assert.equal(t.session.score.snapshot().correct, 1);
            t.clean();
        }
    });
    await test('Flow: solução construtiva desenhada no tabuleiro e desfazer', async () => {
        const t = setup(),
            rng = t.api('SeededRandom').create('FLOW-PLAY'),
            solution = t.api('GameAlgorithms').flowPuzzle(4, 3, rng);
        await t.mount('flow', 'easy', {}, 'FLOW-PLAY');
        const first = solution[0][0];
        t.click(`.flow-cell[data-r="${first.r}"][data-c="${first.c}"]`);
        t.click('#flow-undo');
        assert(t.$('#flow-status').textContent.includes('0/3'));
        for (const p of solution)
            for (const cell of p) t.click(`.flow-cell[data-r="${cell.r}"][data-c="${cell.c}"]`);
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    await test('Velha: melhor de três, vantagem da segunda rodada e saída da peça mais antiga', async () => {
        const t = setup();
        await t.mount('tictactoe', 'easy', { mode: 'friend' });
        for (const cell of [0, 3, 1, 4, 2]) t.click(`[data-index="${cell}"]`);
        assert(t.$('#tttm-score').textContent.includes('X 1'));
        t.click('#tttm-next');
        assert(t.$('#tttm-status').textContent.startsWith('Vez de O'));
        for (const cell of [0, 3, 1, 4, 2]) t.click(`[data-index="${cell}"]`);
        t.click('#tttm-next');
        assert(t.$('#tttm-status').textContent.includes('sem vantagem'));
        for (const cell of [0, 1, 4, 2, 3, 7, 8]) t.click(`[data-index="${cell}"]`);
        assert.equal(t.$('[data-index="0"]').textContent, '');
        assert.equal(t.$('[data-index="4"]').style.opacity, '0.45');
        assert(t.$('[data-index="4"]').classList.contains('ttt-oldest'));
        t.clean();
    });
    await test('Balança: dedução independente identifica o objeto em duas pesagens', async () => {
        const t = setup();
        for (let seed = 0; seed < 20; seed++) {
            await t.mount('mystery_scale', 'easy', {}, 'SCALE' + seed);
            function weigh(left, right) {
                t.click('#scale-reset-pans-button');
                t.click('#scale-choose-left');
                left.forEach((i) => t.click(`[data-item="${i}"]`));
                t.click('#scale-choose-right');
                right.forEach((i) => t.click(`[data-item="${i}"]`));
                t.click('#scale-weigh-button');
                return t.$('#scale-result-area').textContent;
            }
            const first = weigh([0, 1], [2, 3]),
                pair = first.includes('Equilíbrio')
                    ? [4, 5]
                    : first.includes('Esquerda')
                      ? [0, 1]
                      : [2, 3],
                second = weigh([pair[0]], [pair[1]]),
                odd = second.includes('Esquerda') ? pair[0] : pair[1];
            t.$('#scale-identify-select').value = String(odd);
            t.click('#scale-identify-button');
            assert.equal(t.outcomes[0][0], true);
            assert.equal(t.$$('#scale-history .history-row').length, 2);
        }
        t.clean();
    });
    await test('Impulso Certo: respostas pelo estímulo visível, pontuação global e falha sem input', async () => {
        const t = setup();
        await t.mount('rightimpulse');
        for (let i = 0; i < 20; i++) {
            if (
                t.$('#ri-symbol-presentation').textContent === t.$('#ri-target-display').textContent
            )
                t.click('#ri-game-area');
            else await t.advance(1500);
            await t.advance(500);
        }
        assert.equal(t.outcomes[0][0], true);
        assert.equal(t.outcomes[0][1].metrics.correct, 20);
        await t.mount('rightimpulse');
        await t.advance(60000);
        assert.equal(t.outcomes[0][0], false);
        t.clean();
    });
    fs.writeFileSync(
        path.join(root, 'tests/results/playthrough.json'),
        JSON.stringify(reports, null, 2)
    );
    console.log(
        `${reports.filter((r) => r.status === 'PASS').length}/${reports.length} grupos aprovados`
    );
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
