// Desenhos vetoriais próprios e estilizados: nenhum recurso dos sites de referência.
const ColorMemoryCards = Object.freeze(
    [
        ['Bob Esponja', 'characters', [52, 80, 98], 'sponge'],
        ['Patrick', 'characters', [338, 38, 93], 'star'],
        ['Sonic', 'characters', [216, 90, 85], 'spikes'],
        ['Hulk', 'characters', [106, 65, 65], 'face'],
        ['Kirby', 'characters', [337, 40, 98], 'round'],
        ['Pikachu', 'characters', [51, 83, 98], 'ears'],
        ['Boné do Mario', 'characters', [0, 90, 88], 'cap'],
        ['Cabelo da Marge', 'characters', [215, 78, 82], 'hair'],
        ['Netflix', 'logos', [357, 93, 89], 'N'],
        ['Spotify', 'logos', [141, 76, 84], 'waves'],
        ['YouTube', 'logos', [0, 100, 98], 'play'],
        ['Arcos do McDonald’s', 'logos', [46, 97, 100], 'M'],
        ['Twitch', 'logos', [264, 65, 100], 'chat'],
        ['WhatsApp', 'logos', [142, 77, 83], 'phone'],
        ['Facebook', 'logos', [215, 89, 95], 'f'],
        ['Reddit', 'logos', [16, 100, 100], 'robot'],
        ['Morango', 'nature', [356, 85, 87], 'berry'],
        ['Banana', 'nature', [53, 85, 96], 'banana'],
        ['Laranja', 'nature', [29, 98, 98], 'fruit'],
        ['Folha', 'nature', [113, 65, 60], 'leaf'],
        ['Lavanda', 'nature', [266, 46, 77], 'flower'],
        ['Céu limpo', 'nature', [203, 60, 95], 'sky'],
        ['Flamingo', 'nature', [342, 48, 96], 'bird'],
        ['Girassol', 'nature', [44, 95, 96], 'sunflower']
    ].map(([name, pack, hsv, shape]) => Object.freeze({ name, pack, hsv, shape }))
);

