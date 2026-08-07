/**
 * Vazamento de dado sensível pelas rotas públicas — T6.1 de `cracha-do-associado`.
 *
 * **Bloqueante**: falhou, a change não fecha e o build quebra.
 *
 * Lê o **código-fonte** das rotas, e não a resposta renderizada. Os dois têm valor e
 * cobrem coisas diferentes: o gate de aceite percorre a resposta de verdade e pega o que
 * escapa em tempo de execução; este arquivo pega a intenção errada antes de ela virar
 * resposta — um `SELECT *` acrescentado numa refatoração, uma coluna nova que entrou na
 * projeção sem ninguém notar, um campo devolvido "porque a tela pode precisar depois".
 *
 * O campo 12 (tipo de deficiência) é dado sensível do Art. 11 da LGPD. Ele tem **um único
 * caminho legítimo** para sair do banco: a rota do crachá, e só quando a pessoa marcou o
 * opt-in do REQ-25. Qualquer outra saída é defeito.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const RAIZ = join(import.meta.dirname, '..')
const API = join(RAIZ, 'server', 'api')

function arquivos(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? arquivos(join(dir, e.name)) : [join(dir, e.name)],
  )
}

const ler = (caminho: string) => readFileSync(caminho, 'utf8')

/** Colunas que a verificação pública pode projetar (REQ-28, com o ADR-015). */
const PERMITIDAS_VERIFICACAO = [
  'id',
  'nome',
  'numeroRegistro',
  'situacao',
  'cuidadorNome',
  'cuidadorContato',
  // Não é o dado sensível: é a autorização para ir buscá-lo (ADR-019).
  'crachaMostraDeficiencia',
]

