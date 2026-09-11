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
 */
export function PainelProduto({ produto }: { produto: Produto }) {
  const esgotado = produto.status === "indisponivel";
  const temCores = produto.cores.length > 0;
  const temTamanhos = produto.tamanhos.length > 0;

  const [cor, setCor] = useState<string | null>(
    produto.cores.length === 1 ? produto.cores[0].nome : null
  );
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
      {selo && (
        <p className="t-eyebrow mb-5 text-carvao-fraco">{selo}</p>
      )}

      <h1 className="t-display text-[1.75rem] tracking-[0.01em] md:text-[2.25rem]">
        {produto.nome}
      </h1>

      <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-[1.125rem]">{formatarPreco(produto.preco)}</span>
        {produto.precoAnterior && (
          <span className="text-sm text-carvao-fraco line-through">
            {formatarPreco(produto.precoAnterior)}
          </span>
        )}
      </p>

      <p className="t-body mt-6 max-w-[42ch]">{produto.resumo}</p>

      {(temCores || temTamanhos) && (
        <div className="mt-10 space-y-10">
          {temCores && <SeletorCor cores={produto.cores} valor={cor} aoEscolher={setCor} />}
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
      <div className="mt-10">
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
            <p className="t-body mt-4 text-center text-sm">
              {faltando.length > 0
                ? `Escolha ${faltando.join(" e ")} para continuar.`
                : "A conversa segue no WhatsApp."}
            </p>
          </>
        )}
      </div>

      {produto.detalhes.length > 0 && (
        <div className="mt-12 border-t border-areia-forte pt-8">
          <h2 className="t-eyebrow mb-5 text-carvao-fraco">Detalhes</h2>
          <ul className="space-y-2">
            {produto.detalhes.map((d) => (
              <li key={d} className="t-body max-w-[42ch] text-sm">
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
