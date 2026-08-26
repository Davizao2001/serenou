/* ---------------------------------------------------------------------------
   CENAS DE MOVIMENTO

   Cada cena recebe o nó raiz da sua seção e monta as animações dentro dele.
   Nada aqui depende de React — é por isso que a prévia hospedada roda
   exatamente o mesmo código do projeto, sem uma segunda implementação para
   sair do lugar com o tempo.

   Contrato: toda cena devolve uma função de limpeza.
--------------------------------------------------------------------------- */

import { gsap, ScrollTrigger, SplitText } from "./gsap";
import { DUR, EASE, MQ, TRAVEL } from "./motion";
import { aoTerminarIntro, introAtiva } from "./intro";

type Cleanup = () => void;

/** Resolve alvos sempre dentro da seção — seletor solto vaza para os outros
 *  capítulos e um sobrescreve o estado inicial do outro. */
function scoped(root: HTMLElement) {
  const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);
  const one = (sel: string) => q(sel)[0];
  return { q, one };
}

/* =========================================================================
   ABERTURA — hero e manifesto dividem uma única placa fotográfica.

   O gesto central do site: a fotografia não é cortada entre as seções, é
   reenquadrada. Cada propriedade animada mora na sua própria camada, para
   que a timeline de entrada e a presa ao scroll nunca disputem o mesmo valor:

     [data-plate]          clip do scroll   fullscreen → quadro editorial
       [data-plate-reveal] clip da entrada  máscara revelando a fotografia
         [data-plate-zoom] scale da entrada 1.06 → 1
           .plate-media    scale do scroll  1 → 1.04
   ========================================================================= */
export function openingScene(root: HTMLElement): Cleanup {
  const { q, one } = scoped(root);
  const mm = gsap.matchMedia();
  const splits: SplitText[] = [];
  const limpezas: Array<() => void> = [];

  mm.add({ desktop: MQ.desktop, mobile: MQ.mobile, reduce: MQ.reduce }, (ctx) => {
    const { desktop, reduce } = ctx.conditions as Record<string, boolean>;

    /* Movimento reduzido: nada se move, tudo está presente. */
    if (reduce) return;

    /* ---- Entrada da hero ----
       Duas versões. Quem chega direto vê a sequência completa de cinco tempos.
       Quem vem da intro vê uma entrada curta: a fotografia já está montada por
       baixo da cortina, e reabri-la com máscara e zoom seria uma segunda
       abertura — o usuário esperaria duas vezes pela mesma coisa. */
    if (introAtiva()) {
      limpezas.push(aoTerminarIntro(() => entradaHero(q, one, true)));
    } else {
      entradaHero(q, one, false);
    }

    /* ---- Hero → manifesto: a máscara fecha lateralmente e a fotografia
            vira um quadro editorial. Sem corte, sem imagem nova. ---- */
    const saida = gsap.timeline({
      scrollTrigger: {
        trigger: one("[data-hero]"),
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      },
    });

    saida
      .to(one("[data-hero-copy]"), { autoAlpha: 0, y: -TRAVEL.lg, ease: EASE.linear }, 0)
      .to(q("[data-plate] .plate-media"), { scale: 1.04, ease: EASE.linear }, 0)
      .to(one("[data-plate-scrim]"), { autoAlpha: 0, ease: EASE.linear }, 0);

    if (desktop) {
      /* A janela fecha sobre a modelo, não sobre um lado fixo: ela está no
         centro-direita do quadro, e uma janela à esquerda mostraria os
         manequins. O texto do manifesto ocupa o lado que sobra.
         Sem pan de enquadramento: a fotografia é 16:9 e em telas largas é
         exibida inteira na vertical, então mover `object-position` no eixo Y
         não teria efeito nenhum. */
      saida.fromTo(
        one("[data-plate]"),
        { clipPath: "inset(0% 0% 0% 0%)" },
        { clipPath: "inset(14svh 14vw 10svh 48vw)", ease: EASE.linear },
        0
      );
    }
    /* Mobile: sem fechamento lateral. O manifesto, opaco, sobe por cima da
       placa — mesma continuidade, metade do custo. */

    /* ---- Manifesto: o texto começa quase apagado e ganha presença conforme
            o usuário avança. Por palavras, nunca por letra. ---- */
    q("[data-manifesto-line]").forEach((linha) => {
      splits.push(
        SplitText.create(linha, {
          type: "words",
          autoSplit: true,
          onSplit(self) {
            return gsap.fromTo(
              self.words,
              { opacity: 0.18 },
              {
                opacity: 1,
                duration: 1,
                stagger: 0.32,
                ease: EASE.linear,
                scrollTrigger: {
                  trigger: linha,
                  start: "top 88%",
                  end: "top 38%",
                  scrub: true,
                },
              }
            );
          },
        })
      );
    });

    const corpo = one("[data-manifesto-body]");
    gsap.fromTo(
      corpo,
      { autoAlpha: 0, y: TRAVEL.md },
      {
        autoAlpha: 1,
        y: 0,
        duration: DUR.slow,
        ease: EASE.out,
        scrollTrigger: { trigger: corpo, start: "top 84%", once: true },
      }
    );
  });

  return () => {
    limpezas.forEach((f) => f());
    splits.forEach((s) => s.revert());
    mm.revert();
  };
}

