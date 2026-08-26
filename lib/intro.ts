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
