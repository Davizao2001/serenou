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
