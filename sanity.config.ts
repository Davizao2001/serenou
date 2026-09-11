import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { colorInput } from "@sanity/color-input";
import { ptBRLocale } from "@sanity/locale-pt-br";
import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./sanity/env";

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
--------------------------------------------------------------------------- */

export default defineConfig({
  name: "serenou",
  title: "Painel da Serenou",
  basePath: "/admin",

  projectId,
  dataset,
  apiVersion,

  plugins: [
    structureTool({
      name: "pecas",
      title: "Peças",
      structure: (S) =>
        S.list()
          .title("Serenou")
          .items([
            S.listItem()
              .title("Peças no site")
              .child(
                S.documentTypeList("produto")
                  .title("Peças no site")
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
            S.divider(),
            S.listItem()
              .title("Todas as peças")
              .child(
                S.documentTypeList("produto")
                  .title("Todas as peças")
                  .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
              ),
          ]),
    }),
    colorInput(),
    ptBRLocale(),
  ],

  schema: { types: schemaTypes },
});
