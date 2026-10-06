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
async function run() {
    await test('Termo: solo, dueto, quarteto, escada, dicionário e letras repetidas', async () => {
        const t = setup(),
            dictionary = await t.api('GameData').load('words'),
            vocabulary = await t.api('GameData').load('vocabulary'),
            bank = (length) => t.api('VocabularyEngine').targets(dictionary, vocabulary, length);
        for (const word of ['CASA', 'CASAS', 'LIVRO', 'CAMINHO', 'PEDRA', 'PALAVRA'])
            assert(dictionary[word.length].includes(word), word);
        for (const mode of ['single', 'duet', 'quartet', 'ladder']) {
            const seed = 'WORD-PLAY-' + mode,
                rng = t.api('SeededRandom').create(seed),
                count = mode === 'duet' ? 2 : mode === 'quartet' ? 4 : 1;
            await t.mount('termo', 'easy', { mode, length: '5' }, seed);
            t.input('#termo-input', 'ZZZZZ');
            t.submit('#termo-form');
            assert.equal(t.$$('.letter-tile.exact').length, 0);
            assert(t.$('#game-notice').textContent.includes('dicionário') || mode === 'ladder');
            const lengths = mode === 'ladder' ? [4, 5, 6, 7] : [5];
            for (const length of lengths) {
                const targets = rng.shuffle(bank(length)).slice(0, count);
                for (const target of targets) {
                    t.input('#termo-input', target);
                    t.submit('#termo-form');
                }
            }
            assert.equal(t.outcomes[0][0], true, mode);
        }
        await t.mount('termo', 'easy', { length: '4' }, 'WORD-FEEDBACK');
        const target = t.api('SeededRandom').create('WORD-FEEDBACK').shuffle(bank(4))[0],
            guess = dictionary[4].find((w) => w !== target && new Set(w).size < 4);
        t.input('#termo-input', guess);
        t.submit('#termo-form');
        const remaining = [...target],
            states = Array(4).fill('absent');
        for (let i = 0; i < 4; i++)
            if (guess[i] === target[i]) {
                states[i] = 'exact';
                remaining[i] = null;
            }
        for (let i = 0; i < 4; i++)
            if (states[i] !== 'exact') {
                const at = remaining.indexOf(guess[i]);
                if (at >= 0) {
                    states[i] = 'present';
                    remaining[at] = null;
                }
            }
        assert.deepEqual(t.$$('.wordle-row')[0].querySelectorAll('.letter-tile').length, 4);
        assert.deepEqual(
            [...t.$$('.wordle-row')[0].children].map((el) =>
                el.classList.contains('exact')
                    ? 'exact'
                    : el.classList.contains('present')
                      ? 'present'
                      : 'absent'
            ),
            states
        );
        t.clean();
    });
    await test('Capitais em português e aliases internacionais são aceitos com e sem acentos', async () => {
        const t = setup(),
            data = await t.api('GameData').load('geography'),
            byId = new Map(data.countries.map((c) => [c.id, c]));
        for (const [id, answer] of [
            ['JPN', 'Tóquio'],
            ['CHN', 'Pequim'],
            ['GBR', 'Londres'],
            ['PRT', 'Lisboa'],
            ['ESP', 'Madri']
        ])
            assert(byId.get(id).capitals.includes(answer));
        await t.mount('capitals', 'expert', { mode: 'typing', region: 'World' });
        for (let round = 0; round < 16; round++) {
            const prompt = t.$('#quiz-prompt').textContent,
                country = data.countries.find((c) => prompt.includes(c.name));
            assert(country, prompt);
            const answer =
                round % 2 && country.capitalAliases?.length
                    ? country.capitalAliases[0]
                    : country.capitals[0];
            t.input('#quiz-input', t.api('GameArt').normalize(answer));
            t.submit('#quiz-form');
            assert(t.$('#quiz-feedback').textContent.startsWith('Correto.'), country.id);
            t.click('#quiz-next');
        }
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    await test('Mapa: localizar país com teclado, zoom e todos os modos com respostas válidas', async () => {
        const t = setup();
        await t.mount('worldmap');
        const country = t.$('#map-question').textContent.replace('Clique em ', '').slice(0, -1),
            shape = t.$$('.map-country').find((el) => el.getAttribute('aria-label') === country);
        assert(shape);
        shape.dispatchEvent(
            new t.w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
        );
        assert.equal(t.session.score.snapshot().correct, 1);
        const before = t.$('#world-svg').getAttribute('viewBox');
        t.click('#map-in');
        assert.notEqual(t.$('#world-svg').getAttribute('viewBox'), before);
        for (const mode of ['identify', 'capital', 'continent', 'neighbors', 'oceans']) {
            await t.mount('worldmap', 'expert', { mode });
            const options = t.$$('#map-choices button');
            assert(options.length >= 3, `${mode}: mínimo de duas alternativas falsas plausíveis`);
            assert.equal(new Set(options.map((b) => b.textContent)).size, options.length, mode);
        }
        t.clean();
    });
    await test('Deslizante e Hanói: soluções BFS independentes chegam à vitória', async () => {
        const t = setup();
        await t.mount('sliding_puzzle');
        let tiles = t.$$('.sliding-puzzle-tile').map((el) => +el.textContent.trim() || 0);
        const n = tiles.length,
            size = Math.sqrt(n),
            queue = [{ state: tiles, moves: [] }],
            seen = new Set([tiles.join(',')]);
        let result;
        for (let at = 0; at < queue.length; at++) {
            const node = queue[at];
            if (node.state.every((v, i) => v === (i + 1) % n)) {
                result = node.moves;
                break;
            }
            const zero = node.state.indexOf(0);
            for (let i = 0; i < n; i++)
                if (
                    Math.abs(((i / size) | 0) - ((zero / size) | 0)) +
                        Math.abs((i % size) - (zero % size)) ===
                    1
                ) {
                    const next = [...node.state];
                    [next[i], next[zero]] = [next[zero], next[i]];
                    const key = next.join(',');
                    if (!seen.has(key)) {
                        seen.add(key);
                        queue.push({ state: next, moves: [...node.moves, i] });
                    }
                }
        }
        assert(result);
        for (const index of result) t.click(t.$$('.sliding-puzzle-tile')[index]);
        assert.equal(t.outcomes[0][0], true);
        await t.mount('hanoi_tower');
        const disks = t
                .$$('.hanoi-peg')
                .map((el) => [...el.querySelectorAll('.hanoi-disk')].map((d) => +d.textContent)),
            start = Array(3);
        disks.forEach((peg, i) => peg.forEach((d) => (start[d - 1] = i)));
        const todo = [{ state: start, moves: [] }],
            known = new Set([start.join('')]);
        let solution;
        for (let at = 0; at < todo.length; at++) {
            const { state, moves } = todo[at];
            if (state.every((p) => p === 2)) {
                solution = moves;
                break;
            }
            const tops = [0, 1, 2].map((p) => state.findIndex((peg) => peg === p));
            for (let from = 0; from < 3; from++)
                for (let to = 0; to < 3; to++)
                    if (from !== to && tops[from] >= 0 && (tops[to] < 0 || tops[from] < tops[to])) {
                        const next = [...state];
                        next[tops[from]] = to;
                        const key = next.join('');
                        if (!known.has(key)) {
                            known.add(key);
                            todo.push({ state: next, moves: [...moves, [from, to]] });
                        }
                    }
        }
        assert(solution);
        for (const [from, to] of solution) {
            t.click(t.$$('.hanoi-peg')[from]);
            t.click(t.$$('.hanoi-peg')[to]);
        }
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    await test('Resta Um: busca de saltos na configuração visível encontra solução', async () => {
        const t = setup();
        await t.mount('resta_um');
        const cells = t.$$('.restaum-cell:not(.invalid)'),
            coords = cells.map((el) => ({ r: +el.dataset.r, c: +el.dataset.c })),
            indices = new Map(coords.map((c, i) => [`${c.r},${c.c}`, i])),
            jumps = [];
        coords.forEach((c, from) => {
            for (const [dr, dc] of [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1]
            ]) {
                const middle = indices.get(`${c.r + dr},${c.c + dc}`),
                    to = indices.get(`${c.r + 2 * dr},${c.c + 2 * dc}`);
                if (middle !== undefined && to !== undefined) jumps.push({ from, middle, to });
            }
        });
        const initial = cells.reduce(
                (mask, c, i) => (c.classList.contains('peg') ? mask | (1n << BigInt(i)) : mask),
                0n
            ),
            visited = new Set();
        function search(mask) {
            if (mask && (mask & (mask - 1n)) === 0n) return [];
            if (visited.has(mask)) return null;
            visited.add(mask);
            for (const m of jumps) {
                const a = 1n << BigInt(m.from),
                    b = 1n << BigInt(m.middle),
                    c = 1n << BigInt(m.to);
                if (mask & a && mask & b && !(mask & c)) {
                    const path = search(mask ^ a ^ b ^ c);
                    if (path) return [m, ...path];
                }
            }
            return null;
        }
        const solution = search(initial);
        assert(solution);
        for (const m of solution) {
            for (const i of [m.from, m.to])
                t.click(`.restaum-cell[data-r="${coords[i].r}"][data-c="${coords[i].c}"]`);
        }
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    fs.writeFileSync(
        path.join(root, 'tests/results/catalog.json'),
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
