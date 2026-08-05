/*
  <appd-campo-data> — campo de data com máscara 00/00/0000 e calendário em painel.

  IMPORTADO DO CLAUDE DESIGN em 2026-08-05, como está. É o protótipo funcional que o
  app gerou a partir de `componentes/data.html`. NÃO é o componente final: na Fase 4
  ele vira um componente Vue com a lógica coberta por teste.

  Três pendências conhecidas, a resolver na implementação:

  1. O comentário original dizia "DOM claro (sem shadow)", mas o código chama
     `attachShadow`. É shadow DOM, e por isso ele recarrega a folha de estilo por
     `<link>` dentro da própria sombra — duplica requisição e pisca no primeiro
     desenho.
  2. **Teclado incompleto.** A especificação pedia setas para andar pelos dias,
     PageUp/PageDown para trocar de mês e Home/End para começo e fim da semana. Só
     Escape está implementado; cada dia é um botão focável, então Tab percorre até 31
     botões. Falha de acessibilidade real, não detalhe.
  3. Estilo embutido em atributo `style` por toda parte, inclusive valores crus em px —
     justamente o que a regra de aderência do próprio design system proíbe.

  A lista de anos vai até 1920. Quem nasceu antes digita a data, que é o caminho
  principal de qualquer forma.
*/
;(() => {
  if (window.customElements && customElements.get('appd-campo-data')) return
  // Resolve a folha do design system a partir da URL deste script, para o componente
  // funcionar em qualquer página do projeto.
  const FOLHA = new URL(
    '../styles.css',
    (document.currentScript && document.currentScript.src) || location.href,
  ).href
  const MESES = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ]
  const SEMANA_CURTA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const SEMANA = [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ]
  const dig = (s) => (s || '').replace(/\D/g, '')
  const mascara = (s) => {
    const d = dig(s).slice(0, 8)
    if (d.length <= 2) return d
    if (d.length <= 4) return d.slice(0, 2) + '/' + d.slice(2)
    return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4)
  }
  const dois = (n) => String(n).padStart(2, '0')
  const hoje = () => {
    const t = new Date()
    return new Date(t.getFullYear(), t.getMonth(), t.getDate())
  }
  const mesmoDia = (a, b) => a && b && a.getTime() === b.getTime()
  function parse(txt) {
    const d = dig(txt)
    if (d.length !== 8) return null
    const dia = +d.slice(0, 2),
      mes = +d.slice(2, 4),
      ano = +d.slice(4)
    if (mes < 1 || mes > 12 || dia < 1 || ano < 1900) return null
    const data = new Date(ano, mes - 1, dia)
    if (data.getDate() !== dia || data.getMonth() !== mes - 1) return null
    return data
  }
  const porExtenso = (data) =>
    SEMANA[data.getDay()] +
    ', ' +
    data.getDate() +
    ' de ' +
    MESES[data.getMonth()] +
    ' de ' +
    data.getFullYear()

  const ICONE =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="16" rx="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line><line x1="8" y1="3" x2="8" y2="7"></line><line x1="16" y1="3" x2="16" y2="7"></line></svg>'

  class CampoData extends HTMLElement {
    static get observedAttributes() {
      return ['valor', 'aberto', 'rotulo', 'ajuda', 'obrigatorio', 'campo-id']
    }

    connectedCallback() {
      if (this._montado) return
      this._montado = true
      this._raiz = this.shadowRoot || this.attachShadow({ mode: 'open' })
      this._texto = mascara(this.getAttribute('valor') || '')
      this._aberto = this._lerAberto()
      const sel = parse(this._texto) || hoje()
      this._vistaM = sel.getMonth()
      this._vistaA = sel.getFullYear()
      this._estrutura()
      this._sincronizar()
      this._foraDoc = (e) => {
        const dentro = e.composedPath
          ? e.composedPath().indexOf(this) !== -1
          : this.contains(e.target)
        if (this._aberto && !dentro) this._fechar()
      }
      document.addEventListener('mousedown', this._foraDoc)
      this.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this._aberto) {
          this._fechar()
          this._btn.focus()
        }
      })
    }
    disconnectedCallback() {
      document.removeEventListener('mousedown', this._foraDoc)
    }
    attributeChangedCallback(nome, ant, val) {
      if (!this._montado || ant === val) return
      if (nome === 'valor') {
        const m = mascara(val || '')
        if (m !== this._texto) {
          this._texto = m
          this._sincronizar()
        }
        return
      }
      if (nome === 'aberto') {
        this._aberto = this._lerAberto()
        this._sincronizar()
        return
      }
      this._estrutura()
      this._sincronizar()
    }
    _lerAberto() {
      const v = this.getAttribute('aberto')
      return v != null && v !== 'false' && v !== 'nao' && v !== '0'
    }

    get value() {
      return this._texto
    }
    set value(v) {
      this._texto = mascara(v || '')
      this._sincronizar()
    }

    _estrutura() {
      const id = this.getAttribute('campo-id') || 'data'
      const rotulo = this.getAttribute('rotulo') || 'Data'
      const ajuda = this.getAttribute('ajuda') || ''
      const obr = this.hasAttribute('obrigatorio') && this.getAttribute('obrigatorio') !== 'false'
      this.style.display = 'block'
      this._raiz.innerHTML =
        '<link rel="stylesheet" href="' +
        FOLHA +
        '">' +
        '<style>:host{display:block;font-family:inherit;font-size:inherit;line-height:inherit}*,*::before,*::after{box-sizing:border-box}</style>' +
        '<div class="campo" style="max-width:100%;gap:8px;position:relative">' +
        '<label for="' +
        id +
        '" style="font-size:19px">' +
        rotulo +
        (obr ? ' <span class="obrigatorio" aria-hidden="true">*</span>' : '') +
        '</label>' +
        (ajuda ? '<span class="ajuda" id="ajuda-' + id + '">' + ajuda + '</span>' : '') +
        '<div style="display:flex;align-items:flex-start;gap:8px">' +
        '<input id="' +
        id +
        '" name="' +
        id +
        '" type="text" inputmode="numeric" autocomplete="bday" placeholder="dd/mm/aaaa" maxlength="10"' +
        (ajuda ? ' aria-describedby="ajuda-' + id + '"' : '') +
        (obr ? ' required' : '') +
        ' style="width:15ch;flex:none">' +
        '<button type="button" class="botao botao-secundario" data-abrir aria-label="Escolher no calendário" aria-haspopup="dialog" aria-expanded="false" aria-controls="painel-' +
        id +
        '"' +
        ' style="width:52px;min-width:52px;height:52px;padding:0;flex:none">' +
        ICONE +
        '</button>' +
        '</div>' +
        '<div id="painel-' +
        id +
        '" data-painel hidden role="dialog" aria-label="Calendário" aria-modal="false"' +
        ' style="position:absolute;z-index:20;top:100%;left:0;margin-top:8px;width:min(340px,calc(100vw - 48px));background:var(--fundo);border:1px solid var(--borda-suave);border-radius:var(--raio);box-shadow:var(--sombra-2);padding:16px;flex-direction:column;gap:16px"></div>' +
        '</div>'
      this._input = this._raiz.querySelector('input')
      this._btn = this._raiz.querySelector('[data-abrir]')
      this._painel = this._raiz.querySelector('[data-painel]')
      this._input.addEventListener('input', (e) => this._digitou(e))
      this._input.addEventListener('blur', () => {
        const d = parse(this._texto)
        if (d) this._emitir()
      })
      this._btn.addEventListener('click', () => (this._aberto ? this._fechar() : this._abrir()))
      this._painel.addEventListener('click', (e) => {
        const dia = e.target.closest('[data-dia]')
        if (dia && !dia.disabled) {
          this._escolher(new Date(+dia.dataset.ano, +dia.dataset.mes, +dia.dataset.dia))
          return
        }
        const passo = e.target.closest('[data-passo]')
        if (passo) this._mover(+passo.dataset.passo)
      })
      this._painel.addEventListener('change', (e) => {
        const alvo = e.target
        if (alvo.dataset.campo === 'mes') this._vistaM = +alvo.value
        if (alvo.dataset.campo === 'ano') this._vistaA = +alvo.value
        this._calendario()
      })
    }

    _digitou(e) {
      const el = e.target,
        bruto = el.value
      const pos = el.selectionStart == null ? bruto.length : el.selectionStart
      const antes = dig(bruto.slice(0, pos)).length
      this._texto = mascara(bruto)
      el.value = this._texto
      let i = 0,
        c = 0
      while (i < this._texto.length && c < antes) {
        if (/\d/.test(this._texto[i])) c++
        i++
      }
      if (this._texto[i] === '/') i++
      try {
        el.setSelectionRange(i, i)
      } catch {
        // navegador sem suporte a seleção neste tipo de campo
      }
      const d = parse(this._texto)
      if (d) {
        this._vistaM = d.getMonth()
        this._vistaA = d.getFullYear()
        if (this._aberto) this._calendario()
      }
      this._emitir()
    }
    _emitir() {
      this.setAttribute('valor', this._texto)
      this.dispatchEvent(
        new CustomEvent('mudar-data', {
          bubbles: true,
          composed: true,
          detail: { valor: this._texto, data: parse(this._texto) },
        }),
      )
    }
    _abrir() {
      this._aberto = true
      this.setAttribute('aberto', 'sim')
      this._sincronizar()
      const sel = this._painel.querySelector(
        '[data-dia][data-selecionado], [data-dia]:not([disabled])',
      )
      if (sel) sel.focus()
    }
    _fechar() {
      this._aberto = false
      this.removeAttribute('aberto')
      this._sincronizar()
    }
    _mover(p) {
      let m = this._vistaM + p,
        a = this._vistaA
      if (m < 0) {
        m = 11
        a--
      } else if (m > 11) {
        m = 0
        a++
      }
      this._vistaM = m
      this._vistaA = a
      this._calendario()
      const foco = this._painel.querySelector('[data-passo="' + p + '"]')
      if (foco) foco.focus()
    }
    _escolher(data) {
      this._texto =
        dois(data.getDate()) + '/' + dois(data.getMonth() + 1) + '/' + data.getFullYear()
      this._vistaM = data.getMonth()
      this._vistaA = data.getFullYear()
      this._sincronizar()
      this._emitir()
      this._fechar()
      this._input.focus()
    }
    _sincronizar() {
      if (!this._input) return
      if (this._input.value !== this._texto) this._input.value = this._texto
      this._btn.setAttribute('aria-expanded', this._aberto ? 'true' : 'false')
      this._painel.hidden = !this._aberto
      this._painel.style.display = this._aberto ? 'flex' : 'none'
      if (this._aberto) this._calendario()
      else this._painel.innerHTML = ''
    }
    _calendario() {
      const limite = hoje()
      const sel = parse(this._texto)
      const anoAtual = limite.getFullYear()
      let opMes = ''
      for (let m = 0; m < 12; m++)
        opMes +=
          '<option value="' +
          m +
          '"' +
          (m === this._vistaM ? ' selected' : '') +
          '>' +
          MESES[m].charAt(0).toUpperCase() +
          MESES[m].slice(1) +
          '</option>'
      let opAno = ''
      for (let a = anoAtual; a >= 1920; a--)
        opAno +=
          '<option value="' +
          a +
          '"' +
          (a === this._vistaA ? ' selected' : '') +
          '>' +
          a +
          '</option>'
      const primeiro = new Date(this._vistaA, this._vistaM, 1)
      const dias = new Date(this._vistaA, this._vistaM + 1, 0).getDate()
      const baseBotao =
        'width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;font:inherit;font-size:17px;background:var(--fundo);color:var(--texto);border:1px solid transparent;border-radius:var(--raio-p);cursor:pointer'
      let celulas = ''
      for (let v = 0; v < primeiro.getDay(); v++)
        celulas += '<span style="width:44px;height:44px"></span>'
      for (let d = 1; d <= dias; d++) {
        const data = new Date(this._vistaA, this._vistaM, d)
        const futuro = data.getTime() > limite.getTime()
        const eSel = mesmoDia(data, sel)
        const eHoje = mesmoDia(data, limite)
        let estilo = baseBotao
        if (eSel)
          estilo +=
            ';background:var(--primaria);color:var(--sobre-primaria);font-weight:700;border-color:var(--primaria)'
        else if (eHoje) estilo += ';border:2px solid var(--texto);font-weight:700'
        if (futuro)
          estilo +=
            ';color:var(--texto-suave);opacity:.55;text-decoration:line-through;cursor:not-allowed'
        celulas +=
          '<button type="button" data-dia="' +
          d +
          '" data-mes="' +
          this._vistaM +
          '" data-ano="' +
          this._vistaA +
          '"' +
          (eSel ? ' data-selecionado aria-current="date"' : '') +
          (futuro ? ' disabled aria-disabled="true"' : '') +
          ' aria-label="' +
          d +
          ' de ' +
          MESES[this._vistaM] +
          ' de ' +
          this._vistaA +
          (futuro ? ' — data futura, indisponível' : '') +
          '" style="' +
          estilo +
          '">' +
          d +
          '</button>'
      }
      const setaEstilo =
        'width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;font:inherit;font-size:19px;font-weight:700;background:var(--fundo);color:var(--texto);border:1px solid var(--borda-suave);border-radius:var(--raio-p);cursor:pointer'
      const selEstilo =
        'min-height:44px;font:inherit;font-size:17px;padding:0 8px;border:2px solid var(--borda);border-radius:var(--raio-p);background:var(--fundo);color:var(--texto)'
      this._painel.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px">' +
        '<button type="button" data-passo="-1" aria-label="Mês anterior" style="' +
        setaEstilo +
        '">‹</button>' +
        '<select data-campo="mes" aria-label="Mês" style="' +
        selEstilo +
        ';flex:1">' +
        opMes +
        '</select>' +
        '<select data-campo="ano" aria-label="Ano" style="' +
        selEstilo +
        ';width:10ch">' +
        opAno +
        '</select>' +
        '<button type="button" data-passo="1" aria-label="Mês seguinte" style="' +
        setaEstilo +
        '">›</button>' +
        '</div>' +
        '<div role="presentation" style="display:grid;grid-template-columns:repeat(7,44px);gap:2px;justify-content:space-between">' +
        SEMANA_CURTA.map(
          (d) =>
            '<span aria-hidden="true" style="width:44px;text-align:center;font-size:15px;font-weight:700;color:var(--texto-suave)">' +
            d +
            '</span>',
        ).join('') +
        celulas +
        '</div>' +
        '<p style="margin:0;border-top:1px solid var(--borda-suave);padding-top:8px;font-size:15px;color:var(--texto-suave)">' +
        (sel
          ? 'Selecionado: <strong style="color:var(--texto)">' + porExtenso(sel) + '</strong>'
          : 'Nenhuma data escolhida ainda. Datas futuras não podem ser escolhidas.') +
        '</p>'
    }
  }
  customElements.define('appd-campo-data', CampoData)
})()
