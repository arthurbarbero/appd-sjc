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

/**
 * Dígitos do telefone, sem o código do país.
 *
 * Colar `+55 12 99165-7059` do WhatsApp produz 13 dígitos e seria recusado — mas o REQ-16
 * diz, com todas as letras, que essa colagem tem de ser aceita. Quem copia o próprio
 * número do WhatsApp leva o `+55` junto, e recusar isso é a máscara brigando com a pessoa.
 */
const digitosTelefone = (valor: string) => {
  const digitos = soDigitos(valor)
  return (digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')
    ? digitos.slice(2)
    : digitos
}

/**
 * Telefone com 10 ou 11 dígitos e DDD entre 11 e 99.
 *
 * A máscara nunca bloqueia a digitação (REQ-16): o valor chega como a pessoa colou —
 * `(12) 3346-0605`, `+55 12 99165-7059` ou só dígitos — e é normalizado aqui.
 */
const telefone = z
  .string()
  .transform(digitosTelefone)
  .refine((v) => v.length === 10 || v.length === 11, 'Informe DDD e número, com 10 ou 11 dígitos.')
  .refine((v) => Number(v.slice(0, 2)) >= 11, 'O DDD precisa estar entre 11 e 99.')

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

/** Escolha múltipla: pelo menos uma opção, todas do vocabulário oficial. */
const escolhaMultipla = <T extends readonly [string, ...string[]]>(opcoes: T, campo: string) =>
  z.array(z.enum(opcoes)).min(1, `Marque pelo menos uma opção em ${campo}.`)

// ── Os 15 campos + os 3 do cadastro embutido ─────────────────────────────────────────

/**
 * Campos 1 a 11 — identidade e contato, gravados em `usuarios`.
 *
 * Vivem separados porque **duas telas os usam**: o formulário de atendimento, que os
 * cria, e `/area/dados`, onde a pessoa os corrige (`area-do-associado` REQ-15 a REQ-17).
 * Redeclarar a régua na tela de correção seria a duplicação que o REQ-8 proíbe — e a
 * forma mais previsível de as duas divergirem sem ninguém notar.
 */
const camposPessoais = {
  nome: z.string().trim().min(2, 'Informe o nome completo.').max(120),
  nascimento: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato dia/mês/ano, como 12/03/1978.'),
  telefone,
  telefoneWhatsapp: z.enum(['Sim', 'Não']),
  cep: z
    .string()
    .transform(soDigitos)
    .refine((v) => v.length === 8, 'O CEP tem 8 números. Exemplo: 12239-530.'),
  endereco: z.string().trim().min(3, 'Informe a rua, avenida ou travessa.').max(300),
  numero: z.string().trim().min(1, 'Informe o número, ou "s/n".').max(20),
  complemento: z.string().trim().max(60).optional(),
  bairro: z.string().trim().min(2, 'Informe o bairro.').max(80),
  municipio: z.string().trim().min(2, 'Informe o município.').max(80),
  cuidadorNome: z.string().trim().max(120).optional(),
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
  })
  .strict()

export type MeusDados = z.infer<typeof esquemaMeusDados>

export const esquemaInscricao = z
  .object({
    // 1 a 11 — identidade e contato, gravados em `usuarios`.
    ...camposPessoais,

    // 12 a 15 — o que a pessoa precisa, gravado em `inscricoes_atendimento`.
    deficiencias: escolhaMultipla(DEFICIENCIAS, 'tipo de deficiência'),
    deficienciaOutro: z.string().trim().min(2).max(100).optional(),
    atendimentos: escolhaMultipla(ATENDIMENTOS, 'tipo de atendimento'),
    atendimentoOutro: z.string().trim().min(2).max(100).optional(),
    dias: escolhaMultipla(DIAS, 'melhores dias'),
    cienciaContribuicao: z.literal('Ciente'),

    // 16 a 18 — cadastro embutido (ADR-012).
    // 254 é o teto de um endereço de e-mail pela RFC 5321; 20 cobre o CPF com pontuação
    // e sobra. Os dois faltavam, e eram os únicos campos de texto sem teto — sem eles, um
    // corpo de megabytes chegava a ser transformado e validado antes de ser recusado.
    email: z.string().trim().toLowerCase().max(254).pipe(z.email('Informe um e-mail válido.')),
    cpf: z
      .string()
      .max(20)
      .transform(soDigitos)
      .refine(cpfValido, 'Confira o CPF: os dígitos não batem.'),
    senha: z
      .string()
      .min(10, 'A senha precisa ter pelo menos 10 caracteres.')
      .max(200)
      // Sem exigência de símbolo, maiúscula ou dígito, e sem recusar espaço, de propósito
      // (`cadastro-e-login` REQ-9): regra de composição aumenta abandono e não aumenta
      // segurança, e o público deste site é o que mais paga por isso.
      .describe('Mínimo de 10 caracteres. Não exigimos símbolo nem letra maiúscula.'),

    // Art. 11 da LGPD — sem isto, nada é gravado (REQ-41).
    consentimentoSaude: z.literal(true, 'É preciso autorizar para concluir o cadastro.'),

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
      .regex(/^[0-9a-f]{64}$/, 'Recarregue a página e leia o termo de novo antes de enviar.'),

    chaveIdempotencia: z.uuid(),
  })
  // `.strict()`: campo desconhecido é recusado com 422, nunca ignorado em silêncio (REQ-10).
  .strict()
  // "Outro" marcado torna o campo de especificação obrigatório (D7).
  .refine((d) => !d.deficiencias.includes('Outro') || !!d.deficienciaOutro, {
    path: ['deficienciaOutro'],
    message: 'Você marcou "Outro": descreva em poucas palavras.',
  })
  .refine((d) => !d.atendimentos.includes('Outro') || !!d.atendimentoOutro, {
    path: ['atendimentoOutro'],
    message: 'Você marcou "Outro": descreva em poucas palavras.',
  })

export type Inscricao = z.infer<typeof esquemaInscricao>
