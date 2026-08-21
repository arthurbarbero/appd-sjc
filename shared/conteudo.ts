/**
 * Conteúdo institucional da APPD-SJC.
 *
 * Só entra aqui o que foi verificado no site atual ou no formulário oficial
 * (ver `docs/inventario-conteudo.md`). O que a associação ainda não confirmou fica em
 * `aConfirmar` e aparece na tela com o selo "A confirmar" — nunca como fato.
 *
 * Enquanto não houver banco, esta é a fonte de conteúdo do site.
 */

export const ASSOCIACAO = {
  nome: 'APPD São José dos Campos',
  /**
   * Razão social como está registrada, com o termo "portadoras". É nome próprio da
   * entidade e não se traduz nem se moderniza — está no CNPJ e na logo. No texto
   * corrido, ao falar de gente, o site usa "pessoa com deficiência".
   */
  nomeCompleto: 'Associação das Pessoas Portadoras de Deficiência de São José dos Campos',
  cnpj: '08.074.883/0001-96',
  inscricaoMunicipal: '154.420',
  utilidadePublica: '7.477/08',
  fundacao: 2006,
  fundacaoPorExtenso: '29 de março de 2006',
  endereco: {
    logradouro: 'Rua Acássia Pereira, 136',
    bairro: 'Campos dos Alemães',
    cidade: 'São José dos Campos',
    uf: 'SP',
    cep: '12239-530',
  },
  telefones: [
    { rotulo: 'Sede', numero: '(12) 3346-0605', e164: '+551233460605' },
    { rotulo: 'Secretaria', numero: '(12) 99165-7059', e164: '+5512991657059' },
    { rotulo: 'Serviço Social', numero: '(12) 99124-7257', e164: '+5512991247257' },
  ],
  email: 'appdsjc@gmail.com',
  redes: [
    { nome: 'Facebook', url: 'https://www.facebook.com/appdsjc' },
    { nome: 'Instagram', url: 'https://www.instagram.com/appdsjc/' },
  ],
} as const

/**
 * O endereço da sede numa linha só.
 *
 * Existe porque três lugares precisam dele **exatamente igual**: o rodapé, o verso do
 * crachá em HTML e o verso do crachá desenhado em canvas para exportação. Montado em cada
 * um, seria questão de tempo até um deles ficar com a pontuação diferente do documento
 * impresso — e crachá que discorda do rodapé do site é crachá que alguém questiona.
 */
export const enderecoEmLinha = `${ASSOCIACAO.endereco.logradouro} — ${ASSOCIACAO.endereco.bairro}, ${ASSOCIACAO.endereco.cidade}/${ASSOCIACAO.endereco.uf}`

/**
 * Regras do atendimento, confirmadas pelo dono do projeto em 2026-08-06.
 *
 * A regra de "fila de vagas" saiu: ela vinha do texto do formulário oficial, que está
 * desatualizado na origem. A APPD não opera fila nem matrícula — marcar um serviço
 * sinaliza interesse, e alguém da associação entra em contato. Ver ADR-014; a correção
 * do texto na origem está em docs/pendencias-appd.md, item 5.
 */
/*
  Fora de tela desde 2026-08-20.

  As duas frases abriam o cadastro num bloco destacado, e o dono mandou tirá-lo: "tira
  todo esse bloco amarelo, sobe". A constante fica porque o conteúdo foi levantado com a
  associação e continua verdadeiro — mas, enquanto ninguém a renderizar, **o site não diz
  mais que o atendimento é de manhã**. Se isso importar ao visitante, o lugar natural é a
  página `/atendimento`, e isso é decisão de conteúdo, não de layout.
*/
export const REGRAS_ATENDIMENTO = [
  'As sessões acontecem somente no período da manhã.',
  'Mantenha o telefone atualizado: é por ele que vem o primeiro contato.',
] as const

export interface Oferta {
  slug: string
  nome: string
  resumo: string
  /** Aparece no formulário oficial, no campo "Tipo de Atendimento". */
  noFormulario: boolean
  paraQuem: string[]
  sobre: string[]
  oQueEsperar: string[]
  naAppd: string[]
  aConfirmar: string[]
  horarios?: { local: string; endereco: string; dias: string; horario: string }[]
  /** Imagem de abertura. `alt` descreve o que a imagem mostra para quem não a vê. */
  imagem?: { arquivo: string; alt: string }
  /** Fotos da atividade, exibidas no fim da página. */
  galeria?: { arquivo: string; alt: string; legenda?: string }[]
}

