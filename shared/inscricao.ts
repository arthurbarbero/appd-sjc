/**
 * Schema Zod único da inscrição de atendimento — cliente e servidor importam **este**
 * módulo (`formulario-atendimento` REQ-8). Duplicar regra de validação em qualquer outro
 * arquivo é defeito, não estilo.
 *
 * Relação com o banco: o schema do D1 (`server/database/schema.ts`) tem as mesmas regras
 * como `CHECK`, e isso é redundância proposital. O Zod dá a mensagem em pt-BR que a
 * pessoa lê; o banco garante que rota nenhuma escreva lixo, nem a que esquecer o Zod.
 * Quando os dois divergirem, quem manda é a spec `modelo-de-dados`, e os dois mudam junto.
 *
 * Fonte dos rótulos e das opções: `docs/campos-formulario.md`. As listas abaixo são
 * réplica fiel e **não mudam sem decisão da APPD**.
 */

import { z } from 'zod'

// ── Vocabulários fechados (campos 4, 12, 13, 14, 15) ─────────────────────────────────

export const DEFICIENCIAS = [
  'Física',
  'Intelectual ou Neurodivergentes',
  'Sensorial (visão, audição, fala)',
  'Outro',
] as const

/*
  Os cinco atendimentos do formulário oficial **mais os quatro projetos** (REQ-19).

  Antes, quem queria Bocha Paralímpica marcava "Outro" e digitava o nome — o que
  transformava uma escolha fechada em texto livre, com toda variação de grafia que isso
  traz para quem depois lê as inscrições. "Outro" volta a significar outro.

  **Isto altera as perguntas do formulário oficial**, contra o que `docs/campos-formulario.md`
  trava como réplica fiel. É decisão do dono, registrada em `docs/pendencias-appd.md`
  item 4a: quem recebe as inscrições construiu o atendimento em cima da lista antiga e
  precisa saber que ela mudou.

  Nada some da lista: os valores antigos continuam aqui, e inscrição já gravada com
  "Outro" segue válida.
*/
export const ATENDIMENTOS = [
  'Empréstimo Equipamentos',
  'Fisioterapia',
  'Orientações Gerais',
  'Psicologia',
  'Serviço Social',
  'Bocha Paralímpica',
  'Oficina Mão na Roda',
  'Artesão da Inclusão',
  'Informática Nota 10',
  'Outro',
] as const

export const DIAS = [
  'Segundas',
  'Terças',
  'Quartas',
  'Quintas',
  'Sextas',
  'Qualquer Dia da Semana',
] as const

/** Único valor de status na V1 (ADR-014): a APPD não opera fila nem matrícula. */
export const STATUS_INSCRICAO = 'Interesse registrado' as const

/**
 * O valor que ocupa o campo 12 depois que a pessoa **retira** o consentimento do Art. 11
 * (`consentimento-e-privacidade` REQ-13, decisão do dono em 2026-08-11).
 *
 * Retirar o consentimento e continuar guardando o dado é retirada de fachada — então o
 * tipo de deficiência é apagado. O que fica no lugar não é vazio: é esta palavra, dizendo
 * **por que** está vazio. Campo em branco se lê como "nunca respondeu"; este valor se lê
 * como "respondeu e depois retirou", que é a verdade.
 *
 * Escolhido em vez de relaxar o `CHECK` do banco, que exige pelo menos um item no campo
 * (`modelo-de-dados`) — o contrato de dados fica intacto.
 *
 * **É um valor especial num campo de vocabulário fechado, e isso tem custo.** Quem lê o
 * campo precisa saber que ele existe, senão a palavra aparece na tela como se fosse um
 * tipo de deficiência. Por isso:
 *
 * - ele **não** está em `DEFICIENCIAS`, então o Zod recusa se alguém tentar enviá-lo pelo
 *   formulário — só a rota de revogação consegue gravá-lo;
 * - toda leitura passa por `semConsentimento()`, e há teste que varre as rotas atrás de
 *   leitura que ignore isso.
 */
export const DEFICIENCIA_NAO_CONSENTIDA = 'Não consentido' as const

