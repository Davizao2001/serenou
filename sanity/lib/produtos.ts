import { clienteSanity } from "./client";
import { PROJECAO_IMAGEM, slotDeImagem, type ImagemSanity } from "./imagem";
import { CONFIGURADO, REVALIDAR } from "../env";
import type { Produto } from "@/lib/catalogo";
import { PRODUTOS_DESENVOLVIMENTO, escolherRelacionadas } from "@/lib/catalogo";
import { CATEGORIAS } from "@/lib/loja";
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

/* `status != "oculto"` mora aqui, em um lugar só.
 *
 * `teste != true` entrou junto, e era uma incoerência de verdade: o painel
 * esconde a peça de teste da lista "Catálogo" (ver sanity.config.ts), mas o
 * site a publicava — vitrine, página própria, indexável. A Grazi não a via no
 * lugar onde trabalha, então não tinha como perceber. O painel dizia uma
 * coisa e o site fazia outra.
 *
 * `!= true` e não `== false`: no GROQ, campo ausente não é `false`, é
 * indefinido, e `teste == false` deixaria de fora toda peça cadastrada antes
 * do campo existir. */
const VISIVEIS = `_type == "produto" && status != "oculto" && teste != true && defined(slug.current)`;

const CONSULTA_LISTA = `*[${VISIVEIS}] | order(_createdAt desc) { ${CAMPOS} }`;
const CONSULTA_UMA = `*[${VISIVEIS} && slug.current == $slug][0] { ${CAMPOS} }`;
const CONSULTA_SLUGS = `*[${VISIVEIS}].slug.current`;

/** Categorias que o site sabe filtrar, para reconhecer uma que não conhece. */
const CATEGORIAS_CONHECIDAS = new Set<string>(CATEGORIAS.map((c) => c.slug));

/** Converte o documento do Sanity no tipo que os componentes já usam. */

/* ---------------------------------------------------------------------------
   A DESCRIÇÃO AUTOMÁTICA DA FOTO

   Isto é FALLBACK, e só. Em `slotDeImagem` a linha é
   `alt: imagem.alt ?? alt ?? ""` — o que a Grazi escreveu no campo "Descrição
   da foto" sempre vence. Nada é gravado no documento, nada é migrado, os
   cadastros existentes não mudam um byte. Esta função só decide o que dizer
   quando o campo está vazio.

   O que havia antes era `"Conjunto Bless, fotografia 3"`. Está correto e não
   diz nada: quem usa leitor de tela ouve um número de posição no lugar da
   peça. Mas o documento já sabe mais do que isso — a foto tem `cor`, e a cor
   tem nome. `"Conjunto Bless na cor bordô"` sai dos mesmos dados e descreve
   a fotografia.

   A CAPITALIZAÇÃO, SEM NLP

   No painel a cor é um rótulo e começa com maiúscula: "Bordô", "Off-white".
   Dentro de uma frase, "na cor Bordô" lê como nome próprio. A regra é a
   mínima que funciona: derruba a PRIMEIRA letra e não toca no resto.

     Bordô          → bordô
     Off-white      → off-white
     Azul-marinho   → azul-marinho
     Azul Tiffany   → azul Tiffany     (Tiffany é marca, e sobrevive)

   Uma regra. Sem dicionário, sem lista de exceções, sem tentar adivinhar o
   que é nome próprio.

   SEM COR

   Quando a foto não tem cor vinculada não existe mais dado para usar — só a
   posição. A primeira fica com o nome limpo, que é a que mais importa (é a
   da vitrine e a que abre a página). As seguintes voltam a ser numeradas,
   porque três fotos com alt idêntico é pior para leitor de tela do que três
   numeradas: a pessoa perde a noção de quantas são e de onde está.

   Essa é a fronteira honesta do automático. Descrever o que a foto MOSTRA
   continua sendo trabalho do campo manual, que segue lá.
--------------------------------------------------------------------------- */
/** Exportada só para o teste em `scripts/conferir-painel.ts`. */
export function altAutomatico(
  nome: string | undefined,
  cor: string | null | undefined,
  indice: number
): string {
  if (!nome) return "";

  const corLimpa = cor?.trim();
  if (corLimpa) return `${nome} na cor ${minusculaInicial(corLimpa)}`;

  return indice === 0 ? nome : `${nome}, foto ${indice + 1}`;
}

function minusculaInicial(texto: string): string {
  return texto.charAt(0).toLocaleLowerCase("pt-BR") + texto.slice(1);
}


