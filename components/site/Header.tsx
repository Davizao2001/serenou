"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap";
import { headerScene } from "@/lib/scenes";
import { linkWhatsApp } from "@/lib/loja";

const NAV = [
  { label: "Novidades", href: "#novidades" },
  { label: "Vestidos", href: "#vestidos" },
  { label: "Conjuntos", href: "#conjuntos" },
  { label: "Casual", href: "#casual" },
  { label: "Praia", href: "#praia" },
  { label: "Sobre", href: "#sobre" },
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
        className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)] text-linho-alto"
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
          <a href="#topo" className="tap block" aria-label="Serenou, início">
            <span className="marca-serenou" aria-hidden="true" />
            <span
              className="marca-texto t-display text-[1.05rem] tracking-[0.3em] lg:text-[1.2rem]"
              style={{ fontVariationSettings: '"wdth" 124, "wght" 500' }}
            >
              Serenou
            </span>
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="t-eyebrow tap tracking-[0.14em] opacity-80 transition-opacity duration-200 hover:opacity-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-start-3 flex items-center justify-end gap-6">
            <button
              type="button"
              className="t-eyebrow tap py-3 tracking-[0.14em] opacity-80 transition-opacity duration-200 hover:opacity-100"
            >
              Buscar
            </button>
            <a
              href={linkWhatsApp()}
              className="t-eyebrow tap hidden tracking-[0.14em] opacity-80 transition-opacity duration-200 hover:opacity-100 sm:inline"
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
        className="fixed inset-0 z-40 bg-linho px-5 pt-[calc(var(--header-h)+2rem)] lg:hidden"
      >
        <nav aria-label="Principal — mobile">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="t-display block py-3 text-[2.4rem] text-carvao"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={linkWhatsApp()}
          className="t-eyebrow mt-10 inline-block text-carvao-medio"
        >
          Falar no WhatsApp
        </a>
      </div>
    </>
  );
}
