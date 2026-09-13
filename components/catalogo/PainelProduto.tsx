"use client";

import { useState } from "react";
import { SeletorCor } from "./SeletorCor";
import { SeletorTamanho } from "./SeletorTamanho";
import { BotaoQuero } from "./BotaoQuero";
import { BotaoFavorito } from "./BotaoFavorito";
import { GuiaMedidas } from "@/components/ui/GuiaMedidas";
import { Parcelamento } from "./Parcelamento";
import { Microinformacoes } from "./Microinformacoes";
import { formatarPreco, rotuloStatus, type Produto } from "@/lib/catalogo";
import { EXIGIR_ESCOLHA } from "@/lib/loja";

/**
 * COLUNA DE DECISÃO
 *
 * Nome, preço, descrição, cor, tamanho, botão, microinformações. A ordem é a
 * de quem compra, e o ritmo junta o que é uma informação só: nome, preço e
 * frase quase colados; o ar de verdade separa esse bloco da escolha, e a
 * escolha do botão.
 *
 * O SELO NÃO É INVENTADO
 *
 * A referência traz "Mais Vendido" em cima do nome. Não existe campo de mais
 * vendido no Sanity, e ninguém conta venda por aqui. O que existe é
 * `rotuloStatus`, que lê `status`, `promocao` e `novidade` — campos reais que
 * a Grazi marca no painel. Hoje nenhuma das cinco peças tem qualquer um
 * marcado, então o selo simplesmente não aparece; no dia em que ela marcar
 * "Novidade", aparece "Novo". Hardcodar "Mais Vendido" seria escrever um
 * número de vendas que ninguém mediu.
 *
 * A cor NÃO mora aqui: mora em `PecaEmFoco`, um nível acima, porque a galeria
 * também responde a ela. Escolher "Rosa" tem que trocar a fotografia, e a
 * fotografia é irmã desta coluna, não filha.
 */
export function PainelProduto({
  produto,
  cor,
  aoEscolherCor,
  semFotoDaCor = false,
}: {
  produto: Produto;
  cor: string | null;
  aoEscolherCor: (cor: string | null) => void;
  /** A cor escolhida não tem fotografia marcada. O aviso mora aqui, ao lado
   *  do seletor, e não no fim da galeria: é neste ponto da tela que a pessoa
   *  acabou de clicar e está esperando a foto mudar. */
  semFotoDaCor?: boolean;
}) {
  const esgotado = produto.status === "indisponivel";
  const temCores = produto.cores.length > 0;
  const temTamanhos = produto.tamanhos.length > 0;

  const [tamanho, setTamanho] = useState<string | null>(null);
  const selo = rotuloStatus(produto);

  /* Só falta o que a peça realmente oferece. */
  const faltando = EXIGIR_ESCOLHA
    ? [temCores && !cor ? "a cor" : null, temTamanhos && !tamanho ? "o tamanho" : null].filter(
        Boolean
      )
    : [];

  return (
    <div>
      {selo && <p className="t-eyebrow mb-3 text-carvao-fraco">{selo}</p>}

      {/* Escala de peça, não de manchete. O display da home existe para ser
          lido do outro lado da sala; aqui o nome está a 40cm dos olhos, ao
          lado da própria fotografia, e não precisa competir com ela. */}
      <h1 className="t-display text-[1.75rem] tracking-[0.01em] md:text-[1.875rem]">
        {produto.nome}
      </h1>

      <p className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[1.0625rem]">{formatarPreco(produto.preco)}</span>
        {produto.precoAnterior && (
          <span className="text-sm text-carvao-fraco line-through">
            {formatarPreco(produto.precoAnterior)}
          </span>
        )}
      </p>

      {/* Logo abaixo do preço e visivelmente menor que ele. A parcela é uma
          facilidade, não o valor da peça — quando ela compete em peso com o
          preço, a cliente guarda o número errado. */}
      <Parcelamento preco={produto.preco} variante="produto" className="mt-1" />

      <p className="t-body mt-4 max-w-[38ch] text-[0.9375rem]">{produto.resumo}</p>

      {(temCores || temTamanhos) && (
        <div className="mt-7 space-y-6">
          {temCores && (
            <div>
              <SeletorCor cores={produto.cores} valor={cor} aoEscolher={aoEscolherCor} />
              {semFotoDaCor && cor && (
                <p className="t-body mt-3 max-w-[38ch] text-[0.8125rem] text-carvao-medio">
                  Ainda não temos foto desta peça em {cor.toLowerCase()}. As
                  fotografias são de outra cor — a peça existe em{" "}
                  {cor.toLowerCase()} e você já pode pedir por ela.
                </p>
              )}
            </div>
          )}
          {temTamanhos && (
            <SeletorTamanho
              tamanhos={produto.tamanhos}
              valor={tamanho}
              aoEscolher={setTamanho}
            />
          )}
        </div>
      )}

      {/* O guia acompanha a decisão de tamanho, então mora logo abaixo dela —
          e existe mesmo quando a peça não tem tamanho cadastrado, porque a
          dúvida "será que serve em mim?" não depende de haver grade. */}
      <div className="mt-4">
        <GuiaMedidas nome={produto.nome} />
      </div>

      {/* Esgotado não vira outro botão. A cliente vê o estado e para por aí —
          um CTA de aviso de reposição prometeria uma função que não existe.
          A regra confirmada é outra: quando a peça acaba, a Grazi oculta pelo
          painel e ela sai do catálogo. */}
      <div className="mt-7">
        {esgotado ? (
          <div className="border border-carvao/20 px-8 py-5 text-center">
            <p className="t-eyebrow text-carvao-fraco">Peça esgotada</p>
          </div>
        ) : (
          <>
            <div className="flex items-stretch gap-2.5">
              <BotaoQuero
                nome={produto.nome}
                slug={produto.slug}
                preco={produto.preco}
                cor={cor}
                tamanho={tamanho}
                bloqueado={faltando.length > 0}
              />
              <BotaoFavorito slug={produto.slug} nome={produto.nome} />
            </div>

            {/* Duas frases com pesos diferentes de propósito. "Escolha a cor"
                é instrução: sem ela a pessoa não sai do lugar, e some assim
                que ela escolhe. "A conversa segue no WhatsApp" é só o aviso
                de para onde o botão leva — fica em nota de rodapé. */}
            {faltando.length > 0 ? (
              <p className="t-body mt-3 text-center text-sm text-carvao">
                Escolha {faltando.join(" e ")} para continuar.
              </p>
            ) : (
              <p className="mt-3 flex items-center justify-center gap-2 text-[0.75rem] text-carvao-fraco">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 fill-none stroke-current"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.5-4.6A7.5 7.5 0 1 1 20 11.5Z" />
                </svg>
                A conversa segue no WhatsApp.
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-8">
        <Microinformacoes />
      </div>
    </div>
  );
}
