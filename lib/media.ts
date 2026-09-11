/* ---------------------------------------------------------------------------
   MANIFEST DE MÍDIA — ponto único de troca

   Cada slot aponta para um caminho-base sem largura nem extensão. O <Frame>
   monta a partir dele um <picture> com AVIF e WebP em quatro larguras.

   Para trocar uma fotografia:
     1. gere as variantes com `npm run assets` (ou coloque os arquivos já
        prontos em /public/images/serenou/<pasta>/<nome>-<largura>.<fmt>)
     2. aponte `base` para o novo caminho e ajuste `width`/`height`
     3. reveja `focus` e `focusMobile`

   Enquanto `base` for `null`, o slot desenha uma placa tonal na proporção
   correta, anotada com a direção de arte daquele espaço.

   PROVENIÊNCIA: os arquivos entregues em ago/2026 vieram nomeados como
   "ChatGPT Image ...", todos em 1122x1402. São derivados do material da loja,
   não capturas originais. Servem para a apresentação; para produção troque
   pelos arquivos de câmera — o caimento do tecido não sobrevive a um
   re-render, e a hero fica no limite de resolução (1122 px de origem para uma
   tela de 1440).
--------------------------------------------------------------------------- */

export type MediaSlot = {
  id: string;
  /** Caminho sem `-<largura>.<ext>`. `null` = placa tonal. */
  base: string | null;
  /** Larguras disponíveis em disco, crescente. */
  widths: number[];
  /** Valor de `sizes` — quanto da viewport a imagem realmente ocupa. */
  sizes: string;
  /** Proporção nativa. Reserva espaço e evita layout shift. */
  width: number;
  height: number;
  alt: string;
  /** object-position a partir de 768px. */
  focus: string;
  /** object-position abaixo de 768px — o enquadramento do mobile é outro. */
  focusMobile: string;
  /** Quando a fotografia vem de um CDN externo (o Sanity, no catálogo), as
   *  URLs já chegam prontas e não são montadas a partir de `base`. Os
   *  componentes não sabem a diferença: quem lê isto é `srcset()`. */
  fontes?: {
    /** Usados quando as variantes existem como arquivos distintos. */
    avif?: string;
    webp?: string;
    /** srcset único, quando quem escolhe o formato é o CDN pelo Accept do
     *  navegador — é o caso das fotos do catálogo, servidas pelo Sanity. */
    auto?: string;
    fallback: string;
  } | null;
  /** Vídeo original, quando existir. Tem prioridade sobre a foto. */
  video?: string | null;
  poster?: string | null;
  /** Tons da placa enquanto não houver arquivo. */
  tone: [string, string];
  /** Qual fotografia entra aqui. */
  note: string;
};

const W = [480, 720, 960, 1122];

