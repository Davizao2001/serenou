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

  /* A seta é decoração, e é declarada como tal: quem lê por leitor de tela
     ouve "QUERO ESSA PEÇA", não "QUERO ESSA PEÇA seta para a direita". Ela
     anda 2px no hover — o suficiente para o botão responder ao mouse sem
     virar animação. */
  const seta = (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 fill-none stroke-current transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h15M13.5 6.5 19.5 12l-6 5.5" />
    </svg>
  );

  if (bloqueado) {
    return (
      <span
        aria-disabled="true"
        className="t-eyebrow flex h-[3.5rem] w-full cursor-not-allowed items-center justify-center gap-3 rounded-[var(--r-acao)] bg-carvao/25 px-6 text-[0.71875rem] text-linho-alto"
      >
        {CTA_PRODUTO}
        {seta}
      </span>
    );
  }

  return (
    <a
      href={linkWhatsApp(mensagem)}
      target="_blank"
      rel="noreferrer"
      /* O foco em oliva, por fora, com o mesmo afastamento de 3px do botão de
         tamanho. Sem isso o anel saía em `currentColor` — linho-alto sobre um
         botão carvão, invisível no papel em volta. */
      className="t-eyebrow group/cta flex h-[3.5rem] w-full items-center justify-center gap-3 rounded-[var(--r-acao)] bg-carvao px-6 text-[0.71875rem] text-linho-alto transition-colors duration-200 hover:bg-[#241f19] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-oliva"
    >
      {CTA_PRODUTO}
      {seta}
    </a>
  );
}
