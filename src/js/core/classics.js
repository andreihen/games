/* Regras puras dos jogos clássicos. Nenhum motor depende de rede ou de DOM. */
const ClassicChess = (() => {
    const other = (side) => side === 'w' ? 'b' : 'w';
    const row = (i) => i >> 3, col = (i) => i & 7;
    const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    const diagonals = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const straights = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const knights = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
    const values = { P: 100, N: 320, B: 335, R: 500, Q: 900, K: 0 };
    function initial() {
        const board = Array(64).fill(null);
        'RNBQKBNR'.split('').forEach((p, c) => {
            board[c] = 'b' + p; board[8 + c] = 'bP';
            board[48 + c] = 'wP'; board[56 + c] = 'w' + p;
        });
        return { board, turn: 'w', rights: 'KQkq', ep: -1, quiet: 0, ply: 0 };
    }
    function attacked(state, square, side) {
        const { board } = state, r = row(square), c = col(square);
        const pawnRow = r + (side === 'w' ? 1 : -1);
        for (const dc of [-1, 1])
            if (inside(pawnRow, c + dc) && board[pawnRow * 8 + c + dc] === side + 'P') return true;
        for (const [dr, dc] of knights)
            if (inside(r + dr, c + dc) && board[(r + dr) * 8 + c + dc] === side + 'N') return true;
        for (const [dr, dc] of [...diagonals, ...straights]) {
            for (let step = 1; inside(r + dr * step, c + dc * step); step++) {
                const p = board[(r + dr * step) * 8 + c + dc * step];
                if (!p) continue;
                if (p[0] === side && (p[1] === 'Q' ||
                    p[1] === (dr && dc ? 'B' : 'R') || (step === 1 && p[1] === 'K'))) return true;
                break;
            }
        }
        return false;
    }
    function check(state, side = state.turn) {
        const king = state.board.indexOf(side + 'K');
        return king < 0 || attacked(state, king, other(side));
    }
    function pseudo(state) {
        const { board, turn } = state, result = [];
        function add(from, to, extra = {}) {
            if (board[to]?.[0] === turn || board[to]?.[1] === 'K') return;
            if (board[from][1] === 'P' && [0, 7].includes(row(to)))
                for (const promotion of ['Q', 'R', 'B', 'N']) result.push({ from, to, ...extra, promotion });
            else result.push({ from, to, ...extra });
        }
        board.forEach((piece, from) => {
            if (!piece || piece[0] !== turn) return;
            const r = row(from), c = col(from), type = piece[1];
            if (type === 'P') {
                const dr = turn === 'w' ? -1 : 1, nr = r + dr;
                if (!inside(nr, c)) return;
                if (!board[nr * 8 + c]) {
                    add(from, nr * 8 + c);
                    if (r === (turn === 'w' ? 6 : 1) && !board[(r + 2 * dr) * 8 + c])
                        add(from, (r + 2 * dr) * 8 + c);
                }
                for (const dc of [-1, 1]) {
                    if (!inside(nr, c + dc)) continue;
                    const to = nr * 8 + c + dc;
                    if (board[to] && board[to][0] !== turn) add(from, to);
                    else if (to === state.ep && board[r * 8 + c + dc] === other(turn) + 'P')
                        add(from, to, { enPassant: r * 8 + c + dc });
                }
            } else if (type === 'N') {
                for (const [dr, dc] of knights)
                    if (inside(r + dr, c + dc)) add(from, (r + dr) * 8 + c + dc);
            } else {
                const directions = type === 'B' ? diagonals : type === 'R' ? straights : [...diagonals, ...straights];
                for (const [dr, dc] of directions) {
                    for (let n = 1; inside(r + dr * n, c + dc * n); n++) {
                        const to = (r + dr * n) * 8 + c + dc * n;
                        add(from, to);
                        if (board[to] || type === 'K') break;
                    }
                }
                if (type === 'K' && from === (turn === 'w' ? 60 : 4) && !check(state)) {
                    for (const short of [true, false]) {
                        const right = turn === 'w' ? (short ? 'K' : 'Q') : (short ? 'k' : 'q');
                        const rook = from + (short ? 3 : -4), dir = short ? 1 : -1;
                        const empty = short ? [1, 2] : [-1, -2, -3];
                        // Remove o rei ao verificar as casas atravessadas: ele não pode ocultar um ataque.
                        const withoutKing = { ...state, board: [...board] };
                        withoutKing.board[from] = null;
                        if (state.rights.includes(right) && board[rook] === turn + 'R' &&
                            empty.every((d) => !board[from + d]) &&
                            [1, 2].every((d) => !attacked(withoutKing, from + d * dir, other(turn))))
                            add(from, from + 2 * dir, { rookFrom: rook, rookTo: from + dir });
                    }
                }
            }
        });
        return result;
    }
    function apply(state, move) {
        const board = [...state.board], piece = board[move.from], capture = board[move.to] || move.enPassant !== undefined;
        board[move.from] = null; board[move.to] = move.promotion ? piece[0] + move.promotion : piece;
        if (move.enPassant !== undefined) board[move.enPassant] = null;
        if (move.rookFrom !== undefined) { board[move.rookTo] = board[move.rookFrom]; board[move.rookFrom] = null; }
        let rights = state.rights;
        if (piece[1] === 'K') rights = rights.replace(piece[0] === 'w' ? /[KQ]/g : /[kq]/g, '');
        for (const [square, right] of [[0, 'q'], [7, 'k'], [56, 'Q'], [63, 'K']])
            if (move.from === square || move.to === square) rights = rights.replace(right, '');
        return { board, turn: other(state.turn), rights,
            ep: piece[1] === 'P' && Math.abs(move.to - move.from) === 16 ? (move.to + move.from) / 2 : -1,
            quiet: piece[1] === 'P' || capture ? 0 : state.quiet + 1, ply: state.ply + 1 };
    }
    const moves = (state) => pseudo(state).filter((move) => !check(apply(state, move), state.turn));
    function key(state) {
        const ep = state.ep >= 0 && moves(state).some((m) => m.enPassant !== undefined) ? state.ep : -1;
        return state.board.map((p) => p || '--').join('') + ':' + state.turn + ':' + state.rights + ':' + ep;
    }
    function insufficient(state) {
        const pieces = state.board.map((p, i) => ({ p, i })).filter(({ p }) => p && p[1] !== 'K');
        if (!pieces.length) return true;
        if (pieces.length === 1 && ['B', 'N'].includes(pieces[0].p[1])) return true;
        return pieces.every(({ p }) => p[1] === 'B') &&
            new Set(pieces.map(({ i }) => (row(i) + col(i)) % 2)).size === 1;
    }
    function outcome(state, repetitions = 1) {
        if (!moves(state).length) return check(state)
            ? { winner: other(state.turn), text: 'Xeque-mate' } : { winner: null, text: 'Empate por afogamento' };
        if (insufficient(state)) return { winner: null, text: 'Empate por material insuficiente' };
        if (repetitions >= 5) return { winner: null, text: 'Empate por cinco repetições' };
        if (state.quiet >= 150) return { winner: null, text: 'Empate pela regra dos 75 lances' };
        return null;
    }
    function evaluate(state) {
        let score = 0;
        state.board.forEach((p, i) => {
            if (!p) return;
            const advance = p[0] === 'w' ? 7 - row(i) : row(i);
            const center = 7 - Math.abs(3.5 - row(i)) - Math.abs(3.5 - col(i));
            const position = p[1] === 'P' ? advance * 9 + center * 2 : p[1] === 'K' ? -center * 3 : center * 8;
            score += (values[p[1]] + position) * (p[0] === 'w' ? 1 : -1);
        });
        return state.turn === 'w' ? score : -score;
    }
    const priority = (s, m) => (values[s.board[m.to]?.[1]] || (m.enPassant !== undefined ? 100 : 0)) * 10 + (values[m.promotion] || 0) - (values[s.board[m.from]?.[1]] || 0) / 10;
    return Object.freeze({ initial, moves, apply, check, attacked, key, outcome, evaluate, priority, other });
})();

