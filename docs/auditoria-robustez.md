# SERENOU — AUDITORIA DE ROBUSTEZ

**Data:** 16/09/2026 · **Commit auditado:** `dad078a` · **Produção:** https://serenou.vercel.app

Nada foi alterado. Nenhum commit, nenhuma feature, nenhum refactor.

**Método.** Tudo que está marcado como *medido* foi verificado no ar, com navegador ou
requisição real, e o número está no texto. O que saiu só de leitura de código está
marcado como *por leitura*. Duas hipóteses que eu tinha sobre motion **não se
confirmaram** no teste e estão registradas como não confirmadas, em vez de somarem à
lista de problemas.

---

## 1 · INVENTÁRIO

### Home (`app/page.tsx`)

| Peça | Estado |
|---|---|
| Intro | Cortina em vídeo, uma vez por sessão (`sessionStorage`), com botão Pular, 4 caminhos de desistência (5 s sem carregar, erro das `<source>`, 12 s absoluto, autoplay bloqueado) |
| Hero | `Opening.tsx` — sticky `100svh`, 4 fotografias em rotação a cada 2,9 s, tinta clara/escura por `data-hero-tom` |
| Manifesto | `SplitText` por palavras, revelado no scroll |
| 01 Leve / 02 Versátil | Dois capítulos; o segundo com palco `250svh` e três vitrines empilhadas |
| A Serenou | Bloco escuro, transição cromática pelo `[data-canvas]` |
| Loja física | Endereço, horário, Google Maps, Waze |
| Rodapé | Entregas, contato (Instagram, WhatsApp), assinatura Settei |
| GSAP | `useGSAP` + `gsap.matchMedia()` com três condições (desktop / mobile / reduce) em todas as 5 cenas |
| Sticky/pin | **Nenhum `pin:` do ScrollTrigger** — tudo é `position: sticky` do CSS |
| Reduced motion | Condição `reduce` em todas as cenas **e** espelho em CSS que devolve `opacity:1`/`transform:none` — nada fica invisível |
| Produtos | A home **não** lista produtos. É estática pura, sem `revalidate` |

### Catálogo (`app/catalogo/page.tsx`)

Categorias e coleções vindas de `lib/loja.ts` · filtro por `?c=` **resolvido no
servidor** (desktop e telefone leem a mesma fonte) · filtro desconhecido cai em "tudo"
· grade de 3 ou 4 colunas conforme o tamanho do acervo (`GRADE_DENSA = 7`) · card com
foto, segunda foto, bolinhas de cor clicáveis, preço, parcelamento e gatilho do Guia de
Medidas · peça oculta filtrada **no GROQ** · peça indisponível aparece com selo
"Esgotado" · dois estados vazios distintos.

### Produto (`app/produto/[slug]/page.tsx`)

Galeria em pilha com miniaturas · seletor de cor que troca a fotografia · seletor de
tamanho com esgotado riscado · preço + preço anterior riscado · parcelamento ·
descrição · CTA WhatsApp com mensagem contextual · Guia de Medidas · acordeões ·
entregas · trilha Início › Categoria › Peça · "Você também pode gostar" (4 vagas,
determinístico) · aviso quando a cor escolhida não tem foto própria · ISR 60 s ·
`dynamicParams: true`.

### Admin (`/admin`)

Studio embutido, **em português de verdade** (locale oficial + 16 frases próprias:
"peça" no lugar de "documento") · três entradas: Catálogo, Peças ocultas, Peças de
teste · campos com nome de loja, nenhum nome técnico · preview com miniatura,
categoria, preço formatado e situação · recursos do plano Growth desligados um a um,
para nenhum botão parar de responder depois do trial · tema da marca.

### Infra

Next 16.3 (App Router, Turbopack) · Vercel · Sanity 6.13, dataset `production`, API
fixada em `2026-09-01` · imagens pelo CDN do Sanity com `auto=format` · duas variáveis
de ambiente, **nenhuma secreta** · ISR 60 s · `strict: true`, sem
`ignoreBuildErrors`, sem `ignoreDuringBuilds`.

---

## 2 · ROBUSTEZ DE DADOS

O tipo `Produto` (`lib/catalogo.ts`) é o contrato único, e o adaptador em
`sanity/lib/produtos.ts` blinda quase tudo com `??`. Percorri os casos:

| Caso | Comportamento | Veredito |
|---|---|---|
| 1 cor / várias cores | Seletor aparece; com 0 cores some inteiro | ok |
| Sem tamanho / vários | Idem; "Todos os tamanhos esgotados" quando todos caem | ok |
| Cor sem foto | Galeria mantém a foto atual + aviso explícito ao lado do seletor | ok — **medido em 39 cores; 4 caem no fallback, todas por falta de foto, nenhuma quebra** |
| Foto geral (sem `cor`) | Fica na galeria e não responde a cor nenhuma | ok, é o desenho |
| Várias fotos da mesma cor | Primeira ganha o slot; as outras ficam na galeria | ok |
| Preço decimal | Reais → centavos no adaptador, `Math.round` | ok |
| Indisponível | Selo "Esgotado", CTA substituído por caixa inerte | ok |
| Oculto | Filtrado no GROQ: some do grid, da lista de rotas e da busca por slug. **404 medido** | ok |
| Sem descrição | `resumo ?? ""` → parágrafo vazio de 0px, sem buraco | ok |
| Sem categoria válida | Cai em `"vestidos"` **silenciosamente** (`produtos.ts:78`) | ver C-4 |
| Mudança de categoria | Só muda o filtro e a trilha; slug não muda | ok |
| Promoção | Ver seção 23 — **desacoplada**, é o achado B-3 |
| Novidade | Flag manual, nunca expira. Ver seção 23 | ok, mas manual |

