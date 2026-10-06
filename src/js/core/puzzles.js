/* Funções puras: geração, equivalência geométrica e distância perceptual. */
const PuzzleMath = Object.freeze({
    prime(n) {
        if (n < 2 || !Number.isInteger(n)) return false;
        for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
        return true;
    },
    determinant(a) {
        return a.length === 2
            ? a[0][0] * a[1][1] - a[0][1] * a[1][0]
            : a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) -
                  a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) +
                  a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
    },
    matrix(a) {
        return `<span class="matrix-grid" style="grid-template-columns:repeat(${a[0].length},1fr)">${a
            .flat()
            .map((v) => `<span>${v}</span>`)
            .join('')}</span>`;
    },
    expression(random, tier) {
        const a = random.int(2, [15, 35, 25, 50][tier]),
            b = random.int(2, [12, 20, 15, 25][tier]);
        const op = random.pick(tier ? ['+', '−', '×'] : ['+', '−']);
        let value = op === '+' ? a + b : op === '−' ? a - b : a * b,
            text = `${a} ${op} ${b}`;
        if (tier >= 2) {
            const c = random.int(2, 12);
            text = `(${text}) ${tier === 3 ? '×' : '+'} ${c}`;
            value = tier === 3 ? value * c : value + c;
        }
        return { text, value };
    }
});
const ShapeEngine = (() => {
    function normalized(cells) {
        const minX = Math.min(...cells.map((c) => c[0])),
            minY = Math.min(...cells.map((c) => c[1]));
        return cells
            .map(([x, y]) => [x - minX, y - minY])
            .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    }
    function transform(cells, turns = 0, mirror = false) {
        let result = cells.map(([x, y]) => [mirror ? -x : x, y]);
        for (let i = 0; i < turns % 4; i++) result = result.map(([x, y]) => [-y, x]);
        return normalized(result);
    }
    const key = (cells) => JSON.stringify(normalized(cells));
    const rotations = (cells) => new Set([0, 1, 2, 3].map((t) => key(transform(cells, t))));
    function generate(random, count) {
        for (let tries = 0; tries < 150; tries++) {
            const cells = [[0, 0]];
            while (cells.length < count) {
                const [x, y] = random.pick(cells),
                    [dx, dy] = random.pick([
                        [1, 0],
                        [-1, 0],
                        [0, 1],
                        [0, -1]
                    ]);
                if (!cells.some((c) => c[0] === x + dx && c[1] === y + dy))
                    cells.push([x + dx, y + dy]);
            }
            const original = normalized(cells),
                possible = rotations(original),
                reflection = transform(original, 0, true);
            if (!possible.has(key(reflection)) && rotations(reflection).size === 4) return original;
        }
        return normalized([
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 2],
            [2, 2],
            [2, 3]
        ]);
    }
    function svg(cells, color = '#8bd6eb') {
        const a = normalized(cells),
            w = Math.max(...a.map((c) => c[0])) + 1,
            h = Math.max(...a.map((c) => c[1])) + 1;
        return `<svg viewBox="-1 -1 ${w + 2} ${h + 2}" aria-hidden="true">${a.map(([x, y]) => `<rect x="${x}" y="${y}" width=".96" height=".96" fill="${color}" stroke="#1b354a" stroke-width=".05"/>`).join('')}</svg>`;
    }
    return Object.freeze({ normalized, transform, key, rotations, generate, svg });
})();
const ColorEngine = (() => {
    function rgb(h, s, l) {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l),
            f = (n) => {
                const k = (n + h / 30) % 12;
                return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
            };
        return [f(0), f(8), f(4)];
    }
    function lab(h, s, l) {
        const [r, g, b] = rgb(h, s, l).map((c) =>
            c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92
        );
        const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
        const x = f((r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047),
            y = f(r * 0.2126729 + g * 0.7151522 + b * 0.072175),
            z = f((r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883);
        return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
    }
    function distance(a, b) {
        return Math.hypot(...a.map((v, i) => v - b[i]));
    }
    function ramp(random, mode, count) {
        // Rejeitamos degraus perceptualmente próximos antes de embaralhar a rampa.
        for (let tries = 0; tries < 80; tries++) {
            const hue = random.int(0, 359),
                sat = random.int(65, 85),
                levels = [];
            for (let i = 0; i < count; i++) {
                const t = i / (count - 1);
                const h = mode === 'warmth' ? 15 + t * 220 : hue,
                    s = mode === 'saturation' ? 12 + t * 82 : sat,
                    l = mode === 'lightness' ? 18 + t * 68 : mode === 'saturation' ? 55 : 52;
                const values = lab(h, s, l);
                levels.push({
                    h,
                    s,
                    l,
                    lab: values,
                    value:
                        mode === 'lightness'
                            ? values[0]
                            : mode === 'saturation'
                              ? Math.hypot(values[1], values[2])
                              : t,
                    css: `hsl(${h} ${s}% ${l}%)`
                });
            }
            levels.sort((a, b) => a.value - b.value);
            if (levels.every((c, i) => !i || distance(c.lab, levels[i - 1].lab) >= 5))
                return levels.map((c, id) => ({ ...c, id }));
        }
        throw Error('A rampa não atingiu o contraste mínimo.');
    }
    return Object.freeze({ rgb, lab, distance, ramp });
})();
