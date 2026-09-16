import { useEffect, useRef } from "react";
import { set, useFormValue, type ObjectInputProps } from "sanity";
import type { SlugValue } from "sanity";

/* ---------------------------------------------------------------------------
   O ENDEREÇO DA PÁGINA SE PREENCHE SOZINHO

   O campo é obrigatório e NÃO se preenchia sozinho: o Sanity oferece um botão
   "Gerar" que precisa ser clicado. Quem não clicasse só descobria no fim, com
   a publicação recusada por causa de um conceito — endereço de página — que
   não é da Grazi.

   Agora: enquanto o endereço estiver vazio, ele acompanha o nome da peça. Ela
   digita "Vestido Longo de Uma Alça" e o endereço vira
   `vestido-longo-de-uma-alca` sem que ela precise saber que isso existe.

   E PARA DE ACOMPANHAR ASSIM QUE EXISTIR

   Só preenche quando está VAZIO. Renomear uma peça já cadastrada não mexe no
   endereço — e isso é deliberado: o endereço é o link que circulou no
   WhatsApp e no Instagram. Trocá-lo transforma toda mensagem já enviada em
   404. É por isso que o campo mora numa gaveta chamada "Configuração
   avançada", fechada: quem precisar renomear de propósito abre e renomeia;
   ninguém tropeça nele por acaso.

   O componente envolve o campo original em vez de substituí-lo. O botão
   "Gerar", o aviso de endereço repetido e a validação nativa continuam
   funcionando — só deixaram de ser obrigatórios para a peça ir ao ar.
--------------------------------------------------------------------------- */

/** Nome da peça → endereço. Sem acento, sem símbolo, sem espaço. */
function endereco(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function EnderecoDaPagina(props: ObjectInputProps<SlugValue>) {
  const { value, onChange } = props;
  const nome = useFormValue(["nome"]) as string | undefined;

  /* O último valor que ESTE componente escreveu. Serve para não brigar com a
     Grazi: se ela apagar o endereço de propósito para escrever outro, a
     escrita automática não entra por cima enquanto ela digita. */
  const escritoPorNos = useRef<string | null>(null);

  useEffect(() => {
    const atual = value?.current?.trim();
    if (atual) return;
    if (!nome?.trim()) return;

    const novo = endereco(nome);
    if (!novo) return;
    if (escritoPorNos.current === novo) return;

    escritoPorNos.current = novo;
    onChange(set({ _type: "slug", current: novo }));
  }, [nome, value, onChange]);

  return props.renderDefault(props);
}
