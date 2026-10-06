const SeededRandom = (() => {
    function normalize(seed) {
        const value = String(seed ?? '')
            .trim()
            .toUpperCase();
        if (!/^[A-Z0-9_-]{1,32}$/.test(value))
            throw new Error('A seed deve ter de 1 a 32 letras, números, _ ou -.');
        return value;
    }
    function create(seed) {
        seed = normalize(seed);
        let state = 2166136261;
        for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
        function float() {
            state += 0x6d2b79f5;
            let value = state;
            value = Math.imul(value ^ (value >>> 15), value | 1);
            value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        }
        const rng = {
            seed,
            float,
            int: (min, max) => min + Math.floor(float() * (max - min + 1)),
            pick: (array) => array[Math.floor(float() * array.length)],
            shuffle(array) {
                const result = [...array];
                for (let i = result.length - 1; i > 0; i--) {
                    const j = rng.int(0, i);
                    [result[i], result[j]] = [result[j], result[i]];
                }
                return result;
            },
            fork: (tag) =>
                create(
                    `${seed.slice(0, 20)}_${String(tag)
                        .replace(/[^A-Z0-9_-]/gi, '')
                        .slice(0, 11)}`
                )
        };
        return Object.freeze(rng);
    }
    function fresh() {
        const bytes = new Uint32Array(2);
        crypto.getRandomValues(bytes);
        return [...bytes]
            .map((n) => n.toString(36).toUpperCase())
            .join('')
            .slice(0, 12);
    }
    const daily = () => `D${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`;
    return Object.freeze({ create, normalize, fresh, daily });
})();
