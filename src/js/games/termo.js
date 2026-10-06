GameRegistry.register('termo', (session) => {
    async function init(config) {
        const dictionary = await GameData.load('words');
        const vocabulary = await GameData.load('vocabulary');
        if (!session.alive) return;
        const mode = config.options.mode || 'single',
            count = mode === 'duet' ? 2 : mode === 'quartet' ? 4 : 1;
        let length = mode === 'ladder' ? 4 : Number(config.options.length) || 5,
            targets = [],
            guesses = [],
            solved = [],
            solvedAt = [],
            draft = '',
            attempts = 0,
            maxAttempts = 0,
            keyboard = new Map();
        const $ = GameUI.shell(
            session,
            'Termo',
            'Descubra a palavra usando as pistas: verde é letra e posição, amarelo é letra em outra posição, cinza é ocorrência ausente. A contagem respeita letras repetidas. Acentos são opcionais.',
            `<p id="termo-progress" class="status-line"></p><p id="termo-feedback" class="notice" role="status">Verde: posição certa · Amarelo: outra posição · Cinza: ocorrência ausente.</p><div id="termo-boards" class="wordle-boards ${count === 1 ? 'single' : ''}"></div><form id="termo-form" class="controls"><input id="termo-input" class="compact-field" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Tentativa de palavra"><button class="button button-primary">Verificar</button></form><div id="termo-keyboard" class="wordle-keyboard"></div>`
        );
        const normalize = (word) => GameArt.normalize(word).toUpperCase();
        function feedback(target, guess) {
            const result = Array(length).fill('absent'),
                remaining = new Map();
            for (let i = 0; i < length; i++)
                if (target[i] === guess[i]) result[i] = 'exact';
                else remaining.set(target[i], (remaining.get(target[i]) || 0) + 1);
            for (let i = 0; i < length; i++)
                if (result[i] !== 'exact' && (remaining.get(guess[i]) || 0) > 0) {
                    result[i] = 'present';
                    remaining.set(guess[i], remaining.get(guess[i]) - 1);
                }
            return result;
        }
        function start() {
            const bank = VocabularyEngine.targets(
                dictionary,
                vocabulary,
                length,
                config.options.bank
            );
            const deck = ReplayEngine.deck(session.random, bank, config.options.recentItems);
            targets = Array.from({ length: count }, () => deck.next());
            Progress.remember('termo', targets);
            guesses = [];
            solved = Array(count).fill(false);
            solvedAt = Array(count).fill(Infinity);
            draft = '';
            attempts = 0;
            keyboard = new Map();
            maxAttempts = [8, 7, 6, 5][DifficultyEngine.index(config.difficulty)] + (count - 1) * 2;
            $('#termo-input').maxLength = length;
            $('#termo-input').value = '';
            render();
            $('#termo-input').focus({ preventScroll: true });
        }
        function render(reveal = false) {
            $('#termo-progress').textContent =
                `${length} letras · ${attempts}/${maxAttempts} tentativas · ${solved.filter(Boolean).length}/${count} palavras${mode === 'ladder' ? ` · Escada ${length - 3}/4` : ''}`;
            $('#termo-boards').replaceChildren();
            targets.forEach((target, id) => {
                const board = document.createElement('div');
                board.className = 'wordle-board' + (solved[id] ? ' wordle-solved' : '');
                board.setAttribute(
                    'aria-label',
                    `Palavra ${id + 1}${solved[id] ? ', resolvida' : ''}`
                );
                const title = document.createElement('h3');
                title.className = 'wordle-label';
                title.textContent = `Palavra ${id + 1}${solved[id] ? ' ✓ Resolvida' : ''}`;
                board.append(title);
                for (let r = 0; r < maxAttempts; r++) {
                    const row = document.createElement('div');
                    row.className = 'wordle-row';
                    const guess = r < solvedAt[id] ? guesses[r] : null,
                        states = guess ? feedback(target, guess) : [];
                    for (let c = 0; c < length; c++) {
                        const tile = document.createElement('span');
                        tile.className = 'letter-tile ' + (states[c] || '');
                        if (reveal && guess && r === guesses.length - 1) {
                            tile.classList.add('tile-reveal');
                            tile.style.animationDelay = `${c * 55}ms`;
                        }
                        tile.textContent = guess?.[c] || '';
                        tile.setAttribute(
                            'aria-label',
                            guess
                                ? `${guess[c]}: ${states[c] === 'exact' ? 'letra e posição' : states[c] === 'present' ? 'outra posição' : 'ocorrência ausente'}`
                                : 'vazia'
                        );
                        row.append(tile);
                    }
                    board.append(row);
                }
                $('#termo-boards').append(board);
            });
            $('#termo-keyboard').replaceChildren();
            const keyRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM⌫↵'];
            for (const rowKeys of keyRows) {
                const row = document.createElement('div');
                row.className = 'wordle-keyboard-row';
                $('#termo-keyboard').append(row);
                for (const key of rowKeys) {
                    const button = document.createElement('button');
                    button.textContent = key;
                    button.dataset.key = key;
                    const state = keyboard.get(key);
                    if (state)
                        button.style.background = {
                            exact: '#317654',
                            present: '#89702b',
                            absent: '#3f4958'
                        }[state];
                    button.setAttribute(
                        'aria-label',
                        `${key}${state ? `, ${state === 'exact' ? 'posição certa' : state === 'present' ? 'outra posição' : 'ausente'}` : ''}`
                    );
                    session.listen(button, 'click', () => {
                        const input = $('#termo-input');
                        if (key === '⌫') input.value = input.value.slice(0, -1);
                        else if (key === '↵') submit();
                        else if (input.value.length < length) input.value += key;
                        updateDraft();
                        input.focus({ preventScroll: true });
                    });
                    row.append(button);
                }
            }
        }
        function updateDraft() {
            draft = normalize($('#termo-input').value)
                .replace(/[^A-Z]/g, '')
                .slice(0, length);
            $('#termo-input').value = draft;
            $('#termo-input').removeAttribute('aria-invalid');
            $('#termo-form').classList.remove('feedback-wrong');
            [...$('#termo-boards').children].forEach((board, id) => {
                if (solved[id]) return;
                const row = board.querySelectorAll('.wordle-row')[attempts];
                row?.querySelectorAll('.letter-tile').forEach((tile, i) => {
                    tile.textContent = draft[i] || '';
                    tile.classList.toggle('draft', Boolean(draft[i]));
                    tile.setAttribute(
                        'aria-label',
                        draft[i] ? `${draft[i]}, ainda não avaliada` : 'vazia'
                    );
                });
            });
        }
        function reject(message) {
            $('#termo-input').setAttribute('aria-invalid', 'true');
            $('#termo-form').classList.add('feedback-wrong');
            session.notify(message);
        }
        function submit() {
            const guess = normalize($('#termo-input').value);
            if (guess.length !== length)
                return reject(`Use ${length} letras. Sua tentativa não foi consumida.`);
            if (!dictionary[String(length)].includes(guess))
                return reject(
                    'Essa palavra não está no dicionário local. Sua tentativa não foi consumida.'
                );
            if (guesses.includes(guess))
                return reject('Você já tentou essa palavra. Sua tentativa não foi consumida.');
            guesses.push(guess);
            attempts++;
            targets.forEach((target, id) => {
                if (solved[id]) return;
                const states = feedback(target, guess),
                    priority = { absent: 0, present: 1, exact: 2 };
                states.forEach((state, i) => {
                    if (
                        !keyboard.has(guess[i]) ||
                        priority[state] > priority[keyboard.get(guess[i])]
                    )
                        keyboard.set(guess[i], state);
                });
                if (guess === target) {
                    solved[id] = true;
                    solvedAt[id] = attempts;
                    session.score.answer(true, Math.max(100, 800 - attempts * 50));
                }
            });
            draft = '';
            render(true);
            $('#termo-input').value = '';
            $('#termo-input').removeAttribute('aria-invalid');
            $('#termo-form').classList.remove('feedback-wrong');
            session.notify('');
            $('#termo-input').focus({ preventScroll: true });
            const states = feedback(targets[0], guess);
            $('#termo-feedback').textContent =
                count === 1
                    ? `${states.filter((state) => state === 'exact').length} na posição certa · ${states.filter((state) => state === 'present').length} em outra posição.`
                    : `${solved.filter(Boolean).length}/${count} palavras resolvidas. Confira as pistas de cada tabuleiro.`;
            if (solved.every(Boolean)) {
                if (mode === 'ladder' && length < 7) {
                    length++;
                    session.notify('Etapa concluída. Agora uma palavra maior.');
                    return start();
                }
                return session.complete(true, {
                    text: `${count === 1 ? 'Palavra' : 'Palavras'} deduzidas em ${attempts} tentativas${mode === 'ladder' ? ' · Escada completa' : ''}.`
                });
            }
            if (attempts === maxAttempts) {
                session.score.answer(false);
                session.complete(false, { text: `Palavras: ${targets.join(' · ')}.` });
            }
        }
        session.listen($('#termo-form'), 'submit', (event) => {
            event.preventDefault();
            submit();
        });
        session.listen($('#termo-input'), 'input', updateDraft);
        start();
    }
    return { init, destroy: session.destroy };
});
