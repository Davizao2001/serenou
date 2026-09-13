import type { Metadata } from "next";
import { PecaEmFoco } from "@/components/catalogo/PecaEmFoco";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { ASerenou } from "@/components/site/ASerenou";
import { LojaFisica } from "@/components/site/LojaFisica";
import { Fecho } from "@/components/site/Fecho";
import { ProductGrid } from "@/components/catalogo/ProductGrid";
import { buscarProduto, listarSlugs, relacionadas } from "@/sanity/lib/produtos";
import { largest } from "@/lib/media";
import { formatarPreco } from "@/lib/catalogo";
import { MARCA } from "@/lib/loja";

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

  const daMesmaCategoria = await relacionadas(produto);

  return (
    <>
      <Header />
      <main id="conteudo" className="bg-linho pb-[12svh] pt-[calc(var(--header-h)+5svh)]">
        {/* Container central de 1280px, mais estreito que a vitrine.
            112rem é largura de grade — serve para alinhar quatro peças lado a
            lado. Aqui existe uma peça, e ocupar a tela inteira só porque ela
            está lá deixa a fotografia maior que a janela e a leitura solta. */}
        <div className="mx-auto max-w-[80rem] px-5 md:px-8 lg:px-12">
          <nav aria-label="Trilha" className="mb-8 md:mb-12">
            <Link
              href={`/catalogo?c=${produto.categoria}`}
              className="t-eyebrow tap inline-block py-2 text-carvao-fraco transition-colors duration-200 hover:text-carvao"
            >
              ← Catálogo
            </Link>
          </nav>

          <PecaEmFoco produto={produto} />

          {daMesmaCategoria.length > 0 && (
            <section className="mt-[14svh] border-t border-areia-forte pt-12 md:pt-16">
              <h2 className="t-eyebrow mb-10 text-carvao-fraco">Da mesma categoria</h2>
              <ProductGrid produtos={daMesmaCategoria} prioritarias={0} />
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
