"use client";

import { useEffect } from "react";
import Link from "next/link";
import { linkWhatsApp } from "@/lib/loja";

/* ---------------------------------------------------------------------------
   ALGO FALHOU

   O caminho realista até aqui é um só: o Sanity ficou fora do ar bem na hora
   em que o cache de uma página venceu. Antes, esse minuto de instabilidade
   virava `notFound()` — 404 guardado para uma peça que existe, no link que
   já circulou no WhatsApp. Agora `buscarProduto` lança, e a falha chega
   nesta tela, que diz a verdade: não foi possível carregar AGORA.

   Não tem cabeçalho nem rodapé de propósito. Se o que quebrou foi o servidor,
   pedir para ele montar mais duas seções é a melhor forma de quebrar de novo.
   A marca aparece em texto, e os dois caminhos que não dependem de nada são
   tentar outra vez e falar com a loja.

   `reset()` é do próprio Next: refaz o render do trecho que falhou, sem
   recarregar a página inteira. Numa instabilidade de um minuto, costuma
   bastar.
--------------------------------------------------------------------------- */

const MENSAGEM =
  "Oi! Vim pelo site da Serenou e ele não carregou. Podem me ajudar?";

export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /* Vai para os Runtime Logs da Vercel com o `digest`, que é o que amarra
       esta tela à exceção registrada no servidor. */
    console.error("[site] render interrompido:", error);
  }, [error]);

  return (
    <main
      id="conteudo"
      className="flex min-h-[100svh] items-center bg-linho px-5 py-[12svh] md:px-8"
    >
      <div className="mx-auto w-full max-w-[34rem]">
        <p className="t-eyebrow text-[0.6875rem] text-carvao-fraco">Serenou</p>

        <h1 className="t-display mt-5 text-[1.875rem] leading-[1.08] tracking-[0.01em] md:text-[2.25rem]">
          Não conseguimos carregar agora.
        </h1>

        <p className="t-body mt-5 max-w-[42ch] text-[1rem] leading-[1.55] text-carvao-medio">
          Foi uma falha nossa, não uma peça que saiu do ar. Tente de novo em
          alguns segundos — e, se insistir, a gente resolve no WhatsApp.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-4">
          <button
            type="button"
            onClick={reset}
            className="t-eyebrow inline-flex h-[3.25rem] items-center justify-center rounded-[var(--r-acao)] bg-carvao px-7 text-[0.6875rem] text-linho-alto transition-colors duration-200 hover:bg-[#241f19] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-oliva"
          >
            Tentar de novo
          </button>

          <a
            href={linkWhatsApp(MENSAGEM)}
            target="_blank"
            rel="noreferrer"
            className="tap text-[0.875rem] text-carvao-medio underline decoration-carvao/25 underline-offset-4 transition-colors duration-200 hover:text-carvao hover:decoration-carvao/60"
          >
            Falar no WhatsApp
          </a>

          <Link
            href="/"
            className="tap text-[0.875rem] text-carvao-fraco underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-carvao-medio hover:decoration-carvao/40"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
