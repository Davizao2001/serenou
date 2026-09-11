import { buildLegacyTheme } from "sanity";

/* ---------------------------------------------------------------------------
   O PAINEL COM A CARA DA SERENOU

   O Studio nasce com a paleta da Sanity: cinzas azulados, azul de acento,
   fundo quase preto. É a cara da ferramenta, não a da loja — e a Grazi passa
   tempo aqui, entre fotografia de roupa e nome de peça.

   As cores abaixo são as MESMAS de `app/globals.css`. Nenhuma foi inventada
   para o painel: linho, areia, carvão e oliva, os quatro tons em que o site
   inteiro é feito.

   A chave que mais muda a percepção é `--gray-base`. Todo cinza da interface
   é derivado dela — bordas, textos secundários, fundos de campo. Com um
   marrom quente no lugar do azul-acinzentado padrão, a interface inteira
   esquenta de uma vez, sem precisar de uma regra por componente.

   `--brand-primary` é oliva, o mesmo acento pontual do site. E o botão
   primário — o "Publicar" que a Grazi aperta no fim de cada cadastro — é
   carvão sólido, igual ao "QUERO ESSA PEÇA" da página de produto.
--------------------------------------------------------------------------- */

const LINHO = "#f2ece2";
const LINHO_ALTO = "#f8f4ed";
const CARVAO = "#16130f";
const OLIVA = "#565e38";

export const temaSerenou = buildLegacyTheme({
  /* Tipografia: as mesmas duas famílias do site, já carregadas pelo layout. */
  "--font-family-base":
    '"Instrument Sans Variable", "Instrument Sans", "Helvetica Neue", Arial, sans-serif',
  "--font-family-monospace":
    'ui-monospace, "SFMono-Regular", "Menlo", "Consolas", monospace',

  /* Os dois polos do esquema. Nem preto puro nem branco puro: o carvão da
     marca é quente, e o branco é o off-white do papel. */
  "--black": CARVAO,
  "--white": LINHO_ALTO,

  /* O cinza de base. Marrom quente — é daqui que sai toda borda e todo texto
     secundário do painel. */
  "--gray-base": "#5b5248",
  "--gray": "#8a8075",

  /* Acento. Oliva, como no site: pontual, nunca decorativo. */
  "--brand-primary": OLIVA,
  "--focus-color": OLIVA,

  /* Superfícies de trabalho — onde a lista de peças e o formulário moram. */
  "--component-bg": LINHO_ALTO,
  "--component-text-color": CARVAO,

  /* A barra do topo em carvão: dá ao painel a mesma âncora escura que o
     rodapé dá ao site, e separa "onde eu estou" de "onde eu trabalho". */
  "--main-navigation-color": CARVAO,
  "--main-navigation-color--inverted": LINHO,

  /* Botões. O primário é o gesto de publicar — carvão sólido, como o CTA. */
  "--default-button-color": "#6b6156",
  "--default-button-primary-color": CARVAO,
  "--default-button-success-color": OLIVA,
  "--default-button-warning-color": "#9a7b32",
  "--default-button-danger-color": "#8f3d2f",

  /* Estados. Tons terrosos, dentro da paleta — um vermelho de alarme
     genérico brigaria com tudo que está em volta. */
  "--state-info-color": OLIVA,
  "--state-success-color": OLIVA,
  "--state-warning-color": "#9a7b32",
  "--state-danger-color": "#8f3d2f",
});

export const CORES_PAINEL = { LINHO, LINHO_ALTO, CARVAO, OLIVA };
