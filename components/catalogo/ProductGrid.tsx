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
    /* 2 colunas no telefone e no tablet, 3 no desktop médio, 4 no grande.
       Duas no telefone e não uma: a fotografia da Serenou é vertical e em
       coluna única cada peça vira uma tela inteira — a cliente rola muito e
       compara nada. O respiro vertical é o triplo do horizontal de
       propósito: é ele que separa uma fileira da outra sem precisar de
       borda, e é o que faz a grade parecer vitrine em vez de planilha. */
    <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-5 md:gap-y-14 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-16 xl:grid-cols-4">
      {produtos.map((p, i) => (
        <li key={p.slug}>
          <ProductCard produto={p} priority={i < prioritarias} />
        </li>
      ))}
    </ul>
  );
}
