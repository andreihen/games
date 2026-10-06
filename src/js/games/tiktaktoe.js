GameRegistry.register('tictactoe', (session) => {
    function init(config) {
        const friend = config.options.mode === 'friend',
            lines = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6]
            ];
        let queues = { X: [], O: [] },
            turn = 'X',
            round = 1,
            wins = { X: 0, O: 0 },
            locked = false,
            last = -1,
            turns = 0,
            states = new Map();
        const $ = GameUI.shell(
            session,
            'Velha: Peças Móveis',
            'Forme uma linha de três. Na quarta jogada, sua peça mais antiga sai para dar lugar à nova. Opacidade e contorno mostram qual será movida. Melhor de três rodadas.',
            `<p id="tttm-score" class="status-line"></p><p id="tttm-status" class="notice" role="status"></p><div id="tttm-board" class="tile-grid" style="grid-template-columns:repeat(3,1fr);max-width:340px"></div>${GameUI.button('Próxima rodada', 'tttm-next', 'primary')}`
        );
        const winner = (q) =>
            lines.find((line) => line.every((i) => q.X.includes(i)))
                ? 'X'
                : lines.find((line) => line.every((i) => q.O.includes(i)))
                  ? 'O'
                  : null;
        const legal = (q) =>
            Array.from({ length: 9 }, (_, i) => i).filter(
                (i) => !q.X.includes(i) && !q.O.includes(i)
            );
        function apply(q, player, index) {
            const next = { X: [...q.X], O: [...q.O] };
            if (next[player].length === 3) next[player].shift();
            next[player].push(index);
            return next;
        }
        const key = (q, player) => `${q.X.join('')}:${q.O.join('')}:${player}`;
        function rational() {
            const memo = new Map();
            let nodes = 0;
            const depth = config.depth;
            function search(q, player, left, seen) {
                const win = winner(q);
                if (win) return win === 'O' ? 100 + left : -100 - left;
                const state = key(q, player);
                if (seen.has(state)) return 0;
                if (!left || ++nodes > 90000) {
                    let value = 0;
                    for (const line of lines) {
                        const x = line.filter((i) => q.X.includes(i)).length,
                            o = line.filter((i) => q.O.includes(i)).length;
                        if (!x) value += o * o;
                        if (!o) value -= x * x;
                    }
                    return value;
                }
                const cacheKey = state + ':' + left;
                if (memo.has(cacheKey)) return memo.get(cacheKey);
                const nextSeen = new Set(seen);
                nextSeen.add(state);
                const values = legal(q).map((i) =>
                    search(apply(q, player, i), player === 'X' ? 'O' : 'X', left - 1, nextSeen)
                );
                const result = player === 'O' ? Math.max(...values) : Math.min(...values);
                memo.set(cacheKey, result);
                return result;
            }
            const rated = legal(queues).map((i) => ({
                    i,
                    value: search(apply(queues, 'O', i), 'X', depth, new Set())
                })),
                best = Math.max(...rated.map((x) => x.value));
            return session.random.pick(rated.filter((x) => x.value === best)).i;
        }
        const buttons = [];
        for (let i = 0; i < 9; i++) {
            const b = document.createElement('button');
            b.dataset.index = i;
            b.style.fontSize = '2.8rem';
            session.listen(b, 'click', () => {
                if (locked || (!friend && turn === 'O') || !legal(queues).includes(i)) return;
                play(i);
            });
            $('#tttm-board').append(b);
            buttons.push(b);
        }
        function render() {
            buttons.forEach((b, i) => {
                const owner = queues.X.includes(i) ? 'X' : queues.O.includes(i) ? 'O' : null;
                b.textContent = owner || '';
                b.className = 'ttt-cell';
                b.style.opacity = '1';
                b.style.color = owner === 'X' ? '#ffa9a9' : '#91c7ff';
                if (owner) {
                    const age = queues[owner].indexOf(i),
                        length = queues[owner].length;
                    b.style.opacity = String([0.45, 0.75, 1][3 - length + age]);
                    if (length === 3 && age === 0) b.classList.add('ttt-oldest');
                    if (i === last) b.classList.add('ttt-new');
                }
                b.disabled = locked || (!friend && turn === 'O');
                b.setAttribute(
                    'aria-label',
                    `Casa ${i + 1}, ${owner || 'vazia'}${owner && queues[owner].length === 3 && queues[owner][0] === i ? ', próxima peça a sair' : ''}`
                );
            });
            $('#tttm-score').textContent = `Rodada ${round}/3 · X ${wins.X} × ${wins.O} O`;
        }
        function finish(win) {
            locked = true;
            if (win) wins[win]++;
            session.score.answer(friend ? Boolean(win) : win === 'X', 300);
            $('#tttm-status').textContent = win
                ? `${win} venceu a rodada. Quem perdeu começa a próxima.`
                : 'Empate por repetição ou limite de jogadas.';
            render();
            if (wins.X === 2 || wins.O === 2 || round === 3) {
                const success = friend ? wins.X !== wins.O : wins.X > wins.O;
                session.complete(success, {
                    text: `Placar final: X ${wins.X} × ${wins.O} O. ${wins.X === wins.O ? 'Empate.' : `${wins.X > wins.O ? 'X' : 'O'} venceu a partida.`}`
                });
            } else {
                $('#tttm-next').classList.remove('hidden');
                $('#tttm-next').dataset.starter =
                    round === 1 ? (win ? (win === 'X' ? 'O' : 'X') : 'X') : 'X';
            }
        }
        function bot() {
            locked = true;
            render();
            session.timeout(() => {
                if (!session.active) return;
                const index =
                    session.random.float() < config.random
                        ? session.random.pick(legal(queues))
                        : rational();
                locked = false;
                play(index);
            }, 450);
        }
        function play(index) {
            queues = apply(queues, turn, index);
            last = index;
            turns++;
            const win = winner(queues);
            if (win) return finish(win);
            turn = turn === 'X' ? 'O' : 'X';
            const state = key(queues, turn),
                seen = (states.get(state) || 0) + 1;
            states.set(state, seen);
            if (seen >= 3 || turns >= 90) return finish(null);
            $('#tttm-status').textContent =
                `Vez de ${turn}${!friend && turn === 'O' ? ' · bot pensando…' : ''}`;
            render();
            if (!friend && turn === 'O') bot();
        }
        session.listen($('#tttm-next'), 'click', () => {
            round++;
            queues = { X: [], O: [] };
            turn = $('#tttm-next').dataset.starter;
            locked = false;
            last = -1;
            turns = 0;
            states = new Map();
            $('#tttm-next').classList.add('hidden');
            $('#tttm-status').textContent =
                `Vez de ${turn} · ${round === 2 ? 'quem perdeu começa' : 'terceira rodada sem vantagem adicional'}.`;
            render();
            if (!friend && turn === 'O') bot();
        });
        $('#tttm-next').classList.add('hidden');
        $('#tttm-status').textContent = 'Vez de X';
        render();
    }
    return { init, destroy: session.destroy };
});
