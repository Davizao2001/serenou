"use client";

import { useMemo, useState } from "react";
import { FiltroCategorias } from "./FiltroCategorias";
import { ProductGrid } from "./ProductGrid";
import { produtosVisiveis, type Produto } from "@/lib/catalogo";

/**
 * VITRINE
 *
 * A parte da página que precisa de estado. O filtro é local e nada vai para a
 * URL ainda: a estrutura final de categorias e o tratamento de Promoções
 * dependem da call, e gravar uma rota agora é escolher por antecipação.
 */
export function Vitrine({ produtos }: { produtos: Produto[] }) {
  const [filtro, setFiltro] = useState("tudo");

  const lista = useMemo(() => {
    const visiveis = produtosVisiveis(produtos);
    if (filtro === "tudo") return visiveis;
    if (filtro === "novidades") return visiveis.filter((p) => p.novidade);
    if (filtro === "promocoes") return visiveis.filter((p) => p.promocao);
    return visiveis.filter((p) => p.categoria === filtro);
  }, [produtos, filtro]);

  return (
    <>
      <FiltroCategorias ativo={filtro} aoTrocar={setFiltro} total={lista.length} />
      <div className="mt-12 md:mt-16">
        <ProductGrid produtos={lista} />
      </div>
    </>
  );
}
