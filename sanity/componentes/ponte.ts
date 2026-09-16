/* ---------------------------------------------------------------------------
   A PONTE ENTRE O PAINEL E AS REGRAS DO SITE

   O painel precisa mostrar duas coisas que o site já sabe fazer: como um preço
   se escreve e como a mensagem do WhatsApp se monta. A tentação é reescrever
   as duas aqui — são poucas linhas, e ninguém percebe a divergência até o dia
   em que a prévia do painel mostra uma mensagem que a cliente nunca recebeu.

   Então não se reescreve nada. Este arquivo existe para que a dependência
   fique VISÍVEL em um lugar só: se um dia alguém mudar a mensagem em
   lib/loja.ts, é aqui que se vê quem mais depende dela.

   Uma regra de montagem, dois lugares mostrando o resultado.
--------------------------------------------------------------------------- */

export { mensagemProduto, CATEGORIAS } from "@/lib/loja";

/* `formatarPreco` trabalha em centavos, como o resto do catálogo; o painel
   guarda reais, porque é o que a Grazi digita. A conversão fica explícita em
   quem chama, e o nome daqui avisa qual unidade a função espera. */
export { formatarPreco as formatarPrecoCentavos } from "@/lib/catalogo";
