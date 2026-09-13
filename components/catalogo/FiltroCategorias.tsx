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
 * Uma fileira só, rolável no telefone. Sem acordeão, sem gaveta lateral, sem
 * painel de facetas: o acervo é pequeno e o que a cliente quer é ver as
 * peças, não configurar uma busca.
 *
 * A ORDEM TEM UM MOTIVO
 *
 * Primeiro Todas e as categorias — que é como a pessoa pensa quando sabe o
 * que procura ("quero um vestido"). Depois, separadas por um fio, as
 * coleções: Novidades e Promoções não são tipos de roupa, são recortes que
 * atravessam todos eles. Misturá-las na mesma sequência fazia parecer que
 * "Promoções" era uma categoria de peça ao lado de "Calças".
 *
 * O ativo é um fio embaixo da palavra, não uma pastilha preenchida. Pastilha
 * é peso de interface de sistema; aqui sete palavras em versalete já são uma
 * linha delicada, e sujá-la com sete caixas colocaria a navegação acima da
 * fotografia na ordem de atenção.
 */
export function FiltroCategorias({ ativo, aoTrocar, total }: Props) {
  const categorias = [
    { slug: "tudo", nome: "Todas" },
    ...CATEGORIAS.map((c) => ({ slug: c.slug, nome: c.nome })),
  ];
  const colecoes = COLECOES.map((c) => ({ slug: c.slug, nome: c.nome }));

  const botao = (item: { slug: string; nome: string }) => {
    const selecionado = item.slug === ativo;
    return (
      <li key={item.slug}>
        <button
          type="button"
          role="tab"
          aria-selected={selecionado}
          onClick={() => aoTrocar(item.slug)}
          className={`t-eyebrow tap whitespace-nowrap border-b py-2 text-[0.6875rem] transition-colors duration-200 focus-visible:outline-none focus-visible:text-carvao ${
            selecionado
              ? "border-carvao text-carvao"
              : "border-transparent text-carvao-fraco hover:text-carvao"
          }`}
        >
          {item.nome}
        </button>
      </li>
    );
  };

  return (
    <div>
      {/* A rolagem lateral é do trilho, nunca da página: as margens negativas
          fazem o trilho sangrar até a borda da tela, para não parecer que a
          lista acabou onde o padding acaba. */}
      <div className="-mx-5 overflow-x-auto px-5 md:-mx-8 md:px-8 lg:mx-0 lg:px-0">
        <ul
          role="tablist"
          aria-label="Categorias"
          className="flex w-max min-w-full items-center gap-6 pb-3 md:gap-8"
        >
          {categorias.map(botao)}

          <li aria-hidden="true" className="h-3 w-px shrink-0 bg-areia-forte" />

          {colecoes.map(botao)}
        </ul>
      </div>

      <p aria-live="polite" className="sr-only">
        {total} {total === 1 ? "peça" : "peças"} nesta seleção.
      </p>
    </div>
  );
}
