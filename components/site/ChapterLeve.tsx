"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { leveScene } from "@/lib/scenes";
import { MEDIA } from "@/lib/media";
import { Frame } from "@/components/media/Frame";

/**
 * CAPÍTULO 01 — LEVE
 *
 * Espelha a abertura: lá a fotografia fechou à esquerda, aqui ela abre à
 * direita. O movimento é de câmera, nunca do tecido — se existir o vídeo
 * original do vestido, ele entra no lugar da foto pelo manifest e o tecido
 * se move sozinho.
 */
export function ChapterLeve() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      return leveScene(el);
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="vestidos"
      data-scene="leve"
      aria-labelledby="leve-titulo"
      /* O respiro de baixo é menor que o de cima, e de propósito: é ele que
         separa o Leve da entrada do Versátil, e medindo a faixa entre os dois
         dava 33% da viewport vazia por ~400px. Cortar 5svh no pé antecipa a
         chegada da próxima composição sem tocar em nada da animação. O de
         cima continua 14/18svh, porque ali a separação é do manifesto. */
      className="relative px-5 pb-[11svh] pt-[14svh] md:px-8 lg:px-12 lg:pb-[13svh] lg:pt-[18svh]"
    >
      <div className="mx-auto grid max-w-[112rem] gap-10 lg:grid-cols-[60fr_40fr] lg:items-center lg:gap-16">
        {/* Conteúdo — 40% */}
        <div data-leve-copy className="order-2 lg:order-2 lg:pl-8">
          <p data-reveal className="t-eyebrow mb-8 text-carvao-fraco md:mb-12">
            01 / Leve
          </p>

          <h2 id="leve-titulo" className="t-display t-chapter">
            {["Conforto que", "acompanha", "a sua rotina."].map((linha, i, todas) => (
              <span key={linha} className="line-mask">
                <span data-leve-line className="block">
                  {linha}
                    {i < todas.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h2>

          <p data-reveal className="t-body mt-8 max-w-[42ch] md:mt-10">
            Tecidos leves, modelagens confortáveis e peças que você veste sem
            precisar pensar demais. Porque se sentir bem também faz parte do
            look.
          </p>

          <a
            data-reveal
            href="#vestidos"
            className="t-eyebrow tap mt-10 inline-flex items-center gap-3 border-b border-carvao/25 pb-2 text-carvao transition-colors duration-200 hover:border-carvao md:mt-14"
          >
            Ver vestidos
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Fotografia — 60% */}
        {/* A moldura segue a proporção nativa da fotografia: forçar quase
            quadrado cortaria decotes e barras dos vestidos. A folga que sobra
            na coluna é respiro, não erro. */}
        <div data-leve-frame className="order-1 lg:order-1 lg:flex lg:justify-start">
          <Frame
            slot={MEDIA.leve}
            className="aspect-[4/5] w-full lg:h-[86svh] lg:w-auto"
          />
        </div>
      </div>
    </section>
  );
}
