/* Gera a prévia hospedada: um único arquivo autossuficiente.

   Fonte da verdade continua sendo o projeto Next — o HTML aqui é o próprio
   HTML renderizado pelo servidor, com CSS, fontes e as cenas de movimento
   embutidos. Nenhuma marcação é reescrita à mão. */

import { build } from 'esbuild';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const ORIGEM = process.env.PREVIEW_ORIGIN ?? 'http://localhost:3221';
const SAIDA = 'preview/serenou-fase-01.html';

/* Subconjuntos de fonte que o português precisa. Vietnamita, cirílico e grego
   ficam de fora para não inflar o arquivo. */
const SUBSETS_OK = ['-latin-', '-latin-ext-'];

const html = await (await fetch(ORIGEM)).text();

/* ---- CSS + fontes ---- */
const cssHref = html.match(/href="(\/_next\/static\/[^"]+\.css)"/)?.[1];
if (!cssHref) throw new Error('Nenhum bundle de CSS encontrado no HTML.');
let css = await (await fetch(ORIGEM + cssHref)).text();

const blocos = css.split(/(?=@font-face)/);
const mantidos = [];
for (const bloco of blocos) {
  if (!bloco.startsWith('@font-face')) { mantidos.push(bloco); continue; }
  const url = bloco.match(/url\(([^)]+\.woff2)\)/)?.[1];
  if (!url || !SUBSETS_OK.some((s) => url.includes(s))) continue;
  const arquivo = path.join('.next/static', url.replace(/^\.\.\//, ''));
  const b64 = (await readFile(arquivo)).toString('base64');
  mantidos.push(bloco.replace(/url\([^)]+\.woff2\)/, `url(data:font/woff2;base64,${b64})`));
}
css = mantidos.join('');

/* Qualquer asset citado pelo CSS (a máscara do lettering) também precisa
   virar data URI — a prévia é um arquivo só, sem servidor por trás. */
for (const m of [...css.matchAll(/url\((\/images\/[^)"']+)\)/g)]) {
  const buf = await readFile(path.join('public', m[1]));
  const tipo = m[1].endsWith('.png') ? 'image/png' : 'image/webp';
  css = css.replaceAll(m[0], `url(data:${tipo};base64,${buf.toString('base64')})`);
}

/* ---- Vídeo da intro, embutido ----
   Só o MP4: o WebM dobraria o peso do arquivo e o H.264 toca em tudo. */
async function comoDataUri(caminho, tipo) {
  const buf = await readFile(path.join('public', caminho));
  return `data:${tipo};base64,${buf.toString('base64')}`;
}
/* Os dois formatos, na camada de 1280: a prévia é o que vai ser apresentado.
   O MP4 é a cópia sem recodificação do original. */
const intro = {
  webm: await comoDataUri('videos/serenou-intro.webm', 'video/webm'),
  mp4: await comoDataUri('videos/serenou-intro.mp4', 'video/mp4'),
  selo: await comoDataUri('videos/serenou-intro-selo-1280.webp', 'image/webp'),
};
console.log(`intro embutida: ${((intro.webm.length + intro.mp4.length) / 1024).toFixed(0)} KB`);

/* ---- Cenas de movimento, empacotadas com o GSAP ---- */
const bundle = await build({
  entryPoints: ['preview/entry.ts'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  write: false,
});
const js = bundle.outputFiles[0].text;

/* ---- Montagem ----
   O host do Artifact envolve o conteúdo em <!doctype>/<head>/<body>, então a
   página é entregue sem essas tags. */
let corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1]
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<next-route-announcer>[\s\S]*?<\/next-route-announcer>/g, '')
  /* Entidades numéricas em vez de UTF-8 cru: a página é entregue sem <head>,
     então não há como declarar o charset. Assim os acentos sobrevivem a
     qualquer hospedagem. Só a marcação é escapada — dentro de <style> e
     <script> entidades não são decodificadas. */
  .replace(/[^\x00-\x7F]/g, (c) => `&#x${c.codePointAt(0).toString(16)};`);

/* As fotografias entram embutidas. O <picture> com quatro larguras é o certo
   no site; aqui ele viraria quatro downloads que não existem, então cada slot
   fica com uma única variante de 960 px em WebP. */
/* A maior variante até 1280 px. A prévia é o que vai ser apresentado, então
   ela carrega a versão mais nítida que ainda cabe em um arquivo único. */
const TETO_PREVIA = 1280;
corpo = corpo.replace(/<source[^>]*>/g, '');
const usados = new Set();
for (const m of [...corpo.matchAll(/src="(\/images\/serenou\/[^"]+?)-\d+\.webp"/g)]) {
  const base = m[1];
  if (usados.has(base)) continue;
  usados.add(base);
  const disponiveis = (await readdir(path.join('public', path.dirname(base))))
    .filter((f) => f.startsWith(path.basename(base) + '-') && f.endsWith('.webp'))
    .map((f) => Number(f.match(/-(\d+)\.webp$/)[1]))
    .filter((w) => w <= TETO_PREVIA)
    .sort((a, b) => b - a);
  const buf = await readFile(path.join('public', `${base}-${disponiveis[0]}.webp`));
  const uri = `data:image/webp;base64,${buf.toString('base64')}`;
  corpo = corpo.replace(new RegExp(`src="${base}-\\d+\\.webp"`, 'g'), `src="${uri}"`);
}
corpo = corpo.replace(/\ssrcset="[^"]*"/g, '').replace(/\ssizes="[^"]*"/g, '');
console.log(`fotografias embutidas: ${usados.size}`);

const saida = `<title>Serenou 2026</title>
<style>${css}</style>
${corpo}
<script>window.__INTRO_FONTES__=${JSON.stringify(intro)}</script>
<script>${js}</script>
`;

await mkdir('preview', { recursive: true });
await writeFile(SAIDA, saida);
console.log(`${SAIDA} — ${(saida.length / 1024).toFixed(0)} KB`);
