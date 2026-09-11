import { defineField, defineType } from "sanity";

/* ---------------------------------------------------------------------------
   PRODUTO — o único tipo de documento do painel

   Tudo aqui está em português e nomeado como a Grazi fala: "Peça", "Fotos",
   "Valor". Nenhum campo existe "porque dava" — cada um corresponde a uma
   decisão que ela precisa tomar ao cadastrar uma peça.

   O que deliberadamente NÃO está aqui:
   - estoque por tamanho (ela controla estoque fora do site);
   - destaque (ninguém lê esse campo no site);
   - SEO manual (o título e a descrição saem do nome e do resumo).
--------------------------------------------------------------------------- */

export const CATEGORIAS_SANITY = [
  { title: "Vestidos", value: "vestidos" },
  { title: "Conjuntos", value: "conjuntos" },
  { title: "Calças", value: "calcas" },
  { title: "Blusas", value: "blusas" },
  { title: "Moda Praia", value: "moda-praia" },
];

export const produto = defineType({
  name: "produto",
  title: "Peça",
  type: "document",

  groups: [
    { name: "principal", title: "A peça", default: true },
    { name: "fotos", title: "Fotos" },
    { name: "opcoes", title: "Cores e tamanhos" },
    { name: "vitrine", title: "Onde aparece" },
  ],

  fields: [
    defineField({
      name: "nome",
      title: "Nome da peça",
      type: "string",
      group: "principal",
      description: "Como a peça aparece no site e na mensagem do WhatsApp.",
      validation: (r) => r.required().error("A peça precisa de um nome."),
    }),

    defineField({
      name: "slug",
      title: "Endereço da página",
      type: "slug",
      group: "principal",
      description:
        "Gerado a partir do nome. É o final do link da peça. Depois de divulgado, evite mudar.",
      options: { source: "nome", maxLength: 80 },
      validation: (r) => r.required().error("Clique em Gerar para criar o endereço."),
    }),

    defineField({
      name: "preco",
      title: "Valor (R$)",
      type: "number",
      group: "principal",
      description: "Só o número. Exemplo: 189,90",
      validation: (r) =>
        r.required().min(0).error("Informe o valor da peça."),
    }),

    defineField({
      name: "precoAnterior",
      title: "Valor antes da promoção (R$)",
      type: "number",
      group: "principal",
      description:
        "Preencha só quando a peça estiver em promoção. Aparece riscado ao lado do valor.",
      hidden: ({ parent }) => !parent?.promocao,
      validation: (r) =>
        r.custom((valor, contexto) => {
          const pai = contexto.parent as { preco?: number } | undefined;
          if (valor == null) return true;
          if (pai?.preco != null && valor <= pai.preco)
            return "O valor de antes precisa ser maior que o valor atual.";
          return true;
        }),
    }),

    defineField({
      name: "categoria",
      title: "Categoria",
      type: "string",
      group: "principal",
      options: { list: CATEGORIAS_SANITY, layout: "radio" },
      validation: (r) => r.required().error("Escolha uma categoria."),
    }),

    defineField({
      name: "resumo",
      title: "Frase da peça",
      type: "string",
      group: "principal",
      description:
        "Uma frase curta, do jeito que você descreveria a peça. Exemplo: Do escritório ao jantar.",
      validation: (r) => r.max(90).warning("Frases curtas funcionam melhor na vitrine."),
    }),

    defineField({
      name: "detalhes",
      title: "Informações da peça",
      type: "array",
      group: "principal",
      description:
        "Uma informação por linha: tecido, modelagem, comprimento, o que vier junto.",
      of: [{ type: "string" }],
    }),

    defineField({
      name: "imagens",
      title: "Fotos",
      type: "array",
      group: "fotos",
      description:
        "A primeira foto é a que aparece na vitrine. Arraste para mudar a ordem.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Descrição da foto",
              type: "string",
              description:
                "Para quem usa leitor de tela e para o Google. Exemplo: Vestido longo verde oliva, com caimento fluido.",
            }),
          ],
        },
      ],
      validation: (r) => r.min(1).error("A peça precisa de pelo menos uma foto."),
    }),

    defineField({
      name: "cores",
      title: "Cores",
      type: "array",
      group: "opcoes",
      description:
        "Deixe vazio se a peça não tem opção de cor — o site simplesmente não mostra o seletor.",
      of: [
        {
          type: "object",
          name: "cor",
          fields: [
            defineField({
              name: "nome",
              title: "Nome da cor",
              type: "string",
              description: "É este nome que vai na mensagem do WhatsApp.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "amostra",
              title: "Cor",
              type: "color",
              options: { disableAlpha: true },
              description: "A bolinha que a cliente clica.",
            }),
          ],
          preview: {
            select: { title: "nome", cor: "amostra.hex" },
            prepare: ({ title, cor }) => ({ title, subtitle: cor }),
          },
        },
      ],
    }),

    defineField({
      name: "tamanhos",
      title: "Tamanhos",
      type: "array",
      group: "opcoes",
      description:
        "Escreva os tamanhos como você usa: P, M, G, 38, Único. Deixe vazio se a peça não tem tamanho.",
      of: [
        {
          type: "object",
          name: "tamanho",
          fields: [
            defineField({
              name: "rotulo",
              title: "Tamanho",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "disponivel",
              title: "Tem esse tamanho",
              type: "boolean",
              description:
                "Desmarque quando acabar. O tamanho continua visível, riscado, em vez de sumir.",
              initialValue: true,
            }),
          ],
          preview: {
            select: { title: "rotulo", disponivel: "disponivel" },
            prepare: ({ title, disponivel }) => ({
              title,
              subtitle: disponivel === false ? "Esgotado" : "Disponível",
            }),
          },
        },
      ],
    }),

    defineField({
      name: "status",
      title: "Situação",
      type: "string",
      group: "vitrine",
      initialValue: "disponivel",
      options: {
        layout: "radio",
        list: [
          { title: "Disponível — aparece normalmente", value: "disponivel" },
          { title: "Indisponível — aparece como esgotada", value: "indisponivel" },
          { title: "Oculta — sai do site", value: "oculto" },
        ],
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: "novidade",
      title: "É novidade",
      type: "boolean",
      group: "vitrine",
      description: "A peça aparece também em Novidades, sem sair da categoria dela.",
      initialValue: false,
    }),

    defineField({
      name: "promocao",
      title: "Está em promoção",
      type: "boolean",
      group: "vitrine",
      description: "A peça aparece também em Promoções, sem sair da categoria dela.",
      initialValue: false,
    }),

    defineField({
      name: "teste",
      title: "Peça de teste",
      type: "boolean",
      group: "vitrine",
      description:
        "Uso interno, durante o desenvolvimento. Antes de o site ir ao ar, todas as peças marcadas aqui são apagadas.",
      initialValue: false,
    }),
  ],

  orderings: [
    {
      name: "recentes",
      title: "Mais recentes primeiro",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
    { name: "nome", title: "Nome (A–Z)", by: [{ field: "nome", direction: "asc" }] },
  ],

  preview: {
    select: {
      title: "nome",
      categoria: "categoria",
      preco: "preco",
      status: "status",
      teste: "teste",
      media: "imagens.0",
    },
    prepare: ({ title, categoria, preco, status, teste, media }) => {
      const nomeCategoria =
        CATEGORIAS_SANITY.find((c) => c.value === categoria)?.title ?? "sem categoria";
      const valor =
        typeof preco === "number"
          ? preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "sem valor";
      const situacao =
        status === "oculto" ? " · oculta" : status === "indisponivel" ? " · esgotada" : "";
      return {
        title: teste ? `${title} (teste)` : title,
        subtitle: `${nomeCategoria} · ${valor}${situacao}`,
        media,
      };
    },
  },
});
