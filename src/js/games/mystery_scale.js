GameRegistry.register('mystery_scale', (session) => {
    function init(config) {
        const { count, weighings, knownHeavy } = config,
            odd = session.random.int(0, count - 1),
            heavier = knownHeavy || session.random.float() < 0.5;
        const labels = Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
        let locations = Array(count).fill('pool'),
            chosen = 'left',
            used = 0;
        const $ = GameUI.shell(
            session,
            'Balança Lógica',
            `${count} objetos · ${weighings} pesagens. ${knownHeavy ? 'O diferente é mais pesado.' : 'O diferente pode ser mais leve ou mais pesado.'} Arraste ou escolha um prato e toque nos objetos.`,
            `<div class="controls">${GameUI.button('Adicionar à esquerda', 'scale-choose-left')}${GameUI.button('Adicionar à direita', 'scale-choose-right')}</div><div class="scale-zones"><div id="scale-item-pool" class="scale-zone touch-drag" data-zone="pool" aria-label="Objetos disponíveis"></div><div><h3>Esquerda</h3><div id="scale-left-pan" class="scale-zone touch-drag" data-zone="left"></div></div><div><h3>Direita</h3><div id="scale-right-pan" class="scale-zone touch-drag" data-zone="right"></div></div></div><div class="controls">${GameUI.button('Pesar', 'scale-weigh-button', 'primary')}${GameUI.button('Limpar pratos', 'scale-reset-pans-button')}</div><p id="scale-result-area" class="notice" role="status"></p><div id="scale-history" class="history" aria-label="Histórico de pesagens"></div><div class="controls"><label>Objeto diferente<select id="scale-identify-select"><option value="">Selecione…</option>${labels.map((label, i) => `<option value="${i}">${label}</option>`).join('')}</select></label><label>Tipo<select id="scale-identify-type"><option value="">Não informar</option><option value="heavier">Mais pesado</option>${knownHeavy ? '' : '<option value="lighter">Mais leve</option>'}</select></label>${GameUI.button('Identificar', 'scale-identify-button', 'primary')}</div>`
        );
        function render() {
            for (const zone of ['pool', 'left', 'right'])
                session.ui.phaseDisplay.querySelector(`[data-zone="${zone}"]`).replaceChildren();
            locations.forEach((zone, i) => {
                const button = document.createElement('button');
                button.textContent = labels[i];
                button.dataset.item = i;
                button.setAttribute(
                    'aria-label',
                    `Objeto ${labels[i]}, ${zone === 'pool' ? 'disponível' : zone === 'left' ? 'prato esquerdo' : 'prato direito'}`
                );
                session.ui.phaseDisplay.querySelector(`[data-zone="${zone}"]`).append(button);
            });
            session.ui.limitDisplay.textContent = `Pesagens: ${used}/${weighings}`;
            $('#scale-weigh-button').disabled = used >= weighings;
            $('#scale-choose-left').setAttribute('aria-pressed', chosen === 'left');
            $('#scale-choose-right').setAttribute('aria-pressed', chosen === 'right');
        }
        session.listen(session.ui.phaseDisplay, 'click', (event) => {
            const item = event.target.closest('[data-item]');
            if (item) {
                const i = +item.dataset.item;
                locations[i] = locations[i] === 'pool' ? chosen : 'pool';
                render();
            }
        });
        GameUI.drag(session, session.ui.phaseDisplay, {
            selector: '[data-item]',
            start: (el) => +el.dataset.item,
            drop: (i, target) => {
                const zone = target?.closest('[data-zone]');
                if (zone) {
                    locations[i] = zone.dataset.zone;
                    render();
                }
            }
        });
        for (const side of ['left', 'right'])
            session.listen($(`#scale-choose-${side}`), 'click', () => {
                chosen = side;
                render();
            });
        session.listen($('#scale-reset-pans-button'), 'click', () => {
            locations.fill('pool');
            render();
        });
        session.listen($('#scale-weigh-button'), 'click', () => {
            if (used >= weighings) return;
            const left = locations.flatMap((loc, i) => (loc === 'left' ? [i] : [])),
                right = locations.flatMap((loc, i) => (loc === 'right' ? [i] : []));
            if (!left.length && !right.length)
                return session.notify('Coloque pelo menos um objeto na balança.');
            const weight = (indices) =>
                indices.reduce((sum, i) => sum + 100 + (i === odd ? (heavier ? 1 : -1) : 0), 0);
            const delta = weight(left) - weight(right),
                symbol = delta > 0 ? '>' : delta < 0 ? '<' : '=';
            used++;
            const row = document.createElement('div');
            row.className = 'history-row';
            row.textContent = `Pesagem ${used}: [${left.map((i) => labels[i]).join(' ')}] ${symbol} [${right.map((i) => labels[i]).join(' ')}]`;
            $('#scale-history').append(row);
            $('#scale-result-area').textContent =
                delta > 0
                    ? '← Esquerda mais pesada'
                    : delta < 0
                      ? 'Direita mais pesada →'
                      : '= Equilíbrio';
            if (left.length !== right.length)
                $('#scale-result-area').textContent +=
                    ' · A quantidade de objetos também afeta o resultado.';
            render();
        });
        session.listen($('#scale-identify-button'), 'click', () => {
            if ($('#scale-identify-select').value === '')
                return session.notify('Escolha um objeto.');
            const type = $('#scale-identify-type').value,
                correct =
                    +$('#scale-identify-select').value === odd &&
                    (!type || type === (heavier ? 'heavier' : 'lighter'));
            session.score.answer(correct, 800);
            session.complete(correct, {
                text: `O objeto ${labels[odd]} era mais ${heavier ? 'pesado' : 'leve'}. Você usou ${used} pesagens.`
            });
        });
        render();
    }
    return { init, destroy: session.destroy };
});
