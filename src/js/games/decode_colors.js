GameRegistry.register('decode_colors', (session) => {
    function init(config) {
        const { random, score } = session,
            mode = config.options.mode || 'standard';
        const colors = [
            '#f87171',
            '#60a5fa',
            '#4ade80',
            '#facc15',
            '#fb923c',
            '#c084fc',
            '#22d3ee',
            '#f0abfc'
        ];
        const shapes = ['●', '▲', '■'],
            tokens = Array.from(
                { length: config.colors * (mode === 'position' ? 3 : 1) },
                (_, i) => ({
                    color: i % config.colors,
                    shape: mode === 'position' ? Math.floor(i / config.colors) : 0
                })
            );
        const warm = (t) => [0, 3, 4].includes(t.color);
        let secret = [];
        function build() {
            if (secret.length === config.slots) return true;
            for (const token of random.shuffle(tokens)) {
                if (!config.repeats && secret.includes(token)) continue;
                if (mode === 'rule' && warm(token) && secret.length && warm(secret.at(-1)))
                    continue;
                secret.push(token);
                if (build()) return true;
                secret.pop();
            }
            return false;
        }
        build();
        secret = secret.map((t) => tokens.indexOf(t));
        let guess = [],
            attempts = 0,
            noteMode = false;
        const $ = GameUI.shell(
            session,
            'Decifrando Cores',
            `${config.slots} posições · ${config.colors} cores · ${config.repeats ? 'repetições possíveis' : 'sem repetições'}. ${mode === 'rule' ? 'Vermelho, amarelo e laranja não podem ficar lado a lado.' : ''} ${mode === 'memory' ? 'As tentativas ficam visíveis por dez segundos.' : 'Consulte o histórico para deduzir.'}`,
            `<div id="mastermind-color-palette" class="token-row"></div><div class="controls">${GameUI.button('Anotar cores', 'mastermind-note-toggle')}</div><div id="mastermind-current-guess" class="token-row"></div><div class="controls">${GameUI.button('Verificar', 'mastermind-submit', 'primary')}${GameUI.button('Limpar', 'mastermind-clear')}</div><p class="status-line">● posição correta · ○ outra posição · × sem correspondência restante</p><div id="mastermind-notes" class="token-notes"></div><div id="mastermind-history" class="history" aria-label="Histórico de tentativas"></div>`
        );
        const notes = Array(config.colors).fill(0),
            labels = ['possível', 'impossível', 'provável'];
        const tokenHTML = (id) =>
            `<span class="token" style="background:${colors[tokens[id].color]}">${mode === 'position' ? shapes[tokens[id].shape] : tokens[id].color + 1}</span>`;
        function render() {
            $('#mastermind-current-guess').innerHTML = Array.from(
                { length: config.slots },
                (_, i) =>
                    `<button class="token" data-slot="${i}" aria-label="Posição ${i + 1}, ${guess[i] === undefined ? 'vazia' : `cor ${tokens[guess[i]].color + 1}`}" style="background:${guess[i] === undefined ? '#23334a' : colors[tokens[guess[i]].color]}">${guess[i] === undefined ? '?' : mode === 'position' ? shapes[tokens[guess[i]].shape] : tokens[guess[i]].color + 1}</button>`
            ).join('');
            $('#mastermind-submit').disabled = guess.length !== config.slots;
            session.ui.limitDisplay.textContent = `Tentativas: ${attempts}/${config.attempts}`;
            $('#mastermind-notes').innerHTML = notes
                .map(
                    (state, color) =>
                        `<div><span class="token" style="background:${colors[color]}">${color + 1}</span><button data-note="${color}" aria-label="Cor ${color + 1}: ${labels[state]}">${labels[state]}</button></div>`
                )
                .join('');
            $('#mastermind-notes').classList.toggle('hidden', !noteMode);
        }
        for (let id = 0; id < tokens.length; id++) {
            const button = document.createElement('button');
            button.className = 'token';
            button.innerHTML =
                mode === 'position' ? shapes[tokens[id].shape] : String(tokens[id].color + 1);
            button.style.background = colors[tokens[id].color];
            button.setAttribute(
                'aria-label',
                `Cor ${tokens[id].color + 1}${mode === 'position' ? `, forma ${shapes[tokens[id].shape]}` : ''}`
            );
            session.listen(button, 'click', () => {
                if (guess.length < config.slots) {
                    guess.push(id);
                    render();
                }
            });
            $('#mastermind-color-palette').append(button);
        }
        session.listen($('#mastermind-current-guess'), 'click', (event) => {
            const cell = event.target.closest('[data-slot]');
            if (cell) {
                guess.splice(+cell.dataset.slot, 1);
                render();
            }
        });
        session.listen($('#mastermind-notes'), 'click', (event) => {
            const button = event.target.closest('[data-note]');
            if (button) {
                const color = +button.dataset.note;
                notes[color] = (notes[color] + 1) % 3;
                render();
            }
        });
        session.listen($('#mastermind-note-toggle'), 'click', () => {
            noteMode = !noteMode;
            render();
        });
        session.listen($('#mastermind-clear'), 'click', () => {
            guess = [];
            render();
        });
        session.listen($('#mastermind-submit'), 'click', () => {
            if (guess.length !== config.slots) return;
            attempts++;
            let exact = 0,
                other = 0;
            const remaining = new Map(),
                unmatched = [];
            for (let i = 0; i < secret.length; i++) {
                if (secret[i] === guess[i]) exact++;
                else {
                    remaining.set(secret[i], (remaining.get(secret[i]) || 0) + 1);
                    unmatched.push(guess[i]);
                }
            }
            for (const id of unmatched)
                if (remaining.get(id) > 0) {
                    other++;
                    remaining.set(id, remaining.get(id) - 1);
                }
            const row = document.createElement('div');
            row.className = 'history-row';
            row.innerHTML = `<span class="token-row">${guess.map(tokenHTML).join('')}</span><span class="feedback" aria-label="${exact} posições corretas, ${other} em outras posições, ${config.slots - exact - other} sem correspondência">${'●'.repeat(exact)}${'○'.repeat(other)}${'×'.repeat(config.slots - exact - other)}</span>`;
            $('#mastermind-history').prepend(row);
            if (mode === 'memory') {
                const attemptNumber = attempts;
                session.timeout(() => {
                    row.textContent = `Tentativa ${attemptNumber}: histórico oculto`;
                }, 10000);
            }
            score.answer(
                exact === config.slots,
                exact === config.slots ? Math.max(100, 1000 - attempts * 30) : 0
            );
            if (exact === config.slots) {
                session.complete(true, { text: `Código deduzido em ${attempts} tentativas.` });
            } else if (attempts === config.attempts) {
                session.complete(false, {
                    text: `Tentativas esgotadas. Código: ${secret.map((id) => `${tokens[id].color + 1}${mode === 'position' ? shapes[tokens[id].shape] : ''}`).join(' · ')}.`
                });
            }
            guess = [];
            render();
        });
        render();
    }
    return { init, destroy: session.destroy };
});
