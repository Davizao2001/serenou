"use client";

import { useMemo, useState } from "react";
import { FiltroCategorias } from "./FiltroCategorias";
import { ProductGrid } from "./ProductGrid";
import { produtosVisiveis, type Produto } from "@/lib/catalogo";
import { linkWhatsApp } from "@/lib/loja";

/**
 * VITRINE
 *
 * A parte da página que precisa de estado.
 *
 * O filtro vive em dois lugares ao mesmo tempo, de propósito: no estado, para
 * a troca ser instantânea e sem ida ao servidor; e na URL, para o menu poder
 * abrir o catálogo já filtrado e para a pessoa conseguir mandar o link de
 * "Promoções" para alguém. O servidor entrega o filtro inicial; daí em diante
 * quem manda é o clique, e a URL é reescrita sem recarregar.
 */
export function Vitrine({
  produtos,
  filtroInicial = "tudo",
}: {
  produtos: Produto[];
  filtroInicial?: string;
}) {
  const [filtro, setFiltro] = useState(filtroInicial);
  const [inicialAnterior, setInicialAnterior] = useState(filtroInicial);

  /* Quando a pessoa clica em "Promoções" no menu estando já no catálogo, a
     página não remonta: só chega uma prop nova. O ajuste acontece durante o
     render, não em um efeito — é o padrão do React para estado derivado de
     prop, e evita um segundo render com a lista errada na tela. */
  if (filtroInicial !== inicialAnterior) {
    setInicialAnterior(filtroInicial);
    setFiltro(filtroInicial);
  }

  /* Catálogo inteiro vazio é diferente de filtro sem resultado.
     Sem esta distinção, uma loja que ainda não cadastrou nenhuma peça
     manda a pessoa "escolher outra categoria" — e todas estão vazias.
     Quando não há nada, os filtros somem e a mensagem diz a verdade. */
  const temCatalogo = useMemo(
    () => produtosVisiveis(produtos).length > 0,
    [produtos]
  );

  const lista = useMemo(() => {
    const visiveis = produtosVisiveis(produtos);
    if (filtro === "tudo") return visiveis;
    if (filtro === "novidades") return visiveis.filter((p) => p.novidade);
    if (filtro === "promocoes") return visiveis.filter((p) => p.promocao);
    return visiveis.filter((p) => p.categoria === filtro);
  }, [produtos, filtro]);

  function trocar(slug: string) {
    setFiltro(slug);
    /* `replaceState` e não `push`: filtrar não é navegar. O botão voltar
       deve levar a pessoa de onde ela veio, não desfazer cliques de filtro. */
    const url = new URL(window.location.href);
    if (slug === "tudo") url.searchParams.delete("c");
    else url.searchParams.set("c", slug);
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      {temCatalogo ? (
        <FiltroCategorias ativo={filtro} aoTrocar={trocar} total={lista.length} />
      ) : null}
      <div className="mt-12 md:mt-16">
        {lista.length > 0 ? (
          <ProductGrid produtos={lista} />
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
