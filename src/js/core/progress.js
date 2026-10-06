const Progress = (() => {
    const key = 'desafio-logico-total:progress';
    let data = { version: 2, games: {} },
        writable = true;
    const positive = (value, fallback = 0) =>
        Number.isFinite(value) && value >= 0 ? value : fallback;
    try {
        const raw = localStorage.getItem(key),
            saved = JSON.parse(raw || 'null');
        if (saved) {
            if (!saved.games || typeof saved.games !== 'object' || Array.isArray(saved.games))
                writable = false;
            else if (saved.version === 2) data = saved;
            else if (saved.version === 1) {
                // Preserva o registro original antes da primeira gravação no formato novo.
                localStorage.setItem(`${key}:v1-backup`, raw);
                for (const [id, old] of Object.entries(saved.games))
                    data.games[id] = {
                        ...old,
                        legacy: { ...old },
                        highestDifficulty: -1,
                        recent: []
                    };
            } else writable = false;
        }
    } catch {
        writable = false;
    }
    function get(id) {
        const saved = data.games[id];
        if (!saved) return null;
        return {
            ...saved,
            played: positive(saved.played),
            wins: positive(saved.wins),
            bestScore: positive(saved.bestScore),
            bestStreak: positive(saved.bestStreak),
            totalTime: positive(saved.totalTime),
            recent: Array.isArray(saved.recent) ? saved.recent : []
        };
    }
    function record(id, difficulty, success, metrics, challenge) {
        const old = get(id) || {},
            duration = positive(metrics.time),
            rank = DifficultyEngine.index(difficulty);
        const stats = {
            ...old,
            played: positive(old.played) + 1,
            wins: positive(old.wins) + Number(success),
            totalTime: positive(old.totalTime) + duration,
            bestScore: Math.max(positive(old.bestScore), positive(metrics.score)),
            bestStreak: Math.max(positive(old.bestStreak), positive(metrics.bestStreak)),
            bestTime: success
                ? Math.min(positive(old.bestTime, Infinity), duration)
                : (old.bestTime ?? null),
            highestDifficulty: success
                ? Math.max(old.highestDifficulty ?? -1, rank)
                : (old.highestDifficulty ?? -1),
            correct: positive(old.correct) + positive(metrics.correct),
            mistakes: positive(old.mistakes) + positive(metrics.mistakes),
            lastWpm: positive(metrics.wpm, positive(old.lastWpm)),
            bestSequence: Math.max(positive(old.bestSequence), positive(metrics.sequenceLength)),
            recent: [
                {
                    date: new Date().toISOString(),
                    success,
                    difficulty,
                    metrics: { ...metrics },
                    challenge
                },
                ...(old.recent || [])
            ].slice(0, 30)
        };
        stats.averageTime = stats.totalTime / stats.played;
        stats.accuracy =
            stats.correct + stats.mistakes
                ? (100 * stats.correct) / (stats.correct + stats.mistakes)
                : null;
        data.games[id] = stats;
        if (writable)
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch {
                writable = false;
            }
        return stats;
    }
    function review(id, item, correct) {
        const stats = get(id) || {},
            reviews = { ...(stats.reviews || {}) },
            old = reviews[item] || { repetitions: 0, errors: 0 };
        const repetitions = correct ? positive(old.repetitions) + 1 : 0;
        reviews[item] = {
            repetitions,
            errors: positive(old.errors) + Number(!correct),
            due:
                Date.now() + (correct ? Math.min(30, repetitions * repetitions) * 86400000 : 600000)
        };
        data.games[id] = { ...stats, reviews };
        if (writable)
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch {
                writable = false;
            }
    }
    function remember(id, items) {
        const old = get(id) || {};
        const seenItems = Array.isArray(old.seenItems) ? old.seenItems : [];
        const incoming = items.filter((item) => typeof item === 'string' && item.length <= 40);
        data.games[id] = {
            ...old,
            seenItems: [
                ...new Set([...seenItems.filter((item) => !incoming.includes(item)), ...incoming])
            ].slice(-80)
        };
        if (writable)
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch {
                writable = false;
            }
    }
    function library() {
        const saved = data.library || {};
        const ids = (items) =>
            Array.isArray(items)
                ? [
                      ...new Set(
                          items.filter(
                              (id) => typeof id === 'string' && /^[a-z0-9_]{1,40}$/.test(id)
                          )
                      )
                  ].slice(0, 100)
                : [];
        return {
            favorites: ids(saved.favorites),
            recent: ids(saved.recent).slice(0, 12),
            setups:
                saved.setups && typeof saved.setups === 'object' && !Array.isArray(saved.setups)
                    ? structuredClone(saved.setups)
                    : {}
        };
    }
    function updateLibrary(patch) {
        data.library = { ...library(), ...patch };
        data.library = library();
        if (writable)
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch {
                writable = false;
            }
    }
    return Object.freeze({
        get,
        record,
        review,
        remember,
        library,
        updateLibrary,
        get writable() {
            return writable;
        }
    });
})();
const GameStats = Progress;
