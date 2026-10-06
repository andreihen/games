GameRegistry.register('mutantoperator', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            symbols = ['▲', '●', '■'];
        let ops = session.random.shuffle(['+', '−', '×']);
        const calc = (a, b, op) => (op === '+' ? a + b : op === '−' ? a - b : a * b);
        ChallengeRunner.quiz(session, config, {
            title: 'Operador Mutante',
            instructions:
                'Os símbolos representam operações. Consulte a legenda atual; os significados mudam durante a partida.',
            generate(index, rng) {
                if (index && index % [4, 3, 2, 1][tier] === 0) {
                    const previous = ops.join('');
                    do {
                        ops = rng.shuffle(['+', '−', '×']);
                    } while (ops.join('') === previous);
                }
                const a = rng.int(2, [9, 15, 20, 25][tier]),
                    b = rng.int(2, [9, 12, 15, 20][tier]),
                    first = rng.int(0, 2),
                    c = rng.int(2, 9),
                    second = rng.int(0, 2);
                let result = calc(a, b, ops[first]),
                    expression = `${a} ${symbols[first]} ${b}`,
                    explanation = `${a} ${ops[first]} ${b} = ${result}.`;
                if (tier >= 2) {
                    expression = `(${expression}) ${symbols[second]} ${c}`;
                    explanation += ` Depois, ${result} ${ops[second]} ${c} = ${calc(result, c, ops[second])}.`;
                    result = calc(result, c, ops[second]);
                }
                return {
                    prompt: `Legenda: ${symbols.map((s, i) => `${s} significa ${ops[i]}`).join(' · ')}`,
                    visual: expression,
                    correct: String(result),
                    typing: true,
                    numeric: true,
                    explanation
                };
            }
        });
    },
    destroy: session.destroy
}));
