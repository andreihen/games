# Expansão de jogos e navegação — 9 de outubro de 2026

O anexo de 30 ideias foi usado como referência de mecânicas, junto dos pedidos anteriores. Foram escolhidos desafios que funcionam completamente em um site estático e acrescentam estratégias diferentes à coleção. O catálogo agora contém 56 jogos, sendo 55 na biblioteca e Resta Um em Extras.

| Jogo | Como funciona | O que a dificuldade muda |
| --- | --- | --- |
| Pokédex Misteriosa | Digite um Pokémon. Cada palpite compara geração, tipos, altura e peso. Setas apontam para o valor secreto e tipos parcialmente iguais recebem ≈. | Banco de gerações 1, 1–3, 1–6 ou 1–9; 10, 9, 8 ou 7 tentativas. Uma geração específica pode ser escolhida independentemente do nível. |
| Elemento Secreto | Digite nome ou símbolo. Compare número atômico, período e família. A consulta de candidatos permite aprender enquanto joga. | Primeiros 20, 36, 86 ou 118 elementos; 9, 8, 7 ou 6 tentativas. |
| Equação Oculta | Envie igualdades verdadeiras e deduza cada caractere por posição. Duplicatas e entradas inválidas não gastam tentativas. | 5, 6, 7 ou 8 caracteres; 8, 7, 6 ou 6 tentativas. O Difícil acrescenta multiplicação e divisão; o Especialista sorteia expressões com dois operadores e precedência. |
| Soma Exata | Retire e recoloque números para cumprir simultaneamente somas de linhas e colunas. As bordas mostram soma atual/meta. | Grades 3×3, 4×4, 5×5 e 6×6. Desfazer e recomeçar o tabuleiro ficam disponíveis. |

## Chuva de Palavras e textos

- Chuva tranquila: palavras descem e esperam na base; sem perda de vidas por demora.
- Sobrevivência: várias palavras descem, cinco perdas encerram a partida com derrota.
- Sprint: queda durante 60 segundos; objetivo de 15, 20, 25 ou 30 palavras conforme o nível, com pelo menos 65% de precisão. As palavras perdidas aparecem no resultado.
- Precisão: alvo parado, para quem quer treinar sem movimento.
- Texto completo: de dois a cinco trechos, sem repetição na partida, em português, inglês ou código. Mostra caracteres corretos, erros, posição atual, WPM e precisão. A medição de WPM começa na primeira entrada, aceita correções e não impõe prazo.

Os 24 trechos de texto são originais. Português e inglês aceitam acentos opcionais, mantendo caixa, pontuação e espaços; código exige coincidência exata e Tab insere dois espaços. O painel de referência rola internamente sem deslocar a página ao digitar. O seletor de banco de palavras some nos modos em que não tem efeito.

## Retomar a página

A tela atual tem endereço próprio: `view=library`, `view=setup` ou `view=play`. Voltar e avançar restauram a tela; busca, categoria, filtro, ordenação, jogo, dificuldade, seed e opções ficam registrados no navegador. Reabrir a raiz retoma a última página, enquanto um link explícito prevalece sobre o estado salvo.

Recarregar uma partida reabre **o mesmo desafio com uma nova tentativa**. Não existe um checkpoint universal de jogadas para os 56 jogos. Ao navegar para fora e retornar quando o navegador conserva a página em seu cache, a sessão é pausada e retomada sem perder o tabuleiro vivo. Os controles de pausa manual continuam sendo respeitados. Preferências e estatísticas anteriores permanecem na chave de progresso existente; a navegação usa a chave separada `desafio-logico-total:page`.

## Critérios de geração e limites

Todos os jogos usam o gerador com seed da coleção, incluindo o banco e as opções no desafio compartilhável. Nova partida gera outra seed; repetir mantém o desafio. Pokémon utiliza apenas a forma padrão por espécie, sem dependências de imagens ou rede. Tipo compartilhado não indica posição do tipo, pois a ordem não muda a combinação. Altura e peso são comparações numéricas, não perguntas com alternativas que permitem acertar por eliminação geográfica.

Elemento Secreto distingue período de família; não atribui números de grupo arbitrários aos lantanídeos e actinídeos. A categoria de família vem do snapshot PubChem citado nos créditos. Equação Oculta valida a sintaxe, a precedência e a igualdade sem `eval`, e contabiliza corretamente símbolos repetidos. Uma igualdade matematicamente equivalente pode ser um palpite válido, mas a vitória exige a sequência secreta exata, como informado nas regras.

Soma Exata constrói metas a partir de um subconjunto oculto, garantindo pelo menos uma solução. Não promete unicidade: toda solução que atende a todas as metas é aceita. Verificar antes de concluir informa que faltam somas, sem encerrar a partida. Os níveis ajustam o tamanho, não fazem alegações de dificuldade humana calculada.

As novas suítes verificam sucesso, derrota, entradas inválidas, repetição, dados, geração solucionável, queda, edição do texto, histórico e retomada. A publicação incorpora os sete bancos de dados, quatro folhas de estilo, 56 fábricas de jogo e 250 bandeiras, com a licença PokéAPI incluída.
