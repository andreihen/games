# Órbita — auditoria do catálogo e revisão da interface

12 de outubro de 2026. Inspeção do checkout local na branch `main`, HEAD `6ad6fb5`, com alterações anteriores ainda sem commit. A versão de assets desta entrega é `2026-10-12.1`. O site público não foi usado como substituto dos arquivos locais.

## Escopo e método

O pedido desta etapa autoriza a identidade, navegação, arena e feedback compartilhados. As mecânicas específicas serão discutidas separadamente: nenhum jogo foi adicionado, removido ou substituído nesta entrega. A avaliação lê configuração, fábricas, políticas de dificuldade, geradores, dados e testes; as fichas abaixo explicitam o objetivo configurado e o diagnóstico editorial.

Notas de 0 a 5: **R** regras, **M** mecânica, **D** desafio, **E** engajamento, **V** rejogabilidade, **N** níveis, **J** justiça, **U** mobile, **A** acessibilidade, **T** técnica, **I** identidade. E e V são hipóteses de design que exigem sessões com jogadores, não resultados de um estudo de usuários. U e A são avaliações iniciais por implementação: não atestam todos os dispositivos nem todos os modos. Notas técnicas consideram os testes executados, sem afirmar que eles medem diversão.

## Diagnóstico transversal

- **Novidade não é curadoria.** A ordem antiga colocava todas as entradas novas na frente, inclusive variações de sliders e jogos de comparação de atributos. A seleção Órbita agora começa com dedução, memória, planejamento e manipulação; favoritos, recentes e busca continuam disponíveis.
- **Tema não é mecânica.** Pokédex e Elemento compartilham `KnowledgeDeduction`, mudando só as propriedades consultadas. Precisam ser reimaginados antes de receber mais conteúdo.
- **Repetição de interação.** Há vários ciclos observar/ocultar/responder, muitos quizzes aritméticos e duas experiências próximas de memória de cor. A tabela identifica candidatos a consolidação futura; ninguém foi arquivado automaticamente.
- **Interface competia com o jogo.** Cartão central, HUD alto, seed visível, instruções extensas e margem externa consumiam a tela. Bandeiras herdava esse empilhamento. A arena agora ocupa a janela e organiza os quizzes com imagem adaptável e ações na região inferior.
- **Saída sem contexto.** `quit()` sempre mostrava a biblioteca. A navegação agora guarda as telas de origem, volta primeiro à anterior e restaura o contexto do catálogo.
- **Cor isolada não é feedback suficiente.** Respostas semânticas ganham símbolo e confirmação visual; o runner diferencia acerto/erro, bloqueia envios repetidos e preserva a explicação. Palpites informativos e caracteres digitados não ganham flashes a cada entrada.
- **Solução não mede dificuldade.** Geradores construtivos de Flow, Bloco Fit, Luzes e Soma Exata garantem validade, mas exigem avaliação própria de trivialidade e diversidade. Sudoku e Nonograma têm verificação de unicidade; Soma Exata aceita corretamente outras soluções.

## Matriz de avaliação

| Jogo | R | M | D | E | V | N | J | U | A | T | I | Decisão |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|

| Cor Relâmpago | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3 | 2 | 4 | 2 | AJUSTAR |

| Nota de Memória | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3 | 2 | 4 | 4 | AJUSTAR |

| Relógio Interno | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 4 | 3 | 4 | 4 | AJUSTAR |

| Forma de Memória | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3 | 3 | 4 | 3 | AJUSTAR |

| Padrão Partido | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | MANTER |

| Construtor de Ritmo | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | AJUSTAR |

| Ateliê de Cores | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 2 | 4 | 4 | AJUSTAR |

| Cor de Memória | 4 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | 2 | 4 | 2 | REIMAGINAR |

| Decifrando Cores | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 2 | 4 | 4 | MANTER |

| Apague as Luzes | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | MANTER |

| Balança Lógica | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 5 | MANTER |

| Sudoku | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | MANTER |

| Bloco Fit | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | AJUSTAR |

| Conecte os Pontos | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | AJUSTAR |

| Nonogram | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 2 | 3 | 4 | 4 | AJUSTAR |

| Quebra-Cabeça Deslizante | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 3 | 3 | AJUSTAR |

| Torre de Hanói | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 4 | 3 | 4 | AJUSTAR |

| Velha: Peças Móveis | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | MANTER |

| Jogo da Memória | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 3 | AJUSTAR |

| Simon Diz | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | MANTER |

| Trilha da Memória | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 3 | AJUSTAR |

| Prateleira da Memória | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | MANTER |

| Inspetor | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 3 | 4 | 3 | AJUSTAR |

| Qual a Diferença? | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 2 | 4 | 4 | MANTER |

| Impulso Certo | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | AJUSTAR |

| Arena de Cálculo | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3 | 4 | 4 | 3 | AJUSTAR |

| Chuva de Palavras | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | AJUSTAR |

| Resta Um | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 3 | 4 | AJUSTAR |

| Termo | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | MANTER |

| Capitais | 4 | 3 | 3 | 2 | 4 | 3 | 4 | 3 | 4 | 4 | 2 | REFATORAR |

| Bandeiras | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 4 | 3 | 4 | 3 | AJUSTAR |

| Mapa Mundi | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 | 5 | MANTER |

| Dia da Semana | 4 | 3 | 3 | 2 | 4 | 3 | 4 | 4 | 4 | 4 | 2 | REFATORAR |

| Cores: Stroop | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | 4 | 4 | MANTER |

| Ordenar Cores | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | 4 | 4 | MANTER |

| Cor Diferente | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 4 | 2 | 4 | 3 | AJUSTAR |

| Matriz Rápida | 3 | 4 | 4 | 2 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | AJUSTAR |

| Regra Mutante | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 3 | 4 | 3 | AJUSTAR |

| N-Back | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | AJUSTAR |

| Memória de Trabalho | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | AJUSTAR |

| Operador Mutante | 3 | 4 | 3 | 2 | 4 | 3 | 4 | 4 | 4 | 4 | 2 | REFATORAR |

| Checklist | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 3 | 4 | 3 | REFATORAR |

| Ordem Temporal | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 3 | 4 | 2 | AJUSTAR |

| Subitização | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | 4 | 4 | MANTER |

| Maior ou Menor | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 4 | 4 | 4 | 2 | AJUSTAR |

| Estimativa | 4 | 3 | 3 | 2 | 4 | 3 | 4 | 4 | 4 | 4 | 2 | REFATORAR |

| Memória Espacial | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 3 | 4 | 2 | AJUSTAR |

| Rotação Mental | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | MANTER |

| Par ou Ímpar Dinâmico | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | AJUSTAR |

| Linha do Tempo | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 4 | 4 | 4 | AJUSTAR |

| Quem Sou Eu? | 4 | 3 | 3 | 2 | 3 | 3 | 3 | 4 | 4 | 4 | 2 | REFATORAR |

| Conexões | 4 | 4 | 4 | 4 | 3 | 3 | 3 | 4 | 4 | 4 | 4 | AJUSTAR |

| Pokédex Misteriosa | 4 | 3 | 3 | 2 | 4 | 3 | 3 | 4 | 4 | 4 | 1 | REIMAGINAR |

| Elemento Secreto | 4 | 3 | 3 | 2 | 4 | 3 | 3 | 4 | 4 | 4 | 1 | REIMAGINAR |

| Equação Oculta | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | AJUSTAR |

| Soma Exata | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | AJUSTAR |


## Fichas por jogo

Os objetivos e modos abaixo vêm da configuração local, cruzada com o módulo indicado; o diagnóstico é uma avaliação, não uma aprovação automática. Todos usam `GameSession` para ciclo de vida e RNG com seed. Os arquivos citados contêm as condições implementadas e os testes do diretório `tests/` verificam seus cenários.


### Cor Relâmpago

**Função central:** Memória de cores. **Ação/objetivo declarado:** Observe uma cor e reconstrua o tom depois que ela desaparecer.

**Regras e conclusão configuradas:** Observe cada uma das cinco cores por alguns segundos. Reproduza tonalidade, saturação e brilho sem ver a referência. Depois de confirmar, compare sua resposta com o original.

**Dificuldade:** Fácil: Cinco cores novas; referência visível por 3.5 segundos; objetivo de 70% de proximidade.; Médio: Cinco cores novas; referência visível por 2.8 segundos; objetivo de 78% de proximidade.; Difícil: Cinco cores novas; referência visível por 2 segundos; objetivo de 85% de proximidade.; Especialista: Cinco cores novas; referência visível por 1.3 segundos; objetivo de 92% de proximidade.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/colorrecall.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** Reproduzir uma cor funciona, mas compartilha motor e ação central com Cor de Memória. Consolidar os dois se a diferença continuar apenas no estímulo.


### Nota de Memória

**Função central:** Memória auditiva. **Ação/objetivo declarado:** Ouça uma nota e reencontre sua altura pelo ouvido.

