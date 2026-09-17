import { useCallback, useMemo } from "react";
import { Flex, Text } from "@sanity/ui";
import { insert, useFormValue, type ArrayOfObjectsInputProps } from "sanity";
import { CORES_DA_LOJA, chave, valorDeCor } from "./paleta";
import { ALTURA, COR, GRUPO, RAIO, ROTULO_GRUPO, bolinha } from "./estilo";

/* ---------------------------------------------------------------------------
   CORES DA SERENOU — O ATALHO ABAIXO DA LISTA

   Adicionar uma cor eram quatro passos: "Adicionar item", digitar o nome,
   abrir o seletor, achar o tom. Vezes três, em toda peça.

   Agora as cores que a loja realmente usa estão à mão: um clique preenche
   nome e amostra juntos. O resto do campo continua sendo o array do Sanity —
   `renderDefault` desenha a lista, com arrastar para reordenar, abrir para
   editar e remover. Nada foi substituído.

   SEM CARTÃO DENTRO DE CARTÃO

   O atalho morava num `Card` com borda, dentro do cartão do campo, dentro do
   cartão do formulário: três molduras para separar uma coisa só. Agora o que
   separa é um fio e um rótulo — o agrupamento é de espaço e hierarquia, não
   de mais uma caixa.

   O QUE ESTE COMPONENTE NÃO FAZ, DE PROPÓSITO

   Não normaliza nome. Clicar em "Bordô" grava Bordô; clicar em "Vinho" grava
   Vinho. Se a Grazi abrir a cor depois e trocar o nome para "Marsala", fica
   Marsala. A lista é atalho de digitação, não vocabulário controlado — e essa
   distinção é a diferença entre poupar trabalho dela e decidir por ela.

   Cor já cadastrada some do atalho: oferecer de novo o que já está na peça só
   produz duplicata, e duplicata quebra o vínculo das fotos (duas bolinhas
   "Verde" e nenhuma forma de saber qual é qual).
--------------------------------------------------------------------------- */

type Cor = { _key?: string; nome?: string; amostra?: { hex?: string } };
type Foto = { cor?: string };

const SEM_FOTOS: Foto[] = [];

export function CoresDaPeca(props: ArrayOfObjectsInputProps) {
  const { value, onChange, renderDefault } = props;

  const jaTem = useMemo(
    () =>
      new Set(
        ((value ?? []) as Cor[])
          .map((c) => c?.nome?.trim().toLowerCase())
          .filter(Boolean) as string[]
      ),
    [value]
  );

  const disponiveis = CORES_DA_LOJA.filter(
    (c) => !jaTem.has(c.nome.toLowerCase())
  );

  const acrescentar = useCallback(
    (nome: string, hex: string) => {
      onChange(
        insert(
          [{ _type: "cor", _key: chave(), nome, amostra: valorDeCor(hex) }],
          "after",
          [-1]
        )
      );
    },
    [onChange]
  );

  return (
    <Flex as="div" direction="column" gap={4}>
      {renderDefault(props)}

      <ContagemDeFotos cores={(value ?? []) as Cor[]} />

      {disponiveis.length > 0 && (
        <div style={GRUPO}>
          <Flex as="div" direction="column" gap={3}>
            <Text as="div" size={1} style={ROTULO_GRUPO}>
              Cores da Serenou
            </Text>

            <Flex as="div" gap={2} wrap="wrap">
              {disponiveis.map((c) => (
                <BotaoDeCor
                  key={c.nome}
                  nome={c.nome}
                  hex={c.hex}
                  aoEscolher={() => acrescentar(c.nome, c.hex)}
                />
              ))}
            </Flex>

            <Text as="div" size={1} muted>
              Um clique já preenche o nome e a bolinha. Para uma cor que não
              está aqui, use <strong>Adicionar item</strong> acima.
            </Text>
          </Flex>
        </div>
      )}
    </Flex>
  );
}

/** Um botão que é a própria bolinha com o nome ao lado — a Grazi reconhece a
 *  cor pelo tom, não pela palavra, e no telefone o alvo é o botão inteiro. */
function BotaoDeCor({
  nome,
  hex,
  aoEscolher,
}: {
  nome: string;
  hex: string;
  aoEscolher: () => void;
}) {
  return (
    <button
      type="button"
      onClick={aoEscolher}
      title={`Acrescentar ${nome}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        minHeight: ALTURA.controle,
        padding: "0 14px 0 10px",
        borderRadius: RAIO.acao,
        border: `1px solid ${COR.fio}`,
        background: "transparent",
        cursor: "pointer",
        font: "inherit",
        fontSize: 13,
        color: "inherit",
      }}
    >
      <span aria-hidden="true" style={bolinha(18, hex)} />
      {nome}
    </button>
  );
}

/* ---------------------------------------------------------------------------
   QUANTAS FOTOS CADA COR TEM

   A validação deste campo já avisa "essa cor está em 3 fotos, troque antes de
   remover" — mas só na hora de remover, e antes disso o número era invisível.
   Uma cor sem foto nenhuma não é erro (o site mostra as fotos das outras e
   avisa a cliente), e é exatamente o tipo de coisa que passa despercebida até
   a peça estar no ar.

   A contagem lê `imagens` por `useFormValue`, que é o valor ATUAL do
   formulário: marcar uma foto como bordô na grade acima muda este número na
   mesma hora, sem salvar.

   Compara sem acento e sem caixa pelo mesmo motivo da validação: "Azul
   marinho" e "Azul-marinho" são a mesma cor para quem cadastrou e nomes
   diferentes para o `===`.
--------------------------------------------------------------------------- */
function ContagemDeFotos({ cores }: { cores: Cor[] }) {
  /* Array constante quando o campo ainda não existe: `?? []` inline criaria
     uma referência nova a cada render e derrubaria o `useMemo` abaixo. */
  const fotos = (useFormValue(["imagens"]) as Foto[] | undefined) ?? SEM_FOTOS;

  const linhas = useMemo(() => {
    const igual = (a: string) =>
      a.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const usadas = fotos.map((f) => f?.cor).filter(Boolean) as string[];

    return cores
      .filter((c) => c?.nome)
      .map((c) => ({
        nome: c.nome as string,
        hex: c.amostra?.hex,
        quantas: usadas.filter((u) => igual(u) === igual(c.nome as string)).length,
      }));
  }, [cores, fotos]);

  if (linhas.length === 0) return null;

  const gerais = fotos.filter((f) => !f?.cor?.trim()).length;

  return (
    <Flex as="div" gap={3} wrap="wrap" align="center">
      {linhas.map((l) => (
        <Flex as="div" key={l.nome} gap={2} align="center">
          <span aria-hidden="true" style={bolinha(12, l.hex ?? "#cbbda6")} />
          <Text as="div" size={1} muted>
            {l.nome} · {l.quantas === 0 ? "sem foto" : l.quantas === 1 ? "1 foto" : `${l.quantas} fotos`}
          </Text>
        </Flex>
      ))}
      {gerais > 0 && (
        <Text as="div" size={1} muted>
          Gerais · {gerais === 1 ? "1 foto" : `${gerais} fotos`}
        </Text>
      )}
    </Flex>
  );
}
