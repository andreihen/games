GameRegistry.register('pokemon', (session) => ({
    async init(config) {
        const all = await GameData.load('pokemon');
        if (!session.alive) return;
        const region = config.options.generation || 'all';
        const tier = DifficultyEngine.index(config.difficulty);
        const bank = all.filter((p) =>
            region === 'all' ? p.generation <= [1, 3, 6, 9][tier] : p.generation === Number(region)
        );
        const types = [
            '',
            'Normal',
            'Lutador',
            'Voador',
            'Veneno',
            'Terra',
            'Pedra',
            'Inseto',
            'Fantasma',
            'Aço',
            'Fogo',
            'Água',
            'Planta',
            'Elétrico',
            'Psíquico',
            'Gelo',
            'Dragão',
            'Sombrio',
            'Fada'
        ];
        KnowledgeDeduction(session, config, {
            id: 'pokemon',
            title: 'Pokédex Misteriosa',
            bank,
            attempts: [10, 9, 8, 7][tier],
            intro: 'Encontre o Pokémon secreto. ↑ significa que o valor secreto é maior; ↓, menor. Tipos iguais recebem ✓; tipos em comum recebem ≈. Apenas formas padrão.',
            fields: [
                { label: 'Geração', value: (p) => p.generation, numeric: true },
                {
                    label: 'Tipos',
                    value: (p) => p.types.map((t) => types[t]).join(' / '),
                    compare: (a, b) =>
                        a.types.length === b.types.length &&
                        a.types.every((t) => b.types.includes(t))
                            ? '✓'
                            : a.types.some((t) => b.types.includes(t))
                              ? '≈'
                              : '✕'
                },
                { label: 'Altura (m)', value: (p) => p.height, numeric: true },
                { label: 'Peso (kg)', value: (p) => p.weight, numeric: true }
            ],
            reveal: (p) =>
                `#${p.id} · ${p.name} · ${p.types.map((t) => types[t]).join(' / ')} · geração ${p.generation} · ${p.height} m · ${p.weight} kg`
        });
    },
    destroy: session.destroy
}));
