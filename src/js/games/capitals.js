GameRegistry.register('capitals', (session) => {
    async function init(config) {
        const data = await GameData.load('geography');
        if (!session.alive) return;
        const region = config.options.region || 'World';
        const tier = DifficultyEngine.index(config.difficulty);
        const all = data.countries.filter(
            (country) =>
                country.independent &&
                country.capitals.length &&
                country.quizCapital !== false &&
                (region === 'World' || country.region === region)
        );
        const deck = ReplayEngine.deck(session.random, all, config.options.recentItems);
        const reviews = [...(config.options.reviewIds || [])];
        const asked = new Set();
        ChallengeRunner.quiz(session, config, {
            title: 'Capitais',
            instructions:
                'Qual é a capital? As alternativas pertencem à mesma área geográfica. Na digitação, acentos e pontuação são opcionais. Países com várias capitais admitem todas.',
            check: (value, question) =>
                KnowledgeEngine.matches(value, [question.correct, ...question.aliases]),
            generate(index, random) {
                if (asked.size >= all.length) asked.clear();
                const due =
                    index % 4 === 0
                        ? all.find(
                              (country) => reviews.includes(country.id) && !asked.has(country.id)
                          )
                        : null;
                const country = due || deck.next([...asked]);
                asked.add(country.id);
                Progress.remember('capitals', [country.id]);
                const correct = country.capitals[0];
                const eligible = all.filter(
                    (candidate) =>
                        !candidate.capitals.some((capital) =>
                            KnowledgeEngine.matches(capital, [
                                ...country.capitals,
                                ...(country.capitalAliases || [])
                            ])
                        )
                );
                const options = KnowledgeEngine.alternatives(
                    random,
                    country,
                    eligible,
                    tier >= 2 ? 6 : 4,
                    'capital'
                ).map((candidate) =>
                    candidate.id === country.id ? correct : candidate.capitals[0]
                );
                return {
                    country,
                    prompt: `${country.name}${country.capitals.length > 1 ? ' — indique uma das capitais' : ' — qual é a capital?'}`,
                    visual: `<img class="flag-picture" src="./src/assets/flags/${country.code}.svg" alt="Bandeira de ${GameArt.escape(country.name)}">`,
                    correct,
                    aliases: [...country.capitals, ...(country.capitalAliases || [])],
                    typing: config.options.mode === 'typing',
                    options: [...new Set(options)],
                    explanation:
                        country.capitalNote ||
                        (country.capitals.length > 1
                            ? `Capitais listadas: ${country.capitals.join(', ')}.`
                            : `${country.name} — ${correct}.`)
                };
            },
            record(question, correct) {
                Progress.review('capitals', question.country.id, correct);
            }
        });
    }
    return { init, destroy: session.destroy };
});
