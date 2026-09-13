"use client";

import { ProductImage } from "./ProductImage";
import { SIZES_PRODUTO, SIZES_MINIATURA } from "@/sanity/lib/imagem";
import type { MediaSlot } from "@/lib/media";

/**
 * GALERIA DA PEÇA
 *
 * Uma fotografia grande e uma fileira de miniaturas. Antes as fotos eram
 * empilhadas em tamanho cheio, uma embaixo da outra, e isso custava caro nos
 * dois lados: no desktop a peça ficava mais alta que a janela, e no telefone
 * a cliente rolava quatro fotografias antes de chegar ao nome e ao preço.
 *
 * Com principal + miniaturas a página inteira cabe de uma vez, e continua
 * óbvio que existem outras fotos — que é justamente o que um carrossel com
 * seta esconde.
 *
 * As miniaturas só aparecem quando há mais de uma foto. Uma peça com uma
 * fotografia só não ganha uma fileira de um item.
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

  return (
    /* No tablet a coluna ainda é única, e sem teto a fotografia ia a 704px de
       largura e 939 de altura — mais alta que a janela, o mesmo problema que
       o desktop tinha. Teto de 33rem centralizado a partir de 768px; no
       telefone ela ocupa a largura toda, que ali é o certo. */
    <div className="mx-auto w-full max-w-[33rem] lg:mx-0">
      {/* `key` força a troca de fotografia a remontar o quadro: sem isso o
          navegador mantém a imagem antiga na tela enquanto a nova carrega, e
          a troca de cor parecia não ter acontecido. */}
      <ProductImage
        key={principal.id}
        slot={principal}
        proporcao="3/4"
        sizes={SIZES_PRODUTO}
        priority
      />

      {fotos.length > 1 && (
        <ul
          className="mt-3 flex gap-2 overflow-x-auto pb-1 md:mt-4 md:gap-3"
          aria-label={`Fotos de ${nome}`}
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
                  className={`tap block w-[4.5rem] transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva focus-visible:ring-offset-2 focus-visible:ring-offset-linho md:w-[5.25rem] ${
                    atual ? "opacity-100" : "opacity-55 hover:opacity-85"
                  }`}
                >
                  <ProductImage slot={foto} proporcao="3/4" sizes={SIZES_MINIATURA} />
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 block h-px w-full transition-colors duration-200 ${
                      atual ? "bg-carvao" : "bg-transparent"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
