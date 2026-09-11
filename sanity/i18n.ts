import { defineLocaleResourceBundle } from "sanity";

/* ---------------------------------------------------------------------------
   O PAINEL FALA DE ROUPA, NÃO DE CMS

   A tradução oficial do Sanity para português está correta, mas é a
   tradução de uma ferramenta de conteúdo: "documento", "tipo de documento",
   "painel desconhecido". Para quem cadastra vestido, "documento" é uma
   palavra que não quer dizer nada.

   Aqui só trocamos as frases que a Grazi realmente encontra no uso normal —
   a lista vazia, a busca sem resultado, o carregamento, a peça apagada. O
   resto do painel continua com a tradução oficial, que é boa e é mantida
   por eles.

   Estes pacotes entram DEPOIS do pt-BR na lista de bundles; o último a
   declarar uma chave vence.
--------------------------------------------------------------------------- */

const estrutura = defineLocaleResourceBundle({
  locale: "pt-BR",
  namespace: "structure",
  resources: {
    "panes.document-list-pane.no-documents-of-type.text":
      "Nenhuma peça por aqui ainda.",
    "panes.document-list-pane.no-documents.text": "Nenhuma peça encontrada.",
    "panes.document-list-pane.no-matching-documents.text":
      "Nenhuma peça com esse nome.",
    "panes.document-list-pane.search-input.placeholder": "Buscar peça",
    "panes.document-list-pane.search-input.aria-label": "Buscar peça pelo nome",
    "panes.document-list-pane.error.title": "Não foi possível carregar as peças",
    "panes.document-list-pane.max-items.text":
      "Mostrando no máximo {{limit}} peças",
    "panes.document-pane.document-not-found.loading": "Carregando a peça…",
    "panes.document-pane.document-not-found.title": "Esta peça não existe mais",
    "panes.document-header-title.new.text": "Nova peça",
    "panes.document-header-title.untitled.text": "Peça sem nome",
    "document-view.form-view.loading": "Carregando a peça…",
    "banners.deleted-document-banner.text": "Esta peça foi excluída.",
  },
});

const estudio = defineLocaleResourceBundle({
  locale: "pt-BR",
  namespace: "studio",
  resources: {
    "navbar.action.open-search-label": "Buscar peça",
    "navbar.search.placeholder": "Buscar peça",
  },
});

export const traducoesSerenou = [estrutura, estudio];
