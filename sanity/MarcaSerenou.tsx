/* O selo da Serenou no canto do painel.
 *
 * O selo e não o lettering: o espaço da marca na barra do Sanity é um
 * quadrado de 25px, e o lettering tem proporção 4:1 — ele entrava cortado no
 * meio da palavra. O selo é redondo e cabe inteiro.
 *
 * Mesma técnica do cabeçalho do site: o PNG entra como máscara e o desenho é
 * pintado com `currentColor`. Assim a marca acompanha a cor do texto da
 * barra em vez de ser uma imagem colada que erra o tom quando o fundo muda —
 * é o que faz ela funcionar tanto na barra carvão quanto no modo escuro.
 *
 * Sem suporte a máscara o selo viraria um quadrado sólido; nesse caso ele
 * simplesmente não aparece, e o nome "Painel da Serenou" ao lado continua
 * dizendo onde a pessoa está. */
export function MarcaSerenou() {
  return (
    <span
      aria-label="Serenou"
      title="Painel da Serenou"
      style={{
        display: "block",
        width: "100%",
        aspectRatio: "1",
        backgroundColor: "currentColor",
        WebkitMask:
          'url("/images/serenou/marca/serenou-selo-256.png") center / contain no-repeat',
        mask: 'url("/images/serenou/marca/serenou-selo-256.png") center / contain no-repeat',
      }}
    />
  );
}