export const MEDIA = {
  /* ---- ABERTURA -------------------------------------------------------
     Hero e manifesto dividem esta placa. Pessoa real, look urbano que não é
     praia nem festa: é o argumento do manifesto em uma imagem só. O corte
     mantém o rosto inteiro e empurra a arara colorida para o canto superior,
     onde o header pousa. */
  /* A hero rotativa: quatro fotografias, todas em AVIF q88 / WebP q95 e
     origem 1672 px — é o único slot exibido na largura inteira da tela.

     A primeira é a de sempre, com a modelo. As outras três são as vitrines
     que a Grazi entregou em 10/09. A diferença que importa não é a cor: a
     primeira é escura e as outras três são claras, então cada uma pede uma
     tinta diferente para a tipografia. Quem resolve isso é HERO_SLIDES. */
  hero: {
    id: "hero-modelo",
    base: "/images/serenou/lifestyle/modelo-preto-com-alfaiataria-ao-fundo",
    widths: [640, 960, 1280, 1672],
    sizes: "100vw",
    width: 1672,
    height: 941,
    alt: "Mulher em look preto de ombro único na loja da Serenou, com três peças de alfaiataria preta em manequins ao fundo.",
    focus: "52% 50%",
    focusMobile: "72% 50%",
    tone: ["#2b2825", "#111010"],
    note: "Hero 01: lifestyle, modelo ao centro",
  },

  heroAzul: {
    id: "hero-azul",
    base: "/images/serenou/hero/vitrine-azul",
    widths: [640, 960, 1280, 1672],
    sizes: "100vw",
    width: 1672,
    height: 941,
    alt: "Vitrine da Serenou em tons de azul-marinho: conjunto de camiseta e calça, blusa drapeada com saia off-white e vestido longo justo, em manequins na loja.",
    /* Horizontal 16:9. No desktop o corte é lateral e mantém a parede vazia
       à esquerda, onde a headline pousa. No mobile a fatia é estreita e
       precisa fechar nos manequins, senão sobra parede. */
    focus: "58% 50%",
    focusMobile: "72% 52%",
    tone: ["#e9e4dc", "#cfc6b8"],
    note: "Hero 01: vitrine azul",
  },

  heroRosa: {
    id: "hero-rosa",
    base: "/images/serenou/hero/vitrine-rosa",
    widths: [640, 960, 1280, 1672],
    sizes: "100vw",
    width: 1672,
    height: 941,
    alt: "Vitrine da Serenou em tons de rosa: conjunto rosa-claro de ombro a ombro, vestido longo pink drapeado e vestido curto rosa com recorte, em manequins na loja.",
    focus: "58% 50%",
    focusMobile: "72% 52%",
    tone: ["#efe6e4", "#d8c3c4"],
    note: "Hero 02: vitrine rosa",
  },

  heroVerde: {
    id: "hero-verde",
    base: "/images/serenou/hero/vitrine-verde",
    widths: [640, 960, 1280, 1672],
    sizes: "100vw",
    width: 1672,
    height: 941,
    alt: "Vitrine da Serenou em tons de verde militar: conjunto de kimono e pantalona, camisa sobre saia off-white e macacão bege, em manequins na loja.",
    focus: "58% 50%",
    focusMobile: "70% 52%",
    tone: ["#e8e6dc", "#c9c6b3"],
    note: "Hero 03: vitrine verde",
  },

  /* ---- 01 LEVE --------------------------------------------------------
     Vestidos claros, verde-lima e off-white. É a imagem mais fluida do
     acervo e a única em que o tecido conta a história sozinho. */
  leve: {
    id: "leve",
    base: "/images/serenou/editorial/vestidos-claros-lima-offwhite-verde",
    widths: W,
    sizes: "(min-width: 1024px) 44vw, 92vw",
    width: 1122,
    height: 1402,
    alt: "Três vestidos Serenou em tons claros: verde-lima, off-white e verde-menta, apresentados na loja.",
    focus: "50% 42%",
    focusMobile: "50% 38%",
    video: null,
    poster: null,
    tone: ["#c9cf9a", "#8d9668"],
    note: "Leve: vestidos claros e fluidos (vídeo original, se existir)",
  },

  /* ---- 02 VERSÁTIL ----------------------------------------------------
     Claro → oliva → preto. A progressão cromática é o argumento: mesma
     marca, três formas de vestir. */
  /* ---- VITRINES ------------------------------------------------------
     As três fotografias que a Grazi entregou, recortadas em 4:5 a partir dos
     originais 16:9 e ancoradas nos manequins. O mesmo material aparece na
     hero em quadro cheio; aqui ele é retrato, porque a seção é vertical.

     A associação é a que a cliente definiu e não deve ser trocada:
     azul → vitrine 01, rosa → vitrine 02, verde → vitrine 03. */
  vitrineAzul: {
    id: "vitrine-azul",
    base: "/images/serenou/vitrines/azul",
    widths: [480, 720, 753],
    sizes: "(min-width: 1024px) 42vw, 92vw",
    width: 753,
    height: 941,
    alt: "Vitrine da Serenou em azul-marinho: conjunto de camiseta e calça, blusa drapeada com saia off-white e vestido longo justo.",
    focus: "50% 45%",
    focusMobile: "50% 42%",
    tone: ["#dfe0e6", "#b3b6c4"],
    note: "Vitrine 01: azul",
  },
  vitrineRosa: {
    id: "vitrine-rosa",
    base: "/images/serenou/vitrines/rosa",
    widths: [480, 720, 753],
    sizes: "(min-width: 1024px) 42vw, 92vw",
    width: 753,
    height: 941,
    alt: "Vitrine da Serenou em rosa: conjunto rosa-claro de ombro a ombro, vestido longo pink drapeado e vestido curto rosa com recorte.",
    focus: "50% 45%",
    focusMobile: "50% 42%",
    tone: ["#f2e2e4", "#dcbcc2"],
    note: "Vitrine 02: rosa",
  },
  vitrineVerde: {
    id: "vitrine-verde",
    base: "/images/serenou/vitrines/verde",
    widths: [480, 720, 753],
    sizes: "(min-width: 1024px) 42vw, 92vw",
    width: 753,
    height: 941,
    alt: "Vitrine da Serenou em verde militar: conjunto de kimono e pantalona, camisa sobre saia off-white e macacão bege.",
    focus: "50% 45%",
    focusMobile: "50% 42%",
    tone: ["#e2e3d7", "#b9bda6"],
    note: "Vitrine 03: verde",
  },

  marcante: {
    id: "marcante",
    base: "/images/serenou/mannequins/looks-pretos-alfaiataria",
    widths: W,
    sizes: "(min-width: 1024px) 58vw, 100vw",
    width: 1122,
    height: 1402,
    alt: "Looks Serenou em preto: túnica assimétrica, conjunto de pantalona e vestido de ombro único com broche dourado.",
    focus: "50% 30%",
    focusMobile: "50% 28%",
    tone: ["#2b2825", "#111010"],
    note: "Marcante: alfaiataria preta",
  },
} satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof MEDIA;

