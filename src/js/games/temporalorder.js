GameRegistry.register('temporalorder', (session) => ({
    async init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            kind = config.options.stimulus || 'figures',
            vocabulary = kind === 'words' ? await GameData.load('vocabulary') : null,
            banks = {
                figures: [
                    '★',
                    '◆',
                    '▲',
                    '●',
                    '■',
                    '✚',
                    '☾',
                    '☀',
                    '♥',
                    '♣',
                    '♠',
                    '♦',
                    '✿',
                    '✦',
                    '⬟',
                    '⬢',
                    '◎',
                    '⊕',
                    '☂',
                    '☁',
                    '⚑',
                    '♫',
                    '◐',
                    '⌛'
                ],
                words:
                    vocabulary?.pt.filter(
                        (word) => word.length >= 3 && word.length <= [5, 7, 10, 18][tier]
                    ) || [],
                numbers: Array.from({ length: 90 }, (_, i) => String(i + 10)),
                colors: [
                    'azul',
                    'vermelho',
                    'verde',
                    'amarelo',
                    'roxo',
                    'laranja',
                    'ciano',
                    'rosa',
                    'branco',
                    'cinza',
                    'marrom',
                    'lima',
                    'turquesa',
                    'vinho'
                ]
            };
        const prefix = `${kind}:`,
            deck = ReplayEngine.deck(
                session.random,
                banks[kind],
                (config.options.recentItems || [])
                    .filter((item) => item.startsWith(prefix))
                    .map((item) => item.slice(prefix.length))
            );
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
                rosa: '#f9a8d4',
                branco: '#ffffff',
                cinza: '#a1a1aa',
                marrom: '#b98355',
                lima: '#b8e46a',
                turquesa: '#2dd4bf',
                vinho: '#d77496'
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
            const length = config.events + Math.floor((round - 1) / 2);
            original = [];
            for (let i = 0; i < length; i++) original.push(deck.next(original));
            Progress.remember(
                'temporalorder',
                original.map((item) => prefix + item)
            );
            order = [];
            $('#temporal-order').replaceChildren();
            $('#temporal-controls').classList.add('hidden');
            $('#temporal-next').classList.add('hidden');
            $('#temporal-feedback').classList.add('hidden');
            $('#temporal-progress').textContent =
                `Sequência ${round}/6 · ${length} eventos · Observe.`;
            for (const item of original) {
                $('#temporal-stimulus').innerHTML = paint(item);
                if (!(await session.sleep(Math.max(300, config.exposure - (round - 1) * 25))))
                    return;
                $('#temporal-stimulus').innerHTML = '';
                if (!(await session.sleep(180))) return;
            }
            if (!(await session.sleep(config.retention))) return;
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
            $('#temporal-feedback').classList.toggle('feedback-correct', correct);
            $('#temporal-feedback').classList.toggle('feedback-wrong', !correct);
            render();
            $('#temporal-order')
                .querySelectorAll('button')
                .forEach((button, i) => {
                    button.classList.toggle('answer-correct', order[i] === original[i]);
                    button.classList.toggle('answer-wrong', order[i] !== original[i]);
                });
            $('#temporal-next').classList.remove('hidden');
        });
        session.listen($('#temporal-next'), 'click', next);
        return next();
    },
    destroy: session.destroy
}));
