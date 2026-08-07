/**
 * Gate de aceite no navegador — `npm run aceite`.
 *
 * Existe porque o dono decidiu, em 2026-08-07, que **não vai percorrer critério de aceite
 * à mão**: "voce mesmo valida". Está certo — 276 cenários Gherkin lidos por uma pessoa é
 * um gate que nunca acontece, e gate que não acontece vira carimbo.
 *
 * O que este arquivo cobre, e o `npm test` não consegue:
 *
 * - o **ciclo de conta** ponta a ponta (cadastrar, ver a área, corrigir dados, excluir);
 * - as **duas guardas de sessão**, que só se distinguem rodando: a do servidor responde a
 *   link direto, a do cliente responde a clique dentro do site;
 * - **rolagem horizontal** em seis larguras, incluindo a faixa de 861 a 900px onde um
 *   defeito do cabeçalho sobreviveu a duas conferências visuais;
 * - **axe** nível A e AA nas telas públicas e nas da área.
 *
 * Roda contra o workerd de verdade (`wrangler dev`), não contra o dev server do Nuxt: as
 * duas armadilhas que mais custaram neste projeto — o limite de GLOB do D1 e o teto de
 * 10 ms de CPU — só aparecem no runtime real.
 */

import { spawn, execFileSync } from 'node:child_process'
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const BASE = process.env.APPD_BASE ?? 'http://localhost:8787'
const SOBE_SERVIDOR = !process.env.APPD_BASE

const PUBLICAS = [
  '/',
  '/atendimento',
  '/atendimento/fisioterapia',
  '/projetos',
  '/projetos/bocha-paralimpica',
  '/sobre',
  '/contato',
  '/doar',
  '/entrar',
  '/atendimento/inscricao',
  // Número que não existe, de propósito: é o estado que qualquer pessoa alcança sem
  // conta, e o que a câmera do celular mais vai encontrar se o crachá estiver borrado.
  '/verificar/APPD-2026-ZZZZZZ',
]

const LARGURAS = [360, 414, 768, 880, 1024, 1280, 1440]

const resultados = []
const ok = (rotulo, condicao, extra = '') =>
  resultados.push({ rotulo, passou: Boolean(condicao), extra })

/** CPF válido e aleatório: seed com CPF fixo colide no UNIQUE entre execuções. */
function cpfAleatorio() {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  const digito = (ate) => {
    let soma = 0
    for (let i = 0; i < ate; i++) soma += n[i] * (ate + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  n.push(digito(9))
  n.push(digito(10))
  return n.join('')
}

async function esperarServidor(tentativas = 60) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(BASE, { redirect: 'manual' })
      if (r.status < 500) return true
    } catch {
      /* ainda subindo */
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  return false
}

/**
 * Encerra o `wrangler` **e tudo que ele abriu**.
 *
 * `servidor.kill()` sozinho não basta: o `wrangler` é supervisor e o runtime `workerd`
 * roda como filho dele. Matar só o pai deixa o filho vivo segurando `.output/public`, e o
 * build seguinte falha com `EBUSY: resource busy or locked`. A mensagem não diz o que
 * fazer, e o processo é invisível — dá a impressão de que o build quebrou sozinho.
 *
 * `taskkill /T` no Windows e o process group no resto derrubam a árvore inteira.
 */
function encerrar(processo) {
  if (!processo?.pid) return
  try {
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/pid', String(processo.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      process.kill(-processo.pid, 'SIGTERM')
    }
  } catch {
    // Já morreu, ou nunca chegou a subir. Não é erro.
  }
}

let servidor
if (SOBE_SERVIDOR) {
  servidor = spawn('npx', ['wrangler', 'dev'], {
    stdio: 'ignore',
    shell: process.platform === 'win32',
    detached: process.platform !== 'win32',
  })
  // Ctrl+C ou queda no meio do percurso não pode deixar processo órfão para trás.
  for (const sinal of ['SIGINT', 'SIGTERM', 'exit']) {
    process.once(sinal, () => encerrar(servidor))
  }
  if (!(await esperarServidor())) {
    console.error('wrangler dev não subiu. Rode `npm run build` antes.')
    encerrar(servidor)
    process.exit(1)
  }
}

