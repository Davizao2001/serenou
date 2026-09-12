"use client";

import { useState } from "react";
import { ProductImage } from "./ProductImage";
import { PainelProduto } from "./PainelProduto";
import { ordenarPorCor, mesmaCor } from "@/lib/media";
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

  /* A loja marcou alguma foto com esta cor? Se marcou nenhuma, a galeria não
     tem como responder à escolha, e a página precisa dizer isso — senão a
     pessoa lê "Cor: Amarelo" olhando para a peça azul e conclui, com razão,
     que o site está errado. */
  const alguemMarcaCor = produto.imagens.some((i) => i.cor);
  const semFotoDaCor =
    !!cor && alguemMarcaCor && !produto.imagens.some((i) => mesmaCor(i.cor, cor));

  return (
    <div className="grid gap-10 lg:grid-cols-[38rem_1fr] lg:gap-16 xl:gap-20">
      {/* A fotografia tem teto de largura, e a coluna vale exatamente esse
          teto — assim não sobra vão morto entre a foto e a decisão.
          `aspect-ratio` com `max-height` não resolveria: num item de flex a
          largura vem do esticamento e a altura sai dela, então limitar a
          altura não encolhe nada. 38rem dá uma foto de 608×811, que ainda
          cabe numa tela de notebook — antes ela passava de 1300px de altura
          e a pessoa rolava uma tela e meia por foto. */}
      <div className="mx-auto flex w-full max-w-[38rem] flex-col gap-4 md:gap-6">
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

      {/* A coluna da decisão também tem teto. Sem ele o "QUERO ESSA PEÇA"
          esticava por quase 700px numa tela larga — botão de largura de
          banner para uma ação de uma linha. */}
      <div className="w-full max-w-[30rem] lg:sticky lg:top-[calc(var(--header-h)+4svh)] lg:self-start">
        <PainelProduto
          produto={produto}
          cor={cor}
          aoEscolherCor={setCor}
          semFotoDaCor={semFotoDaCor}
        />
      </div>
    </div>
  );
}
