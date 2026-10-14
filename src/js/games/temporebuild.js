GameRegistry.register('temporebuild', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            steps = [8, 12, 16, 16][tier],
            tracks = [2, 3, 3, 4][tier],
            bpm = session.random.int([80, 90, 100, 110][tier], [100, 115, 130, 150][tier]),
            beat = 60000 / bpm,
            windowMs = [180, 140, 110, 80][tier],
            scores = [],
            audio = SessionAudio.create(session);
        const names = ['Bumbo', 'Caixa', 'Chimbal', 'Percussão'],
            frequencies = [90, 180, 620, 360];
        const patterns = Array.from({ length: tracks }, (_, track) =>
            session.random
                .shuffle(Array.from({ length: steps }, (_, i) => i))
                .slice(0, [3, 4, 5, 6][tier] + (track === 2 ? 1 : 0))
                .sort((a, b) => a - b)
        );
        let track = 0,
            phase = 'idle',
            taps = [],
            recordStart = 0,
            frame = null;
        const $ = GameUI.shell(
            session,
            'Construtor de Ritmo',
            'Ouça e observe uma faixa. Depois bata no botão quando as notas chegariam ao centro. Reconstrua uma faixa de cada vez; Espaço também funciona.',
            `<p id="tempo-round" class="status-line"></p><div id="tempo-tracks" class="tempo-tracks"></div><div id="tempo-beats" class="tempo-beats"></div><p id="tempo-status" class="status-line" role="status"></p><div class="controls">${GameUI.button('Ouvir e observar faixa', 'tempo-demo', 'primary')}${GameUI.button('Gravar minha batida', 'tempo-record')}</div><button id="tempo-tap" class="tempo-tap" disabled>Bater <small>Espaço · toque</small></button><p id="tempo-result" class="notice hidden"></p>${GameUI.button('Próxima faixa', 'tempo-next', 'primary')}`
        );
        function controls() {
            $('#tempo-demo').disabled = !['idle', 'ready'].includes(phase);
            $('#tempo-record').disabled = phase !== 'ready';
            $('#tempo-tap').disabled = phase !== 'record';
        }
        function paint(step = -1, hit = false) {
            $('#tempo-beats').innerHTML = Array.from(
                { length: steps },
                (_, i) =>
                    `<span class="tempo-beat ${i === step ? 'active' : ''} ${phase === 'demo' && patterns[track].includes(i) ? 'note' : ''} ${hit && i === step ? 'hit' : ''}" aria-hidden="true">${i + 1}</span>`
            ).join('');
        }
        function next() {
            phase = 'idle';
            taps = [];
            $('#tempo-round').textContent =
                `Faixa ${track + 1} de ${tracks}: ${names[track]} · ${bpm} BPM`;
            $('#tempo-tracks').innerHTML = names
                .slice(0, tracks)
                .map(
                    (name, i) =>
                        `<span class="${i < track ? 'done' : i === track ? 'current' : ''}">${i < track ? '✓ ' : ''}${name}</span>`
                )
                .join('');
            $('#tempo-status').textContent = 'Primeiro conheça esta faixa.';
            $('#tempo-result').classList.add('hidden');
            $('#tempo-result').textContent = '';
            $('#tempo-next').classList.add('hidden');
            paint();
            controls();
        }
        async function play() {
            if (!['idle', 'ready'].includes(phase)) return;
            phase = 'loading';
            controls();
            if (config.options.sound !== 'off' && !(await audio.unlock())) {
                if (!session.alive) return;
                phase = 'idle';
                $('#tempo-status').textContent =
                    'Áudio indisponível. Escolha o modo visual na configuração.';
                controls();
                return;
            }
            if (!session.alive) return;
            phase = 'demo';
            $('#tempo-status').textContent = `Observe a faixa ${names[track]}.`;
            for (let i = 0; i < steps; i++) {
                paint(i);
                if (patterns[track].includes(i) && config.options.sound !== 'off')
                    audio.tone(frequencies[track], 0.1, track === 1 ? 'triangle' : 'sine');
                if (!(await session.sleep(beat))) return;
            }
            phase = 'ready';
            $('#tempo-status').textContent =
                'Pronto? A gravação começa após quatro batidas de preparação.';
            paint();
            controls();
        }
        function finish() {
            if (phase !== 'record') return;
            phase = 'result';
            session.clear(frame);
            const unmatched = new Set(patterns[track]);
            let quality = 0;
            for (const time of taps) {
                let best = null,
                    distance = Infinity;
                for (const i of unmatched) {
                    const delta = Math.abs(time - i * beat);
                    if (delta < distance) {
                        distance = delta;
                        best = i;
                    }
                }
                if (best !== null && distance <= windowMs) {
                    unmatched.delete(best);
                    quality += 1 - (0.35 * distance) / windowMs;
                }
            }
            const extras = Math.max(0, taps.length - (patterns[track].length - unmatched.size)),
                score = Math.max(
                    0,
                    Math.round((100 * (quality - 0.25 * extras)) / patterns[track].length)
                );
            Perception.credit(session, scores, score, Perception.precision(tier));
            $('#tempo-status').textContent = `${score}% de precisão`;
            $('#tempo-result').textContent =
                `${patterns[track].length - unmatched.size} de ${patterns[track].length} notas no tempo · ${extras} batidas extras · tolerância ${windowMs} ms. Notas da referência: ${patterns[track].map((i) => i + 1).join(', ')}.`;
            $('#tempo-result').classList.remove('hidden');
            $('#tempo-next').classList.remove('hidden');
            $('#tempo-next').textContent = track === tracks - 1 ? 'Ver resultado' : 'Próxima faixa';
            paint();
            controls();
        }
        session.listen($('#tempo-demo'), 'click', play);
        session.listen($('#tempo-record'), 'click', async () => {
            if (phase !== 'ready') return;
            phase = 'count';
            controls();
            for (let i = 4; i > 0; i--) {
                $('#tempo-status').textContent = `Preparação: ${i}`;
                if (config.options.sound !== 'off') audio.tone(900, 0.05);
                if (!(await session.sleep(beat))) return;
            }
            phase = 'record';
            taps = [];
            recordStart = session.now();
            $('#tempo-status').textContent = 'Sua vez. Reproduza as notas desta faixa.';
            controls();
            paint(0);
            frame = session.interval(
                () => paint(Math.min(steps - 1, Math.floor((session.now() - recordStart) / beat))),
                40
            );
            session.timeout(finish, steps * beat);
        });
        function tap() {
            if (phase !== 'record') return;
            const time = session.now() - recordStart;
            if (taps.length >= steps * 4) return;
            taps.push(time);
            if (config.options.sound !== 'off')
                audio.tone(frequencies[track], 0.09, track === 1 ? 'triangle' : 'sine');
            paint(Math.min(steps - 1, Math.floor(time / beat)), true);
        }
        session.listen($('#tempo-tap'), 'click', tap);
        session.listen($('#tempo-tap'), 'keydown', (e) => {
            if (e.code === 'Space' || e.key === 'Enter') {
                e.preventDefault();
                if (!e.repeat) tap();
            }
        });
        session.listen(document, 'keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                tap();
            }
        });
        session.listen($('#tempo-next'), 'click', () => {
            if (phase !== 'result') return;
            if (track === tracks - 1)
                Perception.campaign(session, scores, Perception.precision(tier));
            else {
                track++;
                next();
            }
        });
        next();
    },
    destroy: session.destroy
}));
