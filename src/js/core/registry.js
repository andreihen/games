/* Scripts clássicos mantêm a plataforma utilizável também ao abrir index.html. */
const GameRegistry = (() => {
    const version = '2026-10-04.3';
    const factories = new Map();
    const loads = new Map();
    function register(id, factory) {
        if (factories.has(id)) throw new Error(`Jogo duplicado: ${id}`);
        factories.set(id, factory);
    }
    function load(game) {
        if (factories.has(game.id)) return Promise.resolve(factories.get(game.id));
        if (loads.has(game.id)) return loads.get(game.id);
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `./src/js/games/${game.file}?v=${version}`;
            script.onload = () => {
                if (factories.has(game.id)) resolve(factories.get(game.id));
                else {
                    loads.delete(game.id);
                    script.remove();
                    reject(new Error(`Registro ausente: ${game.name}`));
                }
            };
            script.onerror = () => {
                loads.delete(game.id);
                script.remove();
                reject(new Error(`Não foi possível carregar ${game.name}.`));
            };
            document.head.append(script);
        });
        loads.set(game.id, promise);
        return promise;
    }
    return Object.freeze({ version, register, load, get: (id) => factories.get(id) });
})();
