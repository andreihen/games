# Jogos de cores

Dois jogos integrados à biblioteca em 7 de outubro de 2026.

## Ateliê de Cores

Inspirado na mecânica de [Guess mix do Trycolors](https://trycolors.com/games): combinar cores em proporções diferentes para alcançar uma cor alvo. Implementação local própria, com cinco rodadas, três avaliações por rodada, controles de adicionar/retirar gotas e receita revelada ao finalizar a rodada. O treino mostra a proximidade ao vivo; o desafio só a mostra ao avaliar.

Os alvos são gerados pela mesma função de mistura usada nos controles, a partir de receitas que podem ser reproduzidas com até 20 gotas por pigmento. As cinco cores são distintas durante cada partida. Fácil usa três pigmentos e duas cores na receita; dificuldades superiores acrescentam branco, preto e mais ingredientes. A precisão exigida cresce de 80% para 94%.

O modelo combina absorção de luz por canal, usando reflectância e a relação simplificada de Kubelka–Munk. É uma simulação para o jogo, sem calibração de pigmentos comerciais. Não utiliza a tecnologia proprietária do site de referência.

## Cor de Memória

Inspirado em [Color-toon do Dialed](https://dialed.gg/color2): lembrar a cor principal de personagens ou símbolos e reconstruí-la ajustando tonalidade, saturação e brilho. As 24 referências são desenhos vetoriais próprios e estilizados, distribuídos entre personagens, símbolos/marcas e natureza. Não foram incorporados arquivos dos sites de referência.

Cada partida sorteia cinco referências diferentes. Há modo de memória e modo observar/reproduzir. Neste último, a referência aparece por 3,5 segundos no Fácil e por 1,3 segundo no Especialista. Os controles ficam bloqueados durante a apresentação. Após confirmar, aparecem a comparação das cores, a ilustração de referência e os valores usados. Uma pista da família da cor desconta oito pontos da proximidade utilizada na pontuação.

As cores são referências editoriais fixas destas ilustrações. Variações de um personagem ou identidade visual podem ter outras cores.

## Pontuação e controles

Os dois jogos comparam as cores em CIELAB pela distância ΔE76. O indicador de proximidade é `máximo(0, arredondar(100 − ΔE))`; ele é uma regra de pontuação do jogo. Cada rodada concede dez pontos por unidade de proximidade. No Ateliê vale o melhor resultado das três avaliações; no Cor de Memória há uma confirmação por referência. A vitória depende da média das cinco rodadas alcançar o objetivo do nível.

Os botões funcionam por clique, toque, Tab e Enter. Os controles de cor são sliders nativos operáveis pelas setas do teclado. A plataforma preserva pausa, repetição por código de desafio, novas partidas e histórico.

## Verificações

`tests/colors.test.cjs` verifica propriedades da mistura e da conversão de cores, solução de cinco alvos nas quatro dificuldades, limite de avaliações, ausência de revelação prematura, referências sem repetição, pontuação, pausa e cancelamento de apresentação. As suítes gerais incluem ambos os jogos nas inicializações e verificações de publicação.
