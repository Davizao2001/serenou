"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

/* A fronteira de cliente do painel.
 *
 * O Studio é uma aplicação React inteira e só roda no navegador. Manter a
 * importação de `sanity.config` deste lado da fronteira é o que impede o
 * pacote `sanity` de entrar no grafo de Server Components — onde ele arrasta
 * dependências que não têm build para React Server e quebram a compilação. */
export function Painel() {
  return <NextStudio config={config} />;
}
