import { Acordeao } from "./Acordeao";
import { GuiaMedidas } from "./GuiaMedidas";
import type { Produto } from "@/lib/catalogo";

/**
 * FICHA LATERAL — QUATRO ENTRADAS, E SÓ AS QUE TÊM CONTEÚDO
 *
 * A referência visual tem quatro acordeões sempre abertos à direita:
 * detalhes, medidas, cuidados, entrega e troca. Aqui existem os quatro, mas
 * cada um só aparece se houver dado REAL por trás:
 *
 *   DETALHES DA PEÇA     `detalhes[]` do Sanity. Hoje: as duas ou três linhas
 *                        que a Grazi escreveu. Não viram cinco benefícios.
 *   TAMANHOS E MEDIDAS   os tamanhos cadastrados, quando houver, mais o guia
 *                        de medidas. Aparece sempre, porque a ajuda pelo
 *                        WhatsApp é uma oferta verdadeira mesmo sem tabela.
 *   CUIDADOS COM A PEÇA  NÃO EXISTE no Sanity hoje. O componente está pronto
 *                        e a seção fica escondida — "lavar à mão", "não usar
 *                        secadora" e temperatura são instruções que estragam
 *                        roupa quando erradas, e ninguém confirmou nenhuma.
 *   ENTREGA E TROCA      NÃO EXISTE no Sanity hoje. Frete, prazo, cobertura e
 *                        política de troca são promessa comercial: escrever
 *                        uma sem a Grazi ter dito vira obrigação dela.
 *
 * As duas últimas ligam sozinhas no dia em que os campos existirem — é só
 * passar as props. Nada aqui precisa ser reescrito.
 */
export function FichaLateral({
  produto,
  cor,
  /** Cuidados com a peça. Campo ainda inexistente no Sanity: ver o cabeçalho. */
  cuidados = [],
  /** Política de entrega e troca. Idem. */
  entrega = [],
}: {
  produto: Produto;
  cor: string | null;
  cuidados?: string[];
  entrega?: string[];
}) {
  const temDetalhes = produto.detalhes.length > 0;
  const temTamanhos = produto.tamanhos.length > 0;

  return (
    <aside className="border border-areia-forte px-5">
      {temDetalhes && (
        <Acordeao titulo="Detalhes da peça" aberto>
          <ul className="space-y-2.5">
            {produto.detalhes.map((d) => (
              <li key={d} className="flex items-start gap-2.5">
                {/* Marcador neutro. A referência põe um ícone diferente em
                    cada linha; para isso o código teria que adivinhar que
                    "Tecido: viscose" é tecido e "Zero transparência" é
                    caimento — classificar texto livre da Grazi por palpite.
                    Um traço não classifica nada e não erra. */}
                <span
                  aria-hidden="true"
                  className="mt-[0.5625rem] block h-px w-2.5 shrink-0 bg-carvao/30"
                />
                <span className="t-body text-[0.8125rem] leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </Acordeao>
      )}

      <Acordeao titulo="Tamanhos e medidas" aberto={!temDetalhes}>
        {temTamanhos ? (
          <>
            <p className="t-body text-[0.8125rem] leading-relaxed">
              Esta peça está cadastrada em{" "}
              {produto.tamanhos.map((t) => t.rotulo).join(", ")}.
            </p>
            <div className="mt-3">
              <GuiaMedidas nome={produto.nome} cor={cor} />
            </div>
          </>
        ) : (
          <>
            <p className="t-body text-[0.8125rem] leading-relaxed">
              A tabela de medidas está em atualização. Para saber qual tamanho
              serve, fale com a gente — conferimos a peça antes de você pedir.
            </p>
            <div className="mt-3">
              <GuiaMedidas nome={produto.nome} cor={cor} />
            </div>
          </>
        )}
      </Acordeao>

      {/* Só ligam quando existir dado. Ver o cabeçalho deste arquivo. */}
      {cuidados.length > 0 && (
        <Acordeao titulo="Cuidados com a peça">
          <ul className="space-y-2.5">
            {cuidados.map((c) => (
              <li key={c} className="t-body text-[0.8125rem] leading-relaxed">
                {c}
              </li>
            ))}
          </ul>
        </Acordeao>
      )}

      {entrega.length > 0 && (
        <Acordeao titulo="Entrega e troca">
          <ul className="space-y-2.5">
            {entrega.map((e) => (
              <li key={e} className="t-body text-[0.8125rem] leading-relaxed">
                {e}
              </li>
            ))}
          </ul>
        </Acordeao>
      )}
    </aside>
  );
}
