import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

/* Cliente de LEITURA. Sem token: lê só o conteúdo publicado, que é
   justamente o que o site deve mostrar. Não existe cliente de escrita no
   projeto — quem escreve é o Studio, autenticado como a Grazi.

   Criado sob demanda, e não na importação do módulo, porque `createClient`
   recusa um projectId vazio. Enquanto o projeto do Sanity não existir,
   ninguém chama esta função: `sanity/lib/produtos.ts` só chega aqui depois
   de checar `CONFIGURADO`. Assim o build passa antes da conta ser criada. */
let instancia: SanityClient | null = null;

export function clienteSanity(): SanityClient {
  if (!instancia) {
    instancia = createClient({ projectId, dataset, apiVersion, useCdn: true });
  }
  return instancia;
}
