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
  /* A foto escolhida à mão, guardada pelo ID. `null` = ninguém escolheu foto
     nenhuma, e quem manda é a cor. */
  const [fotoId, setFotoId] = useState<string | null>(null);

  /* A GALERIA NÃO SE REORDENA MAIS — E É POR ISSO QUE A DISSOLVÊNCIA EXISTE
     `ordenarPorCor` continua, mas só para responder UMA pergunta: qual foto
     passa a ser a ativa quando a cliente escolhe uma cor. A lista exibida é
     sempre a ordem que a loja cadastrou.

     Reordenar custava caro de dois jeitos. O React movia os nós no DOM, e
     mover um nó cancela a transição de opacidade em curso: a foto que saía
     pulava de 1 para 0 num quadro só, aparecia o fundo de areia por 40ms e a
     nova entrava por cima. Medido, não suposto. E as miniaturas dançavam de
     posição a cada cor escolhida, o que faz a pessoa procurar de novo a foto
     que ela estava olhando. */
  const fotos = produto.imagens;

  /* A loja marcou alguma foto com esta cor? Se não marcou nenhuma, a galeria
     não tem como responder à escolha, e a página precisa dizer isso — senão a
     pessoa lê "Cor: Amarelo" olhando para a peça azul e conclui, com razão,
     que o site está errado. */
  const alguemMarcaCor = produto.imagens.some((i) => i.cor);
  const semFotoDaCor =
    !!cor && alguemMarcaCor && !produto.imagens.some((i) => mesmaCor(i.cor, cor));

  /* Sem escolha explícita de foto, a ativa é a primeira da cor escolhida —
     que é justamente o que `ordenarPorCor` põe na frente. Sem cor, ou sem
     foto daquela cor, cai na primeira do cadastro. */
  const daCor = ordenarPorCor(fotos, cor)[0];
  const alvo = fotoId ?? daCor?.id ?? null;
  const ativa = Math.max(0, fotos.findIndex((f) => f.id === alvo));

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
    /* AS DUAS COLUNAS SOMAM A LARGURA INTEIRA — ESSE É O PONTO
       Antes a segunda coluna era `1fr` com o painel limitado a 30rem dentro
       dela: em 1440px sobravam 96px de vazio à direita do painel, e a página
       lia como "FOTO  vazio  INFORMAÇÕES". Agora a coluna É a largura do
       painel (25rem), e o que sobra vai todo para a fotografia. Não há vazio
       porque não há coluna sem dono.

       O painel também deixou de ser `sticky`. Com ele compacto, o CTA já cabe
       na primeira dobra — que era o motivo do sticky — e grudar o painel
       enquanto a fotografia rola desmancharia justamente a relação entre os
       dois que este layout existe para construir. */
    <div className="grid gap-8 md:gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14 xl:grid-cols-[1fr_25rem] xl:gap-24">
      <Galeria
        fotos={fotos}
        ativa={ativa}
        aoEscolher={escolherFoto}
        nome={produto.nome}
      />

      <PainelProduto
        produto={produto}
        cor={cor}
        aoEscolherCor={escolherCor}
        semFotoDaCor={semFotoDaCor}
      />
    </div>
  );
}
