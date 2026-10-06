# UX, jogabilidade e rejogabilidade — 2 de outubro de 2026

Atualização aplicada aos jogos existentes. O catálogo continua com 41 jogos ativos. A lista completa e as propostas de expansão estão em [CATALOGO_E_IDEIAS.md](CATALOGO_E_IDEIAS.md).

## Vocabulário e sorteio

- Termo: o banco Cotidiano passou de 278 para **780 respostas**: 213 de quatro letras, 222 de cinco, 206 de seis e 139 de sete. Todas aparecem no dicionário aceito. O banco Amplo permite **166.143 entradas** como alvos, incluindo flexões; palavras menos usuais podem aparecer.
- Chuva de Palavras: o banco editorial tem **865 palavras em português, 729 em inglês e 135 tokens de código**. O comprimento permitido continua dependendo da dificuldade; há 283 palavras em português com até quatro letras. A opção Amplo acrescenta o dicionário de 4–7 letras ao português. Palavras equivalentes após normalização são deduplicadas.
- Capitais, Bandeiras, Mapa Mundi, Termo e Chuva utilizam um baralho embaralhado que percorre os itens antes de reiniciar o ciclo. Cada jogo registra até **80 itens recentes** neste navegador e prioriza os demais na próxima partida. Chuva não repete uma palavra ainda ativa na tela. Termo escolhe alvos diferentes no dueto e quarteto.
- Capitais mantém a revisão espaçada: uma pergunta pendente pode reaparecer para aprendizado, mas não se repete na mesma partida antes de percorrer o banco disponível.
- “Mesmo desafio” e links compartilhados congelam o histórico utilizado na geração. “Nova partida” consulta o histórico mais recente. O desafio diário ignora personalização de histórico, revisão e WPM inicial para conservar um ponto de partida comum.

## Geografia e dificuldade

As quatro dificuldades usam todos os países elegíveis da região selecionada. Saiu a restrição do Fácil a um pequeno grupo de países conhecidos ou de maior área. O mapa usa apenas países com contornos disponíveis, e seus modos filtram os registros necessários à pergunta.

As alternativas vêm da mesma sub-região quando há pelo menos duas respostas falsas elegíveis; caso contrário, priorizam a região continental. Bandeiras acrescenta prioridade a famílias de bandeiras semelhantes. Há **3 a 6 alternativas**, conforme a dificuldade e os candidatos plausíveis disponíveis. Isso evita preencher opções com países de outros continentes apenas para alcançar uma quantidade fixa. A resposta correta e as alternativas são embaralhadas.

Capitais aceita digitação; Bandeiras ganhou “Bandeira → país: digitado”. Os seis modos do mapa aceitam resposta digitada. Na versão digitada de localizar, o jogador informa o país destacado. Acentos, caixa e pontuação são opcionais; nomes e aliases reconhecidos em português e inglês são aceitos. Países com várias capitais aceitam todas as listadas, e perguntas sobre vizinhos aceitam qualquer vizinho válido do mapa.

A dificuldade da geografia altera quantidade de rodadas e limite de alternativas; não significa que todos os países de um nível sejam igualmente conhecidos. Digitação e seleção regional permitem escolher a exigência desejada. O mapa centraliza cada nova rodada e aproxima países pequenos quando necessário; zoom e arraste continuam disponíveis.

## Feedback e controles

- Perguntas com alternativas mostram a opção correta e a opção errada escolhida, com cor, contorno e rótulos “✓ Correta” e “✕ Sua resposta”. A explicação permanece até “Próxima rodada”. Há uma barra de rodadas respondidas.
- Formulários digitados recebem feedback visual e textual. Após responder, a rodada é bloqueada para evitar pontuação duplicada; o foco segue para “Próxima rodada”.
- Termo mostra as letras digitadas na linha atual sem revelar pistas antecipadas. Erros de comprimento, palavra não reconhecida e palpite repetido não consomem tentativa. Depois de um palpite válido, limpa a mensagem de erro anterior e devolve o foco à digitação. As letras avaliadas têm uma breve animação; tabuleiros resolvidos no dueto/quarteto ficam congelados e identificados.
- Chuva destaca letras corretas e erradas, permite correção com Backspace e mostra a última palavra concluída, pontos ou palavra perdida. Acentos continuam opcionais.
- As animações respeitam a preferência de redução de movimento do navegador. A identificação por texto acompanha as cores.

## Validação

**53 grupos automatizados aprovados**, distribuídos em jogos/algoritmos, plataforma, partidas completas, catálogo e UX/rejogabilidade. Os registros estão em `tests/results/`. Após os ajustes finais de tradução e foco, os oito grupos de UX e os cinco grupos de catálogo foram executados novamente e passaram. Os 59 arquivos JavaScript tiveram sua sintaxe validada; os arquivos editados passaram pela verificação de formatação.

Os oito grupos novos conferem tamanho e validação dos bancos, sorteio sem repetição, alternativas sul-americanas da mesma região, diversidade real no Fácil, respostas digitadas, feedback de erro/progresso, prévia e validação de Termo e quinze palavras distintas em Chuva.

A conferência visual no navegador integrado é registrada separadamente em `tests/results/browser-ux.json`. Testes de DOM e a prévia integrada não substituem testes em aparelhos físicos ou uma auditoria completa de acessibilidade.
