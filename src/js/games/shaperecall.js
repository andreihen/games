GameRegistry.register('shaperecall', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            goal = Perception.precision(tier),
            scores = [],
            deck = session.random.shuffle(['triangle', 'square', 'diamond', 'arrow', 'star']),
            symmetry = { triangle: 120, square: 90, diamond: 180, arrow: 360, star: 72 };
        let round = -1,
            phase = 'idle',
            target,
            shape,
            size = 90,
            angle = 0;
        const $ = GameUI.shell(
            session,
            'Forma de Memória',
            'Observe tamanho e rotação. Quando a forma desaparecer, ajuste os controles para reconstruí-la. A referência aparece em contorno após confirmar.',
            `<p id="shape-round" class="status-line"></p><svg id="shape-stage" class="shape-stage" viewBox="0 0 300 300" role="img" aria-label="Forma para memorizar ou reconstruir"></svg><p id="shape-status" role="status" class="status-line"></p><div class="perception-sliders"><label>Tamanho <output id="shape-size-value"></output><input id="shape-size" type="range" min="40" max="140" value="90" aria-label="Tamanho" /></label><label>Rotação <output id="shape-angle-value"></output><input id="shape-angle" type="range" min="0" max="359" value="0" aria-label="Rotação" /></label></div>${GameUI.button('Observar forma', 'shape-action', 'primary')}<p id="shape-result" class="notice hidden"></p>${GameUI.button('Próxima forma', 'shape-next', 'primary')}`
        );
        function paint() {
            $('#shape-stage').innerHTML =
                phase === 'idle'
                    ? ''
                    : Perception.polygon(
                          shape,
                          phase === 'observe' ? target.size : size,
                          phase === 'observe' ? target.angle : angle
                      ) +
                      (phase === 'result'
                          ? Perception.polygon(shape, target.size, target.angle, true)
                          : '');
            $('#shape-size').disabled = phase !== 'adjust';
            $('#shape-angle').disabled = phase !== 'adjust';
            $('#shape-size-value').textContent = `${size}%`;
            $('#shape-angle-value').textContent = `${angle}°`;
        }
        function next() {
            round++;
            shape = deck[round];
            target = { size: session.random.int(60, 125), angle: session.random.int(0, 359) };
            size = 90;
            angle = 0;
            phase = 'idle';
            $('#shape-size').value = size;
            $('#shape-angle').value = angle;
            $('#shape-round').textContent = `Forma ${round + 1} de 5 · objetivo ${goal}%`;
            $('#shape-status').textContent = 'Pronto para observar?';
            $('#shape-action').textContent = 'Observar forma';
            $('#shape-action').disabled = false;
            $('#shape-next').classList.add('hidden');
            $('#shape-result').classList.add('hidden');
            $('#shape-result').textContent = '';
            paint();
        }
        for (const [id, fn] of [
            ['shape-size', (v) => (size = v)],
            ['shape-angle', (v) => (angle = v)]
        ])
            session.listen($('#' + id), 'input', (e) => {
                if (phase !== 'adjust') return;
                fn(+e.target.value);
                paint();
            });
        session.listen($('#shape-action'), 'click', async () => {
            if (phase === 'idle') {
                phase = 'observe';
                $('#shape-status').textContent = 'Memorize tamanho e rotação…';
                $('#shape-action').disabled = true;
                paint();
                if (!(await session.sleep(Perception.exposure(tier)))) return;
                phase = 'adjust';
                $('#shape-status').textContent = 'Reconstrua a forma.';
                $('#shape-action').textContent = 'Confirmar forma';
                $('#shape-action').disabled = false;
                paint();
            } else if (phase === 'adjust') {
                phase = 'result';
                const score = Perception.shapeScore(size, angle, target, symmetry[shape]);
                Perception.credit(session, scores, score, goal);
                $('#shape-status').textContent = `${score}% de precisão`;
                $('#shape-result').textContent =
                    `Referência em tracejado: tamanho ${target.size}%, rotação ${target.angle}°. Diferença de tamanho ${Math.abs(size - target.size)} pontos; rotação ${Math.round(Perception.angular(angle, target.angle, symmetry[shape]))}° considerando a simetria da forma.`;
                $('#shape-result').classList.remove('hidden');
                $('#shape-action').disabled = true;
                $('#shape-next').classList.remove('hidden');
                $('#shape-next').textContent = round === 4 ? 'Ver resultado' : 'Próxima forma';
                paint();
            }
        });
        session.listen($('#shape-next'), 'click', () => {
            if (phase !== 'result') return;
            round === 4 ? Perception.campaign(session, scores, goal) : next();
        });
        next();
    },
    destroy: session.destroy
}));