/**
 * `claro` e `escuro` descrevem a FOTOGRAFIA, não a tipografia: uma foto clara
 * pede texto em carvão, uma escura pede off-white. O componente e a cena leem
 * daqui para virar a tinta da hero junto com a imagem.
 */
export type TomHero = "claro" | "escuro";

/**
 * A sequência da hero, na ordem em que aparece.
 *
 * Trocar a ordem, tirar ou acrescentar uma fotografia é mexer só aqui: o
 * componente monta quantas houver, e com uma só a rotação simplesmente não
 * acontece.
 */
export const HERO_SLIDES: Array<{ slot: MediaSlot; tom: TomHero }> = [
  { slot: MEDIA.hero, tom: "escuro" },
  { slot: MEDIA.heroAzul, tom: "claro" },
  { slot: MEDIA.heroRosa, tom: "claro" },
  { slot: MEDIA.heroVerde, tom: "claro" },
];

/**
 * Quanto cada fotografia fica parada e quanto dura a troca, em segundos.
 *
 * A dissolvência é curta de propósito. Enquanto ela acontece as duas
 * fotografias estão sobrepostas, e sobreposição longa entre uma foto escura e
 * uma clara lê como imagem borrada, não como transição. Meio segundo é o
 * bastante para não ser um corte seco e pouco para virar fantasma.
 */
export const HERO_INTERVALO = 2.9;
export const HERO_TROCA = 0.55;

/** Monta o srcset de um formato: do CDN quando houver, senão do caminho-base. */
export function srcset(slot: MediaSlot, ext: "avif" | "webp") {
  if (slot.fontes) return slot.fontes[ext];
  if (!slot.base) return undefined;
  return slot.widths.map((w) => `${slot.base}-${w}.${ext} ${w}w`).join(", ");
}

/** Maior variante — usada como `src` de fallback. */
export function largest(slot: MediaSlot, ext: "avif" | "webp" = "webp") {
  if (slot.fontes) return slot.fontes.fallback;
  if (!slot.base) return undefined;
  return `${slot.base}-${slot.widths[slot.widths.length - 1]}.${ext}`;
}

/**
 * srcset do próprio `<img>`.
 *
 * Existe para a fotografia que vem do CDN do Sanity: lá quem decide entre
 * AVIF, WebP e JPEG é o servidor, pelo cabeçalho Accept do navegador. Nesse
 * caso declarar `<source type="image/avif">` seria mentir sobre o que vai
 * chegar, então o `<picture>` fica sem fontes e a negociação acontece uma vez
 * só, no lugar certo.
 */
export function srcsetImg(slot: MediaSlot) {
  return slot.fontes?.auto;
}
