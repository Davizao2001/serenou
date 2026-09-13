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

      <div className="flex flex-wrap gap-2">
        {tamanhos.map((t) => {
          const escolhido = t.rotulo === valor;
          return (
            <button
              key={t.rotulo}
              type="button"
              disabled={!t.disponivel}
              aria-pressed={escolhido}
              onClick={() => aoEscolher(t.rotulo)}
              /* Escolhido = borda escura e fundo levemente quente, não bloco
                 preto. Invertido, o tamanho selecionado ficava mais pesado
                 que o próprio CTA logo abaixo, e a peça passava a ter dois
                 retângulos pretos disputando o olho. */
              className={`t-eyebrow grid h-11 min-w-[3rem] place-items-center px-3 text-[0.6875rem] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva focus-visible:ring-offset-2 focus-visible:ring-offset-linho ${
                escolhido
                  ? "bg-areia/60 text-carvao ring-1 ring-carvao"
                  : t.disponivel
                    ? "bg-transparent text-carvao-medio ring-1 ring-carvao/20 hover:text-carvao hover:ring-carvao/50"
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