**Regras e conclusão configuradas:** Ative o áudio em Ouvir referência. Ajuste do grave ao agudo, ouça sua tentativa e confirme. Cinco notas por partida. No desafio a referência toca uma vez; no treino você pode ouvi-la novamente.

**Modos e escolhas:** Modo: Desafio: uma referência, Treino: ouvir novamente.

**Dificuldade:** Fácil: Cinco notas em 1 oitavas; objetivo de 70% de precisão.; Médio: Cinco notas em 1.5 oitavas; objetivo de 80% de precisão.; Difícil: Cinco notas em 2 oitavas; objetivo de 88% de precisão.; Especialista: Cinco notas em 3 oitavas; objetivo de 94% de precisão.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/soundrecall.js`. **Motores/dados diretos:** Perception.

**Diagnóstico — AJUSTAR:** A ação de ouvir e ajustar frequência é distinta. O slider contínuo pode virar busca por tentativa; esclarecer distância e preservar prática com referência.


### Relógio Interno

**Função central:** Percepção de tempo. **Ação/objetivo declarado:** Sinta a duração de um intervalo e reproduza sem cronômetro.

**Regras e conclusão configuradas:** Observe o círculo aceso. Em seguida toque uma vez para iniciar a reprodução e novamente para encerrá-la. Cinco intervalos por partida. A diferença em segundos aparece apenas depois da resposta.

**Dificuldade:** Fácil: Cinco intervalos de 0.8 a 2.5 segundos; objetivo de 70%.; Médio: Cinco intervalos de 1.2 a 4 segundos; objetivo de 80%.; Difícil: Cinco intervalos de 1.5 a 5.5 segundos; objetivo de 88%.; Especialista: Cinco intervalos de 2 a 7.5 segundos; objetivo de 94%.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/timerecall.js`. **Motores/dados diretos:** Perception.

**Diagnóstico — AJUSTAR:** Dois toques reproduzem uma duração. Mais variedade de contexto faria diferença além de trocar o número de segundos.


### Forma de Memória

**Função central:** Memória de formas. **Ação/objetivo declarado:** Reconstrua o tamanho e a rotação de uma forma.

**Regras e conclusão configuradas:** Observe uma forma e depois ajuste seu tamanho e rotação. A correção sobrepõe o contorno original. Rotações equivalentes pela simetria da forma recebem a mesma pontuação. Cinco formas por partida.

**Dificuldade:** Fácil: Cinco formas; exposição de 3.5 segundos; objetivo de 70%.; Médio: Cinco formas; exposição de 2.5 segundos; objetivo de 80%.; Difícil: Cinco formas; exposição de 1.8 segundos; objetivo de 88%.; Especialista: Cinco formas; exposição de 1.2 segundos; objetivo de 94%.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/shaperecall.js`. **Motores/dados diretos:** Perception.

**Diagnóstico — AJUSTAR:** Ângulo e tamanho exigem reconstrução, mas são dois sliders. As simetrias são consideradas; falta uma interação mais direta com a própria figura.


### Padrão Partido

**Função central:** Memória e manipulação. **Ação/objetivo declarado:** Memorize uma grade e desfaça as trocas que quebraram seu padrão.

**Regras e conclusão configuradas:** Observe a grade. Algumas peças trocam de lugar. Clique em duas peças para trocá-las de volta. Há cinco grades e três verificações por rodada. A precisão considera a restauração e o tempo; símbolos distinguem as cores.

**Dificuldade:** Fácil: Cinco grades de 3 × 3; 1 pares trocados e três verificações por grade.; Médio: Cinco grades de 4 × 4; 2 pares trocados e três verificações por grade.; Difícil: Cinco grades de 5 × 5; 3 pares trocados e três verificações por grade.; Especialista: Cinco grades de 6 × 6; 4 pares trocados e três verificações por grade.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/patternrepair.js`. **Motores/dados diretos:** Perception.

**Diagnóstico — MANTER:** Memorizar e desfazer trocas dá consequência visível às decisões. Preservar a manipulação; evitar grades finais desconfortáveis para toque.


### Construtor de Ritmo

**Função central:** Ritmo e coordenação. **Ação/objetivo declarado:** Reconstrua uma batida musical, uma faixa por vez.

**Regras e conclusão configuradas:** Ouça e observe uma faixa. A gravação começa após quatro batidas de preparação. Toque ou pressione Espaço no momento de cada nota. O resultado considera acertos, antecipações, atrasos e batidas extras. O modo visual funciona sem áudio.

**Modos e escolhas:** Apresentação: Som e indicador visual, Somente visual.

**Dificuldade:** Fácil: 2 faixas de 8 tempos; tolerância de 180 ms; objetivo de 70%.; Médio: 3 faixas de 12 tempos; tolerância de 140 ms; objetivo de 80%.; Difícil: 3 faixas de 16 tempos; tolerância de 110 ms; objetivo de 88%.; Especialista: 4 faixas de 16 tempos; tolerância de 80 ms; objetivo de 94%.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/temporebuild.js`. **Motores/dados diretos:** Perception.

**Diagnóstico — AJUSTAR:** Ritmo e gravação introduzem coordenação real. O fluxo observar/gravar/avaliar precisa continuar explícito; tolerância e latência precisam de validação em celulares reais.


### Ateliê de Cores

**Função central:** Experimentação de cores. **Ação/objetivo declarado:** Misture gotas de cor para alcançar um tom alvo.

**Regras e conclusão configuradas:** Adicione e retire gotas. Cada cor alvo é gerada por uma receita possível da paleta disponível. Há cinco rodadas e três avaliações por cor. No treino, a proximidade aparece enquanto você mistura.

**Modos e escolhas:** Modo: Desafio: avaliar a mistura, Treino: proximidade ao vivo.

**Dificuldade:** Fácil: 3 pigmentos disponíveis; receita de 10 gotas; objetivo de 80% de proximidade. Cinco cores por partida.; Médio: 4 pigmentos disponíveis; receita de 14 gotas; objetivo de 85% de proximidade. Cinco cores por partida.; Difícil: 5 pigmentos disponíveis; receita de 18 gotas; objetivo de 90% de proximidade. Cinco cores por partida.; Especialista: 5 pigmentos disponíveis; receita de 20 gotas; objetivo de 94% de proximidade. Cinco cores por partida.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/colormix.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** Receitas construtivas permitem experimentar sem alvo impossível. Mistura de pigmentos exige uma explicação própria; o resultado é um modelo de jogo, não uma previsão de tinta real.


### Cor de Memória

**Função central:** Memória de cores. **Ação/objetivo declarado:** Recrie as cores de personagens e símbolos de memória.

**Regras e conclusão configuradas:** Ajuste tonalidade, saturação e brilho para reproduzir a cor principal de uma ilustração. No modo observar, veja a referência antes de ela desaparecer. Após confirmar, compare as cores. As referências são versões estilizadas; há cinco itens diferentes por partida.

**Modos e escolhas:** Modo: De memória: sem ver a referência, Observar e reproduzir; Coleção: Tudo misturado, Personagens, Símbolos e marcas, Natureza.

**Dificuldade:** Fácil: Cinco ilustrações diferentes; objetivo de 70% de proximidade. Reproduza sem ver a cor de referência.; Médio: Cinco ilustrações diferentes; objetivo de 78% de proximidade. Reproduza sem ver a cor de referência.; Difícil: Cinco ilustrações diferentes; objetivo de 85% de proximidade. Reproduza sem ver a cor de referência.; Especialista: Cinco ilustrações diferentes; objetivo de 92% de proximidade. Reproduza sem ver a cor de referência.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/colormemory.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — REIMAGINAR:** O tema de personagens é atraente, mas 24 desenhos editoriais e sliders não garantem reconhecimento ou diversão. Poucas referências podem esgotar rápido; não ampliar só a quantidade.


### Decifrando Cores

**Função central:** Dedução de códigos. **Ação/objetivo declarado:** Dedução com pistas que não revelam posições.

**Regras e conclusão configuradas:** Monte um código. ● indica cor e posição; ○ indica correspondência em outra posição; × indica ausência de correspondência restante. As pistas são agregadas.

**Modos e escolhas:** Modo: Dedução, Formas + cores, Regra: sem quentes adjacentes, Histórico temporário.

**Dificuldade:** Fácil: 4 posições, 5 cores, 10 tentativas; sem cores repetidas.; Médio: 4 posições, 6 cores, 12 tentativas; cores podem se repetir.; Difícil: 5 posições, 7 cores, 14 tentativas; cores podem se repetir.; Especialista: 6 posições, 8 cores, 16 tentativas; cores podem se repetir.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/decode_colors.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — MANTER:** Dedução progressiva por feedback agregado oferece decisões. Cores exigem uma futura alternativa por símbolos sem revelar a solução.


### Apague as Luzes

**Função central:** Planejamento de movimentos. **Ação/objetivo declarado:** Planeje os movimentos para apagar o tabuleiro.

**Regras e conclusão configuradas:** Cada movimento altera a célula e suas vizinhas. A prévia mostra o efeito sem gastar movimentos.

**Modos e escolhas:** Regra: Cruz, Cruz + diagonais, Cruz longa, Bordas conectadas.

**Dificuldade:** Fácil: Grade 3 × 3; a regra de vizinhança depende do modo.; Médio: Grade 4 × 4; a regra de vizinhança depende do modo.; Difícil: Grade 5 × 5; a regra de vizinhança depende do modo.; Especialista: Grade 6 × 6; a regra de vizinhança depende do modo.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/lightsout.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — MANTER:** Cada clique muda vizinhos e deixa a consequência no tabuleiro. Geração por movimentos mantém solução; diferenças de modificador têm efeito real.


### Balança Lógica

**Função central:** Dedução por experimentos. **Ação/objetivo declarado:** Investigue um objeto de peso diferente.

**Regras e conclusão configuradas:** Distribua os objetos nos pratos e interprete o histórico. Fácil e Médio: o diferente é mais pesado. Nas demais dificuldades, pode ser mais leve ou pesado.

**Dificuldade:** Fácil: 6 objetos e 2 pesagens; o diferente é mais pesado.; Médio: 8 objetos e 2 pesagens; o diferente é mais pesado.; Difícil: 9 objetos e 3 pesagens; ele pode ser mais pesado ou mais leve.; Especialista: 12 objetos e 3 pesagens; ele pode ser mais pesado ou mais leve.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/mystery_scale.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — MANTER:** Experimentar pesagens separa hipóteses: é uma boa base de identidade própria. A quantidade de objetos e pesagens precisa continuar coerente com as variantes.


### Sudoku

**Função central:** Dedução numérica. **Ação/objetivo declarado:** Resolva pelas técnicas e entenda cada dica.

**Regras e conclusão configuradas:** Preencha de 1 a 9 sem repetir em linha, coluna ou região. Use notas e dicas explicadas.

**Modos e escolhas:** Candidatos automáticos: Desativados, Ativados; Limite de erros: Sem limite, 3 erros, 5 erros; Cronômetro: Mostrar, Ocultar.

**Dificuldade:** Fácil: A dificuldade depende das técnicas necessárias para resolver, com uma única solução.; Médio: A dificuldade depende das técnicas necessárias para resolver, com uma única solução.; Difícil: A dificuldade depende das técnicas necessárias para resolver, com uma única solução.; Especialista: A dificuldade depende das técnicas necessárias para resolver, com uma única solução.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/mini_sudoku.js`. **Motores/dados diretos:** SudokuEngine.

