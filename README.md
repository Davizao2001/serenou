# SERENOU

Nova experiência digital da Serenou — moda feminina para o dia inteiro.

Next.js · React · TypeScript · Tailwind CSS · GSAP

```bash
npm install
npm run dev          # http://localhost:3000
npm run dev          # /?intro=1 força a intro em vídeo
```

---

## Fase 01

Apresentação comercial da nova experiência digital. Não é o e-commerce: são as
telas que estabelecem identidade, storytelling, direção fotográfica, tipografia
e linguagem de movimento, para aprovação da direção antes de seguir.

**O que está construído**

```
00  Intro           vídeo da marca, transição contínua para a hero
01  Header          transparente sobre a hero, sólido depois dela
02  Hero            100svh, entrada em cinco tempos (~1,6 s)
03  Hero → Manifesto  transição contínua, sem corte
04  Manifesto       revelação por palavras presa ao scroll
05  Capítulo 01     LEVE
06  Capítulo 02     VERSÁTIL (início) — uma peça, três looks
```

O capítulo VERSÁTIL termina com o índice dos capítulos seguintes — MARCANTE,
SOLAR e SERENOU —, que entram depois da aprovação.

---

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

Stack: Next.js (App Router) · React · TypeScript · Tailwind CSS · GSAP
(ScrollTrigger, SplitText, matchMedia) · @gsap/react.

Sem Lenis. O scroll nativo já responde bem e uma camada de suavização a mais
cobraria compatibilidade, teclado e navegação do navegador sem melhorar a
experiência. Se em algum momento fizer diferença, ScrollSmoother entra sem
reescrever nada — todas as cenas usam ScrollTrigger.

---

## Trocar as placas por fotografia real

Tudo passa por **um arquivo**: `lib/media.ts`.

Enquanto `src` for `null`, o slot desenha uma placa tonal na proporção certa,
anotada com a direção de arte daquele espaço. Para colocar a foto real:

1. coloque o arquivo em `public/media/`;
2. preencha `src` (e `srcMobile`, se houver crop vertical dedicado);
3. ajuste `width`/`height` para a proporção nativa do arquivo.

Nenhum componente precisa ser tocado.

```ts
hero: {
  src: "/media/hero-praia-camisa-branca.jpg",
  srcMobile: "/media/hero-praia-camisa-branca-9x16.jpg",
  width: 2400, height: 1500,
  focus: "50% 42%",     // object-position do crop
  ...
}
```

**Vídeo tem prioridade sobre foto.** Se existir o material original do vestido
verde plissado em movimento, preencha `video` no slot `leve` e o tecido se
move sozinho — vai ser mais forte do que qualquer animação sobre uma foto
parada.

Slots da fase 01: `hero`, `leve`, `versatilPeca`, `versatilLook01/02/03`.

---

## Arquitetura

```
app/
  layout.tsx          fontes, canvas de fundo, skip link
  page.tsx
  globals.css         tokens de cor e tipografia, estados iniciais de animação
components/
  media/Frame.tsx     vídeo, foto ou placa tonal — sempre na mesma interface
  site/               Header, Opening, ChapterLeve, ChapterVersatil
lib/
  media.ts            manifest de mídia — ponto único de troca
  motion.ts           durações, curvas, deslocamentos, breakpoints
  scenes.ts           todas as cenas de movimento
  gsap.ts             registro de plugins, uma vez por bundle
preview/
  build.mjs           gera a prévia hospedada em arquivo único
```

**Por que as animações vivem fora dos componentes.** `lib/scenes.ts` não
depende de React: cada cena recebe o nó raiz da sua seção e devolve uma função
de limpeza. Os componentes só chamam a cena dentro de `useGSAP`, e a prévia
hospedada (`npm run preview`) chama exatamente as mesmas funções sobre o HTML
já renderizado. Uma implementação só — a prévia não pode divergir do site.

**A placa fotográfica.** É o gesto central. A fotografia da hero não é cortada
quando o manifesto começa: ela é reenquadrada por máscara e continua presente,
como o mesmo quadro editorial visto de outro jeito. Uma imagem, vários
enquadramentos — a mesma ideia que a marca quer comunicar sobre a mulher que
veste Serenou. Por isso a hero e o manifesto são uma seção só (`Opening.tsx`)
e cada propriedade animada mora na sua própria camada:

```
[data-plate]          clip do scroll   fullscreen → quadro editorial
  [data-plate-reveal] clip da entrada  máscara revelando a fotografia
    [data-plate-zoom] scale da entrada 1.06 → 1
      .plate-media    scale do scroll  1 → 1.04
```