**Onde o dado errado chega à tela:** só em dois lugares, e os dois vêm de validação que
falta no cadastro, não do código do site — preço sem teto e preço riscado desacoplado
da promoção (B-3).

**Mensagem do WhatsApp:** medida em 4 cenários. Nunca sai campo vazio, nunca sai
marcador tipo `[TAMANHO]`. Cada linha só existe se o dado existir.

---

## 3 · VALIDAÇÃO DO ADMIN

O schema **ajuda** a Grazi na maior parte, e a validação cruzada de `imagens[].cor`
contra as cores da peça (normalizando acento e caixa) é a melhor peça do arquivo. O que
falta:

| Caso | Hoje |
|---|---|
| Preço negativo | **erro** (`min(0)`) |
| Sem nome / sem categoria / sem foto | **erro** |
| Slug vazio / slug duplicado | **erro** (validador nativo do Sanity) |
| Status obrigatório | **erro** |
| `imagens[].cor` inexistente na peça | **erro**, com a lista das cores válidas |
| Resumo acima de 240 caracteres | aviso |
| **Preço sem teto e sem casas decimais** | **nada** — `18990` publica R$ 18.990,00 em silêncio; `0` é aceito |
| **Promoção sem preço anterior** | **nada** — selo "Promoção" sem desconto visível |
| **Preço anterior sem promoção** | **nada** — o campo fica oculto mas o valor continua gravado e **o site continua riscando o preço** |
| Duas cores com o mesmo nome | **nada** — duas bolinhas iguais, troca de foto ambígua |
| Tamanho duplicado | **nada** — dois botões "M", um riscado e outro não |
| Cor sem amostra (hex) | **nada** — cai no bege `#cbbda6`; duas cores sem hex viram duas bolinhas idênticas |
| Alt da foto | **nada, nem aviso** — há fallback genérico ("Nome, fotografia 3") |

**Estado real do dataset hoje (medido pela API pública):** 18 documentos, 0 sem alt, 0
marcados como teste, 0 em promoção, 0 em novidade, todos com pelo menos uma foto. **Os
buracos acima são armadilhas, não estragos já feitos.** É o melhor momento para fechá-los.

---

## 4 · ESTADOS VAZIOS

| Situação | Hoje | Veredito |
|---|---|---|
| Categoria sem peças | "Nenhuma peça nesta seleção por enquanto" + link WhatsApp | bom |
| Promoções / Novidades vazias | Mesmo texto acima | bom |
| Catálogo inteiro vazio | "As peças estão sendo fotografadas e entram aqui em breve" + WhatsApp | **bom como texto, arriscado como causa** — ver C-2 |
| Peça sem cores / sem tamanhos | Seletor não é desenhado | bom |
| Cor sem foto | Aviso nomeando a cor, ao lado do seletor | bom |
| Relacionados insuficientes | Completa com o resto do catálogo; some se não houver nenhum | bom |
| Slug inexistente / peça oculta | `notFound()` → **404 padrão do Next, em inglês** | **B-2** |
| Sanity indisponível | `consultar()` devolve lista vazia e loga; o site não cai | bom, com uma ressalva em C-2 |

---

## 5 · ERROS E REDE

Existe: **fallback** (`consultar()` em `sanity/lib/produtos.ts` engole a exceção,
registra em `console.error` e devolve vazio — o site nunca fica fora do ar por causa do
Sanity), **`notFound()`** nas duas pontas, **imagem com dimensões nativas e cor
dominante de placa** enquanto a foto não chega.

Não existe: `error.tsx`, `global-error.tsx`, `loading.tsx`, `not-found.tsx`, retry.

E uma consequência que vale nomear: se o Sanity falhar **e** o cache ISR de uma página
de produto vencer no mesmo minuto, `buscarProduto` devolve nada e a rota vira
`notFound()` — 404 para uma peça que existe, e o Next guarda esse 404. Não é hipotético:
é o mesmo caminho que hoje devolve 404 corretamente para peça oculta. Ver C-2.

---

## 6 · SEO — medido no ar

**Bom, e melhor do que eu esperava.** Em `/produto/conjunto-bless`:

```
<title>Conjunto Bless | Serenou Beach</title>
<meta name="description" content="Alfaiataria com uma proposta mais descolada. · R$ 159,00">
<link rel="canonical" href="https://serenou.vercel.app/produto/conjunto-bless">
og:title · og:description · og:image (1200×1600) · og:image:alt · og:type · og:locale
twitter:card=summary_large_image · twitter:title · twitter:description · twitter:image
```

Compartilhar um link de peça no WhatsApp **já gera prévia com nome, foto, descrição e
preço**. Título dinâmico também no catálogo (acompanha o filtro). Favicon,
`apple-touch-icon` e `icon.png` existem. Slugs limpos, em português, sem id.

Falta: **`robots.txt` e `sitemap.xml` — os dois devolvem 404** (medido). E a foto de OG
é 1200×1600 (retrato 3:4); as plataformas cortam para 1,91:1, então a prévia grande
mostra uma faixa do meio da peça. Funciona; não está enquadrado.

---

## 7 · STRUCTURED DATA

**Não existe nenhum JSON-LD hoje.** O que faria sentido, e o que não:

