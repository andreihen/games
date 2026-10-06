const ScoreEngine = Object.freeze({
    create(now, changed = () => {}) {
        let score = 0,
            streak = 0,
            bestStreak = 0,
            correct = 0,
            mistakes = 0;
        const extras = {};
        const snapshot = () => ({
            score,
            streak,
            bestStreak,
            correct,
            mistakes,
            accuracy: correct + mistakes ? (100 * correct) / (correct + mistakes) : null,
            time: now(),
            ...extras
        });
        const api = {
            snapshot,
            answer(success, points = 100, countAttempt = true) {
                if (success) {
                    if (countAttempt) correct++;
                    streak++;
                    bestStreak = Math.max(bestStreak, streak);
                    score += Math.round(points * Math.min(4, streak));
                } else {
                    if (countAttempt) mistakes++;
                    streak = 0;
                }
                changed(snapshot());
            },
            attempt(success, amount = 1) {
                if (success) correct += amount;
                else {
                    mistakes += amount;
                    streak = 0;
                }
                changed(snapshot());
            },
            add(points) {
                score = Math.max(0, score + Math.round(points));
                changed(snapshot());
            },
            set(values) {
                for (const [key, value] of Object.entries(values))
                    if (
                        ![
                            'time',
                            'correct',
                            'mistakes',
                            'streak',
                            'bestStreak',
                            'score',
                            'accuracy'
                        ].includes(key)
                    )
                        extras[key] = value;
                changed(snapshot());
            }
        };
        return Object.freeze(api);
    },
    time(ms) {
        const seconds = Math.floor(Math.max(0, ms) / 1000);
        return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
});
