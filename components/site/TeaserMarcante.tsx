"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { teaserScene } from "@/lib/scenes";
import { MEDIA } from "@/lib/media";
import { Frame } from "@/components/media/Frame";

/**
 * TEASER — 03 MARCANTE
 *
 * Fecha a fase 01. A alfaiataria preta entra parcialmente pela base da
 * viewport e leva o fundo da página do bege para o carvão: o site muda de
 * humor sem que o capítulo seguinte esteja construído.
 *
 * É só o teaser. A seção MARCANTE inteira vem depois da aprovação.
 */
export function TeaserMarcante() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      return teaserScene(el);
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      data-scene="teaser"
      aria-labelledby="marcante-titulo"
      className="relative overflow-hidden pt-[16svh] text-linho-alto lg:pt-[22svh]"
    >
      <div className="mx-auto grid max-w-[112rem] items-end gap-12 px-5 md:px-8 lg:grid-cols-[42fr_58fr] lg:gap-16 lg:px-12">
        {/* Coluna tipográfica */}
        <div className="pb-[10svh] lg:pb-[14svh]">
          <p data-reveal className="t-eyebrow mb-8 text-linho-alto/55 md:mb-12">
            03 / Marcante
          </p>

          <h2 id="marcante-titulo" className="t-display t-chapter">
            {["Sem cor.", "Só", "silhueta."].map((linha) => (
              <span key={linha} className="line-mask">
                <span data-teaser-line className="block">
                  {linha}
                </span>
              </span>
            ))}
          </h2>

          <p data-reveal className="t-body mt-8 max-w-[32ch] text-linho-alto/70 md:mt-10">
            Alfaiataria em preto, ombro único, broche dourado. O capítulo
            inteiro vem a seguir.
          </p>

          <div data-reveal className="mt-14 border-t border-linho-alto/20 pt-8 md:mt-20">
            <p className="t-eyebrow mb-6 text-linho-alto/55">A narrativa continua</p>
            <ol className="flex flex-wrap gap-x-10 gap-y-3">
              {["04 / Solar", "05 / Serenou"].map((c) => (
                <li
                  key={c}
                  className="t-display text-[1.5rem] text-linho-alto/40 md:text-[2rem]"
                >
                  {c}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* A fotografia entra pela base e não termina — o capítulo continua */}
        <div data-teaser-frame className="lg:justify-self-end">
          <Frame
            slot={MEDIA.marcante}
            className="aspect-[4/5] w-full lg:aspect-auto lg:h-[86svh] lg:w-[46vw]"
          />
        </div>
      </div>
    </section>
  );
}
