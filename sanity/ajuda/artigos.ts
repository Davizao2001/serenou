/* ---------------------------------------------------------------------------
   O CONTEÚDO DA AJUDA

   Tudo que a Ajuda diz mora neste arquivo, como dados. Quem for corrigir uma
   frase mexe aqui e em nenhum outro lugar — não há texto espalhado por
   componente, nem CMS para gerenciar a própria ajuda.

   A REGRA DE ESCRITA

   A ajuda explica o TRABALHO, não a ferramenta. Nenhum artigo diz documento,
   schema, dataset, array, slug, rascunho ou publicar alterações no sentido
   técnico. Diz peça, foto principal, cor, tamanho, No site, Oculto.

   E usa as palavras que estão na tela. Onde o painel escreve "Esgotada", a
   ajuda escreve "Esgotada" — mandar a Grazi procurar "Indisponível" num
   formulário que diz outra coisa é pior do que não ter ajuda nenhuma.
--------------------------------------------------------------------------- */

/** Um pedaço de artigo. Poucos tipos, de propósito: quanto menos formas,
 *  mais parecidos ficam os artigos entre si. */
export type Bloco =
  | { tipo: "texto"; texto: string }
  | { tipo: "passos"; itens: string[] }
  | { tipo: "lista"; itens: string[] }
  | { tipo: "destaque"; texto: string }
  | { tipo: "estados"; itens: { rotulo: string; texto: string }[] }
  | { tipo: "etiqueta"; exemplo: string; texto: string };

/** As duas ações reais do Studio. Nada de rota inventada: "criar" abre o
 *  formulário de uma peça nova, "listar" vai para a lista de peças. */
export type Acao = { rotulo: string; vai: "criar" | "listar" };

export type Artigo = {
  id: string;
  titulo: string;
  resumo: string;
  blocos: Bloco[];
  acoes?: Acao[];
};

