"use client";

import { useState } from "react";
import { SeletorCor } from "./SeletorCor";
import { SeletorTamanho } from "./SeletorTamanho";
import { BotaoQuero } from "./BotaoQuero";
import { formatarPreco, rotuloStatus, type Produto } from "@/lib/catalogo";

/**
 * PAINEL DE DECISÃO
 *
 * Guarda a escolha de cor e tamanho e repassa para o CTA, que monta a
 * mensagem. Nada é obrigatório: se essa exigência vai existir é decisão da
 * call, e o lugar de aplicá-la é aqui — uma condição no `disabled` do botão.
 *
 * A cor já entra escolhida quando só existe uma; obrigar um clique num
 * conjunto de um item é atrito sem informação.
 */
export function PainelProduto({ produto }: { produto: Produto }) {
  const esgotado = produto.status === "indisponivel";
  const [cor, setCor] = useState<string | null>(
    produto.cores.length === 1 ? produto.cores[0].nome : null
  );
  const [tamanho, setTamanho] = useState<string | null>(null);
  const selo = rotuloStatus(produto);

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

      <div className="mt-10 space-y-10">
        <SeletorCor cores={produto.cores} valor={cor} aoEscolher={setCor} />
        <SeletorTamanho tamanhos={produto.tamanhos} valor={tamanho} aoEscolher={setTamanho} />
      </div>

      <div className="mt-10">
        <BotaoQuero
          nome={produto.nome}
          cor={cor}
          tamanho={tamanho}
          esgotado={esgotado}
        />
        <p className="t-body mt-4 text-center text-sm">
          A conversa continua no WhatsApp da loja.
        </p>
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
