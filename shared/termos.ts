/**
 * Catálogo de versões do termo de consentimento do Art. 11 — T4 de
 * `consentimento-e-privacidade` (REQ-1 a REQ-4).
 *
 * O texto vive **no código**, versionado no git ([ADR-006](../docs/adr/adr-006-conteudo-de-pagina-vive-no-codigo.md)):
 * publicar versão nova é um commit, e alterar o texto de uma versão publicada aparece no
 * diff. Em banco, um `UPDATE` reescreveria em silêncio um termo que alguém já aceitou.
 *
 * ## O manifesto e o hash declarado
 *
 * Cada versão declara o próprio `hash`. Ele **não** é conferência decorativa: é o que
 * transforma imutabilidade em algo verificável por máquina (REQ-2). Alterar uma letra do
 * texto de uma versão publicada faz o hash calculado divergir do declarado, e
 * `test/termos.spec.ts` fica vermelho — o CI não deixa passar. Corrigir texto publicado é
 * proibido; o caminho é publicar versão nova.
 *
 * ## Onde ficam os hashes antigos
 *
 * Aqui, para sempre. **Versão publicada nunca sai deste arquivo** — nem quando for
 * substituída. É isso que permite responder, daqui a cinco anos, "que texto exatamente esta
 * pessoa aceitou?": pega-se o hash gravado na linha de `consentimentos` e procura-se a
 * entrada correspondente. Se a entrada sumisse, o hash viraria número sem significado.
 */

/**
 * `material` muda o que a pessoa está autorizando; `editorial` corrige vírgula, ortografia
 * ou quebra de linha. A diferença tem consequência jurídica, não estética: material pede
 * novo aceite de quem já aceitou (REQ-11), editorial não pede (REQ-12).
 */
export type TipoMudanca = 'material' | 'editorial'

export interface VersaoTermo {
  /** Identificador do termo. Um só, por enquanto. */
  termoId: string
  /** Monotônica, formato `vN`. */
  versao: string
  /** A partir de quando vale. Data ISO-8601, em UTC. */
  dataVigencia: string
  tipoMudanca: TipoMudanca
  /** SHA-256 do texto exato, em hexadecimal minúsculo. Conferido no `npm test`. */
  hash: string
  texto: string
}

const FORMATO_VERSAO = /^v\d+$/
const FORMATO_HASH = /^[0-9a-f]{64}$/
/** Data pura ou carimbo completo, sempre em UTC. Nada de fuso implícito. */
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z)?$/

/**
 * O termo do Art. 11, versão 1 — **resumo**.
 *
 * É o texto curto que fica ao lado da caixa de aceite. Os documentos completos entram
 * depois, como links, junto com as páginas `/privacidade` e `/seus-direitos`; a caixa passa
 * a dizer que a pessoa leu os links, e se leu ou não é escolha dela.
 *
 * O que o hash cobre é **este** texto. Quando os links entrarem, é versão nova.
 *
 * `tipoMudanca` da primeira versão é `material` porque ela **é** o conteúdo material: não
 * existe versão anterior de quem dispensar novo aceite.
 */
