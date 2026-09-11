/* ---------------------------------------------------------------------------
   INTRO — estado compartilhado

   A decisão de tocar ou não a intro é tomada por um script inline no <head>,
   antes da primeira pintura: só assim a cortina já está na tela quando o
   navegador pinta pela primeira vez, sem um quadro de hero aparecendo antes.
   O React lê a mesma decisão depois do mount, então servidor e cliente
   renderizam a mesma coisa e não há hydration mismatch.

   Este módulo é só o canal entre a intro e a hero: a hero espera o sinal para
   rodar a sua entrada curta.
--------------------------------------------------------------------------- */

export const CHAVE_SESSAO = "serenou_intro_seen";
const ATRIBUTO = "data-intro";

/** A intro vai tocar nesta visita? Decidido antes da primeira pintura. */
export function introAtiva(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute(ATRIBUTO) === "ativa";
}

let ouvintes: Array<() => void> = [];
let concluida = false;

/** A hero se inscreve aqui para saber quando pode entrar. */
export function aoTerminarIntro(cb: () => void): () => void {
  if (concluida) {
    cb();
    return () => {};
  }
  ouvintes.push(cb);
  return () => {
    ouvintes = ouvintes.filter((o) => o !== cb);
  };
}

/** Idempotente de propósito: pular, terminar e o vigia podem chamar juntos. */
export function concluirIntro(): void {
  if (concluida) return;
  concluida = true;
  const pendentes = ouvintes;
  ouvintes = [];
  pendentes.forEach((cb) => cb());
}

export function marcarComoVista(): void {
  try {
    sessionStorage.setItem(CHAVE_SESSAO, "true");
  } catch {
    /* modo privado ou storage bloqueado — a intro só toca de novo, sem quebrar */
  }
}

/** Solta a rolagem, derruba a cortina e devolve o conteúdo à navegação.
 *  Precisa acontecer aqui e não na limpeza do componente: ele continua
 *  montado renderizando `null`, então a limpeza nunca rodaria. */
export function liberarPagina(): void {
  document.documentElement.removeAttribute(ATRIBUTO);
  document
    .querySelectorAll<HTMLElement>("[inert]")
    .forEach((el) => el.removeAttribute("inert"));
}

/* ---------------------------------------------------------------------------
   APAGAR SEM ARRANCAR

   A camada da intro e o botão "Pular" são renderizados pelo React. Chamar
   `.remove()` neles tira o nó do documento, mas o React continua achando que
   ele está lá — e na primeira navegação de cliente que desmonta a home o
   React tenta remover um filho que não existe mais. O erro é
   `NotFoundError: Failed to execute 'removeChild'`, ele recursa no
   reconciliador e derruba a aba inteira: a tela preta com "This page
   couldn't load".

   Então não se arranca. Apaga-se:

     display:none   sai do layout e da pintura, como a remoção fazia
     hidden         sai da árvore de acessibilidade
     inert          nada dentro recebe foco, clique ou leitor de tela

   O nó fica no documento, sem custo visual nem de navegação, e o React
   continua dono da própria árvore. `important` porque o GSAP deixa
   `visibility` e `opacity` inline na saída da cortina, e um `display` inline
   sem prioridade poderia ser sobrescrito por uma animação que ainda termine.
--------------------------------------------------------------------------- */
export function apagarNo(el: Element | null | undefined): void {
  if (!el || !(el instanceof HTMLElement)) return;
  el.style.setProperty("display", "none", "important");
  el.setAttribute("hidden", "");
  el.setAttribute("inert", "");
}
