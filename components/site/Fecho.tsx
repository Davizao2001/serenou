"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { fechoScene } from "@/lib/scenes";
import {
  ENTREGAS,
  HORARIO,
  INSTAGRAM,
  LOJA,
  MARCA,
  WHATSAPP_EXIBICAO,
  linkWhatsApp,
} from "@/lib/loja";

/**
 * RODAPÉ
 *
 * Era só assinatura e dois canais. Em 13/09 a Grazi confirmou horário e formas
 * de entrega, e o rodapé virou o lugar onde tudo que é fato sobre a loja fica
 * junto: onde ela é, quando abre, como a peça chega, por onde falar.
 *
 * TRÊS COLUNAS, NÃO UMA LISTA
 *
 * Empilhar sete blocos num rodapé escuro é parede de texto. Em colunas, cada
 * assunto tem um título curto e três linhas no máximo, e o olho escolhe. No
 * telefone elas empilham, que ali é o único jeito.
 *
 * O QUE NÃO ESTÁ AQUI
 *
 * Domingo, segunda e feriado não aparecem — e não viram "Fechado". A Grazi
 * mandou terça a sábado; o resto ela não disse, e um "Fechado" deduzido manda
 * a cliente embora num dia em que a porta podia estar aberta. Prazo e preço
 * de frete também não: as três formas de entrega existem, as condições não
 * foram ditas.
 *
 * Tudo sai de `lib/loja.ts` — nenhum dado comercial escrito à mão aqui.
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
          className="border-t border-linho-alto/15 pt-12"
        >
          <div data-reveal>
            <p className="t-display text-[1.25rem] tracking-[0.02em] md:text-[1.5rem]">
              {MARCA.nome}
            </p>
            <p className="t-body mt-3 max-w-[34ch] text-sm text-linho-alto/70">
              {MARCA.assinatura}
            </p>
          </div>

          <div
            data-reveal
            className="mt-12 grid gap-9 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-10"
          >
            <section>
              <h2 className="t-eyebrow text-[0.625rem] text-linho-alto/45">Loja física</h2>
              <address className="t-body mt-4 text-sm not-italic leading-relaxed text-linho-alto/80">
                {LOJA.linhas.map((linha) => (
                  <span key={linha} className="block">
                    {linha}
                  </span>
                ))}
              </address>
            </section>

            <section>
              <h2 className="t-eyebrow text-[0.625rem] text-linho-alto/45">Horário</h2>
              <dl className="mt-4 space-y-2.5 text-sm leading-relaxed">
                {HORARIO.map((h) => (
                  <div key={h.dias}>
                    <dt className="text-linho-alto/55">{h.dias}</dt>
                    <dd className="text-linho-alto/85">{h.horas}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h2 className="t-eyebrow text-[0.625rem] text-linho-alto/45">Entregas</h2>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-linho-alto/80">
                {ENTREGAS.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="t-eyebrow text-[0.625rem] text-linho-alto/45">Contato</h2>
              {/* "Instagram @serenoubeach" e "WhatsApp (11) 98448-7394": o
                  rótulo faz parte do texto que a cliente escreveu, então ele
                  aparece. O que vira link é só o dado. */}
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <span className="block text-linho-alto/55">Instagram</span>
                  <a
                    href={INSTAGRAM.url}
                    target="_blank"
                    rel="noreferrer"
                    className="tap text-linho-alto/85 underline decoration-linho-alto/25 decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-linho-alto/70"
                  >
                    {INSTAGRAM.usuario}
                  </a>
                </li>
                <li>
                  <span className="block text-linho-alto/55">WhatsApp</span>
                  <a
                    href={linkWhatsApp()}
                    target="_blank"
                    rel="noreferrer"
                    className="tap text-linho-alto/85 underline decoration-linho-alto/25 decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-linho-alto/70"
                  >
                    {WHATSAPP_EXIBICAO}
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-[7svh] flex flex-wrap items-end justify-between gap-8 border-t border-linho-alto/15 py-10">
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
