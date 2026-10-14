const ClassicBoardUI = Object.freeze({
    coordinate: (i) => 'abcdefgh'[i & 7] + (8 - (i >> 3)),
    mount(session, config, engine, chess) {
        const local = config.options.mode === 'friend';
        const human = config.options.side === 'black' ? 'b' : 'w';
        const names = { w: 'Brancas', b: 'Pretas' };
        const types = { P: 'peão', N: 'cavalo', B: 'bispo', R: 'torre', Q: 'rainha', K: chess ? 'rei' : 'dama', M: 'pedra' };
        const symbols = { wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
            bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟' };
        let state = engine.initial(), selected = null, prefix = [], choices = [], promotion = null,
            busy = false, ended = false, flipped = !local && human === 'b', resigning = false;
        const seen = new Map([[engine.key(state), 1]]), history = [], captured = { w: [], b: [] };
        const instructions = chess
            ? 'Selecione uma peça e uma casa destacada. Brancas começam. Inclui roque, en passant e escolha de promoção. Não é permitido deixar seu rei em xeque. Empates por afogamento e material insuficiente são automáticos; você pode reivindicar empate por três repetições ou 50 lances sem captura/movimento de peão. Cinco repetições ou 75 lances encerram automaticamente.'
            : 'Damas brasileiras em 8 × 8: pedras andam para frente e capturam nos dois sentidos; damas percorrem diagonais. Capturar é obrigatório, sempre pela sequência que toma mais peças. Clique em cada destino para completar os saltos. A coroação acontece ao terminar o turno na última linha. Partida casual: empate por três repetições ou 15 lances de damas por pessoa sem captura.';
        const $ = GameUI.shell(session, chess ? 'Xadrez' : 'Damas', instructions,
            `<p class="classic-mode">${local ? '2 pessoas · mesmo aparelho' : `Você: ${names[human]} · Bot: ${config.difficultyName}`}</p>
            <p id="classic-status" class="notice" role="status" aria-live="polite"></p>
            <p id="classic-material" class="status-line"></p>
            <div id="classic-board" class="classic-board ${chess ? 'chess-board' : 'draughts-board'}" aria-label="Tabuleiro de ${chess ? 'xadrez' : 'damas'}"></div>
            <div id="classic-promotion" class="classic-promotion hidden" role="group" aria-label="Escolha a promoção">
            <p>Promover peão para:</p>${['Q', 'R', 'B', 'N'].map((p) => `<button class="button button-secondary" data-promote="${p}">${types[p]}</button>`).join('')}</div>
            <div class="classic-actions">${GameUI.button('Virar tabuleiro', 'classic-flip')}${chess ? GameUI.button('Reivindicar empate', 'classic-draw') : ''}${GameUI.button('Desistir', 'classic-resign')}${GameUI.button('Cancelar', 'classic-cancel')}</div>
            <details class="classic-history"><summary>Histórico de lances</summary><ol id="classic-history"></ol></details>`);
        const root = $('#classic-board'), buttons = [];
        for (let i = 0; i < 64; i++) {
            const b = document.createElement('button'); b.type = 'button'; b.dataset.square = i;
            root.append(b); buttons.push(b);
        }
        const currentSquare = () => prefix.length ? prefix.at(-1) : selected;
        function render() {
            const available = selected === null ? [] : chess ? choices.map((m) => m.to) : choices.map((m) => m.path[prefix.length]);
            const preview = [...state.board];
            if (prefix.length) { preview[selected] = null; preview[prefix.at(-1)] = state.board[selected]; }
            buttons.forEach((b, i) => {
                const piece = preview[i], dark = ((i >> 3) + (i & 7)) % 2;
                b.className = `classic-cell ${dark ? 'dark-square' : 'light-square'}`;
                if (piece) b.classList.add(piece[0] === 'w' ? 'white-piece' : 'black-piece');
                if (i === currentSquare()) b.classList.add('selected');
                if (available.includes(i)) b.classList.add('legal-destination');
                if (chess && piece === state.turn + 'K' && engine.check(state)) b.classList.add('in-check');
                const last = history.at(-1)?.move;
                if (last && [last.from, last.to].includes(i)) b.classList.add('last-move');
                b.textContent = piece ? (chess ? symbols[piece] : piece[1] === 'K' ? '♛' : '●') : '';
                b.disabled = ended || busy || Boolean(promotion) || (!chess && !dark);
                b.style.order = flipped ? 63 - i : i;
                b.setAttribute('aria-pressed', String(i === currentSquare()));
                b.setAttribute('aria-label', `${ClassicBoardUI.coordinate(i)}, ${piece ? `${types[piece[1]]} ${piece[0] === 'w' ? 'branco' : 'preto'}` : 'vazia'}${available.includes(i) ? ', destino permitido' : ''}`);
                b.dataset.piece = piece || '';
                b.dataset.coordinate = ClassicBoardUI.coordinate(i);
            });
            $('#classic-material').textContent = chess
                ? `Capturas das brancas: ${captured.w.map((p) => symbols[p]).join(' ') || '—'} · Pretas: ${captured.b.map((p) => symbols[p]).join(' ') || '—'}`
                : `Brancas: ${state.board.filter((p) => p?.[0] === 'w').length} peças · Pretas: ${state.board.filter((p) => p?.[0] === 'b').length} peças`;
            if (!ended) $('#classic-status').textContent = resigning ? 'Confirme a desistência ou cancele.' : promotion ? 'Escolha a peça para a promoção.'
                : `Vez das ${names[state.turn].toLowerCase()}${busy ? ' · bot pensando…' : chess && engine.check(state) ? ' · xeque!' : prefix.length ? ' · continue a captura' : !chess && engine.moves(state)[0]?.taken.length ? ' · captura obrigatória' : ' · selecione uma peça'}`;
            if (chess) $('#classic-draw').disabled = ended || busy || Boolean(promotion) || !(state.quiet >= 100 || seen.get(engine.key(state)) >= 3);
            $('#classic-resign').disabled = ended || busy || Boolean(promotion) || Boolean(prefix.length);
            $('#classic-resign').textContent = resigning ? 'Confirmar desistência' : 'Desistir';
            $('#classic-cancel').classList.toggle('hidden', !resigning);
            $('#classic-promotion').classList.toggle('hidden', !promotion);
            const log = $('#classic-history'); log.replaceChildren();
            history.forEach(({ label }) => { const li = document.createElement('li'); li.textContent = label; log.append(li); });
        }
        function finish(result) {
            if (ended) return;
            ended = true;
            const text = `${result.text}. ${result.winner ? `${names[result.winner]} venceram.` : 'Partida empatada.'}`;
            $('#classic-status').textContent = text;
            render();
            const success = result.winner !== null && (local || result.winner === human);
            session.score.answer(success, 500);
            session.complete(success, { text, winner: result.winner, draw: result.winner === null });
        }
        async function bot() {
            if (ended || local || state.turn === human) return;
            busy = true; render();
            if (!await session.sleep(300)) return;
            const move = await ClassicAI.choose(engine, state, config, session);
            if (!session.alive || !move) return;
            busy = false; play(move);
        }
        function play(move) {
            resigning = false;
            const side = state.turn;
            if (chess) {
                const victim = state.board[move.enPassant ?? move.to];
                if (victim) captured[side].push(victim);
            }
            state = engine.apply(state, move);
            const k = engine.key(state); seen.set(k, (seen.get(k) || 0) + 1);
            const route = chess ? [move.from, move.to] : [move.from, ...move.path];
            history.push({ move, label: `${names[side]}: ${route.map(ClassicBoardUI.coordinate).join(move.taken?.length ? ' × ' : ' → ')}${move.promotion ? ` = ${types[move.promotion]}` : ''}${move.rookFrom !== undefined ? ' (roque)' : ''}` });
            selected = null; choices = []; prefix = []; promotion = null;
            const result = engine.outcome(state, seen.get(k));
            if (result) return finish(result);
            render(); bot();
        }
        function select(index) {
            if (ended || busy || promotion || (!local && state.turn !== human)) return;
            const targets = chess ? choices.filter((m) => m.to === index) : choices.filter((m) => m.path[prefix.length] === index);
            if (selected !== null && targets.length) {
                if (chess) {
                    if (targets.length > 1) { promotion = targets; render(); $('#classic-promotion button').focus(); }
                    else play(targets[0]);
                } else {
                    prefix.push(index); choices = targets;
                    if (targets[0].path.length === prefix.length) play(targets[0]); else render();
                }
                return;
            }
            if (prefix.length) return;
            selected = state.board[index]?.[0] === state.turn && selected !== index ? index : null;
            choices = selected === null ? [] : engine.moves(state).filter((m) => m.from === selected);
            render();
        }
        session.listen(root, 'click', (event) => {
            const cell = event.target.closest('[data-square]');
            if (cell) select(Number(cell.dataset.square));
        });
        session.listen(root, 'keydown', (event) => {
            const cell = event.target.closest('[data-square]');
            if (!cell) return;
            const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8 };
            if (event.key in offsets) {
                event.preventDefault();
                let to = Number(cell.dataset.square) + offsets[event.key] * (flipped ? -1 : 1);
                if (to >= 0 && to < 64 && !buttons[to].disabled) buttons[to].focus();
            }
        });
        session.listen($('#classic-promotion'), 'click', (event) => {
            const choice = event.target.closest('[data-promote]');
            const move = promotion?.find((m) => m.promotion === choice?.dataset.promote);
            if (move) play(move);
        });
        session.listen($('#classic-flip'), 'click', () => { flipped = !flipped; render(); });
        session.listen($('#classic-resign'), 'click', () => {
            if (resigning) finish({ winner: engine.other(state.turn), text: `${names[state.turn]} desistiram` });
            else { resigning = true; render(); }
        });
        session.listen($('#classic-cancel'), 'click', () => { resigning = false; render(); });
        if (chess) session.listen($('#classic-draw'), 'click', () => {
            if (state.quiet >= 100 || seen.get(engine.key(state)) >= 3)
                finish({ winner: null, text: 'Empate reivindicado por repetição ou regra dos 50 lances' });
        });
        render(); bot();
    }
});