/** Serviços: estão no campo "Tipo de Atendimento" do formulário oficial. */
export const SERVICOS: Oferta[] = [
  {
    slug: 'fisioterapia',
    nome: 'Fisioterapia',
    resumo: 'Atendimento de fisioterapia com foco em manter e recuperar a autonomia de movimento.',
    imagem: {
      arquivo: '/imagens/63d3b3e346404676bc61a9091332600c.webp',
      alt: 'Selo da Fisioterapia da APPD: um caduceu verde dentro de um círculo com o nome da associação.',
    },
    noFormulario: true,
    paraQuem: [
      'Pessoas com deficiência física ou neurológica',
      'Quem precisa de reabilitação depois de uma cirurgia ou internação',
      'Quem perdeu movimento e quer recuperar autonomia no dia a dia',
    ],
    sobre: [
      'A fisioterapia trabalha o movimento do corpo. Para a pessoa com deficiência, ela não busca uma cura: busca autonomia — conseguir se transferir da cama para a cadeira, manter a força que já existe, evitar dor e deformidade.',
      'A continuidade é o que faz diferença. Sessão isolada alivia; acompanhamento regular preserva função. É por isso que o acompanhamento é levado a sério, e não tratado como visita avulsa.',
      'A Lei Brasileira de Inclusão garante à pessoa com deficiência atenção integral à saúde, incluindo reabilitação, pelo SUS. O atendimento da associação não substitui esse direito — soma a ele.',
    ],
    oQueEsperar: [
      'Na primeira vez, uma conversa sobre o que você já consegue fazer e o que quer voltar a fazer.',
      'Sessões acompanhadas, com exercícios adaptados ao seu quadro.',
      'Orientação de que fazer em casa entre uma sessão e outra.',
    ],
    naAppd: [
      'O atendimento acontece na sede, na Rua Acássia Pereira, 136.',
      'As sessões são somente no período da manhã.',
      'Seu interesse fica registrado e a associação entra em contato pelo telefone que você informar.',
    ],
    aConfirmar: [
      'Dias e horários das sessões',
      'Quem é o fisioterapeuta responsável e o registro no CREFITO',
      'Duração e frequência das sessões',
      'Como a associação organiza a ordem dos atendimentos',
      'Documentos que a pessoa precisa levar',
    ],
  },
  {
    slug: 'psicologia',
    nome: 'Psicologia',
    resumo: 'Acompanhamento psicológico para a pessoa com deficiência e para quem cuida dela.',
    noFormulario: true,
    paraQuem: [
      'Pessoas com deficiência que querem falar sobre o que estão vivendo',
      'Familiares e cuidadores sobrecarregados',
      'Quem passa por luto, adoecimento ou mudança grande de vida',
    ],
    sobre: [
      'Acompanhamento psicológico é conversa com método, com quem tem formação para escutar. Não é conselho de amigo e não é remédio.',
      'A sobrecarga de quem cuida é um assunto pouco falado e muito comum. Quem cuida em tempo integral costuma adiar a própria saúde até adoecer — e aí duas pessoas ficam sem apoio.',
      'Procurar não exige estar em crise. Procurar antes da crise costuma ser mais barato, em todos os sentidos.',
    ],
    oQueEsperar: [
      'Uma conversa inicial para entender o que trouxe você até aqui.',
      'Sigilo: o que é dito no atendimento não é repassado.',
      'Encaminhamento para a rede pública quando o caso pedir outro tipo de cuidado.',
    ],
    naAppd: [
      'O atendimento acontece na sede, na Rua Acássia Pereira, 136.',
      'As sessões são somente no período da manhã.',
      'Seu interesse fica registrado e a associação entra em contato pelo telefone que você informar.',
    ],
    aConfirmar: [
      'Se o atendimento inclui cuidadores e familiares, ou só a pessoa com deficiência',
      'Quem é o psicólogo responsável e o registro no CRP',
      'Se é individual ou em grupo',
      'Faixa etária atendida',
      'Se há limite de sessões',
    ],
  },
  {
    slug: 'servico-social',
    nome: 'Serviço Social',
    resumo:
      'Orientação sobre direitos, benefícios e a rede de apoio pública de São José dos Campos.',
    imagem: {
      arquivo: '/imagens/33ee15be8c9d4c4fa99cd5219dacbbc8.webp',
      alt: 'Selo do Serviço Social da APPD: uma tocha e uma balança dentro de um círculo verde com o nome da associação.',
    },
    noFormulario: true,
    paraQuem: [
      'Quem não sabe a quais benefícios tem direito',
      'Famílias que precisam de encaminhamento para a rede pública',
      'Quem teve um pedido de benefício negado e não sabe o que fazer',
    ],
    sobre: [
      'O assistente social conhece o caminho das pedras da rede pública: onde pedir, que documento levar, a quem recorrer. Muita gente deixa de receber o que tem direito só por não saber que existe.',
      'Alguns direitos que a maioria desconhece: o BPC, o passe livre municipal e intermunicipal, a isenção de IPI e IPVA na compra de veículo, a credencial de estacionamento e o transporte adaptado do município.',
      'A associação orienta e encaminha. Quem concede o benefício é o órgão público — nenhuma entidade "consegue" ou "agiliza" benefício.',
    ],
    oQueEsperar: [
      'Uma conversa sobre a sua situação e a da sua família.',
      'Uma lista do que buscar, onde buscar e com quais documentos.',
      'Encaminhamento para CRAS, CREAS ou outro serviço quando for o caso.',
    ],
    naAppd: [
      'O atendimento acontece na sede, na Rua Acássia Pereira, 136.',
      'Há um telefone rotulado como Serviço Social: (12) 99124-7257.',
      'Seu interesse fica registrado e a associação entra em contato pelo telefone que você informar.',
    ],
    aConfirmar: [
      'Quem atende e o registro no CRESS',
      'Se a associação acompanha pedido e recurso de BPC',
      'Dias e horários do atendimento',
      'Se atende quem mora fora de São José dos Campos',
    ],
  },
  {
    slug: 'orientacoes-gerais',
    nome: 'Orientações Gerais',
    resumo: 'A porta de entrada: a primeira conversa sobre o que a associação pode fazer por você.',
    imagem: {
      arquivo: '/imagens/ec90df9aa3bf49b0870b088592bd5c6f.webp',
      alt: 'Selo das Orientações Gerais da APPD: ilustração de uma pessoa sentada diante de um computador.',
    },
    noFormulario: true,
    paraQuem: [
      'Quem está chegando agora e não sabe por onde começar',
      'Famílias que receberam um diagnóstico recente',
      'Quem quer entender como funciona o atendimento antes de se cadastrar',
    ],
    sobre: [
      'Nem todo mundo chega sabendo do que precisa. As orientações gerais existem para essa conversa: entender a situação, explicar o que a associação faz e apontar o caminho.',
      'É também onde as regras do atendimento são explicadas: por que as sessões são de manhã, como a associação entra em contato, e o que esperar dos próximos passos.',
    ],
    oQueEsperar: [
      'Uma conversa sem compromisso sobre a sua situação.',
      'Explicação de como funciona o atendimento na associação.',
      'Encaminhamento para o serviço certo, dentro ou fora da APPD.',
    ],
    naAppd: [
      'O formulário oficial declara que as orientações gerais são repassadas no primeiro atendimento.',
      'O atendimento acontece na sede, na Rua Acássia Pereira, 136.',
    ],
    aConfirmar: [
      'Quem faz o primeiro atendimento',
      'Se precisa agendar antes de ir até a sede',
      'Quanto tempo costuma levar até o primeiro contato',
    ],
  },
  {
    slug: 'emprestimo-equipamentos',
    nome: 'Empréstimo de Equipamentos',
    resumo:
      'Empréstimo de cadeira de rodas, muletas, andadores e outros equipamentos de locomoção.',
    noFormulario: true,
    paraQuem: [
      'Quem precisa de equipamento por um período, depois de cirurgia ou internação',
      'Quem está na fila do SUS esperando um equipamento definitivo',
      'Famílias sem condição de comprar ou manter o equipamento',
    ],
    sobre: [
      'Equipamento de locomoção é tecnologia assistiva: não é conforto, é o que permite sair de casa, trabalhar e estudar.',
      'Equipamento errado ou mal ajustado machuca. Cadeira de tamanho inadequado causa lesão por pressão e dor de ombro; muleta na altura errada machuca a axila. Ajuste não é detalhe.',
      'O SUS fornece órtese, prótese e meios auxiliares de locomoção pela rede de reabilitação. A fila é o motivo pelo qual o empréstimo social existe.',
    ],
    oQueEsperar: [
      'Uma conversa sobre a sua necessidade e por quanto tempo.',
      'Verificação do que está disponível no momento.',
      'Orientação de uso e de cuidado com o equipamento.',
    ],
    naAppd: [
      'Este serviço é uma das opções do formulário oficial de atendimento.',
      'A Central de Doações da associação pede, entre outras coisas, cadeiras de rodas e de banho — os equipamentos vêm de doação.',
    ],
    aConfirmar: [
      'Quais equipamentos existem hoje',
      'Prazo do empréstimo e se há renovação',
      'Se há caução, taxa ou termo de responsabilidade',
      'Quem avalia a necessidade',
      'Se a retirada é na sede',
    ],
  },
]

