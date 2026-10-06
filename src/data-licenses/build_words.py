# Recriar com Python 3 e spylls==0.1.7. Os jogos não dependem de Python.
from pathlib import Path
import sys,json,re,unicodedata,zipfile,time
from spylls.hunspell import Dictionary
root=Path(__file__).resolve().parents[2]
import tempfile
temporary=tempfile.TemporaryDirectory(prefix='desafio-dicionario-')
work=Path(temporary.name)
with zipfile.ZipFile(root/'src/data-licenses/VERO-original.zip') as z:
 for name in ['index.dic','index.aff']: (work/name).write_bytes(z.read(name))
start=time.time();dictionary=Dictionary.from_files(str(work/'index'));print('Dicionário carregado',flush=True)
candidates=set()
def offer(word):
 if 4<=len(word)<=7 and word.isalpha() and word[0].islower():candidates.add(word)
for entry in dictionary.dic.words:
 stem=entry.stem
 if not stem or not stem[0].islower() or not stem.isalpha():continue
 offer(stem)
 suffixes=[s for flag in entry.flags for s in dictionary.aff.SFX.get(flag,[]) if 4<=len(stem)-len(s.strip)+len(s.add)<=7 and (not s.strip or stem.endswith(s.strip)) and s.cond_regexp.search(stem)]
 prefixes=[p for flag in entry.flags for p in dictionary.aff.PFX.get(flag,[]) if len(stem)-len(p.strip)+len(p.add)<=7 and (not p.strip or stem.startswith(p.strip)) and p.cond_regexp.search(stem)]
 for suffix in suffixes:offer((stem[:-len(suffix.strip)] if suffix.strip else stem)+suffix.add)
 for prefix in prefixes:
  offer(prefix.add+stem[len(prefix.strip):])
  for suffix in suffixes:
   if prefix.crossproduct and suffix.crossproduct:offer(prefix.add+(stem[len(prefix.strip):-len(suffix.strip)] if suffix.strip else stem[len(prefix.strip):])+suffix.add)
print('Candidatos',len(candidates),flush=True)
normalize=lambda word:''.join(c for c in unicodedata.normalize('NFD',word) if unicodedata.category(c)!='Mn').upper()
data={str(n):set() for n in range(4,8)}
for i,word in enumerate(sorted(candidates)):
 if dictionary.lookup(word):
  normalized=normalize(word)
  if re.fullmatch('[A-Z]{4,7}',normalized):data[str(len(normalized))].add(normalized)
 if i and i%20000==0:print('Validadas',i,'em',round(time.time()-start,1),'s',flush=True)
common='''casa mesa rato pato gato sapo lago teto fogo fato dado lado medo sede rede roda rota riso rico raro doce sala mala bala bola bolo copo coco cabo lupa mapa mato topo tela vela voto vida vila fila fita fina fome amor azul rosa roxo ouro amigo banco barco bolsa bravo calor campo canto carro carta casal chave chuva claro cobra coisa corpo culpa curso dança dente disco festa filho final força forno fruta garfo gesto grama grupo humor ideia jogar lápis leite lento livro lugar mundo noite nuvem palco papel parte pedra peixe piano plano pluma ponte porta porto prato prazo preço prova quase queda ritmo saber sinal sonho tempo texto tinta torre trigo vento verde viola vista vozes aberto abrigo acento acerto adulto altura amante amigos animal árvore aurora banana cabeça câmera camisa caneta coluna comida compra concha correr costas criado direto doente escada escola espaço estudo exatos farofa fechar figura filtro flores futuro ganhar gaveta janela jardim leitão limite língua macaco manter marido menina menino método minuto modelo morada música narina objeto oferta origem parede pessoa prisma queijo quinta rápido resumo ritual sábado salada semana sílaba sorrir supino talher tecido teoria tomate trilha trocar último viagem violão abacate abelhas acordar acordos adorado algodão alegria amizade anúncio arquivo arrumar assunto bandeja batatas bateria cafeína caminho canções capital central certeza colégio comédia coração coragem correio cuidado cultura desafio desenho destino direção domingo energia estrela família foguete formato futebol galinha garrafa ginásio justiça laranja lateral leitura madeira maneira martelo memória mercado mistura momento morango músculo oficina palavra partida passado passeio pessoas pintura planeta polícia preparo produto receita revista segredo segunda sentido sorriso sujeito telhado tesouro vestido vitória'''.split()
answers={str(n):set() for n in range(4,8)}
for word in common:
 normalized=normalize(word)
 if 4<=len(normalized)<=7 and dictionary.lookup(word):answers[str(len(normalized))].add(normalized);data[str(len(normalized))].add(normalized)
for n,words in answers.items():assert len(words)>=30,(n,len(words))
output={key:sorted(values) for key,values in data.items()};output['answers']={key:sorted(values) for key,values in answers.items()}
output['source']={'repository':'https://github.com/wooorm/dictionaries/tree/main/dictionaries/pt','commit':'8cfea406b505e4d7df52d5a19bce525df98c54ab','dictionary':'VERO, português brasileiro','downloaded':'2026-10-02','processing':'Bases, prefixos e sufixos de 4–7 letras; cada candidato validado com Spylls 0.1.7 antes de remover acentos. Respostas selecionadas do vocabulário cotidiano.'}
(root/'src/js/data/words.js').write_text("GameData.register('words',"+json.dumps(output,ensure_ascii=False,separators=(',',':'))+");\n",encoding='utf-8')
print('Concluído',round(time.time()-start,1),'s', {n:len(words) for n,words in data.items()},'respostas',{n:len(words) for n,words in answers.items()},flush=True)
