/* ---------------------------------------------------------------------------
   LOJA — dados confirmados pela cliente

   Ponto único de verdade para tudo que a Grazi já confirmou: contato,
   endereço, CTA, categorias. Nenhum componente deve escrever um número de
   telefone, um endereço ou um rótulo de categoria à mão.

   Só entra aqui o que está CONFIRMADO. CEP, cidade, horário de funcionamento
   e formas de entrega ainda não foram fechados — não inventar.
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
