"use client";

import { useState } from "react";
import { Frame } from "@/components/media/Frame";
import { Modal } from "@/components/ui/Modal";
import { SIZES_PRODUTO, SIZES_MINIATURA, SIZES_AMPLIADA } from "@/sanity/lib/imagem";
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
 * No telefone a mesma faixa é horizontal, embaixo da fotografia. A ordem no
 * HTML é foto → miniaturas, que é a certa nos dois layouts e também para
 * quem lê por leitor de tela.
 *
 * A PROPORÇÃO É A DO ARQUIVO, NÃO UMA CONSTANTE
 *
 * O quadro vem de `width/height` da PRIMEIRA fotografia e vale para todas.
 * Duas razões: a peça não é esticada para caber num 3:4 decidido no código, e
 * o quadro não muda de formato quando a cliente troca de foto — o que faria a
 * página inteira pular a cada clique.
 *
 * O CRUZAMENTO ENTRE UMA FOTO E OUTRA
 *
 * Todas as fotografias ficam empilhadas no mesmo quadro e só a ativa está
 * opaca. Trocar a cor é trocar qual delas aparece, com 280ms de dissolvência
 * — as duas na tela ao mesmo tempo, que é o que "crossfade" quer dizer. A
 * lista NÃO se reordena: mover um nó no DOM cancela a transição em curso, e
 * a foto que saía pulava de 1 para 0 num quadro só, deixando o fundo de
 * areia aparecer. Quem reordena é só a escolha da foto ativa, em PecaEmFoco.
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
  const [ampliada, setAmpliada] = useState(false);

  const principal = fotos[ativa] ?? fotos[0];
  if (!principal) return null;

  const razao = `${fotos[0].width} / ${fotos[0].height}`;

  return (
    <div className="relative">
      {/* A margem abre a faixa das miniaturas: 3,75rem de miniatura + 0,875rem
          de respiro. Só no desktop — no telefone a foto ocupa a largura toda. */}
      <div className="lg:ml-[4.625rem]">
        <div
          className="group relative overflow-hidden bg-areia"
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

          {/* Ampliar. Discreto no desktop — aparece no hover e no foco — e
              sempre visível no telefone, onde hover não existe e um botão
              que só responde ao mouse é um botão que ninguém encontra. */}
          <button
            type="button"
            onClick={() => setAmpliada(true)}
            aria-label={`Ampliar a fotografia de ${nome}`}
            className="tap absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-linho-alto/90 text-carvao backdrop-blur-[2px] transition-opacity duration-200 hover:bg-linho-alto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 fill-none stroke-current"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 4h6v6M20 4l-7.5 7.5M10 20H4v-6M4 20l7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      {fotos.length > 1 && (
        <ul
          aria-label={`Fotos de ${nome}`}
          className="galeria-trilho mt-2.5 flex gap-2 overflow-x-auto lg:absolute lg:inset-y-0 lg:left-0 lg:mt-0 lg:w-[3.75rem] lg:flex-col lg:gap-2.5 lg:overflow-x-hidden lg:overflow-y-auto"
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
                  /* O estado ativo é dito duas vezes, e de propósito: a
                     esmaecida some do olhar periférico, o fio em volta marca
                     qual é. Só a opacidade era sutil demais entre duas fotos
                     da mesma peça no mesmo provador. */
                  className={`tap block w-[4rem] transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva focus-visible:ring-offset-2 focus-visible:ring-offset-linho lg:w-full ${
                    atual ? "opacity-100" : "opacity-40 hover:opacity-75"
                  }`}
                >
                  <div
                    className={`relative overflow-hidden bg-areia transition-[box-shadow] duration-200 ${
                      atual ? "ring-1 ring-carvao ring-offset-2 ring-offset-linho" : ""
                    }`}
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

      <Modal
        aberto={ampliada}
        aoFechar={() => setAmpliada(false)}
        titulo={`Fotografia ampliada — ${nome}`}
        className="modal-foto"
      >
        <div className="relative">
          {/* `width`/`height` nativos, e não só as classes: sem eles o
              navegador não sabe a proporção antes do arquivo chegar e a
              imagem entra com 0 de altura — no teste ela abriu com 27px,
              uma tarja. Com as dimensões declaradas o quadro já nasce certo
              e a foto preenche quando chega. */}
          <picture>
            <img
              src={principal.fontes?.fallback ?? undefined}
              srcSet={principal.fontes?.auto}
              sizes={SIZES_AMPLIADA}
              alt={principal.alt}
              width={principal.width}
              height={principal.height}
              className="block h-auto max-h-[88svh] w-auto max-w-full object-contain"
            />
          </picture>
          <button
            type="button"
            onClick={() => setAmpliada(false)}
            aria-label="Fechar a fotografia ampliada"
            className="tap absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-linho-alto/90 text-carvao transition-colors duration-200 hover:bg-linho-alto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 fill-none stroke-current"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>
      </Modal>
    </div>
  );
}