/*
  Projetos: atividades contínuas. Não estão no campo "Tipo de Atendimento".

  **A Bocha Paralímpica saiu em 2026-08-21**, e não por reorganização: a associação avisou
  que o projeto acabou — "remover de todo o site, não tem mais".

  O que estava aqui era a única publicação dos horários e dos dois locais de treino, e é por
  isso que a remoção vale um comentário: o site anunciava um esporte de segunda a sexta, das
  13h às 16h30, em duas quadras da cidade. Alguém com deficiência severa podia atravessar São
  José por causa disso. Se o projeto voltar, o conteúdo está no histórico do git, no commit
  que o removeu.
*/
export const PROJETOS: Oferta[] = [
  {
    slug: 'mao-na-roda',
    nome: 'Oficina Mão na Roda',
    resumo: 'Manutenção de cadeira de rodas, muletas, andadores e bengalas.',
    noFormulario: true,
    paraQuem: [
      'Quem usa equipamento de locomoção e precisa de conserto ou ajuste',
      'Famílias sem condição de manter o equipamento em bom estado',
    ],
    sobre: [
      'Cadeira de rodas, muleta, andador e bengala são equipamentos de uso diário e, como tal, precisam de manutenção. A autonomia na locomoção define a qualidade de vida da pessoa com deficiência.',
      'A Oficina Mão na Roda nasceu para dar suporte a famílias que não têm condição de manter ou adquirir um equipamento funcional e digno.',
      'Manutenção é segurança, não conforto: roda com folga, freio que não trava e pneu careca derrubam.',
    ],
    oQueEsperar: [
      'Avaliação do equipamento e do que ele precisa.',
      'Conserto e ajuste, quando houver peça disponível.',
      'Orientação sobre o que dá para cuidar em casa.',
    ],
    imagem: {
      arquivo: '/imagens/f4255106208240399592ed2852586a06.webp',
      alt: 'Arte do projeto Oficina Inclusiva Mão na Roda: uma placa amarela de sinalização com o desenho de uma pessoa em cadeira de rodas dentro de uma chave de boca, e o subtítulo "conserto e manutenção de cadeira de rodas".',
    },
    galeria: [
      {
        arquivo: '/imagens/e5a361b0765f4a62a21f9ba072f12527.webp',
        alt: 'Retrato de Bill, responsável técnico da Oficina Mão na Roda, de camisa clara e óculos.',
        legenda: 'Bill, responsável técnico da oficina',
      },
    ],
    naAppd: [
      'O projeto tem página própria no site atual da associação.',
      'As informações são dadas pelos telefones da associação.',
    ],
    aConfirmar: [
      'Dias e horários da oficina',
      'Se o serviço é gratuito e quem paga a peça',
      'Lista dos serviços que a oficina faz',
      'Se atende cadeira motorizada',
      'Prazo médio de conserto e se há equipamento reserva',
    ],
  },
  {
    slug: 'artesao-da-inclusao',
    nome: 'Artesão da Inclusão',
    resumo: 'Capacitação em artesanato e comercialização, como fonte de renda alternativa.',
    noFormulario: true,
    paraQuem: [
      'Pessoas com deficiência que querem gerar renda',
      'Familiares que deixaram o trabalho para cuidar e precisam de alternativa',
    ],
    sobre: [
      'Renda é um problema concreto para a família da pessoa com deficiência. Segundo o IBGE, na PNAD Contínua de 2022, o nível de ocupação entre pessoas com deficiência era de 26,6%, contra 60,7% entre as demais; o rendimento médio do trabalho era de R$ 1.860 contra R$ 2.690.',
      'Parte disso vem do cuidado: alguém da casa costuma reduzir a jornada ou deixar o emprego para acompanhar o dia a dia.',
      'O projeto capacita e ajuda a comercializar o que é produzido, sem atrapalhar o convívio e os cuidados diários.',
    ],
    oQueEsperar: ['Oficinas de técnicas de artesanato.', 'Apoio para vender o que você produzir.'],
    imagem: {
      arquivo: '/imagens/4c54b2588ebb4044aa1b23db4303cd12.webp',
      alt: 'Selo do projeto Artesão da Inclusão, com os dizeres "cursos profissionalizantes" e uma paleta de tintas coloridas.',
    },
    galeria: [
      {
        arquivo: '/imagens/0bf304bf0d844fc28d60c0863cadd02a.webp',
        alt: 'Placa de madeira entalhada com o nome Artesão da Inclusão e o símbolo internacional de acesso.',
      },
    ],
    naAppd: ['O projeto tem página própria no site atual da associação.'],
    aConfirmar: [
      'Se o projeto está ativo e quando abre turma',
      'Se participa a pessoa com deficiência, o cuidador, ou os dois',
      'Dias, horários e local das oficinas',
      'Como funciona a venda e o repasse ao artesão',
      'Quais técnicas são ensinadas',
    ],
  },
  {
    slug: 'informatica-nota-10',
    nome: 'Informática Nota 10',
    resumo: 'Inclusão digital: aprender a usar o computador com autonomia.',
    imagem: {
      arquivo: '/imagens/cbae5e83df0948c78b196574aeb04f3c.webp',
      alt: 'Selo do Informática Nota 10: um monitor de computador dentro de um círculo azul, com os dizeres "cursos profissionalizantes".',
    },
    noFormulario: true,
    paraQuem: [
      'Pessoas com deficiência que querem aprender a usar o computador',
      'Quem precisa de informática para estudar ou procurar trabalho',
    ],
    sobre: [
      'Cada vez mais serviço só existe em versão digital: marcar consulta, pedir benefício, emitir documento. Quem não usa computador ou celular fica de fora de direitos que já tem.',
      'Existem recursos que tornam o computador acessível — leitor de tela, teclado adaptado, ampliação — e boa parte deles é gratuita.',
      'A Lei de Cotas obriga empresas com cem ou mais empregados a reservar vagas para pessoas com deficiência. O gargalo costuma ser o preparo, não a vaga.',
    ],
    oQueEsperar: ['Aulas de informática adaptadas ao ritmo de cada pessoa.'],
    naAppd: [
      'O projeto existe e está em funcionamento — confirmado presencialmente pelo dono deste projeto em 2026-08-05.',
      'Não há nenhum registro público sobre ele: nem página, nem texto, nem menu no site atual.',
    ],
    aConfirmar: [
      'O nome correto: Informática Nota 10 ou Inclusão Nota 10',
      'Dias, horários e local das aulas',
      'Quem ministra',
      'Se há laboratório com computadores e quantas máquinas',
      'Como entrar e se há vagas',
      'Se há encaminhamento para vagas de emprego',
    ],
  },
]

