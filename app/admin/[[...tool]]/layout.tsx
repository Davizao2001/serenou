/* O Studio traz o próprio CSS e ocupa a tela inteira. Este layout existe só
   para ele não herdar o respiro editorial do site — nenhum wrapper, nenhuma
   classe, nenhuma margem. */
export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return children;
}
