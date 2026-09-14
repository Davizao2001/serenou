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
import { HERO_INTERVALO, HERO_TROCA } from "./media";

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
/**
 * A hero rotativa.
 *
 * As fotografias estão empilhadas no mesmo lugar. A que entra sobe de z-index
 * e cresce em opacidade por cima da anterior, que só então é zerada — nenhum
 * quadro tem as duas em meia-opacidade, então não existe o clareado que uma
 * dissolvência cruzada normal produziria no meio do caminho.
 *
 * A troca pausa quando a hero sai da tela: o resto da página tem animação
 * presa ao scroll, e não faz sentido gastar quadro repintando o que ninguém
 * está vendo.
 */
function rotacaoHero(q: (s: string) => HTMLElement[], root: HTMLElement): Cleanup {
  const slides = q("[data-hero-slide]");
  if (slides.length < 2) return () => {};

  const tl = gsap.timeline({ repeat: -1, paused: true });

  /* O tom vira no início da dissolvência: a transição de cor do texto tem a
     mesma duração, então as duas terminam juntas. */
  const tom = (el: HTMLElement) =>
    document.documentElement.setAttribute("data-hero-tom", el.dataset.tom ?? "claro");

  slides.forEach((_, i) => {
    const atual = slides[i];
    const proximo = slides[(i + 1) % slides.length];
    tl.set(proximo, { zIndex: 2 }, `+=${HERO_INTERVALO}`)
      .add(() => tom(proximo))
      .to(proximo, { opacity: 1, duration: HERO_TROCA, ease: EASE.linear })
      .set(atual, { opacity: 0 })
      .set(proximo, { zIndex: 1 });
  });

  const st = ScrollTrigger.create({
    trigger: root,
    start: "top bottom",
    end: "bottom top",
    onToggle: ({ isActive }) => (isActive ? tl.play() : tl.pause()),
  });

  tl.play();

  return () => {
    st.kill();
    tl.kill();
    gsap.set(slides, { clearProps: "zIndex,opacity" });
    gsap.set(slides[0], { opacity: 1 });
    tom(slides[0]);
  };
}

/* ---------------------------------------------------------------------------
   ANIMAR SÓ O QUE EXISTE

   `q()` devolve lista vazia quando a seção não tem aquele elemento — e é
   normal que não tenha: as três seções que compartilham a cena do rodapé têm
   marcações diferentes. O GSAP aceita a lista vazia, não anima nada e imprime
   "GSAP target not found" no console.

   O aviso não quebra nada, mas enche o console de ruído e esconde um erro de
   verdade no meio. `existindo()` simplesmente não cria o tween quando não há
   o que animar.
--------------------------------------------------------------------------- */
function existindo<T>(alvos: T[] | null | undefined): T[] | null {
  return alvos && alvos.length > 0 ? alvos : null;
}

