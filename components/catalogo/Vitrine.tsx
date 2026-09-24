import { FiltroCategorias } from "./FiltroCategorias";
import { ProductGrid } from "./ProductGrid";
import { GRADE_DENSA, type Produto } from "@/lib/catalogo";
import { linkWhatsApp } from "@/lib/loja";
import type { SecoesDaLoja } from "@/sanity/lib/produtos";

/**
 * VITRINE
 *
 * Já não precisa de estado. O filtro vinha do React e a URL era reescrita
 * por fora; agora a seleção é a URL, o servidor filtra, e aqui só se desenha
 * o que chegou. Sem `use client`, sem JavaScript de filtro no navegador.
 *
 * TRÊS ESTADOS VAZIOS, NÃO DOIS
 *
 * Catálogo vazio é diferente de filtro sem resultado: sem essa distinção,
 * uma loja que ainda não cadastrou nada mandaria a pessoa "escolher outra
 * categoria" — e todas estão vazias.
 *
 * E falha de leitura é diferente das duas. O texto "as peças estão sendo
 * fotografadas" é verdade numa loja nova e MENTIRA durante uma queda do
 * Sanity — afirma um motivo que ninguém verificou, e manda embora quem
 * voltaria em cinco minutos. Por isso `falhou` chega até aqui.
 */
export function Vitrine({
  lista,
  totalCatalogo,
  filtro,
  titulo,
  secoes,
  falhou = false,
}: {
  /** Já filtrada pelo servidor. */
  lista: Produto[];
  /** Tamanho do catálogo inteiro — decide a densidade e o estado vazio. */
  totalCatalogo: number;
  filtro: string;
  /** O nome da seleção. A aba do navegador já dizia "Promoções" enquanto a
   *  página escrita dizia "Catálogo" — duas respostas para a mesma pergunta,
   *  e a errada era a que a cliente estava olhando. */
  titulo: string;
  /** O que tem peça, para o trilho do telefone. */
  secoes?: SecoesDaLoja;
  /** A leitura do catálogo falhou — vazio aqui não significa "não existe". */
  falhou?: boolean;
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
          {titulo}
        </h1>
        {/* `lista.length > 0`, e não só `temCatalogo`: numa seleção vazia o
            contador dizia "0 peças" ao lado do título, com o texto "nenhuma
            peça nesta seleção" logo abaixo. Dois jeitos de dizer a mesma
            falta, e o número é o pior dos dois. */}
        {temCatalogo && lista.length > 0 && (
          <p className="t-eyebrow text-[0.6875rem] text-carvao-fraco">
            {lista.length} {lista.length === 1 ? "peça" : "peças"}
          </p>
        )}
      </header>

      {/* O trilho é só do telefone, e o respiro em volta dele era o que fazia
          o cabeçalho do catálogo ocupar 96px contra os 56 do desktop — quase o
          dobro, justamente na tela que tem menos altura para gastar. */}
      {temCatalogo && (
        <div className="mt-3.5">
          <FiltroCategorias ativo={filtro} secoes={secoes} />
        </div>
      )}

      {/* No desktop o respiro entre o título e a grade é maior, porque ali
          não há trilho de categorias no meio — e sem esse espaço o título
          ficaria colado na primeira fileira de fotos. */}
      <div className="mt-3.5 lg:mt-14">
        {lista.length > 0 ? (
          <ProductGrid produtos={lista} denso={denso} />
        ) : (
          <p className="t-body max-w-[46ch] py-[8svh] text-carvao-medio">
            {falhou ? (
              <>
                Não conseguimos carregar as peças agora. Atualize a página em
                alguns segundos — ou{" "}
                <a href={linkWhatsApp()} className="underline underline-offset-4">
                  chame a gente no WhatsApp
                </a>
                , que mostramos tudo por lá.
              </>
            ) : temCatalogo ? (
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
