# SERENOU ADMIN — SIMPLIFICAR O CADASTRO

Blueprint. Nada implementado. Tudo abaixo foi conferido contra o código que
existe hoje (`sanity/schemas/produto.ts`, `sanity/componentes/*`,
`sanity/lib/produtos.ts`, `sanity/lib/imagem.ts`) e contra as APIs realmente
presentes no Sanity 6.13.2 instalado, lendo os tipos e o runtime do pacote.
Onde eu não pude conferir, está dito.

---

## O QUE O CATÁLOGO REAL DIZ

Antes de desenhar, medi. Consulta ao dataset `production`, 18 documentos:

| | mediana | faixa |
|---|---|---|
| fotos por peça | 4 | 1 a 6 |
| cores por peça | 3 | 0 a 3 |
| tamanhos por peça | 3 | 0 a 5 |
| fotos com `cor` preenchida | 100% | — |

Três peças não têm cor nenhuma (Frente Única, Macaquinho, Vestido de Tule).
Seis não têm tamanho. Todas as 92 fotos do catálogo têm `alt` preenchido.

Duas consequências de projeto saem daqui:

1. **"Fotos gerais" é a exceção, não a regra.** Em 15 das 18 peças, toda foto
   pertence a uma cor. Só Trijunto Ester (2 de 4) e Vestido Longo de Uma Alça
   (1 de 2) misturam. Então a tela não deve dar peso igual a "cores" e "fotos
   gerais" — gerais é um rodapé, não uma coluna.
2. **A peça média tem 4 fotos e 3 cores.** Ou seja: ~1,3 foto por cor. Blocos
   de cor com uma foto cada ocupam muita tela para pouca informação.

---

## A. O QUE HOJE É DESNECESSARIAMENTE COMPLEXO

**A.1 — A ordem obrigatória entre abas.** Este é o problema central, e não é
estético: é uma dependência de dados. O campo `cor` de cada foto só oferece
as cores já cadastradas em `cores[]`. Logo a Grazi **precisa** cadastrar cor
antes de marcar foto. Como as duas coisas moram em abas diferentes, o
caminho real é `A peça → Cores e tamanhos → Fotos → Onde aparece`. Ela sai da
aba "Fotos", vai cadastrar cor, e volta. Isso é exatamente o "primeiro
cadastro uma cor, depois volto em Fotos" que você descreveu.

**A.2 — Marcar a cor de uma foto custa quatro interações.** Hoje a lista de
fotos mostra o selo da cor (`MiniaturaFoto`), mas para *mudar* a cor é
preciso abrir o item, abrir o select, escolher, fechar. Quatro toques para
uma informação que é um atributo, não um formulário. Numa peça com 4 fotos,
16 toques só para dizer de que cor cada foto é.

**A.3 — A lista de fotos é uma lista.** O array `imagens` usa o layout
padrão do Sanity: linhas verticais com miniatura pequena. Para uma tela cujo
assunto é fotografia, é a forma errada. E é a única coisa dessa lista que
custa zero para trocar (ver B.1).

**A.4 — `alt` no caminho principal.** O campo "Descrição da foto" aparece no
formulário de cada foto, com aviso de validação quando vazio. É correto do
ponto de vista de acessibilidade e é um campo a mais entre a Grazi e o
"publicar". As 92 fotos preenchidas mostram que ela obedece — mas obedecer
custa.

**A.5 — Cinco lugares de navegação para quatro decisões.** Hoje: A peça,
Fotos, Cores e tamanhos, Onde aparece, Revisar. "Fotos" e "Cores e tamanhos"
são a mesma decisão comercial: *como esta peça existe*.

**A.6 — `imagens` e `cores` validam um ao outro à distância.** A validação
de `cores` avisa "essa cor está em 3 fotos, troque antes de remover" — o
aviso é bom, mas chega numa aba onde as fotos não estão visíveis.

---

## B. O QUE PODE SER AUTOMÁTICO

