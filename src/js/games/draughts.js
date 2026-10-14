GameRegistry.register('draughts', (session) => ({
    init: (config) => ClassicBoardUI.mount(session, config, ClassicDraughts, false),
    destroy: session.destroy
}));
