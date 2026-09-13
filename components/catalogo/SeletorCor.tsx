"use client";

import type { Cor } from "@/lib/catalogo";

type Props = {
  cores: Cor[];
  valor: string | null;
  aoEscolher: (nome: string) => void;
};

/**
 * SELETOR DE COR
 *
 * Amostra redonda com o nome ao lado, não um <select>. A cor é a primeira
 * coisa que a cliente decide e precisa ser vista, não lida.
 *
 * O nome escolhido aparece por extenso acima das amostras: é ele que vai
 * dentro da mensagem do WhatsApp, então precisa estar visível na hora de
 * apertar o botão — ninguém confere uma bolinha selecionada.
 */
export function SeletorCor({ cores, valor, aoEscolher }: Props) {
  return (
    <fieldset>
      <legend className="t-eyebrow mb-3 flex flex-wrap items-baseline gap-x-3 text-carvao-fraco">
        Cor
        {valor && <span className="normal-case tracking-normal text-carvao">{valor}</span>}
      </legend>

      <div className="flex flex-wrap gap-2">
        {cores.map((c) => {
          const escolhida = c.nome === valor;
          return (
            <button
              key={c.nome}
              type="button"
              aria-pressed={escolhida}
              onClick={() => aoEscolher(c.nome)}
              title={c.nome}
              /* O alvo de toque continua com 40px; o que encolheu foi o
                 desenho. Bolinha de 28px com anel afastado 4px virava um
                 elemento de 44px por cor, e três cores viravam uma faixa
                 gráfica maior que o nome da peça. */
              className={`grid h-10 w-10 place-items-center rounded-full transition-shadow duration-200 ${
                escolhida ? "ring-1 ring-carvao ring-offset-[3px] ring-offset-linho" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="block h-[1.375rem] w-[1.375rem] rounded-full ring-1 ring-carvao/20"
                style={{
                  background: Array.isArray(c.amostra)
                    ? `linear-gradient(135deg, ${c.amostra[0]} 50%, ${c.amostra[1]} 50%)`
                    : c.amostra,
                }}
              />
              <span className="sr-only">{c.nome}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
