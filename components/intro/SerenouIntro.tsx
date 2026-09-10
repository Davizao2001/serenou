"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { introAtiva } from "@/lib/intro";
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

    /* Quem já viu a intro nesta sessão não precisa da cortina no documento.
       O CSS já a esconde, mas um `display:none` ainda é um nó com um botão
       dentro — some com ele, como a própria saída da intro faz ao terminar. */
    if (!introAtiva()) {
      el.remove();
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
