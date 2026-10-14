// Original practice passages written for this collection; no third-party excerpts.
GameData.register('passages', {
    pt: [
        'A biblioteca da cidade guardava mapas de lugares que ninguém conhecia. Em uma tarde de chuva, Lia encontrou um desenho com uma ponte azul e decidiu procurar o rio. Levou uma lanterna, um caderno e uma pergunta: quem teria deixado aquele mapa entre as páginas?',
        'No jardim, cada estação muda o cenário. As folhas secas cobrem o caminho, pequenas sementes esperam a chuva e os pássaros escolhem outros galhos. Observar essas mudanças é um exercício de paciência: nem tudo acontece na velocidade que gostaríamos.',
        'Uma boa viagem começa com curiosidade. Às vezes, a descoberta está em uma rua que não aparece no roteiro, em uma conversa na estação ou em um prato cujo nome ainda não sabemos pronunciar. Planejar ajuda, mas deixar espaço para o inesperado também faz parte da aventura.',
        'O observatório abriu suas portas depois do pôr do sol. Enquanto os olhos se acostumavam à escuridão, a guia explicou que olhar para o céu também é olhar para o passado. Rafael ajustou o telescópio devagar e viu um pequeno disco brilhante, cercado por pontos de luz.',
        'Na cozinha, a receita parecia simples: misturar, esperar e assar. Mas a massa ensinou outra coisa. A temperatura da água, o tempo de descanso e até a pressa de abrir o forno mudavam o resultado. Na segunda tentativa, o pão ganhou uma crosta dourada e um perfume que tomou a casa.',
        'O campeonato de jogos de tabuleiro reuniu pessoas de todas as idades. Antes da primeira rodada, todos combinaram uma regra: explicar uma jogada era tão importante quanto vencer. Assim, cada partida terminava com novas ideias e vontade de tentar outra estratégia.',
        'A equipe atravessou a trilha em silêncio para ouvir a floresta. Havia gotas nas folhas, pegadas na terra e um som distante que ninguém identificou de imediato. Quando pararam para beber água, perceberam que a caminhada tinha revelado muito mais do que o destino prometia.',
        'Construir algo exige perguntas. Qual problema queremos resolver? Quem vai usar a solução? O que acontece quando uma tentativa falha? Testar uma ideia pequena, observar o resultado e fazer ajustes costuma ensinar mais do que esperar pela versão perfeita.',
        'Na praça, uma artista desenhava com giz colorido. As crianças inventaram nomes para as figuras, um senhor acrescentou uma estrela e outra pessoa sugeriu um caminho. Ao fim da tarde, o desenho já não tinha um único autor: era uma história construída em conjunto.',
        'O trem passou por campos, túneis e pequenas cidades. Pela janela, cada paisagem durava poucos segundos. Marina decidiu guardar detalhes em vez de fotografar tudo: a sombra de uma árvore, o vermelho de um telhado e o gesto de alguém acenando na plataforma.'
    ],
    en: [
        'The old station had a clock that was always five minutes early. Every morning, travelers compared it with their watches and smiled. One day, a child asked why nobody repaired it. The guard replied that a little extra time had saved more than one journey.',
        'A clear night is an invitation to look up. Some lights belong to nearby planets, while others began their journey long before we were born. Learning the names of a few constellations can turn an ordinary walk into a quiet adventure.',
        'Building a garden takes more than planting seeds. You need to notice where the sun reaches, how the water moves, and which plants enjoy the same conditions. Small observations make a difference, especially when the first attempt does not work.',
        'The museum offered visitors a blank notebook instead of a printed guide. They could draw an object, write a question, or invent a story about a painting. By the end of the visit, every notebook contained a different version of the same exhibition.',
        'At the table, everyone shared a different strategy for the puzzle. Some began with the corners, others looked for repeating patterns. When they combined their ideas, a difficult task became a conversation, and the final piece found its place.',
        'A short walk can change the rhythm of a busy day. Listen to the birds, notice the shapes of the clouds, and let your thoughts settle. You do not need to reach a special destination to return with something new.',
        'The lighthouse keeper recorded the weather every evening. Wind, rain, and waves filled the pages of a small book. Years later, those simple notes helped a young researcher understand how the coast had changed.',
        'Practice works best when the challenge is clear. Choose a task, take your time, and pay attention to the parts that need another try. Progress is often a collection of small improvements rather than a single dramatic moment.'
    ],
    code: [
        'function total(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}\nconst basket = [{ price: 12 }, { price: 8 }];\nconsole.log(total(basket));',
        'const scores = [10, 25, 18, 32];\nconst best = Math.max(...scores);\nconst average = scores.reduce((a, b) => a + b, 0) / scores.length;\nconsole.log({ best, average });',
        'function greet(name) {\n  if (!name) return "Hello, player!";\n  return "Hello, " + name + "!";\n}\nconst message = greet("Lia");\nconsole.log(message);',
        'const board = Array.from({ length: 9 }, () => null);\nfunction place(index, symbol) {\n  if (board[index] !== null) return false;\n  board[index] = symbol;\n  return true;\n}',
        'function distance(a, b) {\n  const dx = a.x - b.x;\n  const dy = a.y - b.y;\n  return Math.sqrt(dx * dx + dy * dy);\n}\nconsole.log(distance({ x: 0, y: 0 }, { x: 3, y: 4 }));',
        'const words = ["river", "cloud", "forest"];\nconst longest = words.reduce((a, b) => a.length >= b.length ? a : b);\nconst labels = words.map(word => word.toUpperCase());\nconsole.log(longest, labels);'
    ]
});
