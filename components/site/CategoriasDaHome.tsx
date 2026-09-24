import Link from "next/link";
import { CATEGORIAS } from "@/lib/loja";
import { produtosVisiveis, type Produto } from "@/lib/catalogo";

/**
 * O ÍNDICE DA LOJA
 *
 * A home terminava sem saída. Depois da vitrine — que fica na terceira tela
 * — vinham seis telas de narrativa e, no fim delas, "A Serenou" em carvão,
 * sem um único caminho de volta para a roupa. Quem lesse a página inteira
 * chegava ao fim dela mais longe do catálogo do que quando começou.
 *
 * Este bloco fecha a narrativa com as portas. Não é o mesmo que a vitrine
 * acima: lá estão quatro PEÇAS, escolhidas; aqui estão os seis TIPOS, todos.
 * Uma responde "o que tem de bonito", a outra "onde fica o que eu vim
 * procurar" — e quem veio procurar vestido não devia precisar abrir o
 * catálogo inteiro para achar a prateleira.
 *
 * A HIERARQUIA ESTÁ INVERTIDA DE PROPÓSITO
 *
 * O título é pequeno e as categorias são grandes. Numa seção de navegação o
 * conteúdo são os destinos; o título é só a placa em cima deles. Dar à placa
 * o tamanho de manchete faria o olho ler "O que você procura" antes de ler
 * as respostas — que é a ordem errada.
 *
 * O tamanho e a caixa alta são os mesmos do menu do telefone. É vocabulário
 * repetido de propósito: quem já abriu o menu reconhece a lista, e a loja
 * passa a ter um jeito só de dizer "estes são os tipos de peça".
 *
 * O NÚMERO NÃO É ENFEITE
 *
 * "7 peças" ao lado de Conjuntos é a única informação desta seção que não
 * está em nenhum outro lugar da home, e é a que responde à pergunta que
 * antecede o clique: vale a pena entrar aqui? Um índice sem número obriga a
 * abrir seis gavetas para descobrir que cinco têm uma peça.
 *
 * CATEGORIA VAZIA NÃO APARECE
 *
 * Mesma regra do menu: porta que não leva a lugar nenhum não é navegação.
 * Se o catálogo inteiro sumir — ou a leitura falhar, e `listarProdutos`
 * devolver vazio — a seção não se desenha, em vez de virar seis linhas
 * dizendo "0 peças".
 */
/** As portas que existem, na ordem do menu, com quantas peças cada uma tem.
 *  Separada do desenho para poder ser conferida sem navegador — é a regra,
 *  e regra que não se confere é regra que volta quebrada. */
export function portasDaLoja(
  lista: Produto[]
): Array<{ slug: string; nome: string; quantas: number }> {
  const visiveis = produtosVisiveis(lista);
  return CATEGORIAS.map((c) => ({
    slug: c.slug as string,
    nome: c.nome as string,
    quantas: visiveis.filter((p) => p.categoria === c.slug).length,
  })).filter((c) => c.quantas > 0);
}

export function CategoriasDaHome({ lista }: { lista: Produto[] }) {
  const portas = portasDaLoja(lista);

  if (portas.length === 0) return null;

  return (
    <section
      aria-labelledby="indice-titulo"
      /* O respiro de baixo é curto: logo abaixo vem a faixa de degradê de
         "A Serenou", 24svh de bege escurecendo até o carvão. Com o respiro
         cheio das outras seções, os dois somavam meia tela de nada entre a
         última porta e a primeira palavra do capítulo seguinte. */
      className="px-5 pb-[5svh] pt-[8svh] md:px-8 lg:px-12 lg:pb-[6svh] lg:pt-[10svh]"
    >
      <div className="mx-auto max-w-[112rem]">
        <h2 id="indice-titulo" className="t-eyebrow mb-7 text-carvao-fraco md:mb-9">
          O que você procura
        </h2>

        {/* Duas colunas a partir de `lg`. Com seis entradas isso dá três
            linhas de cada lado — uma coluna só espalharia o índice por uma
            tela inteira de desktop, e três colunas apertariam "Macaquinhos"
            contra o número. */}
        <ul className="grid gap-x-16 border-t border-areia-forte lg:grid-cols-2 lg:gap-x-24">
          {portas.map((c) => (
            <li key={c.slug} className="border-b border-areia-forte">
              {/* A linha inteira é o alvo: o fio embaixo já diz onde ela
                  começa e acaba, e no telefone acertar um nome de 30px de
                  altura é diferente de acertar uma faixa de 80. */}
              <Link
                href={`/catalogo?c=${c.slug}`}
                className="indice-linha group flex items-baseline justify-between gap-6 py-5 md:py-6"
              >
                <span
                  className="t-display uppercase leading-none tracking-[0.01em]"
                  style={{ fontSize: "clamp(1.375rem, 5.2vw, 2.25rem)" }}
                >
                  {c.nome}
                </span>
                <span className="t-eyebrow shrink-0 text-[0.6875rem] text-carvao-fraco">
                  {c.quantas} {c.quantas === 1 ? "peça" : "peças"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
