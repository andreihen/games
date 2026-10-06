GameRegistry.register('flow', (session) => {
    function init(config) {
        const size = config.size,
            count = config.pairs,
            solution = GameAlgorithms.flowPuzzle(size, count, session.random),
            endpoints = solution.map((path) => [path[0], path.at(-1)]),
            colors = ['#f87171', '#4ade80', '#60a5fa', '#facc15', '#c084fc', '#2dd4bf'],
            symbols = ['●', '▲', '■', '◆', '★', '✚'];
        let paths = Array.from({ length: count }, () => []),
            drawing = null,
            undo = [],
            pointer = false,
            suppressUntil = 0;
        const $ = GameUI.shell(
            session,
            'Conecte os Pontos',
            'Conecte cores e símbolos iguais. Arraste para desenhar, ou toque nas casas vizinhas. Caminhos não podem se cruzar; todas as casas precisam ser preenchidas.',
            `<p id="flow-status" class="status-line"></p><div id="flow-grid-container" class="flow-grid" style="grid-template-columns:repeat(${size},1fr)"></div><div class="controls">${GameUI.button('Desfazer', 'flow-undo')}${GameUI.button('Reiniciar caminhos', 'flow-reset')}</div>`
        );
        const equal = (a, b) => a.r === b.r && a.c === b.c,
            pairAt = (cell) => endpoints.findIndex((pair) => pair.some((p) => equal(p, cell))),
            complete = (id) =>
                paths[id].length >= 2 &&
                endpoints[id].every((p) => paths[id].some((c) => equal(c, p)));
        const buttons = [];
        for (let r = 0; r < size; r++)
            for (let c = 0; c < size; c++) {
                const button = document.createElement('button');
                button.className = 'flow-cell';
                button.dataset.r = r;
                button.dataset.c = c;
                $('#flow-grid-container').append(button);
                buttons.push(button);
            }
        function render() {
            let filled = 0;
            buttons.forEach((b) => {
                const cell = { r: +b.dataset.r, c: +b.dataset.c },
                    pair = pairAt(cell),
                    id = paths.findIndex((path) => path.some((p) => equal(p, cell)));
                if (pair >= 0 || id >= 0) filled++;
                let lines = '';
                if (id >= 0) {
                    const at = paths[id].findIndex((p) => equal(p, cell));
                    for (const adjacent of [paths[id][at - 1], paths[id][at + 1]].filter(Boolean))
                        lines += `<line x1="50" y1="50" x2="${50 + (adjacent.c - cell.c) * 50}" y2="${50 + (adjacent.r - cell.r) * 50}" stroke="${colors[id]}" stroke-width="18" stroke-linecap="round"/>`;
                }
                b.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${lines}${pair >= 0 ? `<circle cx="50" cy="50" r="34" fill="${colors[pair]}"/><text x="50" y="62" text-anchor="middle" fill="#152239" font-size="36">${symbols[pair]}</text>` : ''}</svg>`;
                b.style.background = id >= 0 ? colors[id] + '20' : '#243650';
                b.setAttribute(
                    'aria-label',
                    `Linha ${cell.r + 1}, coluna ${cell.c + 1}${pair >= 0 ? `, ponto ${symbols[pair]}` : id >= 0 ? `, caminho ${symbols[id]}` : ', vazia'}`
                );
            });
            $('#flow-status').textContent =
                `Pares conectados: ${paths.filter((_, id) => complete(id)).length}/${count} · Espaços restantes: ${size * size - filled}`;
            $('#flow-undo').disabled = !undo.length;
            if (paths.every((_, id) => complete(id)) && filled === size * size) {
                session.score.add(1000);
                session.complete(true, {
                    text: 'Todos os pares conectados e todas as casas preenchidas.'
                });
            }
        }
        function remember() {
            undo.push({ paths: structuredClone(paths), drawing });
            if (undo.length > 300) undo.shift();
        }
        function visit(cell) {
            const pair = pairAt(cell);
            if (drawing === null || (pair >= 0 && pair !== drawing)) {
                if (pair < 0) return;
                remember();
                drawing = pair;
                paths[pair] = [cell];
                render();
                return;
            }
            const path = paths[drawing],
                last = path.at(-1);
            if (equal(last, cell)) return;
            if (Math.abs(last.r - cell.r) + Math.abs(last.c - cell.c) !== 1) return;
            if (paths.some((other, id) => id !== drawing && other.some((p) => equal(p, cell))))
                return session.notify('Outra linha ocupa esta casa. Desfaça ou contorne.');
            remember();
            const existing = path.findIndex((p) => equal(p, cell));
            if (existing >= 0) paths[drawing] = path.slice(0, existing + 1);
            else path.push(cell);
            if (complete(drawing)) drawing = null;
            render();
        }
        const grid = $('#flow-grid-container'),
            point = (el) => {
                const cell = el?.closest('.flow-cell');
                return cell ? { r: +cell.dataset.r, c: +cell.dataset.c } : null;
            };
        session.listen(grid, 'pointerdown', (event) => {
            if (event.button > 0) return;
            const cell = point(event.target);
            if (!cell) return;
            pointer = true;
            grid.setPointerCapture?.(event.pointerId);
            visit(cell);
        });
        session.listen(
            grid,
            'pointermove',
            (event) => {
                if (!pointer) return;
                event.preventDefault();
                const cell = point(document.elementFromPoint(event.clientX, event.clientY));
                if (cell) visit(cell);
            },
            { passive: false }
        );
        session.listen(grid, 'pointerup', () => {
            if (!pointer) return;
            pointer = false;
            suppressUntil = session.now() + 100;
        });
        session.listen(grid, 'pointercancel', () => {
            pointer = false;
            suppressUntil = 0;
        });
        session.listen(grid, 'click', (event) => {
            if (event.detail > 0 && session.now() < suppressUntil) {
                suppressUntil = 0;
                return;
            }
            const cell = point(event.target);
            if (cell) visit(cell);
        });
        session.listen($('#flow-undo'), 'click', () => {
            const state = undo.pop();
            if (state) {
                paths = state.paths;
                drawing = state.drawing;
                render();
            }
        });
        session.listen($('#flow-reset'), 'click', () => {
            remember();
            paths = Array.from({ length: count }, () => []);
            drawing = null;
            render();
        });
        render();
    }
    return { init, destroy: session.destroy };
});
