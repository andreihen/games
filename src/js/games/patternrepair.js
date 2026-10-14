GameRegistry.register('patternrepair', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            size = [3, 4, 5, 6][tier],
            scores = [],
            colors = ['#c56872', '#61a998', '#789ccd', '#d2b368', '#aa88c4'];
        let round = 0,
            original = [],
            board = [],
            selected = null,
            phase = 'idle',
            attempts = 0,
            moves = 0,
            started = 0;
        const $ = GameUI.shell(
            session,
            'Padrão Partido',
            'Memorize a grade. Algumas peças trocam de lugar; selecione duas para trocá-las de volta. As formas ajudam a distinguir as cores.',
            `<p id="pattern-round" class="status-line"></p><div id="pattern-board" class="pattern-board"></div><p id="pattern-status" role="status" class="status-line"></p>${GameUI.button('Observar padrão', 'pattern-action', 'primary')}<p id="pattern-result" class="notice hidden"></p>${GameUI.button('Próximo padrão', 'pattern-next', 'primary')}`
        );
        function paint() {
            $('#pattern-board').style.gridTemplateColumns = `repeat(${size},minmax(0,1fr))`;
            const items = phase === 'observe' ? original : board;
            $('#pattern-board').innerHTML = items
                .map(
                    (v, i) =>
                        `<button data-pattern-cell="${i}" aria-label="Linha ${Math.floor(i / size) + 1}, coluna ${(i % size) + 1}, ${['círculo', 'triângulo', 'losango', 'quadrado', 'estrela'][v]}" aria-pressed="${selected === i}" ${phase !== 'adjust' ? 'disabled' : ''} class="pattern-cell ${selected === i ? 'selected' : ''} ${phase === 'result' && v !== original[i] ? 'incorrect' : ''}" style="--pattern-color:${colors[v]}"><span>${['●', '▲', '◆', '■', '★'][v]}</span></button>`
                )
                .join('');
        }
        function shuffle() {
            board = [...original];
            const available = session.random.shuffle(board.map((_, i) => i));
            for (let n = 0; n < [1, 2, 3, 4][tier]; n++) {
                const a = available.shift(),
                    pos = available.findIndex((b) => board[a] !== board[b]);
                if (pos < 0) break;
                const b = available.splice(pos, 1)[0];
                [board[a], board[b]] = [board[b], board[a]];
            }
            phase = 'adjust';
            started = session.now();
            $('#pattern-status').textContent = 'Selecione duas peças para trocá-las.';
            $('#pattern-action').textContent = 'Verificar padrão';
            $('#pattern-action').disabled = false;
            paint();
        }
        function next() {
            round++;
            selected = null;
            attempts = 0;
            moves = 0;
            phase = 'idle';
            const count = [2, 3, 4, 5][tier],
                offset = session.random.int(0, count - 1),
                rule = session.random.int(0, 2);
            original = Array.from({ length: size * size }, (_, i) => {
                const r = Math.floor(i / size),
                    c = i % size;
                return (
                    (offset +
                        (rule === 0
                            ? r + c
                            : rule === 1
                              ? r + 2 * c
                              : Math.min(r, c, size - 1 - r, size - 1 - c))) %
                    count
                );
            });
            board = [];
            $('#pattern-round').textContent = `Padrão ${round} de 5 · ${size} × ${size}`;
            $('#pattern-status').textContent = 'Prepare-se para memorizar.';
            $('#pattern-action').textContent = 'Observar padrão';
            $('#pattern-action').disabled = false;
            $('#pattern-result').classList.add('hidden');
            $('#pattern-result').textContent = '';
            $('#pattern-next').classList.add('hidden');
            paint();
        }
        session.listen($('#pattern-board'), 'click', (e) => {
            if (phase !== 'adjust') return;
            const b = e.target.closest('[data-pattern-cell]');
            if (!b) return;
            const i = +b.dataset.patternCell;
            if (selected === null) selected = i;
            else if (selected === i) selected = null;
            else {
                [board[selected], board[i]] = [board[i], board[selected]];
                selected = null;
                moves++;
                $('#pattern-status').textContent =
                    `${moves} trocas · ${3 - attempts} verificações restantes`;
            }
            paint();
        });
        session.listen($('#pattern-action'), 'click', async () => {
            if (phase === 'idle') {
                phase = 'observe';
                $('#pattern-action').disabled = true;
                $('#pattern-status').textContent = 'Memorize a organização…';
                paint();
                if (await session.sleep(Perception.exposure(tier))) shuffle();
            } else if (phase === 'adjust') {
                attempts++;
                const correct = board.filter((v, i) => v === original[i]).length,
                    success = correct === board.length;
                if (success || attempts === 3) {
                    phase = 'result';
                    selected = null;
                    const elapsed = (session.now() - started) / 1000,
                        score = success
                            ? Math.max(70, 100 - Math.floor(elapsed / 4))
                            : Math.round((60 * correct) / board.length);
                    Perception.credit(session, scores, score, 80);
                    $('#pattern-status').textContent = success
                        ? 'Padrão restaurado!'
                        : 'Compare com a organização original.';
                    $('#pattern-result').textContent =
                        `${correct} de ${board.length} posições corretas · ${moves} trocas · ${elapsed.toFixed(1)} s · ${score} pontos de precisão.`;
                    if (!success)
                        $('#pattern-result').innerHTML +=
                            `<div class="pattern-reference" style="grid-template-columns:repeat(${size},1fr)">${original.map((v) => `<span style="color:${colors[v]}">${['●', '▲', '◆', '■', '★'][v]}</span>`).join('')}</div>`;
                    $('#pattern-result').classList.remove('hidden');
                    $('#pattern-action').disabled = true;
                    $('#pattern-next').classList.remove('hidden');
                    $('#pattern-next').textContent =
                        round === 5 ? 'Ver resultado' : 'Próximo padrão';
                    paint();
                } else
                    $('#pattern-status').textContent =
                        `${correct} de ${board.length} posições corretas. Restam ${3 - attempts} verificações.`;
            }
        });
        session.listen($('#pattern-next'), 'click', () => {
            if (phase !== 'result') return;
            round === 5 ? Perception.campaign(session, scores, 80) : next();
        });
        next();
    },
    destroy: session.destroy
}));