**B.1 — Grade em vez de lista, sem uma linha de componente.**
`options: { layout: "grid" }` num array de objetos faz o Sanity renderizar
`GridArrayInput` em vez de `ListArrayInput`. Conferi no runtime instalado:
o branch existe, mantém `onUpload` (arrastar arquivo para a área),
`onItemMove` (reordenar), as funções de adicionar, e continua chamando
`components.item` — o código do item inclusive tem um ramo específico para
`parentSchemaType.options?.layout === "grid"`. É opção de schema documentada,
não customização. Ganho grande, risco zero.

**B.2 — `alt` automático, no site, sem tocar no documento.** Conferi como o
alt é usado hoje: `sanity/lib/imagem.ts` faz
`alt: imagem.alt ?? alt ?? ""`, e `produtos.ts` passa como fallback
`"${nome}, fotografia ${i+1}"`. Ou seja, **o alt manual já vence o
automático**, e o automático já existe — só é ruim.

A melhoria é trocar o fallback por algo que use o que já está no documento:
`"${nome} na cor ${cor}"` quando a foto tem cor, `"${nome}, fotografia N"`
quando não tem. Isso acontece em `produtos.ts`, na leitura. Não grava nada,
não sobrescreve alt bom nenhum, e o campo continua editável para quando ela
quiser descrever de verdade. É a resposta ao seu §12: **não gerar alt
automático no schema.** Gerar na leitura é mais seguro e mais barato.

Com isso, `alt` sai do caminho principal (D.3) sem perder acessibilidade.

**B.3 — Primeira foto = principal.** Já é automático hoje: a posição 0 do
array é a vitrine, e `MiniaturaFoto` marca PRINCIPAL por `index === 0`.
Nada a fazer.

**B.4 — Foto nova = geral.** Já é o comportamento: `cor` nasce vazio, e vazio
significa "não pertence a cor nenhuma". Nada a fazer.

**B.5 — Situação nova = Disponível.** Já é `initialValue: "disponivel"`. E é
seguro pelo motivo que você levantou: o documento nasce como rascunho e não
existe para o site até a Grazi publicar. Nada a fazer.

**B.6 — Slug.** Já é gerado do nome por `EnderecoDaPagina`, e já mora no
fieldset "Configuração avançada", fechado. Falta só uma coisa: ele está no
grupo `principal`, então a gaveta aparece na primeira tela. Move para a
última (ver E).

**B.7 — Preço anterior.** Já tem `hidden: ({parent}) => !parent?.promocao`.
O progressive disclosure que você pediu no §3 está feito.

---

## C. O QUE PODE SER AGRUPADO

**C.1 — "Fotos" + "Cores e tamanhos" → "Fotos e opções".** Só mudar a lista
`groups` e o `group` de três campos. Zero efeito no dado. Resolve A.1 e A.6:
a cor nasce na mesma tela onde a foto será marcada, e o aviso de "cor em uso
em 3 fotos" passa a chegar com as fotos à vista.

**C.2 — Ordem dentro de "Fotos e opções":** Fotos → Cores → Tamanhos. Foto
primeiro porque é o que ela tem em mãos quando senta para cadastrar; cor
depois, porque só faz sentido quando existe foto para marcar.

**C.3 — Preço + Categoria.** Já estão no fieldset "Valor e categoria". Fica
como está.

**C.4 — O que NÃO agrupar:** Situação com as informações da peça. Você está
certo — é decisão de publicação. Fica em "No site", onde já está.

---

## D. O QUE DEVE CONTINUAR DETALHADO

**D.1 — As validações cruzadas.** `cores` avisa sobre foto órfã; `imagens[].cor`
confere contra as cores da peça; `precoAnterior` confere contra `preco`;
`tamanhos` e `cores` recusam duplicata. Nada disso sai. São exatamente os
erros que a cliente descobriria clicando numa bolinha que não faz nada.

**D.2 — Hotspot e crop.** Continuam existindo, atrás de abrir a foto. Nunca
estiveram no caminho principal.

**D.3 — `alt`.** Continua no formulário da foto, mas deixa de ser a primeira
coisa que ela vê — com B.2, o padrão automático fica bom o bastante para a
maioria das fotos.

**D.4 — "Tem esse tamanho".** É o que marca esgotado sem apagar o tamanho.
Continua.

**D.5 — Detalhes / Informações da peça.** Continua opcional e continua na
primeira tela. É o que preenche a página de produto.

---

## E. NOVO MAPA DE TELAS

