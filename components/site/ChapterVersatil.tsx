"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { versatilScene } from "@/lib/scenes";
import { MEDIA, type MediaSlot } from "@/lib/media";
import { Frame } from "@/components/media/Frame";

/** Claro → oliva → preto. A progressão de cor é o argumento da seção. */
const LOOKS: Array<{
  slot: MediaSlot;
  indice: string;
  ocasiao: string;
  nota: string;
  /** Deslocamento horizontal da placa no desktop — a composição se
   *  reorganiza a cada troca em vez de trocar no mesmo lugar. */
  offset: string;
}> = [
  {
    slot: MEDIA.versatilDia,
    indice: "Look 01",
    ocasiao: "Dia",
    nota: "Amarelo-manteiga e bege, para o dia que começa sem hora marcada.",
    offset: "lg:left-0",
  },
  {
    slot: MEDIA.versatilTarde,
    indice: "Look 02",
    ocasiao: "Tarde",
    nota: "O oliva da marca, do vestido longo ao conjunto de pantalona.",
    offset: "lg:left-[13%]",
  },
  {
    slot: MEDIA.versatilNoite,
    indice: "Look 03",
    ocasiao: "Noite",
    nota: "Preto, quando o mesmo dia continua.",
    offset: "lg:left-[5%]",
  },
];

/**
 * CAPÍTULO 02 — VERSÁTIL (início)
 *
 * Uma marca, vários caminhos. No desktop a tipografia fica presa à esquerda e
 * as fotografias se sucedem à direita por máscara vertical, cada uma pousando
 * em um ponto diferente da coluna — a composição se reorganiza em vez de
 * trocar de card. No mobile vira sequência vertical, sem pin.
 */
export function ChapterVersatil() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      return versatilScene(el);
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="conjuntos"
      data-scene="versatil"
      aria-labelledby="versatil-titulo"
      className="relative"
    >
      <div data-versatil-stage className="relative pt-[10svh] lg:h-[340svh] lg:pt-0">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:pt-[var(--header-h)]">
          <div className="mx-auto grid w-full max-w-[112rem] gap-12 px-5 md:px-8 lg:grid-cols-[38fr_62fr] lg:items-center lg:gap-16 lg:px-12">
            {/* Coluna tipográfica */}
            <div data-versatil-head className="lg:pr-8">
              <p data-reveal className="t-eyebrow mb-8 text-carvao-fraco md:mb-12">
                02 / Versátil
              </p>

              <h2 id="versatil-titulo" className="t-display t-chapter">
                {["Manhã,", "tarde,", "noite."].map((linha) => (
                  <span key={linha} className="line-mask">
                    <span data-versatil-line className="block">
                      {linha}
                    </span>
                  </span>
                ))}
              </h2>

              <p data-reveal className="t-body mt-8 max-w-[34ch] md:mt-10">
                A mesma marca em três horários. O que muda é a paleta, não a
                mulher.
              </p>

              {/* Índice de posição — só faz sentido enquanto a seção está presa */}
              <ol
                aria-hidden="true"
                className="mt-12 hidden items-center gap-3 lg:flex"
              >
                {LOOKS.map((l, i) => (
                  <li key={l.indice} data-step className="flex items-center gap-2">
                    <span className="t-eyebrow text-carvao-fraco">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="block h-px w-8 bg-carvao/40" />
                  </li>
                ))}
              </ol>
            </div>

            {/* Coluna fotográfica */}
            <div data-looks className="relative lg:h-[74svh]">
              {LOOKS.map((look) => (
                <article
                  key={look.indice}
                  data-look
                  className={`relative mb-16 lg:absolute lg:inset-y-0 lg:mb-0 ${look.offset}`}
                >
                  <div data-look-frame className="lg:h-[62svh]">
                    <Frame
                      slot={look.slot}
                      className="aspect-[4/5] w-full lg:aspect-[4/5] lg:h-full lg:w-auto"
                    />
                  </div>
                  <div
                    data-look-caption
                    className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-2"
                  >
                    <p className="t-eyebrow text-carvao-fraco">{look.indice}</p>
                    <p className="t-display text-[1.6rem] tracking-[0.04em]">
                      {look.ocasiao}
                    </p>
                    <p className="t-body basis-full text-sm md:basis-auto">
                      {look.nota}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
