"use client";

import { CATEGORIAS, COLECOES } from "@/lib/loja";

export type FiltroAtivo = string;

type Props = {
  ativo: FiltroAtivo;
  aoTrocar: (slug: FiltroAtivo) => void;
  /** Quantas peças a seleção atual devolve. */
  total: number;
};

/**
 * FILTROS / CATEGORIAS
 *
 * Uma fileira só, rolável no telefone. Sem acordeões nem gaveta lateral: o
 * acervo é pequeno e o que a cliente quer é ver as peças, não configurar uma
 * busca.
 *
 * Coleções e categorias aparecem na mesma fileira porque, para quem navega,
 * "Promoções" e "Vestidos" são a mesma pergunta. A separação existe no dado —
 * uma peça em promoção continua sendo um vestido —, não na interface. Onde a
 * divisão final ficar é assunto da call.
 */
export function FiltroCategorias({ ativo, aoTrocar, total }: Props) {
  const itens = [
    { slug: "tudo", nome: "Tudo" },
    ...COLECOES.map((c) => ({ slug: c.slug, nome: c.nome })),
    ...CATEGORIAS.map((c) => ({ slug: c.slug, nome: c.nome })),
  ];

  return (
    <div className="border-b border-areia-forte">
      {/* A rolagem lateral é do trilho, nunca da página. */}
      <div className="-mx-5 overflow-x-auto px-5 md:-mx-8 md:px-8 lg:mx-0 lg:px-0">
        <ul
          role="tablist"
          aria-label="Categorias"
          className="flex w-max min-w-full items-center gap-7 pb-4 md:gap-9"
        >
          {itens.map((item) => {
            const selecionado = item.slug === ativo;
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selecionado}
                  onClick={() => aoTrocar(item.slug)}
                  className={`t-eyebrow tap whitespace-nowrap border-b-2 py-2 transition-colors duration-200 ${
                    selecionado
                      ? "border-carvao text-carvao"
                      : "border-transparent text-carvao-fraco hover:text-carvao"
                  }`}
                >
                  {item.nome}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p aria-live="polite" className="sr-only">
        {total} {total === 1 ? "peça" : "peças"} nesta seleção.
      </p>
    </div>
  );
}
