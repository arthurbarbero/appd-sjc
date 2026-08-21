/**
 * Testes do schema Zod compartilhado — `modelo-de-dados` T1.3.
 *
 * Foco no caminho infeliz: o caminho feliz de um formulário quase sempre funciona; o que
 * derruba a pessoa é a máscara que recusa o que ela colou, o "Outro" que não pede
 * especificação, e o campo desconhecido aceito em silêncio.
 */

import { describe, expect, it } from 'vitest'
import { cpfValido, esquemaInscricao } from '../shared/inscricao'
import { TERMO_ART11 } from '../shared/termos'

/** Preenchimento válido mínimo. Todo dado é fictício. */
const VALIDO = {
  nome: 'Maria Fictícia da Silva',
  nascimento: '12/03/1978',
  telefone: '(12) 90000-0001',
  telefoneWhatsapp: 'Sim',
  cep: '12239-530',
  endereco: 'Rua de Teste',
  numero: 's/n',
  bairro: 'Bairro Fictício',
  municipio: 'São José dos Campos',
  estado: 'SP',
  pais: 'Brasil',
  deficiencias: ['Física'],
  atendimentos: ['Fisioterapia'],
  dias: ['Segundas'],
  cienciaContribuicao: 'Ciente',
  email: 'maria.ficticia@exemplo.test',
  cpf: '390.533.447-05',
  senha: 'senha de teste bem longa',
  consentimentoSaude: true,
  // Hash do termo exibido: sem ele o servidor não sabe **qual texto** foi aceito
  // (`consentimento-e-privacidade` REQ-8).
  termoHash: TERMO_ART11.hash,
  chaveIdempotencia: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
}

