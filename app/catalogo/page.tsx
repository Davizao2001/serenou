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

type Props = { searchParams: Promise<{ c?: string }> };

/** Filtros que o site aceita na URL. Qualquer outra coisa vira "tudo". */
const FILTROS = new Set<string>([
  "tudo",
  ...COLECOES.map((c) => c.slug),
  ...CATEGORIAS.map((c) => c.slug),
]);

/** Nome da seleção, para o título da aba. */
function nomeDe(filtro: string): string {
  if (filtro === "tudo") return "Catálogo";
  const colecao = COLECOES.find((c) => c.slug === filtro);
  if (colecao) return colecao.nome;
  return CATEGORIAS.find((c) => c.slug === filtro)?.nome ?? "Catálogo";
}

/* O título da aba acompanha o filtro. Quem abre Vestidos e Calças em duas
   abas precisa distinguir uma da outra pela aba, não pelo conteúdo.
   O sufixo "| Serenou Beach" vem do template em app/layout.tsx. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { c } = await searchParams;
  const filtro = c && FILTROS.has(c) ? c : "tudo";
  return {
    title: nomeDe(filtro),
    description:
      "As peças da Serenou: vestidos, macaquinhos, conjuntos, calças, blusas e moda praia.",
  };
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
      <main id="conteudo" className="bg-linho pb-[14svh] pt-[calc(var(--header-h)+6svh)]">
        {/* 90rem, um pouco mais largo que a página de produto: lá existe uma
            peça, aqui existem quatro por fileira e a grade precisa de ar. */}
        <div className="mx-auto max-w-[90rem] px-5 md:px-8 lg:px-12">
          {/* Abertura curta de propósito.
              Antes era uma headline de capítulo — "TODAS AS PEÇAS." em corpo
              de manchete — e ela empurrava a primeira fileira de fotos para
              fora da tela. Na home a tipografia grande é o conteúdo; aqui o
              conteúdo é a roupa, e o cabeçalho só precisa dizer onde a
              pessoa está antes de sair da frente. */}
          <header className="mb-8 md:mb-10">
            <h1 className="t-display text-[1.375rem] tracking-[0.02em] md:text-[1.625rem]">
              Catálogo
            </h1>
            <p className="t-body mt-2 max-w-[38ch] text-[0.9375rem] text-carvao-medio">
              Peças para acompanhar todos os seus momentos.
            </p>
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
