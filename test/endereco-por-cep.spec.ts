/**
 * A busca de endereço por CEP, que mudou de lado em 2026-08-21.
 *
 * Até aqui ela preenchia **só campo vazio**, para não apagar o que a pessoa digitou. A
 * associação pediu o contrário — quem confere o endereço com a pessoa na frente quer que o
 * CEP novo corrija o que estava lá.
 *
 * A regra tem duas metades, e é a segunda que este arquivo mais guarda: substitui **quando o
 * CEP muda**, e não a cada busca. Sem essa metade, sair do campo e voltar dispararia a busca
 * de novo e apagaria a correção que a pessoa acabou de digitar — um campo que se limpa
 * sozinho, que é pior do que o comportamento antigo e mais difícil de relatar.
 */

import { describe, expect, it } from 'vitest'
import { preencherPorCep, type EnderecoDoCep } from '../app/utils/endereco-por-cep'

const RESPOSTA: EnderecoDoCep = {
  encontrado: true,
  endereco: 'Rua Acássia Pereira',
  bairro: 'Campos dos Alemães',
  municipio: 'São José dos Campos',
  uf: 'SP',
}

const vazios = () => ({ endereco: '', bairro: '', municipio: '', estado: '' })
const preenchidos = () => ({
  endereco: 'Rua Antiga',
  bairro: 'Bairro Antigo',
  municipio: 'Outra Cidade',
  estado: 'RJ',
})

const busca =
  (r: EnderecoDoCep = RESPOSTA) =>
  async () =>
    r

describe('Preenche o que está vazio, sempre', () => {
  it('a primeira busca preenche os quatro campos', async () => {
    const campos = vazios()
    const r = await preencherPorCep('12239-530', campos, '', busca())
    expect(campos).toEqual({
      endereco: 'Rua Acássia Pereira',
      bairro: 'Campos dos Alemães',
      municipio: 'São José dos Campos',
      estado: 'SP',
    })
    expect(r.cepQuePreencheu).toBe('12239530')
    // Não houve substituição: os campos estavam vazios, e ninguém perdeu nada.
    expect(r.substituiu).toBe(false)
  })

  it('CEP incompleto não busca nem mexe em nada', async () => {
    const campos = vazios()
    let chamou = false
    await preencherPorCep('1223', campos, '', async () => {
      chamou = true
      return RESPOSTA
    })
    expect(chamou).toBe(false)
    expect(campos).toEqual(vazios())
  })
})

describe('Substitui quando o CEP muda', () => {
  it('CEP diferente troca o endereço inteiro', async () => {
    const campos = preenchidos()
    const r = await preencherPorCep('12239-530', campos, '01001000', busca())
    expect(campos.endereco).toBe('Rua Acássia Pereira')
    expect(campos.estado).toBe('SP')
    expect(r.substituiu).toBe(true)
  })

  it('o mesmo CEP não troca nada', async () => {
    /*
      É a metade que impede o campo de se limpar sozinho. A busca dispara ao sair do campo do
      CEP, então voltar a ele depois de corrigir a rua dispararia de novo — e sem esta regra
      a correção sumiria.
    */
    const campos = { ...preenchidos(), endereco: 'Rua Acássia Pereira, apto 42' }
    const r = await preencherPorCep('12239-530', campos, '12239530', busca())
    expect(campos.endereco).toBe('Rua Acássia Pereira, apto 42')
    expect(campos.bairro).toBe('Bairro Antigo')
    expect(r.substituiu).toBe(false)
  })

  it('com o mesmo CEP, campo esvaziado à mão volta a ser preenchido', async () => {
    // Quem apagou o bairro não tem nada a perder, e deixar em branco seria trabalho que a
    // busca podia poupar.
    const campos = { ...preenchidos(), bairro: '' }
    await preencherPorCep('12239-530', campos, '12239530', busca())
    expect(campos.bairro).toBe('Campos dos Alemães')
    expect(campos.endereco).toBe('Rua Antiga')
  })

  it('não anuncia substituição quando o valor novo é igual ao que estava', async () => {
    // Trocar "São José dos Campos" por "São José dos Campos" não é perda, e avisar seria
    // ruído — a região viva falaria sem que nada tivesse acontecido.
    const campos = {
      endereco: 'Rua Acássia Pereira',
      bairro: 'Campos dos Alemães',
      municipio: 'São José dos Campos',
      estado: 'SP',
    }
    const r = await preencherPorCep('12239-530', campos, '01001000', busca())
    expect(r.substituiu).toBe(false)
  })
})

describe('Quando a busca não dá certo, nada é apagado', () => {
  it('CEP inexistente mantém o que estava e explica', async () => {
    const campos = preenchidos()
    const r = await preencherPorCep('99999-999', campos, '12239530', busca({ encontrado: false }))
    expect(campos).toEqual(preenchidos())
    expect(r.aviso).toMatch(/Não encontramos este CEP/)
    expect(r.cepQuePreencheu).toBe('12239530')
  })

  it('serviço fora do ar mantém o que estava e diz que é do serviço', async () => {
    const campos = preenchidos()
    const r = await preencherPorCep(
      '12239-530',
      campos,
      '',
      busca({ encontrado: false, indisponivel: true }),
    )
    expect(campos).toEqual(preenchidos())
    expect(r.aviso).toMatch(/fora do ar/)
  })

  it('erro de rede mantém o que estava', async () => {
    const campos = preenchidos()
    const r = await preencherPorCep('12239-530', campos, '', async () => {
      throw new Error('rede')
    })
    expect(campos).toEqual(preenchidos())
    expect(r.aviso).toMatch(/falhou/)
  })
})

describe('As duas telas usam esta função, e não cópias dela', () => {
  it('nem a inscrição nem /area/dados montam a busca por conta própria', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const raiz = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
    for (const tela of ['app/pages/atendimento/inscricao.vue', 'app/pages/area/dados.vue']) {
      const fonte = readFileSync(join(raiz, tela), 'utf8')
      expect(fonte, `${tela} não usa preencherPorCep`).toMatch(/preencherPorCep\(/)
      /*
        A marca da cópia antiga: preencher campo a campo dentro da tela, condicionado à
        resposta da busca. O `&& r.` é o que separa isto da **validação**, que também testa
        `!f.endereco.trim()` e continua onde sempre esteve — o primeiro padrão que escrevi
        pegava as duas e reprovava a tela por ter validação.
      */
      expect(fonte, `${tela} voltou a preencher à mão`).not.toMatch(/if \(!f\.\w+\.trim\(\) && r\./)
    }
  })
})
