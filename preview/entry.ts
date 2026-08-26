/* Entrada da prévia hospedada.

   A prévia usa exatamente as mesmas cenas do projeto Next — este arquivo só
   as liga ao HTML estático e reimplementa o único comportamento que vinha do
   React: o botão do menu mobile. */

import { SCENES } from "../lib/scenes";
import { escolherFontes, introScene, type FontesIntro } from "../lib/intro-cena";

/* O script inline do <head> não sobrevive à geração da prévia, então a decisão
   de tocar a intro é refeita aqui — mesma regra do site. */
function decidirIntro() {
  try {
    const forcar = /[?&]intro=1(&|$)/.test(location.search);
    const visto = sessionStorage.getItem("serenou_intro_seen") === "true";
    if (forcar || !visto) {
      document.documentElement.setAttribute("data-intro", "ativa");
    }
  } catch {
    /* storage bloqueado — a intro simplesmente toca */
  }
}

declare global {
  interface Window {
    /* Injetado pelo build da prévia: os arquivos viram data URI porque a
       prévia é um arquivo único, sem servidor por trás. */
    __INTRO_FONTES__?: FontesIntro;
  }
}

function iniciar() {
  document.documentElement.classList.add("js-motion");
  decidirIntro();

  for (const [seletor, cena] of Object.entries(SCENES)) {
    document.querySelectorAll<HTMLElement>(seletor).forEach((el) => cena(el));
  }

  const cortina = document.querySelector<HTMLElement>("[data-intro-camada]");
  if (cortina && document.documentElement.getAttribute("data-intro") === "ativa") {
    introScene(cortina, window.__INTRO_FONTES__ ?? escolherFontes());
  }

  const botao = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const painel = document.querySelector<HTMLElement>("#menu-mobile");
  if (botao && painel) {
    const alternar = (aberto: boolean) => {
      painel.hidden = !aberto;
      botao.setAttribute("aria-expanded", String(aberto));
      botao.textContent = aberto ? "Fechar" : "Menu";
    };
    botao.addEventListener("click", () =>
      alternar(botao.getAttribute("aria-expanded") !== "true")
    );
    painel.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => alternar(false))
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar);
} else {
  iniciar();
}
