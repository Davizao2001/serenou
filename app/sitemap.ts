import type { MetadataRoute } from "next";
import { listarSlugs, secoesComPecas } from "@/sanity/lib/produtos";
import { CATEGORIAS, COLECOES } from "@/lib/loja";
import { url } from "@/lib/site";

/* ---------------------------------------------------------------------------
   SITEMAP

   Sem ele, o Google só encontrava peça por link — e a loja vive de link
   compartilhado, não de navegação a partir da home. Peça nova demorava a ser
   indexada e peça removida demorava a sair.

   A lista de peças vem de `listarSlugs()`, a MESMA função que decide quais
   endereços ganham página. Isso não é conveniência: é o que garante que peça
   oculta, peça de teste e peça sem endereço nunca entrem aqui. Montar uma
   segunda consulta seria criar uma segunda verdade, e um sitemap que anuncia
   uma peça que responde 404 é pior do que não ter sitemap.

   As páginas de categoria entram como `/catalogo?c=vestidos` porque é assim
   que elas existem — o filtro é resolvido no servidor e cada endereço devolve
   uma lista de verdade, com título próprio na aba.

   `changeFrequency` e `priority` são dicas que o Google ignora há anos.
   Ficam de fora: campo que ninguém lê é campo que envelhece mentindo.
--------------------------------------------------------------------------- */

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();
  const slugs = await listarSlugs();

  /* SÓ ENTRA SEÇÃO QUE TEM PEÇA

     O sitemap anunciava /catalogo?c=novidades e ?c=promocoes sempre, e as
     duas estão vazias desde o primeiro dia — nenhuma peça foi marcada. É o
     mesmo furo que o menu tinha: avisar o Google sobre uma página vazia faz
     ele rastrear, achar nada e descontar a confiança no resto do sitemap.
     Agora a lista sai do catálogo, pela mesma regra do menu. */
  const secoes = await secoesComPecas();
  const temColecao = (slug: string) =>
    slug === "novidades" ? secoes.novidades : secoes.promocoes;

  return [
    { url: url("/"), lastModified: agora },
    { url: url("/catalogo"), lastModified: agora },

    ...CATEGORIAS.filter((c) => secoes.categorias.includes(c.slug)).map((c) => ({
      url: url(`/catalogo?c=${c.slug}`),
      lastModified: agora,
    })),

    ...COLECOES.filter((c) => temColecao(c.slug)).map((c) => ({
      url: url(`/catalogo?c=${c.slug}`),
      lastModified: agora,
    })),

    ...slugs.map((slug) => ({
      url: url(`/produto/${slug}`),
      lastModified: agora,
    })),
  ];
}