const navegador = await chromium.launch()
const ctx = await navegador.newContext({ viewport: { width: 1280, height: 900 } })
const p = await ctx.newPage()

try {
  // ── 1. Cadastro ───────────────────────────────────────────────────────────
  await p.goto(`${BASE}/atendimento/inscricao`, { waitUntil: 'networkidle' })
  const email = `aceite.${Date.now()}@exemplo.invalido`

  await p.fill('#nome', 'Maria Fictícia de Teste')
  await p.fill('#nascimento', '12/03/1978')
  await p.fill('#telefone', '12991657059')
  await p.check('input[type=radio][value="Sim"]')
  await p.fill('#cep', '12239530')
  await p.waitForTimeout(1500)
  await p.fill('#endereco', 'Rua Fictícia')
  await p.fill('#numero', 's/n')
  await p.fill('#bairro', 'Centro')
  await p.fill('#municipio', 'São José dos Campos')
  await p.check('input[type=checkbox][value="Física"]')
  await p.check('input[type=checkbox][value="Bocha Paralímpica"]')
  await p.check('input[type=checkbox][value="Segundas"]')
  await p.fill('#email', email)
  await p.fill('#cpf', cpfAleatorio())
  await p.fill('#senha', 'senha-de-teste-longa')
  await p.check('#consentimento')
  await p.check('input[type=radio][value="Ciente"]')
  await p.click('button[type=submit]')

  await p.waitForURL(/\/area/, { timeout: 45000 }).catch(() => {})
  ok('cadastro leva para /area logado', p.url().includes('/area'), p.url())
  ok('projeto é opção do formulário, não texto livre', true)

  await p.waitForSelector('svg[role="img"]', { timeout: 20000 })
  const painel = await p.textContent('.duas-colunas')
  ok('painel mostra o CEP', painel?.includes('CEP 12239-530'))
  ok('painel mostra o telefone formatado', painel?.includes('(12) 99165-7059'))
  ok(
    'QR aponta para a verificação',
    /\/verificar\/APPD-/.test(await p.getAttribute('svg[role="img"]', 'aria-label')),
  )

  // ── 1b. A verificação pública, que é para onde o QR aponta ────────────────
  const numeroRegistro = (await p.getAttribute('svg[role="img"]', 'aria-label')).match(
    /APPD-\d{4}-[A-Z0-9]{6}/,
  )?.[0]

  await p.goto(`${BASE}/verificar/${numeroRegistro}`, { waitUntil: 'networkidle' })
  const publica = await p.textContent('body')
  ok('o QR não leva mais a 404', !p.url().includes('404') && publica.includes(numeroRegistro))
  ok('a verificação mostra o nome', publica.includes('Maria Fictícia de Teste'))
  ok('a verificação diz que o cadastro está ativo', publica.includes('Associado ativo'))

  /*
    O item que sozinho reprova a tela. `Física` é o campo 12 — dado sensível do Art. 11
    numa página pública. A varredura é no HTML inteiro, não no texto visível: atributo,
    comentário e JSON embutido contam.
  */
  const bruto = await p.content()
  ok(
    'tipo de deficiência NÃO aparece na verificação pública',
    !/Física|Intelectual|Sensorial|Neurodivergente/.test(bruto),
  )
  ok(
    'a verificação declara o que não mostra',
    publica.includes('não mostra endereço') && publica.includes('tipo de deficiência'),
  )
  ok('endereço e nascimento não vazam', !bruto.includes('Rua Fictícia') && !bruto.includes('1978'))

  // Número inexistente e número mal digitado respondem igual, caractere a caractere.
  const bloco = async (n) => {
    await p.goto(`${BASE}/verificar/${n}`, { waitUntil: 'networkidle' })
    return (await p.textContent('.resposta'))?.replace(/\s+/g, ' ').trim()
  }
  const inexistente = await bloco('APPD-2026-ZZZZZZ')
  const malFormatado = await bloco('nada-disso')
  ok('inexistente e mal formatado respondem igual', inexistente === malFormatado, inexistente)
  ok('nenhum dos dois dá dica de formato', !/formato|dígito|caracter/i.test(inexistente ?? ''))

  await p.goto(`${BASE}/area`, { waitUntil: 'networkidle' })

  // ── 2. O cabeçalho sabe que a pessoa entrou ───────────────────────────────
  const conta = async () => (await p.textContent('.cabecalho nav .conta'))?.trim()
  ok('cabeçalho mostra "Minha área" depois do cadastro', (await conta()) === 'Minha área')

  // ── 3. Guardas de sessão, nos dois caminhos ───────────────────────────────
  await p.goto(`${BASE}/atendimento/inscricao`, { waitUntil: 'networkidle' })
  ok('link direto ao cadastro com sessão vai para /area', p.url().endsWith('/area'), p.url())
  await p.goto(`${BASE}/entrar`, { waitUntil: 'networkidle' })
  ok('link direto ao login com sessão vai para /area', p.url().endsWith('/area'), p.url())

  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await p.click('a[href="/atendimento/inscricao"]')
  await p.waitForTimeout(800)
  ok('clique interno para o cadastro com sessão vai para /area', p.url().endsWith('/area'), p.url())

  // ── 4. Meus dados ─────────────────────────────────────────────────────────
  await p.goto(`${BASE}/area/dados`, { waitUntil: 'networkidle' })
  ok(
    'formulário carrega o telefone com máscara',
    (await p.inputValue('#telefone')) === '(12) 99165-7059',
  )
  ok('não existe campo de e-mail editável', !(await p.$('input[type=email]')))

  await p.fill('#bairro', 'Jardim Fictício')
  await p.fill('#telefone', '129916')
  await p.click('button[type=submit]')
  await p.waitForTimeout(600)
  ok('telefone curto é recusado', (await p.textContent('body')).includes('Falta corrigir'))
  ok('o que foi digitado não se perde', (await p.inputValue('#bairro')) === 'Jardim Fictício')

  await p.fill('#telefone', '12991657059')
  await p.click('button[type=submit]')
  await p.waitForTimeout(1500)
  ok('salva', (await p.textContent('body')).includes('Dados salvos'))

  // ── 5. Larguras ───────────────────────────────────────────────────────────
  for (const largura of LARGURAS) {
    await p.setViewportSize({ width: largura, height: 900 })
    for (const rota of ['/', '/contato', '/area']) {
      await p.goto(BASE + rota, { waitUntil: 'networkidle' })
      const r = await p.evaluate(() => {
        const nav = document.querySelector('.cabecalho nav')
        const visivel = nav && getComputedStyle(nav).display !== 'none'
        const topo = (e) => (e ? Math.round(e.getBoundingClientRect().top) : null)
        const ul = nav?.querySelector('ul')
        const conta = nav?.querySelector('.conta')
        return {
          rolagem: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          umaLinha: !visivel || !ul || !conta ? true : Math.abs(topo(ul) - topo(conta)) < 8,
        }
      })
      ok(`${largura}px ${rota}: sem rolagem horizontal`, !r.rolagem)
      ok(`${largura}px ${rota}: cabeçalho em uma linha`, r.umaLinha)
    }
  }
  await p.setViewportSize({ width: 1280, height: 900 })

  // ── 5b. Sair e voltar a entrar ────────────────────────────────────────────
  await p.goto(`${BASE}/area`, { waitUntil: 'networkidle' })
  await p.click('nav .sair')
  await p.waitForTimeout(1200)
  ok('sair leva para a home', new URL(p.url()).pathname === '/', p.url())
  ok('cabeçalho volta a "Entrar" depois de sair', (await conta()) === 'Entrar')

  await p.goto(`${BASE}/entrar`, { waitUntil: 'networkidle' })
  ok('sem sessão, /entrar abre normalmente', p.url().includes('/entrar'), p.url())
  await p.fill('#email', email)
  await p.fill('#senha', 'senha-de-teste-longa')
  await p.click('button[type=submit]')
  await p.waitForURL(/\/area/, { timeout: 45000 }).catch(() => {})
  ok('entrar leva para /area', p.url().includes('/area'), p.url())
  ok('cabeçalho mostra "Minha área" depois de entrar', (await conta()) === 'Minha área')

  // ── 6. Exclusão ───────────────────────────────────────────────────────────
  await p.goto(`${BASE}/area/excluir`, { waitUntil: 'networkidle' })
  await p.click('.acoes button')
  await p.waitForSelector('[role=dialog]')
  const modal = await p.evaluate(() => {
    const botoes = [...document.querySelectorAll('[role=dialog] button')]
    return {
      tops: botoes.map((b) => Math.round(b.getBoundingClientRect().top)),
      rotulos: botoes.map((b) => b.textContent.trim()),
      foco: document.activeElement?.textContent?.trim(),
      campoTexto: document.querySelectorAll('[role=dialog] input[type=text]').length,
    }
  })
  ok(
    'modal com os dois botões na mesma linha',
    new Set(modal.tops).size === 1,
    JSON.stringify(modal.tops),
  )
  ok('foco começa em Cancelar, nunca no destrutivo', modal.foco === 'Cancelar', modal.foco)
  ok('modal não pede palavra digitada', modal.campoTexto === 0)

  await p.keyboard.press('Escape')
  await p.waitForTimeout(300)
  ok('Esc fecha sem excluir', !(await p.$('[role=dialog]')))

  await p.click('.acoes button')
  await p.waitForSelector('[role=dialog]')
  await p.click('[role=dialog] .botao-destrutivo')
  await p.waitForURL(/conta=excluida/, { timeout: 20000 }).catch(() => {})
  ok('exclusão conclui e volta para a home', p.url().includes('conta=excluida'), p.url())
  ok('cabeçalho volta a oferecer "Entrar"', (await conta()) === 'Entrar')

  /*
    REQ-28a: o número sobrevive à exclusão — de propósito, para que um crachá antigo não
    passe a identificar outra pessoa —, mas nome, foto e cuidador vão embora com ele.
  */
  await p.goto(`${BASE}/verificar/${numeroRegistro}`, { waitUntil: 'networkidle' })
  const depois = await p.content()
  ok('depois de excluir, a verificação não mostra mais o nome', !depois.includes('Maria Fictícia'))
  ok('depois de excluir, a verificação não serve foto', !depois.includes('data:image/jpeg'))

  await p.goto(`${BASE}/area`, { waitUntil: 'networkidle' })
  ok('a área não abre depois de excluída', p.url().includes('/entrar'), p.url())

  // ── 7. axe ────────────────────────────────────────────────────────────────
  for (const rota of PUBLICAS) {
    await p.goto(BASE + rota, { waitUntil: 'networkidle' })
    const { violations } = await new AxeBuilder({ page: p })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const graves = violations.map((v) => `${v.id} (${v.nodes.length})`)
    ok(`axe A/AA em ${rota}`, graves.length === 0, graves.join(', '))
  }
} finally {
  await navegador.close()
  encerrar(servidor)
}

const falhas = resultados.filter((r) => !r.passou)
for (const r of resultados) {
  console.log(`${r.passou ? 'OK   ' : 'FALHA'} ${r.rotulo}${r.extra ? ` — ${r.extra}` : ''}`)
}
console.log(`\n${resultados.length - falhas.length}/${resultados.length} verificações passaram.`)

if (falhas.length) process.exit(1)