export const TODAS_AS_OFERTAS = [...SERVICOS, ...PROJETOS]

export function acharOferta(slug: string): Oferta | undefined {
  return TODAS_AS_OFERTAS.find((o) => o.slug === slug)
}

export interface Pessoa {
  nome: string
  papel: string
  foto: string
  alt: string
  bio: string[]
}

/**
 * Quem é quem na associação. Texto e nomes vêm da página institucional do site atual.
 *
 * O histórico do presidente — o acidente de 2007, a lesão medular, a reabilitação no Sarah
 * Kubitschek — **está republicado** por decisão do dono do projeto, que tem autorização da
 * associação para usar todo o conteúdo do site atual. O texto já está público no
 * `appd.org.br` há anos, escrito na primeira pessoa da associação sobre o próprio
 * representante legal, e é ele que explica por que a APPD existe do jeito que existe.
 *
 * **O que continua fora são os nomes dos dois filhos.** A autorização é da associação
 * sobre o conteúdo dela; não alcança terceiros que não decidiram nada. E o nome deles não
 * acrescenta uma linha ao que o texto conta.
 */
export const PESSOAS: Pessoa[] = [
  {
    nome: 'Maria Claudete da Silveira Rabelo de Moura',
    papel: 'Fundadora',
    foto: '/imagens/242e24c8325c46fe99f614ab30b6fbbf.webp',
    alt: 'Maria Claudete da Silveira Rabelo de Moura sentada à mesa de um evento oficial, com as bandeiras do Brasil e do estado ao fundo.',
    bio: [
      'Fundou a APPD em 29 de março de 2006, junto de pessoas que compartilhavam o mesmo objetivo: localizar, orientar e incluir pessoas com deficiência na região.',
    ],
  },
  {
    nome: 'Luiz Carlos Lucas Barbosa',
    papel: 'Presidente',
    foto: '/imagens/adc13541b5744f6292df8093aa43f702.webp',
    alt: 'Retrato de Luiz Carlos Lucas Barbosa, presidente da APPD, de camisa clara.',
    bio: [
      'Casado, pai de dois filhos, trabalhou como motorista profissional durante 15 anos.',
      'Em 7 de setembro de 2007 estava com a família num momento de descontração quando, ao mergulhar, atingiu um banco de areia e sofreu uma lesão medular que o deixou tetraplégico.',
      'Em 2009 fez três meses de reabilitação no Centro de Reabilitação Sarah Kubitschek. Foi ali que se deparou com a realidade que o trouxe até aqui: a dificuldade das pessoas com deficiência e de suas famílias em conseguir tratamento de ponta.',
      'Já na presidência da associação voltou a estudar, deixou a área de transporte e logística e ingressou no curso de Serviço Social, para atuar melhor no atendimento.',
      'Além do trabalho voluntário como presidente, atua como palestrante e busca parceiros e colaboradores para ampliar o alcance dos atendimentos.',
    ],
  },
]