export function openingScene(root: HTMLElement): Cleanup {
  const { q, one } = scoped(root);
  const mm = gsap.matchMedia();
  const splits: SplitText[] = [];
  const limpezas: Array<() => void> = [];

  mm.add({ desktop: MQ.desktop, mobile: MQ.mobile, reduce: MQ.reduce }, (ctx) => {
    const { desktop, reduce } = ctx.conditions as Record<string, boolean>;

    /* Movimento reduzido: nada se move, tudo está presente. A hero fica na
       primeira fotografia — trocar sozinha a cada poucos segundos é
       exatamente o tipo de movimento que a preferência pede para não ter. */
    if (reduce) return;

    limpezas.push(rotacaoHero(q, root));

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
      .to(q("[data-plate] .plate-media"), { scale: 1.04, ease: EASE.linear }, 0);

    /* O véu sobre a fotografia da hero nem sempre está no DOM — depende da
       composição da vez. Sem esta guarda o GSAP recebe `undefined` e imprime
       "GSAP target undefined not found" no console da home. */
    const veu = one("[data-plate-scrim]");
    if (veu) saida.to(veu, { autoAlpha: 0, ease: EASE.linear }, 0);

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

    /* O primeiro passo começava em 1 de uma timeline de 3,95 — um quarto do
       percurso preso rolando com a composição 01 parada. Começa em 0,5 e o
       intervalo cai de 1,7 para 1,45: as três composições passam a ocupar o
       trecho inteiro em vez de se amontoarem no fim. */
    [1, 2].forEach((i) => {
      const at = 0.5 + (i - 1) * 1.45;
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
        scrollTrigger: { trigger: root, start: "top 92%", end: "top 30%", scrub: true },
      }
    );

    const quadro = one("[data-teaser-frame]");
    const chamada = one("[data-fecho-chamada]") ?? root;

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
        /* O gatilho era `root`, cujo topo é o da faixa de degradê — 300px
           acima do texto. Com "top 40%" a máscara rodava com o título ainda
           fora da tela: quando a pessoa chegava nele, já estava parado, e a
           seção não tinha nenhum sinal de chegada. Ancorado na chamada e a
           88%, o título começa a subir enquanto a composição anterior ainda
           está saindo — que é a sobreposição que faltava. */
        scrollTrigger: { trigger: chamada, start: "top 88%", once: true },
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
        scrollTrigger: { trigger: chamada, start: "top 82%", once: true },
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

  /* A cor do header não entra na timeline: sobre a hero ela acompanha a
     fotografia da vez, que muda sozinha. Quem decide é o CSS, a partir de
     `data-solido` — aqui só se liga e desliga o atributo. */
  const solido = gsap
    .timeline({
      paused: true,
      onStart: () => root.setAttribute("data-solido", "sim"),
      onReverseComplete: () => root.removeAttribute("data-solido"),
    })
    .to(one("[data-header-surface]"), { autoAlpha: 1, duration: DUR.quick, ease: EASE.out }, 0)
    .to(one("[data-header-hairline]"), { scaleX: 1, duration: DUR.base, ease: EASE.out }, 0);

  /* Páginas sem hero — catálogo, produto — não têm fotografia atrás da
     navegação. O header nasce sólido nelas: transparente sobre bege claro é
     tipografia off-white sobre off-white, ou seja, um header invisível. */
  if (!hero) {
    root.setAttribute("data-solido", "sim");
    solido.progress(1).pause();
    return () => {
      root.removeAttribute("data-solido");
      solido.revert();
    };
  }

  const st = ScrollTrigger.create({
    trigger: hero,
    start: "bottom top+=88",
    onEnter: () => solido.play(),
    onLeaveBack: () => solido.reverse(),
  });

  return () => {
    st.kill();
    solido.revert();
    root.removeAttribute("data-solido");
  };
}



/* =========================================================================
   FECHO — informações da loja

   O capítulo anterior já levou o fundo ao carvão; aqui nada mais muda de
   humor. O movimento é o mais discreto do site de propósito: é a parte
   funcional da página, onde a pessoa procura endereço e contato, não uma
   cena a mais para assistir.
   ========================================================================= */
export function fechoScene(root: HTMLElement): Cleanup {
  const { q, one } = scoped(root);
  const mm = gsap.matchMedia();

  mm.add({ desktop: MQ.desktop, mobile: MQ.mobile, reduce: MQ.reduce }, (ctx) => {
    if ((ctx.conditions as Record<string, boolean>).reduce) return;

    const chamada = one("[data-fecho-chamada]") ?? root;

    /* Bege → carvão no fundo da página. A passagem que a pessoa VÊ é o
       degradê dentro de A SERENOU; isto aqui é só o fundo fixo atrás de
       tudo, para o overscroll no fim da página não mostrar bege por baixo
       do rodapé escuro. Por isso dispara tarde, quando a tela já está
       inteira tomada por seção escura e a troca é invisível.

       `fromTo` explícito porque o capítulo anterior deixou o fundo em bege —
       um `to` capturaria o valor errado ao ser criado. */
    if (root.hasAttribute("data-escurece-fundo")) {
      gsap.fromTo(
        document.querySelector("[data-canvas]"),
        { backgroundColor: "#e6dbcb" },
        {
          backgroundColor: "#16130f",
          ease: EASE.linear,
          immediateRender: false,
          scrollTrigger: { trigger: root, start: "top 90%", end: "top 55%", scrub: true },
        }
      );
    }

    const linhas = existindo(q("[data-fecho-line]"));
    if (linhas) gsap.fromTo(
      linhas,
      { yPercent: 108, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: EASE.out,
        scrollTrigger: { trigger: chamada, start: "top 82%", once: true },
      }
    );

    const reveals = existindo(q("[data-reveal]"));
    if (reveals) gsap.fromTo(
      reveals,
      { autoAlpha: 0, y: TRAVEL.md },
      {
        autoAlpha: 1,
        y: 0,
        duration: DUR.slow,
        stagger: 0.1,
        ease: EASE.out,
        scrollTrigger: { trigger: chamada, start: "top 76%", once: true },
      }
    );
  });

  return () => mm.revert();
}

/* Um marcador por seção, e nenhum repetido.
 *
 * `ASerenou`, `LojaFisica` e `Fecho` usavam os três `data-scene="fecho"`.
 * Nada quebrava, porque cada componente passa o próprio nó para a cena — mas
 * qualquer consulta global pegava o primeiro do DOM em vez do que se queria.
 * Aconteceu duas vezes durante a auditoria, comigo: medi "o rodapé" e estava
 * medindo A Serenou. Armadilha que só cobra depois.
 *
 * As três continuam usando `fechoScene`: a cena é a mesma (máscara de linha,
 * reveal e parallax), o que muda é onde ela é montada. */
export const SCENES = {
  "[data-scene='header']": headerScene,
  "[data-scene='teaser']": teaserScene,
  "[data-scene='opening']": openingScene,
  "[data-scene='leve']": leveScene,
  "[data-scene='versatil']": versatilScene,
  "[data-scene='serenou']": fechoScene,
  "[data-scene='loja']": fechoScene,
  "[data-scene='fecho']": fechoScene,
} as const;
