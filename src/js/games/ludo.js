GameRegistry.register('ludo', (session) => {
    function init(config) {
        const count = Number(config.options.players || 2);
        const humans = Math.min(count, Number(config.options.humans || 1));
        let state = ClassicLudo.initial(count), dice = null, phase = 'roll', message = 'Lance o dado para começar.';
        const names = ['Vermelho', 'Azul', 'Amarelo', 'Verde'];
        const isBot = () => state.turn >= humans;
        const $ = GameUI.shell(session, 'Ludo',
            'De 2 a 4 participantes; as primeiras cores são pessoas e as restantes são bots. Tire 6 para sair da base. Clique no peão destacado ou no botão Escolher peão depois de lançar o dado. Um 6 permite jogar novamente; três 6 seguidos perdem a vez antes de mover. Capture adversários em casas sem estrela; casas com estrela são seguras. Nesta variante não há barreiras nem bônus por captura ou chegada. Peões podem compartilhar casas. É preciso tirar o valor exato para chegar ao centro. Vence quem levar seus quatro peões até a chegada. O dado é igual em todos os níveis; a dificuldade altera só as escolhas do bot.',
            `<p class="classic-mode">${count} participantes · ${humans} pessoa${humans > 1 ? 's' : ''}${humans < count ? ` · bots ${config.difficultyName.toLowerCase()}` : ''}</p>
            <p id="ludo-status" class="notice" role="status" aria-live="polite"></p>
            <div class="ludo-toolbar"><span id="ludo-dice" class="ludo-dice" aria-label="Dado ainda não lançado">⚄</span>${GameUI.button('Lançar dado', 'ludo-roll', 'primary')}</div>
            <div id="ludo-moves" class="classic-actions" role="group" aria-label="Escolher peão"></div>
            <div id="ludo-board" class="ludo-board" aria-label="Tabuleiro de Ludo"></div>
            <div id="ludo-players" class="ludo-players"></div>`);
        const board = $('#ludo-board'), cells = [];
        for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) {
            const cell = document.createElement('div'); cell.className = 'ludo-cell';
            if (r < 6 && c < 6) cell.classList.add('ludo-home', 'ludo-color-0');
            if (r < 6 && c > 8) cell.classList.add('ludo-home', 'ludo-color-1');
            if (r > 8 && c > 8) cell.classList.add('ludo-home', 'ludo-color-2');
            if (r > 8 && c < 6) cell.classList.add('ludo-home', 'ludo-color-3');
            if (r >= 6 && r <= 8 && c >= 6 && c <= 8) cell.classList.add('ludo-center');
            const track = ClassicLudo.track.findIndex(([y, x]) => y === r && x === c);
            if (track >= 0) {
                cell.classList.add('ludo-track');
                if (ClassicLudo.safe.has(track)) { cell.classList.add('ludo-safe'); cell.dataset.safe = 'true'; }
                if (track % 13 === 0) cell.classList.add(`ludo-color-${track / 13}`, 'ludo-start');
            }
            ClassicLudo.lanes.forEach((lane, color) => {
                if (lane.some(([y, x]) => y === r && x === c)) cell.classList.add('ludo-lane', `ludo-color-${color}`);
            });
            board.append(cell); cells.push(cell);
        }
        const tokens = state.players.map((p, player) => p.pieces.map((_, piece) => {
            const b = document.createElement('button'); b.type = 'button';
            b.className = `ludo-token ludo-color-${p.color}`; b.dataset.player = player; b.dataset.piece = piece;
            b.textContent = piece + 1;
            return b;
        }));
        const cards = state.players.map((p, player) => {
            const card = document.createElement('p'); card.className = `ludo-player ludo-color-${p.color}`;
            $('#ludo-players').append(card); return card;
        });
        function render() {
            const legal = phase === 'choose' ? ClassicLudo.moves(state, dice) : [];
            $('#ludo-status').textContent = phase === 'ended' ? message : `Vez de ${names[state.players[state.turn].color]}${isBot() ? ' · bot' : ' · pessoa'} · ${message}`;
            $('#ludo-roll').disabled = phase !== 'roll' || isBot();
            $('#ludo-dice').textContent = dice ? ['⚀','⚁','⚂','⚃','⚄','⚅'][dice - 1] : '—';
            $('#ludo-dice').setAttribute('aria-label', dice ? `Dado: ${dice}` : 'Dado ainda não lançado');
            const moves = $('#ludo-moves'); moves.replaceChildren();
            if (!isBot()) legal.forEach((m) => {
                const button = document.createElement('button');
                button.className = 'button button-secondary'; button.dataset.player = state.turn; button.dataset.piece = m.piece;
                button.textContent = `Escolher peão ${m.piece + 1} · ${m.from < 0 ? 'sair da base' : m.to === 56 ? 'chegar' : `avançar ${dice}`}`;
                moves.append(button);
            });
            state.players.forEach((p, player) => {
                cards[player].textContent = `${names[p.color]} · ${player < humans ? `Pessoa ${player + 1}` : `Bot ${config.difficultyName}`} · ${p.pieces.filter((at) => at === 56).length}/4 na chegada`;
                cards[player].classList.toggle('active-player', player === state.turn && phase !== 'ended');
                p.pieces.forEach((at, piece) => {
                    const b = tokens[player][piece], [r, c] = ClassicLudo.position(p.color, at, piece);
                    cells[r * 15 + c].append(b);
                    const playable = player === state.turn && legal.some((m) => m.piece === piece);
                    b.classList.toggle('playable', playable);
                    b.disabled = !playable || isBot();
                    b.dataset.progress = at;
                    b.setAttribute('aria-label', `${names[p.color]}, peão ${piece + 1}, ${at < 0 ? 'na base' : at === 56 ? 'na chegada' : `passo ${at + 1}`}${playable ? ', pode mover' : ''}`);
                });
            });
        }
        function scheduleBot() {
            if (phase === 'roll' && isBot()) session.timeout(roll, 650);
        }
        function next(extra = false) {
            state = ClassicLudo.pass(state, extra); phase = 'roll';
            message = extra ? 'Tirou 6: lance novamente.' : 'Lance o dado.';
            render(); scheduleBot();
        }
        function move(choice) {
            if (phase !== 'choose') return;
            const player = state.turn;
            const result = ClassicLudo.apply(state, choice, dice);
            state = result.state;
            if (state.winner !== null) {
                phase = 'ended'; message = `${names[state.players[player].color]} venceu com os quatro peões na chegada!`;
                render();
                const success = player < humans;
                session.score.answer(success, 600);
                session.complete(success, { text: message, winner: player });
                return;
            }
            phase = 'roll';
            message = `${result.captured ? `${result.captured} peão capturado. ` : ''}${dice === 6 ? 'Tirou 6: jogue novamente.' : 'Lance o dado.'}`;
            render(); scheduleBot();
        }
        function roll() {
            if (phase !== 'roll') return;
            dice = session.random.int(1, 6);
            state = { ...state, sixes: dice === 6 ? state.sixes + 1 : 0 };
            if (state.sixes === 3) {
                phase = 'passing'; message = 'Três 6 seguidos: perdeu a vez.'; render();
                session.timeout(() => next(false), 850); return;
            }
            const legal = ClassicLudo.moves(state, dice);
            phase = legal.length ? 'choose' : 'passing';
            message = legal.length ? `Dado ${dice}: ${isBot() ? 'bot escolhendo…' : 'escolha um peão destacado.'}` : `Dado ${dice}: nenhum movimento possível.`;
            render();
            if (!legal.length) session.timeout(() => next(dice === 6), 850);
            else if (isBot()) session.timeout(() => move(ClassicLudo.choose(state, dice, config.strategy, session.random)), 450);
        }
        session.listen($('#ludo-roll'), 'click', () => { if (!isBot()) roll(); });
        function chooseToken(event) {
            const token = event.target.closest('[data-piece]');
            if (!token || isBot() || phase !== 'choose' || Number(token.dataset.player) !== state.turn) return;
            const choice = ClassicLudo.moves(state, dice).find((m) => m.piece === Number(token.dataset.piece));
            if (choice) move(choice);
        }
        session.listen(board, 'click', chooseToken);
        session.listen($('#ludo-moves'), 'click', chooseToken);
        render(); scheduleBot();
    }
    return { init, destroy: session.destroy };
});
