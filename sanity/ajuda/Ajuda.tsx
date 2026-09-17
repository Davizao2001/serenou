import { useCallback } from "react";
import { useRouter, useRouterState } from "sanity/router";
import { ARTIGOS, PRIMEIRA_VEZ, artigoPor, type Acao, type Bloco } from "./artigos";
import { ALTURA, COR, RAIO } from "../componentes/estilo";

/* ---------------------------------------------------------------------------
   AJUDA — COMO USAR O PAINEL

   Uma ferramenta do Studio, ao lado de Peças na barra de cima. Duas telas: a
   lista de assuntos e o artigo.

   POR QUE TEM ROTA PRÓPRIA

   `router: route.create("/:artigo")` — ver sanity.config.ts. Sem isso, os
   links de ajuda espalhados pelo formulário só conseguiriam abrir a lista, e
   "Entenda Disponível, Esgotada e Oculta" cairia num índice em vez de no
   artigo. Com a rota, `/admin/ajuda/situacao` abre o artigo certo, o botão
   voltar do navegador funciona, e o endereço pode ser mandado para alguém.

   AS AÇÕES SÃO AS DO STUDIO, NÃO INVENTADAS

   "Cadastrar uma peça" usa o intent `create`, que é como o próprio Studio
   abre um formulário novo. "Ver as peças" navega para a lista de peças pelo
   caminho real da ferramenta. Nenhuma rota inventada, nada que quebre se o
   Studio mudar de endereço interno.

   O VISUAL É O DO PAINEL

   Mesma paleta, mesmo raio, mesma tipografia — os tokens vêm de
   `componentes/estilo.ts`, os mesmos que os campos usam. Sem vidro, sem cara
   de documentação de software: fio e espaço separam, não moldura em cima de
   moldura.
--------------------------------------------------------------------------- */

const LARGURA = "44rem";

export function Ajuda() {
  const router = useRouter();
  const estado = useRouterState() as { artigo?: string } | undefined;
  const artigo = artigoPor(estado?.artigo);

  const abrir = useCallback(
    (id: string) => router.navigate({ artigo: id }),
    [router]
  );
  const voltar = useCallback(() => router.navigate({}), [router]);

  return (
    <div style={{ height: "100%", overflow: "auto", background: COR.linho }}>
      <div style={{ maxWidth: LARGURA, margin: "0 auto", padding: "40px 20px 72px" }}>
        {artigo ? (
          <TelaDoArtigo artigo={artigo} aoVoltar={voltar} />
        ) : (
          <TelaInicial aoAbrir={abrir} />
        )}
      </div>
    </div>
  );
}

/* --- A lista de assuntos --------------------------------------------------- */

