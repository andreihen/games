GameRegistry.register('colororder', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            mode = config.options.mode || 'lightness',
            instructions =
                mode === 'warmth'
                    ? 'Ordene do laranja ao azul, passando por amarelo, verde e ciano.'
                    : mode === 'saturation'
                      ? 'Ordene da cor mais acinzentada à mais intensa.'
                      : 'Ordene do mais escuro ao mais claro.';
        const $ = GameUI.shell(
            session,
            'Ordem de Cores',
            `${instructions} Arraste as cores ou selecione uma e use as setas.`,
            `<p id="color-progress" class="status-line"></p><div id="color-row" class="sorting-row touch-drag"></div><div class="controls">${GameUI.button('← Mover', 'color-left')}${GameUI.button('Mover →', 'color-right')}${GameUI.button('Verificar', 'color-check', 'primary')}</div><p id="color-feedback" class="notice hidden"></p>${GameUI.button('Próxima rampa', 'color-next', 'primary')}`
        );
        let round = 0,
            order = [],
            selected = null,
            locked = false;
        function render() {
            const row = $('#color-row');
            row.replaceChildren();
            order.forEach((color, index) => {
                const b = document.createElement('button');
                b.style.background = color.css;
                b.dataset.index = index;
                b.className = selected === index ? 'selected' : '';
                b.setAttribute('aria-label', `Cor na posição ${index + 1}`);
                b.disabled = locked;
                session.listen(b, 'click', () => {
                    selected = index;
                    render();
                });
                row.append(b);
            });
            $('#color-left').disabled = locked || selected === null || selected === 0;
            $('#color-right').disabled =
                locked || selected === null || selected === order.length - 1;
        }
        function reposition(from, to) {
            if (locked || to < 0 || to >= order.length) return;
            order.splice(to, 0, order.splice(from, 1)[0]);
            selected = to;
            render();
        }
        function next() {
            if (round === 6) {
                const stats = session.score.snapshot();
                return session.complete(stats.accuracy >= 60, {
                    text: 'Seis rampas de cores concluídas.'
                });
            }
            round++;
            const sorted = ColorEngine.ramp(session.random, mode, [5, 6, 7, 8][tier]);
            do {
                order = session.random.shuffle(sorted);
            } while (order.every((c, i) => c.id === i));
            locked = false;
            selected = null;
            $('#color-progress').textContent = `Rampa ${round}/6 · ${instructions}`;
            $('#color-feedback').classList.add('hidden');
            $('#color-next').classList.add('hidden');
            $('#color-check').disabled = false;
            render();
        }
        session.listen($('#color-left'), 'click', () => reposition(selected, selected - 1));
        session.listen($('#color-right'), 'click', () => reposition(selected, selected + 1));
        GameUI.drag(session, $('#color-row'), {
            selector: 'button[data-index]',
            start: (el) => (locked ? null : +el.dataset.index),
            drop: (from, target) => {
                const to = target?.closest('#color-row button');
                if (to) reposition(from, +to.dataset.index);
            }
        });
        session.listen($('#color-check'), 'click', () => {
            if (locked) return;
            locked = true;
            const correct = order.every((c, i) => c.id === i);
            session.score.answer(correct);
            $('#color-feedback').classList.remove('hidden');
            $('#color-feedback').textContent = correct
                ? 'Ordem correta.'
                : 'Veja a ordem correta abaixo antes de seguir.';
            if (!correct) order.sort((a, b) => a.id - b.id);
            selected = null;
            render();
            $('#color-check').disabled = true;
            $('#color-next').classList.remove('hidden');
        });
        session.listen($('#color-next'), 'click', next);
        next();
    },
    destroy: session.destroy
}));