/**
 * PIX da associação. A chave é o CNPJ — o mesmo que está no rodapé e no registro
 * público. Chave verificável importa: chave de PIX que ninguém consegue conferir é
 * vetor de golpe. O QR em `public/marca/pix-appd.svg` é gerado a partir dela por
 * `scripts/gerar-pix-qr.mjs`.
 */
export const PIX = {
  tipo: 'CNPJ',
  chaveFormatada: '08.074.883/0001-96',
  chave: '08074883000196',
  favorecido: 'Associação das Pessoas Portadoras de Deficiência de São José dos Campos',
  qr: '/marca/pix-appd.svg',
} as const

/** O que a Central de Doações declara precisar hoje. Texto do site atual. */
export const DOACAO_EM_ESPECIE = [
  'Fraldas descartáveis geriátricas',
  'Cadeiras de rodas ou de banho',
  'Alimentos não perecíveis',
] as const

/**
 * Regimento interno, publicado no site atual numa página órfã (sem entrada no menu).
 * Texto reorganizado em seções; o conteúdo das regras é o mesmo.
 *
 * Vale ler antes de marcar algo como desconhecido: várias perguntas que pareciam sem
 * resposta estão aqui — como o horário é definido, como funciona o voluntariado e o
 * que acontece com quem atrasa a contribuição.
 */
