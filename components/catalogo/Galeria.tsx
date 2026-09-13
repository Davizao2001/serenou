"use client";

import { Frame } from "@/components/media/Frame";
import { SIZES_PRODUTO, SIZES_MINIATURA } from "@/sanity/lib/imagem";
import type { MediaSlot } from "@/lib/media";

/**
 * GALERIA DA PEÇA
 *
 * MINIATURAS À ESQUERDA, NÃO EMBAIXO
 *
 * No desktop as miniaturas ocupam uma faixa estreita colada à esquerda da
 * fotografia — posicionada em absoluto justamente para herdar a altura dela.
 * É o que faz as duas lerem como uma peça só: a faixa começa e termina onde a
 * foto começa e termina, sem caixa, sem moldura, sem barra.
 *
 * Herdar a altura também resolve o excesso sem inventar controle: se um dia
 * uma peça tiver mais fotos do que cabem ao lado da principal, a faixa rola
 * dentro do próprio limite, com a barra escondida. Nenhuma seta, nenhum
 * botão — e nenhuma fileira crescendo para fora do quadro.
 *
 * No telefone continua tudo como estava: uma fileira horizontal embaixo da
 * fotografia. Esta etapa é de desktop; a ordem no HTML é foto → miniaturas,
 * que é a ordem certa nos dois layouts e também para quem lê por leitor de
 * tela.
 *
 * A PROPORÇÃO É A DO ARQUIVO, NÃO UMA CONSTANTE
 *
 * O quadro vem de `width/height` da PRIMEIRA fotografia e vale para todas.
 * Duas razões: a peça não é esticada para caber num 3:4 decidido no código, e
 * o quadro não muda de formato quando a cliente troca de foto — o que faria a
 * página inteira pular a cada clique. A Bata de Poá tem um arquivo de
 * 1201×1600 no meio de dois 1200×1600; seguir cada arquivo faria o quadro
 * tremer meio pixel sem motivo.
 *
 * O CRUZAMENTO ENTRE UMA FOTO E OUTRA
 *
 * Todas as fotografias ficam empilhadas no mesmo quadro e só a ativa está
 * opaca. Trocar a cor é trocar qual delas aparece, com 280ms de dissolvência
 * — as duas na tela ao mesmo tempo, que é o que "crossfade" quer dizer.
 *
 * Antes havia um `key` que remontava o quadro a cada troca: a imagem sumia,
 * o fundo de areia aparecia, e a nova entrava quando terminasse de baixar. O
 * custo de empilhar é baixar as outras fotos antes de serem pedidas; só a
 * primeira é prioritária, e numa página de produto elas vão ser vistas de
 * qualquer forma.
 *
 * Sob `prefers-reduced-motion` a dissolvência vira corte seco sozinha — o
 * corte geral de app/globals.css zera a duração de toda transição.
 */
export function Galeria({
  fotos,
  ativa,
  aoEscolher,
  nome,
}: {
  fotos: MediaSlot[];
  ativa: number;
  aoEscolher: (indice: number) => void;
  nome: string;
}) {
  const principal = fotos[ativa] ?? fotos[0];
  if (!principal) return null;

  const razao = `${fotos[0].width} / ${fotos[0].height}`;

  return (
    <div className="relative">
      {/* A margem abre a faixa das miniaturas: 4,25rem de miniatura + 1,25rem
          de respiro. Só no desktop — no telefone a foto ocupa a largura toda. */}
      <div className="lg:ml-[5.5rem]">
        <div
          className="relative overflow-hidden bg-areia"
          style={{ aspectRatio: razao }}
        >
          {fotos.map((foto, i) => {
            const atual = i === ativa;
            return (
              <div
                key={foto.id}
                /* As inativas saem da árvore de acessibilidade: senão o leitor
                   de tela anuncia três fotografias onde a tela mostra uma. */
                aria-hidden={!atual}
                className={`absolute inset-0 transition-opacity duration-[280ms] ease-out ${
                  atual ? "opacity-100" : "opacity-0"
                }`}
              >
                <Frame
                  slot={{ ...foto, sizes: SIZES_PRODUTO }}
                  priority={i === 0}
                  className="h-full w-full"
                />
              </div>
            );
          })}
        </div>
      </div>

      {fotos.length > 1 && (
        <ul
          aria-label={`Fotos de ${nome}`}
          className="galeria-trilho mt-3 flex gap-2 overflow-x-auto lg:absolute lg:inset-y-0 lg:left-0 lg:mt-0 lg:w-[4.25rem] lg:flex-col lg:gap-3 lg:overflow-x-hidden lg:overflow-y-auto"
        >
          {fotos.map((foto, i) => {
            const atual = i === ativa;
            return (
              <li key={foto.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => aoEscolher(i)}
                  aria-label={`Ver foto ${i + 1} de ${fotos.length}${
                    foto.cor ? `, cor ${foto.cor.toLowerCase()}` : ""
                  }`}
                  aria-current={atual ? "true" : undefined}
                  /* Sem caixa e sem borda: a miniatura ativa se distingue por
                     estar cheia enquanto as outras estão esmaecidas. Um anel
                     em volta de três quadros de 68px viraria mais desenho que
                     fotografia. */
                  className={`tap block w-[4.5rem] transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva focus-visible:ring-offset-2 focus-visible:ring-offset-linho lg:w-full ${
                    atual ? "opacity-100" : "opacity-45 hover:opacity-80"
                  }`}
                >
                  <div
                    className="relative overflow-hidden bg-areia"
                    style={{ aspectRatio: razao }}
                  >
                    <Frame
                      slot={{ ...foto, sizes: SIZES_MINIATURA }}
                      className="h-full w-full"
                      decorative
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
