/* ---------------------------------------------------------------------------
   AS CORES QUE A SERENOU USA

   Atalho de cadastro, não dicionário. Cada entrada preenche nome e amostra de
   uma vez, para a Grazi parar de digitar "Azul-marinho" pela quadragésima
   quinta vez.

   OS NOMES NÃO SÃO NORMALIZADOS, E ISSO É A REGRA MAIS IMPORTANTE DAQUI

   Bordô e Vinho são duas cores. Azul e Azul-marinho são duas cores. Branco e
   Off-white são duas cores. A nomenclatura é comercial — é como a Grazi fala
   com a cliente no WhatsApp — e nenhum código deve "corrigir" isso por
   parecer parecido. Esta lista existe para poupar digitação, nunca para
   uniformizar vocabulário.

   Os valores em hexadecimal são os que já estão no catálogo, tirados das
   peças cadastradas em setembro. Onde a loja ainda não usou a cor, o tom é
   uma aproximação para a bolinha — e a Grazi pode ajustar no seletor, que é
   exatamente o que "Outra cor" e o editor de cada cor servem.
--------------------------------------------------------------------------- */

export type CorDaLoja = { nome: string; hex: string };

export const CORES_DA_LOJA: CorDaLoja[] = [
  { nome: "Preto", hex: "#1a1a1a" },
  { nome: "Branco", hex: "#f4f2ed" },
  { nome: "Off-white", hex: "#eee8dc" },
  { nome: "Nude", hex: "#d8ccb4" },
  { nome: "Champanhe", hex: "#cdc6b6" },
  { nome: "Marrom", hex: "#5d4038" },
  { nome: "Bordô", hex: "#6e1f35" },
  { nome: "Vinho", hex: "#4a1b24" },
  { nome: "Azul", hex: "#12a9b6" },
  { nome: "Azul-marinho", hex: "#1f2a4a" },
  { nome: "Rosa", hex: "#f2b9cd" },
  { nome: "Pink", hex: "#d4157a" },
  { nome: "Verde", hex: "#0f9463" },
  { nome: "Amarelo", hex: "#f2dd8f" },
];

/* ---------------------------------------------------------------------------
   OS TAMANHOS MAIS USADOS

   Mesma ideia: atalho para a grade que aparece na maioria das peças, e não
   uma restrição. O campo continua aceitando 38, 40, Único ou o que a peça
   pedir — o botão "Outro tamanho" do próprio Sanity continua ali, e a peça
   sem tamanho nenhum continua sendo o caso normal de biquíni e acessório.
--------------------------------------------------------------------------- */

export const TAMANHOS_COMUNS = ["P", "M", "G", "GG", "G1"] as const;

/** Forma como a cor é gravada — a mesma que o `@sanity/color-input` grava. */
export type ValorDeCor = { _type: "color"; hex: string };

export function valorDeCor(hex: string): ValorDeCor {
  return { _type: "color", hex };
}

/** Chave de item de array. O Sanity exige uma por item; não precisa ser bonita,
 *  precisa ser única dentro do documento. */
export function chave(): string {
  return Math.random().toString(36).slice(2, 12);
}
