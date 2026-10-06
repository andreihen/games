document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);
    const ui = {
        phaseDisplay: $('phase-display'),
        limitDisplay: $('phase-limit-display'),
        noticeDisplay: $('game-notice'),
        updateStats
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
    const journeyRandom = SeededRandom.create(SeededRandom.fresh());
    function screen(id) {
        screens.forEach((key) => $(key).classList.toggle('hidden', key !== id));
        const heading = $(id).querySelector('h1,h2');
        if (heading) {
            heading.tabIndex = -1;
            heading.focus();
        }
    }
    function updateStats(stats) {
        $('hud-score').textContent = stats.score.toLocaleString('pt-BR');
        $('hud-streak').textContent = stats.streak;
        $('hud-time').textContent = ScoreEngine.time(stats.time);
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
    }
    function quit() {
        stop();
        renderCatalog();
        screen('game-main-menu');
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
                'wordrain',
                'capitals',
                'flags',
                'worldmap',
                'timeline',
                'identity',
                'connections'
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
        $('difficulty-select')
            .closest('label')
            .classList.toggle('hidden', game.id === 'simonsays');
        $('seed-input').value = supplied?.seed || '';
        $('game-options').replaceChildren();
        for (const option of game.options) {
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
            $('game-options').append(label);
        }
        updateDifficultyExplanation();
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
        $('run-status').textContent =
            `${game.id === 'simonsays' ? 'Progressão contínua' : DifficultyEngine.names[challenge.difficulty]} · Seed: ${challenge.seed}`;
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
        $('library-title').textContent = category === 'Todos' ? 'Todos os jogos' : category;
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
            record.textContent = `${game.id === 'simonsays' && stats?.bestSequence ? `Recorde: ${stats.bestSequence} estímulos` : stats?.bestScore ? `Recorde: ${stats.bestScore.toLocaleString('pt-BR')}` : 'Seu próximo desafio'}`;
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
        $('difficulty-explanation').textContent = GameLibrary.difficulty(
            selected,
            $('difficulty-select').value,
            options
        );
    }
    function togglePause() {
        if (!session?.alive) return;
        manualPause = !manualPause;
        if (manualPause) session.pause();
        else session.resume();
        ui.phaseDisplay.inert = manualPause;
        ui.phaseDisplay.classList.toggle('paused-panel', manualPause);
        $('pause-notice').classList.toggle('hidden', !manualPause);
        $('pause-current-game').textContent = manualPause ? 'Retomar' : 'Pausar';
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
        const game = rng.pick(GAMES_CONFIG.filter((g) => g.primary));
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
        if (
            event.key === 'Escape' &&
            session?.alive &&
            $('messageModal').classList.contains('hidden')
        ) {
            event.preventDefault();
            togglePause();
        }
    });
    $('back-to-main-menu').onclick = quit;
    $('quit-current-game').onclick = quit;
    $('modalMenuButton').onclick = quit;
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
            quit();
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
        if (document.hidden) session?.pause();
        else if (!manualPause) session?.resume();
    });
    window.addEventListener('pagehide', () => session?.destroy());
    renderCatalog();
    screen('game-main-menu');
    const params = new URL(location.href).searchParams,
        game = GAMES_CONFIG.find((g) => g.id === params.get('game'));
    if (game)
        try {
            const difficulty = params.get('difficulty') || 'easy';
            if (!DifficultyEngine.keys.includes(difficulty))
                throw Error('Dificuldade inválida no link.');
            configure(game, {
                difficulty,
                seed: SeededRandom.normalize(params.get('seed')),
                options: JSON.parse(params.get('options') || '{}')
            });
        } catch (error) {
            configure(game);
            $('config-error').textContent = error.message;
        }
});
