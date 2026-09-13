import { ProductCard } from "./ProductCard";
import type { Produto } from "@/lib/catalogo";

type Props = {
  produtos: Produto[];
  /** Quantas peças da primeira fila carregam sem esperar o scroll. */
  prioritarias?: number;
  /** Catálogo grande o bastante para uma quarta coluna. Ver `GRADE_DENSA`. */
  denso?: boolean;
};

/**
 * PRODUCT GRID
 *
 * A GRADE ACOMPANHA O TAMANHO DO ACERVO
 *
 * Quatro colunas com cinco peças dão uma fileira cheia e uma peça sozinha
 * embaixo — e peça sozinha numa fileira de quatro lê como falta, não como
 * acervo enxuto. Com três colunas as mesmas cinco ocupam 3 + 2, que é um
 * bloco, e cada fotografia ganha quase 60px de largura.
 *
 * A regra olha o tamanho do CATÁLOGO, não o do filtro. Se olhasse o filtro, a
 * página mudaria de largura a cada categoria clicada — e a cliente veria o
 * cabeçalho pulando enquanto navega. Quem decide o número mora em
 * `GRADE_DENSA`, em lib/catalogo.ts.
 *
 * Duas colunas no telefone, sempre. Três numa tela de 390px deixaria o corpo
 * da roupa com menos de 120px, e aí não dá para ver o que se está olhando.
 *
 * O respiro vertical é mais que o dobro do horizontal: é ele que separa uma
 * fileira da outra sem precisar de borda, e é o que faz a grade ler como
 * vitrine em vez de planilha.
 */
export function ProductGrid({ produtos, prioritarias = 2, denso = false }: Props) {
  if (produtos.length === 0) {
    return <p className="t-body py-16 text-center">Nenhuma peça nesta seleção.</p>;
  }

  return (
    <ul
      className={`grid grid-cols-2 gap-x-4 gap-y-11 sm:gap-x-5 md:gap-y-14 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-[3.75rem] ${
        denso ? "xl:grid-cols-4" : ""
      }`}
    >
      {produtos.map((p, i) => (
        <li key={p.slug}>
          <ProductCard produto={p} priority={i < prioritarias} />
        </li>
      ))}
    </ul>
  );
}
