const { setup, assert, fs, path, root } = require('./harness.cjs');
const reports = [],
    tiers = ['easy', 'medium', 'hard', 'expert'];
const plain = (v) => JSON.parse(JSON.stringify(v));
async function test(name, fn) {
    try {
        await fn();
        reports.push({ name, status: 'PASS' });
        console.log('PASS ' + name);
    } catch (error) {
        reports.push({ name, status: 'FAIL', error: error.stack });
        console.error('FAIL ' + name + '\n' + error.stack);
    }
}
const normalize = (value) =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
function runs(line) {
    return (
        line
            .join('')
            .split('0')
            .filter(Boolean)
            .map((s) => s.length)
            .join(',') || '0'
    );
}
// Contagem independente: enumera linhas por força bruta, filtra prefixos de colunas e conta grades.
function countNonograms(board) {
    const n = board.length,
        rowHints = board.map(runs),
        columns = Array.from({ length: n }, (_, x) => board.map((r) => r[x])),
        colHints = columns.map(runs);
    const possibilities = Array.from({ length: 1 << n }, (_, mask) =>
        Array.from({ length: n }, (_, x) => (mask >> x) & 1)
    );
    const rowPatterns = rowHints.map((hint) => possibilities.filter((row) => runs(row) === hint));
    const colPatterns = colHints.map((hint) => possibilities.filter((col) => runs(col) === hint));
    let count = 0;
    const chosen = [];
    function visit(y) {
        if (count >= 2) return;
        if (y === n) {
            count++;
            return;
        }
        for (const row of rowPatterns[y]) {
            chosen.push(row);
            if (
                colPatterns.every((pool, x) =>
                    pool.some((col) => chosen.every((r, i) => r[x] === col[i]))
                )
            )
                visit(y + 1);
            chosen.pop();
        }
    }
    visit(0);
    return count;
}
function visibleGroups(t, data) {
    const words = t.$$('#connections-board [data-word]').map((b) => b.dataset.word);
    return data.groups
        .map((group) => ({ ...group, words: group.words.filter((word) => words.includes(word)) }))
        .filter((group) => group.words.length === 4);
}
function chooseWords(t, words) {
    for (const word of words)
        t.click(t.$$('#connections-board [data-word]').find((b) => b.dataset.word === word));
}
async function run() {
    await test('Biblioteca: busca sem acentos, novidades, favoritos, categorias e persistência', async () => {
        const t = setup({ app: true });
        t.startApp();
        assert.equal(t.$$('.game-card').length, 43);
        t.input('#game-search', 'conexoes');
        assert.equal(t.$$('.game-card').length, 1);
        t.click('[aria-label="Favoritar Conexões"]');
        assert.deepEqual(plain(t.api('Progress').library().favorites), ['connections']);
        assert(!t.$('#game-main-menu').classList.contains('hidden'));
        t.input('#game-search', '');
        t.click('[data-filter="new"]');
        assert.equal(t.$$('.game-card').length, 3);
        t.click('[data-filter="favorites"]');
        assert.equal(t.$$('.game-card').length, 1);
        t.click('[aria-label="Favoritar Conexões"]');
        assert.equal(t.$$('.game-card').length, 0);
        assert(!t.$('#library-empty').classList.contains('hidden'));
        t.click('#clear-library-filters');
        assert.equal(t.$$('.game-card').length, 43);
        const extra = t.$$('#category-tabs button').find((b) => b.dataset.category === 'Extras');
        t.click(extra);
        assert.equal(t.$$('.game-card').length, 1);
        assert.equal(t.w.document.activeElement.dataset.category, 'Extras');
        const saved = t.w.localStorage.getItem('desafio-logico-total:progress');
        t.clean();
        const second = setup({ storage: saved });
        assert.equal(second.api('Progress').library().favorites.length, 0);
        second.clean();
    });
    await test('Configuração: parâmetros explícitos em todos os jogos; preferências e pausa por Escape', async () => {
        const t = setup({ app: true });
        t.startApp();
        for (const game of t.config)
            for (const tier of tiers) {
                const text = t.api('GameLibrary').difficulty(game, tier, t.defaults(game.id));
                assert(!/undefined|NaN|O nível altera/.test(text), game.id + ': ' + text);
            }
        t.click(
            t.$$('.game-card').find((c) => c.querySelector('strong').textContent === 'Quem Sou Eu?')
        );
        t.$('#difficulty-select').value = 'expert';
        t.$('#difficulty-select').dispatchEvent(new t.w.Event('change', { bubbles: true }));
        const theme = t.$('#game-options select');
        theme.value = 'tech';
        t.input('#seed-input', 'ARCADE-CONFIG');
        t.click('#start-practice-game-btn');
        await t.advance(30);
        assert(t.$('#identity-form'));
        assert.equal(t.api('Progress').library().recent[0], 'identity');
        t.w.document.dispatchEvent(
            new t.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
        );
        assert(!t.$('#pause-notice').classList.contains('hidden'));
        t.w.document.dispatchEvent(
            new t.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
        );
        assert(t.$('#pause-notice').classList.contains('hidden'));
        t.click('#quit-current-game');
        t.click(
            t.$$('.game-card').find((c) => c.querySelector('strong').textContent === 'Quem Sou Eu?')
        );
        assert.equal(t.$('#difficulty-select').value, 'expert');
        assert.equal(t.$('#game-options select').value, 'tech');
        assert.equal(t.$('#seed-input').value, '');
        t.click('#back-to-main-menu');
        t.click(
            t
                .$$('.game-card')
                .find((c) => c.querySelector('strong').textContent === 'Trilha da Memória')
        );
        t.$('#difficulty-select').value = 'expert';
        t.click('#start-practice-game-btn');
        await t.flush();
        assert.equal(
            t.api('Progress').library().setups.memorypath.difficulty,
            'expert',
            'Preferências são guardadas antes de acabar a apresentação'
        );
        t.click('#quit-current-game');
        t.clean();
    });
    await test('Bancos editoriais: IDs únicos, datas sem empate, pistas completas e termos distintos', async () => {
        const t = setup(),
            data = await t.api('GameData').load('learning');
        assert(
            data.events.length >= 40 && data.identities.length >= 30 && data.groups.length >= 30
        );
        for (const pool of [data.events, data.identities, data.groups])
            assert.equal(new Set(pool.map((i) => i.id)).size, pool.length);
        assert.equal(new Set(data.events.map((i) => i.year)).size, data.events.length);
        assert(
            data.events.every(
                (i) => Number.isInteger(i.year) && i.label && i.source.startsWith('https://')
            )
        );
        assert(
            data.identities.every(
                (i) =>
                    i.clues.length === 4 &&
                    i.clues.every(Boolean) &&
                    i.name &&
                    Array.isArray(i.aliases)
            )
        );
        assert.equal(
            new Set(data.identities.map((i) => i.clues.join('|'))).size,
            data.identities.length
        );
        for (const group of data.groups) {
            assert(group.words.length >= 4);
            assert.equal(new Set(group.words.map(normalize)).size, group.words.length);
        }
        t.clean();
    });
    await test('Linha do Tempo: 800 gerações sem empate, início desordenado, janela coerente e variedade', async () => {
        const t = setup(),
            data = await t.api('GameData').load('learning'),
            engine = t.api('LearningEngine'),
            random = t.api('SeededRandom');
        for (let tier = 0; tier < 4; tier++) {
            const signatures = new Set();
            for (let seed = 0; seed < 200; seed++) {
                const puzzle = engine.timeline(
                    random.create('TIMELINE-' + seed),
                    data.events,
                    tier
                );
                assert.equal(puzzle.order.length, [4, 5, 6, 7][tier]);
                assert.equal(new Set(puzzle.order.map((i) => i.year)).size, puzzle.order.length);
                assert(puzzle.sorted.every((e, i) => !i || puzzle.sorted[i - 1].year < e.year));
                assert(puzzle.order.some((e, i) => e.id !== puzzle.sorted[i].id));
                assert(puzzle.span <= [Infinity, 45, 28, 18][tier]);
                signatures.add(puzzle.order.map((i) => i.id).join('|'));
            }
            assert(signatures.size > 190);
        }
        const first = engine.timeline(random.create('T-FIRST'), data.events, 0);
        const next = engine.timeline(
            random.create('T-NEXT'),
            data.events,
            0,
            first.order.map((e) => e.id)
        );
        assert(next.order.every((e) => !first.order.some((i) => i.id === e.id)));
        t.clean();
    });
    await test('Linha do Tempo: partidas completas nos quatro níveis, movimentos e revisão de erro', async () => {
        const t = setup(),
            data = await t.api('GameData').load('learning');
        for (const tier of tiers) {
            await t.mount('timeline', tier, {}, 'TIMELINE-PLAY');
            for (let round = 0; round < 5; round++) {
                const eventFor = (b) =>
                    data.events.find((e) => b.children[1].textContent === e.label);
                assert(t.$$('.timeline-position').every((b) => b.textContent.length === 2));
                const sorted = t
                    .$$('.timeline-item')
                    .map(eventFor)
                    .sort((a, b) => a.year - b.year);
                for (let at = 0; at < sorted.length; at++) {
                    let index = t
                        .$$('.timeline-item')
                        .findIndex((b) => eventFor(b).id === sorted[at].id);
                    t.click(t.$$('.timeline-item')[index]);
                    while (index-- > at) t.click('#timeline-up');
                }
                t.click('#timeline-check');
                assert(t.$('#timeline-feedback').textContent.includes('Ordem correta'));
                assert(t.$$('.timeline-item').every((b) => b.disabled));
                assert(t.$('#timeline-feedback a'));
                t.click('#timeline-next');
            }
            assert.equal(t.outcomes.length, 1);
            assert.equal(t.outcomes[0][0], true);
            assert.equal(t.session.score.snapshot().correct, 5);
        }
        await t.mount('timeline');
        t.click('#timeline-check');
        assert(t.$('#timeline-feedback').textContent.includes('ordem correta'));
        assert(t.$$('.timeline-position').every((b) => b.textContent.length === 4));
        t.clean();
    });
    await test('Quem Sou Eu: 128 identidades jogadas, quatro temas, aliases, pistas, erro e revelação', async () => {
        const t = setup(),
            data = await t.api('GameData').load('learning');
        for (const tier of tiers)
            for (const theme of ['all', 'space', 'math', 'tech']) {
                await t.mount('identity', tier, { theme }, 'IDENTITY-' + tier + '-' + theme);
                const seen = new Set();
                for (let round = 0; round < 8; round++) {
                    const initial = t.$$('#identity-clues li').length;
                    assert.equal(initial, [3, 2, 1, 1][tiers.indexOf(tier)]);
                    const old = t.$('#identity-value').textContent;
                    if (initial < 4) {
                        t.click('#identity-hint');
                        assert.notEqual(t.$('#identity-value').textContent, old);
                    }
                    while (!t.$('#identity-hint').disabled) t.click('#identity-hint');
                    const clues = t.$$('#identity-clues li').map((li) => li.lastChild.textContent);
                    const item = data.identities.find((i) =>
                        i.clues.every((c, index) => c === clues[index])
                    );
                    assert(item);
                    assert(theme === 'all' || item.theme === theme);
                    assert(!seen.has(item.id));
                    seen.add(item.id);
                    t.input('#identity-input', normalize(item.aliases[0] || item.name));
                    t.submit('#identity-form');
                    assert(t.$('#identity-feedback').textContent.includes('Correto'));
                    t.click('#identity-next');
                }
                assert.equal(t.outcomes[0][0], true);
                assert.equal(t.session.score.snapshot().correct, 8);
            }
        await t.mount('identity', 'expert');
        t.input('#identity-input', 'não sei');
        t.submit('#identity-form');
        const mistakes = t.session.score.snapshot().mistakes;
        t.submit('#identity-form');
        assert.equal(t.session.score.snapshot().mistakes, mistakes);
        assert.equal(t.$('#identity-input').getAttribute('aria-invalid'), 'true');
        t.input('#identity-input', 'outra');
        assert(!t.$('#identity-input').hasAttribute('aria-invalid'));
        t.click('#identity-reveal');
        assert.equal(t.$$('#identity-clues li').length, 4);
        assert(t.$('#identity-hint').disabled);
        t.click('#identity-next');
        const beforeLimit = t.session.score.snapshot().mistakes;
        t.input('#identity-input', 'erro alfa');
        t.submit('#identity-form');
        assert(!t.$('#identity-form button').disabled);
        t.input('#identity-input', 'erro beta');
        t.submit('#identity-form');
        assert(t.$('#identity-form button').disabled);
        assert.equal(t.$$('#identity-clues li').length, 4);
        assert.equal(
            t.session.score.snapshot().mistakes,
            beforeLimit + 2,
            'O limite não duplica o último erro'
        );
        t.clean();
    });
    await test('Conexões: 1000 tabuleiros com 16 termos e quatro relações editoriais distintas', async () => {
        const t = setup(),
            data = await t.api('GameData').load('learning'),
            engine = t.api('LearningEngine'),
            random = t.api('SeededRandom');
        const signatures = new Set();
        for (let seed = 0; seed < 1000; seed++) {
            const puzzle = engine.connections(random.create('CONNECTIONS-' + seed), data.groups);
            assert.equal(new Set(puzzle.words.map(normalize)).size, 16);
            assert.equal(new Set(puzzle.groups.map((g) => g.id)).size, 4);
            const set = new Set(puzzle.words);
            const recognized = data.groups.filter(
                (g) => g.words.filter((w) => set.has(w)).length >= 4
            );
            assert.equal(recognized.length, 4);
            for (const group of puzzle.groups)
                for (const word of group.words) {
                    for (const other of puzzle.groups.filter(
                        (candidate) => candidate.id !== group.id
                    )) {
                        const bank = data.groups.find((candidate) => candidate.id === other.id);
                        assert(
                            !bank.words.some(
                                (candidate) => normalize(candidate) === normalize(word)
                            ),
                            `Termo ambíguo entre categorias: ${word}`
                        );
                    }
                }
            assert(
                puzzle.groups.every((g) => g.words.length === 4 && g.words.every((w) => set.has(w)))
            );
            signatures.add(puzzle.words.join('|'));
        }
        assert.equal(signatures.size, 1000);
        t.clean();
    });
    await test('Conexões: vitória, seleção limitada, embaralhar sem perder seleção, erros únicos e derrota', async () => {
        const t = setup(),
            data = await t.api('GameData').load('learning');
        for (const tier of tiers) {
            await t.mount('connections', tier, {}, 'CONNECTIONS-PLAY');
            assert.equal(Boolean(t.$('#connections-hint').textContent), tier === 'easy');
            for (const group of visibleGroups(t, data)) {
                chooseWords(t, group.words);
                const selected = t
                    .$$('#connections-board [aria-pressed="true"]')
                    .map((b) => b.dataset.word)
                    .sort();
                const fifth = t.$$('#connections-board [aria-pressed="false"]')[0];
                if (fifth) t.click(fifth);
                assert.equal(t.$$('#connections-board [aria-pressed="true"]').length, 4);
                t.click('#connections-shuffle');
                assert.deepEqual(
                    t
                        .$$('#connections-board [aria-pressed="true"]')
                        .map((b) => b.dataset.word)
                        .sort(),
                    selected
                );
                t.click('#connections-check');
            }
            assert.equal(t.$$('.connection-group').length, 4);
            assert.equal(t.outcomes.length, 0);
            t.click('#connections-finish');
            assert.equal(t.outcomes[0][0], true);
        }
        await t.mount('connections', 'expert', {}, 'CONNECTIONS-ERRORS');
        const groups = visibleGroups(t, data);
        chooseWords(t, [...groups[0].words.slice(0, 3), groups[1].words[0]]);
        t.click('#connections-check');
        assert(t.$('#connections-feedback').textContent.includes('Quase'));
        assert(t.$('#connections-lives').textContent.startsWith('1 '));
        t.click('#connections-check');
        assert(t.$('#connections-lives').textContent.startsWith('1 '));
        t.click('#connections-clear');
        chooseWords(t, [
            groups[0].words[0],
            groups[1].words[0],
            groups[2].words[0],
            groups[3].words[0]
        ]);
        t.click('#connections-check');
        assert(!t.$('#connections-review').classList.contains('hidden'));
        assert(t.$$('#connections-board button').every((b) => b.disabled));
        t.click('#connections-finish');
        assert.equal(t.outcomes[0][0], false);
        t.clean();
    });
    await test('Nonograma: unicidade independente em 80 grades; solver detecta ambiguidade, limite e fallback', async () => {
        const t = setup(),
            engine = t.api('NonogramEngine'),
            random = t.api('SeededRandom');
        for (const [size, density] of [
            [5, 0.4],
            [6, 0.45],
            [8, 0.5],
            [10, 0.55]
        ])
            for (let seed = 0; seed < 20; seed++) {
                const result = engine.generate(
                    size,
                    density,
                    random.create('NONOGRAM-AUDIT-' + seed),
                    size === 5
                );
                assert.equal(countNonograms(plain(result.board)), 1);
                if (size === 5) assert(result.logical);
            }
        const ambiguous = engine.solve([[1], [1]], [[1], [1]]);
        assert.equal(ambiguous.count, 2);
        assert(!ambiguous.logical);
        assert(engine.solve([[1], [1]], [[1], [1]], 2, 0).aborted);
        const fallback = engine.generate(5, 0.4, { float: () => 0, int: (min, max) => max }, true);
        assert(fallback.fallback);
        assert(fallback.board.flat().some((b) => !b));
        assert.equal(countNonograms(plain(fallback.board)), 1);
        t.clean();
    });
    await test('Deslizante fácil: nove posições distintas, alcançáveis e a pelo menos dois movimentos da solução', () => {
        const t = setup(),
            engine = t.api('GameAlgorithms'),
            random = t.api('SeededRandom');
        const queue = [{ board: [1, 2, 3, 0], depth: 0 }],
            depths = new Map();
        while (queue.length) {
            const { board, depth } = queue.shift(),
                key = board.join(',');
            if (depths.has(key)) continue;
            depths.set(key, depth);
            const empty = board.indexOf(0),
                x = empty % 2,
                y = Math.floor(empty / 2);
            for (let i = 0; i < 4; i++)
                if (Math.abs((i % 2) - x) + Math.abs(Math.floor(i / 2) - y) === 1) {
                    const next = [...board];
                    [next[i], next[empty]] = [next[empty], next[i]];
                    queue.push({ board: next, depth: depth + 1 });
                }
        }
        assert.equal(depths.size, 12);
        const seen = new Set();
        for (let seed = 0; seed < 200; seed++) {
            const key = engine.sliding(2, 12, random.create('SLIDE-AUDIT-' + seed)).join(',');
            assert(depths.get(key) >= 2);
            seen.add(key);
        }
        assert.equal(seen.size, 9);
        t.clean();
    });
    await test('Maior ou Menor: relações balanceadas sem posições fixas em 120 desafios completos', async () => {
        const t = setup();
        const equalityPositions = Array(10).fill(0);
        for (const tier of tiers)
            for (let seed = 0; seed < 30; seed++) {
                await t.mount('compare', tier, {}, 'COMPARE-AUDIT-' + seed);
                let index = 0;
                const counts = { '<': 0, '=': 0, '>': 0 };
                while (!t.outcomes.length) {
                    const pair = t.$('#quiz-visual .expression-pair'),
                        parts = [...pair.childNodes]
                            .filter((n) => n.nodeType === 3 && n.textContent.trim())
                            .map((n) => n.textContent.trim());
                    const calculate = (text) =>
                        Function(
                            'return (' +
                                text.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-') +
                                ')'
                        )();
                    const left = calculate(parts[0]),
                        right = calculate(parts[1]),
                        answer = left === right ? '=' : left > right ? '>' : '<';
                    counts[answer]++;
                    if (tier === 'easy' && answer === '=') equalityPositions[index]++;
                    t.click(t.$$('#quiz-choices button').find((b) => b.dataset.answer === answer));
                    t.click('#quiz-next');
                    index++;
                }
                assert.equal(t.session.score.snapshot().accuracy, 100);
                assert(
                    Math.max(...Object.values(counts)) - Math.min(...Object.values(counts)) <= 1
                );
            }
        assert(equalityPositions.every((count) => count > 0 && count < 30));
        t.clean();
    });
    await test('Mapa: arrastar bloqueia apenas o clique imediato; clique posterior e teclado continuam válidos', async () => {
        const t = setup();
        await t.mount('worldmap', 'easy', { mode: 'locate', response: 'choices' });
        const svg = t.$('#world-svg');
        svg.getBoundingClientRect = () => ({ width: 720, height: 360, left: 0, top: 0 });
        const pointer = (type, x) => {
            const event = new t.w.MouseEvent(type, { bubbles: true, clientX: x, clientY: 30 });
            Object.defineProperty(event, 'pointerId', { value: 7 });
            svg.dispatchEvent(event);
        };
        const country = t.$$('#map-land [data-code]')[0] || t.$('#map-land path');
        assert(country);
        pointer('pointerdown', 30);
        pointer('pointermove', 70);
        pointer('pointerup', 70);
        country.dispatchEvent(new t.w.MouseEvent('click', { bubbles: true, detail: 1 }));
        assert(t.$('#map-feedback').classList.contains('hidden'));
        await t.advance(150);
        country.dispatchEvent(new t.w.MouseEvent('click', { bubbles: true, detail: 1 }));
        assert(!t.$('#map-feedback').classList.contains('hidden'));
        t.click('#map-next');
        pointer('pointerdown', 30);
        pointer('pointermove', 70);
        pointer('pointerup', 70);
        country.dispatchEvent(new t.w.MouseEvent('click', { bubbles: true, detail: 0 }));
        assert(!t.$('#map-feedback').classList.contains('hidden'));
        t.clean();
    });
    fs.writeFileSync(
        path.join(root, 'tests/results/arcade.json'),
        JSON.stringify(reports, null, 2) + '\n'
    );
    console.log(
        `${reports.filter((r) => r.status === 'PASS').length}/${reports.length} grupos aprovados`
    );
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
run();
