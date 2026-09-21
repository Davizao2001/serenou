import { useCallback } from "react";
import { useToast } from "@sanity/ui/toast";
import {
  useDocumentOperation,
  type DocumentActionComponent,
  type DocumentActionsContext,
  type SanityDocument,
} from "sanity";

/* ---------------------------------------------------------------------------
   AS AÇÕES DA PEÇA

   Três acrescentadas e uma reordenação. Nenhuma funcionalidade nativa do
   Sanity foi quebrada — o que existe continua existindo, na ordem que faz a
   ação certa ficar debaixo do dedo e a perigosa exigir procura.

   VER NO SITE
     Resolve a pergunta que a Grazi faz toda vez que publica: "será que
     entrou?". Abre a página pública da peça em outra aba.

   COPIAR LINK
     O endereço que ela cola no Instagram ou manda para uma cliente. Copiar da
     barra do navegador exigia abrir a peça primeiro.

   TIRAR DO AR
     `status: oculto` e publica, em um gesto. É o caminho NORMAL de quando uma
     peça acaba, e antes eram quatro passos: abrir a aba certa, achar o rádio,
     marcar, publicar. Pede confirmação porque muda o que a cliente vê.

   COLOCAR NO AR
     O caminho de volta, que era mais difícil que o de ida: sair era um
     clique, voltar eram os mesmos quatro passos. A assimetria não tinha
     razão de ser — é a mesma ação invertida. Não pede confirmação porque
     pôr no ar é o estado normal da peça, e porque o erro se desfaz com o
     botão vizinho.

   SOBRE "EXCLUIR DEFINITIVAMENTE"

   A ação nativa de apagar continua existindo, renomeada e empurrada para o
   fim do menu. A Grazi entra como Administrator — no plano Free do Sanity não
   existe papel intermediário — então esconder o botão seria teatro: ela tem a
   permissão de qualquer jeito. O que dá para fazer é o que está feito aqui:
   deixar a ação segura mais fácil que a destrutiva, e nomear as duas de um
   jeito que a diferença seja óbvia antes do clique, não depois.

   Não mexo no comportamento interno de nenhuma ação nativa. Renomear rótulo e
   reordenar lista são as duas coisas que a API oferece de propósito e que
   sobrevivem a upgrade.
--------------------------------------------------------------------------- */

type Peca = SanityDocument & {
  nome?: string;
  slug?: { current?: string };
  status?: string;
};

/** O endereço público da peça, quando ela já tem endereço. */
function enderecoPublico(doc: Peca | null): string | null {
  const slug = doc?.slug?.current;
  if (!slug) return null;
  if (typeof window === "undefined") return null;
  return `${window.location.origin}/produto/${slug}`;
}

export const VerNoSite: DocumentActionComponent = ({ published, draft }) => {
  /* Só a versão PUBLICADA tem página. Um rascunho ainda não existe para a
     cliente, e mandar a Grazi para um 404 seria pior do que não oferecer. */
  const url = enderecoPublico(published as Peca | null);
  const aindaRascunho = !published && Boolean(draft);

  return {
    label: "Ver no site",
    icon: () => <span aria-hidden="true">↗</span>,
    disabled: !url,
    title: aindaRascunho
      ? "Publique a peça primeiro — o site ainda não tem essa página."
      : url
        ? undefined
        : "Esta peça ainda não tem endereço.",
    onHandle: () => {
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
  };
};

export const CopiarLink: DocumentActionComponent = ({ published }) => {
  const { push } = useToast();
  const url = enderecoPublico(published as Peca | null);

  const copiar = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      push({ status: "success", title: "Link copiado" });
    } catch {
      /* Navegador que recusa a área de transferência — acontece fora de
         HTTPS e em algumas configurações. Dizer o que houve é melhor do que
         um botão que parece ter funcionado. */
      push({
        status: "warning",
        title: "Não consegui copiar",
        description: "Copie da barra do navegador em Ver no site.",
      });
    }
  }, [url, push]);

  return {
    label: "Copiar link",
    disabled: !url,
    title: url ? undefined : "Publique a peça primeiro.",
    onHandle: copiar,
  };
};