```
1  PRODUTO            nome · descrição · informações
                      ── Valor e categoria ──
                      preço · categoria

2  FOTOS E OPÇÕES     fotos (grade)
                      ── Cores ──
                      cores
                      ── Tamanhos ──
                      tamanhos

3  NO SITE            situação
                      ── Coleções ──
                      novidade · promoção (· preço anterior)
                      ── Configuração avançada ──   [fechada]
                      endereço da página · peça de teste

4  REVISAR            prévia · checklist · mensagem do WhatsApp
                      (view ao lado, não edita nada)
```

Quatro etapas. A quarta continua sendo `S.view.component()`, não uma aba de
formulário — é o que permite ler o documento inteiro sem duplicar campo.

Navegação: as abas nativas do Sanity, que já são livres — clicar em qualquer
uma a qualquer momento, sem bloqueio. Não é wizard. Sem porcentagem, sem
barra, sem "75% completo", como você pediu.

---

## F. WIREFRAME TEXTUAL

### 1 — PRODUTO

```
 Nome da peça
 [ Conjunto Bless                                         ]

 Descrição da peça
 [ Alfaiataria leve, caimento solto.                      ]
 [                                                        ]
 Uma ou duas frases, como você descreveria para uma cliente.

 Informações da peça
 [ Tecido: viscose com elastano          ]  [×]
 [ Modelagem: soltinha                   ]  [×]
 + Adicionar informação

 ──────────────────────────────────────────────────────────
 VALOR E CATEGORIA

 Valor (R$)            Só o número. Exemplo: 189,90
 [ 159,00     ]

 Categoria
 ( ) Vestidos   (•) Conjuntos   ( ) Praia   ( ) Bodies ...
```

### 2 — FOTOS E OPÇÕES

```
 Fotos
 A primeira é a que aparece na vitrine. Arraste para mudar a ordem.

 ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
 │        │ │        │ │        │ │   ＋   │
 │  foto  │ │  foto  │ │  foto  │ │ Adicionar
 │        │ │        │ │        │ │        │
 │PRINCIPAL│ │        │ │        │ └────────┘
 │● Bordô ▾│ │● Bordô▾│ │Geral  ▾│
 └────────┘ └────────┘ └────────┘

 ──────────────────────────────────────────────────────────
 CORES
 Sem cor cadastrada, o site não mostra o seletor de cor.

 [● Bordô  2 fotos] [● Preto  1 foto] [● Nude  0 fotos]
 + Adicionar cor
 Cores da loja:  ● Preto  ● Off-white  ● Nude  ● Marrom …

 ──────────────────────────────────────────────────────────
 TAMANHOS
 Sem tamanho cadastrado, o site não mostra o seletor.

 [ P ] [ M ] [ G ] [ GG ] [ G1 ]      + Outro tamanho
```

O `▾` embaixo de cada foto é o ponto crítico: trocar a cor de uma foto vira
**dois toques** (abrir, escolher), contra os quatro de hoje. E a cor aparece
na própria miniatura, então "quais são as fotos bordô" se responde olhando.

"2 fotos" ao lado de cada cor é a contagem viva, e é o que torna o aviso de
remoção compreensível antes de acontecer.

### 3 — NO SITE

```
 Situação
 (•) Disponível     Aparece no site e a cliente pode pedir.
 ( ) Esgotada       Continua aparecendo, marcada como esgotada.
 ( ) Oculta         Continua cadastrada, não aparece no site.

 ──────────────────────────────────────────────────────────
 COLEÇÕES
 [ ] Mostrar em Novidades
 [ ] Mostrar em Promoções
     └ (quando ligado)  Valor antes da promoção (R$) [ 199,00 ]

 ──────────────────────────────────────────────────────────
 ▸ Configuração avançada
```

Categoria **não** reaparece aqui. Preço **não** reaparece aqui. Uma
informação, um lugar de edição.

### 4 — REVISAR

Já existe (`Revisar.tsx`) e atende ao que você descreveu: prévia com foto
principal, nome, preço, categoria, cores, tamanhos, situação, checklist
curto, e a prévia do WhatsApp usando `mensagemProduto()` do site. O que muda:
o checklist passa a listar só os cinco críticos (nome, preço, categoria, foto
principal, situação) e cada falta vira uma frase direta.

