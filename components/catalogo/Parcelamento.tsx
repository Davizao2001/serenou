import { parcelamento } from "@/lib/catalogo";

/**
 * PARCELAMENTO
 *
 * Uma linha, três lugares: vitrine, página de produto e relacionados. O texto
 * inteiro vem de `parcelamento()`, em lib/catalogo.ts — nenhum destes três
 * divide preço por conta própria.
 *
 * Sempre mais discreto que o preço, e é isso que a prop `variante` guarda:
 * na página de produto começa com "ou" e acompanha um preço maior; no cartão
 * é só a conta, porque ali cada linha disputa espaço com a fotografia da peça
 * de baixo. Nos dois casos a cor é `carvao-fraco` e o corpo é menor — quem
 * decide comprar decide pelo preço, não pela parcela.
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
  const texto = parcelamento(preco);
  if (!texto) return null;

  return (
    <p
      className={`text-carvao-fraco ${
        variante === "produto" ? "text-[0.8125rem]" : "text-[0.75rem]"
      } ${className}`}
    >
      {variante === "produto" ? `ou ${texto}` : texto}
    </p>
  );
}
