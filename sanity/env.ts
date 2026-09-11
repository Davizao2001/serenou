/* ---------------------------------------------------------------------------
   SANITY — variáveis de ambiente

   Duas variáveis, e nenhuma é secreta:

   NEXT_PUBLIC_SANITY_PROJECT_ID   id do projeto (aparece na URL do sanity.io)
   NEXT_PUBLIC_SANITY_DATASET      "production"

   Não existe token no projeto, e isso é escolha, não esquecimento.

   Token de escrita não existe porque quem escreve é o Studio, autenticado
   como a Grazi — um token de escrita no servidor seria uma segunda chave da
   casa, guardada sem necessidade.

   Token de leitura não existe porque o dataset é público. Dataset privado é
   recurso do plano Growth; no Free a leitura é aberta, e ler o dataset devolve
   exatamente o que o site já mostra. Sem token, não há segredo para vazar em
   log, em variável de ambiente ou em bundle.

   As duas variáveis são públicas de propósito: o Studio roda no navegador da
   Grazi e precisa delas. Quem tem o id não consegue escrever nada — escrever
   exige login.

   Enquanto o projeto não existir, `CONFIGURADO` é falso e o site cai nos
   registros de desenvolvimento de `lib/catalogo.ts`. Assim o build passa
   antes da conta ser criada, e passa a ler do Sanity no instante em que as
   variáveis entrarem — sem mudar código.
--------------------------------------------------------------------------- */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/** Data da API. Fixa de propósito: o Sanity versiona por data e uma versão
 *  presa hoje continua respondendo igual daqui a um ano. */
export const apiVersion = "2026-09-01";

/** Há projeto configurado? */
export const CONFIGURADO = projectId.length > 0;

/** Quanto tempo o catálogo servido fica em cache antes de buscar de novo.
 *  Um minuto: a Grazi publica uma peça e ela aparece sem redeploy, sem que
 *  cada visita vire uma chamada de API.
 *
 *  As páginas repetem esse 60 como literal em `export const revalidate`,
 *  porque o Next lê a configuração de segmento na compilação e não aceita
 *  um valor importado. Mudou aqui, mude lá. */
export const REVALIDAR = 60;
