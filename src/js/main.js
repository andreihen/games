document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);
    const ui = {
        phaseDisplay: $('phase-display'),
        limitDisplay: $('phase-limit-display'),
        noticeDisplay: $('game-notice'),
        updateStats,
        answerFeedback
    };
    const screens = ['game-main-menu', 'phase-selection-screen', 'roguelike-game-area'];
    let selected = null,
        current = null,
        session = null,
        challenge = null,
        mode = 'practice',
        recent = [],
        loadVersion = 0,
        manualPause = false,
        category = 'Todos',
        libraryFilter = 'all',
        configuredOptions = {};
    const pageKey = 'desafio-logico-total:page';
    let navigationTrail = [],
        routingReady = false,
        restoringRoute = false,
        activeScreen = 'game-main-menu';
    function pageState(includeTrail = true) {
        const state = {
            version: 1,
            screen: activeScreen,
            mode,
            recent,
            library: {
                category,
                filter: libraryFilter,
                query: $('game-search').value,
                sort: $('game-sort').value
            },
            scroll: window.scrollY || document.documentElement.scrollTop
        };
        if (activeScreen === 'roguelike-game-area' && current && challenge)
            state.challenge = structuredClone(challenge);
        else if (activeScreen === 'phase-selection-screen' && selected) {
            const options = { ...configuredOptions };
            for (const option of selected.options)
                options[option.key] =
                    $('game-options').querySelector(`[data-option="${option.key}"]`)?.value ||
                    option.values[0].value;
            state.challenge = {
                game: selected.id,
                difficulty: $('difficulty-select').value,
                seed: $('seed-input').value,
                options
            };
        }
        if (includeTrail) state.trail = navigationTrail;
        return state;
    }
    function rememberPage(push = false) {
        if (!routingReady || restoringRoute) return;
        const state = pageState(),
            url = new URL(location.href);
        for (const key of ['game', 'difficulty', 'seed', 'options', 'view'])
            url.searchParams.delete(key);
        url.searchParams.set(
            'view',
            state.screen === 'roguelike-game-area'
                ? 'play'
                : state.screen === 'phase-selection-screen'
                  ? 'setup'
                  : 'library'
        );
        if (state.challenge)
            for (const key of ['game', 'difficulty', 'seed', 'options']) {
                const value = state.challenge[key];
                if (value !== '' && value !== undefined)
                    url.searchParams.set(key, key === 'options' ? JSON.stringify(value) : value);
            }
        try {
            history[push && url.href !== location.href ? 'pushState' : 'replaceState'](
                state,
                '',
                url
            );
            localStorage.setItem(pageKey, JSON.stringify(state));
        } catch {
            /* Navigation still works when browser storage is unavailable. */
        }
    }
    async function restorePage(state) {
        if (!state || state.version !== 1 || !screens.includes(state.screen)) return false;
        const game = GAMES_CONFIG.find((g) => g.id === state.challenge?.game);
        if (
            state.screen !== 'game-main-menu' &&
            (!game || !DifficultyEngine.keys.includes(state.challenge?.difficulty))
        )
            return false;
        restoringRoute = true;
        try {
            navigationTrail = Array.isArray(state.trail)
                ? state.trail
                      .filter((entry) => entry && screens.includes(entry.screen))
                      .slice(-12)
                      .map((entry) => {
                          const { trail, ...route } = entry;
                          return route;
                      })
                : [];
            category = ['Todos', ...Object.keys(GameLibrary.categories)].includes(
                state.library?.category
            )
                ? state.library.category
                : 'Todos';
            libraryFilter = ['all', 'new', 'perception', 'favorites', 'recent'].includes(
                state.library?.filter
            )
                ? state.library.filter
                : 'all';
            $('game-search').value =
                typeof state.library?.query === 'string' ? state.library.query.slice(0, 120) : '';
            if (['recommended', 'az', 'recent'].includes(state.library?.sort))
                $('game-sort').value = state.library.sort;
            mode = ['practice', 'daily', 'journey'].includes(state.mode) ? state.mode : 'practice';
            recent = Array.isArray(state.recent)
                ? state.recent.filter((id) => GAMES_CONFIG.some((g) => g.id === id)).slice(-5)
                : [];
            renderCatalog();
            if (state.screen === 'roguelike-game-area') await start(game, state.challenge);
            else if (state.screen === 'phase-selection-screen') configure(game, state.challenge);
            else {
                stop();
                screen('game-main-menu');
            }
            window.scrollTo?.(0, Math.max(0, Number(state.scroll) || 0));
        } finally {
            restoringRoute = false;
        }
        rememberPage();
        return true;
    }
    const journeyRandom = SeededRandom.create(SeededRandom.fresh());
    function screen(id) {
        if (activeScreen !== id) {
            rememberPage();
            if (routingReady && !restoringRoute)
                navigationTrail = [...navigationTrail, pageState(false)].slice(-12);
        }
        activeScreen = id;
        document.body.classList.toggle('in-game', id === 'roguelike-game-area');
        screens.forEach((key) => $(key).classList.toggle('hidden', key !== id));
        const heading = $(id).querySelector('h1,h2');
        if (heading) {
            heading.tabIndex = -1;
            heading.focus({ preventScroll: true });
        }
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        rememberPage(true);
    }
    function updateStats(stats) {
        $('hud-score').textContent = stats.score.toLocaleString('pt-BR');
        $('hud-streak').textContent = stats.streak;
        $('hud-time').textContent = ScoreEngine.time(stats.time);
    }
    function answerFeedback(event) {
        if (
            !current ||
            current.type === 'simulation' ||
            [
                'wordrain',
                'termo',
                'mini_sudoku',
                'simonsays',
                'memorypath',
                'spatialmemory'
            ].includes(current.id)
        )
            return;
        const pulse = $('answer-pulse');
        pulse.className = `answer-pulse ${event.success ? 'is-correct' : 'is-wrong'}`;
        $('answer-pulse-symbol').textContent = event.success ? '✓' : '✕';
        $('answer-pulse-label').textContent = event.success ? 'Acertou' : 'Tente outra vez';
        void pulse.offsetWidth;
        pulse.classList.add('show-pulse');
    }
    function closeModal() {
        $('messageModal').classList.add('hidden');
        $('roguelike-game-area').inert = false;
    }
    function stop() {
        loadVersion++;
        session?.destroy();
        session = null;
        manualPause = false;
        closeModal();
        ui.phaseDisplay.replaceChildren();
        ui.phaseDisplay.inert = false;
        ui.phaseDisplay.classList.remove('paused-panel');
        ui.limitDisplay.textContent = '';
        ui.noticeDisplay.textContent = '';
        $('pause-notice').classList.add('hidden');
        $('pause-current-game').textContent = 'Pausar';
        $('answer-pulse').className = 'answer-pulse';
        $('roguelike-game-area').querySelector('.session-tools').open = false;
    }
    function quit() {
        stop();
        renderCatalog();
        screen('game-main-menu');
    }
    async function returnToPrevious() {
        const trail = [...navigationTrail];
        const previous =
            trail.pop() ||
            (activeScreen === 'roguelike-game-area' && current
                ? {
                      version: 1,
                      screen: 'phase-selection-screen',
                      challenge: structuredClone(challenge),
                      library: pageState(false).library
                  }
                : { version: 1, screen: 'game-main-menu', library: pageState(false).library });
        try {
            if (!(await restorePage({ ...previous, trail }))) quit();
        } catch {
            quit();
        }
    }
    function optionsFor(game, supplied = {}, difficulty = $('difficulty-select').value) {
        const options = {};
        for (const option of game.options)
            options[option.key] = option.values.some((v) => v.value === supplied[option.key])
                ? supplied[option.key]
                : option.values[0].value;
        if (
            [
                'termo',
                'pokemon',
                'element',
                'wordrain',
                'capitals',
                'flags',
                'worldmap',
                'timeline',
                'identity',
                'connections',
                'temporalorder'
            ].includes(game.id)
        )
            options.recentItems = (
                Array.isArray(supplied.recentItems)
                    ? supplied.recentItems
                    : Progress.get(game.id)?.seenItems || []
            )
                .filter((item) => typeof item === 'string' && item.length <= 40)
                .slice(-80);
        if (game.id === 'wordrain')
            options.typingWpm = Math.max(
                8,
                Math.min(
                    120,
                    Number(supplied.typingWpm) ||
                        Progress.get(game.id)?.lastWpm ||
                        DifficultyEngine.resolve(game.id, difficulty).baseWpm
                )
            );
        if (game.id === 'capitals')
            options.reviewIds = Array.isArray(supplied.reviewIds)
                ? supplied.reviewIds.filter((id) => /^[A-Z]{3}$/.test(id)).slice(0, 100)
                : Object.entries(Progress.get(game.id)?.reviews || {})
                      .filter(([, r]) => r.due <= Date.now())
                      .map(([id]) => id);
        return options;
    }
    function configure(game, supplied = null) {
        stop();
        selected = game;
        if (!supplied) {
            const saved = Progress.library().setups[game.id];
            if (saved && DifficultyEngine.keys.includes(saved.difficulty))
                supplied = { difficulty: saved.difficulty, options: saved.options || {} };
        }
        configuredOptions = structuredClone(supplied?.options || {});
        $('difficulty-selection-title').textContent = game.name;
        $('game-description').textContent = game.rules;
        $('config-cover').innerHTML = GameLibrary.art(game);
        $('config-cover').style.setProperty(
            '--game-accent',
            GameLibrary.categories[game.category].color
        );
        $('game-category-label').textContent = game.category;
        $('game-control-info').textContent = `Controles: ${game.controls.join(' · ')}`;
        $('config-error').textContent = '';
        $('difficulty-select').value = supplied?.difficulty || 'easy';
        $('difficulty-field').classList.toggle(
            'hidden',
            game.id === 'simonsays' || game.type === 'simulation'
        );
        $('seed-input').value = supplied?.seed || '';
        $('game-options').replaceChildren();
        for (const option of game.options) {
            const field = document.createElement('div');
            field.dataset.optionField = option.key;
            const label = document.createElement('label');
            label.textContent = option.label;
            const select = document.createElement('select');
            select.dataset.option = option.key;
            for (const entry of option.values) {
                const el = document.createElement('option');
                el.value = entry.value;
                el.textContent = entry.label;
                select.append(el);
            }
            if (supplied?.options?.[option.key]) select.value = supplied.options[option.key];
            label.append(select);
            field.append(label);
            if (option.key === 'mode' || option.values.length <= 4) {
                label.classList.add('select-fallback');
                select.setAttribute('aria-hidden', 'true');
                select.tabIndex = -1;
                const group = document.createElement('fieldset');
                group.className = 'choice-field';
                const legend = document.createElement('legend');
                legend.textContent = option.key === 'mode' ? 'Modo de jogo' : option.label;
                const choices = document.createElement('div');
                choices.className = 'choice-grid';
                group.append(legend, choices);
                const hints = {
                    memory_game: {
                        classic: 'Encontre duas cartas iguais.',
                        sequence: 'Observe quadrados que acendem e repita a ordem.',
                        association: 'Combine coisas relacionadas.',
                        concepts: 'Termo e definição.',
                        english: 'Palavra em inglês e tradução.',
                        math: 'Multiplicação e resultado.',
                        symbols: 'Símbolo e significado.'
                    },
                    memorypath: {
                        spatial: 'Repita as posições na ordem em que acendem.',
                        directions: 'Memorize uma rota e use as setas.',
                        interference: 'Lembre a sequência depois de uma distração.',
                        rotation: 'Repita as posições com a grade girada 90°.'
                    },
                    simonsays: {
                        classic: 'Repita as luzes na mesma ordem.',
                        inverse: 'Responda pelo botão oposto; a regra muda a cada três rodadas.'
                    },
                    checklist: {
                        expedition: 'Mochilas e suprimentos para explorar.',
                        space: 'Prepare a tripulação para cada destino.',
                        potions: 'Separe os ingredientes de cada etapa.'
                    }
                };
                option.values.forEach((entry) => {
                    const choice = document.createElement('label');
                    choice.className = 'choice-option';
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `setup-${option.key}`;
                    radio.value = entry.value;
                    radio.checked = select.value === entry.value;
                    const content = document.createElement('span');
                    const title = document.createElement('strong');
                    title.textContent = entry.label;
                    content.append(title);
                    const hint =
                        option.key === 'mode' || option.key === 'theme'
                            ? hints[game.id]?.[entry.value]
                            : null;
                    if (hint) {
                        const description = document.createElement('small');
                        description.textContent = hint;
                        content.append(description);
                    }
                    radio.onchange = () => {
                        if (radio.checked) {
                            select.value = radio.value;
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    };
                    choice.append(radio, content);
                    choices.append(choice);
                });
                field.append(group);
            }
            $('game-options').append(field);
        }
        const difficultyChoices = $('difficulty-choices').querySelector('.choice-grid');
        difficultyChoices.replaceChildren();
        DifficultyEngine.keys.forEach((key) => {
            const label = document.createElement('label');
            label.className = 'choice-option';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'setup-difficulty';
            radio.value = key;
            radio.checked = $('difficulty-select').value === key;
            const text = document.createElement('span');
            text.textContent = DifficultyEngine.names[key];
            radio.onchange = () => {
                if (radio.checked) {
                    $('difficulty-select').value = key;
                    $('difficulty-select').dispatchEvent(new Event('change', { bubbles: true }));
                }
            };
            label.append(radio, text);
            difficultyChoices.append(label);
        });
        updateDifficultyExplanation();
        $('start-practice-game-btn').textContent =
            game.type === 'simulation' ? 'Montar arena →' : 'Jogar →';
        screen('phase-selection-screen');
    }
    function showResult(success, details, error = false) {
        const metrics = details.metrics || {
            score: 0,
            streak: 0,
            bestStreak: 0,
            time: 0,
            accuracy: null,
            mistakes: 0,
            correct: 0
        };
        if (!error)
            Progress.record(
                current.id,
                challenge.difficulty,
                success,
                metrics,
                structuredClone(challenge)
            );
        $('modalMessageText').textContent = error
            ? 'Não foi possível iniciar'
            : success
              ? 'Desafio concluído'
              : 'Resultado';
        $('result-signal').textContent = error ? '!' : success ? '✓' : '↻';
        $('result-signal').className =
            `result-signal ${error ? 'technical-result' : success ? 'won-result' : 'retry-result'}`;
        const stats = [
            ['Pontuação', metrics.score.toLocaleString('pt-BR')],
            ['Precisão', metrics.accuracy === null ? '—' : `${Math.round(metrics.accuracy)}%`],
            ['Melhor sequência', metrics.bestStreak],
            ['Tempo', ScoreEngine.time(metrics.time)]
        ];
        if (metrics.wpm !== undefined) stats.push(['WPM', Math.round(metrics.wpm)]);
        $('result-stats').replaceChildren();
        for (const [label, value] of stats) {
            const el = document.createElement('div');
            const text = document.createElement('span');
            text.textContent = label;
            const strong = document.createElement('strong');
            strong.textContent = value;
            el.append(text, strong);
            $('result-stats').append(el);
        }
        $('modalDetailsDisplay').replaceChildren();
        const p = document.createElement('p');
        p.textContent = [details.reason, details.text].filter(Boolean).join(' ');
        $('modalDetailsDisplay').append(p);
        if (details.html) {
            const div = document.createElement('div');
            div.innerHTML = details.html;
            $('modalDetailsDisplay').append(div);
        }
        $('modalCloseButton').textContent = mode === 'journey' ? 'Próximo desafio' : 'Nova partida';
        $('share-status').textContent = '';
        $('messageModal').classList.remove('hidden');
        $('roguelike-game-area').inert = true;
        $('modalCloseButton').focus();
    }
    async function start(game, supplied) {
        stop();
        current = game;
        challenge = structuredClone(supplied);
        challenge.game = game.id;
        challenge.seed = SeededRandom.normalize(challenge.seed);
        challenge.options = optionsFor(game, challenge.options, challenge.difficulty);
        const version = loadVersion;
        screen('roguelike-game-area');
        $('current-mode-title').textContent = game.name;
        $('skill-chip').textContent = GameLibrary.skill(game);
        $('roguelike-game-area').style.setProperty(
            '--play-accent',
            GameLibrary.categories[game.category]?.color || '#9ccaf9'
        );
        $('roguelike-game-area').dataset.game = game.id;
        $('run-status').textContent =
            `${game.type === 'simulation' ? 'Simulação narrativa' : game.id === 'simonsays' ? 'Progressão contínua' : DifficultyEngine.names[challenge.difficulty]} · Seed: ${challenge.seed}`;
        $('hud-time-wrap').classList.toggle(
            'hidden',
            game.id === 'mini_sudoku' && challenge.options.timer === 'off'
        );
        updateStats({ score: 0, streak: 0, time: 0 });
        ui.phaseDisplay.innerHTML = '<p role="status">Preparando desafio…</p>';
        try {
            const factory = await GameRegistry.load(game);
            if (version !== loadVersion) return;
            ui.phaseDisplay.replaceChildren();
            session = GameSession.create(
                ui,
                (success, details) => showResult(success, details),
                (error) => {
                    console.error(error);
                    showResult(
                        false,
                        { text: 'Ocorreu um erro. Use o mesmo desafio para tentar novamente.' },
                        true
                    );
                },
                challenge
            );
            if (version === loadVersion && session?.alive) {
                const prefs = Progress.library(),
                    presets = Object.fromEntries(
                        game.options.map((option) => [option.key, challenge.options[option.key]])
                    );
                Progress.updateLibrary({
                    recent: [game.id, ...prefs.recent.filter((id) => id !== game.id)].slice(0, 12),
                    setups: {
                        ...prefs.setups,
                        [game.id]: { difficulty: challenge.difficulty, options: presets }
                    }
                });
            }
            await factory(session).init({
                ...DifficultyEngine.resolve(game.id, challenge.difficulty, challenge.options),
                seed: challenge.seed
            });
            if (version === loadVersion && document.hidden) session.pause();
        } catch (error) {
            if (version !== loadVersion) return;
            session?.destroy();
            console.error(error);
            showResult(false, { text: error.message }, true);
        }
    }
    function newChallenge(game, old = challenge) {
        const options = { ...old?.options };
        delete options.typingWpm;
        delete options.reviewIds;
        delete options.recentItems;
        return {
            game: game.id,
            seed: SeededRandom.fresh(),
            difficulty: old?.difficulty || 'easy',
            options: optionsFor(game, options, old?.difficulty || 'easy')
        };
    }
    function nextJourney() {
        const game = DifficultyEngine.choose(GAMES_CONFIG, recent, journeyRandom);
        recent.push(game.id);
        recent = recent.slice(-5);
        start(game, newChallenge(game, { difficulty: $('journey-difficulty').value, options: {} }));
    }
    function renderCatalog() {
        const wins = GAMES_CONFIG.reduce((sum, g) => sum + (Progress.get(g.id)?.wins || 0), 0);
        $('progress-summary').textContent =
            `${GAMES_CONFIG.filter((g) => g.primary).length} jogos na coleção · ${wins} desafios concluídos`;
        $('storage-status').textContent = Progress.writable
            ? 'Seu progresso fica neste navegador.'
            : 'O armazenamento está indisponível ou possui um formato desconhecido. Novas estatísticas ficam nesta sessão.';
        const categories = [
            'Todos',
            'Memória',
            'Lógica',
            'Atenção',
            'Matemática',
            'Conhecimento',
            'Digitação e Palavras',
            'Simuladores',
            'Extras'
        ];
        const prefs = Progress.library();
        $('category-tabs').replaceChildren();
        for (const name of categories) {
            const button = document.createElement('button');
            button.dataset.category = name;
            const count = GAMES_CONFIG.filter((game) =>
                name === 'Todos' ? game.primary : game.category === name
            ).length;
            button.innerHTML = `<span class="category-glyph" aria-hidden="true">${GameLibrary.categories[name]?.glyph || '▧'}</span><span>${name === 'Todos' ? 'Todos os jogos' : name}</span><small aria-hidden="true">${count}</small>`;
            button.setAttribute('aria-label', name === 'Todos' ? 'Todos os jogos' : name);
            button.setAttribute('aria-pressed', category === name);
            button.onclick = () => {
                category = name;
                renderCatalog();
                [...$('category-tabs').children]
                    .find((b) => b.dataset.category === name)
                    ?.focus({ preventScroll: true });
            };
            $('category-tabs').append(button);
        }
        $('library-title').textContent =
            libraryFilter === 'perception'
                ? category === 'Todos'
                    ? 'Jogos de percepção'
                    : `Percepção · ${category}`
                : category === 'Todos'
                  ? 'Todos os jogos'
                  : category;
        $('library-filters')
            .querySelectorAll('button')
            .forEach((button) =>
                button.setAttribute('aria-pressed', String(button.dataset.filter === libraryFilter))
            );
        const games = GameLibrary.select(
            GAMES_CONFIG,
            {
                category,
                query: $('game-search').value,
                filter: libraryFilter,
                sort: $('game-sort').value
            },
            prefs
        );
        $('library-count').textContent =
            `${games.length} ${games.length === 1 ? 'jogo disponível' : 'jogos disponíveis'}`;
        $('library-empty').classList.toggle('hidden', games.length > 0);
        $('empty-title').textContent =
            libraryFilter === 'favorites'
                ? 'Seus favoritos ficam aqui'
                : libraryFilter === 'recent'
                  ? 'Sua próxima partida começa aqui'
                  : 'Nenhum jogo encontrado';
        $('empty-description').textContent =
            libraryFilter === 'favorites'
                ? 'Marque a estrela de um jogo para encontrá-lo mais rápido.'
                : libraryFilter === 'recent'
                  ? 'Os jogos que você iniciar aparecem nesta lista.'
                  : 'Tente outro nome, habilidade ou filtro.';
        $('phase-buttons-container').replaceChildren();
        for (const game of games) {
            const card = document.createElement('article');
            card.className = 'game-card';
            card.style.setProperty('--game-accent', GameLibrary.categories[game.category].color);
            const button = document.createElement('button');
            button.className = 'game-launch';
            button.setAttribute('aria-label', `Jogar ${game.name}`);
            const cover = document.createElement('span');
            cover.className = 'game-cover';
            cover.innerHTML = GameLibrary.art(game);
            const categoryBadge = document.createElement('span');
            categoryBadge.className = 'cover-badge';
            categoryBadge.textContent =
                game.category === 'Digitação e Palavras' ? 'Palavras' : game.category;
            cover.append(categoryBadge);
            if (GameLibrary.fresh.includes(game.id)) {
                const badge = document.createElement('span');
                badge.className = 'cover-new';
                badge.textContent = 'NOVO';
                cover.append(badge);
            }
            const body = document.createElement('span');
            body.className = 'game-card-body';
            const title = document.createElement('strong');
            title.textContent = game.name;
            const description = document.createElement('p');
            description.textContent = game.description;
            const footer = document.createElement('div');
            footer.className = 'game-card-footer';
            const stats = Progress.get(game.id);
            const record = document.createElement('small');
            record.textContent = `${game.id === 'simonsays' && stats?.bestSequence ? `Recorde: ${stats.bestSequence} estímulos` : stats?.bestScore ? `Recorde: ${stats.bestScore.toLocaleString('pt-BR')}` : GameLibrary.skill(game)}`;
            const favorite = document.createElement('button');
            favorite.dataset.favorite = game.id;
            favorite.className = 'favorite-game';
            favorite.setAttribute('aria-label', `Favoritar ${game.name}`);
            favorite.setAttribute('aria-pressed', String(prefs.favorites.includes(game.id)));
            favorite.textContent = prefs.favorites.includes(game.id) ? '★' : '☆';
            favorite.onclick = (event) => {
                event.stopPropagation();
                const favorites = prefs.favorites.includes(game.id)
                    ? prefs.favorites.filter((id) => id !== game.id)
                    : [...prefs.favorites, game.id];
                Progress.updateLibrary({ favorites });
                renderCatalog();
                $('phase-buttons-container')
                    .querySelector(`[data-favorite="${game.id}"]`)
                    ?.focus({ preventScroll: true });
            };
            footer.append(record, favorite);
            const action = document.createElement('span');
            action.className = 'card-action';
            action.textContent = 'Jogar →';
            body.append(title, description, action);
            button.append(cover, body);
            card.append(button, footer);
            card.onclick = () => {
                mode = 'practice';
                configure(game);
            };
            $('phase-buttons-container').append(card);
        }
    }
    function updateDifficultyExplanation() {
        if (!selected) return;
        const options = {};
        $('game-options')
            .querySelectorAll('select')
            .forEach((el) => (options[el.dataset.option] = el.value));
        $('phase-selection-screen')
            .querySelectorAll('input[type="radio"]')
            .forEach((radio) => {
                radio.checked =
                    radio.name === 'setup-difficulty'
                        ? radio.value === $('difficulty-select').value
                        : radio.value === options[radio.name.slice('setup-'.length)];
            });
        if (selected.id === 'memory_game') {
            $('game-options')
                .querySelector('[data-option-field="category"]')
                .classList.toggle('hidden', options.mode !== 'association');
        }
        if (selected.id === 'wordrain') {
            $('game-options')
                .querySelector('[data-option-field="bank"]')
                .classList.toggle('hidden', options.mode === 'text' || options.language !== 'pt');
        }
        $('difficulty-explanation').textContent = GameLibrary.difficulty(
            selected,
            $('difficulty-select').value,
            options
        );
    }
    function togglePause() {
        if (!session?.alive) return;
        manualPause = !manualPause;
        syncGamePause();
        ui.phaseDisplay.inert = manualPause;
        ui.phaseDisplay.classList.toggle('paused-panel', manualPause);
        $('pause-notice').classList.toggle('hidden', !manualPause);
        $('pause-current-game').textContent = manualPause ? 'Retomar' : 'Pausar';
    }
    function syncGamePause() {
        const consulting = $('roguelike-game-area').querySelector(
            '.game-help[open],.session-tools[open]'
        );
        if (manualPause || document.hidden || consulting) session?.pause();
        else session?.resume();
    }
    async function share() {
        const url = new URL(location.href);
        url.search = '';
        url.hash = '';
        url.searchParams.set('game', challenge.game);
        url.searchParams.set('difficulty', challenge.difficulty);
        url.searchParams.set('seed', challenge.seed);
        url.searchParams.set('options', JSON.stringify(challenge.options));
        try {
            await navigator.clipboard.writeText(url.href);
            $('share-status').textContent =
                'Link copiado. O desafio usa a mesma seed e configuração.';
        } catch {
            $('share-status').textContent = url.href;
        }
    }
    $('start-practice-game-btn').onclick = () => {
        if (!selected) return;
        try {
            const options = { ...configuredOptions };
            $('game-options')
                .querySelectorAll('select')
                .forEach((el) => (options[el.dataset.option] = el.value));
            start(selected, {
                game: selected.id,
                difficulty: selected.id === 'simonsays' ? 'easy' : $('difficulty-select').value,
                seed: $('seed-input').value.trim()
                    ? SeededRandom.normalize($('seed-input').value)
                    : SeededRandom.fresh(),
                options
            });
        } catch (error) {
            $('config-error').textContent = error.message;
        }
    };
    $('start-journey-mode').onclick = () => {
        mode = 'journey';
        recent = [];
        nextJourney();
    };
    $('daily-challenge').onclick = () => {
        mode = 'practice';
        const seed = SeededRandom.daily(),
            rng = SeededRandom.create(seed);
        const game = rng.pick(GAMES_CONFIG.filter((g) => g.primary && g.type !== 'simulation'));
        configure(game, {
            difficulty: 'medium',
            seed,
            options: {
                recentItems: [],
                reviewIds: [],
                typingWpm: DifficultyEngine.resolve('wordrain', 'medium').baseWpm
            }
        });
    };
    $('start-practice-mode-select').onclick = () => {
        document.querySelector('.library-shell').scrollIntoView({ block: 'start' });
        $('game-search').focus({ preventScroll: true });
    };
    $('game-search').oninput = renderCatalog;
    $('game-sort').onchange = renderCatalog;
    $('library-filters').onclick = (event) => {
        const button = event.target.closest('[data-filter]');
        if (button) {
            libraryFilter = button.dataset.filter;
            renderCatalog();
        }
    };
    $('clear-library-filters').onclick = () => {
        category = 'Todos';
        libraryFilter = 'all';
        $('game-search').value = '';
        renderCatalog();
        $('game-search').focus({ preventScroll: true });
    };
    $('difficulty-select').onchange = updateDifficultyExplanation;
    $('game-options').onchange = updateDifficultyExplanation;
    $('featured-art').innerHTML = GameLibrary.art(
        GAMES_CONFIG.find((game) => game.id === 'timeline'),
        true
    );
    $('featured-game').onclick = () => {
        mode = 'practice';
        configure(GAMES_CONFIG.find((game) => game.id === 'timeline'));
    };
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openPanel = $('roguelike-game-area').querySelector(
                '.game-help[open],.session-tools[open]'
            );
            if (openPanel) {
                event.preventDefault();
                openPanel.open = false;
                openPanel.querySelector('summary')?.focus({ preventScroll: true });
                syncGamePause();
                return;
            }
            if (document.fullscreenElement) return;
        }
        if (
            event.key === 'Escape' &&
            session?.alive &&
            $('messageModal').classList.contains('hidden')
        ) {
            event.preventDefault();
            togglePause();
        }
    });
    $('back-to-main-menu').textContent = '← Voltar';
    $('back-to-main-menu').onclick = returnToPrevious;
    $('quit-current-game').onclick = returnToPrevious;
    $('modalMenuButton').textContent = 'Voltar';
    $('modalMenuButton').onclick = returnToPrevious;
    $('restart-current-game').onclick = () => start(current, challenge);
    $('new-current-game').onclick = () => start(current, newChallenge(current));
    $('game-settings').onclick = () => {
        mode = 'practice';
        configure(current, challenge);
    };
    $('pause-current-game').onclick = togglePause;
    $('modalCloseButton').onclick = () =>
        mode === 'journey' ? nextJourney() : start(current, newChallenge(current));
    $('modalReplayButton').onclick = () => start(current, challenge);
    $('modalShareButton').onclick = share;
    $('messageModal').addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            returnToPrevious();
        }
        if (event.key === 'Tab') {
            const buttons = [...$('messageModal').querySelectorAll('button')],
                first = buttons[0],
                last = buttons.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
    document.addEventListener('visibilitychange', () => {
        syncGamePause();
    });
    document.addEventListener(
        'toggle',
        (event) => {
            if (
                event.target.isConnected &&
                event.target.matches?.('.game-help,.session-tools') &&
                event.target.closest('#roguelike-game-area')
            )
                syncGamePause();
        },
        true
    );
    window.addEventListener('pagehide', (event) => {
        rememberPage();
        if (event.persisted) session?.pause();
        else session?.destroy();
    });
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) syncGamePause();
    });
    window.addEventListener('popstate', (event) => {
        restorePage(event.state || routeFromURL()).catch((error) => {
            console.error(error);
            quit();
        });
    });
    document.addEventListener('change', () => rememberPage());
    $('seed-input').addEventListener('input', () => rememberPage());
    $('game-search').addEventListener('input', () => rememberPage());
    $('category-tabs').addEventListener('click', () => rememberPage());
    $('library-filters').addEventListener('click', () => rememberPage());
    $('clear-library-filters').addEventListener('click', () => rememberPage());
    window.addEventListener('scroll', () => rememberPage(), { passive: true });
    function resizeArena() {
        $('roguelike-game-area').style.setProperty(
            '--arena-height',
            `${Math.floor(window.visualViewport?.height || window.innerHeight)}px`
        );
    }
    window.visualViewport?.addEventListener('resize', resizeArena);
    window.addEventListener('resize', resizeArena);
    resizeArena();
    $('expand-game').onclick = async () => {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else if (document.documentElement.requestFullscreen)
                await document.documentElement.requestFullscreen();
            else
                ui.noticeDisplay.textContent =
                    'A partida já ocupa a janela. Este navegador não oferece tela cheia.';
        } catch {
            ui.noticeDisplay.textContent =
                'Não foi possível entrar em tela cheia. A partida continua na janela.';
        }
    };
    document.addEventListener('fullscreenchange', () => {
        $('expand-game').setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
        $('expand-game').setAttribute(
            'aria-label',
            document.fullscreenElement ? 'Sair da tela cheia' : 'Entrar em tela cheia'
        );
        resizeArena();
    });
    function routeFromURL() {
        const params = new URL(location.href).searchParams;
        const game = GAMES_CONFIG.find((g) => g.id === params.get('game'));
        if (!game) return { version: 1, screen: 'game-main-menu' };
        const route = {
            version: 1,
            screen:
                params.get('view') === 'play' ? 'roguelike-game-area' : 'phase-selection-screen',
            challenge: {
                game: game.id,
                difficulty: params.get('difficulty') || 'easy',
                seed: params.has('seed') ? SeededRandom.normalize(params.get('seed')) : '',
                options: JSON.parse(params.get('options') || '{}')
            }
        };
        // Only restore navigation context when the explicit challenge matches it.
        try {
            const cached = history.state || JSON.parse(localStorage.getItem(pageKey));
            const c = cached?.challenge,
                r = route.challenge;
            if (
                cached?.version === 1 &&
                cached.screen === route.screen &&
                c?.game === r.game &&
                c.seed === r.seed &&
                c.difficulty === r.difficulty &&
                JSON.stringify(optionsFor(game, c.options, r.difficulty)) ===
                    JSON.stringify(optionsFor(game, r.options, r.difficulty))
            ) {
                route.library = cached.library;
                route.trail = cached.trail;
                route.scroll = cached.scroll;
            }
        } catch {
            /* A shared link still opens when stored context is unavailable. */
        }
        return route;
    }
    renderCatalog();
    screen('game-main-menu');
    routingReady = true;
    const params = new URL(location.href).searchParams,
        game = GAMES_CONFIG.find((g) => g.id === params.get('game'));
    if (game)
        try {
            const difficulty = params.get('difficulty') || 'easy';
            if (!DifficultyEngine.keys.includes(difficulty))
                throw Error('Dificuldade inválida no link.');
            const linked = routeFromURL();
            if (['play', 'setup'].includes(params.get('view')))
                restorePage(linked).catch((error) => {
                    configure(game);
                    $('config-error').textContent = error.message;
                });
            else
                configure(game, {
                    ...linked.challenge,
                    seed:
                        params.get('view') === 'setup' && !params.has('seed')
                            ? ''
                            : SeededRandom.normalize(params.get('seed'))
                });
        } catch (error) {
            configure(game);
            $('config-error').textContent = error.message;
        }
    else {
        let saved = null;
        try {
            if (!params.has('view')) saved = JSON.parse(localStorage.getItem(pageKey));
        } catch {}
        if (saved)
            restorePage(saved)
                .then((restored) => {
                    if (!restored) rememberPage();
                })
                .catch(() => {
                    quit();
                    rememberPage();
                });
        else rememberPage();
    }
});