/**
 * Política de Privacidade — o conteúdo da rota `/privacidade`
 * (`consentimento-e-privacidade` REQ-21 a REQ-24).
 *
 * Está aqui, e não no template, por um motivo de acessibilidade e não de organização: a
 * **ordem do sumário tem de ser igual à ordem dos `h2`** (REQ-21), e sumário escrito à mão
 * ao lado de seções escritas à mão diverge no primeiro dia em que alguém acrescenta uma
 * seção. Sendo lista, os dois saem da mesma fonte e não têm como discordar.
 *
 * Cada seção começa pela explicação em linguagem simples; o dispositivo legal entra como
 * bloco `lei`, sempre **depois** (REQ-21). Parágrafo com mais de cinco linhas renderizadas
 * é defeito (REQ-22) — na prática, o teto que funciona ao escrever é mais ou menos 320
 * caracteres por parágrafo.
 *
 * **Nada de prazo de retenção aqui.** Não é `[A CONFIRMAR]`: o ADR-017 decidiu que não há
 * retenção. Número de dias, meses ou anos nesta página é defeito, e existe teste que
 * reprova.
 */
export type BlocoPolitica =
  | { tipo: 'p'; texto: string }
  | { tipo: 'sub'; titulo: string; itens: readonly string[] }
  | { tipo: 'lista'; itens: readonly string[] }
  | { tipo: 'cartoes'; itens: readonly { titulo: string; texto: string }[] }
  /** Pendência da associação, visível no corpo do texto e nunca em cinza claro (REQ-23). */
  | { tipo: 'confirmar'; rotulo: string }
  /** O dispositivo legal, sempre depois da explicação simples. */
  | { tipo: 'lei'; texto: string }

export interface SecaoPolitica {
  id: string
  titulo: string
  /** Seção com barra vermelha à esquerda — só o dado sensível tem. */
  destaque?: true
  blocos: readonly BlocoPolitica[]
}

