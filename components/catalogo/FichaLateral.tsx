import { Acordeao } from "./Acordeao";
import { GuiaMedidas } from "@/components/ui/GuiaMedidas";
import { ENTREGAS } from "@/lib/loja";
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
 *                        de medidas, que agora tem a tabela real da Grazi.
 *   ENTREGA              as três formas que a Grazi confirmou em 13/09. É
 *                        dado GLOBAL, não do produto: vem de `ENTREGAS`, em
 *                        lib/loja.ts, e vale para todas as peças.
 *   CUIDADOS COM A PEÇA  NÃO EXISTE no Sanity. O componente está pronto e a
 *                        seção fica escondida — "lavar à mão", "não usar
 *                        secadora" e temperatura são instruções que estragam
 *                        roupa quando erradas, e ninguém confirmou nenhuma.
 *
 * "ENTREGA", e não "ENTREGA E TROCA": as três formas de envio estão
 * confirmadas, a política de troca não. Um título que promete os dois assuntos
 * e entrega um deixa a cliente procurando pelo que não está lá — e é pior que
 * isso, porque ela pode concluir que a troca existe nos termos que imaginou.
 */
export function FichaLateral({
  produto,
  /** Cuidados com a peça. Campo ainda inexistente no Sanity: ver o cabeçalho. */
  cuidados = [],
}: {
  produto: Produto;
  cuidados?: string[];
}) {
  const temDetalhes = produto.detalhes.length > 0;
  const temTamanhos = produto.tamanhos.length > 0;

  return (
    <aside className="rounded-[var(--r-painel)] border border-areia-forte/80 px-5">
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
                <span className="t-body text-[0.84375rem] leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </Acordeao>
      )}

      <Acordeao titulo="Tamanhos e medidas" aberto={!temDetalhes}>
        {temTamanhos ? (
          <>
            <p className="t-body text-[0.84375rem] leading-relaxed">
              Esta peça está cadastrada em{" "}
              {produto.tamanhos.map((t) => t.rotulo).join(", ")}.
            </p>
            <div className="mt-3">
              <GuiaMedidas nome={produto.nome} />
            </div>
          </>
        ) : (
          <>
            <p className="t-body text-[0.84375rem] leading-relaxed">
              Esta peça ainda não tem grade cadastrada. Veja a referência de
              tamanhos da Serenou ou fale com a gente.
            </p>
            <div className="mt-3">
              <GuiaMedidas nome={produto.nome} />
            </div>
          </>
        )}
      </Acordeao>

      {/* Só ligam quando existir dado. Ver o cabeçalho deste arquivo. */}
      {cuidados.length > 0 && (
        <Acordeao titulo="Cuidados com a peça">
          <ul className="space-y-2.5">
            {cuidados.map((c) => (
              <li key={c} className="t-body text-[0.84375rem] leading-relaxed">
                {c}
              </li>
            ))}
          </ul>
        </Acordeao>
      )}

      {/* Global, igual em toda peça. Prazo, preço do frete, janela do motoboy
          e condições de retirada NÃO estão aqui porque não foram ditos — são
          justamente o que a cliente pergunta no WhatsApp, e a Grazi responde. */}
      <Acordeao titulo="Entrega">
        <ul className="space-y-2.5">
          {ENTREGAS.map((e) => (
            <li key={e} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[0.5625rem] block h-px w-2.5 shrink-0 bg-carvao/30"
              />
              <span className="t-body text-[0.84375rem] leading-relaxed">{e}</span>
            </li>
          ))}
        </ul>
      </Acordeao>
    </aside>
  );
}
