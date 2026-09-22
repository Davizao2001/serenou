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
import { PecaComEndereco } from "../sanity/componentes/PecaComEndereco";
import { ColocarNoAr } from "../sanity/componentes/acoes";
import { ARTIGOS, artigoPor } from "../sanity/ajuda/artigos";

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
/* A grade nativa (`layout: "grid"`) NÃO pode voltar: ela desliga o
   `components.item`, e com isso a etiqueta de cor some de toda miniatura —
   conferido no painel rodando, zero seletores na tela. É a informação pela
   qual a tela de fotos existe. */
confere(
  "as fotos ficam em lista, para a etiqueta de cor aparecer",
  campos.find((c) => c.name === "imagens")?.options?.layout,
  undefined
);

/* A ordem de declaração é a ordem de renderização dentro da aba. Cor precisa
   vir ANTES de foto: o seletor da miniatura só oferece as cores já
   cadastradas, e em 15 das 18 peças toda foto tem cor. Invertido, volta o vai
   e vem — subir foto, descer, criar cor, voltar. Esta asserção é o que
   impede alguém de "arrumar" a ordem sem saber disso. */
const posicao = (n: string) => campos.findIndex((c) => c.name === n);
confere("cor vem antes de foto", posicao("cores") < posicao("imagens"), true);
confere("tamanho vem depois de foto", posicao("tamanhos") > posicao("imagens"), true);

console.log("\nA AJUDA");
confere("todo artigo tem id único", ARTIGOS.length, new Set(ARTIGOS.map((a) => a.id)).size);
confere("todo artigo tem título e resumo", ARTIGOS.every((a) => a.titulo && a.resumo), true);
confere("todo artigo tem conteúdo", ARTIGOS.every((a) => a.blocos.length > 0), true);

/* Os dois links dentro do formulário apontam para artigos que existem. Um id
   trocado abriria uma tela em branco, e é o tipo de erro que só aparece se
   alguém clicar. */
confere("link de ajuda da situação resolve", Boolean(artigoPor("situacao")), true);
confere("link de ajuda das fotos resolve", Boolean(artigoPor("fotos-e-cores")), true);

/* A ajuda tem que falar a língua da tela. O painel escreve "Esgotada" no
   rádio da situação; um artigo dizendo "Indisponível" mandaria a Grazi
   procurar uma opção que não existe. */
const rotulosDaSituacao = (
  (campos.find((c) => c.name === "status") as { options?: { list?: { title: string }[] } })
    ?.options?.list ?? []
).map((o) => o.title);
const textoDaAjuda = JSON.stringify(ARTIGOS);
confere(
  "a ajuda usa as palavras do formulário",
  rotulosDaSituacao.every((t) => textoDaAjuda.includes(t.split(" —")[0])),
  true
);
confere("a ajuda não diz Indisponível", textoDaAjuda.includes("Indispon"), false);

/* Nenhum termo técnico escapou para o texto que a Grazi lê. */
const PROIBIDOS = ["schema", "dataset", "GROQ", "array", "slug", "draft", "mutation", "patch", "deploy", "documento do Sanity"];
confere(
  "sem termo técnico nos artigos",
  PROIBIDOS.filter((t) => textoDaAjuda.toLowerCase().includes(t.toLowerCase())),
  []
);

console.log("\nO ENDEREÇO DA PÁGINA");

/* O preenchimento automático do endereço precisa morar na RAIZ do formulário.
   Dentro do campo ele não roda: o campo vive no fieldset "Configuração
   avançada", que abre fechado, e o Sanity não monta o conteúdo de fieldset
   fechado. Foi assim que uma peça nova chegava no botão de publicar sem
   endereço, com a aba Revisar dizendo que estava tudo certo.

   Estas duas asserções são o que impede a regressão: se alguém mover o
   componente de volta para o campo, elas falham aqui e não no uso real. */
confere(
  "o preenchimento mora na raiz do documento",
  (produto as { components?: { input?: unknown } }).components?.input ===
    PecaComEndereco,
  true
);
confere(
  "o campo do endereço não tem componente próprio",
  (campos.find((c) => c.name === "slug") as { components?: unknown })?.components,
  undefined
);
confere(
  "o endereço continua na gaveta fechada",
  (campos.find((c) => c.name === "slug") as { fieldset?: string })?.fieldset,
  "avancado"
);

console.log("\nO QUE A LISTA CONTA");

/* A linha da lista precisa dizer quando uma cor ficou sem foto própria —
   hoje são três peças no catálogo, e sem isto a Grazi só descobre abrindo as
   dezoito uma a uma. O `prepare` é chamado aqui com os mesmos dados que o
   Studio passa. */
