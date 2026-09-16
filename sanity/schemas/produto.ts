import { defineField, defineType } from "sanity";
import { CATEGORIAS } from "../../lib/loja";
import { CorDaFoto } from "../componentes/CorDaFoto";
import { MiniaturaFoto } from "../componentes/MiniaturaFoto";
import { CoresDaPeca } from "../componentes/CoresDaPeca";
import { TamanhosDaPeca } from "../componentes/TamanhosDaPeca";
import { EnderecoDaPagina } from "../componentes/EnderecoDaPagina";

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

  /* A ordem das abas é a ordem do cadastro: o que a peça é, como ela é
     fotografada, em que cores e tamanhos existe, e onde aparece. A quinta
     etapa — Revisar — não é aba de formulário: é uma view ao lado, porque
     precisa ler o documento inteiro e não editar nada. Ver sanity.config.ts. */
  groups: [
    { name: "principal", title: "A peça", default: true },
    { name: "fotos", title: "Fotos" },
    { name: "opcoes", title: "Cores e tamanhos" },
    { name: "vitrine", title: "Onde aparece" },
  ],

  /* O endereço da página é o único campo técnico que sobrou no formulário, e
     fica fechado. Ele se preenche sozinho a partir do nome (ver
     `EnderecoDaPagina`); quem precisar renomear de propósito abre a gaveta. */
  fieldsets: [
    {
      name: "avancado",
      title: "Configuração avançada",
      options: { collapsible: true, collapsed: true },
    },
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
      fieldset: "avancado",
      description:
        "É o final do link da peça, e se preenche sozinho pelo nome. Depois que o link já circulou no WhatsApp, mudar aqui transforma toda mensagem enviada em página não encontrada.",
      options: { source: "nome", maxLength: 80 },
      components: { input: EnderecoDaPagina },
      validation: (r) =>
        r.required().error("A peça precisa de um endereço. Escreva um nome e ele aparece sozinho."),
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
                "Escolha entre as cores cadastradas nesta peça, na aba Cores e tamanhos.",
              components: { input: CorDaFoto },
              /* A validação continua, e virou rede em vez de porteira: o
                 seletor já impede escolher uma cor que não existe, mas ela
                 pega o documento antigo cadastrado à mão e o caso de alguém
                 renomear uma cor deixando fotos com o nome velho. */
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

          /* O nome da cor vira o título da linha da foto — é a informação que
             faltava para saber, sem abrir, a que cor cada fotografia pertence.
             Sem cor, a linha diz "Foto geral", que é o estado normal de foto
             de detalhe, de costas ou de peça fotografada em duas cores. */
          preview: {
            select: { cor: "cor", alt: "alt", media: "asset" },
            prepare: ({ cor, alt, media }) => ({
              title: (cor as string) || "Foto geral",
              subtitle: (alt as string) || "Sem descrição",
              media,
            }),
          },

          /* O selo PRINCIPAL depende da POSIÇÃO, e `prepare` não recebe
             posição. Por isso ele mora num componente de item, que recebe
             `index` — ver `MiniaturaFoto`. */
          components: { item: MiniaturaFoto },
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
      components: { input: CoresDaPeca },
      validation: (r) =>
        r.custom((cores, contexto) => {
          const lista = (cores ?? []) as { nome?: string }[];
          const nomes = lista
            .map((c) => c?.nome?.trim().toLowerCase())
            .filter(Boolean) as string[];

          /* Duas cores com o mesmo nome desenham duas bolinhas iguais no site
             e deixam a troca de fotografia ambígua: o vínculo é por nome, e
             com o nome repetido não há como saber qual das duas a foto
             representa. O erro é do cadastro, mas quem descobre é a cliente
             clicando numa bolinha que não faz nada. */
          const repetido = nomes.find((n, i) => nomes.indexOf(n) !== i);
          if (repetido)
            return `A cor "${repetido}" está cadastrada duas vezes. Cada cor entra uma vez só.`;

          /* REMOVER UMA COR NÃO PODE DEIXAR FOTO ÓRFÃ

             A validação de `imagens[].cor` só roda quando aquele campo é
             editado. Removendo a cor aqui, as fotos marcadas com ela
             continuavam apontando para um nome que não existe mais, e ninguém
             avisava — a bolinha sumia do site e a foto ficava presa a nada.
             Agora o aviso vem no campo onde a remoção acontece, dizendo
             quantas fotos dependem daquela cor. */
          const doc = contexto.document as
            | { imagens?: { cor?: string }[] }
            | undefined;
          const usadas = (doc?.imagens ?? [])
            .map((i) => i?.cor)
            .filter(Boolean) as string[];

          const igual = (a: string) =>
            a.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const cadastradas = new Set(
            lista.map((c) => igual(c?.nome ?? "")).filter(Boolean)
          );

          const orfas = new Map<string, number>();
          for (const usada of usadas) {
            if (cadastradas.has(igual(usada))) continue;
            orfas.set(usada, (orfas.get(usada) ?? 0) + 1);
          }

          if (orfas.size > 0) {
            const partes = [...orfas.entries()].map(
              ([nome, n]) => `"${nome}" está em ${n} ${n === 1 ? "foto" : "fotos"}`
            );
            return `${partes.join(", ")}. Troque a cor dessas fotos na aba Fotos antes de remover a cor daqui.`;
          }

          return true;
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
        "Os cinco mais usados estão em botões. Para 38, Único ou outro, use Adicionar item. Peça sem tamanho é só deixar vazio.",
      components: { input: TamanhosDaPeca },
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
      description:
        "Onde a peça está hoje. Dá para mudar quantas vezes quiser — nada se perde.",
      /* Cada rótulo diz a consequência, não só o estado. "Indisponível" virou
         "Esgotada" porque é a palavra que a Grazi usa e é o que o selo do site
         escreve — o painel e a loja falando a mesma língua. */
      options: {
        layout: "radio",
        list: [
          {
            title: "Disponível — aparece no site e a cliente pode pedir",
            value: "disponivel",
          },
          {
            title: "Esgotada — aparece com selo, sem botão de pedido",
            value: "indisponivel",
          },
          {
            title: "Oculta — sai do site, e o cadastro fica guardado aqui",
            value: "oculto",
          },
        ],
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: "novidade",
      title: "É novidade",
      type: "boolean",
      group: "vitrine",
      description:
        "Aparece também em Novidades. Não troca a categoria: um vestido continua em Vestidos e aparece nos dois lugares.",
      initialValue: false,
    }),

    defineField({
      name: "promocao",
      title: "Está em promoção",
      type: "boolean",
      group: "vitrine",
      description:
        "Aparece também em Promoções, sem sair da categoria. Precisa do valor de antes, no campo que aparece abaixo.",
      initialValue: false,
    }),
    defineField({
      name: "precoAnterior",
      title: "Valor antes da promoção (R$)",
      type: "number",
      group: "vitrine",
      description:
        "Preencha só quando a peça estiver em promoção. Aparece riscado ao lado do valor.",
      hidden: ({ parent }) => !parent?.promocao,
      /* OS DOIS CAMPOS DA PROMOÇÃO PRECISAM CONCORDAR — NOS DOIS SENTIDOS

         Os dois campos ficavam em abas diferentes — a caixa aqui, o número
         em "A peça" — e eram independentes. Para pôr uma peça em promoção a
         Grazi marcava aqui, voltava para a primeira aba e preenchia o campo
         que só então aparecia. Agora estão colados, e `hidden` esconde do
         olho sem apagar o dado, o que produzia duas incoerências invisíveis:

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

  /* ---------------------------------------------------------------------
     A LINHA DA LISTA

     Reconhecer a peça sem abrir. Antes eram miniatura + nome + uma linha
     curta; agora as três faixas que a lista oferece carregam o que a Grazi
     precisa para decidir se é aquela peça mesmo:

       Conjunto Bless
       R$ 159,00 · Conjuntos
       Disponível · 3 cores · P M G

     Três faixas é o teto — o Sanity não renderiza uma quarta, e `prepare` só
     devolve TEXTO: título, subtítulo e descrição. Nada de badge colorido aqui,
     porque a structure não deixa customizar o render da linha nesta versão.
     Conferido na tipagem do pacote, não suposto. Então o estado vai por
     palavra, que também é o jeito que funciona para quem não distingue cor.

     A ordem da terceira faixa é deliberada: primeiro o que muda o que a
     cliente vê (situação, novidade, promoção), depois o que descreve a peça
     (cores, tamanhos).
  --------------------------------------------------------------------- */
  preview: {
    select: {
      title: "nome",
      categoria: "categoria",
      preco: "preco",
      status: "status",
      novidade: "novidade",
      promocao: "promocao",
      teste: "teste",
      cores: "cores",
      tamanhos: "tamanhos",
      media: "imagens.0",
    },
    prepare: ({
      title,
      categoria,
      preco,
      status,
      novidade,
      promocao,
      teste,
      cores,
      tamanhos,
      media,
    }) => {
      const nomeCategoria =
        CATEGORIAS_SANITY.find((c) => c.value === categoria)?.title ??
        "sem categoria";

      const valor =
        typeof preco === "number"
          ? preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "sem valor";

      /* O estado só aparece por extenso; "Disponível" é o caso comum e
         também é dito, porque a lista mistura os três e o silêncio
         obrigaria a deduzir. */
      const estado =
        status === "oculto"
          ? "Oculta"
          : status === "indisponivel"
            ? "Esgotada"
            : "Disponível";

      const listaCores = (cores ?? []) as { nome?: string }[];
      const listaTamanhos = (tamanhos ?? []) as { rotulo?: string }[];

      const quantasCores = listaCores.filter((c) => c?.nome).length;
      const rotulos = listaTamanhos
        .map((t) => t?.rotulo)
        .filter(Boolean) as string[];

      const faixa = [
        estado,
        novidade ? "Novidade" : null,
        promocao ? "Promoção" : null,
        quantasCores > 0
          ? `${quantasCores} ${quantasCores === 1 ? "cor" : "cores"}`
          : null,
        /* Cinco rótulos cabem; acima disso a linha estoura e vira ruído. */
        rotulos.length > 0
          ? rotulos.length <= 5
            ? rotulos.join(" ")
            : `${rotulos.length} tamanhos`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        title: teste ? `${title} (teste)` : title,
        subtitle: `${valor} · ${nomeCategoria}`,
        description: faixa,
        media,
      };
    },
  },
});
