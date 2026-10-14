const GAMES_CONFIG = Object.freeze([
    {
        id: 'chess', name: 'Xadrez', file: 'chess.js', category: 'Lógica', icon: '♞',
        description: 'Proteja seu rei e planeje o próximo xeque-mate.',
        rules: 'Xadrez com roque, en passant e escolha de promoção. Jogue contra um bot em quatro níveis ou com outra pessoa no mesmo aparelho. Brancas começam; vença com xeque-mate.',
        options: [
            { key: 'mode', label: 'Participantes', values: [{ value: 'bot', label: 'Contra o bot' }, { value: 'friend', label: '2 pessoas no mesmo aparelho' }] },
            { key: 'side', label: 'Sua cor (contra o bot)', values: [{ value: 'white', label: 'Brancas' }, { value: 'black', label: 'Pretas' }] }
        ],
        primary: true, controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'draughts', name: 'Damas', file: 'draughts.js', category: 'Lógica', icon: '◉',
        description: 'Encadeie capturas e transforme suas pedras em damas.',
        rules: 'Damas brasileiras em tabuleiro 8 × 8. Capturas para frente e para trás são obrigatórias, pela sequência mais longa. Damas percorrem diagonais. Duas pessoas no mesmo aparelho ou bot em quatro níveis. Empates casuais por repetição ou 15 lances de damas por pessoa sem captura.',
        options: [
            { key: 'mode', label: 'Participantes', values: [{ value: 'bot', label: 'Contra o bot' }, { value: 'friend', label: '2 pessoas no mesmo aparelho' }] },
            { key: 'side', label: 'Sua cor (contra o bot)', values: [{ value: 'white', label: 'Brancas' }, { value: 'black', label: 'Pretas' }] }
        ],
        primary: true, controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'minesweeper', name: 'Campo Minado', file: 'minesweeper.js', category: 'Lógica', icon: '⚑',
        description: 'Leia os números, marque as minas e abra as casas seguras.',
        rules: 'Abra todas as casas sem minas. Números contam minas vizinhas; marque suspeitas com bandeiras. O primeiro clique e seus vizinhos são seguros. Use modo bandeira no toque, botão direito ou F no teclado. Quatro tamanhos conforme a dificuldade.',
        options: [], primary: true, controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'ludo', name: 'Ludo', file: 'ludo.js', category: 'Lógica', icon: '⚄',
        description: 'Uma corrida de quatro peões, capturas e decisões em família.',
        rules: 'De 2 a 4 participantes no mesmo aparelho, com pessoas e bots. Tire 6 para sair da base e jogar novamente; três 6 seguidos perdem a vez. Estrelas protegem de capturas. Sem barreiras nem bônus por captura. Chegue com valor exato e leve os quatro peões ao centro.',
        options: [
            { key: 'players', label: 'Total de participantes', values: [{ value: '2', label: '2 participantes' }, { value: '3', label: '3 participantes' }, { value: '4', label: '4 participantes' }] },
            { key: 'humans', label: 'Pessoas no aparelho (restante: bots)', values: [{ value: '1', label: '1 pessoa' }, { value: '2', label: '2 pessoas' }, { value: '3', label: '3 pessoas' }, { value: '4', label: '4 pessoas' }] }
        ],
        primary: true, controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'colorrecall',
        name: 'Cor Relâmpago',
        file: 'colorrecall.js',
        category: 'Memória',
        icon: '◓',
        description: 'Observe uma cor e reconstrua o tom depois que ela desaparecer.',
        rules: 'Observe cada uma das cinco cores por alguns segundos. Reproduza tonalidade, saturação e brilho sem ver a referência. Depois de confirmar, compare sua resposta com o original.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'soundrecall',
        name: 'Nota de Memória',
        file: 'soundrecall.js',
        category: 'Memória',
        icon: '♫',
        description: 'Ouça uma nota e reencontre sua altura pelo ouvido.',
        rules: 'Ative o áudio em Ouvir referência. Ajuste do grave ao agudo, ouça sua tentativa e confirme. Cinco notas por partida. No desafio a referência toca uma vez; no treino você pode ouvi-la novamente.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    { value: 'challenge', label: 'Desafio: uma referência' },
                    { value: 'practice', label: 'Treino: ouvir novamente' }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'timerecall',
        name: 'Relógio Interno',
        file: 'timerecall.js',
        category: 'Atenção',
        icon: '◷',
        description: 'Sinta a duração de um intervalo e reproduza sem cronômetro.',
        rules: 'Observe o círculo aceso. Em seguida toque uma vez para iniciar a reprodução e novamente para encerrá-la. Cinco intervalos por partida. A diferença em segundos aparece apenas depois da resposta.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'shaperecall',
        name: 'Forma de Memória',
        file: 'shaperecall.js',
        category: 'Memória',
        icon: '⬡',
        description: 'Reconstrua o tamanho e a rotação de uma forma.',
        rules: 'Observe uma forma e depois ajuste seu tamanho e rotação. A correção sobrepõe o contorno original. Rotações equivalentes pela simetria da forma recebem a mesma pontuação. Cinco formas por partida.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'patternrepair',
        name: 'Padrão Partido',
        file: 'patternrepair.js',
        category: 'Atenção',
        icon: '▦',
        description: 'Memorize uma grade e desfaça as trocas que quebraram seu padrão.',
        rules: 'Observe a grade. Algumas peças trocam de lugar. Clique em duas peças para trocá-las de volta. Há cinco grades e três verificações por rodada. A precisão considera a restauração e o tempo; símbolos distinguem as cores.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'temporebuild',
        name: 'Construtor de Ritmo',
        file: 'temporebuild.js',
        category: 'Atenção',
        icon: '♬',
        description: 'Reconstrua uma batida musical, uma faixa por vez.',
        rules: 'Ouça e observe uma faixa. A gravação começa após quatro batidas de preparação. Toque ou pressione Espaço no momento de cada nota. O resultado considera acertos, antecipações, atrasos e batidas extras. O modo visual funciona sem áudio.',
        options: [
            {
                key: 'sound',
                label: 'Apresentação',
                values: [
                    { value: 'on', label: 'Som e indicador visual' },
                    { value: 'off', label: 'Somente visual' }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'colormix',
        name: 'Ateliê de Cores',
        file: 'colormix.js',
        category: 'Atenção',
        icon: '◐',
        description: 'Misture gotas de cor para alcançar um tom alvo.',
        rules: 'Adicione e retire gotas. Cada cor alvo é gerada por uma receita possível da paleta disponível. Há cinco rodadas e três avaliações por cor. No treino, a proximidade aparece enquanto você mistura.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    { value: 'challenge', label: 'Desafio: avaliar a mistura' },
                    { value: 'guided', label: 'Treino: proximidade ao vivo' }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'colormemory',
        name: 'Cor de Memória',
        file: 'colormemory.js',
        category: 'Memória',
        icon: '◒',
        description: 'Recrie as cores de personagens e símbolos de memória.',
        rules: 'Ajuste tonalidade, saturação e brilho para reproduzir a cor principal de uma ilustração. No modo observar, veja a referência antes de ela desaparecer. Após confirmar, compare as cores. As referências são versões estilizadas; há cinco itens diferentes por partida.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    { value: 'memory', label: 'De memória: sem ver a referência' },
                    { value: 'study', label: 'Observar e reproduzir' }
                ]
            },
            {
                key: 'pack',
                label: 'Coleção',
                values: [
                    { value: 'mixed', label: 'Tudo misturado' },
                    { value: 'characters', label: 'Personagens' },
                    { value: 'logos', label: 'Símbolos e marcas' },
                    { value: 'nature', label: 'Natureza' }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'decode_colors',
        name: 'Decifrando Cores',
        file: 'decode_colors.js',
        category: 'Lógica',
        icon: '◉',
        description: 'Dedução com pistas que não revelam posições.',
        rules: 'Monte um código. ● indica cor e posição; ○ indica correspondência em outra posição; × indica ausência de correspondência restante. As pistas são agregadas.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'standard',
                        label: 'Dedução'
                    },
                    {
                        value: 'position',
                        label: 'Formas + cores'
                    },
                    {
                        value: 'rule',
                        label: 'Regra: sem quentes adjacentes'
                    },
                    {
                        value: 'memory',
                        label: 'Histórico temporário'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'lightsout',
        name: 'Apague as Luzes',
        file: 'lightsout.js',
        category: 'Lógica',
        icon: '☀',
        description: 'Planeje os movimentos para apagar o tabuleiro.',
        rules: 'Cada movimento altera a célula e suas vizinhas. A prévia mostra o efeito sem gastar movimentos.',
        options: [
            {
                key: 'modifier',
                label: 'Regra',
                values: [
                    {
                        value: 'cross',
                        label: 'Cruz'
                    },
                    {
                        value: 'diagonal',
                        label: 'Cruz + diagonais'
                    },
                    {
                        value: 'long',
                        label: 'Cruz longa'
                    },
                    {
                        value: 'torus',
                        label: 'Bordas conectadas'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'mystery_scale',
        name: 'Balança Lógica',
        file: 'mystery_scale.js',
        category: 'Lógica',
        icon: '⚖',
        description: 'Investigue um objeto de peso diferente.',
        rules: 'Distribua os objetos nos pratos e interprete o histórico. Fácil e Médio: o diferente é mais pesado. Nas demais dificuldades, pode ser mais leve ou pesado.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'mini_sudoku',
        name: 'Sudoku',
        file: 'mini_sudoku.js',
        category: 'Lógica',
        icon: '▦',
        description: 'Resolva pelas técnicas e entenda cada dica.',
        rules: 'Preencha de 1 a 9 sem repetir em linha, coluna ou região. Use notas e dicas explicadas.',
        options: [
            {
                key: 'autoCandidates',
                label: 'Candidatos automáticos',
                values: [
                    {
                        value: 'off',
                        label: 'Desativados'
                    },
                    {
                        value: 'on',
                        label: 'Ativados'
                    }
                ]
            },
            {
                key: 'errorLimit',
                label: 'Limite de erros',
                values: [
                    {
                        value: 'unlimited',
                        label: 'Sem limite'
                    },
                    {
                        value: '3',
                        label: '3 erros'
                    },
                    {
                        value: '5',
                        label: '5 erros'
                    }
                ]
            },
            {
                key: 'timer',
                label: 'Cronômetro',
                values: [
                    {
                        value: 'on',
                        label: 'Mostrar'
                    },
                    {
                        value: 'off',
                        label: 'Ocultar'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'blockfit',
        name: 'Bloco Fit',
        file: 'blockfit.js',
        category: 'Lógica',
        icon: '◩',
        description: 'Gire e arraste peças para preencher a área.',
        rules: 'Arraste com mouse ou toque. Também pode selecionar uma peça e depois a célula de origem. Gire com R; espelhe com F nas dificuldades maiores.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'flow',
        name: 'Conecte os Pontos',
        file: 'flow.js',
        category: 'Lógica',
        icon: '〰',
        description: 'Desenhe caminhos sem cruzamentos.',
        rules: 'Conecte pares da mesma cor e símbolo. Arraste ou toque nas células vizinhas. Preencha todas as casas e use desfazer quando precisar.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'nonogram',
        name: 'Nonogram',
        file: 'nonogram.js',
        category: 'Lógica',
        icon: '▤',
        description: 'Pistas numéricas revelam um desenho.',
        rules: 'Os números indicam grupos de células pintadas, separados por espaços. Use Pintar ou Marcar X. Todo tabuleiro tem solução única. No Fácil, o cruzamento das pistas permite resolver sem adivinhação.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'sliding_puzzle',
        name: 'Quebra-Cabeça Deslizante',
        file: 'sliding_puzzle.js',
        category: 'Lógica',
        icon: '🧩',
        description: 'Organize uma configuração nova a cada partida.',
        rules: 'Mova as peças vizinhas do espaço vazio por toque ou setas. Coloque os números em ordem.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'hanoi_tower',
        name: 'Torre de Hanói',
        file: 'hanoi_tower.js',
        category: 'Lógica',
        icon: '🗼',
        description: 'Reorganize discos a partir de posições variadas.',
        rules: 'Mova os discos para a última haste. Um disco maior nunca fica sobre um menor.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'tictactoe',
        name: 'Velha: Peças Móveis',
        file: 'tiktaktoe.js',
        category: 'Lógica',
        icon: '✕',
        description: 'Três peças e decisões que mudam a cada turno.',
        rules: 'Depois de três peças, a mais antiga é movida. A partida tem até três rodadas; quem perde a rodada começa a seguinte.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'bot',
                        label: 'Contra o bot'
                    },
                    {
                        value: 'friend',
                        label: 'Duas pessoas'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'memory_game',
        name: 'Jogo da Memória',
        file: 'memory_game.js',
        category: 'Memória',
        icon: '▣',
        description: 'Combine imagens, conceitos e associações.',
        rules: 'Escolha entre encontrar pares e memorizar uma sequência de quadrados. Nas associações, combine coisas relacionadas: um país e sua capital, uma palavra e seu significado ou uma conta e seu resultado.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'classic',
                        label: 'Pares iguais'
                    },
                    {
                        value: 'sequence',
                        label: 'Sequência de quadrados'
                    },
                    {
                        value: 'association',
                        label: 'Associação'
                    },
                    {
                        value: 'concepts',
                        label: 'Conceitos'
                    },
                    {
                        value: 'english',
                        label: 'Inglês'
                    },
                    {
                        value: 'math',
                        label: 'Matemática'
                    },
                    {
                        value: 'symbols',
                        label: 'Símbolos'
                    }
                ]
            },
            {
                key: 'category',
                label: 'Categoria das associações',
                values: [
                    {
                        value: 'mixed',
                        label: 'Todas'
                    },
                    {
                        value: 'world',
                        label: 'Mundo'
                    },
                    {
                        value: 'science',
                        label: 'Ciência'
                    },
                    {
                        value: 'daily',
                        label: 'Cotidiano'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'simonsays',
        name: 'Simon Diz',
        file: 'simonsays.js',
        category: 'Memória',
        icon: '♫',
        description: 'Uma sequência que cresce a cada acerto.',
        rules: 'Observe os botões e repita. O replay está disponível apenas antes de começar a resposta. O modo inverso muda a regra.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'classic',
                        label: 'Clássico'
                    },
                    {
                        value: 'inverse',
                        label: 'Simon inverso'
                    }
                ]
            },
            {
                key: 'sound',
                label: 'Som',
                values: [
                    {
                        value: 'off',
                        label: 'Sem som'
                    },
                    {
                        value: 'on',
                        label: 'Com som'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'memorypath',
        name: 'Trilha da Memória',
        file: 'memorypath.js',
        category: 'Memória',
        icon: '↟',
        description: 'Observe os quadrados e repita a sequência.',
        rules: 'Os quadrados acendem e apagam um por vez. Depois, toque nas posições na mesma ordem. Os modos de direções, interferência e rotação mudam a forma de lembrar.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'spatial',
                        label: 'Sequência de quadrados'
                    },
                    {
                        value: 'directions',
                        label: 'Direções'
                    },
                    {
                        value: 'interference',
                        label: 'Com distração'
                    },
                    {
                        value: 'rotation',
                        label: 'Grade girada'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'memoryshelf',
        name: 'Prateleira da Memória',
        file: 'memoryshelf.js',
        category: 'Memória',
        icon: '📚',
        description: 'Descubra alterações ou restaure a organização.',
        rules: 'Observe os objetos por cinco segundos. Depois identifique as posições que mudaram ou restaure a ordem original.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'changes',
                        label: 'O que mudou?'
                    },
                    {
                        value: 'restore',
                        label: 'Restaurar a prateleira'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'symbol_inspector',
        name: 'Inspetor',
        file: 'symbol_inspector.js',
        category: 'Atenção',
        icon: '⌕',
        description: 'Analise casos seguindo regras que mudam.',
        rules: 'Consulte o manual permanente. Aprove ou negue cada documento; novas diretrizes entram entre os dias.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'subtledifference',
        name: 'Qual a Diferença?',
        file: 'subtledifference.js',
        category: 'Atenção',
        icon: '◐',
        description: 'Compare dois painéis e encontre as alterações.',
        rules: 'Marque no painel B os objetos diferentes, incluindo espaços de objetos removidos.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'compare',
                        label: 'Comparação'
                    },
                    {
                        value: 'memory',
                        label: 'Memória visual'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'rightimpulse',
        name: 'Impulso Certo',
        file: 'rightimpulse.js',
        category: 'Atenção',
        icon: 'ϟ',
        description: 'Responda ao alvo e ignore os distratores.',
        rules: 'Toque na área ou pressione Espaço apenas quando forma e cor correspondem ao alvo.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'mental_math',
        name: 'Arena de Cálculo',
        file: 'mental_math_trainer.js',
        category: 'Matemática',
        icon: '±',
        description: 'Expressões mentais, combos e modos variados.',
        rules: 'Responda pelo teclado físico ou numérico. Erros quebram o combo, mas você pode continuar.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'precision',
                        label: 'Precisão, sem tempo'
                    },
                    {
                        value: 'survival',
                        label: 'Sobrevivência'
                    },
                    {
                        value: 'sprint',
                        label: 'Sprint: 60 segundos'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'wordrain',
        name: 'Chuva de Palavras',
        file: 'wordrain.js',
        category: 'Digitação e Palavras',
        icon: '⌨',
        description: 'Treine digitação com ritmo adaptativo.',
        rules: 'Chuva tranquila deixa as palavras caírem e esperarem na base; Sobrevivência tem cinco vidas; Sprint dura 60 segundos; Precisão mantém o alvo parado; Texto completo apresenta parágrafos para digitar. Corrija com Backspace. Nos modos de palavras, a meta é completar a quantidade indicada com 65% de precisão. O banco evita repetição até se esgotar; Amplo inclui flexões em português. Texto completo aceita correções e não tem prazo.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'zen',
                        label: 'Chuva tranquila'
                    },
                    {
                        value: 'survival',
                        label: 'Sobrevivência'
                    },
                    {
                        value: 'sprint',
                        label: 'Sprint: 60 segundos'
                    },
                    {
                        value: 'text',
                        label: 'Texto completo'
                    },
                    {
                        value: 'precision',
                        label: 'Precisão: sem queda'
                    }
                ]
            },
            {
                key: 'language',
                label: 'Vocabulário',
                values: [
                    {
                        value: 'pt',
                        label: 'Português'
                    },
                    {
                        value: 'en',
                        label: 'Inglês'
                    },
                    {
                        value: 'code',
                        label: 'Código'
                    }
                ]
            },
            {
                key: 'bank',
                label: 'Banco de palavras',
                values: [
                    {
                        value: 'common',
                        label: 'Cotidiano'
                    },
                    {
                        value: 'wide',
                        label: 'Amplo: inclui flexões'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'resta_um',
        name: 'Resta Um',
        file: 'restaum.js',
        category: 'Extras',
        icon: '●',
        description: 'Tabuleiros procedurais com solução válida.',
        rules: 'Salte sobre peças até restar uma. Esta variante fica fora da coleção principal.',
        options: [],
        primary: false,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'termo',
        name: 'Termo',
        file: 'termo.js',
        category: 'Digitação e Palavras',
        icon: '▧',
        description: 'Dedução de palavras em desafios variados.',
        rules: 'Descubra palavras de 4 a 7 letras usando as pistas. Escolha o vocabulário cotidiano ou o banco amplo. A dificuldade altera as tentativas; as palavras variam em todas as dificuldades. No dueto e quarteto, confira cada tabuleiro: o teclado reúne pistas.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'single',
                        label: 'Uma palavra'
                    },
                    {
                        value: 'duet',
                        label: 'Dueto'
                    },
                    {
                        value: 'quartet',
                        label: 'Quarteto'
                    },
                    {
                        value: 'ladder',
                        label: 'Escada'
                    }
                ]
            },
            {
                key: 'length',
                label: 'Letras',
                values: [
                    {
                        value: '4',
                        label: '4'
                    },
                    {
                        value: '5',
                        label: '5'
                    },
                    {
                        value: '6',
                        label: '6'
                    },
                    {
                        value: '7',
                        label: '7'
                    }
                ]
            },
            {
                key: 'bank',
                label: 'Banco de palavras',
                values: [
                    {
                        value: 'common',
                        label: 'Cotidiano'
                    },
                    {
                        value: 'wide',
                        label: 'Amplo: inclui flexões'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'capitals',
        name: 'Capitais',
        file: 'capitals.js',
        category: 'Conhecimento',
        icon: '◎',
        description: 'Associe países e capitais e reveja seus erros.',
        rules: 'Responda com alternativas ou digite a capital; acentos e aliases reconhecidos são aceitos. Todas as dificuldades usam o banco completo da região escolhida. As alternativas vêm da mesma área geográfica e a dificuldade altera sua quantidade e as rodadas.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'choices',
                        label: 'Alternativas'
                    },
                    {
                        value: 'typing',
                        label: 'Digitação'
                    }
                ]
            },
            {
                key: 'region',
                label: 'Região',
                values: [
                    {
                        value: 'World',
                        label: 'Mundo'
                    },
                    {
                        value: 'Americas',
                        label: 'Américas'
                    },
                    {
                        value: 'Europe',
                        label: 'Europa'
                    },
                    {
                        value: 'Africa',
                        label: 'África'
                    },
                    {
                        value: 'Asia',
                        label: 'Ásia'
                    },
                    {
                        value: 'Oceania',
                        label: 'Oceania'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'flags',
        name: 'Bandeiras',
        file: 'flags.js',
        category: 'Conhecimento',
        icon: '⚑',
        description: 'Reconheça países e territórios por suas bandeiras.',
        rules: 'Identifique a bandeira com alternativas ou digite o país. Todas as dificuldades usam o banco completo da região escolhida. As alternativas priorizam países próximos e bandeiras parecidas; observe os detalhes.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'country',
                        label: 'Bandeira → país: alternativas'
                    },
                    {
                        value: 'typing',
                        label: 'Bandeira → país: digitado'
                    },
                    {
                        value: 'flag',
                        label: 'País → bandeira'
                    }
                ]
            },
            {
                key: 'region',
                label: 'Categoria',
                values: [
                    {
                        value: 'World',
                        label: 'Todos os países'
                    },
                    {
                        value: 'Americas',
                        label: 'Américas'
                    },
                    {
                        value: 'Europe',
                        label: 'Europa'
                    },
                    {
                        value: 'Africa',
                        label: 'África'
                    },
                    {
                        value: 'Asia',
                        label: 'Ásia'
                    },
                    {
                        value: 'Oceania',
                        label: 'Oceania'
                    },
                    {
                        value: 'territories',
                        label: 'Territórios e dependências'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'worldmap',
        name: 'Mapa Mundi',
        file: 'worldmap.js',
        category: 'Conhecimento',
        icon: '🌍',
        description: 'Explore países, continentes, vizinhos e oceanos.',
        rules: 'Explore localização, capitais, continentes, vizinhos e oceanos. Todas as dificuldades variam os países; a dificuldade altera rodadas e alternativas. No modo digitado, Localizar pede o nome do país destacado. Use zoom para explorar áreas pequenas.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'locate',
                        label: 'Localizar país'
                    },
                    {
                        value: 'identify',
                        label: 'País destacado'
                    },
                    {
                        value: 'capital',
                        label: 'Capitais'
                    },
                    {
                        value: 'continent',
                        label: 'Continentes'
                    },
                    {
                        value: 'neighbors',
                        label: 'Vizinhos'
                    },
                    {
                        value: 'oceans',
                        label: 'Oceanos'
                    }
                ]
            },
            {
                key: 'answerMode',
                label: 'Resposta',
                values: [
                    {
                        value: 'choices',
                        label: 'Mapa e alternativas'
                    },
                    {
                        value: 'typing',
                        label: 'Digitado'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'weekday',
        name: 'Dia da Semana',
        file: 'weekday.js',
        category: 'Conhecimento',
        icon: '▦',
        description: 'Descubra o dia e confira a explicação do cálculo.',
        rules: 'Descubra o dia da semana de datas sorteadas no calendário gregoriano. Escolha uma resposta e confira o cálculo antes de avançar. O intervalo de anos é configurável.',
        options: [
            {
                key: 'startYear',
                label: 'Ano inicial',
                values: [
                    {
                        value: '1900',
                        label: '1900'
                    },
                    {
                        value: '1950',
                        label: '1950'
                    },
                    {
                        value: '2000',
                        label: '2000'
                    }
                ]
            },
            {
                key: 'endYear',
                label: 'Ano final',
                values: [
                    {
                        value: '2100',
                        label: '2100'
                    },
                    {
                        value: '2050',
                        label: '2050'
                    },
                    {
                        value: '2026',
                        label: '2026'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'stroop',
        name: 'Cores: Stroop',
        file: 'stroop.js',
        category: 'Atenção',
        icon: 'Aa',
        description: 'Responda pela cor ou pela palavra conforme a regra.',
        rules: 'Siga a regra da rodada: responda pela cor da tinta ou pela palavra escrita. Nos níveis acima do Fácil, a regra alterna durante a partida. Confira o feedback e avance.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'colororder',
        name: 'Ordenar Cores',
        file: 'colororder.js',
        category: 'Atenção',
        icon: '▥',
        description: 'Organize tonalidades com diferenças mensuráveis.',
        rules: 'Ordene as amostras pela luminosidade, saturação ou matiz indicada. Selecione e use os botões de movimento ou arraste. Verifique a ordem e confira a correção antes da próxima rampa.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'lightness',
                        label: 'Claro → escuro'
                    },
                    {
                        value: 'warmth',
                        label: 'Quente → frio'
                    },
                    {
                        value: 'saturation',
                        label: 'Mais → menos saturada'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'oddcolor',
        name: 'Cor Diferente',
        file: 'oddcolor.js',
        category: 'Atenção',
        icon: '▩',
        description: 'Encontre a célula diferente com contraste progressivo.',
        rules: 'Encontre a única célula de cor diferente em cada grade. O contraste diminui com a sequência de acertos. São quinze rodadas, com uma resposta por grade.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'matrix',
        name: 'Matriz Rápida',
        file: 'matrix.js',
        category: 'Matemática',
        icon: '[ ]',
        description: 'Pequenos desafios de operações e transformações.',
        rules: 'Resolva o valor solicitado no modo escolhido: soma, escalar, determinante, elemento faltante, sistema ou transformação. Digite a resposta e confira a explicação após cada rodada.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'addition',
                        label: 'Soma'
                    },
                    {
                        value: 'scalar',
                        label: 'Escalar'
                    },
                    {
                        value: 'determinant',
                        label: 'Determinante'
                    },
                    {
                        value: 'missing',
                        label: 'Elemento faltante'
                    },
                    {
                        value: 'system',
                        label: 'Sistema'
                    },
                    {
                        value: 'transform',
                        label: 'Transformação'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'mutantrule',
        name: 'Regra Mutante',
        file: 'mutantrule.js',
        category: 'Atenção',
        icon: '⇄',
        description: 'Acompanhe regras que mudam durante a partida.',
        rules: 'Clique somente nas figuras permitidas pelo manual atual. As regras mudam por blocos; acompanhe o aviso. Erros e alvos ignorados contam no resultado, e a falta de respostas não rende vitória.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'nback',
        name: 'N-Back',
        file: 'nback.js',
        category: 'Memória',
        icon: '↶',
        description: 'Compare o estímulo atual com alguns passos atrás.',
        rules: 'Compare o estímulo atual com o de N posições atrás. Aguarde os primeiros N estímulos e responda igual ou diferente. Escolha N, tipo de estímulo e avanço manual ou automático.',
        options: [
            {
                key: 'n',
                label: 'Distância',
                values: [
                    {
                        value: 'auto',
                        label: 'Pela dificuldade'
                    },
                    {
                        value: '1',
                        label: '1-back'
                    },
                    {
                        value: '2',
                        label: '2-back'
                    },
                    {
                        value: '3',
                        label: '3-back'
                    }
                ]
            },
            {
                key: 'stimulus',
                label: 'Estímulos',
                values: [
                    {
                        value: 'figures',
                        label: 'Figuras'
                    },
                    {
                        value: 'positions',
                        label: 'Posições'
                    },
                    {
                        value: 'colors',
                        label: 'Cores'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'workingmemory',
        name: 'Memória de Trabalho',
        file: 'workingmemory.js',
        category: 'Memória',
        icon: '≋',
        description: 'Guarde e transforme uma sequência de números.',
        rules: 'Memorize os números antes de serem ocultados. Depois, digite a transformação solicitada: inverter, ordenar ou calcular. A resposta só fica disponível após a observação.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'reverse',
                        label: 'Ao contrário'
                    },
                    {
                        value: 'sort',
                        label: 'Ordenar crescente'
                    },
                    {
                        value: 'sum',
                        label: 'Primeiro + último'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'mutantoperator',
        name: 'Operador Mutante',
        file: 'mutantoperator.js',
        category: 'Matemática',
        icon: '▲',
        description: 'Calcule com símbolos cujo significado muda.',
        rules: 'Consulte o significado atual de cada símbolo e calcule a expressão. O significado muda durante a partida; o manual e a regra solicitada permanecem visíveis.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'checklist',
        name: 'Checklist',
        file: 'checklist.js',
        category: 'Atenção',
        icon: '✓',
        description: 'Prepare equipes para missões com regras que mudam.',
        rules: 'Memorize os suprimentos exigidos e decida quais equipes estão prontas para sair. A próxima etapa acrescenta, remove ou inverte um requisito. Três decisões corretas seguidas rendem um bônus.',
        options: [
            {
                key: 'theme',
                label: 'Cenário',
                values: [
                    { value: 'expedition', label: 'Expedição' },
                    { value: 'space', label: 'Missão espacial' },
                    { value: 'potions', label: 'Oficina de poções' }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'temporalorder',
        name: 'Ordem Temporal',
        file: 'temporalorder.js',
        category: 'Memória',
        icon: '⇥',
        description: 'Restaure a ordem de eventos após observá-los.',
        rules: 'Observe a sequência de figuras, palavras, números ou cores. Depois, restaure a ordem usando seleção e botões ou arraste. Confira a sequência correta antes de avançar.',
        options: [
            {
                key: 'stimulus',
                label: 'Eventos',
                values: [
                    {
                        value: 'figures',
                        label: 'Figuras'
                    },
                    {
                        value: 'words',
                        label: 'Palavras'
                    },
                    {
                        value: 'numbers',
                        label: 'Números'
                    },
                    {
                        value: 'colors',
                        label: 'Cores'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'subitizing',
        name: 'Subitização',
        file: 'subitizing.js',
        category: 'Matemática',
        icon: '⠿',
        description: 'Perceba quantidades em uma apresentação breve.',
        rules: 'Observe brevemente os pontos antes de eles desaparecerem e escolha a quantidade vista. A dificuldade muda a quantidade máxima e o tempo de exposição.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'compare',
        name: 'Maior ou Menor',
        file: 'compare.js',
        category: 'Matemática',
        icon: '≷',
        description: 'Compare expressões sem uma caixa de cálculo.',
        rules: 'Calcule os dois lados e escolha menor, igual ou maior. As três relações aparecem em quantidades equilibradas e ordem aleatória. Confira os valores após responder.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'estimate',
        name: 'Estimativa',
        file: 'estimate.js',
        category: 'Matemática',
        icon: '≈',
        description: 'Encontre a aproximação numérica mais adequada.',
        rules: 'Escolha a alternativa mais próxima do produto solicitado. Há uma única opção de menor distância; confira o resultado exato e a diferença após responder.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'spatialmemory',
        name: 'Memória Espacial',
        file: 'spatialmemory.js',
        category: 'Memória',
        icon: '▦',
        description: 'Reproduza células, cores e sequências de uma grade.',
        rules: 'Memorize os alvos na grade e reproduza posições, ordem ou cores conforme o modo. A resposta fica bloqueada durante a apresentação. Obstáculos não podem receber alvos.',
        options: [
            {
                key: 'mode',
                label: 'Modo',
                values: [
                    {
                        value: 'positions',
                        label: 'Posições'
                    },
                    {
                        value: 'sequence',
                        label: 'Sequência'
                    },
                    {
                        value: 'colors',
                        label: 'Cores'
                    },
                    {
                        value: 'obstacles',
                        label: 'Obstáculos'
                    }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'mentalrotation',
        name: 'Rotação Mental',
        file: 'mentalrotation.js',
        category: 'Lógica',
        icon: '⤾',
        description: 'Distinga uma rotação de uma figura espelhada.',
        rules: 'Escolha a figura equivalente à referência após uma rotação. As demais alternativas são espelhadas. Uma figura espelhada não se transforma na referência apenas girando.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'dynamicnumbers',
        name: 'Par ou Ímpar Dinâmico',
        file: 'dynamicnumbers.js',
        category: 'Atenção',
        icon: '⇆',
        description: 'Classifique números quando a regra muda.',
        rules: 'Classifique o número conforme a regra atual usando os botões ou as setas. A regra muda entre paridade, múltiplos de três e primalidade. Omissões e erros contam no resultado.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'timeline',
        name: 'Linha do Tempo',
        file: 'timeline.js',
        category: 'Conhecimento',
        icon: '↗',
        description: 'Ordene os marcos da exploração espacial.',
        rules: 'Ordene os eventos do mais antigo ao mais recente. Selecione um cartão e use as setas ou arraste. As datas são reveladas após verificar. Os níveis aumentam a quantidade de eventos e aproximam as datas. Cinco rodadas por partida.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'identity',
        name: 'Quem Sou Eu?',
        file: 'identity.js',
        category: 'Conhecimento',
        icon: '?',
        description: 'Descubra identidades secretas por pistas progressivas.',
        rules: 'Digite a identidade usando as pistas. As primeiras pistas podem servir para mais de uma entidade; revele outras antes de arriscar. Menos pistas e menos erros rendem mais pontos. Acentos são opcionais. No Especialista, dois erros distintos revelam a resposta. Oito identidades por partida.',
        options: [
            {
                key: 'theme',
                label: 'Tema',
                values: [
                    { value: 'all', label: 'Todos os temas' },
                    { value: 'space', label: 'Sistema Solar' },
                    { value: 'math', label: 'Matemática' },
                    { value: 'tech', label: 'Tecnologia' }
                ]
            }
        ],
        primary: true,
        controls: ['teclado', 'toque']
    },
    {
        id: 'connections',
        name: 'Conexões',
        file: 'connections.js',
        category: 'Conhecimento',
        icon: '▦',
        description: 'Encontre quatro relações entre dezesseis termos.',
        rules: 'Forme quatro grupos de quatro termos. Selecione os cartões e confirme a relação. Cada acerto revela o tema e retira o grupo do tabuleiro. O Fácil revela uma pista temática. Você dispõe de 4, 4, 3 ou 2 erros conforme o nível; repetir uma combinação errada não consome outro erro.',
        options: [],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    },
    {
        id: 'pokemon',
        name: 'Pokédex Misteriosa',
        file: 'pokemon.js',
        category: 'Conhecimento',
        icon: '◉',
        description: 'Encontre o Pokémon pelas comparações de tipos, geração e medidas.',
        rules: 'Digite nomes de Pokémon e combine as pistas. Setas apontam para o valor secreto. Tipos parciais são marcados com ≈. A consulta de candidatos está disponível. Os níveis ampliam as gerações e reduzem tentativas. Formas padrão, sem variantes regionais.',
        options: [
            {
                key: 'generation',
                label: 'Gerações',
                values: [
                    { value: 'all', label: 'Conforme a dificuldade' },
                    { value: '1', label: 'Geração 1' },
                    { value: '2', label: 'Geração 2' },
                    { value: '3', label: 'Geração 3' },
                    { value: '4', label: 'Geração 4' },
                    { value: '5', label: 'Geração 5' },
                    { value: '6', label: 'Geração 6' },
                    { value: '7', label: 'Geração 7' },
                    { value: '8', label: 'Geração 8' },
                    { value: '9', label: 'Geração 9' }
                ]
            }
        ],
        primary: true,
        controls: ['teclado', 'mouse', 'toque']
    },
    {
        id: 'element',
        name: 'Elemento Secreto',
        file: 'element.js',
        category: 'Conhecimento',
        icon: '⚛',
        description: 'Investigue o elemento por número atômico, período e família.',
        rules: 'Digite nome ou símbolo e compare com o elemento secreto. A consulta de candidatos ajuda a aprender a tabela periódica. Níveis ampliam o banco de 20 para 118 elementos e reduzem tentativas.',
        options: [],
        primary: true,
        controls: ['teclado', 'mouse', 'toque']
    },
    {
        id: 'equation',
        name: 'Equação Oculta',
        file: 'equation.js',
        category: 'Matemática',
        icon: '=',
        description: 'Descubra uma igualdade usando pistas para cada caractere.',
        rules: 'Envie uma igualdade verdadeira. ✓ posição correta, ↔ outra posição, · ausente. Multiplicação e divisão têm prioridade. A igualdade precisa coincidir exatamente com a secreta; expressões equivalentes podem ser usadas como palpites. Níveis aumentam de cinco para oito caracteres.',
        options: [],
        primary: true,
        controls: ['teclado', 'mouse', 'toque']
    },
    {
        id: 'sumexact',
        name: 'Soma Exata',
        file: 'sumexact.js',
        category: 'Lógica',
        icon: '∑',
        description: 'Retire números até todas as somas coincidirem.',
        rules: 'Clique em números para retirar ou recolocar. Cada borda mostra soma atual/meta. Todas as linhas e colunas precisam coincidir ao verificar. Tabuleiros são gerados com uma solução garantida; outras soluções válidas também são aceitas. Níveis aumentam a grade de 3×3 a 6×6.',
        options: [],
        primary: true,
        controls: ['teclado', 'mouse', 'toque']
    },
    {
        id: 'survivalarena',
        name: 'Arena Improvável',
        file: 'survivalarena.js',
        category: 'Simuladores',
        type: 'simulation',
        icon: '◈',
        description: 'Misture universos e acompanhe uma competição de sobrevivência.',
        rules: 'Você organiza e observa uma simulação fictícia. Monte o elenco, escolha a arena e avance a história. Atributos são balanceados para o jogo, não poderes canônicos. Movimentos, inventários, encontros e alianças obedecem ao estado real. O cerco fecha regiões progressivamente; no dia 30 entra uma tempestade final explícita. A arena encerra ao restar um participante. Não há resposta certa, pontuação ou julgamento de habilidade.',
        options: [
            {
                key: 'arena',
                label: 'Arena inicial',
                values: [
                    { value: 'forest', label: 'Floresta dos Ecos' },
                    { value: 'desert', label: 'Deserto de Vidro' },
                    { value: 'arctic', label: 'Ártico Silencioso' },
                    { value: 'city', label: 'Cidade sem Nome' },
                    { value: 'islands', label: 'Ilhas da Maré' },
                    { value: 'volcano', label: 'Caldeira Rubra' }
                ]
            },
            {
                key: 'count',
                label: 'Participantes iniciais',
                values: [
                    { value: '8', label: '8 participantes' },
                    { value: '12', label: '12 participantes' },
                    { value: '16', label: '16 participantes' },
                    { value: '24', label: '24 participantes' },
                    { value: '32', label: '32 participantes' },
                    { value: '48', label: '48 participantes' }
                ]
            }
        ],
        primary: true,
        controls: ['mouse', 'teclado', 'toque']
    }
]);
