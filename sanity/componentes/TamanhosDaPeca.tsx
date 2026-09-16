import { useCallback, useMemo } from "react";
import { Flex, Text } from "@sanity/ui";
import { insert, unset, type ArrayOfObjectsInputProps } from "sanity";
import { TAMANHOS_COMUNS, chave } from "./paleta";
import { ALTURA, COR, GRUPO, RAIO, ROTULO_GRUPO } from "./estilo";

/* ---------------------------------------------------------------------------
   TAMANHOS — OS CINCO DE SEMPRE, EM UM CLIQUE

   O atalho fica separado da lista por um fio e um rótulo, não por mais um
   cartão: o campo já mora dentro do cartão do formulário, e uma terceira
   moldura só empilha borda.

   P, M, G, GG e G1 é a grade da maioria das peças, e cadastrá-la eram cinco
   "Adicionar item" e cinco digitações. Aqui são cinco botões que alternam.

   O QUE CONTINUA POSSÍVEL, E POR QUE ISSO IMPORTA

   O array não mudou de forma. Abaixo dos botões continua o campo do Sanity
   inteiro, então:

     - "38", "40", "Único" entram por "Adicionar item", como sempre;
     - a ordem se muda arrastando;
     - "Tem esse tamanho" continua sendo o jeito de marcar esgotado — e
       desmarcar NÃO apaga o tamanho, ele fica riscado no site, que é o
       comportamento que a Grazi pediu;
     - peça sem tamanho nenhum continua sendo o caso normal de biquíni e
       acessório: lista vazia, e o site simplesmente não desenha o seletor.

   O botão só tira o tamanho quando ele está disponível. Um tamanho marcado
   como esgotado é informação que alguém colocou de propósito — tirá-lo com um
   toque acidental apagaria isso em silêncio. Nesse caso o botão fica em outro
   estado e a remoção acontece na lista, com o contexto na frente.
--------------------------------------------------------------------------- */

type Tamanho = { _key?: string; rotulo?: string; disponivel?: boolean };

export function TamanhosDaPeca(props: ArrayOfObjectsInputProps) {
  const { value, onChange, renderDefault } = props;

  const atuais = useMemo(() => (value ?? []) as Tamanho[], [value]);

  const alternar = useCallback(
    (rotulo: string) => {
      const existente = atuais.find(
        (t) => t?.rotulo?.trim().toLowerCase() === rotulo.toLowerCase()
      );

      if (!existente) {
        onChange(
          insert(
            [{ _type: "tamanho", _key: chave(), rotulo, disponivel: true }],
            "after",
            [-1]
          )
        );
        return;
      }

      /* Esgotado não sai por clique — ver o comentário do topo. */
      if (existente.disponivel === false) return;

      onChange(unset([{ _key: existente._key as string }]));
    },
    [atuais, onChange]
  );

  return (
    <Flex as="div" direction="column" gap={4}>
      {renderDefault(props)}

      <div style={GRUPO}>
        <Flex as="div" direction="column" gap={3}>
          <Text as="div" size={1} style={ROTULO_GRUPO}>
            Tamanhos mais usados
          </Text>

          <Flex as="div" gap={2} wrap="wrap">
            {TAMANHOS_COMUNS.map((rotulo) => {
              const t = atuais.find(
                (x) => x?.rotulo?.trim().toLowerCase() === rotulo.toLowerCase()
              );
              const estado = !t
                ? "fora"
                : t.disponivel === false
                  ? "esgotado"
                  : "dentro";

              return (
                <BotaoTamanho
                  key={rotulo}
                  rotulo={rotulo}
                  estado={estado}
                  aoClicar={() => alternar(rotulo)}
                />
              );
            })}
          </Flex>

          <Text as="div" size={1} muted>
            Clique para incluir ou tirar. Para 38, Único ou qualquer outro, use{" "}
            <strong>Adicionar item</strong> acima. Peça sem tamanho é só deixar
            a lista vazia.
          </Text>
        </Flex>
      </div>
    </Flex>
  );
}

function BotaoTamanho({
  rotulo,
  estado,
  aoClicar,
}: {
  rotulo: string;
  estado: "fora" | "dentro" | "esgotado";
  aoClicar: () => void;
}) {
  const dentro = estado !== "fora";
  const esgotado = estado === "esgotado";

  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-pressed={dentro}
      title={
        esgotado
          ? `${rotulo} está marcado como esgotado — mude na lista abaixo`
          : dentro
            ? `Tirar ${rotulo}`
            : `Incluir ${rotulo}`
      }
      style={{
        minWidth: 52,
        minHeight: ALTURA.controle,
        padding: "0 14px",
        borderRadius: RAIO.acao,
        border: `1px solid ${COR.fio}`,
        background: dentro && !esgotado ? COR.carvao : "transparent",
        color: dentro && !esgotado ? COR.linhoAlto : "inherit",
        opacity: esgotado ? 0.55 : 1,
        textDecoration: esgotado ? "line-through" : "none",
        cursor: esgotado ? "default" : "pointer",
        font: "inherit",
        fontSize: 13,
        letterSpacing: "0.04em",
      }}
    >
      {rotulo}
    </button>
  );
}