Sem essa separação, a timeline de entrada e a timeline presa ao scroll disputam
o mesmo valor e uma congela a outra.

---

## Três armadilhas que já custaram caro aqui

Estão comentadas no código, mas vale registrar:

**`overflow-x: hidden` no `body` mata `position: sticky`.** Transforma o body em
contêiner de rolagem e a placa deixa de grudar. Use `overflow-x: clip`.

**`yPercent` sozinho não desfaz um `translateY(%)` vindo do CSS.** O estado
pré-pintura das linhas mascaradas é `transform: translateY(108%)`; o GSAP lê
esse percentual como um `y` em pixels. Toda tween de linha zera `y` junto com
`yPercent`, dos dois lados.

**`gsap.matchMedia()` só roda o callback se alguma condição casar.** Registrar
apenas `reduce` significa que nada acontece para quem *não* usa movimento
reduzido — ou seja, quase todo mundo. As três condições sempre entram juntas.

---

## Movimento

Um vocabulário só, em `lib/motion.ts`: entradas de 0,4–1,1 s com `power3.out`,
deslocamento de 16–44 px, stagger de 0,045–0,11 s, e `ease: "none"` em tudo que
está preso ao scroll. Só transform, opacity e clip-path.

**Mobile é uma experiência própria**, não o desktop reduzido: sem fechamento
lateral da placa, sem pin longo, sem scroll horizontal. O capítulo VERSÁTIL
vira sequência vertical.

**Movimento reduzido** desliga scrub, pin e transforms; nenhum conteúdo depende
de animação para existir. As composições empilhadas voltam ao fluxo vertical —
sem isso, só a última seria visível.

---

## Acessibilidade

Contraste verificado par a par: corpo 15,8:1, texto secundário 7,4:1, labels
5,7:1 sobre linho e 4,9:1 sobre bege, destaques em oliva 5,9:1. Hierarquia de
títulos sequencial, foco visível em todos os elementos interativos, skip link,
`alt` em toda mídia com conteúdo e placas decorativas marcadas como tal.

Links editoriais usam a classe `.tap`: a área sensível cresce por
pseudo-elemento até 44 px sem afastar o sublinhado do texto.

---

## Prévia hospedada

```bash
npm run build && npx next start   # em um terminal
npm run preview                   # em outro
```

Gera `preview/serenou-fase-01.html` — arquivo único, com CSS, fontes e
movimento embutidos, para abrir em qualquer lugar sem instalar nada.

---

# Etapa 02 — integração da fotografia real

## Onde cada imagem entra

| Seção | Arquivo | Por quê |
|---|---|---|
| Hero + Manifesto | `lifestyle/modelo-preto-com-alfaiataria-ao-fundo` | Horizontal 16:9, modelo ao centro, alfaiataria preta atrás. É a única do acervo no formato que a hero precisa. |
| 01 Leve | `editorial/vestidos-claros-lima-offwhite-verde` | Vestidos claros e fluidos — o tecido conta a história sozinho. |
| 02 Versátil / Dia | `looks/conjuntos-amarelo-manteiga-bege` | Abre a progressão de cor no tom mais claro. |
| 02 Versátil / Tarde | `looks/conjuntos-verde-oliva` | O oliva da marca em três formas: vestido, kimono, conjunto. |
| 02 Versátil / Noite | `lifestyle/conjunto-preto-babado` | Fecha a progressão em preto, com pessoa. |
| Teaser 03 Marcante | `mannequins/looks-pretos-alfaiataria` | Entra pela base e leva o fundo ao carvão. |
| Header | `marca/serenou-lettering` | Lettering oficial, extraído do selo. |

Nenhum arquivo ficou sem uso e nenhum entrou só por estar disponível.

## Proveniência

Os arquivos entregues vieram nomeados `ChatGPT Image ...`, todos em 1122×1402.
São derivados do material da loja, não capturas originais. Servem para a
apresentação. Para produção, troque pelos arquivos de câmera: caimento de
tecido não sobrevive a um re-render, e a hero está no limite de resolução
(origem de 1122 px para uma tela de 1440).

## A hero

Horizontal 16:9, 1672×941 — o formato e a resolução mais altos do acervo, e o
único slot exibido na largura toda da tela. Por isso ela é a única codificada
em AVIF q88 / WebP q95 (45,7 dB, perda imperceptível) e com variante de
1672 px.

A troca pela fotografia horizontal pagou o que se esperava dela:

| | Vertical 4:5 anterior | Horizontal 16:9 |
|---|---|---|
| Véu uniforme sobre a foto | 32% | 16% |
| Headline | 7,4vw | 9,2vw |
| Contraste da headline | 4,31:1 | 3,81:1 |
| Origem | 1122 px | 1672 px |

O véu caiu pela metade porque a fotografia é escura de ponta a ponta: o único
ponto claro sob a tipografia é o piso de madeira na base do quadro. O teto da
headline agora é a parede branca da loja atrás dos manequins — acima de 9,2vw
a linha sobe até ela e o contraste cai abaixo de 3:1.

Todos os números vieram de medição do pixel renderizado, com uma varredura de
tamanho de fonte contra força de véu. Todos os pares passam em WCAG AA.

## Formatos, qualidade e responsividade

Cada slot vira `<picture>` com AVIF e WebP em 480/720/960/1122 px, `sizes` por
seção, `width`/`height` nativos para reservar espaço e `loading="lazy"` fora da
primeira dobra. As 48 variantes somam 4,25 MB (AVIF q80, WebP q93), com PSNR de
42 a 45 dB contra o original — perda imperceptível.

**Resolução é o teto, não a compressão.** Os arquivos de origem têm 1122×1402.
Só a hero fica abaixo do necessário: ela é exibida na largura toda da tela, o
que significa ampliar 1,3× em 1440 px e 2,6× em uma tela retina. As demais
seções exibem as fotografias em 450–660 px de largura, ou seja, reduzindo — e
saem nítidas.

Ampliar por software não resolve. O teste está registrado: bicubic, Lanczos e
Lanczos com nitidez a 1800 px produzem praticamente a mesma imagem, porque o
tecido da origem é liso, sem micro-textura para preservar. Arquivo maior, mesma
nitidez. Full HD de verdade exige origem com 1920 px ou mais.

`object-position` é uma variável por breakpoint (`--focus` e `--focus-mobile`),
definida individualmente por imagem: o corte que funciona em uma tela larga
corta a peça errada em uma estreita.

Não foi usado `next/image` porque a prévia hospedada precisa rodar sem
servidor — o otimizador do Next serve por URL e quebraria no arquivo único.
Quando o catálogo virar dinâmico, o componente `Frame` é o único lugar a mudar.

## Mais uma armadilha registrada

**`getComputedStyle().color` devolve `oklab(...)` quando a cor tem modificador
de opacidade** (`text-linho-alto/75`). Parsear isso como RGB dá um valor
absurdo e faz uma medição de contraste correta parecer uma falha. A cor do
texto foi fixada na ferramenta de medição em vez de lida do DOM.


---

# Etapa 03 — intro em vídeo

## Comportamento

Primeira visita da sessão: a cortina cobre a tela, o vídeo toca, e nos últimos
0,6 s a cortina perde opacidade sobre a hero — que já está montada por baixo.
Refresh e navegação interna não repetem. Fechar o navegador e voltar, sim.

Para rever durante o desenvolvimento: **`?intro=1`** força a intro ignorando a
sessão.

```
npm run dev
http://localhost:3000/?intro=1
```

## Arquivos e qualidade

```
public/videos/
  serenou-intro.mp4         1091 KB   1280x720   cópia do original, perda zero
  serenou-intro.webm         517 KB   1280x720   47 dB
  serenou-intro-960.mp4      646 KB    960x540   52 dB
  serenou-intro-960.webm     290 KB    960x540   46 dB
  serenou-intro-selo-1280.webp  33 KB  movimento reduzido
  serenou-intro-selo-960.webp   23 KB
```

**O MP4 de 1280 não é recodificado.** É o fluxo de vídeo do arquivo original,
copiado bit a bit — verificado por hash do bitstream. Só saiu a faixa de áudio,
que nunca seria tocada, e entrou `+faststart`. Qualidade máxima possível: não
existe nada acima da origem.

A escada medida antes dessa decisão explica por quê:

| x264 | Tamanho | Pior quadro |
|---|---|---|
| crf 26 | 256 KB | 45,0 dB |
| crf 20 | 608 KB | 48,6 dB |
| crf 16 | 1016 KB | 51,2 dB |
| crf 12 | 1511 KB | 53,2 dB |
| cópia | 1091 KB | sem perda |

Acima de crf 16 o arquivo passa do tamanho do original entregando menos
qualidade. Recodificar só faria sentido para economizar peso — e o pedido era o
contrário.

