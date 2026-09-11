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

/** Larguras servidas para foto de catálogo. */
const LARGURAS = [480, 720, 960, 1200];

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
    .quality(80)
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
    sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw",
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
    note,
  };
}

/** Projeção GROQ das imagens: tudo que `slotDeImagem` precisa, nada além. */
export const PROJECAO_IMAGEM = `{
  _key,
  alt,
  hotspot,
  asset->{
    _id,
    url,
    metadata { dimensions, palette { dominant } }
  }
}`;

export { apiVersion };
