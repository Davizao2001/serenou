/* ---------------------------------------------------------------------------
   NOME DA PEÇA → ENDEREÇO DA PÁGINA

   Uma função, um lugar. Ela estava dentro de `EnderecoDaPagina`, que era o
   componente do campo; ao mover o preenchimento para o nível do documento,
   duas cópias desta regra passariam a existir — e duas cópias divergem.
--------------------------------------------------------------------------- */

/** Sem acento, sem símbolo, sem espaço. */
export function endereco(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
