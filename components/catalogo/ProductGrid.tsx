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
    /* Cartão menor, mais peça por tela.
       Era 2 colunas até 1024px e 3 daí pra cima — num monitor largo cada
       fotografia passava de 560px, tamanho de página de produto, e a vitrine
       virava uma peça por vez. Agora vai a 4 colunas, e o respiro vertical
       encolhe junto: espaço de galeria, não de ensaio.
       No telefone continuam 2. Três numa tela de 390px deixaria o corpo da
       roupa com menos de 120px, e aí não dá para ver o que se está olhando. */
    <ul className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-4 md:grid-cols-3 md:gap-x-5 md:gap-y-12 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-14">
      {produtos.map((p, i) => (
        <li key={p.slug}>
          <ProductCard produto={p} priority={i < prioritarias} />
        </li>
      ))}
    </ul>
  );
}
