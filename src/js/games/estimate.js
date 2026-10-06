GameRegistry.register('estimate', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty);
        ChallengeRunner.quiz(session, config, {
            title: 'Estimativa',
            instructions:
                'Escolha a alternativa mais próxima do produto. Arredondar os fatores ajuda a estimar.',
            generate(index, rng) {
                const a = rng.int([12, 25, 80, 150][tier], [39, 99, 299, 999][tier]),
                    b = rng.int(11, [19, 49, 99, 299][tier]),
                    product = a * b,
                    unit = 10 ** Math.max(1, String(product).length - 2),
                    nearest = Math.round(product / unit) * unit;
                const candidates = rng.shuffle(
                    [nearest, nearest - 3 * unit, nearest + 2 * unit, nearest + 4 * unit].filter(
                        (n) => n > 0
                    )
                );
                while (candidates.length < 4) candidates.push(nearest + 6 * unit);
                const sorted = [...candidates].sort(
                    (x, y) => Math.abs(x - product) - Math.abs(y - product)
                );
                if (Math.abs(sorted[0] - product) === Math.abs(sorted[1] - product))
                    throw Error('Estimativa ambígua.');
                return {
                    prompt: 'Qual é a aproximação mais próxima?',
                    visual: `${a} × ${b}`,
                    correct: String(sorted[0]),
                    options: candidates.map(String),
                    explanation: `O produto exato é ${product}. A alternativa ${sorted[0]} fica a ${Math.abs(sorted[0] - product)} desse valor.`
                };
            }
        });
    },
    destroy: session.destroy
}));
