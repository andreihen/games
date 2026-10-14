# Coleção de percepção inspirada no Dialed

Catálogo observado em [Dialed.gg](https://dialed.gg/) em 7 de outubro de 2026: color, color-toon, sound, time, shape, pattern e tempo. Os sete tipos de jogo têm versões locais próprias na biblioteca. Color-toon usa o Cor de Memória, criado na entrega anterior; os outros seis foram acrescentados nesta entrega.

| Referência | Jogo local          | Mecânica                                                                          |
| ---------- | ------------------- | --------------------------------------------------------------------------------- |
| color      | Cor Relâmpago       | Observe uma cor; depois reconstrua tonalidade, saturação e brilho.                |
| color-toon | Cor de Memória      | Recrie a cor principal de personagens, símbolos ou elementos da natureza.         |
| sound      | Nota de Memória     | Ouça uma frequência e procure a mesma altura em um controle do grave ao agudo.    |
| time       | Relógio Interno     | Observe a duração de um estímulo e reproduza o intervalo com dois toques.         |
| shape      | Forma de Memória    | Memorize tamanho e rotação e reconstrua ambos.                                    |
| pattern    | Padrão Partido      | Observe uma grade e restaure peças que trocaram de posição.                       |
| tempo      | Construtor de Ritmo | Reconstrua um ritmo por faixas, com preparação e captura do tempo de cada batida. |

São adaptações das mecânicas com código, apresentação e pontuação próprios. Esta entrega contempla partidas locais individuais. A plataforma existente fornece histórico, favoritos, repetição por código, novas partidas, pausa e desafio diário; não há salas multiplayer online nem ranking entre contas.

## Progressão e geração

Cor Relâmpago sorteia cinco cores em HSV por partida. A apresentação começa quando o jogador toca em Observar cor. A exposição varia de 3,5 a 1,3 segundo, e a meta cresce de 70% a 92%. O cálculo de proximidade e os sliders são compartilhados com Cor de Memória.

Nota de Memória tem cinco referências geradas numa faixa que cresce de uma a três oitavas. A frequência inicial é 220 Hz; o slider usa escala logarítmica, adequada à percepção de altura. O erro é medido em cents, com precisão `máximo(0, arredondar(100 − erro / 6))`. No desafio a referência é ouvida uma vez; no treino pode ser repetida. As tentativas podem ser ouvidas antes de confirmar.

Relógio Interno apresenta cinco intervalos de 0,8–2,5 segundos no Fácil até 2–7,5 segundos no Especialista. Não há cronômetro na reprodução. A precisão corresponde a `máximo(0, 100 × (1 − erro absoluto / referência))`. A reprodução encerra automaticamente após 20 segundos para evitar uma rodada abandonada sem limite.

Forma de Memória apresenta cinco formas em ordem variável, com tamanho e rotação sorteados. A exposição vai de 3,5 a 1,2 segundo. Tamanho e rotação contribuem igualmente para a precisão. Rotações equivalentes pela simetria da forma recebem a mesma pontuação. A referência é mostrada em contorno tracejado após confirmar.

Padrão Partido usa grades de 3 × 3 a 6 × 6, com padrões diagonais, faixas ou anéis e símbolos além das cores. A geração aplica de um a quatro pares de trocas entre peças diferentes; a operação pode ser desfeita pelo jogador. Há cinco rodadas e três verificações por grade. Uma grade restaurada vale de 70 a 100 pontos conforme o tempo; uma grade não restaurada recebe crédito parcial limitado a 60 pontos e revela o original.

Construtor de Ritmo gera de duas a quatro faixas com oito a dezesseis tempos. O BPM e as posições das notas variam por seed. A apresentação mostra e toca cada faixa. Depois de quatro batidas de preparação, o jogador grava uma sequência. A tolerância cai de 180 para 80 ms. Cada nota só pode ser correspondida uma vez; notas perdidas e batidas extras reduzem a precisão. Existe um modo visual sem áudio.

Nos jogos de duração, forma, som e ritmo, a meta cresce de 70% a 94%. Cada rodada concede dez pontos por ponto de precisão e a vitória depende da média. Todos usam o relógio da sessão, que desconta pausas.

## Áudio e recursos

Notas e instrumentos são sintetizados com Web Audio após um gesto explícito. Não há downloads de áudio. O contexto pertence à partida, é suspenso durante a pausa e encerrado ao sair. O jogo de som informa indisponibilidade de áudio sem aceitar uma resposta para uma referência não ouvida. O ritmo oferece uma apresentação totalmente visual.

## Validação

`tests/perception.test.cjs` verifica oito grupos: métricas e simetrias, reconstrução de cor, duração com pausa, reconstrução de formas, restauração de padrões nas quatro dificuldades, referência sonora e fechamento do contexto, ritmo perfeito por teclado e inação sem vitória. Os testes de áudio usam um contexto simulado; a ativação foi conferida também no navegador real. As suítes gerais incluem os seis novos jogos nas verificações de inicialização, seed, configuração, cancelamento e publicação.
