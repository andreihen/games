const DifficultyEngine = (() => {
    const names = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil', expert: 'Especialista' };
    const keys = Object.keys(names);
    const index = (key) => Math.max(0, keys.indexOf(key));
    const policies = {
        sliding_puzzle: [
            { size: 2, scramble: 12 },
            { size: 3, scramble: 36 },
            { size: 4, scramble: 80 },
            { size: 5, scramble: 140 }
        ],
        nonogram: [
            { size: 5, density: 0.4 },
            { size: 6, density: 0.45 },
            { size: 8, density: 0.5 },
            { size: 10, density: 0.55 }
        ],
        hanoi_tower: [
            { disks: 3, scrambleMin: 9, scrambleRange: 12, scrambleCap: 20 },
            { disks: 4, scrambleMin: 20, scrambleRange: 28, scrambleCap: 50 },
            { disks: 6, scrambleMin: 34, scrambleRange: 48, scrambleCap: 90 },
            { disks: 8, scrambleMin: 48, scrambleRange: 68, scrambleCap: 130 }
        ],
        resta_um: [
            { depth: 4, timeLimit: 180 },
            { depth: 8, timeLimit: 180 },
            { depth: 13, timeLimit: 150 },
            { depth: 18, timeLimit: 120 }
        ],
        rightimpulse: [
            { symbols: 20, responseMs: 1500 },
            { symbols: 24, responseMs: 1180 },
            { symbols: 28, responseMs: 860 },
            { symbols: 32, responseMs: 600 }
        ],
        decode_colors: [
            { slots: 4, colors: 5, repeats: false, attempts: 10 },
            { slots: 4, colors: 6, repeats: true, attempts: 12 },
            { slots: 5, colors: 7, repeats: true, attempts: 14 },
            { slots: 6, colors: 8, repeats: true, attempts: 16 }
        ],
        lightsout: [
            { size: 3, moves: 5 },
            { size: 4, moves: 9 },
            { size: 5, moves: 15 },
            { size: 6, moves: 22 }
        ],
        mystery_scale: [
            { count: 6, weighings: 2, knownHeavy: true },
            { count: 8, weighings: 2, knownHeavy: true },
            { count: 9, weighings: 3, knownHeavy: false },
            { count: 12, weighings: 3, knownHeavy: false }
        ],
        blockfit: [
            { rows: 4, cols: 4, area: 4, blocked: 0, flip: false },
            { rows: 5, cols: 5, area: 5, blocked: 1, flip: false },
            { rows: 6, cols: 6, area: 5, blocked: 3, flip: true },
            { rows: 7, cols: 7, area: 6, blocked: 5, flip: true }
        ],
        memory_game: [
            { pairs: 6, delay: 0 },
            { pairs: 8, delay: 400 },
            { pairs: 10, delay: 800 },
            { pairs: 12, delay: 1200 }
        ],
        memorypath: [
            { size: 4, length: 5, delay: 0 },
            { size: 5, length: 8, delay: 600 },
            { size: 5, length: 11, delay: 1200 },
            { size: 6, length: 14, delay: 1800 }
        ],
        memoryshelf: [
            { objects: 4, changes: 1 },
            { objects: 5, changes: 2 },
            { objects: 6, changes: 3 },
            { objects: 8, changes: 4 }
        ],
        subtledifference: [
            { changes: 2, subtle: false },
            { changes: 4, subtle: false },
            { changes: 6, subtle: false },
            { changes: 8, subtle: true }
        ],
        flow: [
            { size: 4, pairs: 3 },
            { size: 5, pairs: 4 },
            { size: 6, pairs: 5 },
            { size: 7, pairs: 6 }
        ],
        symbol_inspector: [
            { days: 2, rules: 2, cases: 5 },
            { days: 3, rules: 3, cases: 6 },
            { days: 4, rules: 4, cases: 7 },
            { days: 4, rules: 5, cases: 8 }
        ],
        mental_math: [
            { steps: 1, max: 12, target: 10 },
            { steps: 1, max: 30, target: 12 },
            { steps: 2, max: 20, target: 14 },
            { steps: 4, max: 20, target: 16 }
        ],
        wordrain: [
            { maxLength: 4, target: 15, baseWpm: 18 },
            { maxLength: 6, target: 20, baseWpm: 28 },
            { maxLength: 8, target: 25, baseWpm: 40 },
            { maxLength: 10, target: 30, baseWpm: 52 }
        ],
        tictactoe: [
            { random: 0.7, depth: 4 },
            { random: 0.35, depth: 6 },
            { random: 0.1, depth: 8 },
            { random: 0, depth: 12 }
        ]
    };
    function resolve(game, difficulty = 'easy', options = {}) {
        if (!keys.includes(difficulty)) throw new Error('Escolha uma dificuldade válida.');
        return Object.freeze({
            difficulty,
            difficultyName: names[difficulty],
            options: { ...options },
            ...(policies[game]?.[index(difficulty)] || {})
        });
    }
    function choose(games, recent, random) {
        const eligible = games.filter((game) => game.primary !== false);
        const varied = eligible.filter((game) => !recent.slice(-3).includes(game.id));
        const pool = varied.length ? varied : eligible;
        const last = eligible.find((game) => game.id === recent.at(-1));
        const categories = pool.filter((game) => game.category !== last?.category);
        return random.pick(categories.length ? categories : pool);
    }
    return Object.freeze({ names, keys, index, resolve, choose });
})();
