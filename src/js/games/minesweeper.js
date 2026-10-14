GameRegistry.register('minesweeper', (session) => {
    function init(config) {
        const state = ClassicMines.create(config.rows, config.cols, config.mines);
        let flagMode = false, timer = null, startedAt = null;
        const $ = GameUI.shell(session, 'Campo Minado',
            'Abra todas as casas sem minas. Cada número indica quantas minas existem nas oito casas vizinhas. O primeiro clique e seus vizinhos são seguros. Use o botão Modo bandeira no toque, botão direito do mouse ou a tecla F sobre uma casa para marcar/desmarcar. Clique em um número com todas as bandeiras vizinhas colocadas para abrir as casas restantes; bandeiras erradas podem causar uma explosão.',
            `<p id="mines-status" class="notice" role="status"></p><p id="mines-clock" class="status-line">Tempo: 0s</p>
            <div class="classic-actions">${GameUI.button('Modo bandeira: desligado', 'mines-flag')}</div>
            ${config.cols > 12 ? '<p class="classic-mode">Deslize o tabuleiro para os lados em telas pequenas.</p>' : ''}
            <div class="mines-scroll"><div id="mines-board" class="mines-board" style="--mine-cols:${config.cols}" aria-label="Campo minado"></div></div>`);
        const buttons = [], board = $('#mines-board');
        state.cells.forEach((_, i) => {
            const b = document.createElement('button'); b.type = 'button'; b.dataset.cell = i;
            board.append(b); buttons.push(b);
        });
        function render() {
            const flags = state.cells.filter((c) => c.flag).length;
            const opened = state.cells.filter((c) => c.open && !c.mine).length;
            $('#mines-status').textContent = state.over ? state.won ? 'Campo limpo! Todas as casas seguras foram abertas.' : 'Você encontrou uma mina.'
                : `${state.mines - flags} minas por marcar · ${opened}/${state.cells.length - state.mines} casas seguras abertas`;
            $('#mines-flag').textContent = `Modo bandeira: ${flagMode ? 'ligado' : 'desligado'}`;
            $('#mines-flag').setAttribute('aria-pressed', String(flagMode));
            buttons.forEach((b, i) => {
                const cell = state.cells[i], showMine = cell.mine && (state.over || cell.open);
                b.className = `mine-cell${cell.open ? ' revealed' : ''}${showMine ? ' mine' : ''}${state.hit === i ? ' exploded' : ''}`;
                b.textContent = showMine ? '✹' : cell.flag ? (state.over && !cell.mine ? '✕' : '⚑') : cell.open ? cell.count || '' : '';
                b.dataset.number = cell.count;
                b.disabled = state.over;
                b.setAttribute('aria-label', `Linha ${Math.floor(i / state.cols) + 1}, coluna ${i % state.cols + 1}, ${showMine ? 'mina' : cell.flag ? 'bandeira' : cell.open ? `${cell.count} minas vizinhas` : 'fechada'}`);
            });
        }
        function act(i, flag = flagMode) {
            if (state.over) return;
            if (flag) ClassicMines.flag(state, i);
            else {
                if (state.cells[i].flag) return;
                if (!state.planted) {
                    startedAt = session.now();
                    timer = session.interval(() => $('#mines-clock').textContent = `Tempo: ${Math.floor((session.now() - startedAt) / 1000)}s`, 1000);
                }
                if (state.cells[i].open) ClassicMines.chord(state, i, session.random);
                else ClassicMines.reveal(state, i, session.random);
            }
            render();
            if (state.over) {
                session.clear(timer);
                session.score.answer(state.won, 600);
                session.complete(state.won, { text: state.won ? `Campo ${state.rows} × ${state.cols} limpo, com ${state.mines} minas.` : 'Uma mina explodiu. Use os números para localizar as minas na próxima partida.' });
            }
        }
        session.listen(board, 'click', (e) => { const cell = e.target.closest('[data-cell]'); if (cell) act(Number(cell.dataset.cell)); });
        session.listen(board, 'contextmenu', (e) => { e.preventDefault(); const cell = e.target.closest('[data-cell]'); if (cell) act(Number(cell.dataset.cell), true); });
        session.listen(board, 'keydown', (e) => {
            const cell = e.target.closest('[data-cell]'); if (!cell) return;
            const i = Number(cell.dataset.cell);
            if (e.key.toLowerCase() === 'f') { e.preventDefault(); act(i, true); }
            const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -state.cols, ArrowDown: state.cols };
            if (e.key in offsets) { e.preventDefault(); buttons[i + offsets[e.key]]?.focus(); }
        });
        session.listen($('#mines-flag'), 'click', () => { flagMode = !flagMode; render(); });
        render();
    }
    return { init, destroy: session.destroy };
});
