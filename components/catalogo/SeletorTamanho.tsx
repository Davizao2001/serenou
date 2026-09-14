"use client";

import type { Tamanho } from "@/lib/catalogo";

type Props = {
  tamanhos: Tamanho[];
  valor: string | null;
  aoEscolher: (rotulo: string) => void;
};

/**
 * SELETOR DE TAMANHO
 *
 * Tamanho acabado aparece riscado e desabilitado — não some. Some seria pior:
 * a cliente que veste GG precisa saber que a peça existe no tamanho dela e
 * acabou, não ficar achando que a loja não faz o tamanho.
 *
 * Se a escolha vai ser obrigatória antes do WhatsApp ainda não foi decidido;
 * por isso este componente só informa a seleção para cima e não bloqueia nada.
 */
export function SeletorTamanho({ tamanhos, valor, aoEscolher }: Props) {
  const todosEsgotados = tamanhos.every((t) => !t.disponivel);

  return (
    <fieldset>
      <legend className="t-eyebrow mb-3 text-carvao-fraco">Tamanho</legend>

      <div className="flex flex-wrap gap-2.5">
        {tamanhos.map((t) => {
          const escolhido = t.rotulo === valor;
          return (
            <button
              key={t.rotulo}
              type="button"
              disabled={!t.disponivel}
              aria-pressed={escolhido}
              onClick={() => aoEscolher(t.rotulo)}
              /* Mesma gramática da amostra de cor: fio de 1px em repouso, fio
                 em carvão quando escolhido, e o foco por fora, em oliva, para
                 não se confundir com a seleção. Escolhido não vira bloco
                 preto — invertido, o tamanho pesaria mais que o próprio CTA
                 logo abaixo, e a peça teria dois retângulos escuros
                 disputando o olho. */
              className={`t-eyebrow botao-tamanho grid h-12 min-w-[3.25rem] place-items-center rounded-[var(--r-acao)] px-3.5 text-[0.6875rem] transition-colors duration-200 ${
                escolhido
                  ? "bg-areia/55 text-carvao ring-1 ring-carvao"
                  : t.disponivel
                    ? "bg-transparent text-carvao-medio ring-1 ring-carvao/15 hover:text-carvao hover:ring-carvao/45"
                    : "cursor-not-allowed text-carvao-fraco line-through ring-1 ring-carvao/10"
              }`}
            >
              {t.rotulo}
              {!t.disponivel && <span className="sr-only">, esgotado</span>}
            </button>
          );
        })}
      </div>

      {todosEsgotados && (
        <p className="t-body mt-4 text-sm">Todos os tamanhos esgotados.</p>
      )}
    </fieldset>
  );
}
