const NonogramEngine = (() => {
    const cache = new Map();
    function clues(line) {
        const runs = [];
        let run = 0;
        for (const bit of [...line, 0]) {
            if (bit) run++;
            else if (run) {
                runs.push(run);
                run = 0;
            }
        }
        return runs.length ? runs : [0];
    }
    function patterns(size, hints) {
        const key = size + ':' + hints.join(',');
        if (cache.has(key)) return cache.get(key);
        const runs = hints.filter(Boolean),
            result = [];
        function place(i, start, mask) {
            if (i === runs.length) {
                result.push(mask);
                return;
            }
            const remaining = runs.slice(i).reduce((a, b) => a + b, 0) + runs.length - i - 1;
            for (let p = start; p <= size - remaining; p++)
                place(i + 1, p + runs[i] + 1, mask | (((1 << runs[i]) - 1) << p));
        }
        place(0, 0, 0);
        cache.set(key, result);
        return result;
    }
    function solve(rows, cols, limit = 2, budget = 20000) {
        const h = rows.length,
            w = cols.length,
            solutions = [];
        let nodes = 0,
            aborted = false,
            logical = false;
        function visit(r, c, depth) {
            if (solutions.length >= limit || aborted) return;
            if (++nodes > budget) {
                aborted = true;
                return;
            }
            let changed = true;
            while (changed) {
                changed = false;
                for (let y = 0; y < h; y++)
                    for (let x = 0; x < w; x++) {
                        const rowBits = r[y].reduce((m, p) => m | ((p >> x) & 1 ? 2 : 1), 0);
                        const old = c[x].length;
                        c[x] = c[x].filter((p) => rowBits & ((p >> y) & 1 ? 2 : 1));
                        if (!c[x].length) return;
                        if (c[x].length !== old) changed = true;
                        const colBits = c[x].reduce((m, p) => m | ((p >> y) & 1 ? 2 : 1), 0);
                        const oldRow = r[y].length;
                        r[y] = r[y].filter((p) => colBits & ((p >> x) & 1 ? 2 : 1));
                        if (!r[y].length) return;
                        if (r[y].length !== oldRow) changed = true;
                    }
            }
            let best = null;
            r.forEach((d, i) => {
                if (d.length > 1 && (!best || d.length < best.d.length)) best = { axis: 'r', i, d };
            });
            c.forEach((d, i) => {
                if (d.length > 1 && (!best || d.length < best.d.length)) best = { axis: 'c', i, d };
            });
            if (!best) {
                solutions.push(r.map((d) => Array.from({ length: w }, (_, x) => (d[0] >> x) & 1)));
                if (depth === 0) logical = true;
                return;
            }
            for (const p of best.d) {
                const rr = r.map((d) => [...d]),
                    cc = c.map((d) => [...d]);
                (best.axis === 'r' ? rr : cc)[best.i] = [p];
                visit(rr, cc, depth + 1);
                if (solutions.length >= limit || aborted) break;
            }
        }
        visit(
            rows.map((hints) => [...patterns(w, hints)]),
            cols.map((hints) => [...patterns(h, hints)]),
            0
        );
        return { count: solutions.length, solution: solutions[0] || null, logical, aborted, nodes };
    }
    function generate(size, density, random, requireLogical = false) {
        for (let attempt = 0; attempt < 160; attempt++) {
            const board = Array.from({ length: size }, () =>
                Array.from({ length: size }, () => Number(random.float() < density))
            );
            if (!board.flat().some(Boolean) || board.flat().every(Boolean)) continue;
            const result = solve(
                board.map(clues),
                Array.from({ length: size }, (_, x) => clues(board.map((row) => row[x])))
            );
            if (!result.aborted && result.count === 1 && (!requireLogical || result.logical))
                return { board, attempts: attempt + 1, fallback: false, logical: result.logical };
        }
        // Uma coluna cheia ancora cada corrida horizontal. Rotações e reflexões mantêm unicidade.
        let board = Array.from({ length: size }, () => {
            const n = random.int(1, size);
            return Array.from({ length: size }, (_, x) => Number(x < n));
        });
        if (board.flat().every(Boolean)) board[size - 1][size - 1] = 0;
        for (let turn = random.int(0, 3); turn > 0; turn--)
            board = board[0].map((_, x) => board.map((row) => row[x]).reverse());
        if (random.float() < 0.5) board = board.map((row) => row.slice().reverse());
        return { board, attempts: 160, fallback: true, logical: true };
    }
    return Object.freeze({ clues, patterns, solve, generate });
})();
