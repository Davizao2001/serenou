"use client";

import { useSyncExternalStore } from "react";
import { CTA_PRODUTO, linkWhatsApp, mensagemProduto } from "@/lib/loja";
import { formatarPreco } from "@/lib/catalogo";

type Props = {
  nome: string;
  slug: string;
  /** Em centavos, como no resto do catálogo. */
  preco: number;
  cor?: string | null;
  tamanho?: string | null;
  /** Quando true, o botão fica inerte e explica o que falta escolher. */
  bloqueado?: boolean;
};

/**
 * CTA — QUERO ESSA PEÇA
 *
 * O único caminho de conversão do site. A mensagem sai contextualizada: nome
 * da peça, o que a pessoa escolheu, preço e o link da página. Cada linha só
 * aparece se o dado existir, então a Grazi nunca recebe campo vazio.
 *
 * O domínio vem de `window.location.origin`, não de uma constante: enquanto o
 * domínio definitivo não for decidido, inventar um mandaria a cliente para
 * uma página que não existe. Lido do navegador, o link está certo no preview
 * e continua certo no domínio final, sem trocar código.
 *
 * No HTML do servidor o link sai sem a linha do produto, e o navegador a
 * acrescenta assim que sabe em que domínio está. Os dois primeiros renders
 * são iguais, que é o que evita erro de hidratação.
 */
export function BotaoQuero({ nome, slug, preco, cor, tamanho, bloqueado }: Props) {
  /* `useSyncExternalStore` em vez de um efeito: no servidor devolve null, no
     navegador devolve a origem real, e o primeiro render dos dois lados é
     igual — que é o que evita erro de hidratação. Sem estado, sem efeito,
     sem render em cascata. */
  const origem = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => null
  );

  const mensagem = mensagemProduto({
    nome,
    cor: cor ?? undefined,
    tamanho: tamanho ?? undefined,
    preco: formatarPreco(preco),
    url: origem ? `${origem}/produto/${slug}` : undefined,
  });

  if (bloqueado) {
    return (
      <span
        aria-disabled="true"
        className="t-eyebrow block w-full cursor-not-allowed bg-carvao/25 px-8 py-5 text-center text-linho-alto"
      >
        {CTA_PRODUTO}
      </span>
    );
  }

  return (
    <a
      href={linkWhatsApp(mensagem)}
      target="_blank"
      rel="noreferrer"
      className="t-eyebrow block w-full bg-carvao px-8 py-5 text-center text-linho-alto transition-colors duration-200 hover:bg-[#241f19]"
    >
      {CTA_PRODUTO}
    </a>
  );
}