function adaptar(d: ProdutoSanity): Produto {
  /* Uma categoria que o site não conhece vinha virando "vestidos" em
     silêncio. Continua virando — a peça precisa aparecer em algum lugar, e
     sumir do catálogo seria pior — mas agora deixa rastro nos Runtime Logs.
     O caminho real para isto é alguém renomear um slug em lib/loja.ts: todas
     as peças da categoria antiga viram vestido de uma vez, e sem este aviso
     a descoberta seria pela vitrine. */
  const categoria = d.categoria ?? "";
  if (categoria && !CATEGORIAS_CONHECIDAS.has(categoria)) {
    console.warn(
      `[catálogo] a peça "${d.nome ?? d._id}" está na categoria "${categoria}", que não existe em lib/loja.ts. Mostrando como vestido.`
    );
  }

  return {
    slug: d.slug?.current ?? d._id,
    nome: d.nome ?? "Peça sem nome",
    /* A Grazi digita reais no painel; o site trabalha em centavos para não
       arrastar ponto flutuante até a vitrine. A conversão mora só aqui. */
    preco: Math.round((d.preco ?? 0) * 100),
    /* O preço riscado exige a promoção MARCADA, não só o valor preenchido.
       `hidden` no painel esconde o campo sem apagar o dado, então uma peça
       que saiu da promoção guardava o valor antigo e continuava riscando o
       preço fora de Promoções. O schema agora impede o estado incoerente; esta
       linha é o cinto para os documentos que já existirem assim. */
    precoAnterior:
      d.promocao && typeof d.precoAnterior === "number"
        ? Math.round(d.precoAnterior * 100)
        : undefined,
    categoria: (CATEGORIAS_CONHECIDAS.has(categoria)
      ? categoria
      : "vestidos") as Categoria,
    novidade: d.novidade ?? false,
    promocao: d.promocao ?? false,
    status: (d.status ?? "disponivel") as StatusProduto,
    imagens: (d.imagens ?? []).map((img, i) =>
      slotDeImagem(img, {
        id: `${d._id}-${i}`,
        alt: altAutomatico(d.nome, img?.cor, i),
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
 *
 * O RESULTADO DIZ SE DEU CERTO, E ISSO IMPORTA
 *
 * Antes a falha era indistinguível de "não achei nada": as duas devolviam
 * vazio. Quem chamava não tinha como saber a diferença, e as duas
 * consequências eram ruins — o catálogo vazio dizia "as peças estão sendo
 * fotografadas", que é mentira durante uma queda; e a página de uma peça que
 * EXISTE virava `notFound()`, com o Next guardando esse 404.
 */
type Resultado<T> = { ok: true; valor: T } | { ok: false };

async function consultar<T>(
  descricao: string,
  executar: () => Promise<T>
): Promise<Resultado<T>> {
  try {
    return { ok: true, valor: await executar() };
  } catch (erro) {
    console.error(`[catálogo] falha ao ${descricao} no Sanity:`, erro);
    return { ok: false };
  }
}

/**
 * O catálogo não pôde ser lido.
 *
 * Diferente de "está vazio". Quem captura isto mostra "não conseguimos
 * carregar agora", nunca "não existe" — e a página de produto não vira 404
 * por causa de um minuto de instabilidade.
 */
export class CatalogoIndisponivel extends Error {
  constructor(detalhe: string) {
    super(`Não foi possível ler o catálogo (${detalhe}).`);
    this.name = "CatalogoIndisponivel";
  }
}

/** Todas as peças visíveis, mais recentes primeiro. Vazio se a leitura falhar. */
export async function listarProdutos(): Promise<Produto[]> {
  return (await listarProdutosComEstado()).produtos;
}

/**
 * A mesma lista, dizendo se deu para ler.
 *
 * Só o catálogo usa: é a única tela que precisa escolher entre dois textos de
 * estado vazio — "ainda estamos fotografando" e "não conseguimos carregar".
 */
export async function listarProdutosComEstado(): Promise<{
  produtos: Produto[];
  falhou: boolean;
}> {
  if (!CONFIGURADO)
    return {
      produtos: PRODUTOS_DESENVOLVIMENTO.filter((p) => p.status !== "oculto"),
      falhou: false,
    };

  const r = await consultar("listar as peças", () =>
    clienteSanity().fetch<ProdutoSanity[]>(CONSULTA_LISTA, {}, cache)
  );

  if (!r.ok) return { produtos: [], falhou: true };
  return { produtos: (r.valor ?? []).map(adaptar), falhou: false };
}

/**
 * Uma peça pelo endereço. `undefined` quando não existe ou está oculta.
 *
 * Quando a CONSULTA falha, lança `CatalogoIndisponivel` em vez de devolver
 * nada — porque devolver nada viraria `notFound()` na página, e um 404
 * guardado para uma peça que existe é o pior desfecho possível para um link
 * que circulou no WhatsApp.
 */
export async function buscarProduto(slug: string): Promise<Produto | undefined> {
  if (!CONFIGURADO)
    return PRODUTOS_DESENVOLVIMENTO.find((p) => p.slug === slug && p.status !== "oculto");

  const r = await consultar(`buscar a peça "${slug}"`, () =>
    clienteSanity().fetch<ProdutoSanity | null>(CONSULTA_UMA, { slug }, cache)
  );

  if (!r.ok) throw new CatalogoIndisponivel(`peça "${slug}"`);
  return r.valor ? adaptar(r.valor) : undefined;
}

/** Endereços que ganham página estática. Peça oculta nunca entra. */
export async function listarSlugs(): Promise<string[]> {
  if (!CONFIGURADO)
    return PRODUTOS_DESENVOLVIMENTO.filter((p) => p.status !== "oculto").map((p) => p.slug);
  /* Aqui a falha continua devolvendo lista vazia, e é de propósito: esta
     função roda na compilação. Lançar faria o build inteiro parar por causa
     de um minuto de instabilidade. Sem rota pré-gerada o site continua de pé
     — `dynamicParams` deixa cada peça ser montada na primeira visita. */
  const r = await consultar("listar os endereços das peças", () =>
    clienteSanity().fetch<string[]>(CONSULTA_SLUGS, {}, cache)
  );
  return r.ok ? (r.valor ?? []) : [];
}

/** A fileira do rodapé da página de produto: mesma categoria primeiro, e o
 *  resto do catálogo completando as vagas. A regra inteira — e o porquê de
 *  cada exclusão — mora em `escolherRelacionadas`, em lib/catalogo.ts, que é
 *  função pura e pode ser testada sem o Sanity. Aqui só se busca a lista. */
export async function relacionadas(produto: Produto, quantas = 4): Promise<Produto[]> {
  return escolherRelacionadas(await listarProdutos(), produto, quantas);
}
