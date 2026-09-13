"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { linkWhatsApp } from "@/lib/loja";

/**
 * GUIA DE MEDIDAS
 *
 * A ENTRADA EXISTE; A TABELA, NÃO
 *
 * A Serenou ainda não passou medida nenhuma. Escrever "Busto 88cm" para a
 * página parecer completa seria a pior coisa que este site pode fazer: a
 * cliente compra pela medida, a peça chega errada, e o erro volta para a
 * Grazi como devolução — não como bug.
 *
 * Então a entrada fica, porque a dúvida de tamanho é real e precisa de um
 * destino, e o destino é o WhatsApp, que é onde a Grazi de fato responde
 * isso hoje. Quando as medidas existirem, elas entram AQUI e o resto da
 * página não muda.
 *
 * `nome` e `cor` viajam para a mensagem: quem clica em "Guia de medidas"
 * está olhando uma peça específica, e a Grazi não deveria ter que perguntar
 * qual.
 */
export function GuiaMedidas({ nome, cor }: { nome: string; cor?: string | null }) {
  const [aberto, setAberto] = useState(false);

  const mensagem = [
    `Oi! Vim pelo site da Serenou e queria ajuda com o tamanho do ${nome}.`,
    cor ? `Cor: ${cor}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="tap inline-flex items-center gap-2 py-1 text-[0.8125rem] text-carvao-medio underline decoration-carvao/25 underline-offset-4 transition-colors duration-200 hover:text-carvao hover:decoration-carvao/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva focus-visible:ring-offset-2 focus-visible:ring-offset-linho"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-[0.9375rem] w-[0.9375rem] shrink-0 fill-none stroke-current"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8.5h18v7H3z" />
          <path d="M7 8.5v3M11 8.5v4M15 8.5v3M19 8.5v4" />
        </svg>
        Guia de medidas
      </button>

      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Guia de medidas"
        className="modal-folha"
      >
        <div className="p-7 md:p-9">
          <h2 className="t-eyebrow text-carvao-fraco">Guia de medidas</h2>

          <p className="t-body mt-5 max-w-[42ch] text-[0.9375rem]">
            A tabela de medidas da Serenou está em atualização. Para ajuda com
            o tamanho desta peça, fale com a gente pelo WhatsApp — a Grazi
            confere a peça e te diz qual serve.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={linkWhatsApp(mensagem)}
              target="_blank"
              rel="noreferrer"
              className="t-eyebrow inline-block bg-carvao px-7 py-4 text-[0.6875rem] text-linho-alto transition-colors duration-200 hover:bg-[#241f19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva focus-visible:ring-offset-2"
            >
              Perguntar no WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="tap text-[0.8125rem] text-carvao-medio underline underline-offset-4 transition-colors duration-200 hover:text-carvao"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
