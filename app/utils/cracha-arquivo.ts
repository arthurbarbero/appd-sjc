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
 * usada. O grafismo da associação vem embutido no pacote (`cracha-marca.ts`) pelo mesmo
 * motivo.
 *
 * O PDF é montado byte a byte também por isso. São ~80 linhas de estrutura de arquivo
 * contra uma dependência de 300 KB que faz muito mais do que este projeto precisa.
 *
 * ## O defeito que este arquivo carregou por dois dias
 *
 * Em 2026-08-21 o cartão da tela virou paisagem, ganhou CRAS, credencial, emissão e CID —
 * e **este arquivo não mudou**. Quem clicava em "Imagem" ou "PDF" recebia o cartão em pé
 * da versão anterior, sem nenhum dos campos novos. Ninguém percebeu porque o arquivo abre
 * sem erro: ele estava certo, só era de outro cartão.
 *
 * A lição não é "lembrar de atualizar os dois". É que **tela e arquivo são a mesma
 * decisão de produto em duas implementações**, e a única defesa contra elas divergirem é
 * um teste que compare as duas — `test/cracha-arquivo.spec.ts` faz isso.
 */

import { encode } from 'uqr'
import { COR_CARTAO, GRAFISMO_APPD } from './cracha-marca'

/** 85,6 × 54 mm — ISO/IEC 7810 ID-1, deitado. A medida do cartão da associação. */
export const LARGURA_MM = 85.6
export const ALTURA_MM = 54

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
  /* Campos do cartão de papel. Todos podem faltar — o rótulo sai mesmo assim. */
  cid?: string | null
  cras?: string | null
  credencialTransporte?: string | null
  contatoEmergencia?: string | null
  cuidadorNome?: string | null
  emissao?: string | null
  nascimento?: string | null
  cpf?: string | null
  enderecoPessoa?: string | null
  associacao: {
    nome: string
    nomeCompleto: string
    cidade: string
    uf: string
    endereco: string
    cnpj: string
    inscricaoMunicipal: string
    utilidadePublica: string
    telefone: string
    telefoneSecundario: string
  }
}

export type Lado = 'frente' | 'verso'

const fonte = (tamanhoMm: number, peso = 400) =>
  `${peso} ${PX(tamanhoMm)}px "Atkinson Hyperlegible Next", "Atkinson Hyperlegible", system-ui, sans-serif`