---

## G. IMPACTO NO SCHEMA

**Zero campos criados, zero removidos, zero renomeados. Nenhuma migração.**

O que muda em `produto.ts`:

| mudança | natureza |
|---|---|
| `groups`: 4 → 3 (fotos e opcoes viram um só) | apresentação |
| `group` de `cores` e `tamanhos`: `opcoes` → `fotos` | apresentação |
| `imagens`: acrescentar `options: { layout: "grid" }` | apresentação |
| `slug` e `teste`: `group: principal` → `group: vitrine` | apresentação |
| descrições de `status` reescritas como você redigiu | texto |

Os 18 documentos continuam válidos byte por byte. Nenhuma consulta GROQ do
site muda. `lib/loja.ts`, `CATEGORIAS`, `mensagemProduto()`, `StatusProduto`
— nada é tocado nem copiado.

Fora do schema, uma mudança em `sanity/lib/produtos.ts`: o fallback do `alt`
(B.2). É leitura, não escrita.

---

## H. COMPONENTES CUSTOM NECESSÁRIOS

Um só componente novo, e ele é uma evolução de um que já existe.

**H.1 — `MiniaturaFoto` ganha o seletor de cor inline.** Hoje ele já é
`components.item` do array de fotos e já mostra o selo. Falta poder *trocar*.

Aqui está o detalhe técnico que decide o desenho: conferi
`BaseItemProps`/`ObjectItemProps` nos tipos instalados e **`components.item`
não recebe `onChange`**. Ele recebe `inputProps`, que tem `onChange` — mas
`inputProps` está marcado `@hidden @beta` no próprio Sanity. Escrever a cor
por ali é apostar numa API que eles avisaram que pode mudar.

A alternativa estável: `components.input` no array `imagens`, que recebe
`ArrayOfObjectsInputProps` com `onChange` público e estável — o mesmo tipo
que `CoresDaPeca` e `TamanhosDaPeca` já usam hoje. Esse input chama
`renderDefault(props)` para manter a grade, o upload, o arrastar e o
hotspot inteiros, e passa uma função de "trocar a cor desta foto" para baixo,
por contexto. O item continua sendo `MiniaturaFoto`.

Custo: um componente de ~80 linhas e um contexto React de 5. Nenhuma
reimplementação de upload.

**H.2 — Nada mais.** `CoresDaPeca`, `TamanhosDaPeca`, `CorDaFoto`,
`EnderecoDaPagina`, `Revisar`, `acoes` continuam como estão. A contagem
"2 fotos" ao lado de cada cor é uma linha dentro de `CoresDaPeca`, lendo
`useFormValue(["imagens"])` — API pública, já usada em três componentes.

**O que eu NÃO vou construir**, e por quê:

- **Blocos de cor com as fotos dentro** (o desenho do seu item 2). Ele
  quebra a única fonte de ordem. A ordem do array `imagens` é o que decide a
  foto da vitrine e a ordem da galeria no site. Agrupar visualmente por cor
  cria uma segunda ordem aparente, e no dia em que a Grazi arrastar uma foto
  dentro do bloco "Preto" ela vai mudar a posição global sem perceber. A
  grade única com a cor estampada em cada miniatura responde à mesma
  pergunta — "quais são as fotos bordô" — sem essa ambiguidade. Se você
  preferir os blocos mesmo assim, dá para fazer; mas quero que a troca esteja
  explícita.
- **"Adicionar fotos dessa cor" a partir do bloco de cor.** Precisaria
  escrever em `imagens` a partir do input de `cores`, e `onChange` é escopado
  ao próprio campo. Daria para contornar com `useDocumentOperation`, que é
  público, mas escreve direto no rascunho por fora do estado do formulário —
  é o tipo de costura que quebra em upgrade. Com a grade + seletor inline, o
  caminho fica: subir a foto, escolher a cor na miniatura. Dois toques.
- **Toggle "produto sem tamanho" / "sem cores".** Concordo integralmente:
  lista vazia já significa isso, e o site já trata assim
  (`tamanhos.filter(...)` devolve vazio e o seletor não é desenhado).

---

## I. RISCOS

