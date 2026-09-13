"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductImage } from "./ProductImage";
import { ordenarPorCor, mesmaCor } from "@/lib/media";
import { formatarPreco, type Produto } from "@/lib/catalogo";

type Props = {
  produto: Produto;
  /** Primeiras peças da vitrine — carregam sem esperar o scroll. */
  priority?: boolean;
};

/** Quantas bolinhas de cor cabem antes de virar poluição. O resto vira "+2". */
const CORES_VISIVEIS = 4;

/**
 * PRODUCT CARD
 *
 * Fotografia, nome, preço, cores. Nada mais.
 *
 * Sem caixa, sem sombra, sem borda: o cartão é a fotografia, e o que segura o
 * conjunto é o alinhamento da grade e o espaço em volta. Caixa com sombra é
 * vocabulário de marketplace — resolve a vida de quem tem mil produtos de mil
 * vendedores e precisa separar um do outro. Aqui as peças são da mesma marca e
 * foram fotografadas no mesmo lugar; separá-las com moldura seria inventar uma
 * divisão que não existe.
 *
 * TRÊS GESTOS, CADA UM RESPONDENDO A UMA PERGUNTA REAL
 *
 *   "é essa mesmo?"      a segunda fotografia entra no hover, sem clique
 *   "tem na minha cor?"  a bolinha troca a fotografia do cartão
 *   "ainda tem?"         o selo de indisponível fica sobre a foto
 *
 * A segunda fotografia só é montada depois do primeiro hover. Com quatro
 * peças na tela isso seria o dobro das imagens baixadas para um gesto que a
 * maioria não faz — e no telefone, onde hover não existe, seria desperdício
 * puro. Depois do primeiro hover ela fica montada, e a troca é instantânea.
 *
 * SOBRE O LINK
 * A área de clique cobre a fotografia, e o nome é um link de verdade. Assim
 * as bolinhas podem ser botões sem ficarem presas dentro de um link — botão
 * dentro de link é HTML inválido e, na prática, intratável no teclado.
 */
export function ProductCard({ produto, priority = false }: Props) {
  const indisponivel = produto.status === "indisponivel";

  const [cor, setCor] = useState<string | null>(null);
  const [sobre, setSobre] = useState(false);
  const [jaPassou, setJaPassou] = useState(false);

  const fotos = ordenarPorCor(produto.imagens, cor);
  const capa = fotos[0];
  const verso = fotos[1];

  /* Só vale oferecer troca por cor onde a loja marcou de que cor é a foto. */
  const trocaPorCor = produto.imagens.some((i) => i.cor);
  const cores = produto.cores;
  const visiveis = cores.slice(0, CORES_VISIVEIS);
  const restantes = cores.length - visiveis.length;

  /* O selo do cartão tem vocabulário próprio, separado do da página de
     produto: aqui ele é lido de relance, no meio de outras peças. */
  const selo = indisponivel
    ? "Indisponível"
    : produto.promocao
      ? "Promoção"
      : produto.novidade
        ? "Novidade"
        : null;

  function entrar() {
    setSobre(true);
    setJaPassou(true);
  }

  return (
    <article className="group">
      <div className="relative overflow-hidden bg-areia">
        <ProductImage slot={capa} priority={priority} esmaecida={indisponivel} />

        {verso && jaPassou && (
          <div
            aria-hidden="true"
            className={`absolute inset-0 transition-opacity duration-300 ease-out ${
              sobre ? "opacity-100" : "opacity-0"
            }`}
          >
            <ProductImage slot={verso} esmaecida={indisponivel} />
          </div>
        )}

        {selo && (
          <span
            className={`t-eyebrow absolute left-2.5 top-2.5 z-20 px-2 py-1 text-[0.5625rem] tracking-[0.16em] md:left-3 md:top-3 ${
              indisponivel
                ? "bg-carvao/85 text-linho-alto"
                : "bg-linho-alto/95 text-carvao"
            }`}
          >
            {selo}
          </span>
        )}

        {/* A camada de clique sobre a fotografia. `aria-hidden` e fora da
            ordem de tabulação porque o nome abaixo já é o link que o teclado
            e o leitor de tela usam — dois links para o mesmo lugar seriam
            duas paradas para a mesma coisa. */}
        <Link
          href={`/produto/${produto.slug}`}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 z-10 cursor-pointer"
          onMouseEnter={entrar}
          onMouseLeave={() => setSobre(false)}
        />
      </div>

      <div className="mt-3 md:mt-3.5">
        <h3 className="text-[0.875rem] leading-snug md:text-[0.9375rem]">
          <Link
            href={`/produto/${produto.slug}`}
            onMouseEnter={entrar}
            onMouseLeave={() => setSobre(false)}
            className="underline-offset-[0.3em] transition-colors duration-200 hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {produto.nome}
          </Link>
        </h3>

        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[0.8125rem] md:text-[0.875rem]">
          {produto.precoAnterior && (
            <span className="text-carvao-fraco line-through">
              {formatarPreco(produto.precoAnterior)}
            </span>
          )}
          <span className={indisponivel ? "text-carvao-fraco" : "text-carvao-medio"}>
            {formatarPreco(produto.preco)}
          </span>
        </p>

        {cores.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap items-center gap-1.5" aria-label="Cores">
            {visiveis.map((c) => {
              const ativa = mesmaCor(cor, c.nome);
              const clicavel =
                trocaPorCor && produto.imagens.some((i) => mesmaCor(i.cor, c.nome));
              const bolinha = (
                <span
                  aria-hidden="true"
                  className="block h-[0.9375rem] w-[0.9375rem] rounded-full ring-1 ring-carvao/15"
                  style={{
                    background: Array.isArray(c.amostra)
                      ? `linear-gradient(135deg, ${c.amostra[0]} 50%, ${c.amostra[1]} 50%)`
                      : c.amostra,
                  }}
                />
              );
              return (
                <li key={c.nome}>
                  {clicavel ? (
                    <button
                      type="button"
                      onClick={() => setCor(ativa ? null : c.nome)}
                      aria-pressed={ativa}
                      aria-label={c.nome}
                      className={`tap flex items-center justify-center rounded-full p-[3px] transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva ${
                        ativa ? "ring-1 ring-carvao" : "hover:ring-1 hover:ring-carvao/30"
                      }`}
                    >
                      {bolinha}
                    </button>
                  ) : (
                    /* Sem foto daquela cor a bolinha não vira botão: ela
                       continua sendo informação e não finge uma interação
                       que não existe. O nome vai junto para quem não
                       distingue a cor pela bolinha. */
                    <span className="flex items-center justify-center p-[3px]">
                      {bolinha}
                      <span className="sr-only">{c.nome}</span>
                    </span>
                  )}
                </li>
              );
            })}
            {restantes > 0 && (
              <li className="ml-0.5 text-[0.6875rem] text-carvao-fraco">
                +{restantes}
                <span className="sr-only">
                  {" "}
                  outras cores: {cores.slice(CORES_VISIVEIS).map((c) => c.nome).join(", ")}
                </span>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}
