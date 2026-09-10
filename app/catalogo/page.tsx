import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { ASerenou } from "@/components/site/ASerenou";
import { LojaFisica } from "@/components/site/LojaFisica";
import { Fecho } from "@/components/site/Fecho";
import { Vitrine } from "@/components/catalogo/Vitrine";
import { PRODUTOS_EXEMPLO } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Catálogo | Serenou",
  description: "As peças da Serenou: vestidos, conjuntos, calças, blusas e moda praia.",
};

/**
 * CATÁLOGO
 *
 * Fotografia, respiro, espaço branco. O oposto do peso editorial da home —
 * aqui a pessoa já entrou para ver peça, e o site sai da frente.
 *
 * Dados de desenvolvimento. Sem banco, sem CMS, sem admin.
 */
export default function Catalogo() {
  return (
    <>
      <Header />
      <main id="conteudo" className="bg-linho pb-[14svh] pt-[calc(var(--header-h)+8svh)]">
        <div className="mx-auto max-w-[112rem] px-5 md:px-8 lg:px-12">
          <header className="mb-12 md:mb-16">
            <p className="t-eyebrow mb-6 text-carvao-fraco">Catálogo</p>
            <h1 className="t-display t-chapter max-w-[16ch]">Todas as peças.</h1>
          </header>

          <Vitrine produtos={PRODUTOS_EXEMPLO} />
        </div>
      </main>
      <ASerenou />
      <LojaFisica />
      <Fecho />
    </>
  );
}
