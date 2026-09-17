import type { FieldProps } from "sanity";
import { LinkDeAjuda } from "./LinkDeAjuda";

/* ---------------------------------------------------------------------------
   UM CAMPO COM UMA LINHA DE AJUDA EMBAIXO

   `components.field` envolve o campo inteiro — rótulo, microajuda, controle e
   validação. Aqui o campo do Sanity é desenhado igual, por `renderDefault`, e
   ganha uma linha depois. Nada do comportamento nativo muda.

   Existe porque a `description` do schema aceita só texto: não dá para pôr um
   link ali. Este é o gancho que o Sanity oferece de propósito para o caso.
--------------------------------------------------------------------------- */

export function campoComAjuda(artigo: string, texto: string) {
  const Campo = (props: FieldProps) => (
    <div>
      {props.renderDefault(props)}
      <LinkDeAjuda artigo={artigo} texto={texto} />
    </div>
  );
  Campo.displayName = `CampoComAjuda(${artigo})`;
  return Campo;
}