type Prepare = (v: Record<string, unknown>) => { subtitle?: string; title?: string };
const preparar = (produto as unknown as { preview: { prepare: Prepare } }).preview.prepare;

const COR = (nome: string) => ({ _key: nome, nome });

/* As cores das fotos chegam por caminho indexado — `imagens.0.cor`,
   `imagens.1.cor`… — e não como array. O array inteiro derrubou a lista em
   produção: o resolvedor de preview do Sanity não devolve array para
   `imagens`, e `.some` lançava dentro do `prepare`. */
const FOTOS = (...cores: (string | undefined)[]) =>
  Object.fromEntries(cores.map((c, i) => [`corFoto${i}`, c]));

const comLacuna = preparar({
  title: "Body de Um Ombro",
  categoria: "blusas",
  preco: 69,
  status: "disponivel",
  cores: [COR("Preto"), COR("Azul-marinho"), COR("Marrom")],
  ...FOTOS("Preto", "Marrom"),
  tamanhos: [],
});
/* A faixa vive no `subtitle`. Em `description` ela não era desenhada: a lista
   do Studio mostra só título e subtítulo. */
confere(
  "cor sem foto aparece na linha",
  comLacuna.subtitle?.includes("1 cor sem foto"),
  true
);
confere(
  "a linha traz valor e categoria",
  comLacuna.subtitle?.replace(/\u00a0/g, " ").startsWith("R$ 69,00 · Blusas"),
  true
);
confere(
  "categoria desconhecida não quebra a linha",
  preparar({ title: "X", categoria: "inexistente", preco: 10, cores: [] }).subtitle?.includes("sem categoria"),
  true
);
confere(
  "nada vai para description, que a lista ignora",
  (comLacuna as { description?: string }).description,
  undefined
);

const completa = preparar({
  title: "Conjunto Bless",
  categoria: "conjuntos",
  preco: 159,
  status: "disponivel",
  cores: [COR("Bordô"), COR("Preto")],
  ...FOTOS("Bordô", "Preto"),
  tamanhos: [],
});
confere(
  "peça completa não ganha aviso nenhum",
  completa.subtitle?.includes("sem foto"),
  false
);

/* O acento não pode inventar uma lacuna: o site casa a bolinha com a foto
   por `mesmaCor`, que ignora acento e caixa. Comparar aqui com `===` daria
   um número que discorda do que a cliente vê. */
const acentuada = preparar({
  title: "Teste",
  categoria: "conjuntos",
  preco: 100,
  status: "disponivel",
  cores: [COR("Bordô")],
  ...FOTOS("bordo"),
  tamanhos: [],
});
confere(
  "acento diferente não vira lacuna falsa",
  acentuada.subtitle?.includes("sem foto"),
  false
);

const semCor = preparar({
  title: "Macaquinho",
  categoria: "macaquinhos",
  preco: 120,
  status: "disponivel",
  cores: [],
  ...FOTOS(undefined),
  tamanhos: [],
});
confere("peça sem cor nenhuma não ganha aviso", semCor.subtitle?.includes("sem foto"), false);

/* A REGRESSÃO QUE CUSTOU A LISTA INTEIRA

   Um `prepare` que lança troca a linha da peça por "Invalid preview config".
   Aconteceu em produção porque o valor selecionado não era o array que o
   código supunha. Estas entradas são deliberadamente erradas: nenhuma pode
   derrubar o prepare. */
const LIXO: Record<string, unknown>[] = [
  {},
  { title: "X", cores: "não é array", tamanhos: 42 },
  { title: "X", cores: { _type: "coisa" }, tamanhos: null, corFoto0: 7 },
  { title: "X", cores: [null, undefined, { nome: "" }], corFoto0: null },
  { title: "X", preco: "cento e cinquenta", status: "inventado" },
];
let lancou: string | null = null;
for (const entrada of LIXO) {
  try {
    preparar(entrada);
  } catch (e) {
    lancou = `${JSON.stringify(entrada).slice(0, 60)} → ${(e as Error).message}`;
    break;
  }
}
confere("o prepare nunca lança, nem com valor de forma errada", lancou, null);

console.log("\nVOLTAR AO AR É TÃO FÁCIL QUANTO SAIR");
confere(
  "a ação de colocar no ar existe",
  typeof ColocarNoAr === "function",
  true
);

console.log("\nCADA INFORMAÇÃO EM UM LUGAR SÓ");
const nomes = campos.map((c) => c.name);
confere("sem campo repetido", nomes.length, new Set(nomes).size);

console.log(falhas === 0 ? "\nTudo certo.\n" : `\n${falhas} falha(s).\n`);
process.exit(falhas === 0 ? 0 : 1);
