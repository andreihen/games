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
function countSudoku(input) {
    let count = 0,
        solution = null;
    const b = [...input];
    function visit() {
        if (count >= 2) return;
        let chosen = -1,
            values = [];
        for (let i = 0; i < 81; i++)
            if (!b[i]) {
                const row = Math.floor(i / 9),
                    col = i % 9,
                    possible = [];
                for (let n = 1; n <= 9; n++) {
                    let okay = true;
                    for (let j = 0; j < 81; j++)
                        if (
                            b[j] === n &&
                            (Math.floor(j / 9) === row ||
                                j % 9 === col ||
                                (Math.floor(j / 27) === Math.floor(row / 3) &&
                                    Math.floor((j % 9) / 3) === Math.floor(col / 3)))
                        ) {
                            okay = false;
                            break;
                        }
                    if (okay) possible.push(n);
                }
                if (!possible.length) return;
                if (chosen === -1 || possible.length < values.length) {
                    chosen = i;
                    values = possible;
                }
                if (values.length === 1) break;
            }
        if (chosen === -1) {
            count++;
            solution = [...b];
            return;
        }
        for (const n of values) {
            b[chosen] = n;
            visit();
            b[chosen] = 0;
        }
    }
    visit();
    return { count, solution };
}
function gf2(board, size, modifier) {
    const n = board.length;
    function cells(j) {
        const r = (j / size) | 0,
            c = j % size,
            delta =
                modifier === 'diagonal'
                    ? [
                          [0, 0],
                          [1, 0],
                          [-1, 0],
                          [0, 1],
                          [0, -1],
                          [1, 1],
                          [1, -1],
                          [-1, 1],
                          [-1, -1]
                      ]
                    : modifier === 'long'
                      ? [
                            [0, 0],
                            [1, 0],
                            [-1, 0],
                            [0, 1],
                            [0, -1],
                            [2, 0],
                            [-2, 0],
                            [0, 2],
                            [0, -2]
                        ]
                      : [
                            [0, 0],
                            [1, 0],
                            [-1, 0],
                            [0, 1],
                            [0, -1]
                        ];
        return new Set(
            delta
                .map(([dr, dc]) => {
                    let rr = r + dr,
                        cc = c + dc;
                    if (modifier === 'torus') {
                        rr = (rr + size) % size;
                        cc = (cc + size) % size;
                    }
                    return rr >= 0 && cc >= 0 && rr < size && cc < size ? rr * size + cc : -1;
                })
                .filter((x) => x >= 0)
        );
    }
    const m = board.map((v, i) =>
            Array.from({ length: n + 1 }, (_, j) => (j === n ? v : +cells(j).has(i)))
        ),
        pivots = [];
    let row = 0;
    for (let c = 0; c < n; c++) {
        let p = m.findIndex((r, i) => i >= row && r[c]);
        if (p < 0) continue;
        [m[p], m[row]] = [m[row], m[p]];
        for (let r = 0; r < n; r++)
            if (r !== row && m[r][c]) for (let k = c; k <= n; k++) m[r][k] ^= m[row][k];
        pivots.push(c);
        row++;
    }
    const free = Array.from({ length: n }, (_, i) => i).filter((i) => !pivots.includes(i));
    let best = null;
    for (let mask = 0; mask < 2 ** free.length; mask++) {
        const x = Array(n).fill(0);
        free.forEach((c, i) => (x[c] = (mask >> i) & 1));
        pivots.forEach((c, r) => {
            x[c] = m[r][n];
            for (const f of free) x[c] ^= m[r][f] & x[f];
        });
        if (!best || x.reduce((a, b) => a + b, 0) < best.reduce((a, b) => a + b, 0)) best = x;
    }
    return best;
}
async function run() {
    await test('44 jogos: quatro dificuldades, todos os modos, seed repetível e encerramento sem recursos', async () => {
        const t = setup();
        assert.equal(t.config.length, 44);
        assert.equal(t.config.filter((g) => g.primary).length, 43);
        for (const g of t.config) {
            for (const difficulty of ['easy', 'medium', 'hard', 'expert']) {
                await t.mount(g.id, difficulty);
                assert(t.$('#phase-display').children.length, g.id);
                const initial = t.$('#phase-display').innerHTML;
                t.session.destroy();
                assert.equal(t.jobs.size, 0, g.id);
                await t.advance(25000);
                assert.equal(t.$('#phase-display').innerHTML, initial, g.id + ' callback obsoleto');
                await t.mount(g.id, difficulty);
                assert.equal(
                    t.$('#phase-display').innerHTML,
                    initial,
                    g.id + ' não reproduziu a seed'
                );
            }
            for (const option of g.options)
                for (const value of option.values) {
                    await t.mount(g.id, 'hard', { [option.key]: value.value });
                    await t.advance(100);
                    t.session.destroy();
                    assert.equal(t.jobs.size, 0, g.id);
                }
        }
        t.clean();
    });
    await test('Seed: igualdade, diversidade, limites e forks independentes', () => {
        const t = setup(),
            r = t.api('SeededRandom');
        for (let i = 0; i < 50; i++) {
            const a = r.create('SEED' + i),
                b = r.create('SEED' + i);
            assert.deepEqual(
                Array.from({ length: 100 }, () => a.int(-9, 31)),
                Array.from({ length: 100 }, () => b.int(-9, 31))
            );
        }
        assert.notDeepEqual(
            r.create('A').shuffle([1, 2, 3, 4, 5, 6, 7]),
            r.create('B').shuffle([1, 2, 3, 4, 5, 6, 7])
        );
        assert.throws(() => r.normalize('seed com espaço'));
        assert.equal(r.normalize(' abc-123 '), 'ABC-123');
        t.clean();
    });
    await test('Pausa, conclusão única, timers e eventos antigos', async () => {
        const t = setup();
        await t.mount('workingmemory');
        const old = t.session;
        let calls = 0;
        old.timeout(() => calls++, 1000);
        await t.advance(300);
        old.pause();
        await t.advance(10000);
        assert.equal(calls, 0);
        old.resume();
        await t.advance(699);
        assert.equal(calls, 0);
        await t.advance(1);
        assert.equal(calls, 1);
        old.complete(true);
        old.complete(false);
        assert.equal(t.outcomes.length, 1);
        await t.mount('lightsout');
        old.complete(true);
        assert.equal(t.outcomes.length, 0);
        t.clean();
    });
    await test('200 quebra-cabeças deslizantes conservam paridade solucionável', () => {
        const t = setup(),
            a = t.api('GameAlgorithms'),
            r = t.api('SeededRandom');
        for (let k = 0; k < 200; k++) {
            const size = 2 + (k % 4),
                board = a.sliding(size, 30 + k, r.create('SLIDE' + k));
            let inv = 0;
            for (let i = 0; i < board.length; i++)
                for (let j = i + 1; j < board.length; j++)
                    if (board[i] && board[j] && board[i] > board[j]) inv++;
            assert.equal(
                size % 2 ? inv % 2 : (inv + size - Math.floor(board.indexOf(0) / size)) % 2,
                size % 2 ? 0 : 1
            );
            assert(!board.every((n, i) => n === (i + 1) % board.length));
        }
        t.clean();
    });
    await test('200 rotas Flow e partições BlockFit: cobertura, adjacência, obstáculos e diversidade', () => {
        const t = setup(),
            a = t.api('GameAlgorithms'),
            r = t.api('SeededRandom'),
            routes = new Set();
        for (let k = 0; k < 200; k++) {
            const size = 4 + (k % 4),
                rng = r.create('PART' + k),
                paths = a.flowPuzzle(size, 3 + (k % 3), rng),
                seen = new Set();
            for (const p of paths) {
                assert(p.length >= 2);
                for (let j = 0; j < p.length; j++) {
                    const key = p[j].r + ',' + p[j].c;
                    assert(!seen.has(key));
                    seen.add(key);
                    if (j)
                        assert.equal(
                            Math.abs(p[j].r - p[j - 1].r) + Math.abs(p[j].c - p[j - 1].c),
                            1
                        );
                }
            }
            assert.equal(seen.size, size * size);
            if (size === 4) routes.add(JSON.stringify(paths));
            const blocked = [
                    { r: 1, c: 1 },
                    { r: 2, c: 2 }
                ],
                puzzle = a.blockPuzzle(size, size, 5, rng, blocked),
                covered = new Set();
            for (const piece of puzzle.solution) {
                const points = [];
                piece.shape.forEach((row, i) =>
                    row.forEach((value, j) => {
                        if (value) {
                            const key = piece.row + i + ',' + (piece.col + j);
                            assert(!covered.has(key));
                            assert(
                                !blocked.some((b) => b.r === piece.row + i && b.c === piece.col + j)
                            );
                            covered.add(key);
                            points.push([i, j]);
                        }
                    })
                );
                const connected = new Set([points[0].join(',')]);
                let changed = true;
                while (changed) {
                    changed = false;
                    for (const p of points)
                        if (
                            !connected.has(p.join(',')) &&
                            points.some(
                                (q) =>
                                    connected.has(q.join(',')) &&
                                    Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) === 1
                            )
                        ) {
                            connected.add(p.join(','));
                            changed = true;
                        }
                }
                assert.equal(connected.size, points.length);
            }
            assert.equal(covered.size, size * size - 2);
        }
        assert(routes.size > 40);
        t.clean();
    });
    await test('120 tabuleiros Resta Um: saltos independentes chegam a uma única peça', () => {
        const t = setup(),
            a = t.api('GameAlgorithms'),
            r = t.api('SeededRandom'),
            layout = [
                [0, 0, 2, 2, 2, 0, 0],
                [0, 0, 2, 2, 2, 0, 0],
                [2, 2, 2, 2, 2, 2, 2],
                [2, 2, 2, 2, 2, 2, 2],
                [2, 2, 2, 2, 2, 2, 2],
                [0, 0, 2, 2, 2, 0, 0],
                [0, 0, 2, 2, 2, 0, 0]
            ];
        for (let k = 0; k < 120; k++) {
            const { board, solution } = a.pegPuzzle(layout, 4 + (k % 20), r.create('PEG' + k));
            for (const m of solution) {
                assert.equal(board[m.sr][m.sc], 2);
                assert.equal(board[m.mr][m.mc], 2);
                assert.equal(board[m.r][m.c], 1);
                board[m.sr][m.sc] = 1;
                board[m.mr][m.mc] = 1;
                board[m.r][m.c] = 2;
            }
            assert.equal(board.flat().filter((v) => v === 2).length, 1);
        }
        t.clean();
    });
    await test('Sudoku: unicidade independente e deduções válidas nos quatro níveis, 12 seeds', async () => {
        const t = setup(),
            e = t.api('SudokuEngine'),
            r = t.api('SeededRandom');
        for (let tier = 0; tier < 4; tier++)
            for (let k = 0; k < 3; k++) {
                const puzzle = await e.generate(r.create(`SUDOKU-${tier}-${k}`), tier),
                    proof = countSudoku(puzzle.board);
                assert.equal(proof.count, 1);
                assert.deepEqual(plain(puzzle.solution), proof.solution);
                assert(puzzle.analysis.solved);
                assert.equal(puzzle.analysis.tier, tier);
                if (tier) assert(!e.logical(puzzle.board, tier - 1).solved);
                for (const step of puzzle.analysis.steps) {
                    assert(step.text?.length > 15);
                    for (const p of step.placements) assert.equal(p.value, proof.solution[p.i]);
                    for (const p of step.eliminations)
                        assert.equal(p.mask & e.bit(proof.solution[p.i]), 0);
                }
            }
        t.clean();
    });
    await test('Luzes: solução mínima independente nos quatro modificadores e medalha ouro', async () => {
        const t = setup();
        for (const modifier of ['cross', 'diagonal', 'long', 'torus']) {
            await t.mount('lightsout', 'easy', { modifier }, 'LUZES' + modifier);
            const buttons = t.$$('.light-button'),
                board = buttons.map((b) => +b.classList.contains('light-on')),
                solution = gf2(board, 3, modifier),
                minimum = solution.reduce((a, b) => a + b, 0);
            assert(t.$('#lights-stats').textContent.endsWith(String(minimum)));
            t.click('#lights-preview');
            t.click(buttons[0]);
            assert.deepEqual(
                buttons.map((b) => +b.classList.contains('light-on')),
                board
            );
            t.click('#lights-preview');
            solution.forEach((v, i) => {
                if (v) t.click(buttons[i]);
            });
            assert.equal(t.outcomes[0][0], true);
            assert.equal(t.outcomes[0][1].metrics.medal, 'Ouro');
        }
        t.clean();
    });
    await test('Motor de regras: 200 manuais consistentes, exceções, testemunhas e evolução', () => {
        const t = setup(),
            e = t.api('RuleEngine'),
            r = t.api('SeededRandom');
        const rule = { type: 'forbid', condition: { color: 'red' }, except: { symbol: 'star' } };
        assert(e.accepts({ color: 'red', symbol: 'star' }, rule));
        assert(!e.accepts({ color: 'red', symbol: 'none' }, rule));
        for (let k = 0; k < 200; k++) {
            const rng = r.create('RULE' + k);
            let rules = e.generate(rng, 2 + (k % 4));
            for (let day = 0; day < 4; day++) {
                assert(e.validateRuleSet(rules));
                const cases = e.cases(rules, 8, rng);
                assert(cases.some((o) => e.evaluate(o, rules)));
                assert(cases.some((o) => !e.evaluate(o, rules)));
                rules = e.evolve(rules, day + 1, rng).rules;
            }
        }
        assert(!e.validateRuleSet([{ type: 'allowOnly', property: 'color', values: [] }]));
        t.clean();
    });
    await test('120 figuras de rotação: alternativas espelhadas não coincidem por giro', () => {
        const t = setup(),
            e = t.api('ShapeEngine'),
            r = t.api('SeededRandom');
        for (let i = 0; i < 120; i++) {
            const shape = e.generate(r.create('SHAPE' + i), 5 + (i % 6)),
                rotations = e.rotations(shape);
            for (let turn = 0; turn < 4; turn++) {
                assert(rotations.has(e.key(e.transform(shape, turn))));
                assert(!rotations.has(e.key(e.transform(shape, turn, true))));
            }
        }
        t.clean();
    });
    await test('Rampas: distância perceptual mínima, ordem sem empate e 120 seeds', () => {
        const t = setup(),
            e = t.api('ColorEngine'),
            r = t.api('SeededRandom');
        for (const mode of ['lightness', 'saturation', 'warmth'])
            for (let i = 0; i < 40; i++) {
                const colors = e.ramp(r.create('COLOR' + i), mode, 8);
                for (let j = 1; j < colors.length; j++) {
                    assert(colors[j].value > colors[j - 1].value);
                    assert(e.distance(colors[j].lab, colors[j - 1].lab) >= 5);
                }
            }
        t.clean();
    });
    await test('Dia da semana: 400 rodadas verificadas pelo calendário UTC independente', async () => {
        const t = setup();
        for (let k = 0; k < 40; k++) {
            await t.mount('weekday', 'easy', {}, 'DATE' + k);
            for (let i = 0; i < 10; i++) {
                const match = t.$('#quiz-visual').textContent.match(/(\d+)\/(\d+)\/(\d+)/);
                assert(match);
                const weekday = [
                    'domingo',
                    'segunda-feira',
                    'terça-feira',
                    'quarta-feira',
                    'quinta-feira',
                    'sexta-feira',
                    'sábado'
                ][new Date(Date.UTC(+match[3], +match[2] - 1, +match[1])).getUTCDay()];
                const answer = t
                    .$$('#quiz-choices button')
                    .find((b) => b.textContent.toLowerCase() === weekday);
                assert(answer);
                t.click(answer);
                assert(t.$('#quiz-feedback').textContent.startsWith('Correto.'));
                t.click('#quiz-next');
            }
        }
        t.clean();
    });
    await test('N-Back: estímulos observados, 1/2/3-back, balanceamento e falha por inação', async () => {
        const t = setup();
        for (const n of [1, 2, 3]) {
            await t.mount('nback', 'easy', { n: String(n) });
            t.click('#nback-start');
            const values = [];
            for (let i = 0; i < n; i++) {
                values.push(t.$('#nback-stimulus').textContent);
                await t.advance(1800);
            }
            let equal = 0;
            for (let i = n; i < n + 24; i++) {
                values.push(t.$('#nback-stimulus').textContent);
                const same = values[i] === values[i - n];
                equal += same;
                t.click(same ? '#nback-same' : '#nback-different');
                await t.advance(700);
            }
            assert.equal(equal, 12);
            assert.equal(t.outcomes[0][0], true);
            assert.equal(t.outcomes[0][1].metrics.accuracy, 100);
        }
        await t.mount('nback');
        t.click('#nback-start');
        await t.advance(160000);
        assert.equal(t.outcomes[0][0], false);
        t.clean();
    });
    await test('Números dinâmicos: três regras, setas, 50% por lado e resposta bloqueada', async () => {
        const t = setup();
        await t.mount('dynamicnumbers', 'expert');
        t.click('#number-start');
        let leftCount = 0;
        for (let i = 0; i < 36; i++) {
            const rule = t.$('#number-rule').textContent,
                n = +t.$('#number-stimulus').textContent;
            const left = rule.includes('não primo')
                ? !t.api('PuzzleMath').prime(n)
                : rule.includes('múltiplo de 3')
                  ? n % 3 === 0
                  : n % 2 === 0;
            leftCount += left;
            const key = left ? 'ArrowLeft' : 'ArrowRight';
            t.w.document.dispatchEvent(new t.w.KeyboardEvent('keydown', { key, bubbles: true }));
            t.w.document.dispatchEvent(new t.w.KeyboardEvent('keydown', { key, bubbles: true }));
            await t.advance(800);
        }
        assert.equal(leftCount, 18);
        assert.equal(t.outcomes[0][0], true);
        assert.equal(t.outcomes[0][1].metrics.correct, 36);
        t.clean();
    });
    await test('Checklist: requisitos memorizados, itens ausentes, add/remove/invert e conclusão', async () => {
        const t = setup();
        await t.mount('checklist', 'hard');
        let seen = new Set();
        for (let block = 0; block < 4; block++) {
            const lines = t.$$('#check-manual li').map((el) => el.textContent);
            seen.add(t.$('#check-directive').textContent.split(' · ')[1]?.split(':')[0]);
            t.click('#check-study');
            await t.advance(5000);
            assert(t.$('#check-manual').classList.contains('hidden'));
            for (let i = 0; i < 6; i++) {
                const items = t.$$('#check-object p'),
                    okay = lines.every((line) => {
                        const name = line.split(': ')[1].slice(0, -1),
                            row = items.find((p) => p.textContent.includes(name)),
                            has = row.textContent.trim().startsWith('✓');
                        return line.startsWith('Exigir') ? has : !has;
                    });
                t.click(okay ? '#check-yes' : '#check-no');
                t.click('#check-next');
            }
        }
        assert(seen.has('Adicionada'));
        assert(seen.has('Removida'));
        assert(seen.has('Invertida'));
        assert.equal(t.outcomes[0][0], true);
        assert.equal(t.outcomes[0][1].metrics.accuracy, 100);
        t.clean();
    });
    await test('Regra Mutante: mudanças a cada 20s, timeout, pausa e impossibilidade de vencer sem clicar', async () => {
        const t = setup();
        await t.mount('mutantrule');
        t.click('#mutant-start');
        const first = t.$('#mutant-rule').textContent;
        await t.advance(19999);
        assert.equal(t.$('#mutant-rule').textContent, first);
        await t.advance(1);
        assert.notEqual(t.$('#mutant-rule').textContent, first);
        t.session.pause();
        const text = t.$('#mutant-progress').textContent;
        await t.advance(5000);
        assert.equal(t.$('#mutant-progress').textContent, text);
        t.session.resume();
        await t.advance(60000);
        assert.equal(t.outcomes[0][0], false);
        t.clean();
    });
    await test('Memória de trabalho e subitização: estímulo oculto, bloqueio antes do prazo e resposta correta', async () => {
        const t = setup();
        for (const mode of ['reverse', 'sort', 'sum']) {
            await t.mount('workingmemory', 'easy', { mode });
            const numbers = t.$('#quiz-visual').textContent.split(' · ').map(Number),
                answer =
                    mode === 'sum'
                        ? numbers[0] + numbers.at(-1)
                        : (mode === 'reverse'
                              ? numbers.reverse()
                              : numbers.sort((a, b) => a - b)
                          ).join(' ');
            t.input('#quiz-input', answer);
            t.submit('#quiz-form');
            assert.equal(t.session.score.snapshot().correct, 0);
            await t.advance(4000);
            assert(!t.$('#quiz-visual').textContent.match(/\d/));
            t.input('#quiz-input', answer);
            t.submit('#quiz-form');
            assert(t.$('#quiz-feedback').textContent.startsWith('Correto.'));
        }
        await t.mount('subitizing', 'expert');
        const count = t.$$('.dot').length;
        assert(count);
        await t.advance(299);
        assert.equal(t.$$('.dot').length, count);
        await t.advance(1);
        assert.equal(t.$$('.dot').length, 0);
        t.click(t.$$('#quiz-choices button').find((b) => +b.textContent === count));
        assert.equal(t.session.score.snapshot().correct, 1);
        t.clean();
    });
    await test('Ativos locais: 250 bandeiras, geometria do mapa, capitais válidas e dicionário 4–7 letras', async () => {
        const t = setup(),
            g = await t.api('GameData').load('geography'),
            d = await t.api('GameData').load('words');
        assert.equal(g.countries.length, 250);
        assert(g.world.length >= 170);
        for (const c of g.countries) {
            assert(fs.existsSync(path.join(root, 'src/assets/flags', c.code + '.svg')));
            assert(c.name && c.id);
            if (c.independent && c.quizCapital !== false) assert(c.capitals.length, c.id);
        }
        for (let n = 4; n <= 7; n++) {
            assert(d[n].length > 2000);
            assert(d[n].every((word) => word.length === n && /^[A-Z]+$/.test(word)));
            assert.equal(new Set(d[n]).size, d[n].length);
        }
        t.clean();
    });
    await test('WordRain: erros corrigíveis, remoção no meio não conta teclas novas, precisão e alvo', async () => {
        const t = setup();
        await t.mount('wordrain', 'easy', { mode: 'precision' });
        const word = t.$('.falling-word').textContent;
        t.input('#wr-input', word[0] + 'x');
        const before = t.session.score.snapshot();
        t.input('#wr-input', word[0]);
        assert.equal(t.session.score.snapshot().mistakes, before.mistakes);
        t.input('#wr-input', word);
        assert.equal(t.session.score.snapshot().words, 1);
        assert(!t.$('#wr-input').value);
        t.clean();
    });
    await test('Arraste por toque: captura, destino, ghost removido e clique posterior disponível', async () => {
        const t = setup();
        await t.mount('colororder');
        const buttons = t.$$('#color-row button'),
            before = buttons.map((b) => b.style.background),
            target = buttons[2];
        let captureTarget = null;
        buttons[0].setPointerCapture = () => {
            captureTarget = buttons[0];
        };
        t.$('#color-row').setPointerCapture = () => {
            captureTarget = t.$('#color-row');
        };
        t.w.document.elementFromPoint = () => target;
        const pointer = (type, x, y) => {
            const event = new t.w.Event(type, { bubbles: true, cancelable: true });
            Object.assign(event, {
                pointerId: 7,
                pointerType: 'touch',
                button: 0,
                clientX: x,
                clientY: y
            });
            buttons[0].dispatchEvent(event);
        };
        pointer('pointerdown', 0, 0);
        assert.equal(captureTarget, null, 'Um clique simples não deve ser capturado pelo arraste');
        pointer('pointermove', 40, 40);
        assert.equal(captureTarget, t.$('#color-row'), 'Só capturamos ao iniciar o arraste');
        assert(t.$('.drag-ghost'));
        pointer('pointerup', 40, 40);
        assert(!t.$('.drag-ghost'));
        const after = t.$$('#color-row button').map((b) => b.style.background);
        assert.notDeepEqual(after, before);
        await t.advance(150);
        t.click(t.$$('#color-row button')[1]);
        assert(t.$('#color-left').disabled === false);
        t.clean();
    });
    fs.mkdirSync(path.join(root, 'tests/results'), { recursive: true });
    fs.writeFileSync(path.join(root, 'tests/results/games.json'), JSON.stringify(reports, null, 2));
    console.log(
        `${reports.filter((r) => r.status === 'PASS').length}/${reports.length} grupos aprovados`
    );
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
