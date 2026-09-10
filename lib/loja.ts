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
     nos mapas, não o texto. */
  endereco: "Rua Samuel Laurence, 177, Parque Maria Fernandes",
};

/* ---- Rotas -----------------------------------------------------------

   Busca por endereço, não por coordenada: nenhum dos dois exige chave de
   API nem plano pago, e os dois abrem o app nativo quando ele existe.
--------------------------------------------------------------------- */

/** Google Maps a partir de um endereço em texto. */
export function googleMapsUrl(endereco: string = LOJA.endereco): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
}

/** Waze a partir de um endereço em texto. `navigate=yes` já inicia a rota. */
export function wazeUrl(endereco: string = LOJA.endereco): string {
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
};

/**
 * A mensagem que a cliente final envia a partir de uma peça. A regra da
 * Grazi: nunca mandar mensagem genérica quando existir dado do produto.
 * Cor e tamanho entram só quando foram escolhidos — a frase se ajusta em vez
 * de mostrar campo vazio.
 */
export function mensagemProduto({ nome, cor, tamanho }: ContextoProduto): string {
  const detalhes = [
    cor ? `na cor ${cor}` : null,
    tamanho ? `tamanho ${tamanho}` : null,
  ].filter(Boolean);

  const complemento = detalhes.length ? `, ${detalhes.join(" e ")}` : "";

  return `Oi! Vim pelo site da Serenou e gostei do ${nome}${complemento}. Queria saber mais sobre essa peça.`;
}

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