- **`LocalBusiness`** — vale. A loja é física, tem endereço e horário confirmados, e é
  o dado que alimenta busca local ("loja de roupa perto de mim"). Todos os campos que
  ele pede já existem em `lib/loja.ts`. Único cuidado: `openingHours` deve listar só
  terça-sábado, sem deduzir "fechado" para os outros dias.
- **`Product`** — vale, com **uma decisão consciente**. `name`, `image`, `description`,
  `offers.price`, `priceCurrency` são todos reais. O problema é `offers.availability`:
  o site não tem estoque quantitativo, e declarar `InStock` para uma peça que a Grazi
  ainda não ocultou é afirmar disponibilidade que ninguém verificou. **Ou se mapeia
  honestamente (`disponivel`→InStock, `indisponivel`→OutOfStock) ou se omite o campo.**
  Não inventar SKU, GTIN, review, frete nem prazo — o Google marca dado incompleto como
  erro no Search Console, e dado *errado* pode render penalidade.
- **`BreadcrumbList`** — vale, e é o mais barato: a trilha Início › Categoria › Peça já
  está renderizada, é só descrevê-la.
- **`Organization`** — redundante com `LocalBusiness`. Não recomendo os dois.

**Risco de dado incompleto:** rich result recusado (nada acontece) ou, se afirmar preço
ou disponibilidade que não confere, desconfiança do Google naquele domínio. Por isso a
recomendação é: `LocalBusiness` + `BreadcrumbList` primeiro, `Product` só com os campos
que temos.

---

## 8 · ACESSIBILIDADE — medido

**Bem resolvido:**

- Ordem de tabulação limpa e **foco visível em todos os 16 primeiros pontos** (medido):
  skip link → marca → Catálogo → as 6 categorias da gaveta → Novidades → Promoções →
  Guia → WhatsApp → cards.
- Gaveta do menu abre por `:focus-within`: **acessível por teclado sem JS**.
- Hierarquia de títulos: `h1 → h2`, **sem salto**, em catálogo e produto (medido na
  árvore de acessibilidade: 22 headings no catálogo, nenhum `h3` órfão).
- Modal é `<dialog>` nativo com `showModal()`: ESC, focus trap, retorno de foco e
  inércia do fundo vêm de graça; clique fora e trava de rolagem foram acrescentados à
  mão. **Os cinco itens que você pediu estão cobertos.**
- Guia de Medidas é tabela de verdade, com `<th scope>` nas duas direções.
- Tamanho esgotado tem `sr-only` ", esgotado" — não depende do risco visual.
- Contraste das amostras **medido e calculado** na rodada anterior (≥3:1 garantido).
- `reduced-motion` devolve todo o conteúdo em estado final visível.
- Seta do CTA e divisores são `aria-hidden`.

**Onde a cor depende só da bolinha:** no **card do catálogo** o nome da cor existe
apenas em `aria-label`/`title` e `sr-only` — quem enxerga, mas não distingue os tons, e
está no telefone (sem hover) não tem como saber o nome. Na página de produto o nome
aparece na legenda, mas **só depois de escolher**. Ver C-5.

**Menor:** a gaveta não tem `aria-expanded` nem fecha com ESC — quem usa leitor de tela
encontra 7 links em sequência sem saber que 6 são filhos do primeiro. Não quebra nada.

---

## 9 · PERFORMANCE — medido em produção

| Rota | LCP | CLS | Requests | JS | Fontes | HTML (bruto → transferido) |
|---|---|---|---|---|---|---|
| Home | 732 ms | 0,011 | 32 | 203 KB | 118 KB | 44 KB → 9,8 KB |
| Catálogo | **508 ms** | **0** | 50 | 217 KB | 118 KB | 249 KB → 19 KB |
| Produto | **428 ms** | 0,003 | 38 | — | 118 KB | 123 KB → 14,6 KB |

Isto está **bom**, e não precisa de otimização. `sizes` honestos em quatro contextos,
larguras com teto em 1200 (o nativo das fotos), `auto=format` negociando AVIF/WebP,
dimensões nativas em toda imagem (por isso CLS ≈ 0), `loading="lazy"` em 16 das 18
imagens do catálogo.

Dois desperdícios pequenos, nenhum urgente: `quality(90)` aplicado igualmente às
miniaturas de 84px, e o `asset.url` (URL do original inteiro) viajando no payload de
cada imagem só para servir de booleano.

O item mais pesado da home é o **vídeo da intro** (~930 KB medidos) — e ele continua
baixando depois de "Pular" (ver D-1).

---

## 10 · MOTION — ciclo de vida

**O que está sólido** (verificado no código): `useGSAP` + `gsap.matchMedia()` com
revert em duas camadas; as três condições registradas juntas em todas as cenas;
**nenhum `pin:`**, logo nenhum `pin-spacer` para sobreviver a um revert; `overflow-x:
clip` em vez de `hidden` no `html` (com `hidden`, o sticky quebraria);
`ScrollTrigger.refresh()` na ordem certa ao fim da cortina; `marcarComoVista()` na
entrada e não na saída, para refresh no meio da intro não recomeçar; `fromTo` com
`immediateRender:false` nas transições de fundo; guardas de SSR em todo uso de
`window`/`document`; nenhum listener global vazando.

**Confirmado por teste:** ao arrastar a janela cruzando 1024px com a home no topo, **a
entrada inteira da hero toca de novo** — o título é remascarado e sobe outra vez
(screenshot anexo). Causa: a callback do `matchMedia` não devolve função de limpeza, e
na troca de condição o GSAP reverte e reexecuta a callback, que cai no ramo "sem intro"
e dispara a timeline completa. É desconfortável, não quebra nada.

