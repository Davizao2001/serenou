/* ---------------------------------------------------------------------------
   Tokens de movimento.

   Um único vocabulário para o site inteiro: mesma duração, mesma curva, mesmo
   deslocamento. É isso que faz o motion parecer uma linguagem e não uma
   coleção de efeitos.
--------------------------------------------------------------------------- */

export const DUR = {
  quick: 0.4,
  base: 0.7,
  slow: 1.1,
} as const;

export const EASE = {
  /** Entradas — desacelera no fim, como tecido assentando. */
  out: "power3.out",
  /** Saídas — mais curtas que as entradas. */
  in: "power2.in",
  /** Movimento contínuo preso ao scroll. */
  linear: "none",
} as const;

/** Deslocamento padrão de entrada, em px. Nunca acima disso. */
export const TRAVEL = {
  sm: 16,
  md: 28,
  lg: 44,
} as const;

export const STAGGER = {
  words: 0.045,
  lines: 0.085,
  blocks: 0.11,
} as const;

/** Breakpoints usados pelo gsap.matchMedia — espelham o Tailwind. */
export const MQ = {
  desktop: "(min-width: 1024px)",
  mobile: "(max-width: 1023px)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;