/** Se o campo 12 está no estado de consentimento retirado. */
export function semConsentimento(deficiencias: readonly string[]): boolean {
  return deficiencias.includes(DEFICIENCIA_NAO_CONSENTIDA)
}

// ── Peças reutilizadas ───────────────────────────────────────────────────────────────

const soDigitos = (valor: string) => valor.replace(/\D/g, '')

/** Código do país que o campo já traz escrito. A pessoa pode apagar. */
export const DDI_PADRAO = '+55'

/**
 * Telefone em formato internacional (E.164): `+` e de 8 a 15 dígitos.
 *
 * Mudou em 2026-08-21, por decisão do dono: o campo passa a nascer com `+55` escrito, e o
 * que é guardado passa a ser `+5512991657059` em vez de `12991657059`.
 *
 * A normalização continua sendo generosa com o que entra, que era o ponto do REQ-16: colar
 * `(12) 3346-0605`, `+55 12 99165-7059` ou só dígitos tem de funcionar. O que muda é a
 * saída, e a regra é uma só — **se não vier código de país, assume-se o Brasil**:
 *
 * - `12991657059` (11 dígitos, DDD brasileiro) vira `+5512991657059`
 * - `+55 12 99165-7059` vira `+5512991657059`
 * - `+351 912 345 678` fica `+351912345678`, porque veio com `+` e não é nosso lugar
 *   adivinhar que Portugal é engano
 *
 * O DDD deixa de ser verificado. Não é descuido: com número estrangeiro aceito, "os dois
 * primeiros dígitos são o DDD" deixa de ser verdade, e uma regra que só vale para parte
 * dos valores recusa justamente quem ela não entende.
 */
const normalizarTelefone = (valor: string) => {
  const bruto = valor.trim()
  const digitos = soDigitos(bruto)
  if (!digitos) return ''
  // Veio com `+`: a pessoa disse qual é o país, e ninguém aqui sabe melhor.
  if (bruto.startsWith('+')) return `+${digitos}`
  // Colagem do WhatsApp sem o `+`, mas com o 55 na frente.
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) {
    return `+${digitos}`
  }
  // Número nacional escrito como se escreve por aqui.
  return `${DDI_PADRAO}${digitos}`
}

/*
  Número brasileiro exige DDD e número; estrangeiro só exige um comprimento plausível.

  Sem esta distinção, `129916` — seis dígitos, um número claramente incompleto — virava
  `+55129916` e **passava**: oito dígitos cabem no mínimo do E.164, que é a régua de um
  número internacional qualquer. O gate pegou, e o defeito é do tipo que só aparece quando
  a regra fica frouxa para acomodar um caso novo: ao abrir o campo ao mundo, a exigência
  que valia para o Brasil desapareceu junto.
*/
const telefone = z
  .string()
  .transform(normalizarTelefone)
  .refine(
    (v) => /^\+\d{8,15}$/.test(v),
    'Informe o telefone com código do país, DDD e número — como +55 12 99165-7059.',
  )
  .refine(
    (v) => !v.startsWith('+55') || v.length === 13 || v.length === 14,
    'Confira o telefone: com o +55, são DDD e número — 10 ou 11 dígitos.',
  )

/** CPF conferido pelos dois dígitos verificadores, não só pelo comprimento (REQ-7). */
export function cpfValido(entrada: string): boolean {
  const cpf = soDigitos(entrada)
  if (cpf.length !== 11) return false
  // Sequência repetida passa no cálculo, e é o erro de digitação mais comum.
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const digito = (ate: number) => {
    let soma = 0
    for (let i = 0; i < ate; i++) soma += Number(cpf[i]) * (ate + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10])
}

/**
 * Escolha múltipla dentro do vocabulário oficial, **sem mínimo**.
 *
 * O `.min(1)` saiu em 2026-08-21, por decisão do dono:
 *
 * > eu posso não ter nenhuma deficiência e querer ser voluntário (…) então isso aqui não
 * > deveria ser obrigatório
 *
 * Vale para os três campos de múltipla escolha — deficiência, tipo de atendimento e
 * melhores dias. O vocabulário continua fechado: opcional quer dizer que a lista pode vir
 * vazia, não que qualquer palavra serve.
 */
