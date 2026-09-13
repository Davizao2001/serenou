"use client";

import { useEffect, useState } from "react";

const CHAVE = "serenou:favoritos";

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
 * desta página evita — por isso o texto é "Salvar nesta peça neste
 * navegador", e não "Adicionar aos favoritos".
 *
 * PRIMEIRO RENDER IGUAL NOS DOIS LADOS
 *
 * O servidor não tem `localStorage`. Se o primeiro render do navegador já
 * lesse o disco, o HTML das duas pontas seria diferente e a hidratação
 * quebraria. Então começa sempre vazio e o efeito corrige depois — uma
 * troca de estado que ninguém vê, em vez de um erro no console.
 *
 * `try/catch` em toda leitura e escrita: em aba anônima, com cookies de site
 * bloqueados ou com a cota cheia, o acesso simplesmente lança. Um coração
 * que não salva é um detalhe; uma página que não carrega por causa dele,
 * não.
 */
export function BotaoFavorito({ slug, nome }: { slug: string; nome: string }) {
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    try {
      const lista: string[] = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
      setSalvo(lista.includes(slug));
    } catch {
      /* Sem armazenamento, o coração vira enfeite inofensivo. */
    }
  }, [slug]);

  function alternar() {
    const proximo = !salvo;
    setSalvo(proximo);
    try {
      const lista: string[] = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
      const nova = proximo
        ? [...new Set([...lista, slug])]
        : lista.filter((s) => s !== slug);
      localStorage.setItem(CHAVE, JSON.stringify(nova));
    } catch {
      /* Estado visual mantido; só não atravessa a sessão. */
    }
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