const ClassicDraughts = (() => {
    const other = ClassicChess.other;
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    function initial() {
        const board = Array(64).fill(null);
        for (let i = 0; i < 64; i++) if (((i >> 3) + (i & 7)) % 2 && ((i >> 3) < 3 || (i >> 3) > 4))
            board[i] = (i >> 3) < 3 ? 'bM' : 'wM';
        return { board, turn: 'w', quiet: 0, ply: 0 };
    }
    function moves(state) {
        const captures = [], simple = [];
        state.board.forEach((piece, from) => {
            if (!piece || piece[0] !== state.turn) return;
            const king = piece[1] === 'K';
            function visit(board, at, path, taken) {
                let extended = false;
                for (const [dr, dc] of directions) {
                    let r = (at >> 3) + dr, c = (at & 7) + dc;
                    if (king) while (inside(r, c) && !board[r * 8 + c]) { r += dr; c += dc; }
                    if (!inside(r, c)) continue;
                    const victim = r * 8 + c;
                    if (!board[victim] || board[victim][0] === piece[0] || taken.includes(victim)) continue;
                    r += dr; c += dc;
                    while (inside(r, c) && !board[r * 8 + c]) {
                        const to = r * 8 + c, next = [...board];
                        next[at] = null; next[to] = piece;
                        // Peças capturadas permanecem como obstáculos até terminar toda a sequência.
                        visit(next, to, [...path, to], [...taken, victim]);
                        extended = true;
                        if (!king) break;
                        r += dr; c += dc;
                    }
                }
                if (!extended && taken.length) captures.push({ from, to: at, path, taken });
            }
            visit(state.board, from, [], []);
            for (const [dr, dc] of directions) {
                if (!king && dr !== (piece[0] === 'w' ? -1 : 1)) continue;
                let r = (from >> 3) + dr, c = (from & 7) + dc;
                while (inside(r, c) && !state.board[r * 8 + c]) {
                    simple.push({ from, to: r * 8 + c, path: [r * 8 + c], taken: [] });
                    if (!king) break;
                    r += dr; c += dc;
                }
            }
        });
        const max = Math.max(0, ...captures.map((m) => m.taken.length));
        return max ? captures.filter((m) => m.taken.length === max) : simple;
    }
    function apply(state, move) {
        const board = [...state.board], piece = board[move.from];
        board[move.from] = null;
        move.taken.forEach((i) => board[i] = null);
        board[move.to] = piece[1] === 'M' && (move.to >> 3) === (piece[0] === 'w' ? 0 : 7) ? piece[0] + 'K' : piece;
        return { board, turn: other(state.turn), ply: state.ply + 1,
            quiet: move.taken.length || piece[1] === 'M' ? 0 : state.quiet + 1 };
    }
    const key = (s) => s.board.map((p) => p || '--').join('') + ':' + s.turn;
    function outcome(state, repetitions = 1) {
        if (!moves(state).length) return { winner: other(state.turn), text: 'Sem peças ou movimentos disponíveis' };
        if (repetitions >= 3 || state.quiet >= 30)
            return { winner: null, text: repetitions >= 3 ? 'Empate por repetição' : 'Empate após 15 lances de damas por pessoa sem captura' };
        return null;
    }
    function evaluate(state) {
        let score = 0;
        state.board.forEach((p, i) => {
            if (!p) return;
            const advance = p[0] === 'w' ? 7 - (i >> 3) : i >> 3;
            const center = 7 - Math.abs(3.5 - (i >> 3)) - Math.abs(3.5 - (i & 7));
            score += (p[1] === 'K' ? 320 + center * 4 : 100 + advance * 8 + center * 3) * (p[0] === 'w' ? 1 : -1);
        });
        return state.turn === 'w' ? score : -score;
    }
    const priority = (s, m) => m.taken.length * 100 + ((m.to >> 3) === (s.turn === 'w' ? 0 : 7) ? 50 : 0);
    return Object.freeze({ initial, moves, apply, key, outcome, evaluate, priority, other });
})();

