"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { fechoScene } from "@/lib/scenes";
import { WHATSAPP_EXIBICAO, linkWhatsApp } from "@/lib/loja";

/**
 * A SERENOU
 *
 * A ponte entre olhar e falar: a cliente já viu as peças, aqui ela descobre
 * que a conversa continua com gente do outro lado. É o penúltimo passo da
 * narrativa, antes da loja física.
 *
 * Fundo carvão, herdado do teaser anterior. O número nunca é escrito aqui:
 * vem de `lib/loja.ts`, como todo dado comercial.
 */
export function ASerenou() {
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
    <section
      ref={root}
      id="sobre"
      data-scene="fecho"
      aria-labelledby="serenou-titulo"
      className="relative overflow-hidden bg-carvao text-linho-alto"
    >
      {/* A passagem do bege para o carvão. Antes ela era um tween no fundo da
          página, disparado pelo teaser "03 / Marcante". Com o teaser fora da
          home, virou uma faixa dentro desta seção: assim o degradê acontece
          aqui e não tinge o capítulo anterior, que continua claro. */}
      <div
        aria-hidden="true"
        className="h-[20svh] bg-gradient-to-b from-areia to-carvao lg:h-[24svh]"
      />

      {/* A faixa era 44svh e o conteúdo começava 10svh depois dela: quase
          meia tela e meia de degradê antes da primeira palavra. Medido a
          1440×900, a maior faixa contínua sem conteúdo chegava a 68% da
          viewport por 700px de rolagem. A faixa cai para 24svh e o respiro
          para 5svh — o degradê continua fazendo a passagem de cor, só deixa
          de ser uma fila de espera. */}
      <div className="mx-auto max-w-[112rem] px-5 pt-[5svh] md:px-8 lg:px-12 lg:pt-[6svh]">
        <div data-fecho-chamada className="lg:grid lg:grid-cols-[52fr_48fr] lg:gap-16">
          <div>
            <p data-reveal className="t-eyebrow mb-8 text-linho-alto/55 md:mb-12">
              A Serenou
            </p>

            <h2 id="serenou-titulo" className="t-display t-chapter">
              {/* `whitespace-nowrap`: sem ele o navegador quebra em
                  "guarda-" / "roupa.", e a linha da máscara passa a conter
                  duas alturas de texto. As três linhas cabem inteiras até
                  360px, então travar a quebra é seguro. */}
              {["Da tela", "para o seu", "guarda-roupa."].map((linha, i, todas) => (
                <span key={linha} className="line-mask">
                  <span data-fecho-line className="block whitespace-nowrap">
                    {linha}
                    {i < todas.length - 1 ? " " : ""}
                  </span>
                </span>
              ))}
            </h2>
          </div>

          <div className="mt-10 lg:mt-0 lg:self-end lg:pb-3">
            {/* Duas frases, dois parágrafos: no texto da cliente elas vêm em
                linhas separadas, e a pergunta pede o próprio respiro. */}
            <p data-reveal className="t-body max-w-[44ch] text-linho-alto/70">
              Você escolhe suas peças favoritas por aqui e a gente continua com
              você no WhatsApp.{" "}
            </p>
            <p data-reveal className="t-body mt-4 max-w-[44ch] text-linho-alto/70">
              Dúvidas sobre tamanho, cor ou disponibilidade? É só chamar.
            </p>

            <a
              data-reveal
              href={linkWhatsApp()}
              target="_blank"
              rel="noreferrer"
              className="tap group mt-10 inline-flex flex-col items-start gap-1 border-b border-linho-alto/25 pb-3 transition-colors duration-300 hover:border-linho-alto/70 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="t-display flex items-baseline gap-3 text-[1.5rem] md:text-[1.9rem]">
                Falar no WhatsApp
                <span aria-hidden="true" className="text-[0.7em]">
                  →
                </span>
              </span>
              <span className="t-eyebrow whitespace-nowrap text-linho-alto/60 transition-colors duration-300 group-hover:text-linho-alto/90">
                {WHATSAPP_EXIBICAO}
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
