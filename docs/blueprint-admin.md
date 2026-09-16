# SERENOU — BLUEPRINT DO PAINEL

**16/09/2026** · Sanity Studio 6.13.2 · `/admin` dentro do próprio site

Nada implementado. Nenhuma linha de código alterada.

**Antes de tudo, uma correção minha.** Na rodada do convite eu disse para você
cadastrar a Grazi como **Editor**. Está errado, e o próprio
`sanity.config.ts` já dizia o certo nas linhas 54-55. Confirmei na
documentação: no plano Free existem só **Administrator** e **Viewer** —
Editor, Developer e Contributor são do Growth. A Grazi entra como
**Administrator**. Isso muda uma coisa neste blueprint: ela terá poder de
apagar documentos e mexer em configurações do projeto, então a prevenção de
erro tem que morar no painel, não no papel dela.

---

## A · A ESTRUTURA DE HOJE

Sete arquivos, e é um painel já bem cuidado. Vale registrar o que não precisa
mudar antes de falar do que muda.

| Arquivo | O que faz |
|---|---|
| `app/admin/[[...tool]]/page.tsx` | A rota. `noindex`, `viewport-fit=cover`, `interactive-widget: resizes-content` para o teclado do telefone não cobrir o campo |
| `app/admin/[[...tool]]/Painel.tsx` | A fronteira de cliente — é o que mantém o pacote `sanity` fora do grafo de Server Components |
| `app/admin/[[...tool]]/painel.css` | 153 linhas de acabamento, escopadas em `.painel-serenou`, presas a `data-ui`/`data-testid` |
| `sanity.config.ts` | Tema, i18n, structure de 3 entradas, 6 recursos do Growth desligados um a um |
| `sanity/tema.ts` | `buildLegacyTheme` com a paleta do site — o truque bom é `--gray-base` marrom, que esquenta a interface inteira de uma vez |
| `sanity/i18n.ts` | 16 frases próprias trocando "documento" por "peça", carregadas **depois** do pt-BR oficial |
| `sanity/schemas/produto.ts` | Um tipo só, 4 grupos, 13 campos |

**A structure atual** tem três entradas: Catálogo (`status != "oculto" && teste != true`),
Peças ocultas, Peças de teste. Ordenadas por data de cadastro.

**O formulário** tem quatro abas: *A peça* (nome, endereço, valor, valor antes,
categoria, descrição, informações), *Fotos*, *Cores e tamanhos*, *Onde aparece*
(situação, novidade, promoção, teste).

**A linha da lista** mostra miniatura + nome + `"Vestidos · R$ 189,00 · esgotada"`.

**O que já está certo e não vou tocar:** o português de verdade (não
traduzido-de-ferramenta); os recursos do Growth desligados explicitamente, que
é uma decisão rara e acertada; a validação cruzada de `imagens[].cor` contra
as cores da peça; um único tipo de documento; o tema herdando a paleta do site.

---

## B · ONDE A GRAZI SE PERDE

Doze pontos. Os quatro primeiros são os que custam tempo todo dia.

**1 · A primeira tela é uma lista, não uma loja.** Ela entra e vê documentos.
Não há resposta rápida para "quantas peças estão no ar?", "o que eu marquei
como promoção?", "o que eu mexi ontem?".

**2 · "Cor desta foto" é digitação livre.** A validação impede o erro — e é a
melhor peça do schema — mas ela precisa **digitar** "Azul-marinho" certo, 45
vezes. O dado para montar uma lista já está no documento, dois campos acima.

**3 · A promoção mora em duas abas.** A caixa "Está em promoção" está em *Onde
aparece*; o campo "Valor antes da promoção" está em *A peça* e só aparece
depois de marcar a caixa. Para pôr uma peça em promoção ela vai na aba 4,
marca, volta para a aba 1, e preenche o campo que acabou de surgir. É o fluxo
mais confuso do formulário.

**4 · Ela publica e não sabe se entrou.** Não existe "ver no site". O caminho
é abrir outra aba, lembrar do endereço, procurar a peça.

**5 · A foto principal não é rotulada.** A primeira da lista é a da vitrine,
e nada na tela diz isso. Está só na descrição do campo, que ninguém relê.

**6 · A miniatura não diz de que cor ela é.** Com 6 fotos e 3 cores, saber
qual está vinculada a quê exige abrir uma a uma.

**7 · Remover uma cor deixa fotos órfãs.** A validação de `imagens[].cor` só
roda quando aquele campo é editado. Se ela apagar "Rosa" das cores, as fotos
marcadas como Rosa continuam apontando para uma cor que não existe mais — e
ninguém avisa.

