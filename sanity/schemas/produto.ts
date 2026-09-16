import { defineField, defineType } from "sanity";
import { CATEGORIAS } from "../../lib/loja";

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

/* As categorias do painel saem da mesma lista que o menu do site usa. Eram
   duas listas paralelas, e duas listas paralelas divergem: bastava alguém
   acrescentar uma categoria em um lugar para o painel oferecer uma opção que
   o site não sabe filtrar. Agora acrescentar categoria é uma linha em
   `lib/loja.ts`, e painel e loja mudam juntos. */
export const CATEGORIAS_SANITY = CATEGORIAS.map((c) => ({
  title: c.nome,
  value: c.slug,
}));

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
      /* Cada regra com a sua mensagem, e não uma só no fim da corrente.
         `.error("Informe o valor")` aplicado à cadeia inteira respondia isso
         também para um preço negativo, que não explica nada.

         O teto e as duas casas decimais existem por um erro de digitação
         concreto: sem eles, `18990` no lugar de `189,90` publica um vestido
         de R$ 18.990,00 em silêncio — e esse número segue direto para a
         mensagem do WhatsApp. 9.999,99 está muito acima da peça mais cara da
         loja e muito abaixo de um dedo escorregando no teclado.

         `min(0.01)` e não `min(0)`: peça de graça não existe no catálogo, e
         um zero esquecido aparecia como "R$ 0,00" na vitrine. */
      validation: (r) => [
        r.required().error("Informe o valor da peça."),
        r.min(0.01).error("O valor precisa ser maior que zero."),
        r.max(9999.99).error("Valor acima de R$ 9.999,99 — confira se não faltou a vírgula."),
        r.precision(2).error("No máximo duas casas decimais. Exemplo: 189,90"),
      ],
    }),

    defineField({
      name: "precoAnterior",
      title: "Valor antes da promoção (R$)",
      type: "number",
      group: "principal",
      description:
        "Preencha só quando a peça estiver em promoção. Aparece riscado ao lado do valor.",
      hidden: ({ parent }) => !parent?.promocao,
      /* OS DOIS CAMPOS DA PROMOÇÃO PRECISAM CONCORDAR — NOS DOIS SENTIDOS

         `promocao` é uma caixa na aba "Onde aparece"; `precoAnterior` é um
         número na aba "A peça". Eram independentes, e `hidden` esconde do
         olho sem apagar o dado. Daí as duas incoerências que ninguém via:

           promoção marcada, valor vazio  → selo "Promoção" sem desconto
                                            nenhum na tela;
           promoção desmarcada depois     → o campo some, o valor continua
                                            gravado, e a peça saía de
                                            Promoções CONTINUANDO com o preço
                                            riscado.

         Agora cada estado cobra o outro. Nenhuma peça estava em promoção
         quando isto foi escrito, então nada no ar precisou ser corrigido — e
         é por isso que era o momento de fechar. */
      validation: (r) =>
        r.custom((valor, contexto) => {
          const pai = contexto.parent as
            | { preco?: number; promocao?: boolean }
            | undefined;

          if (pai?.promocao && valor == null)
            return "Peça em promoção precisa do valor de antes — é ele que aparece riscado.";

          if (!pai?.promocao && valor != null)
            return 'Só vale com "Está em promoção" marcado. Apague o valor ou marque a caixa em "Onde aparece".';

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
      title: "Descrição da peça",
      type: "text",
      rows: 3,
      group: "principal",
      description:
        "Uma ou duas frases, do jeito que você descreveria a peça para uma cliente. Aparece na página da peça, abaixo do nome.",
      /* Era "Frase da peça", limitada a 90 caracteres, porque a suposição era
         uma linha só. As descrições que a Grazi escreve têm uma ou duas frases
         e caem num parágrafo da página de produto, que é onde este campo
         aparece — nunca no card da vitrine. O limite antigo marcava como
         problema um texto que está certo. 240 ainda avisa quando vira texto
         longo demais para o espaço. */
      validation: (r) => r.max(240).warning("Acima de duas frases o texto começa a competir com a fotografia."),
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
              /* Aviso, nunca erro: uma foto sem descrição não pode impedir a
                 peça de ir ao ar. Mas o campo era opcional e silencioso, e
                 campo opcional e silencioso ninguém preenche 45 vezes — o
                 site cai num genérico ("Nome da peça, fotografia 3") e quem
                 usa leitor de tela ouve isso em vez da peça. Um aviso visível
                 no formulário custa nada e muda o hábito. */
              validation: (r) =>
                r.warning("Sem descrição, quem usa leitor de tela não sabe o que a foto mostra."),
            }),
            /* De que cor é esta foto.
               Quando preenchido, clicar na bolinha da cor no site troca a
               fotografia para esta. Em branco, a foto continua na galeria
               normalmente e não responde a cor nenhuma — é o que acontece
               com foto de detalhe, de costas ou de cor que a loja ainda não
               confirmou como disponível.
               A validação compara com as cores cadastradas na própria peça,
               porque um nome digitado diferente ("Azul marinho" x
               "Azul-marinho") quebraria a troca em silêncio. */
            defineField({
              name: "cor",
              title: "Cor desta foto",
              type: "string",
              description:
                "Escreva exatamente o nome de uma das cores da peça. Deixe em branco se a foto não é de uma cor específica.",
              validation: (r) =>
                r.custom((valor, contexto) => {
                  if (!valor) return true;
                  const doc = contexto.document as
                    | { cores?: { nome?: string }[] }
                    | undefined;
                  const cores = (doc?.cores ?? [])
                    .map((c) => c?.nome)
                    .filter(Boolean) as string[];
                  if (cores.length === 0)
                    return "Esta peça ainda não tem cores cadastradas na aba Opções.";
                  const igual = (a: string) =>
                    a.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                  return cores.some((c) => igual(c) === igual(valor))
                    ? true
                    : `Não existe a cor "${valor}" nesta peça. As cadastradas são: ${cores.join(", ")}.`;
                }),
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
      /* Duas cores com o mesmo nome desenham duas bolinhas iguais no site, e
         deixam a troca de fotografia ambígua: a validação de `imagens[].cor`
         compara por nome, e com o nome repetido ela não sabe qual das duas a
         foto representa. O erro é do cadastro, mas quem descobre é a cliente
         clicando numa bolinha que não faz nada. */
      validation: (r) =>
        r.custom((cores) => {
          const nomes = ((cores ?? []) as { nome?: string }[])
            .map((c) => c?.nome?.trim().toLowerCase())
            .filter(Boolean) as string[];
          const repetido = nomes.find((n, i) => nomes.indexOf(n) !== i);
          return repetido
            ? `A cor "${repetido}" está cadastrada duas vezes. Cada cor entra uma vez só.`
            : true;
        }),
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
              /* Sem amostra o site cai num bege padrão. Uma peça com duas
                 cores sem amostra vira duas bolinhas idênticas, e no cartão
                 da vitrine a bolinha é a única coisa que distingue "Oliva" de
                 "Preto". */
              validation: (r) => r.required().error("Escolha a cor da bolinha."),
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
      /* "M" duas vezes vira dois botões "M" na página da peça — e, se só um
         dos dois estiver marcado como esgotado, um riscado e o outro não,
         lado a lado. */
      validation: (r) =>
        r.custom((tamanhos) => {
          const rotulos = ((tamanhos ?? []) as { rotulo?: string }[])
            .map((t) => t?.rotulo?.trim().toLowerCase())
            .filter(Boolean) as string[];
          const repetido = rotulos.find((t, i) => rotulos.indexOf(t) !== i);
          return repetido
            ? `O tamanho "${repetido}" está cadastrado duas vezes.`
            : true;
        }),
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
