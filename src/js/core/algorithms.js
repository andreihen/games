const GameAlgorithms = (() => {
    function shuffle(array, random) {
        return random.shuffle(array);
    }
    function sliding(size, moves, random) {
        if (size === 2) {
            const queue = [{ tiles: [1, 2, 3, 0], depth: 0 }],
                seen = new Set(['1,2,3,0']),
                states = [];
            for (let at = 0; at < queue.length; at++) {
                const current = queue[at],
                    empty = current.tiles.indexOf(0);
                if (current.depth >= 2) states.push(current.tiles);
                for (const next of [empty ^ 1, empty ^ 2]) {
                    const tiles = [...current.tiles];
                    [tiles[empty], tiles[next]] = [tiles[next], tiles[empty]];
                    const key = tiles.join(',');
                    if (!seen.has(key)) {
                        seen.add(key);
                        queue.push({ tiles, depth: current.depth + 1 });
                    }
                }
            }
            return [...random.pick(states)];
        }
        const tiles = Array.from({ length: size * size }, (_, i) => (i + 1) % (size * size));
        let previous = -1;
        const steps = moves + random.int(0, Math.max(1, Math.floor(moves / 4)));
        for (let step = 0; step < steps; step++) {
            const empty = tiles.indexOf(0),
                r = Math.floor(empty / size),
                c = empty % size;
            const adjacent = [
                r > 0 ? empty - size : -1,
                r < size - 1 ? empty + size : -1,
                c > 0 ? empty - 1 : -1,
                c < size - 1 ? empty + 1 : -1
            ].filter((i) => i >= 0 && i !== previous);
            const next = adjacent[Math.floor(random.float() * adjacent.length)];
            [tiles[empty], tiles[next]] = [tiles[next], tiles[empty]];
            previous = empty;
        }
        if (tiles.every((n, i) => n === (i + 1) % tiles.length))
            [tiles[tiles.length - 1], tiles[tiles.length - 2]] = [
                tiles[tiles.length - 2],
                tiles[tiles.length - 1]
            ];
        return tiles;
    }
    // Expande um tabuleiro de uma peça com saltos inversos. Reverter os saltos é uma solução comprovada.
    function pegPuzzle(layout, depth, random) {
        let best = null;
        const valid = layout.flatMap((row, r) =>
            row.flatMap((cell, c) => (cell ? [{ r, c }] : []))
        );
        for (let attempt = 0; attempt < 80; attempt++) {
            const board = layout.map((row) => row.map((cell) => (cell ? 1 : 0)));
            const start = valid[Math.floor(random.float() * valid.length)];
            board[start.r][start.c] = 2;
            const reverse = [];
            while (reverse.length < depth) {
                const options = [];
                for (const { r, c } of valid)
                    if (board[r][c] === 2) {
                        for (const [dr, dc] of [
                            [2, 0],
                            [-2, 0],
                            [0, 2],
                            [0, -2]
                        ]) {
                            const sr = r + dr,
                                sc = c + dc,
                                mr = r + dr / 2,
                                mc = c + dc / 2;
                            if (board[sr]?.[sc] === 1 && board[mr]?.[mc] === 1)
                                options.push({ r, c, sr, sc, mr, mc });
                        }
                    }
                if (!options.length) break;
                const move = options[Math.floor(random.float() * options.length)];
                board[move.r][move.c] = 1;
                board[move.sr][move.sc] = 2;
                board[move.mr][move.mc] = 2;
                reverse.push(move);
            }
            if (!best || reverse.length > best.solution.length)
                best = { board, solution: [...reverse].reverse() };
            if (reverse.length >= depth) break;
        }
        return best;
    }
    // Divide a área em peças conectadas, garantindo cobertura sem depender de busca exponencial.
    function blockPuzzle(rows, cols, maxArea = 5, random, blocked = []) {
        const filled = Array(rows)
                .fill(null)
                .map(() => Array(cols).fill(false)),
            pieces = [],
            solution = [];
        const directions = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ];
        for (const cell of blocked) filled[cell.r][cell.c] = true;
        for (let r = 0; r < rows; r++)
            for (let c = 0; c < cols; c++)
                if (!filled[r][c]) {
                    const cells = [{ r, c }];
                    filled[r][c] = true;
                    const target = 2 + Math.floor(random.float() * Math.max(1, maxArea - 1));
                    while (cells.length < target) {
                        const neighbors = cells
                            .flatMap((cell) =>
                                directions.map(([dr, dc]) => ({ r: cell.r + dr, c: cell.c + dc }))
                            )
                            .filter(
                                (cell) =>
                                    cell.r >= 0 &&
                                    cell.r < rows &&
                                    cell.c >= 0 &&
                                    cell.c < cols &&
                                    !filled[cell.r][cell.c]
                            );
                        if (!neighbors.length) break;
                        const next = neighbors[Math.floor(random.float() * neighbors.length)];
                        filled[next.r][next.c] = true;
                        cells.push(next);
                    }
                    const minR = Math.min(...cells.map((cell) => cell.r)),
                        minC = Math.min(...cells.map((cell) => cell.c));
                    const shape = Array(Math.max(...cells.map((cell) => cell.r)) - minR + 1)
                        .fill(null)
                        .map(() =>
                            Array(Math.max(...cells.map((cell) => cell.c)) - minC + 1).fill(0)
                        );
                    for (const cell of cells) shape[cell.r - minR][cell.c - minC] = 1;
                    pieces.push(shape);
                    solution.push({ row: minR, col: minC, shape });
                }
        return { pieces, solution };
    }
    function snake(size, random) {
        const path = [];
        for (let r = 0; r < size; r++)
            for (let j = 0; j < size; j++) path.push({ r, c: r % 2 ? size - 1 - j : j });
        const rotations = Math.floor(random.float() * 4),
            flip = random.float() < 0.5;
        return path.map((cell) => {
            let { r, c } = cell;
            if (flip) c = size - 1 - c;
            for (let i = 0; i < rotations; i++) [r, c] = [c, size - 1 - r];
            return { r, c };
        });
    }
    // Backbite altera uma rota Hamiltoniana preservando adjacência e cobertura.
    function route(size, random) {
        let path = snake(size, random);
        for (let step = 0; step < size * size * 30; step++) {
            const head = random.float() < 0.5;
            if (!head) path.reverse();
            const first = path[0],
                neighbors = path
                    .map((cell, index) => ({ cell, index }))
                    .filter(
                        ({ cell, index }) =>
                            index > 1 &&
                            Math.abs(cell.r - first.r) + Math.abs(cell.c - first.c) === 1
                    );
            if (neighbors.length) {
                const { index } = random.pick(neighbors);
                path = [...path.slice(0, index).reverse(), ...path.slice(index)];
            }
        }
        return path;
    }
    function flowPuzzle(size, count, random) {
        const path = route(size, random),
            paths = [];
        let start = 0;
        for (let i = 0; i < count; i++) {
            const remaining = path.length - start,
                groups = count - i;
            const length = groups === 1 ? remaining : random.int(2, remaining - 2 * (groups - 1));
            paths.push(path.slice(start, start + length));
            start += length;
        }
        return paths;
    }
    return Object.freeze({ shuffle, sliding, pegPuzzle, blockPuzzle, snake, route, flowPuzzle });
})();
