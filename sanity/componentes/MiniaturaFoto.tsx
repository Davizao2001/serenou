import { useCallback, useMemo } from "react";
import { useFormValue, type ObjectItemProps } from "sanity";
import { COR, RAIO } from "./estilo";
import { useTrocarCorDaFoto } from "./FotosDaPeca";

/* ---------------------------------------------------------------------------
   A MINIATURA, E A PERGUNTA QUE ELA RESPONDE

   Olhando a grade, a Grazi precisa saber de cada foto, sem abrir nada:

     PRINCIPAL · BORDÔ    a primeira da lista, vinculada ao bordô
     PRETO                vinculada: trocar a bolinha no site troca esta foto
     GERAL                sem cor: fica na galeria e não responde a bolinha

   E precisa poder CORRIGIR ali mesmo. Antes eram quatro toques — abrir o
   item, abrir o seletor, escolher, fechar. Agora são dois: abrir a faixa,
   escolher. Numa peça de 12 fotos isso é a diferença entre 48 e 24 toques.

   A FAIXA É O CONTROLE

   Não há um selo mostrando a cor e, ao lado, um seletor para mudá-la — seria
   a mesma informação duas vezes na largura de uma miniatura. A faixa É o
   `<select>`, com "PRINCIPAL ·" escrito antes dele quando for o caso. O que
   se lê é o que se clica.

   `<select>` nativo, e não um menu desenhado por nós, porque no telefone ele
   abre a roda do sistema — alvo grande, gesto conhecido — e porque teclado e
   leitor de tela já sabem operá-lo.

   QUEM DEIXA ESCREVER

   A função de gravar vem por contexto, de `FotosDaPeca`. O motivo está
   documentado lá: `components.item` não recebe `onChange`, e o que ele recebe
   é API marcada como beta pelo próprio Sanity. Sem o contexto — se alguém
   renderizar esta miniatura fora daquele input — a faixa vira texto e
   continua informando, em vez de quebrar.

   PEÇA SEM COR NENHUMA

   Três das dezoito peças do catálogo não têm cor. Nelas o seletor não
   aparece: escolher entre "geral" e nada é uma decisão que não existe. Fica
   só o PRINCIPAL na primeira foto.

   `renderDefault` continua sendo chamado inteiro: arrastar para reordenar,
   abrir para ajustar recorte e descrição, remover — tudo do Sanity.
--------------------------------------------------------------------------- */

type Cor = { nome?: string; amostra?: { hex?: string } };
type ValorDaFoto = { _key?: string; cor?: string };

const GERAL = "__geral__";
const VAZIO: Cor[] = [];

export function MiniaturaFoto(props: ObjectItemProps) {
  const { index, value, renderDefault } = props;

  /* `useFormValue` devolve `undefined` enquanto o campo não existe, e o
     `?? []` criava um array novo a cada render — o suficiente para invalidar
     todo `useMemo` abaixo. A lista vazia constante resolve. */
  const cores = (useFormValue(["cores"]) as Cor[] | undefined) ?? VAZIO;
  const foto = value as ValorDaFoto | undefined;
  const corDaFoto = foto?.cor;
  const chaveDaFoto = foto?._key;
  const trocarCor = useTrocarCorDaFoto();

  const principal = index === 0;

  /* A cor da foto pode não estar mais na lista da peça — acontece quando
     alguém renomeia ou remove uma cor com fotos vinculadas. Ela entra na
     lista de opções mesmo assim, senão o `<select>` mostraria outra coisa e a
     foto pareceria estar numa cor que não é a dela. */
  const opcoes = useMemo(() => {
    const nomes = cores.map((c) => c?.nome).filter(Boolean) as string[];
    if (corDaFoto && !nomes.some((n) => n === corDaFoto)) nomes.push(corDaFoto);
    return nomes;
  }, [cores, corDaFoto]);

  const hex = cores.find((c) => c?.nome === corDaFoto)?.amostra?.hex;

  const aoTrocar = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!trocarCor || !chaveDaFoto) return;
      const escolhido = e.currentTarget.value;
      trocarCor(chaveDaFoto, escolhido === GERAL ? null : escolhido);
    },
    [trocarCor, chaveDaFoto]
  );

  const podeTrocar = Boolean(trocarCor && chaveDaFoto && opcoes.length > 0);

  return (
    <div>
      {renderDefault(props)}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 6,
          minHeight: 24,
        }}
      >
        {principal && (
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Principal{opcoes.length > 0 ? " ·" : ""}
          </span>
        )}

        {opcoes.length > 0 && (
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              flex: "0 0 auto",
              borderRadius: "50%",
              border: `1px solid ${COR.fio}`,
              /* Sem cor vinculada a bolinha fica vazia, não colorida: um tom
                 qualquer ali diria que existe vínculo onde não existe. */
              background: corDaFoto ? (hex ?? COR.areia) : "transparent",
            }}
          />
        )}

        {podeTrocar ? (
          <select
            value={corDaFoto ?? GERAL}
            onChange={aoTrocar}
            aria-label="Cor desta foto"
            title="De que cor é esta foto"
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              minHeight: 24,
              padding: "0 2px",
              border: 0,
              background: "transparent",
              borderRadius: RAIO.mini,
              font: "inherit",
              fontSize: 10,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <option value={GERAL}>Geral</option>
            {opcoes.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        ) : (
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              fontWeight: 600,
              opacity: opcoes.length > 0 ? 1 : 0.6,
            }}
          >
            {opcoes.length > 0 ? (corDaFoto ?? "Geral") : principal ? "" : "Foto"}
          </span>
        )}
      </div>
    </div>
  );
}
