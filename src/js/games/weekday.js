GameRegistry.register('weekday', (session) => {
    function init(config) {
        const days = [
                'Domingo',
                'Segunda-feira',
                'Terça-feira',
                'Quarta-feira',
                'Quinta-feira',
                'Sexta-feira',
                'Sábado'
            ],
            start = Number(config.options.startYear) || 1900,
            end = Number(config.options.endYear) || 2100;
        const leaps = (year) =>
            Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400);
        ChallengeRunner.quiz(session, config, {
            title: 'Dia da Semana',
            instructions:
                'Considere o calendário gregoriano. Depois da resposta, confira a contagem de dias e o resto da divisão por sete.',
            generate(index, random) {
                const year = random.int(start, end),
                    month = random.int(0, 11),
                    last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
                    day = random.int(1, last);
                const elapsed =
                        (year - 1900) * 365 +
                        leaps(year - 1) -
                        leaps(1899) +
                        Math.floor((Date.UTC(year, month, day) - Date.UTC(year, 0, 1)) / 86400000),
                    weekday = (elapsed + 1) % 7;
                return {
                    prompt: 'Que dia da semana foi ou será?',
                    visual: `<span>${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}</span>`,
                    correct: days[weekday],
                    options: days,
                    explanation: `1º de janeiro de 1900 foi uma segunda-feira. A data está ${elapsed.toLocaleString('pt-BR')} dias depois, incluindo anos bissextos. (1 + ${elapsed}) mod 7 = ${weekday}; 0 corresponde a domingo. Anos divisíveis por 100 só são bissextos se também forem divisíveis por 400.`
                };
            }
        });
    }
    return { init, destroy: session.destroy };
});
