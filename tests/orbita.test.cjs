const { setup, assert, fs, path } = require('./harness.cjs');
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
async function run() {
    await test('Órbita: sair retorna à configuração, depois à biblioteca com filtros e seleção', async () => {
        const t = setup({ app: true });
        t.startApp();
        assert.equal(t.w.document.title, 'Órbita');
        t.input('#game-search', 'bandeiras');
        t.click('[data-filter="all"]');
        t.click(t.$('.game-launch'));
        const radio = t.$('input[name="setup-mode"][value="typing"]');
        t.click(radio);
        t.$('#seed-input').value = 'VOLTA';
        t.click('#start-practice-game-btn');
        await t.flush();
        assert(t.w.document.body.classList.contains('in-game'));
        assert(t.$('#quiz-form'));
        const seed = t.w.history.state.challenge.seed;
        t.click('#quit-current-game');
        await t.flush();
        assert(!t.$('#phase-selection-screen').classList.contains('hidden'));
        assert(!t.w.document.body.classList.contains('in-game'));
        assert.equal(t.$('#seed-input').value, seed);
        assert.equal(t.$('[data-option="mode"]').value, 'typing');
        t.click('#back-to-main-menu');
        await t.flush();
        assert(!t.$('#game-main-menu').classList.contains('hidden'));
        assert.equal(t.$('#game-search').value, 'bandeiras');
        assert.equal(t.$$('.game-card').length, 1);
        t.clean();
    });
    await test('Órbita: origem permanece após recarregar e acesso direto retorna à configuração', async () => {
        const t = setup({ app: true });
        t.startApp();
        t.input('#game-search', 'Bandeiras');
        t.click(t.$('.game-launch'));
        t.click('#start-practice-game-btn');
        await t.flush();
        const saved = t.w.localStorage.getItem('desafio-logico-total:page');
        const second = setup({ app: true, url: t.w.location.href });
        second.w.localStorage.setItem('desafio-logico-total:page', saved);
        second.startApp();
        await second.flush();
        second.click('#quit-current-game');
        await second.flush();
        assert(!second.$('#phase-selection-screen').classList.contains('hidden'));
        second.click('#back-to-main-menu');
        await second.flush();
        assert.equal(second.$('#game-search').value, 'Bandeiras');
        second.clean();
        t.click('#quit-current-game');
        await t.flush();
        t.clean();
        const direct = setup({
            app: true,
            url: 'http://localhost/?view=play&game=flags&difficulty=easy&seed=DIRETO'
        });
        direct.startApp();
        await direct.flush();
        direct.click('#quit-current-game');
        await direct.flush();
        assert.equal(direct.$('#difficulty-selection-title').textContent, 'Bandeiras');
        assert(!direct.$('#phase-selection-screen').classList.contains('hidden'));
        direct.clean();
    });
    await test('Órbita: feedback semântico distinto de digitação, estados de resposta e reinício', async () => {
        const t = setup({
            app: true,
            url: 'http://localhost/?view=play&game=flags&difficulty=easy&seed=FEEDBACK&options=%7B%22mode%22%3A%22typing%22%7D'
        });
        t.startApp();
        await t.flush();
        t.input('#quiz-input', 'resposta inexistente');
        t.submit('#quiz-form');
        assert.equal(t.$('.quiz-panel').dataset.answer, 'wrong');
        assert(t.$('#answer-pulse').classList.contains('is-wrong'));
        assert(t.$('#quiz-input').readOnly);
        assert(t.$('#quiz-form').classList.contains('feedback-wrong'));
        const wrongText = t.$('#quiz-feedback').textContent;
        t.click('#restart-current-game');
        await t.flush();
        assert.equal(t.$('.quiz-panel').dataset.answer, undefined);
        assert.equal(t.$('#answer-pulse').className, 'answer-pulse');
        const answer = wrongText.match(/^Resposta: (.*?)\./)[1];
        t.input('#quiz-input', answer);
        t.submit('#quiz-form');
        assert.equal(t.$('.quiz-panel').dataset.answer, 'correct');
        assert(t.$('#answer-pulse').classList.contains('is-correct'));
        t.click('#quiz-next');
        assert.equal(t.$('.quiz-panel').dataset.answer, undefined);
        assert.equal(t.$('#quiz-input').readOnly, false);
        t.click('#quit-current-game');
        await t.flush();
        t.clean();
        const events = [],
            s = setup();
        const score = s.api('ScoreEngine').create(
            () => 0,
            (stats, event) => {
                if (event) events.push(event);
            }
        );
        score.attempt(false);
        assert.equal(events.length, 0);
        score.answer(false);
        score.answer(true);
        assert.equal(events.length, 2);
        assert.equal(events[0].success, false);
        assert.equal(events[1].success, true);
        s.clean();
    });
    await test('Órbita: seleção editorial valoriza variedade, habilidades explícitas e créditos de progresso preservados', () => {
        const t = setup({ app: true });
        t.startApp();
        assert.equal(t.$('.game-launch').getAttribute('aria-label'), 'Jogar Termo');
        const library = t.api('GameLibrary');
        for (const game of t.config) assert(library.skill(game).length >= 5);
        assert.equal(
            library.skill(t.config.find((g) => g.id === 'flags')),
            'Reconhecimento visual'
        );
        assert.equal(
            library.skill(t.config.find((g) => g.id === 'memoryshelf')),
            'Memória de objetos'
        );
        assert(t.$('.arcade-brand').textContent.includes('ÓRBITA'));
        assert(t.$('.game-help') === null);
        t.clean();
    });
    await test('Órbita: consultar regras pausa o tempo, Escape fecha ajuda e pausa manual permanece', async () => {
        const t = setup({
            app: true,
            url: 'http://localhost/?view=play&game=flags&difficulty=easy&seed=AJUDA'
        });
        t.startApp();
        await t.flush();
        const help = t.$('.game-help');
        help.open = true;
        help.dispatchEvent(new t.w.Event('toggle'));
        const before = t.$('#hud-time').textContent;
        await t.advance(6000);
        assert.equal(t.$('#hud-time').textContent, before);
        t.w.document.dispatchEvent(
            new t.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
        );
        assert.equal(help.open, false);
        await t.advance(1000);
        assert.notEqual(t.$('#hud-time').textContent, before);
        t.click('#pause-current-game');
        help.open = true;
        help.dispatchEvent(new t.w.Event('toggle'));
        help.open = false;
        help.dispatchEvent(new t.w.Event('toggle'));
        const paused = t.$('#hud-time').textContent;
        await t.advance(4000);
        assert.equal(t.$('#hud-time').textContent, paused);
        assert.equal(t.$('#pause-current-game').textContent, 'Retomar');
        t.click('#quit-current-game');
        await t.flush();
        t.clean();
    });
    fs.writeFileSync(path.join(__dirname, 'results/orbita.json'), JSON.stringify(reports, null, 2));
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
