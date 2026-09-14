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

      {/* `gap-3` e não `gap-2.5`: o botão escolhido ganhou anel externo de 3px,
          e com 10px de respiro sobrariam 4px entre o anel de um e a borda do
          vizinho. Doze pixels devolvem a folga sem afrouxar a fileira. */}
      <div className="flex flex-wrap gap-3">
        {tamanhos.map((t) => {
          const escolhido = t.rotulo === valor;
          return (
            <button
              key={t.rotulo}
              type="button"
              disabled={!t.disponivel}
              aria-pressed={escolhido}
              data-escolhido={escolhido ? "sim" : undefined}
              onClick={() => aoEscolher(t.rotulo)}
              /* A MESMA GRAMÁTICA DA AMOSTRA DE COR, AGORA LITERALMENTE
                 Antes isto era parecido com o seletor de cor; agora é igual,
                 e por construção: os três estados saem de `.botao-tamanho`
                 em app/globals.css, com as mesmas paradas de sombra que o
                 disco usa — fio interno em repouso, fio mais forte no hover,
                 e no escolhido uma folga na cor do papel seguida do fio em
                 carvão. Duas escolhas lado a lado na mesma coluna precisam
                 falar a mesma língua; se o tamanho marca com um anel de um
                 jeito e a cor de outro, a pessoa lê dois sistemas.

                 O estado vai em `data-escolhido`, e não numa classe do
                 Tailwind, pelo mesmo motivo de lá: o hover precisa de
                 `:not([data-escolhido])` para não apagar a marcação do botão
                 já escolhido — e isso é seletor, não classe utilitária.

                 Escolhido não vira bloco preto: invertido, o tamanho pesaria
                 mais que o próprio CTA logo abaixo, e a peça teria dois
                 retângulos escuros disputando o olho. */
              className={`t-eyebrow botao-tamanho grid h-12 min-w-[3.25rem] place-items-center rounded-[var(--r-acao)] px-3.5 text-[0.6875rem] ${
                escolhido
                  ? "bg-areia/55 text-carvao"
                  : t.disponivel
                    ? "bg-transparent text-carvao-medio hover:text-carvao"
                    : "cursor-not-allowed text-carvao-fraco line-through"
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