**Duas hipóteses que NÃO se confirmaram** e que eu registro como descartadas em vez de
somar à lista: (a) o `data-hero-tom` ficar preso em "claro" com a foto escura de volta
— testei o resize e tom e fotografia continuaram coerentes; (b) qualquer
`transform`/`opacity` inline preso na troca desktop↔mobile — o revert do contexto os
remove.

**Lacuna real, por leitura:** não existe `document.fonts.ready → ScrollTrigger.refresh()`
em lugar nenhum. Com cache frio e a fonte chegando depois, os `start: "top 82%"` foram
calculados com a métrica do fallback e os reveals `once: true` disparam fora da dobra —
a pessoa chega na seção e ela já está parada. Uma linha resolve. Ver C-6.

---

## 11 · RESPONSIVIDADE

Medido em 1440, 1280, 900, 430, 390 e 360 nas rodadas anteriores e nesta. Grade,
tipografia, gaveta, menu do telefone, modais e CTA se comportam. Landscape e 1366×768
entram no desktop normalmente.

**Um ponto geométrico, por leitura e não medido em aparelho real:** o projeto usa `svh`
em todo lugar (nunca `dvh`/`lvh`). `100svh` é a altura com a barra do navegador
**visível** — constante, que é ótimo para o ScrollTrigger. O preço é que, quando a barra
do Safari/Chrome no telefone se recolhe, a área visível fica ~60–100px maior que a placa
sticky, e aparece uma faixa do fundo embaixo da hero. É um trade-off deliberado
(estabilidade × cobertura), não um bug, e eu não consigo reproduzir a barra dinâmica
neste ambiente. Vale olhar no seu iPhone antes de decidir se incomoda.

---

## 12 · WHATSAPP / CONVERSÃO — medido

Funil: Home → Catálogo → Produto → escolha → WhatsApp. Testei a mensagem em 4 cenários:

```
Oi! Vim pelo site da Serenou e gostei do Conjunto Bless.

Cor: Bordô
Valor: R$ 159,00

Queria saber mais sobre essa peça.

Produto:
https://serenou.vercel.app/produto/conjunto-bless
```

Sem escolha nenhuma, some a linha "Cor:" e o resto fica igual. **Nunca sai campo
vazio.** Peça esgotada não tem CTA — tem uma caixa inerte "Peça esgotada", que é o
certo. Link absoluto correto no preview e continuará correto no domínio final (vem de
`window.location.origin`, não de constante).

**A única confusão possível para a Grazi:** a mensagem de quem *não escolheu* cor é
idêntica à de uma peça que *não tem* cor. Nos dois casos chega só "Valor: …". Ela
precisa abrir o link para saber se deve perguntar a cor ou não. Ver C-7.

---

## 13 · ANALYTICS

**Não existe nenhum.** Medido: os únicos hosts contactados são `serenou.vercel.app` e
`cdn.sanity.io`. Zero visita, zero produto visto, zero clique de WhatsApp, zero origem.

Classificação: **Fase 2**, não essencial. Mas com uma observação de negócio honesta —
hoje não há como responder "qual peça mais gera conversa no WhatsApp?", e essa é
provavelmente a pergunta mais valiosa que este site poderia responder para a Grazi. O
Vercel Analytics é uma linha e não usa cookie. Não é urgente; é barato.

---

## 14 · PRIVACIDADE / LGPD

**Medido: zero cookies. Zero terceiros. Zero tracker. Zero embed.** O único dado
guardado no navegador é `sessionStorage: serenou_intro_seen = true`, que não é dado
pessoal e some ao fechar a aba. Não há formulário, não há login, não há coleta.

**Resposta direta: não é necessário banner de cookie.** Colocar um só por estética seria
pedir consentimento para nada e piorar a primeira tela. Se um dia entrar analytics,
escolher um sem cookie mantém essa resposta.

---

## 15 · SEGURANÇA — medido

**Bem resolvido, e vale registrar:**

- **Nenhum token em código, em bundle ou no Git.** `.env.local` nunca foi commitado;
  `.gitignore` cobre `.env*`.
- O importador lê `SANITY_WRITE_TOKEN` do ambiente, aborta sem ele, e nunca imprime o
  valor.
- **Não existe cliente de escrita no projeto.** Quem escreve é o Studio, autenticado
  como a Grazi.
- **Testei escrita anônima na API: recusada** (`Insufficient permissions`).
- **Testei leitura de rascunhos sem sessão: vazio.**
- `/admin` sem conta carrega só a tela de login do Sanity, e está com
  `robots: noindex`.
- `strict: true`, sem `ignoreBuildErrors`, sem `ignoreDuringBuilds`.
- HSTS presente (via Vercel).

**Duas coisas para saber, nenhuma grave:**

1. O dataset é público para leitura (decisão de plano, documentada). Consultei a API sem
   token e li o catálogo — inclusive **a peça oculta**. Ou seja: "oculta" significa
   *fora do site*, não *secreta*. Para esta loja isso não tem consequência (não há nada
   confidencial em roupa não lançada), mas é bom você saber onde está a fronteira antes
   de usar "oculto" para guardar uma coleção não divulgada.
2. Faltam cabeçalhos de segurança: `X-Content-Type-Options`, `Referrer-Policy` e
   sobretudo `frame-ancestors` — sem ele, `/admin` pode ser posto num iframe de outro
   domínio. Ver C-8.

**Lembrete operacional:** apagar o `importar/token.txt` do seu computador e revogar
aquele token de escrita no Sanity. Ele já cumpriu a função.

---

