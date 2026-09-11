import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { ASerenou } from "@/components/site/ASerenou";
import { LojaFisica } from "@/components/site/LojaFisica";
import { Fecho } from "@/components/site/Fecho";
import { Vitrine } from "@/components/catalogo/Vitrine";
import { listarProdutos } from "@/sanity/lib/produtos";
import { CATEGORIAS, COLECOES } from "@/lib/loja";

/* O Next exige um literal aqui: o valor da configuração de segmento é lido
   na compilação, antes de qualquer import rodar. 60 segundos é o mesmo
   REVALIDAR de sanity/env.ts — se mudar lá, mude aqui. */
export const revalidate = 60;

export const metadata: Metadata = {
  /* O sufixo "| Serenou Beach" vem do template em app/layout.tsx. */
  title: "Catálogo",
  description:
    "As peças da Serenou: vestidos, conjuntos, calças, blusas e moda praia.",
};

type Props = { searchParams: Promise<{ c?: string }> };

/** Filtros que o site aceita na URL. Qualquer outra coisa vira "tudo". */
const FILTROS = new Set<string>([
  "tudo",
  ...COLECOES.map((c) => c.slug),
  ...CATEGORIAS.map((c) => c.slug),
]);

/** Título da página por seleção — a pessoa que chega pelo menu vê onde está. */
function tituloDe(filtro: string): string {
  if (filtro === "tudo") return "Todas as peças.";
  const colecao = COLECOES.find((c) => c.slug === filtro);
  if (colecao) return `${colecao.nome}.`;
  const categoria = CATEGORIAS.find((c) => c.slug === filtro);
  return categoria ? `${categoria.nome}.` : "Todas as peças.";
}

/**
 * CATÁLOGO
 *
 * Fotografia, respiro, espaço branco. O oposto do peso editorial da home —
 * aqui a pessoa já entrou para ver peça, e o site sai da frente.
 *
 * As peças vêm do Sanity. A consulta já exclui as ocultas, então a lista que
 * chega aqui nunca contém uma peça que a Grazi tirou do ar.
 */
export default async function Catalogo({ searchParams }: Props) {
  const { c } = await searchParams;
  const filtro = c && FILTROS.has(c) ? c : "tudo";
  const produtos = await listarProdutos();

  return (
    <>
      <Header />
      <main id="conteudo" className="bg-linho pb-[14svh] pt-[calc(var(--header-h)+8svh)]">
        <div className="mx-auto max-w-[112rem] px-5 md:px-8 lg:px-12">
          <header className="mb-12 md:mb-16">
            <p className="t-eyebrow mb-6 text-carvao-fraco">Catálogo</p>
            <h1 className="t-display t-chapter max-w-[16ch]">{tituloDe(filtro)}</h1>
          </header>

          <Vitrine produtos={produtos} filtroInicial={filtro} />
        </div>
      </main>
      <ASerenou />
      <LojaFisica />
      <Fecho />
    </>
  );
}
