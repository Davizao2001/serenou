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
/* "Catálogo" saiu da lista e virou entrada própria.
 *
 * Ele nunca foi uma categoria: é o acesso à vitrine inteira, a única entrada
 * que não filtra nada. Enquanto estava no mesmo `<ul>` com o mesmo peso, lia
 * como mais um recorte ao lado de Vestidos e Blusas. Agora tem peso um pouco
 * maior e um fio de divisão depois — o suficiente para dizer "este é o
 * caminho geral, estes são os recortes" sem virar botão. */
const CATALOGO = { label: "Catálogo", href: "/catalogo" };

const CATEGORIAS_NAV = [
  ...COLECOES.filter((c) => c.slug === "novidades"),
  ...CATEGORIAS,
  ...COLECOES.filter((c) => c.slug === "promocoes"),
].map((c) => ({ label: c.nome, href: `/catalogo?c=${c.slug}` }));

const NAV = [CATALOGO, ...CATEGORIAS_NAV];

export function Header() {
  const header = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

        <div className="relative mx-auto grid h-full max-w-[112rem] grid-cols-[auto_1fr_auto] items-center gap-6 px-5 md:px-8 lg:px-12 xl:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="tap block" aria-label="Serenou, início">
            <span className="marca-serenou" aria-hidden="true" />
            <span
              className="marca-texto t-display text-[1.05rem] tracking-[0.3em] lg:text-[1.2rem]"
              style={{ fontVariationSettings: '"wdth" 124, "wght" 500' }}
            >
              Serenou
            </span>
          </Link>

          {/* A LINHA CHEIA COMEÇA EM 1280, NÃO EM 1024
              A tipografia desce de 0,75rem para 0,6875rem e o tracking de
              0,14em para 0,1em — com doze rótulos, o espaço entre letras custa
              mais largura que as próprias letras.

              Ainda assim doze não cabem em 1024: medido, a lista pedia 838px e
              empurrava a pílula do WhatsApp para fora da tela. Havia como
              forçar, caindo para 10px — e 10px em caixa alta com tracking
              largo fica abaixo do piso de legibilidade que o próprio projeto
              escreveu em `.t-eyebrow`. Entre espremer a tipografia e adiar a
              linha cheia, adia-se a linha: de 1024 a 1279 vale o botão Menu,
              que abre a mesma lista com Guia de medidas e WhatsApp dentro. */}
          <nav aria-label="Principal" className="hidden xl:block">
            <ul className="flex items-center gap-4 2xl:gap-5">
              <li>
                <Link
                  href={CATALOGO.href}
                  className="t-eyebrow tap block py-2 text-[0.6875rem] tracking-[0.1em] transition-opacity duration-200 hover:opacity-100"
                  style={{ fontWeight: 600 }}
                >
                  {CATALOGO.label}
                </Link>
              </li>
              {/* Fio de divisão, não separador de menu: 1px de altura de
                  letra, na cor do texto a 25%. Marca a fronteira sem virar
                  desenho. */}
              <li aria-hidden="true" className="h-3 w-px shrink-0 bg-current opacity-25" />

              {CATEGORIAS_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="t-eyebrow tap block py-2 text-[0.6875rem] tracking-[0.1em] opacity-75 transition-opacity duration-200 hover:opacity-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              <li aria-hidden="true" className="h-3 w-px shrink-0 bg-current opacity-25" />
              <li>
                <GuiaMedidas aparencia="menu" className="text-[0.6875rem] tracking-[0.1em]" />
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
            {/* O WhatsApp é o único caminho de venda do site, e estava com o
                mesmo peso de "Calças". Ganhou fundo carvão e texto claro —
                dentro da paleta, sem cor nova e sem virar botão de banner.

                `header-acao` é a exceção necessária: o header troca de tinta
                por cima da hero (`header-tinta`), e uma pílula sólida que
                herda essa tinta some na fotografia escura. A regra está em
                globals.css e fixa o contraste nos dois estados. */}
            <a
              href={linkWhatsApp()}
              className="header-acao t-eyebrow tap hidden px-5 py-3 text-[0.6875rem] tracking-[0.1em] transition-opacity duration-200 hover:opacity-90 sm:inline-block"
            >
              Falar no WhatsApp
            </a>
            <button
              type="button"
              data-menu-toggle
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              onClick={() => setMenuOpen((v) => !v)}
              className="t-eyebrow tap -mr-2 px-2 py-3 text-[0.6875rem] tracking-[0.1em] xl:hidden"
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
        className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-linho px-5 pb-16 pt-[calc(var(--header-h)+2rem)] md:px-8 lg:px-12 xl:hidden"
      >
        <nav aria-label="Menu principal">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  /* O tamanho acompanha a altura da tela, não a largura: com
                     nove entradas, um iPhone SE deitado no limite de 640px só
                     cabe a lista inteira se a tipografia ceder um pouco. O
                     teto preserva a escala nos telefones altos. */
                  className={`t-display block py-2.5 text-[clamp(1.5rem,4.4svh,2.1rem)] ${
                    item.href === CATALOGO.href ? "text-carvao" : "text-carvao"
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
