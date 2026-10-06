# Reformulação da coleção — 2 de outubro de 2026

Este relatório registra a primeira entrega da reformulação. A atualização posterior de UX, vocabulário e rejogabilidade está em [docs/UX_UI.md](docs/UX_UI.md); o catálogo completo e as ideias de expansão estão em [docs/CATALOGO_E_IDEIAS.md](docs/CATALOGO_E_IDEIAS.md).

As quatro fases do prompt foram implementadas no projeto existente: estrutura compartilhada, reformulação dos jogos atuais e inclusão dos 21 jogos novos. O catálogo final tem **41 jogos**, dos quais 40 participam da biblioteca principal e da Jornada. Resta Um permanece em Extras com tabuleiros procedurais. Sequência Rápida e Labirinto ficam preservados em `archive/`, sem entradas ativas.

## Estrutura compartilhada

O dashboard organiza sete categorias e mostra recordes locais. A configuração oferece quatro dificuldades, modos específicos e seed opcional; Simon mantém a progressão contínua de sua sequência. A geração usa aleatoriedade explícita com seed, incluindo embaralhamentos, estímulos e configurações de puzzles. Reproduzir exige a mesma versão, configuração e sequência de ações; a atualização de bancos de dados pode mudar o desafio de uma seed antiga.

“Mesmo desafio”, “Nova partida”, desafio diário e compartilhamento usam a mesma estrutura de configuração. Os perfis de revisão de Capitais e o WPM inicial de Chuva de Palavras são congelados nas opções de uma partida. A Jornada evita os três jogos recentes e a última categoria quando possível e não inclui Extras.

Uma sessão concentra o tempo ativo, os timers, animações, eventos, recursos de áudio e conclusão. Sair, reiniciar ou concluir destrói os recursos uma única vez. A pausa mantém os prazos relativos dos estímulos. Falhas assíncronas recebem tratamento no fluxo da aplicação. Não há bibliotecas remotas necessárias para jogar.

Os imports de CSS, scripts, jogos e bancos de dados carregam uma identificação de versão. Essa identificação corrigiu a reutilização de um dicionário antigo pelo navegador na prévia; o palpite “LIVRO” foi conferido na interface após a correção. O teclado de Termo mantém as três linhas QWERTY e a inicialização preserva a posição de leitura da página.

O placar compartilha sequência, erros, precisão e tempo; cada jogo define sua unidade de resposta. A conclusão de um puzzle sem respostas intermediárias conta como uma tentativa. Chuva de Palavras mede caracteres e WPM; Simon mantém o recorde de comprimento. A persistência v2 preserva os dados antigos, mantém 30 partidas recentes por jogo e evita sobrescrever saves desconhecidos.

## Jogos existentes reformulados

