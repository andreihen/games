GameRegistry.register('compare', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty);
        // Espalha as relações pelo desafio, sem uma posição fixa para a igualdade.
        const relations = session.random.shuffle(
            Array.from({ length: [10, 12, 14, 16][tier] }, (_, i) => ['<', '=', '>'][i % 3])
        );
        ChallengeRunner.quiz(session, config, {
            title: 'Maior ou Menor',
            instructions: 'Calcule mentalmente os dois lados e escolha a relação correta.',
            generate(index, rng) {
                const left = PuzzleMath.expression(rng, tier);
                const relation = relations[index];
                let right = PuzzleMath.expression(rng, tier);
                for (let attempt = 0; attempt < 40; attempt++) {
                    const actual =
                        left.value === right.value ? '=' : left.value > right.value ? '>' : '<';
                    if (actual === relation) break;
                    right = PuzzleMath.expression(rng, tier);
                }
                if (
                    (left.value === right.value ? '=' : left.value > right.value ? '>' : '<') !==
                    relation
                ) {
                    const value =
                        left.value +
                        (relation === '<'
                            ? rng.int(1, 15)
                            : relation === '>'
                              ? -rng.int(1, 15)
                              : 0);
                    const k = rng.int(2, 15);
                    right = { text: `${value + k} − ${k}`, value };
                }
                return {
                    prompt: 'Qual sinal torna a comparação verdadeira?',
                    visual: `<span class="expression-pair">${left.text}<br><span class="muted">?</span><br>${right.text}</span>`,
                    correct:
                        left.value === right.value ? '=' : left.value > right.value ? '>' : '<',
                    options: ['<', '=', '>'],
                    explanation: `O lado esquerdo vale ${left.value}; o direito vale ${right.value}.`
                };
            }
        });
    },
    destroy: session.destroy
}));