**Diagnóstico — MANTER:** Há solução única e técnicas de dica. Especialista em tela pequena ainda exige atenção ao tamanho das células; não reduzir tudo apenas para caber.


### Bloco Fit

**Função central:** Encaixe e rotação. **Ação/objetivo declarado:** Gire e arraste peças para preencher a área.

**Regras e conclusão configuradas:** Arraste com mouse ou toque. Também pode selecionar uma peça e depois a célula de origem. Gire com R; espelhe com F nas dificuldades maiores.

**Dificuldade:** Fácil: Tabuleiro 4 × 4, 0 obstáculos.; Médio: Tabuleiro 5 × 5, 1 obstáculos.; Difícil: Tabuleiro 6 × 6, 3 obstáculos, com espelhamento.; Especialista: Tabuleiro 7 × 7, 5 obstáculos, com espelhamento.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/blockfit.js`. **Motores/dados diretos:** GameAlgorithms.

**Diagnóstico — AJUSTAR:** Encaixar e girar peças é visual e construtivo. Preservar toque por seleção além de arrastar; disponibilidade de controles pesa mais que estética do painel.


### Conecte os Pontos

**Função central:** Planejamento espacial. **Ação/objetivo declarado:** Desenhe caminhos sem cruzamentos.

**Regras e conclusão configuradas:** Conecte pares da mesma cor e símbolo. Arraste ou toque nas células vizinhas. Preencha todas as casas e use desfazer quando precisar.

**Dificuldade:** Fácil: Grade 4 × 4 com 3 pares para conectar.; Médio: Grade 5 × 5 com 4 pares para conectar.; Difícil: Grade 6 × 6 com 5 pares para conectar.; Especialista: Grade 7 × 7 com 6 pares para conectar.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/flow.js`. **Motores/dados diretos:** GameAlgorithms.

**Diagnóstico — AJUSTAR:** Conectar pares sem cruzar gera planejamento espacial. A solução construtiva existe, mas isso não mede automaticamente a dificuldade humana; testar variedade de rotas.


### Nonogram

**Função central:** Dedução visual. **Ação/objetivo declarado:** Pistas numéricas revelam um desenho.

**Regras e conclusão configuradas:** Os números indicam grupos de células pintadas, separados por espaços. Use Pintar ou Marcar X. Todo tabuleiro tem solução única. No Fácil, o cruzamento das pistas permite resolver sem adivinhação.

**Dificuldade:** Fácil: Grade 5 × 5 com solução única. Resolúvel por cruzamento das pistas, sem adivinhação.; Médio: Grade 6 × 6 com solução única.; Difícil: Grade 8 × 8 com solução única.; Especialista: Grade 10 × 10 com solução única.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/nonogram.js`. **Motores/dados diretos:** NonogramEngine.

**Diagnóstico — AJUSTAR:** O solver verifica unicidade. A célula mínima de 28 px mais pistas laterais pode exceder 320 px em grades grandes; precisa de revisão própria de zoom/pan e toque.


### Quebra-Cabeça Deslizante

**Função central:** Planejamento espacial. **Ação/objetivo declarado:** Organize uma configuração nova a cada partida.

**Regras e conclusão configuradas:** Mova as peças vizinhas do espaço vazio por toque ou setas. Coloque os números em ordem.

**Dificuldade:** Fácil: Tabuleiro 2 × 2, embaralhado por movimentos válidos.; Médio: Tabuleiro 3 × 3, embaralhado por movimentos válidos.; Difícil: Tabuleiro 4 × 4, embaralhado por movimentos válidos.; Especialista: Tabuleiro 5 × 5, embaralhado por movimentos válidos.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/sliding_puzzle.js`. **Motores/dados diretos:** GameAlgorithms.

**Diagnóstico — AJUSTAR:** Movimentos legais garantem solvabilidade e há distância mínima no Fácil. O módulo ainda tem estrutura legada e parâmetros de tamanho; atualizar o componente sem trocar a mecânica.


### Torre de Hanói

**Função central:** Planejamento de movimentos. **Ação/objetivo declarado:** Reorganize discos a partir de posições variadas.

**Regras e conclusão configuradas:** Mova os discos para a última haste. Um disco maior nunca fica sobre um menor.

**Dificuldade:** Fácil: 3 discos em uma configuração válida e variada.; Médio: 4 discos em uma configuração válida e variada.; Difícil: 6 discos em uma configuração válida e variada.; Especialista: 8 discos em uma configuração válida e variada.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/hanoi_tower.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** Começar de estados legais variados melhora replay. Discos e seleção precisam manter legibilidade; mistura de wrappers antigos dificulta manutenção.


### Velha: Peças Móveis

**Função central:** Estratégia em turnos. **Ação/objetivo declarado:** Três peças e decisões que mudam a cada turno.

**Regras e conclusão configuradas:** Depois de três peças, a mais antiga é movida. A partida tem até três rodadas; quem perde a rodada começa a seguinte.

**Modos e escolhas:** Modo: Contra o bot, Duas pessoas.

**Dificuldade:** Fácil: Busca de até 4 jogadas; 70% de escolhas aleatórias pelo adversário.; Médio: Busca de até 6 jogadas; 35% de escolhas aleatórias pelo adversário.; Difícil: Busca de até 8 jogadas; 10% de escolhas aleatórias pelo adversário.; Especialista: Busca de até 12 jogadas; 0% de escolhas aleatórias pelo adversário.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/tiktaktoe.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — MANTER:** Remover a peça mais antiga muda a estratégia e diferencia da velha comum. Preservar a indicação de qual peça vai sair e o modo local.


### Jogo da Memória

**Função central:** Memória e associação. **Ação/objetivo declarado:** Combine imagens, conceitos e associações.

**Regras e conclusão configuradas:** Escolha entre encontrar pares e memorizar uma sequência de quadrados. Nas associações, combine coisas relacionadas: um país e sua capital, uma palavra e seu significado ou uma conta e seu resultado.

**Modos e escolhas:** Modo: Pares iguais, Sequência de quadrados, Associação, Conceitos, Inglês, Matemática, Símbolos; Categoria das associações: Todas, Mundo, Ciência, Cotidiano.

