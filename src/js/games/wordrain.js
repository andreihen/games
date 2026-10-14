GameRegistry.register('wordrain', (session) => {
    async function init(config) {
        if (config.options.mode === 'text') return playTypingText(session, config);
        const vocabulary = await GameData.load('vocabulary');
        if (!session.alive) return;
        const mode = config.options.mode || 'zen',
            language = config.options.language || 'pt';
        let words = [],
            target = null,
            typed = '',
            lastValue = '',
            finished = 0,
            missed = 0,
            lastFrame = session.now(),
            lastSpawn = -10000,
            firstKey = null,
            profile = Number(config.options.typingWpm) || config.baseWpm,
            weak = { ção: 0, lh: 0, qu: 0 };
        const dictionary =
            config.options.bank === 'wide' && language === 'pt'
                ? await GameData.load('words')
                : null;
        if (!session.alive) return;
        const limit =
            language === 'code'
                ? [4, 8, 16, 28][DifficultyEngine.index(config.difficulty)]
                : config.maxLength;
        const candidates = [
            ...new Set([
                ...vocabulary[language],
                ...(dictionary
                    ? Object.keys(dictionary)
                          .filter((key) => /^[4-7]$/.test(key))
                          .flatMap((key) => dictionary[key].map((word) => word.toLowerCase()))
                    : [])
            ])
        ].filter((word) => word.length <= limit);
        const distinct = new Map();
        for (const word of candidates)
            if (!distinct.has(GameArt.normalize(word))) distinct.set(GameArt.normalize(word), word);
        const bank = [...distinct.values()];
        const deck = ReplayEngine.deck(
            session.random,
            bank,
            config.options.recentItems,
            GameArt.normalize
        );
        const maxActive =
            mode === 'survival' ? [2, 3, 4, 5][DifficultyEngine.index(config.difficulty)] : 1;
        const $ = GameUI.shell(
            session,
            'Chuva de Palavras',
            `${mode === 'precision' ? 'O alvo fica parado para treinar sem movimento.' : 'As palavras caem do céu; na chuva tranquila elas esperam na base.'} Digite para escolher um alvo. Corrija erros com Backspace; acentos são opcionais. Meta: ${config.target} palavras com pelo menos 65% de precisão.${mode === 'sprint' ? ' Você tem 60 segundos.' : mode === 'survival' ? ' Cinco perdas encerram a partida.' : ''}`,
            `<p id="wr-stats" class="status-line"></p><p id="wr-last" class="typing-last" role="status">Complete a palavra destacada. Corrija erros com Backspace.</p><div id="wr-field" class="word-field"></div><div id="wr-feedback" class="typing-feedback" aria-live="off"></div><input id="wr-input" class="compact-field" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Digite uma palavra"><p id="wr-progress" class="status-line"></p>`
        );
        const normalize = (value) => GameArt.normalize(value),
            field = $('#wr-field'),
            input = $('#wr-input');
        function finish() {
            session.score.set({
                wpm: measure(),
                words: finished,
                missed,
                problemKeys: { ...weak }
            });
            const accuracy = session.score.snapshot().accuracy;
            session.complete(
                !(mode === 'survival' && missed >= 5) &&
                    finished >= config.target &&
                    (accuracy ?? 0) >= 65,
                {
                    text: `${finished}/${config.target} palavras · ${missed} perdidas · ritmo final ${Math.round(profile)} WPM.`
                }
            );
        }
        function measure() {
            return firstKey === null
                ? 0
                : Math.min(
                      180,
                      session.score.snapshot().correct /
                          5 /
                          Math.max(0.1, (session.now() - firstKey) / 60000)
                  );
        }
        function spawn() {
            const problem = Object.entries(weak).sort((a, b) => b[1] - a[1])[0];
            const practice =
                problem[1] > 1 && session.random.float() < Math.min(0.25, problem[1] / 60);
            const text = deck.next(
                words.map((word) => normalize(word.text)),
                practice ? (word) => normalize(word).includes(normalize(problem[0])) : null
            );
            if (!text) return;
            Progress.remember('wordrain', [normalize(text)]);
            const el = document.createElement('span');
            el.className = 'falling-word';
            el.textContent = text;
            field.append(el);
            const width = field.clientWidth || 320;
            // Tokens de código longos também precisam caber em telas pequenas.
            el.style.fontSize = `${Math.min(22, (width - 24) / (text.length * 0.68))}px`;
            const measured =
                    el.getBoundingClientRect().width ||
                    text.length * parseFloat(el.style.fontSize) * 0.68,
                seconds = Math.max(8, (text.length / ((profile * 5) / 60)) * 2 + 4),
                x =
                    mode === 'survival'
                        ? session.random.int(4, Math.max(4, Math.floor(width - measured - 14)))
                        : Math.max(10, (width - measured) / 2);
            words.push({
                text,
                x,
                y: mode === 'precision' ? Math.min(105, (field.clientHeight || 350) / 2) : -28,
                speed: (field.clientHeight || 350) / seconds,
                el
            });
            lastSpawn = session.now();
        }
        function feedback() {
            const expected = target ? normalize(target.text) : '';
            $('#wr-feedback').innerHTML = [...typed]
                .map(
                    (char, i) =>
                        `<span class="${normalize(char) === expected[i] ? 'right' : 'wrong'}">${GameArt.escape(char)}</span>`
                )
                .join('');
            words.forEach((word) => word.el.classList.toggle('target', word === target));
            input.setAttribute(
                'aria-invalid',
                String(
                    Boolean(target && typed && !normalize(target.text).startsWith(normalize(typed)))
                )
            );
            words.forEach((word) => {
                const expectedWord = normalize(word.text);
                word.el.innerHTML = [...word.text]
                    .map(
                        (char, i) =>
                            `<span class="${word === target && i < typed.length ? (normalize(typed[i]) === expectedWord[i] ? 'typed-char' : 'wrong-char') : ''}">${GameArt.escape(char)}</span>`
                    )
                    .join('');
            });
        }
        session.listen(input, 'input', () => {
            const value = input.value,
                normal = normalize(value);
            if (firstKey === null && value) firstKey = session.now();
            if (!target || !normalize(target.text).startsWith(normal)) {
                const candidate = words.find(
                    (word) => normalize(word.text).startsWith(normal) && normal
                );
                if (candidate) target = candidate;
            }
            if (!target && words.length) target = words.reduce((a, b) => (a.y > b.y ? a : b));
            let prefix = 0;
            while (
                prefix < value.length &&
                prefix < lastValue.length &&
                value[prefix] === lastValue[prefix]
            )
                prefix++;
            let suffix = 0;
            while (
                suffix < value.length - prefix &&
                suffix < lastValue.length - prefix &&
                value[value.length - 1 - suffix] === lastValue[lastValue.length - 1 - suffix]
            )
                suffix++;
            for (let i = prefix; i < value.length - suffix; i++) {
                const correct =
                    Boolean(target) && normalize(value[i]) === normalize(target.text)[i];
                session.score.attempt(correct);
                if (!correct && target)
                    for (const key of Object.keys(weak)) {
                        const at = target.text.indexOf(key);
                        if (at >= 0 && i >= at && i < at + key.length) weak[key]++;
                    }
            }
            typed = value;
            lastValue = value;
            feedback();
            if (target && normal === normalize(target.text)) {
                finished++;
                $('#wr-last').textContent =
                    `✓ ${target.text} concluída · +${target.text.length * 15 * Math.min(4, session.score.snapshot().streak + 1)} pontos`;
                $('#wr-last').className = 'typing-last feedback-correct';
                session.score.answer(true, target.text.length * 15, false);
                target.el.remove();
                words = words.filter((word) => word !== target);
                target = null;
                typed = '';
                lastValue = '';
                input.value = '';
                if (finished >= 3) {
                    const stats = session.score.snapshot(),
                        observed = measure();
                    profile = Math.max(
                        8,
                        Math.min(
                            110,
                            profile * 0.9 +
                                Math.max(profile * 0.8, Math.min(profile * 1.2, observed)) * 0.1
                        )
                    );
                    if (stats.accuracy < 85) profile *= 0.97;
                }
                session.score.set({ wpm: measure(), words: finished, problemKeys: { ...weak } });
                feedback();
                if (mode !== 'sprint' && finished >= config.target) return finish();
            }
        });
        function frame() {
            const now = session.now(),
                dt = Math.min(0.1, (now - lastFrame) / 1000);
            lastFrame = now;
            if (words.length < maxActive && now - lastSpawn > Math.max(1500, 60000 / profile) * 1.8)
                spawn();
            if (!words.length) spawn();
            if (mode !== 'precision')
                for (const word of [...words]) {
                    const floor = (field.clientHeight || 350) - 36;
                    word.y =
                        mode === 'zen'
                            ? Math.min(floor, word.y + word.speed * dt)
                            : word.y + word.speed * dt;
                    if (word.y > (field.clientHeight || 350)) {
                        word.el.remove();
                        words = words.filter((w) => w !== word);
                        missed++;
                        $('#wr-last').textContent =
                            `✕ ${word.text} passou${mode === 'survival' ? ` · ${5 - missed} vidas restantes` : ''}`;
                        $('#wr-last').className = 'typing-last feedback-wrong';
                        session.score.answer(false, 0, false);
                        if (target === word) {
                            target = null;
                            input.value = '';
                            lastValue = '';
                            typed = '';
                            feedback();
                        }
                        if (mode === 'survival' && missed >= 5) return finish();
                    }
                }
            const nearest = words.reduce((a, b) => (!a || b.y > a.y ? b : a), null);
            words.forEach((word) => {
                word.el.style.transform = `translate(${word.x}px,${word.y}px)`;
                word.el.classList.toggle('priority', mode === 'survival' && word === nearest);
            });
            $('#wr-stats').textContent =
                `WPM: ${Math.round(measure())} · Precisão: ${Math.round(session.score.snapshot().accuracy ?? 100)}% · Ritmo: ${Math.round(profile)} WPM`;
            $('#wr-progress').textContent =
                mode === 'sprint'
                    ? `${finished}/${config.target} palavras · ${Math.max(0, 60 - Math.floor(now / 1000))}s restantes`
                    : `${finished}/${config.target} palavras${mode === 'survival' ? ` · ${5 - missed} vidas` : ''}`;
            if (mode === 'sprint' && now >= 60000) return finish();
            session.frame(frame);
        }
        spawn();
        session.frame(frame);
        input.focus({ preventScroll: true });
    }
    return { init, destroy: session.destroy };
});
async function playTypingText(session, config) {
    const bank = await GameData.load('passages');
    if (!session.alive) return;
    const language = config.options.language || 'pt';
    const count = [2, 3, 4, 5][DifficultyEngine.index(config.difficulty)];
    const deck = ReplayEngine.deck(session.random, bank[language]);
    const text = Array.from({ length: count }, () => deck.next()).join('\n\n');
    const normalize = (value) =>
        language === 'code' ? value : value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const expected = normalize(text);
    const $ = GameUI.shell(
        session,
        'Digitação de Texto',
        `Digite o texto completo, incluindo pontuação e quebras de linha. Corrija com Backspace. ${language === 'code' ? 'Maiúsculas e espaços precisam coincidir.' : 'Acentos são opcionais; maiúsculas e espaços precisam coincidir.'} A velocidade é medida a partir da primeira tecla.`,
        `<p id="text-stats" class="status-line"></p><div id="text-reference" class="typing-passage" aria-label="Texto para digitar"></div><label for="text-input">Seu texto</label><textarea id="text-input" class="typing-text-input" rows="6" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea><progress id="text-progress" class="challenge-meter" max="${text.length}" value="0" aria-label="Caracteres corretos"></progress><p id="text-feedback" role="status">${count} parágrafos · ${text.length} caracteres · sem limite de tempo</p>`
    );
    const chars = [...text].map((char) => {
        const span = document.createElement('span');
        span.textContent = char;
        $('#text-reference').append(span);
        return span;
    });
    let previous = '',
        firstKey = null;
    function metrics(correct) {
        const minutes = firstKey === null ? 0 : (session.now() - firstKey) / 60000;
        return Math.round(minutes > 0 ? correct / 5 / minutes : 0);
    }
    function show(correct) {
        $('#text-stats').textContent =
            `${correct}/${text.length} caracteres corretos · ${metrics(correct)} WPM · precisão ${Math.round(session.score.snapshot().accuracy ?? 100)}%`;
    }
    let correct = 0;
    session.listen($('#text-input'), 'input', () => {
        const value = $('#text-input').value,
            normal = normalize(value);
        if (firstKey === null && value) firstKey = session.now();
        let prefix = 0,
            suffix = 0;
        while (
            prefix < Math.min(value.length, previous.length) &&
            value[prefix] === previous[prefix]
        )
            prefix++;
        while (
            suffix < Math.min(value.length, previous.length) - prefix &&
            value[value.length - 1 - suffix] === previous[previous.length - 1 - suffix]
        )
            suffix++;
        for (let i = prefix; i < value.length - suffix; i++)
            session.score.attempt(normal[i] === expected[i]);
        previous = value;
        correct = 0;
        let firstMismatch = -1;
        chars.forEach((span, i) => {
            const right = i < normal.length && normal[i] === expected[i];
            if (right) correct++;
            else if (firstMismatch < 0) firstMismatch = i;
            span.className =
                i < normal.length
                    ? right
                        ? 'text-correct'
                        : 'text-wrong'
                    : i === normal.length
                      ? 'text-cursor'
                      : '';
        });
        $('#text-progress').value = correct;
        const invalid =
            normal.length > expected.length ||
            (firstMismatch >= 0 && firstMismatch < normal.length);
        $('#text-input').setAttribute('aria-invalid', String(invalid));
        $('#text-feedback').textContent = invalid
            ? `Confira o caractere ${firstMismatch < 0 ? expected.length + 1 : firstMismatch + 1}. Você pode editar qualquer trecho.`
            : `${correct}/${text.length} corretos. Continue no marcador.`;
        const cursor = chars[Math.min(normal.length, chars.length - 1)];
        const box = $('#text-reference');
        if (cursor) {
            const rect = cursor.getBoundingClientRect(),
                bounds = box.getBoundingClientRect();
            if (rect.bottom > bounds.bottom - 16) box.scrollTop += rect.bottom - bounds.bottom + 32;
            else if (rect.top < bounds.top + 16) box.scrollTop += rect.top - bounds.top - 16;
        }
        show(correct);
        if (normal === expected) {
            session.score.add(
                Math.round((text.length * (session.score.snapshot().accuracy ?? 100)) / 100)
            );
            session.score.set({ wpm: metrics(correct), characters: correct });
            session.complete(true, {
                text: `Texto concluído · ${metrics(correct)} WPM · ${Math.round(session.score.snapshot().accuracy ?? 100)}% de precisão.`
            });
        }
    });
    session.listen($('#text-input'), 'keydown', (event) => {
        if (language === 'code' && event.key === 'Tab') {
            event.preventDefault();
            const input = $('#text-input'),
                start = input.selectionStart,
                end = input.selectionEnd;
            input.setRangeText('  ', start, end, 'end');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    session.interval(() => show(correct), 500);
    show(0);
    $('#text-input').focus({ preventScroll: true });
}
