import imageUrlBuilder from "@sanity/image-url";
import type { MediaSlot } from "@/lib/media";
import { apiVersion, dataset, projectId } from "../env";

/* ---------------------------------------------------------------------------
   IMAGEM DO SANITY → MediaSlot

   O site inteiro desenha fotografia através de `MediaSlot`: um caminho-base,
   uma lista de larguras e um ponto de foco. Essa forma nasceu dos arquivos
   em /public, gerados offline pelo sharp.

   Aqui a mesma forma é preenchida com URLs do CDN do Sanity. A diferença é
   que as variantes não existem em disco: o CDN gera a largura e o formato
   pedidos na hora e guarda em cache. A Grazi sobe uma foto grande e o
   navegador recebe AVIF ou WebP na medida da tela — sem rodar sharp, sem
   commit, sem deploy.

   Nenhum componente muda por causa disso: `Frame` e `ProductImage` recebem um
   MediaSlot como sempre receberam.
--------------------------------------------------------------------------- */

/* Construído sob demanda: com projectId vazio o builder não tem o que
   montar, e este módulo é carregado mesmo antes de o projeto existir. */
let construtorCache: ReturnType<typeof imageUrlBuilder> | null = null;
function construtor() {
  if (!construtorCache) construtorCache = imageUrlBuilder({ projectId, dataset });
  return construtorCache;
}

/** Larguras servidas para foto de catálogo.
 *
 *  1200 é o teto porque é a largura nativa das fotos da Grazi (1200×1600).
 *  Pedir mais que isso ao CDN devolve um arquivo maior sem um pixel a mais de
 *  informação — o Sanity amplia, não inventa detalhe.
 *
 *  160 existe para as miniaturas da galeria: um quadro de 84px em tela retina
 *  quer 168px, e sem essa largura no srcset o navegador cairia em 480 e
 *  baixaria seis vezes mais bytes do que precisa. */
const LARGURAS = [160, 480, 720, 960, 1200];

/** Compressão do CDN.
 *
 *  80 é o padrão do Sanity e é pensado para foto de blog. Em tecido liso sob
 *  luz de provador — cetim, tule, poá em fundo claro — 80 deixa o degradê em
 *  faixas e borra a trama. 90 recupera a textura com um arquivo poucos
 *  quilobytes maior, porque AVIF e WebP absorvem bem essa faixa. Acima de 90
 *  o arquivo cresce rápido e o olho não acompanha. */
const QUALIDADE = 90;

/* Quanto espaço a fotografia ocupa na tela, por contexto. É isto que decide
   qual largura do srcset o navegador baixa: um `sizes` que mente para menos
   faz o navegador escolher um arquivo pequeno e a foto sai mole.

   VITRINE   grade de 2 colunas no telefone, 3 a partir de 768px, 4 a partir
             de 1280px, dentro de um container que para de crescer em 112rem.
   PRODUTO   a fotografia principal da peça: 33rem no desktop, tela inteira
             no telefone.
   MINIATURA a fileira embaixo da principal. Pequena de verdade — pedir 1200px
             para um quadro de 84px seria baixar 20x mais bytes do que a tela
             mostra. */
export const SIZES_VITRINE =
  "(min-width: 1792px) 420px, (min-width: 1280px) 24vw, (min-width: 768px) 31vw, 47vw";
export const SIZES_PRODUTO = "(min-width: 1024px) 528px, 92vw";
export const SIZES_MINIATURA = "(min-width: 768px) 84px, 72px";

export type ImagemSanity = {
  _key?: string;
  alt?: string;
  asset?: {
    _id?: string;
    url?: string;
    metadata?: {
      dimensions?: { width?: number; height?: number };
      palette?: { dominant?: { background?: string; foreground?: string } };
    };
  };
  hotspot?: { x?: number; y?: number };
  cor?: string;
};

/**
 * URL de uma largura.
 *
 * `auto=format` é o ponto: o CDN do Sanity olha o cabeçalho Accept e devolve
 * AVIF para quem aceita AVIF, WebP para quem aceita WebP e JPEG para o resto.
 * Por isso o `<picture>` não declara formato — quem negocia é o servidor, uma
 * vez só, com a informação certa. A Grazi sobe um arquivo e o navegador
 * recebe o formato e a largura que couberem na tela dela.
 */
function url(imagem: ImagemSanity, largura: number) {
  return construtor()
    .image(imagem as never)
    .width(largura)
    .auto("format")
    .quality(QUALIDADE)
    .url();
}

function srcsetDe(imagem: ImagemSanity) {
  return LARGURAS.map((l) => `${url(imagem, l)} ${l}w`).join(", ");
}

/**
 * Converte uma imagem do Sanity no slot que os componentes já entendem.
 *
 * O ponto de foco vem do hotspot que a Grazi arrasta no painel: ela marca o
 * que não pode ser cortado, e isso vira o `object-position` da fotografia em
 * qualquer proporção de moldura. Sem hotspot, o centro.
 */
export function slotDeImagem(
  imagem: ImagemSanity | undefined | null,
  {
    id,
    alt,
    sizes = SIZES_VITRINE,
    note = "Fotografia do catálogo",
  }: { id: string; alt?: string; sizes?: string; note?: string }
): MediaSlot {
  const dimensoes = imagem?.asset?.metadata?.dimensions;
  const paleta = imagem?.asset?.metadata?.palette?.dominant;

  /* Sem imagem, o slot vira a placa tonal de sempre — a moldura continua
     reservando o espaço e nada pula quando a foto chegar. */
  if (!imagem?.asset) {
    return {
      id,
      base: null,
      widths: LARGURAS,
      sizes,
      width: 1122,
      height: 1402,
      alt: alt ?? "",
      focus: "50% 50%",
      focusMobile: "50% 50%",
      tone: ["#e6dbcb", "#cbbda6"],
      cor: null,
      note,
    };
  }

  const foco = `${Math.round((imagem.hotspot?.x ?? 0.5) * 100)}% ${Math.round(
    (imagem.hotspot?.y ?? 0.5) * 100
  )}%`;

  return {
    id,
    /* `base` não é usado para montar URL aqui — serve só para o `Frame`
       saber que existe fotografia. As URLs reais vêm de `fontes`. */
    base: imagem.asset.url ?? "sanity",
    fontes: {
      auto: srcsetDe(imagem),
      fallback: url(imagem, LARGURAS[LARGURAS.length - 1]),
    },
    widths: LARGURAS,
    sizes,
    width: dimensoes?.width ?? 1122,
    height: dimensoes?.height ?? 1402,
    alt: imagem.alt ?? alt ?? "",
    focus: foco,
    focusMobile: foco,
    tone: [paleta?.background ?? "#e6dbcb", paleta?.foreground ?? "#cbbda6"],
    cor: imagem.cor?.trim() || null,
    note,
  };
}

/** Projeção GROQ das imagens: tudo que `slotDeImagem` precisa, nada além. */
export const PROJECAO_IMAGEM = `{
  _key,
  alt,
  cor,
  hotspot,
  asset->{
    _id,
    url,
    metadata { dimensions, palette { dominant } }
  }
}`;

export { apiVersion };
