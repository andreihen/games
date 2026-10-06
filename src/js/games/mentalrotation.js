GameRegistry.register('mentalrotation', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty);
        ChallengeRunner.quiz(session, config, {
            title: 'Rotação Mental',
            instructions:
                'Uma alternativa é a figura original girada. As outras são reflexões: girar nunca as transforma no original.',
            generate(index, rng) {
                const shape = ShapeEngine.generate(rng, [5, 6, 8, 10][tier]),
                    turn = rng.int(1, 3),
                    answer = ShapeEngine.transform(shape, turn),
                    reflections = rng
                        .shuffle([0, 1, 2, 3])
                        .slice(0, 3)
                        .map((t) => ShapeEngine.transform(shape, t, true));
                const all = rng.shuffle([
                    { cells: answer, correct: true },
                    ...reflections.map((cells) => ({ cells, correct: false }))
                ]);
                const options = all.map((item, i) => ({
                    value: String(i),
                    label: `Alternativa ${i + 1}`,
                    visual: `<span class="rotation-option">${ShapeEngine.svg(item.cells)}</span>`
                }));
                return {
                    prompt: 'Qual alternativa preserva a figura, usando apenas rotação?',
                    visual: `<div class="rotation-reference">${ShapeEngine.svg(shape, '#ffd68c')}</div>`,
                    correct: String(all.findIndex((item) => item.correct)),
                    answerLabel: `Alternativa ${all.findIndex((item) => item.correct) + 1}`,
                    options,
                    explanation: `A figura correta gira ${turn * 90}°. As demais invertem sua orientação como num espelho.`
                };
            }
        });
    },
    destroy: session.destroy
}));
