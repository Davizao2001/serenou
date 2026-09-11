import "./painel.css";

/* O Studio traz o próprio CSS e ocupa a tela inteira. Este layout existe para
   ele não herdar o respiro editorial do site e para pendurar a classe que o
   acabamento da marca usa como escopo — nada de `painel.css` vaza para o
   resto das páginas. */
export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return <div className="painel-serenou">{children}</div>;
}
