import type { MetadataRoute } from "next";
import { listarSlugs } from "@/sanity/lib/produtos";
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

  return [
    { url: url("/"), lastModified: agora },
    { url: url("/catalogo"), lastModified: agora },

    ...CATEGORIAS.map((c) => ({
      url: url(`/catalogo?c=${c.slug}`),
      lastModified: agora,
    })),

    ...COLECOES.map((c) => ({
      url: url(`/catalogo?c=${c.slug}`),
      lastModified: agora,
    })),

    ...slugs.map((slug) => ({
      url: url(`/produto/${slug}`),
      lastModified: agora,
    })),
  ];
}
