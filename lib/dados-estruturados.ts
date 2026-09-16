import { CATEGORIAS, HORARIO, INSTAGRAM, LOJA, MARCA, WHATSAPP_EXIBICAO } from "./loja";
import { url } from "./site";
import { largest } from "./media";
import type { Produto } from "./catalogo";

/* ---------------------------------------------------------------------------
   DADOS ESTRUTURADOS — O QUE O GOOGLE LÊ E A CLIENTE NÃO VÊ

   A regra desta página inteira: só afirmar o que a Grazi confirmou.

   Dado estruturado é declaração formal. Uma frase vaga numa página é uma
   frase vaga; um campo `availability: InStock` é uma AFIRMAÇÃO de que a peça
   está disponível, verificável, e cobrada. Rich result recusado não custa
   nada; preço ou disponibilidade errados custam confiança do domínio.

   POR ISSO NÃO ESTÃO AQUI, E NÃO É ESQUECIMENTO:

     sku, gtin, mpn      a loja não numera peça;
     review, rating      ninguém avaliou nada;
     shippingDetails     as três formas de entrega existem, mas prazo e preço
                         não foram ditos — é justamente o que a cliente
                         pergunta no WhatsApp;
     returnPolicy        política de troca ainda em aberto;
     priceValidUntil     não existe data de fim de preço;
     addressLocality     cidade e CEP da loja não foram confirmados. O
                         endereço entra como rua, que é o que se sabe.

   `availability` ENTRA porque é mapeamento honesto de um campo real: a Grazi
   marca "Disponível" ou "Indisponível" no painel, e é isso que o site
   declara. Peça oculta não chega aqui — não tem página.
--------------------------------------------------------------------------- */

type Json = Record<string, unknown>;

/** Nome que a loja usa para a categoria, para a trilha. */
function nomeCategoria(slug: string): string {
  return CATEGORIAS.find((c) => c.slug === slug)?.nome ?? "Catálogo";
}

/* O Schema.org quer os dias em inglês; a lista da Grazi está em português e
   agrupada ("Terça a sexta"). A tradução mora aqui, uma vez. Domingo, segunda
   e feriado continuam FORA — a loja pode abrir em data especial, e declarar
   fechado é mandar a cliente embora num dia em que a porta estava aberta. */
const DIAS: Record<string, string[]> = {
  "Terça a sexta": ["Tuesday", "Wednesday", "Thursday", "Friday"],
  Sábado: ["Saturday"],
};

function horarios(): Json[] {
  return HORARIO.flatMap(({ dias, horas }) => {
    const nomes = DIAS[dias];
    const [abre, fecha] = horas.split(" às ");
    if (!nomes || !abre || !fecha) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: nomes,
        opens: abre,
        closes: fecha,
      },
    ];
  });
}

/**
 * A LOJA
 *
 * `ClothingStore` e não `Organization`: a Serenou é uma loja física com
 * endereço e horário, e é isso que alimenta a busca local — "loja de roupa
 * perto de mim". Declarar as duas seria dizer a mesma coisa em dois lugares.
 */
export function lojaJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": url("/#loja"),
    name: MARCA.nome,
    description: MARCA.assinatura,
    url: url("/"),
    telephone: WHATSAPP_EXIBICAO,
    address: {
      "@type": "PostalAddress",
      streetAddress: LOJA.busca,
      addressCountry: "BR",
    },
    openingHoursSpecification: horarios(),
    sameAs: [INSTAGRAM.url],
  };
}

/**
 * A PEÇA
 *
 * Preço em reais, a partir dos centavos que o site carrega. `priceCurrency`
 * fixo em BRL — a loja não vende em outra moeda.
 *
 * O `offers.url` é a própria página: sem carrinho, a "oferta" acontece na
 * conversa, e apontar para outro lugar seria descrever uma loja que não é
 * esta.
 */
export function produtoJsonLd(p: Produto): Json {
  const oferta: Json = {
    "@type": "Offer",
    url: url(`/produto/${p.slug}`),
    price: (p.preco / 100).toFixed(2),
    priceCurrency: "BRL",
    availability:
      p.status === "indisponivel"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    seller: { "@id": url("/#loja") },
  };

  const dados: Json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nome,
    url: url(`/produto/${p.slug}`),
    /* `largest()` é o mesmo caminho que o `<img>` usa como `src`, então a
       fotografia que o Google busca é exatamente a que a cliente vê. Peça sem
       fotografia entregue devolve `undefined` e cai fora da lista. */
    image: p.imagens.map((i) => largest(i)).filter(Boolean),
    brand: { "@type": "Brand", name: MARCA.nome },
    offers: oferta,
  };

  /* Campos que só entram quando existem. Uma peça sem descrição não ganha
     `description: ""`, e uma peça sem cores não ganha lista vazia. */
  if (p.resumo) dados.description = p.resumo;
  if (p.cores.length > 0) dados.color = p.cores.map((c) => c.nome);
  if (p.tamanhos.length > 0) dados.size = p.tamanhos.map((t) => t.rotulo);

  return dados;
}

/**
 * A TRILHA
 *
 * Início › Categoria › Peça — os mesmos três degraus que já estão desenhados
 * na página. Descrevê-los custa quase nada e faz o Google mostrar o caminho
 * em vez da URL crua no resultado de busca.
 */
export function trilhaJsonLd(p: Produto): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: url("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: nomeCategoria(p.categoria),
        item: url(`/catalogo?c=${p.categoria}`),
      },
      { "@type": "ListItem", position: 3, name: p.nome },
    ],
  };
}
