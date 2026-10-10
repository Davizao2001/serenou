/* ---------------------------------------------------------------------------
   DE ONDE O SITE ESTÁ SENDO SERVIDO

   O domínio definitivo ainda não foi decidido, e nada é chutado aqui.

   NEXT_PUBLIC_SITE_URL          quando existir domínio próprio, é só cadastrar
   VERCEL_PROJECT_PRODUCTION_URL a Vercel informa o domínio de produção
   VERCEL_URL                    o endereço daquele deploy específico (preview)

   Sem nenhuma das três — rodando na máquina — fica indefinido, e cada
   consumidor decide o que fazer: os metadados resolvem relativo, que é o
   certo; o sitemap precisa de endereço absoluto e usa o de desenvolvimento.

   Isto morava dentro de app/layout.tsx. Saiu de lá quando o sitemap, o
   robots e os dados estruturados passaram a precisar da mesma resposta —
   três cópias da mesma cadeia de variáveis divergem no dia em que o domínio
   próprio entrar.
--------------------------------------------------------------------------- */

export const ORIGEM: string | undefined =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined);

/** Endereço absoluto, para quem não aceita relativo (sitemap, JSON-LD). */
export const ORIGEM_ABSOLUTA = ORIGEM ?? "http://localhost:3000";

/** Monta um endereço absoluto do site a partir de um caminho. */
export function url(caminho = "/"): string {
  return new URL(caminho, ORIGEM_ABSOLUTA).toString();
}

/* ---------------------------------------------------------------------------
   A IMAGEM DO CARTÃO DE LINK

   O arquivo mora em app/opengraph-image.jpg e o Next publica a rota sozinho.
   Ele também injeta a tag em toda página — MAS só enquanto a página não
   declarar `openGraph` nenhum: declarar o objeto substitui o herdado inteiro,
   imagem junto. Como o catálogo precisa declarar `openGraph.url`, ele perdia
   a imagem em silêncio. Por isso o endereço vive aqui, e quem declara
   `openGraph` repõe a imagem de propósito.
--------------------------------------------------------------------------- */
export const IMAGEM_DO_CARTAO = "/opengraph-image.jpg";

/* ---------------------------------------------------------------------------
   GOOGLE ANALYTICS

   O identificador de medição do GA4. Ele é público — sai no código-fonte de
   qualquer página — então mora aqui e não numa variável de ambiente: uma
   variável a menos para alguém esquecer de cadastrar no dia em que o projeto
   for recriado na Vercel.

   Vazio desliga a medição. Ver components/site/Analytics.tsx, que também só
   carrega em produção.
--------------------------------------------------------------------------- */
export const GA_ID = "G-53DNMBN41B";

/* ---------------------------------------------------------------------------
   GOOGLE SEARCH CONSOLE

   O código que prova ao Google que o site é nosso. Vai como metatag no
   <head> de toda página — o Search Console lê a home, mas o Next monta a tag
   no layout, então ela sai em todas, e é isso mesmo: se a home mudar de
   lugar um dia, a verificação não cai junto.

   A propriedade é por ENDEREÇO: esta vale para serenou.vercel.app. No dia do
   domínio próprio será uma propriedade nova, com código novo, e o histórico
   não vem junto — por isso vale registrar o domínio antes de o site começar
   a receber busca de verdade.
--------------------------------------------------------------------------- */
export const VERIFICACAO_GOOGLE = "lZ8qkz4LpZF3X5Fozk7lQXfGRyq_BL27SHrrHAPNImI";
