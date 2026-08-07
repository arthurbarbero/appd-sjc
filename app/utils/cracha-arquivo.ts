/**
 * Geração do PNG e do PDF do crachá — inteiramente no navegador.
 *
 * REQ-23 de `cracha-do-associado`: **zero requisições de rede durante a exportação**, sem
 * serviço externo e sem rota de renderização no servidor. Não é preferência técnica: a
 * imagem de uma pessoa com deficiência não sai do aparelho dela para virar arquivo.
 *
 * Por isso o desenho é feito à mão em `canvas`, e não por biblioteca que converte HTML em
 * imagem: as duas mais usadas baixam fonte e folha de estilo em tempo de execução, o que
 * quebraria o requisito de forma invisível — o arquivo sairia igual e a rede teria sido
 * usada.
 *
 * O PDF é montado byte a byte pelo mesmo motivo. São ~80 linhas de estrutura de arquivo
 * contra uma dependência de 300 KB que faz muito mais do que este projeto precisa.
 */

import { encode } from 'uqr'

/** 54 × 85,6 mm — o cartão de identificação padrão, em pé. */
export const LARGURA_MM = 54
export const ALTURA_MM = 85.6

/** 300 pontos por polegada: o mínimo que sai nítido numa impressora doméstica. */
const DPI = 300
const PX = (mm: number) => Math.round((mm / 25.4) * DPI)

export interface DadosCracha {
  nome: string
  numeroRegistro: string
  situacao: 'ativo' | 'inativo'
  foto: string | null
  deficiencias: string[]
  urlVerificacao: string
  associacao: { nome: string; endereco: string; cnpj: string; telefone: string }
}

export type Lado = 'frente' | 'verso'

const COR = {
  texto: '#14161a',
  suave: '#4a5058',
  borda: '#e2e5e9',
  primaria: '#8b0000',
  verde: '#3f5320',
  ambar: '#7a4a10',
}

const fonte = (tamanho: number, peso = 400) =>
  `${peso} ${tamanho}px "Atkinson Hyperlegible", system-ui, sans-serif`

/** Quebra o texto em linhas que cabem na largura, sem cortar palavra. */
function linhas(pincel: CanvasRenderingContext2D, texto: string, largura: number): string[] {
  const palavras = texto.split(/\s+/)
  const saida: string[] = []
  let atual = ''
  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra
    if (pincel.measureText(tentativa).width > largura && atual) {
      saida.push(atual)
      atual = palavra
    } else {
      atual = tentativa
    }
  }
  if (atual) saida.push(atual)
  return saida
}

/**
 * Desenha um lado do crachá num canvas novo, em resolução de impressão.
 *
 * A fonte precisa estar carregada antes: `document.fonts.ready` é aguardado pelo chamador.
 * Sem isso o canvas cai na fonte do sistema e o crachá sai com outra letra — falha que não
 * dá erro, só um arquivo errado.
 */
