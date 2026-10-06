const LearningEngine = (() => {
    function timeline(random, events, tier, recent = []) {
        const count = [4, 5, 6, 7][tier],
            span = [Infinity, 45, 28, 18][tier];
        const byYear = [
            ...new Map(random.shuffle(events).map((event) => [event.year, event])).values()
        ].sort((a, b) => a.year - b.year);
        const windows = byYear
            .map((start) =>
                byYear.filter(
                    (event) => event.year >= start.year && event.year - start.year <= span
                )
            )
            .filter((pool) => pool.length >= count);
        if (!windows.length) throw Error('O banco não tem eventos suficientes para este nível.');
        const seen = new Set(recent);
        const best = Math.max(
            ...windows.map((pool) => pool.filter((event) => !seen.has(event.id)).length)
        );
        const pool = random.pick(
            windows.filter((pool) => pool.filter((event) => !seen.has(event.id)).length === best)
        );
        const chosen = ReplayEngine.deck(random, pool, recent).next;
        const sorted = Array.from({ length: count }, () => chosen()).sort(
            (a, b) => a.year - b.year
        );
        return {
            sorted,
            order: scramble(random, sorted),
            span: sorted.at(-1).year - sorted[0].year
        };
    }
    function scramble(random, items) {
        let shuffled = random.shuffle(items);
        if (shuffled.every((item, i) => item === items[i]) && items.length > 1)
            [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
        return shuffled;
    }
    function connections(random, groups, recent = []) {
        if (groups.length < 4) throw Error('O banco de Conexões precisa de quatro grupos.');
        for (let attempt = 0; attempt < 100; attempt++) {
            const deck = ReplayEngine.deck(random, groups, recent);
            const chosen = Array.from({ length: 4 }, () => deck.next()).map((group) => ({
                ...group,
                words: random.shuffle(group.words).slice(0, 4)
            }));
            const words = chosen.flatMap((group) => group.words),
                keys = words.map(KnowledgeEngine.normalize);
            if (new Set(keys).size !== 16) continue;
            // Um termo não pode caber em outra categoria escolhida, mesmo fora da amostra dela.
            const overlapping = chosen.some((group) =>
                group.words.some((word) => {
                    const key = KnowledgeEngine.normalize(word);
                    return chosen.some(
                        (other) =>
                            other.id !== group.id &&
                            groups
                                .find((bank) => bank.id === other.id)
                                .words.some(
                                    (candidate) => KnowledgeEngine.normalize(candidate) === key
                                )
                    );
                })
            );
            if (overlapping) continue;
            const boardSet = new Set(keys);
            // Rejeita tabuleiros com um quinto grupo completo reconhecido no banco editorial.
            if (
                groups.some(
                    (group) =>
                        !chosen.some((c) => c.id === group.id) &&
                        group.words.filter((word) => boardSet.has(KnowledgeEngine.normalize(word)))
                            .length >= 4
                )
            )
                continue;
            return { groups: chosen, words: random.shuffle(words) };
        }
        throw Error('Não foi possível formar grupos inequívocos neste banco.');
    }
    return Object.freeze({ timeline, connections, scramble });
})();