| Jogo                     | Resultado                                                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decifrando Cores         | Pistas agregadas de presença/posição, repetição controlada, formas + cores, regra de cores quentes e histórico temporário. Cada palpite registra uma tentativa.         |
| Apague as Luzes          | Cruz, diagonais, cruz longa e bordas conectadas; geração solucionável, cálculo do mínimo, medalhas e prévia sem gastar movimentos.                                      |
| Balança Lógica           | Pesagem livre, inclusive pratos com quantidades diferentes, peso real, histórico e dedução de objeto mais leve/pesado; 6/8/9/12 objetos conforme a dificuldade.         |
| Sudoku                   | Tabuleiro 9×9 único, técnicas graduadas, notas, conflitos, desfazer/refazer, apagar e dicas explicadas que podem ser aplicadas. Tempo de preparação excluído do placar. |
| Velha: Peças Móveis      | Três peças por jogador, remoção da mais antiga, idade visual, bot graduado e melhor de três. Busca Especialista limitada a 12 plies e 90 mil nós.                       |
| Inspetor de Símbolos     | Manual permanente com regras formais consistentes, exceções, casos válidos/inválidos e mudanças reais entre dias.                                                       |
| Bloco Fit                | Peças conectadas derivadas de uma cobertura, obstáculos nas dificuldades altas, giro, espelhamento, arraste e seleção por toque/teclado.                                |
| Chuva de Palavras        | Zen, sobrevivência, sprint e precisão; português, inglês e código, correção de digitação, WPM e adaptação limitada ao desempenho recente.                               |
| Jogo da Memória          | Pares clássicos ou associações por categorias, conceitos, inglês, matemática e símbolos. As cartas fechadas não revelam a resposta nos rótulos.                         |
| Trilha da Memória        | Trilha completa, atraso, bloqueios, interferência, rotação e teletransporte; entrada bloqueada durante a apresentação.                                                  |
| Prateleira da Memória    | Observação e cortina, 1/2/3/4 posições alteradas, inclusão/remoção/troca/cor/quantidade e restauração de ordem.                                                         |
| Arena de Cálculo         | Precisão, sobrevivência e sprint; dificuldade por quantidade de operações, divisão inteira, potência, combos e correção após erro.                                      |
| Simon Diz                | Sequência contínua, inversão, alternância e regras de posição; repetição da apresentação antes da resposta, som opcional e recorde local.                               |
| Conecte os Pontos        | Geração com cobertura completa conhecida, trajetos de comprimentos variados, arraste ou toque, retorno, desfazer e reinício de caminhos.                                |
| Diferenças               | Duas cenas SVG com 2/4/6/8 mudanças reais entre seis tipos, incluindo modo de memorizar a primeira cena.                                                                |
| Nonogram                 | Tabuleiros 5/6/8/10, pistas derivadas do desenho, pintar ou marcar X e aceitação de qualquer solução que satisfaça as pistas.                                           |
| Quebra-Cabeça Deslizante | Tabuleiros 2/3/4/5, embaralhamento por movimentos legais e controle por toque ou setas.                                                                                 |
| Torre de Hanói           | 3/4/6/8 discos, posições iniciais variadas e legais, objetivo e controles claros.                                                                                       |
| Impulso Certo            | Go/No-Go com alvo estático e ordem balanceada com seed, sem padrão fixo de respostas. Omissões e erros contam no resultado.                                             |
| Resta Um — Extras        | Layout e saltos reversos com seed, profundidade graduada e objetivo de uma peça; timer reiniciado por partida.                                                          |

## Jogos novos: fases 3 e 4

| Jogo                 | Mecânica implementada                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Termo                | Solo, dueto, quarteto e escada de 4 a 7 letras; letras repetidas tratadas por multiplicidade, teclado com estados acumulados, palavras inválidas sem consumir tentativa.              |
| Capitais             | Escolha ou digitação, filtros regionais, aliases em português/inglês e revisão espaçada.                                                                                              |
| Bandeiras            | Bandeira → país ou país → bandeira, 250 SVGs locais, rótulos acessíveis que não entregam a resposta.                                                                                  |
| Mapa-Múndi           | Localização, identificação, capital, continente, vizinhos cartográficos e oceanos; zoom, pan e ativação por teclado.                                                                  |
| Dia da Semana        | Datas gregorianas de 1900 a 2100 e explicação do cálculo, incluindo anos bissextos.                                                                                                   |
| Stroop               | Responder à palavra ou à cor conforme a regra atual, com mudança por blocos.                                                                                                          |
| Ordem das Cores      | Ordenar luminosidade, intensidade ou arco de matiz; cores convertidas para CIE Lab e distância mínima entre vizinhas.                                                                 |
| Cor Diferente        | Encontrar a célula com diferença de cor, com contraste ajustado após acertos.                                                                                                         |
| Matrizes             | Soma, multiplicação por escalar, determinantes 2×2/3×3, célula faltante, sistemas 2×2 e transformação de linha.                                                                       |
| Regra Mutante        | Regras formais mudam em blocos de 20 segundos; selecionar estímulos válidos e deixar passar os demais.                                                                                |
| N-Back               | N = 1/2/3, figuras, posições ou cores; aquecimento, respostas com prazo e sequência balanceada sem padrão fixo.                                                                       |
| Memória de Trabalho  | Observar números e responder em ordem inversa, crescente ou com soma dos extremos.                                                                                                    |
| Operador Mutante     | Símbolos de operações mudam de significado; expressões com dois/três operandos e parênteses.                                                                                          |
| Checklist de Memória | Memorizar requisitos de documentos, depois aprovar/reprovar pelos campos STL, antagonista, gengiva, imagem, biblioteca, ID e referência. Regras adicionadas, removidas ou invertidas. |
| Ordem Temporal       | Observar eventos e restaurar a ordem de figuras, palavras, números ou cores, com arraste ou botões.                                                                                   |
| Subitização          | Exposição breve de pontos sem sobreposição, seguida de máscara e resposta de quantidade.                                                                                              |
| Compare Expressões   | Comparar expressões com <, = ou >; igualdade presente no banco de questões.                                                                                                           |
| Estimativa Rápida    | Escolher a aproximação mais próxima de um produto, com alternativas distintas e sem empate.                                                                                           |
| Memória Espacial     | Posições, sequência, cores ou obstáculos; apresentação, ocultação e reprodução na grade.                                                                                              |
| Rotação Mental       | Figura conectada e assimétrica, uma rotação correta e alternativas espelhadas distintas.                                                                                              |
| Números Dinâmicos    | Responder à esquerda/direita por paridade, múltiplos de três ou primalidade, com regra por bloco e janela de resposta graduada.                                                       |

