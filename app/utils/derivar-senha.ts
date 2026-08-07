/**
 * Etapa 1 da derivação — a que roda **no navegador** (`cadastro-e-login` REQ-6).
 *
 * É aqui que mora o custo que protege a senha. O parâmetro mínimo do OWASP leva ~48 ms
 * de CPU, e o plano gratuito do Workers dá 10 ms por requisição inteira — então o
 * trabalho sai do servidor e vem para o aparelho da pessoa ([ADR-005]). O banco continua
 * protegido: quem o roubar precisa refazer este mesmo cálculo a cada palpite, na máquina
 * dele.
 *
 * Por que `@noble/hashes` e não o WebCrypto: o WebCrypto do navegador **não tem scrypt**
 * — só PBKDF2. E o PBKDF2 no workerd tem teto de 100.000 iterações, abaixo do que o
 * OWASP pede hoje. A `@noble/hashes` é implementação auditada, sem dependências, e roda
 * igual em todo navegador.
 *
 * [ADR-005]: ../../docs/adr/adr-005-parametros-do-scrypt.md
 */

import { scryptAsync } from '@noble/hashes/scrypt.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { PARAMETROS_CLIENTE, textoDoSalCliente } from '~~/shared/senha'

/** Converte bytes em hexadecimal minúsculo — o formato que trafega e que o banco espera. */
function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Deriva a chave que será enviada ao servidor. **A senha nunca sai daqui.**
 *
 * `aoProgredir` existe porque o cálculo bloqueia por até um segundo em aparelho antigo, e
 * o REQ-6c exige que a tela diga isso em vez de parecer travada. `scryptAsync` cede o
 * controle de volta ao navegador periodicamente, o que também impede a página de congelar.
 */
export async function derivarChave(
  senha: string,
  email: string,
  aoProgredir?: (fracao: number) => void,
): Promise<string> {
  const { N, r, p, tamanhoChave } = PARAMETROS_CLIENTE
  const sal = sha256(new TextEncoder().encode(textoDoSalCliente(email)))

  const chave = await scryptAsync(new TextEncoder().encode(senha), sal, {
    N,
    r,
    p,
    dkLen: tamanhoChave,
    onProgress: aoProgredir,
  })

  return hex(chave)
}
