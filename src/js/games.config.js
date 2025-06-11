// src/js/games.config.js

const GAMES_CONFIG = [
    {
        id: 'decode_colors',
        name: 'Decifrador de Cores',
        file: 'decode_colors.js',
        initFunc: 'initDecodeColorsPhase'
    },
    {
        id: 'lightsout',
        name: 'Apague as Luzes',
        file: 'lightsout.js',
        initFunc: 'initLightsOutPhase'
    },
    {
        id: 'nonogram',
        name: 'Nonogram',
        file: 'nonogram.js',
        initFunc: 'initNonogramPhase'
    },
    {
        id: 'sliding_puzzle',
        name: 'Quebra-Cabeça Deslizante',
        file: 'sliding_puzzle.js',
        initFunc: 'initSlidingPuzzlePhase'
    },
    {
        id: 'mystery_scale',
        name: 'Balança Misteriosa',
        file: 'mystery_scale.js',
        initFunc: 'initMysteryScalePhase'
    },
    {
        id: 'hanoi_tower',
        name: 'Torre de Hanói',
        file: 'hanoi_tower.js',
        initFunc: 'initHanoiPhase'
    },
    {
        id: 'resta_um',
        name: 'Resta Um Estratégico',
        file: 'restaum.js',
        initFunc: 'initRestaUmPhase'
    },
    {
        id: 'mental_math',
        name: 'Arena de Cálculo',
        file: 'mental_math_trainer.js',
        initFunc: 'initMentalMathTrainerPhase'
    },
    {
        id: 'mini_sudoku',
        name: 'Mini Sudoku',
        file: 'mini_sudoku.js',
        initFunc: 'initMiniSudokuPhase'
    },
    {
        id: 'tictactoe',
        name: 'Jogo da Velha',
        file: 'tiktaktoe.js',
        initFunc: 'initTicTacToeModernPhase'
    },
    {
        id: 'memory_game',
        name: 'Jogo da Memória',
        file: 'memory_game.js',
        initFunc: 'initMemoryGamePhase'
    },
    {
        id: 'symbol_inspector',
        name: 'Inspetor de Símbolos',
        file: 'symbol_inspector.js',
        initFunc: 'initSymbolInspectorPhase'
    },
    {
        id: 'blockfit',
        name: 'BlocoFit',
        file: 'blockfit.js',
        initFunc: 'initBlockFitPhase'
    },
    // ... outros jogos ...
    {
        id: 'subtledifference',
        name: 'Diferenças',
        file: 'subtledifference.js',
        initFunc: 'initSubtleDifferencePhase'
    },
    {
        id: 'finddifference',
        name: 'Jogo dos Erros',
        file: 'finddifference.js',
        initFunc: 'initFindDifferencePhase'
    },
    {
        id: 'simonsays',
        name: 'Simon Diz',
        file: 'simonsays.js',
        initFunc: 'initSimonSaysPhase'
    },
    {
        id: 'memorypath',
        name: 'Trilha da Memória',
        file: 'memorypath.js',
        initFunc: 'initMemoryPathPhase'
    },
    {
        id: 'memoryshelf',
        name: 'Prateleira da Memória',
        file: 'memoryshelf.js',
        initFunc: 'initMemoryShelfPhase'
    },
    {
        id: 'rightimpulse',
        name: 'Impulso Certo',
        file: 'rightimpulse.js',
        initFunc: 'initRightImpulsePhase'
    },
    {
        id: 'wordrain',
        name: 'Chuva de Palavras',
        file: 'wordrain.js',
        initFunc: 'initWordRainPhase'
    },
    {
        id: 'logicmaze',
        name: 'Labirinto Lógico',
        // Garanta que o nome do ficheiro está exatamente assim:
        file: 'logicmaze.js',
        initFunc: 'initLogicMazePhase'
    }
];