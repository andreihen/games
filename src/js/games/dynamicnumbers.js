GameRegistry.register('dynamicnumbers', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            phases = session.random.shuffle([0, 1, 2]),
            total = [18, 24, 30, 36][tier],
            windowMs = [5000, 4000, 3000, 2200][tier];
        let index = 0,
            current = 0,
            rule = 0,
            locked = true,
            deadline = null;
        const $ = GameUI.shell(
            session,
            'Par ou Ímpar Dinâmico',
            'Responda com os botões ou as setas ← e →. A regra muda a cada bloco; leia o destaque antes de classificar.',
            `<p id="number-rule" class="notice directive"></p><p id="number-progress" class="status-line"></p><div id="number-stimulus" class="large-stimulus">Pronto?</div><div class="controls">${GameUI.button('← Esquerda', 'number-left')}${GameUI.button('Direita →', 'number-right')}</div><p id="number-feedback" class="notice hidden"></p>${GameUI.button('Começar', 'number-start', 'primary')}`
        );
        const labels = [
            '← par · → ímpar',
            '← múltiplo de 3 · → não múltiplo de 3',
            '← não primo · → primo'
        ];
        const rules = [
            { type: 'allowOnly', property: 'even', values: [true] },
            { type: 'allowOnly', property: 'multiple3', values: [true] },
            { type: 'allowOnly', property: 'prime', values: [false] }
        ];
        const feature = (n) => ({
                even: n % 2 === 0,
                multiple3: n % 3 === 0,
                prime: PuzzleMath.prime(n)
            }),
            candidates = Array.from({ length: [40, 80, 130, 200][tier] }, (_, i) => i + 1),
            plans = phases.flatMap((rule) =>
                session.random
                    .shuffle(Array.from({ length: total / 3 }, (_, i) => i < total / 6))
                    .map((left) =>
                        session.random.pick(
                            candidates.filter(
                                (n) => RuleEngine.evaluate(feature(n), [rules[rule]]) === left
                            )
                        )
                    )
            );
        function leftIsCorrect() {
            return RuleEngine.evaluate(
                {
                    even: current % 2 === 0,
                    multiple3: current % 3 === 0,
                    prime: PuzzleMath.prime(current)
                },
                [rules[rule]]
            );
        }
        function next() {
            if (index === total) {
                const stats = session.score.snapshot();
                return session.complete(stats.accuracy >= 60, {
                    text: `${stats.correct} classificações corretas em ${total}.`
                });
            }
            rule = phases[Math.floor(index / (total / 3))];
            current = plans[index++];
            locked = false;
            $('#number-rule').textContent = `REGRA ATUAL · ${labels[rule]}`;
            $('#number-progress').textContent =
                `Número ${index}/${total} · ${windowMs / 1000}s para responder`;
            $('#number-stimulus').textContent = current;
            $('#number-feedback').classList.add('hidden');
            $('#number-left').disabled = false;
            $('#number-right').disabled = false;
            deadline = session.timeout(() => answer(null), windowMs);
        }
        function answer(left) {
            if (locked) return;
            locked = true;
            session.clear(deadline);
            const expected = leftIsCorrect(),
                correct = left !== null && left === expected;
            session.score.answer(correct);
            $('#number-left').disabled = true;
            $('#number-right').disabled = true;
            $('#number-feedback').classList.remove('hidden');
            $('#number-feedback').textContent =
                `${correct ? 'Correto.' : left === null ? 'Tempo encerrado.' : 'Resposta incorreta.'} ${current}: escolha ${expected ? 'esquerda' : 'direita'} segundo a regra atual.`;
            session.timeout(next, 800);
        }
        session.listen($('#number-left'), 'click', () => answer(true));
        session.listen($('#number-right'), 'click', () => answer(false));
        session.listen(document, 'keydown', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                answer(event.key === 'ArrowLeft');
            }
        });
        session.listen($('#number-start'), 'click', () => {
            $('#number-start').remove();
            next();
        });
        $('#number-left').disabled = true;
        $('#number-right').disabled = true;
        $('#number-rule').textContent = 'Três blocos: paridade, múltiplos de 3 e números primos.';
    },
    destroy: session.destroy
}));