const escolhaMultipla = <T extends readonly [string, ...string[]]>(opcoes: T) =>
  z.array(z.enum(opcoes)).default([])

// ── Os 15 campos + os 3 do cadastro embutido ─────────────────────────────────────────

/**
 * Campos 1 a 11 — identidade e contato, gravados em `usuarios`.
 *
 * Vivem separados porque **duas telas os usam**: o formulário de atendimento, que os
 * cria, e `/area/dados`, onde a pessoa os corrige (`area-do-associado` REQ-15 a REQ-17).
 * Redeclarar a régua na tela de correção seria a duplicação que o REQ-8 proíbe — e a
 * forma mais previsível de as duas divergirem sem ninguém notar.
 */
/*
  Toda regra abaixo carrega a própria mensagem, e isso não é capricho de estilo.

  Zod tem texto padrão para quando falta um: **"Invalid input"**, em inglês. Ele não fica
  no console — sobe pela resposta 422, cai no resumo de erros e aparece para a pessoa,
  exatamente onde ela precisa entender o que fazer. Aconteceu em produção em 2026-08-21:
  quem marcou "Outro" e escreveu uma letra só no "Qual?" leu "Invalid input" e não tinha
  como saber que faltava a segunda letra.

  O teste `test/mensagens-de-erro.spec.ts` reprova qualquer validação sem mensagem.
*/
const camposPessoais = {
  nome: z
    .string()
    .trim()
    .min(2, 'Informe o nome completo.')
    .max(120, 'O nome cabe em 120 caracteres.'),
  nascimento: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato dia/mês/ano, como 12/03/1978.'),
  telefone,
  telefoneWhatsapp: z.enum(['Sim', 'Não']),
  cep: z
    .string()
    .transform(soDigitos)
    .refine((v) => v.length === 8, 'O CEP tem 8 números. Exemplo: 12239-530.'),
  endereco: z
    .string()
    .trim()
    .min(3, 'Informe a rua, avenida ou travessa.')
    .max(300, 'O endereço cabe em 300 caracteres.'),
  numero: z
    .string()
    .trim()
    .min(1, 'Informe o número, ou "s/n".')
    .max(20, 'O número cabe em 20 caracteres.'),
  complemento: z.string().trim().max(60, 'O complemento cabe em 60 caracteres.').optional(),
  bairro: z.string().trim().min(2, 'Informe o bairro.').max(80, 'O bairro cabe em 80 caracteres.'),
  municipio: z
    .string()
    .trim()
    .min(2, 'Informe o município.')
    .max(80, 'O município cabe em 80 caracteres.'),
  /*
    Estado chega preenchido pela consulta de CEP, que já devolvia a UF e não era usada.
    Continua digitável: CEP fora do ar não pode travar o cadastro, mesma regra dos outros
    três campos que a consulta preenche.
  */
  estado: z.string().trim().min(2, 'Informe o estado.').max(60, 'O estado cabe em 60 caracteres.'),
  pais: z.string().trim().min(2, 'Informe o país.').max(60, 'O país cabe em 60 caracteres.'),
  cuidadorNome: z.string().trim().max(120, 'O nome cabe em 120 caracteres.').optional(),
  /*
    Campos 23 a 25, do crachá impresso (2026-08-21). Opcionais: nada no site depende
    deles, e o cadastro conclui sem qualquer um.
  */
  cras: z.string().trim().max(40, 'O CRAS cabe em 40 caracteres.').optional(),
  credencialTransporte: z.string().trim().max(40, 'A credencial cabe em 40 caracteres.').optional(),
  contatoEmergencia: telefone.optional(),
  cuidadorContato: telefone.optional(),
}

/**
 * O que `/area/dados` altera: contato e endereço, e mais nada.
 *
 * **E-mail e CPF ficam de fora, e não por esquecimento.** O e-mail é a chave do login e
 * também entra no sal da derivação da senha no navegador (`shared/senha.ts`):
 * trocá-lo sem refazer a derivação transformaria a senha atual em senha errada, sem aviso
 * e sem volta. Trocar e-mail é, na prática, um fluxo de reautenticação — tarefa própria,
 * não um campo neste formulário. O CPF identifica a pessoa perante a associação e não é
 * dado que se corrige sozinho pela internet.
 *
 * A data de nascimento também fica de fora: é dado de identificação, não de contato.
 */
