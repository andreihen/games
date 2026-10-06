GameRegistry.register('connections', (session) => ({
    async init(config) {
        const data = await GameData.load('learning');
        if (!session.alive) return;
        const tier = DifficultyEngine.index(config.difficulty),
            puzzle = LearningEngine.connections(
                session.random,
                data.groups,
                config.options.recentItems
            ),
            maxErrors = [4, 4, 3, 2][tier];
        Progress.remember(
            'connections',
            puzzle.groups.map((group) => group.id)
        );
        const $ = GameUI.shell(
            session,
            'Conexões',
            'Encontre quatro grupos de quatro termos. Selecione quatro cartões e confirme a relação. Um grupo correto sai do tabuleiro; os grupos revelados explicam as conexões.',
            `<div class="learning-round"><span id="connections-progress"></span><span id="connections-lives"></span></div><progress id="connections-meter" class="challenge-meter" max="4" value="0" aria-label="Grupos encontrados"></progress><p id="connections-hint" class="muted"></p><div id="connections-solved" class="connections-solved"></div><div id="connections-board" class="connections-board"></div><p id="connections-feedback" class="notice" role="status">Selecione 4 termos que compartilham uma relação.</p><div class="controls">${GameUI.button('Limpar seleção', 'connections-clear')}${GameUI.button('Embaralhar', 'connections-shuffle')}${GameUI.button('Confirmar grupo', 'connections-check', 'primary')}</div><div id="connections-review" class="hidden"></div>${GameUI.button('Ver resultado', 'connections-finish', 'primary')}`
        );
        let words = [...puzzle.words],
            selected = new Set(),
            solved = new Set(),
            errors = 0,
            finished = false;
        const attempted = new Set();
        function render() {
            $('#connections-board').replaceChildren();
            words.forEach((word) => {
                const button = document.createElement('button');
                button.dataset.word = word;
                button.textContent = word;
                button.className = 'connection-word' + (selected.has(word) ? ' selected' : '');
                button.setAttribute('aria-pressed', String(selected.has(word)));
                button.disabled = finished;
                $('#connections-board').append(button);
            });
            $('#connections-progress').textContent =
                `${solved.size}/4 grupos encontrados · ${selected.size}/4 selecionados`;
            $('#connections-lives').textContent =
                `${Math.max(0, maxErrors - errors)} erros disponíveis`;
            $('#connections-meter').value = solved.size;
            $('#connections-check').disabled = finished || selected.size !== 4;
            $('#connections-clear').disabled = finished || !selected.size;
            $('#connections-shuffle').disabled = finished;
            $('#connections-hint').textContent =
                tier === 0 && !solved.has(puzzle.groups[0].id)
                    ? `Pista: existe um grupo de ${puzzle.groups[0].name.toLowerCase()}.`
                    : '';
        }
        function end(success) {
            finished = true;
            selected.clear();
            render();
            $('#connections-finish').classList.remove('hidden');
            if (!success) {
                const review = $('#connections-review');
                review.classList.remove('hidden');
                const h = document.createElement('h3');
                h.textContent = 'Confira as relações restantes';
                review.append(h);
                puzzle.groups
                    .filter((group) => !solved.has(group.id))
                    .forEach((group) => {
                        const p = document.createElement('p');
                        p.textContent = `${group.name}: ${group.words.join(' · ')}`;
                        review.append(p);
                    });
            }
            $('#connections-finish').focus({ preventScroll: true });
        }
        session.listen($('#connections-board'), 'click', (e) => {
            const button = e.target.closest('[data-word]');
            if (!button || finished) return;
            const word = button.dataset.word;
            if (selected.has(word)) selected.delete(word);
            else if (selected.size < 4) selected.add(word);
            else {
                $('#connections-feedback').textContent =
                    'Você já selecionou quatro termos. Desmarque um antes de escolher outro.';
                return;
            }
            render();
            $('#connections-board')
                .querySelectorAll('button')
                .forEach((b) => {
                    if (b.dataset.word === word) b.focus({ preventScroll: true });
                });
        });
        session.listen($('#connections-clear'), 'click', () => {
            if (!finished) {
                selected.clear();
                render();
            }
        });
        session.listen($('#connections-shuffle'), 'click', () => {
            if (!finished) {
                words = session.random.shuffle(words);
                render();
            }
        });
        session.listen($('#connections-check'), 'click', () => {
            if (finished || selected.size !== 4) return;
            const signature = [...selected].sort().join('|'),
                group = puzzle.groups.find(
                    (group) =>
                        !solved.has(group.id) && group.words.every((word) => selected.has(word))
                );
            if (group) {
                solved.add(group.id);
                session.score.answer(true, 300);
                words = words.filter((word) => !selected.has(word));
                selected.clear();
                const row = document.createElement('div');
                row.className = 'connection-group';
                row.dataset.group = group.id;
                row.innerHTML = `<strong>${GameArt.escape(group.name)}</strong><span>${group.words.map(GameArt.escape).join(' · ')}</span>`;
                $('#connections-solved').append(row);
                $('#connections-feedback').className = 'notice feedback-correct';
                $('#connections-feedback').textContent = `✓ Grupo encontrado: ${group.name}.`;
                render();
                if (solved.size === 4) end(true);
            } else {
                if (attempted.has(signature)) {
                    $('#connections-feedback').textContent =
                        'Você já tentou esta combinação. Mude a seleção; nenhum erro adicional foi consumido.';
                    return;
                }
                attempted.add(signature);
                errors++;
                session.score.answer(false);
                const nearest = Math.max(
                    ...puzzle.groups
                        .filter((group) => !solved.has(group.id))
                        .map((group) => group.words.filter((word) => selected.has(word)).length)
                );
                $('#connections-feedback').className = 'notice feedback-wrong';
                $('#connections-feedback').textContent =
                    nearest === 3
                        ? '✕ Quase: três termos pertencem ao mesmo grupo.'
                        : '✕ Esses termos não formam um dos grupos. Tente outra relação.';
                render();
                if (errors === maxErrors) end(false);
            }
        });
        session.listen($('#connections-finish'), 'click', () => {
            if (finished)
                session.complete(solved.size === 4, {
                    text: `${solved.size}/4 grupos · ${errors} erros. Relações: ${puzzle.groups.map((group) => group.name).join(' · ')}.`
                });
        });
        $('#connections-finish').classList.add('hidden');
        render();
    },
    destroy: session.destroy
}));