describe('a verificação pública não vaza (REQ-28, ADR-015)', () => {
  const rota = ler(join(API, 'verificar', '[numero].get.ts'))

  it('projeta coluna a coluna, nunca a tabela inteira', () => {
    expect(rota).not.toMatch(/\.select\(\)/)
    expect(rota).toMatch(/\.select\(\{/)
  })

  it('projeta exatamente as colunas permitidas, e nenhuma outra', () => {
    const bloco = rota.match(/\.select\(\{([\s\S]*?)\}\)/)?.[1] ?? ''
    const colunas = [...bloco.matchAll(/(\w+):\s*schema\.usuarios\.(\w+)/g)].map((m) => m[2]!)
    expect(colunas.sort()).toEqual([...PERMITIDAS_VERIFICACAO].sort())
  })

  it('só consulta o tipo de deficiência com o consentimento marcado (ADR-019)', () => {
    /*
      Antes do ADR-019 este teste exigia que a palavra não aparecesse na rota. Agora ela
      aparece — e o que precisa ser garantido é mais estrito: a consulta tem de estar
      **dentro** da condicional do consentimento. Filtrar depois de buscar não serve, o
      dado já teria saído do banco, e é essa a proteção que interessa.
    */
    expect(rota).toMatch(/mostraDeficiencia\s*\n?\s*\?\s*\[\]/)
    expect(rota).not.toMatch(/deficienciaOutro/)
  })

  it('não devolve e-mail, CPF, nascimento nem endereço', () => {
    for (const proibido of ['email', 'cpf', 'nascimento', 'endereco', 'cep', 'telefone']) {
      expect(rota, `a verificação pública menciona ${proibido}`).not.toMatch(
        new RegExp(`schema\\.usuarios\\.${proibido}`, 'i'),
      )
    }
  })
})

describe('o campo 12 tem um caminho só para sair do banco', () => {
  /*
    A lista é curta de propósito, e cada linha é uma decisão:

    - `area/cracha.get.ts` lê **condicionado ao opt-in**, e é o caso do REQ-25;
    - `area/inscricao.*` são a tela de correção do próprio cadastro, a única que pode
      exibir o campo para a própria pessoa (`area-do-associado` REQ-5);
    - `conta/cadastro.post.ts` grava o que a pessoa acabou de responder.

    Rota nova que mencione deficiência e não esteja aqui reprova, e é para reprovar mesmo:
    a lista existe para forçar a conversa antes de o dado ganhar uma saída nova.
  */
  const AUTORIZADAS = [
    join('area', 'cracha.get.ts'),
    join('area', 'inscricao.get.ts'),
    join('area', 'inscricao.put.ts'),
    join('conta', 'cadastro.post.ts'),
    // Desde o ADR-019, condicionada ao consentimento — provado pelo teste acima.
    join('verificar', '[numero].get.ts'),
  ]

  it('nenhuma rota fora da lista menciona o campo 12', () => {
    const infratoras = arquivos(API)
      // Casa a **coluna**, não a palavra: `termoId: 'deficiencia-art11'` é identificador do
      // termo de consentimento, não o dado. Regex larga demais reprova o inocente e ensina
      // a ignorar o vermelho.
      .filter((caminho) => /\bdeficiencias\b|deficienciaOutro/.test(ler(caminho)))
      .map((caminho) => caminho.slice(API.length + 1))
      .filter((relativo) => !AUTORIZADAS.includes(relativo))

    expect(infratoras, `rota não autorizada mencionando o campo 12: ${infratoras}`).toEqual([])
  })

  it('a rota do crachá só consulta o campo 12 com o opt-in marcado', () => {
    const cracha = ler(join(API, 'area', 'cracha.get.ts'))
    // A consulta precisa estar **dentro** de uma condicional sobre o opt-in. Se alguém
    // trocar por consulta incondicional e filtrar depois, o dado já saiu do banco.
    expect(cracha).toMatch(/crachaMostraDeficiencia\s*\n?\s*\?[\s\S]*?deficiencias/)
  })
})

describe('a tela pública não carrega o que a rota não manda', () => {
  it('a página de verificação não traz dado de contato nem documento da pessoa', () => {
    const pagina = ler(join(RAIZ, 'app', 'pages', 'verificar', '[numero].vue'))
    expect(pagina).not.toMatch(/data\.(email|cpf|nascimento|endereco|cep)\b/)
  })

  it('o tipo de deficiência nunca é exibido sem condicional na página pública', () => {
    // Desde o ADR-019 ele pode aparecer — mas só quando a rota o mandou, e a rota só manda
    // com o consentimento. O template não pode ter um caminho incondicional.
    const pagina = ler(join(RAIZ, 'app', 'pages', 'verificar', '[numero].vue'))
    expect(pagina).toMatch(/v-if="data\?\.deficiencias\?\.length"/)
  })
})

describe('as rotas do painel da área não trazem o campo 12 (area REQ-5, T6.1)', () => {
  /*
    O painel faz três chamadas — conta, resumo da inscrição e situação da foto. Nenhuma
    das três pode devolver o tipo de deficiência, e a garantia está na **projeção**: as três
    listam coluna por coluna, então acrescentar o campo exigiria editá-las de propósito.

    A tela de correção (`inscricao.get.ts`) é a exceção declarada, e continua fora daqui.
  */
  const DO_PAINEL = ['meus-dados.get.ts', 'resumo-inscricao.get.ts', 'tem-foto.get.ts']

  it.each(DO_PAINEL)('%s não menciona o campo 12', (arquivo) => {
    expect(ler(join(API, 'area', arquivo))).not.toMatch(/\bdeficiencias\b|deficienciaOutro/)
  })

  it.each(DO_PAINEL)('%s projeta coluna a coluna, nunca a linha inteira', (arquivo) => {
    const rota = ler(join(API, 'area', arquivo))
    expect(rota).toMatch(/columns:\s*\{/)
  })

  it('o painel não exibe o campo 12 no template', () => {
    const painel = ler(join(RAIZ, 'app', 'pages', 'area', 'index.vue'))
    expect(painel).not.toMatch(/deficiencia/i)
  })
})

describe('seed e fixtures não carregam dado de pessoa real (REQ-43, T6.4)', () => {
  it('o seed se declara fictício e usa domínio reservado', () => {
    const seed = ler(join(RAIZ, 'scripts', 'seed-local.mjs'))
    expect(seed.toLowerCase()).toMatch(/fictício|ficticio/)
    // `.test`, `.invalid` e `.example` são reservados pela RFC 2606, e `exemplo.invalido` é a
    // versão em português da mesma ideia: e-mail de teste que não pode existir de verdade não
    // vira mensagem para a caixa de alguém.
    const emails = [...seed.matchAll(/[\w.+-]+@[\w.-]+\.\w+/g)].map((m) => m[0])
    for (const email of emails) {
      expect(email, `e-mail de seed fora de domínio reservado: ${email}`).toMatch(
        /@([\w.-]+\.(test|invalid|example)|exemplo\.invalido|example\.(com|org)|appd\.org\.br)$/,
      )
    }
  })
})
