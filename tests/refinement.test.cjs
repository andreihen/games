const { setup, assert, fs, path, root } = require('./harness.cjs');
const reports = [];
async function test(name, run) {
    try {
        await run();
        reports.push({ name, status: 'PASS' });
        console.log('PASS ' + name);
    } catch (error) {
        reports.push({ name, status: 'FAIL', error: error.stack });
        console.error(error);
    }
}
async function main() {
    await test('Memória: uma posição acesa por vez, sem números antecipados, resposta bloqueada e vitória', async () => {
        for (const game of ['memory_game', 'memorypath']) {
            const t = setup();
            const observed = [];
            let previous = null;
            t.watch(() => {
                const lit = t.$$('#mp-grid-container .flash');
                assert(lit.length <= 1, 'A apresentação revelou mais de uma posição');
                const current = lit[0]?.dataset.cell ?? null;
                if (current !== null) {
                    assert.equal(lit[0].textContent, '');
                    assert(lit[0].disabled);
                    if (current !== previous) observed.push(+current);
                }
                previous = current;
            });
            await t.mount(game, 'easy', { mode: game === 'memory_game' ? 'sequence' : 'spatial' });
            assert.equal(observed.length, 5);
            assert.equal(new Set(observed).size, 5);
            for (const cell of observed) t.click(t.$$('#mp-grid-container button')[cell]);
            assert.equal(t.outcomes[0][0], true);
            assert.equal(t.outcomes[0][1].metrics.correct, 5);
            t.clean();
        }
    });
    await test('Trilha: rotação explícita transforma corretamente as posições observadas', async () => {
        const t = setup();
        const observed = [];
        let previous = null;
        t.watch(() => {
            const current = t.$('#mp-grid-container .flash')?.dataset.cell ?? null;
            if (current !== null && current !== previous) observed.push(+current);
            previous = current;
        });
        await t.mount('memorypath', 'easy', { mode: 'rotation' });
        for (const cell of observed) {
            const rotated = (cell % 4) * 4 + 3 - Math.floor(cell / 4);
            t.click(t.$$('#mp-grid-container button')[rotated]);
        }
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    await test('Simon inverso: opostos e regra seguinte permanecem jogáveis pelo teclado', async () => {
        const t = setup();
        let observed = [],
            previous = null;
        t.watch(() => {
            const current = t.$('#ss-pads .simon-lit')?.dataset.pad ?? null;
            if (
                current !== null &&
                current !== previous &&
                t.$('#ss-status').textContent.startsWith('Observe')
            )
                observed.push(+current);
            previous = current;
        });
        await t.mount('simonsays', 'easy', { mode: 'inverse' });
        for (let round = 1; round <= 5; round++) {
            assert.equal(observed.length, round);
            for (const pad of observed) {
                const expected = (pad + (round <= 3 ? 2 : 3)) % 4;
                t.w.document.dispatchEvent(
                    new t.w.KeyboardEvent('keydown', { key: String(expected + 1), bubbles: true })
                );
            }
            if (round < 5) {
                observed = [];
                previous = null;
                await t.advance(5000);
            }
        }
        t.click('#ss-finish');
        assert.equal(t.outcomes[0][0], true);
        assert.equal(t.outcomes[0][1].metrics.sequenceLength, 5);
        t.clean();
    });
    await test('Ordem Temporal: seis rodadas crescentes, reconstrução, feedback e banco variado', async () => {
        const allWords = new Set();
        for (let seed = 0; seed < 8; seed++) {
            const t = setup();
            let observed = [],
                previous = '';
            t.watch(() => {
                const current = t.$('#temporal-stimulus')?.textContent || '';
                if (current && current !== 'Restaure a ordem' && current !== previous) {
                    observed.push(current);
                    allWords.add(current);
                }
                previous = current;
            });
            await t.mount('temporalorder', 'hard', { stimulus: 'words' }, 'TEMPORAL-' + seed);
            const rounds = seed === 0 ? 6 : 1;
            for (let round = 0; round < rounds; round++) {
                assert.equal(observed.length, 6 + Math.floor(round / 2));
                assert.equal(new Set(observed).size, observed.length);
                observed.forEach((value, position) => {
                    let current = t
                        .$$('#temporal-order button')
                        .findIndex((button) => button.textContent === value);
                    t.click(t.$$('#temporal-order button')[current]);
                    while (current > position) {
                        t.click('#temporal-left');
                        current--;
                    }
                });
                t.click('#temporal-check');
                assert.equal(t.$$('#temporal-order .answer-correct').length, observed.length);
                if (round < rounds - 1) {
                    observed = [];
                    previous = '';
                    t.click('#temporal-next');
                    await t.advance(15000);
                }
            }
            if (seed === 0) {
                t.click('#temporal-next');
                assert.equal(t.outcomes[0][0], true);
            }
            t.clean();
        }
        assert(allWords.size >= 35, 'Pouca variedade entre partidas');
    });
    await test('Configuração: escolhas visíveis, controles sincronizados e modo salvo', async () => {
        const t = setup({ app: true });
        t.startApp();
        t.click(
            t
                .$$('.game-card')
                .find((card) => card.querySelector('strong').textContent === 'Jogo da Memória')
        );
        const sequence = t.$('input[name="setup-mode"][value="sequence"]');
        t.click(sequence);
        t.click('input[name="setup-difficulty"][value="hard"]');
        assert.equal(t.$('#difficulty-select').value, 'hard');
        assert.equal(t.$('#game-options select[data-option="mode"]').value, 'sequence');
        assert(t.$('[data-option-field="category"]').classList.contains('hidden'));
        assert(t.$('#difficulty-explanation').textContent.includes('11 posições'));
        t.click('#start-practice-game-btn');
        await t.flush();
        assert.equal(t.api('Progress').library().setups.memory_game.options.mode, 'sequence');
        t.click('#quit-current-game');
        t.clean();
    });
    fs.writeFileSync(
        path.join(root, 'tests/results/refinement.json'),
        JSON.stringify(reports, null, 2)
    );
    if (reports.some((report) => report.status === 'FAIL')) process.exitCode = 1;
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
