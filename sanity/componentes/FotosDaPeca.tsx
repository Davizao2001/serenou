import { createContext, useCallback, useContext, useMemo } from "react";
import { set, unset, type ArrayOfObjectsInputProps } from "sanity";

/* ---------------------------------------------------------------------------
   AS FOTOS DA PEÇA — A GRADE, E QUEM PODE ESCREVER NELA

   Este componente quase não desenha nada. Ele existe por um motivo técnico
   que decidiu o formato de toda a tela de fotos.

   O PROBLEMA

   A pergunta que a tela precisa responder é "de que cor é esta foto?", e a
   resposta precisa ser editável ali mesmo, na miniatura. Mas `components.item`
   — o gancho que desenha cada foto — NÃO recebe `onChange`. Conferi nos tipos
   instalados: `BaseItemProps` não tem. O que ele recebe é `inputProps`, que
   tem `onChange` e que o próprio Sanity marca `@hidden @beta`.

   Usar `inputProps` seria o caminho curto e seria apostar numa API que eles
   avisaram que muda.

   O CAMINHO ESTÁVEL

   `components.input` do array recebe `ArrayOfObjectsInputProps`, com um
   `onChange` público — o mesmo que `CoresDaPeca` e `TamanhosDaPeca` já usam
   em produção. Daqui dá para escrever em qualquer item pela chave:

       onChange(set("Bordô", [{ _key: "abc" }, "cor"]))

   Então este componente fica com a permissão de escrita e a empresta para as
   miniaturas por contexto. `renderDefault(props)` desenha a grade inteira
   como filha, e contexto atravessa filho — a miniatura recebe a função sem
   que ninguém precise furar a API.

   A GRADE É DO SANITY

   `options: { layout: "grid" }` no schema faz o Studio trocar `ListArrayInput`
   por `GridArrayInput`. Continuam funcionando, sem uma linha nossa: arrastar
   arquivo para subir, arrastar miniatura para reordenar, o menu de cada foto,
   abrir para ajustar recorte e ponto de foco, remover.

   Nada aqui substitui isso. `renderDefault` é chamado inteiro.

   E A ORDEM CONTINUA SENDO UMA SÓ

   A posição no array `imagens` decide a foto da vitrine e a ordem da galeria
   no site. Por isso a tela é UMA grade, e não um bloco por cor: agrupar por
   cor desenharia uma segunda ordem aparente, e arrastar dentro de um bloco
   mudaria a posição global sem avisar. A cor é um carimbo na miniatura, não
   uma gaveta.
--------------------------------------------------------------------------- */

type TrocarCor = (chaveDaFoto: string, cor: string | null) => void;

const Escrita = createContext<TrocarCor | null>(null);

/** A função que grava a cor de uma foto, para quem desenha a miniatura.
 *  `null` quando a miniatura é renderizada fora deste input — aí ela mostra
 *  a cor sem deixar trocar, em vez de quebrar. */
export function useTrocarCorDaFoto(): TrocarCor | null {
  return useContext(Escrita);
}

export function FotosDaPeca(props: ArrayOfObjectsInputProps) {
  const { onChange, renderDefault } = props;

  const trocar = useCallback<TrocarCor>(
    (chaveDaFoto, cor) => {
      const caminho = [{ _key: chaveDaFoto }, "cor"];
      /* Vazio é `unset`, não string vazia: "sem cor" e "cor apagada" precisam
         ser o mesmo estado no documento, senão o GROQ do site veria `""` onde
         espera ausência, e `defined(cor)` passaria a ser verdade para uma
         foto geral. */
      onChange(cor ? set(cor, caminho) : unset(caminho));
    },
    [onChange]
  );

  const valor = useMemo(() => trocar, [trocar]);

  return <Escrita.Provider value={valor}>{renderDefault(props)}</Escrita.Provider>;
}
