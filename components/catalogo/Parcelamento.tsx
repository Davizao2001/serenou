import { parcelamento } from "@/lib/catalogo";

/**
 * PARCELAMENTO
 *
 * Casca fina: a frase inteira — inclusive o "ou" da página de produto e a
 * decisão de mostrar ou não o valor da parcela — vem de `parcelamento()`, em
 * lib/catalogo.ts. Aqui só se resolve o tamanho e a cor.
 *
 * Sempre mais discreto que o preço. Quem decide comprar decide pelo preço; a
 * parcela é a facilidade que vem depois, e quando ela compete em peso a
 * cliente guarda o número errado.
 */
export function Parcelamento({
  preco,
  variante = "cartao",
  className = "",
}: {
  /** Em centavos, como no resto do catálogo. */
  preco: number;
  variante?: "cartao" | "produto";
  className?: string;
}) {
  const texto = parcelamento(preco, variante);
  if (!texto) return null;

  return (
    <p
      className={`text-carvao-fraco ${
        variante === "produto" ? "text-[0.875rem]" : "text-[0.75rem]"
      } ${className}`}
    >
      {texto}
    </p>
  );
}
