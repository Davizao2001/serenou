"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { versatilScene } from "@/lib/scenes";
import { MEDIA, type MediaSlot } from "@/lib/media";
import { Frame } from "@/components/media/Frame";

/**
 * As três vitrines de looks.
 *
 * O texto de cada uma vem inteiro da cliente. A quebra em duas alturas
 * tipográficas — a primeira frase em display, o resto em corpo — é
 * composição, não edição: nenhuma palavra muda de lugar. É o que mantém a
 * parte editorial em vez de virar legenda de card.
 *
 * `vitrine` é o nome pelo qual a Grazi identifica cada uma. As fotografias
 * novas (azul, rosa, verde) ainda não chegaram; quando chegarem, o único
 * lugar a mexer é o slot correspondente em `lib/media.ts`.
 */
const LOOKS: Array<{
  slot: MediaSlot;
  indice: string;
  vitrine: string;
  chamada: string;
  nota: string;
  /** Deslocamento horizontal da placa no desktop — a composição se
   *  reorganiza a cada troca em vez de trocar no mesmo lugar. */
  offset: string;
}> = [
  {
    slot: MEDIA.versatilDia,
    indice: "01",
    vitrine: "Azul",
    chamada: "Para quando o básico pede um pouco mais.",
    nota: "Peças que transitam do trabalho ao jantar sem complicação.",
    offset: "lg:left-0",
  },
  {
    slot: MEDIA.versatilTarde,
    indice: "02",
    vitrine: "Rosa",
    chamada: "Para vestir e se sentir bem.",
    nota: "Modelagens femininas, tecidos leves e aquela dose de cor que transforma o look.",
    offset: "lg:left-[13%]",
  },
  {
    slot: MEDIA.versatilNoite,
    indice: "03",
    vitrine: "Verde",
    chamada: "Para acompanhar a vida real.",
    nota: "Conforto, praticidade e combinações que funcionam em diferentes momentos do seu dia.",
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
                {["Um look.", "Várias", "possibilidades"].map((linha) => (
                  <span key={linha} className="line-mask">
                    <span data-versatil-line className="block">
                      {linha}
                    </span>
                  </span>
                ))}
              </h2>

              <p data-reveal className="t-body mt-8 max-w-[40ch] md:mt-10">
                Do trabalho ao jantar, da viagem ao fim de semana.
                Acreditamos em peças que se adaptam à sua rotina e não o
                contrário.
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
                  <div data-look-caption className="mt-5 max-w-[46ch] md:mt-6">
                    <p className="t-eyebrow mb-3 text-carvao-fraco">
                      {look.indice}
                    </p>
                    <p className="t-display text-[1.25rem] leading-[1.06] tracking-[0.01em] md:text-[1.5rem]">
                      {look.chamada}
                    </p>
                    <p className="t-body mt-3 max-w-[46ch] text-sm">{look.nota}</p>
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
