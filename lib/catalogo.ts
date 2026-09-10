/* ---------------------------------------------------------------------------
   CATÁLOGO — tipos e dados de desenvolvimento

   Isto é a camada de APRESENTAÇÃO. Não há banco, CMS nem autenticação: os
   produtos abaixo existem só para a UI ter o que desenhar enquanto as regras
   e os dados reais não chegam.

   O que está aqui NÃO decide negócio:
   - `promocao` é uma flag, não uma categoria — proposta, a confirmar;
   - `indisponivel` tem um tratamento visual provisório;
   - se cor e tamanho serão obrigatórios antes do WhatsApp ainda não foi
     fechado, então o CTA funciona com ou sem escolha.

   Quando os dados reais entrarem, o alvo é trocar `PRODUTOS_EXEMPLO` pela
   fonte verdadeira e manter `Produto` como contrato.
--------------------------------------------------------------------------- */

import type { MediaSlot } from "./media";
import type { Categoria, StatusProduto } from "./loja";

export type Cor = {
  /** Nome que a cliente final lê e que vai na mensagem do WhatsApp. */
  nome: string;
  /** Amostra da cor. Duas paradas quando a peça é estampada ou bicolor. */
  amostra: string | [string, string];
};

export type Tamanho = {
  rotulo: string;
  /** Peça acabada naquele tamanho: aparece riscada, não some. */
  disponivel: boolean;
};

export type Produto = {
  slug: string;
  nome: string;
  /** Em centavos, para não arrastar ponto flutuante até a vitrine. */
  preco: number;
  /** Preço anterior, quando houver promoção. */
  precoAnterior?: number;
  categoria: Categoria;
  /** Coleções transversais — a peça continua na categoria de origem. */
  novidade?: boolean;
  promocao?: boolean;
  status: StatusProduto;
  /** Primeira imagem é a da vitrine; as demais são a galeria. */
  imagens: MediaSlot[];
  cores: Cor[];
  tamanhos: Tamanho[];
  /** Uma frase. O catálogo é fotografia e respiro, não texto. */
  resumo: string;
  /** Bullets curtos da página de produto. */
  detalhes: string[];
};

