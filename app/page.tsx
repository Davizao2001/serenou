/* A ordem das seções é a narrativa que a cliente confirmou:
   hero, manifesto, 01 LEVE, 02 VERSÁTIL com as vitrines, A SERENOU,
   loja física e rodapé.

   O teaser "03 / Marcante" saiu daqui a pedido dela. O componente continua
   em components/site/TeaserMarcante.tsx, intacto: para trazer de volta basta
   reimportar e recolocar dentro de <main>, depois de <ChapterVersatil />, e
   tirar a faixa de degradê do topo de ASerenou (era o teaser que levava o
   fundo do bege para o carvão). */
import { SerenouIntro } from "@/components/intro/SerenouIntro";
import { Header } from "@/components/site/Header";
import { Opening } from "@/components/site/Opening";
import { ChapterLeve } from "@/components/site/ChapterLeve";
import { ChapterVersatil } from "@/components/site/ChapterVersatil";
import { ASerenou } from "@/components/site/ASerenou";
import { LojaFisica } from "@/components/site/LojaFisica";
import { Fecho } from "@/components/site/Fecho";

export default function Home() {
  return (
    <>
      <SerenouIntro />
      <Header />
      <main id="conteudo">
        <Opening />
        <ChapterLeve />
        <ChapterVersatil />
      </main>
      <ASerenou />
      <LojaFisica />
      <Fecho />
    </>
  );
}
