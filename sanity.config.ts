import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { colorInput } from "@sanity/color-input";
import { ptBRLocale } from "@sanity/locale-pt-br";
import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { temaSerenou } from "./sanity/tema";
import { traducoesSerenou } from "./sanity/i18n";
import { MarcaSerenou } from "./sanity/MarcaSerenou";
import { Revisar } from "./sanity/componentes/Revisar";
import { acoesDaPeca } from "./sanity/componentes/acoes";

/* ---------------------------------------------------------------------------
   PAINEL DA SERENOU

   O Sanity Studio, montado dentro do próprio site em /admin. A Grazi entra
   pelo endereço da loja, não por um site de terceiros.

   Decisões de propósito:

   - `title` é "Painel da Serenou", não "Sanity". Ela não precisa saber o nome
     da ferramenta para usar a ferramenta.
   - Locale pt-BR: botões, mensagens de erro e datas em português.
   - Sem a ferramenta de consultas (Vision). É um console de GROQ; não tem uso
     para quem cadastra roupa e só serviria para assustar.
   - A estrutura tem três entradas, não uma árvore: as peças no ar, as ocultas
     e as de teste. Nada além disso, porque não há nada além disso.

   ---------------------------------------------------------------------------
   ESTE PAINEL É FEITO PARA O PLANO FREE, DEPOIS DO TRIAL

   O Sanity liga por padrão um punhado de recursos que pertencem ao Growth.
   Durante o período de avaliação eles funcionam; quando o trial acaba, eles
   ficam na tela e param de responder — a pessoa clica em "Agendar" e recebe
   um convite para pagar. É a pior forma de descobrir um limite de plano.

   Por isso cada um está desligado aqui, de forma explícita:

     scheduledPublishing / scheduledDrafts  agendamento de publicação
     tasks                                  tarefas e atribuições
     releases                               lançamentos de conteúdo
     mediaLibrary                           biblioteca de mídia compartilhada
     apps.canvas                            Sanity Canvas
     document.comments                      comentários em documento

   Nenhum deles faz falta: a operação é uma pessoa cadastrando roupa. E a
   Grazi nunca vê um botão que não funciona.

   Duas consequências do plano Free que moram FORA deste arquivo:

   1. O dataset precisa ser PÚBLICO. Dataset privado é recurso do Growth, e a
      leitura do site é feita sem token justamente por isso. Público aqui
      significa que qualquer um pode LER o conteúdo publicado pela API — o
      mesmo conteúdo que já está visível no site. Escrever continua exigindo
      login.
   2. Os papéis disponíveis são Administrator e Viewer. Editor é do Growth.
      A Grazi entra como Administrator.
--------------------------------------------------------------------------- */

export default defineConfig({
  name: "serenou",
  title: "Painel da Serenou",
  basePath: "/admin",

  /* A identidade da marca dentro da ferramenta: paleta, lettering e as
     frases que a Grazi lê. Ver `sanity/tema.ts`. */
  theme: temaSerenou,
  icon: MarcaSerenou,

  projectId,
  dataset,
  apiVersion,

  plugins: [
    structureTool({
      name: "pecas",
      title: "Peças",
      /* Três entradas, e cada uma responde a uma pergunta que a Grazi faz de
         verdade: "o que está no site?", "o que eu tirei do ar?", "o que é
         teste meu?".

         A primeira se chama Catálogo porque é a mesma palavra que ela lê no
         site — o menu do painel e o menu da loja falam a mesma língua. Ela
         mostra tudo que está publicado, incluindo o que está marcado como
         esgotado: peça esgotada continua no catálogo, é o que a cliente vê.

         Não existe mais uma entrada "Todas as peças" separada: junto com as
         outras duas, Catálogo já é tudo. Para achar uma peça específica sem
         saber onde ela está, a busca da barra do topo procura em todas. */
      structure: (S) =>
        S.list()
          .title("Serenou")
          .items([
            S.listItem()
              .title("Catálogo")
              .child(
                S.documentTypeList("produto")
                  .title("Catálogo")
                  .filter('_type == "produto" && status != "oculto" && teste != true')
                  .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
              ),
            S.listItem()
              .title("Peças ocultas")
              .child(
                S.documentTypeList("produto")
                  .title("Peças ocultas")
                  .filter('_type == "produto" && status == "oculto"')
                  .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
              ),
            S.divider(),
            S.listItem()
              .title("Peças de teste")
              .child(
                S.documentTypeList("produto")
                  .title("Peças de teste")
                  .filter('_type == "produto" && teste == true')
              ),
          ]),

      /* A QUINTA ETAPA DO CADASTRO É UMA VIEW, NÃO UMA ABA

         "Revisar" precisa ler o documento inteiro — foto, preço, cores,
         tamanhos, situação — e não edita nada. Uma aba de formulário
         (`group`) mostra CAMPOS; uma view mostra o DOCUMENTO, e recebe
         `document.displayed`: os valores atuais da tela, incluindo o que a
         Grazi acabou de digitar e ainda não publicou.

         É essa diferença que faz a revisão valer: consultando o dataset de
         novo, ela mudaria o preço, abriria Revisar e veria o preço velho. */
      defaultDocumentNode: (S, { schemaType }) =>
        schemaType === "produto"
          ? S.document().views([
              S.view.form().title("Editar"),
              S.view.component(Revisar).title("Revisar").id("revisar"),
            ])
          : S.document(),
    }),
    colorInput(),
    ptBRLocale(),
  ],

  /* Os pacotes entram depois do pt-BR: o último a declarar uma chave vence,
     e é assim que "documento" vira "peça". */
  i18n: { bundles: traducoesSerenou },

  schema: { types: schemaTypes },

  /* --- Recursos do Growth, desligados um a um -----------------------------

     Ligados, eles apareceriam no painel e deixariam de funcionar no dia em
     que o trial terminasse. Desligados, o painel de hoje é o painel de
     sempre. Se um dia a Serenou for para o Growth, é só reverter a linha do
     recurso que passar a fazer sentido.

     `tasks`, `releases` e `mediaLibrary` estão marcados como internos na
     tipagem do Sanity: são a única forma oferecida de desligá-los, e é por
     isso que aparecem aqui. Vale reconferir num upgrade de versão maior. */
  scheduledPublishing: { enabled: false },
  scheduledDrafts: { enabled: false },
  tasks: { enabled: false },
  releases: { enabled: false },
  mediaLibrary: { enabled: false },
  apps: { canvas: { enabled: false } },

  document: {
    comments: { enabled: false },

    /* Ver no site, Copiar link e Tirar do ar entram; as nativas de risco vão
       para o fim do menu e "Apagar" ganha um nome que não se confunde com
       "Tirar do ar". Nenhuma ação nativa é quebrada — ver sanity/componentes/
       acoes.tsx, inclusive o porquê de não adiantar esconder o apagar. */
    actions: acoesDaPeca,
  },
});
