"use client";

import { useEffect, useRef } from "react";

/**
 * MODAL
 *
 * `<dialog>` nativo, e não uma div com `position: fixed`. A diferença não é
 * de estilo: o elemento nativo já traz ESC, já prende o foco dentro do
 * diálogo, já devolve o foco ao botão que abriu, já marca o resto da página
 * como inerte e já se anuncia como diálogo para o leitor de tela. Reproduzir
 * isso à mão são umas duzentas linhas que costumam ficar pela metade — e é
 * justamente por isso que tanta gente instala uma biblioteca inteira.
 *
 * Fica o que o nativo não dá:
 *
 *   clique fora   o `<dialog>` ocupa a tela inteira e o conteúdo mora dentro
 *                 dele; clique cujo alvo é o próprio diálogo é clique no
 *                 fundo, nunca no conteúdo.
 *   rolagem       o fundo continua rolável por trás do modal. Trava-se o
 *                 `<html>` enquanto ele estiver aberto.
 *
 * O `::backdrop` e a entrada estão em app/globals.css — pseudo-elemento não
 * se escreve com classe utilitária.
 */
export function Modal({
  aberto,
  aoFechar,
  titulo,
  className = "",
  children,
}: {
  aberto: boolean;
  aoFechar: () => void;
  /** Nome do diálogo para quem navega por leitor de tela. */
  titulo: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (aberto && !el.open) el.showModal();
    if (!aberto && el.open) el.close();

    /* A trava da rolagem acompanha o estado, e some na limpeza — senão um
       modal desmontado no meio de uma navegação deixaria a página presa. */
    const html = document.documentElement;
    if (aberto) html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      aria-label={titulo}
      /* `close` cobre as duas saídas nativas — ESC e `form method="dialog"` —
         e mantém o estado do React em dia com o estado do elemento. */
      onClose={aoFechar}
      onClick={(e) => {
        if (e.target === ref.current) aoFechar();
      }}
      className={`modal ${className}`}
    >
      {children}
    </dialog>
  );
}
