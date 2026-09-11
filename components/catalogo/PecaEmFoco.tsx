"use client";

import { useState } from "react";
import { ProductImage } from "./ProductImage";
import { PainelProduto } from "./PainelProduto";
import { ordenarPorCor } from "@/lib/media";
import { SIZES_PRODUTO } from "@/sanity/lib/imagem";
import type { Produto } from "@/lib/catalogo";

/**
 * A PEÇA EM FOCO
 *
 * As duas colunas da página de produto — galeria e decisão — passam a ser um
 * componente só porque compartilham uma coisa: a cor escolhida.
 *
 * Antes a cor vivia dentro do painel de decisão, e a galeria não ficava
 * sabendo. A cliente clicava em "Marrom" e continuava olhando a foto preta.
 * Agora a escolha sobe um nível: o painel continua desenhando o seletor, e a
 * galeria reordena para mostrar aquela cor primeiro.
 *
 * Reordena, não filtra. A foto de costas, a de detalhe e a de uma cor que a
 * loja ainda não marcou continuam na página — só deixam de ser as primeiras.
 * Esconder fotografia de roupa para ser coerente com um filtro seria trocar
 * informação por arrumação.
 */
export function PecaEmFoco({ produto }: { produto: Produto }) {
  const [cor, setCor] = useState<string | null>(
    produto.cores.length === 1 ? produto.cores[0].nome : null
  );

  const fotos = ordenarPorCor(produto.imagens, cor);

  return (
    <div className="grid gap-10 lg:grid-cols-[58fr_42fr] lg:gap-20">
      <div className="flex flex-col gap-4 md:gap-6">
        {fotos.map((img, i) => (
          <ProductImage
            key={img.id}
            slot={img}
            proporcao="3/4"
            sizes={SIZES_PRODUTO}
            priority={i === 0}
          />
        ))}
      </div>

      <div className="lg:sticky lg:top-[calc(var(--header-h)+4svh)] lg:self-start">
        <PainelProduto produto={produto} cor={cor} aoEscolherCor={setCor} />
      </div>
    </div>
  );
}
