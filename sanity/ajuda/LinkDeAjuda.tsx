import { useCallback } from "react";
import { useWorkspace } from "sanity";
import { useRouter } from "sanity/router";

/* ---------------------------------------------------------------------------
   O LINK PARA A AJUDA, DENTRO DO FORMULÁRIO

   Uma linha discreta ao lado de um campo, que abre o artigo daquele assunto.
   Dois lugares só, e escolhidos: a situação da peça e a organização das
   fotos. São os dois pontos onde a dúvida custa caro — escolher errado tira
   a peça do site, ou liga a foto à cor errada.

   Não vai em todo campo. A microajuda dentro do formulário continua sendo
   uma frase; o artigo é a fonte principal. Copiar o artigo para dentro do
   campo seria ter a mesma explicação em dois lugares, divergindo com o
   tempo.

   O ENDEREÇO

   `basePath` vem do workspace, então o link continua certo se o painel
   deixar de morar em /admin. O caminho do artigo é o mesmo que a rota da
   ferramenta declara em sanity.config.ts.
--------------------------------------------------------------------------- */

export function LinkDeAjuda({ artigo, texto }: { artigo: string; texto: string }) {
  const { basePath } = useWorkspace();
  const router = useRouter();

  const caminho = `${basePath}/ajuda/${artigo}`;

  const ir = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      /* Deixa passar o clique com Ctrl/Cmd e o do botão do meio: quem quer
         abrir em outra aba continua podendo. */
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      router.navigateUrl({ path: caminho });
    },
    [router, caminho]
  );

  return (
    <a
      href={caminho}
      onClick={ir}
      style={{
        display: "inline-block",
        marginTop: 6,
        fontSize: 12,
        opacity: 0.7,
        color: "inherit",
        textDecoration: "underline",
        textUnderlineOffset: 3,
        textDecorationThickness: 1,
      }}
    >
      {texto}
    </a>
  );
}
