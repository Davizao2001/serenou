import Link from "next/link";
import { CATEGORIAS, COLECOES } from "@/lib/loja";

/**
 * TRILHO DE CATEGORIAS — SÓ NO TELEFONE
 *
 * No desktop este trilho não existe. O menu do topo já lista as mesmas oito
 * categorias, a noventa pixels de distância na vertical, e repetir a mesma
 * navegação duas vezes na mesma tela não é redundância inofensiva: são duas
 * listas quase idênticas competindo pela mesma decisão, e a pessoa precisa
 * ler as duas para descobrir que são a mesma coisa.
 *
 * No telefone é o contrário: o menu do topo vive atrás do botão "Menu", e
 * sem este trilho a cliente teria que abrir uma gaveta para trocar de
 * categoria. Aqui ele é o único caminho, e por isso fica.
 *
 * SÃO LINKS, NÃO BOTÕES
 *
 * Antes eram botões que mexiam em estado do React e reescreviam a URL por
 * fora. Agora apontam para `?c=`, o mesmo endereço que o menu do desktop usa
 * — a seleção tem uma fonte só. O `<Link>` do Next continua trocando a
 * página sem recarregar, então não se perde velocidade; o que se ganha é
 * que abrir /catalogo?c=vestidos direto e clicar em "Vestidos" passam a ser
 * literalmente o mesmo caminho.
 */
export function FiltroCategorias({ ativo }: { ativo: string }) {
  const categorias = [
    { slug: "tudo", nome: "Todas" },
    ...CATEGORIAS.map((c) => ({ slug: c.slug, nome: c.nome })),
  ];
  const colecoes = COLECOES.map((c) => ({ slug: c.slug, nome: c.nome }));

  const item = (i: { slug: string; nome: string }) => {
    const selecionado = i.slug === ativo;
    return (
      <li key={i.slug}>
        <Link
          href={i.slug === "tudo" ? "/catalogo" : `/catalogo?c=${i.slug}`}
          scroll={false}
          aria-current={selecionado ? "page" : undefined}
          className={`t-eyebrow tap block whitespace-nowrap border-b py-2 text-[0.6875rem] transition-colors duration-200 ${
            selecionado
              ? "border-carvao text-carvao"
              : "border-transparent text-carvao-fraco"
          }`}
        >
          {i.nome}
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label="Categorias" className="lg:hidden">
      {/* A rolagem lateral é do trilho, nunca da página: as margens negativas
          fazem o trilho sangrar até a borda da tela, para não parecer que a
          lista acabou onde o padding acaba.

          `overflow-y-hidden` explícito, e não por capricho: pelo CSS, quando
          um eixo deixa de ser `visible` o outro vira `auto` sozinho. Pedir só
          rolagem lateral ligava a vertical de brinde, e bastava 1px de
          diferença entre conteúdo e caixa para o Windows desenhar uma barra
          com setas ao lado de "Promoções". O respiro de baixo garante que não
          sobre nada — com o eixo escondido, sobra vira corte, e o que seria
          cortado é o anel de foco de quem navega por teclado. */}
      <div className="-mx-5 overflow-x-auto overflow-y-hidden px-5 md:-mx-8 md:px-8">
        <ul className="flex w-max min-w-full items-center gap-6 pb-4 md:gap-8">
          {categorias.map(item)}
          <li aria-hidden="true" className="h-3 w-px shrink-0 bg-areia-forte" />
          {colecoes.map(item)}
        </ul>
      </div>
    </nav>
  );
}
