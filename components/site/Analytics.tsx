import Script from "next/script";
import { GA_ID } from "@/lib/site";

/**
 * GOOGLE ANALYTICS
 *
 * Só entra em produção e só se houver ID. Em desenvolvimento e nos previews
 * da Vercel ele não carrega — senão cada `npm run dev` e cada deploy de teste
 * entrariam como visita, e o número que a Grazi lê no fim do mês seria o
 * nosso trabalho somado ao movimento real dela.
 *
 * `afterInteractive` e não `beforeInteractive`: medir não pode atrasar a
 * primeira fotografia. A conta de quem entrou continua certa — o gtag enfileira
 * o evento e envia quando carrega.
 *
 * O GA4 conta a troca de página sozinho. O site é uma aplicação de uma página
 * só: ir de /catalogo para /produto/x não recarrega nada, e um Analytics
 * instalado do jeito antigo contaria uma visita para a loja inteira. A medição
 * por histórico do GA4 vem ligada e cobre isso — conferir em Admin → Fluxos de
 * dados → Medição aprimorada se um dia o número de páginas por sessão vier
 * sempre 1.
 */
export function Analytics() {
  if (!GA_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());
gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