**Dificuldade:** Fácil: 6 pares; cartas incorretas ficam abertas por 1.1s. As associações dependem do modo escolhido.; Médio: 8 pares; cartas incorretas ficam abertas por 1s. As associações dependem do modo escolhido.; Difícil: 10 pares; cartas incorretas ficam abertas por 0.9s. As associações dependem do modo escolhido.; Especialista: 12 pares; cartas incorretas ficam abertas por 0.8s. As associações dependem do modo escolhido.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/memory_game.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** Pares e associações fazem sentido; o modo de sequência se sobrepõe à Trilha. Separar melhor os objetivos antes de acumular variantes.


### Simon Diz

**Função central:** Memória de sequência. **Ação/objetivo declarado:** Uma sequência que cresce a cada acerto.

**Regras e conclusão configuradas:** Observe os botões e repita. O replay está disponível apenas antes de começar a resposta. O modo inverso muda a regra.

**Modos e escolhas:** Modo: Clássico, Simon inverso; Som: Sem som, Com som.

**Dificuldade:** Fácil: A sequência cresce a cada acerto. O desafio não tem níveis fixos.; Médio: A sequência cresce a cada acerto. O desafio não tem níveis fixos.; Difícil: A sequência cresce a cada acerto. O desafio não tem níveis fixos.; Especialista: A sequência cresce a cada acerto. O desafio não tem níveis fixos.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/simonsays.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — MANTER:** Quatro setores, sequência crescente e inversão têm uma identidade reconhecível. Não substituir setores por um questionário ou controles genéricos.


### Trilha da Memória

**Função central:** Sequência e orientação. **Ação/objetivo declarado:** Observe os quadrados e repita a sequência.

**Regras e conclusão configuradas:** Os quadrados acendem e apagam um por vez. Depois, toque nas posições na mesma ordem. Os modos de direções, interferência e rotação mudam a forma de lembrar.

**Modos e escolhas:** Modo: Sequência de quadrados, Direções, Com distração, Grade girada.

**Dificuldade:** Fácil: 5 passos numa grade 4 × 4.; Médio: 8 passos numa grade 5 × 5.; Difícil: 11 passos numa grade 5 × 5.; Especialista: 14 passos numa grade 6 × 6.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/memorypath.js`. **Motores/dados diretos:** GameAlgorithms.

**Diagnóstico — AJUSTAR:** Repetir posições em ordem é claro. Transformações de direção e rotação justificam variantes; o modo simples coincide com Memória e Memória Espacial.


### Prateleira da Memória

**Função central:** Memória de objetos. **Ação/objetivo declarado:** Descubra alterações ou restaure a organização.

**Regras e conclusão configuradas:** Observe os objetos por cinco segundos. Depois identifique as posições que mudaram ou restaure a ordem original.

**Modos e escolhas:** Modo: O que mudou?, Restaurar a prateleira.

**Dificuldade:** Fácil: 4 objetos e 1 alterações no modo de mudanças.; Médio: 5 objetos e 2 alterações no modo de mudanças.; Difícil: 6 objetos e 3 alterações no modo de mudanças.; Especialista: 8 objetos e 4 alterações no modo de mudanças.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/memoryshelf.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — MANTER:** Objetos que mudam e cortina de observação tornam a memória concreta. Preservar a diferença entre detectar alteração e restaurar organização.


### Inspetor

**Função central:** Dedução de regras. **Ação/objetivo declarado:** Analise casos seguindo regras que mudam.

**Regras e conclusão configuradas:** Consulte o manual permanente. Aprove ou negue cada documento; novas diretrizes entram entre os dias.

**Dificuldade:** Fácil: 2 dias, 2 regras e 5 documentos por dia.; Médio: 3 dias, 3 regras e 6 documentos por dia.; Difícil: 4 dias, 4 regras e 7 documentos por dia.; Especialista: 4 dias, 5 regras e 8 documentos por dia.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/symbol_inspector.js`. **Motores/dados diretos:** RuleEngine.

**Diagnóstico — AJUSTAR:** Casos obedecem regras geradas e consistentes. A leitura de manuais compete com decisões rápidas; aproxima-se de Checklist e Regra Mutante.


### Qual a Diferença?

**Função central:** Comparação visual. **Ação/objetivo declarado:** Compare dois painéis e encontre as alterações.

**Regras e conclusão configuradas:** Marque no painel B os objetos diferentes, incluindo espaços de objetos removidos.

**Modos e escolhas:** Modo: Comparação, Memória visual.

**Dificuldade:** Fácil: 2 diferenças.; Médio: 4 diferenças.; Difícil: 6 diferenças.; Especialista: 8 diferenças, com alterações mais sutis.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/subtledifference.js`. **Motores/dados diretos:** RuleEngine.

**Diagnóstico — MANTER:** Comparar painéis e apontar diferenças é uma ação visual direta. Não depender só da cor; a variante de memória muda de fato o objetivo.


### Impulso Certo

**Função central:** Controle de impulsos. **Ação/objetivo declarado:** Responda ao alvo e ignore os distratores.

**Regras e conclusão configuradas:** Toque na área ou pressione Espaço apenas quando forma e cor correspondem ao alvo.

**Dificuldade:** Fácil: 20 estímulos; 1.5s para cada resposta.; Médio: 24 estímulos; 1.18s para cada resposta.; Difícil: 28 estímulos; 0.86s para cada resposta.; Especialista: 32 estímulos; 0.6s para cada resposta.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/rightimpulse.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** Responder ao alvo e ignorar distratores trabalha inibição. Módulo legado; tamanho da área de interação e bloqueio de toques repetidos merecem foco.


### Arena de Cálculo

**Função central:** Cálculo mental. **Ação/objetivo declarado:** Expressões mentais, combos e modos variados.

**Regras e conclusão configuradas:** Responda pelo teclado físico ou numérico. Erros quebram o combo, mas você pode continuar.

**Modos e escolhas:** Modo: Precisão, sem tempo, Sobrevivência, Sprint: 60 segundos.

**Dificuldade:** Fácil: 1 etapa por expressão e 10 respostas no modo de precisão.; Médio: 1 etapa por expressão e 12 respostas no modo de precisão.; Difícil: 2 etapas por expressão e 14 respostas no modo de precisão.; Especialista: 4 etapas por expressão e 16 respostas no modo de precisão.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/mental_math_trainer.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** A arena é o lugar natural para operações e combos. Excesso de minijogos aritméticos separados cria uma biblioteca maior sem mudar a ação central.


### Chuva de Palavras

**Função central:** Coordenação e digitação. **Ação/objetivo declarado:** Treine digitação com ritmo adaptativo.

**Regras e conclusão configuradas:** Chuva tranquila deixa as palavras caírem e esperarem na base; Sobrevivência tem cinco vidas; Sprint dura 60 segundos; Precisão mantém o alvo parado; Texto completo apresenta parágrafos para digitar. Corrija com Backspace. Nos modos de palavras, a meta é completar a quantidade indicada com 65% de precisão. O banco evita repetição até se esgotar; Amplo inclui flexões em português. Texto completo aceita correções e não tem prazo.

**Modos e escolhas:** Modo: Chuva tranquila, Sobrevivência, Sprint: 60 segundos, Texto completo, Precisão: sem queda; Vocabulário: Português, Inglês, Código; Banco de palavras: Cotidiano, Amplo: inclui flexões.

**Dificuldade:** Fácil: Palavras de até 4 caracteres; ritmo inicial de 18 WPM, com adaptação ao seu histórico.; Médio: Palavras de até 6 caracteres; ritmo inicial de 28 WPM, com adaptação ao seu histórico.; Difícil: Palavras de até 8 caracteres; ritmo inicial de 40 WPM, com adaptação ao seu histórico.; Especialista: Palavras de até 10 caracteres; ritmo inicial de 52 WPM, com adaptação ao seu histórico.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/wordrain.js`. **Motores/dados diretos:** GameData, ReplayEngine.

**Diagnóstico — AJUSTAR:** Queda, alvos e coordenação têm identidade. Texto completo é treino de outra natureza; deixar ambos reconhecíveis, e preservar o tempo de queda ao adaptar a altura da arena.


### Resta Um

**Função central:** Planejamento de saltos. **Ação/objetivo declarado:** Tabuleiros procedurais com solução válida.

**Regras e conclusão configuradas:** Salte sobre peças até restar uma. Esta variante fica fora da coleção principal.

