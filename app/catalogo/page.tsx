import type { Metadata } from "next";
import { Cabecalho } from "@/components/site/Cabecalho";
import { ASerenou } from "@/components/site/ASerenou";
import { LojaFisica } from "@/components/site/LojaFisica";
import { Fecho } from "@/components/site/Fecho";
import { Vitrine } from "@/components/catalogo/Vitrine";
import { listarProdutosComEstado, secoesDaLista } from "@/sanity/lib/produtos";
import { produtosVisiveis, filtrarPorSelecao, GRADE_DENSA } from "@/lib/catalogo";
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
  /* `falhou` separa "a loja ainda não cadastrou" de "não deu para ler agora".
     Os dois deixam a tela vazia e pedem textos diferentes — ver Vitrine. */
  const { produtos, falhou } = await listarProdutosComEstado();

  /* A seleção é filtrada AQUI, no servidor. É o que faz desktop e telefone
     mostrarem o mesmo conjunto: os dois leem `?c=`, e quem abre
     /catalogo?c=vestidos direto recebe a mesma lista de quem clicou. */
  const totalCatalogo = produtosVisiveis(produtos).length;
  const lista = filtrarPorSelecao(produtos, filtro);

  /* A largura da página segue a mesma regra da grade. Com três colunas o
     grid efetivo fica em 1184px: ocupar 1440 só porque a tela tem 1440
     espalharia cinco peças por uma página grande demais para elas. */
  const denso = totalCatalogo >= GRADE_DENSA;

  return (
    <>
      <Cabecalho />
      <main
        id="conteudo"
        /* O respiro entre o header e o bloco do título é mais curto no
           telefone: ali a tela inteira tem a altura de uma folha, e 6svh
           de vazio empurram a primeira fotografia para fora da primeira
           dobra. No desktop sobra altura, e o valor original fica. */
        className="bg-linho pb-[14svh] pt-[calc(var(--header-h)+4.25svh)] lg:pt-[calc(var(--header-h)+6svh)]"
      >
        <div
          className={`mx-auto px-5 md:px-8 lg:px-12 ${
            denso ? "max-w-[90rem]" : "max-w-[80rem]"
          }`}
        >
          {/* O título e a contagem moram na Vitrine, não aqui: a contagem
              precisa seguir o filtro, e o filtro é estado do cliente. Deixar
              o número no servidor faria a página dizer "5 peças" com uma
              peça na tela depois de filtrar por Vestidos. */}
          <Vitrine
            lista={lista}
            totalCatalogo={totalCatalogo}
            filtro={filtro}
            titulo={nomeDe(filtro)}
            /* Calculado da lista que já está aqui: o catálogo acabou de ler
               o catálogo inteiro, e uma consulta para contar o que está na
               memória seria trabalho por nada. */
            secoes={falhou ? undefined : secoesDaLista(produtos)}
            falhou={falhou}
          />
        </div>
      </main>
      <ASerenou />
      <LojaFisica />
      <Fecho />
    </>
  );
}
