/**
 * Catálogo de versões do termo de consentimento — versão mínima.
 *
 * O texto vive **no código**, versionado no git ([ADR-006](../docs/adr/adr-006-conteudo-de-pagina-vive-no-codigo.md)):
 * publicar versão nova é um commit, e alterar o texto de uma versão publicada aparece no
 * diff. Em banco, um `UPDATE` reescreveria em silêncio um termo que alguém já aceitou.
 *
 * **Esta é a versão básica, a pedido do dono em 2026-08-07**, para o registro de aceite
 * parar de gravar hash falso. A versão completa é a T4 de `consentimento-e-privacidade`:
 * manifesto com `data_vigencia` e `tipo_mudanca`, resolução de versão vigente e teste de
 * integridade bloqueante.
 *
 * ## Onde ficam os hashes antigos
 *
 * Aqui, para sempre. **Versão publicada nunca sai deste arquivo** — nem quando for
 * substituída. É isso que permite responder, daqui a cinco anos, "que texto exatamente esta
 * pessoa aceitou?": pega-se o hash gravado na linha de `consentimentos` e procura-se a
 * entrada correspondente. Se a entrada sumisse, o hash viraria número sem significado.
 *
 * Corrigir texto publicado **é proibido**: cria-se versão nova. Quem já aceitou continua
 * ligado à que leu.
 */

export interface VersaoTermo {
  /** Identificador do termo. Um só, por enquanto. */
  termoId: string
  versao: string
  /** A partir de quando vale. ISO 8601 em UTC. */
  vigenteDesde: string
  texto: string
}

/**
 * O termo do Art. 11, versão 1 — **resumo**.
 *
 * É o texto curto que fica ao lado da caixa de aceite. Os documentos completos entram
 * depois, como links, junto com a change `consentimento-e-privacidade`; a caixa passa a
 * dizer que a pessoa leu os links, e se leu ou não é escolha dela.
 *
 * O que o hash cobre é **este** texto. Quando os links entrarem, é versão nova.
 */
export const TERMO_ART11: VersaoTermo = {
  termoId: 'deficiencia-art11',
  versao: 'v1',
  vigenteDesde: '2026-08-07T00:00:00Z',
  texto: [
    'Autorização para a APPD-SJC registrar informação sobre deficiência.',
    '',
    'A informação sobre a sua deficiência é um dado de saúde. A Lei Geral de Proteção de',
    'Dados trata esse tipo de dado como sensível, e exige a sua autorização específica para',
    'que ele seja registrado.',
    '',
    'Ao aceitar, você autoriza a Associação das Pessoas Portadoras de Deficiências de São',
    'José dos Campos a registrar e usar essa informação com uma finalidade só: organizar o',
    'atendimento que você está pedindo.',
    '',
    'A associação não vende, não compartilha com outra empresa e não usa essa informação',
    'para publicidade.',
    '',
    'Você pode retirar esta autorização quando quiser, na sua área do associado ou falando',
    'com a associação. Retirar não apaga o registro de que você autorizou antes — esse',
    'registro é a prova de que a sua escolha foi respeitada.',
  ].join('\n'),
}

/** Todas as versões já publicadas, da mais nova para a mais antiga. Nenhuma sai daqui. */
export const TERMOS: VersaoTermo[] = [TERMO_ART11]

/**
 * SHA-256 do texto, em hexadecimal — a impressão digital do que a pessoa leu.
 *
 * Calculado a partir do texto, e não escrito à mão: hash digitado é hash que ninguém
 * confere. Usa WebCrypto, disponível no workerd e no navegador.
 */
export async function hashDoTermo(texto: string): Promise<string> {
  const bytes = new TextEncoder().encode(texto)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Encontra a versão que corresponde a um hash gravado. `null` se não houver. */
export function versaoPorTexto(texto: string): VersaoTermo | null {
  return TERMOS.find((t) => t.texto === texto) ?? null
}
