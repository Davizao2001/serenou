"use client";

import { useState } from "react";
import { Galeria } from "./Galeria";
import { PainelProduto } from "./PainelProduto";
import { ordenarPorCor, mesmaCor } from "@/lib/media";
import type { Produto } from "@/lib/catalogo";

/**
 * A PEÇA EM FOCO
 *
 * As duas colunas da página de produto — galeria e decisão — vivem juntas
 * porque compartilham uma coisa: a cor escolhida.
 *
 * A CONVERSA ENTRE COR E FOTOGRAFIA ANDA NOS DOIS SENTIDOS
 *
 *   escolher a cor       →  a galeria pula para a primeira foto daquela cor
 *   escolher a foto      →  se a foto tem cor marcada, a cor acompanha
 *
 * O segundo caminho só existe quando a associação é inequívoca, isto é,
 * quando a própria loja marcou aquela fotografia com uma cor no painel.
 * Fotografia de costas, de detalhe ou de uma cor ainda não confirmada não
 * mexe na escolha de ninguém.
 *
 * A ORDEM NO TELEFONE
 *
 * No desktop são duas colunas. No telefone é uma só, e a ordem passa a ser a
 * de quem compra: fotografia, nome, preço, descrição, cor, tamanho, botão,
 * detalhes. Antes a galeria inteira caía por cima da coluna de decisão e a
 * cliente rolava quatro fotografias em tamanho cheio antes de ver o preço.
 * Foi a galeria com miniaturas que resolveu isso — não um segundo layout.
 */
export function PecaEmFoco({ produto }: { produto: Produto }) {
  const [cor, setCor] = useState<string | null>(
    produto.cores.length === 1 ? produto.cores[0].nome : null
  );
  /* A foto ativa é guardada pelo ID, não pela posição.
     Pela posição dava um bug bonito: clicar na miniatura 2 adotava a cor
     daquela foto, adotar a cor reordenava a galeria, e a posição 2 passava a
     apontar para outra fotografia — a tela trocava e voltava no mesmo quadro.
     O ID não se move quando a lista se reordena. */
  const [fotoId, setFotoId] = useState<string | null>(null);

  const fotos = ordenarPorCor(produto.imagens, cor);

  /* A loja marcou alguma foto com esta cor? Se não marcou nenhuma, a galeria
     não tem como responder à escolha, e a página precisa dizer isso — senão a
     pessoa lê "Cor: Amarelo" olhando para a peça azul e conclui, com razão,
     que o site está errado. */
  const alguemMarcaCor = produto.imagens.some((i) => i.cor);
  const semFotoDaCor =
    !!cor && alguemMarcaCor && !produto.imagens.some((i) => mesmaCor(i.cor, cor));

  /* Sem escolha explícita, a ativa é a primeira da ordem atual — que já é a
     foto da cor escolhida, porque `ordenarPorCor` a trouxe para a frente. */
  const ativa = Math.max(0, fotos.findIndex((f) => f.id === fotoId));

  function escolherCor(nova: string | null) {
    setCor(nova);
    /* Solta a escolha manual: a galeria volta a seguir a cor. */
    setFotoId(null);
  }

  function escolherFoto(indice: number) {
    const escolhida = fotos[indice];
    if (!escolhida) return;
    setFotoId(escolhida.id);
    if (escolhida.cor && !mesmaCor(escolhida.cor, cor)) setCor(escolhida.cor);
  }

  return (
    <div className="grid gap-8 md:gap-10 lg:grid-cols-[33rem_1fr] lg:gap-14 xl:gap-20">
      <Galeria
        fotos={fotos}
        ativa={ativa}
        aoEscolher={escolherFoto}
        nome={produto.nome}
      />

      {/* Teto de largura: sem ele o "QUERO ESSA PEÇA" estica por toda a coluna
          e vira botão de largura de banner para uma ação de uma linha. */}
      <div className="w-full max-w-[30rem] lg:sticky lg:top-[calc(var(--header-h)+4svh)] lg:self-start">
        <PainelProduto
          produto={produto}
          cor={cor}
          aoEscolherCor={escolherCor}
          semFotoDaCor={semFotoDaCor}
        />
      </div>
    </div>
  );
}
