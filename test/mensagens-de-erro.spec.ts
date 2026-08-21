/**
 * Nenhuma validação pode cair no texto padrão do Zod.
 *
 * Em 2026-08-21, em produção, quem marcou "Outro" no tipo de deficiência e escreveu uma
 * letra só no campo "Qual?" recebeu **"Invalid input"** na tela. A regra era
 * `z.string().trim().min(2).max(100)` — correta, e sem mensagem. Sem mensagem, o Zod
 * responde em inglês e de forma genérica, e esse texto não fica no console: ele sobe pela
 * resposta 422, entra no resumo de erros e é o que a pessoa lê.
 *
 * O público deste site é quem menos deveria ter de adivinhar o que "Invalid input"
 * significa. Por isso a checagem é estrutural e não uma revisão de olho: percorre os
 * esquemas e reprova qualquer regra sem mensagem própria.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { esquemaInscricao, esquemaMeusDados } from '../shared/inscricao'

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

/*
  As regras que aceitam mensagem e produzem texto voltado à pessoa. `optional`, `trim`,
  `transform` e afins não validam nada, então não entram.
*/
const REGRAS_COM_MENSAGEM = ['min', 'max', 'regex', 'literal', 'length', 'email', 'url', 'uuid']

/** `.min(2)` sem mensagem; `.min(2, '…')` com. O segundo argumento é o que se procura. */
function regrasSemMensagem(fonte: string): string[] {
  const achados: string[] = []
  for (const regra of REGRAS_COM_MENSAGEM) {
    const padrao = new RegExp(`\\.${regra}\\(([^)]*)\\)`, 'g')
    for (const encontro of fonte.matchAll(padrao)) {
      const argumentos = encontro[1] ?? ''
      const temTexto = /['"`]/.test(argumentos)
      if (!temTexto) achados.push(encontro[0])
    }
  }
  return achados
}

const ESQUEMAS = [
  join(RAIZ, 'shared', 'inscricao.ts'),
  join(RAIZ, 'server', 'api', 'area', 'inscricao.put.ts'),
  join(RAIZ, 'shared', 'senha.ts'),
]

describe('Nenhuma validação cai no texto padrão do Zod', () => {
  it.each(ESQUEMAS)('%s: toda regra tem mensagem própria', (caminho) => {
    let fonte: string
    try {
      fonte = readFileSync(caminho, 'utf8')
    } catch {
      return // arquivo opcional na lista; se não existe, não há o que checar
    }
    // Só as linhas de esquema: `.max(` de um `Math.max` ou de CSS não é validação.
    const linhasDeZod = fonte
      .split('\n')
      .filter((linha) => /z\.|\.\s*$|^\s*\./.test(linha))
      .join('\n')
    expect(regrasSemMensagem(linhasDeZod)).toEqual([])
  })
})

describe('As mensagens saem em português, e dizem o que fazer', () => {
  /*
    Percorre o esquema de verdade, não o texto: é o caminho que a pessoa faz. Cada caso
    abaixo é um erro que já apareceu ou pode aparecer na tela.
  */
  const baseValida = {
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
  }

  it('"Outro" com uma letra só explica o que falta, em português', () => {
    const resultado = esquemaInscricao.safeParse({
      ...baseValida,
      deficiencias: ['Outro'],
      deficienciaOutro: 'a',
      atendimentos: ['Fisioterapia'],
      dias: ['Segundas'],
      cienciaContribuicao: 'Ciente',
      email: 'teste@exemplo.test',
      cpf: '84779469147',
      senha: 'senha-de-teste-longa',
      consentimentoSaude: true,
      termoHash: 'a'.repeat(64),
    })

    expect(resultado.success).toBe(false)
    if (resultado.success) return
    const mensagens = resultado.error.issues.map((i) => i.message)
    // O texto do Zod, que é o defeito que esta suíte existe para pegar.
    expect(mensagens).not.toContain('Invalid input')
    expect(mensagens.some((m) => /letra|palavra|escreva/i.test(m))).toBe(true)
  })

  it('nenhum erro de "Meus dados" sai em inglês', () => {
    const resultado = esquemaMeusDados.safeParse({
      nome: '',
      telefone: '',
      telefoneWhatsapp: 'Sim',
      cep: '1',
      endereco: '',
      numero: '',
      bairro: '',
      municipio: '',
      estado: '',
      pais: '',
    })

    expect(resultado.success).toBe(false)
    if (resultado.success) return
    for (const problema of resultado.error.issues) {
      expect(problema.message).not.toMatch(/invalid|expected|required|must contain/i)
      // Toda mensagem termina em ponto: é frase para ler, não rótulo de campo.
      expect(problema.message).toMatch(/[.!?]$/)
    }
  })
})
