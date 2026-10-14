const Perception = Object.freeze({
    precision: (tier) => [70, 80, 88, 94][tier],
    exposure: (tier) => [3500, 2500, 1800, 1200][tier],
    angular(a, b, symmetry = 360) {
        const delta = Math.abs(a - b) % symmetry;
        return Math.min(delta, symmetry - delta);
    },
    pitch(value, octaves = 2) {
        return 220 * 2 ** ((value / 100) * octaves);
    },
    pitchScore(a, b) {
        return Math.max(0, Math.round(100 - Math.abs(1200 * Math.log2(a / b)) / 6));
    },
    durationScore(a, b) {
        return Math.max(0, Math.round(100 * (1 - Math.abs(a - b) / b)));
    },
    shapeScore(size, angle, target, symmetry) {
        return Math.max(
            0,
            Math.round(
                100 -
                    (50 * Math.abs(size - target.size)) / target.size -
                    (50 * Perception.angular(angle, target.angle, symmetry)) / (symmetry / 2)
            )
        );
    },
    polygon(kind, size, angle, reference = false) {
        const shapes = {
            triangle: 'M0-55L48 28H-48Z',
            square: 'M-43-43H43V43H-43Z',
            diamond: 'M0-58L42 0 0 58-42 0Z',
            arrow: 'M-55-20H8V-43L58 0 8 43V20H-55Z',
            star: 'M0-58L14-19 55-18 23 7 34 48 0 26-34 48-23 7-55-18-14-19Z'
        };
        return `<path d="${shapes[kind]}" transform="translate(150 150) rotate(${angle}) scale(${size / 100})" fill="${reference ? 'none' : '#a9c7df'}" stroke="${reference ? '#efb875' : '#314355'}" stroke-width="${reference ? 3 : 2}" ${reference ? 'stroke-dasharray="6 4"' : ''}/>`;
    },
    campaign(session, scores, goal) {
        const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        session.complete(average >= goal, {
            text: `Precisão média: ${average}%. ${scores.length} rodadas concluídas.`,
            average
        });
    },
    credit(session, scores, score, goal) {
        scores.push(score);
        session.score.attempt(score >= goal);
        session.score.add(score * 10);
    }
});

// Áudio começa apenas após gesto do jogador; nós e contexto pertencem à partida.
const SessionAudio = Object.freeze({
    create(session) {
        let context = null,
            disposed = false;
        const voices = new Set();
        session.onPauseChange((paused) => {
            if (context && !disposed)
                (paused ? context.suspend() : context.resume()).catch(() => {});
        });
        session.cleanup(() => {
            disposed = true;
            voices.forEach((voice) => {
                try {
                    voice.stop();
                } catch {}
            });
            voices.clear();
            context?.close().catch(() => {});
        });
        async function unlock() {
            if (disposed) return false;
            try {
                const Audio = window.AudioContext || window.webkitAudioContext;
                if (!Audio) return false;
                context ||= new Audio();
                if (context.state !== 'running') await context.resume();
                return !disposed && context.state === 'running';
            } catch {
                return false;
            }
        }
        function tone(frequency, duration = 0.65, type = 'sine') {
            if (disposed || !session.active || !context || context.state !== 'running')
                return false;
            const oscillator = context.createOscillator(),
                gain = context.createGain(),
                now = context.currentTime;
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, now);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.055, now + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            oscillator.connect(gain);
            gain.connect(context.destination);
            voices.add(oscillator);
            oscillator.onended = () => {
                voices.delete(oscillator);
                oscillator.disconnect();
                gain.disconnect();
            };
            oscillator.start();
            oscillator.stop(now + duration + 0.02);
            return true;
        }
        return Object.freeze({ unlock, tone });
    }
});