**8 · O endereço da página pede um clique que ela não sabe que existe.** O
campo é obrigatório e **não** se preenche sozinho: o Sanity oferece um botão
"Gerar". Se ela não clicar, a publicação falha com um erro sobre um conceito
que não é dela.

**9 · Tamanhos são digitados um a um.** Cinco cliques e cinco digitações para
P, M, G, GG, G1 — a combinação mais comum da loja.

**10 · Não há filtro por categoria nem por coleção.** Com 18 peças a lista
única funciona. Com 80, achar "aquela calça bege" é rolagem ou memória do nome.

**11 · Não existe ajuda dentro do painel.** Toda dúvida vira mensagem para você.

**12 · Ela não sabe qual mensagem chega no WhatsApp.** O site monta a mensagem
com nome, cor, tamanho, preço e link, e isso é invisível para quem cadastra.

---

## C · A NOVA ARQUITETURA

Três ferramentas na barra do topo, e uma quarta entrada dentro da segunda.

```
┌─────────────────────────────────────────────────────────┐
│  ⬤ Painel da Serenou     INÍCIO   PEÇAS   AJUDA      👤 │
└─────────────────────────────────────────────────────────┘

INÍCIO      ferramenta própria — a visão da loja e os atalhos
PEÇAS       a structure de hoje, com filtros e a aba REVISAR
AJUDA       ferramenta própria — a central de ajuda
              └ CONFIGURAÇÕES  documento único, no fim da lista de PEÇAS
```

**"NOVA PEÇA" não vira item de menu.** Uma ferramenta do Studio precisa de uma
tela; "nova peça" é uma ação, não um lugar. Ela vira botão grande no INÍCIO e
continua no "+" da lista — dois caminhos, zero páginas falsas.

**CONFIGURAÇÕES entra como documento único no fim de PEÇAS**, não como
ferramenta: é uma tela de formulário, e o Studio já sabe desenhar formulário.

### O limite que molda todo o resto

Confirmei lendo a tipagem do pacote instalado, não de memória: **a structure do
Sanity 6.13 não permite customizar o render de cada linha da lista.** Não
existe `renderItem`, não existe `preview` no builder, e o `components.preview`
do schema **não** é aplicado nas listas — só no formulário.

O que a linha mostra vem do `preview.prepare` do schema, e `prepare` só
devolve **texto** em título/subtítulo/descrição. Só `media` aceita um nó React.

Isso significa que os badges coloridos da sua seção 2 têm dois caminhos:

| Caminho | O que dá | Custo |
|---|---|---|
| **`prepare` do schema** | `Vestidos · R$ 189,00 · 3 cores · P M G` em texto, e um nó React em `media` (dá para pôr um pontinho de estado sobre a miniatura) | baixo |
| **Lista própria numa ferramenta** | controle total: badges, colunas, filtros, ordenação | alto — reimplementa navegação, busca e seleção, e passa a divergir do Studio a cada upgrade |

**Recomendo o primeiro.** O segundo é bonito na primeira semana e vira dívida
na primeira atualização do Sanity. A informação que importa cabe em texto.

---

## D · INÍCIO

