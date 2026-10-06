GameRegistry.register('oddcolor', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            size = [3, 4, 5, 6][tier];
        let round = 0,
            target = 0,
            locked = false;
        const $ = GameUI.shell(
            session,
            'Cor Intrusa',
            'Encontre a única célula de cor diferente. O contraste diminui conforme sua sequência de acertos cresce.',
            `<p id="odd-progress" class="status-line"></p><div id="odd-grid" class="tile-grid" style="grid-template-columns:repeat(${size},1fr)"></div><p id="odd-feedback" class="notice hidden"></p>${GameUI.button('Próxima rodada', 'odd-next', 'primary')}`
        );
        function next() {
            if (round === 15) {
                const stats = session.score.snapshot();
                return session.complete(stats.accuracy >= 60, {
                    text: 'Quinze grades concluídas.'
                });
            }
            round++;
            locked = false;
            target = session.random.int(0, size * size - 1);
            const h = session.random.int(0, 359),
                s = session.random.int(50, 80),
                l = session.random.int(32, 55),
                streak = session.score.snapshot().streak;
            let offset = Math.max(2.5, [15, 12, 9, 7][tier] - streak * 0.7);
            while (
                ColorEngine.distance(ColorEngine.lab(h, s, l), ColorEngine.lab(h, s, l + offset)) <
                2.5
            )
                offset += 0.25;
            const grid = $('#odd-grid');
            grid.replaceChildren();
            for (let i = 0; i < size * size; i++) {
                const b = document.createElement('button');
                b.style.background = `hsl(${h} ${s}% ${i === target ? l + offset : l}%)`;
                b.setAttribute('aria-label', `Célula ${i + 1}`);
                session.listen(b, 'click', () => answer(i));
                grid.append(b);
            }
            $('#odd-progress').textContent = `Rodada ${round}/15`;
            $('#odd-feedback').classList.add('hidden');
            $('#odd-next').classList.add('hidden');
        }
        function answer(index) {
            if (locked) return;
            locked = true;
            const correct = index === target;
            session.score.answer(correct);
            $('#odd-grid').children[target].classList.add('selected');
            $('#odd-grid')
                .querySelectorAll('button')
                .forEach((b) => (b.disabled = true));
            $('#odd-feedback').classList.remove('hidden');
            $('#odd-feedback').textContent = correct
                ? 'Você encontrou a cor intrusa.'
                : 'A célula destacada era a cor diferente.';
            $('#odd-next').classList.remove('hidden');
        }
        session.listen($('#odd-next'), 'click', next);
        next();
    },
    destroy: session.destroy
}));
