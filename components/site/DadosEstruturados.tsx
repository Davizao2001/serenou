/**
 * DADOS ESTRUTURADOS
 *
 * Um `<script type="application/ld+json">`, que é o formato que o Google
 * recomenda e o único que não obriga a sujar a marcação da página com
 * atributos.
 *
 * O conteúdo é JSON gerado por nós, a partir de `lib/loja.ts` e do próprio
 * produto — nunca de texto vindo de fora — então `dangerouslySetInnerHTML`
 * aqui não abre porta nenhuma. O `</` escapado é a única precaução que o
 * formato exige: sem ela, um nome de peça contendo `</script>` fecharia a
 * tag mais cedo. Nenhuma peça tem isso hoje, e é exatamente o tipo de coisa
 * que não se descobre por teste.
 */
export function DadosEstruturados({ dados }: { dados: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(dados).replace(/</g, "\\u003c"),
      }}
    />
  );
}