const ClassicAI = Object.freeze({
    // Busca progressiva com orçamento determinístico e pausas para manter a interface responsiva.
    async choose(engine, state, config, session) {
        const legal = engine.moves(state);
        if (!legal.length) return null;
        if (!config.depth || session.random.float() < config.random) return session.random.pick(legal);
        let nodes = 0, exhausted = false, best = legal[0];
        async function search(s, depth, alpha, beta, ply) {
            if (++nodes % 128 === 0 && !await session.sleep(0)) { exhausted = true; return 0; }
            if (nodes > config.nodes || !session.alive) { exhausted = true; return 0; }
            const terminal = engine.outcome(s);
            if (terminal) return terminal.winner ? (terminal.winner === s.turn ? 100000 - ply : -100000 + ply) : 0;
            if (!depth) return engine.evaluate(s);
            let value = -Infinity;
            const moves = engine.moves(s).sort((a, b) => engine.priority(s, b) - engine.priority(s, a));
            for (const m of moves) {
                value = Math.max(value, -await search(engine.apply(s, m), depth - 1, -beta, -alpha, ply + 1));
                if (exhausted) return 0;
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break;
            }
            return value;
        }
        let ordered = legal.sort((a, b) => engine.priority(state, b) - engine.priority(state, a));
        for (let depth = 1; depth <= config.depth && !exhausted; depth++) {
            const rated = [];
            let alpha = -Infinity;
            for (const m of ordered) {
                const value = -await search(engine.apply(state, m), depth - 1, -Infinity, -alpha, 1);
                if (exhausted) break;
                rated.push({ move: m, value });
                alpha = Math.max(alpha, value);
            }
            if (!exhausted) {
                rated.sort((a, b) => b.value - a.value);
                best = rated[0].move;
                ordered = rated.map((x) => x.move);
            }
        }
        return session.alive ? best : null;
    }
});

