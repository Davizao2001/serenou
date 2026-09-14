/**
 * ASSINATURA DA SETTEI
 *
 * Uma linha só, no pé do rodapé que já existe. Sem seção nova, sem card, sem
 * fundo próprio, sem CTA — assinatura de estúdio, não anúncio de agência.
 *
 * O LOCKUP É MONTADO AQUI, NÃO É UMA IMAGEM
 *
 *   símbolo   o arquivo oficial, recortado e com fundo transparente. O
 *             desenho não foi tocado: o que se fez foi separar a arte do
 *             papel — o alfa de cada pixel é a própria cobertura de tinta do
 *             original, então o antialias e a silhueta são os mesmos. A cor
 *             chapada em off-white é a versão negativa, autorizada, porque o
 *             azul-marinho da marca dá 1,1:1 sobre o carvão do rodapé.
 *   nome      texto de verdade. Não é imagem, então escala com o zoom, é
 *             selecionável, e um leitor de tela lê "Settei" em vez de
 *             descrever uma figura.
 *
 * A TIPOGRAFIA É PROVISÓRIA — E ESTÁ ISOLADA DE PROPÓSITO
 *
 * A fonte da identidade da Settei não está neste projeto e não deu para lê-la
 * do settei.com.br com as ferramentas daqui. Até o arquivo chegar, o nome sai
 * em Instrument Sans SemiBold, que o site já carrega — nenhuma requisição
 * nova. A escolha mora em `--font-settei`, em app/globals.css: trocar pela
 * fonte real é editar uma linha, e nada aqui muda.
 *
 * A ÁREA CLICÁVEL É A FRASE INTEIRA
 *
 * "Design e desenvolvimento por" + símbolo + nome são um link só. Alvo maior,
 * uma parada de teclado em vez de duas, e o leitor de tela anuncia o destino
 * inteiro de uma vez.
 */
export function AssinaturaSettei() {
  return (
    <a
      href="https://settei.com.br"
      target="_blank"
      rel="noopener noreferrer"
      /* Sem estilo de foco próprio: o projeto já tem um, em globals.css —
         `outline: 2px solid currentColor` com 4px de afastamento, em todo
         link e botão. Como a cor do contorno é a do texto, ele sai em
         off-white aqui e é visível sobre o carvão. Um anel só desta
         assinatura seria o único foco diferente do site inteiro. */
      className="tap inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-linho-alto/75 transition-colors duration-200 hover:text-linho-alto"
    >
      <span className="text-[0.75rem] leading-none">Design e desenvolvimento por</span>

      <span className="inline-flex items-center gap-[0.4375rem]">
        {/* `<picture>` e não `<img>` solto: é o mesmo padrão do resto do site,
            e é o que a regra do Next aceita sem apelar para next/image numa
            figura estática de 21x20px. */}
        <picture>
          <img
            src="/images/settei/simbolo-settei.png"
            alt=""
            aria-hidden="true"
            width={279}
            height={256}
            loading="lazy"
            decoding="async"
            className="block h-5 w-auto"
          />
        </picture>
        {/* `alt=""` acima e o nome aqui em texto: juntos eles já dizem
            "Settei" uma vez. Com alt="Settei" o leitor de tela diria duas. */}
        <span
          className="text-[0.9375rem] leading-none tracking-[0.005em]"
          style={{ fontFamily: "var(--font-settei)", fontWeight: 600 }}
        >
          Settei
        </span>
      </span>
    </a>
  );
}
