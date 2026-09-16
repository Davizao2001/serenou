import type { MetadataRoute } from "next";
import { url } from "@/lib/site";

/* ---------------------------------------------------------------------------
   ROBOTS

   Duas linhas de conteúdo e nenhuma esperteza.

   `/admin` sai do índice. Ele já responde com `noindex` na própria página, e
   as duas defesas fazem coisas diferentes: a meta tag tira dos resultados,
   o `Disallow` evita a visita. Nenhuma das duas é segurança — o Studio é
   protegido por login do Sanity, não por robots.txt — as duas são higiene de
   índice.

   Tudo o mais é liberado de propósito. Um catálogo existe para ser
   encontrado, e não há área de cliente, carrinho nem busca interna gerando
   endereço infinito para o robô se perder.
--------------------------------------------------------------------------- */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: url("/sitemap.xml"),
  };
}
