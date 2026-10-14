GameRegistry.register('timerecall', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            goal = Perception.precision(tier),
            scores = [];
        let round = 0,
            duration = 0,
            phase = 'idle',
            start = 0,
            cutoff = null;
        const $ = GameUI.shell(
            session,
            'Relógio Interno',
            'Observe por quanto tempo o círculo fica aceso. Depois, toque para iniciar e toque de novo para encerrar a mesma duração. Use Espaço ou Enter no botão.',
            `<p id="time-round" class="status-line"></p><div id="time-orb" class="time-orb" aria-hidden="true"></div><p id="time-status" class="status-line" role="status"></p>${GameUI.button('Observar duração', 'time-action', 'primary')}<p id="time-result" class="notice hidden"></p>${GameUI.button('Próximo intervalo', 'time-next', 'primary')}`
        );
        function next() {
            round++;
            duration = session.random.int([16, 24, 30, 40][tier], [50, 80, 110, 150][tier]) * 50;
            phase = 'idle';
            $('#time-round').textContent = `Intervalo ${round} de 5 · objetivo ${goal}%`;
            $('#time-status').textContent =
                'Prepare-se para observar. Sem cronômetro durante a resposta.';
            $('#time-action').textContent = 'Observar duração';
            $('#time-action').disabled = false;
            $('#time-result').classList.add('hidden');
            $('#time-result').textContent = '';
            $('#time-next').classList.add('hidden');
            $('#time-orb').classList.remove('lit');
        }
        function finish() {
            if (phase !== 'reproduce') return;
            session.clear(cutoff);
            const elapsed = session.now() - start,
                score = Perception.durationScore(elapsed, duration);
            phase = 'result';
            $('#time-orb').classList.remove('lit');
            $('#time-action').disabled = true;
            Perception.credit(session, scores, score, goal);
            $('#time-status').textContent = `${score}% de precisão`;
            $('#time-result').textContent =
                `Referência: ${(duration / 1000).toFixed(2)} s · sua duração: ${(elapsed / 1000).toFixed(2)} s · ${elapsed < duration ? 'faltaram' : 'passaram'} ${(Math.abs(elapsed - duration) / 1000).toFixed(2)} s.`;
            $('#time-result').classList.remove('hidden');
            $('#time-next').classList.remove('hidden');
            $('#time-next').textContent = round === 5 ? 'Ver resultado' : 'Próximo intervalo';
        }
        session.listen($('#time-action'), 'click', async () => {
            if (phase === 'idle') {
                phase = 'observe';
                $('#time-action').disabled = true;
                $('#time-status').textContent = 'Observe o círculo aceso…';
                $('#time-orb').classList.add('lit');
                if (!(await session.sleep(duration))) return;
                $('#time-orb').classList.remove('lit');
                phase = 'ready';
                $('#time-action').disabled = false;
                $('#time-action').textContent = 'Iniciar reprodução';
                $('#time-status').textContent = 'Agora reproduza o intervalo.';
            } else if (phase === 'ready') {
                phase = 'reproduce';
                start = session.now();
                $('#time-action').textContent = 'Encerrar reprodução';
                $('#time-status').textContent =
                    'Toque de novo quando sentir que o intervalo terminou.';
                $('#time-orb').classList.add('lit');
                cutoff = session.timeout(finish, 20000);
            } else finish();
        });
        session.listen($('#time-next'), 'click', () => {
            if (phase !== 'result') return;
            round === 5 ? Perception.campaign(session, scores, goal) : next();
        });
        next();
    },
    destroy: session.destroy
}));
