GameRegistry.register('blockfit', (session) => {
    function init(config) {
        const { rows, cols, area, flip } = config,
            all = Array.from({ length: rows * cols }, (_, i) => ({
                r: Math.floor(i / cols),
                c: i % cols
            }));
        const blocked = session.random.shuffle(all).slice(0, config.blocked),
            blockedSet = new Set(blocked.map((c) => c.r * cols + c.c));
        const generated = GameAlgorithms.blockPuzzle(rows, cols, area, session.random, blocked),
            colors = ['#ed9fbd', '#74b6dc', '#91cc8d', '#e4c276', '#b8a2e3', '#75cec2'];
        const rotate = (m) => m[0].map((_, c) => m.map((row) => row[c]).reverse()),
            mirror = (m) => m.map((row) => [...row].reverse());
        const pieces = session.random.shuffle(generated.pieces).map((shape, id) => {
            for (let turn = 0, n = session.random.int(0, 3); turn < n; turn++)
                shape = rotate(shape);
            if (flip && session.random.float() < 0.5) shape = mirror(shape);
            return { id, shape, color: colors[id % colors.length], placed: false };
        });
        let board = Array(rows * cols).fill(null),
            selected = null,
            preview = [];
        const $ = GameUI.shell(
            session,
            'Bloco Fit',
            'Arraste uma peça para a célula onde seu canto superior esquerdo deve ficar. Também pode selecionar e tocar. Casas escuras são bloqueadas. Todas as peças cabem.',
            `<div id="blockfit-target-grid" class="tile-grid touch-drag" style="grid-template-columns:repeat(${cols},1fr);width:min(100%,420px)"></div><div class="controls">${GameUI.button('Girar ↺', 'bf-rotate')}${GameUI.button('Espelhar ↔', 'bf-flip')}${GameUI.button('Verificar', 'bf-check-solution', 'primary')}</div><div id="blockfit-pieces-container" class="pieces-tray touch-drag"></div><p id="blockfit-progress" class="status-line"></p>`
        );
        const cells = [];
        for (let i = 0; i < rows * cols; i++) {
            const button = document.createElement('button');
            button.className = 'block-cell';
            button.dataset.cell = i;
            button.setAttribute(
                'aria-label',
                `Linha ${Math.floor(i / cols) + 1}, coluna ${(i % cols) + 1}${blockedSet.has(i) ? ', bloqueada' : ''}`
            );
            button.disabled = blockedSet.has(i);
            $('#blockfit-target-grid').append(button);
            cells.push(button);
        }
        function targets(piece, index) {
            const r = Math.floor(index / cols),
                c = index % cols,
                out = [];
            for (let dr = 0; dr < piece.shape.length; dr++)
                for (let dc = 0; dc < piece.shape[dr].length; dc++)
                    if (piece.shape[dr][dc]) {
                        if (r + dr >= rows || c + dc >= cols) return null;
                        const i = (r + dr) * cols + c + dc;
                        if (blockedSet.has(i) || board[i] !== null) return null;
                        out.push(i);
                    }
            return out;
        }
        function render() {
            cells.forEach((button, i) => {
                button.classList.toggle('blocked', blockedSet.has(i));
                button.classList.toggle('preview', preview.includes(i));
                button.style.background = board[i] === null ? '' : pieces[board[i]].color;
                button.textContent = '';
            });
            $('#blockfit-pieces-container').replaceChildren();
            for (const piece of pieces.filter((p) => !p.placed)) {
                const button = document.createElement('button');
                button.className = 'puzzle-piece' + (selected === piece.id ? ' selected' : '');
                button.dataset.piece = piece.id;
                button.setAttribute('aria-label', `Peça ${piece.id + 1}`);
                const mini = document.createElement('div');
                mini.style.display = 'grid';
                mini.style.gridTemplateColumns = `repeat(${piece.shape[0].length},16px)`;
                for (const row of piece.shape)
                    for (const value of row) {
                        const cell = document.createElement('span');
                        cell.style.width = '16px';
                        cell.style.height = '16px';
                        cell.style.border = value ? '1px solid #20324b' : 'none';
                        cell.style.background = value ? piece.color : 'transparent';
                        mini.append(cell);
                    }
                button.append(mini);
                $('#blockfit-pieces-container').append(button);
            }
            $('#bf-flip').disabled = !flip || selected === null;
            $('#bf-rotate').disabled = selected === null;
            $('#blockfit-progress').textContent =
                `Peças restantes: ${pieces.filter((p) => !p.placed).length} · Casas livres: ${board.filter((value, i) => value === null && !blockedSet.has(i)).length}`;
        }
        function place(id, index) {
            const piece = pieces[id],
                cells = targets(piece, index);
            preview = [];
            if (!cells)
                return session.notify('A peça não cabe. Gire, espelhe ou escolha outra posição.');
            cells.forEach((i) => (board[i] = id));
            piece.placed = true;
            selected = null;
            render();
        }
        session.listen($('#blockfit-pieces-container'), 'click', (event) => {
            const piece = event.target.closest('[data-piece]');
            if (piece) {
                selected = selected === +piece.dataset.piece ? null : +piece.dataset.piece;
                render();
            }
        });
        session.listen($('#blockfit-target-grid'), 'click', (event) => {
            const button = event.target.closest('[data-cell]');
            if (!button || blockedSet.has(+button.dataset.cell)) return;
            const i = +button.dataset.cell;
            if (selected !== null) place(selected, i);
            else if (board[i] !== null) {
                selected = board[i];
                pieces[selected].placed = false;
                board = board.map((value) => (value === selected ? null : value));
                render();
            }
        });
        GameUI.drag(session, session.ui.phaseDisplay, {
            selector: '[data-piece]',
            start: (el) => {
                selected = +el.dataset.piece;
                return selected;
            },
            move: (id, target) => {
                const cell = target?.closest('[data-cell]');
                preview = cell ? targets(pieces[id], +cell.dataset.cell) || [] : [];
                cells.forEach((b, i) => b.classList.toggle('preview', preview.includes(i)));
            },
            drop: (id, target) => {
                const cell = target?.closest('[data-cell]');
                if (cell) place(id, +cell.dataset.cell);
                preview = [];
                render();
            },
            cancel: () => {
                preview = [];
                render();
            }
        });
        const transform = (type) => {
            if (selected === null || (type === 'flip' && !flip)) return;
            pieces[selected].shape =
                type === 'rotate' ? rotate(pieces[selected].shape) : mirror(pieces[selected].shape);
            render();
        };
        session.listen($('#bf-rotate'), 'click', () => transform('rotate'));
        session.listen($('#bf-flip'), 'click', () => transform('flip'));
        session.listen(document, 'keydown', (event) => {
            if (['r', 'f'].includes(event.key.toLowerCase())) {
                event.preventDefault();
                transform(event.key.toLowerCase() === 'r' ? 'rotate' : 'flip');
            }
        });
        session.listen($('#bf-check-solution'), 'click', () => {
            if (
                pieces.some((p) => !p.placed) ||
                board.some((value, i) => value === null && !blockedSet.has(i))
            )
                return session.notify('Ainda há peças ou casas livres. Continue ajustando.');
            session.score.add(1000);
            session.complete(true, {
                text: 'Todas as peças encaixadas, sem sobreposição nem casas livres.'
            });
        });
        render();
    }
    return { init, destroy: session.destroy };
});