const ClassicMines = (() => {
    function neighbors(index, rows, cols) {
        const result = [], r = Math.floor(index / cols), c = index % cols;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++)
            if ((dr || dc) && r + dr >= 0 && r + dr < rows && c + dc >= 0 && c + dc < cols)
                result.push((r + dr) * cols + c + dc);
        return result;
    }
    function create(rows, cols, mines) {
        return { rows, cols, mines, planted: false, over: false, won: false, hit: -1,
            cells: Array.from({ length: rows * cols }, () => ({ mine: false, count: 0, open: false, flag: false })) };
    }
    function plant(state, first, random) {
        const safe = new Set([first, ...neighbors(first, state.rows, state.cols)]);
        const available = state.cells.map((_, i) => i).filter((i) => !safe.has(i));
        random.shuffle(available).slice(0, state.mines).forEach((i) => state.cells[i].mine = true);
        state.cells.forEach((cell, i) => cell.count = neighbors(i, state.rows, state.cols).filter((j) => state.cells[j].mine).length);
        state.planted = true;
    }
    function reveal(state, index, random) {
        if (state.over || !state.cells[index] || state.cells[index].flag || state.cells[index].open) return;
        if (!state.planted) plant(state, index, random);
        const todo = [index];
        while (todo.length) {
            const i = todo.pop(), cell = state.cells[i];
            if (cell.open || cell.flag) continue;
            cell.open = true;
            if (cell.mine) { state.over = true; state.hit = i; return; }
            if (!cell.count) todo.push(...neighbors(i, state.rows, state.cols).filter((j) => !state.cells[j].open));
        }
        state.won = state.cells.every((c) => c.mine || c.open);
        state.over = state.won;
    }
    function flag(state, index) {
        const cell = state.cells[index];
        if (state.over || !cell || cell.open) return;
        if (!cell.flag && state.cells.filter((c) => c.flag).length >= state.mines) return;
        cell.flag = !cell.flag;
    }
    function chord(state, index, random) {
        const cell = state.cells[index], near = neighbors(index, state.rows, state.cols);
        if (!state.over && cell.open && cell.count && near.filter((i) => state.cells[i].flag).length === cell.count)
            for (const i of near) reveal(state, i, random);
    }
    return Object.freeze({ create, neighbors, reveal, flag, chord });
})();