export const TirarDoAr: DocumentActionComponent = (props) => {
  const { id, type, published, draft, onComplete } = props;
  const { patch, publish } = useDocumentOperation(id, type);
  const { push } = useToast();

  const doc = (draft ?? published) as Peca | null;
  const jaOculta = doc?.status === "oculto";

  return {
    label: "Tirar do ar",
    tone: "caution",
    disabled: !published || jaOculta,
    title: jaOculta
      ? "Esta peça já está fora do site."
      : !published
        ? "A peça ainda não está publicada."
        : undefined,
    /* Confirmação porque muda o que a cliente vê. O texto explica a
       consequência e diz que dá para voltar — é o que separa um aviso útil de
       um popup que todo mundo aprende a fechar sem ler. */
    dialog: {
      type: "confirm",
      tone: "caution",
      message:
        "A peça sai do catálogo e o link dela deixa de abrir. O cadastro e as fotos continuam guardados aqui, e você pode trazê-la de volta quando quiser, em No site.",
      confirmButtonText: "Tirar do ar",
      cancelButtonText: "Deixar como está",
      onConfirm: () => {
        patch.execute([{ set: { status: "oculto" } }]);
        publish.execute();
        push({ status: "success", title: "Peça fora do site" });
        onComplete();
      },
      onCancel: onComplete,
    },
  };
};

export const ColocarNoAr: DocumentActionComponent = (props) => {
  const { id, type, published, draft } = props;
  const { patch, publish } = useDocumentOperation(id, type);
  const { push } = useToast();

  const doc = (draft ?? published) as Peca | null;
  const oculta = doc?.status === "oculto";

  return {
    label: "Colocar no ar",
    /* Só aparece quando faz diferença. Numa peça que já está no site este
       botão não teria efeito nenhum, e botão sem efeito ensina a ignorar o
       menu. */
    disabled: !oculta,
    title: oculta ? undefined : "Esta peça já está no site.",
    onHandle: () => {
      patch.execute([{ set: { status: "disponivel" } }]);
      publish.execute();
      push({ status: "success", title: "Peça no site" });
      props.onComplete();
    },
  };
};

/* ---------------------------------------------------------------------------
   A ORDEM DO MENU

   `publish` fica onde está — é o gesto principal e o Sanity já o destaca.
   Depois vêm as quatro nossas, que são o dia a dia. "Tirar do ar" e "Colocar
   no ar" ficam lado a lado, e em qualquer peça só uma das duas está ativa —
   a outra diz por que não. As nativas de risco
   (`delete`, `unpublish`, `discardChanges`) vão para o fim, e `delete` ganha
   um nome que não se confunde com "tirar do ar".
--------------------------------------------------------------------------- */

const RISCO = new Set(["delete", "unpublish"]);

export function acoesDaPeca(
  prev: DocumentActionComponent[],
  contexto: DocumentActionsContext
): DocumentActionComponent[] {
  if (contexto.schemaType !== "produto") return prev;

  const nativas = prev.map((acao) => {
    if (acao.action !== "delete") return acao;

    /* Só o rótulo muda. O comportamento, o diálogo de confirmação e as
       permissões continuam sendo os do Sanity. */
    const renomeada: DocumentActionComponent = (props) => {
      const descricao = acao(props);
      if (!descricao) return null;
      /* `critical` é o tom que o Sanity reserva para o que não tem volta —
         vermelho, separado do resto do menu. É a diferença visível entre
         "Tirar do ar", que é reversível e fica em `caution`, e apagar. */
      return {
        ...descricao,
        label: "Excluir definitivamente",
        tone: "critical" as const,
      };
    };
    renomeada.action = acao.action;
    renomeada.displayName = "ExcluirDefinitivamente";
    return renomeada;
  });

  const seguras = nativas.filter((a) => !RISCO.has(a.action ?? ""));
  const perigosas = nativas.filter((a) => RISCO.has(a.action ?? ""));

  return [...seguras, VerNoSite, CopiarLink, TirarDoAr, ColocarNoAr, ...perigosas];
}
