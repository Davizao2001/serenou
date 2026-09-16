import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/instrument-sans/index.css";
import "./globals.css";
import { HERO_SLIDES } from "@/lib/media";
import { MARCA } from "@/lib/loja";
/* De onde o site está sendo servido. A cadeia de variáveis mora em
   lib/site.ts porque o sitemap, o robots e os dados estruturados precisam da
   mesma resposta. */
import { ORIGEM } from "@/lib/site";
import { DadosEstruturados } from "@/components/site/DadosEstruturados";
import { lojaJsonLd } from "@/lib/dados-estruturados";

/* Título e descrição saem da identidade que já existe em `lib/loja.ts` —
   nada foi inventado aqui. `metadataBase` fica de fora de propósito: sem
   domínio definitivo, apontar para um endereço chutado geraria links
   absolutos quebrados no compartilhamento. Com ele ausente, o Next monta os
   links relativos ao domínio que estiver servindo, que é o certo tanto no
   preview quanto no dia do lançamento. */
const TITULO = `${MARCA.nome} | ${MARCA.assinatura.replace(/\.$/, "")}`;
const DESCRICAO =
  "Hoje, a Serenou veste diferentes momentos da mulher: vestidos, conjuntos, peças casuais e moda praia pensados para uma rotina real.";

export const metadata: Metadata = {
  metadataBase: ORIGEM ? new URL(ORIGEM) : undefined,
  title: {
    default: TITULO,
    template: `%s | ${MARCA.nome}`,
  },
  description: DESCRICAO,
  openGraph: {
    siteName: MARCA.nome,
    title: TITULO,
    description: DESCRICAO,
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2ece2",
};

/* Roda antes da primeira pintura.

   `js-motion`: sem JavaScript a classe nunca entra e todo o conteúdo nasce
   visível.

   `data-intro`: a decisão de tocar a intro precisa estar tomada antes do
   primeiro quadro, senão a hero aparece por um instante e só depois a cortina
   cai. `?intro=1` força a intro para teste, ignorando a sessão.

   SÓ NA HOME, E ESSA CONDIÇÃO É A CORREÇÃO DE UM DEFEITO REAL

   Este script roda em toda rota, mas quem apaga `data-intro` é o
   `SerenouIntro`, que só existe em app/page.tsx. Sem a checagem de caminho, a
   pessoa cujo PRIMEIRO endereço da sessão fosse uma peça — o caso de quem
   clica num link compartilhado no WhatsApp, que é a principal porta de
   entrada da loja — recebia `html[data-intro="ativa"]` sem ninguém para
   removê-lo, e com ele o `overflow: hidden` da folha de estilo. A página não
   rolava: medido em 16/09, roda do mouse e tecla End devolviam scrollY 0 numa
   página de 4980px, com o botão do WhatsApp parado em 1221px, fora de
   alcance. Quem passava pela home antes não via nada disso, e foi o que
   escondeu o defeito por semanas.

   A cortina também tem uma saída em CSS puro (ver app/globals.css): a
   decisão de acendê-la é tomada aqui, por script inline que sempre roda, e
   apagá-la não pode depender do bundle, que pode não chegar. */
const ANTES_DA_PINTURA = `
document.documentElement.classList.add("js-motion");
try {
  var naHome = location.pathname === "/" || location.pathname === "";
  var forcar = /[?&]intro=1(&|$)/.test(location.search);
  var visto = sessionStorage.getItem("serenou_intro_seen") === "true";
  if (naHome && (forcar || !visto))
    document.documentElement.setAttribute("data-intro", "ativa");
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* O tom da primeira fotografia entra já no HTML do servidor: se
       esperasse o JavaScript, a tipografia piscaria em carvão sobre a
       foto escura antes de virar off-white. */
    <html lang="pt-BR" data-hero-tom={HERO_SLIDES[0].tom}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANTES_DA_PINTURA }} />
      </head>
      <body>
        {/* A loja física, para a busca local. Fica no layout e não numa
            página porque o `@id` dela é o vendedor referenciado pela oferta
            de cada peça — a referência só resolve se os dois estiverem no
            mesmo documento. Só sai daqui o que a Grazi confirmou; ver o
            comentário em lib/dados-estruturados.ts. */}
        <DadosEstruturados dados={lojaJsonLd()} />

        {/* Fundo da página. A transição cromática entre capítulos acontece
            aqui, não em um gradiente visível. */}
        <div
          data-canvas
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-linho"
        />
        <a
          href="#conteudo"
          className="t-eyebrow sr-only bg-carvao px-6 py-4 text-linho focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
