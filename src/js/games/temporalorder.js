GameRegistry.register('temporalorder', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            kind = config.options.stimulus || 'figures',
            banks = {
                figures: ['★', '◆', '▲', '●', '■', '✚', '☾', '☀', '♥', '♣'],
                words: [
                    'rio',
                    'flor',
                    'lua',
                    'ponte',
                    'mar',
                    'livro',
                    'vento',
                    'porta',
                    'nuvem',
                    'pedra'
                ],
                numbers: ['12', '47', '83', '25', '61', '39', '76', '94', '58', '16'],
                colors: ['azul', 'vermelho', 'verde', 'amarelo', 'roxo', 'laranja', 'ciano', 'rosa']
            };
        let round = 0,
            original = [],
            order = [],
            selected = null,
            ready = false;
        const $ = GameUI.shell(
            session,
            'Ordem Temporal',
            'Observe os eventos, um de cada vez. Depois, restaure a ordem: arraste ou selecione e use as setas.',
            `<p id="temporal-progress" class="status-line"></p><div id="temporal-stimulus" class="large-stimulus"></div><div id="temporal-order" class="sorting-row touch-drag"></div><div id="temporal-controls" class="controls hidden">${GameUI.button('← Mover', 'temporal-left')}${GameUI.button('Mover →', 'temporal-right')}${GameUI.button('Verificar', 'temporal-check', 'primary')}</div><p id="temporal-feedback" class="notice hidden"></p>${GameUI.button('Próxima sequência', 'temporal-next', 'primary')}`
        );
        function paint(text) {
            if (kind !== 'colors') return GameArt.escape(text);
            const colors = {
                azul: '#60a5fa',
                vermelho: '#f87171',
                verde: '#4ade80',
                amarelo: '#facc15',
                roxo: '#c084fc',
                laranja: '#fb923c',
                ciano: '#67e8f9',
                rosa: '#f9a8d4'
            };
            return `<span style="color:${colors[text]}">●<small class="event-label">${text}</small></span>`;
        }
        function render() {
            const row = $('#temporal-order');
            row.replaceChildren();
            order.forEach((value, index) => {
                const b = document.createElement('button');
                b.dataset.index = index;
                b.innerHTML = paint(value);
                b.className = selected === index ? 'selected' : '';
                b.setAttribute('aria-label', `Posição ${index + 1}: ${value}`);
                b.disabled = !ready;
                session.listen(b, 'click', () => {
                    selected = index;
                    render();
                });
                row.append(b);
            });
            $('#temporal-left').disabled = !ready || selected === null || selected === 0;
            $('#temporal-right').disabled =
                !ready || selected === null || selected === order.length - 1;
        }
        function move(from, to) {
            if (!ready || to < 0 || to >= order.length) return;
            order.splice(to, 0, order.splice(from, 1)[0]);
            selected = to;
            render();
        }
        async function next() {
            if (round === 6) {
                const s = session.score.snapshot();
                return session.complete(s.accuracy >= 60, {
                    text: 'Seis sequências temporais concluídas.'
                });
            }
            round++;
            ready = false;
            selected = null;
            original = session.random.shuffle(banks[kind]).slice(0, [3, 4, 6, 8][tier]);
            order = [];
            $('#temporal-order').replaceChildren();
            $('#temporal-controls').classList.add('hidden');
            $('#temporal-next').classList.add('hidden');
            $('#temporal-feedback').classList.add('hidden');
            $('#temporal-progress').textContent = `Sequência ${round}/6 · Observe.`;
            for (const item of original) {
                $('#temporal-stimulus').innerHTML = paint(item);
                if (!(await session.sleep([1000, 850, 650, 450][tier]))) return;
                $('#temporal-stimulus').innerHTML = '';
                if (!(await session.sleep(180))) return;
            }
            do {
                order = session.random.shuffle(original);
            } while (order.every((v, i) => v === original[i]));
            ready = true;
            $('#temporal-stimulus').textContent = 'Restaure a ordem';
            $('#temporal-controls').classList.remove('hidden');
            $('#temporal-check').disabled = false;
            render();
        }
        session.listen($('#temporal-left'), 'click', () => move(selected, selected - 1));
        session.listen($('#temporal-right'), 'click', () => move(selected, selected + 1));
        GameUI.drag(session, $('#temporal-order'), {
            selector: 'button',
            start: (b) => (ready ? +b.dataset.index : null),
            drop: (from, target) => {
                const to = target?.closest('#temporal-order button');
                if (to) move(from, +to.dataset.index);
            }
        });
        session.listen($('#temporal-check'), 'click', () => {
            if (!ready) return;
            ready = false;
            const correct = order.every((v, i) => v === original[i]);
            session.score.answer(correct);
            $('#temporal-feedback').classList.remove('hidden');
            $('#temporal-feedback').textContent = correct
                ? 'Ordem correta.'
                : `Ordem original: ${original.join(' → ')}.`;
            $('#temporal-check').disabled = true;
            render();
            $('#temporal-next').classList.remove('hidden');
        });
        session.listen($('#temporal-next'), 'click', next);
        return next();
    },
    destroy: session.destroy
}));
