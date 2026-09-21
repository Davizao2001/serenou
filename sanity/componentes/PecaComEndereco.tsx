import { useEffect, useRef } from "react";
import { set, type ObjectInputProps } from "sanity";
import { endereco } from "./endereco";

/* ---------------------------------------------------------------------------
   O ENDEREÇO DA PÁGINA SE PREENCHE SOZINHO — AGORA DE UM LUGAR QUE EXISTE

   POR QUE ISTO MUDOU DE LUGAR

   O preenchimento morava dentro do componente do campo `slug`, e o campo mora
   no fieldset "Configuração avançada", que abre fechado. O Sanity NÃO monta os
   filhos de um fieldset fechado — `FormFieldSet` faz `if (collapsed) { ... }` e
   devolve `null` no lugar do conteúdo. Componente não montado, efeito nunca
   roda, endereço nunca preenchido.

   O efeito disso no uso real era o pior tipo de erro: a Grazi cadastrava tudo
   certo, a aba Revisar dizia que estava tudo certo, e o botão de publicar
   recusava com um marcador em `slug.current` escrito "Required", em inglês,
   dentro de uma gaveta que ela não tinha motivo para abrir.

   O CONSERTO

   `components.input` no próprio tipo `produto`. O input do documento sempre
   renderiza — é a raiz do formulário, não um campo dentro de uma gaveta — e
   recebe `ObjectInputProps` com um `onChange` público, que aceita um patch em
   qualquer caminho do documento. É a mesma API que os inputs de array já usam
   aqui; nada de `inputProps`, que o Sanity marca como beta.

   AS QUATRO REGRAS, E ONDE CADA UMA ESTÁ

     nome existe e endereço vazio   → gera            (as duas guardas abaixo)
     endereço já existe             → não toca        `atual?.trim()` sai cedo
     gaveta fechada                 → continua gerando  este componente é a raiz
     nome vazio                     → não inventa     `nome?.trim()` sai cedo

   E PARA DE ACOMPANHAR ASSIM QUE EXISTIR

   Só preenche quando está VAZIO. Renomear uma peça já cadastrada não mexe no
   endereço, e isso é deliberado: o endereço é o link que circulou no WhatsApp
   e no Instagram. Trocá-lo transforma toda mensagem já enviada em 404.

   `ultimo` guarda o que ESTE componente escreveu por último, para não brigar
   com a Grazi: se ela apagar o endereço de propósito para escrever outro, a
   escrita automática não entra por cima enquanto ela digita.
--------------------------------------------------------------------------- */

type Peca = { nome?: string; slug?: { current?: string } };

export function PecaComEndereco(props: ObjectInputProps) {
  const { value, onChange, renderDefault } = props;

  const doc = value as Peca | undefined;
  const nome = doc?.nome;
  const atual = doc?.slug?.current;

  const ultimo = useRef<string | null>(null);

  useEffect(() => {
    if (atual?.trim()) return;
    if (!nome?.trim()) return;

    const novo = endereco(nome);
    if (!novo) return;
    if (ultimo.current === novo) return;

    ultimo.current = novo;
    onChange(set({ _type: "slug", current: novo }, ["slug"]));
  }, [nome, atual, onChange]);

  return renderDefault(props);
}
