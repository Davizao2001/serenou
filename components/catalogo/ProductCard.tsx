"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductImage } from "./ProductImage";
import { ordenarPorCor, mesmaCor } from "@/lib/media";
import { formatarPreco, rotuloStatus, type Produto } from "@/lib/catalogo";

type Props = {
  produto: Produto;
  /** Primeira fila da vitrine. */
  priority?: boolean;
};

/**
 * PRODUCT CARD
 *
 * A vitrine é para olhar, não para decidir: fotografia grande, nome, preço, e
 * nada mais. Quem decide comprar decide na página de produto.
 *
 * Três gestos de movimento, e cada um responde a uma pergunta real de quem
 * está passando o olho:
 *
 *   "é essa mesmo?"        a segunda foto entra no hover, sem clique
 *   "tem na minha cor?"    a bolinha troca a fotografia para aquela cor
 *   "ainda tem?"           o selo de esgotado fica sobre a foto
 *
 * A troca por cor só acontece quando a loja marcou de que cor é cada foto no
 * painel. Sem marcação, as bolinhas continuam ali como informação — é o que
 * já eram — e não fingem uma interação que não existe.
 *
 * SOBRE O LINK
 * O cartão inteiro é clicável por uma camada sobre a fotografia, e o nome é
 * um link de verdade. Assim as bolinhas podem ser botões sem ficarem presas
 * dentro de um link — botão dentro de link é HTML inválido e, na prática,
 * impossível de usar no teclado.
 */
export function ProductCard({ produto, priority = false }: Props) {
  const esgotado = produto.status === "indisponivel";
  const selo = rotuloStatus(produto);

  const [cor, setCor] = useState<string | null>(null);
  const [sobre, setSobre] = useState(false);

  /* Só vale oferecer troca por cor se existir foto marcada com cor. */
  const temFotoPorCor = produto.imagens.some((i) => i.cor);
  const fotos = ordenarPorCor(produto.imagens, cor);
  const capa = fotos[0];
  /* A segunda foto do conjunto atual — a que entra no hover. */
  const verso = fotos[1];

  return (
    <article className="group relative">
      <div className="relative overflow-hidden bg-areia">
        <ProductImage slot={capa} priority={priority} esmaecida={esgotado} />

        {/* A segunda fotografia, por cima, revelada no hover. Fica montada
            desde o início para não piscar em branco na primeira passada, e
            sai do caminho de quem prefere menos movimento. */}
        {verso && (
          <div
            aria-hidden="true"
            className={`absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
              sobre ? "opacity-100" : "opacity-0"
            }`}
          >
            <ProductImage slot={verso} esmaecida={esgotado} />
          </div>
        )}

        {selo && (
          <span
            className={`t-eyebrow absolute left-2.5 top-2.5 z-20 px-2.5 py-1.5 text-[0.625rem] md:left-3 md:top-3 ${
              esgotado ? "bg-carvao/85 text-linho-alto" : "bg-linho-alto/95 text-carvao"
            }`}
          >
            {selo}
          </span>
        )}

        {/* A camada de clique. `aria-hidden` + `tabIndex -1` porque o nome
            abaixo já é o link que o leitor de tela e o teclado usam. */}
        <Link
          href={`/produto/${produto.slug}`}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 z-10"
          onMouseEnter={() => setSobre(true)}
          onMouseLeave={() => setSobre(false)}
          onFocus={() => setSobre(true)}
          onBlur={() => setSobre(false)}
        />
      </div>

      <div className="mt-3">
        <h3 className="t-display text-[0.9375rem] leading-snug tracking-[0.01em] md:text-[1.0625rem]">
          <Link
            href={`/produto/${produto.slug}`}
            className="transition-colors duration-200 hover:text-carvao-medio focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
          >
            {produto.nome}
          </Link>
        </h3>

        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[0.875rem]">
          <span className={esgotado ? "text-carvao-fraco" : "text-carvao"}>
            {formatarPreco(produto.preco)}
          </span>
          {produto.precoAnterior && (
            <span className="text-[0.8125rem] text-carvao-fraco line-through">
              {formatarPreco(produto.precoAnterior)}
            </span>
          )}
        </p>

        {produto.cores.length > 1 && (
          <ul className="mt-2.5 flex flex-wrap items-center gap-1.5" aria-label="Cores">
            {produto.cores.map((c) => {
              const ativa = mesmaCor(cor, c.nome);
              const clicavel = temFotoPorCor && produto.imagens.some((i) => mesmaCor(i.cor, c.nome));
              const bolinha = (
                <span
                  aria-hidden="true"
                  className="block h-3.5 w-3.5 rounded-full ring-1 ring-carvao/20"
                  style={{
                    background: Array.isArray(c.amostra)
                      ? `linear-gradient(135deg, ${c.amostra[0]} 50%, ${c.amostra[1]} 50%)`
                      : c.amostra,
                  }}
                />
              );
              return (
                <li key={c.nome}>
                  {clicavel ? (
                    <button
                      type="button"
                      onClick={() => setCor(ativa ? null : c.nome)}
                      aria-pressed={ativa}
                      title={c.nome}
                      className={`tap flex items-center justify-center rounded-full p-1 transition-[box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva ${
                        ativa ? "ring-1 ring-carvao" : "hover:ring-1 hover:ring-carvao/40"
                      }`}
                    >
                      {bolinha}
                      <span className="sr-only">Ver na cor {c.nome}</span>
                    </button>
                  ) : (
                    <span className="flex items-center justify-center p-1" title={c.nome}>
                      {bolinha}
                      <span className="sr-only">{c.nome}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}