export async function desenharCracha(dados: DadosCracha, lado: Lado): Promise<HTMLCanvasElement> {
  const tela = document.createElement('canvas')
  tela.width = PX(LARGURA_MM)
  tela.height = PX(ALTURA_MM)
  const p = tela.getContext('2d')
  if (!p) throw new Error('Este navegador não consegue gerar a imagem do crachá.')

  const L = tela.width
  const A = tela.height
  const margem = PX(4)
  const util = L - margem * 2

  p.fillStyle = '#ffffff'
  p.fillRect(0, 0, L, A)
  p.strokeStyle = COR.borda
  p.lineWidth = 2
  p.strokeRect(1, 1, L - 2, A - 2)

  p.textBaseline = 'top'
  p.fillStyle = COR.texto

  if (lado === 'frente') {
    // Faixa da associação, no topo: é o que identifica o documento de longe.
    p.fillStyle = COR.primaria
    p.fillRect(0, 0, L, PX(11))
    p.fillStyle = '#ffffff'
    p.font = fonte(PX(2.6), 700)
    p.textAlign = 'center'
    for (const [i, linha] of linhas(p, dados.associacao.nome, util).entries()) {
      p.fillText(linha, L / 2, PX(3) + i * PX(3.4))
    }

    let y = PX(15)

    if (dados.foto) {
      const img = await carregar(dados.foto)
      const larguraFoto = PX(26)
      const alturaFoto = (larguraFoto * 5) / 4
      p.drawImage(img, (L - larguraFoto) / 2, y, larguraFoto, alturaFoto)
      p.strokeStyle = COR.borda
      p.strokeRect((L - larguraFoto) / 2, y, larguraFoto, alturaFoto)
      y += alturaFoto + PX(5)
    }

    p.fillStyle = COR.texto
    p.textAlign = 'center'
    p.font = fonte(PX(3.6), 700)
    for (const linha of linhas(p, dados.nome, util)) {
      p.fillText(linha, L / 2, y)
      y += PX(4.4)
    }

    y += PX(3)
    p.fillStyle = COR.suave
    p.font = fonte(PX(2.4), 700)
    p.fillText('REGISTRO', L / 2, y)
    y += PX(3.4)
    p.fillStyle = COR.texto
    p.font = fonte(PX(3.8), 700)
    p.fillText(dados.numeroRegistro, L / 2, y)
    y += PX(6)

    // Situação por ícone **e** texto (REQ-20): quem imprime em preto e branco continua
    // conseguindo ler, e quem não distingue cor também.
    const ativo = dados.situacao === 'ativo'
    p.fillStyle = ativo ? COR.verde : COR.ambar
    p.font = fonte(PX(2.8), 700)
    p.fillText(
      `${ativo ? '✓' : '!'}  ${ativo ? 'ASSOCIADO ATIVO' : 'CADASTRO NÃO ATIVO'}`,
      L / 2,
      y,
    )

    // Só aparece com o opt-in marcado (REQ-25); sem ele a lista chega vazia da API.
    if (dados.deficiencias.length) {
      y += PX(5)
      p.fillStyle = COR.suave
      p.font = fonte(PX(2.6), 400)
      for (const linha of linhas(p, dados.deficiencias.join(' · '), util)) {
        p.fillText(linha, L / 2, y)
        y += PX(3.2)
      }
    }
    return tela
  }

  // ── Verso ──────────────────────────────────────────────────────────────────
  let y = PX(6)
  p.textAlign = 'center'

  const qr = encode(dados.urlVerificacao, { ecc: 'M', border: 1 })
  const ladoQr = PX(30)
  const modulo = ladoQr / qr.size
  const x0 = (L - ladoQr) / 2
  p.fillStyle = COR.texto
  qr.data.forEach((linhaQr, ly) => {
    linhaQr.forEach((preto, lx) => {
      if (preto) p.fillRect(x0 + lx * modulo, y + ly * modulo, modulo + 0.5, modulo + 0.5)
    })
  })
  y += ladoQr + PX(4)

  // A URL por extenso é requisito, não redundância (REQ-21): quem confere pode não ter
  // câmera, ou não saber usar a do aparelho, e precisa poder digitar.
  p.fillStyle = COR.suave
  p.font = fonte(PX(2.2), 400)
  for (const linha of linhas(p, dados.urlVerificacao, util)) {
    p.fillText(linha, L / 2, y)
    y += PX(2.8)
  }

  y += PX(4)
  p.fillStyle = COR.texto
  p.font = fonte(PX(2.3), 400)
  for (const bloco of [
    dados.associacao.endereco,
    `CNPJ ${dados.associacao.cnpj}`,
    dados.associacao.telefone,
  ]) {
    for (const linha of linhas(p, bloco, util)) {
      p.fillText(linha, L / 2, y)
      y += PX(2.9)
    }
  }

  y = A - PX(12)
  p.fillStyle = COR.suave
  p.font = fonte(PX(2.2), 700)
  for (const linha of linhas(
    p,
    'Este crachá identifica a pessoa associada e não substitui documento oficial com foto.',
    util,
  )) {
    p.fillText(linha, L / 2, y)
    y += PX(2.8)
  }

  return tela
}

function carregar(src: string): Promise<HTMLImageElement> {
  return new Promise((resolva, rejeite) => {
    const img = new Image()
    img.onload = () => resolva(img)
    img.onerror = () => rejeite(new Error('foto ilegível'))
    // `data:` URI: nenhuma requisição de rede sai daqui, que é o REQ-23.
    img.src = src
  })
}

function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  a.click()
  URL.revokeObjectURL(url)
}

