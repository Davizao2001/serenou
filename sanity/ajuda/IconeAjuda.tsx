/* O ícone da Ajuda na barra do painel. Desenhado à mão, com o mesmo peso de
   traço dos ícones do Sanity (1.2px em 25px), para a entrada não parecer
   colada de outro lugar. */
export function IconeAjuda() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 25 25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <circle cx="12.5" cy="12.5" r="8.5" />
      <path d="M10 10a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.6" strokeLinecap="round" />
      <circle cx="12.5" cy="17" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
