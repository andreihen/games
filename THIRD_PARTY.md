# Sobre esta distribuição

CSS, JavaScript, bancos de dados e as 250 bandeiras estão incorporados ao `index.html`. Os caminhos descritos abaixo identificam os arquivos-fonte do projeto. As fontes originais e licenças do dicionário permanecem em `src/data-licenses/`. Abra o HTML para jogar; não é necessário carregar imagens separadamente.

# Dados e créditos de terceiros

Os dados necessários para jogar acompanham o projeto. A aplicação não consulta esses serviços durante uma partida. As versões de coleta e os commits estão em `src/data-licenses/sources.json`.

## Países

Fonte: [mledoze/countries](https://github.com/mledoze/countries), commit `c2ac0049c14edcf2436c7aa1b2493222a020b462`, coletado em 2 de outubro de 2026.

Os dados de países são disponibilizados sob [Open Database License 1.0](https://github.com/mledoze/countries/blob/master/LICENSE). O texto da licença está em `src/data-licenses/countries-ODbL-1.0.txt`. A parte derivada desse banco em `src/js/data/geography.js` mantém a ODbL 1.0. Esta indicação se refere ao banco de dados e não licencia automaticamente o código do aplicativo.

Modificações: seleção de campos, nomes em português disponíveis na fonte, associação com bandeiras e contornos, tradução de capitais, aliases aceitos e correções específicas. A fonte versionada permite recuperar o banco original. Foram acrescentadas referências para casos revisados:

- [Guiné Equatorial: decreto de proclamação de Ciudad de la Paz](https://www.guineaecuatorialpress.com/index.php/noticias/el_presidente_de_la_republica_proclama_la_ciudad_de_la_paz_como_capital_de_la_republica_de_guinea_ecuatorial_con_la_firma_de_un_decreto_ley).
- [Sri Jayawardenepura Kotte: município](https://www.kotte.mc.gov.lk/index.php?Itemid=175&id=25&lang=en&option=com_content&view=article).
- [Indonésia: atualização da Autoridade de Nusantara](https://ikn.go.id/id/posts/pembangunan-tahap-ii-ikn-terus-berjalan-otorita-ikn-lakukan-evaluasi-berkala). O país foi excluído das perguntas de capital nesta versão devido à transferência em andamento.
- [API de Países do IBGE](https://servicodados.ibge.gov.br/api/docs/paises), referência para nomenclatura de capitais em português. Os nomes anteriores permanecem como aliases quando apropriado; essa referência não substitui as atualizações específicas acima.

## Cartografia

Fonte: [Natural Earth Vector](https://github.com/nvkelso/natural-earth-vector), commit `ca96624a56bd078437bca8184e78163e5039ad19`, arquivo `geojson/ne_110m_admin_0_countries.geojson`.

A Natural Earth disponibiliza seus dados em [domínio público](https://www.naturalearthdata.com/about/terms-of-use/). O aviso está em `src/data-licenses/natural-earth.txt`.

Modificações: coordenadas arredondadas, associação de IDs, projeção no SVG durante a renderização e cálculo de vizinhos por bordas compartilhadas da cartografia. São 177 feições simplificadas; não constituem uma representação completa de todos os estados, territórios, fronteiras ou microestados.

## Bandeiras

Fonte: [hampusborgos/country-flags](https://github.com/hampusborgos/country-flags), commit `c09927e63705529bbf59ca6684cd9b23225dddad`. Os 250 arquivos utilizados estão em `src/assets/flags/`, associados pelo código de duas letras.

O repositório informa que as bandeiras provêm principalmente do Wikimedia Commons e estão em domínio público. Os SVGs foram copiados para uso local, sem alteração gráfica. Essa declaração e a identificação da fonte acompanham a distribuição; os nomes e dados dos países têm sua licença própria acima.

## Dicionário de Termo

Fonte: **VERO — português brasileiro**, de Raimundo Santos Moura e colaboradores, distribuído em [wooorm/dictionaries/pt](https://github.com/wooorm/dictionaries/tree/main/dictionaries/pt), commit `8cfea406b505e4d7df52d5a19bce525df98c54ab`.

O aviso específico do dicionário declara LGPLv3 e Mozilla Public License. O aviso original está em `src/data-licenses/VERO.txt`; a licença geral do repositório de distribuição não substitui esse aviso. Esta distribuição preserva o aviso e oferece a versão derivada sob LGPLv3, com os textos em `LGPL-3.0.txt` e `GPL-3.0.txt`.

Os arquivos originais `index.dic`, `index.aff` e o aviso de licença acompanham `src/data-licenses/VERO-original.zip`. A transformação em `src/js/data/words.js` expande bases, prefixos e sufixos com comprimento entre 4 e 7 letras. Cada candidato é validado no Hunspell antes de normalizar acentos e caixa. A seleção exclui nomes iniciados com maiúscula, compostos, hifens e entradas fora do alfabeto final A–Z. Esse arquivo mantém a seleção original de 278 respostas. A seleção editorial adicional em `src/js/data/vocabulary.js`, filtrada pelas entradas aceitas, amplia o banco Cotidiano de Termo para 780 respostas. O banco Amplo usa as 166.143 entradas validadas como possíveis alvos.

`vocabulary.js` contém uma seleção editorial local de palavras em português e inglês e de tokens de código, usada também em Chuva de Palavras. Não acrescenta bibliotecas nem chamadas a serviços externos. Os candidatos de Termo continuam sujeitos ao dicionário VERO e aos avisos acima.

Para reconstruir a lista com Python 3, instale a ferramenta opcional e execute:

```sh
python -m pip install spylls==0.1.7
python src/data-licenses/build_words.py
```

O [Spylls](https://github.com/zverok/spylls), versão 0.1.7, foi usado apenas para processar e validar a lista durante o desenvolvimento. O código da biblioteca não acompanha o aplicativo, e os jogos não dependem dela ou de Python. O script e as fontes incluídos permitem reproduzir as alterações. A reconstrução pode levar cerca de um minuto ou mais, conforme o computador.

## Conteúdo dos jogos de conhecimento

`src/js/data/learning.js` contém textos editoriais próprios e fatos, sem copiar imagens ou trechos extensos das fontes. Os 45 marcos espaciais têm uma referência por evento: [história da NASA](https://www.nasa.gov/specials/timeline/) e [cronologia de exploração planetária da NASA](https://nssdc.gsfc.nasa.gov/planetary/chronology.html), consultadas em 4 de outubro de 2026. As perguntas distinguem lançamento, chegada e anúncio.

As pistas do Sistema Solar utilizam como referência [planetas](https://science.nasa.gov/solar-system/planets/) e [fatos do Sistema Solar](https://science.nasa.gov/solar-system/solar-system-facts/). As pistas de matemática e tecnologia e os 32 grupos de Conexões são conteúdo editorial local sobre conceitos básicos. Capas e elementos gráficos do arcade são SVGs próprios gerados pelo aplicativo, sem bibliotecas ou assets externos novos.

## Dependências de desenvolvimento

`tests/package.json` e o lockfile registram jsdom 30.1.1 para o DOM simulado. A validação utilizou Node.js 24.18.0 e Prettier 3.6.2. Essas ferramentas não são necessárias para abrir o aplicativo e seus pacotes não são incluídos no site entregue.
