GameRegistry.register('flags', (session) => {
    async function init(config) {
        const data = await GameData.load('geography');
        if (!session.alive) return;
        const region = config.options.region || 'World';
        const territories = region === 'territories';
        const all = data.countries.filter(
            (country) =>
                country.hasFlag &&
                (territories ? country.independent === false : country.independent === true) &&
                (territories || region === 'World' || country.region === region)
        );
        const tier = DifficultyEngine.index(config.difficulty);
        const deck = ReplayEngine.deck(session.random, all, config.options.recentItems);
        const inverse = config.options.mode === 'flag';
        ChallengeRunner.quiz(session, config, {
            title: 'Bandeiras',
            instructions:
                'Observe cores, proporções e símbolos. As alternativas priorizam a mesma região e bandeiras semelhantes. Na digitação, informe o nome do país; acentos são opcionais.',
            check: (value, question) =>
                KnowledgeEngine.matches(value, [question.correct, ...(question.aliases || [])]),
            generate(index, random) {
                const country = deck.next();
                Progress.remember('flags', [country.id]);
                const choices = KnowledgeEngine.alternatives(
                    random,
                    country,
                    all,
                    tier >= 2 ? 6 : 4,
                    'flag'
                );
                return inverse
                    ? {
                          prompt: `Qual bandeira representa ${country.name}?`,
                          correct: country.id,
                          answerLabel: country.name,
                          options: choices.map((candidate, i) => ({
                              value: candidate.id,
                              label: `Alternativa ${i + 1}`,
                              visual: `<img src="./src/assets/flags/${candidate.code}.svg" alt="Bandeira da alternativa ${i + 1}">`
                          })),
                          explanation: `${country.name}${territories ? ' · entidade da categoria territórios' : ''}.`
                      }
                    : {
                          prompt: territories
                              ? 'Qual território é representado?'
                              : 'Qual país é representado?',
                          correct: country.name,
                          aliases: KnowledgeEngine.aliases(country),
                          typing: config.options.mode === 'typing',
                          options: choices.map((candidate) => candidate.name),
                          visual: `<img class="flag-picture" src="./src/assets/flags/${country.code}.svg" alt="Bandeira do desafio">`,
                          explanation: `${country.name} · ${KnowledgeEngine.areaName(country)}.`
                      };
            }
        });
    }
    return { init, destroy: session.destroy };
});
