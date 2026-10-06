GameRegistry.register('identity', (session) => ({
    async init(config) {
        const data = await GameData.load('learning');
        if (!session.alive) return;
        const tier = DifficultyEngine.index(config.difficulty),
            maxMisses = tier === 3 ? 2 : Infinity,
            theme = config.options.theme || 'all',
            pool = data.identities.filter((item) => theme === 'all' || item.theme === theme),
            deck = ReplayEngine.deck(session.random, pool, config.options.recentItems),
            total = 8;
        const $ = GameUI.shell(
            session,
            'Quem Sou Eu?',
            'Descubra a identidade secreta usando pistas progressivas. As primeiras pistas podem servir para mais de uma entidade. Revele outra pista quando precisar; menos pistas e menos erros rendem mais pontos. No Especialista, dois erros distintos revelam a resposta.',
            `<div class="learning-round"><span id="identity-progress"></span><span id="identity-value"></span></div><progress id="identity-meter" class="challenge-meter" max="${total}" value="0" aria-label="Identidades respondidas"></progress><div class="identity-emblem" aria-hidden="true">?</div><ol id="identity-clues" class="identity-clues"></ol><form id="identity-form" class="controls"><input id="identity-input" class="compact-field" aria-label="Identidade" autocomplete="off" spellcheck="false"><button class="button button-primary">Responder</button></form><div class="controls">${GameUI.button('Revelar pista', 'identity-hint')}${GameUI.button('Revelar resposta', 'identity-reveal')}</div><p id="identity-feedback" class="notice hidden" role="status"></p>${GameUI.button('Próxima rodada', 'identity-next', 'primary')}`
        );
        let round = 0,
            item = null,
            shown = 0,
            misses = 0,
            locked = false,
            guesses = new Set();
        const value = () => Math.max(50, 400 - (shown - 1) * 80 - misses * 60);
        function render() {
            $('#identity-clues').replaceChildren();
            item.clues.slice(0, shown).forEach((clue, i) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span>${GameArt.escape(clue)}`;
                $('#identity-clues').append(li);
            });
            $('#identity-value').textContent =
                `${shown}/${item.clues.length} pistas · Base: ${value()} pontos${maxMisses < Infinity && !locked ? ` · ${maxMisses - misses} erros disponíveis` : ''}`;
            $('#identity-hint').disabled = locked || shown === item.clues.length;
        }
        function finish(correct) {
            if (locked) return;
            locked = true;
            session.score.answer(correct, correct ? value() : 0, correct || misses < maxMisses);
            $('#identity-meter').value = round;
            $('#identity-form').querySelector('button').disabled = true;
            $('#identity-reveal').disabled = true;
            shown = item.clues.length;
            render();
            $('#identity-feedback').className =
                'notice ' + (correct ? 'feedback-correct' : 'feedback-wrong');
            $('#identity-feedback').textContent =
                `${correct ? '✓ Correto!' : '✕ A identidade era'} ${item.name}.`;
            $('#identity-next').classList.remove('hidden');
            $('#identity-next').focus({ preventScroll: true });
        }
        function next() {
            if (round === total)
                return session.complete(session.score.snapshot().accuracy >= 60, {
                    text: 'Oito identidades exploradas. Revele menos pistas para melhorar a pontuação.'
                });
            item = deck.next();
            Progress.remember('identity', [item.id]);
            round++;
            shown = [3, 2, 1, 1][tier];
            misses = 0;
            locked = false;
            guesses = new Set();
            $('#identity-progress').textContent = `Rodada ${round}/${total}`;
            $('#identity-feedback').className = 'notice hidden';
            $('#identity-next').classList.add('hidden');
            $('#identity-form').querySelector('button').disabled = false;
            $('#identity-reveal').disabled = false;
            $('#identity-input').value = '';
            $('#identity-input').removeAttribute('aria-invalid');
            render();
            $('#identity-input').focus({ preventScroll: true });
        }
        session.listen($('#identity-form'), 'submit', (e) => {
            e.preventDefault();
            if (locked) return;
            const answer = $('#identity-input').value.trim(),
                key = KnowledgeEngine.normalize(answer);
            if (!key) return;
            if (KnowledgeEngine.matches(answer, [item.name, ...item.aliases])) {
                $('#identity-input').removeAttribute('aria-invalid');
                finish(true);
                return;
            }
            if (!guesses.has(key)) {
                misses++;
                guesses.add(key);
                session.score.attempt(false);
            }
            $('#identity-feedback').className = 'notice feedback-wrong';
            $('#identity-feedback').textContent =
                '✕ Essa não é a identidade secreta. Você pode tentar outra resposta ou revelar mais uma pista.';
            $('#identity-input').setAttribute('aria-invalid', 'true');
            render();
            if (misses >= maxMisses) {
                finish(false);
                return;
            }
            $('#identity-input').focus({ preventScroll: true });
        });
        session.listen($('#identity-input'), 'input', () => {
            $('#identity-input').removeAttribute('aria-invalid');
        });
        session.listen($('#identity-hint'), 'click', () => {
            if (!locked && shown < item.clues.length) {
                shown++;
                render();
            }
        });
        session.listen($('#identity-reveal'), 'click', () => finish(false));
        session.listen($('#identity-next'), 'click', next);
        next();
    },
    destroy: session.destroy
}));