/* -------------------------------------------------------------------------
   A entrada da hero, nas duas versões.
   ------------------------------------------------------------------------- */
type Busca = (sel: string) => HTMLElement[];
type Um = (sel: string) => HTMLElement;

function entradaHero(q: Busca, one: Um, curta: boolean) {
  if (!curta) {
    /* Cinco tempos, ~1,6 s no total. */
    gsap
      .timeline({ defaults: { ease: EASE.out }, delay: 0.15 })
      .fromTo(
        one("[data-plate-reveal]"),
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15 },
        0
      )
      .fromTo(one("[data-plate-zoom]"), { scale: 1.06 }, { scale: 1, duration: 1.45 }, 0)
      .fromTo(
        one("[data-hero-eyebrow]"),
        { autoAlpha: 0, y: TRAVEL.sm },
        { autoAlpha: 1, y: 0, duration: DUR.base },
        0.45
      )
      .fromTo(
        q("[data-hero-line]"),
        /* `y: 0` é obrigatório nos dois lados: o estado pré-pintura em CSS é
           translateY(108%), e o GSAP lê esse percentual como deslocamento em
           pixels. Sem zerar `y`, a linha termina onde começou. */
        { yPercent: 108, y: 0 },
        { yPercent: 0, y: 0, duration: 0.85, stagger: 0.12 },
        0.58
      )
      .fromTo(
        one("[data-hero-desc]"),
        { autoAlpha: 0, y: TRAVEL.sm },
        { autoAlpha: 1, y: 0, duration: DUR.base },
        1.02
      )
      .fromTo(
        q("[data-hero-cta]"),
        { autoAlpha: 0, y: TRAVEL.sm },
        { autoAlpha: 1, y: 0, duration: DUR.base, stagger: 0.08 },
        1.14
      );
    return;
  }

  /* Vindo da intro: a placa já está montada, só o texto entra. `yPercent` e
     `clipPath` precisam ser zerados explicitamente — o estado de pré-pintura
     em CSS deixou as linhas 108% abaixo e a placa mascarada. */
  /* Imediato, sem tween: a placa tem de existir no primeiro quadro da saída
     da cortina, para o fade acontecer sobre a fotografia e não sobre o vazio. */
  gsap.set(one("[data-plate-reveal]"), { clipPath: "inset(0% 0% 0% 0%)" });

  gsap.fromTo(
    one("[data-plate-zoom]"),
    { scale: 1.02 },
    { scale: 1, duration: 1.1, ease: EASE.out }
  );

  /* O texto entra quando a cortina já clareou o bastante para ele ser visto —
     antes disso estaria animando atrás de uma camada opaca. */
  gsap
    .timeline({ defaults: { ease: EASE.out }, delay: 0.36 })
    .fromTo(
      one("[data-hero-eyebrow]"),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.45 },
      0
    )
    .fromTo(
      q("[data-hero-line]"),
      /* `yPercent` zerado dos dois lados: o estado de pré-pintura em CSS deixa
         as linhas 108% abaixo, e aqui a entrada é por deslocamento em pixels. */
      { autoAlpha: 0, y: 15, yPercent: 0 },
      { autoAlpha: 1, y: 0, yPercent: 0, duration: 0.5, stagger: 0.07 },
      0.05
    )
    .fromTo(
      one("[data-hero-desc]"),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.45 },
      0.2
    )
    .fromTo(
      q("[data-hero-cta]"),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.06 },
      0.28
    );
}

/* =========================================================================
   CAPÍTULO 01 — LEVE

   Espelha a abertura: lá a fotografia fechou à esquerda, aqui ela abre à
   direita. O movimento é de câmera, nunca do tecido — se existir o vídeo
   original do vestido, ele entra no lugar da foto pelo manifest e o tecido
   se move sozinho.
   ========================================================================= */