export const POLITICA_PRIVACIDADE: readonly SecaoPolitica[] = [
  {
    id: 'responsavel',
    titulo: 'Quem é responsável pela sua informação?',
    blocos: [
      {
        tipo: 'p',
        texto:
          'A Associação das Pessoas com Deficiência de São José dos Campos (APPD), CNPJ 08.074.883/0001-96, com sede na Rua Acássia Pereira 136, Campos dos Alemães, São José dos Campos/SP.',
      },
      { tipo: 'confirmar', rotulo: 'Encarregado de dados' },
      {
        tipo: 'lei',
        texto:
          'Lei 13.709/2018 (LGPD), Art. 41 — o controlador indica um encarregado e divulga o contato dele publicamente.',
      },
    ],
  },
  {
    id: 'coleta',
    titulo: 'Que informação a APPD guarda sobre você?',
    blocos: [
      { tipo: 'p', texto: 'São três grupos, e nada além deles.' },
      {
        tipo: 'sub',
        titulo: 'Contato e endereço',
        itens: [
          'Nome completo e data de nascimento',
          'Telefone, e se ele recebe WhatsApp',
          'Endereço, bairro e município',
          'Nome e telefone de um cuidador, quando você informa',
        ],
      },
      {
        tipo: 'sub',
        titulo: 'Informação sobre deficiência',
        itens: ['O tipo de deficiência que você indica no cadastro'],
      },
      {
        tipo: 'sub',
        titulo: 'Conta e crachá',
        itens: [
          'E-mail de acesso e CPF',
          'Senha, guardada de forma cifrada — ninguém na associação consegue lê-la',
          'Foto do crachá, quando você envia',
          'Número de registro',
        ],
      },
    ],
  },
  {
    id: 'finalidade',
    titulo: 'Para que serve cada uma?',
    blocos: [
      {
        tipo: 'lista',
        itens: [
          'Contato e endereço: registrar o seu interesse em ser atendido, em quais dias você pode vir, e falar com você.',
          'Informação sobre deficiência: organizar o atendimento com a equipe certa.',
          'Conta e crachá: deixar você entrar na sua área, editar o que registrou e emitir o crachá de associado.',
        ],
      },
      {
        tipo: 'p',
        texto:
          'O que você preenche no site é um registro de interesse, que você mesmo edita quando quiser. A associação não promete data, ordem de chamada nem posição nenhuma pelo site.',
      },
    ],
  },
  {
    id: 'base-legal',
    titulo: 'Com qual base legal a APPD faz isso?',
    blocos: [
      {
        tipo: 'p',
        texto:
          'Você escolhe entregar essa informação, e a associação só a usa para as finalidades desta página.',
      },
      {
        tipo: 'p',
        texto:
          'A informação sobre deficiência tem um consentimento próprio, separado, que você dá numa caixa de seleção específica.',
      },
      {
        tipo: 'lei',
        texto:
          'Lei 13.709/2018 (LGPD), Art. 7º, inciso I — consentimento do titular; e Art. 11, inciso I, para dado pessoal sensível.',
      },
    ],
  },
  {
    id: 'dado-sensivel',
    titulo: 'A informação sobre deficiência é dado sensível',
    destaque: true,
    blocos: [
      {
        tipo: 'p',
        texto:
          'A lei trata dado de saúde com cuidado maior, e a APPD também. Por isso ele tem um consentimento só dele, numa caixa separada no cadastro, que vem desmarcada.',
      },
      { tipo: 'p', texto: 'Você pode retirar esse consentimento quando quiser.' },
      {
        tipo: 'p',
        texto:
          'Existe uma segunda escolha, diferente dessa: a de exibição. Ela fica na área do associado e decide se o tipo de deficiência aparece no crachá e na página pública de verificação.',
      },
      {
        tipo: 'cartoes',
        itens: [
          {
            titulo: 'Sem marcar — é assim que vem',
            texto:
              'O tipo de deficiência não aparece no crachá impresso nem na página pública de verificação.',
          },
          {
            titulo: 'Marcando',
            texto:
              'Aparece nos dois. Quem mostra o crachá numa portaria já está mostrando para desconhecido, e separar papel de internet seria uma pergunta a mais.',
          },
        ],
      },
      {
        tipo: 'p',
        texto:
          'A escolha é reversível a qualquer momento, na área do associado. A sua foto do crachá só aparece na página de verificação, e nunca em endereço aberto.',
      },
      {
        tipo: 'lei',
        texto:
          'Lei 13.709/2018 (LGPD), Art. 11 — tratamento de dado pessoal sensível mediante consentimento específico e destacado, para finalidades também específicas.',
      },
    ],
  },
  {
    id: 'aceite',
    titulo: 'Como fica registrado o seu aceite?',
    blocos: [
      {
        tipo: 'p',
        texto:
          'Quando você aceita este texto, a associação guarda a versão que estava na tela, a data e a hora.',
      },
      {
        tipo: 'p',
        texto:
          'Guarda também uma impressão digital do texto exato: uma sequência de letras e números que muda se uma vírgula mudar.',
      },
      {
        tipo: 'p',
        texto:
          'Assim dá para saber exatamente com o que você concordou, e quando, mesmo que o texto mude depois. Mudar o texto do termo não apaga nem invalida o aceite antigo.',
      },
      {
        tipo: 'p',
        texto:
          'A associação não guarda o seu endereço de internet nem o aparelho que você usou para aceitar: o registro precisa da versão, do momento e da tela de onde veio, e nada além disso.',
      },
    ],
  },
  {
    id: 'guarda',
    titulo: 'Por quanto tempo a informação fica guardada?',
    blocos: [
      {
        tipo: 'p',
        texto:
          'Enquanto você quiser. Quando você pede exclusão, os seus dados saem na hora, e não ficam guardados por prazo nenhum depois disso.',
      },
      {
        tipo: 'p',
        texto:
          'O site não guarda prontuário: nenhuma evolução, avaliação, laudo ou registro de sessão passa por aqui.',
      },
      { tipo: 'p', texto: 'Duas coisas ficam, e só elas:' },
      {
        tipo: 'lista',
        itens: [
          'O número de registro, sem nada ligado a ele, para que um crachá antigo não passe a identificar outra pessoa.',
          'O registro de que você aceitou e depois retirou o consentimento, com data e hora.',
        ],
      },
      {
        tipo: 'lei',
        texto:
          'Lei 13.709/2018 (LGPD), Art. 16 — eliminação dos dados após o fim do tratamento, ressalvado o cumprimento de obrigação legal.',
      },
    ],
  },
  {
    id: 'compartilhamento',
    titulo: 'Com quem a sua informação é compartilhada?',
    blocos: [
      {
        tipo: 'p',
        texto:
          'Hoje, com ninguém fora da associação. A empresa que hospeda o site trata os dados apenas para manter o site no ar.',
      },
      {
        tipo: 'p',
        texto:
          'Não há venda de dado, não há publicidade e não há rastreador de terceiro neste site. A fonte de letra e tudo o mais que a página carrega vêm deste mesmo endereço.',
      },
    ],
  },
  {
    id: 'foto',
    titulo: 'E a foto do crachá?',
    blocos: [
      {
        tipo: 'p',
        texto:
          'A foto aparece na página pública de verificação, porque é ela que responde se a pessoa na frente de quem confere é mesmo a dona do crachá.',
      },
      {
        tipo: 'p',
        texto:
          'O que ela não tem é endereço próprio: a imagem viaja dentro da resposta da página, não existe link direto para o arquivo, e por isso ela não é encontrada por buscador nem se descola da página.',
      },
    ],
  },
  {
    id: 'cookies',
    titulo: 'O site usa cookies?',
    blocos: [
      {
        tipo: 'p',
        texto:
          'Só o necessário para manter você conectado depois que entra na sua área. Nada de cookie de publicidade ou de medição de terceiro.',
      },
    ],
  },
  {
    id: 'pedir',
    titulo: 'Como pedir correção ou exclusão?',
    blocos: [
      {
        tipo: 'p',
        texto:
          'Você pode conferir, corrigir, pedir cópia ou apagar a sua informação a qualquer momento. Quem tem conta faz isso pela área do associado, sozinho.',
      },
      {
        tipo: 'p',
        texto: 'Quem não tem conta pede por telefone ou por e-mail, com os contatos desta página.',
      },
    ],
  },
  {
    id: 'mudancas',
    titulo: 'O que acontece quando esta política mudar?',
    blocos: [
      {
        tipo: 'p',
        texto: 'A versão anterior continua publicada, com a data em que valeu, para você comparar.',
      },
      {
        tipo: 'p',
        texto: 'Mudança de forma — uma vírgula, uma palavra trocada — não pede aceite novo.',
      },
      {
        tipo: 'p',
        texto:
          'Mudança no que você está autorizando pede: o aviso aparece quando você entrar na sua área, e a sua conta continua funcionando enquanto você decide.',
      },
      {
        tipo: 'lei',
        texto:
          'Lei 13.709/2018 (LGPD), Art. 8º, §6º — alteração de informação sobre o tratamento exige informar o titular, com destaque.',
      },
    ],
  },
] as const

