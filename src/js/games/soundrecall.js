GameRegistry.register('soundrecall', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            goal = Perception.precision(tier),
            scores = [],
            audio = SessionAudio.create(session),
            octaves = [1, 1.5, 2, 3][tier];
        let round = 0,
            target = 0,
            value = 50,
            phase = 'idle',
            busy = false;
        const $ = GameUI.shell(
            session,
            'Nota de Memória',
            'Ouça a nota de referência. Depois ajuste do grave ao agudo e ouça sua tentativa até encontrar a mesma altura. Use fones ou um volume confortável.',
            `<p id="sound-round" class="status-line"></p><div class="sound-emblem" aria-hidden="true">♫</div><p id="sound-status" role="status" class="status-line"></p>${GameUI.button('Ouvir referência', 'sound-reference', 'primary')}<div class="perception-sliders"><label>Grave → agudo<input id="sound-pitch" type="range" min="0" max="100" step="0.1" value="50" aria-label="Altura da nota" /></label></div><div class="controls">${GameUI.button('Ouvir minha nota', 'sound-preview')}${GameUI.button('Confirmar nota', 'sound-submit', 'primary')}</div><p id="sound-result" class="notice hidden"></p>${GameUI.button('Próxima nota', 'sound-next', 'primary')}`
        );
        function controls() {
            $('#sound-pitch').disabled = phase !== 'adjust' || busy;
            $('#sound-preview').disabled = phase !== 'adjust' || busy;
            $('#sound-submit').disabled = phase !== 'adjust' || busy;
            $('#sound-reference').disabled =
                busy ||
                phase === 'result' ||
                (phase === 'adjust' && config.options.mode !== 'practice');
        }
        function next() {
            round++;
            target = Perception.pitch(session.random.int(5, 95), octaves);
            value = 50;
            phase = 'idle';
            busy = false;
            $('#sound-pitch').value = value;
            $('#sound-round').textContent = `Nota ${round} de 5 · objetivo ${goal}%`;
            $('#sound-status').textContent = 'Clique para ativar o áudio e ouvir a referência.';
            $('#sound-result').classList.add('hidden');
            $('#sound-result').textContent = '';
            $('#sound-next').classList.add('hidden');
            controls();
        }
        session.listen($('#sound-reference'), 'click', async () => {
            if (
                busy ||
                phase === 'result' ||
                (phase === 'adjust' && config.options.mode !== 'practice')
            )
                return;
            busy = true;
            controls();
            if (!(await audio.unlock())) {
                if (!session.alive) return;
                busy = false;
                $('#sound-status').textContent =
                    'Áudio indisponível. Ative o áudio do navegador e tente novamente.';
                controls();
                return;
            }
            if (!session.alive) return;
            audio.tone(target, 0.85);
            $('#sound-status').textContent = 'Ouça e memorize…';
            if (!(await session.sleep(1150))) return;
            busy = false;
            phase = 'adjust';
            $('#sound-status').textContent = 'Ajuste a altura e ouça sua nota.';
            controls();
        });
        session.listen($('#sound-pitch'), 'input', (e) => {
            if (phase === 'adjust') value = +e.target.value;
        });
        session.listen($('#sound-preview'), 'click', async () => {
            if (phase !== 'adjust' || busy) return;
            busy = true;
            controls();
            if (await audio.unlock()) audio.tone(Perception.pitch(value, octaves), 0.6);
            if (!(await session.sleep(750))) return;
            busy = false;
            controls();
        });
        session.listen($('#sound-submit'), 'click', () => {
            if (phase !== 'adjust' || busy) return;
            phase = 'result';
            const guess = Perception.pitch(value, octaves),
                score = Perception.pitchScore(guess, target);
            Perception.credit(session, scores, score, goal);
            $('#sound-status').textContent = `${score}% de precisão`;
            $('#sound-result').textContent =
                `Referência: ${Math.round(target)} Hz · sua nota: ${Math.round(guess)} Hz · diferença de ${Math.round(Math.abs(1200 * Math.log2(guess / target)))} cents.`;
            $('#sound-result').classList.remove('hidden');
            $('#sound-next').classList.remove('hidden');
            $('#sound-next').textContent = round === 5 ? 'Ver resultado' : 'Próxima nota';
            controls();
        });
        session.listen($('#sound-next'), 'click', () => {
            if (phase !== 'result') return;
            round === 5 ? Perception.campaign(session, scores, goal) : next();
        });
        next();
    },
    destroy: session.destroy
}));
