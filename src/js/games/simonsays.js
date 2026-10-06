GameRegistry.register('simonsays', (session) => {
    function init(config) {
        const inverse = config.options.mode === 'inverse',
            sound = config.options.sound === 'on';
        let sequence = [],
            expected = [],
            inputIndex = 0,
            ready = false,
            started = false,
            longest = 0,
            presenting = false;
        const colors = ['#ef6767', '#58ac79', '#d5b855', '#5f9dd5'];
        const $ = GameUI.shell(
            session,
            'Simon Diz',
            'A sequência cresce a cada rodada. Você pode rever antes da primeira resposta, jogar sem som ou encerrar para registrar o resultado.',
            `<p id="ss-rule" class="notice" role="status"></p><p id="ss-status" class="status-line"></p><div id="ss-pads" class="tile-grid" style="grid-template-columns:repeat(2,1fr);max-width:320px">${colors.map((color, i) => `<button data-pad="${i}" style="background:${color};font-size:2.7rem;min-height:110px" aria-label="Botão ${i + 1}">${i + 1}</button>`).join('')}</div><div class="controls">${GameUI.button('Rever sequência', 'ss-replay')}${GameUI.button('Encerrar e salvar', 'ss-finish')}</div>`
        );
        const pads = [...$('#ss-pads').querySelectorAll('button')],
            rule = () =>
                !inverse
                    ? 'normal'
                    : Math.floor((sequence.length - 1) / 3) % 2 === 0
                      ? 'opposite'
                      : 'previous';
        function displayRule() {
            const current = rule();
            $('#ss-rule').textContent =
                current === 'normal'
                    ? 'Regra: repita na mesma ordem.'
                    : current === 'opposite'
                      ? 'Regra: botão oposto (1 ↔ 3, 2 ↔ 4).'
                      : 'Nova regra: posição anterior (1 → 4, 2 → 1, 3 → 2, 4 → 3).';
            expected = sequence.map((i) =>
                current === 'normal' ? i : current === 'opposite' ? (i + 2) % 4 : (i + 3) % 4
            );
        }
        function feedback(i) {
            pads[i].style.filter = 'brightness(1.8)';
            if (sound) GameAudio.note([262, 330, 392, 523][i]);
            session.timeout(() => (pads[i].style.filter = ''), 180);
        }
        async function present() {
            if (presenting) return;
            presenting = true;
            ready = false;
            inputIndex = 0;
            started = false;
            $('#ss-replay').disabled = true;
            pads.forEach((p) => (p.disabled = true));
            $('#ss-status').textContent = `Observe ${sequence.length} estímulos…`;
            displayRule();
            if (!(await session.sleep(500))) return;
            for (const i of sequence) {
                feedback(i);
                if (!(await session.sleep(Math.max(220, 650 - sequence.length * 12)))) return;
            }
            if (!(await session.sleep(300))) return;
            presenting = false;
            ready = true;
            pads.forEach((p) => (p.disabled = false));
            $('#ss-replay').disabled = false;
            $('#ss-status').textContent = 'Sua vez. Replay disponível antes da primeira resposta.';
        }
        function answer(i) {
            if (!ready) return;
            started = true;
            $('#ss-replay').disabled = true;
            feedback(i);
            const correct = i === expected[inputIndex];
            session.score.answer(correct, 25);
            if (!correct) {
                ready = false;
                return session.complete(false, {
                    text: `No passo ${inputIndex + 1}, a regra pedia o botão ${expected[inputIndex] + 1}. Maior sequência concluída: ${longest}.`
                });
            }
            inputIndex++;
            if (inputIndex === expected.length) {
                ready = false;
                longest = sequence.length;
                session.score.set({ sequenceLength: longest });
                $('#ss-status').textContent = `Sequência ${longest} concluída.`;
                sequence.push(session.random.int(0, 3));
                session.timeout(present, 800);
            }
        }
        session.listen($('#ss-pads'), 'click', (event) => {
            const pad = event.target.closest('[data-pad]');
            if (pad) answer(+pad.dataset.pad);
        });
        session.listen(document, 'keydown', (event) => {
            if (/^[1-4]$/.test(event.key)) {
                event.preventDefault();
                answer(+event.key - 1);
            }
        });
        session.listen($('#ss-replay'), 'click', () => {
            if (ready && !started) return present();
        });
        session.listen($('#ss-finish'), 'click', () =>
            session.complete(longest > 0, { text: `Maior sequência concluída: ${longest}.` })
        );
        sequence.push(session.random.int(0, 3));
        return present();
    }
    return { init, destroy: session.destroy };
});
