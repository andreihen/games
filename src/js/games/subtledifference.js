GameRegistry.register('subtledifference', (session) => {
    function init(config) {
        const count = 20,
            shapes = ['circle', 'triangle', 'square', 'arrow'],
            colors = ['blue', 'red', 'green', 'yellow'];
        const original = Array.from({ length: count }, () => ({
                shape: session.random.pick(shapes),
                color: session.random.pick(colors),
                symbol: session.random.pick(['none', 'star', 'circle']),
                rotation: session.random.int(0, 3) * 90,
                scale: 1,
                x: 0,
                y: 0
            })),
            altered = structuredClone(original),
            changed = new Set(
                session.random
                    .shuffle(Array.from({ length: count }, (_, i) => i))
                    .slice(0, config.changes)
            );
        const types = {};
        for (const i of changed) {
            const object = altered[i],
                type = session.random.pick([
                    'remove',
                    'color',
                    'position',
                    'size',
                    'orientation',
                    'symbol'
                ]);
            types[i] = type;
            if (type === 'remove') altered[i] = null;
            else if (type === 'color')
                object.color = session.random.pick(colors.filter((c) => c !== object.color));
            else if (type === 'position') {
                object.x = config.subtle ? 5 : 13;
                object.y = config.subtle ? -4 : -10;
            } else if (type === 'size') object.scale = config.subtle ? 0.82 : 0.6;
            else if (type === 'orientation') {
                if (object.shape === 'circle' || object.shape === 'square') {
                    original[i].shape = 'arrow';
                    object.shape = 'arrow';
                }
                object.rotation = (object.rotation + (config.subtle ? 35 : 90)) % 360;
            } else
                object.symbol = session.random.pick(
                    ['none', 'star', 'circle'].filter((s) => s !== object.symbol)
                );
        }
        let ready = config.options.mode !== 'memory',
            found = new Set();
        const $ = GameUI.shell(
            session,
            'Qual a Diferença?',
            config.options.mode === 'memory'
                ? 'Memorize o painel A por cinco segundos. Depois encontre no painel B os espaços que mudaram.'
                : 'Compare os painéis A e B. Marque no painel B os espaços com alguma alteração.',
            `<p id="difference-status" class="notice" role="status"></p><div class="scene-pair"><div id="scene-a-wrap"><h3>Painel A</h3><div id="scene-a" class="scene-board"></div></div><div id="scene-b-wrap"><h3>Painel B</h3><div id="scene-b" class="scene-board"></div></div></div>`
        );
        function panel(id, scene) {
            for (let i = 0; i < count; i++) {
                const object = scene[i],
                    button = document.createElement('button');
                button.dataset.scene = i;
                button.innerHTML = object
                    ? GameArt.svg(object.shape, object.color, object.symbol)
                    : '';
                if (object)
                    button.querySelector('svg').style.transform =
                        `translate(${object.x}%,${object.y}%) rotate(${object.rotation}deg) scale(${object.scale})`;
                button.setAttribute(
                    'aria-label',
                    `Espaço ${i + 1}, ${object ? `${RuleEngine.labels[object.shape]}, ${RuleEngine.labels[object.color]}, ${RuleEngine.labels[object.symbol]}, orientação ${object.rotation} graus, tamanho ${Math.round(object.scale * 100)}%` : 'vazio'}`
                );
                $(id).append(button);
            }
        }
        panel('#scene-a', original);
        panel('#scene-b', altered);
        function render() {
            $('#difference-status').textContent = ready
                ? `Alterações encontradas: ${found.size}/${changed.size}`
                : 'Observe o painel A…';
            for (const b of $('#scene-b').querySelectorAll('button'))
                b.classList.toggle('found', found.has(+b.dataset.scene));
        }
        session.listen($('#scene-b'), 'click', (event) => {
            const button = event.target.closest('[data-scene]');
            if (!button || !ready) return;
            const i = +button.dataset.scene;
            if (found.has(i)) return;
            const correct = changed.has(i);
            session.score.answer(correct);
            if (correct) {
                found.add(i);
                render();
                if (found.size === changed.size)
                    session.complete(true, {
                        text: `${changed.size} alterações encontradas: ${Object.values(types)
                            .map(
                                (type) =>
                                    ({
                                        remove: 'remoção',
                                        color: 'cor',
                                        position: 'posição',
                                        size: 'tamanho',
                                        orientation: 'orientação',
                                        symbol: 'símbolo'
                                    })[type]
                            )
                            .join(', ')}.`
                    });
            } else
                session.notify(
                    'Esse objeto permaneceu igual. Observe forma, cor, posição, tamanho, orientação e símbolo.'
                );
        });
        if (!ready) {
            $('#scene-b-wrap').classList.add('hidden');
            session.timeout(() => {
                $('#scene-a-wrap').classList.add('hidden');
                $('#scene-b-wrap').classList.remove('hidden');
                ready = true;
                render();
            }, 5000);
        }
        render();
    }
    return { init, destroy: session.destroy };
});