## 16 · OPERACIONAL — a Grazi consegue sozinha?

| Fluxo | Consegue? | Risco de quebrar algo |
|---|---|---|
| Adicionar peça | sim | nenhum — nome, categoria, preço e ≥1 foto são obrigatórios |
| Alterar preço | sim | **digitar `18990` publica R$ 18.990,00 sem aviso** (B-3) |
| Trocar foto | sim | se a foto nova tiver `cor` de uma cor que ela renomeou, a validação avisa |
| Ocultar peça | sim | **a cliente que tem o link antigo cai num 404 em inglês** (B-2) |
| Reativar peça | sim | nenhum |
| Adicionar cor | sim | duas cores com o mesmo nome passam sem aviso |
| Remover cor | sim | **se houver foto marcada com essa cor, o documento fica inconsistente** — a validação só roda ao editar o campo da foto, não ao apagar a cor |
| Alterar tamanho | sim | tamanho duplicado passa sem aviso |
| Promoção | sim | **é o fluxo mais confuso do painel**: precisa marcar a caixa na aba "Onde aparece", voltar para a aba "A peça" e preencher o campo que só então aparece. E desmarcar depois **não apaga** o preço anterior — a peça sai de Promoções e continua com o preço riscado (B-3) |
| Novidade | sim | nunca expira sozinha; alguém precisa desmarcar |

O painel é bom. O que falta é validação nas três ou quatro pontas acima, não redesenho.

---

## 17 · RECUPERAÇÃO

**Melhor do que o esperado, e sem nenhum backup montado à mão:**

- **Sanity** guarda histórico por documento — dá para ver versões anteriores e
  restaurar. Documento apagado vai para a lixeira do dataset por 30 dias no plano atual.
- **Assets** (as 57 fotos) são deduplicados por hash e **não são apagados junto com o
  documento** — apagar uma peça não perde a fotografia.
- **Git** tem todo o código; `main` e `preview-sanity` em `dad078a`.
- **Vercel** guarda todos os deploys e faz rollback instantâneo por botão.
- **`scripts/lote.json`** é o mapa das 13 peças importadas — dá para recadastrar.

**O ponto fraco**, por leitura: `scripts/importar-lote.mjs` usa `createOrReplace` com
`_id` fixo (`produto-<slug>`). Rodar de novo **sobrescreve por inteiro** as 13 peças e
devolve preço, status, promoção e novidade ao que está no JSON — apagando edições que a
Grazi tiver feito depois, em silêncio. O script cumpriu a função; o risco é alguém
rodá-lo de novo achando que "só completa". Ver E-3.

Não recomendo montar backup automático. O que existe cobre.

---

## 18 · 404 / PEÇA REMOVIDA — medido

`/produto/nao-existe` → **404** ✓ · `/produto/frente-unica` (oculta) → **404** ✓ ·
`/qualquer-coisa` → 404 ✓ · `/catalogo?c=inventado` → 200 mostrando tudo (proposital) ✓

**Peça oculta NÃO fica acessível por quem conhece a URL. Confirmado.** O filtro está no
GROQ, então a peça não sai do servidor nem no grid, nem na lista de rotas, nem na busca
por slug.

**Mas a página que a cliente vê é esta:**

> 404
> This page could not be found.

Sem cabeçalho, sem logotipo, sem link para o catálogo, sem WhatsApp, **em inglês**. E o
caminho que leva até ela é o fluxo *normal* da Grazi: peça acaba → ela oculta → o link
que circulou no WhatsApp vira beco sem saída. Ver B-2.

---

## 19 · LINKS

**Limpo.** Todos os `target="_blank"` têm `rel` (medido: 8 × `noreferrer`, 1 ×
`noopener noreferrer` — `noreferrer` já implica `noopener`). Nenhum número de telefone,
endereço, URL de Instagram, Maps ou Waze escrito à mão fora de `lib/loja.ts` — as duas
ocorrências que o grep achou estão dentro de comentários. Desktop e telefone apontam
para os mesmos destinos. Nenhum link quebrado.

---

## 20 · DADOS CENTRALIZADOS

`lib/loja.ts` é ponto único de verdade para marca, WhatsApp (número e exibição),
Instagram, endereço (nas duas formas — leitura e geocoding), horário, entregas,
parcelamento, guia de medidas, tabela de tamanhos, categorias, coleções, rótulo do CTA e
as duas funções de mensagem. `lib/catalogo.ts` centraliza formatação de preço,
parcelamento, filtro, selo, relacionadas e o fio das amostras.

**Não encontrei duplicação para apontar.** Esta parte está bem feita e não precisa de
trabalho.

Uma duplicação *consciente* e documentada: o `60` do `revalidate` aparece como literal
nas duas rotas porque o Next lê configuração de segmento na compilação e não aceita
valor importado. O comentário avisa nos dois lugares.

---

## 21 · ROBUSTEZ DOS COMPONENTES

Com 50 produtos, todos continuam funcionando. Nenhum deles tem limitação estrutural:

- **ProductCard** — recebe `nivel` para a semântica do título, monta as bolinhas a
  partir do array. Escala.
- **SeletorCor / SeletorTamanho** — `flex-wrap`; com 8 cores a fileira quebra e segue.
- **Galeria** — pilha com crossfade; com 20 fotos as miniaturas rolam.
- **GuiaMedidas** — um componente, quatro aparências, um só modal. Bom.
- **BotaoQuero** — sem estado, sem efeito, sem hidratação divergente.
- **Header / Footer** — a gaveta tem largura fixa de 12,5rem calculada para o rótulo
  mais longo; **uma categoria nova com nome longo vaza** (limitação real, mas é uma
  linha).