Ferramenta própria (`tools: (prev) => [...]`), lendo o dataset com a mesma
consulta que o site usa. Sem gráfico, sem número inventado.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  SERENOU                                                     │
│  Sua loja                                                    │
│                                                              │
│  ┌────────────┬────────────┬────────────┬────────────┐       │
│  │     17     │     16     │      1     │      1     │       │
│  │  no site   │ disponíveis│  esgotadas │  ocultas   │       │
│  └────────────┴────────────┴────────────┴────────────┘       │
│                                                              │
│   0 novidades        0 em promoção                           │
│                                                              │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  + NOVA PEÇA     │  │  VER PEÇAS   │  │  VER O SITE ↗│    │
│  └──────────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
│  ────────────────────────────────────────────────────────    │
│  MEXIDAS RECENTEMENTE                                        │
│                                                              │
│  ┌────┐ Conjunto Bless                                       │
│  │foto│ R$ 159,00 · Conjuntos · no site                      │
│  └────┘ há 2 dias                                            │
│                                                              │
│  ┌────┐ Biquíni Cintura Alta                                 │
│  │foto│ R$ 99,00 · Moda Praia · no site                      │
│  └────┘ há 2 dias                                            │
│                                                              │
│  ┌────┐ Frente Única                                         │
│  │foto│ R$ 129,00 · Vestidos · oculta                        │
│  └────┘ há 3 dias                                            │
│                                                              │
│  ────────────────────────────────────────────────────────    │
│  Primeira vez por aqui?  Como cadastrar uma peça →           │
└──────────────────────────────────────────────────────────────┘
```

**Os números são consulta real**, uma só, agrupando por estado. Nada de
faturamento, pedidos, visitantes ou conversão — não existem.

**"Mexidas recentemente"** ordena por `_updatedAt desc`, limite 5, e cada linha
abre a peça direto no formulário. É o que devolve a Grazi para onde ela parou.

**O bloco de primeira vez** é uma linha discreta no rodapé da tela, sempre no
mesmo lugar, sem modal e sem tour. Quem já sabe ignora; quem não sabe acha.

---

## E · PEÇAS

A structure de hoje, com a lista ganhando informação e as entradas ganhando
um nível de filtro.

```
PEÇAS
├── Catálogo                    (no site: disponíveis + esgotadas)
│   ├── Todas
│   ├── ─────────────
│   ├── Vestidos
│   ├── Macaquinhos
│   ├── Conjuntos
│   ├── Calças
│   ├── Blusas
│   ├── Moda Praia
│   ├── ─────────────
│   ├── Novidades
│   ├── Promoções
│   └── Esgotadas
├── Peças ocultas
├── ─────────────
├── Peças de teste
└── Configurações
```

Categoria e coleção viram **sublista de Catálogo**, não itens de primeiro
nível: doze entradas planas na coluna esquerda seria trocar um problema de
busca por um problema de escolha.

**A busca já existe e não precisa ser construída** — o Studio renderiza um
campo de busca em toda lista de documentos, com ordenação por relevância.
Verificado no bundle instalado.

### A linha da peça

```
┌──────┐
│      │  Conjunto Bless
│ foto │  R$ 159,00 · Conjuntos · 3 cores · P M G · 4 fotos
│      │  no site
└──────┘
```

Tudo isso cabe em `prepare`: título, subtítulo e descrição. O estado vai na
descrição em palavra, não só em cor — *no site*, *esgotada*, *oculta*,
*novidade*, *promoção*. Com `defaultLayout('detail')` a linha ganha altura
para as três faixas.

**Estados vazios:** "Nenhuma peça em promoção. Marque *Promoção* em uma peça
para ela aparecer aqui." O Studio traz um vazio genérico; a frase certa vem do
i18n, que já é nosso.

---

## F · CADASTRO

**Abas, não wizard.** As quatro abas já existem e funcionam; um wizard rígido
atrapalharia a edição, que é o uso mais frequente — ela abre uma peça para
mudar o preço, não para cadastrar do zero.

A quinta etapa vira uma **view de documento**, ao lado do formulário:

```
┌─────────────────────────────────────────────────────────┐
│  Conjunto Bless                                         │
│  ┌──────────┬──────────┐                                │
│  │ EDITAR   │ REVISAR  │                                │
│  └──────────┴──────────┘                                │
```

Isso é o achado técnico da pesquisa: a view recebe `document.displayed`, que
são os valores **atuais, inclusive os não salvos**. A revisão mostra o que ela
acabou de digitar, não o que está gravado.

### 1 · A PEÇA

```
Nome da peça          [ Conjunto Bless                    ]
Valor (R$)            [ 159,00                            ]
Categoria             ( ) Vestidos  ( ) Macaquinhos
                      (•) Conjuntos ( ) Calças
                      ( ) Blusas    ( ) Moda Praia
Descrição da peça     [ Alfaiataria com uma proposta      ]
                      [ mais descolada.                   ]
Informações da peça   + Alfaiataria

▸ Configuração avançada
```

**O endereço da página sai do caminho.** Vai para dentro de "Configuração
avançada", fechado, e passa a se preencher sozinho a partir do nome enquanto
ela não tiver mexido nele. Ela nunca mais vê a palavra "endereço" no uso
normal; quem precisar renomear depois de divulgar, abre a gaveta.

**O preço** já ganhou teto, piso e duas casas na rodada da auditoria. As
mensagens são humanas: *"Valor acima de R$ 9.999,99 — confira se não faltou a
vírgula."* Nada de erro técnico.

**Situação sai daqui** e vai para *Onde aparece*, junto de novidade e promoção
— é tudo a mesma pergunta: onde essa peça aparece.

### 2 · FOTOS

```
A primeira foto é a que aparece na vitrine. Arraste para mudar a ordem.

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ ▣ PRINCIPAL    │  │                │  │                │
│                │  │                │  │                │
│     [foto]     │  │     [foto]     │  │     [foto]     │
│                │  │                │  │                │
│ ● Preto        │  │ ● Marrom       │  │ GERAL          │
└────────────────┘  └────────────────┘  └────────────────┘
        ⋮⋮                  ⋮⋮                  ⋮⋮
