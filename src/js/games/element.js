GameRegistry.register('element', (session) => ({
    async init(config) {
        const all = await GameData.load('elements');
        if (!session.alive) return;
        const tier = DifficultyEngine.index(config.difficulty);
        KnowledgeDeduction(session, config, {
            id: 'element',
            title: 'Elemento Secreto',
            bank: all.filter((e) => e.id <= [20, 36, 86, 118][tier]),
            attempts: [9, 8, 7, 6][tier],
            intro: 'Digite o nome ou símbolo do elemento. As setas indicam se o número secreto é maior ou menor. Use o período e a família para reduzir as possibilidades.',
            fields: [
                { label: 'Número atômico', value: (e) => e.id, numeric: true },
                { label: 'Período', value: (e) => e.period, numeric: true },
                { label: 'Família', value: (e) => e.family }
            ],
            reveal: (e) =>
                `${e.name} (${e.symbol}) · número atômico ${e.id} · período ${e.period} · ${e.family}`
        });
    },
    destroy: session.destroy
}));
