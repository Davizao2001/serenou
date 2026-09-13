import { LOJA, WHATSAPP_EXIBICAO, INSTAGRAM } from "@/lib/loja";

/**
 * MICROINFORMAÇÕES — A FAIXA ABAIXO DO CTA
 *
 * A referência tem quatro selos aqui: "Envio para todo o Brasil", "Até 6x sem
 * juros", "Compra 100% segura", "Primeira troca gratuita". Nenhum dos quatro
 * existe para a Serenou. Não são detalhes de texto: são promessa comercial, e
 * quem responde por elas no WhatsApp é a Grazi.
 *
 * O que entra aqui é só o que já está em lib/loja.ts, que é o registro do que
 * a cliente confirmou — atendimento por WhatsApp, endereço da loja física e
 * o Instagram. Três itens verdadeiros valem mais que quatro inventados, e
 * cada um é um caminho de verdade: o número atende, o endereço existe, o
 * perfil está no ar.
 *
 * EM LINHAS, NÃO EM COLUNAS
 *
 * A referência põe os quatro selos lado a lado. Aqui a coluna tem 340px: em
 * três colunas cada item fica com 107px, e "(11) 98448-7394" não cabe em
 * 107px — ele foi para reticências no primeiro teste. Um telefone truncado é
 * pior que telefone nenhum, porque parece que o site tem o dado e não quer
 * dar. Em linha, o rótulo fica à esquerda e o dado à direita, inteiro.
 *
 * A lista cresce sozinha. Quando a Grazi confirmar frete, parcelamento ou
 * política de troca, o item novo entra em ITENS e mais nada muda.
 */

type Item = {
  rotulo: string;
  detalhe: string;
  icone: React.ReactNode;
};

const traco = "h-4 w-4 shrink-0 fill-none stroke-current";

const ITENS: Item[] = [
  {
    rotulo: "Atendimento por WhatsApp",
    detalhe: WHATSAPP_EXIBICAO,
    icone: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={traco} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.5-4.6A7.5 7.5 0 1 1 20 11.5Z" />
      </svg>
    ),
  },
  {
    rotulo: "Loja física",
    /* O bairro. O endereço inteiro, com rua e número, está no rodapé e na
       seção da loja — aqui ele só precisa dizer que existe um lugar. */
    detalhe: LOJA.linhas[1],
    icone: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={traco} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s6.5-5.4 6.5-10.2a6.5 6.5 0 1 0-13 0C5.5 15.6 12 21 12 21Z" />
        <circle cx="12" cy="10.6" r="2.3" />
      </svg>
    ),
  },
  {
    rotulo: "No Instagram",
    detalhe: INSTAGRAM.usuario,
    icone: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={traco} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="4.5" />
        <circle cx="12" cy="12" r="3.4" />
        <path d="M16.9 7.2h.01" />
      </svg>
    ),
  },
];

export function Microinformacoes() {
  return (
    <ul className="border-t border-areia-forte">
      {ITENS.map((i) => (
        <li
          key={i.rotulo}
          className="flex items-center justify-between gap-4 border-b border-areia-forte/60 py-2.5 last:border-b-0"
        >
          <span className="flex items-center gap-2.5 text-carvao-fraco">
            {i.icone}
            <span className="text-[0.75rem] leading-tight text-carvao">{i.rotulo}</span>
          </span>
          <span className="text-[0.75rem] leading-tight text-carvao-fraco">
            {i.detalhe}
          </span>
        </li>
      ))}
    </ul>
  );
}
