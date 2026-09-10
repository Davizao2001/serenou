import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/* O projeto não tinha lint funcionando: `next lint` saiu do Next 16 e o
   script do package.json apontava para o nada. Config plana, direto dos
   presets do Next — regras de core web vitals mais as de TypeScript. */
const config = [
  { ignores: [".next/**", "node_modules/**", "out/**", "preview/serenou-fase-01.html"] },
  ...coreWebVitals,
  ...typescript,
];

export default config;
