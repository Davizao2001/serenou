/**
 * IMPORTAÇÃO DO LOTE DE 14/09 — 13 PEÇAS, 45 FOTOGRAFIAS
 *
 * Roda uma vez. Sobe cada fotografia como asset e grava os treze documentos
 * com `createOrReplace`, usando `_id` determinístico (`produto-<slug>`): rodar
 * duas vezes não cria peça duplicada, sobrescreve a mesma.
 *
 * O TOKEN NUNCA APARECE NO CÓDIGO
 * Vem de SANITY_WRITE_TOKEN no ambiente. Não há valor padrão, não há fallback
 * e ele não é impresso em lugar nenhum — nem no log de erro.
 *
 * O QUE ESTE SCRIPT NÃO DECIDE
 * Nada. O mapa arquivo → produto → cor está em `lote.json`, que saiu da
 * análise aprovada. Aqui só se traduz aquele mapa para o formato do Sanity.
 *
 *   node scripts/importar-lote.mjs            confere e mostra o que faria
 *   node scripts/importar-lote.mjs --gravar   sobe de verdade
 */
import fs from "node:fs";
import path from "node:path";

const TOKEN = process.env.SANITY_WRITE_TOKEN;
const PROJ = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DS = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const API = "2026-09-01";
const GRAVAR = process.argv.includes("--gravar");
const PASTA = process.env.PASTA_FOTOS ?? "imagens";
const PLANO = process.env.PLANO ?? "scripts/lote.json";

if (!PROJ) { console.error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID."); process.exit(1); }
if (GRAVAR && !TOKEN) {
  console.error("Falta SANITY_WRITE_TOKEN. Sem token não há escrita — e o token não vai em código.");
  process.exit(1);
}

const plano = JSON.parse(fs.readFileSync(PLANO, "utf8"));
const chave = (s, i) => `${s.replace(/[^a-z0-9]/gi, "").slice(0, 10).toLowerCase()}${i}`;

async function subirFoto(arquivo) {
  const caminho = path.join(PASTA, arquivo);
  const bytes = fs.readFileSync(caminho);
  const r = await fetch(
    `https://${PROJ}.api.sanity.io/v${API}/assets/images/${DS}?filename=${encodeURIComponent(arquivo)}`,
    { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "image/jpeg" }, body: bytes }
  );
  if (!r.ok) throw new Error(`upload ${arquivo}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  /* O Sanity deduplica por hash do conteúdo: subir a mesma foto de novo
     devolve o asset que já existe, em vez de criar um segundo. */
  return (await r.json()).document._id;
}

const docs = [];
for (const p of plano) {
  const refs = {};
  if (GRAVAR) {
    for (const [idx, arquivo] of Object.entries(p.arquivos)) {
      refs[idx] = await subirFoto(arquivo);
      process.stdout.write(`  ${p.slug} · foto ${idx} ✓\n`);
    }
  }
  docs.push({
    _id: `produto-${p.slug}`,
    _type: "produto",
    nome: p.nome,
    slug: { _type: "slug", current: p.slug },
    preco: p.preco,
    categoria: p.cat,
    resumo: p.resumo,
    detalhes: p.detalhes,
    cores: p.cores.map((nome, i) => ({
      _key: chave(nome, i), _type: "cor", nome,
      amostra: { _type: "color", hex: p.amostras[nome] },
    })),
    tamanhos: p.tam.map((rotulo, i) => ({
      _key: chave(rotulo, i), _type: "tamanho", rotulo, disponivel: true,
    })),
    imagens: p.fotos.map(([idx, cor, alt], i) => ({
      _key: chave(p.arquivos[idx], i), _type: "image", alt,
      asset: { _type: "reference", _ref: refs[idx] ?? `PENDENTE-${idx}` },
      /* Foto geral não recebe `cor`: ela mostra mais de uma cor no mesmo
         quadro e não pode virar a imagem de uma variação. */
      ...(cor ? { cor } : {}),
    })),
    status: p.status,
    novidade: false, promocao: false, teste: false,
  });
}

if (!GRAVAR) {
  console.log(`\nConferência — nada foi enviado.\n`);
  for (const d of docs) {
    const cores = d.cores.map((c) => c.nome).join(" · ") || "—";
    const gerais = d.imagens.filter((im) => !im.cor).length;
    console.log(
      `${d.slug.current.padEnd(40)} ${d.categoria.padEnd(11)} R$ ${String(d.preco).padStart(7)}  ` +
      `${String(d.tamanhos.length).padStart(2)} tam  ${String(d.imagens.length).padStart(2)} fotos ` +
      `(${gerais} geral)  ${d.status === "oculto" ? "OCULTA" : "      "}  ${cores}`
    );
  }
  console.log(`\n${docs.length} peças, ${docs.reduce((n, d) => n + d.imagens.length, 0)} fotos.`);
  console.log("Para gravar: node scripts/importar-lote.mjs --gravar");
  process.exit(0);
}

const r = await fetch(`https://${PROJ}.api.sanity.io/v${API}/data/mutate/${DS}?returnIds=true`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations: docs.map((d) => ({ createOrReplace: d })) }),
});
if (!r.ok) { console.error(`mutação: ${r.status} ${(await r.text()).slice(0, 500)}`); process.exit(1); }
const res = await r.json();
console.log(`\n${res.results.length} peças gravadas.`);
for (const x of res.results) console.log("  " + x.id);
