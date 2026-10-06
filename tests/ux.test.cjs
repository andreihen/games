const { setup, assert, fs, path, root } = require('./harness.cjs');
const reports = [];
async function test(name, fn) {
    try {
        await fn();
        reports.push({ name, status: 'PASS' });
        console.log('PASS ' + name);
    } catch (error) {
        reports.push({ name, status: 'FAIL', error: error.stack });
        console.error('FAIL ' + name + '\n' + error.stack);
    }
}
async function run() {
    await test('Vocabulário: expansão real, respostas validadas e bancos amplos', async () => {
        const t = setup(),
            vocabulary = await t.api('GameData').load('vocabulary'),
            words = await t.api('GameData').load('words');
        assert(
            vocabulary.pt.length >= 800 &&
                vocabulary.en.length >= 600 &&
                vocabulary.code.length >= 100
        );
        assert(vocabulary.pt.filter((word) => word.length <= 4).length >= 200);
        let total = 0;
        for (const length of [4, 5, 6, 7]) {
            const bank = t.api('VocabularyEngine').targets(words, vocabulary, length);
            assert.equal(new Set(bank).size, bank.length);
            assert(bank.every((word) => words[length].includes(word)));
            total += bank.length;
            assert(
                t.api('VocabularyEngine').targets(words, vocabulary, length, 'wide').length >
                    bank.length * 10
            );
        }
        assert(total >= 700);
        t.clean();
    });
    await test('Baralho: não repete antes de esgotar e prioriza itens ainda não vistos', async () => {
        const t = setup(),
            random = t.api('SeededRandom'),
            replay = t.api('ReplayEngine');
        const items = Array.from({ length: 100 }, (_, i) => 'ITEM' + i);
        for (let seed = 0; seed < 30; seed++) {
            const deck = replay.deck(random.create('UX-DECK-' + seed), items, items.slice(0, 80));
            const first = Array.from({ length: 20 }, () => deck.next());
            assert(first.every((item) => !items.slice(0, 80).includes(item)));
            const rest = Array.from({ length: 80 }, () => deck.next());
            assert.equal(new Set([...first, ...rest]).size, 100);
            const last = rest.at(-1);
            assert.notEqual(deck.next(), last);
            assert(!['ITEM0', 'ITEM1'].includes(deck.next(['ITEM0', 'ITEM1'])));
        }
        t.clean();
    });
    await test('Alternativas geográficas: América do Sul nunca é uma opção isolada', async () => {
        const t = setup(),
            data = await t.api('GameData').load('geography'),
            countries = data.countries.filter((c) => c.independent),
            engine = t.api('KnowledgeEngine');
        for (const country of countries.filter((c) => c.subregion === 'South America')) {
            for (let seed = 0; seed < 20; seed++) {
                const choices = engine.alternatives(
                    t.api('SeededRandom').create('GEO-' + seed),
                    country,
                    countries,
                    6
                );
                assert.equal(choices.length, 6);
                assert(choices.every((c) => c.subregion === 'South America'));
                assert.equal(choices.filter((c) => c.id === country.id).length, 1);
                assert.equal(new Set(choices.map((c) => c.id)).size, choices.length);
            }
        }
        t.clean();
    });
    await test('Fácil: países pequenos e fora do antigo grupo aparecem em partidas reais', async () => {
        const t = setup(),
            data = await t.api('GameData').load('geography');
        const results = { capitals: new Set(), flags: new Set(), worldmap: new Set() };
        for (let i = 0; i < 50; i++) {
            for (const game of Object.keys(results)) {
                await t.mount(game, 'easy', {}, 'UX-EASY-' + i);
                const country =
                    game === 'flags'
                        ? data.countries.find((c) =>
                              t
                                  .$('#quiz-visual img')
                                  .getAttribute('src')
                                  .endsWith('/' + c.code + '.svg')
                          )
                        : data.countries.find((c) =>
                              t
                                  .$(game === 'capitals' ? '#quiz-prompt' : '#map-question')
                                  .textContent.includes(c.name)
                          );
                assert(country);
                results[game].add(country.id);
            }
        }
        assert(results.capitals.size > 30 && results.flags.size > 30 && results.worldmap.size > 30);
        for (const game of ['flags', 'worldmap'])
            assert(
                [...results[game]].some(
                    (id) => data.countries.find((c) => c.id === id).area < 500000
                )
            );
        t.clean();
    });
    await test('Digitado: bandeiras e seis modos do mapa aceitam respostas válidas', async () => {
        const t = setup(),
            data = await t.api('GameData').load('geography'),
            byId = new Map(data.countries.map((c) => [c.id, c]));
        await t.mount('flags', 'easy', { mode: 'typing' });
        const flag = data.countries.find((c) =>
            t
                .$('#quiz-visual img')
                .getAttribute('src')
                .endsWith('/' + c.code + '.svg')
        );
        assert(t.$('#quiz-form').classList.contains('hidden') === false);
        t.input('#quiz-input', flag.englishName);
        t.submit('#quiz-form');
        assert.equal(t.session.score.snapshot().correct, 1);
        for (const mode of ['locate', 'identify', 'capital', 'continent', 'neighbors', 'oceans']) {
            await t.mount('worldmap', 'easy', { mode, answerMode: 'typing' }, 'UX-MAP-' + mode);
            assert.equal(t.$$('#map-choices button').length, 0);
            const shape = t.$('.map-country.highlighted');
            const country = shape ? byId.get(shape.dataset.country) : null;
            let value;
            if (mode === 'locate' || mode === 'identify') {
                value = country.englishName;
                assert(!shape.getAttribute('aria-label').includes(country.name));
            } else if (mode === 'capital') value = country.capitals.at(-1);
            else if (mode === 'continent') value = country.region;
            else if (mode === 'neighbors')
                value = byId.get(country.mapBorders.find((id) => byId.has(id))).name;
            else {
                const marker = t.$('#map-marker circle'),
                    longitude = +marker.getAttribute('cx') / 2 - 180,
                    latitude = 90 - +marker.getAttribute('cy') / 2;
                value =
                    latitude > 70
                        ? 'Ártico'
                        : latitude < -60
                          ? 'Austral'
                          : longitude < -100
                            ? 'Pacífico'
                            : longitude > 50
                              ? 'Índico'
                              : 'Atlântico';
            }
            t.input('#map-input', value);
            t.submit('#map-form');
            assert.equal(t.session.score.snapshot().correct, 1, mode + ': ' + value);
        }
        await t.mount('capitals', 'expert', { mode: 'typing', region: 'Oceania' });
        for (let i = 0; i < 16; i++) {
            const country = data.countries.find((c) =>
                t.$('#quiz-prompt').textContent.includes(c.name)
            );
            t.input('#quiz-input', country.capitals[0]);
            t.submit('#quiz-form');
            t.click('#quiz-next');
        }
        assert.equal(t.outcomes[0][0], true);
        t.clean();
    });
    await test('Feedback: erros revelam a alternativa correta, barra avança e não aceita duas respostas', async () => {
        const t = setup(),
            data = await t.api('GameData').load('geography');
        await t.mount('capitals');
        const country = data.countries.find((c) =>
            t.$('#quiz-prompt').textContent.includes(c.name)
        );
        const wrong = t
            .$$('#quiz-choices button')
            .find((button) => !country.capitals.includes(button.textContent));
        t.click(wrong);
        assert(t.$('#quiz-feedback').classList.contains('feedback-wrong'));
        assert.equal(t.$$('.answer-correct').length, 1);
        assert.equal(t.$$('.answer-wrong').length, 1);
        assert.equal(t.$('#quiz-meter').value, 1);
        t.click(wrong);
        assert.equal(t.session.score.snapshot().mistakes, 1);
        t.click('#quiz-next');
        assert.equal(t.$$('.answer-correct').length, 0);
        assert(!t.$('#quiz-feedback').classList.contains('feedback-wrong'));
        t.clean();
    });
    await test('Termo: prévia neutra, erro não consome tentativa e palavra recente não retorna', async () => {
        const t = setup();
        await t.mount('termo', 'easy', { length: '5' });
        t.input('#termo-input', 'LIVRO');
        assert.equal(t.$$('.wordle-row')[0].textContent, 'LIVRO');
        assert.equal(t.$$('.letter-tile.exact').length, 0);
        t.input('#termo-input', 'ZZZZZ');
        t.submit('#termo-form');
        assert(t.$('#termo-input').getAttribute('aria-invalid') === 'true');
        assert(t.$('#termo-progress').textContent.includes('0/8'));
        t.input('#termo-input', 'LIVRO');
        t.submit('#termo-form');
        assert.equal(t.session.ui.noticeDisplay.textContent, '');
        assert.equal(t.$('#termo-input').ownerDocument.activeElement, t.$('#termo-input'));
        const seen = t.api('Progress').get('termo').seenItems;
        await t.mount('termo', 'easy', { length: '5', recentItems: [...seen] }, 'UX-NEW-WORD');
        const newer = t.api('Progress').get('termo').seenItems.at(-1);
        assert(!seen.includes(newer));
        t.clean();
    });
    await test('Chuva: quinze palavras distintas, feedback por letra e histórico usado no reinício', async () => {
        const t = setup();
        await t.mount('wordrain');
        const seen = [];
        for (let i = 0; i < 15; i++) {
            const word = t.$('.falling-word').textContent;
            assert(!seen.includes(word));
            seen.push(word);
            t.input('#wr-input', '?');
            assert.equal(t.$('#wr-input').getAttribute('aria-invalid'), 'true');
            t.input('#wr-input', word);
            assert(t.$('#wr-last').textContent.includes('concluída'));
            if (i < 14) await t.advance(16);
        }
        const recent = t.api('Progress').get('wordrain').seenItems;
        await t.mount('wordrain', 'easy', { recentItems: [...recent] }, 'UX-NEXT-RAIN');
        assert(!seen.includes(t.$('.falling-word').textContent));
        t.clean();
    });
    fs.writeFileSync(
        path.join(root, 'tests/results/ux.json'),
        JSON.stringify(reports, null, 2) + '\n'
    );
    console.log(
        `${reports.filter((r) => r.status === 'PASS').length}/${reports.length} grupos aprovados`
    );
    if (reports.some((r) => r.status === 'FAIL')) process.exitCode = 1;
}
run();
