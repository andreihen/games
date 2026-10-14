GameRegistry.register('checklist', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            days = [2, 3, 4, 4][tier],
            count = [4, 6, 6, 8][tier],
            themes = {
                expedition: {
                    title: 'Expedição',
                    fields: [
                        'lanterna',
                        'corda',
                        'água',
                        'bússola',
                        'kit de primeiros socorros',
                        'mapa',
                        'provisões'
                    ],
                    scenes: ['Floresta', 'Montanha', 'Caverna', 'Deserto']
                },
                space: {
                    title: 'Missão espacial',
                    fields: [
                        'oxigênio',
                        'combustível',
                        'escudo',
                        'rádio',
                        'ferramentas',
                        'traje',
                        'suprimentos'
                    ],
                    scenes: ['Órbita', 'Estação', 'Lua', 'Marte']
                },
                potions: {
                    title: 'Oficina de poções',
                    fields: [
                        'cristal',
                        'erva',
                        'água da fonte',
                        'pó lunar',
                        'frasco',
                        'catalisador',
                        'semente'
                    ],
                    scenes: ['Bosque', 'Torre', 'Gruta', 'Jardim']
                }
            },
            theme = themes[config.options.theme] || themes.expedition,
            fields = theme.fields,
            keys = fields.map((_, i) => `field${i}`),
            domain = Array.from({ length: 128 }, (_, mask) =>
                Object.fromEntries(keys.map((key, i) => [key, Boolean(mask & (1 << i))]))
            );
        let rules = session.random
                .shuffle(keys)
                .slice(0, [2, 3, 4, 5][tier])
                .map((property) => ({ type: 'allowOnly', property, values: [true] })),
            day = 0,
            index = 0,
            cases = [],
            locked = true,
            combo = 0,
            completed = 0;
        const describe = (r) =>
            `${r.values[0] ? 'Exigir' : 'Deve estar ausente'}: ${fields[keys.indexOf(r.property)]}.`;
        const $ = GameUI.shell(
            session,
            'Checklist',
            `Prepare as equipes de ${theme.title.toLowerCase()}. Memorize o que a missão exige e envie apenas as mochilas prontas. A próxima etapa muda os requisitos.`,
            `<div class="mission-header"><span id="check-location"></span><span id="check-combo">Sequência: 0</span></div><progress id="check-meter" max="${days * count}" value="0" aria-label="Preparativos concluídos"></progress><p id="check-directive" class="notice directive"></p><div id="check-manual" class="manual"></div><p id="check-progress" class="status-line"></p><div id="check-object" class="case-checklist"></div><div id="check-controls" class="controls hidden">${GameUI.button('Enviar equipe', 'check-yes', 'primary')}${GameUI.button('Voltar à preparação', 'check-no')}</div><p id="check-feedback" class="notice hidden" role="status"></p>${GameUI.button('Próxima equipe', 'check-next', 'primary')}${GameUI.button('Iniciar missão', 'check-study', 'primary')}`
        );
        function showManual(change) {
            if (!RuleEngine.validateRuleSet(rules, domain)) throw Error('Checklist inconsistente.');
            locked = true;
            cases = RuleEngine.cases(rules, count, session.random, domain);
            index = 0;
            $('#check-object').replaceChildren();
            $('#check-controls').classList.add('hidden');
            $('#check-next').classList.add('hidden');
            $('#check-feedback').classList.add('hidden');
            $('#check-manual').classList.remove('hidden');
            $('#check-manual').innerHTML =
                `<h3>Preparar: ${theme.scenes[day]}</h3><ul>${rules.map((r) => `<li>${describe(r)}</li>`).join('')}</ul><p>Itens não citados são opcionais. Leia no seu tempo; ao iniciar, a lista permanece por cinco segundos.</p>`;
            $('#check-location').textContent = `${theme.title} · ${theme.scenes[day]}`;
            $('#check-directive').textContent = change;
            $('#check-study').classList.remove('hidden');
            $('#check-progress').textContent =
                'Ao iniciar, você terá cinco segundos para memorizar.';
        }
        function showCase() {
            locked = false;
            $('#check-manual').classList.add('hidden');
            $('#check-directive').textContent =
                `${theme.scenes[day]}: a mochila está pronta para a missão?`;
            $('#check-controls').classList.remove('hidden');
            $('#check-yes').disabled = false;
            $('#check-no').disabled = false;
            $('#check-feedback').classList.add('hidden');
            $('#check-next').classList.add('hidden');
            $('#check-progress').textContent =
                `Etapa ${day + 1}/${days} · Equipe ${index + 1}/${count}`;
            const o = cases[index];
            $('#check-object').innerHTML = keys
                .map(
                    (key, i) =>
                        `<p><span class="${o[key] ? 'case-present' : 'case-missing'}">${o[key] ? '✓' : '✗'}</span> ${fields[i]}</p>`
                )
                .join('');
        }
        function answer(approved) {
            if (locked) return;
            locked = true;
            const o = cases[index],
                expected = RuleEngine.evaluate(o, rules),
                correct = approved === expected;
            session.score.answer(correct);
            combo = correct ? combo + 1 : 0;
            completed++;
            if (correct && combo % 3 === 0) session.score.add(75);
            $('#check-combo').textContent =
                `Sequência: ${combo}${combo > 0 && combo % 3 === 0 ? ' · +75 pontos' : ''}`;
            $('#check-meter').value = completed;
            $('#check-yes').disabled = true;
            $('#check-no').disabled = true;
            $('#check-feedback').classList.remove('hidden');
            $('#check-feedback').textContent = correct
                ? approved
                    ? 'Equipe enviada com os preparativos corretos.'
                    : 'Boa decisão. A equipe precisa ajustar a mochila.'
                : expected
                  ? 'Essa mochila estava pronta para a missão.'
                  : `Ajustar a mochila: ${rules
                        .filter((r) => !RuleEngine.accepts(o, r))
                        .map(describe)
                        .join(' ')}`;
            $('#check-next').classList.remove('hidden');
            $('#check-feedback').classList.toggle('feedback-correct', correct);
            $('#check-feedback').classList.toggle('feedback-wrong', !correct);
        }
        function evolve() {
            if (day === 1) {
                const property = session.random.pick(
                        keys.filter((key) => !rules.some((r) => r.property === key))
                    ),
                    rule = { type: 'allowOnly', property, values: [true] };
                rules.push(rule);
                return `Adicionada: ${describe(rule)}`;
            }
            if (day === 2) {
                const removed = rules.shift();
                return `Removida: ${describe(removed)}`;
            }
            const rule = session.random.pick(rules);
            rule.values = [!rule.values[0]];
            return `Invertida: ${describe(rule)}`;
        }
        session.listen($('#check-study'), 'click', () => {
            $('#check-study').classList.add('hidden');
            $('#check-progress').textContent = 'Memorize: cinco segundos.';
            session.timeout(showCase, 5000);
        });
        session.listen($('#check-yes'), 'click', () => answer(true));
        session.listen($('#check-no'), 'click', () => answer(false));
        session.listen(document, 'keydown', (event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                answer(event.key === 'ArrowRight');
            }
        });
        session.listen($('#check-next'), 'click', () => {
            index++;
            if (index === count) {
                day++;
                if (day === days) {
                    const s = session.score.snapshot();
                    return session.complete(s.accuracy >= 60, {
                        text: `${s.correct} preparativos corretos em ${days} etapas de ${theme.title.toLowerCase()}.`
                    });
                }
                showManual(`NOVA DIRETRIZ · ${evolve()}`);
            } else showCase();
        });
        showManual('Memorize a checklist inicial.');
    },
    destroy: session.destroy
}));
