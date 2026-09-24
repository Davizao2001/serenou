/* A ordem das seções é a narrativa que a cliente confirmou:
   hero, manifesto, 01 LEVE, 02 VERSÁTIL com as vitrines, A SERENOU,
   loja física e rodapé.

   A VITRINE ENTROU DEPOIS DA ABERTURA

   A página tinha 8,3 telas e nenhum link dentro do conteúdo — medido no DOM
   do site no ar. A vitrine é a primeira porta, e fica logo depois do herói
   porque é ali que quem chegou ainda está decidindo se aquilo é uma loja.
   Ela não interrompe a narrativa: entra antes do capítulo 01, que continua
   abrindo o manifesto como sempre abriu.

   O teaser "03 / Marcante" saiu daqui a pedido dela. O componente continua
   em components/site/TeaserMarcante.tsx, intacto: para trazer de volta basta
   reimportar e recolocar dentro de <main>, depois de <ChapterVersatil />, e
   tirar a faixa de degradê do topo de ASerenou (era o teaser que levava o
   fundo do bege para o carvão). */
import { SerenouIntro } from "@/components/intro/SerenouIntro";
import { Cabecalho } from "@/components/site/Cabecalho";
import { Opening } from "@/components/site/Opening";
import { VitrineDaHome } from "@/components/site/VitrineDaHome";
import { ChapterLeve } from "@/components/site/ChapterLeve";
import { ChapterVersatil } from "@/components/site/ChapterVersatil";
import { ASerenou } from "@/components/site/ASerenou";
import { LojaFisica } from "@/components/site/LojaFisica";
import { Fecho } from "@/components/site/Fecho";
import { listarProdutos } from "@/sanity/lib/produtos";

/* O mesmo REVALIDAR do catálogo e das páginas de peça. O Next exige um
   literal: o valor é lido na compilação, antes de qualquer import rodar. */
export const revalidate = 60;

export default async function Home() {
  /* A home passa a ler o catálogo por causa da vitrine. `listarProdutos`
     devolve lista vazia quando a leitura falha — e vazia a vitrine não se
     desenha, então uma queda do Sanity tira a seção e deixa a página de pé,
     em vez de derrubar a home inteira. */
  const produtos = await listarProdutos();

  return (
    <>
      <SerenouIntro />
      <Cabecalho />
      <main id="conteudo">
        <Opening />
        <VitrineDaHome lista={produtos} />
        <ChapterLeve />
        <ChapterVersatil />
      </main>
      <ASerenou />
      <LojaFisica />
      <Fecho />
    </>
  );
}
