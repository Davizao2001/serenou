import { MARCA } from "@/lib/loja";

/**
 * CARD EDITORIAL
 *
 * O bloco que fecha a coluna da direita. Serve para dar peso visual ao pé da
 * ficha sem inventar informação — é voz de marca, não oferta.
 *
 * A FRASE JÁ EXISTE
 *
 * `MARCA.assinatura` é a assinatura que a Grazi escreveu e que já está no
 * rodapé do site: "Moda para acompanhar todos os seus momentos." Reaproveitar
 * é melhor do que redigir uma nova — a mesma frase em dois lugares soa como
 * marca; duas frases parecidas soam como texto de preenchimento.
 *
 * A COR
 *
 * A referência usa um rosa claro. A paleta da Serenou não tem rosa: tem
 * linho, areia e carvão. Criar um token de marca novo para um card só faria
 * desta página o único lugar do site onde esse rosa existe — é decisão de
 * identidade, e é da Grazi. Então o fundo é `areia`, que é exatamente o papel
 * de "fundo secundário suave" que o card pede e que o site já usa.
 */
export function CardEditorial({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex min-h-[12rem] flex-col overflow-hidden rounded-[var(--r-painel)] bg-areia px-7 py-8 ${className}`}
    >
      <p className="t-eyebrow text-[0.625rem] leading-[1.6] text-carvao-medio">
        Moda para
        <br />a vida real
      </p>

      <p className="mt-4 max-w-[20ch] text-[1.15rem] leading-[1.32] text-carvao">
        {MARCA.assinatura}
      </p>

      {/* Elemento gráfico simples: o mesmo traço fino dos divisores da página,
          em arco. Decoração declarada como decoração — sem texto, sem
          promessa, invisível para o leitor de tela.

          Mora numa faixa própria no pé do card, e não solto em absoluto: na
          primeira versão os círculos ficavam por trás do texto e a palavra
          "momentos." passava por cima de uma linha curva. Aqui o `mt-auto`
          empurra a faixa para baixo quando o card estica, e o `overflow`
          corta o que passar da borda. */}
      <div aria-hidden="true" className="pointer-events-none relative mt-auto h-16">
        <svg
          viewBox="0 0 120 120"
          className="absolute -bottom-8 -right-9 h-28 w-28 fill-none stroke-carvao/15"
          strokeWidth="1"
        >
          <circle cx="60" cy="60" r="46" />
          <circle cx="60" cy="60" r="30" />
        </svg>
      </div>
    </div>
  );
}