/** Quebra o texto em linhas que cabem na largura, sem cortar palavra. */
function linhas(pincel: CanvasRenderingContext2D, texto: string, largura: number): string[] {
  const palavras = texto.split(/\s+/).filter(Boolean)
  if (!palavras.length) return []
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

/** Retângulo com cantos arredondados, em milímetros. */
function caixaArredondada(
  p: CanvasRenderingContext2D,
  x: number,
  y: number,
  l: number,
  a: number,
  raio: number,
) {
  p.beginPath()
  p.roundRect(PX(x), PX(y), PX(l), PX(a), PX(raio))
}

/**
 * Uma caixa de rótulo e valor, como as do cartão de papel.
 *
 * O valor vazio **não** cancela o desenho, e essa é a decisão do dono: "o cartão precisa
 * ter todos os campos mesmo que não preenchido; quando não preenchido não coloca nada na
 * frente". Sem valor, sai a caixa com o rótulo e a linha em branco.
 */
function campo(
  p: CanvasRenderingContext2D,
  x: number,
  y: number,
  l: number,
  a: number,
  rotulo: string,
  valor: string,
  opcoes: { destaque?: boolean; borda?: string; centro?: boolean; cor?: string } = {},
) {
  caixaArredondada(p, x, y, l, a, 1.4)
  p.fillStyle = COR_CARTAO.caixa
  p.fill()
  p.strokeStyle = opcoes.borda ?? COR_CARTAO.verde
  p.lineWidth = PX(0.25)
  p.stroke()

  const centro = opcoes.centro ?? false
  p.textAlign = centro ? 'center' : 'left'
  const xTexto = centro ? x + l / 2 : x + 1.4
  const util = l - 2.8

  p.textBaseline = 'top'
  p.fillStyle = COR_CARTAO.rotulo
  p.font = fonte(1.7)
  p.fillText(rotulo, PX(xTexto), PX(y + 0.7))

  if (!valor) return
  p.fillStyle = opcoes.cor ?? COR_CARTAO.texto
  const corpo = opcoes.destaque ? 2.6 : 2.3
  p.font = fonte(corpo, 700)
  // Uma linha só: a caixa tem altura fixa, e texto que não cabe é reduzido, não empilhado.
  let tamanho = corpo
  while (p.measureText(valor).width > PX(util) && tamanho > 1.5) {
    tamanho -= 0.1
    p.font = fonte(tamanho, 700)
  }
  p.fillText(valor, PX(xTexto), PX(y + 2.9))
}

/** Texto centrado, em linhas, devolvendo o `y` em milímetros depois da última. */
function paragrafo(
  p: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  largura: number,
  entrelinha: number,
): number {
  let atual = y
  for (const linha of linhas(p, texto, PX(largura))) {
    p.fillText(linha, PX(x), PX(atual))
    atual += entrelinha
  }
  return atual
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

  p.fillStyle = '#ffffff'
  p.fillRect(0, 0, tela.width, tela.height)
  p.textBaseline = 'top'

  const grafismo = await carregar(GRAFISMO_APPD)
  const margem = 1.6
  const util = LARGURA_MM - margem * 2

  if (lado === 'frente') {
    // ── Faixa da associação ──────────────────────────────────────────────────
    const alturaFaixa = 11
    p.fillStyle = COR_CARTAO.azul
    p.fillRect(0, 0, tela.width, PX(alturaFaixa))
    p.fillStyle = '#ffffff'
    p.textAlign = 'center'
    p.font = fonte(5.4, 800)
    p.fillText('APPD', tela.width / 2, PX(0.8))
    p.font = fonte(1.9)
    p.fillText(
      dados.associacao.nomeCompleto.replace(/ de São José dos Campos$/, ''),
      tela.width / 2,
      PX(6.9),
    )
    p.fillText(`${dados.associacao.cidade}-${dados.associacao.uf}`, tela.width / 2, PX(9.1))

    // ── Grafismo no corpo ────────────────────────────────────────────────────
    desenharGrafismo(p, grafismo, 0, alturaFaixa, LARGURA_MM, ALTURA_MM - alturaFaixa, 1)

    // ── Coluna da foto ───────────────────────────────────────────────────────
    const topo = alturaFaixa + margem
    const alturaCorpo = ALTURA_MM - topo - margem
    const larguraFoto = 22
    if (dados.foto) {
      const img = await carregar(dados.foto)
      /*
        Recorte proporcional, e não esticamento — o `object-fit: cover` da tela, em canvas.

        `drawImage` com largura e altura de destino **deforma** a imagem para caber, e a
        foto do crachá é 4:5 num espaço de proporção bem mais estreita: o rosto saía
        alongado. A tela nunca teve esse defeito porque o CSS faz o recorte; o arquivo
        precisa fazê-lo à mão, e é mais um lugar em que tela e arquivo divergiam sem erro.
      */
      recortarCobrindo(p, img, margem, topo, larguraFoto, alturaCorpo)
    } else {
      p.fillStyle = COR_CARTAO.caixa
      p.fillRect(PX(margem), PX(topo), PX(larguraFoto), PX(alturaCorpo))
    }
    p.strokeStyle = COR_CARTAO.azul
    p.lineWidth = PX(0.5)
    p.strokeRect(PX(margem), PX(topo), PX(larguraFoto), PX(alturaCorpo))

    // ── Coluna dos dados ─────────────────────────────────────────────────────
    const x = margem + larguraFoto + margem
    const l = LARGURA_MM - x - margem
    const meia = (l - 1.2) / 2
    const alturaCampo = 6
    const vao = 0.9
    let y = topo

    campo(p, x, y, l, alturaCampo, 'Nome', dados.nome, { destaque: true })
    y += alturaCampo + vao

    campo(p, x, y, meia, alturaCampo, 'Nascimento', porExtenso(dados.nascimento))
    campo(p, x + meia + 1.2, y, meia, alturaCampo, 'Número APPD', dados.numeroRegistro)
    y += alturaCampo + vao

    campo(p, x, y, meia, alturaCampo, 'CRAS', dados.cras ?? '')
    campo(
      p,
      x + meia + 1.2,
      y,
      meia,
      alturaCampo,
      'Credencial Transporte',
      dados.credencialTransporte ?? '',
    )
    y += alturaCampo + vao

    campo(p, x, y, l, alturaCampo, 'CPF', comPontuacaoCpf(dados.cpf))
    y += alturaCampo + vao

    // ── QR e CID, lado a lado no rodapé ──────────────────────────────────────
    const alturaRodape = topo + alturaCorpo - y
    const ladoQr = Math.min(alturaRodape, 13)
    desenharQr(p, dados.urlVerificacao, x, y + (alturaRodape - ladoQr) / 2, ladoQr)

    const xCid = x + ladoQr + 1.2
    campo(p, xCid, y, l - ladoQr - 1.2, alturaRodape, 'CID', dados.cid ?? '', { destaque: true })
    if (dados.deficiencias.length) {
      p.textAlign = 'left'
      p.fillStyle = COR_CARTAO.rotulo
      p.font = fonte(1.7)
      paragrafo(p, dados.deficiencias.join(' · '), xCid + 1.4, y + 6.2, l - ladoQr - 4, 2)
    }
    return tela
  }

  // ── Verso ────────────────────────────────────────────────────────────────────
  desenharGrafismo(p, grafismo, 0, 0, LARGURA_MM, ALTURA_MM, 0.12)

  let y = margem
  const meia = (util - 1.2) / 2
  const ativo = dados.situacao === 'ativo'

  campo(p, margem, y, meia, 8, 'Emissão', porExtenso(dados.emissao), {
    destaque: true,
    borda: '#c8ccd2',
    centro: true,
  })
  /*
    No papel, o lugar da direita é da validade. Ela não existe aqui, por decisão do dono, e
    deixar o espaço vazio quebraria o equilíbrio do cartão sem ganhar nada. O que entra é a
    situação: informação verdadeira, que o site sabe.
  */
  campo(
    p,
    margem + meia + 1.2,
    y,
    meia,
    8,
    'Situação',
    `${ativo ? '✓' : '!'} ${ativo ? 'Associado ativo' : 'Cadastro não ativo'}`,
    {
      destaque: true,
      borda: '#c8ccd2',
      centro: true,
      cor: ativo ? COR_CARTAO.ok : COR_CARTAO.atencao,
    },
  )
  y += 8 + 1

  campo(p, margem, y, meia, 7, 'Pessoa de contato', dados.cuidadorNome ?? '', {
    borda: '#c8ccd2',
    centro: true,
  })
  campo(p, margem + meia + 1.2, y, meia, 7, 'Número de contato', legivel(dados.contatoEmergencia), {
    borda: '#c8ccd2',
    centro: true,
  })
  y += 7 + 1

  // ── Endereço da pessoa e dados da associação ────────────────────────────────
  p.textAlign = 'center'
  const centro = LARGURA_MM / 2

  caixaArredondada(p, margem, y, util, 4, 1)
  p.fillStyle = COR_CARTAO.caixa
  p.fill()
  p.fillStyle = COR_CARTAO.texto
  p.font = fonte(1.8)
  paragrafo(p, dados.enderecoPessoa ?? '', centro, y + 1, util - 3, 2.1)
  y += 4 + 1

  caixaArredondada(p, margem, y, util, 10.5, 1)
  p.fillStyle = COR_CARTAO.caixa
  p.fill()
  p.fillStyle = COR_CARTAO.texto
  p.font = fonte(2.4, 800)
  p.fillText('A P P D . O R G . B R', PX(centro), PX(y + 0.8))
  p.font = fonte(1.9)
  let yInterno = y + 4
  yInterno = paragrafo(p, dados.associacao.endereco, centro, yInterno, util - 3, 2.2)
  paragrafo(
    p,
    `${dados.associacao.telefone} / ${dados.associacao.telefoneSecundario}`,
    centro,
    yInterno,
    util - 3,
    2.2,
  )
  y += 10.5 + 1

  p.fillStyle = COR_CARTAO.rotulo
  p.font = fonte(1.6)
  paragrafo(
    p,
    `Este crachá identifica a pessoa associada e não substitui documento oficial com foto. Confira em ${dados.urlVerificacao}`,
    centro,
    y,
    util,
    1.9,
  )

  p.font = fonte(1.5)
  paragrafo(
    p,
    `CNPJ ${dados.associacao.cnpj} · Utilidade Pública ${dados.associacao.utilidadePublica} · Inscrição Municipal ${dados.associacao.inscricaoMunicipal}`,
    centro,
    ALTURA_MM - margem - 1.8,
    util,
    1.8,
  )

  return tela
}

/** Desenha a imagem cobrindo a área, recortando o excesso e centrando — `object-fit: cover`. */
function recortarCobrindo(
  p: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  l: number,
  a: number,
) {
  const alvo = PX(l) / PX(a)
  const origem = img.width / img.height
  const larguraFonte = origem > alvo ? img.height * alvo : img.width
  const alturaFonte = origem > alvo ? img.height : img.width / alvo
  p.drawImage(
    img,
    (img.width - larguraFonte) / 2,
    (img.height - alturaFonte) / 2,
    larguraFonte,
    alturaFonte,
    PX(x),
    PX(y),
    PX(l),
    PX(a),
  )
}

/**
 * O grafismo da associação, cobrindo a área e centrado — o mesmo `cover` do CSS.
 *
 * `alfa` menor que 1 é a marca d'água do verso: lá o texto é denso e pequeno, e o grafismo
 * precisa identificar sem competir. Feito com `globalAlpha` e não com composição, porque o
 * que muda é a opacidade **da imagem**, não do que já está desenhado embaixo.
 */
function desenharGrafismo(
  p: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  l: number,
  a: number,
  alfa: number,
) {
  const escala = Math.max(PX(l) / img.width, PX(a) / img.height)
  const larguraFinal = img.width * escala
  const alturaFinal = img.height * escala
  p.save()
  p.beginPath()
  p.rect(PX(x), PX(y), PX(l), PX(a))
  p.clip()
  p.globalAlpha = alfa
  p.drawImage(
    img,
    PX(x) + (PX(l) - larguraFinal) / 2,
    PX(y) + (PX(a) - alturaFinal) / 2,
    larguraFinal,
    alturaFinal,
  )
  p.restore()
}

/** O QR sobre fundo branco: contraste é requisito de leitura, não de estética. */
function desenharQr(
  p: CanvasRenderingContext2D,
  valor: string,
  x: number,
  y: number,
  lado: number,
) {
  p.fillStyle = '#ffffff'
  caixaArredondada(p, x, y, lado, lado, 0.8)
  p.fill()

  const qr = encode(valor, { ecc: 'M', border: 1 })
  const interno = lado - 1
  const modulo = PX(interno) / qr.size
  const x0 = PX(x + 0.5)
  const y0 = PX(y + 0.5)
  p.fillStyle = COR_CARTAO.texto
  qr.data.forEach((linhaQr, ly) => {
    linhaQr.forEach((preto, lx) => {
      if (preto) p.fillRect(x0 + lx * modulo, y0 + ly * modulo, modulo + 0.5, modulo + 0.5)
    })
  })
}

/** Data em dia/mês/ano — o cartão é lido por pessoas, não por banco de dados. */
function porExtenso(iso?: string | null): string {
  const partes = (iso ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : ''
}

function comPontuacaoCpf(cpf?: string | null): string {
  const d = (cpf ?? '').replace(/\D/g, '')
  if (d.length !== 11) return cpf ?? ''
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/** Telefone legível a partir do E.164 guardado. Mesma regra do componente da tela. */
function legivel(telefone?: string | null): string {
  const bruto = telefone ?? ''
  if (!bruto) return ''
  const d = bruto.replace(/\D/g, '')
  const nacional = bruto.startsWith('+55') ? d.slice(2) : bruto.startsWith('+') ? '' : d
  if (nacional.length === 11) {
    return `(${nacional.slice(0, 2)}) ${nacional.slice(2, 7)}-${nacional.slice(7)}`
  }
  if (nacional.length === 10) {
    return `(${nacional.slice(0, 2)}) ${nacional.slice(2, 6)}-${nacional.slice(6)}`
  }
  return bruto
}

function carregar(src: string): Promise<HTMLImageElement> {
  return new Promise((resolva, rejeite) => {
    const img = new Image()
    img.onload = () => resolva(img)
    img.onerror = () => rejeite(new Error('imagem ilegível'))
    // `data:` URI nos dois casos — foto e grafismo. Nenhuma requisição de rede sai daqui,
    // que é o REQ-23.
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

  /*
    Os dois lados num arquivo só, **encostados** — a mesma tira da folha de impressão.

    Quem baixa PNG quase sempre quer mandar por mensagem, e dois arquivos separados viram
    um perdido. O vão de 40 px que havia entre eles saiu junto com o da folha: a tira é
    cortada inteira e dobrada ao meio, e um vão no meio estraga a dobra.
  */
  const junto = document.createElement('canvas')
  junto.width = frente.width * 2
  junto.height = frente.height
  const p = junto.getContext('2d')!
  p.fillStyle = '#ffffff'
  p.fillRect(0, 0, junto.width, junto.height)
  p.drawImage(frente, 0, 0)
  p.drawImage(verso, frente.width, 0)

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