**Dificuldade:** Fácil: Até 4 saltos na construção reversa do tabuleiro; 180s de limite.; Médio: Até 8 saltos na construção reversa do tabuleiro; 180s de limite.; Difícil: Até 13 saltos na construção reversa do tabuleiro; 150s de limite.; Especialista: Até 18 saltos na construção reversa do tabuleiro; 120s de limite.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/restaum.js`. **Motores/dados diretos:** GameAlgorithms.

**Diagnóstico — AJUSTAR:** Saltos e planejamento são diferentes dos quizzes. A geração reversa garante um caminho; controlar trivialidade e revisar o módulo legado.


### Termo

**Função central:** Dedução de palavras. **Ação/objetivo declarado:** Dedução de palavras em desafios variados.

**Regras e conclusão configuradas:** Descubra palavras de 4 a 7 letras usando as pistas. Escolha o vocabulário cotidiano ou o banco amplo. A dificuldade altera as tentativas; as palavras variam em todas as dificuldades. No dueto e quarteto, confira cada tabuleiro: o teclado reúne pistas.

**Modos e escolhas:** Modo: Uma palavra, Dueto, Quarteto, Escada; Letras: 4, 5, 6, 7; Banco de palavras: Cotidiano, Amplo: inclui flexões.

**Dificuldade:** Fácil: 8 tentativas na palavra solo; dueto e quarteto acrescentam tentativas. O vocabulário depende do banco escolhido.; Médio: 7 tentativas na palavra solo; dueto e quarteto acrescentam tentativas. O vocabulário depende do banco escolhido.; Difícil: 6 tentativas na palavra solo; dueto e quarteto acrescentam tentativas. O vocabulário depende do banco escolhido.; Especialista: 5 tentativas na palavra solo; dueto e quarteto acrescentam tentativas. O vocabulário depende do banco escolhido.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/termo.js`. **Motores/dados diretos:** GameData, ReplayEngine, VocabularyEngine.

**Diagnóstico — MANTER:** Feedback por letra e distribuição de palavras sustentam dedução. Muitos tabuleiros simultâneos exigem uma solução mobile própria; não colorir todo palpite válido como erro.


### Capitais

**Função central:** Associação geográfica. **Ação/objetivo declarado:** Associe países e capitais e reveja seus erros.

**Regras e conclusão configuradas:** Responda com alternativas ou digite a capital; acentos e aliases reconhecidos são aceitos. Todas as dificuldades usam o banco completo da região escolhida. As alternativas vêm da mesma área geográfica e a dificuldade altera sua quantidade e as rodadas.

**Modos e escolhas:** Modo: Alternativas, Digitação; Região: Mundo, Américas, Europa, África, Ásia, Oceania.

**Dificuldade:** Fácil: 10 rodadas; até 4 alternativas da mesma região. Todos os países elegíveis podem aparecer.; Médio: 12 rodadas; até 4 alternativas da mesma região. Todos os países elegíveis podem aparecer.; Difícil: 14 rodadas; até 6 alternativas da mesma região. Todos os países elegíveis podem aparecer.; Especialista: 16 rodadas; até 6 alternativas da mesma região. Todos os países elegíveis podem aparecer.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/capitals.js`. **Motores/dados diretos:** GameData, ChallengeRunner, ReplayEngine.

**Diagnóstico — REFATORAR:** O formato é principalmente pergunta/resposta. Revisão espaçada ajuda a aprender, mas não cria uma interação distinta; pensar numa associação espacial/manipulável em etapa própria.


### Bandeiras

**Função central:** Reconhecimento visual. **Ação/objetivo declarado:** Reconheça países e territórios por suas bandeiras.

**Regras e conclusão configuradas:** Identifique a bandeira com alternativas ou digite o país. Todas as dificuldades usam o banco completo da região escolhida. As alternativas priorizam países próximos e bandeiras parecidas; observe os detalhes.

**Modos e escolhas:** Modo: Bandeira → país: alternativas, Bandeira → país: digitado, País → bandeira; Categoria: Todos os países, Américas, Europa, África, Ásia, Oceania, Territórios e dependências.

**Dificuldade:** Fácil: 10 rodadas; até 4 alternativas plausíveis. Todos os países da categoria podem aparecer.; Médio: 12 rodadas; até 4 alternativas plausíveis. Todos os países da categoria podem aparecer.; Difícil: 14 rodadas; até 6 alternativas plausíveis. Todos os países da categoria podem aparecer.; Especialista: 16 rodadas; até 6 alternativas plausíveis. Todos os países da categoria podem aparecer.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/flags.js`. **Motores/dados diretos:** GameData, ChallengeRunner, ReplayEngine.

**Diagnóstico — AJUSTAR:** Reconhecimento visual combina com o tema; bandeira e resposta devem coexistir na tela. Corrigido nesta entrega no runner compartilhado. Novos modos precisam explorar observação, não só aumentar alternativas.


### Mapa Mundi

**Função central:** Orientação geográfica. **Ação/objetivo declarado:** Explore países, continentes, vizinhos e oceanos.

**Regras e conclusão configuradas:** Explore localização, capitais, continentes, vizinhos e oceanos. Todas as dificuldades variam os países; a dificuldade altera rodadas e alternativas. No modo digitado, Localizar pede o nome do país destacado. Use zoom para explorar áreas pequenas.

**Modos e escolhas:** Modo: Localizar país, País destacado, Capitais, Continentes, Vizinhos, Oceanos; Resposta: Mapa e alternativas, Digitado.

**Dificuldade:** Fácil: 8 explorações; até 4 alternativas. O modo digitado exige lembrar o nome.; Médio: 10 explorações; até 4 alternativas. O modo digitado exige lembrar o nome.; Difícil: 12 explorações; até 6 alternativas. O modo digitado exige lembrar o nome.; Especialista: 14 explorações; até 6 alternativas. O modo digitado exige lembrar o nome.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/worldmap.js`. **Motores/dados diretos:** GameData, ReplayEngine.

**Diagnóstico — MANTER:** Apontar no mapa e explorar vizinhanças integra conhecimento à ação. Zoom e pan continuam importantes; garantir que controles não cubram os países.


### Dia da Semana

**Função central:** Cálculo de calendário. **Ação/objetivo declarado:** Descubra o dia e confira a explicação do cálculo.

**Regras e conclusão configuradas:** Descubra o dia da semana de datas sorteadas no calendário gregoriano. Escolha uma resposta e confira o cálculo antes de avançar. O intervalo de anos é configurável.

**Modos e escolhas:** Ano inicial: 1900, 1950, 2000; Ano final: 2100, 2050, 2026.

**Dificuldade:** Fácil: 10 datas no intervalo de anos escolhido. A dificuldade aumenta a duração da partida.; Médio: 12 datas no intervalo de anos escolhido. A dificuldade aumenta a duração da partida.; Difícil: 14 datas no intervalo de anos escolhido. A dificuldade aumenta a duração da partida.; Especialista: 16 datas no intervalo de anos escolhido. A dificuldade aumenta a duração da partida.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/weekday.js`. **Motores/dados diretos:** ChallengeRunner.

**Diagnóstico — REFATORAR:** É cálculo de calendário apresentado como conhecimento. Pode ser um laboratório de técnica ou módulo de cálculo, em vez de mais um quiz independente.


### Cores: Stroop

**Função central:** Controle de atenção. **Ação/objetivo declarado:** Responda pela cor ou pela palavra conforme a regra.

**Regras e conclusão configuradas:** Siga a regra da rodada: responda pela cor da tinta ou pela palavra escrita. Nos níveis acima do Fácil, a regra alterna durante a partida. Confira o feedback e avance.

**Dificuldade:** Fácil: 10 rodadas; responda sempre pela cor da tinta.; Médio: 12 rodadas; a regra alterna a cada 4 rodadas.; Difícil: 14 rodadas; a regra alterna a cada 3 rodadas.; Especialista: 16 rodadas; a regra alterna a cada 2 rodadas.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/stroop.js`. **Motores/dados diretos:** ChallengeRunner.

**Diagnóstico — MANTER:** Conflito entre palavra e cor exige controle de atenção e tem identidade. A escolha de acessibilidade deve respeitar que distinguir cor faz parte do estímulo.


### Ordenar Cores

**Função central:** Discriminação de cores. **Ação/objetivo declarado:** Organize tonalidades com diferenças mensuráveis.

**Regras e conclusão configuradas:** Ordene as amostras pela luminosidade, saturação ou matiz indicada. Selecione e use os botões de movimento ou arraste. Verifique a ordem e confira a correção antes da próxima rampa.

**Modos e escolhas:** Modo: Claro → escuro, Quente → frio, Mais → menos saturada.

**Dificuldade:** Fácil: Seis rampas com 5 cores. A ordem depende de luminosidade, saturação ou matiz.; Médio: Seis rampas com 6 cores. A ordem depende de luminosidade, saturação ou matiz.; Difícil: Seis rampas com 7 cores. A ordem depende de luminosidade, saturação ou matiz.; Especialista: Seis rampas com 8 cores. A ordem depende de luminosidade, saturação ou matiz.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/colororder.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — MANTER:** Ordenar rampas com diferença mensurável é manipulação visual. Preservar ordenação por botões e arraste, sem limitar o feedback a números.


### Cor Diferente

**Função central:** Discriminação de cores. **Ação/objetivo declarado:** Encontre a célula diferente com contraste progressivo.

**Regras e conclusão configuradas:** Encontre a única célula de cor diferente em cada grade. O contraste diminui com a sequência de acertos. São quinze rodadas, com uma resposta por grade.

**Dificuldade:** Fácil: Quinze grades 3 × 3; contraste inicial de 15 pontos de luminosidade, reduzido com a sequência de acertos.; Médio: Quinze grades 4 × 4; contraste inicial de 12 pontos de luminosidade, reduzido com a sequência de acertos.; Difícil: Quinze grades 5 × 5; contraste inicial de 9 pontos de luminosidade, reduzido com a sequência de acertos.; Especialista: Quinze grades 6 × 6; contraste inicial de 7 pontos de luminosidade, reduzido com a sequência de acertos.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/oddcolor.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** Encontrar uma cor diferente é claro, mas a sequência ajusta principalmente contraste. A métrica perceptual evita igualdade; monitorar dificuldade conforme tela e visão do jogador.


### Matriz Rápida

**Função central:** Operações matriciais. **Ação/objetivo declarado:** Pequenos desafios de operações e transformações.

**Regras e conclusão configuradas:** Resolva o valor solicitado no modo escolhido: soma, escalar, determinante, elemento faltante, sistema ou transformação. Digite a resposta e confira a explicação após cada rodada.

**Modos e escolhas:** Modo: Soma, Escalar, Determinante, Elemento faltante, Sistema, Transformação.

**Dificuldade:** Fácil: 10 problemas; valores de 0 a 6. Determinantes usam 2 × 2; outros modos mantêm 2 × 2.; Médio: 12 problemas; valores de -6 a 9. Determinantes usam 2 × 2; outros modos mantêm 2 × 2.; Difícil: 14 problemas; valores de -6 a 12. Determinantes usam 3 × 3; outros modos mantêm 2 × 2.; Especialista: 16 problemas; valores de -6 a 15. Determinantes usam 3 × 3; outros modos mantêm 2 × 2.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/matrix.js`. **Motores/dados diretos:** ChallengeRunner.

