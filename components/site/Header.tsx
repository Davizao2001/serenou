"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap";
import { headerScene } from "@/lib/scenes";
import { GuiaMedidas } from "@/components/ui/GuiaMedidas";
import { CATEGORIAS, COLECOES, linkWhatsApp } from "@/lib/loja";

/* O menu e a arquitetura comercial são a mesma coisa.
 *
 * Antes esta lista era escrita à mão e tinha saído de sincronia: trazia
 * "Casual", que não é categoria, e não trazia Calças, Blusas nem Promoções.
 * Duas entradas apontavam para o mesmo endereço, o que além de confuso
 * repetia a chave de lista no React.
 *
 * Agora ela sai de `lib/loja.ts`. Cadastrar uma categoria nova lá coloca a
 * entrada no menu do desktop e do telefone, e a sincronia deixa de depender
 * de alguém lembrar.
 *
 * "Catálogo" abre a lista: é a única entrada que não filtra nada. Sem ela o
 * menu inteiro era um conjunto de recortes e não existia caminho para ver
 * tudo — quem não sabe o que procura ficava sem porta de entrada.
 *
 * Depois vêm Novidades, as categorias e Promoções. Novidades é o que a
 * pessoa procura antes de saber que peça quer; Promoções é o que ela procura
 * quando o preço importa. As duas são flags no produto, não categorias — um
 * vestido em promoção continua em Vestidos e aparece também em Promoções,
 * sem cadastro duplicado.
 */
/* O MENU ENCOLHEU PORQUE A LISTA ERA A ERRADA, NÃO A TIPOGRAFIA
 *
 * Havia doze entradas numa linha: Catálogo, Novidades, seis categorias,
 * Promoções, Guia de medidas e WhatsApp. Isso não é menu de loja de autor, é
 * barra de marketplace — e o peso vinha da quantidade, não do tamanho da
 * letra. Encolher a fonte teria escondido o sintoma.
 *
 * As seis CATEGORIAS entraram numa gaveta sob Catálogo, que é onde elas já
 * pertenciam: "que tipo de peça" é uma pergunta só, com seis respostas.
 *
 * Novidades e Promoções ficaram fora da gaveta de propósito. Elas não são
 * categorias — são coleções transversais, e respondem a outra pergunta:
 * "o que chegou" e "o que está mais barato". Um vestido em promoção está nas
 * duas. Enfiá-las junto das categorias misturaria os dois eixos e obrigaria
 * quem procura promoção a abrir uma gaveta de tipos de roupa.
 *
 * Sobraram cinco entradas. E aí veio o ganho que eu não esperava: com cinco,
 * a linha inteira volta a caber em 1024px. O botão Menu no notebook, que eu
 * tinha aceitado como o preço de manter a tipografia legível, deixou de ser
 * necessário — a mesma decisão que custava uma concessão agora devolve ela.
 */
/* ENTRADA VAZIA NÃO ENTRA NO MENU
 *
 * "Novidades" e "Promoções" dependem de a Grazi marcar a peça; uma categoria
 * depende de ter peça cadastrada nela. Enquanto não houver, a entrada leva a
 * uma lista vazia — e por meses foi exatamente isso: dois dos nove itens do
 * menu do telefone abriam o nada.
 *
 * `secoes` vem do servidor, de uma contagem no catálogo. Sem ela — ou se a
 * leitura falhar — o menu aparece inteiro, como sempre apareceu: esconder é
 * para quando se sabe que está vazio, e não saber não é saber.
 */
const CATALOGO = { label: "Catálogo", href: "/catalogo" };

const entrada = (c: { slug: string; nome: string }) => ({
  label: c.nome,
  href: `/catalogo?c=${c.slug}`,
});

export type SecoesDoMenu = {
  categorias: string[];
  novidades: boolean;
  promocoes: boolean;
};

