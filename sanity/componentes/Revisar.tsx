import { useMemo, useState } from "react";
import imageUrlBuilder from "@sanity/image-url";
import { Badge, Card, Flex, Text } from "@sanity/ui";
import type { SanityDocument } from "sanity";
import { dataset, projectId } from "../env";
import { CATEGORIAS, formatarPrecoCentavos, mensagemProduto } from "./ponte";

/* ---------------------------------------------------------------------------
   REVISAR — A PEÇA COMO ELA VAI FICAR

   Última aba antes de publicar. Responde três perguntas de uma vez: o que eu
   cadastrei, falta alguma coisa, e o que chega no meu WhatsApp.

   LÊ O QUE ESTÁ NA TELA, NÃO O QUE ESTÁ GRAVADO

   O Sanity entrega à view um `document.displayed`: os valores ATUAIS do
   formulário, incluindo o que a Grazi acabou de digitar e ainda não publicou.
   Consultar o dataset de novo mostraria a versão anterior — ela mudaria o
   preço, abriria Revisar e veria o preço velho. Seria pior do que não ter a
   aba.

   A MENSAGEM É A MESMA FUNÇÃO DO SITE

   `mensagemProduto()` mora em lib/loja.ts e é quem monta o texto que a cliente
   envia no botão "Quero essa peça". A prévia chama essa função — não uma cópia
   parecida. Uma regra de montagem, dois lugares mostrando o resultado: o dia
   em que a mensagem mudar, ela muda nos dois sem ninguém lembrar.

   A cor e o tamanho da prévia são EXEMPLO, escolhidos aqui e nunca gravados
   na peça. A legenda diz isso, porque uma prévia que parece configuração é
   uma armadilha.
--------------------------------------------------------------------------- */

type Cor = { _key?: string; nome?: string; amostra?: { hex?: string } };
type Tamanho = { _key?: string; rotulo?: string; disponivel?: boolean };
type Foto = { _key?: string; cor?: string; alt?: string; asset?: { _ref?: string } };

type Peca = SanityDocument & {
  nome?: string;
  slug?: { current?: string };
  preco?: number;
  precoAnterior?: number;
  categoria?: string;
  resumo?: string;
  status?: string;
  novidade?: boolean;
  promocao?: boolean;
  imagens?: Foto[];
  cores?: Cor[];
  tamanhos?: Tamanho[];
};

const construtor = projectId ? imageUrlBuilder({ projectId, dataset }) : null;

function miniatura(foto?: Foto, largura = 320): string | null {
  const ref = foto?.asset?._ref;
  if (!ref || !construtor) return null;
  return construtor.image(ref).width(largura).auto("format").quality(80).url();
}

function nomeCategoria(slug?: string): string | null {
  return CATEGORIAS.find((c) => c.slug === slug)?.nome ?? null;
}

const ESTADO: Record<string, { texto: string; tom: "positive" | "caution" | "default" }> = {
  disponivel: { texto: "Disponível no site", tom: "positive" },
  indisponivel: { texto: "Esgotada — aparece com selo, sem botão", tom: "caution" },
  oculto: { texto: "Oculta — não aparece no site", tom: "default" },
};

