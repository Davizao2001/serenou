/* O lettering da Serenou no canto do painel.
 *
 * Mesmo arquivo e mesma técnica do cabeçalho do site: o PNG entra como
 * máscara e o desenho é pintado com `currentColor`. Assim a marca acompanha
 * a cor do texto da barra, em vez de ser uma imagem colada que erra o tom
 * quando o fundo muda.
 *
 * Sem suporte a máscara, o lettering viraria um retângulo sólido — nesse
 * caso o nome aparece escrito, que é o comportamento do site também. */
export function MarcaSerenou() {
  return (
    <span
      aria-label="Serenou"
      title="Painel da Serenou"
      style={{
        display: "block",
        height: "1.05rem",
        aspectRatio: "4.016",
        backgroundColor: "currentColor",
        WebkitMask:
          'url("/images/serenou/marca/serenou-lettering-144.png") left center / contain no-repeat',
        mask: 'url("/images/serenou/marca/serenou-lettering-144.png") left center / contain no-repeat',
      }}
    />
  );
}
