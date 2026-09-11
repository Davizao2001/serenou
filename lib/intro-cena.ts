/* ---------------------------------------------------------------------------
   INTRO — a cena

   Fora do React, como todas as outras cenas do projeto: recebe o nó da camada,
   monta a mídia, conduz a saída e devolve uma função de limpeza. O componente
   só cuida da marcação e de decidir as fontes; a prévia hospedada chama esta
   mesma função sobre o HTML estático, então existe uma implementação só.

   O GSAP cuida apenas da saída. A animação é do vídeo.
--------------------------------------------------------------------------- */

import { gsap, ScrollTrigger } from "./gsap";
import { apagarNo, concluirIntro, liberarPagina, marcarComoVista } from "./intro";

/** Quanto antes do fim do vídeo a cortina começa a sair. */
const ANTECIPACAO = 0.6;
/** Se o vídeo não estiver pronto até aqui, a intro é pulada. Cinco segundos
 *  porque o arquivo entregue é o original sem recodificar — mais pesado e mais
 *  bonito. Em conexão lenta a intro cai fora e o site abre normal. */
const LIMITE_CARREGAMENTO = 5000;
/** Rede final: nada segura a página além disso, aconteça o que acontecer. */
const LIMITE_ABSOLUTO = 12000;
/** Movimento reduzido: só o selo, rápido, e segue. */
const TEMPO_SELO_REDUZIDO = 420;

export type FontesIntro = { mp4: string; webm: string; selo: string };

type Cleanup = () => void;

export function introScene(camada: HTMLElement, fontes: FontesIntro): Cleanup {
  const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers: number[] = [];
  const agendar = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  let saindo = false;

  /* Marcada já na entrada: um refresh no meio da intro não deve recomeçar nem
     baixar o vídeo de novo. */
  marcarComoVista();

  /* Enquanto a cortina está na tela, o conteúdo atrás sai da ordem de
     tabulação — senão o foco viaja por links invisíveis. */
  document
    .querySelectorAll<HTMLElement>("header, #conteudo")
    .forEach((el) => el.setAttribute("inert", ""));

  /* A saída: a cortina perde opacidade sobre a hero, que já está montada
     embaixo. O sinal para a hero entrar sai no instante zero, para a fotografia
     já estar lá quando a cortina começa a clarear. */
  const sair = (rapido = false) => {
    if (saindo) return;
    saindo = true;
    timers.forEach(clearTimeout);

    gsap
      .timeline({
        onComplete: () => {
          liberarPagina();
          apagarNo(camada);
          /* A rolagem estava travada enquanto a cortina existia; o ScrollTrigger
             remede tudo agora que a página soltou. */
          ScrollTrigger.refresh();
        },
      })
      .add(() => concluirIntro(), 0)
      .to(
        camada,
        { autoAlpha: 0, duration: rapido ? 0.35 : 0.75, ease: "power2.inOut" },
        0
      );
  };

  /* Rede final. Nenhum caminho de erro pode deixar a página presa. */
  agendar(() => sair(true), LIMITE_ABSOLUTO);

  const pular = camada.querySelector<HTMLButtonElement>("[data-intro-pular]");
  const aoPular = () => sair(true);
  pular?.addEventListener("click", aoPular);

  /* ---- Movimento reduzido: o selo aparece, respira e sai. Sem vídeo. ---- */
  if (reduzido) {
    const selo = document.createElement("img");
    selo.src = fontes.selo;
    selo.alt = "";
    selo.setAttribute("aria-hidden", "true");
    selo.setAttribute("data-intro-media", "");
    camada.prepend(selo);
    apagarNo(pular);
    agendar(() => sair(true), TEMPO_SELO_REDUZIDO);

    return () => {
      timers.forEach(clearTimeout);
      pular?.removeEventListener("click", aoPular);
    };
  }

  /* ---- Vídeo ---- */
  const v = document.createElement("video");
  v.muted = true;
  v.autoplay = true;
  v.playsInline = true;
  v.preload = "auto";
  v.setAttribute("data-intro-media", "");
  v.setAttribute("aria-hidden", "true");
  v.tabIndex = -1;
  /* MP4 primeiro, e de propósito: ele é a cópia bit a bit do arquivo original,
     sem recodificação nenhuma. O WebM existe porque um Chromium sem codecs
     proprietários não decodifica H.264 e ficaria sem intro.
     Os `codecs` precisam ser declarados: sem eles o navegador responde "talvez"
     para o MP4, tenta, falha, e cai no tratamento de erro em vez de escolher o
     WebM sozinho. Com eles a negociação acontece antes de qualquer download. */
  /* O elemento <video> só dispara `error` em alguns caminhos de falha; quando
     nenhuma fonte carrega ele costuma ficar em silêncio, e a cortina ficava
     presa até o limite de carregamento — cinco segundos de tela parada por
     um arquivo que já tinha falhado no primeiro segundo. Contar os `error`
     das próprias <source> resolve: quando todas falharam, não há o que
     esperar. */
  const candidatas: Array<[string, string]> = [
    [fontes.mp4, 'video/mp4; codecs="avc1.64001F"'],
    [fontes.webm, 'video/webm; codecs="vp9"'],
  ].filter(([src]) => !!src) as Array<[string, string]>;

  let falhas = 0;
  const aoFalharFonte = () => {
    falhas += 1;
    if (falhas >= candidatas.length) falhar();
  };

  for (const [src, type] of candidatas) {
    const s = document.createElement("source");
    s.src = src;
    s.type = type;
    s.addEventListener("error", aoFalharFonte);
    v.appendChild(s);
  }
  camada.prepend(v);

  const falhar = () => sair(true);
  const tocar = () => {
    v.play().then(
      () => {
        /* Contado do `playing` real, não do carregamento: se o autoplay
           demorou, a conta continua certa. */
        const restante = Math.max(
          0.4,
          (v.duration || 4) - v.currentTime - ANTECIPACAO
        );
        agendar(() => sair(), restante * 1000);
      },
      falhar /* autoplay bloqueado — não prender o usuário */
    );
  };
  const aoCarregar = () => agendar(tocar, 900);
  const aoTerminar = () => sair();

  v.addEventListener("canplaythrough", tocar, { once: true });
  /* Se `canplaythrough` não vier — acontece em conexões lentas e em alguns
     navegadores — tenta assim mesmo com o que já baixou. */
  v.addEventListener("loadeddata", aoCarregar, { once: true });
  v.addEventListener("error", falhar);
  v.addEventListener("ended", aoTerminar);
  agendar(falhar, LIMITE_CARREGAMENTO);

  v.load();

  return () => {
    timers.forEach(clearTimeout);
    v.querySelectorAll("source").forEach((s) => s.removeEventListener("error", aoFalharFonte));
    v.removeEventListener("canplaythrough", tocar);
    v.removeEventListener("loadeddata", aoCarregar);
    v.removeEventListener("error", falhar);
    v.removeEventListener("ended", aoTerminar);
    pular?.removeEventListener("click", aoPular);
  };
}

/** Arquivo leve onde a tela é pequena; o de 720p onde a densidade justifica. */
export function escolherFontes(): FontesIntro {
  const alvo = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  return alvo <= 900
    ? {
        mp4: "/videos/serenou-intro-960.mp4",
        webm: "/videos/serenou-intro-960.webm",
        selo: "/videos/serenou-intro-selo-960.webp",
      }
    : {
        mp4: "/videos/serenou-intro.mp4",
        webm: "/videos/serenou-intro.webm",
        selo: "/videos/serenou-intro-selo-1280.webp",
      };
}