export const ARTIGOS: Artigo[] = [
  {
    id: "cadastrar",
    titulo: "Cadastrar uma peça",
    resumo: "O caminho inteiro, das quatro etapas até publicar.",
    blocos: [
      {
        tipo: "texto",
        texto:
          "O cadastro tem quatro etapas, e elas ficam lado a lado no alto da tela. Dá para ir e voltar entre elas a qualquer momento — nada fica bloqueado.",
      },
      { tipo: "texto", texto: "**Produto**" },
      {
        tipo: "lista",
        itens: [
          "Nome da peça",
          "Valor",
          "Categoria",
          "Descrição, se quiser — uma ou duas frases",
        ],
      },
      { tipo: "texto", texto: "**Fotos e opções**" },
      {
        tipo: "texto",
        texto: "Se a peça tem cores, o caminho mais rápido é nesta ordem:",
      },
      {
        tipo: "passos",
        itens: [
          "Adicione as cores.",
          "Envie as fotos.",
          "Embaixo de cada foto, indique a cor que ela representa.",
          "Selecione os tamanhos disponíveis.",
        ],
      },
      {
        tipo: "texto",
        texto:
          "Se a peça não tem cor, é só enviar as fotos e seguir. Se não tem tamanho, não selecione nenhum — o site entende sozinho e não mostra o seletor.",
      },
      { tipo: "texto", texto: "**No site**" },
      {
        tipo: "texto",
        texto:
          "Escolha a situação da peça — Disponível, Esgotada ou Oculta — e marque Novidade ou Promoção, se for o caso.",
      },
      { tipo: "texto", texto: "**Revisar**" },
      {
        tipo: "texto",
        texto:
          "A última aba mostra a peça como ela vai ficar, avisa o que está faltando e mostra a mensagem que chega no seu WhatsApp. Confira e publique.",
      },
    ],
    acoes: [{ rotulo: "Cadastrar uma peça", vai: "criar" }],
  },

  {
    id: "fotos-e-cores",
    titulo: "Fotos e cores",
    resumo: "Qual é a principal, o que cada etiqueta quer dizer, quando usar Geral.",
    blocos: [
      { tipo: "texto", texto: "**Foto principal**" },
      {
        tipo: "texto",
        texto:
          "A primeira foto da grade é a imagem principal da peça no catálogo. Para trocar, arraste outra foto para o primeiro lugar.",
      },
      { tipo: "texto", texto: "**A cor de cada foto**" },
      {
        tipo: "texto",
        texto:
          "Embaixo de cada foto há uma etiqueta. É nela que você diz qual cor aquela foto representa — clique e escolha.",
      },
      {
        tipo: "etiqueta",
        exemplo: "PRINCIPAL · BORDÔ",
        texto:
          "É a primeira foto da peça e representa a cor Bordô. Quando a cliente clicar na bolinha bordô no site, é esta foto que aparece.",
      },
      { tipo: "texto", texto: "**Foto geral**" },
      {
        tipo: "texto",
        texto:
          "Use Geral quando a imagem não representar uma cor só — uma foto de detalhe do tecido, ou uma foto com as cores juntas. Ela continua na galeria e não responde a bolinha nenhuma.",
      },
      {
        tipo: "destaque",
        texto:
          "A etiqueta só aparece depois que a peça tem cores cadastradas. Sem cor nenhuma, não há o que escolher.",
      },
    ],
  },

  {
    id: "cores",
    titulo: "Adicionar ou trocar uma cor",
    resumo: "Criar a cor, dar nome e bolinha, e ligar às fotos.",
    blocos: [
      {
        tipo: "passos",
        itens: [
          "Abra a peça e vá em Fotos e opções.",
          "No alto, em Cores, clique em Adicionar cor.",
          "Escolha uma das cores da Serenou — o nome e a bolinha já vêm preenchidos.",
          "Para uma cor que não está na lista, use Adicionar item e escreva o nome e escolha a bolinha.",
          "Depois, embaixo de cada foto, escolha a cor que ela representa.",
        ],
      },
      { tipo: "texto", texto: "**Trocar o nome ou a bolinha**" },
      {
        tipo: "texto",
        texto:
          "Clique na cor na lista e altere o que precisar. O nome que você escrever é o que vai na mensagem do WhatsApp.",
      },
      { tipo: "texto", texto: "**Remover uma cor**" },
      {
        tipo: "destaque",
        texto:
          "Se a cor estiver em uso, o painel avisa em quantas fotos ela está. Troque a cor dessas fotos primeiro; senão elas ficam apontando para uma cor que não existe mais e a bolinha some do site.",
      },
    ],
  },

  {
    id: "tamanhos",
    titulo: "Tamanhos",
    resumo: "Selecionar os de sempre, acrescentar outro, marcar esgotado.",
    blocos: [
      {
        tipo: "texto",
        texto:
          "Em Fotos e opções, abaixo das fotos, clique nos tamanhos que a peça tem: P, M, G, GG, G1. Clicar de novo tira.",
      },
      {
        tipo: "texto",
        texto:
          "Para 38, 40, Único ou qualquer outro, use Adicionar item e escreva o tamanho.",
      },
      { tipo: "texto", texto: "**Peça sem tamanho**" },
      {
        tipo: "texto",
        texto:
          "Não selecione nenhum. É o caso de biquíni de tamanho único e de acessório — o site simplesmente não mostra o seletor de tamanho.",
      },
      { tipo: "texto", texto: "**Quando um tamanho acaba**" },
      {
        tipo: "texto",
        texto:
          "Clique no tamanho na lista e desmarque \"Tem esse tamanho\". Ele continua aparecendo no site, riscado, em vez de sumir — a cliente vê que a peça existe naquele tamanho e está esgotado.",
      },
    ],
  },

  {
    id: "alterar",
    titulo: "Alterar uma peça",
    resumo: "Mudar qualquer informação de uma peça que já está no ar.",
    blocos: [
      {
        tipo: "texto",
        texto:
          "Nome, descrição, valor, categoria, fotos, cores, tamanhos, promoção, situação: tudo se altera do mesmo jeito.",
      },
      {
        tipo: "passos",
        itens: [
          "Abra a peça na lista.",
          "Vá até a etapa onde a informação fica.",
          "Altere.",
          "Publique.",
        ],
      },
      {
        tipo: "destaque",
        texto:
          "Enquanto você não publicar, o site continua mostrando a versão anterior. Nada vai ao ar por engano.",
      },
    ],
    acoes: [{ rotulo: "Ver as peças", vai: "listar" }],
  },

  {
    id: "preco",
    titulo: "Trocar o preço",
    resumo: "Quatro passos, e o que muda quando a peça está em promoção.",
    blocos: [
      {
        tipo: "passos",
        itens: [
          "Abra a peça.",
          "Na etapa Produto, altere o valor.",
          "Confira em Revisar.",
          "Publique.",
        ],
      },
      { tipo: "texto", texto: "**Se a peça estiver em promoção**" },
      {
        tipo: "texto",
        texto:
          "Em No site existe o campo Valor antes da promoção, que aparece só quando Promoção está marcada. É ele que sai riscado ao lado do preço na loja. Ele precisa ser maior que o valor atual — senão o painel avisa e não deixa passar.",
      },
    ],
    acoes: [{ rotulo: "Ver as peças", vai: "listar" }],
  },

  {
    id: "novidade-promocao",
    titulo: "Novidades e Promoções",
    resumo: "As duas somam à categoria da peça, não substituem.",
    blocos: [
      {
        tipo: "destaque",
        texto:
          "Novidade e Promoção não são categorias. A peça continua onde está e passa a aparecer também nesses lugares.",
      },
      {
        tipo: "estados",
        itens: [
          {
            rotulo: "Novidade",
            texto: "A peça continua na categoria normal e também aparece em Novidades.",
          },
          {
            rotulo: "Promoção",
            texto:
              "A peça continua na categoria normal e também aparece em Promoções. Precisa do valor de antes.",
          },
        ],
      },
      {
        tipo: "texto",
        texto:
          "Um vestido marcado como novidade continua em Vestidos e aparece em Novidades. Os dois ao mesmo tempo.",
      },
    ],
  },

  {
    id: "situacao",
    titulo: "Disponível, Esgotada e Oculta",
    resumo: "O que cada situação faz com a peça no site.",
    blocos: [
      {
        tipo: "estados",
        itens: [
          {
            rotulo: "Disponível",
            texto: "A peça aparece no site e a cliente pode pedir.",
          },
          {
            rotulo: "Esgotada",
            texto:
              "A peça continua aparecendo no site, marcada como esgotada. A cliente vê a peça e não consegue pedir.",
          },
          {
            rotulo: "Oculta",
            texto:
              "A peça continua cadastrada no painel, com as fotos e tudo, mas não aparece no site.",
          },
        ],
      },
      {
        tipo: "destaque",
        texto:
          "Se a peça saiu da loja por enquanto, use Oculta em vez de excluir. Excluir não tem volta.",
      },
    ],
  },

  {
    id: "ocultar",
    titulo: "Tirar uma peça do site sem apagar",
    resumo: "Some do site, continua guardada aqui.",
    blocos: [
      {
        tipo: "passos",
        itens: [
          "Abra a peça.",
          "Vá em No site.",
          "Escolha Oculta.",
          "Publique.",
        ],
      },
      {
        tipo: "texto",
        texto:
          "A peça continua salva no painel, com as fotos, as cores e o preço. Para trazê-la de volta, é o mesmo caminho: escolha Disponível e publique.",
      },
      {
        tipo: "texto",
        texto:
          "Há um atalho: no menu de ações da peça existe Tirar do ar, que faz isso em um clique.",
      },
      { tipo: "texto", texto: "**Sobre excluir**" },
      {
        tipo: "texto",
        texto:
          "Excluir definitivamente remove o cadastro de vez — fotos, cores, tudo. Para peças que podem voltar algum dia, Oculta é o caminho.",
      },
    ],
    acoes: [{ rotulo: "Ver as peças", vai: "listar" }],
  },

  {
    id: "nao-apareceu",
    titulo: "A peça não apareceu no site",
    resumo: "Cinco coisas para conferir, na ordem.",
    blocos: [
      { tipo: "texto", texto: "Confira, nesta ordem:" },
      {
        tipo: "passos",
        itens: [
          "A peça foi publicada? Enquanto houver alteração não publicada, o site mostra a versão anterior.",
          "A situação está como Oculta? Oculta não aparece no site.",
          "A peça tem pelo menos uma foto?",
          "A categoria está escolhida?",
          "A peça está marcada como peça de teste? Peça de teste não vai para o site.",
        ],
      },
      {
        tipo: "texto",
        texto:
          "A aba Revisar lista o que está faltando, com a frase do que fazer. É o lugar mais rápido para descobrir.",
      },
      {
        tipo: "destaque",
        texto:
          "Depois de publicar, o site pode levar até um minuto para mostrar a mudança. Se passou disso e continua igual, volte a esta lista.",
      },
    ],
    acoes: [{ rotulo: "Ver as peças", vai: "listar" }],
  },

  {
    id: "foto-errada",
    titulo: "A foto errada aparece ao escolher uma cor",
    resumo: "Quase sempre é a etiqueta de cor de alguma foto.",
    blocos: [
      {
        tipo: "passos",
        itens: [
          "Abra a peça.",
          "Vá em Fotos e opções.",
          "Olhe a etiqueta embaixo de cada foto e veja qual está com a cor trocada.",
          "Clique na etiqueta e escolha a cor certa.",
          "Publique.",
        ],
      },
      {
        tipo: "texto",
        texto:
          "Se uma cor não tem foto própria, o site mostra as fotos das outras cores e avisa a cliente. A aba Revisar diz quais cores estão sem foto.",
      },
    ],
  },

  {
    id: "whatsapp",
    titulo: "A mensagem do WhatsApp",
    resumo: "O que chega para você quando a cliente clica no botão.",
    blocos: [
      {
        tipo: "texto",
        texto:
          "Quando a cliente clica em QUERO ESSA PEÇA, o site monta sozinho uma mensagem com o que ela escolheu e abre o WhatsApp. Você não precisa configurar nada.",
      },
      { tipo: "texto", texto: "A mensagem pode trazer:" },
      {
        tipo: "lista",
        itens: [
          "o nome da peça",
          "a cor escolhida",
          "o tamanho escolhido",
          "o valor",
          "o link da peça",
        ],
      },
      {
        tipo: "texto",
        texto:
          "Por isso o nome da cor importa: é exatamente o que você escreveu no cadastro que chega para você.",
      },
      {
        tipo: "destaque",
        texto:
          "Para ver como fica antes de publicar, abra a aba Revisar. A prévia lá é a mesma mensagem que a cliente envia.",
      },
    ],
  },
];

/** Os quatro passos da primeira vez. Fica na home da Ajuda, não vira tour:
 *  ninguém é obrigado a atravessar nada. */
export const PRIMEIRA_VEZ = [
  "Cadastre uma peça com nome, valor e categoria.",
  "Envie as fotos e, se houver, as cores e os tamanhos.",
  "Em Revisar, confira como ela vai ficar.",
  "Publique.",
];

export function artigoPor(id: string | undefined): Artigo | undefined {
  return ARTIGOS.find((a) => a.id === id);
}
