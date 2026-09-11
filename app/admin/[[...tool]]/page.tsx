import type { Metadata, Viewport } from "next";
import { Painel } from "./Painel";

/* ---------------------------------------------------------------------------
   /admin — o painel da Grazi

   O Studio inteiro roda aqui dentro, como uma rota do próprio site. Quem
   protege não é esta página: é o Sanity. O painel carrega para qualquer um
   que abra o endereço, mas sem login ele mostra apenas a tela de entrada, e
   nenhuma leitura ou escrita de conteúdo acontece sem uma sessão válida.

   Esconder a URL não seria segurança; a autorização mora no servidor do
   Sanity, que só aceita operações de quem está no projeto.
--------------------------------------------------------------------------- */

/** O painel não entra em busca e não vira link compartilhado. */
export const metadata: Metadata = {
  /* `absolute` para o painel não herdar o sufixo "| Serenou Beach" do site. */
  title: { absolute: "Painel da Serenou" },
  robots: { index: false, follow: false },
};

/* O Studio ocupa a tela inteira e tem campos de texto: `viewport-fit=cover`
   para o entalhe do telefone e `interactive-widget` para o teclado empurrar o
   conteúdo em vez de cobrir o campo que está sendo preenchido. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function PaginaPainel() {
  return <Painel />;
}
