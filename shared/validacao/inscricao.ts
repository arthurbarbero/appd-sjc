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

export const ATENDIMENTOS = [
  'Empréstimo Equipamentos',
  'Fisioterapia',
  'Orientações Gerais',
  'Psicologia',
  'Serviço Social',
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

export const esquemaInscricao = z
  .object({
    // 1 a 11 — identidade e contato, gravados em `usuarios`.
    nome: z.string().trim().min(2, 'Informe o nome completo.').max(120),
    nascimento: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato dia/mês/ano, como 12/03/1978.'),
    telefone,
    telefoneWhatsapp: z.enum(['Sim', 'Não']),
    endereco: z.string().trim().min(3, 'Informe a rua, avenida ou travessa.').max(300),
    numero: z.string().trim().min(1, 'Informe o número, ou "s/n".').max(20),
    complemento: z.string().trim().max(60).optional(),
    bairro: z.string().trim().min(2, 'Informe o bairro.').max(80),
    municipio: z.string().trim().min(2, 'Informe o município.').max(80),
    cuidadorNome: z.string().trim().max(120).optional(),
    cuidadorContato: telefone.optional(),

    // 12 a 15 — o que a pessoa precisa, gravado em `inscricoes_atendimento`.
    deficiencias: escolhaMultipla(DEFICIENCIAS, 'tipo de deficiência'),
    deficienciaOutro: z.string().trim().min(2).max(100).optional(),
    atendimentos: escolhaMultipla(ATENDIMENTOS, 'tipo de atendimento'),
    atendimentoOutro: z.string().trim().min(2).max(100).optional(),
    dias: escolhaMultipla(DIAS, 'melhores dias'),
    cienciaContribuicao: z.literal('Ciente'),

    // 16 a 18 — cadastro embutido (ADR-012).
    email: z.string().trim().toLowerCase().pipe(z.email('Informe um e-mail válido.')),
    cpf: z.string().transform(soDigitos).refine(cpfValido, 'Confira o CPF: os dígitos não batem.'),
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