export function leveScene(root: HTMLElement): Cleanup {
  const { q, one } = scoped(root);
  const mm = gsap.matchMedia();

  /* As três condições precisam estar registradas: com apenas `reduce`, o
     callback nunca roda para quem não usa movimento reduzido. */
  mm.add({ desktop: MQ.desktop, mobile: MQ.mobile, reduce: MQ.reduce }, (ctx) => {
    if ((ctx.conditions as Record<string, boolean>).reduce) return;

    const quadro = one("[data-leve-frame]");
    const copy = one("[data-leve-copy]");

    gsap.fromTo(
      quadro,
      { clipPath: "inset(0% 0% 100% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.2,
        ease: EASE.out,
        scrollTrigger: { trigger: quadro, start: "top 82%", once: true },
      }
    );

    /* Movimento de câmera preso ao scroll: 1 → 1.04, mais alguns pixels de
       deriva vertical. Nada além disso. */
    gsap.fromTo(
      q("[data-leve-frame] .plate-media"),
      { scale: 1, yPercent: -1.4 },
      {
        scale: 1.04,
        yPercent: 1.4,
        ease: EASE.linear,
        scrollTrigger: { trigger: quadro, start: "top bottom", end: "bottom top", scrub: true },
      }
    );

    gsap.fromTo(
      q("[data-leve-line]"),
      { yPercent: 108, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: EASE.out,
        scrollTrigger: { trigger: copy, start: "top 78%", once: true },
      }
    );

    gsap.fromTo(
      q("[data-reveal]"),
      { autoAlpha: 0, y: TRAVEL.md },
      {
        autoAlpha: 1,
        y: 0,
        duration: DUR.slow,
        stagger: 0.12,
        ease: EASE.out,
        scrollTrigger: { trigger: copy, start: "top 72%", once: true },
      }
    );
  });

  return () => mm.revert();
}

/* =========================================================================
   CAPÍTULO 02 — VERSÁTIL (início)

   Uma peça, três composições. No desktop a seção é sticky e o scroll troca as
   composições por máscara; no mobile vira sequência vertical, sem pin.
   ========================================================================= */