```

O arrastar já é do Sanity — não construo nada para isso.

Cada miniatura ganha selo: **PRINCIPAL** na primeira, a bolinha e o nome da
cor quando houver vínculo, **GERAL** quando não houver. Bater o olho e
entender o vínculo, que é exatamente o que você pediu.

Ao abrir uma foto:

```
Descrição da foto   [ Conjunto Bless preto, visto de frente. ]
                    Para quem usa leitor de tela e para o Google.

Esta foto é de      [ ● Preto            ▾ ]
                    ┌──────────────────────┐
                    │   Foto geral         │
                    │ ● Preto              │
                    │ ● Marrom             │
                    │ ● Bordô              │
                    └──────────────────────┘
                    Aparece quando a cliente escolhe essa cor.
```

**A lista sai das cores cadastradas naquela peça**, lida do próprio documento.
Acaba a digitação e acaba a classe inteira de erro que a validação existia
para pegar — a validação fica, como rede.

"Foto geral" é a primeira opção e o padrão. O texto de ajuda explica em uma
linha: *"Não representa uma cor específica — aparece na galeria e não responde
a nenhuma bolinha."*

### 3 · CORES E TAMANHOS

```
CORES

● Preto        ⋮⋮  ✕
● Marrom       ⋮⋮  ✕
● Bordô        ⋮⋮  ✕

+ ADICIONAR COR

  ┌─────────────────────────────────────────────┐
  │  Cores da Serenou                           │
  │  ● Preto      ● Branco     ● Off-white      │
  │  ● Marrom     ● Nude       ● Champanhe      │
  │  ● Azul       ● Azul-marinho                │
  │  ● Rosa       ● Verde      ● Amarelo        │
  │  ● Bordô      ● Vinho                       │
  │  ───────────────────────────────────────    │
  │  ✎ Outra cor                                │
  └─────────────────────────────────────────────┘

TAMANHOS

[ P ] [ M ] [ G ] [ GG ] [ G1 ]      ← clique para incluir
                                     ← clique de novo para tirar
+ Outro tamanho    (38, Único, …)

Esta peça não tem tamanho
```

**As cores comuns são atalho, não regra.** Preenchem nome e amostra de uma
vez. "Outra cor" abre nome livre + seletor visual, que é o que existe hoje. E
o mais importante: **os nomes não são normalizados.** Bordô e Vinho continuam
duas cores; Azul e Azul-marinho, duas cores. A lista é a nomenclatura
comercial da Grazi, escrita como ela escreve.

**Os tamanhos rápidos não são obrigatórios.** "Outro tamanho" aceita 38, Único,
o que for, e "Esta peça não tem tamanho" deixa o campo vazio de propósito — o
site simplesmente não desenha o seletor. Não forçar P/M/G em tudo era pedido
seu e é o comportamento real do site.

**Remover uma cor com fotos vinculadas** passa a ser erro de validação no
próprio campo de cores:

> A cor "Rosa" está em 3 fotos. Troque a cor dessas fotos antes de removê-la.

Não é popup — é a mesma faixa de erro que o resto do formulário usa, e aparece
antes de publicar. Popup fica reservado para o que apaga de verdade.

### 4 · ONDE APARECE

```
SITUAÇÃO

(•) Disponível     Aparece no site e a cliente pode pedir.
( ) Esgotada       Aparece no site com selo, sem botão de pedido.
( ) Oculta         Continua cadastrada aqui, e sai do site.

COLEÇÕES

[ ] Novidade       Aparece também em Novidades.
[ ] Promoção       Aparece também em Promoções.

  Novidade e Promoção não trocam a categoria.
  Um vestido em promoção continua sendo vestido, e aparece nos dois lugares.

[ Valor antes da promoção (R$)  ] ← aparece ao marcar Promoção
  É este valor que aparece riscado ao lado do preço.
