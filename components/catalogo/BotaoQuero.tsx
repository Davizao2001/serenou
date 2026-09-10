import { CTA_PRODUTO, linkWhatsApp, mensagemProduto } from "@/lib/loja";

type Props = {
  nome: string;
  cor?: string | null;
  tamanho?: string | null;
};

/**
 * CTA — QUERO ESSA PEÇA
 *
 * O único caminho de conversão do site. A mensagem sai contextualizada com o
 * que a cliente escolheu: sem cor e sem tamanho a frase se ajusta sozinha, em
 * vez de mandar campo vazio para a Grazi.
 *
 * Só aparece em peça disponível. Peça esgotada não recebe CTA: avisar sobre
 * reposição seria prometer uma função que não existe — quando uma peça acaba,
 * a regra confirmada é a Grazi ocultá-la pelo painel.
 */
export function BotaoQuero({ nome, cor, tamanho }: Props) {
  const mensagem = mensagemProduto({
    nome,
    cor: cor ?? undefined,
    tamanho: tamanho ?? undefined,
  });

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