export function Revisar(props: { document: { displayed: Partial<SanityDocument> } }) {
  const exibido = props.document?.displayed;
  const peca = useMemo(() => (exibido ?? {}) as Peca, [exibido]);

  const fotos = useMemo(() => peca.imagens ?? [], [peca]);
  const cores = useMemo(
    () => (peca.cores ?? []).filter((c) => c?.nome),
    [peca]
  );
  const tamanhos = useMemo(
    () => (peca.tamanhos ?? []).filter((t) => t?.rotulo),
    [peca]
  );

  const [corExemplo, setCorExemplo] = useState<string | null>(null);
  const [tamanhoExemplo, setTamanhoExemplo] = useState<string | null>(null);

  const cor = corExemplo ?? cores[0]?.nome ?? undefined;
  const tamanho =
    tamanhoExemplo ??
    tamanhos.find((t) => t.disponivel !== false)?.rotulo ??
    undefined;

  /* O que falta. Cada linha é uma frase que diz o que fazer, nunca o nome
     técnico do campo. A lista espelha a validação do schema — não invento uma
     segunda régua que possa discordar dela. */
  const pendencias = useMemo(() => {
    const p: string[] = [];
    if (!peca.nome?.trim()) p.push("Falta o nome da peça.");
    if (typeof peca.preco !== "number" || peca.preco <= 0)
      p.push("Falta o valor da peça.");
    if (!peca.categoria) p.push("Falta escolher uma categoria.");
    if (fotos.length === 0) p.push("Falta pelo menos uma foto.");
    if (!peca.status) p.push("Falta escolher a situação.");
    if (peca.promocao && typeof peca.precoAnterior !== "number")
      p.push("A peça está marcada como promoção e falta o valor de antes.");

    const semFoto = cores
      .map((c) => c.nome as string)
      .filter((nome) => !fotos.some((f) => f.cor === nome));
    if (semFoto.length > 0)
      p.push(
        semFoto.length === 1
          ? `A cor ${semFoto[0]} ainda não tem foto própria. A peça funciona assim — o site mostra as fotos das outras cores e avisa a cliente.`
          : `As cores ${semFoto.join(", ")} ainda não têm foto própria. A peça funciona assim — o site avisa a cliente.`
      );

    const semAlt = fotos.filter((f) => !f.alt?.trim()).length;
    if (semAlt > 0)
      p.push(
        `${semAlt} ${semAlt === 1 ? "foto está" : "fotos estão"} sem descrição. Não impede de publicar.`
      );

    return p;
  }, [peca, fotos, cores]);

  const conferidos = [
    { rotulo: "Nome", ok: Boolean(peca.nome?.trim()) },
    { rotulo: "Valor", ok: typeof peca.preco === "number" && peca.preco > 0 },
    { rotulo: "Categoria", ok: Boolean(peca.categoria) },
    { rotulo: "Foto principal", ok: fotos.length > 0 },
    { rotulo: "Situação", ok: Boolean(peca.status) },
  ];
  if (cores.length > 0)
    conferidos.push({ rotulo: `Cores (${cores.length})`, ok: true });
  if (tamanhos.length > 0)
    conferidos.push({ rotulo: `Tamanhos (${tamanhos.length})`, ok: true });

  const origem =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const endereco = peca.slug?.current;

  const mensagem = mensagemProduto({
    nome: peca.nome || "esta peça",
    cor,
    tamanho,
    preco:
      typeof peca.preco === "number"
        ? formatarPrecoCentavos(Math.round(peca.preco * 100))
        : undefined,
    url: origem && endereco ? `${origem}/produto/${endereco}` : undefined,
  });

  const estado = ESTADO[peca.status ?? "disponivel"] ?? ESTADO.disponivel;
  const capa = miniatura(fotos[0]);

  return (
    <div style={{ padding: 20, maxWidth: 820, margin: "0 auto" }}>
      <Flex as="div" direction="column" gap={5}>
        {/* ---- A peça ---- */}
        <Card as="div" padding={4} radius={3} border>
          <Flex as="div" gap={4} wrap="wrap">
            <div style={{ flex: "none", width: 132 }}>
              {capa ? (
                /* eslint-disable-next-line @next/next/no-img-element --
                   `next/image` é do site; dentro do Studio não existe o
                   otimizador nem o loader. A URL já sai do CDN do Sanity com
                   largura pedida e `auto=format`. */
                <img
                  src={capa}
                  alt=""
                  style={{
                    display: "block",
                    width: "100%",
                    aspectRatio: "3 / 4",
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
              ) : (
                <Card as="div"
                  padding={4}
                  radius={2}
                  tone="transparent"
                  border
                  style={{ aspectRatio: "3 / 4", display: "grid", placeItems: "center" }}
                >
                  <Text as="div" size={1} muted align="center">
                    sem foto
                  </Text>
                </Card>
              )}
            </div>

            <Flex as="div" direction="column" gap={3} style={{ flex: "1 1 18rem", minWidth: 0 }}>
              <Text as="div" size={3} weight="semibold">
                {peca.nome || "Peça sem nome"}
              </Text>

              <Flex as="div" gap={3} align="baseline" wrap="wrap">
                <Text as="div" size={2}>
                  {typeof peca.preco === "number"
                    ? formatarPrecoCentavos(Math.round(peca.preco * 100))
                    : "sem valor"}
                </Text>
                {peca.promocao && typeof peca.precoAnterior === "number" && (
                  <Text as="div" size={1} muted style={{ textDecoration: "line-through" }}>
                    {formatarPrecoCentavos(Math.round(peca.precoAnterior * 100))}
                  </Text>
                )}
              </Flex>

              <Flex as="div" gap={2} wrap="wrap">
                <Badge as="div" tone={estado.tom} fontSize={0} padding={2} radius={2}>
                  {estado.texto}
                </Badge>
                {nomeCategoria(peca.categoria) && (
                  <Badge as="div" tone="default" fontSize={0} padding={2} radius={2}>
                    {nomeCategoria(peca.categoria)}
                  </Badge>
                )}
                {peca.novidade && (
                  <Badge as="div" tone="primary" fontSize={0} padding={2} radius={2}>
                    Novidade
                  </Badge>
                )}
                {peca.promocao && (
                  <Badge as="div" tone="primary" fontSize={0} padding={2} radius={2}>
                    Promoção
                  </Badge>
                )}
                <Badge as="div" tone="default" fontSize={0} padding={2} radius={2}>
                  {fotos.length} {fotos.length === 1 ? "foto" : "fotos"}
                </Badge>
              </Flex>

              {peca.resumo && (
                <Text as="div" size={1} muted>
                  {peca.resumo.length > 160
                    ? `${peca.resumo.slice(0, 160)}…`
                    : peca.resumo}
                </Text>
              )}

              {cores.length > 0 && (
                <Flex as="div" gap={3} align="center" wrap="wrap">
                  {cores.map((c) => (
                    <Flex as="div" key={c._key ?? c.nome} gap={2} align="center">
                      <span
                        aria-hidden="true"
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          background: c.amostra?.hex ?? "#cbbda6",
                          boxShadow: "inset 0 0 0 1px rgb(22 19 15 / 0.3)",
                        }}
                      />
                      <Text as="div" size={1}>{c.nome}</Text>
                    </Flex>
                  ))}
                </Flex>
              )}

              {tamanhos.length > 0 && (
                <Text as="div" size={1} muted>
                  {tamanhos
                    .map((t) =>
                      t.disponivel === false ? `${t.rotulo} (esgotado)` : t.rotulo
                    )
                    .join(" · ")}
                </Text>
              )}
            </Flex>
          </Flex>
        </Card>

        {/* ---- Conferência ---- */}
        <Card as="div" padding={4} radius={3} border>
          <Flex as="div" direction="column" gap={4}>
            <Text as="div" size={1} weight="medium">
              Conferência
            </Text>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))",
                gap: 8,
              }}
            >
              {conferidos.map((c) => (
                <Flex as="div" key={c.rotulo} gap={2} align="center">
                  <span style={{ color: c.ok ? "#565e38" : "#8f3d2f" }}>
                    {c.ok ? "✓" : "○"}
                  </span>
                  <Text as="div" size={1} muted={!c.ok}>
                    {c.rotulo}
                  </Text>
                </Flex>
              ))}
            </div>

            {pendencias.length > 0 && (
              <Flex as="div" direction="column" gap={2}>
                {pendencias.map((p) => (
                  <Text as="div" key={p} size={1}>
                    {p}
                  </Text>
                ))}
              </Flex>
            )}
          </Flex>
        </Card>

        {/* ---- WhatsApp ---- */}
        <Card as="div" padding={4} radius={3} border>
          <Flex as="div" direction="column" gap={4}>
            <Text as="div" size={1} weight="medium">
              Assim a mensagem chega no seu WhatsApp
            </Text>

            {(cores.length > 0 || tamanhos.length > 0) && (
              <Flex as="div" gap={4} wrap="wrap">
                {cores.length > 0 && (
                  <Escolha
                    rotulo="Exemplo com a cor"
                    opcoes={cores.map((c) => c.nome as string)}
                    valor={cor}
                    aoEscolher={setCorExemplo}
                  />
                )}
                {tamanhos.length > 0 && (
                  <Escolha
                    rotulo="e o tamanho"
                    opcoes={tamanhos.map((t) => t.rotulo as string)}
                    valor={tamanho}
                    aoEscolher={setTamanhoExemplo}
                  />
                )}
              </Flex>
            )}

            <Card as="div" padding={3} radius={2} tone="transparent" border>
              <Text as="div" size={1} style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {mensagem}
              </Text>
            </Card>

            <Text as="div" size={1} muted>
              A cliente escolhe a cor e o tamanho na página. O que ela não
              escolher simplesmente não aparece na mensagem — nunca chega
              &ldquo;Cor:&rdquo; em branco.
              {!endereco &&
                " O link só entra depois que a peça tiver endereço — publique e ele aparece aqui."}
            </Text>
          </Flex>
        </Card>
      </Flex>
    </div>
  );
}

function Escolha({
  rotulo,
  opcoes,
  valor,
  aoEscolher,
}: {
  rotulo: string;
  opcoes: string[];
  valor?: string;
  aoEscolher: (v: string) => void;
}) {
  return (
    <Flex as="div" gap={2} align="center" wrap="wrap">
      <Text as="div" size={1} muted>
        {rotulo}
      </Text>
      {opcoes.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => aoEscolher(o)}
          style={{
            minHeight: 32,
            padding: "0 10px",
            borderRadius: 8,
            border: "1px solid rgb(22 19 15 / 0.16)",
            background: o === valor ? "#16130f" : "transparent",
            color: o === valor ? "#f8f4ed" : "inherit",
            cursor: "pointer",
            font: "inherit",
            fontSize: 12,
          }}
        >
          {o}
        </button>
      ))}
    </Flex>
  );
}
