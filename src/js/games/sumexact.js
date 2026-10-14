GameRegistry.register('sumexact', (session) => ({
    init(config) {
        const size = [3, 4, 5, 6][DifficultyEngine.index(config.difficulty)];
        // Construct targets from a nonempty hidden subset; any matching subset is valid.
        const values = Array.from({ length: size * size }, () => session.random.int(1, 9));
        const keep = values.map(() => session.random.float() < 0.55);
        for (let r = 0; r < size; r++)
            if (!keep.slice(r * size, (r + 1) * size).some(Boolean))
                keep[r * size + session.random.int(0, size - 1)] = true;
        for (let c = 0; c < size; c++)
            if (!keep.some((v, i) => v && i % size === c))
                keep[session.random.int(0, size - 1) * size + c] = true;
        if (keep.every(Boolean)) keep[0] = false;
        const targetsR = Array.from({ length: size }, (_, r) =>
            values.reduce((a, v, i) => a + (Math.floor(i / size) === r && keep[i] ? v : 0), 0)
        );
        const targetsC = Array.from({ length: size }, (_, c) =>
            values.reduce((a, v, i) => a + (i % size === c && keep[i] ? v : 0), 0)
        );
        const active = values.map(() => true),
            undo = [];
        const $ = GameUI.shell(
            session,
            'Soma Exata',
            'Retire números para igualar as somas de todas as linhas e colunas. Toque novamente para recuperar um número. Qualquer solução que cumpra as metas vale.',
            `<div id="sum-grid" class="sum-grid" style="--sum-size:${size + 1}"></div><p id="sum-status" role="status"></p><div class="controls">${GameUI.button('Desfazer', 'sum-undo')}${GameUI.button('Recomeçar tabuleiro', 'sum-reset')}${GameUI.button('Verificar', 'sum-check', 'primary')}</div>`
        );
        let moves = 0;
        function draw() {
            const grid = $('#sum-grid');
            grid.replaceChildren();
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    const i = r * size + c,
                        b = document.createElement('button');
                    b.className = 'sum-cell';
                    b.textContent = values[i];
                    b.dataset.index = i;
                    b.setAttribute('aria-pressed', String(!active[i]));
                    b.setAttribute(
                        'aria-label',
                        `Linha ${r + 1}, coluna ${c + 1}: ${values[i]}, ${active[i] ? 'mantido' : 'retirado'}`
                    );
                    grid.append(b);
                }
                total(
                    targetsR[r],
                    values.reduce(
                        (a, v, i) => a + (Math.floor(i / size) === r && active[i] ? v : 0),
                        0
                    ),
                    `Linha ${r + 1}`
                );
            }
            for (let c = 0; c < size; c++)
                total(
                    targetsC[c],
                    values.reduce((a, v, i) => a + (i % size === c && active[i] ? v : 0), 0),
                    `Coluna ${c + 1}`
                );
            $('#sum-undo').disabled = !undo.length;
            $('#sum-status').textContent = `${moves} alterações · verde = soma correta`;
        }
        function total(target, current, label) {
            const el = document.createElement('span');
            el.className = 'sum-total ' + (target === current ? 'matched' : '');
            el.textContent = `${current}/${target}`;
            el.setAttribute('aria-label', `${label}: soma ${current}, meta ${target}`);
            $('#sum-grid').append(el);
        }
        session.listen($('#sum-grid'), 'click', (event) => {
            const cell = event.target.closest('[data-index]');
            if (!cell) return;
            const i = Number(cell.dataset.index);
            undo.push([...active]);
            active[i] = !active[i];
            moves++;
            draw();
            $('#sum-grid').querySelector(`[data-index="${i}"]`).focus({ preventScroll: true });
        });
        session.listen($('#sum-undo'), 'click', () => {
            if (undo.length) {
                active.splice(0, active.length, ...undo.pop());
                draw();
            }
        });
        session.listen($('#sum-reset'), 'click', () => {
            undo.push([...active]);
            active.fill(true);
            draw();
        });
        session.listen($('#sum-check'), 'click', () => {
            const correct =
                targetsR.every(
                    (t, r) =>
                        t ===
                        values.reduce(
                            (a, v, i) => a + (Math.floor(i / size) === r && active[i] ? v : 0),
                            0
                        )
                ) &&
                targetsC.every(
                    (t, c) =>
                        t ===
                        values.reduce((a, v, i) => a + (i % size === c && active[i] ? v : 0), 0)
                );
            if (correct) {
                session.score.answer(true, 500);
                session.complete(true, { text: `Todas as somas conferem! ${moves} alterações.` });
            } else
                $('#sum-status').textContent =
                    'Ainda há somas diferentes das metas. Confira as bordas do tabuleiro.';
        });
        draw();
    },
    destroy: session.destroy
}));