```

**O valor da promoção muda de aba e vem para cá**, colado na caixa que o
liga. Acaba a ida e volta. A amarração entre os dois campos já foi feita na
rodada da auditoria, nos dois sentidos.

A palavra "Indisponível" vira **"Esgotada"** — é como a Grazi fala e é o que o
site escreve no selo.

### 5 · REVISAR

```
┌──────────────────────────────────────────────────────────┐
│  REVISAR                                                 │
│                                                          │
│  ┌────────┐   Conjunto Bless                             │
│  │        │   R$ 159,00                                  │
│  │  foto  │   Conjuntos · no site                        │
│  │        │   ● Preto  ● Marrom  ● Bordô                 │
│  └────────┘   P · M · G                                  │
│                                                          │
│  ✓ Nome                    ✓ Foto principal              │
│  ✓ Valor                   ✓ Cores (3)                   │
│  ✓ Categoria               ✓ Tamanhos (3)                │
│  ✓ Situação                                              │
│  ⚠ 2 fotos sem descrição                                 │
│                                                          │
│  ────────────────────────────────────────────────────    │
│  A MENSAGEM QUE CHEGA NO SEU WHATSAPP                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Oi! Vim pelo site da Serenou e gostei do         │    │
│  │ Conjunto Bless.                                  │    │
│  │                                                  │    │
│  │ Cor: Preto                                       │    │
│  │ Tamanho: M                                       │    │
│  │ Valor: R$ 159,00                                 │    │
│  │                                                  │    │
│  │ Queria saber mais sobre essa peça.               │    │
│  │                                                  │    │
│  │ Produto:                                         │    │
│  │ https://serenou.vercel.app/produto/conjunto-bless│    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  Exemplo com a primeira cor e o primeiro tamanho. A      │
│  cliente escolhe, e as linhas que ela não escolher       │
│  simplesmente não aparecem.                              │
│                                                          │
│  [ VER NO SITE ↗ ]   [ COPIAR LINK ]                     │
└──────────────────────────────────────────────────────────┘
```

**O checklist só cobra o que falta**, e o que falta vem da própria validação
do schema — não invento uma segunda lista de regras que possa divergir.

**A cor e o tamanho da prévia são exemplo, e a legenda diz isso.** Nada
fictício é gravado.

---

## G · CORES E FOTOS — O FLUXO INTEIRO

O ponto mais delicado é o vínculo foto↔cor, porque é o único lugar onde dois
campos precisam concordar.

```
Grazi adiciona uma cor  ──►  a cor entra na lista de "Esta foto é de"
        │
        ├─ escolhe das cores da Serenou ──► nome e amostra prontos
        └─ "Outra cor" ─────────────────► nome livre + seletor

Grazi abre uma foto     ──►  escolhe na lista (nunca digita)
        │
        ├─ escolhe uma cor ──► miniatura passa a mostrar ● Nome
        └─ "Foto geral" ────► miniatura mostra GERAL

Grazi remove uma cor
        │
        ├─ sem fotos vinculadas ──► sai, sem cerimônia
        └─ com fotos vinculadas ──► erro nomeando a contagem
                                    "A cor Rosa está em 3 fotos."

Cor sem nenhuma foto    ──►  não é erro. É aviso na revisão:
                             "Rosa não tem foto própria. O site mostra
                              as fotos das outras cores e avisa a cliente."
```

Esse último caso é real hoje — quatro cores do catálogo estão assim, e o site
já trata com elegância. O painel só precisa contar o mesmo fato para ela, em
vez de deixá-la descobrir na vitrine.

**Sobre a amostra:** cada cor mostra a bolinha do jeito que ela aparece no
site, mesmo tamanho e mesmo fio medido. É o único jeito de ela entender que
"Azul" pode fotografar como turquesa e ainda assim se chamar Azul.

---

## H · WHATSAPP

### A prévia — recomendo fazer

Hoje `mensagemProduto()` mora em `lib/loja.ts`, é função pura, e recebe nome,
cor, tamanho, preço e url. A prévia na aba REVISAR chama **essa mesma função**,
com os valores de `document.displayed`. Uma fonte, dois consumidores: o site e
o painel. Zero risco de divergir.

Complexidade **baixa**, e resolve a pergunta que a Grazi nunca conseguiu
responder sozinha.

### O editor global — recomendo NÃO fazer como você desenhou

Você pediu para eu avaliar antes, então avaliei.

**O que custa.** A mensagem é código hoje. Virar dado do Sanity exige: um tipo
de documento novo; a página de produto buscando esse documento e passando o
modelo por três níveis de componente até o `BotaoQuero`; um fallback para
quando o documento não existir ou vier quebrado; e validação de que o modelo
não perdeu `{produto}` nem `{url}`.

**O que arrisca.** O CTA do WhatsApp é o **único** caminho de conversão do
site. Um modelo salvo com um token digitado errado manda `{cor}` literal para
a cliente, ou uma mensagem sem o link da peça. O painel passaria a poder
quebrar a venda.

**O que ganha.** Trocar a saudação. É pouco, e é a única parte que ela
realmente iria querer mudar.

**A alternativa que eu faria no lugar.** Em CONFIGURAÇÕES, **dois campos de
texto simples**, sem token nenhum:

```
SAUDAÇÃO
[ Oi! Vim pelo site da Serenou e gostei do                ]
                                          ↑ o nome da peça entra aqui