---

## 22 · CATÁLOGO COM MAIS PRODUTOS — medido e projetado

O HTML do catálogo carrega os dados de **todas** as fotos de **todos** os produtos
(porque o card precisa da segunda foto e da troca por cor). Hoje: 249 KB brutos para 17
peças — **14,6 KB por peça**.

| Peças | HTML bruto | HTML transferido | Imagens no DOM |
|---|---|---|---|
| 17 (hoje) | 249 KB | **19 KB** | 18 |
| 25 | 365 KB | ~28 KB | 26 |
| 50 | 730 KB | ~56 KB | 51 |
| 100 | 1,4 MB | **~110 KB** | 101 |

O texto é repetitivo e comprime a 8%. **Paginação não é necessária em 100 peças** — nem
por peso (110 KB transferidos é pouco), nem por imagem (todas lazy exceto as duas
primeiras), nem por consulta (uma chamada GROQ, cacheada 60 s).

**Onde ela passa a fazer falta não é técnico, é humano:** acima de ~60 peças a página
fica com 20 fileiras e a pessoa perde a noção de onde está. O remédio nessa faixa é
**filtro e busca**, não paginação — e o filtro por categoria já existe. Minha
recomendação: não fazer nada agora, e revisitar quando o acervo passar de 60.

---

## 23 · PROMOÇÕES, NOVIDADES, INDISPONÍVEL

**Promoções — estado real.** Não é só flag: existe `precoAnterior`, o card e a página de
produto riscam o valor antigo, e `rotuloStatus` devolve o selo "Promoção". A mensagem do
WhatsApp manda **o preço atual** (o promocional), que é o correto.

**O problema é que as duas peças não estão amarradas.** `promocao` (a flag) e
`precoAnterior` (o valor) são campos independentes, e o site risca o preço olhando
**só** para `precoAnterior`, sem consultar `promocao`. Daí os dois defeitos:

- marcar promoção sem preencher o valor → selo "Promoção", nenhum desconto visível;
- desmarcar promoção → o campo some da tela mas o valor continua gravado, e a peça sai
  de Promoções **continuando com preço riscado**.

Hoje nenhuma peça está em promoção, então isso ainda não apareceu. Vai aparecer na
primeira vez que ela usar.

**Novidades.** Flag manual, sem data. Não expira, não é automática. Está documentado no
painel ("A peça aparece também em Novidades, sem sair da categoria dela"). Funciona; só
depende de alguém lembrar de desmarcar. Automatizar por `_createdAt` seria possível, mas
tiraria dela o controle sobre o que é novidade — não recomendo agora.

**Indisponível.** Aparece no catálogo com o selo "Esgotado". Na página de produto o CTA
é **substituído** por uma caixa inerte "Peça esgotada" — não manda WhatsApp, e isso está
certo. Tamanho esgotado aparece riscado e desabilitado, com `sr-only ", esgotado"`.
**Não há risco de a cliente achar que está disponível.** Faz sentido como está.

Uma observação: o fluxo que a Grazi combinou é *ocultar* a peça quando acaba, não marcar
indisponível — então `indisponivel` é o estado menos usado dos três, e é justamente o
que tem a apresentação mais resolvida.

---

## 24 · QUALIDADE DO CÓDIGO

Não vou pedir refactor. O código está acima da média em legibilidade, e os comentários
explicam decisão, não sintaxe. O que é dívida de verdade:

1. **`lib/scenes.ts` com 738 linhas** é o maior arquivo do projeto e concentra 5 cenas.
   Ainda é navegável, mas é o próximo a ficar difícil.
2. **`app/globals.css` com 1016 linhas.** Mesma observação.
3. **Sem teste e sem CI.** Existem `lint` e `typecheck` no `package.json`, mas nada os
   dispara: o Next 16 não roda ESLint no build. Um erro de tipo pode ir para produção se
   alguém esquecer de rodar. Ver C-3.
4. **`next.config.mjs`**: `images.formats` é configuração morta (o projeto não usa
   `next/image`), e a ausência de `remotePatterns` é uma mina para o dia em que alguém
   usar. Inofensivo hoje.
5. **Números mágicos importantes** estão todos nomeados e comentados (`GRADE_DENSA`,
   `PARCELAS`, `REVALIDAR`, os tokens de raio). Não achei nenhum solto que valha
   apontar.

---

# 25 · CLASSIFICAÇÃO FINAL

## A — JÁ ROBUSTO (não precisa de trabalho)

Segurança e gestão de segredos · modelo de dados e adaptador · filtro `?c=` com uma
fonte só · peça oculta fora do site (grid, rotas e slug) · estados vazios com saída pelo
WhatsApp · mensagem do WhatsApp sem campo vazio · UX de indisponível · modais
(`<dialog>` nativo: ESC, foco, retorno, clique fora, trava de rolagem) · hierarquia de
títulos · navegação por teclado e foco visível · contraste das amostras · reduced motion
· performance (LCP 428–732 ms, CLS ≈ 0) · pipeline de imagem · SEO de produto, incluindo
a prévia no WhatsApp · centralização de dados em `lib/loja.ts` · links externos ·
privacidade (zero cookie, zero terceiro) · recuperação (Sanity + Git + Vercel) ·
Studio em português com fluxo pensado para a Grazi · ausência de `pin` e uso de sticky.

---

## B — ESSENCIAL ANTES DE CONSIDERAR O SITE FINAL

### B-1 · A intro tranca a página em todas as rotas que não são a home

