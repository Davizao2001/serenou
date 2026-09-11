import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/instrument-sans/index.css";
import "./globals.css";
import { HERO_SLIDES } from "@/lib/media";

export const metadata: Metadata = {
  title: "Serenou | Moda feminina para o dia inteiro",
  description:
    "Hoje, a Serenou veste diferentes momentos da mulher: vestidos, conjuntos, peças casuais e moda praia pensados para uma rotina real.",
  openGraph: {
    title: "Serenou | Moda feminina para o dia inteiro",
    description:
      "Hoje, a Serenou veste diferentes momentos da mulher: vestidos, conjuntos, peças casuais e moda praia pensados para uma rotina real.",
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
   cai. `?intro=1` força a intro para teste, ignorando a sessão. */
const ANTES_DA_PINTURA = `
document.documentElement.classList.add("js-motion");
try {
  var forcar = /[?&]intro=1(&|$)/.test(location.search);
  var visto = sessionStorage.getItem("serenou_intro_seen") === "true";
  if (forcar || !visto) document.documentElement.setAttribute("data-intro", "ativa");
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
