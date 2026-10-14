GameRegistry.register('chess', (session) => ({
    init: (config) => ClassicBoardUI.mount(session, config, ClassicChess, true),
    destroy: session.destroy
}));
