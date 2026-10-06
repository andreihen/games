GameRegistry.register('matrix', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            mode = config.options.mode || 'addition',
            size = mode === 'determinant' && tier >= 2 ? 3 : 2;
        ChallengeRunner.quiz(session, config, {
            title: 'Matrizes',
            instructions:
                'Responda apenas ao valor solicitado. As operações seguem a definição exibida na rodada.',
            generate(index, rng) {
                const make = () =>
                    Array.from({ length: size }, () =>
                        Array.from({ length: size }, () =>
                            rng.int(tier >= 1 ? -6 : 0, [6, 9, 12, 15][tier])
                        )
                    );
                let a = make(),
                    b = make(),
                    row = rng.int(0, size - 1),
                    col = rng.int(0, size - 1),
                    answer,
                    visual,
                    prompt,
                    explanation;
                if (mode === 'determinant') {
                    answer = PuzzleMath.determinant(a);
                    visual = PuzzleMath.matrix(a);
                    prompt = `Qual é o determinante ${size} × ${size}?`;
                    explanation =
                        size === 2
                            ? `${a[0][0]} × ${a[1][1]} − ${a[0][1]} × ${a[1][0]} = ${answer}.`
                            : `Expansão pela primeira linha: ${a[0][0]} × (${a[1][1] * a[2][2] - a[1][2] * a[2][1]}) − ${a[0][1]} × (${a[1][0] * a[2][2] - a[1][2] * a[2][0]}) + ${a[0][2]} × (${a[1][0] * a[2][1] - a[1][1] * a[2][0]}) = ${answer}.`;
                } else if (mode === 'system') {
                    do {
                        a = make();
                    } while (!PuzzleMath.determinant(a));
                    const x = rng.int(-5, 8),
                        y = rng.int(-5, 8),
                        rhs = a.map((r) => r[0] * x + r[1] * y);
                    answer = col ? y : x;
                    prompt = `Resolva o sistema: qual é ${col ? 'y' : 'x'}?`;
                    visual = `<div class="equation-text">${a[0][0]}x + (${a[0][1]})y = ${rhs[0]}<br>${a[1][0]}x + (${a[1][1]})y = ${rhs[1]}</div>`;
                    explanation = `A solução única é x = ${x}, y = ${y}; os coeficientes têm determinante ${PuzzleMath.determinant(a)}.`;
                } else if (mode === 'missing') {
                    answer = a[row][col];
                    const target = a.map((r, i) => r.map((v, j) => v + b[i][j])),
                        masked = a.map((r) => r.slice());
                    masked[row][col] = '?';
                    visual = `${PuzzleMath.matrix(masked)} + ${PuzzleMath.matrix(b)} = ${PuzzleMath.matrix(target)}`;
                    prompt: 'Qual valor substitui o ponto de interrogação?';
                    explanation = `Na posição (${row + 1}, ${col + 1}), ${target[row][col]} − (${b[row][col]}) = ${answer}.`;
                } else if (mode === 'transform') {
                    const k = rng.pick([-3, -2, 2, 3]);
                    row = 1;
                    answer = a[1][col] + k * a[0][col];
                    visual = PuzzleMath.matrix(a);
                    prompt = `Aplique L₂ ← L₂ + (${k})L₁. Qual será o elemento (2, ${col + 1})?`;
                    explanation = `${a[1][col]} + (${k}) × (${a[0][col]}) = ${answer}.`;
                } else if (mode === 'scalar') {
                    const k = rng.pick([-3, -2, 2, 3, 4]);
                    answer = k * a[row][col];
                    visual = `${k} × ${PuzzleMath.matrix(a)}`;
                    prompt = `Qual é o elemento (${row + 1}, ${col + 1}) do resultado?`;
                    explanation = `Multiplicamos cada elemento pelo escalar: ${k} × (${a[row][col]}) = ${answer}.`;
                } else {
                    answer = a[row][col] + b[row][col];
                    visual = `${PuzzleMath.matrix(a)} + ${PuzzleMath.matrix(b)}`;
                    prompt = `Qual é o elemento (${row + 1}, ${col + 1}) da soma?`;
                    explanation = `Somamos elementos na mesma posição: ${a[row][col]} + (${b[row][col]}) = ${answer}.`;
                }
                return {
                    prompt,
                    visual: `<div class="matrix-display">${visual}</div>`,
                    correct: String(answer),
                    typing: true,
                    numeric: true,
                    explanation
                };
            }
        });
    },
    destroy: session.destroy
}));
