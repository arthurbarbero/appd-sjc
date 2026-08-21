/**
 * Cenários de `cracha-impresso` que dá para checar sem navegador.
 *
 * O que exige workerd e navegador — o CID gravando, a recusa sem consentimento, a tira
 * medida na folha — está no `npm run aceite`.
 *
 * A parte que mais importa aqui é a do [ADR-020](../docs/adr/adr-020-cid-no-cadastro-e-no-cracha.md):
 * o CID é diagnóstico, e as travas dele são estruturais. Um teste que lê o código-fonte
 * pega o dia em que alguém as afrouxa sem perceber — que é como esse tipo de regra costuma
 * cair, e não por decisão consciente.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { esquemaInscricao } from '../shared/inscricao'
import { TERMOS, versaoVigente } from '../shared/termos'

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const ler = (...partes: string[]) => readFileSync(join(RAIZ, ...partes), 'utf8')

describe('O termo do CID é próprio, e não uma versão do Art. 11', () => {
  it('existe no catálogo com slug distinto', () => {
    const cid = TERMOS.find((t) => t.termoId === 'cid-diagnostico')
    expect(cid).toBeTruthy()
    expect(cid?.termoId).not.toBe('deficiencia-art11')
  })

  it('a versão vigente é resolvível pelo slug', () => {
    expect(versaoVigente('cid-diagnostico').termoId).toBe('cid-diagnostico')
  })

  it('o texto diz as três coisas que a pessoa não deduziria', () => {
    const texto = versaoVigente('cid-diagnostico').texto
    // Que o CID diz mais que o tipo de deficiência.
    expect(texto).toMatch(/diz mais sobre a sua\s+saúde/)
    // Que guardar não é imprimir.
    expect(texto).toMatch(/Guardar não é imprimir/)
    // Que a página pública nunca o mostra.
    expect(texto).toMatch(/nunca aparece na página pública/)
  })

  it('não usa linguagem que empurre a marcar', () => {
    const texto = versaoVigente('cid-diagnostico').texto.toLowerCase()
    for (const palavra of ['recomendado', 'recomendamos', 'ajuda', 'facilita', 'aconselhamos']) {
      expect(texto, palavra).not.toContain(palavra)
    }
  })
})

describe('Informar CID exige autorizar (REQ-10, REQ-11)', () => {
  const base = {
    nome: 'Maria Fictícia de Teste',
    nascimento: '12/03/1978',
    telefone: '12991657059',
    telefoneWhatsapp: 'Sim' as const,
    cep: '12239530',
    endereco: 'Rua Fictícia',
    numero: 's/n',
    bairro: 'Centro',
    municipio: 'São José dos Campos',
    estado: 'SP',
    pais: 'Brasil',
    deficiencias: ['Física'],
    atendimentos: ['Fisioterapia'],
    dias: ['Segundas'],
    cienciaContribuicao: 'Ciente' as const,
    email: 'teste@exemplo.test',
    cpf: '84779469147',
    senha: 'senha-de-teste-longa',
    consentimentoSaude: true as const,
    termoHash: 'a'.repeat(64),
    chaveIdempotencia: '11111111-2222-4333-8444-555555555555',
  }

  it('sem CID, o cadastro é aceito', () => {
    expect(esquemaInscricao.safeParse(base).success).toBe(true)
  })

  it('com CID e sem autorização, é recusado', () => {
    const r = esquemaInscricao.safeParse({ ...base, cid: 'G82.4' })
    expect(r.success).toBe(false)
    if (r.success) return
    expect(r.error.issues.some((i) => i.path.includes('consentimentoCid'))).toBe(true)
  })

  it('com CID e autorização, é aceito', () => {
    const r = esquemaInscricao.safeParse({
      ...base,
      cid: 'G82.4',
      consentimentoCid: true,
      termoCidHash: 'b'.repeat(64),
    })
    expect(r.success).toBe(true)
  })

  it('autorizar sem informar CID não é erro', () => {
    // A assimetria é deliberada: a trava impede guardar sem consentir, não punir quem
    // marcou uma caixa a mais.
    expect(esquemaInscricao.safeParse({ ...base, consentimentoCid: true }).success).toBe(true)
  })
})

describe('A tela não afirma o consentimento pela pessoa', () => {
  it('o envio manda o consentimento como a caixa está, nunca fixo', () => {
    /*
      Na primeira versão eu mandei `consentimentoCid: true` fixo junto do CID, e isso
      anulava a caixa — o cliente afirmava a autorização que o servidor iria conferir. O
      teste de ponta a ponta pegou; este aqui impede a volta.
    */
    const tela = ler('app', 'pages', 'atendimento', 'inscricao.vue')
    // O consentimento entra no corpo condicionado à caixa...
    expect(tela).toMatch(/f\.consentimentoCid \? \{ consentimentoCid: true as const \} : \{\}/)
    // ...e nunca solto, que era a forma que anulava a caixa.
    expect(tela).not.toMatch(/^\s*consentimentoCid: true as const,\s*$/m)
  })

  it('a caixa só aparece depois que há CID escrito', () => {
    const tela = ler('app', 'pages', 'atendimento', 'inscricao.vue')
    expect(tela).toMatch(/v-if="f\.cid\.trim\(\)"/)
  })
})