function TelaInicial({ aoAbrir }: { aoAbrir: (id: string) => void }) {
  return (
    <>
      <h1 style={{ ...TITULO, marginBottom: 8 }}>Como podemos ajudar?</h1>
      <p style={{ ...CORPO, opacity: 0.75, marginTop: 0, marginBottom: 32 }}>
        Encontre aqui as principais orientações para cadastrar e atualizar as
        peças da Serenou.
      </p>

      <section
        style={{
          borderTop: `1px solid ${COR.fio}`,
          borderBottom: `1px solid ${COR.fio}`,
          padding: "20px 0",
          marginBottom: 32,
        }}
      >
        <h2 style={ROTULO}>Primeira vez por aqui?</h2>
        <ol style={{ ...CORPO, margin: "12px 0 16px", paddingLeft: 20 }}>
          {PRIMEIRA_VEZ.map((passo) => (
            <li key={passo} style={{ marginBottom: 6 }}>
              {passo}
            </li>
          ))}
        </ol>
        <Acoes acoes={[{ rotulo: "Cadastrar uma peça", vai: "criar" }]} />
      </section>

      <h2 style={{ ...ROTULO, marginBottom: 4 }}>Assuntos</h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {ARTIGOS.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => aoAbrir(a.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "16px 0",
                border: 0,
                borderBottom: `1px solid ${COR.fio}`,
                background: "transparent",
                cursor: "pointer",
                font: "inherit",
                color: "inherit",
              }}
            >
              <span style={{ ...CORPO, display: "block", fontWeight: 600 }}>
                {a.titulo}
              </span>
              <span style={{ ...CORPO, display: "block", opacity: 0.7, fontSize: 14 }}>
                {a.resumo}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

/* --- O artigo -------------------------------------------------------------- */

function TelaDoArtigo({
  artigo,
  aoVoltar,
}: {
  artigo: NonNullable<ReturnType<typeof artigoPor>>;
  aoVoltar: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={aoVoltar}
        style={{
          border: 0,
          background: "transparent",
          padding: "0 0 20px",
          cursor: "pointer",
          font: "inherit",
          fontSize: 13,
          opacity: 0.7,
          color: "inherit",
        }}
      >
        ← Ajuda
      </button>

      <h1 style={{ ...TITULO, marginTop: 0, marginBottom: 28 }}>{artigo.titulo}</h1>

      {artigo.blocos.map((b, i) => (
        <BlocoDoArtigo key={i} bloco={b} />
      ))}

      {artigo.acoes && artigo.acoes.length > 0 && (
        <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid ${COR.fio}` }}>
          <Acoes acoes={artigo.acoes} />
        </div>
      )}
    </>
  );
}

function BlocoDoArtigo({ bloco }: { bloco: Bloco }) {
  switch (bloco.tipo) {
    case "texto":
      return <p style={{ ...CORPO, margin: "0 0 16px" }}>{comNegrito(bloco.texto)}</p>;

    case "passos":
      return (
        <ol style={{ ...CORPO, margin: "0 0 20px", paddingLeft: 22 }}>
          {bloco.itens.map((t) => (
            <li key={t} style={{ marginBottom: 8 }}>
              {t}
            </li>
          ))}
        </ol>
      );

    case "lista":
      return (
        <ul style={{ ...CORPO, margin: "0 0 20px", paddingLeft: 22 }}>
          {bloco.itens.map((t) => (
            <li key={t} style={{ marginBottom: 6 }}>
              {t}
            </li>
          ))}
        </ul>
      );

    case "destaque":
      /* Fio à esquerda, não cartão: o destaque separa sem empilhar mais uma
         borda dentro da coluna de leitura. */
      return (
        <p
          style={{
            ...CORPO,
            margin: "0 0 20px",
            paddingLeft: 16,
            borderLeft: `2px solid ${COR.carvao}`,
          }}
        >
          {bloco.texto}
        </p>
      );

    case "estados":
      return (
        <dl style={{ margin: "0 0 20px" }}>
          {bloco.itens.map((e) => (
            <div
              key={e.rotulo}
              style={{ paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${COR.fio}` }}
            >
              <dt style={{ ...ROTULO, marginBottom: 4 }}>{e.rotulo}</dt>
              <dd style={{ ...CORPO, margin: 0 }}>{e.texto}</dd>
            </div>
          ))}
        </dl>
      );

    case "etiqueta":
      return (
        <div style={{ margin: "0 0 20px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "5px 10px",
              marginBottom: 10,
              borderRadius: RAIO.mini,
              border: `1px solid ${COR.fio}`,
              background: COR.linhoAlto,
              fontSize: 11,
              letterSpacing: "0.09em",
              fontWeight: 600,
            }}
          >
            {bloco.exemplo}
          </span>
          <p style={{ ...CORPO, margin: 0 }}>{bloco.texto}</p>
        </div>
      );
  }
}

/* --- As ações -------------------------------------------------------------- */

function Acoes({ acoes }: { acoes: Acao[] }) {
  const router = useRouter();

  const ir = useCallback(
    (acao: Acao) => {
      if (acao.vai === "criar") {
        /* `create` é o intent que o próprio Studio usa para abrir um
           formulário novo. Resolver o link pelo router garante que ele
           continue certo mesmo se o caminho da ferramenta mudar. */
        router.navigateUrl({
          path: router.resolveIntentLink("create", { type: "produto" }),
        });
        return;
      }
      router.navigateUrl({ path: `${router.resolvePathFromState(null)}pecas` });
    },
    [router]
  );

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {acoes.map((a) => (
        <button
          key={a.rotulo}
          type="button"
          onClick={() => ir(a)}
          style={{
            minHeight: ALTURA.controle,
            padding: "0 18px",
            borderRadius: RAIO.acao,
            border: `1px solid ${COR.fio}`,
            background: COR.carvao,
            color: COR.linhoAlto,
            cursor: "pointer",
            font: "inherit",
            fontSize: 13,
            letterSpacing: "0.04em",
          }}
        >
          {a.rotulo} →
        </button>
      ))}
    </div>
  );
}

/* --- Tipografia ------------------------------------------------------------ */

const TITULO = {
  font: "inherit",
  fontSize: 28,
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
} as const;

const CORPO = {
  font: "inherit",
  fontSize: 15,
  lineHeight: 1.65,
} as const;

const ROTULO = {
  font: "inherit",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  margin: 0,
} as const;

/** `**assim**` vira negrito. É o único enfeite que o texto dos artigos
 *  aceita — mais que isso pediria um editor, e a ajuda não é conteúdo
 *  editorial. */
function comNegrito(texto: string) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith("**") && parte.endsWith("**") ? (
      <strong key={i} style={{ fontWeight: 600 }}>
        {parte.slice(2, -2)}
      </strong>
    ) : (
      parte
    )
  );
}