export const esquemaMeusDados = z
  .object({
    nome: camposPessoais.nome,
    telefone: camposPessoais.telefone,
    telefoneWhatsapp: camposPessoais.telefoneWhatsapp,
    cep: camposPessoais.cep,
    endereco: camposPessoais.endereco,
    numero: camposPessoais.numero,
    complemento: camposPessoais.complemento,
    bairro: camposPessoais.bairro,
    municipio: camposPessoais.municipio,
    estado: camposPessoais.estado,
    pais: camposPessoais.pais,
  })
  .strict()

export type MeusDados = z.infer<typeof esquemaMeusDados>

export const esquemaInscricao = z
  .object({
    // 1 a 11 — identidade e contato, gravados em `usuarios`.
    ...camposPessoais,

    // 12 a 15 — o que a pessoa precisa, gravado em `inscricoes_atendimento`.
    deficiencias: escolhaMultipla(DEFICIENCIAS),
    deficienciaOutro: z
      .string()
      .trim()
      .min(2, 'Escreva pelo menos duas letras — uma só não diz o que é.')
      .max(100, 'Descreva em poucas palavras: cabem 100 caracteres.')
      .optional(),
    atendimentos: escolhaMultipla(ATENDIMENTOS),
    atendimentoOutro: z
      .string()
      .trim()
      .min(2, 'Escreva pelo menos duas letras — uma só não diz o que é.')
      .max(100, 'Descreva em poucas palavras: cabem 100 caracteres.')
      .optional(),
    dias: escolhaMultipla(DIAS),
    cienciaContribuicao: z.literal('Ciente'),

    // 16 a 18 — cadastro embutido (ADR-012).
    // 254 é o teto de um endereço de e-mail pela RFC 5321; 20 cobre o CPF com pontuação
    // e sobra. Os dois faltavam, e eram os únicos campos de texto sem teto — sem eles, um
    // corpo de megabytes chegava a ser transformado e validado antes de ser recusado.
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, 'Este e-mail é longo demais.')
      .pipe(z.email('Informe um e-mail válido.')),
    cpf: z
      .string()
      .max(20, 'Confira o CPF: veio texto demais.')
      .transform(soDigitos)
      .refine(cpfValido, 'Confira o CPF: os dígitos não batem.'),
    senha: z
      .string()
      .min(10, 'A senha precisa ter pelo menos 10 caracteres.')
      .max(200, 'A senha cabe em 200 caracteres.')
      // Sem exigência de símbolo, maiúscula ou dígito, e sem recusar espaço, de propósito
      // (`cadastro-e-login` REQ-9): regra de composição aumenta abandono e não aumenta
      // segurança, e o público deste site é o que mais paga por isso.
      .describe('Mínimo de 10 caracteres. Não exigimos símbolo nem letra maiúscula.'),

    /*
      Art. 11 da LGPD — exigido **quando há deficiência marcada**, e só então.

      Até 2026-08-21 era obrigatório em todo cadastro, porque todo cadastro trazia dado de
      saúde. Com o campo 12 opcional isso deixou de ser verdade: quem se cadastra para ser
      voluntário não informa condição de saúde nenhuma, e pedir a autorização assim mesmo
      seria colher consentimento sobre o vazio — o oposto do que o artigo pede, que é
      autorização **específica para uma finalidade**.

      A regra que amarra os dois está no `superRefine` do fim do esquema, junto com a do
      `termoHash`: sem deficiência, os dois são dispensados; com deficiência, os dois são
      exigidos com a mesma mensagem de antes.
    */
    consentimentoSaude: z.literal(true, 'É preciso autorizar para concluir o cadastro.').optional(),

    /*
      Campo 22 — o CID, e o consentimento que ele exige.

      **Opcional, e opcional de verdade**: sem CID o cadastro conclui, o crachá sai e a
      verificação funciona (ADR-020). Campo opcional que trava o envio é campo obrigatório
      com outro nome.

      O consentimento é **próprio**, e não o `consentimentoSaude` acima. São finalidades
      diferentes — uma organiza o atendimento, a outra guarda diagnóstico para imprimir —
      e o Art. 11 pede autorização específica por finalidade. O par abaixo espelha o do
      Art. 11 de propósito: booleano mais hash do texto exibido, para o histórico poder
      dizer que texto exatamente a pessoa leu.

      O `superRefine` no fim do esquema é que amarra os dois: informar CID sem autorizar
      é recusado; autorizar sem informar CID é inofensivo e passa.
    */
    cid: z.string().trim().max(60, 'O CID cabe em 60 caracteres.').optional(),
    consentimentoCid: z
      .literal(true, 'Para informar o CID é preciso autorizar a associação a guardá-lo.')
      .optional(),
    termoCidHash: z
      .string()
      .regex(/^[0-9a-f]{64}$/, 'Recarregue a página e leia o termo do CID antes de enviar.')
      .optional(),

    /**
     * Hash do termo que a tela **exibiu** (`consentimento-e-privacidade` REQ-8).
     *
     * Vai junto porque o que precisa ser gravado é o texto que a pessoa leu, não o que
     * estava vigente quando o clique chegou ao servidor: entre abrir o formulário e enviar,
     * uma versão nova pode ter entrado em vigor. O servidor procura este hash no catálogo e
     * recusa o que não encontrar — hash desconhecido é prova de nada.
     */
    termoHash: z
      .string()
      .regex(/^[0-9a-f]{64}$/, 'Recarregue a página e leia o termo de novo antes de enviar.')
      .optional(),

    /*
      Gerada pelo navegador, nunca digitada — a mensagem existe porque a regra do
      projeto é que nenhuma validação caia no texto padrão do Zod, e não porque alguém
      vá lê-la num uso normal. Se ela aparecer, o problema é nosso, e o texto diz isso.
    */
    chaveIdempotencia: z.uuid('O envio veio sem identificador. Recarregue a página.'),
  })
  // `.strict()`: campo desconhecido é recusado com 422, nunca ignorado em silêncio (REQ-10).
  .strict()
  /*
    Marcar deficiência é o que faz o consentimento do Art. 11 ser exigido.

    A condição é a mesma dos dois `refine` seguintes porque as duas peças são uma só: a
    autorização e o texto que ela aceitou. Consentimento gravado sem saber que texto a
    pessoa leu não prova nada, e é por isso que o hash não é opcional quando a autorização
    não é.
  */
  .refine((d) => d.deficiencias.length === 0 || d.consentimentoSaude === true, {
    path: ['consentimentoSaude'],
    message: 'É preciso autorizar para concluir o cadastro.',
  })
  .refine((d) => d.deficiencias.length === 0 || !!d.termoHash, {
    path: ['consentimentoSaude'],
    message: 'Recarregue a página e leia o termo de novo antes de enviar.',
  })
  // "Outro" marcado torna o campo de especificação obrigatório (D7).
  .refine((d) => !d.deficiencias.includes('Outro') || !!d.deficienciaOutro, {
    path: ['deficienciaOutro'],
    message: 'Você marcou "Outro": descreva em poucas palavras.',
  })
  /*
    Informar CID exige autorizar; autorizar sem informar não custa nada.

    A assimetria é o ponto (ADR-020): a trava existe para impedir que diagnóstico seja
    guardado sem consentimento específico, não para punir quem marcou uma caixa a mais.
  */
  .refine((d) => !d.cid || d.consentimentoCid === true, {
    path: ['consentimentoCid'],
    message: 'Para informar o CID é preciso autorizar a associação a guardá-lo.',
  })
  .refine((d) => !d.cid || !!d.termoCidHash, {
    path: ['consentimentoCid'],
    message: 'Recarregue a página e leia o termo do CID antes de enviar.',
  })
  .refine((d) => !d.atendimentos.includes('Outro') || !!d.atendimentoOutro, {
    path: ['atendimentoOutro'],
    message: 'Você marcou "Outro": descreva em poucas palavras.',
  })

export type Inscricao = z.infer<typeof esquemaInscricao>