describe('Schema da inscrição', () => {
  it('aceita o preenchimento válido e normaliza o que precisa', () => {
    const r = esquemaInscricao.parse(VALIDO)
    // Formato internacional desde 2026-08-21: o que se guarda é E.164.
    expect(r.telefone).toBe('+5512900000001')
    expect(r.cpf).toBe('39053344705')
    expect(r.email).toBe('maria.ficticia@exemplo.test')
    // O CEP é guardado só com dígitos: máscara é formatação, não dado.
    expect(r.cep).toBe('12239530')
  })

  it('recusa CEP incompleto', () => {
    expect(esquemaInscricao.safeParse({ ...VALIDO, cep: '1223' }).success).toBe(false)
  })

  it('a máscara não bloqueia: os formatos colados são aceitos e viram E.164', () => {
    const casos: [string, string][] = [
      // Sem código do país, o Brasil é assumido — é o campo que já nasce com +55.
      ['12991657059', '+5512991657059'],
      // Copiado do WhatsApp: o +55 é aproveitado, não descartado nem recusado.
      ['+55 12 99165-7059', '+5512991657059'],
      ['(12) 3346-0605', '+551233460605'],
      // Colagem do WhatsApp sem o `+`, que também acontece.
      ['5512991657059', '+5512991657059'],
      // Número estrangeiro: quem escreveu o `+` disse qual é o país, e ninguém aqui sabe
      // melhor. Passou a ser aceito quando o campo virou apagável (2026-08-21).
      ['+351 912 345 678', '+351912345678'],
    ]
    for (const [colado, esperado] of casos) {
      expect(esquemaInscricao.parse({ ...VALIDO, telefone: colado }).telefone).toBe(esperado)
    }
  })

  it('e-mail com maiúscula e espaço é normalizado, não recusado', () => {
    const r = esquemaInscricao.parse({ ...VALIDO, email: '  Maria@Exemplo.TEST ' })
    expect(r.email).toBe('maria@exemplo.test')
  })

  it('recusa campo desconhecido em vez de ignorar em silêncio', () => {
    const r = esquemaInscricao.safeParse({ ...VALIDO, prioridade: true })
    expect(r.success).toBe(false)
  })

  it('recusa opção fora da lista oficial', () => {
    const r = esquemaInscricao.safeParse({ ...VALIDO, atendimentos: ['Cirurgia'] })
    expect(r.success).toBe(false)
  })

  /*
    A regra virou o contrário em 2026-08-21, e o teste vira com ela.

    O dono abriu o cadastro a quem não tem deficiência — "eu posso não ter nenhuma
    deficiência e querer ser voluntário". Os três campos de múltipla escolha passaram a ser
    opcionais, e o consentimento do Art. 11 passou a ser exigido só quando há deficiência
    marcada: sem dado de saúde não há finalidade a autorizar.
  */
  it('aceita as três múltiplas escolhas vazias', () => {
    const semNada = esquemaInscricao.safeParse({
      ...VALIDO,
      deficiencias: [],
      atendimentos: [],
      dias: [],
      // Sem deficiência, a autorização do Art. 11 não é pedida nem enviada.
      consentimentoSaude: undefined,
      termoHash: undefined,
    })
    expect(semNada.success).toBe(true)
  })

  it('o vocabulário continua fechado: opcional não é texto livre', () => {
    expect(esquemaInscricao.safeParse({ ...VALIDO, dias: ['Sábado de manhã'] }).success).toBe(false)
  })

  it('marcar deficiência volta a exigir a autorização do Art. 11', () => {
    const r = esquemaInscricao.safeParse({
      ...VALIDO,
      deficiencias: ['Física'],
      consentimentoSaude: undefined,
      termoHash: undefined,
    })
    expect(r.success).toBe(false)
    if (r.success) return
    expect(r.error.issues.some((i) => i.path.includes('consentimentoSaude'))).toBe(true)
  })

  it('marcar deficiência sem o hash do termo também é recusado', () => {
    // A autorização e o texto que ela aceitou são uma peça só: consentimento gravado sem
    // saber que texto a pessoa leu não prova nada.
    const r = esquemaInscricao.safeParse({ ...VALIDO, termoHash: undefined })
    expect(r.success).toBe(false)
  })

  it('marcar "Outro" torna o campo de especificação obrigatório', () => {
    const semTexto = esquemaInscricao.safeParse({ ...VALIDO, deficiencias: ['Outro'] })
    expect(semTexto.success).toBe(false)
    expect(semTexto.error?.issues[0]?.path).toEqual(['deficienciaOutro'])

    const comTexto = esquemaInscricao.safeParse({
      ...VALIDO,
      deficiencias: ['Outro'],
      deficienciaOutro: 'Múltipla',
    })
    expect(comTexto.success).toBe(true)
  })

  it('sem o consentimento do Art. 11 não passa', () => {
    expect(esquemaInscricao.safeParse({ ...VALIDO, consentimentoSaude: false }).success).toBe(false)
  })

  it('senha exige comprimento e nada mais', () => {
    expect(esquemaInscricao.safeParse({ ...VALIDO, senha: 'curta123' }).success).toBe(false)
    // Só minúsculas, com espaços, sem símbolo nem dígito: tem de passar.
    expect(esquemaInscricao.safeParse({ ...VALIDO, senha: 'uma frase simples' }).success).toBe(true)
  })

  it('mensagem de erro diz o que fazer, não "campo inválido"', () => {
    const r = esquemaInscricao.safeParse({ ...VALIDO, nascimento: '12-03-1978' })
    expect(r.error?.issues[0]?.message).toContain('dia/mês/ano')
  })
})

describe('CPF', () => {
  it('aceita CPF com dígitos verificadores corretos, com ou sem máscara', () => {
    expect(cpfValido('39053344705')).toBe(true)
    expect(cpfValido('390.533.447-05')).toBe(true)
    expect(cpfValido('52998224725')).toBe(true)
  })

  it('recusa dígito verificador errado', () => {
    expect(cpfValido('39053344700')).toBe(false)
  })

  it('recusa sequência repetida, que passaria no cálculo ingênuo', () => {
    for (const cpf of ['00000000000', '11111111111', '99999999999']) {
      expect(cpfValido(cpf)).toBe(false)
    }
  })

  it('recusa comprimento errado', () => {
    expect(cpfValido('3905334470')).toBe(false)
    expect(cpfValido('390533447055')).toBe(false)
  })
})
