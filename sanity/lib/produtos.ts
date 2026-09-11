import { clienteSanity } from "./client";
import { PROJECAO_IMAGEM, slotDeImagem, type ImagemSanity } from "./imagem";
import { CONFIGURADO, REVALIDAR } from "../env";
import type { Produto } from "@/lib/catalogo";
import { PRODUTOS_DESENVOLVIMENTO } from "@/lib/catalogo";
import type { Categoria, StatusProduto } from "@/lib/loja";

/* ---------------------------------------------------------------------------
   LEITURA DO CATÁLOGO

   Três funções e uma regra: `oculto` é filtrado NA CONSULTA, não na tela.

   Isso importa. Filtrar na tela esconde a peça do grid mas deixa a rota de
   pé, e foi exatamente o furo que a auditoria encontrou: um produto "retirado
   do catálogo" continuava com página pública e indexável. Com o filtro dentro
   do GROQ, a peça oculta não chega nem a existir para o site — nem no grid,
   nem na lista de rotas, nem na busca por slug.

   Enquanto o projeto do Sanity não existir, tudo cai em
   `PRODUTOS_DESENVOLVIMENTO`. O site continua de pé e o build passa; no dia
   em que as variáveis de ambiente entrarem, a fonte troca sozinha.
--------------------------------------------------------------------------- */

type CorSanity = { nome?: string; amostra?: { hex?: string } };
type TamanhoSanity = { rotulo?: string; disponivel?: boolean };

type ProdutoSanity = {
  _id: string;
  nome?: string;
  slug?: { current?: string };
  preco?: number;
  precoAnterior?: number;
  categoria?: string;
  resumo?: string;
  detalhes?: string[];
  imagens?: ImagemSanity[];
  cores?: CorSanity[];
  tamanhos?: TamanhoSanity[];
  status?: string;
  novidade?: boolean;
  promocao?: boolean;
};

const CAMPOS = `
  _id,
  nome,
  slug,
  preco,
  precoAnterior,
  categoria,
  resumo,
  detalhes,
  status,
  novidade,
  promocao,
  cores[]{ nome, amostra },
  tamanhos[]{ rotulo, disponivel },
  imagens[]${PROJECAO_IMAGEM}
`;

/* `status != "oculto"` mora aqui, em um lugar só. */
const VISIVEIS = `_type == "produto" && status != "oculto" && defined(slug.current)`;

const CONSULTA_LISTA = `*[${VISIVEIS}] | order(_createdAt desc) { ${CAMPOS} }`;
const CONSULTA_UMA = `*[${VISIVEIS} && slug.current == $slug][0] { ${CAMPOS} }`;
const CONSULTA_SLUGS = `*[${VISIVEIS}].slug.current`;

/** Converte o documento do Sanity no tipo que os componentes já usam. */
function adaptar(d: ProdutoSanity): Produto {
  return {
    slug: d.slug?.current ?? d._id,
    nome: d.nome ?? "Peça sem nome",
    /* A Grazi digita reais no painel; o site trabalha em centavos para não
       arrastar ponto flutuante até a vitrine. A conversão mora só aqui. */
    preco: Math.round((d.preco ?? 0) * 100),
    precoAnterior:
      typeof d.precoAnterior === "number" ? Math.round(d.precoAnterior * 100) : undefined,
    categoria: (d.categoria ?? "vestidos") as Categoria,
    novidade: d.novidade ?? false,
    promocao: d.promocao ?? false,
    status: (d.status ?? "disponivel") as StatusProduto,
    imagens: (d.imagens ?? []).map((img, i) =>
      slotDeImagem(img, {
        id: `${d._id}-${i}`,
        alt: d.nome ? `${d.nome}, fotografia ${i + 1}` : "",
        note: `Fotografia de ${d.nome ?? "peça"}`,
      })
    ),
    cores: (d.cores ?? [])
      .filter((c) => c.nome)
      .map((c) => ({ nome: c.nome as string, amostra: c.amostra?.hex ?? "#cbbda6" })),
    tamanhos: (d.tamanhos ?? [])
      .filter((t) => t.rotulo)
      .map((t) => ({ rotulo: t.rotulo as string, disponivel: t.disponivel !== false })),
    resumo: d.resumo ?? "",
    detalhes: d.detalhes ?? [],
  };
}

const cache = { next: { revalidate: REVALIDAR } };

/**
 * Consulta que não derruba o site.
 *
 * Sem isto, um minuto de instabilidade no Sanity — ou um nome de dataset
 * digitado errado — faz o build inteiro falhar e o deploy não sair. Um
 * catálogo momentaneamente vazio é ruim; um site fora do ar é pior.
 *
 * O erro não some: vai para o log do servidor inteiro, para aparecer nos
 * Runtime Logs da Vercel em vez de virar silêncio.
 */
async function consultar<T>(
  descricao: string,
  executar: () => Promise<T>,
  seFalhar: T
): Promise<T> {
  try {
    return await executar();
  } catch (erro) {
    console.error(`[catálogo] falha ao ${descricao} no Sanity:`, erro);
    return seFalhar;
  }
}

/** Todas as peças visíveis, mais recentes primeiro. */
export async function listarProdutos(): Promise<Produto[]> {
  if (!CONFIGURADO) return PRODUTOS_DESENVOLVIMENTO.filter((p) => p.status !== "oculto");
  const docs = await consultar(
    "listar as peças",
    () => clienteSanity().fetch<ProdutoSanity[]>(CONSULTA_LISTA, {}, cache),
    [] as ProdutoSanity[]
  );
  return (docs ?? []).map(adaptar);
}

/** Uma peça pelo endereço. `undefined` quando não existe ou está oculta. */
export async function buscarProduto(slug: string): Promise<Produto | undefined> {
  if (!CONFIGURADO)
    return PRODUTOS_DESENVOLVIMENTO.find((p) => p.slug === slug && p.status !== "oculto");
  const doc = await consultar(
    `buscar a peça "${slug}"`,
    () => clienteSanity().fetch<ProdutoSanity | null>(CONSULTA_UMA, { slug }, cache),
    null as ProdutoSanity | null
  );
  return doc ? adaptar(doc) : undefined;
}

/** Endereços que ganham página estática. Peça oculta nunca entra. */
export async function listarSlugs(): Promise<string[]> {
  if (!CONFIGURADO)
    return PRODUTOS_DESENVOLVIMENTO.filter((p) => p.status !== "oculto").map((p) => p.slug);
  const slugs = await consultar(
    "listar os endereços das peças",
    () => clienteSanity().fetch<string[]>(CONSULTA_SLUGS, {}, cache),
    [] as string[]
  );
  return slugs ?? [];
}

/** As peças da mesma categoria, para o rodapé da página de produto. */
export async function relacionadas(produto: Produto, quantas = 3): Promise<Produto[]> {
  const todas = await listarProdutos();
  return todas
    .filter((p) => p.slug !== produto.slug && p.categoria === produto.categoria)
    .slice(0, quantas);
}