**Diagnóstico — AJUSTAR:** Há conteúdo matemático real e modalidades diferentes. Visualizar a transformação em vez de apenas resolver entradas numéricas daria identidade mais forte.


### Regra Mutante

**Função central:** Flexibilidade de atenção. **Ação/objetivo declarado:** Acompanhe regras que mudam durante a partida.

**Regras e conclusão configuradas:** Clique somente nas figuras permitidas pelo manual atual. As regras mudam por blocos; acompanhe o aviso. Erros e alvos ignorados contam no resultado, e a falta de respostas não rende vitória.

**Dificuldade:** Fácil: Três blocos de 12 casos; 4.3s por caso. Acompanhe as alterações do manual.; Médio: Três blocos de 14 casos; 3.8s por caso. Acompanhe as alterações do manual.; Difícil: Três blocos de 16 casos; 3.4s por caso. Acompanhe as alterações do manual.; Especialista: Três blocos de 18 casos; 2.9s por caso. Acompanhe as alterações do manual.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/mutantrule.js`. **Motores/dados diretos:** RuleEngine.

**Diagnóstico — AJUSTAR:** Mudanças de regra são a ação central, não conhecimento temático. Há sobreposição com Inspetor e Checklist; melhorar a leitura da regra atual sem resolver a decisão.


### N-Back

**Função central:** Atualização de memória. **Ação/objetivo declarado:** Compare o estímulo atual com alguns passos atrás.

**Regras e conclusão configuradas:** Compare o estímulo atual com o de N posições atrás. Aguarde os primeiros N estímulos e responda igual ou diferente. Escolha N, tipo de estímulo e avanço manual ou automático.

**Modos e escolhas:** Distância: Pela dificuldade, 1-back, 2-back, 3-back; Estímulos: Figuras, Posições, Cores.

**Dificuldade:** Fácil: 1-back; 24 comparações. No modo manual, 5s para responder; ritmo automático separado.; Médio: 2-back; 24 comparações. No modo manual, 4s para responder; ritmo automático separado.; Difícil: 3-back; 24 comparações. No modo manual, 3s para responder; ritmo automático separado.; Especialista: 3-back; 24 comparações. No modo manual, 2.2s para responder; ritmo automático separado.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/nback.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** Comparar com N posições atrás é distinto de repetir uma sequência inteira. Precisa de tutorial demonstrável e não de promessas clínicas de melhora cognitiva.


### Memória de Trabalho

**Função central:** Manipulação mental. **Ação/objetivo declarado:** Guarde e transforme uma sequência de números.

**Regras e conclusão configuradas:** Memorize os números antes de serem ocultados. Depois, digite a transformação solicitada: inverter, ordenar ou calcular. A resposta só fica disponível após a observação.

**Modos e escolhas:** Modo: Ao contrário, Ordenar crescente, Primeiro + último.

**Dificuldade:** Fácil: 3 números; 4s para memorizar. A transformação depende do modo.; Médio: 4 números; 4s para memorizar. A transformação depende do modo.; Difícil: 6 números; 3.5s para memorizar. A transformação depende do modo.; Especialista: 8 números; 3s para memorizar. A transformação depende do modo.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/workingmemory.js`. **Motores/dados diretos:** ChallengeRunner.

**Diagnóstico — AJUSTAR:** Inverter ou manipular valores muda a exigência, mas o fluxo mostrar/ocultar/responder se repete no catálogo. Tornar a operação mental visível no feedback.


### Operador Mutante

**Função central:** Aplicação de regras. **Ação/objetivo declarado:** Calcule com símbolos cujo significado muda.

**Regras e conclusão configuradas:** Consulte o significado atual de cada símbolo e calcule a expressão. O significado muda durante a partida; o manual e a regra solicitada permanecem visíveis.

**Dificuldade:** Fácil: O significado dos operadores muda a cada 4 rodadas; uma operação por expressão.; Médio: O significado dos operadores muda a cada 3 rodadas; uma operação por expressão.; Difícil: O significado dos operadores muda a cada 2 rodadas; expressões com duas operações.; Especialista: O significado dos operadores muda a cada 1 rodada; expressões com duas operações.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/mutantoperator.js`. **Motores/dados diretos:** ChallengeRunner.

**Diagnóstico — REFATORAR:** Operadores com significado trocado adicionam regra ao cálculo. É candidato a modo da Arena; símbolos por si só não justificam outro jogo.


### Checklist

**Função central:** Memória de regras. **Ação/objetivo declarado:** Prepare equipes para missões com regras que mudam.

**Regras e conclusão configuradas:** Memorize os suprimentos exigidos e decida quais equipes estão prontas para sair. A próxima etapa acrescenta, remove ou inverte um requisito. Três decisões corretas seguidas rendem um bônus.

**Modos e escolhas:** Cenário: Expedição, Missão espacial, Oficina de poções.

**Dificuldade:** Fácil: 2 etapas, 2 suprimentos exigidos e 4 equipes por etapa. As exigências mudam entre etapas.; Médio: 3 etapas, 3 suprimentos exigidos e 6 equipes por etapa. As exigências mudam entre etapas.; Difícil: 4 etapas, 4 suprimentos exigidos e 6 equipes por etapa. As exigências mudam entre etapas.; Especialista: 4 etapas, 5 suprimentos exigidos e 8 equipes por etapa. As exigências mudam entre etapas.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/checklist.js`. **Motores/dados diretos:** RuleEngine.

**Diagnóstico — REFATORAR:** A missão é cenário para aplicar regras memorizadas. Ainda parece revisão de formulário; precisa de consequências dentro de um cenário manipulável.


### Ordem Temporal

**Função central:** Memória temporal. **Ação/objetivo declarado:** Restaure a ordem de eventos após observá-los.

**Regras e conclusão configuradas:** Observe a sequência de figuras, palavras, números ou cores. Depois, restaure a ordem usando seleção e botões ou arraste. Confira a sequência correta antes de avançar.

**Modos e escolhas:** Eventos: Figuras, Palavras, Números, Cores.

**Dificuldade:** Fácil: Seis rodadas: de 3 a 5 eventos; começa com 1000 ms por evento e acelera a cada rodada. Pausa de 0 ms antes de responder.; Médio: Seis rodadas: de 4 a 6 eventos; começa com 850 ms por evento e acelera a cada rodada. Pausa de 200 ms antes de responder.; Difícil: Seis rodadas: de 6 a 8 eventos; começa com 650 ms por evento e acelera a cada rodada. Pausa de 500 ms antes de responder.; Especialista: Seis rodadas: de 8 a 10 eventos; começa com 450 ms por evento e acelera a cada rodada. Pausa de 850 ms antes de responder.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/temporalorder.js`. **Motores/dados diretos:** GameData, ReplayEngine.

**Diagnóstico — AJUSTAR:** A ordem de apresentação importa e o banco de palavras varia. Diferenciar da Trilha por eventos/associações; não só trocar quadrados por palavras.


### Subitização

**Função central:** Percepção de quantidades. **Ação/objetivo declarado:** Perceba quantidades em uma apresentação breve.

**Regras e conclusão configuradas:** Observe brevemente os pontos antes de eles desaparecerem e escolha a quantidade vista. A dificuldade muda a quantidade máxima e o tempo de exposição.

**Dificuldade:** Fácil: De 1 a 4 pontos; apresentação de 1000 ms antes de ocultar.; Médio: De 1 a 6 pontos; apresentação de 700 ms antes de ocultar.; Difícil: De 1 a 9 pontos; apresentação de 450 ms antes de ocultar.; Especialista: De 1 a 12 pontos; apresentação de 300 ms antes de ocultar.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/subitizing.js`. **Motores/dados diretos:** ChallengeRunner.

