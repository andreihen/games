GameRegistry.register('colormix', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            guided = config.options.mode === 'guided';
        const pigments = [
            { name: 'Amarelo', rgb: [250, 220, 40] },
            { name: 'Magenta', rgb: [226, 45, 121] },
            { name: 'Ciano', rgb: [30, 180, 224] },
            { name: 'Branco', rgb: [250, 250, 250] },
            { name: 'Preto', rgb: [24, 24, 28] }
        ].slice(0, [3, 4, 5, 5][tier]);
        const limit = [80, 85, 90, 94][tier],
            used = new Set();
        let round = 0,
            attempts = 0,
            amounts = [],
            recipe = [],
            target,
            best = 0,
            finished = false,
            scores = [];
        const $ = GameUI.shell(
            session,
            'Ateliê de Cores',
            'Adicione ou retire gotas para chegar à cor alvo. Você tem três avaliações por rodada; a receita é revelada no final.',
            `<p id="mix-progress" class="status-line"></p><div class="color-comparison"><div><span>Cor alvo</span><div id="mix-target" class="color-swatch"></div></div><div><span>Sua mistura</span><div id="mix-current" class="color-swatch"></div></div></div><p id="mix-live" class="status-line" aria-live="polite"></p><div id="mix-palette" class="mix-palette"></div><div class="controls">${GameUI.button('Limpar mistura', 'mix-clear')}${GameUI.button('Avaliar mistura', 'mix-check', 'primary')}</div><p id="mix-feedback" class="notice" role="status"></p>${GameUI.button('Próxima cor', 'mix-next', 'primary')}<small class="color-model-note">Mistura virtual por absorção de luz. As cores de tintas reais podem variar.</small>`
        );
        function paint() {
            $('#mix-current').style.background = ColorMath.css(
                ColorMath.mix(
                    pigments.map((p) => p.rgb),
                    amounts
                )
            );
            $('#mix-live').textContent = amounts.some(Boolean)
                ? `${amounts.reduce((a, b) => a + b, 0)} gotas${
                      guided && !finished
                          ? ` · proximidade ${ColorMath.similarity(
                                target,
                                ColorMath.mix(
                                    pigments.map((p) => p.rgb),
                                    amounts
                                )
                            )}%`
                          : ''
                  }`
                : 'Adicione a primeira gota.';
            $('#mix-palette').innerHTML = pigments
                .map(
                    (p, i) =>
                        `<div class="pigment-control"><span class="pigment-dot" style="background:${ColorMath.css(p.rgb)}" aria-hidden="true"></span><strong>${p.name}</strong><div><button data-pigment="${i}" data-change="-1" aria-label="Retirar ${p.name}" ${finished || !amounts[i] ? 'disabled' : ''}>−</button><output aria-label="Gotas de ${p.name}">${amounts[i]}</output><button data-pigment="${i}" data-change="1" aria-label="Adicionar ${p.name}" ${finished || amounts[i] >= 20 ? 'disabled' : ''}>+</button></div></div>`
                )
                .join('');
            $('#mix-check').disabled = finished || !amounts.some(Boolean);
            $('#mix-clear').disabled = finished || !amounts.some(Boolean);
        }
        function next() {
            round++;
            attempts = 0;
            best = 0;
            finished = false;
            amounts = pigments.map(() => 0);
            do {
                recipe = pigments.map(() => 0);
                const active = session.random
                    .shuffle(pigments.map((_, i) => i))
                    .slice(0, [2, 2, 3, 4][tier]);
                active.forEach((i) => (recipe[i] = 1));
                for (let n = active.length; n < [10, 14, 18, 20][tier]; n++)
                    recipe[session.random.pick(active)]++;
                target = ColorMath.mix(
                    pigments.map((p) => p.rgb),
                    recipe
                );
            } while (used.has(target.join(',')));
            used.add(target.join(','));
            $('#mix-target').style.background = ColorMath.css(target);
            $('#mix-progress').textContent =
                `Cor ${round} de 5 · objetivo: ${limit}% de proximidade`;
            $('#mix-feedback').textContent = '';
            $('#mix-next').classList.add('hidden');
            paint();
        }
        session.listen($('#mix-palette'), 'click', (event) => {
            const b = event.target.closest('[data-pigment]');
            if (!b || b.disabled || finished) return;
            const i = +b.dataset.pigment;
            amounts[i] = Math.max(0, Math.min(20, amounts[i] + +b.dataset.change));
            paint();
        });
        session.listen($('#mix-clear'), 'click', () => {
            amounts.fill(0);
            paint();
        });
        session.listen($('#mix-check'), 'click', () => {
            if (finished || !amounts.some(Boolean)) return;
            attempts++;
            const similarity = ColorMath.similarity(
                target,
                ColorMath.mix(
                    pigments.map((p) => p.rgb),
                    amounts
                )
            );
            best = Math.max(best, similarity);
            const success = similarity >= limit;
            if (success || attempts === 3) {
                finished = true;
                scores.push(best);
                session.score.attempt(success);
                session.score.add(best * 10);
                $('#mix-feedback').textContent =
                    `${success ? 'Cor alcançada!' : 'Rodada concluída.'} Proximidade: ${similarity}%. Melhor: ${best}%. Uma receita possível: ${recipe
                        .map((n, i) => (n ? `${n} ${pigments[i].name.toLowerCase()}` : ''))
                        .filter(Boolean)
                        .join(' + ')}.`;
                $('#mix-next').classList.remove('hidden');
                $('#mix-next').textContent = round === 5 ? 'Ver resultado' : 'Próxima cor';
                paint();
            } else
                $('#mix-feedback').textContent =
                    `${similarity}% de proximidade. Restam ${3 - attempts} avaliações. Ajuste sua mistura.`;
        });
        session.listen($('#mix-next'), 'click', () => {
            if (!finished) return;
            if (round === 5) {
                const average = Math.round(scores.reduce((a, b) => a + b, 0) / 5);
                session.complete(average >= limit, {
                    text: `Proximidade média: ${average}%. Cinco cores concluídas.`,
                    average
                });
            } else next();
        });
        next();
    },
    destroy: session.destroy
}));
