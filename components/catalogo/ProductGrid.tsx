import { ProductCard } from "./ProductCard";
import type { Produto } from "@/lib/catalogo";

type Props = {
  produtos: Produto[];
  /** Quantas peças da primeira fila carregam sem esperar o scroll. */
  prioritarias?: number;
};

/**
 * PRODUCT GRID
 *
 * Duas colunas no telefone, três a partir do desktop. Não quatro: com o
 * acervo de uma loja de bairro, quatro colunas deixam a fotografia pequena e
 * a última fila órfã. O respiro vertical é maior que o horizontal — é o que
 * faz a grade ler como vitrine e não como planilha.
 */
export function ProductGrid({ produtos, prioritarias = 2 }: Props) {
  if (produtos.length === 0) {
    return (
      <p className="t-body py-16 text-center">
        Nenhuma peça nesta seleção.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-20">
      {produtos.map((p, i) => (
        <li key={p.slug}>
          <ProductCard produto={p} priority={i < prioritarias} />
        </li>
      ))}
    </ul>
  );
}
