# Serenou — definições confirmadas pela cliente

Registro do que a Grazi já fechou. Vale como requisito de projeto: o que está
aqui não se discute mais; o que está em **Em aberto** não pode ser assumido.

Última atualização: 10/09/2026

---

## Contato

| Item | Valor |
| --- | --- |
| WhatsApp oficial | (11) 98448-7394 |
| Instagram | @serenoubeach |
| Loja física | Rua Samuel Laurence, 177 — Parque Maria Fernandes |

Não completar CEP, cidade nem horário de funcionamento — não foram confirmados.

Tudo isso vive em `lib/loja.ts`. Nenhum componente escreve telefone, endereço
ou rótulo de categoria à mão.

### CTA de produto

Rótulo: **QUERO ESSA PEÇA**

Abre o WhatsApp com mensagem contextualizada. Nunca mensagem genérica quando
houver dado do produto disponível:

> Oi! Vim pelo site da Serenou e gostei do [NOME], na cor [COR] e tamanho
> [TAMANHO]. Queria saber mais sobre essa peça.

Implementado em `mensagemProduto()` — cor e tamanho entram só quando foram
escolhidos, e a frase se ajusta em vez de mostrar campo vazio.

---

## Estrutura do site

| Área | Papel |
| --- | --- |
| Home | marca + storytelling + descoberta |
| Catálogo | produto + fotografia + navegação |
| Produto | decisão + tamanho/cor + WhatsApp |
| Admin | operação da Grazi |

O catálogo é mais funcional e limpo que a Home: fotografia, respiro, muito
espaço branco. Isso não é abrir mão da identidade — é mudar o peso editorial.

### Final do site

Instagram · loja física · endereço · formas de entrega · CTA de WhatsApp.
As formas de entrega ainda não foram confirmadas.

---

## Catálogo

### Categorias e coleções

Categorias (`CATEGORIAS` em `lib/loja.ts`): Vestidos · Conjuntos · Calças ·
Blusas · Moda Praia.

Coleções (`COLECOES`): Novidades · Promoções.

Novidades e Promoções ficaram como **coleção**, não categoria — assim um
vestido em promoção continua sendo um vestido e aparece nos dois lugares ao
mesmo tempo. Categorias seguem administráveis e expansíveis.

### Status de visibilidade

| Status | Comportamento |
| --- | --- |
| `disponivel` | aparece normalmente |
| `indisponivel` | apresentação visual ainda não decidida |
| `oculto` | some do catálogo, continua no painel |

Quando uma peça acaba, o caminho normal é **ocultar** — nunca apagar. Cadastro
e fotos ficam preservados para reuso.

### Campos do produto

Mínimo: nome · preço · categoria · fotos · tamanhos · cores · informações
essenciais · status.

Nada além disso por enquanto. O cadastro precisa ser rápido para uso diário —
campo a mais é atrito na operação da Grazi todo dia.

---

## Administração

Uma administradora: a Grazi, com o e-mail administrativo dela.

Sem sistema de cargos ou níveis de permissão agora. A arquitetura pode permitir
expansão, mas a interface é para uma pessoa só.

---

## Identidade

Usar o arquivo vetorial oficial do logotipo. Não recriar por texto, SVG
aproximado ou fonte parecida.

---

## Em aberto — validar na próxima call

Enquanto não forem confirmados, não inventar conteúdo definitivo.

1. Copy final da Hero.
2. Se "Encontre seu próximo look" fica ou sai.
3. Promoções como categoria, coleção ou tag (assumido coleção — confirmar).
4. Se tamanho e cor são obrigatórios antes do WhatsApp.
5. Uso visual de "Indisponível" além de Disponível/Oculto.
6. Quanto storytelling antes do catálogo.
7. Padrão e proporção das novas fotografias.
8. Formas reais de entrega.
9. Domínio definitivo.
