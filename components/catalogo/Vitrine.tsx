import { FiltroCategorias } from "./FiltroCategorias";
import { ProductGrid } from "./ProductGrid";
import { GRADE_DENSA, type Produto } from "@/lib/catalogo";
import { linkWhatsApp } from "@/lib/loja";

/**
 * VITRINE
 *
 * Já não precisa de estado. O filtro vinha do React e a URL era reescrita
 * por fora; agora a seleção é a URL, o servidor filtra, e aqui só se desenha
 * o que chegou. Sem `use client`, sem JavaScript de filtro no navegador.
 *
 * Catálogo vazio é diferente de filtro sem resultado. Sem essa distinção,
 * uma loja que ainda não cadastrou nada mandaria a pessoa "escolher outra
 * categoria" — e todas estão vazias.
 */
export function Vitrine({
  lista,
  totalCatalogo,
  filtro,
}: {
  /** Já filtrada pelo servidor. */
  lista: Produto[];
  /** Tamanho do catálogo inteiro — decide a densidade e o estado vazio. */
  totalCatalogo: number;
  filtro: string;
}) {
  const temCatalogo = totalCatalogo > 0;
  /* Densidade pelo tamanho do catálogo, não pelo do filtro: a largura da
     página não pode mudar a cada categoria clicada. */
  const denso = totalCatalogo >= GRADE_DENSA;

  return (
    <>
      {/* Abertura curta de propósito. Na home a tipografia grande é o
          conteúdo; aqui o conteúdo é a roupa, e o cabeçalho só precisa dizer
          onde a pessoa está antes de sair da frente. */}
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="t-display text-[1.375rem] tracking-[0.02em] md:text-[1.5rem]">
          Catálogo
        </h1>
        {temCatalogo && (
          <p className="t-eyebrow text-[0.6875rem] text-carvao-fraco">
            {lista.length} {lista.length === 1 ? "peça" : "peças"}
          </p>
        )}
      </header>

      {temCatalogo && (
        <div className="mt-6">
          <FiltroCategorias ativo={filtro} />
        </div>
      )}

      {/* No desktop o respiro entre o título e a grade é maior, porque ali
          não há trilho de categorias no meio — e sem esse espaço o título
          ficaria colado na primeira fileira de fotos. */}
      <div className="mt-9 lg:mt-14">
        {lista.length > 0 ? (
          <ProductGrid produtos={lista} denso={denso} />
        ) : (
          <p className="t-body max-w-[46ch] py-[8svh] text-carvao-medio">
            {temCatalogo ? (
              <>
                Nenhuma peça nesta seleção por enquanto. Escolha outra categoria
                ou{" "}
                <a href={linkWhatsApp()} className="underline underline-offset-4">
                  fale com a gente no WhatsApp
                </a>
                .
              </>
            ) : (
              <>
                As peças estão sendo fotografadas e entram aqui em breve.
                Enquanto isso,{" "}
                <a href={linkWhatsApp()} className="underline underline-offset-4">
                  chame a gente no WhatsApp
                </a>
                : mostramos o que tem na loja e reservamos pra você.
              </>
            )}
          </p>
        )}
      </div>
    </>
  );
}
