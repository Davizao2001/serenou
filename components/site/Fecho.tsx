"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { fechoScene } from "@/lib/scenes";
import { INSTAGRAM, LOJA, WHATSAPP_EXIBICAO, linkWhatsApp } from "@/lib/loja";

/**
 * FECHO — informações da loja
 *
 * Onde a narrativa termina e a página vira utilidade: endereço, Instagram,
 * WhatsApp. O capítulo anterior já deixou o fundo em carvão, então aqui o
 * site não muda de humor mais uma vez — ele só baixa o tom e entrega o que
 * a pessoa foi procurar.
 *
 * Só entra dado confirmado. Cidade, CEP, horário e formas de entrega ainda
 * não foram fechados com a Grazi — o lugar deles está marcado, vazio.
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
      id="sobre"
      data-scene="fecho"
      aria-labelledby="fecho-titulo"
      className="relative overflow-hidden bg-carvao pt-[18svh] text-linho-alto lg:pt-[24svh]"
    >
      <div className="mx-auto max-w-[112rem] px-5 md:px-8 lg:px-12">
        {/* ---- Chamada ---- */}
        <div data-fecho-chamada className="lg:grid lg:grid-cols-[52fr_48fr] lg:gap-16">
          <div>
            <p data-reveal className="t-eyebrow mb-8 text-linho-alto/55 md:mb-12">
              A loja
            </p>

            <h2 id="fecho-titulo" className="t-display t-chapter">
              {["Venha ver", "de perto."].map((linha) => (
                <span key={linha} className="line-mask">
                  <span data-fecho-line className="block">
                    {linha}
                  </span>
                </span>
              ))}
            </h2>
          </div>

          <div className="mt-10 lg:mt-0 lg:self-end lg:pb-3">
            <p data-reveal className="t-body max-w-[38ch] text-linho-alto/70">
              As peças ficam na loja, para ver e provar sem pressa. E qualquer
              dúvida sobre uma delas cabe numa mensagem — é só chamar.
            </p>

            <a
              data-reveal
              href={linkWhatsApp()}
              target="_blank"
              rel="noreferrer"
              className="tap group mt-10 inline-flex flex-col items-start gap-1 border-b border-linho-alto/25 pb-3 transition-colors duration-300 hover:border-linho-alto/70 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="t-display text-[1.6rem] md:text-[2rem]">
                Falar no WhatsApp
              </span>
              <span className="t-eyebrow whitespace-nowrap text-linho-alto/60 transition-colors duration-300 group-hover:text-linho-alto/90">
                {WHATSAPP_EXIBICAO}
              </span>
            </a>
          </div>
        </div>

        {/* ---- Dados da loja ---- */}
        <div className="mt-[9svh] grid gap-12 border-t border-linho-alto/15 pt-12 sm:grid-cols-2 lg:mt-[16svh] lg:grid-cols-3 lg:gap-16">
          <div data-reveal>
            <h3 className="t-eyebrow mb-5 text-linho-alto/55">Loja física</h3>
            <address className="t-body not-italic text-linho-alto/85">
              {LOJA.endereco}
            </address>
          </div>

          <div data-reveal>
            <h3 className="t-eyebrow mb-5 text-linho-alto/55">Instagram</h3>
            <a
              href={INSTAGRAM.url}
              target="_blank"
              rel="noreferrer"
              className="t-body tap text-linho-alto/85 underline decoration-linho-alto/25 decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-linho-alto/70"
            >
              {INSTAGRAM.usuario}
            </a>
          </div>

          {/*
            Entrega — a Grazi ainda não confirmou as modalidades. A coluna
            existe no desenho e recebe o conteúdo assim que a informação vier;
            inventar prazo ou frete aqui viraria promessa ao cliente final.
          */}

          <div data-reveal>
            <h3 className="t-eyebrow mb-5 text-linho-alto/55">Atendimento</h3>
            <a
              href={linkWhatsApp()}
              target="_blank"
              rel="noreferrer"
              className="t-body tap text-linho-alto/85 underline decoration-linho-alto/25 decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-linho-alto/70"
            >
              {WHATSAPP_EXIBICAO}
            </a>
          </div>
        </div>

        {/* ---- Assinatura ---- */}
        <div className="mt-[8svh] flex flex-wrap items-end justify-between gap-8 border-t border-linho-alto/15 py-10 lg:mt-[12svh]">
          <span className="marca-serenou text-linho-alto" aria-hidden="true" />
          <span className="marca-texto t-display text-[1.4rem]">Serenou</span>
          <p className="t-eyebrow text-linho-alto/55">
            Serenou — {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
