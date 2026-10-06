GameRegistry.register('subitizing', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty);
        ChallengeRunner.quiz(session, config, {
            title: 'Subitização',
            instructions:
                'Os pontos aparecem brevemente e desaparecem. Responda à quantidade percebida.',
            generate(index, rng) {
                const count = rng.int(1, [4, 6, 9, 12][tier]),
                    slots = rng.shuffle(Array.from({ length: 24 }, (_, i) => i)).slice(0, count);
                const dots = slots
                    .map(
                        (i) =>
                            `<span class="dot" style="left:${5 + (i % 6) * 15 + rng.int(0, 3)}%;top:${9 + Math.floor(i / 6) * 21 + rng.int(0, 4)}%"></span>`
                    )
                    .join('');
                return {
                    prompt: 'Quantos pontos apareceram?',
                    visual: `<div class="dots-board" aria-label="Apresentação de pontos">${dots}</div>`,
                    correct: String(count),
                    options: rng.shuffle(
                        Array.from({ length: [4, 6, 9, 12][tier] }, (_, i) => String(i + 1))
                    ),
                    presentMs: [1000, 700, 450, 300][tier],
                    mask: '<div class="dots-board masked-stimulus" aria-label="Apresentação encerrada">?</div>',
                    explanation: `Foram apresentados ${count} pontos, sem sobreposição.`
                };
            }
        });
    },
    destroy: session.destroy
}));
