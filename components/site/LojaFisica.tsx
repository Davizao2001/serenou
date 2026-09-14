"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { fechoScene } from "@/lib/scenes";
import { HORARIO, LOJA, googleMapsUrl, wazeUrl } from "@/lib/loja";

/**
 * LOJA FÍSICA
 *
 * O último passo da narrativa: depois de ver, escolher e falar, existe um
 * lugar para ir. O endereço aparece uma vez só, e os dois botões de rota
 * saem dele — nenhum componente reescreve a rua.
 *
 * "Como chegar" em dois botões em vez de um menu: um toque a menos, e um
 * menu de duas opções é sempre mais caro do que as duas opções à mostra.
 */
export function LojaFisica() {
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
      id="loja"
      data-scene="loja"
      data-escurece-fundo
      aria-labelledby="loja-titulo"
      className="relative overflow-hidden bg-carvao pt-[16svh] text-linho-alto lg:pt-[22svh]"
    >
      <div className="mx-auto max-w-[112rem] px-5 md:px-8 lg:px-12">
        <div data-fecho-chamada className="lg:grid lg:grid-cols-[52fr_48fr] lg:gap-16">
          <div>
            <p data-reveal className="t-eyebrow mb-8 text-linho-alto/55 md:mb-12">
              Quer experimentar?
            </p>

            <h2 id="loja-titulo" className="t-display t-chapter">
              {["A Serenou", "também", "te espera", "por aqui."].map((linha, i, todas) => (
                <span key={linha} className="line-mask">
                  <span data-fecho-line className="block">
                    {linha}
                    {i < todas.length - 1 ? " " : ""}
                  </span>
                </span>
              ))}
            </h2>
          </div>

          <div className="mt-10 lg:mt-0 lg:self-end lg:pb-3">
            <p data-reveal className="t-body max-w-[44ch] text-linho-alto/70">
              Venha conhecer nossas peças de perto, experimentar com calma e
              encontrar o look que combina com você.
            </p>

            {/* Mesmo endereço de `lib/loja.ts`, quebrado em rua+número /
                bairro: só a quebra muda, nenhuma palavra. */}
            <address data-reveal className="t-body mt-10 max-w-[30ch] text-[1.0625rem] not-italic leading-[1.45] text-linho-alto/90 md:text-[1.1875rem]">
              {LOJA.linhas.map((linha, i) => (
                <span key={linha} className="block">
                  {linha}
                  {i < LOJA.linhas.length - 1 ? " " : ""}
                </span>
              ))}
            </address>

            {/* O horário entrou aqui em 13/09 junto com o endereço: é a
                mesma decisão. Ninguém vai até uma loja sem saber a que horas
                ela abre, e mandar a pessoa procurar isso no rodapé depois de
                já ter clicado em "Como chegar" é tarde demais.

                Domingo, segunda e feriado não aparecem, e não viram
                "Fechado" — ver o comentário de HORARIO em lib/loja.ts. */}
            <dl data-reveal className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
              {HORARIO.map((h) => (
                <div key={h.dias}>
                  <dt className="t-eyebrow text-[0.625rem] text-linho-alto/55">{h.dias}</dt>
                  <dd className="t-body mt-2 text-linho-alto/85">{h.horas}</dd>
                </div>
              ))}
            </dl>

            <div data-reveal className="mt-8">
              <p className="t-eyebrow mb-4 text-linho-alto/55">Como chegar</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={googleMapsUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="t-eyebrow px-6 py-4 text-carvao bg-linho-alto transition-colors duration-200 hover:bg-white"
                >
                  Google Maps
                </a>
                <a
                  href={wazeUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="t-eyebrow px-6 py-4 text-linho-alto ring-1 ring-linho-alto/35 transition-colors duration-200 hover:ring-linho-alto"
                >
                  Waze
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
