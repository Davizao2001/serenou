"use client";

import { useState } from "react";
import { SeletorCor } from "./SeletorCor";
import { SeletorTamanho } from "./SeletorTamanho";
import { BotaoQuero } from "./BotaoQuero";
import { formatarPreco, rotuloStatus, type Produto } from "@/lib/catalogo";
import { EXIGIR_ESCOLHA } from "@/lib/loja";

/**
 * PAINEL DE DECISÃO
 *
 * Guarda a escolha de cor e tamanho e repassa para o CTA, que monta a
 * mensagem.
 *
 * Seletor de peça sem opção não existe: uma peça sem cores cadastradas não
 * mostra a palavra "Cor", e uma sem tamanhos não mostra "Tamanho". A Grazi
 * cadastra o que a peça tem, e a página se ajusta.
 *
 * Exigir ou não a escolha antes do WhatsApp é decisão de negócio e mora em
 * `EXIGIR_ESCOLHA`, em `lib/loja.ts` — não espalhada aqui.
 *
 * A cor já entra escolhida quando só existe uma; obrigar um clique num
 * conjunto de um item é atrito sem informação.
 *
 * A cor NÃO mora aqui: ela mora em `PecaEmFoco`, um nível acima, porque a
 * galeria de fotos também responde a ela. Escolher "Marrom" tem que trocar a
 * fotografia, e a fotografia é irmã deste painel, não filha.
 *
 * O RITMO
 *
 * Nome, preço e frase formam um bloco só, com pouco ar entre eles — é uma
 * informação, não três. O ar de verdade vem depois, separando esse bloco da
 * escolha, e a escolha do botão. Antes cada item tinha a mesma distância do
 * seguinte e o painel se esticava pela altura da fotografia; o preço acabava
 * longe do nome e a página lia como formulário.
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
      {selo && <p className="t-eyebrow mb-4 text-carvao-fraco">{selo}</p>}

      {/* Escala de peça, não de manchete. O display da home existe para ser
          lido do outro lado da sala; aqui o nome fica a 40cm dos olhos, ao
          lado da própria fotografia, e não precisa competir com ela. */}
      <h1 className="t-display text-[1.75rem] tracking-[0.01em] md:text-[2rem]">
        {produto.nome}
      </h1>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[1.0625rem]">{formatarPreco(produto.preco)}</span>
        {produto.precoAnterior && (
          <span className="text-sm text-carvao-fraco line-through">
            {formatarPreco(produto.precoAnterior)}
          </span>
        )}
      </p>

      <p className="t-body mt-5 max-w-[38ch] text-[0.9375rem]">{produto.resumo}</p>

      {(temCores || temTamanhos) && (
        <div className="mt-9 space-y-8">
          {temCores && (
            <div>
              <SeletorCor cores={produto.cores} valor={cor} aoEscolher={aoEscolherCor} />
              {semFotoDaCor && cor && (
                <p className="t-body mt-4 max-w-[38ch] text-sm text-carvao-medio">
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

      {/* Esgotado não vira outro botão. A cliente vê o estado e para por aí —
          um CTA de aviso de reposição prometeria uma função que não existe.
          A regra confirmada é outra: quando a peça acaba, a Grazi oculta pelo
          painel e ela sai do catálogo. */}
      <div className="mt-9">
        {esgotado ? (
          <div className="border border-carvao/20 px-8 py-5 text-center">
            <p className="t-eyebrow text-carvao-fraco">Peça esgotada</p>
          </div>
        ) : (
          <>
            <BotaoQuero
              nome={produto.nome}
              slug={produto.slug}
              preco={produto.preco}
              cor={cor}
              tamanho={tamanho}
              bloqueado={faltando.length > 0}
            />
            {/* Duas frases com pesos diferentes de propósito. "Escolha a cor"
                é instrução: sem ela a pessoa não sai do lugar, e some assim
                que ela escolhe. "A conversa segue no WhatsApp" é só o aviso
                de para onde o botão leva — fica em nota de rodapé, no tamanho
                de nota de rodapé. */}
            {faltando.length > 0 ? (
              <p className="t-body mt-4 text-center text-sm text-carvao">
                Escolha {faltando.join(" e ")} para continuar.
              </p>
            ) : (
              <p className="mt-3 text-center text-[0.75rem] text-carvao-fraco">
                A conversa segue no WhatsApp.
              </p>
            )}
          </>
        )}
      </div>

      {/* Detalhes fechados por padrão. São duas linhas de ficha técnica: quem
          quer, abre; quem não quer, não paga por elas em altura de página.
          `<details>` nativo — abre sem JavaScript, é focável pelo teclado e já
          anuncia o estado sozinho. Não há um segundo accordion porque não há
          um segundo conteúdo: inventar "Trocas" ou "Entrega" seria escrever
          promessa que a loja não fez. */}
      {produto.detalhes.length > 0 && (
        <details className="detalhe group mt-9 border-t border-areia-forte">
          <summary className="t-eyebrow flex cursor-pointer items-center justify-between py-5 text-carvao-fraco transition-colors duration-200 hover:text-carvao focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva focus-visible:ring-offset-2 focus-visible:ring-offset-linho">
            Detalhes
            {/* O mesmo traço vira + e ×: 45° de rotação em vez de dois ícones */}
            <span
              aria-hidden="true"
              className="relative block h-3 w-3 transition-transform duration-300 ease-out group-open:rotate-45"
            >
              <span className="absolute left-0 top-1/2 block h-px w-3 -translate-y-1/2 bg-current" />
              <span className="absolute left-1/2 top-0 block h-3 w-px -translate-x-1/2 bg-current" />
            </span>
          </summary>
          <ul className="space-y-2 pb-6">
            {produto.detalhes.map((d) => (
              <li key={d} className="t-body max-w-[38ch] text-sm">
                {d}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
