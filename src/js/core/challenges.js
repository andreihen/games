const GameData = (() => {
    const values = new Map(),
        pending = new Map();
    function register(key, data) {
        values.set(key, data);
    }
    function load(key) {
        if (values.has(key)) return Promise.resolve(values.get(key));
        if (pending.has(key)) return pending.get(key);
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `./src/js/data/${key}.js?v=${GameRegistry.version}`;
            script.onload = () =>
                values.has(key) ? resolve(values.get(key)) : reject(Error('Dados ausentes.'));
            script.onerror = () => {
                pending.delete(key);
                reject(Error('Não foi possível carregar os dados locais.'));
            };
            document.head.append(script);
        });
        pending.set(key, promise);
        return promise;
    }
    return Object.freeze({ register, load });
})();
const ChallengeRunner = Object.freeze({
    quiz(session, config, spec) {
        const $ = GameUI.shell(
            session,
            spec.title,
            spec.instructions || 'Responda a cada rodada. O feedback explica o resultado.',
            `<p id="quiz-progress" class="status-line"></p><progress id="quiz-meter" class="challenge-meter" value="0" aria-label="Rodadas respondidas"></progress><div id="quiz-visual" class="large-stimulus"></div><h3 id="quiz-prompt" class="text-center"></h3><div id="quiz-choices" class="option-grid"></div><form id="quiz-form" class="controls hidden"><input id="quiz-input" class="compact-field" autocomplete="off" aria-label="Resposta"><button class="button button-primary">Responder</button></form><p id="quiz-feedback" class="notice hidden" role="status"></p>${GameUI.button('Próxima rodada', 'quiz-next', 'primary')}`
        );
        let index = 0,
            locked = false,
            question = null;
        const total = spec.rounds || [10, 12, 14, 16][DifficultyEngine.index(config.difficulty)];
        const check = (value) =>
            spec.check
                ? spec.check(value, question)
                : [question.correct, ...(question.aliases || [])].some(
                      (answer) => GameArt.normalize(answer) === GameArt.normalize(value)
                  );
        function answer(value) {
            if (locked) return;
            locked = true;
            const correct = check(value);
            session.score.answer(correct);
            spec.record?.(question, correct);
            $('#quiz-feedback').classList.remove('hidden');
            $('#quiz-feedback').classList.add(correct ? 'feedback-correct' : 'feedback-wrong');
            $('#quiz-form').classList.add(correct ? 'feedback-correct' : 'feedback-wrong');
            $('#quiz-meter').value = index;
            $('#quiz-feedback').textContent =
                `${correct ? 'Correto.' : 'Resposta: ' + (question.answerLabel || question.correct) + '.'} ${question.explanation || ''}`;
            $('#quiz-choices')
                .querySelectorAll('button')
                .forEach((button) => {
                    button.disabled = true;
                    const right = check(button.dataset.answer);
                    const selected = String(button.dataset.answer) === String(value);
                    button.classList.toggle('answer-correct', right);
                    button.classList.toggle('answer-wrong', selected && !right);
                    if (right || selected) {
                        const badge = document.createElement('span');
                        badge.className = 'answer-caption';
                        badge.textContent = right ? '✓ Correta' : '✕ Sua resposta';
                        button.append(badge);
                    }
                });
            $('#quiz-form').querySelector('button').disabled = true;
            $('#quiz-next').classList.remove('hidden');
            $('#quiz-next').focus({ preventScroll: true });
        }
        function round() {
            if (index === total) {
                const stats = session.score.snapshot();
                return session.complete(stats.accuracy >= 60, {
                    text: `${stats.correct} acertos em ${total} rodadas.`
                });
            }
            locked = false;
            question = spec.generate(index++, session.random, config);
            $('#quiz-progress').textContent = `Rodada ${index}/${total}`;
            $('#quiz-meter').max = total;
            $('#quiz-meter').value = index - 1;
            $('#quiz-prompt').textContent = question.prompt;
            $('#quiz-visual').innerHTML = question.visual || '';
            $('#quiz-feedback').classList.add('hidden');
            $('#quiz-feedback').classList.remove('feedback-correct', 'feedback-wrong');
            $('#quiz-form').classList.remove('feedback-correct', 'feedback-wrong');
            $('#quiz-next').classList.add('hidden');
            $('#quiz-choices').replaceChildren();
            const typing = question.typing || false;
            $('#quiz-form').classList.toggle('hidden', !typing);
            $('#quiz-form').querySelector('button').disabled = false;
            $('#quiz-input').value = '';
            if (typing) {
                $('#quiz-input').inputMode = question.numeric ? 'decimal' : 'text';
                $('#quiz-input').focus({ preventScroll: true });
            } else
                for (const option of question.options || []) {
                    const button = document.createElement('button');
                    button.dataset.answer = typeof option === 'object' ? option.value : option;
                    if (typeof option === 'object' && option.visual) {
                        button.innerHTML = option.visual;
                        button.setAttribute('aria-label', option.label);
                    } else button.textContent = typeof option === 'object' ? option.label : option;
                    session.listen(button, 'click', () =>
                        answer(typeof option === 'object' ? option.value : option)
                    );
                    $('#quiz-choices').append(button);
                }
            if (question.presentMs) {
                locked = true;
                $('#quiz-choices').classList.add('hidden');
                $('#quiz-form').classList.add('hidden');
                $('#quiz-prompt').textContent = question.observePrompt || 'Observe e memorize.';
                session.timeout(() => {
                    locked = false;
                    $('#quiz-visual').innerHTML = question.mask || '• • •';
                    $('#quiz-prompt').textContent = question.prompt;
                    $('#quiz-choices').classList.remove('hidden');
                    $('#quiz-form').classList.toggle('hidden', !typing);
                    if (typing) $('#quiz-input').focus({ preventScroll: true });
                }, question.presentMs);
            }
        }
        session.listen($('#quiz-form'), 'submit', (event) => {
            event.preventDefault();
            if ($('#quiz-input').value.trim()) answer($('#quiz-input').value);
        });
        session.listen($('#quiz-next'), 'click', round);
        round();
    },
    choices(random, correct, distractors, count = 4) {
        return random.shuffle([
            correct,
            ...random
                .shuffle([...new Set(distractors)].filter((v) => String(v) !== String(correct)))
                .slice(0, count - 1)
        ]);
    },
    numericChoices(random, answer) {
        let set = new Set([answer]);
        while (set.size < 4)
            set.add(
                answer +
                    random.int(
                        -Math.max(4, (Math.abs(answer) * 0.3) | 0),
                        Math.max(4, (Math.abs(answer) * 0.3) | 0)
                    )
            );
        return random.shuffle([...set]).map(String);
    }
});
