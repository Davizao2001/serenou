import { useCallback, useMemo } from "react";
import { Flex, Select, Text } from "@sanity/ui";
import { set, unset, useFormValue, type StringInputProps } from "sanity";
import { COR, RAIO, bolinha } from "./estilo";

/* ---------------------------------------------------------------------------
   "ESTA FOTO É DE" — A LISTA, NO LUGAR DA DIGITAÇÃO

   Era um campo de texto livre. A validação cruzada impedia o erro — compara o
   que foi digitado com as cores da peça, ignorando acento e caixa — mas a
   Grazi ainda precisava DIGITAR "Azul-marinho" certo, uma vez por foto,
   quarenta e cinco vezes no lote de setembro.

   Agora ela escolhe. A lista sai das cores cadastradas na própria peça, lidas
   do documento aberto: `useFormValue(["cores"])` devolve o valor atual do
   campo, inclusive o que ela acabou de digitar e ainda não salvou. Acrescentou
   uma cor na aba ao lado, ela já aparece aqui.

   A validação do schema continua onde estava. Ela virou rede, não porteira:
   pega o documento antigo cadastrado à mão e o caso em que alguém renomeia uma
   cor e deixa fotos apontando para o nome velho.

   POR QUE UM `<select>` NATIVO

   Porque é o controle que o telefone da Grazi já sabe desenhar: no iPhone ele
   abre a roda nativa, com alvo de toque grande e sem nenhum JavaScript de
   posicionamento para dar errado. Um menu próprio ficaria mais bonito no
   desktop e pior onde ela realmente usa.

   A bolinha da cor vai ao lado do seletor, não dentro dele — `<option>` não
   aceita marcação. Ela mostra o tom exato que a cliente vai ver no site, que é
   o que faz "Azul" ser reconhecível mesmo fotografando como turquesa.
--------------------------------------------------------------------------- */

type Cor = { _key?: string; nome?: string; amostra?: { hex?: string } };

/** Sem cor marcada, a foto é geral: fica na galeria e não responde a bolinha
 *  nenhuma. É o padrão, e é o caso de foto de detalhe, de costas, ou de peça
 *  fotografada em duas cores ao mesmo tempo. */
const GERAL = "";

export function CorDaFoto(props: StringInputProps) {
  const { value, onChange, elementProps } = props;

  /* Caminho absoluto a partir da raiz do documento, não relativo a este
     campo — é assim que `useFormValue` funciona, e é o que permite a um input
     dentro de `imagens[]` enxergar `cores` lá em cima. */
  const doFormulario = useFormValue(["cores"]);
  const cores = useMemo(() => (doFormulario ?? []) as Cor[], [doFormulario]);

  const nomes = useMemo(
    () => cores.map((c) => c?.nome).filter((n): n is string => Boolean(n)),
    [cores]
  );

  const hexEscolhido = useMemo(() => {
    const achada = cores.find((c) => c?.nome === value);
    return achada?.amostra?.hex;
  }, [cores, value]);

  const aoTrocar = useCallback(
    (evento: React.ChangeEvent<HTMLSelectElement>) => {
      const escolhido = evento.currentTarget.value;
      onChange(escolhido === GERAL ? unset() : set(escolhido));
    },
    [onChange]
  );

  /* Peça sem cor nenhuma não ganha seletor: não há o que escolher, e um campo
     vazio com uma opção só é ruído. A frase diz onde resolver. */
  if (nomes.length === 0) {
    return (
      <div
        style={{
          padding: "10px 12px",
          borderRadius: RAIO.acao,
          border: `1px solid ${COR.fio}`,
        }}
      >
        <Text as="div" size={1} muted>
          Esta peça ainda não tem cores. Cadastre as cores em{" "}
          <strong>Cores e tamanhos</strong> para poder vincular uma foto a uma
          delas.
        </Text>
      </div>
    );
  }

  /* Uma cor gravada que não existe mais na peça — ela renomeou ou removeu a
     cor depois de marcar a foto. O valor continua na lista para não sumir em
     silêncio, e o aviso abaixo explica o que fazer. */
  const orfa = Boolean(value) && !nomes.includes(value as string);

  return (
    <Flex as="div" direction="column" gap={3}>
      <Flex as="div" align="center" gap={3}>
        <Bolinha hex={hexEscolhido} vazia={!value} />
        <Select
          {...elementProps}
          value={value ?? GERAL}
          onChange={aoTrocar}
          fontSize={2}
          padding={3}
        >
          <option value={GERAL}>Foto geral — não é de uma cor</option>
          {nomes.map((nome) => (
            <option key={nome} value={nome}>
              {nome}
            </option>
          ))}
          {orfa && (
            <option value={value as string}>{value} — cor removida</option>
          )}
        </Select>
      </Flex>

      {orfa ? (
        <Text as="div" size={1} style={{ color: "#8f3d2f" }}>
          A cor <strong>{value}</strong> não existe mais nesta peça. Escolha
          outra, ou cadastre a cor de novo em Cores e tamanhos.
        </Text>
      ) : (
        <Text as="div" size={1} muted>
          {value
            ? "Essa foto aparece quando a cliente seleciona essa cor."
            : "Foto geral: fica na galeria e não responde a nenhuma bolinha."}
        </Text>
      )}
    </Flex>
  );
}

/** A amostra, do mesmo tamanho e com o mesmo fio que a cliente vê no site. */
function Bolinha({ hex, vazia }: { hex?: string; vazia?: boolean }) {
  return <span aria-hidden="true" style={bolinha(22, vazia ? undefined : hex)} />;
}
