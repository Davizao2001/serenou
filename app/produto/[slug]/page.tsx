import type { Metadata } from "next";
import { PecaEmFoco } from "@/components/catalogo/PecaEmFoco";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { ASerenou } from "@/components/site/ASerenou";
import { LojaFisica } from "@/components/site/LojaFisica";
import { Fecho } from "@/components/site/Fecho";
import { ProductCard } from "@/components/catalogo/ProductCard";
import { buscarProduto, listarSlugs, relacionadas } from "@/sanity/lib/produtos";
import { largest } from "@/lib/media";
import { formatarPreco } from "@/lib/catalogo";
import { MARCA, CATEGORIAS } from "@/lib/loja";

type Props = { params: Promise<{ slug: string }> };

/* O Next exige um literal aqui: o valor da configuração de segmento é lido
   na compilação, antes de qualquer import rodar. 60 segundos é o mesmo
   REVALIDAR de sanity/env.ts — se mudar lá, mude aqui. */
export const revalidate = 60;

/* Peça cadastrada depois do build também precisa abrir: o Next gera a página
   na primeira visita e guarda. Se o slug não existir — ou apontar para uma
   peça oculta — `buscarProduto` devolve nada e cai no notFound. */
export const dynamicParams = true;

/**
 * Só as peças visíveis ganham rota.
 *
 * Era aqui o furo que a auditoria encontrou: a lista percorria o catálogo
 * inteiro, ocultas incluídas, e uma peça "retirada do ar" continuava com
 * página pública. Agora a própria consulta filtra `oculto`.
 */
export async function generateStaticParams() {
  const slugs = await listarSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** Rótulo humano da categoria, para a trilha. Cai no slug se um dia alguém
 *  cadastrar uma categoria que não esteja em CATEGORIAS. */
function nomeCategoria(slug: string): string {
  return CATEGORIAS.find((c) => c.slug === slug)?.nome ?? "Catálogo";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await buscarProduto(slug);
  if (!p) return { title: "Peça não encontrada" };

  /* A descrição precisa servir para o card do WhatsApp, que é por onde o
     link circula: nome, frase da peça e preço em uma linha. */
  const descricao = [p.resumo, formatarPreco(p.preco)].filter(Boolean).join(" · ");
  const capa = p.imagens[0] ? largest(p.imagens[0]) : undefined;

  return {
    /* O sufixo "| Serenou Beach" vem do template em app/layout.tsx. */
    title: p.nome,
    description: descricao,
    alternates: { canonical: `/produto/${p.slug}` },
    openGraph: {
      title: `${p.nome} | ${MARCA.nome}`,
      description: descricao,
      type: "website",
      locale: "pt_BR",
      images: capa ? [{ url: capa, alt: p.imagens[0].alt }] : undefined,
    },
  };
}

/**
 * PÁGINA DE PRODUTO
 *
 * Fotografia à esquerda, decisão à direita. No desktop a coluna de decisão
 * fica presa: a galeria rola e o preço, os seletores e o CTA continuam ao
 * alcance. No telefone a ordem é a da cabeça de quem compra — foto, nome,
 * preço, cor, tamanho, botão.
 *
 * Sem carrinho, sem checkout, sem estoque: a conversa continua no WhatsApp,
 * como a Grazi definiu.
 */
export default async function Produto({ params }: Props) {
  const { slug } = await params;
  const produto = await buscarProduto(slug);
  if (!produto) notFound();

  const tambemPodeGostar = await relacionadas(produto, 4);

  return (
    <>
      <Header />
      <main id="conteudo" className="bg-linho pb-[12svh] pt-[calc(var(--header-h)+5svh)]">
        {/* 1280px. Com três colunas a caixa precisa ser mais larga do que era
            com duas: em 1180 a fotografia cairia para 300px para a ficha
            caber. Largura de grade serve para alinhar peças lado a lado, e
            aqui é exatamente isso que acontece na linha de baixo. */}
        <div className="mx-auto max-w-[80rem] px-5 md:px-8 lg:px-12 xl:px-10">
          {/* TRILHA COMPLETA, NÃO SÓ "VOLTAR"
              Início > Categoria > Peça. Os três degraus são dado real — a
              categoria vem do Sanity e o rótulo de CATEGORIAS — e o do meio é
              o mais útil: quem chegou por link do WhatsApp costuma querer
              "mais blusas", não "o catálogo inteiro". No telefone só o degrau
              da categoria fica, porque três degraus e um nome longo quebram
              em duas linhas numa tela de 360. */}
          <nav aria-label="Trilha" className="mb-6 md:mb-8">
            <ol className="t-eyebrow flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.625rem] text-carvao-fraco">
              <li className="hidden sm:block">
                <Link
                  href="/"
                  className="tap inline-block py-1.5 transition-colors duration-200 hover:text-carvao"
                >
                  Início
                </Link>
              </li>
              <li aria-hidden="true" className="hidden sm:block text-carvao-fraco/50">
                /
              </li>
              <li>
                <Link
                  href={`/catalogo?c=${produto.categoria}`}
                  className="tap inline-block py-1.5 transition-colors duration-200 hover:text-carvao"
                >
                  {nomeCategoria(produto.categoria)}
                </Link>
              </li>
              <li aria-hidden="true" className="text-carvao-fraco/50">
                /
              </li>
              <li aria-current="page" className="text-carvao">
                {produto.nome}
              </li>
            </ol>
          </nav>

          <PecaEmFoco produto={produto} />

          {/* RELACIONADOS — MESMA CATEGORIA PRIMEIRO, SEM ALGORITMO
              Quatro vagas. A mesma categoria entra na frente, e o que sobrar
              é completado com o resto do catálogo, na ordem em que a loja
              cadastrou. Sem pontuação, sem histórico e sem sorteio: a mesma
              peça mostra sempre os mesmos vizinhos. A regra está em
              `escolherRelacionadas`, em lib/catalogo.ts.

              Antes a fileira só aceitava a mesma categoria, e com o acervo de
              hoje isso deixava a Bata de Poá com um cartão sozinho e três
              vãos. Cartões menores que os da vitrine — aqui eles são convite,
              não a grade principal. */}
          {tambemPodeGostar.length > 0 && (
            <section className="mt-16 border-t border-areia-forte pt-10 md:mt-20 md:pt-12">
              <h2 className="t-eyebrow mb-9 text-[0.75rem] text-carvao-fraco">
                Você também pode gostar
              </h2>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
                {tambemPodeGostar.map((p) => (
                  <li key={p.slug}>
                    <ProductCard produto={p} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <ASerenou />
      <LojaFisica />
      <Fecho />
    </>
  );
}
