"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { apagarNo, introAtiva } from "@/lib/intro";
import { escolherFontes, introScene } from "@/lib/intro-cena";

/**
 * INTRO SERENOU
 *
 * A camada existe no HTML do servidor, mas só fica visível quando o script
 * inline do <head> marca `data-intro="ativa"` — decisão tomada antes da
 * primeira pintura, para que nenhum quadro da hero apareça antes da cortina.
 *
 * O componente é só marcação: quem monta a mídia e conduz a saída é a cena em
 * `lib/intro-cena.ts`, a mesma que a prévia hospedada usa. O <video> é criado
 * ali, depois do mount e só quando a intro vai mesmo tocar — quem já viu nesta
 * sessão não baixa o arquivo. Servidor e primeira renderização do cliente são
 * idênticos, então não há hydration mismatch.
 */
export function SerenouIntro() {
  const camada = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = camada.current;
    if (!el) return;

    /* Quem já viu a intro nesta sessão não precisa da cortina. O CSS já a
       esconde; aqui o botão "Pular" também sai do alcance do teclado e do
       leitor de tela. `apagarNo` e não `.remove()`: o nó é do React, e
       arrancá-lo quebra o desmonte da home. Ver lib/intro.ts. */
    if (!introAtiva()) {
      apagarNo(el);
      return;
    }

    return introScene(el, escolherFontes());
  }, {});

  return (
    <div ref={camada} data-intro-camada>
      <button type="button" data-intro-pular className="t-eyebrow">
        Pular
      </button>
    </div>
  );
}
