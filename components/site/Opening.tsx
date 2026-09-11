"use client";

import Link from "next/link";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { openingScene } from "@/lib/scenes";
import { HERO_SLIDES } from "@/lib/media";
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
              {/* As três fotografias ocupam o mesmo lugar; a cena troca a
                  opacidade. A primeira entra com prioridade e opacidade 1 —
                  as outras nascem invisíveis, mas presentes, para que a
                  primeira troca não espere download. */}
              {HERO_SLIDES.map(({ slot, tom }, i) => (
                <div
                  key={slot.id}
                  data-hero-slide
                  data-tom={tom}
                  className="absolute inset-0"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  {/* Só a primeira carrega descrição: as outras são o mesmo
                      cenário em outra cor, e alts longos em sequência viram
                      ruído em leitor de tela. */}
                  <Frame
                    slot={slot}
                    priority={i === 0}
                    decorative={i > 0}
                    noteSide="right"
                    className="h-full w-full"
                  />
                  {/* O véu mora dentro do slide para atravessar a
                      dissolvência junto com a fotografia. */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 ${
                      tom === "escuro" ? "veu-escuro" : "veu-claro"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Dois véus, ambos discretos: um pela base e outro pela lateral
              esquerda, exatamente onde a tipografia pousa. A fotografia tem o
              fundo claro justamente nesse canto — sem eles a descrição some.
              A roupa fica no centro-direita e não é tocada. */}
        </div>
      </div>

      {/* ---- Conteúdo sobre a placa ---- */}
      <div className="relative z-10 -mt-[100svh]">
        {/* HERO */}
        <div
          data-hero
          className="hero-tinta flex h-[100svh] flex-col justify-end px-5 pb-16 md:px-8 md:pb-16 lg:px-12 lg:pb-20"
        >
          <div data-hero-copy className="max-w-[86rem]">
            <p data-hero-eyebrow className="t-eyebrow mb-6">
              Serenou 2026
            </p>

            {/* Três linhas, não duas. Em duas, "VISTA O DIA" atravessava 72%
                do quadro e terminava sobre os manequins, onde o carvão caía
                para 2,4:1. Em três, a linha mais longa para nos 38% e a
                headline inteira mora na parede vazia — que é justamente o
                que as três fotografias têm em comum. */}
            <h1 className="t-display t-hero">
              {["Vista", "o dia", "inteiro."].map((linha, i, todas) => (
                <span key={linha} className="line-mask">
                  <span data-hero-line className="block">
                    {linha}
                    {i < todas.length - 1 ? " " : ""}
                  </span>
                </span>
              ))}
            </h1>

            <p data-hero-desc className="t-body mt-7 max-w-[38ch] md:mt-9">
              Para o trabalho, a viagem e a noite.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-10 md:gap-7">
              <Link
                data-hero-cta
                href="/catalogo"
                className="t-eyebrow hero-cta-solido px-8 py-4"
              >
                Ver novidades
              </Link>
              <a
                data-hero-cta
                href="#manifesto"
                className="t-eyebrow tap hero-cta-linha border-b pb-1.5"
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
              className="t-body mt-16 max-w-[46ch] text-base md:mt-24 md:text-lg"
            >
              Hoje, a Serenou veste diferentes momentos da mulher:{" "}
              <span className="text-oliva">vestidos</span>,{" "}
              <span className="text-oliva">conjuntos</span>,{" "}
              <span className="text-oliva">peças casuais</span> e moda praia
              pensados para uma rotina real. Peças que combinam entre si,
              transitam entre ocasiões e, acima de tudo, fazem você se sentir
              bem.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
