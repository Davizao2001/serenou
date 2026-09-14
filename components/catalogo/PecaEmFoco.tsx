"use client";

import { useState } from "react";
import { Galeria } from "./Galeria";
import { PainelProduto } from "./PainelProduto";
import { FichaLateral } from "./FichaLateral";
import { CardEditorial } from "./CardEditorial";
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
    /* TRÊS COLUNAS, E NENHUMA SEM DONO
       GALERIA | DECISÃO | FICHA. As três larguras somam a linha inteira: a
       ficha tem 17,5rem, a decisão 21,25rem, e o que sobra é da fotografia.
       Colunas com `1fr` e um teto de largura por dentro foram o que criava,
       na versão anterior, 96px de vazio à direita do painel.

       Abaixo de `xl` a ficha desce para o fim do bloco e a página volta a
       duas colunas: 280px de acordeão espremido ao lado de uma foto de 340
       não é densidade, é aperto.

       QUEM CRESCE, CRESCE À CUSTA DE QUEM
       Num container fixo as três colunas dividem a mesma linha: subir a
       decisão e a ficha em 10% encolhe a fotografia na mesma conta. No
       primeiro teste foi exatamente o que aconteceu — a foto caiu 2,5%
       enquanto tudo em volta engordava, e a página ficou MENOS presente, não
       mais. Aqui a prioridade é a fotografia, que é a peça: ela leva o
       aumento, decisão e ficha crescem o suficiente para acompanhar a
       tipografia maior, e o resto da presença vem do tipo e do respiro. */
    <div className="grid gap-9 md:gap-11 lg:grid-cols-[1fr_22rem] lg:gap-12 xl:grid-cols-[1fr_21.5rem_17.625rem] xl:gap-9">
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

      {/* Fora de `xl` esta coluna atravessa as duas de cima.

          Em `xl` ela é uma coluna flex e o card editorial cresce para ocupar
          o que sobra até o pé da fotografia. A ficha da Bata de Poá tem duas
          seções e termina na metade da altura da foto — sem isso, o canto
          inferior direito da primeira dobra ficava vazio. Não é preenchimento
          com texto: é o mesmo card esticado, com a frase no alto e o
          grafismo embaixo. */}
      <div className="flex flex-col gap-7 lg:col-span-2 xl:col-span-1">
        <FichaLateral produto={produto} />
        {/* `max-h` junto do `flex-1`: o card estica para acompanhar a coluna,
            mas para antes de virar buraco. Sem o teto, com a coluna de decisão
            mais alta que a fotografia ele chegava a 491px no Conjunto Bless —
            a frase no alto, o grafismo no pé e 300px de nada no meio. Com 22rem
            a coluna da ficha termina perto do pé da foto, que é o alinhamento
            óptico que interessa: as três colunas não precisam terminar na mesma
            linha, precisam parecer a mesma composição. */}
        <CardEditorial className="xl:flex-1 xl:max-h-[22rem]" />
      </div>
    </div>
  );
}