- **Área:** Home / intro / arquitetura
- **Estado atual:** O script inline do `<head>` marca `data-intro="ativa"` em **qualquer
  rota**, olhando só o `sessionStorage`. O CSS responde com `html[data-intro="ativa"]
  { overflow: hidden }`. Quem desarma isso é o componente `SerenouIntro` — que só existe
  em `app/page.tsx`.
- **Problema:** Se a **primeira página da sessão** não for a home, o atributo nunca é
  removido e **a página não rola**. Medido em produção: entrando direto em
  `/produto/conjunto-bless` numa sessão nova, roda do mouse → 0px, tecla End → 0px. No
  telefone a página tem 4980px, a tela mostra 844px e o botão **QUERO ESSA PEÇA está em
  1221px — inalcançável**. Passando pela home antes, tudo funciona (é o que mascarou
  isto até agora).
- **Segunda face do mesmo problema:** a decisão de acender a cortina é tomada por CSS e
  desfeita por JavaScript. Bloqueei os chunks JS e esperei 15 s: a home fica num
  gradiente bege de tela cheia, com um "Pular" que não responde e sem rolagem, **sem
  saída a não ser recarregar**. É o cenário clássico de `ChunkLoadError` depois de um
  deploy com a aba antiga aberta.
- **Impacto:** **Crítico, e exatamente no caminho de conversão.** Link de peça
  compartilhado no WhatsApp ou no Instagram é a principal porta de entrada desta loja, e
  hoje essa porta entrega uma página travada.
- **Solução recomendada:** armar `data-intro` só na home (o script já lê
  `location.pathname`) **e** dar à cortina uma saída puramente CSS, para ela não depender
  do bundle para sumir.
- **Complexidade:** baixa · **Prioridade:** essencial

### B-2 · A página 404 é a padrão do Next, em inglês

- **Área:** Erros / conversão
- **Estado atual:** Sem `app/not-found.tsx`. Medido: "404 — This page could not be
  found.", sem cabeçalho, sem logotipo, sem link, em inglês.
- **Problema:** O caminho que leva até ela é o fluxo **normal** de operação — peça acaba,
  a Grazi oculta, e o link que já circulou no WhatsApp vira beco sem saída.
- **Impacto:** Alto. A cliente que clicou querendo comprar é despachada sem nenhuma rota
  de volta, numa tela que nem parece do site.
- **Solução recomendada:** um `not-found.tsx` com cabeçalho, uma frase em português
  ("Essa peça saiu do catálogo"), link para o catálogo e para o WhatsApp.
- **Complexidade:** baixa · **Prioridade:** essencial

### B-3 · Validações de cadastro que deixam dado errado chegar à vitrine

- **Área:** Sanity / schema
- **Estado atual:** Preço sem `max` e sem `precision(2)`, com `0` aceito. Promoção
  (`promocao`) e preço anterior (`precoAnterior`) independentes, e o site risca o preço
  olhando só o segundo.
- **Problema:** `18990` no lugar de `189,90` publica um vestido de R$ 18.990,00 em
  silêncio. Marcar promoção sem preencher o valor gera selo sem desconto. Desmarcar
  promoção **não** apaga o valor, e a peça continua com preço riscado fora de Promoções.
- **Impacto:** Alto — é preço, é o dado que a cliente usa para decidir, e vai junto na
  mensagem do WhatsApp.
- **Solução recomendada:** `max()` e `precision(2)` no preço, com mensagens separadas; e
  amarrar os dois campos da promoção nos dois sentidos (promoção exige valor anterior;
  valor anterior só vale com promoção marcada).
- **Complexidade:** baixa · **Prioridade:** essencial

### B-4 · Peça marcada "teste" é publicada no site

- **Área:** Sanity / consulta
- **Estado atual:** O filtro é `status != "oculto" && defined(slug.current)`. **Não há
  `teste != true`.** O painel esconde a peça de teste do "Catálogo"; o site a mostra.
- **Problema:** O painel diz uma coisa e o site faz outra. Uma peça marcada como teste,
  com status Disponível, aparece na vitrine, ganha página própria e é indexável — e a
  Grazi não a vê na lista onde ela trabalha, então não tem como perceber.
- **Impacto:** Hoje **zero** — verifiquei o dataset no ar: 0 peças marcadas como teste.
  É armadilha armada, não estrago feito. Dispara na primeira vez que alguém usar o campo
  como a descrição promete.
- **Solução recomendada:** uma condição no `VISIVEIS`, em um lugar só.
- **Complexidade:** baixa · **Prioridade:** essencial

### B-5 · `robots.txt` e `sitemap.xml` não existem

- **Área:** SEO
- **Estado atual:** Medido: os dois devolvem 404.
- **Problema:** O Google encontra as páginas de produto só por link. Sem sitemap, peça
  nova demora a ser indexada e peça removida demora a sair. Sem robots, `/admin` depende
  só da meta tag.
- **Impacto:** Médio-alto para uma loja que vive de busca e de link compartilhado — e é
  o item de melhor retorno por esforço da lista inteira.
- **Solução recomendada:** `app/sitemap.ts` gerado a partir de `listarSlugs()` (que já
  exclui oculta) e `app/robots.ts` apontando para ele, com `Disallow: /admin`.
- **Complexidade:** baixa · **Prioridade:** essencial

---

## C — IMPORTANTE, MAS PODE ENTRAR DEPOIS