**MP4 primeiro na lista de fontes, e os `codecs` declarados.** Sem declarar, o
navegador responde "talvez" para o MP4, tenta, falha e cai no tratamento de
erro em vez de escolher o WebM sozinho. Com a declaração a negociação acontece
antes de qualquer download: um Chromium sem codecs proprietários nem chega a
pedir o MP4. O WebM existe só para esse caso.

## Enquadramento

`cover` a partir de 3:4 de proporção de tela, `contain` abaixo disso. O selo
ocupa 412 dos 1280 px do quadro; em retrato de celular a fatia visível de um
`cover` ficaria mais estreita do que ele e cortaria o logotipo. As barras usam
um gradiente amostrado das bordas do próprio vídeo ao longo do clipe, então
somem contra a imagem.

## Sincronização com a hero

`lib/scenes.ts` tem a entrada da hero em duas versões:

- **completa** — cinco tempos, ~1,6 s, para quem chega direto;
- **curta** — ~0,8 s, para quem vem da intro. A placa já está montada e
  reabri-la com máscara e zoom seria uma segunda abertura.

O canal entre as duas é `lib/intro.ts`. A hero se inscreve; a intro avisa. O
sinal sai no instante zero da saída da cortina, para a fotografia estar lá
quando ela começa a clarear — sem isso o menu aparece antes da foto.

## Falhas

Quatro redes de segurança, todas testadas:

| Situação | O que acontece |
|---|---|
| Vídeo não carrega em 3,5 s | Intro pulada, site normal |
| Vídeo dá erro | Intro pulada |
| Autoplay bloqueado | Intro pulada |
| Qualquer travamento | Corte absoluto em 9 s |

Em todos os casos: rolagem liberada, `inert` removido, hero visível, página
rolando até o fim.

## Decisões de implementação

**A decisão de tocar é tomada antes da primeira pintura**, por um script inline
no `<head>`. Sem isso a hero aparece por um quadro e só então a cortina cai.
A camada existe no HTML do servidor e o React lê a mesma decisão depois do
mount — servidor e cliente renderizam igual, sem hydration mismatch.

**O `<video>` só é criado quando a intro vai tocar.** Quem já viu na sessão não
baixa nada.

**A trava de rolagem é `overflow: hidden` no `<html>`**, e ao sair a cena chama
`ScrollTrigger.refresh()` — as medidas foram tiradas com a página travada e
precisam ser refeitas. A placa sticky foi verificada depois disso.

**A orquestração mora em `lib/intro-cena.ts`, fora do React**, como todas as
outras cenas: o componente é só marcação, e a prévia hospedada chama a mesma
função sobre o HTML estático. Uma implementação só.

## Camada visual do catálogo

Componentes de apresentação, sem banco, CMS, autenticação nem painel. Os
produtos vêm de `lib/catalogo.ts` (`PRODUTOS_EXEMPLO`) e existem só para a UI
ter o que desenhar até os dados reais chegarem.

| Arquivo | Papel |
| --- | --- |
| `lib/catalogo.ts` | tipos `Produto`, `Cor`, `Tamanho` + dados de desenvolvimento |
| `components/catalogo/ProductImage.tsx` | recorte, proporção e aproximação no hover |
| `components/catalogo/ProductCard.tsx` | ficha da vitrine — foto, nome, preço, cores |
| `components/catalogo/ProductGrid.tsx` | grade 2 / 3 colunas |
| `components/catalogo/FiltroCategorias.tsx` | trilho de categorias e coleções |
| `components/catalogo/Vitrine.tsx` | estado do filtro |
| `components/catalogo/SeletorCor.tsx` | amostras de cor |
| `components/catalogo/SeletorTamanho.tsx` | tamanhos, esgotado riscado |
| `components/catalogo/BotaoQuero.tsx` | CTA `QUERO ESSA PEÇA` |
| `components/catalogo/PainelProduto.tsx` | coluna de decisão da página de produto |
| `app/catalogo/page.tsx` | vitrine |
| `app/produto/[slug]/page.tsx` | esqueleto da página de produto |

Para ligar aos dados reais: trocar `PRODUTOS_EXEMPLO` pela fonte verdadeira
mantendo o tipo `Produto`. Nada mais precisa mudar de forma.

O que ficou deliberadamente em aberto, à espera da call: obrigatoriedade de
cor e tamanho antes do WhatsApp (uma condição no `disabled` de `BotaoQuero`),
a forma final de Promoções, o tratamento visual de `indisponivel` e a
composição do menu.
