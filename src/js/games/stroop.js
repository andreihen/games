GameRegistry.register('stroop', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            names = ['azul', 'vermelho', 'verde', 'amarelo'],
            colors = ['#60a5fa', '#f87171', '#4ade80', '#facc15'];
        let rule = 'cor';
        ChallengeRunner.quiz(session, config, {
            title: 'Stroop',
            instructions:
                'Siga a regra escrita em cada rodada: a cor da tinta ou o significado da palavra. A regra pode mudar.',
            generate(index, rng) {
                if (tier && index && index % [100, 4, 3, 2][tier] === 0)
                    rule = rule === 'cor' ? 'palavra' : 'cor';
                const word = rng.int(0, 3),
                    ink = rng.pick([0, 1, 2, 3].filter((i) => i !== word));
                return {
                    prompt: `Regra atual: responda pela ${rule === 'cor' ? 'COR DA TINTA' : 'PALAVRA'}.`,
                    visual: `<span style="color:${colors[ink]};font-weight:800">${names[word].toUpperCase()}</span>`,
                    correct: names[rule === 'cor' ? ink : word],
                    options: rng.shuffle(names),
                    explanation: `A palavra é ${names[word]}; a tinta é ${names[ink]}. A regra pedia ${rule === 'cor' ? 'a tinta' : 'a palavra'}.`
                };
            }
        });
    },
    destroy: session.destroy
}));
