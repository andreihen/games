# Jogos clássicos

Adicionados em 13 de outubro de 2026. Os quatro jogos estão na categoria Lógica e funcionam offline, inclusive na distribuição de arquivo único.

| Jogo | Pessoas no mesmo aparelho | Bot / níveis |
| --- | --- | --- |
| Xadrez | 2 | Fácil, médio, difícil e especialista; escolha entre brancas e pretas |
| Damas | 2 | Fácil, médio, difícil e especialista; escolha entre brancas e pretas |
| Campo Minado | 1 | Grades 9 × 9 / 10 minas, 12 × 12 / 24, 16 × 16 / 40 e 16 × 30 / 99 |
| Ludo | 1–4 pessoas, em partidas de 2–4 participantes | Vagas restantes são bots no nível escolhido |

Para Xadrez e Damas, selecione **2 pessoas no mesmo aparelho**. Para Ludo, escolha o total de participantes e o número de pessoas; se houver menos pessoas que participantes, o jogo preenche as vagas com bots. As pessoas jogam nas primeiras cores. A dificuldade só altera o bot quando há um adversário automático.

## Regras e controles

**Xadrez:** movimentos legais com proteção do rei, roque, en passant e promoção escolhida entre rainha, torre, bispo e cavalo. As casas permitidas são destacadas. Há xeque, mate, afogamento e empate por material insuficiente. Três repetições ou 50 lances sem captura/movimento de peão habilitam a reivindicação de empate na posição atual; cinco repetições ou 75 lances encerram automaticamente. A interface oferece virar o tabuleiro, histórico, capturas e desistência com confirmação em dois cliques. Não há relógio competitivo, reivindicação antecipada de empate por lance anunciado nem arbitragem de posições mortas além dos casos de material tratados pelo motor.

**Damas:** movimentação brasileira em 8 × 8, 12 peças por lado, capturas para os dois sentidos, damas voadoras e obrigatoriedade da sequência que captura mais peças. Cada salto é escolhido na interface; a vez passa ao terminar a cadeia. Peças capturadas bloqueiam a passagem até o fim da sequência. A coroação só ocorre ao terminar na última linha. Partidas casuais usam empate por três repetições ou 15 lances de damas por pessoa sem captura; contagens específicas dos finais de torneio não são aplicadas.

**Campo Minado:** primeiro clique e vizinhos sempre sem minas, abertura em cascata e vitória ao abrir todas as casas seguras. Marque bandeiras pelo botão de modo no toque, botão direito ou F sobre uma casa. Clicar em um número com o número correspondente de bandeiras abre as demais vizinhas; bandeiras incorretas podem explodir minas. As grades maiores rolam horizontalmente no celular. O cronômetro começa ao abrir a primeira casa e respeita a pausa; não há limite de tempo.

**Ludo:** percurso de 52 casas, quatro peões por participante, saída da base com 6, nova jogada com 6 e perda da vez antes de mover ao tirar três 6 seguidos. Casas com estrela são seguras; nas demais, capturas devolvem adversários à base. Chegada exige valor exato. Esta variante permite compartilhar casas, sem barreiras nem bônus por captura/chegada. Vence o primeiro a levar seus quatro peões à chegada.

Todos os tabuleiros usam botões com rótulos acessíveis. Enter/Espaço acionam o botão focado; Xadrez, Damas e Campo Minado também aceitam setas para navegar pelas casas.

## Bots

Xadrez e Damas usam busca minimax com poda alfa-beta e aprofundamento progressivo. Fácil escolhe movimentos legais aleatórios. Médio, difícil e especialista aumentam a profundidade e o orçamento de busca; a chance de uma escolha aleatória cai de 15% para 3% e 0%. A busca cede tempo ao navegador e respeita pausa e encerramento da sessão. O nível especialista é o mais forte deste motor local, sem classificação Elo ou equivalência com motores profissionais.

Ludo fácil escolhe um peão aleatoriamente. Médio prioriza chegadas, capturas e saída da base; difícil acrescenta segurança e ameaças; especialista pondera desenvolvimento e reta final. O dado tem distribuição idêntica em todos os níveis. Seeds reproduzem o sorteio quando a sequência de ações é a mesma.

## Referências das regras

- [Leis do Xadrez da FIDE](https://handbook.fide.com/chapter/e012023).
- [Damas brasileiras no Lidraughts](https://lidraughts.org/variant/brazilian) e [movimentos e capturas](https://lidraughts.org/variant/standard).
- [Regras do Ludo, Masters Traditional Games](https://www.mastersofgames.com/rules/ludo-rules-instructions-guide.htm); as escolhas de variante acima estão explícitas no jogo.

## Verificação

`tests/classics.test.cjs` verifica contagens conhecidas de movimentos do Xadrez (perft), regras especiais, mate/empates, capturas/coroação nas Damas, geração segura e finais do Campo Minado, capturas/segurança/chegada no Ludo, legalidade dos bots, cancelamento e partidas completas pela interface. O teste geral inclui os 61 jogos e a publicação testa o HTML autossuficiente.
