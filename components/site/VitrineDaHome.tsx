import Link from "next/link";
import { ProductCard } from "@/components/catalogo/ProductCard";
import type { Produto } from "@/lib/catalogo";

/* ---------------------------------------------------------------------------
   A VITRINE DA HOME

   POR QUE ELA EXISTE

   A home tinha 8,3 telas de rolagem e ZERO links dentro do conteúdo —
   contados no DOM da página no ar. Dava para percorrer a página inteira sem
   ver uma peça, um preço ou um caminho para o catálogo; a única entrada era o
   menu do topo. É uma página de marca bonita que nunca mostrava mercadoria.

   Esta seção é a primeira porta. Entra logo depois da abertura, porque é ali
   que quem chegou ainda está decidindo se aquilo é uma loja.

   QUAL PEÇA APARECE

   Três regras, nesta ordem.

   1. NOVIDADE PRIMEIRO. O caminho óbvio seria a seção ser só de novidades —
      mas `novidade` é falso nas dezoito peças do dataset, conferido. Uma
      faixa "Novidades" nasceria vazia, e seção vazia numa home é pior que
      seção nenhuma. Então novidade é preferência, não requisito: no dia em
      que a Grazi marcar uma, ela passa à frente sozinha.

   2. UMA POR CATEGORIA. Esta regra nasceu de rodar a seleção com os dados
      reais: por data de cadastro as quatro primeiras eram três biquínis
      seguidos e um conjunto. Todas as dezoito foram importadas no mesmo dia,
      então "mais recente" hoje é a ordem do arquivo de importação, não a da
      loja — e a home abriria parecendo uma loja só de moda praia.

      Uma peça por categoria até fechar quatro. A vitrine passa a dizer o que
      a loja vende, que é o trabalho dela.

   3. ESGOTADA NÃO ENTRA. Ela continua no catálogo, com selo, porque quem
      procurou merece saber que existe — mas a vitrine da home é convite, e
      convidar para o que acabou é um começo ruim de visita.

   O CARTÃO É O MESMO DO CATÁLOGO

   `ProductCard`, sem variante de home. A fotografia, o nome, o preço, o
   parcelamento e as bolinhas que trocam a foto — tudo que o catálogo faz,
   feito aqui do mesmo jeito. Um segundo cartão só para esta seção seria uma
   segunda régua para manter.
--------------------------------------------------------------------------- */

/** Quatro: enche uma fileira no desktop e duas no telefone, sem sobra. */
const QUANTAS = 4;

export function escolherDaVitrine(lista: Produto[]): Produto[] {
  /* A lista já chega da mais recente para a mais antiga. Novidade na frente,
     e o resto mantém essa ordem. */
  const disponiveis = lista.filter((p) => p.status === "disponivel");
  const candidatas = [
    ...disponiveis.filter((p) => p.novidade),
    ...disponiveis.filter((p) => !p.novidade),
  ];

  const escolhidas: Produto[] = [];
  const categoriasUsadas = new Set<string>();

  for (const p of candidatas) {
    if (escolhidas.length === QUANTAS) break;
    if (categoriasUsadas.has(p.categoria)) continue;
    categoriasUsadas.add(p.categoria);
    escolhidas.push(p);
  }

  /* Catálogo com menos categorias que vagas — uma loja começando, ou um
     filtro futuro. Completa repetindo categoria em vez de deixar buraco. */
  if (escolhidas.length < QUANTAS) {
    for (const p of candidatas) {
      if (escolhidas.length === QUANTAS) break;
      if (escolhidas.includes(p)) continue;
      escolhidas.push(p);
    }
  }

  return escolhidas;
}

export function VitrineDaHome({ lista }: { lista: Produto[] }) {
  const pecas = escolherDaVitrine(lista);

  /* Catálogo vazio, ou leitura falhou: a seção não aparece. Uma vitrine com
     um buraco no lugar das fotos é pior do que a página sem vitrine. */
  if (pecas.length === 0) return null;

  return (
    <section
      aria-labelledby="vitrine-home-titulo"
      className="px-5 pb-[10svh] pt-[6svh] md:px-8 lg:px-12 lg:pb-[12svh] lg:pt-[8svh]"
    >
      <div className="mx-auto max-w-[112rem]">
        {/* O cabeçalho fala a língua da página: sobrancelha curta, título em
            display, e o caminho para o catálogo na mesma linha — do lado
            direito, onde o olho chega depois de ler o título. */}
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 md:mb-14">
          <div>
            <p className="t-eyebrow mb-4 text-carvao-fraco md:mb-6">No catálogo</p>
            {/* "Últimas peças" era mentira: a seleção deixou de ser
                cronológica quando passou a variar a categoria. Este título é
                verdadeiro com qualquer uma das três regras. */}
            <h2 id="vitrine-home-titulo" className="t-display t-chapter">
              O que tem na loja.
            </h2>
          </div>

          <Link
            href="/catalogo"
            className="tap t-eyebrow group inline-flex items-center gap-3 border-b border-carvao/25 pb-2 transition-colors duration-300 hover:border-carvao/70"
          >
            Ver o catálogo
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        {/* Quatro colunas a partir de `lg`, duas no telefone. A grade do
            catálogo muda de densidade conforme o tamanho do acervo; aqui o
            número é fixo porque a seção é fixa em quatro peças. */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 md:gap-y-14 lg:grid-cols-4 lg:gap-x-7">
          {pecas.map((p, i) => (
            <li key={p.slug}>
              {/* As duas primeiras carregam sem esperar o scroll: numa tela
                  de telefone elas já estão visíveis quando a seção entra. */}
              <ProductCard produto={p} priority={i < 2} nivel={3} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
