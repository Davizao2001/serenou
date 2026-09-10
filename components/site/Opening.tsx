"use client";

import Link from "next/link";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { openingScene } from "@/lib/scenes";
import { MEDIA } from "@/lib/media";
import { Frame } from "@/components/media/Frame";

/**
 * ABERTURA — hero e manifesto compartilham uma única placa fotográfica.
 *
 * É o gesto central do site: a fotografia não é cortada entre as seções, ela é
 * reenquadrada. Uma imagem, vários enquadramentos — a mesma ideia que a marca
 * comunica sobre a mulher que veste Serenou.
 *
 * Cada propriedade animada mora na sua própria camada, para que a timeline de
 * entrada e a timeline presa ao scroll nunca disputem o mesmo valor:
 *
 *   [data-plate]         clip do scroll   fullscreen → quadro editorial
 *     [data-plate-reveal] clip da entrada  máscara revelando a fotografia
 *       [data-plate-zoom] scale da entrada 1.06 → 1
 *         .plate-media    scale do scroll  1 → 1.04
 */
export function Opening() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      return openingScene(el);
    },
    { scope: root }
  );

  return (
    <section ref={root} id="topo" data-scene="opening" className="relative">
      {/* ---- A placa: sticky por toda a abertura ---- */}
      <div className="sticky top-0 z-0 h-[100svh]">
        <div data-plate className="absolute inset-0 overflow-hidden">
          <div data-plate-reveal className="absolute inset-0">
            <div data-plate-zoom className="absolute inset-0">
              <Frame slot={MEDIA.hero} priority noteSide="right" className="h-full w-full" />
            </div>
          </div>
          {/* Dois véus, ambos discretos: um pela base e outro pela lateral
              esquerda, exatamente onde a tipografia pousa. A fotografia tem o
              fundo claro justamente nesse canto — sem eles a descrição some.
              A roupa fica no centro-direita e não é tocada. */}
          {/* Véus. Os valores e o porquê de cada um estão em globals.css,
              junto do ajuste de mobile: no recorte estreito a tipografia
              desce sobre o piso de madeira, o ponto mais claro do quadro. */}
          <div data-plate-scrim aria-hidden="true" className="pointer-events-none absolute inset-0" />
        </div>
      </div>

      {/* ---- Conteúdo sobre a placa ---- */}
      <div className="relative z-10 -mt-[100svh]">
        {/* HERO */}
        <div
          data-hero
          className="flex h-[100svh] flex-col justify-end px-5 pb-16 text-linho-alto md:px-8 md:pb-16 lg:px-12 lg:pb-20"
        >
          <div data-hero-copy className="max-w-[86rem]">
            <p data-hero-eyebrow className="t-eyebrow mb-6 text-linho-alto/90">
              Serenou — 2026
            </p>

            <h1 className="t-display t-hero">
              <span className="line-mask">
                <span data-hero-line className="block">
                  Vista o dia
                </span>
              </span>
              <span className="line-mask">
                <span data-hero-line className="block">
                  inteiro.
                </span>
              </span>
            </h1>

            <p data-hero-desc className="t-body mt-7 max-w-[38ch] text-linho-alto/85 md:mt-9">
              Moda feminina para o trabalho, o almoço, a viagem e a noite.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-10 md:gap-7">
              <Link
                data-hero-cta
                href="/catalogo"
                className="t-eyebrow bg-linho-alto px-8 py-4 text-carvao transition-colors duration-200 hover:bg-white"
              >
                Ver novidades
              </Link>
              <a
                data-hero-cta
                href="#manifesto"
                className="t-eyebrow tap border-b border-linho-alto/45 pb-1.5 text-linho-alto transition-colors duration-200 hover:border-linho-alto"
              >
                Conhecer a marca
              </a>
            </div>
          </div>
        </div>

        {/* MANIFESTO */}
        <div
          id="manifesto"
          className="bg-linho pb-[18svh] pt-[14svh] lg:bg-transparent lg:pb-[40svh] lg:pt-[52svh]"
        >
          <div className="px-5 md:px-8 lg:pl-12 lg:pr-[56vw]">
            <p className="t-eyebrow mb-10 text-carvao-fraco md:mb-14">Serenou</p>

            <h2 className="t-display t-manifesto max-w-[15ch]">
              <span data-manifesto-line className="block">
                A praia é onde a Serenou começou.
              </span>
              <span
                data-manifesto-line
                className="mt-[26svh] block text-carvao-medio lg:mt-[34svh]"
              >
                Não é onde ela termina.
              </span>
            </h2>

            <p
              data-manifesto-body
              className="t-body mt-16 max-w-[42ch] text-base md:mt-24 md:text-lg"
            >
              Hoje são <span className="text-oliva">vestidos</span>,{" "}
              <span className="text-oliva">conjuntos</span>,{" "}
              <span className="text-oliva">peças casuais</span> e moda praia. A
              mesma marca, muito mais dias do ano.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
