import { CTA_PRODUTO, linkWhatsApp, mensagemProduto } from "@/lib/loja";

type Props = {
  nome: string;
  cor?: string | null;
  tamanho?: string | null;
  /** Peça esgotada: o texto muda, o caminho continua sendo o WhatsApp. */
  esgotado?: boolean;
};

/**
 * CTA — QUERO ESSA PEÇA
 *
 * O único caminho de conversão do site. A mensagem sai contextualizada com o
 * que a cliente escolheu: sem cor e sem tamanho a frase se ajusta sozinha, em
 * vez de mandar campo vazio para a Grazi.
 *
 * Esgotado não vira botão morto — vira outra conversa. A peça existe, a
 * cliente quer, e quem responde do outro lado sabe se tem reposição.
 */
export function BotaoQuero({ nome, cor, tamanho, esgotado = false }: Props) {
  const mensagem = esgotado
    ? `Oi! Vim pelo site da Serenou e me interessei pelo ${nome}, que está marcado como esgotado. Vai ter reposição?`
    : mensagemProduto({ nome, cor: cor ?? undefined, tamanho: tamanho ?? undefined });

  return (
    <a
      href={linkWhatsApp(mensagem)}
      target="_blank"
      rel="noreferrer"
      className={`t-eyebrow block w-full px-8 py-5 text-center transition-colors duration-200 ${
        esgotado
          ? "bg-transparent text-carvao ring-1 ring-carvao/30 hover:ring-carvao"
          : "bg-carvao text-linho-alto hover:bg-[#241f19]"
      }`}
    >
      {esgotado ? "Avise-me pelo WhatsApp" : CTA_PRODUTO}
    </a>
  );
}
