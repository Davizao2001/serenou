import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { Fecho } from "@/components/site/Fecho";
import { PainelProduto } from "@/components/catalogo/PainelProduto";
import { ProductImage } from "@/components/catalogo/ProductImage";
import { ProductGrid } from "@/components/catalogo/ProductGrid";
import { acharProduto, produtosVisiveis, PRODUTOS_EXEMPLO } from "@/lib/catalogo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUTOS_EXEMPLO.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = acharProduto(slug);
  return p
    ? { title: `${p.nome} | Serenou`, description: p.resumo }
    : { title: "Peça não encontrada | Serenou" };
}

/**
 * PÁGINA DE PRODUTO — esqueleto visual
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
  const produto = acharProduto(slug);
  if (!produto) notFound();

  const relacionadas = produtosVisiveis()
    .filter((p) => p.slug !== produto.slug && p.categoria === produto.categoria)
    .slice(0, 3);

  return (
    <>
      <Header />
      <main id="conteudo" className="bg-linho pb-[12svh] pt-[calc(var(--header-h)+5svh)]">
        <div className="mx-auto max-w-[112rem] px-5 md:px-8 lg:px-12">
          <nav aria-label="Trilha" className="mb-8 md:mb-12">
            <Link href="/catalogo" className="t-eyebrow tap inline-block py-2 text-carvao-fraco transition-colors duration-200 hover:text-carvao">
              ← Catálogo
            </Link>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[58fr_42fr] lg:gap-20">
            {/* Galeria */}
            <div className="flex flex-col gap-4 md:gap-6">
              {produto.imagens.map((img, i) => (
                <ProductImage key={img.id} slot={img} proporcao="3/4" priority={i === 0} />
              ))}
              {/* Uma foto só ainda: o padrão da galeria depende do padrão das
                  fotografias, que é ponto da call. O empilhamento já aceita
                  quantas vierem. */}
            </div>

            {/* Decisão */}
            <div className="lg:sticky lg:top-[calc(var(--header-h)+4svh)] lg:self-start">
              <PainelProduto produto={produto} />
            </div>
          </div>

          {relacionadas.length > 0 && (
            <section className="mt-[14svh] border-t border-areia-forte pt-12 md:pt-16">
              <h2 className="t-eyebrow mb-10 text-carvao-fraco">Da mesma categoria</h2>
              <ProductGrid produtos={relacionadas} prioritarias={0} />
            </section>
          )}
        </div>
      </main>
      <Fecho />
    </>
  );
}