### C-1 · Structured data: `LocalBusiness` + `BreadcrumbList` + `Product` honesto
Nenhum JSON-LD hoje. Todos os campos já existem em `lib/loja.ts` e no produto. Regra:
`availability` mapeado do status real ou omitido; nada de SKU, GTIN, review ou frete.
**Complexidade:** baixa-média · **Prioridade:** depois

### C-2 · Falha do Sanity vira 404 cacheado, e o catálogo vazio mente a causa
Se o Sanity falhar quando o cache ISR vencer, a peça some e a rota vira `notFound()` —
404 guardado para uma peça que existe. E o catálogo vazio diz "as peças estão sendo
fotografadas", que é falso durante uma queda. Um `error.tsx` e um texto neutro no estado
vazio de falha resolvem. **Complexidade:** média · **Prioridade:** depois

### C-3 · Sem teste e sem CI
`lint` e `typecheck` existem e nada os dispara (o Next 16 não roda ESLint no build). Um
GitHub Action de 15 linhas rodando os dois no push já elimina a classe inteira de "foi
para produção com erro de tipo". Não estou pedindo suíte de teste.
**Complexidade:** baixa · **Prioridade:** depois

### C-4 · Categoria inválida cai em "vestidos" em silêncio
`(d.categoria ?? "vestidos")` — se alguém renomear um slug de categoria em
`lib/loja.ts`, todas as peças da categoria antiga viram vestido sem nenhum aviso. Um log
no adaptador bastaria. **Complexidade:** baixa · **Prioridade:** depois

### C-5 · No card, a cor depende só da bolinha
O nome existe em `title` e `sr-only`, mas quem enxerga sem distinguir tons, no telefone,
não tem como saber. Na página de produto o nome só aparece **depois** de escolher.
Mostrar o nome da primeira cor, ou o nome ao tocar, resolve sem poluir o card.
**Complexidade:** baixa · **Prioridade:** depois

### C-6 · Falta `document.fonts.ready → ScrollTrigger.refresh()`
Com cache frio, os reveals ancorados em `top 82%` disparam fora da dobra e a seção chega
já parada. Uma linha em `lib/gsap.ts`. **Complexidade:** baixa · **Prioridade:** depois

### C-7 · A entrada da hero toca de novo ao cruzar 1024px
Confirmado por teste: o título é remascarado e sobe outra vez. Causa: a callback do
`matchMedia` não devolve limpeza. Também vale guardar `data-hero-tom` de ficar fora de
sincronia (não reproduzi, mas a estrutura permite).
**Complexidade:** média · **Prioridade:** depois

### C-8 · Cabeçalhos de segurança e validações menores do painel
`X-Content-Type-Options`, `Referrer-Policy` e `frame-ancestors` (sem ele, `/admin` é
iframeável). E, no schema: cores duplicadas, tamanhos duplicados, cor sem hex e `alt`
sem nem um aviso. **Complexidade:** baixa · **Prioridade:** depois

---

## D — FASE 2 / EVOLUÇÃO

**D-1 · Analytics sem cookie.** Vercel Analytics ou Plausible, para responder "qual peça
gera mais conversa no WhatsApp?". Mantém a resposta de LGPD intacta. É a melhoria de
maior valor de negócio da lista.

**D-2 · Busca por nome no catálogo.** Passa a fazer falta acima de ~60 peças; abaixo
disso o filtro por categoria resolve.

**D-3 · Entradas por categoria e por estado no painel.** Com 80 peças, "achar aquela
calça bege" na lista cronológica única fica cansativo. Sai da mesma lista `CATEGORIAS`
que já existe.

**D-4 · Cor da foto como lista em vez de digitação livre.** A validação já impede o
erro; escolher numa lista evita ter que digitar 45 vezes.

**D-5 · Foto de OG enquadrada em 1,91:1.** Hoje a prévia funciona, mas corta uma faixa
do meio da peça.

---

## E — NÃO RECOMENDO ADICIONAR AGORA

**E-1 · Paginação no catálogo.** Medido: 100 peças são ~110 KB transferidos. O gargalo
não é técnico. Adicionar paginação agora resolveria um problema que não existe e
introduziria estado de URL, SEO de página 2 e um segundo caminho de navegação.

**E-2 · Banner de cookie.** Não há cookie, não há terceiro, não há coleta. Pedir
consentimento para nada piora a primeira tela e não protege ninguém.

**E-3 · Rodar de novo o `importar-lote.mjs`.** `createOrReplace` com `_id` fixo
sobrescreve as 13 peças por inteiro e desfaz, em silêncio, tudo que a Grazi editou
depois. O script cumpriu a função — o certo é aposentá-lo, não mantê-lo por perto.

**E-4 · Expirar "Novidade" automaticamente.** Tiraria da Grazi o controle sobre o que
ela considera novidade, para resolver um problema que ainda não aconteceu.

**E-5 · Carrinho, checkout, login, wishlist, avaliações, estoque quantitativo,
newsletter, popup, chat, blog.** Nada na auditoria justifica nenhum deles. O produto
vendido é catálogo + decisão + WhatsApp, e ele está bem construído para isso. O coração
salvo em `localStorage` já foi removido uma vez por ser promessa sem continuação — a
mesma régua se aplica aqui.

---

## RESUMO EM UMA LINHA

O site está **bem construído** — segurança, dados, acessibilidade, performance e SEO
estão acima do que se espera de um catálogo desse porte, e a maior parte da lista A não
precisa ser tocada nunca mais. O que falta para ele ser **robusto como produto** são
cinco correções pequenas, quatro delas de complexidade baixa, e uma delas — a B-1 — é um
defeito que hoje trava a página para quem chega por link de peça.