## Evidência de funcionamento

**45 grupos automatizados passaram:** 20 de jogos/algoritmos, 8 da plataforma, 12 de partidas completas e 5 do catálogo. As suítes verificam todos os 41 jogos nas quatro dificuldades, repetição por seed, cada valor individual das opções e destruição dos recursos. Essa cobertura não é o produto cartesiano de todas as opções.

As verificações incluem:

- 200 configurações deslizantes quanto à paridade; 200 gerações de Flow/Bloco Fit quanto à cobertura, conectividade, obstáculos e diversidade; 120 tabuleiros de Resta Um por reprodução independente de saltos.
- 12 Sudokus, três por dificuldade, com contagem independente de solução única, validação das deduções e confirmação de que técnicas inferiores não concluem as classes superiores.
- Cálculo independente do mínimo de Luzes nos quatro modificadores; resolução de partidas reais de Luzes, Balança, Flow, Hanói, Deslizante e Resta Um.
- 200 conjuntos de regras consistentes com exceções e evolução; 120 formas sem equivalência com reflexão; 120 rampas de cores e 400 cálculos de dia da semana.
- Partidas completas de cálculo, matrizes, comparação, estimativa, operador mutante, memória, prateleira, ordem temporal, memória espacial e todos os modos de Termo.
- 48 pares de cenas de Diferenças com contagem independente das alterações; respostas por observação real dos estímulos de N-Back e Números Dinâmicos; derrota por inação nos desafios com prazo.
- Migração e preservação de saves, histórico limitado, revisão espaçada, compartilhamento de configuração, Jornada, pausa, conclusão única e callbacks antigos.
- Entradas de digitação corrigíveis, letras repetidas no Termo, aliases de capitais, controles do mapa e arraste por eventos de ponteiro.

Os testes usam Node.js 24.18.0, jsdom 30.1.1 e relógio controlado; não substituem renderização. Os registros reproduzíveis estão em `tests/results/games.json`, `app.json`, `playthrough.json` e `catalog.json`. A inspeção do Chromium integrado, as larguras verificadas e as interações reais estão em `browser.json`.

## Dados, limites e continuidade

Os dados geográficos foram transformados de fontes versionadas. O mapa tem 177 feições em escala simplificada; os vizinhos nesse modo correspondem a bordas da cartografia incluída. Microestados sem contorno não entram nos desafios de localização. Atualizações sensíveis de capitais têm fontes registradas no próprio banco. A base é uma fotografia da coleta, não um serviço de atualizações contínuas.

O Termo utiliza uma seleção cotidiana para respostas e uma lista mais ampla para palpites. As 166.143 entradas foram expandidas de bases e afixos do VERO e validadas pelo Spylls antes da normalização. Isso não garante a inclusão de todo o português: nomes próprios, compostos e várias formas ficam fora. Fontes, modificações, avisos de licença e instruções de reconstrução acompanham `src/data-licenses/` e `THIRD_PARTY.md`.

Não houve validação em aparelhos físicos, Safari/Firefox, auditoria completa com leitor de tela, medição sistemática de FPS ou publicação em produção. O bot Especialista da Velha é uma busca limitada. Nonogram não exige solução única. O Sudoku pode precisar de alguns segundos para encontrar um tabuleiro da classe pedida. Os recordes são locais ao navegador e pontuações de jogos diferentes não têm escala equivalente.

Novas ideias podem ser integradas por uma fábrica registrada e metadados, usando seed, dificuldade, métricas e ciclo de vida compartilhados. Não é necessário reorganizar a plataforma para ampliar o catálogo.
