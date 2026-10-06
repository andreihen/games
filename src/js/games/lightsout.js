GameRegistry.register('lightsout', (session) => {
    function init(config) {
        const size = config.size,
            modifier = config.options.modifier || 'cross',
            n = size * size;
        function affected(index) {
            const r = Math.floor(index / size),
                c = index % size,
                delta =
                    modifier === 'diagonal'
                        ? [
                              [0, 0],
                              [1, 0],
                              [-1, 0],
                              [0, 1],
                              [0, -1],
                              [1, 1],
                              [1, -1],
                              [-1, 1],
                              [-1, -1]
                          ]
                        : modifier === 'long'
                          ? [
                                [0, 0],
                                [1, 0],
                                [-1, 0],
                                [0, 1],
                                [0, -1],
                                [2, 0],
                                [-2, 0],
                                [0, 2],
                                [0, -2]
                            ]
                          : [
                                [0, 0],
                                [1, 0],
                                [-1, 0],
                                [0, 1],
                                [0, -1]
                            ];
            return [
                ...new Set(
                    delta
                        .map(([dr, dc]) => {
                            let rr = r + dr,
                                cc = c + dc;
                            if (modifier === 'torus') {
                                rr = (rr + size) % size;
                                cc = (cc + size) % size;
                            }
                            return rr >= 0 && rr < size && cc >= 0 && cc < size
                                ? rr * size + cc
                                : -1;
                        })
                        .filter((i) => i >= 0)
                )
            ];
        }
        let board = Array(n).fill(0),
            moves = 0,
            preview = false,
            selected = null;
        const toggle = (index) => affected(index).forEach((i) => (board[i] ^= 1));
        for (let i = 0; i < config.moves; i++) toggle(session.random.int(0, n - 1));
        if (!board.some(Boolean)) toggle(session.random.int(0, n - 1));
        const matrix = Array.from({ length: n }, (_, i) =>
            Array.from({ length: n + 1 }, (_, j) =>
                j === n ? board[i] : Number(affected(j).includes(i))
            )
        );
        let row = 0;
        const pivots = [];
        for (let col = 0; col < n; col++) {
            const p = matrix.findIndex((r, i) => i >= row && r[col]);
            if (p < 0) continue;
            [matrix[p], matrix[row]] = [matrix[row], matrix[p]];
            for (let r = 0; r < n; r++)
                if (r !== row && matrix[r][col])
                    for (let c = col; c <= n; c++) matrix[r][c] ^= matrix[row][c];
            pivots.push(col);
            row++;
        }
        const free = Array.from({ length: n }, (_, i) => i).filter((i) => !pivots.includes(i));
        let minimum = Infinity;
        const proven = free.length <= 20;
        for (let mask = 0; mask < (proven ? 2 ** free.length : 1); mask++) {
            const solution = Array(n).fill(0);
            free.forEach((col, i) => (solution[col] = (mask >>> i) & 1));
            pivots.forEach((col, r) => {
                solution[col] = matrix[r][n];
                for (const f of free) solution[col] ^= matrix[r][f] & solution[f];
            });
            minimum = Math.min(
                minimum,
                solution.reduce((a, b) => a + b, 0)
            );
        }
        const $ = GameUI.shell(
            session,
            'Apague as Luzes',
            'Apague todas as células. Ative a prévia para enxergar o efeito antes de aplicar. Você pode usar quantos movimentos precisar.',
            `<p id="lights-stats" class="status-line"></p><div id="lights-out-grid-container" class="tile-grid" style="grid-template-columns:repeat(${size},1fr)"></div><div class="controls">${GameUI.button('Pré-visualizar movimento', 'lights-preview')}${GameUI.button('Aplicar movimento', 'lights-apply', 'primary')}</div>`
        );
        const grid = $('#lights-out-grid-container'),
            buttons = [];
        function render() {
            buttons.forEach((b, i) => {
                b.classList.toggle('light-on', Boolean(board[i]));
                b.classList.toggle('light-off', !board[i]);
                b.textContent = board[i] ? '●' : '○';
                b.setAttribute('aria-pressed', Boolean(board[i]));
                b.setAttribute(
                    'aria-label',
                    `Linha ${Math.floor(i / size) + 1}, coluna ${(i % size) + 1}, ${board[i] ? 'acesa' : 'apagada'}`
                );
                b.classList.toggle(
                    'selected',
                    preview && selected !== null && affected(selected).includes(i)
                );
            });
            $('#lights-stats').textContent =
                `Movimentos realizados: ${moves} · ${proven ? 'Solução mínima' : 'Melhor solução encontrada'}: ${minimum}`;
            $('#lights-preview').setAttribute('aria-pressed', preview);
            $('#lights-apply').classList.toggle('hidden', !preview);
            $('#lights-apply').disabled = selected === null;
        }
        function play(index) {
            toggle(index);
            moves++;
            render();
            if (!board.some(Boolean)) {
                session.score.add(Math.max(100, 1500 - (moves - minimum) * 80));
                const medal =
                    proven && moves === minimum
                        ? 'Ouro'
                        : moves <= minimum + 2
                          ? 'Prata'
                          : moves <= minimum + 5
                            ? 'Bronze'
                            : 'Concluído';
                session.score.set({ moves, minimum, medal });
                session.complete(true, {
                    text: `${medal} · ${moves} movimentos. ${proven ? 'Mínimo comprovado' : 'Melhor conhecido'}: ${minimum}.`
                });
            }
        }
        for (let i = 0; i < n; i++) {
            const b = document.createElement('button');
            b.className = 'light-button';
            session.listen(b, 'click', () => {
                selected = i;
                if (preview) render();
                else play(i);
            });
            session.listen(b, 'pointerenter', () => {
                if (preview) {
                    selected = i;
                    render();
                }
            });
            session.listen(b, 'focus', () => {
                if (preview) {
                    selected = i;
                    render();
                }
            });
            grid.append(b);
            buttons.push(b);
        }
        session.listen($('#lights-preview'), 'click', () => {
            preview = !preview;
            render();
        });
        session.listen($('#lights-apply'), 'click', () => {
            if (selected !== null) play(selected);
        });
        render();
    }
    return { init, destroy: session.destroy };
});
