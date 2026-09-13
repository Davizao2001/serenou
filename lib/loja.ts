/* ---------------------------------------------------------------------------
   LOJA — dados confirmados pela cliente

   Ponto único de verdade para tudo que a Grazi já confirmou: contato,
   endereço, CTA, categorias. Nenhum componente deve escrever um número de
   telefone, um endereço ou um rótulo de categoria à mão.

   Só entra aqui o que está CONFIRMADO. Em 13/09 a Grazi fechou horário de
   funcionamento, formas de entrega, parcelamento e a tabela de tamanhos —
   tudo isso entrou abaixo e já pode aparecer no site.

   Continuam EM ABERTO, e por isso continuam fora daqui: CEP e cidade da
   loja, política de troca, prazo e preço de frete, prazo do motoboy e
   condições de retirada. Não inventar nenhum deles.
--------------------------------------------------------------------------- */

/* ---- Marca ----------------------------------------------------------- */

export const MARCA = {
  /** Como a marca assina o rodapé. */
  nome: "Serenou Beach",
  assinatura: "Moda para acompanhar todos os seus momentos.",
};

/* ---- Contato --------------------------------------------------------- */

/** Número oficial, formato internacional só com dígitos (para o wa.me). */
export const WHATSAPP = "5511984487394";

/** Como o número é exibido para a cliente final. */
export const WHATSAPP_EXIBICAO = "(11) 98448-7394";

export const INSTAGRAM = {
  usuario: "@serenoubeach",
  url: "https://instagram.com/serenoubeach",
};

/* ---- Loja física ----------------------------------------------------- */

export const LOJA = {
  /* Confirmado. Cidade, CEP e horário ainda não foram fechados: não
     completar de cabeça. A ausência da cidade afeta só a precisão do pino
     nos mapas, não o texto.

     Duas formas do MESMO endereço, com as mesmas palavras:

     `linhas`  é o que a cliente lê, com o travessão que a Grazi escreveu,
               já quebrado onde quebra bem na tela.
     `busca`   é o que vai para o Google Maps e o Waze. Travessão em campo
               de busca atrapalha o geocoding, então ali ele vira vírgula.
               Isso nunca aparece na tela. */
  linhas: ["Rua Samuel Laurence, 177 —", "Parque Maria Fernandes"],
  busca: "Rua Samuel Laurence, 177, Parque Maria Fernandes",
};

/* ---- Horário --------------------------------------------------------

   Confirmado pela Grazi em 13/09. Terça a sexta e sábado, só.

   Domingo, segunda e feriado NÃO estão aqui, e não viram "Fechado" por
   dedução: a loja pode abrir em data especial, e um "Fechado" escrito no
   site manda a cliente embora num dia em que a porta estava aberta. O que
   não foi dito não é dito.
--------------------------------------------------------------------- */

export const HORARIO = [
  { dias: "Terça a sexta", horas: "11:00 às 19:00" },
  { dias: "Sábado", horas: "11:00 às 15:00" },
] as const;

/* ---- Entregas -------------------------------------------------------

   Confirmado em 13/09: as três formas existem. Prazo, preço, frete grátis,
   janela do motoboy e condições de retirada NÃO foram ditos — e são
   exatamente o que a cliente final pergunta no WhatsApp. Ficam com a Grazi.

   `curto` é para a faixa estreita da página de produto, onde a linha inteira
   não cabe. É abreviação do mesmo fato, nunca fato diferente.
--------------------------------------------------------------------- */

export const ENTREGAS = [
  "Sedex para todo o Brasil",
  "Motoboy para a cidade de São Paulo",
  "Retirada na loja física",
] as const;

export const ENTREGAS_CURTO = "Sedex · Motoboy SP · Retirada";

/* ---- Parcelamento ---------------------------------------------------

   Três vezes sem juros, confirmado em 13/09.

   É INFORMAÇÃO COMERCIAL, não checkout: o site não cobra, não divide e não
   processa nada. Ele só diz em quantas vezes a Grazi aceita, e a venda
   continua inteira no WhatsApp.

   O número mora aqui e em nenhum outro lugar. Se virar 2x ou 6x, muda esta
   linha e muda no catálogo, na página de produto e nos relacionados ao
   mesmo tempo. Quem formata é `parcelamento()`, em lib/catalogo.ts.
--------------------------------------------------------------------- */

export const PARCELAS = 3;

/* ---- Guia de medidas ------------------------------------------------

   Texto e tabela confirmados pela Grazi em 13/09, nas palavras dela.

   A tabela é EQUIVALÊNCIA DE TAMANHO, não medida do corpo: a Grazi mandou
   P = 36/38 e assim por diante, e não mandou busto, cintura nem quadril.
   Traduzir isso para centímetros seria inventar o número que decide se a
   peça serve — e o erro volta como devolução, não como bug.
--------------------------------------------------------------------- */

export const GUIA_MEDIDAS = {
  titulo: "Guia de medidas",
  texto:
    "Cada corpo veste de um jeito e cada peça também.\n\nUse as medidas abaixo como referência para encontrar o tamanho que mais combina com você. Se ainda ficar em dúvida, fale com a gente no WhatsApp e ajudamos na escolha.",
  chamada: "Ainda está em dúvida?",
  cta: "Falar no WhatsApp",
} as const;

export const TABELA_TAMANHOS = [
  { tamanho: "P", referencia: "36/38" },
  { tamanho: "M", referencia: "38/40" },
  { tamanho: "G", referencia: "42/44" },
  { tamanho: "GG", referencia: "44/46" },
  { tamanho: "G1", referencia: "46/48" },
] as const;

