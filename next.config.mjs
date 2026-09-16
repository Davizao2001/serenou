/* ---------------------------------------------------------------------------
   CABEÇALHOS DE SEGURANÇA

   Quatro linhas, nenhuma esperteza, e cada uma fecha uma porta concreta.

   `X-Content-Type-Options: nosniff`
       impede o navegador de adivinhar o tipo de um arquivo pelo conteúdo.
       Sem ele, uma resposta servida com o tipo errado pode ser executada
       como script.

   `Referrer-Policy: strict-origin-when-cross-origin`
       ao sair do site — para o WhatsApp, o Instagram, o Maps — vai só o
       domínio, nunca o endereço completo da peça que a pessoa estava vendo.
       É o padrão dos navegadores atuais; declarar prende o comportamento.

   `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'`
       este é o que importa de verdade. Sem ele, qualquer domínio pode pôr
       `/admin` dentro de um iframe e desenhar uma tela por cima — a Grazi
       clica achando que está num lugar e está em outro, já autenticada no
       Studio. Os dois cabeçalhos dizem a mesma coisa para gerações
       diferentes de navegador.

   `Permissions-Policy`
       o site não usa câmera, microfone nem localização. Declarar isso custa
       uma linha e tira a pergunta da mesa.

   NÃO tem Content-Security-Policy completa. Seria o próximo passo, mas o
   Studio do Sanity carrega estilo e trabalhador em tempo de execução, e uma
   CSP escrita no escuro quebra o painel de quem cadastra roupa — o tipo de
   defeito que só aparece depois, e com a loja dependendo dele. Fica como
   trabalho com teste, não como linha copiada.

   HSTS não está aqui porque a Vercel já serve
   `strict-transport-security: max-age=63072000; includeSubDomains; preload`
   em todas as respostas. Repetir seria manter dois lugares para a mesma
   verdade.

   IMAGENS

   `formats` só afeta o otimizador do `next/image`, e o projeto não usa
   `next/image` em lugar nenhum: as fotografias saem em `<picture>` com URLs
   do CDN do Sanity, que negocia AVIF/WebP/JPEG por `auto=format`. A linha
   fica, com `remotePatterns` ao lado, para o dia em que alguém usar
   `next/image` com uma foto do Sanity — sem o padrão cadastrado, esse dia
   termina em "hostname not configured" no build.
--------------------------------------------------------------------------- */

const CABECALHOS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
    ],
  },

  async headers() {
    return [{ source: "/:caminho*", headers: CABECALHOS }];
  },
};

export default nextConfig;