function colorMemoryArt(card, rgb) {
    const ink = '#18202b',
        fill = ColorMath.css(rgb);
    const eyes =
        '<ellipse cx="88" cy="90" rx="10" ry="14" fill="white"/><ellipse cx="122" cy="90" rx="10" ry="14" fill="white"/><circle cx="91" cy="93" r="4"/><circle cx="119" cy="93" r="4"/><path d="M87 125q18 17 36 0" fill="none" stroke="#18202b" stroke-width="5" stroke-linecap="round"/>';
    let body = '';
    switch (card.shape) {
        case 'swatch':
            body = `<rect x="12" y="12" width="186" height="186" rx="12" fill="${fill}"/>`;
            break;
        case 'sponge':
            body = `<rect x="48" y="43" width="115" height="122" rx="12" fill="${fill}"/>${[
                [64, 63],
                [144, 73],
                [63, 134],
                [145, 148]
            ]
                .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${ink}" opacity=".2"/>`)
                .join('')}${eyes}`;
            break;
        case 'star':
            body = `<path d="M105 25l24 52 53 11-39 35 4 56-42-29-44 29 5-56-40-35 54-11z" fill="${fill}"/>${eyes}`;
            break;
        case 'ears':
            body = `<path d="M65 70L42 16l38 28 9 41m34 0 8-41 38-28-21 54" fill="${fill}" stroke="${ink}" stroke-width="5"/><ellipse cx="105" cy="119" rx="59" ry="61" fill="${fill}"/>${eyes}<circle cx="66" cy="122" r="10" fill="#e95243"/><circle cx="145" cy="122" r="10" fill="#e95243"/>`;
            break;
        case 'cap':
            body = `<path d="M40 110q0-75 65-75t65 75z" fill="${fill}"/><ellipse cx="110" cy="116" rx="76" ry="20" fill="${fill}"/><circle cx="105" cy="77" r="23" fill="white"/><text x="105" y="86" text-anchor="middle" fill="${fill}" font-size="28" font-weight="bold">M</text>`;
            break;
        case 'hair':
            body = `<rect x="68" y="20" width="75" height="139" rx="37" fill="${fill}"/><path d="M80 165q25-20 50 0" stroke="#eed85b" stroke-width="25"/>`;
            break;
        case 'spikes':
            body = `<path d="M64 69L115 24 108 49 169 43 144 76 183 97 148 115 173 159 126 152Q62 186 48 129T64 69" fill="${fill}"/>${eyes}`;
            break;
        case 'face':
        case 'round':
            body = `<${card.shape === 'face' ? 'rect x="47" y="38" width="117" height="137" rx="28"' : 'ellipse cx="105" cy="106" rx="72" ry="66"'} fill="${fill}"/>${eyes}`;
            break;
        case 'N':
        case 'M':
        case 'f':
            body = `<text x="105" y="160" text-anchor="middle" fill="${fill}" font-size="165" font-family="Arial,sans-serif" font-weight="900">${card.shape}</text>`;
            break;
        case 'play':
            body = `<rect x="25" y="52" width="160" height="109" rx="30" fill="${fill}"/><path d="M88 80l48 27-48 27z" fill="white"/>`;
            break;
        case 'waves':
            body = `<circle cx="105" cy="105" r="77" fill="${fill}"/>${[78, 103, 128].map((y) => `<path d="M57 ${y}q48-19 96 3" fill="none" stroke="${ink}" stroke-width="9" stroke-linecap="round"/>`).join('')}`;
            break;
        case 'chat':
        case 'phone':
        case 'robot':
            body = `<path d="M40 40h130v113h-60l-30 28v-28H40z" fill="${fill}"/><text x="105" y="126" text-anchor="middle" fill="white" font-size="67">${card.shape === 'chat' ? 'Ⅱ' : card.shape === 'phone' ? '☎' : '●'}</text>`;
            break;
        case 'banana':
            body = `<path d="M38 49q-6 100 117 108 25-5 20-45-82 45-121-64z" fill="${fill}"/>`;
            break;
        case 'leaf':
            body = `<path d="M41 161Q15 35 173 32q-1 137-132 129" fill="${fill}"/><path d="M39 172L151 54" stroke="${ink}" stroke-width="4"/>`;
            break;
        case 'sky':
            body = `<rect x="22" y="29" width="166" height="154" rx="15" fill="${fill}"/><path d="M55 128h102q20-27-10-31-10-35-44-13-23-4-23 22-30-2-25 22" fill="white"/>`;
            break;
        case 'bird':
            body = `<path d="M69 131q-30-40 12-47 38-7 42-46 31-22 43 10l-25 13q8 73-46 84l-7 37h-8l6-37z" fill="${fill}"/><path d="M166 48l13 15-21-4z" fill="${ink}"/>`;
            break;
        case 'flower':
        case 'sunflower':
            body =
                Array.from(
                    { length: 8 },
                    (_, i) =>
                        `<ellipse cx="105" cy="56" rx="17" ry="35" transform="rotate(${i * 45} 105 105)" fill="${fill}"/>`
                ).join('') + '<circle cx="105" cy="105" r="25" fill="#604530"/>';
            break;
        default:
            body = `<path d="M49 65q57-48 112 0 17 70-56 111Q32 135 49 65" fill="${fill}"/><path d="M78 57l25-25 27 25" fill="#559150"/>`;
    }
    return `<svg viewBox="0 0 210 210" role="img" aria-label="Ilustração estilizada de ${GameArt.escape(card.name)}"><g fill="${ink}">${body}</g></svg>`;
}
function createColorMemory(session, pure = false) {
    return {
        init(config) {
            const tier = DifficultyEngine.index(config.difficulty),
                study = pure || config.options.mode === 'study',
                pack = config.options.pack || 'mixed',
                limit = [70, 78, 85, 92][tier];
            const deck = pure
                ? Array.from({ length: 5 }, (_, i) => ({
                      name: `Cor ${i + 1}`,
                      pack: 'color',
                      hsv: [
                          session.random.int(0, 359),
                          session.random.int(30, 95),
                          session.random.int(40, 95)
                      ],
                      shape: 'swatch'
                  }))
                : session.random
                      .shuffle(ColorMemoryCards.filter((c) => pack === 'mixed' || c.pack === pack))
                      .slice(0, 5);
            let round = -1,
                card,
                target,
                submitted = false,
                pending = pure,
                revealing = false,
                scores = [],
                values = [180, 50, 80];
            const $ = GameUI.shell(
                session,
                pure ? 'Cor Relâmpago' : 'Cor de Memória',
                pure
                    ? 'Observe a cor quando estiver pronto. Depois que ela desaparecer, reconstrua o tom pelos controles e confirme.'
                    : 'Recrie a cor principal do personagem ou símbolo. Ajuste os três controles e confirme; depois compare com a referência.',
                `<p id="cm-progress" class="status-line"></p><h3 id="cm-name"></h3>${pure ? GameUI.button('Observar cor', 'cm-observe', 'primary') : ''}<div class="color-workbench"><div class="color-preview"><div id="cm-art" class="color-memory-art"></div><p id="cm-phase" class="status-line" role="status"></p></div><div id="cm-sliders" class="color-sliders">${[
                    ['Tonalidade', 360, '°'],
                    ['Saturação', 100, '%'],
                    ['Brilho', 100, '%']
                ]
                    .map(
                        ([label, max, unit], i) =>
                            `<label for="cm-value-${i}">${label}<output id="cm-output-${i}"></output><input id="cm-value-${i}" data-color-channel="${i}" type="range" min="0" max="${max}" step="1" aria-label="${label}" /><span>${i === 0 ? 'Escolha a família da cor.' : i === 1 ? 'De cinza a uma cor intensa.' : 'De escuro a claro.'}</span></label>`
                    )
                    .join(
                        ''
                    )}</div></div><div class="controls">${GameUI.button('Mostrar pista', 'cm-hint')}${GameUI.button('Confirmar cor', 'cm-submit', 'primary')}</div><div id="cm-result" class="hidden"></div>${GameUI.button('Próximo', 'cm-next', 'primary')}`
            );
            let hinted = false;
            function paint() {
                const rgb = pending
                    ? [100, 110, 125]
                    : revealing
                      ? target
                      : ColorMath.hsv(...values);
                $('#cm-art').innerHTML = colorMemoryArt(card, rgb);
                values.forEach((n, i) => {
                    $(`#cm-value-${i}`).value = n;
                    $(`#cm-output-${i}`).textContent = `${n}${i ? '%' : '°'}`;
                    $(`#cm-value-${i}`).disabled = submitted || revealing || pending;
                });
                $('#cm-value-0').style.background =
                    'linear-gradient(to right,#f33,#ff3,#3f3,#3ff,#33f,#f3f,#f33)';
                $('#cm-value-1').style.background =
                    `linear-gradient(to right,${ColorMath.css(ColorMath.hsv(values[0], 0, values[2]))},${ColorMath.css(ColorMath.hsv(values[0], 100, values[2]))})`;
                $('#cm-value-2').style.background =
                    `linear-gradient(to right,#000,${ColorMath.css(ColorMath.hsv(values[0], values[1], 100))})`;
                $('#cm-submit').disabled = submitted || revealing || pending;
                $('#cm-hint').disabled = submitted || revealing || hinted || pending;
            }
            async function next() {
                round++;
                card = deck[round];
                target = ColorMath.hsv(...card.hsv);
                submitted = false;
                pending = pure;
                revealing = study && !pure;
                hinted = false;
                values = [session.random.int(0, 359), 50, 80];
                $('#cm-name').textContent = card.name;
                $('#cm-progress').textContent = `Cor ${round + 1} de 5 · objetivo: ${limit}%`;
                $('#cm-result').classList.add('hidden');
                $('#cm-result').innerHTML = '';
                $('#cm-next').classList.add('hidden');
                if (pure) {
                    $('#cm-observe').classList.remove('hidden');
                    $('#cm-observe').disabled = false;
                }
                $('#cm-phase').textContent = pure
                    ? 'Clique em Observar cor quando estiver pronto.'
                    : study
                      ? 'Observe a cor. Ela será escondida.'
                      : 'Qual era a cor principal?';
                paint();
                if (study && !pure) {
                    const ok = await session.sleep([3500, 2800, 2000, 1300][tier]);
                    if (!ok) return;
                    revealing = false;
                    $('#cm-phase').textContent = 'Agora reproduza a cor que você viu.';
                    paint();
                }
            }
            if (pure)
                session.listen($('#cm-observe'), 'click', async () => {
                    if (!pending || submitted) return;
                    pending = false;
                    revealing = true;
                    $('#cm-observe').disabled = true;
                    $('#cm-phase').textContent = 'Memorize esta cor…';
                    paint();
                    if (!(await session.sleep([3500, 2800, 2000, 1300][tier]))) return;
                    revealing = false;
                    $('#cm-observe').classList.add('hidden');
                    $('#cm-phase').textContent = 'Agora reproduza a cor que você viu.';
                    paint();
                });
            session.listen($('#cm-sliders'), 'input', (e) => {
                const i = e.target.dataset.colorChannel;
                if (i === undefined || submitted || revealing || pending) return;
                values[+i] = +e.target.value;
                paint();
            });
            session.listen($('#cm-hint'), 'click', () => {
                if (submitted || revealing || hinted || pending) return;
                hinted = true;
                $('#cm-phase').textContent =
                    `Pista: ${card.hsv[0] < 15 || card.hsv[0] >= 350 ? 'vermelho' : card.hsv[0] < 40 ? 'laranja' : card.hsv[0] < 70 ? 'amarelo' : card.hsv[0] < 165 ? 'verde' : card.hsv[0] < 200 ? 'ciano' : card.hsv[0] < 250 ? 'azul' : card.hsv[0] < 290 ? 'violeta' : 'rosa'}. A pista desconta 8 pontos da proximidade usada na pontuação.`;
                paint();
            });
            session.listen($('#cm-submit'), 'click', () => {
                if (submitted || revealing || pending) return;
                submitted = true;
                const guess = ColorMath.hsv(...values),
                    raw = ColorMath.similarity(target, guess),
                    score = Math.max(0, raw - (hinted ? 8 : 0));
                scores.push(score);
                session.score.attempt(score >= limit);
                session.score.add(score * 10);
                paint();
                $('#cm-phase').textContent =
                    `${raw}% de proximidade${hinted ? ` · ${score}% após a pista` : ''}.`;
                $('#cm-result').innerHTML =
                    `<div class="color-comparison"><div><span>Sua cor</span><div class="color-swatch" style="background:${ColorMath.css(guess)}"></div></div><div><span>Referência</span><div class="color-swatch" style="background:${ColorMath.css(target)}"></div></div></div><p>Referência: tonalidade ${card.hsv[0]}°, saturação ${card.hsv[1]}%, brilho ${card.hsv[2]}%.</p><div class="color-reference-art">${colorMemoryArt(card, target)}</div>`;
                $('#cm-result').classList.remove('hidden');
                $('#cm-next').classList.remove('hidden');
                $('#cm-next').textContent = round === 4 ? 'Ver resultado' : 'Próximo';
            });
            session.listen($('#cm-next'), 'click', () => {
                if (!submitted) return;
                if (round === 4) {
                    const average = Math.round(scores.reduce((a, b) => a + b, 0) / 5);
                    session.complete(average >= limit, {
                        text: `Proximidade média: ${average}%.`,
                        average
                    });
                } else next();
            });
            next();
        },
        destroy: session.destroy
    };
}
GameRegistry.register('colormemory', (session) => createColorMemory(session));
