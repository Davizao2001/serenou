"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap";
import { headerScene } from "@/lib/scenes";
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
const NAV = [
  { label: "Catálogo", href: "/catalogo" },
  ...[
    ...COLECOES.filter((c) => c.slug === "novidades"),
    ...CATEGORIAS,
    ...COLECOES.filter((c) => c.slug === "promocoes"),
  ].map((c) => ({ label: c.nome, href: `/catalogo?c=${c.slug}` })),
];

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

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-6 xl:gap-8">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="t-eyebrow tap block py-2 tracking-[0.14em] opacity-80 transition-opacity duration-200 hover:opacity-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
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
              className="t-eyebrow tap -mr-2 px-2 py-3 tracking-[0.14em] lg:hidden"
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
        className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-linho px-5 pb-16 pt-[calc(var(--header-h)+2rem)] lg:hidden"
      >
        <nav aria-label="Menu principal">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  /* O tamanho acompanha a altura da tela, não a largura: com oito
                     entradas, um iPhone SE deitado no limite de 640px só cabe
                     a lista inteira se a tipografia ceder um pouco. O teto de
                     2.4rem preserva a escala nos telefones altos. */
                  className="t-display block py-3 text-[clamp(1.75rem,5.1svh,2.4rem)] text-carvao"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={linkWhatsApp()}
          className="t-eyebrow tap mt-10 inline-block py-3 text-carvao-medio"
        >
          Falar no WhatsApp
        </a>
      </div>
    </>
  );
}