export const TERMO_ART11: VersaoTermo = {
  termoId: 'deficiencia-art11',
  versao: 'v1',
  dataVigencia: '2026-08-07T00:00:00Z',
  tipoMudanca: 'material',
  hash: '346072c88fb7258cb14b7b45048bda8762f7fb3d4672ef4a79451e156e02609e',
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

/**
 * O termo do CID, versão 1.
 *
 * **Termo próprio, e não versão nova do `deficiencia-art11`** — a distinção é o ponto do
 * [ADR-020](../docs/adr/adr-020-cid-no-cadastro-e-no-cracha.md). Consentimento do Art. 11
 * é específico **por finalidade**, e "organizar o meu atendimento" não cobre "guardar o
 * meu diagnóstico para imprimi-lo num cartão". São duas autorizações, e o histórico
 * precisa poder responder qual delas a pessoa deu — o que um `termoId` só tornaria
 * impossível.
 *
 * O texto diz três coisas que a pessoa não teria como deduzir, e por isso nenhuma delas é
 * dispensável: que o CID diz mais que o tipo de deficiência; que **guardar não é
 * imprimir**; e que a página pública nunca o mostra, nem com a impressão marcada.
 */
export const TERMO_CID: VersaoTermo = {
  termoId: 'cid-diagnostico',
  versao: 'v1',
  dataVigencia: '2026-08-21T00:00:00Z',
  tipoMudanca: 'material',
  hash: '7e4cef3ee818b7e09e4b59d3655768e0232904ebcfe06cbaa673ce8331058453',
  texto: [
    'Autorização para a APPD-SJC guardar o seu CID.',
    '',
    'O CID é o código do seu diagnóstico — por exemplo, G82.4. Ele diz mais sobre a sua',
    'saúde do que o tipo de deficiência que você já informou: enquanto aquele descreve uma',
    'condição em linhas gerais, o CID identifica o diagnóstico com nome e classificação.',
    '',
    'Por isso ele precisa de uma autorização separada, e não da mesma que você deu antes.',
    '',
    'Ao aceitar, você autoriza a Associação das Pessoas Portadoras de Deficiências de São',
    'José dos Campos a guardar o seu CID com uma finalidade só: poder imprimi-lo no seu',
    'crachá, se você pedir.',
    '',
    'Guardar não é imprimir. O CID só aparece no crachá se você marcar essa opção depois,',
    'na sua área do associado — e ela começa desmarcada.',
    '',
    'O seu CID nunca aparece na página pública de verificação do crachá, mesmo que você',
    'marque a opção de imprimi-lo. Aquela página é aberta a qualquer pessoa que tenha o seu',
    'número de registro.',
    '',
    'A associação não vende, não compartilha com outra empresa e não usa essa informação',
    'para publicidade.',
    '',
    'Você pode retirar esta autorização quando quiser, na sua área do associado. Retirar',
    'apaga o seu CID e desmarca a impressão no crachá, na hora.',
  ].join('\n'),
}

/** Todas as versões já publicadas. Nenhuma sai daqui. */
export const TERMOS: VersaoTermo[] = [TERMO_ART11, TERMO_CID]

/**
 * Recusa o catálogo inteiro se qualquer versão estiver malformada (REQ-1).
 *
 * Roda no carregamento do módulo, e não só no teste, porque catálogo quebrado não pode
 * virar consentimento gravado torto: é melhor a rota estourar do que gravar `versao`
 * vazia numa linha que existe para servir de prova anos depois.
 *
 * O que ela **não** confere é o hash contra o texto — isso é `conferirIntegridade`, que é
 * assíncrona (WebCrypto) e vive no `npm test`, onde pode ser bloqueante sem custar CPU em
 * cada requisição.
 */
export function validarCatalogo(termos: VersaoTermo[] = TERMOS): void {
  if (termos.length === 0) throw new Error('Catálogo de termos vazio.')

  const vistos = new Set<string>()
  for (const t of termos) {
    const onde = `${t?.termoId ?? '?'}@${t?.versao ?? '?'}`
    if (!t.termoId) throw new Error(`Termo sem termoId (${onde}).`)
    if (!FORMATO_VERSAO.test(t.versao ?? '')) {
      throw new Error(`Versão fora do formato vN em ${onde}.`)
    }
    if (!FORMATO_DATA.test(t.dataVigencia ?? '')) {
      throw new Error(`dataVigencia fora do formato ISO-8601 UTC em ${onde}.`)
    }
    if (t.tipoMudanca !== 'material' && t.tipoMudanca !== 'editorial') {
      throw new Error(`tipoMudanca inválido em ${onde}.`)
    }
    if (!FORMATO_HASH.test(t.hash ?? '')) {
      throw new Error(`Hash fora do formato SHA-256 hexadecimal minúsculo em ${onde}.`)
    }
    if (!t.texto?.trim()) throw new Error(`Texto vazio em ${onde}.`)

    const chave = `${t.termoId}@${t.versao}`
    if (vistos.has(chave)) throw new Error(`Versão repetida no catálogo: ${chave}.`)
    vistos.add(chave)
  }
}

// Carregar o módulo é aceitar o catálogo. Malformado, ninguém carrega.
validarCatalogo()

/** Converte data pura em carimbo UTC; o que já é carimbo passa direto. */
function instanteDe(data: string): number {
  return Date.parse(data.length === 10 ? `${data}T00:00:00Z` : data)
}

/**
 * A versão vigente num instante: a de maior `dataVigencia` menor ou igual a `t` (REQ-3).
 *
 * Versão com vigência futura **não** é exibida nem exigida antes da data — é assim que se
 * publica um termo novo com antecedência sem surpreender quem está preenchendo hoje.
 */
export function versaoVigente(
  termoId: string,
  instante: Date | string = new Date(),
  termos: VersaoTermo[] = TERMOS,
): VersaoTermo {
  const t = typeof instante === 'string' ? instanteDe(instante) : instante.getTime()
  const candidatas = termos
    .filter((v) => v.termoId === termoId && instanteDe(v.dataVigencia) <= t)
    .sort((a, b) => instanteDe(b.dataVigencia) - instanteDe(a.dataVigencia))

  const vigente = candidatas[0]
  if (!vigente) throw new Error(`Nenhuma versão vigente do termo "${termoId}".`)
  return vigente
}

/**
 * Encontra a versão pelo hash que foi **exibido** à pessoa.
 *
 * É por aqui que o servidor grava o que ela leu, e não o que estava vigente no instante do
 * clique: entre abrir o formulário e enviar, a vigência pode ter virado. `null` quando o
 * hash não existe no catálogo — e aí o envio é recusado, porque hash desconhecido é prova
 * de nada.
 */
export function versaoPorHash(hash: string, termos: VersaoTermo[] = TERMOS): VersaoTermo | null {
  return termos.find((t) => t.hash === hash) ?? null
}

/**
 * Se a pessoa que aceitou `versaoAceita` precisa aceitar de novo (REQ-11, REQ-12).
 *
 * A conta é olhar o que foi publicado **entre** o que ela aceitou e o que vige hoje: basta
 * uma versão `material` no caminho para o novo aceite ser devido. Sequência só de
 * `editorial` não pede nada — vírgula corrigida não muda o que foi autorizado.
 *
 * O pedido é **pedido**, nunca bloqueio (REQ-11): travar a conta de quem não aceitou um
 * termo novo é coagir consentimento, o oposto do que o Art. 8º pede. Quem decide o que
 * fazer com este `true` é a tela, e ela oferece uma saída.
 */
export function precisaNovoAceite(
  termoId: string,
  versaoAceita: string | null,
  instante: Date | string = new Date(),
  termos: VersaoTermo[] = TERMOS,
): boolean {
  if (!versaoAceita) return true

  const aceita = termos.find((t) => t.termoId === termoId && t.versao === versaoAceita)
  // Versão fora do catálogo: não dá para afirmar que o que ela leu continua valendo.
  if (!aceita) return true

  const vigente = versaoVigente(termoId, instante, termos)
  const inicio = instanteDe(aceita.dataVigencia)
  const fim = instanteDe(vigente.dataVigencia)

  return termos.some(
    (t) =>
      t.termoId === termoId &&
      t.tipoMudanca === 'material' &&
      instanteDe(t.dataVigencia) > inicio &&
      instanteDe(t.dataVigencia) <= fim,
  )
}

/** Encontra a versão que corresponde a um texto. `null` se não houver. */
export function versaoPorTexto(texto: string, termos: VersaoTermo[] = TERMOS): VersaoTermo | null {
  return termos.find((t) => t.texto === texto) ?? null
}

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

export interface DivergenciaDeIntegridade {
  termoId: string
  versao: string
  declarado: string
  calculado: string
}

/**
 * Recalcula o hash de cada versão e devolve as que divergem do declarado (REQ-2).
 *
 * Lista vazia é o único resultado aceitável. Qualquer divergência significa que o texto de
 * uma versão publicada foi alterado — o que é proibido —, e o teste que chama esta função
 * é bloqueante no CI.
 */
export async function conferirIntegridade(
  termos: VersaoTermo[] = TERMOS,
): Promise<DivergenciaDeIntegridade[]> {
  const divergencias: DivergenciaDeIntegridade[] = []
  for (const t of termos) {
    const calculado = await hashDoTermo(t.texto)
    if (calculado !== t.hash) {
      divergencias.push({
        termoId: t.termoId,
        versao: t.versao,
        declarado: t.hash,
        calculado,
      })
    }
  }
  return divergencias
}
