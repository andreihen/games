GameRegistry.register('hanoi_tower', (session) => {
    const ui = session.ui;
    const setTimeout = session.timeout,
        setInterval = session.interval,
        clearTimeout = session.clear,
        clearInterval = session.clear;
    const requestAnimationFrame = session.frame,
        cancelAnimationFrame = session.clear;
    const phaseCompleted = session.complete,
        showModal = session.notify;
    let currentPhaseTimerId = null,
        currentPhaseAttemptsLeft = null;
    function clearPhaseTimer() {
        session.clear(currentPhaseTimerId);
        currentPhaseTimerId = null;
    }

    function initHanoiPhase(config) {
        const numDisks = config.disks;
        let movesMade = 0;

        let towers = [[], [], []]; // 0: Início, 1: Auxiliar, 2: Destino
        let selectedDisk = null;
        let sourcePegIndex = null;
        let invalidMoveTimeoutId = null;

        function isPegOrderedLikeStartOrFinish(pegArray, totalDisks) {
            if (pegArray.length !== totalDisks) return false;
            for (let i = 0; i < totalDisks; i++) {
                if (pegArray[i] !== totalDisks - i) return false;
            }
            return true;
        }

        function generateScrambledValidState() {
            let tempTowers = [[], [], []];
            for (let i = numDisks; i > 0; i--) {
                tempTowers[0].push(i);
            }
            const minScramble = config.scrambleMin;
            const maxScrambleVariation = config.scrambleRange;
            let scrambleMoves =
                Math.floor(session.random.float() * (maxScrambleVariation - minScramble + 1)) +
                minScramble;
            scrambleMoves = Math.min(scrambleMoves, Math.pow(2, numDisks) * 2, config.scrambleCap); // Limita o máximo

            for (let k = 0; k < scrambleMoves; k++) {
                let possibleMoves = [];
                for (let fromPeg = 0; fromPeg < 3; fromPeg++) {
                    if (tempTowers[fromPeg].length > 0) {
                        const diskToMove = tempTowers[fromPeg][tempTowers[fromPeg].length - 1];
                        for (let toPeg = 0; toPeg < 3; toPeg++) {
                            if (fromPeg !== toPeg) {
                                if (
                                    tempTowers[toPeg].length === 0 ||
                                    diskToMove < tempTowers[toPeg][tempTowers[toPeg].length - 1]
                                ) {
                                    possibleMoves.push({
                                        from: fromPeg,
                                        to: toPeg,
                                        disk: diskToMove
                                    });
                                }
                            }
                        }
                    }
                }
                if (possibleMoves.length > 0) {
                    const move =
                        possibleMoves[Math.floor(session.random.float() * possibleMoves.length)];
                    tempTowers[move.from].pop();
                    tempTowers[move.to].push(move.disk);
                } else {
                    break;
                }
            }
            let attemptsToClearTarget = numDisks * 3; // Tenta mover cada disco da haste 2 algumas vezes
            for (let i = 0; i < attemptsToClearTarget && tempTowers[2].length > 0; i++) {
                const diskToMoveFromTarget = tempTowers[2][tempTowers[2].length - 1];
                const preferredTargets = session.random.float() < 0.5 ? [0, 1] : [1, 0]; // Alterna a preferência
                let moved = false;
                for (const targetPeg of preferredTargets) {
                    if (
                        tempTowers[targetPeg].length === 0 ||
                        diskToMoveFromTarget <
                            tempTowers[targetPeg][tempTowers[targetPeg].length - 1]
                    ) {
                        tempTowers[2].pop();
                        tempTowers[targetPeg].push(diskToMoveFromTarget);
                        moved = true;
                        break;
                    }
                }
                if (!moved) break; // Não pôde mover o disco do topo da haste 2
            }
            const isSourcePerfect = isPegOrderedLikeStartOrFinish(tempTowers[0], numDisks);
            const isTargetPerfect = isPegOrderedLikeStartOrFinish(tempTowers[2], numDisks);
            if (isSourcePerfect && tempTowers[1].length === 0 && tempTowers[2].length === 0) {
                if (tempTowers[0].length > 0) {
                    let disk = tempTowers[0].pop();
                    tempTowers[1].push(disk); // Força mover para a haste auxiliar
                }
            } else if (
                isTargetPerfect &&
                tempTowers[0].length === 0 &&
                tempTowers[1].length === 0
            ) {
                if (tempTowers[2].length > 0) {
                    let disk = tempTowers[2].pop();
                    tempTowers[1].push(disk); // Força mover para a haste auxiliar
                }
            } else if (
                isPegOrderedLikeStartOrFinish(tempTowers[1], numDisks) &&
                tempTowers[0].length === 0 &&
                tempTowers[2].length === 0
            ) {
                if (tempTowers[1].length > 0) {
                    let disk = tempTowers[1].pop();
                    tempTowers[0].push(disk); // Força mover para a haste de origem
                }
            }
            if (
                tempTowers[2].length > numDisks / 2 &&
                tempTowers[0].length === 0 &&
                tempTowers[1].length === 0
            ) {
                let isPartiallyOrderedTarget = true;
                for (let i = 0; i < tempTowers[2].length; i++) {
                    if (tempTowers[2][i] !== tempTowers[2][0] - i) {
                        isPartiallyOrderedTarget = false;
                        break;
                    }
                }
                if (isPartiallyOrderedTarget && tempTowers[2].length > 1) {
                    // Se estiver parcialmente ordenada e com mais de 1 disco
                    let disk = tempTowers[2].pop();
                    if (
                        tempTowers[0].length === 0 ||
                        disk < tempTowers[0][tempTowers[0].length - 1]
                    ) {
                        tempTowers[0].push(disk);
                    } else if (
                        tempTowers[1].length === 0 ||
                        disk < tempTowers[1][tempTowers[1].length - 1]
                    ) {
                        tempTowers[1].push(disk);
                    } else {
                        tempTowers[2].push(disk); // Devolve se não puder
                    }
                }
            }
            if (
                isPegOrderedLikeStartOrFinish(tempTowers[0], numDisks) &&
                tempTowers[1].length === 0 &&
                tempTowers[2].length === 0
            ) {
                if (numDisks > 0) {
                    // Só faz se houver discos
                    let diskToMove = tempTowers[0].pop();
                    if (
                        tempTowers[1].length === 0 ||
                        diskToMove < tempTowers[1][tempTowers[1].length - 1]
                    ) {
                        tempTowers[1].push(diskToMove);
                    } else {
                        // Se não puder, devolve (improvável neste cenário específico)
                        tempTowers[0].push(diskToMove);
                    }
                }
            }

            return tempTowers;
        }

        towers = generateScrambledValidState();
        ui.limitDisplay.textContent = `Movimentos: ${movesMade}`;

        function renderTowers(errorMessage = '') {
            const gameArea = ui.phaseDisplay;
            const existingHanoiContainer = gameArea.querySelector('.hanoi-game-container');
            if (existingHanoiContainer) {
                existingHanoiContainer.remove();
            }

            const hanoiGameContainer = document.createElement('div');
            hanoiGameContainer.classList.add(
                'hanoi-game-container',
                'p-4',
                'rounded-lg',
                'shadow-md',
                'w-full',
                'max-w-lg',
                'mx-auto',
                'bg-gray-800',
                'text-white'
            );
            hanoiGameContainer.innerHTML = `
            <h2 class="phase-title text-xl lg:text-2xl font-semibold mb-3 text-center">Torre de Hanói (Caos)</h2>
            <p class="text-sm text-gray-300 mb-4 text-center">Organize todos os ${numDisks} discos na última haste. Um disco maior nunca pode ficar sobre um menor.</p>
            <div class="flex justify-around items-end h-64 sm:h-72 md:h-80 bg-gray-700 p-4 rounded relative" id="hanoi-towers-container">
                <!-- Hastes serão renderizadas aqui -->
            </div>
            <p class="text-center mt-3 text-gray-400" id="hanoi-moves">Movimentos: ${movesMade}</p>
            <p id="hanoi-error-message" class="text-center text-red-400 h-6 mt-2 transition-opacity duration-300 ease-in-out ${errorMessage ? 'opacity-100' : 'opacity-0'}">${errorMessage}</p>
        `;
            gameArea.innerHTML = '';
            gameArea.appendChild(hanoiGameContainer);

            const towersContainer = document.getElementById('hanoi-towers-container');
            towers.forEach((pegDisks, pegIndex) => {
                const pegElement = document.createElement('div');
                pegElement.classList.add(
                    'hanoi-peg',
                    'flex',
                    'flex-col-reverse',
                    'items-center',
                    'w-1/3',
                    'h-full',
                    'relative',
                    'pt-2',
                    'cursor-pointer'
                );
                pegElement.dataset.pegIndex = pegIndex;
                pegElement.dataset.label = `Haste ${pegIndex + 1}; discos: ${pegDisks.join(', ') || 'nenhum'}`;

                const pegPillarVisual = document.createElement('div');
                pegPillarVisual.classList.add(
                    'hanoi-peg-pillar-visual',
                    'bg-gray-500',
                    'absolute',
                    'bottom-0',
                    'left-1/2',
                    'transform',
                    '-translate-x-1/2',
                    'rounded-t-md'
                );
                pegPillarVisual.style.width = '12px';
                pegPillarVisual.style.height = `${numDisks * 20 + 30}px`;
                pegElement.appendChild(pegPillarVisual);

                pegDisks.forEach((diskSize, diskIndex) => {
                    const diskElement = document.createElement('div');
                    diskElement.classList.add(
                        'hanoi-disk',
                        'rounded',
                        'text-xs',
                        'flex',
                        'items-center',
                        'justify-center',
                        'transition-all',
                        'duration-150',
                        'ease-in-out',
                        'border',
                        'border-black',
                        'border-opacity-30',
                        'shadow-md',
                        'z-10',
                        'absolute',
                        'left-1/2',
                        'transform',
                        '-translate-x-1/2'
                    );
                    const diskWidth = diskSize * (numDisks >= 6 ? 12 : 15) + 20;
                    diskElement.style.width = `${diskWidth}px`;
                    diskElement.style.height = '18px';
                    diskElement.textContent = diskSize;
                    diskElement.style.color = '#111827';
                    diskElement.style.bottom = `${diskIndex * 19}px`;
                    const hue = (diskSize / (numDisks + 1)) * 240 + 120;
                    diskElement.style.backgroundColor = `hsl(${hue}, 65%, 55%)`;

                    if (
                        selectedDisk === diskSize &&
                        sourcePegIndex === pegIndex &&
                        towers[pegIndex].length > 0 &&
                        towers[pegIndex][towers[pegIndex].length - 1] === diskSize
                    ) {
                        diskElement.classList.add(
                            'selected-disk',
                            'ring-2',
                            'ring-yellow-300',
                            'shadow-xl',
                            'opacity-80'
                        );
                        diskElement.style.bottom = `${diskIndex * 19 + 5}px`;
                    }
                    pegElement.appendChild(diskElement);
                });

                session.listen(pegElement, 'click', () => handlePegClick(pegIndex));
                towersContainer.appendChild(pegElement);
            });
        }

        function displayInvalidMoveMessage(message) {
            const errorElement = document.getElementById('hanoi-error-message');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.remove('opacity-0');
                errorElement.classList.add('opacity-100');
                if (invalidMoveTimeoutId) clearTimeout(invalidMoveTimeoutId);
                invalidMoveTimeoutId = setTimeout(() => {
                    errorElement.classList.remove('opacity-100');
                    errorElement.classList.add('opacity-0');
                    setTimeout(() => {
                        errorElement.textContent = '';
                    }, 300);
                }, 2500);
            }
        }

        function handlePegClick(pegIndex) {
            if (!session.active) return;

            if (selectedDisk === null) {
                if (towers[pegIndex].length > 0) {
                    selectedDisk = towers[pegIndex][towers[pegIndex].length - 1];
                    sourcePegIndex = pegIndex;
                }
            } else {
                const targetPeg = towers[pegIndex];
                const canMove =
                    targetPeg.length === 0 || selectedDisk < targetPeg[targetPeg.length - 1];

                if (pegIndex === sourcePegIndex) {
                    selectedDisk = null;
                    sourcePegIndex = null;
                } else if (canMove) {
                    towers[sourcePegIndex].pop();
                    targetPeg.push(selectedDisk);
                    movesMade++;
                    ui.limitDisplay.textContent = `Movimentos: ${movesMade}`;
                    selectedDisk = null;
                    sourcePegIndex = null;

                    if (
                        towers[0].length === 0 &&
                        towers[1].length === 0 &&
                        towers[2].length === numDisks
                    ) {
                        if (isPegOrderedLikeStartOrFinish(towers[2], numDisks)) {
                            phaseCompleted(true, {
                                text: `Torre de Hanói (Caos) concluída em ${movesMade} movimentos!`
                            });
                        }
                    }
                } else {
                    displayInvalidMoveMessage('Movimento Inválido: Disco maior sobre menor!');
                    selectedDisk = null;
                    sourcePegIndex = null;
                }
            }
            renderTowers();
        }
        renderTowers();
    }

    return {
        init: initHanoiPhase,
        destroy: session.destroy,
        pause: session.pause,
        resume: session.resume
    };
});
