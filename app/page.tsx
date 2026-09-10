import { SerenouIntro } from "@/components/intro/SerenouIntro";
import { Header } from "@/components/site/Header";
import { Opening } from "@/components/site/Opening";
import { ChapterLeve } from "@/components/site/ChapterLeve";
import { ChapterVersatil } from "@/components/site/ChapterVersatil";
import { TeaserMarcante } from "@/components/site/TeaserMarcante";
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
        <TeaserMarcante />
      </main>
      <Fecho />
    </>
  );
}
