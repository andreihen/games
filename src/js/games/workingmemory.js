GameRegistry.register('workingmemory', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            mode = config.options.mode || 'reverse';
        ChallengeRunner.quiz(session, config, {
            title: 'Memória de Trabalho',
            instructions:
                'Memorize os números. Depois, transforme a sequência de acordo com a instrução. Separe números por espaços ou vírgulas.',
            check(value, q) {
                return (
                    String(value)
                        .trim()
                        .replace(/[,;\s]+/g, ' ') === q.correct
                );
            },
            generate(index, rng) {
                const values = Array.from({ length: [3, 4, 6, 8][tier] }, () =>
                    rng.int(1, tier >= 2 ? 15 : 9)
                );
                const answer =
                    mode === 'sum'
                        ? String(values[0] + values.at(-1))
                        : (mode === 'sort'
                              ? [...values].sort((a, b) => a - b)
                              : [...values].reverse()
                          ).join(' ');
                return {
                    prompt:
                        mode === 'sum'
                            ? 'Qual é a soma do primeiro com o último número?'
                            : mode === 'sort'
                              ? 'Digite os números em ordem crescente.'
                              : 'Digite a sequência ao contrário.',
                    observePrompt:
                        mode === 'sum'
                            ? 'Memorize o primeiro e o último número.'
                            : mode === 'sort'
                              ? 'Memorize para ordenar depois.'
                              : 'Memorize para inverter depois.',
                    visual: `<span class="memory-sequence">${values.join(' · ')}</span>`,
                    correct: answer,
                    typing: true,
                    numeric: true,
                    presentMs: [4000, 4000, 3500, 3000][tier],
                    explanation: `Sequência original: ${values.join(', ')}. Resposta: ${answer}.`
                };
            }
        });
    },
    destroy: session.destroy
}));
