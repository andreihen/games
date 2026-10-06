GameRegistry.register('mental_math', (session) => {
    function init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            mode = config.options.mode || 'precision';
        let question,
            round = 0,
            locked = false,
            deadline = session.now() + (mode === 'sprint' ? 60000 : 30000),
            ended = false;
        const $ = GameUI.shell(
            session,
            'Arena de Cálculo',
            'Calcule mentalmente e responda. Acertos consecutivos multiplicam os pontos até ×4. Um erro quebra o combo e a partida continua.',
            `<p id="mm-progress" class="status-line"></p><div id="mm-problem" class="large-stimulus"></div><form id="mm-form" class="controls"><input id="mm-answer" class="compact-field" inputmode="decimal" autocomplete="off" aria-label="Resposta numérica"><button id="mm-submit" class="button button-primary">Responder</button></form><div id="mm-pad" class="number-pad">${['7', '8', '9', '4', '5', '6', '1', '2', '3', '−', '0', '⌫'].map((key) => `<button data-key="${key}">${key}</button>`).join('')}</div><p id="mm-feedback" class="notice" role="status"></p>${GameUI.button('Encerrar sessão', 'mm-finish')}`
        );
        function generate() {
            const rng = session.random,
                operation = rng.pick(['+', '−', '×', '÷']);
            let a, b, value, text;
            if (tier === 0) {
                a = rng.int(2, 12);
                b = rng.int(2, 12);
            } else if (tier === 1) {
                a = rng.int(12, 35);
                b = rng.int(12, 35);
            } else {
                a = rng.int(8, 20);
                b = rng.int(3, 18);
            }
            if (operation === '×' && tier < 2) {
                a = rng.int(tier ? 10 : 2, tier ? 18 : 9);
                b = rng.int(2, 9);
            }
            if (operation === '÷') {
                b = rng.int(2, tier ? 12 : 9);
                value = rng.int(2, tier ? 15 : 9);
                a = b * value;
            } else value = operation === '+' ? a + b : operation === '−' ? a - b : a * b;
            text = `${a} ${operation} ${b}`;
            if (tier >= 2)
                for (let step = 1; step < config.steps; step++) {
                    const ops = ['+', '−'];
                    if (Math.abs(value) <= 80) ops.push('×');
                    const factors = Array.from({ length: 11 }, (_, i) => i + 2).filter(
                        (n) => value !== 0 && value % n === 0
                    );
                    if (factors.length) ops.push('÷');
                    const op = rng.pick(ops),
                        n =
                            op === '÷'
                                ? rng.pick(factors)
                                : op === '×'
                                  ? rng.int(2, 5)
                                  : rng.int(2, 20);
                    value =
                        op === '+'
                            ? value + n
                            : op === '−'
                              ? value - n
                              : op === '×'
                                ? value * n
                                : value / n;
                    text = `(${text}) ${op} ${n}`;
                }
            if (tier === 2 && rng.float() < 0.25) {
                a = rng.int(8, 15);
                b = rng.int(10, 50);
                text = `${a}² − ${b}`;
                value = a * a - b;
            }
            return { text, value };
        }
        function finish() {
            if (ended) return;
            ended = true;
            const stats = session.score.snapshot();
            session.complete(stats.correct > 0 && (stats.accuracy ?? 0) >= 60, {
                text: `${stats.correct} acertos · ${stats.mistakes} erros · ${mode === 'precision' ? 'sem limite de tempo' : mode === 'sprint' ? 'Sprint de 60 segundos' : 'sobrevivência'}.`
            });
        }
        function next() {
            if (mode === 'precision' && round >= config.target) return finish();
            locked = false;
            question = generate();
            round++;
            $('#mm-problem').textContent = question.text;
            $('#mm-answer').value = '';
            $('#mm-submit').disabled = false;
            $('#mm-answer').focus();
        }
        session.listen($('#mm-form'), 'submit', (event) => {
            event.preventDefault();
            if (locked || !$('#mm-answer').value.trim()) return;
            const value = Number($('#mm-answer').value.replace(',', '.').replace('−', '-'));
            if (!Number.isFinite(value)) return session.notify('Digite um número válido.');
            locked = true;
            $('#mm-submit').disabled = true;
            const correct = Math.abs(value - question.value) < 0.00001;
            session.score.answer(correct);
            if (mode === 'survival' && correct) deadline += 3000;
            $('#mm-feedback').textContent = correct
                ? `Acerto! Combo ×${Math.min(4, session.score.snapshot().streak)}.`
                : `Resposta: ${question.value}. O combo recomeça na próxima pergunta.`;
            session.timeout(next, 650);
        });
        session.listen($('#mm-pad'), 'click', (event) => {
            const key = event.target.closest('[data-key]')?.dataset.key;
            if (!key || locked) return;
            const input = $('#mm-answer');
            if (key === '⌫') input.value = input.value.slice(0, -1);
            else if (key === '−') {
                if (!input.value) input.value = '-';
            } else input.value += key;
            input.focus();
        });
        session.listen($('#mm-finish'), 'click', finish);
        session.interval(() => {
            $('#mm-progress').textContent =
                `Rodada ${round}${mode === 'precision' ? `/${config.target}` : ` · ${Math.max(0, Math.ceil((deadline - session.now()) / 1000))}s restantes`}`;
            if (mode !== 'precision' && session.now() >= deadline) finish();
        }, 200);
        next();
    }
    return { init, destroy: session.destroy };
});