/**
 * A mensagem de quem abriu o guia e continuou em dúvida.
 *
 * Com o nome da peça quando o guia foi aberto de dentro de uma página de
 * produto; sem ele quando veio do menu, onde não existe peça nenhuma. A
 * Grazi recebe a pergunta já sabendo do que se trata.
 */
export function mensagemTamanho(nome?: string | null): string {
  return nome
    ? `Oi! Vim pelo site da Serenou e queria ajuda para escolher o tamanho da ${nome}.`
    : "Oi! Vim pelo site da Serenou e queria ajuda para escolher meu tamanho.";
}

/* ---- Rotas -----------------------------------------------------------

   Busca por endereço, não por coordenada: nenhum dos dois exige chave de
   API nem plano pago, e os dois abrem o app nativo quando ele existe.
--------------------------------------------------------------------- */

/** Google Maps a partir de um endereço em texto. */
export function googleMapsUrl(endereco: string = LOJA.busca): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
}

/** Waze a partir de um endereço em texto. `navigate=yes` já inicia a rota. */
export function wazeUrl(endereco: string = LOJA.busca): string {
  return `https://waze.com/ul?q=${encodeURIComponent(endereco)}&navigate=yes`;
}

/* ---- WhatsApp -------------------------------------------------------- */

/** Rótulo do CTA principal das páginas de produto. Confirmado. */
export const CTA_PRODUTO = "QUERO ESSA PEÇA";

/**
 * Monta o link do WhatsApp. Sem mensagem, abre a conversa limpa — usado no
 * header e no rodapé, onde não existe contexto de produto.
 */
export function linkWhatsApp(mensagem?: string): string {
  const base = `https://wa.me/${WHATSAPP}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

export type ContextoProduto = {
  nome: string;
  cor?: string;
  tamanho?: string;
  /** Já formatado em reais. */
  preco?: string;
  /** URL absoluta da peça. Fica de fora quando ainda não se sabe o domínio. */
  url?: string;
};

/**
 * A mensagem que a cliente final envia a partir de uma peça.
 *
 * A regra da Grazi: nunca mandar mensagem genérica quando existir dado do
 * produto. Cada linha só existe se o dado existir — nada de "Cor: " vazio nem
 * de marcador tipo [TAMANHO]. Se a pessoa não escolheu tamanho, a mensagem
 * simplesmente não fala de tamanho, e a Grazi pergunta.
 *
 * O formato é de leitura rápida no telefone: uma frase, um bloco de dados,
 * uma frase. Quem recebe bate o olho e já sabe qual peça é.
 */
export function mensagemProduto({
  nome,
  cor,
  tamanho,
  preco,
  url,
}: ContextoProduto): string {
  const dados = [
    cor ? `Cor: ${cor}` : null,
    tamanho ? `Tamanho: ${tamanho}` : null,
    preco ? `Valor: ${preco}` : null,
  ].filter(Boolean);

  const blocos = [
    `Oi! Vim pelo site da Serenou e gostei do ${nome}.`,
    dados.length ? dados.join("\n") : null,
    "Queria saber mais sobre essa peça.",
    url ? `Produto:\n${url}` : null,
  ].filter(Boolean);

  return blocos.join("\n\n");
}

/**
 * O CTA exige cor e tamanho antes de abrir o WhatsApp?
 *
 * Fica aqui, em um lugar só, porque é decisão de negócio e ainda não foi
 * fechada. Hoje é `false`: a conversa abre com o que a pessoa tiver
 * escolhido, e a Grazi completa o resto — obrigar a escolher antes de falar
 * é atrito num canal que existe justamente para conversar.
 *
 * Para passar a exigir, troque para `true`. Nada mais muda: o painel lê
 * daqui para decidir se o botão fica desativado e o que dizer no aviso.
 */
export const EXIGIR_ESCOLHA = false;

/* ---- Catálogo -------------------------------------------------------- */

/**
 * Status de visibilidade. `oculto` é o caminho normal quando uma peça acaba:
 * some do catálogo, continua no painel, cadastro e fotos preservados.
 *
 * O uso visual de `indisponivel` na vitrine ainda não foi decidido — o
 * status existe, a apresentação fica para depois da call.
 */
export type StatusProduto = "disponivel" | "indisponivel" | "oculto";

/**
 * Categorias iniciais. `Novidades` e `Promoções` NÃO estão aqui de
 * propósito: são coleções, não categorias — assim um vestido em promoção
 * continua sendo um vestido e aparece nos dois lugares. A forma final de
 * `Promoções` ainda vai ser validada na call.
 */
export const CATEGORIAS = [
  { slug: "vestidos", nome: "Vestidos" },
  /* Macaquinho não é vestido: tem perna, e quem procura vestido não quer ser
     mandada para um macaquinho. Fica ao lado dos vestidos porque é a mesma
     decisão de compra — peça única — mas com entrada própria. */
  { slug: "macaquinhos", nome: "Macaquinhos" },
  { slug: "conjuntos", nome: "Conjuntos" },
  { slug: "calcas", nome: "Calças" },
  { slug: "blusas", nome: "Blusas" },
  { slug: "moda-praia", nome: "Moda Praia" },
] as const;

/** Coleções — transversais às categorias, marcadas por flag no produto. */
export const COLECOES = [
  { slug: "novidades", nome: "Novidades" },
  { slug: "promocoes", nome: "Promoções" },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]["slug"];
export type Colecao = (typeof COLECOES)[number]["slug"];