export function formatarPreco(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

/** Rótulo visível de um estado. `disponivel` não recebe selo. */
export function rotuloStatus(p: Produto): string | null {
  if (p.status === "indisponivel") return "Esgotado";
  if (p.promocao) return "Promoção";
  if (p.novidade) return "Novo";
  return null;
}

/* -------------------------------------------------------------------------
   Dados de desenvolvimento

   As fotografias são as mesmas da home — são de loja, não de still de
   produto. Servem para a UI ter peso e proporção reais; o padrão das fotos
   de catálogo é um dos pontos da próxima call.

   Dois produtos ficam sem `base` de propósito, para que o estado "fotografia
   ainda não entregue" seja visível na revisão em vez de ser descoberto no
   dia em que faltar um arquivo.
------------------------------------------------------------------------- */

const W = [480, 720, 960, 1122];

function foto(
  id: string,
  base: string | null,
  alt: string,
  note: string,
  tone: [string, string] = ["#e6dbcb", "#cbbda6"]
): MediaSlot {
  return {
    id,
    base,
    widths: W,
    sizes: "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw",
    width: 1122,
    height: 1402,
    alt,
    focus: "50% 32%",
    focusMobile: "50% 30%",
    tone,
    note,
  };
}

const TAMANHOS_PADRAO: Tamanho[] = [
  { rotulo: "P", disponivel: true },
  { rotulo: "M", disponivel: true },
  { rotulo: "G", disponivel: true },
  { rotulo: "GG", disponivel: false },
];

export const PRODUTOS_EXEMPLO: Produto[] = [
  {
    slug: "vestido-longo-plissado-oliva",
    nome: "Vestido longo plissado",
    preco: 32900,
    categoria: "vestidos",
    novidade: true,
    status: "disponivel",
    imagens: [
      foto(
        "p-oliva-1",
        "/images/serenou/looks/conjuntos-verde-oliva",
        "Vestido longo plissado em verde oliva, com caimento fluido até o tornozelo.",
        "Still frontal do vestido plissado",
        ["#5b6140", "#3d4230"]
      ),
    ],
    cores: [
      { nome: "Oliva", amostra: "#565e38" },
      { nome: "Preto", amostra: "#16130f" },
    ],
    tamanhos: TAMANHOS_PADRAO,
    resumo: "Plissado que acompanha o passo, do escritório ao jantar.",
    detalhes: ["Tecido leve com caimento fluido", "Forro na saia", "Comprimento ao tornozelo"],
  },
  {
    slug: "conjunto-pantalona-amarelo-manteiga",
    nome: "Conjunto pantalona",
    preco: 28900,
    precoAnterior: 34900,
    categoria: "conjuntos",
    promocao: true,
    status: "disponivel",
    imagens: [
      foto(
        "p-manteiga-1",
        "/images/serenou/looks/conjuntos-amarelo-manteiga-bege",
        "Conjunto de blusa e pantalona em amarelo-manteiga, em tecido leve.",
        "Still frontal do conjunto amarelo-manteiga",
        ["#e8d9a8", "#cbb87f"]
      ),
    ],
    cores: [
      { nome: "Amarelo-manteiga", amostra: "#e3cf95" },
      { nome: "Bege", amostra: "#d3c3ac" },
    ],
    tamanhos: TAMANHOS_PADRAO,
    resumo: "Blusa e pantalona no mesmo tecido — funciona junto ou separado.",
    detalhes: ["Blusa com alça ajustável", "Pantalona com cós elástico", "Vendido em conjunto"],
  },
  {
    slug: "vestido-curto-verde-lima",
    nome: "Vestido curto",
    preco: 24900,
    categoria: "vestidos",
    status: "disponivel",
    imagens: [
      foto(
        "p-lima-1",
        "/images/serenou/editorial/vestidos-claros-lima-offwhite-verde",
        "Vestido curto em verde-lima, com decote reto e alças finas.",
        "Still frontal do vestido verde-lima",
        ["#d8e2a6", "#b6c47c"]
      ),
    ],
    cores: [
      { nome: "Verde-lima", amostra: "#cbdc93" },
      { nome: "Off-white", amostra: "#f2ece2" },
      { nome: "Verde-menta", amostra: "#a9c6a4" },
    ],
    tamanhos: [
      { rotulo: "P", disponivel: true },
      { rotulo: "M", disponivel: false },
      { rotulo: "G", disponivel: true },
      { rotulo: "GG", disponivel: true },
    ],
    resumo: "Decote reto, alça fina, comprimento acima do joelho.",
    detalhes: ["Malha canelada", "Alças finas", "Acima do joelho"],
  },
  {
    slug: "conjunto-preto-babado",
    nome: "Conjunto com babado",
    preco: 31900,
    categoria: "conjuntos",
    status: "disponivel",
    imagens: [
      foto(
        "p-babado-1",
        "/images/serenou/lifestyle/conjunto-preto-babado",
        "Conjunto preto de blusa com babado e pantalona, em tecido fluido.",
        "Still frontal do conjunto preto com babado",
        ["#2b2825", "#111010"]
      ),
    ],
    cores: [{ nome: "Preto", amostra: "#16130f" }],
    tamanhos: TAMANHOS_PADRAO,
    resumo: "Babado assimétrico na blusa, pantalona de cintura alta.",
    detalhes: ["Babado assimétrico", "Cintura alta", "Tecido fluido"],
  },
  {
    slug: "tunica-assimetrica-preta",
    nome: "Túnica assimétrica",
    preco: 26900,
    categoria: "blusas",
    status: "indisponivel",
    imagens: [
      foto(
        "p-tunica-1",
        "/images/serenou/mannequins/looks-pretos-alfaiataria",
        "Túnica preta de corte assimétrico, com gola alta e broche dourado.",
        "Still frontal da túnica assimétrica",
        ["#2b2825", "#111010"]
      ),
    ],
    cores: [{ nome: "Preto", amostra: "#16130f" }],
    tamanhos: [
      { rotulo: "P", disponivel: false },
      { rotulo: "M", disponivel: false },
      { rotulo: "G", disponivel: false },
      { rotulo: "GG", disponivel: false },
    ],
    resumo: "Corte assimétrico com gola alta e broche dourado.",
    detalhes: ["Gola alta", "Broche dourado incluso", "Corte assimétrico"],
  },
  {
    slug: "calca-pantalona-oliva",
    nome: "Pantalona",
    preco: 21900,
    categoria: "calcas",
    novidade: true,
    status: "disponivel",
    /* Sem fotografia: a placa tonal marca o espaço na proporção certa. */
    imagens: [
      foto(
        "p-pantalona-1",
        null,
        "Pantalona em verde oliva, de cintura alta e perna ampla.",
        "Pantalona oliva, still frontal em fundo neutro",
        ["#5b6140", "#3d4230"]
      ),
    ],
    cores: [
      { nome: "Oliva", amostra: "#565e38" },
      { nome: "Preto", amostra: "#16130f" },
      { nome: "Bege", amostra: "#d3c3ac" },
    ],
    tamanhos: TAMANHOS_PADRAO,
    resumo: "Cintura alta, perna ampla, cai bem com salto ou rasteira.",
    detalhes: ["Cintura alta", "Perna ampla", "Bolsos laterais"],
  },
  {
    slug: "saida-de-praia-off-white",
    nome: "Saída de praia",
    preco: 17900,
    categoria: "moda-praia",
    status: "disponivel",
    imagens: [
      foto(
        "p-praia-1",
        null,
        "Saída de praia off-white em tecido leve e translúcido.",
        "Saída de praia, still frontal em fundo neutro",
        ["#f0e9dd", "#d9cfbe"]
      ),
    ],
    cores: [
      { nome: "Off-white", amostra: "#f2ece2" },
      { nome: "Preto", amostra: "#16130f" },
    ],
    tamanhos: [
      { rotulo: "Único", disponivel: true },
    ],
    resumo: "Tecido leve, translúcido, para vestir por cima do biquíni.",
    detalhes: ["Tecido translúcido", "Tamanho único", "Manga ampla"],
  },
  {
    slug: "vestido-ombro-unico-preto",
    nome: "Vestido de ombro único",
    preco: 35900,
    categoria: "vestidos",
    /* Oculto: acabou, mas o cadastro e as fotos continuam. Não aparece na
       vitrine — o grid filtra. Fica aqui para o filtro poder ser testado. */
    status: "oculto",
    imagens: [
      foto(
        "p-ombro-1",
        "/images/serenou/lifestyle/modelo-preto-com-alfaiataria-ao-fundo",
        "Vestido preto de ombro único, com broche dourado na alça.",
        "Still frontal do vestido de ombro único",
        ["#2b2825", "#111010"]
      ),
    ],
    cores: [{ nome: "Preto", amostra: "#16130f" }],
    tamanhos: TAMANHOS_PADRAO,
    resumo: "Ombro único, broche dourado, comprimento midi.",
    detalhes: ["Ombro único", "Broche dourado", "Comprimento midi"],
  },
];

/** O que a vitrine mostra. `oculto` nunca chega ao cliente final. */
export function produtosVisiveis(produtos = PRODUTOS_EXEMPLO): Produto[] {
  return produtos.filter((p) => p.status !== "oculto");
}

export function acharProduto(slug: string): Produto | undefined {
  return PRODUTOS_EXEMPLO.find((p) => p.slug === slug);
}
