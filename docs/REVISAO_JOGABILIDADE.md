# Revisão da jogabilidade — 7 de outubro de 2026

Esta entrega atende aos ajustes pedidos para os jogos existentes. As propostas mais amplas do documento anexado permanecem como referência para futuras entregas.

## Simon Diz

O tabuleiro voltou ao formato circular clássico, com quatro cores, iluminação de cada setor e contador central. As teclas de 1 a 4 também funcionam. O modo inverso foi preservado: alterna blocos de três rodadas entre a cor oposta e a cor anterior no círculo. A regra atual aparece antes da resposta. A dificuldade não é escolhida previamente: a sequência cresce durante a partida.

## Jogo da Memória e Trilha de Memória

Os pares têm novas cartas, indicação dos pares encontrados e contagem de tentativas. Uma combinação errada permanece visível por 1,1 segundo no Fácil e por 0,8 segundo no Expert, permitindo reconhecer os conteúdos antes de fechar as cartas.

O Jogo da Memória também oferece **Sequência de quadrados**. A grade mostra uma posição por vez, apaga e só depois mostra a seguinte. Ao final, o jogador repete a ordem. Não são exibidos números durante a apresentação; eles aparecem nas posições já respondidas. A Trilha de Memória usa a mesma apresentação sequencial. Rotação da grade é um modo explícito, sem aparecer automaticamente ao aumentar a dificuldade.

| Dificuldade | Grade | Posições na sequência |
| ----------- | ----- | --------------------- |
| Fácil       | 4 × 4 | 5                     |
| Médio       | 5 × 5 | 8                     |
| Difícil     | 5 × 5 | 11                    |
| Expert      | 6 × 6 | 14                    |

## Ordem Temporal

As palavras vêm do banco de vocabulário do projeto, com filtros de comprimento por dificuldade. Números, figuras e cores também ganharam mais opções. O sorteio considera itens recentes para reduzir repetição entre partidas. Cada partida tem seis rodadas; a sequência cresce a cada duas rodadas e a exposição fica gradualmente mais curta. A correção mostra quais posições estão certas e, em caso de erro, informa a ordem original.

| Dificuldade | Itens da primeira à última rodada | Exposição inicial por item | Intervalo antes da resposta |
| ----------- | --------------------------------- | -------------------------- | --------------------------- |
| Fácil       | 3–5                               | 1.000 ms                   | 0 ms                        |
| Médio       | 4–6                               | 850 ms                     | 200 ms                      |
| Difícil     | 6–8                               | 650 ms                     | 500 ms                      |
| Expert      | 8–10                              | 450 ms                     | 850 ms                      |

## Apague as Luzes

Voltaram os quadrados amarelos iluminados e os quadrados cinza apagados, sem símbolos sobrepostos. O gerador de tabuleiros solucionáveis e os modos existentes foram preservados.

## Checklist

Os exemplos profissionais foram substituídos por equipamentos e missões em três cenários: expedição, espaço e poções. O jogador lê as regras, inicia a missão e decide se cada equipe está preparada. A interface mostra progresso e sequência de acertos; a cada três decisões corretas consecutivas há bônus de pontos. As regras continuam determinando respostas verificáveis.

## Biblioteca e configuração

A interface usa cores mais discretas, menos decoração e cartões mais compactos. Modos e dificuldades usam grupos visíveis de opções. Configurações que não se aplicam ao modo escolhido ficam ocultas. As últimas preferências são lembradas; o código para repetir uma partida fica em uma seção opcional. A troca de tela volta ao topo para apresentar os controles desde o início.

## Verificação

As suítes existentes cobrem regras, algoritmos, plataforma, catálogo, partidas e rejogabilidade. A nova suíte `refinement.test.cjs` verifica reprodução da sequência, rotação, ambas as regras do Simon inverso, crescimento e variedade da Ordem Temporal e sincronização das opções de configuração. A distribuição independente passa por uma suíte separada que serve o HTML em uma raiz e em um subdiretório, confere os recursos incorporados e inicializa os 44 jogos.
