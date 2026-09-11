"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { fechoScene } from "@/lib/scenes";
import { INSTAGRAM, MARCA, WHATSAPP_EXIBICAO, linkWhatsApp } from "@/lib/loja";

/**
 * RODAPÉ
 *
 * Minimalista de propósito: a essa altura a cliente já recebeu o WhatsApp e o
 * endereço nas duas seções anteriores. Aqui fica só a assinatura da marca e
 * os dois canais, para quem rolou direto até o fim.
 *
 * Instagram e WhatsApp saem de `lib/loja.ts` — nenhum dado comercial escrito
 * à mão em componente.
 */
export function Fecho() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      return fechoScene(el);
    },
    { scope: root }
  );

  return (
    <footer
      ref={root}
      data-scene="fecho"
      className="relative overflow-hidden bg-carvao pt-[14svh] text-linho-alto lg:pt-[18svh]"
    >
      <div className="mx-auto max-w-[112rem] px-5 md:px-8 lg:px-12">
        <div
          data-fecho-chamada
          className="flex flex-col gap-10 border-t border-linho-alto/15 pt-12 sm:flex-row sm:items-start sm:justify-between sm:gap-16"
        >
          <div data-reveal>
            <p className="t-display text-[1.25rem] tracking-[0.02em] md:text-[1.5rem]">
              {MARCA.nome}
            </p>
            <p className="t-body mt-3 max-w-[34ch] text-sm text-linho-alto/70">
              {MARCA.assinatura}
            </p>
          </div>

          <ul data-reveal className="flex flex-col gap-4 sm:items-end">
            {/* "Instagram @serenoubeach" e "WhatsApp (11) 98448-7394": o
                rótulo faz parte do texto que a cliente escreveu, então ele
                aparece. O que vira link é só o dado. */}
            <li className="flex flex-wrap items-baseline gap-x-2">
              <span className="t-body text-linho-alto/55">Instagram</span>
              <a
                href={INSTAGRAM.url}
                target="_blank"
                rel="noreferrer"
                className="t-body tap text-linho-alto/85 underline decoration-linho-alto/25 decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-linho-alto/70"
              >
                {INSTAGRAM.usuario}
              </a>
            </li>
            <li className="flex flex-wrap items-baseline gap-x-2">
              <span className="t-body text-linho-alto/55">WhatsApp</span>
              <a
                href={linkWhatsApp()}
                target="_blank"
                rel="noreferrer"
                className="t-body tap text-linho-alto/85 underline decoration-linho-alto/25 decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-linho-alto/70"
              >
                {WHATSAPP_EXIBICAO}
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-[8svh] flex flex-wrap items-end justify-between gap-8 border-t border-linho-alto/15 py-10">
          <span className="marca-serenou text-linho-alto" aria-hidden="true" />
          <span className="marca-texto t-display text-[1.4rem]">Serenou</span>
          <p className="t-eyebrow text-linho-alto/55">
            Serenou {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