const ClassicLudo = (() => {
    // Percurso em cruz de 52 casas; progresso 0..50 na pista, 51..56 na reta final.
    const track = [[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
        [1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],
        [8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],
        [13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]];
    const lanes = [Array.from({ length: 6 }, (_, i) => [7, i + 1]),
        Array.from({ length: 6 }, (_, i) => [i + 1, 7]),
        Array.from({ length: 6 }, (_, i) => [7, 13 - i]),
        Array.from({ length: 6 }, (_, i) => [13 - i, 7])];
    const bases = [[[2,2],[2,4],[4,2],[4,4]], [[2,10],[2,12],[4,10],[4,12]],
        [[10,10],[10,12],[12,10],[12,12]], [[10,2],[10,4],[12,2],[12,4]]];
    const safe = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
    function initial(count = 4) {
        const colors = count === 2 ? [0, 2] : Array.from({ length: count }, (_, i) => i);
        return { players: colors.map((color) => ({ color, pieces: [-1,-1,-1,-1] })), turn: 0, sixes: 0, winner: null };
    }
    const square = (color, progress) => (color * 13 + progress) % 52;
    function position(color, progress, piece = 0) {
        return progress < 0 ? bases[color][piece] : progress <= 50 ? track[square(color, progress)] : lanes[color][progress - 51];
    }
    function moves(state, dice) {
        const p = state.players[state.turn];
        return p.pieces.map((at, piece) => ({ piece, from: at, to: at < 0 ? 0 : at + dice }))
            .filter((m) => (m.from >= 0 || dice === 6) && m.from !== 56 && m.to <= 56);
    }
    function pass(state, extra = false) {
        return { ...state, turn: extra ? state.turn : (state.turn + 1) % state.players.length, sixes: extra ? state.sixes : 0 };
    }
    function apply(state, move, dice) {
        const players = state.players.map((p) => ({ color: p.color, pieces: [...p.pieces] }));
        const p = players[state.turn];
        p.pieces[move.piece] = move.to;
        let captured = 0;
        if (move.to <= 50 && !safe.has(square(p.color, move.to))) {
            players.forEach((enemy, j) => {
                if (j === state.turn) return;
                enemy.pieces.forEach((at, i) => {
                    if (at >= 0 && at <= 50 && square(enemy.color, at) === square(p.color, move.to)) {
                        enemy.pieces[i] = -1; captured++;
                    }
                });
            });
        }
        const winner = p.pieces.every((at) => at === 56) ? state.turn : null;
        return { state: { ...pass({ ...state, players }, dice === 6), winner }, captured };
    }
    function choose(state, dice, tier, random) {
        const legal = moves(state, dice);
        if (!tier) return random.pick(legal);
        const rated = legal.map((move) => {
            const { state: next, captured } = apply(state, move, dice);
            const p = next.players[state.turn];
            let value = (move.to === 56 ? 150 : 0) + captured * 70 + (move.from < 0 ? 28 : move.to / 3);
            if (tier >= 2) {
                if (move.to > 50 || safe.has(square(p.color, move.to))) value += 25;
                else {
                    next.players.forEach((enemy, j) => {
                        if (j === state.turn) return;
                        enemy.pieces.forEach((at) => {
                            if (at < 0 || at > 50) return;
                            const distance = (square(p.color, move.to) - square(enemy.color, at) + 52) % 52;
                            if (distance >= 1 && distance <= 6 && at + distance <= 50) value -= tier === 3 ? 24 : 12;
                        });
                    });
                }
            }
            if (tier === 3) {
                if (next.winner !== null) value += 10000;
                // Desenvolve vários peões e libera a base sem abandonar peças perto da chegada.
                value += p.pieces.filter((at) => at >= 0).length * 8;
                value += Math.max(0, move.to - 44) * 5;
            }
            return { move, value };
        });
        const best = Math.max(...rated.map((m) => m.value));
        return random.pick(rated.filter((m) => m.value === best)).move;
    }
    return Object.freeze({ initial, moves, apply, pass, choose, position, square, track, lanes, bases, safe });
})();
