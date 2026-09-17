/* ---------------------------------------------------------------------------
   CONFERÊNCIA DO PAINEL

   Roda com:  npx tsx scripts/conferir-painel.ts

   Não substitui abrir a tela. Confere o que dá para conferir sem navegador:
   a regra da descrição automática das fotos, a regra de que a descrição
   escrita à mão sempre vence, e a coerência entre o schema e as quatro
   etapas — que é o tipo de coisa que quebra em silêncio numa renomeação.
--------------------------------------------------------------------------- */

import { altAutomatico } from "../sanity/lib/produtos";
import { slotDeImagem } from "../sanity/lib/imagem";
import { produto } from "../sanity/schemas/produto";

let falhas = 0;
function confere(nome: string, obtido: unknown, esperado: unknown) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado);
  if (!ok) {
    falhas++;
    console.log(`  ✗ ${nome}\n      esperado: ${JSON.stringify(esperado)}\n      obtido:   ${JSON.stringify(obtido)}`);
  } else {
    console.log(`  ✓ ${nome}`);
  }
}

console.log("\nDESCRIÇÃO AUTOMÁTICA DA FOTO");
confere("com cor", altAutomatico("Conjunto Bless", "Bordô", 2), "Conjunto Bless na cor bordô");
confere("cor composta", altAutomatico("Pantalona", "Off-white", 0), "Pantalona na cor off-white");
confere("cor com hífen", altAutomatico("Body", "Azul-marinho", 1), "Body na cor azul-marinho");
confere("marca preservada", altAutomatico("Vestido", "Azul Tiffany", 0), "Vestido na cor azul Tiffany");
confere("sem cor, primeira", altAutomatico("Macaquinho", null, 0), "Macaquinho");
confere("sem cor, terceira", altAutomatico("Macaquinho", undefined, 2), "Macaquinho, foto 3");
confere("cor só com espaços", altAutomatico("Bata", "   ", 1), "Bata, foto 2");
confere("sem nome", altAutomatico(undefined, "Preto", 0), "");

console.log("\nA DESCRIÇÃO ESCRITA À MÃO VENCE");
const comAsset = {
  alt: "Conjunto bordô visto de costas, com o laço da cintura",
  cor: "Bordô",
  asset: { _id: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-1200x1600-jpg", url: "https://cdn.sanity.io/images/pmk6j4vg/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-1200x1600.jpg", metadata: { dimensions: { width: 1200, height: 1600 } } },
};
confere(
  "alt manual sobrevive ao fallback",
  slotDeImagem(comAsset as never, { id: "t1", alt: altAutomatico("Conjunto Bless", "Bordô", 0) }).alt,
  "Conjunto bordô visto de costas, com o laço da cintura"
);
confere(
  "sem alt manual, entra o automático",
  slotDeImagem({ ...comAsset, alt: undefined } as never, { id: "t2", alt: altAutomatico("Conjunto Bless", "Bordô", 0) }).alt,
  "Conjunto Bless na cor bordô"
);

console.log("\nAS QUATRO ETAPAS");
const grupos = (produto.groups ?? []).map((g) => g.name);
confere("três abas de formulário", grupos, ["principal", "fotos", "vitrine"]);

type Campo = { name: string; group?: string; options?: { layout?: string } };
const campos = produto.fields as unknown as Campo[];
const grupoDe = (n: string) => campos.find((c) => c.name === n)?.group;

confere("nome em Produto", grupoDe("nome"), "principal");
confere("preço em Produto", grupoDe("preco"), "principal");
confere("categoria em Produto", grupoDe("categoria"), "principal");
confere("fotos em Fotos e opções", grupoDe("imagens"), "fotos");
confere("cores na MESMA etapa das fotos", grupoDe("cores"), "fotos");
confere("tamanhos na MESMA etapa das fotos", grupoDe("tamanhos"), "fotos");
confere("situação em No site", grupoDe("status"), "vitrine");
confere("endereço da página fora do caminho", grupoDe("slug"), "vitrine");
confere(
  "grade nativa nas fotos",
  campos.find((c) => c.name === "imagens")?.options?.layout,
  "grid"
);

/* A ordem de declaração é a ordem de renderização dentro da aba. Cor precisa
   vir ANTES de foto: o seletor da miniatura só oferece as cores já
   cadastradas, e em 15 das 18 peças toda foto tem cor. Invertido, volta o vai
   e vem — subir foto, descer, criar cor, voltar. Esta asserção é o que
   impede alguém de "arrumar" a ordem sem saber disso. */
const posicao = (n: string) => campos.findIndex((c) => c.name === n);
confere("cor vem antes de foto", posicao("cores") < posicao("imagens"), true);
confere("tamanho vem depois de foto", posicao("tamanhos") > posicao("imagens"), true);

console.log("\nCADA INFORMAÇÃO EM UM LUGAR SÓ");
const nomes = campos.map((c) => c.name);
confere("sem campo repetido", nomes.length, new Set(nomes).size);

console.log(falhas === 0 ? "\nTudo certo.\n" : `\n${falhas} falha(s).\n`);
process.exit(falhas === 0 ? 0 : 1);
