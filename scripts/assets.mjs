/* Gera as variantes responsivas a partir dos originais.

   Coloque os arquivos de câmera em /assets-originais/<pasta>/<nome>.<ext> e
   rode `npm run assets`. Cada arquivo vira AVIF e WebP em quatro larguras
   dentro de /public/images/serenou/<pasta>/.

   Requer sharp:  npm i -D sharp                                            */

import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

const LARGURAS = [480, 720, 960, 1122];
const ENTRADA = 'assets-originais';
const SAIDA = 'public/images/serenou';

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('Instale o sharp primeiro:  npm i -D sharp');
  process.exit(1);
}

const pastas = await readdir(ENTRADA, { withFileTypes: true }).catch(() => []);
if (!pastas.length) {
  console.error(`Nada em /${ENTRADA}. Crie a pasta e coloque os originais nela.`);
  process.exit(1);
}

for (const pasta of pastas.filter((d) => d.isDirectory())) {
  const dir = path.join(ENTRADA, pasta.name);
  await mkdir(path.join(SAIDA, pasta.name), { recursive: true });

  for (const arquivo of await readdir(dir)) {
    if (!/\.(jpe?g|png|webp|tiff?)$/i.test(arquivo)) continue;
    const nome = arquivo.replace(/\.[^.]+$/, '');
    const origem = path.join(dir, arquivo);
    const { width } = await sharp(origem).metadata();

    for (const w of LARGURAS) {
      if (w > width) continue;
      const base = path.join(SAIDA, pasta.name, `${nome}-${w}`);
      await sharp(origem).resize(w).avif({ quality: 62 }).toFile(`${base}.avif`);
      await sharp(origem).resize(w).webp({ quality: 80, effort: 6 }).toFile(`${base}.webp`);
    }
    console.log(`${pasta.name}/${nome}  →  ${LARGURAS.filter((w) => w <= width).join(', ')}`);
  }
}