**I.1 — `options: { layout: "grid" }` (baixo).** Opção de schema pública. Se
um dia sumir, o array volta a ser lista — degrada, não quebra.

**I.2 — `components.input` em `imagens` chamando `renderDefault` (médio).**
É o mesmo padrão dos três componentes que já estão em produção no painel.
O risco real não é a API, é o layout: se o Sanity mudar a marcação interna da
grade, o seletor que eu posicionar sobre a miniatura pode desalinhar. Mitigo
posicionando dentro do `components.item`, que é o container que o Sanity me
dá de propósito.

**I.3 — `inputProps` (`@hidden @beta`) — evitado.** Registrado aqui para o
dia em que alguém for "simplificar" o componente usando ele.

**I.4 — O `alt` automático melhor pode piorar um caso.** Se uma foto tem cor
"Bordô" mas mostra um detalhe do tecido, `"Conjunto Bless na cor bordô"` é
pior que a descrição manual. Por isso o campo continua, e o manual continua
vencendo. O automático só substitui o genérico atual, que é pior que os dois.

**I.5 — Juntar Fotos e Cores alonga a tela 2.** Com 6 fotos, 3 cores e 5
tamanhos ela fica comprida. É o preço de tirar a ida e volta entre abas, e
eu acho o troco bom: rolar é mais barato que trocar de contexto. Vale medir
depois de pronto.

**I.6 — Nada disto foi visto rodando.** Continua valendo o que combinamos:
enquanto eu não abrir o `/admin` real, não escrevo CSS mirando estrutura
interna do Studio. As mudanças acima são todas de schema e de componentes
com API pública — não dependem de seletor interno.

---

## J. ESTIMATIVA DE REDUÇÃO DE ATRITO

Contagem feita a partir do código, não cronometrada numa tela real. Conto
"interação" como um toque que exige decisão ou mira: clique, escolha em
menu, troca de aba. Digitação conta como uma.

### Cenário A — 3 fotos, 2 cores, P/M/G (a peça mediana do catálogo)

| | hoje | proposto |
|---|---|---|
| nome, preço, categoria, descrição | 8 | 8 |
| trocas de aba | 4 | 3 |
| subir 3 fotos | 2 | 2 |
| marcar a cor das 3 fotos | 12 | 6 |
| cadastrar 2 cores (com os presets) | 2 | 2 |
| voltar à aba Fotos depois das cores | 1 | 0 |
| P, M, G | 3 | 3 |
| situação | 0 | 0 |
| publicar | 1 | 1 |
| **total** | **33** | **25** |

A economia inteira está em dois lugares: quatro toques por foto viram dois
(H.1), e a ida e volta entre abas some (C.1).

### Cenário B — peça simples: 1 foto, sem cor, sem tamanho

| | hoje | proposto |
|---|---|---|
| nome, preço, categoria | 6 | 6 |
| trocas de aba | 4 | 2 |
| subir 1 foto | 2 | 2 |
| cor, tamanho | 0 | 0 |
| situação | 0 | 0 |
| publicar | 1 | 1 |
| **total** | **13** | **11** |

Já era rápido. O ganho é de contexto, não de contagem: ela atravessa duas
telas em vez de quatro, e não passa por controles vazios de cor e tamanho —
eles ficam abaixo das fotos, na mesma tela, e ela simplesmente não desce.

### Cenário C — peça complexa: 12 fotos, 4 cores, 5 tamanhos

| | hoje | proposto |
|---|---|---|
| marcar a cor das 12 fotos | 48 | 24 |
| resto | ~20 | ~17 |
| **total** | **~68** | **~41** |

É aqui que a diferença aparece. E a pergunta que você fez — "a associação
foto → cor continua clara?" — a grade responde melhor que a lista atual:
doze miniaturas com a cor estampada cabem em três fileiras. A lista de hoje
precisa de doze linhas e de rolagem.

**O que eu não prometo:** nenhum desses números vira verdade sem medir na
tela. São contagens de caminho, e servem para comparar desenhos, não para
anunciar resultado.

---

## FORA DE ESCOPO, COMO COMBINADO

ADMIN 2, home administrativa, Central de Ajuda. E a `main`, que continua em
`c2efc5f`.