export async function baixarPng(dados: DadosCracha): Promise<void> {
  await document.fonts.ready
  const frente = await desenharCracha(dados, 'frente')
  const verso = await desenharCracha(dados, 'verso')

  // Os dois lados num arquivo só, lado a lado: quem baixa PNG quase sempre quer mandar
  // por mensagem, e dois arquivos separados viram um perdido.
  const junto = document.createElement('canvas')
  junto.width = frente.width * 2 + 40
  junto.height = frente.height
  const p = junto.getContext('2d')!
  p.fillStyle = '#ffffff'
  p.fillRect(0, 0, junto.width, junto.height)
  p.drawImage(frente, 0, 0)
  p.drawImage(verso, frente.width + 40, 0)

  const blob = await new Promise<Blob | null>((r) => junto.toBlob(r, 'image/png'))
  if (!blob) throw new Error('Não foi possível gerar o PNG.')
  baixar(blob, `cracha-${dados.numeroRegistro}.png`)
}

/* ─────────────────────────── PDF ─────────────────────────── */

const texto = (s: string) => new TextEncoder().encode(s)

function jpegDoCanvas(tela: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolva, rejeite) =>
    tela.toBlob(
      (b) =>
        b ? b.arrayBuffer().then((a) => resolva(new Uint8Array(a))) : rejeite(new Error('x')),
      'image/jpeg',
      0.92,
    ),
  )
}

/**
 * PDF de duas páginas, uma por lado, no tamanho exato do cartão.
 *
 * Escrito à mão porque o formato, para este uso, é pequeno: catálogo, páginas, uma imagem
 * JPEG por página em `DCTDecode` — o mesmo dado do canvas, sem recomprimir — e a tabela de
 * referências cruzadas. Tamanho em pontos, que é a unidade do PDF: 1 pt = 1/72".
 */
export async function baixarPdf(dados: DadosCracha): Promise<void> {
  await document.fonts.ready
  const telas = [await desenharCracha(dados, 'frente'), await desenharCracha(dados, 'verso')]
  const imagens = await Promise.all(telas.map(jpegDoCanvas))

  const largura = (LARGURA_MM / 25.4) * 72
  const altura = (ALTURA_MM / 25.4) * 72

  const partes: Uint8Array[] = []
  const deslocamentos: number[] = []
  let total = 0
  const escrever = (dado: Uint8Array | string) => {
    const bytes = typeof dado === 'string' ? texto(dado) : dado
    partes.push(bytes)
    total += bytes.length
  }
  const objeto = (numero: number, corpo: string, fluxo?: Uint8Array) => {
    deslocamentos[numero] = total
    escrever(`${numero} 0 obj\n${corpo}\n`)
    if (fluxo) {
      escrever('stream\n')
      escrever(fluxo)
      escrever('\nendstream\n')
    }
    escrever('endobj\n')
  }

  escrever('%PDF-1.4\n')

  const paginas = imagens.map((_, i) => 3 + i * 3)
  objeto(1, '<< /Type /Catalog /Pages 2 0 R >>')
  objeto(
    2,
    `<< /Type /Pages /Kids [${paginas.map((n) => `${n} 0 R`).join(' ')}] /Count ${paginas.length} >>`,
  )

  imagens.forEach((jpeg, i) => {
    const pagina = 3 + i * 3
    const imagem = pagina + 1
    const conteudo = pagina + 2
    const desenho = `q ${largura.toFixed(2)} 0 0 ${altura.toFixed(2)} 0 0 cm /Im0 Do Q`

    objeto(
      pagina,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${largura.toFixed(2)} ${altura.toFixed(2)}] ` +
        `/Resources << /XObject << /Im0 ${imagem} 0 R >> >> /Contents ${conteudo} 0 R >>`,
    )
    objeto(
      imagem,
      `<< /Type /XObject /Subtype /Image /Width ${telas[i]!.width} /Height ${telas[i]!.height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,
      jpeg,
    )
    objeto(conteudo, `<< /Length ${desenho.length} >>`, texto(desenho))
  })

  const inicioXref = total
  const ultimo = 2 + imagens.length * 3
  escrever(`xref\n0 ${ultimo + 1}\n0000000000 65535 f \n`)
  for (let i = 1; i <= ultimo; i++) {
    escrever(`${String(deslocamentos[i] ?? 0).padStart(10, '0')} 00000 n \n`)
  }
  escrever(`trailer\n<< /Size ${ultimo + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`)

  baixar(
    new Blob(partes as BlobPart[], { type: 'application/pdf' }),
    `cracha-${dados.numeroRegistro}.pdf`,
  )
}
