import type { Metadata } from "next";
import Link from "next/link";
import { linkWhatsApp } from "@/lib/loja";

/* ---------------------------------------------------------------------------
   PÁGINA NÃO ENCONTRADA

   Antes daqui, qualquer endereço morto caía na tela padrão do Next:
   "404 — This page could not be found", em inglês, sem cabeçalho, sem
   logotipo e sem nenhuma saída.

   O caminho que realmente traz gente para cá é o fluxo NORMAL da loja, não um
   acidente: a peça acaba, a Grazi oculta pelo painel, e o link que já circulou
   no WhatsApp vira endereço morto. Quem clica é justamente quem queria
   comprar.

   Mesmo assim o título não afirma "essa peça saiu": esta página também atende
   quem digitou o endereço errado, e anunciar uma peça que nunca existiu seria
   inventar um fato. O título diz o que é certo nos dois casos, e o parágrafo
   trata o caso provável pelo nome. Tentei separar em duas — uma
   `not-found.tsx` dentro de app/produto/[slug]/ — e no Next 16 ela renderiza
   vazia sob rota dinâmica; uma página só, honesta, é melhor que duas com uma
   quebrada.

   O QUE ELA RENDERIZA, E ONDE

   Em /endereco-qualquer esta página é pré-renderizada e vem inteira no HTML.
   Em /produto/qualquer-coisa, não: naquela rota o `notFound()` acontece em
   tempo de requisição, o Next já está transmitindo, e o conteúdo chega no
   payload do React em vez do casco — a tela só se monta quando o JavaScript
   executa.

   Isso é comportamento do Next 16 em rota dinâmica, não escolha nossa, e foi
   MEDIDO: com o `not-found` padrão do framework o casco vem igualmente sem
   texto naquela rota. Ou seja, não é piora — é o mesmo limite de antes, agora
   com uma página em português, com a marca e com saída, para os praticamente
   todos que têm JavaScript.

   Duas consequências ficam registradas: quem desligou o JavaScript vê uma
   página em branco nessa rota específica, e o robô de busca depende de
   execução para ler o texto (o status 404 está correto de qualquer forma, e
   é ele que decide a indexação). Tentei três caminhos para resolver — uma
   `not-found.tsx` dentro de app/produto/[slug]/, tirar os componentes de
   cliente, trocar `next/link` por `<a>` — e nenhum muda o casco. Sair de
   `dynamicParams: true` resolveria e custaria caro demais: peça cadastrada
   depois do build deixaria de abrir até o próximo deploy, que é justamente a
   promessa do painel.

   A página em si é de servidor; os links internos usam `next/link`, que é o
   certo aqui — trocá-los por `<a>` foi uma das tentativas, não mudou o casco,
   e só custaria a navegação instantânea de volta ao catálogo.
--------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: "Página não encontrada",
  /* Endereço morto não entra em índice. `follow` continua ligado para o robô
     seguir os links daqui e reencontrar o catálogo. */
  robots: { index: false, follow: true },
};

const MENSAGEM =
  "Oi! Vim pelo site da Serenou e cliquei num link que não está mais no ar. Vocês ainda têm essa peça?";

export default function NaoEncontrada() {
  return (
    <main
      id="conteudo"
      className="flex min-h-[100svh] items-center bg-linho px-5 py-[12svh] md:px-8"
    >
      <div className="mx-auto w-full max-w-[34rem]">
        <Link href="/" aria-label="Serenou, início" className="tap inline-block">
          <span className="marca-serenou" aria-hidden="true" />
        </Link>

        <p className="t-eyebrow mt-10 text-[0.6875rem] text-carvao-fraco">
          Página não encontrada
        </p>

        {/* Escala de capítulo, não de manchete: é uma notícia pequena, e
            tratá-la como evento faria a cliente achar que quebrou algo. */}
        <h1 className="t-display mt-5 text-[1.875rem] leading-[1.08] tracking-[0.01em] md:text-[2.375rem]">
          Não encontramos essa página.
        </h1>

        <p className="t-body mt-5 max-w-[42ch] text-[1rem] leading-[1.55] text-carvao-medio">
          Se você chegou por um link de peça, ela provavelmente esgotou e saiu
          do catálogo. O que temos hoje continua aqui — e, se você lembra qual
          era, a gente procura junto no WhatsApp.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-4">
          <Link
            href="/catalogo"
            className="t-eyebrow inline-flex h-[3.25rem] items-center justify-center rounded-[var(--r-acao)] bg-carvao px-7 text-[0.6875rem] text-linho-alto transition-colors duration-200 hover:bg-[#241f19] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-oliva"
          >
            Ver o catálogo
          </Link>

          <a
            href={linkWhatsApp(MENSAGEM)}
            target="_blank"
            rel="noreferrer"
            className="tap text-[0.875rem] text-carvao-medio underline decoration-carvao/25 underline-offset-4 transition-colors duration-200 hover:text-carvao hover:decoration-carvao/60"
          >
            Perguntar no WhatsApp
          </a>

          <Link
            href="/"
            className="tap text-[0.875rem] text-carvao-fraco underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-carvao-medio hover:decoration-carvao/40"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