export const REGIMENTO = [
  {
    titulo: 'Atendimento',
    itens: [
      'Quem quer participar de um projeto precisa se cadastrar no site e aceitar o regimento interno e o termo de colaboração.',
      'O horário de atendimento é estabelecido pela diretoria executiva, depois de conversar com os coordenadores de projeto.',
      'O horário de cada projeto fica a cargo do coordenador daquele projeto, com aprovação da diretoria.',
      'Os horários podem mudar, sempre com aviso, se houver necessidade de remanejamento interno.',
    ],
  },
  {
    titulo: 'Trabalho voluntário',
    itens: [
      'O voluntariado segue a Lei Federal nº 9.608/98, a Lei do Voluntário.',
      'Quem quer ser voluntário passa por uma entrevista com um coordenador ou supervisor de projeto, que avalia as aptidões.',
      'O voluntário pode ser designado para qualquer área disponível na associação.',
      'O trabalho voluntário é sempre acompanhado por um coordenador ou supervisor.',
    ],
  },
  {
    titulo: 'Reuniões',
    itens: [
      'Assembleia Geral: uma vez por ano.',
      'Conselho Fiscal: a cada seis meses.',
      'Direção Executiva: uma vez por mês, ou quando a presidência convocar.',
    ],
  },
  {
    titulo: 'Contribuição do associado',
    itens: [
      'Os valores da contribuição são fixados pela diretoria, e podem ser diferentes para cada associado depois de uma análise da situação econômica.',
      'O carnê de contribuição é retirado na sede.',
      'O pagamento pode ser feito na sede ou por PIX, na conta da instituição.',
      'Quem paga por PIX envia o recibo pelo WhatsApp indicado na capa do carnê.',
      'Três meses seguidos sem pagar levam à exclusão automática, salvo justificativa acertada com a diretoria.',
      'A contribuição não dá exclusividade nem prioridade nos atendimentos: ela custeia a manutenção da instituição.',
    ],
  },
  {
    titulo: 'Conservação do espaço',
    itens: [
      'A manutenção das instalações e a preservação dos bens são responsabilidade de todos, sem exceção.',
      'Dano ao patrimônio causado por um associado é assumido por ele.',
    ],
  },
] as const

/**
 * COMTRAD — Comissão dos Usuários do Transporte Adaptado de São José dos Campos.
 * Existe no site atual em página órfã. Não é um projeto da APPD: é uma comissão
 * independente, e o papel da associação é dar suporte jurídico.
 */
export const COMTRAD = {
  nome: 'COMTRAD',
  nomeCompleto: 'Comissão dos Usuários do Transporte Adaptado',
  resumo:
    'Comissão independente formada por quem usa o transporte adaptado de São José dos Campos. A APPD dá o suporte jurídico.',
  porQueExiste: [
    'Para muita gente com deficiência, o transporte é a única forma de chegar à saúde, ao trabalho, à escola, ao esporte e ao lazer — direitos garantidos pelo Estatuto da Pessoa com Deficiência.',
    'A comissão nasceu para facilitar a comunicação entre quem usa o serviço e quem o administra, e para acompanhar de perto qualquer mudança nas regras.',
  ],
  finalidades: [
    'Unificar quem usa o transporte adaptado da cidade, para manter o serviço funcionando em sua totalidade.',
    'Fiscalizar mudanças no decreto que rege o serviço, e só aceitar as que melhorem o atendimento.',
    'Lutar pela ampliação do serviço, acompanhando o crescimento do município.',
    'Esclarecer direitos e deveres de quem usa, incluindo as penalidades previstas para o mau uso.',
  ],
  adesao: [
    'A adesão é voluntária e gratuita.',
    'É permitida a quem está credenciado e ativo no transporte adaptado, em dia com a Secretaria de Transporte.',
    'Dá para pedir a adesão pelo site, pelas redes sociais ou por telefone.',
    'Dá para cancelar o cadastro a qualquer momento, sem aviso prévio e sem ônus para nenhum dos lados.',
  ],
  baseLegal: [
    'Lei Brasileira de Inclusão, Lei nº 13.146 de 2015, artigo 4º',
    'Constituição Federal, artigo 1º, inciso III, e artigo 5º',
    'Decreto municipal nº 13.107/08, de 20 de maio de 2008, que substituiu o decreto nº 9.647/99',
  ],
  limite:
    'A comissão atua de forma coletiva, com quem é cadastrado nela. Não dá suporte individual, exceto em denúncia que aponte mau funcionamento do sistema.',
} as const
