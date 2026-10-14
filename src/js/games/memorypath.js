GameRegistry.register('memorypath', (session) => {
    function init(config) {
        const mode = config.options.mode || 'spatial',
            size = config.size,
            tier = DifficultyEngine.index(config.difficulty),
            route =
                mode === 'spatial'
                    ? session.random.shuffle(
                          Array.from({ length: size * size }, (_, i) => ({
                              r: Math.floor(i / size),
                              c: i % size
                          }))
                      )
                    : GameAlgorithms.route(size, session.random);
        let path = route.slice(0, config.length),
            teleport = -1;
        const rotated = mode === 'rotation';
        if (tier === 3 && mode === 'directions') {
            teleport = 3;
            path = [
                ...route.slice(0, teleport),
                ...route.slice(teleport + 5, teleport + 5 + config.length - teleport)
            ];
        }
        const blocked = session.random
            .shuffle(route.filter((cell) => !path.some((p) => p.r === cell.r && p.c === cell.c)))
            .slice(0, tier * 2);
        let expected = [...path],
            index = 0,
            ready = false;
        const $ = GameUI.shell(
            session,
            'Trilha da Memória',
            `Memorize ${path.length} posições. ${rotated ? 'Depois, a grade gira 90° no sentido horário.' : ''} ${mode === 'directions' ? 'Use as direções para percorrer a rota.' : 'Os quadrados acendem um por vez. Repita a ordem tocando nas mesmas posições.'}`,
            `<p id="mp-status" class="notice" role="status">Observe a trilha…</p><p id="mp-directions" class="status-line"></p><div id="mp-grid-container" class="tile-grid" style="grid-template-columns:repeat(${size},1fr)"></div><div id="mp-controls" class="direction-pad hidden"><button data-direction="up">↑</button><button data-direction="left">←</button><button data-direction="down">↓</button><button data-direction="right">→</button></div>${GameUI.button('Usar teletransporte', 'mp-teleport')}`
        );
        const buttons = [];
        for (let i = 0; i < size * size; i++) {
            const button = document.createElement('button');
            button.dataset.cell = i;
            button.setAttribute(
                'aria-label',
                `Linha ${Math.floor(i / size) + 1}, coluna ${(i % size) + 1}`
            );
            $('#mp-grid-container').append(button);
            buttons.push(button);
        }
        const cellIndex = (cell) => cell.r * size + cell.c,
            rotate = (cell) => ({ r: cell.c, c: size - 1 - cell.r });
        function renderBase(rotated = false) {
            buttons.forEach((b) => {
                b.textContent = '';
                b.className = '';
                b.disabled = !ready;
            });
            for (const cell of blocked) {
                const transformed = rotated ? rotate(cell) : cell;
                buttons[cellIndex(transformed)].className = 'blocked';
                buttons[cellIndex(transformed)].textContent = '×';
                buttons[cellIndex(transformed)].disabled = true;
            }
        }
        function answer(i) {
            if (!ready) return;
            const correct = i === cellIndex(expected[index]);
            session.score.answer(correct);
            if (!correct) {
                ready = false;
                buttons[i].classList.add('incorrect');
                return session.complete(false, {
                    text: `O passo ${index + 1} era a linha ${expected[index].r + 1}, coluna ${expected[index].c + 1}. Repita o mesmo desafio para praticar.`
                });
            }
            buttons[i].classList.add('correct');
            index++;
            buttons[i].textContent = index;
            $('#mp-status').textContent = `Passos: ${index}/${expected.length}`;
            if (index === expected.length) {
                ready = false;
                session.complete(true, { text: 'Trilha reproduzida corretamente.' });
            }
        }
        session.listen($('#mp-grid-container'), 'click', (event) => {
            const button = event.target.closest('[data-cell]');
            if (button) answer(+button.dataset.cell);
        });
        function direction(key) {
            if (!ready || index === 0) return;
            const current = expected[index - 1],
                delta = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[key],
                r = current.r + delta[0],
                c = current.c + delta[1];
            if (r >= 0 && r < size && c >= 0 && c < size) answer(r * size + c);
        }
        session.listen($('#mp-controls'), 'click', (event) => {
            const key = event.target.closest('[data-direction]')?.dataset.direction;
            if (key) direction(key);
        });
        session.listen(document, 'keydown', (event) => {
            const key = {
                ArrowUp: 'up',
                ArrowDown: 'down',
                ArrowLeft: 'left',
                ArrowRight: 'right'
            }[event.key];
            if (key) {
                event.preventDefault();
                direction(key);
            }
        });
        session.listen($('#mp-teleport'), 'click', () => {
            if (ready && index === teleport) answer(cellIndex(expected[index]));
            else session.notify('O teletransporte só funciona quando você chega à casa marcada.');
        });
        $('#mp-teleport').classList.add('hidden');
        renderBase();
        async function present() {
            if (!(await session.sleep(600))) return;
            if (mode === 'directions') {
                const arrows = path.slice(1).map((cell, i) => {
                    const prev = path[i],
                        dr = cell.r - prev.r,
                        dc = cell.c - prev.c;
                    return Math.abs(dr) + Math.abs(dc) > 1
                        ? '◎'
                        : dr < 0
                          ? '↑'
                          : dr > 0
                            ? '↓'
                            : dc < 0
                              ? '←'
                              : '→';
                });
                $('#mp-directions').textContent = arrows.join(' ');
                buttons[cellIndex(path[0])].textContent = 'S';
                if (!(await session.sleep(4000))) return;
            } else {
                for (const cell of path) {
                    const b = buttons[cellIndex(cell)];
                    b.classList.add('flash');
                    if (!(await session.sleep([850, 700, 550, 420][tier]))) return;
                    b.classList.remove('flash');
                    if (!(await session.sleep(180))) return;
                }
            }
            renderBase();
            $('#mp-directions').textContent = '';
            if (mode === 'interference') {
                $('#mp-status').textContent =
                    `Interferência: ${session.random.pick(['★ ● ▲', '■ ◆ ●', '▲ ★ ■'])}`;
                if (!(await session.sleep(700))) return;
            }
            if (!(await session.sleep(config.delay))) return;
            if (rotated) {
                expected = path.map(rotate);
                renderBase(true);
            }
            if (teleport >= 0) {
                buttons[cellIndex(expected[teleport - 1])].textContent = '◎';
                buttons[cellIndex(expected[teleport])].textContent = '◎';
                $('#mp-teleport').classList.remove('hidden');
            }
            ready = true;
            buttons.forEach((b) => {
                if (!b.classList.contains('blocked')) b.disabled = false;
            });
            $('#mp-status').textContent =
                `Sua vez: ${expected.length} posições. ${rotated ? 'Grade girada 90° no sentido horário.' : ''}`;
            if (mode === 'directions') {
                $('#mp-controls').classList.remove('hidden');
                answer(cellIndex(expected[0]));
                buttons[cellIndex(expected[0])].textContent = 'S';
            }
        }
        return present();
    }
    return { init, destroy: session.destroy };
});
