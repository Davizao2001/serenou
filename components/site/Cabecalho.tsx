import { Header } from "./Header";
import { secoesComPecas } from "@/sanity/lib/produtos";

/**
 * CABEÇALHO
 *
 * O `Header` é do navegador — tem estado de menu, animação e gaveta, e por
 * isso é `use client`. Mas o que ele pode OFERECER depende do catálogo, que
 * só o servidor lê. Este componente é a junta entre os dois: busca as seções
 * que têm peça e entrega prontas.
 *
 * Fica aqui, e não em cada página, porque senão toda página precisaria saber
 * que o menu depende do catálogo — e uma página nova nasceria com os links
 * mortos de volta. O cabeçalho é um só; a pergunta que ele faz é dele.
 *
 * A consulta é de três contagens e vive no mesmo cache de 60s do resto do
 * site, então isto não é uma leitura de catálogo por página.
 */
export async function Cabecalho() {
  const secoes = await secoesComPecas();
  return <Header secoes={secoes} />;
}
