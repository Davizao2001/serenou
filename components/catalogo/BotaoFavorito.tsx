"use client";

import { useSyncExternalStore } from "react";

const CHAVE = "serenou:favoritos";
/** Aviso interno: o `storage` do navegador só dispara em OUTRAS abas. */
const EVENTO = "serenou:favoritos-mudou";

/**
 * FAVORITO — UMA MARCA NESTE NAVEGADOR, E SÓ
 *
 * Sem conta, sem servidor, sem lista. O coração guarda o slug da peça no
 * `localStorage` e o lê de volta na próxima visita, no mesmo navegador.
 *
 * O QUE ISSO NÃO É, E O RÓTULO DIZ
 *
 * Não é "favoritos" no sentido que a palavra tem numa loja grande: não
 * sincroniza entre o telefone e o computador, não sobrevive a limpar o
 * histórico, e hoje não existe tela nenhuma que liste o que foi marcado.
 * Prometer mais do que isso no rótulo seria a mesma invenção que o resto
 * desta página evita — por isso o texto é "Salvar neste navegador", e não
 * "Adicionar aos favoritos".
 *
 * POR QUE `useSyncExternalStore` E NÃO `useState` + `useEffect`
 *
 * O servidor não tem `localStorage`. A versão anterior começava em `false` e
 * corrigia num efeito — o que funciona, mas dispara um segundo render em
 * cascata a cada montagem, e o lint do projeto reprova com razão.
 *
 * Este hook existe exatamente para isto: ler de uma fonte que vive fora do
 * React. `getServerSnapshot` devolve o que o servidor sabe (nada), a
 * hidratação bate, e o valor real entra sem render extra. De brinde, o
 * `subscribe` mantém duas abas em dia — marcar a peça numa e voltar para a
 * outra mostra o coração cheio.
 *
 * A leitura devolve a STRING crua do armazenamento, não um array. Um array
 * novo a cada chamada teria identidade nova a cada render e o React entraria
 * em laço infinito achando que a fonte mudou; a string é igual a si mesma
 * enquanto ninguém escrever.
 *
 * `try/catch` em toda leitura e escrita: em aba anônima, com cookies de site
 * bloqueados ou com a cota cheia, o acesso simplesmente lança. Um coração que
 * não salva é um detalhe; uma página que não carrega por causa dele, não.
 */
function assinar(mudou: () => void) {
  window.addEventListener("storage", mudou);
  window.addEventListener(EVENTO, mudou);
  return () => {
    window.removeEventListener("storage", mudou);
    window.removeEventListener(EVENTO, mudou);
  };
}

function lerBruto(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function lista(bruto: string | null): string[] {
  if (!bruto) return [];
  try {
    const v = JSON.parse(bruto);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function BotaoFavorito({ slug, nome }: { slug: string; nome: string }) {
  const bruto = useSyncExternalStore(assinar, lerBruto, () => null);
  const salvo = lista(bruto).includes(slug);

  function alternar() {
    const atual = lista(lerBruto());
    const nova = salvo ? atual.filter((s) => s !== slug) : [...new Set([...atual, slug])];
    try {
      localStorage.setItem(CHAVE, JSON.stringify(nova));
    } catch {
      /* Sem armazenamento o coração não guarda — e não quebra nada. */
    }
    /* Avisa esta aba: `storage` só fala com as outras. */
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={salvo}
      aria-label={
        salvo
          ? `Remover ${nome} das peças salvas neste navegador`
          : `Salvar ${nome} neste navegador`
      }
      title={salvo ? "Salva neste navegador" : "Salvar neste navegador"}
      className="tap grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center border border-carvao/20 transition-colors duration-200 hover:border-carvao/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva focus-visible:ring-offset-2 focus-visible:ring-offset-linho"
    >
      {/* Um desenho só, vazio ou cheio — dois ícones diferentes fariam o
          contorno saltar de espessura na troca. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`h-[1.125rem] w-[1.125rem] transition-colors duration-200 ${
          salvo ? "fill-carvao stroke-carvao" : "fill-none stroke-carvao/70"
        }`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20.5 4.2 12.8a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l1.3 1.3 1.3-1.3a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5Z" />
      </svg>
    </button>
  );
}
