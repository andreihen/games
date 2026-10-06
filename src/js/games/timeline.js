GameRegistry.register('timeline', (session) => ({
    async init(config) {
        const data = await GameData.load('learning');
        if (!session.alive) return;
        const tier = DifficultyEngine.index(config.difficulty),
            total = 5;
        const $ = GameUI.shell(
            session,
            'Linha do Tempo',
            'Coloque os acontecimentos da exploração espacial do mais antigo ao mais recente. Selecione um cartão e use as setas, ou arraste. As datas aparecem depois da resposta.',
            `<div class="learning-round"><span id="timeline-progress"></span><span id="timeline-level"></span></div><progress id="timeline-meter" class="challenge-meter" max="${total}" value="0" aria-label="Linhas do tempo respondidas"></progress><div id="timeline-list" class="timeline-list touch-drag"></div><div class="controls">${GameUI.button('↑ Subir', 'timeline-up')}${GameUI.button('↓ Descer', 'timeline-down')}${GameUI.button('Verificar ordem', 'timeline-check', 'primary')}</div><p id="timeline-feedback" class="notice hidden" role="status"></p>${GameUI.button('Próxima rodada', 'timeline-next', 'primary')}`
        );
        let round = 0,
            order = [],
            selected = null,
            locked = false,
            history = [...(config.options.recentItems || [])];
        function render() {
            $('#timeline-list').replaceChildren();
            order.forEach((event, i) => {
                const item = document.createElement('button');
                item.className = 'timeline-item' + (selected === i ? ' selected' : '');
                item.dataset.index = i;
                item.disabled = locked;
                item.setAttribute('aria-pressed', String(selected === i));
                item.innerHTML = `<span class="timeline-position">${locked ? event.year : String(i + 1).padStart(2, '0')}</span><span>${GameArt.escape(event.label)}</span><span aria-hidden="true">${locked ? '✓' : '⠿'}</span>`;
                $('#timeline-list').append(item);
            });
            $('#timeline-up').disabled = locked || selected === null || selected === 0;
            $('#timeline-down').disabled =
                locked || selected === null || selected === order.length - 1;
        }
        function reposition(from, to) {
            if (locked || to < 0 || to >= order.length) return;
            order.splice(to, 0, order.splice(from, 1)[0]);
            selected = to;
            render();
            $('#timeline-list').children[to].focus({ preventScroll: true });
        }
        function next() {
            if (round === total)
                return session.complete(session.score.snapshot().accuracy >= 60, {
                    text: 'Cinco linhas do tempo exploradas. As datas e referências ficam disponíveis após cada resposta.'
                });
            const puzzle = LearningEngine.timeline(session.random, data.events, tier, history);
            order = puzzle.order;
            history.push(...order.map((event) => event.id));
            history = history.slice(-80);
            Progress.remember(
                'timeline',
                order.map((event) => event.id)
            );
            round++;
            locked = false;
            selected = null;
            $('#timeline-progress').textContent = `Rodada ${round}/${total}`;
            $('#timeline-level').textContent = `${order.length} eventos · Exploração espacial`;
            $('#timeline-feedback').className = 'notice hidden';
            $('#timeline-next').classList.add('hidden');
            $('#timeline-check').disabled = false;
            render();
        }
        session.listen($('#timeline-list'), 'click', (e) => {
            const b = e.target.closest('[data-index]');
            if (b && !locked) {
                selected = +b.dataset.index;
                render();
                $('#timeline-list').children[selected].focus({ preventScroll: true });
            }
        });
        session.listen($('#timeline-list'), 'keydown', (e) => {
            if (selected === null) return;
            if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                reposition(selected, selected + (e.key === 'ArrowUp' ? -1 : 1));
            }
        });
        session.listen($('#timeline-up'), 'click', () => reposition(selected, selected - 1));
        session.listen($('#timeline-down'), 'click', () => reposition(selected, selected + 1));
        GameUI.drag(session, $('#timeline-list'), {
            selector: '[data-index]',
            start: (el) => (locked ? null : +el.dataset.index),
            drop: (from, target) => {
                const to = target?.closest('#timeline-list [data-index]');
                if (to) reposition(from, +to.dataset.index);
            }
        });
        session.listen($('#timeline-check'), 'click', () => {
            if (locked) return;
            locked = true;
            const correct = order.every((event, i) => !i || order[i - 1].year < event.year);
            session.score.answer(correct, 250);
            order.sort((a, b) => a.year - b.year);
            render();
            $('#timeline-check').disabled = true;
            $('#timeline-meter').value = round;
            const box = $('#timeline-feedback');
            box.className = 'notice ' + (correct ? 'feedback-correct' : 'feedback-wrong');
            box.replaceChildren();
            const text = document.createElement('p');
            text.textContent = correct
                ? '✓ Ordem correta! Confira as datas.'
                : '✕ Confira a ordem correta e as datas abaixo.';
            box.append(text);
            for (const source of [...new Set(order.map((event) => event.source))]) {
                const a = document.createElement('a');
                a.href = source;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = source.includes('chronology')
                    ? 'Referência: cronologia de missões da NASA'
                    : 'Referência: história da NASA';
                box.append(a);
            }
            $('#timeline-next').classList.remove('hidden');
            $('#timeline-next').focus({ preventScroll: true });
        });
        session.listen($('#timeline-next'), 'click', next);
        next();
    },
    destroy: session.destroy
}));