describe('O opt-in de imprimir é outro, e o CID nunca é público', () => {
  it('a rota do crachá só devolve o CID com o opt-in ligado', () => {
    const rota = ler('server', 'api', 'area', 'cracha.get.ts')
    expect(rota).toMatch(/const cid = conta\.cidNoCracha \? conta\.cid : null/)
  })

  it('a tela recebe um booleano para saber que existe CID, não o valor', () => {
    // Sem isso a lógica fica circular: a tela só oferece o controle se receber o dado, e
    // a rota só manda o dado se o controle estiver ligado.
    expect(ler('server', 'api', 'area', 'cracha.get.ts')).toMatch(/temCid: Boolean\(conta\.cid\)/)
    expect(ler('app', 'pages', 'area', 'cracha.vue')).toMatch(/v-if="data\.temCid"/)
  })

  it('ligar a impressão sem CID guardado é recusado', () => {
    expect(ler('server', 'api', 'area', 'cracha.put.ts')).toMatch(
      /Não há CID guardado para imprimir/,
    )
  })

  it('o texto do opt-in diz o que a impressão significa', () => {
    const tela = ler('app', 'pages', 'area', 'cracha.vue')
    expect(tela).toMatch(/mostra a quem pedir/)
    expect(tela).toMatch(/nunca mostra o seu CID/)
  })
})

describe('A retirada apaga o dado e a marca, na mesma transação', () => {
  const rota = ler('server', 'api', 'area', 'consentimento-cid.post.ts')

  it('apaga o CID e desliga o opt-in juntos', () => {
    expect(rota).toMatch(/cid: null, cidNoCracha: false/)
  })

  it('grava a revogação apontando o termo que a pessoa aceitou', () => {
    expect(rota).toMatch(/evento: 'revogacao'/)
    expect(rota).toMatch(/termoId: TERMO_ID/)
    expect(rota).toMatch(/const termo = ultimo \?\? versaoVigente/)
  })

  it('é rota própria, e não um parâmetro escolhendo o alvo', () => {
    // Rota que decide qual dado apagar a partir do corpo é caminho lateral, e aqui o
    // efeito é apagar dado de saúde.
    expect(rota).toMatch(/corpo\?\.revogar !== true/)
    expect(rota).not.toMatch(/corpo\?\.(termo|qual|alvo)/)
  })
})

describe('O cartão é deitado, e traz os campos do papel', () => {
  const cracha = ler('app', 'components', 'AppdCracha.vue')

  it('mede 85,6 × 54 mm — ISO ID-1, deitado', () => {
    expect(cracha).toMatch(/width:\s*85\.6mm/)
    expect(cracha).toMatch(/height:\s*54mm/)
  })

  it('mostra emissão, CRAS, credencial e contato de emergência', () => {
    expect(cracha).toMatch(/emissaoLegivel/)
    expect(cracha).toMatch(/\bcras\b/)
    expect(cracha).toMatch(/credencialTransporte/)
    expect(cracha).toMatch(/emergenciaLegivel/)
  })

  it('não promete validade nem contribuição em dia', () => {
    // Decisão do dono: validade fica para depois. O site não sabe se a contribuição está
    // em dia, e imprimir seria sustentar o que não se pode.
    expect(cracha).not.toMatch(/validade/i)
    expect(cracha).not.toMatch(/contribuição em dia/i)
  })

  it('o número impresso é o do site, e não sequencial', () => {
    expect(cracha).toMatch(/numeroRegistro/)
    expect(cracha).not.toMatch(/\/CD/)
  })

  it('a folha cabe: dois cartões de 85,6 mm mais o vão dentro de 210 mm', () => {
    const folha = ler('app', 'pages', 'area', 'cracha-impressao.vue')
    const margem = Number(folha.match(/padding:\s*(\d+(?:\.\d+)?)mm/)?.[1] ?? '0')
    const vao = Number(folha.match(/gap:\s*(\d+(?:\.\d+)?)mm/)?.[1] ?? '0')
    expect(85.6 * 2 + vao + margem * 2).toBeLessThanOrEqual(210)
  })
})