**Diagnóstico — MANTER:** Quantidade vista rapidamente tem uma habilidade central clara. Manter tempo de exposição distinto da resposta e evitar estímulos parcialmente encobertos.


### Maior ou Menor

**Função central:** Comparação quantitativa. **Ação/objetivo declarado:** Compare expressões sem uma caixa de cálculo.

**Regras e conclusão configuradas:** Calcule os dois lados e escolha menor, igual ou maior. As três relações aparecem em quantidades equilibradas e ordem aleatória. Confira os valores após responder.

**Dificuldade:** Fácil: 10 comparações; expressões mais complexas conforme o nível e relações equilibradas em ordem aleatória.; Médio: 12 comparações; expressões mais complexas conforme o nível e relações equilibradas em ordem aleatória.; Difícil: 14 comparações; expressões mais complexas conforme o nível e relações equilibradas em ordem aleatória.; Especialista: 16 comparações; expressões mais complexas conforme o nível e relações equilibradas em ordem aleatória.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/compare.js`. **Motores/dados diretos:** ChallengeRunner.

**Diagnóstico — AJUSTAR:** Comparar expressões é válido, mas próximo de resolver cálculo. Melhor como modalidade bem diferenciada da Arena se continuar com o mesmo formulário.


### Estimativa

**Função central:** Estimativa numérica. **Ação/objetivo declarado:** Encontre a aproximação numérica mais adequada.

**Regras e conclusão configuradas:** Escolha a alternativa mais próxima do produto solicitado. Há uma única opção de menor distância; confira o resultado exato e a diferença após responder.

**Dificuldade:** Fácil: Produtos com fatores de 12–39 e 11–19; uma única alternativa mais próxima.; Médio: Produtos com fatores de 25–99 e 11–49; uma única alternativa mais próxima.; Difícil: Produtos com fatores de 80–299 e 11–99; uma única alternativa mais próxima.; Especialista: Produtos com fatores de 150–999 e 11–299; uma única alternativa mais próxima.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/estimate.js`. **Motores/dados diretos:** ChallengeRunner.

**Diagnóstico — REFATORAR:** Escolher uma aproximação numérica ainda é um quiz. Estimar quantidades ou magnitudes visualmente tornaria a ação mais própria do objetivo.


### Memória Espacial

**Função central:** Memória espacial. **Ação/objetivo declarado:** Reproduza células, cores e sequências de uma grade.

**Regras e conclusão configuradas:** Memorize os alvos na grade e reproduza posições, ordem ou cores conforme o modo. A resposta fica bloqueada durante a apresentação. Obstáculos não podem receber alvos.

**Modos e escolhas:** Modo: Posições, Sequência, Cores, Obstáculos.

**Dificuldade:** Fácil: 3 alvos numa grade 4 × 4; apresentação mais curta nos níveis altos.; Médio: 4 alvos numa grade 5 × 5; apresentação mais curta nos níveis altos.; Difícil: 6 alvos numa grade 6 × 6; apresentação mais curta nos níveis altos.; Especialista: 8 alvos numa grade 6 × 6; apresentação mais curta nos níveis altos.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/spatialmemory.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** Posições simultâneas e associação de cores diferem da sequência. A variante sequencial compete com Trilha e Memória; reduzir redundância sem remover agora.


### Rotação Mental

**Função central:** Rotação espacial. **Ação/objetivo declarado:** Distinga uma rotação de uma figura espelhada.

**Regras e conclusão configuradas:** Escolha a figura equivalente à referência após uma rotação. As demais alternativas são espelhadas. Uma figura espelhada não se transforma na referência apenas girando.

**Dificuldade:** Fácil: Figuras com até 5 células; 10 rodadas distinguindo rotação de espelhamento.; Médio: Figuras com até 6 células; 12 rodadas distinguindo rotação de espelhamento.; Difícil: Figuras com até 8 células; 14 rodadas distinguindo rotação de espelhamento.; Especialista: Figuras com até 10 células; 16 rodadas distinguindo rotação de espelhamento.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/mentalrotation.js`. **Motores/dados diretos:** ChallengeRunner.

**Diagnóstico — MANTER:** Separar rotação de espelhamento exige raciocínio espacial; os testes verificam a diferença. O estágio de imagem precisa ocupar o espaço restante.


### Par ou Ímpar Dinâmico

**Função central:** Classificação e atenção. **Ação/objetivo declarado:** Classifique números quando a regra muda.

**Regras e conclusão configuradas:** Classifique o número conforme a regra atual usando os botões ou as setas. A regra muda entre paridade, múltiplos de três e primalidade. Omissões e erros contam no resultado.

**Dificuldade:** Fácil: 18 números até 40; 5s por resposta e três regras ao longo da partida.; Médio: 24 números até 80; 4s por resposta e três regras ao longo da partida.; Difícil: 30 números até 130; 3s por resposta e três regras ao longo da partida.; Especialista: 36 números até 200; 2.2s por resposta e três regras ao longo da partida.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/dynamicnumbers.js`. **Motores/dados diretos:** RuleEngine.

**Diagnóstico — AJUSTAR:** Paridade, múltiplos e primalidade sob regra variável têm propósito de atenção. Distinguir da Regra Mutante, ou agrupar como desafios de classificação.


### Linha do Tempo

**Função central:** Ordenação histórica. **Ação/objetivo declarado:** Ordene os marcos da exploração espacial.

**Regras e conclusão configuradas:** Ordene os eventos do mais antigo ao mais recente. Selecione um cartão e use as setas ou arraste. As datas são reveladas após verificar. Os níveis aumentam a quantidade de eventos e aproximam as datas. Cinco rodadas por partida.