FECHO
[ Queria saber mais sobre essa peça.                      ]

Assim a mensagem vai chegar:
┌────────────────────────────────────────────┐
│ Oi! Vim pelo site da Serenou e gostei do   │
│ Conjunto Bless.                            │
│                                            │
│ Cor: Preto                                 │
│ Valor: R$ 159,00                           │
│                                            │
│ Queria saber mais sobre essa peça.         │
│                                            │
│ Produto: https://…                         │
└────────────────────────────────────────────┘

[ RESTAURAR O TEXTO PADRÃO ]
```

O bloco de dados — Cor, Tamanho, Valor, Produto — continua montado por código
e **não é editável**. Ela muda o tom; não consegue quebrar a estrutura, não
consegue perder o link, não existe `{token}` para digitar errado.

Complexidade **média** mesmo assim, por causa do fetch e do fallback. Por isso
classifiquei como **ADMIN 3**, não essencial.

---

## I · CENTRAL DE AJUDA

Ferramenta própria, conteúdo escrito por nós, sem depender de internet nem de
link externo. Uma coluna, tipografia do site, navegação lateral.

```
AJUDA

COMEÇANDO
  Cadastrar uma peça, do começo ao fim        ← o guia de 6 passos

O DIA A DIA
  Mudar o preço de uma peça
  Esconder uma peça que acabou
  Marcar como esgotada
  Trazer de volta uma peça escondida

FOTOS
  Qual foto aparece primeiro
  Mudar a ordem das fotos
  Vincular uma foto a uma cor
  O que é uma foto geral

CORES E TAMANHOS
  Adicionar uma cor
  Nome da cor × bolinha da cor
  Remover uma cor
  Adicionar tamanhos
  Quando a peça não tem tamanho

ONDE A PEÇA APARECE
  Escolher a categoria
  Novidades
  Promoções
  Disponível, esgotada, oculta

WHATSAPP
  Como a mensagem é montada

QUANDO ALGO NÃO SAI COMO ESPERADO
  Cadastrei e não apareceu no site
  A foto errada está na vitrine
  Escolhi uma cor e a foto não mudou
  Mudei o preço e o site mostra o antigo