export function versatilScene(root: HTMLElement): Cleanup {
  const { q, one } = scoped(root);
  const mm = gsap.matchMedia();

  mm.add({ desktop: MQ.desktop, mobile: MQ.mobile, reduce: MQ.reduce }, (ctx) => {
    const { desktop, reduce } = ctx.conditions as Record<string, boolean>;
    if (reduce) return;

    const cabecalho = one("[data-versatil-head]");

    /* Transição cromática: off-white quente → bege muito claro. Acontece no
       fundo da página, não em um gradiente visível. */
    gsap.to(document.querySelector("[data-canvas]"), {
      backgroundColor: "#e6dbcb",
      ease: EASE.linear,
      scrollTrigger: { trigger: root, start: "top 80%", end: "top 20%", scrub: true },
    });

    gsap.fromTo(
      q("[data-versatil-line]"),
      { yPercent: 108, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: EASE.out,
        scrollTrigger: { trigger: cabecalho, start: "top 78%", once: true },
      }
    );

    gsap.fromTo(
      q("[data-versatil-head] [data-reveal]"),
      { autoAlpha: 0, y: TRAVEL.md },
      {
        autoAlpha: 1,
        y: 0,
        duration: DUR.slow,
        stagger: 0.1,
        ease: EASE.out,
        scrollTrigger: { trigger: cabecalho, start: "top 74%", once: true },
      }
    );

    const looks = q("[data-look]");
    const quadros = looks.map((l) => l.querySelector("[data-look-frame]"));
    const legendas = looks.map((l) => l.querySelector("[data-look-caption]"));

    if (!desktop) {
      /* Mobile: sequência vertical, cada composição entra por máscara quando
         é descoberta. Sem pin, sem timeline longa. */
      looks.forEach((look, i) => {
        gsap.fromTo(
          quadros[i],
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            ease: EASE.out,
            scrollTrigger: { trigger: look, start: "top 82%", once: true },
          }
        );
        gsap.fromTo(
          legendas[i],
          { autoAlpha: 0, y: TRAVEL.sm },
          {
            autoAlpha: 1,
            y: 0,
            duration: DUR.base,
            ease: EASE.out,
            scrollTrigger: { trigger: look, start: "top 76%", once: true },
          }
        );
      });
      return;
    }

    /* Desktop: cada composição entra por máscara vertical em um ponto
       diferente da coluna e a anterior se retira depois da sobreposição —
       o editorial se reorganiza em vez de trocar de card no mesmo lugar. */
    const passos = q("[data-step]");

    gsap.set(quadros.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(legendas.slice(1), { autoAlpha: 0 });
    gsap.set(passos.slice(1), { opacity: 0.3 });

    const tl = gsap.timeline({
      defaults: { ease: EASE.linear },
      scrollTrigger: {
        trigger: one("[data-versatil-stage]"),
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      },
    });

    [1, 2].forEach((i) => {
      const at = 1 + (i - 1) * 1.7;
      tl.to(quadros[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, at)
        .to(legendas[i - 1], { autoAlpha: 0, duration: 0.4 }, at)
        /* a placa anterior só sai depois que a nova cobriu — é a sobreposição
           que dá a sensação de página sendo remontada */
        .to(quadros[i - 1], { autoAlpha: 0, duration: 0.5 }, at + 0.75)
        .to(legendas[i], { autoAlpha: 1, duration: 0.5 }, at + 0.6)
        .to(passos[i - 1], { opacity: 0.3, duration: 0.4 }, at)
        .to(passos[i], { opacity: 1, duration: 0.4 }, at + 0.3);
    });
  });

  return () => mm.revert();
}

/* =========================================================================
   TEASER — 03 MARCANTE

   A alfaiataria preta entra pela base e o fundo da página vai do bege ao
   carvão. É a mudança de humor do site, feita com a própria fotografia.
   ========================================================================= */
export function teaserScene(root: HTMLElement): Cleanup {
  const { q, one } = scoped(root);
  const mm = gsap.matchMedia();

  mm.add({ desktop: MQ.desktop, mobile: MQ.mobile, reduce: MQ.reduce }, (ctx) => {
    if ((ctx.conditions as Record<string, boolean>).reduce) return;

    /* `fromTo` explícito: o capítulo anterior já deixou o fundo em bege, e um
       `to` capturaria o valor errado ao ser criado. */
    gsap.fromTo(
      document.querySelector("[data-canvas]"),
      { backgroundColor: "#e6dbcb" },
      {
        backgroundColor: "#16130f",
        ease: EASE.linear,
        immediateRender: false,
        scrollTrigger: { trigger: root, start: "top 92%", end: "top 42%", scrub: true },
      }
    );

    const quadro = one("[data-teaser-frame]");

    gsap.fromTo(
      quadro,
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.3,
        ease: EASE.out,
        scrollTrigger: { trigger: quadro, start: "top 88%", once: true },
      }
    );

    /* Parallax de ~32px em toda a passagem — o limite do que o briefing
       permite, e o suficiente para a fotografia não parecer colada. */
    gsap.fromTo(
      q("[data-teaser-frame] .plate-media"),
      { y: 16 },
      {
        y: -16,
        ease: EASE.linear,
        scrollTrigger: { trigger: quadro, start: "top bottom", end: "bottom top", scrub: true },
      }
    );

    gsap.fromTo(
      q("[data-teaser-line]"),
      { yPercent: 108, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: EASE.out,
        scrollTrigger: { trigger: root, start: "top 40%", once: true },
      }
    );

    gsap.fromTo(
      q("[data-reveal]"),
      { autoAlpha: 0, y: TRAVEL.md },
      {
        autoAlpha: 1,
        y: 0,
        duration: DUR.slow,
        stagger: 0.12,
        ease: EASE.out,
        scrollTrigger: { trigger: root, start: "top 36%", once: true },
      }
    );
  });

  return () => mm.revert();
}

/* =========================================================================
   HEADER — transparente sobre a hero, fundo sólido muito suave depois dela.
   Um único ScrollTrigger, sem scrub: a troca é um estado, não uma
   interpolação presa ao dedo do usuário.
   ========================================================================= */
export function headerScene(root: HTMLElement): Cleanup {
  const { one } = scoped(root);

  /* A hero vive fora do escopo do header — referência direta ao nó. */
  const hero = document.querySelector("[data-hero]");
  if (!hero) return () => {};

  const solido = gsap
    .timeline({ paused: true })
    .to(one("[data-header-surface]"), { autoAlpha: 1, duration: DUR.quick, ease: EASE.out }, 0)
    .to(one("[data-header-hairline]"), { scaleX: 1, duration: DUR.base, ease: EASE.out }, 0)
    .to(root, { color: "#16130f", duration: DUR.quick, ease: EASE.out }, 0);

  const st = ScrollTrigger.create({
    trigger: hero,
    start: "bottom top+=88",
    onEnter: () => solido.play(),
    onLeaveBack: () => solido.reverse(),
  });

  return () => {
    st.kill();
    solido.revert();
  };
}

export const SCENES = {
  "[data-scene='header']": headerScene,
  "[data-scene='teaser']": teaserScene,
  "[data-scene='opening']": openingScene,
  "[data-scene='leve']": leveScene,
  "[data-scene='versatil']": versatilScene,
} as const;