export function Header({ secoes }: { secoes?: SecoesDoMenu }) {
  const header = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  /* As seis que vivem dentro da gaveta — só as que têm peça. */
  const CATEGORIAS_GAVETA = CATEGORIAS.filter(
    (c) => !secoes || secoes.categorias.includes(c.slug)
  ).map(entrada);

  /* As coleções, soltas na barra. */
  const temColecao = (slug: string) =>
    !secoes || (slug === "novidades" ? secoes.novidades : secoes.promocoes);
  const COLECOES_NAV = COLECOES.filter((c) => temColecao(c.slug)).map(entrada);

  /* O menu do telefone continua mostrando tudo em lista — lá não há gaveta,
     e esconder categorias atrás de um toque a mais seria piorar. */
  const NAV_MOBILE = [
    CATALOGO,
    ...COLECOES.filter((c) => c.slug === "novidades" && temColecao(c.slug)).map(entrada),
    ...CATEGORIAS_GAVETA,
    ...COLECOES.filter((c) => c.slug === "promocoes" && temColecao(c.slug)).map(entrada),
  ];

  useGSAP(
    () => {
      const el = header.current;
      if (!el) return;
      return headerScene(el);
    },
    { scope: header }
  );

  return (
    <>
      <header
        ref={header}
        data-scene="header"
        /* A cor segue a fotografia da hero enquanto ele está por cima dela;
           depois da hero fica sólido sobre linho e volta ao carvão. */
        className="header-tinta fixed inset-x-0 top-0 z-50 h-[var(--header-h)]"
      >
        {/* Superfície sólida — some sobre a hero, entra depois dela */}
        <div
          data-header-surface
          aria-hidden="true"
          className="absolute inset-0 bg-linho-alto/92 opacity-0 backdrop-blur-[6px]"
        />
        <div
          data-header-hairline
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-areia-forte"
        />

        <div className="relative mx-auto grid h-full max-w-[112rem] grid-cols-[auto_1fr_auto] items-center gap-6 px-5 md:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-12">
          <Link href="/" className="tap block" aria-label="Serenou, início">
            <span className="marca-serenou" aria-hidden="true" />
            <span
              className="marca-texto t-display text-[1.05rem] tracking-[0.3em] lg:text-[1.2rem]"
              style={{ fontVariationSettings: '"wdth" 124, "wght" 500' }}
            >
              Serenou
            </span>
          </Link>

          {/* Cinco entradas. A tipografia fica em 11px — o tracking cai de
              0,1em para 0,07em, e é dali que vem o aperto visual do rótulo,
              não do corpo da letra. O respiro entre as entradas aumenta
              (16px → 26px): com poucos itens, ar é sofisticação; apertar
              cinco coisas no meio da barra seria desperdiçar o espaço que
              acabou de sobrar. */}
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-[1.625rem]">
              <li className="gaveta relative">
                <Link
                  href={CATALOGO.href}
                  className="menu-item tap flex items-center gap-1.5 py-2"
                  style={{ fontWeight: 600 }}
                >
                  {CATALOGO.label}
                  {/* A seta promete uma gaveta. Sem categoria com peça não há
                      gaveta, e a seta viraria uma promessa vazia. */}
                  {CATEGORIAS_GAVETA.length > 0 && (
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 fill-none stroke-current opacity-60"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m4 6.5 4 4 4-4" />
                    </svg>
                  )}
                </Link>

                {/* A gaveta. Encosta no item, sem seta e sem sombra pesada:
                    é uma folha de papel sobre a página, não um painel de
                    aplicativo. O `pt-3` fora do quadro mantém o caminho do
                    mouse contínuo entre o rótulo e a lista — sem ele a gaveta
                    fecha no meio do trajeto.

                    O RAIO DE DENTRO É O DE FORA MENOS O RESPIRO
                    13px de quadro com 6px de respiro pede 7px nos itens. Com
                    8px por dentro — o valor do primeiro teste — o canto do
                    item corria por fora da curva do quadro nos 45°, que é
                    justamente onde o olho percebe que duas curvas não são
                    concêntricas. Não é sutileza gratuita: é a mesma conta que
                    a fotografia e o cartão já seguem no resto do site.

                    12,5rem e não 13,5: "Macaquinhos", o rótulo mais longo,
                    ocupa 88px. A gaveta não precisa ser larga, precisa ser
                    calma. */}
                {CATEGORIAS_GAVETA.length > 0 && (
                <div className="gaveta-painel absolute left-1/2 top-full z-50 w-[12.5rem] -translate-x-1/2 pt-3">
                  <div className="rounded-[var(--r-painel)] border border-areia-forte/60 bg-linho-alto p-1.5 shadow-[0_10px_28px_-20px_rgba(22,19,15,0.32)]">
                    <Link
                      href={CATALOGO.href}
                      className="menu-gaveta-item block rounded-[0.4375rem] px-3 py-2"
                    >
                      Ver todas
                    </Link>
                    <span
                      aria-hidden="true"
                      className="mx-3 my-1 block h-px bg-areia-forte/60"
                    />
                    <ul>
                      {CATEGORIAS_GAVETA.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            className="menu-gaveta-item block rounded-[0.4375rem] px-3 py-2"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                )}
              </li>

              {COLECOES_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="menu-item tap block py-2">
                    {item.label}
                  </Link>
                </li>
              ))}

              <li aria-hidden="true" className="h-2.5 w-px shrink-0 bg-current opacity-20" />
              <li>
                <GuiaMedidas aparencia="menu" className="menu-item" />
              </li>
            </ul>
          </nav>

          <div className="col-start-3 flex items-center justify-end gap-6">
            {/* Existia um "Buscar" aqui. Era um botão sem função nenhuma:
                sem clique, sem rota, sem tela. Botão que não faz nada é pior
                que ausência de botão — a pessoa clica, nada acontece, e ela
                passa a duvidar do resto da página.
                Busca não estava no que foi combinado com a Grazi. Quando
                entrar, entra com tela e resultado; até lá, não fica de
                enfeite. O menu já dá conta: Catálogo mostra tudo e as
                categorias recortam. */}
            {/* RESTAURADO AO ESTADO ANTERIOR À REFORMULAÇÃO DO MENU
                Tirado de `f4e387c:components/site/Header.tsx`, o commit
                imediatamente anterior ao que transformou isto numa pílula
                sólida. Texto, classes, padding, opacidade e o ponto de corte
                em `sm` são os mesmos byte a byte — não é aproximação visual.
                O número e o link continuam os de hoje. */}
            <a
              href={linkWhatsApp()}
              className="t-eyebrow tap hidden py-3 tracking-[0.14em] opacity-80 transition-opacity duration-200 hover:opacity-100 sm:inline-block"
            >
              WhatsApp
            </a>
            <button
              type="button"
              data-menu-toggle
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              onClick={() => setMenuOpen((v) => !v)}
              className="t-eyebrow tap -mr-2 px-2 py-3 text-[0.6875rem] tracking-[0.1em] lg:hidden"
            >
              {menuOpen ? "Fechar" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile — sequência vertical, mesma tipografia do site */}
      <div
        id="menu-mobile"
        hidden={!menuOpen}
        /* Sete entradas cabem em 360x640 com 37px de sobra — e a barra do
            Safari no iPhone come mais que isso quando reaparece. `overflow-y`
            e o respiro embaixo garantem que a última entrada continue
            alcançável em qualquer altura de tela. */
        className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-linho px-5 pb-16 pt-[calc(var(--header-h)+2rem)] md:px-8 lg:hidden"
      >
        <nav aria-label="Menu principal">
          <ul className="flex flex-col gap-1">
            {NAV_MOBILE.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  /* O tamanho acompanha a altura da tela, não a largura: com
                     nove entradas, um iPhone SE deitado no limite de 640px só
                     cabe a lista inteira se a tipografia ceder um pouco. O
                     teto preserva a escala nos telefones altos. */
                  className={`t-display block py-2.5 text-[clamp(1.5rem,4.4svh,2.1rem)] ${
                    "text-carvao"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mesma divisão do desktop: categorias acima, ferramentas abaixo. */}
        <div className="mt-8 border-t border-areia-forte pt-6">
          <GuiaMedidas aparencia="menu-mobile" aoAbrir={() => setMenuOpen(false)} />

          {/* O WhatsApp fecha o menu com o mesmo peso que tem no topo: é para
              onde a conversa vai, e no telefone é onde ela costuma começar. */}
          <a
            href={linkWhatsApp()}
            onClick={() => setMenuOpen(false)}
            className="t-eyebrow tap mt-4 flex items-center justify-center gap-2.5 bg-carvao px-6 py-4 text-[0.6875rem] tracking-[0.14em] text-linho-alto transition-colors duration-200 hover:bg-[#241f19]"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 shrink-0 fill-none stroke-current"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.5-4.6A7.5 7.5 0 1 1 20 11.5Z" />
            </svg>
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
