"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/* Registrado uma única vez por bundle de cliente, nunca dentro de um render. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

  /* QUANDO A FONTE CHEGA, AS MEDIDAS MUDAM

     Archivo e Instrument Sans são servidas com `font-display: swap`: o
     navegador pinta com a fonte de sistema e troca depois. O `load` da janela
     não espera por isso, então os gatilhos de rolagem — `top 82%`, `top 78%`,
     `top 72%` — são calculados com a métrica da fonte errada.

     A tipografia display tem `line-height: 0.86` e títulos de até 4,75rem. A
     troca move o conteúdo abaixo em algumas centenas de pixels, e os reveals
     marcados com `once: true` já dispararam nas posições velhas: a pessoa rola
     até "Conforto que acompanha a sua rotina." e encontra a seção já parada,
     sem nenhum sinal de chegada. Aparece em primeira visita com cache frio,
     que é exatamente a visita que importa.

     Um refresh depois de `fonts.ready` remede tudo. O `catch` existe porque
     a promessa rejeita em alguns navegadores quando uma fonte falha em
     carregar, e uma promessa rejeitada sem tratamento aparece como erro no
     console de quem só queria ver roupa.

     `document.fonts` não existe em navegador muito antigo; ali fica como
     estava, que é a degradação certa — o site continua inteiro, só sem o
     reajuste. */
  document.fonts?.ready
    .then(() => ScrollTrigger.refresh())
    .catch(() => {});
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
