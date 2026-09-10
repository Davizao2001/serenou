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
  hero: {
    id: "hero",
    base: "/images/serenou/lifestyle/modelo-preto-com-alfaiataria-ao-fundo",
    /* A hero é o único slot exibido na largura toda da tela. Ela tem as
       maiores larguras do projeto e a origem mais alta (1672 px), e é a única
       codificada em AVIF q88 / WebP q95 — 45,7 dB, perda imperceptível. */
    widths: [640, 960, 1280, 1672],
    sizes: "100vw",
    width: 1672,
    height: 941,
    alt: "Mulher em look preto de ombro único na loja da Serenou, com três peças de alfaiataria preta em manequins ao fundo.",
    /* Horizontal 16:9: em telas largas o corte é lateral, não vertical.
       No mobile a fatia é estreita e precisa ficar centrada na modelo. */
    focus: "52% 50%",
    focusMobile: "72% 50%",
    tone: ["#2b2825", "#111010"],
    note: "Hero: lifestyle horizontal, modelo ao centro",
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
  versatilDia: {
    id: "versatil-dia",
    base: "/images/serenou/looks/conjuntos-amarelo-manteiga-bege",
    widths: W,
    sizes: "(min-width: 1024px) 42vw, 92vw",
    width: 1122,
    height: 1402,
    alt: "Conjuntos Serenou em amarelo-manteiga e bege: pantalonas e blusas de tecido leve.",
    focus: "50% 45%",
    focusMobile: "50% 42%",
    tone: ["#efe0b4", "#c9b183"],
    note: "Versátil 01: paleta clara",
  },
  versatilTarde: {
    id: "versatil-tarde",
    base: "/images/serenou/looks/conjuntos-verde-oliva",
    widths: W,
    sizes: "(min-width: 1024px) 42vw, 92vw",
    width: 1122,
    height: 1402,
    alt: "Looks Serenou em verde oliva: vestido longo plissado, kimono com pantalona e conjunto monocromático.",
    focus: "50% 46%",
    focusMobile: "46% 44%",
    tone: ["#8d9668", "#4e5733"],
    note: "Versátil 02: paleta oliva",
  },
  versatilNoite: {
    id: "versatil-noite",
    base: "/images/serenou/lifestyle/conjunto-preto-babado",
    widths: W,
    sizes: "(min-width: 1024px) 42vw, 92vw",
    width: 1122,
    height: 1402,
    alt: "Cliente da Serenou usando conjunto preto de blusa com babado e pantalona, na loja.",
    focus: "50% 34%",
    focusMobile: "52% 32%",
    tone: ["#4a4640", "#1b1815"],
    note: "Versátil 03: paleta preta",
  },

  /* ---- TEASER 03 MARCANTE ---------------------------------------------
     Entra parcialmente pela base da viewport e leva o fundo da página para o
     carvão. Fecha a fase 01 apontando para o capítulo seguinte. */
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

/** Monta o srcset de um formato a partir do caminho-base. */
export function srcset(slot: MediaSlot, ext: "avif" | "webp") {
  if (!slot.base) return undefined;
  return slot.widths.map((w) => `${slot.base}-${w}.${ext} ${w}w`).join(", ");
}

/** Maior variante — usada como `src` de fallback. */
export function largest(slot: MediaSlot, ext: "avif" | "webp" = "webp") {
  if (!slot.base) return undefined;
  return `${slot.base}-${slot.widths[slot.widths.length - 1]}.${ext}`;
}
