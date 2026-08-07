/**
 * Contrato da derivação de senha — as duas etapas do REQ-6 de `cadastro-e-login`.
 *
 * O trabalho caro roda **no navegador**; o servidor só re-embaralha o resultado, rápido.
 * A razão está no [ADR-005](../docs/adr/adr-005-parametros-do-scrypt.md): o parâmetro
 * mínimo do OWASP custa 48 ms de CPU medidos no workerd, e o plano gratuito do Workers dá
 * 10 ms por requisição. Passando o custo para o cliente, a proteção continua existindo —
 * quem roubar o banco precisa refazer o scrypt a cada palpite, na máquina dele — e cabe
 * no limite.
 *
 * Este arquivo tem só o que os **dois lados** precisam concordar: parâmetros, formato do
 * sal do cliente e versão. Quem deriva de fato está em `derivacao.cliente.ts` (navegador)
 * e em `server/utils/senha.ts` (servidor), porque as APIs de cripto são diferentes.
 */

/**
 * Parâmetros da etapa 1, gravados junto com cada linha (REQ-7).
 *
 * Versionados de propósito: mudar `N` no futuro sem registrar qual valor gerou cada hash
 * invalidaria a senha de quem já se cadastrou. Com a versão gravada, dá para verificar
 * pelo parâmetro antigo e re-derivar no próximo login bem-sucedido.
 */
export const PARAMETROS_CLIENTE = {
  versao: 1,
  algoritmo: 'scrypt',
  /** Mínimo recomendado pelo OWASP. No cliente, o custo é dele. */
  N: 16384,
  r: 8,
  p: 1,
  /** Bytes da chave derivada que trafega. */
  tamanhoChave: 32,
} as const

export type ParametrosCliente = typeof PARAMETROS_CLIENTE

/** Prefixo do sal do cliente. Muda junto com `versao` se o esquema mudar. */
const PREFIXO_SAL = 'appd-sjc:v1:'

/**
 * Texto que vira o sal da etapa 1, derivado do e-mail normalizado.
 *
 * Por que do e-mail, e não aleatório: o navegador precisa derivar a chave **antes** de
 * falar com o servidor, tanto no cadastro quanto no login. Um sal aleatório exigiria uma
 * ida ao servidor antes do login — que devolveria "existe conta com este e-mail?" e
 * entregaria de graça a enumeração que o REQ-25 protege.
 *
 * O que se perde: duas pessoas com o mesmo e-mail em sistemas diferentes teriam o mesmo
 * sal. Irrelevante aqui, porque o valor que **fica guardado** leva um segundo sal,
 * aleatório e por usuário, aplicado no servidor.
 */
export function textoDoSalCliente(emailNormalizado: string): string {
  return PREFIXO_SAL + emailNormalizado
}

/** Normalização única de e-mail no projeto: `trim` + minúsculas (`modelo-de-dados` REQ-7). */
export function normalizaEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Comprimento mínimo da senha, conferido no navegador antes de derivar (REQ-9). */
export const SENHA_MINIMO = 10
