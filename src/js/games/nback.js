GameRegistry.register('nback', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            n =
                config.options.n && config.options.n !== 'auto'
                    ? Number(config.options.n)
                    : [1, 2, 3, 3][tier],
            kind = config.options.stimulus || 'figures',
            bank =
                kind === 'colors'
                    ? ['azul', 'vermelho', 'verde', 'amarelo', 'roxo', 'laranja']
                    : kind === 'positions'
                      ? Array.from({ length: 9 }, (_, i) => i)
                      : ['★', '◆', '▲', '●', '■', '✚'];
        let index = 0,
            locked = true,
            deadline = null;
        const sequence = Array.from({ length: n }, () => session.random.pick(bank)),
            total = 24 + n;
        const matches = session.random.shuffle(Array.from({ length: 24 }, (_, i) => i < 12));
        for (let i = n; i < total; i++)
            sequence.push(
                matches[i - n]
                    ? sequence[i - n]
                    : session.random.pick(bank.filter((v) => v !== sequence[i - n]))
            );
        const $ = GameUI.shell(
            session,
            `${n}-Back`,
            `Decida se o estímulo atual é igual ao de ${n} ${n === 1 ? 'posição' : 'posições'} atrás. Os primeiros ${n} estímulos servem para memorizar. Use ← para igual e → para diferente.`,
            `<p id="nback-progress" class="status-line"></p><div id="nback-stimulus" class="large-stimulus">Pronto?</div><div class="controls">${GameUI.button('← Igual', 'nback-same')}${GameUI.button('Diferente →', 'nback-different')}</div><p id="nback-feedback" class="notice hidden"></p>${GameUI.button('Começar', 'nback-start', 'primary')}`
        );
        function visual(value) {
            if (kind === 'positions')
                return `<div class="nback-positions">${bank.map((i) => `<span class="${i === value ? 'active' : ''}"></span>`).join('')}</div>`;
            if (kind === 'colors') {
                const colors = {
                    azul: '#60a5fa',
                    vermelho: '#f87171',
                    verde: '#4ade80',
                    amarelo: '#facc15',
                    roxo: '#c084fc',
                    laranja: '#fb923c'
                };
                return `<span style="color:${colors[value]}">●<small class="event-label">${value}</small></span>`;
            }
            return value;
        }
        function next() {
            if (index === sequence.length) {
                const stats = session.score.snapshot();
                return session.complete(stats.accuracy >= 60, {
                    text: `${stats.correct} acertos nas 24 comparações de ${n}-Back.`
                });
            }
            $('#nback-stimulus').innerHTML = visual(sequence[index]);
            $('#nback-feedback').classList.add('hidden');
            $('#nback-progress').textContent =
                index < n
                    ? `Memorização inicial ${index + 1}/${n}`
                    : `Comparação ${index - n + 1}/24`;
            locked = index < n;
            $('#nback-same').disabled = locked;
            $('#nback-different').disabled = locked;
            if (locked)
                deadline = session.timeout(() => {
                    index++;
                    next();
                }, [1800, 1500, 1200, 900][tier]);
            else deadline = session.timeout(() => answer(null), [5000, 4000, 3000, 2200][tier]);
        }
        function answer(same) {
            if (locked) return;
            locked = true;
            session.clear(deadline);
            const expected = sequence[index] === sequence[index - n],
                correct = same !== null && same === expected;
            session.score.answer(correct);
            $('#nback-same').disabled = true;
            $('#nback-different').disabled = true;
            $('#nback-feedback').classList.remove('hidden');
            $('#nback-feedback').textContent =
                `${correct ? 'Correto.' : same === null ? 'Tempo encerrado.' : 'Resposta incorreta.'} Os estímulos eram ${expected ? 'iguais' : 'diferentes'}.`;
            index++;
            session.timeout(next, 700);
        }
        session.listen($('#nback-same'), 'click', () => answer(true));
        session.listen($('#nback-different'), 'click', () => answer(false));
        session.listen(document, 'keydown', (event) => {
            if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
                answer(event.key === 'ArrowLeft');
            }
        });
        session.listen($('#nback-start'), 'click', () => {
            $('#nback-start').remove();
            next();
        });
        $('#nback-same').disabled = true;
        $('#nback-different').disabled = true;
    },
    destroy: session.destroy
}));
