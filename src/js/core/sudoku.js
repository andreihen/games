const SudokuEngine = (() => {
    const ALL = 511,
        bit = (n) => 1 << (n - 1),
        digits = (mask) => Array.from({ length: 9 }, (_, i) => i + 1).filter((n) => mask & bit(n)),
        count = (mask) => digits(mask).length;
    const rows = Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => r * 9 + c)
    );
    const cols = Array.from({ length: 9 }, (_, c) =>
        Array.from({ length: 9 }, (_, r) => r * 9 + c)
    );
    const boxes = Array.from({ length: 9 }, (_, b) =>
        Array.from(
            { length: 9 },
            (_, i) => (Math.floor(b / 3) * 3 + Math.floor(i / 3)) * 9 + (b % 3) * 3 + (i % 3)
        )
    );
    const units = [...rows, ...cols, ...boxes],
        unitFor = Array.from({ length: 81 }, (_, i) => units.filter((unit) => unit.includes(i))),
        peers = unitFor.map((groups) => new Set(groups.flat()));
    const cell = (i) => `L${Math.floor(i / 9) + 1}C${(i % 9) + 1}`;
    function candidates(board) {
        return board.map((value, i) =>
            value
                ? 0
                : ALL & ~[...peers[i]].reduce((mask, j) => mask | (board[j] ? bit(board[j]) : 0), 0)
        );
    }
    function valid(board) {
        return units.every((unit) => {
            const values = unit.map((i) => board[i]).filter(Boolean);
            return values.length === new Set(values).size;
        });
    }
    function countSolutions(input, limit = 2) {
        const board = [...input];
        if (!valid(board)) return 0;
        let found = 0;
        function visit() {
            if (found >= limit) return;
            const masks = candidates(board);
            let index = -1,
                best = 10;
            for (let i = 0; i < 81; i++)
                if (!board[i]) {
                    const n = count(masks[i]);
                    if (!n) return;
                    if (n < best) {
                        best = n;
                        index = i;
                    }
                }
            if (index < 0) {
                found++;
                return;
            }
            for (const value of digits(masks[index])) {
                board[index] = value;
                visit();
                if (found >= limit) break;
            }
            board[index] = 0;
        }
        visit();
        return found;
    }
    function combinations(array, n) {
        const result = [];
        function go(start, selected) {
            if (selected.length === n) {
                result.push([...selected]);
                return;
            }
            for (let i = start; i <= array.length - (n - selected.length); i++) {
                selected.push(array[i]);
                go(i + 1, selected);
                selected.pop();
            }
        }
        go(0, []);
        return result;
    }
    function step(board, masks, maxTier = 3) {
        if (maxTier > 0) {
            const simpler = step(board, masks, maxTier - 1);
            if (simpler) return simpler;
        }
        const placement = (i, value, technique, text) => ({
            technique,
            tier: 0,
            placements: [{ i, value }],
            eliminations: [],
            text
        });
        const elimination = (changes, technique, tier, text) => ({
            technique,
            tier,
            placements: [],
            eliminations: changes,
            text
        });
        if (maxTier === 0) {
            for (let i = 0; i < 81; i++)
                if (!board[i] && count(masks[i]) === 1) {
                    const value = digits(masks[i])[0];
                    return placement(
                        i,
                        value,
                        'Naked Single',
                        `Em ${cell(i)}, linha, coluna e região eliminam os outros números. Apenas ${value} permanece possível.`
                    );
                }
            for (const unit of units)
                for (let value = 1; value <= 9; value++)
                    if (!unit.some((i) => board[i] === value)) {
                        const cells = unit.filter((i) => !board[i] && masks[i] & bit(value));
                        if (cells.length === 1)
                            return placement(
                                cells[0],
                                value,
                                'Hidden Single',
                                `${value} só pode aparecer em ${cell(cells[0])} nesta unidade, mesmo havendo outros candidatos na célula.`
                            );
                    }
        }
        if (maxTier < 1) return null;
        for (let size = 2; size <= 3; size++) {
            if ((size === 2 && maxTier !== 1) || (size === 3 && maxTier !== 2)) continue;
            if (size === 3 && maxTier < 2) break;
            for (const unit of units) {
                const open = unit.filter((i) => !board[i]);
                for (const subset of combinations(
                    open.filter((i) => count(masks[i]) >= 2 && count(masks[i]) <= size),
                    size
                )) {
                    const union = subset.reduce((mask, i) => mask | masks[i], 0);
                    if (count(union) !== size) continue;
                    const changes = open
                        .filter((i) => !subset.includes(i) && masks[i] & union)
                        .map((i) => ({ i, mask: masks[i] & union }));
                    if (changes.length)
                        return elimination(
                            changes,
                            size === 2 ? 'Naked Pair' : 'Naked Triple',
                            size === 2 ? 1 : 2,
                            `As células ${subset.map(cell).join(', ')} reservam {${digits(union).join(',')}}. Esses candidatos saem das demais células desta unidade.`
                        );
                }
                const available = digits(open.reduce((mask, i) => mask | masks[i], 0));
                for (const values of combinations(available, size)) {
                    const union = values.reduce((mask, v) => mask | bit(v), 0),
                        subset = open.filter((i) => masks[i] & union);
                    if (
                        subset.length !== size ||
                        values.some((v) => !subset.some((i) => masks[i] & bit(v)))
                    )
                        continue;
                    const changes = subset
                        .filter((i) => masks[i] & ~union)
                        .map((i) => ({ i, mask: masks[i] & ~union }));
                    if (changes.length)
                        return elimination(
                            changes,
                            size === 2 ? 'Hidden Pair' : 'Hidden Triple',
                            size === 2 ? 1 : 2,
                            `{${values.join(',')}} só aparecem em ${subset.map(cell).join(', ')} nesta unidade. Outros candidatos dessas células podem ser eliminados.`
                        );
                }
            }
        }
        if (maxTier === 1)
            for (let value = 1; value <= 9; value++)
                for (const unit of units) {
                    const positions = unit.filter((i) => !board[i] && masks[i] & bit(value));
                    if (positions.length < 2) continue;
                    for (const other of units) {
                        if (other === unit || !positions.every((i) => other.includes(i))) continue;
                        const oneBox = boxes.includes(unit) || boxes.includes(other);
                        if (!oneBox) continue;
                        const changes = other
                            .filter((i) => !unit.includes(i) && !board[i] && masks[i] & bit(value))
                            .map((i) => ({ i, mask: bit(value) }));
                        if (changes.length)
                            return elimination(
                                changes,
                                'Box-Line Reduction',
                                1,
                                `O ${value} está restrito a ${positions.map(cell).join(', ')} na interseção entre região e linha/coluna. Elimine-o das outras células da unidade que cruza essa região.`
                            );
                    }
                }
        if (maxTier < 2) return null;
        for (let size = 2; size <= 3; size++) {
            if ((size === 2 && maxTier !== 2) || (size === 3 && maxTier !== 3)) continue;
            if (size === 3 && maxTier < 3) break;
            for (const horizontal of [true, false])
                for (let value = 1; value <= 9; value++) {
                    const base = horizontal ? rows : cols,
                        other = horizontal ? cols : rows;
                    const candidatesIn = base.map((unit) =>
                        unit
                            .filter((i) => !board[i] && masks[i] & bit(value))
                            .map((i) => (horizontal ? i % 9 : Math.floor(i / 9)))
                    );
                    const eligible = Array.from({ length: 9 }, (_, i) => i).filter(
                        (i) => candidatesIn[i].length >= 2 && candidatesIn[i].length <= size
                    );
                    for (const selected of combinations(eligible, size)) {
                        const cover = [...new Set(selected.flatMap((i) => candidatesIn[i]))];
                        if (cover.length !== size) continue;
                        const changes = cover
                            .flatMap((c) => other[c])
                            .filter(
                                (i) =>
                                    !selected.includes(horizontal ? Math.floor(i / 9) : i % 9) &&
                                    !board[i] &&
                                    masks[i] & bit(value)
                            )
                            .map((i) => ({ i, mask: bit(value) }));
                        if (changes.length)
                            return elimination(
                                changes,
                                size === 2 ? 'X-Wing' : 'Swordfish',
                                size === 2 ? 2 : 3,
                                `${size === 2 ? 'X-Wing' : 'Swordfish'} do ${value}: ${horizontal ? 'linhas' : 'colunas'} ${selected.map((i) => i + 1).join(', ')} usam apenas ${horizontal ? 'colunas' : 'linhas'} ${cover.map((i) => i + 1).join(', ')}. Remova esse candidato das outras interseções dessas unidades.`
                            );
                    }
                }
        }
        if (maxTier < 3) return null;
        const bivalue = Array.from({ length: 81 }, (_, i) => i).filter(
            (i) => !board[i] && count(masks[i]) === 2
        );
        for (const pivot of bivalue) {
            const wings = bivalue.filter(
                (i) => i !== pivot && peers[pivot].has(i) && count(masks[i] & masks[pivot]) === 1
            );
            for (const [a, b] of combinations(wings, 2)) {
                const common = masks[a] & masks[b];
                if (
                    count(common) !== 1 ||
                    common & masks[pivot] ||
                    ((masks[a] | masks[b]) & masks[pivot]) !== masks[pivot]
                )
                    continue;
                const changes = [...peers[a]]
                    .filter(
                        (i) =>
                            i !== a &&
                            i !== b &&
                            i !== pivot &&
                            peers[b].has(i) &&
                            !board[i] &&
                            masks[i] & common
                    )
                    .map((i) => ({ i, mask: common }));
                if (changes.length)
                    return elimination(
                        changes,
                        'XY-Wing',
                        3,
                        `XY-Wing: pivô ${cell(pivot)} e alas ${cell(a)}, ${cell(b)}. Em qualquer escolha do pivô, uma das alas contém ${digits(common)[0]}; retire-o das células que enxergam ambas.`
                    );
            }
        }
        return null;
    }
    function logical(input, maxTier = 3, overrides = null) {
        const board = [...input],
            masks = candidates(board),
            steps = [];
        if (!valid(board)) return { solved: false, steps, reason: 'Duplicatas' };
        if (overrides)
            for (let i = 0; i < 81; i++)
                if (!board[i] && overrides[i] !== null && overrides[i] !== undefined)
                    masks[i] &= overrides[i];
        for (let round = 0; round < 700; round++) {
            if (board.every(Boolean))
                return {
                    solved: true,
                    board,
                    steps,
                    tier: Math.max(0, ...steps.map((s) => s.tier))
                };
            if (masks.some((mask, i) => !board[i] && !mask))
                return { solved: false, steps, reason: 'Sem candidatos' };
            const next = step(board, masks, maxTier);
            if (!next) return { solved: false, steps, reason: 'Técnica não implementada' };
            steps.push(next);
            for (const { i, value } of next.placements) {
                board[i] = value;
                masks[i] = 0;
                for (const peer of peers[i]) if (!board[peer]) masks[peer] &= ~bit(value);
            }
            for (const { i, mask } of next.eliminations) masks[i] &= ~mask;
        }
        return { solved: false, steps, reason: 'Limite de deduções' };
    }
    function completed(random) {
        const groups = () =>
            random
                .shuffle([0, 1, 2])
                .flatMap((b) => random.shuffle([0, 1, 2]).map((r) => b * 3 + r));
        const rowOrder = groups(),
            colOrder = groups(),
            numbers = random.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        return rowOrder.flatMap((r) =>
            colOrder.map((c) => numbers[(r * 3 + Math.floor(r / 3) + c) % 9])
        );
    }
    const cache = new Map();
    async function generate(random, tier, yieldControl = async () => true) {
        const key = `${random.seed}:${tier}`;
        if (cache.has(key)) return structuredClone(cache.get(key));
        for (let attempt = 0; attempt < 200; attempt++) {
            const solution = completed(random),
                board = [...solution];
            let best = null;
            let processed = 0;
            for (const i of random.shuffle(Array.from({ length: 81 }, (_, i) => i))) {
                if (++processed % 4 === 0 && !(await yieldControl(attempt + 1))) return null;
                const saved = board[i];
                board[i] = 0;
                if (countSolutions(board) !== 1) {
                    board[i] = saved;
                    continue;
                }
                const analysis = logical(board, tier);
                if (!analysis.solved) {
                    board[i] = saved;
                    continue;
                }
                if (analysis.tier === tier)
                    best = { board: [...board], solution: [...solution], analysis };
                if (board.filter(Boolean).length <= [36, 30, 27, 25][tier] && best) break;
            }
            if (best) {
                cache.set(key, best);
                return structuredClone(best);
            }
            if (!(await yieldControl(attempt + 1))) return null;
        }
        throw new Error(
            'Não foi encontrado um Sudoku com as técnicas desta dificuldade. Use outra seed.'
        );
    }
    return Object.freeze({
        candidates,
        valid,
        countSolutions,
        logical,
        step,
        completed,
        generate,
        units,
        peers,
        digits,
        bit,
        cell
    });
})();