**Dificuldade:** Fácil: 4 eventos por rodada; eventos de um período mais amplo.; Médio: 5 eventos por rodada; eventos de um período mais amplo.; Difícil: 6 eventos por rodada; datas mais próximas.; Especialista: 7 eventos por rodada; datas mais próximas.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/timeline.js`. **Motores/dados diretos:** GameData, LearningEngine.

**Diagnóstico — AJUSTAR:** Manipular a ordem é melhor que um quiz de datas; o banco finito de 45 eventos espaciais limita replay de longo prazo. Aproximar datas é uma dificuldade legítima.


### Quem Sou Eu?

**Função central:** Inferência por pistas. **Ação/objetivo declarado:** Descubra identidades secretas por pistas progressivas.

**Regras e conclusão configuradas:** Digite a identidade usando as pistas. As primeiras pistas podem servir para mais de uma entidade; revele outras antes de arriscar. Menos pistas e menos erros rendem mais pontos. Acentos são opcionais. No Especialista, dois erros distintos revelam a resposta. Oito identidades por partida.

**Modos e escolhas:** Tema: Todos os temas, Sistema Solar, Matemática, Tecnologia.

**Dificuldade:** Fácil: 3 pistas iniciais; pontue mais revelando menos pistas.; Médio: 2 pistas iniciais; pontue mais revelando menos pistas.; Difícil: 1 pistas iniciais; pontue mais revelando menos pistas.; Especialista: 1 pistas iniciais; pontue mais revelando menos pistas. Dois erros distintos revelam a resposta.

**Controles:** teclado, toque. **Implementação:** `src/js/games/identity.js`. **Motores/dados diretos:** GameData, ReplayEngine.

**Diagnóstico — REFATORAR:** Pistas progressivas podem ser ambíguas cedo; pedir mais pistas faz parte. A ação continua digitar um fato conhecido, perto de outros jogos de atributos.


### Conexões

**Função central:** Relações entre palavras. **Ação/objetivo declarado:** Encontre quatro relações entre dezesseis termos.

**Regras e conclusão configuradas:** Forme quatro grupos de quatro termos. Selecione os cartões e confirme a relação. Cada acerto revela o tema e retira o grupo do tabuleiro. O Fácil revela uma pista temática. Você dispõe de 4, 4, 3 ou 2 erros conforme o nível; repetir uma combinação errada não consome outro erro.

**Dificuldade:** Fácil: 4 erros disponíveis; um tema é revelado como pista.; Médio: 4 erros disponíveis; descubra também os temas dos grupos.; Difícil: 3 erros disponíveis; descubra também os temas dos grupos.; Especialista: 2 erros disponíveis; descubra também os temas dos grupos.

**Controles:** mouse, teclado, toque. **Implementação:** `src/js/games/connections.js`. **Motores/dados diretos:** GameData, LearningEngine.

**Diagnóstico — AJUSTAR:** Formar grupos é uma ação distinta. 32 grupos editoriais podem ser memorizados; a geração combinar grupos não basta para eliminar toda relação alternativa plausível.


### Pokédex Misteriosa

**Função central:** Dedução de atributos. **Ação/objetivo declarado:** Encontre o Pokémon pelas comparações de tipos, geração e medidas.

**Regras e conclusão configuradas:** Digite nomes de Pokémon e combine as pistas. Setas apontam para o valor secreto. Tipos parciais são marcados com ≈. A consulta de candidatos está disponível. Os níveis ampliam as gerações e reduzem tentativas. Formas padrão, sem variantes regionais.

**Modos e escolhas:** Gerações: Conforme a dificuldade, Geração 1, Geração 2, Geração 3, Geração 4, Geração 5, Geração 6, Geração 7, Geração 8, Geração 9.

**Dificuldade:** Fácil: 10 tentativas; gerações 1 a 1. Consulta de candidatos disponível.; Médio: 9 tentativas; gerações 1 a 3. Consulta de candidatos disponível.; Difícil: 8 tentativas; gerações 1 a 6. Consulta de candidatos disponível.; Especialista: 7 tentativas; gerações 1 a 9. Consulta de candidatos disponível.

**Controles:** teclado, mouse, toque. **Implementação:** `src/js/games/pokemon.js`. **Motores/dados diretos:** GameData, KnowledgeDeduction.

**Diagnóstico — REIMAGINAR:** Comparar geração, tipos, altura e peso é o mesmo motor de Elemento. O tema não participa visualmente das decisões; consulta completa vira filtro de tabela. Tipos/equipe/experimentos são caminhos a avaliar, não implementar automaticamente.


### Elemento Secreto

**Função central:** Dedução de atributos. **Ação/objetivo declarado:** Investigue o elemento por número atômico, período e família.

**Regras e conclusão configuradas:** Digite nome ou símbolo e compare com o elemento secreto. A consulta de candidatos ajuda a aprender a tabela periódica. Níveis ampliam o banco de 20 para 118 elementos e reduzem tentativas.

**Dificuldade:** Fácil: 20 elementos; 9 tentativas.; Médio: 36 elementos; 8 tentativas.; Difícil: 86 elementos; 7 tentativas.; Especialista: 118 elementos; 6 tentativas.

**Controles:** teclado, mouse, toque. **Implementação:** `src/js/games/element.js`. **Motores/dados diretos:** GameData, KnowledgeDeduction.

**Diagnóstico — REIMAGINAR:** O número atômico com setas permite busca ordenada; o jogo pode ser vencido pesquisando a lista sem raciocínio químico. Um laboratório de relações seria mais coerente que mais perguntas.


### Equação Oculta

**Função central:** Dedução simbólica. **Ação/objetivo declarado:** Descubra uma igualdade usando pistas para cada caractere.

**Regras e conclusão configuradas:** Envie uma igualdade verdadeira. ✓ posição correta, ↔ outra posição, · ausente. Multiplicação e divisão têm prioridade. A igualdade precisa coincidir exatamente com a secreta; expressões equivalentes podem ser usadas como palpites. Níveis aumentam de cinco para oito caracteres.

**Dificuldade:** Fácil: 5 caracteres; 8 tentativas.; Médio: 6 caracteres; 7 tentativas.; Difícil: 7 caracteres; 6 tentativas.; Especialista: 8 caracteres; 6 tentativas.

**Controles:** teclado, mouse, toque. **Implementação:** `src/js/games/equation.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** Feedback por caracteres é uma mecânica válida. Exigir a sequência exata de uma igualdade equivalente é intencional, mas precisa ser evidente. Falta identidade além da referência conhecida.


### Soma Exata

**Função central:** Planejamento de somas. **Ação/objetivo declarado:** Retire números até todas as somas coincidirem.

**Regras e conclusão configuradas:** Clique em números para retirar ou recolocar. Cada borda mostra soma atual/meta. Todas as linhas e colunas precisam coincidir ao verificar. Tabuleiros são gerados com uma solução garantida; outras soluções válidas também são aceitas. Níveis aumentam a grade de 3×3 a 6×6.

**Dificuldade:** Fácil: Grade 3 × 3; somas de linhas e colunas.; Médio: Grade 4 × 4; somas de linhas e colunas.; Difícil: Grade 5 × 5; somas de linhas e colunas.; Especialista: Grade 6 × 6; somas de linhas e colunas.

**Controles:** teclado, mouse, toque. **Implementação:** `src/js/games/sumexact.js`. **Motores/dados diretos:** estado local da fábrica; sessão e gerador compartilhados.

**Diagnóstico — AJUSTAR:** Manipular células e observar somas é uma base boa e visual. Aceita soluções alternativas, corretamente; ter uma solução garantida não comprova unicidade nem dificuldade interessante.


## Critérios de aceitação desta interface

1. Sair da partida aberta pela configuração retorna à configuração; sair dela retorna ao catálogo com busca, categoria, filtro e ordenação anteriores. Acesso direto a uma partida retorna a sua configuração quando não há origem registrada.
2. A arena utiliza a altura disponível da janela e responde ao `visualViewport` quando disponível. No runner, Bandeiras digitado mantém a resposta e a ação na tela em 320, 390, 768 px e desktop.
3. Acerto e erro de resposta possuem símbolos, texto e estados visuais. Envios repetidos permanecem bloqueados; nova rodada/reinício limpa o estado.
4. O feedback central usa eventos de resposta, não cada caractere ou dedução intermediária. Sem animação de deslocamento quando o jogador prefere movimento reduzido.
5. Regras continuam acessíveis por Como jogar; seed e reinício ficam em Opções da partida; o botão de tela cheia utiliza a API do navegador quando suportada.
6. Estatísticas existentes usam as chaves antigas para preservar progresso. Não houve novo framework, serviço de imagens, backend ou dependência de produção.

## Limites e próxima etapa

O retorno restaura telas e configurações, não é um checkpoint universal de jogadas. Reabrir uma partida inicia a mesma seed como outra tentativa, salvo a sessão preservada pelo cache do navegador. Em puzzles grandes, a área de jogo pode rolar internamente: grades de Nonograma, múltiplos Termos e tabuleiros de níveis altos precisam de decisões de zoom/pan próprias, em vez de reduzir alvos de toque indiscriminadamente. A simulação de altura curta não substitui testes em Safari/Android com teclado virtual real.

Recomendação seguinte: reimaginar Pokémon com uma decisão visual que dependa de relações entre tipos ou formação de equipe, após selecionar uma proposta com o jogador; depois rever Elemento e consolidar as variações redundantes. Manter como referências internas Simon, Luzes, Balança, mapa, ordenação de cores e jogos de manipulação. A meta será fortalecer cada experiência, sem aumentar a contagem do catálogo.

## Alterações concretas e verificação

- `index.html`: nome Órbita, marca SVG própria, ícone local incorporado, cabeçalho compacto, opções recolhidas, botão de tela cheia e sinal de resultado.
- `src/js/main.js`: trilha de retorno de até 12 telas, restauração de contexto quando o URL corresponde ao desafio salvo, adaptação à altura visual da janela, habilidades nos cartões e feedback semântico.
- `src/js/core/interactions.js` e `challenges.js`: instruções recolhidas; runner com área central e faixa de resposta; estado explícito de acerto/erro e proteção contra nova edição após responder.
- `score.js` e `session.js`: eventos de resposta separados de entradas por caractere, preservando valores de pontuação e precisão.
- `library.js`: seleção editorial e indicação de habilidade; capas geográficas diferenciadas e novas ilustrações para modalidades matemáticas.
- `src/css/arcade.css`: arena, layouts responsivos, adaptação de painéis de comparação, cores, texto e feedback com movimento reduzido.
- `wordrain.js`: velocidade proporcional à altura real do campo, para adaptar a apresentação sem encurtar artificialmente o tempo de queda.
- `tests/orbita.test.cjs`: retorno por contexto, reabertura com o mesmo URL, preservação de busca/modo/seed, reset de feedback e distinção entre resposta e digitação.

A suíte existente com 91 grupos passou após as mudanças de estrutura. Os cinco grupos adicionais de Órbita passaram, assim como os testes de regressão de app e expansão após o ajuste da restauração por URL. No navegador, os 56 jogos foram inspecionados inicialmente em 390×740; houve nova conferência dos painéis que apresentaram rolagem. Bandeiras digitado foi verificado antes e depois da resposta em 320×740, 390×740, 768×900, 1280×720 e 390×390, mantendo campo e próxima rodada dentro da janela e sem rolagem horizontal. Os registros visuais ficam em `tests/results/browser-orbita.json`.

Esses testes verificam implementação e apresentação; não comprovam engajamento de longo prazo. Grades e modos avançados de cada jogo ainda precisam da revisão individual prevista no pedido.

Abrir as regras ou Opções da partida pausa a sessão. Estímulos ficam ocultos ou desfocados durante a consulta, para não transformar uma observação temporizada em referência ilimitada. Escape fecha a consulta antes de acionar a pausa manual; uma pausa manual já ativa é mantida.