```

Duas páginas merecem tratamento próprio, porque são onde a dúvida realmente
mora: **cores** e **status**.

**Cores** explica a diferença entre o nome (o que vai na mensagem do WhatsApp)
e a bolinha (o que a cliente clica), e o que acontece quando uma cor não tem
foto.

**Status** é curto e com exemplo real de cada um:

> **Disponível** — a peça aparece no catálogo e o botão *Quero essa peça* leva
> para o seu WhatsApp.
> **Esgotada** — continua aparecendo, com o selo *Esgotado*, e sem botão. Use
> quando quiser que a cliente saiba que a peça existe.
> **Oculta** — sai do site inteiro. O cadastro e as fotos ficam guardados aqui.
> É o que fazer quando a peça acaba de vez.

"Mudei o preço e o site mostra o antigo" é uma pergunta que ela **vai** fazer:
o site guarda o catálogo por um minuto. A resposta é uma frase — *"espere um
minuto e atualize a página"* — e ela só existe se estiver escrita.

### Microajuda nos campos

Não substitui a Ajuda, evita ir até ela. Frases de uma linha, no campo:

| Campo | Texto |
|---|---|
| Primeira foto | É a foto que aparece no catálogo. |
| Esta foto é de | Aparece quando a cliente escolhe essa cor. |
| Foto geral | Não é de uma cor específica — fica na galeria. |
| Oculta | A peça fica guardada aqui e sai do site. |
| Promoção | Aparece também em Promoções, sem sair da categoria. Precisa do valor de antes. |
| Esgotada | Aparece no site com selo, sem botão de pedido. |

---

## J · VISUAL

O painel já herda a paleta do site. O que falta é **consistência de
componente**, não paleta nova.

### Tokens

```
Fundo de trabalho      linho-alto   #f8f4ed
Fundo da página        linho        #f2ece2
Superfície secundária  areia        #e6dbcb
Divisores              areia-forte  #d3c3ac
Tipografia             carvão       #16130f
Texto secundário       carvão-médio #524a3f
Metadados              carvão-fraco #645b4f
Acento / foco          oliva        #565e38
Atenção                #9a7b32
Perigo                 #8f3d2f
```

Todos já existem em `tema.ts`. Nenhuma cor nova.

### Uma decisão que preciso que você tome

O `painel.css` de hoje impõe **canto reto** em botões, campos e menus — está
lá com comentário, foi escolha. Você pediu "radius suave". São coisas opostas.

Minha recomendação: **radius suave, com os mesmos tokens do site** —
`--r-acao` 11px em botões e campos, `--r-painel` 13px em cartões e diálogos,
`--r-mini` 8px em miniatura. Isso aproxima o painel da loja, que é o que você
quer, e é uma troca de três linhas no CSS. Mas é reversão de uma decisão
anterior, e por isso pergunto em vez de fazer.

### Componentes

Tudo sai do `@sanity/ui`, que já está instalado — `Card`, `Stack`, `Badge`,
`Button`, `Flex`, `Grid`, `Text`. Não escrevo componente do zero, e assim o
painel continua parecendo um painel, com os mesmos estados de foco e teclado
que o Studio já dá.

Duas notas técnicas que importam para a manutenção:

**O `painel.css` é frágil por construção.** Ele mira `data-ui="Navbar"`,
`data-testid="structure-tool-list-pane"` e afins — atributos internos do
Sanity. Funcionam hoje e podem mudar num upgrade maior. É o preço de
personalizar o Studio e não tem alternativa melhor, mas vale saber que uma
atualização do Sanity pede uma conferência visual.

**O toast mudou de lugar.** Na versão instalada, `useToast` da raiz do
`@sanity/ui` é um stub que quebra; o caminho certo é `@sanity/ui/toast`. Só
uso toast para o que realmente aconteceu — publicou, ocultou, copiou o link.
Nada de "salvo automaticamente" falso: o Studio salva rascunho sozinho e já
mostra isso.

---

## K · MOBILE

O Studio 6 é responsivo — está no README do pacote — mas **não tem nenhuma API
para configurar comportamento mobile**. Os painéis colapsam sozinhos e é isso.

Desktop-first, mobile-capable, como você disse. O que precisa funcionar no
telefone:

| Tarefa | 390px |
|---|---|
| Mudar o preço | abre a peça, aba *A peça*, um campo |
| Ocultar uma peça | ação no menu do documento, sem abrir aba |
| Trocar a situação | aba *Onde aparece*, três opções |
| Adicionar uma foto | o seletor nativo do telefone já funciona |
| Editar uma cor | lista vertical, alvo de 44px |

O que eu desenho com o telefone em mente:

- **INÍCIO** empilha em uma coluna; os quatro números viram grade 2×2.
- **Cores comuns** vira grade de 2 colunas, cada opção com 44px de alvo.
- **Tamanhos rápidos** já são botões grandes — funcionam melhor no toque que a
  digitação de hoje.
- **REVISAR** empilha foto, dados, checklist e mensagem.
- A **prévia do WhatsApp** rola dentro do próprio quadro, não estica a página.

A rota já traz `viewport-fit=cover` e `interactive-widget: resizes-content`,
que é o que faz o teclado empurrar em vez de cobrir. Isso já está certo.

---

## L · COMPLEXIDADE, ITEM A ITEM

| # | Item | Complexidade | Por quê |
|---|---|---|---|
| 1 | Linha da lista com preço, categoria, cores, tamanhos, estado | **baixa** | `prepare` do schema, um arquivo |
| 2 | "Ver no site" e "Copiar link" | **baixa** | document action, 30 linhas |
| 3 | Valor da promoção junto da caixa | **baixa** | mover um campo de grupo |
| 4 | Validação de cor removida com fotos | **baixa** | validação de array, como a que já existe |
| 5 | Microajuda nos campos | **baixa** | `description` em 6 campos |
| 6 | Filtros por categoria e coleção | **baixa** | sublista na structure |
| 7 | Estados vazios com frase certa | **baixa** | i18n, que já é nosso |
| 8 | Prévia do WhatsApp | **baixa** | view + a função que já existe |
| 9 | Selos na miniatura da foto | **média** | `components.preview` do item |
| 10 | "Esta foto é de" como lista | **média** | input próprio + `useFormValue` |
| 11 | Cores comuns | **média** | input próprio no array de cores |
| 12 | Tamanhos rápidos | **média** | input próprio no array de tamanhos |
| 13 | Endereço da página fora do caminho | **média** | fieldset colapsado + preenchimento a partir do nome |
| 14 | Aba REVISAR com checklist | **média** | view + leitura da validação |
| 15 | INÍCIO | **média** | ferramenta própria + uma consulta |
| 16 | AJUDA | **média** | ferramenta própria; o custo é escrever, não programar |
| 17 | Duplicar peça | **média** | action, com slug novo e entrando como rascunho |
| 18 | Badges de documento | **baixa** | `document.badges` |
| 19 | Saudação e fecho editáveis | **média** | documento único + fetch + fallback |
| 20 | Editor de modelo com tokens | **alta** | ver seção H — não recomendo |
| 21 | Prévia antes de publicar (rascunho) | **alta** | exige token de leitura, draft mode e rota de preview |
| 22 | Lista de peças como ferramenta própria | **alta** | reimplementa navegação e diverge a cada upgrade |

---

## M · CLASSIFICAÇÃO

### ADMIN 1 — ESSENCIAL

Sete itens, todos de complexidade baixa ou média, e todos batendo na sua
régua: menos erro, menos dependência de você, mais rapidez.

1. **"Esta foto é de" como lista** — acaba a digitação de nome de cor e a
   classe inteira de erro que ela produz. *(média)*
2. **Selos na miniatura: PRINCIPAL, GERAL, ● Cor** — bater o olho e entender.
   *(média)*
3. **"Ver no site" e "Copiar link"** — acaba o "será que entrou?". *(baixa)*
4. **Valor da promoção junto da caixa de promoção** — acaba a ida e volta
   entre abas. *(baixa)*
5. **Validação de cor removida com fotos vinculadas** — fecha o último buraco
   de dado inconsistente do schema. *(baixa)*
6. **Linha da lista informativa** — reconhecer a peça sem abrir. *(baixa)*
7. **Endereço da página fora do caminho** — tira do caminho dela um conceito
   que não é dela, e acaba a falha de publicação por esquecer de clicar em
   Gerar. *(média)*

### ADMIN 2 — RECOMENDADO

8. **INÍCIO** com números reais, atalhos e mexidas recentemente. *(média)*
9. **AJUDA**, com os guias de cores e status primeiro. *(média)*
10. **Aba REVISAR** com checklist e prévia do WhatsApp. *(média)*
11. **Tamanhos rápidos** P M G GG G1, sem forçar. *(média)*
12. **Cores comuns** da Serenou, sem normalizar nome. *(média)*
13. **Filtros** por categoria e coleção dentro de Catálogo. *(baixa)*
14. **Microajuda** nos seis campos que confundem. *(baixa)*
15. **Estados vazios** com a frase certa. *(baixa)*

### ADMIN 3 — OPCIONAL

16. **Duplicar peça** — só com slug novo e entrando como rascunho. *(média)*
17. **Badges de documento** no cabeçalho da peça aberta. *(baixa)*
18. **Saudação e fecho editáveis** em Configurações — a versão sem token da
    seção H. *(média)*
19. **Bloco "primeira vez por aqui"** no rodapé do INÍCIO. *(baixa)*
20. **Radius suave** no painel, se você aprovar a reversão. *(baixa)*

### ADMIN 4 — NÃO VALE AGORA

21. **Editor de modelo com `{tokens}`** — o painel passaria a poder quebrar o
    único caminho de conversão do site, para ganhar a troca de uma saudação.
22. **Prévia de rascunho antes de publicar** — exige token de leitura no
    servidor, draft mode e uma rota nova. O "Ver no site" depois de publicado
    resolve 90% da insegurança por 5% do custo. Reavaliar se um dia ela
    reclamar de publicar para conferir.
23. **Lista de peças reconstruída como ferramenta** — controle total de render
    ao custo de reimplementar busca, ordenação e navegação, e de divergir do
    Studio a cada atualização.
24. **Atalho de ocultar direto na lista** — você mesmo condicionou a "não ficar
    fácil ocultar acidentalmente". Numa lista de toque, um botão que tira a
    peça do site fica fácil demais. A ação existe dentro da peça, com o
    contexto na frente.

---

## O QUE EU FARIA PRIMEIRO

Se for para escolher uma tacada só, é o **ADMIN 1**. São sete itens, nenhum
alto, e juntos eles mudam o cadastro de uma peça de "preencher formulário com
cuidado" para "escolher opções". O INÍCIO e a AJUDA são bonitos e úteis, mas
não é neles que ela perde tempo hoje — é digitando nome de cor pela quadragésima
quinta vez e voltando de aba para achar o campo da promoção.

Me diga quais itens entram e eu implemento em uma rodada, com verificação no
painel de verdade antes de commitar.
