import { Badge, Flex } from "@sanity/ui";
import { useFormValue, type ObjectItemProps } from "sanity";

/* ---------------------------------------------------------------------------
   O SELO NA MINIATURA DA FOTO

   Com seis fotos e três cores, saber qual está vinculada a quê exigia abrir
   uma a uma. Agora a linha da foto diz, antes de abrir:

     PRINCIPAL   a primeira da lista — é a que vai para a vitrine
     ● Preto     vinculada a uma cor: troca quando a cliente clica na bolinha
     GERAL       sem cor: fica na galeria e não responde a bolinha nenhuma

   E acumula: a primeira foto de uma peça em preto mostra PRINCIPAL e ● Preto.

   POR QUE `components.item` E NÃO `components.preview`

   O nome da cor vem do `preview.prepare` do próprio campo, que já sabe ler
   `cor`. Mas `prepare` não recebe a POSIÇÃO do item, e sem posição não há
   como saber qual é a primeira — que é justamente a informação que faltava.
   `components.item` recebe `index`. Então o selo de posição mora aqui e o
   resto continua vindo do preview.

   `renderDefault` é chamado e não substituído: a linha continua sendo a linha
   do Sanity, com arrastar para reordenar, abrir, remover e o menu de sempre.
   Só ganha uma faixa em cima. Trocar a linha inteira daria mais controle e
   custaria a reordenação, que já funciona e é exatamente o que a Grazi usa
   para escolher a foto da vitrine.
--------------------------------------------------------------------------- */

type Cor = { nome?: string; amostra?: { hex?: string } };
type ValorDaFoto = { cor?: string };

export function MiniaturaFoto(props: ObjectItemProps) {
  const { index, value, renderDefault } = props;

  const cores = (useFormValue(["cores"]) ?? []) as Cor[];
  const corDaFoto = (value as ValorDaFoto | undefined)?.cor;
  const hex = cores.find((c) => c?.nome === corDaFoto)?.amostra?.hex;

  const principal = index === 0;

  return (
    <div>
      <Flex as="div" gap={2} paddingBottom={2} align="center" wrap="wrap">
        {principal && (
          <Badge as="div" tone="primary" fontSize={0} padding={2} radius={2}>
            Principal
          </Badge>
        )}

        {corDaFoto ? (
          <Badge
            as="div"
            tone="default"
            fontSize={0}
            padding={2}
            radius={2}
            /* A bolinha entra como ponto antes do nome: o Badge do Sanity não
               aceita filho arbitrário sem quebrar o alinhamento vertical, e um
               caractere ● pintado resolve com metade do código. */
            style={hex ? { color: "inherit" } : undefined}
          >
            <span aria-hidden="true" style={{ color: hex ?? "inherit" }}>
              ●{" "}
            </span>
            {corDaFoto}
          </Badge>
        ) : (
          <Badge as="div" tone="default" fontSize={0} padding={2} radius={2}>
            Geral
          </Badge>
        )}

        {principal && (
          <div style={{ paddingLeft: 4 }}>
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              é a primeira imagem exibida no catálogo
            </span>
          </div>
        )}
      </Flex>

      {renderDefault(props)}
    </div>
  );
}
