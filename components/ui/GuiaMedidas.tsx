"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import {
  GUIA_MEDIDAS,
  TABELA_TAMANHOS,
  linkWhatsApp,
  mensagemTamanho,
} from "@/lib/loja";

/**
 * GUIA DE MEDIDAS — UM COMPONENTE, DOIS LUGARES
 *
 * O menu abre este. A página de produto abre este. Não existe um segundo.
 *
 * Antes havia um modal provisório na página de produto dizendo que a tabela
 * estava em atualização. A Grazi mandou a tabela em 13/09; aquele texto foi
 * apagado, não desativado. Texto provisório esquecido no ar é o jeito mais
 * fácil de um site mentir sem ninguém perceber.
 *
 * O QUE A TABELA DIZ, E O QUE ELA NÃO DIZ
 *
 * A Grazi mandou equivalência de tamanho: P = 36/38, M = 38/40, e assim por
 * diante. Não mandou busto, cintura nem quadril. A tabela mostra as duas
 * colunas que existem e para aí — inventar centímetros seria inventar
 * justamente o número que decide se a peça serve.
 *
 * O CONTEXTO VIAJA
 *
 * Aberto de dentro de uma peça, o WhatsApp já sai com o nome dela. Aberto
 * pelo menu, sai a pergunta genérica. Ver `mensagemTamanho` em lib/loja.ts.
 *
 * O gatilho muda de roupa conforme o lugar (`aparencia`), mas o conteúdo, a
 * tabela e a mensagem são os mesmos nos dois.
 */
export function GuiaMedidas({
  nome,
  aparencia = "link",
  className = "",
  aoAbrir,
}: {
  /** Peça de onde o guia foi aberto. Ausente quando vem do menu. */
  nome?: string | null;
  /** `link` na página de produto, `menu` no cabeçalho, `menu-mobile` no menu
   *  do telefone, `cartao` na vitrine — miniatura do gatilho. */
  aparencia?: "link" | "menu" | "menu-mobile" | "cartao";
  className?: string;
  /** O menu do telefone precisa se fechar quando o guia abre. */
  aoAbrir?: () => void;
}) {
  const [aberto, setAberto] = useState(false);

  const estilos = {
    link: "tap inline-flex items-center gap-2 py-1 text-[0.8125rem] text-carvao-medio underline decoration-carvao/25 underline-offset-4 transition-colors duration-200 hover:text-carvao hover:decoration-carvao/60",
    menu: "t-eyebrow tap block py-2 tracking-[0.12em] opacity-80 transition-opacity duration-200 hover:opacity-100",
    "menu-mobile": "t-eyebrow tap block py-3 text-left tracking-[0.14em] text-carvao-medio transition-colors duration-200 hover:text-carvao",
    /* No cartão o gatilho é quase invisível até se procurar por ele: sem
       sublinhado em repouso, na cor dos metadados. É utilidade ao lado da
       peça, não um segundo caminho competindo com o nome. */
    cartao:
      "tap inline-flex items-center gap-1.5 text-[0.6875rem] text-carvao-fraco underline decoration-transparent underline-offset-[0.3em] transition-colors duration-200 hover:text-carvao-medio hover:decoration-carvao/40",
  } as const;

  function abrir() {
    setAberto(true);
    aoAbrir?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className={`${estilos[aparencia]} ${className}`}
      >
        {(aparencia === "link" || aparencia === "cartao") && (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`shrink-0 fill-none stroke-current ${
              aparencia === "cartao" ? "h-3.5 w-3.5" : "h-[0.9375rem] w-[0.9375rem]"
            }`}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8.5h18v7H3z" />
            <path d="M7 8.5v3M11 8.5v4M15 8.5v3M19 8.5v4" />
          </svg>
        )}
        {/* No cartão de 2 colunas do telefone "Guia de medidas" empurra a
            linha para duas; "Medidas" diz a mesma coisa ao lado da peça, onde
            o contexto já é a roupa. No desktop cabe inteiro. */}
        {aparencia === "cartao" ? (
          <>
            <span className="sm:hidden">Medidas</span>
            <span className="hidden sm:inline">{GUIA_MEDIDAS.titulo}</span>
          </>
        ) : (
          GUIA_MEDIDAS.titulo
        )}
      </button>

      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={GUIA_MEDIDAS.titulo}
        className="modal-folha"
      >
        <div className="max-h-[88svh] overflow-y-auto p-7 md:p-9">
          <h2 className="t-eyebrow text-carvao-fraco">{GUIA_MEDIDAS.titulo}</h2>

          {/* O texto da Grazi tem dois parágrafos. A quebra dupla vem do
              registro em lib/loja.ts, e não de dois campos separados — é uma
              fala só, e mexer nela é mexer no que a cliente escreveu. */}
          {GUIA_MEDIDAS.texto.split("\n\n").map((paragrafo) => (
            <p key={paragrafo} className="t-body mt-5 max-w-[46ch] text-[0.9375rem]">
              {paragrafo}
            </p>
          ))}

          {/* Tabela de verdade, com <th> de verdade: quem lê por leitor de
              tela ouve "P, referência 36/38" em vez de quatro números soltos. */}
          <table className="mt-7 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-areia-forte">
                <th scope="col" className="t-eyebrow py-3 text-[0.625rem] text-carvao-fraco">
                  Tamanho
                </th>
                <th scope="col" className="t-eyebrow py-3 text-[0.625rem] text-carvao-fraco">
                  Referência
                </th>
              </tr>
            </thead>
            <tbody>
              {TABELA_TAMANHOS.map((t) => (
                <tr key={t.tamanho} className="border-b border-areia-forte/50 last:border-b-0">
                  <th scope="row" className="py-3 pr-6 text-[0.9375rem] font-normal text-carvao">
                    {t.tamanho}
                  </th>
                  <td className="py-3 text-[0.9375rem] text-carvao-medio">{t.referencia}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 border-t border-areia-forte pt-6">
            <p className="t-eyebrow text-[0.625rem] text-carvao-fraco">
              {GUIA_MEDIDAS.chamada}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <a
                href={linkWhatsApp(mensagemTamanho(nome))}
                target="_blank"
                rel="noreferrer"
                className="t-eyebrow inline-block rounded-[var(--r-acao)] bg-carvao px-7 py-4 text-[0.6875rem] text-linho-alto transition-colors duration-200 hover:bg-[#241f19]"
              >
                {GUIA_MEDIDAS.cta}
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
        </div>
      </Modal>
    </>
  );
}
