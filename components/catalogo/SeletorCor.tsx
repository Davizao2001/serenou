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
 * O ANEL COM FOLGA, E POR QUE O ANTERIOR ERA GROSSO
 *
 * Antes o estado escolhido era `ring-1` + `ring-offset-3`. O "offset" do
 * Tailwind não é espaço vazio: é um SEGUNDO anel, pintado na cor do fundo da
 * página. Então o que parecia "bolinha + folga + fio" era, na prática, três
 * círculos concêntricos — e em volta de uma amostra de 22px isso vira um alvo
 * de tiro, não uma seleção.
 *
 * Aqui a folga é uma sombra só, em duas paradas: a primeira na cor do papel,
 * a segunda com 1px de carvão. Mesma leitura, um anel de verdade, e o
 * desenho não engorda.
 *
 * SELEÇÃO E FOCO NÃO PODEM SE PARECER
 *
 * São dois estados independentes — dá para estar focado sem estar escolhido,
 * e vice-versa. Por isso eles usam propriedades, cores e distâncias
 * diferentes: a seleção é `box-shadow` em carvão a 3px; o foco é `outline`
 * em oliva a 6px, por fora. Focando numa amostra já escolhida aparecem os
 * dois, e continuam distinguíveis.
 *
 * O CÍRCULO ENCOLHEU, O ALVO NÃO
 *
 * A amostra desenhada tem 28px; o botão em volta tem 44px. Quem toca acerta
 * num alvo de dedo, quem olha vê um ponto de cor — e não uma bola.
 */
export function SeletorCor({ cores, valor, aoEscolher }: Props) {
  return (
    <fieldset>
      <legend className="t-eyebrow mb-3.5 flex flex-wrap items-baseline gap-x-2.5 text-carvao-fraco">
        Cor
        {valor && (
          <>
            <span aria-hidden="true" className="text-carvao-fraco/60">
              —
            </span>
            <span className="text-[0.8125rem] normal-case tracking-normal text-carvao">
              {valor}
            </span>
          </>
        )}
      </legend>

      <div className="flex flex-wrap gap-1">
        {cores.map((c) => {
          const escolhida = c.nome === valor;
          return (
            <button
              key={c.nome}
              type="button"
              aria-pressed={escolhida}
              onClick={() => aoEscolher(c.nome)}
              title={c.nome}
              className="amostra-cor grid h-11 w-11 place-items-center rounded-full"
            >
              <span
                aria-hidden="true"
                data-escolhida={escolhida ? "sim" : undefined}
                className="amostra-cor-disco block h-7 w-7 rounded-full"
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
