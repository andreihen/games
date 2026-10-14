GameRegistry.register('colorrecall', (session) => ({
    async init(config) {
        await GameRegistry.load(GAMES_CONFIG.find((game) => game.id === 'colormemory'));
        return createColorMemory(session, true).init(config);
    },
    destroy: session.destroy
}));
