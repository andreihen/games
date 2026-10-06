GameRegistry.register('mini_sudoku', (session) => {
    async function init(config) {
        session.ui.phaseDisplay.innerHTML =
            '<p class="notice" role="status">Preparando um Sudoku com as técnicas desta dificuldade…</p>';
        const puzzle = await SudokuEngine.generate(
            session.random,
            DifficultyEngine.index(config.difficulty),
            (attempt) => {
                session.ui.phaseDisplay.querySelector('p').textContent =
                    `Preparando um Sudoku com as técnicas desta dificuldade · validação ${attempt}…`;
                return session.sleep(0);
            }
        );
        if (!puzzle || !session.alive) return;
        session.resetClock();
        const givens = [...puzzle.board],
            solution = puzzle.solution,
            credited = new Set();
        let board = [...givens],
            notes = Array(81).fill(0),
            deductions = Array(81).fill(null),
            selected = board.findIndex((v) => !v),
            selectedNumber = 0,
            noteMode = false,
            automatic = config.options.autoCandidates === 'on',
            undo = [],
            redo = [],
            hint = null;
        const limit = Number(config.options.errorLimit) || Infinity;
        const $ = GameUI.shell(
            session,
            'Sudoku',
            `${DifficultyEngine.names[config.difficulty]} · solução única, validada por deduções. Selecione uma célula e use o teclado numérico; ative notas para registrar candidatos.`,
            `<p id="sudoku-techniques" class="status-line"></p><div id="sudoku-board" class="sudoku-board" role="group" aria-label="Sudoku 9 por 9"></div><div id="sudoku-numbers" class="sudoku-numbers"></div><div class="board-controls">${GameUI.button('Notas', 'sudoku-notes')}${GameUI.button('Auto candidatos', 'sudoku-auto')}${GameUI.button('Apagar', 'sudoku-clear')}${GameUI.button('Desfazer', 'sudoku-undo')}${GameUI.button('Refazer', 'sudoku-redo')}${GameUI.button('Dica explicada', 'sudoku-hint')}</div><div id="sudoku-hint-text" class="notice hidden" role="status"></div>${GameUI.button('Aplicar dedução', 'sudoku-apply-hint')}<p id="sudoku-errors" class="status-line"></p>`
        );
        $('#sudoku-techniques').textContent =
            `Técnicas validadas: ${[...new Set(puzzle.analysis.steps.map((step) => step.technique))].join(' · ')}`;
        const buttons = [];
        for (let i = 0; i < 81; i++) {
            const button = document.createElement('button');
            button.dataset.cell = i;
            button.className = 'sudoku-button';
            $('#sudoku-board').append(button);
            buttons.push(button);
        }
        const snapshot = () => ({
            board: [...board],
            notes: [...notes],
            deductions: [...deductions],
            selected
        });
        function restore(state) {
            ({ board, notes, deductions, selected } = structuredClone(state));
            hint = null;
            render();
        }
        function remember() {
            undo.push(snapshot());
            if (undo.length > 200) undo.shift();
            redo = [];
            hint = null;
        }
        function render() {
            const candidates = SudokuEngine.candidates(board),
                bad = new Set();
            for (const unit of SudokuEngine.units)
                for (const value of new Set(unit.map((i) => board[i]).filter(Boolean))) {
                    const cells = unit.filter((i) => board[i] === value);
                    if (cells.length > 1) cells.forEach((i) => bad.add(i));
                }
            const r = Math.floor(selected / 9),
                c = selected % 9;
            buttons.forEach((button, i) => {
                const sameUnit =
                    Math.floor(i / 9) === r ||
                    i % 9 === c ||
                    (Math.floor(Math.floor(i / 9) / 3) === Math.floor(r / 3) &&
                        Math.floor((i % 9) / 3) === Math.floor(c / 3));
                button.className = `sudoku-button${givens[i] ? ' given' : ''}${sameUnit ? ' related' : ''}${i === selected ? ' selected' : ''}${selectedNumber && board[i] === selectedNumber ? ' same-number' : ''}${bad.has(i) || (board[i] && board[i] !== solution[i]) ? ' duplicate' : ''}`;
                const mask = automatic ? candidates[i] & (deductions[i] ?? 511) : notes[i];
                button.innerHTML = board[i]
                    ? String(board[i])
                    : mask
                      ? `<span class="candidate-grid">${Array.from({ length: 9 }, (_, n) => `<span>${mask & SudokuEngine.bit(n + 1) ? n + 1 : ''}</span>`).join('')}</span>`
                      : '';
                button.setAttribute(
                    'aria-label',
                    `${SudokuEngine.cell(i)}, ${board[i] || 'vazia'}${givens[i] ? ', pista fixa' : ''}${mask && !board[i] ? `, candidatos ${SudokuEngine.digits(mask).join(', ')}` : ''}${bad.has(i) ? ', duplicata' : ''}`
                );
                button.style.borderRightWidth = i % 9 === 2 || i % 9 === 5 ? '3px' : '1px';
                button.style.borderBottomWidth =
                    Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5 ? '3px' : '1px';
            });
            $('#sudoku-notes').setAttribute('aria-pressed', noteMode);
            $('#sudoku-auto').setAttribute('aria-pressed', automatic);
            $('#sudoku-undo').disabled = !undo.length;
            $('#sudoku-redo').disabled = !redo.length;
            $('#sudoku-apply-hint').classList.toggle('hidden', !hint);
            $('#sudoku-errors').textContent =
                `Erros: ${session.score.snapshot().mistakes}${Number.isFinite(limit) ? `/${limit}` : ' · sem limite'}`;
            $('#sudoku-numbers').replaceChildren();
            for (let value = 1; value <= 9; value++) {
                const left = 9 - board.filter((v) => v === value).length;
                const button = document.createElement('button');
                button.innerHTML = `${value}<small>${left} restantes</small>`;
                button.setAttribute('aria-label', `${value}, ${left} restantes`);
                session.listen(button, 'click', () => enter(value));
                $('#sudoku-numbers').append(button);
            }
        }
        function enter(value) {
            selectedNumber = value;
            if (givens[selected]) return render();
            if (noteMode) {
                remember();
                notes[selected] ^= SudokuEngine.bit(value);
                automatic = false;
                return render();
            }
            if (board[selected] === value) return;
            remember();
            board[selected] = value;
            notes[selected] = 0;
            deductions.fill(null);
            if (value !== solution[selected]) session.score.answer(false);
            else if (!credited.has(selected)) {
                credited.add(selected);
                session.score.answer(true, 10);
            }
            render();
            if (session.score.snapshot().mistakes >= limit)
                return session.complete(false, {
                    text: 'Limite de erros atingido. Você pode escolher sem limite nas configurações.'
                });
            if (board.every(Boolean) && SudokuEngine.valid(board))
                session.complete(true, {
                    text: `Sudoku resolvido. ${session.score.snapshot().mistakes} erros registrados.`
                });
        }
        session.listen($('#sudoku-board'), 'click', (event) => {
            const button = event.target.closest('[data-cell]');
            if (button) {
                selected = +button.dataset.cell;
                selectedNumber = board[selected];
                render();
            }
        });
        session.listen($('#sudoku-notes'), 'click', () => {
            noteMode = !noteMode;
            render();
        });
        session.listen($('#sudoku-auto'), 'click', () => {
            automatic = !automatic;
            render();
        });
        session.listen($('#sudoku-clear'), 'click', () => {
            if (!givens[selected]) {
                remember();
                board[selected] = 0;
                notes[selected] = 0;
                deductions.fill(null);
                render();
            }
        });
        session.listen($('#sudoku-undo'), 'click', () => {
            if (undo.length) {
                redo.push(snapshot());
                restore(undo.pop());
            }
        });
        session.listen($('#sudoku-redo'), 'click', () => {
            if (redo.length) {
                undo.push(snapshot());
                restore(redo.pop());
            }
        });
        session.listen($('#sudoku-hint'), 'click', () => {
            $('#sudoku-hint-text').classList.remove('hidden');
            if (board.some((v, i) => v && v !== solution[i])) {
                $('#sudoku-hint-text').textContent =
                    'Revise as células marcadas antes de pedir uma dedução. Uma entrada incorreta invalida os candidatos.';
                hint = null;
                return render();
            }
            const masks = SudokuEngine.candidates(board).map(
                (mask, i) => mask & (deductions[i] ?? 511)
            );
            hint = SudokuEngine.step(board, masks, 3);
            $('#sudoku-hint-text').textContent = hint
                ? `${hint.technique}: ${hint.text}`
                : 'Não há novas deduções para aplicar.';
            render();
        });
        session.listen($('#sudoku-apply-hint'), 'click', () => {
            if (!hint) return;
            const step = hint;
            remember();
            for (const { i, value } of step.placements) {
                board[i] = value;
                notes[i] = 0;
                selected = i;
            }
            const masks = SudokuEngine.candidates(board);
            for (const { i, mask } of step.eliminations) {
                deductions[i] = (deductions[i] ?? masks[i]) & ~mask;
                notes[i] &= ~mask;
            }
            automatic = true;
            render();
            if (board.every(Boolean) && SudokuEngine.valid(board))
                session.complete(true, { text: 'Sudoku resolvido com deduções explicadas.' });
        });
        session.listen(document, 'keydown', (event) => {
            if (/^[1-9]$/.test(event.key)) {
                event.preventDefault();
                enter(+event.key);
            } else if (['Backspace', 'Delete'].includes(event.key)) {
                event.preventDefault();
                $('#sudoku-clear').click();
            } else if (event.key.toLowerCase() === 'n') {
                $('#sudoku-notes').click();
            } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                $(event.shiftKey ? '#sudoku-redo' : '#sudoku-undo').click();
            } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
                const delta = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[
                    event.key
                ];
                selected = Math.max(0, Math.min(80, selected + delta));
                render();
                buttons[selected].focus();
            }
        });
        render();
    }
    return { init, destroy: session.destroy };
});
