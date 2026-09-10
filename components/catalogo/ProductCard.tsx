import Link from "next/link";
import { ProductImage } from "./ProductImage";
import { formatarPreco, rotuloStatus, type Produto } from "@/lib/catalogo";

type Props = {
  produto: Produto;
  /** Primeira fila da vitrine. */
  priority?: boolean;
};

/**
 * PRODUCT CARD
 *
 * A peça inteira é um único link: uma área de toque grande, um só destino,
 * nenhum botão competindo dentro do cartão. Quem decide comprar decide na
 * página de produto — a vitrine é para olhar.
 *
 * A ficha é curta de propósito: fotografia, nome, preço. Categoria e resumo
 * ficam de fora; encher o cartão de metadados é o que faz um catálogo de
 * moda parecer um marketplace.
 */
export function ProductCard({ produto, priority = false }: Props) {
  const esgotado = produto.status === "indisponivel";
  const selo = rotuloStatus(produto);

  return (
    <article>
      <Link
        href={`/produto/${produto.slug}`}
        className="group block focus-visible:outline-none"
      >
        <div className="relative">
          <ProductImage
            slot={produto.imagens[0]}
            priority={priority}
            esmaecida={esgotado}
          />

          {selo && (
            <span
              className={`t-eyebrow absolute left-3 top-3 px-3 py-2 text-[0.6875rem] md:left-4 md:top-4 ${
                esgotado
                  ? "bg-carvao/85 text-linho-alto"
                  : "bg-linho-alto/95 text-carvao"
              }`}
            >
              {selo}
            </span>
          )}
        </div>

        <div className="mt-4 md:mt-5">
          <h3 className="t-display text-[1.0625rem] tracking-[0.01em] md:text-[1.25rem]">
            {produto.nome}
          </h3>

          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className={esgotado ? "text-carvao-fraco" : "text-carvao"}>
              {formatarPreco(produto.preco)}
            </span>
            {produto.precoAnterior && (
              <span className="text-sm text-carvao-fraco line-through">
                {formatarPreco(produto.precoAnterior)}
              </span>
            )}
          </p>

          {/* A cor é a informação que muda a decisão antes do clique. Só as
              amostras — o nome cabe na página de produto. */}
          {produto.cores.length > 1 && (
            <ul className="mt-3 flex items-center gap-2" aria-label="Cores disponíveis">
              {produto.cores.map((c) => (
                <li key={c.nome} title={c.nome}>
                  <span
                    aria-hidden="true"
                    className="block h-3 w-3 rounded-full ring-1 ring-carvao/20"
                    style={{
                      background: Array.isArray(c.amostra)
                        ? `linear-gradient(135deg, ${c.amostra[0]} 50%, ${c.amostra[1]} 50%)`
                        : c.amostra,
                    }}
                  />
                  <span className="sr-only">{c.nome}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </article>
  );
}
