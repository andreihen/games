const { setup, assert, fs, path } = require('./harness.cjs');
const results = [];
async function test(name, fn) {
    try {
        await fn();
        results.push({ name, passed: true });
        console.log('PASS ' + name);
    } catch (error) {
        results.push({ name, passed: false, error: error.stack });
        console.error('FAIL ' + name, error);
    }
}
function mockAudio(t) {
    const frequencies = [],
        contexts = [],
        voices = [];
    class Audio {
        constructor() {
            this.state = 'suspended';
            this.currentTime = 0;
            this.destination = {};
            contexts.push(this);
        }
        async resume() {
            this.state = 'running';
        }
        async suspend() {
            this.state = 'suspended';
        }
        async close() {
            this.state = 'closed';
        }
        createOscillator() {
            const voice = {
                frequency: { setValueAtTime: (f) => frequencies.push(f) },
                connect() {},
                disconnect() {},
                start() {},
                stop() {},
                type: 'sine'
            };
            voices.push(voice);
            return voice;
        }
        createGain() {
            return {
                gain: {
                    setValueAtTime() {},
                    linearRampToValueAtTime() {},
                    exponentialRampToValueAtTime() {}
                },
                connect() {},
                disconnect() {}
            };
        }
    }
    t.w.AudioContext = Audio;
    return { frequencies, contexts, voices };
}
async function run() {
    await test('Percepção: simetrias, duração relativa e oitavas', () => {
        const t = setup(),
            p = t.api('Perception');
        assert.equal(p.angular(0, 120, 120), 0);
        assert.equal(p.angular(359, 1), 2);
        assert.equal(p.shapeScore(100, 90, { size: 100, angle: 0 }, 90), 100);
        assert.equal(p.durationScore(2000, 2000), 100);
        assert.equal(p.durationScore(1000, 2000), 50);
        assert.equal(p.pitchScore(440, 440), 100);
        assert.equal(p.pitch(100, 1), 440);
        assert.equal(p.pitchScore(440, 880), 0);
        t.clean();
        const app = setup({ app: true });
        app.startApp();
        app.click('[data-filter="perception"]');
        assert.equal(app.$$('.game-card').length, 7);
        assert.equal(app.$('#library-title').textContent, 'Jogos de percepção');
        app.clean();
    });
    await test('Cor Relâmpago: cor apresentada, bloqueio, reconstrução e cinco rodadas', async () => {
        const t = setup();
        await t.mount('colorrecall');
        for (let r = 0; r < 5; r++) {
            t.click('#cm-observe');
            const rgb = t.$('#cm-art rect').getAttribute('fill').match(/\d+/g).map(Number);
            assert(t.$('#cm-submit').disabled);
            await t.advance(3501);
            const [red, green, blue] = rgb.map((v) => v / 255),
                max = Math.max(red, green, blue),
                min = Math.min(red, green, blue),
                delta = max - min;
            let h =
                delta === 0
                    ? 0
                    : max === red
                      ? 60 * (((green - blue) / delta) % 6)
                      : max === green
                        ? 60 * ((blue - red) / delta + 2)
                        : 60 * ((red - green) / delta + 4);
            if (h < 0) h += 360;
            [Math.round(h), Math.round((100 * delta) / max), Math.round(100 * max)].forEach(
                (v, i) => t.input(`#cm-value-${i}`, v)
            );
            t.click('#cm-submit');
            assert(parseInt(t.$('#cm-phase').textContent) >= 97);
            t.click('#cm-next');
        }
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    await test('Relógio: intervalos observáveis, reprodução exata e pausa sem contaminar a duração', async () => {
        const t = setup();
        for (const tier of ['easy', 'medium', 'hard', 'expert']) {
            await t.mount('timerecall', tier);
            for (let r = 0; r < 5; r++) {
                t.click('#time-action');
                let duration = 0;
                while (t.$('#time-action').disabled) {
                    await t.advance(50);
                    duration += 50;
                    assert(duration <= 8000);
                }
                t.click('#time-action');
                if (r === 0) {
                    t.session.pause();
                    await t.advance(5000);
                    t.session.resume();
                }
                await t.advance(duration);
                t.click('#time-action');
                assert(t.$('#time-status').textContent.startsWith('100%'));
                t.click('#time-next');
            }
            assert.equal(t.outcomes[0][0], true);
        }
        t.clean();
    });
    await test('Formas: respostas reconstruídas da apresentação, cinco formas e contorno original', async () => {
        const t = setup();
        for (const tier of ['easy', 'expert']) {
            await t.mount('shaperecall', tier);
            for (let r = 0; r < 5; r++) {
                t.click('#shape-action');
                const transform = t.$('#shape-stage path').getAttribute('transform'),
                    angle = +transform.match(/rotate\(([^)]+)/)[1],
                    size = 100 * +transform.match(/scale\(([^)]+)/)[1];
                assert(t.$('#shape-size').disabled);
                await t.advance(3501);
                t.input('#shape-size', Math.round(size));
                t.input('#shape-angle', angle);
                t.click('#shape-action');
                assert(t.$('#shape-status').textContent.startsWith('100%'));
                assert.equal(t.$$('#shape-stage path').length, 2);
                t.click('#shape-next');
            }
            assert.equal(t.outcomes[0][0], true);
        }
        t.clean();
    });
    await test('Padrões: cinco grades nas quatro dificuldades são restauráveis pelas peças vistas', async () => {
        const t = setup();
        for (const tier of ['easy', 'medium', 'hard', 'expert']) {
            await t.mount('patternrepair', tier);
            for (let r = 0; r < 5; r++) {
                t.click('#pattern-action');
                const target = t.$$('#pattern-board button').map((b) => b.textContent);
                await t.advance(3501);
                let current = t.$$('#pattern-board button').map((b) => b.textContent);
                assert.notDeepEqual(current, target);
                for (let i = 0; i < target.length; i++)
                    if (current[i] !== target[i]) {
                        const j = current.findIndex(
                            (v, k) => k > i && v === target[i] && v !== target[k]
                        );
                        assert(j >= 0);
                        t.click(`[data-pattern-cell="${i}"]`);
                        t.click(`[data-pattern-cell="${j}"]`);
                        current = t.$$('#pattern-board button').map((b) => b.textContent);
                    }
                t.click('#pattern-action');
                assert.equal(t.$('#pattern-status').textContent, 'Padrão restaurado!');
                t.click('#pattern-next');
            }
            assert.equal(t.outcomes[0][0], true);
        }
        t.clean();
    });
    await test('Som: falha de áudio recuperável; referência, ajuste, pausa e limpeza do contexto', async () => {
        const t = setup();
        await t.mount('soundrecall');
        t.click('#sound-reference');
        await t.flush();
        assert(t.$('#sound-status').textContent.includes('Áudio indisponível'));
        assert(t.$('#sound-submit').disabled);
        const audio = mockAudio(t);
        await t.mount('soundrecall', 'hard');
        for (let r = 0; r < 5; r++) {
            t.click('#sound-reference');
            await t.flush();
            const target = audio.frequencies.at(-1);
            if (r === 0) {
                t.session.pause();
                await t.flush();
                assert.equal(audio.contexts.at(-1).state, 'suspended');
                t.session.resume();
                await t.flush();
                assert.equal(audio.contexts.at(-1).state, 'running');
            }
            await t.advance(1151);
            t.input('#sound-pitch', 50 * Math.log2(target / 220));
            t.click('#sound-preview');
            await t.flush();
            await t.advance(751);
            t.click('#sound-submit');
            assert(t.$('#sound-status').textContent.startsWith('100%'));
            t.click('#sound-next');
        }
        assert.equal(t.outcomes[0][0], true);
        await t.flush();
        assert.equal(audio.contexts.at(-1).state, 'closed');
        t.clean();
    });
    await test('Ritmo: notas observadas, gravação no tempo e teclado sem duplicação', async () => {
        const t = setup();
        await t.mount('temporebuild', 'easy', { sound: 'off' });
        for (let track = 0; track < 2; track++) {
            t.click('#tempo-demo');
            const target = t
                    .$$('.tempo-beat')
                    .map((e, i) => (e.classList.contains('note') ? i : null))
                    .filter((i) => i !== null),
                bpm = +t.$('#tempo-round').textContent.match(/(\d+) BPM/)[1],
                beat = 60000 / bpm;
            await t.advance(8 * beat + 1);
            t.click('#tempo-record');
            await t.advance(4 * beat);
            let elapsed = 0;
            for (const step of target) {
                await t.advance(step * beat - elapsed);
                elapsed = step * beat;
                t.$('#tempo-tap').dispatchEvent(
                    new t.w.KeyboardEvent('keydown', {
                        key: ' ',
                        code: 'Space',
                        bubbles: true,
                        cancelable: true
                    })
                );
            }
            await t.advance(8 * beat - elapsed + 1);
            assert(t.$('#tempo-status').textContent.startsWith('100%'));
            t.click('#tempo-next');
        }
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    await test('Ritmo: inação não vence, áudio não começa antes do gesto e timers são cancelados', async () => {
        const t = setup(),
            audio = mockAudio(t);
        await t.mount('temporebuild', 'easy');
        assert.equal(audio.contexts.length, 0);
        t.click('#tempo-demo');
        await t.flush();
        assert.equal(audio.contexts.length, 1);
        await t.advance(10000);
        t.click('#tempo-record');
        await t.advance(15000);
        assert(t.$('#tempo-status').textContent.startsWith('0%'));
        t.session.destroy();
        await t.flush();
        assert.equal(audio.contexts[0].state, 'closed');
        t.clean();
    });
    fs.writeFileSync(
        path.join(__dirname, 'results/perception.json'),
        JSON.stringify(results, null, 2)
    );
    if (results.some((r) => !r.passed)) process.exitCode = 1;
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
