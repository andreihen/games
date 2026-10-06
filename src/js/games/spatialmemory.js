GameRegistry.register('spatialmemory', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            mode = config.options.mode || 'positions',
            size = [4, 5, 6, 6][tier],
            count = [3, 4, 6, 8][tier],
            palette = ['#60a5fa', '#f87171', '#4ade80', '#facc15'],
            names = ['azul', 'vermelho', 'verde', 'amarelo'];
        let round = 0,
            targets = [],
            blocked = [],
            answer = [],
            pickedColor = 0,
            ready = false;
        const $ = GameUI.shell(
            session,
            'Memória Espacial',
            'Observe as células e reproduza a configuração. Na sequência, a ordem importa; nas cores, selecione uma cor antes de marcar.',
            `<p id="spatial-progress" class="status-line"></p><div id="spatial-grid" class="tile-grid compact-grid" style="grid-template-columns:repeat(${size},1fr)"></div><div id="spatial-colors" class="controls ${mode === 'colors' ? '' : 'hidden'}">${palette.map((c, i) => `<button data-color="${i}" style="background:${c};color:#142338" aria-label="Cor ${names[i]}">${names[i]}</button>`).join('')}</div><div class="controls">${GameUI.button('Limpar resposta', 'spatial-clear')}${GameUI.button('Verificar', 'spatial-check', 'primary')}</div><p id="spatial-feedback" class="notice hidden"></p>${GameUI.button('Próxima configuração', 'spatial-next', 'primary')}`
        );
        function render(show = false, flash = -1) {
            const grid = $('#spatial-grid');
            grid.replaceChildren();
            for (let i = 0; i < size * size; i++) {
                const b = document.createElement('button'),
                    t = targets.find((t) => t.cell === i),
                    a = answer.find((t) => t.cell === i);
                b.className = blocked.includes(i) ? 'blocked' : '';
                b.disabled = !ready || blocked.includes(i);
                b.setAttribute(
                    'aria-label',
                    `Linha ${Math.floor(i / size) + 1}, coluna ${(i % size) + 1}${blocked.includes(i) ? ', bloqueada' : ''}`
                );
                if ((show && t && (mode !== 'sequence' || i === flash)) || a) {
                    const entry = a || t;
                    b.style.background = mode === 'colors' ? palette[entry.color] : '#73c3e9';
                    b.style.color = '#172238';
                    b.textContent =
                        mode === 'sequence' ? answer.findIndex((t) => t.cell === i) + 1 : '●';
                    if (mode === 'sequence' && show) b.textContent = '●';
                } else b.textContent = blocked.includes(i) ? '×' : '';
                session.listen(b, 'click', () => pick(i));
                grid.append(b);
            }
            $('#spatial-clear').disabled = !ready;
            $('#spatial-check').disabled = !ready;
        }
        function pick(cell) {
            if (!ready || blocked.includes(cell)) return;
            const existing = answer.findIndex((t) => t.cell === cell);
            if (existing >= 0) {
                if (mode === 'colors' && answer[existing].color !== pickedColor)
                    answer[existing].color = pickedColor;
                else answer.splice(existing, 1);
            } else if (answer.length < count) answer.push({ cell, color: pickedColor });
            render();
            $('#spatial-progress').textContent =
                `Configuração ${round}/6 · ${answer.length}/${count} células marcadas`;
        }
        async function next() {
            if (round === 6) {
                const s = session.score.snapshot();
                return session.complete(s.accuracy >= 60, {
                    text: 'Seis configurações espaciais concluídas.'
                });
            }
            round++;
            ready = false;
            answer = [];
            blocked =
                mode === 'obstacles'
                    ? session.random
                          .shuffle(Array.from({ length: size * size }, (_, i) => i))
                          .slice(0, tier + 2)
                    : [];
            targets = session.random
                .shuffle(
                    Array.from({ length: size * size }, (_, i) => i).filter(
                        (i) => !blocked.includes(i)
                    )
                )
                .slice(0, count)
                .map((cell) => ({ cell, color: session.random.int(0, 3) }));
            $('#spatial-feedback').classList.add('hidden');
            $('#spatial-next').classList.add('hidden');
            $('#spatial-progress').textContent =
                `Configuração ${round}/6 · Observe ${count} células.`;
            if (mode === 'sequence') {
                for (const target of targets) {
                    render(true, target.cell);
                    if (!(await session.sleep([850, 700, 550, 450][tier]))) return;
                    render(false);
                    if (!(await session.sleep(150))) return;
                }
            } else {
                render(true);
                if (!(await session.sleep([3500, 3500, 3000, 2500][tier]))) return;
            }
            ready = true;
            render();
            $('#spatial-progress').textContent =
                `Configuração ${round}/6 · Reproduza ${count} células${mode === 'sequence' ? ' na mesma ordem' : ''}.`;
        }
        session.listen($('#spatial-colors'), 'click', (event) => {
            const b = event.target.closest('[data-color]');
            if (b) {
                pickedColor = +b.dataset.color;
                $('#spatial-colors')
                    .querySelectorAll('button')
                    .forEach((el) => el.classList.toggle('selected', el === b));
            }
        });
        session.listen($('#spatial-clear'), 'click', () => {
            answer = [];
            render();
        });
        session.listen($('#spatial-check'), 'click', () => {
            if (!ready) return;
            ready = false;
            const correct =
                answer.length === targets.length &&
                (mode === 'sequence'
                    ? answer.every((a, i) => a.cell === targets[i].cell)
                    : targets.every((t) =>
                          answer.some(
                              (a) => a.cell === t.cell && (mode !== 'colors' || a.color === t.color)
                          )
                      ));
            session.score.answer(correct);
            answer = targets.map((t) => ({ ...t }));
            render();
            $('#spatial-feedback').classList.remove('hidden');
            $('#spatial-feedback').textContent = correct
                ? 'Configuração correta.'
                : 'A configuração original está exibida para comparação.';
            $('#spatial-next').classList.remove('hidden');
        });
        session.listen($('#spatial-next'), 'click', next);
        return next();
    },
    destroy: session.destroy
}));
