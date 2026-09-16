/* ---------------------------------------------------------------------------
   OS TOKENS DOS COMPONENTES DO PAINEL

   Os quatro componentes próprios desenhavam botão e bolinha com números
   escritos à mão em cada arquivo — 10px de raio aqui, 38px de altura ali,
   44px acolá. Funcionava e divergia: o botão de cor tinha 38 de altura e o de
   tamanho, 44, sem que ninguém tivesse decidido isso.

   Aqui ficam os valores, uma vez. Os raios são os mesmos de `app/globals.css`
   — escritos em pixel porque aquele arquivo não alcança a rota do painel — e
   a altura de controle é a do alvo de toque que o site já usa.

   As cores saem das variáveis que o `painel.css` declara em
   `.painel-serenou`, então um componente nunca escreve um hexadecimal da
   marca: se a paleta mudar lá, muda aqui junto.
--------------------------------------------------------------------------- */

export const RAIO = {
  /** Diálogo, popover, menu — o maior. */
  painel: 13,
  /** Cartão e aba. */
  cartao: 12,
  /** Botão, campo, seletor. */
  acao: 10,
  /** Miniatura de fotografia. */
  mini: 8,
} as const;

export const ALTURA = {
  /** Botão e campo. O mesmo alvo de toque do site. */
  controle: 44,
  /** Controle secundário: escolha de exemplo, filtro. */
  miudo: 32,
} as const;

export const COR = {
  carvao: "var(--serenou-carvao, #16130f)",
  linho: "var(--serenou-linho, #f2ece2)",
  linhoAlto: "var(--serenou-linho-alto, #f8f4ed)",
  areia: "var(--serenou-areia, #e6dbcb)",
  /** Fio de contorno — o mesmo peso do fio das amostras do site. */
  fio: "var(--serenou-fio, rgb(22 19 15 / 0.16))",
  fioForte: "var(--serenou-fio-forte, rgb(22 19 15 / 0.3))",
} as const;

/** Um botão que se escolhe: cor, tamanho, exemplo. Ligado = carvão sólido,
 *  que é o mesmo gesto do "QUERO ESSA PEÇA" da loja. */
export function botao(ligado: boolean, altura: number = ALTURA.controle) {
  return {
    minHeight: altura,
    borderRadius: RAIO.acao,
    border: `1px solid ${COR.fio}`,
    background: ligado ? COR.carvao : "transparent",
    color: ligado ? COR.linhoAlto : "inherit",
    cursor: "pointer",
    font: "inherit",
    fontSize: 13,
  } as const;
}

/** A amostra de cor, com o mesmo fio que a cliente vê no site. */
export function bolinha(tamanho: number, fundo?: string) {
  return {
    flex: "none",
    display: "block",
    width: tamanho,
    height: tamanho,
    borderRadius: 999,
    background: fundo ?? "transparent",
    boxShadow: `inset 0 0 0 1px ${fundo ? COR.fioForte : COR.fio}`,
  } as const;
}

/* ---------------------------------------------------------------------------
   O AGRUPAMENTO SEM CARTÃO

   O atalho de cores e o de tamanhos moravam dentro de um `Card` com borda,
   que por sua vez mora dentro do cartão do campo, que mora no cartão do
   formulário. Três molduras para separar uma coisa de outra.

   Agora o que separa é um fio em cima e um rótulo — espaço e hierarquia em
   vez de mais uma caixa.
--------------------------------------------------------------------------- */
export const GRUPO = {
  borderTop: `1px solid ${COR.fio}`,
  paddingTop: 16,
  marginTop: 4,
} as const;

export const ROTULO_GRUPO = {
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  opacity: 0.62,
} as const;
