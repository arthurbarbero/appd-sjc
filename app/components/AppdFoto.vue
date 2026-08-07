<script setup lang="ts">
/*
  Envio, recorte e compressão da foto do crachá — tudo no aparelho da pessoa.

  Componente **único** do projeto para isto (REQ-8a de `cracha-do-associado`). Tem duas
  portas de entrada — o campo opcional do formulário de atendimento e `/area/cracha` — e
  um caminho só. Foi o que fechou o bloqueio B11 do gate: antes, o cadastro aceitava 5 MB
  e o crachá exigia 102.400 bytes, então uma foto aceita numa tela era recusada na outra.

  Desenho aprovado no Claude Design em 2026-08-07 (`templates/cracha/Cracha.dc.html`),
  estados "Recortando", "Preparando" e "Erro de foto".

  O recorte é operável **só pelo teclado** (REQ-10), e isso não é enfeite de acessibilidade
  num site de associação de pessoas com deficiência: gesto de pinça é exatamente o que
  parte do público não consegue fazer. Setas movem, `+` e `−` aproximam, e os mesmos
  controles existem como botão de 44px.
*/

import { ALTURA, LARGURA, MAXIMO_ORIGEM, QUALIDADE, TETO_BYTES, TIPOS_ORIGEM } from '~~/shared/foto'

const foto = defineModel<Blob | null>({ default: null })

const props = withDefaults(defineProps<{ rotulo?: string }>(), {
  rotulo: 'Foto para o crachá',
})

type Etapa = 'vazio' | 'recorte' | 'processando' | 'erro' | 'pronto'

const etapa = ref<Etapa>('vazio')
const erro = ref('')
const progresso = ref(0)
const urlOrigem = ref('')
const previa = ref('')

const imagem = shallowRef<HTMLImageElement | null>(null)
const entrada = ref<HTMLInputElement | null>(null)

/** Largura da moldura em pixels de tela. A altura sai daqui pela proporção 4:5. */
const LADO = 280
const alturaMoldura = (LADO * ALTURA) / LARGURA

const escala = ref(1)
const deslocX = ref(0)
const deslocY = ref(0)

/** Escala que faz a imagem cobrir a moldura inteira — o piso do zoom. */
const cobertura = computed(() => {
  const img = imagem.value
  if (!img) return 1
  return Math.max(LADO / img.naturalWidth, alturaMoldura / img.naturalHeight)
})

const estiloImagem = computed(() => {
  const img = imagem.value
  if (!img) return {}
  const fator = cobertura.value * escala.value
  return {
    width: `${img.naturalWidth * fator}px`,
    height: `${img.naturalHeight * fator}px`,
    transform: `translate(calc(-50% + ${deslocX.value}px), calc(-50% + ${deslocY.value}px))`,
  }
})

function limpar() {
  if (urlOrigem.value) URL.revokeObjectURL(urlOrigem.value)
  if (previa.value) URL.revokeObjectURL(previa.value)
  urlOrigem.value = ''
  previa.value = ''
  imagem.value = null
  escala.value = 1
  deslocX.value = 0
  deslocY.value = 0
}

onBeforeUnmount(limpar)

async function escolher(evento: Event) {
  const arquivo = (evento.target as HTMLInputElement).files?.[0]
  if (!arquivo) return

  // As duas recusas acontecem **antes** de processar (REQ-9): não faz sentido gastar
  // memória de um celular antigo com um arquivo que já se sabe que não serve.
  if (!TIPOS_ORIGEM.includes(arquivo.type as (typeof TIPOS_ORIGEM)[number])) {
    erro.value =
      'Este arquivo não é uma imagem que a gente consegue usar. Escolha uma foto em JPG, PNG ou WEBP.'
    etapa.value = 'erro'
    return
  }
  if (arquivo.size > MAXIMO_ORIGEM) {
    const mb = (arquivo.size / 1024 / 1024).toFixed(1).replace('.', ',')
    erro.value = `Esta foto tem ${mb} MB e o limite é 10 MB. Tente uma foto tirada pelo próprio celular, ou escolha outra imagem.`
    etapa.value = 'erro'
    return
  }

  limpar()
  urlOrigem.value = URL.createObjectURL(arquivo)

  const img = new Image()
  img.src = urlOrigem.value
  try {
    await img.decode()
  } catch {
    erro.value = 'Não conseguimos abrir esta imagem. Escolha outra foto.'
    etapa.value = 'erro'
    return
  }
  imagem.value = img
  etapa.value = 'recorte'
}

/* Arrastar com o ponteiro. O teclado tem caminho próprio, logo abaixo — um não substitui
   o outro, e a tela não depende de nenhum dos dois isoladamente. */
let arrastando = false
let ultimoX = 0
let ultimoY = 0

function comecarArrasto(e: PointerEvent) {
  arrastando = true
  ultimoX = e.clientX
  ultimoY = e.clientY
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function arrastar(e: PointerEvent) {
  if (!arrastando) return
  deslocX.value += e.clientX - ultimoX
  deslocY.value += e.clientY - ultimoY
  ultimoX = e.clientX
  ultimoY = e.clientY
}

function soltar() {
  arrastando = false
}

const PASSO = 8

function teclado(e: KeyboardEvent) {
  const acoes: Record<string, () => void> = {
    ArrowLeft: () => (deslocX.value -= PASSO),
    ArrowRight: () => (deslocX.value += PASSO),
    ArrowUp: () => (deslocY.value -= PASSO),
    ArrowDown: () => (deslocY.value += PASSO),
    '+': () => aproximar(0.1),
    '=': () => aproximar(0.1),
    '-': () => aproximar(-0.1),
    _: () => aproximar(-0.1),
  }
  const acao = acoes[e.key]
  if (!acao) return
  e.preventDefault()
  acao()
}

function aproximar(delta: number) {
  escala.value = Math.min(3, Math.max(1, Number((escala.value + delta).toFixed(2))))
}

async function usarEstaFoto() {
  const img = imagem.value
  if (!img) return

  etapa.value = 'processando'
  progresso.value = 20
  await nextTick()

  const tela = document.createElement('canvas')
  tela.width = LARGURA
  tela.height = ALTURA
  const pincel = tela.getContext('2d')

  // Navegador sem `canvas` não recebe a foto original como consolo: subir os 8 MB
  // originais quebraria o teto do banco e o orçamento de CPU do Worker (REQ-12).
  if (!pincel || typeof tela.toBlob !== 'function') {
    erro.value =
      'Este navegador não consegue preparar a foto. Tente por outro navegador, ou envie a foto depois pela sua área.'
    etapa.value = 'erro'
    return
  }

  // A tela de 400 × 500 é a moldura ampliada: o mesmo enquadramento que a pessoa viu.
  const proporcao = LARGURA / LADO
  const fator = cobertura.value * escala.value * proporcao
  const largura = img.naturalWidth * fator
  const altura = img.naturalHeight * fator

  pincel.fillStyle = '#ffffff'
  pincel.fillRect(0, 0, LARGURA, ALTURA)
  pincel.drawImage(
    img,
    LARGURA / 2 - largura / 2 + deslocX.value * proporcao,
    ALTURA / 2 - altura / 2 + deslocY.value * proporcao,
    largura,
    altura,
  )
  progresso.value = 70

  const blob = await new Promise<Blob | null>((resolva) =>
    tela.toBlob(resolva, 'image/jpeg', QUALIDADE),
  )
  progresso.value = 100

  if (!blob) {
    erro.value = 'Não conseguimos preparar esta foto. Escolha outra imagem.'
    etapa.value = 'erro'
    return
  }

  // Teto rígido: recusa, e diz o tamanho obtido. É proibido baixar a qualidade abaixo de
  // 0,75 ou recortar mais para fazer caber — degradar em silêncio é pior que recusar.
  if (blob.size > TETO_BYTES) {
    const kb = Math.round(blob.size / 1024)
    erro.value = `A foto preparada ficou com ${kb} KB e o limite é 100 KB. Tente uma foto com menos detalhe de fundo, ou tirada pelo próprio celular.`
    etapa.value = 'erro'
    return
  }

  foto.value = blob
  previa.value = URL.createObjectURL(blob)
  etapa.value = 'pronto'
}

function cancelar() {
  limpar()
  foto.value = null
  etapa.value = 'vazio'
  if (entrada.value) entrada.value.value = ''
}

function trocar() {
  cancelar()
  entrada.value?.click()
}

const tamanhoPronto = computed(() => (foto.value ? `${Math.round(foto.value.size / 1024)} KB` : ''))
</script>

<template>
  <div class="foto">
    <input
      ref="entrada"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="so-leitor-de-tela"
      :aria-label="props.rotulo"
      @change="escolher"
    />

    <div aria-live="polite" class="foto-area">
      <template v-if="etapa === 'vazio'">
        <button type="button" class="botao botao-secundario" @click="entrada?.click()">
          Escolher a minha foto
        </button>
        <ul class="foto-dicas">
          <li>Rosto visível e virado para a frente, sem óculos escuros e sem boné.</li>
          <li>Luz boa, de preferência de dia e de frente para a janela.</li>
          <li>Fundo simples, com a pessoa sozinha na imagem.</li>
        </ul>
      </template>

      <template v-else-if="etapa === 'recorte'">
        <div class="foto-recorte">
          <div
            class="foto-moldura"
            tabindex="0"
            role="application"
            aria-label="Enquadramento da foto. Setas movem a imagem, mais e menos aproximam."
            :style="{ width: `${LADO}px`, height: `${alturaMoldura}px` }"
            @pointerdown="comecarArrasto"
            @pointermove="arrastar"
            @pointerup="soltar"
            @pointercancel="soltar"
            @keydown="teclado"
          >
            <img :src="urlOrigem" alt="" :style="estiloImagem" />
          </div>

          <div class="foto-controles">
            <p class="foto-ajuda">
              Arraste a imagem para enquadrar o rosto. Pelo teclado: as setas movem, mais e menos
              aproximam.
            </p>
            <div class="foto-zoom">
              <button
                type="button"
                class="botao botao-secundario foto-passo"
                aria-label="Afastar"
                @click="aproximar(-0.1)"
              >
                −
              </button>
              <label class="so-leitor-de-tela" for="foto-aproximacao">Aproximação</label>
              <input
                id="foto-aproximacao"
                v-model.number="escala"
                type="range"
                min="1"
                max="3"
                step="0.05"
              />
              <button
                type="button"
                class="botao botao-secundario foto-passo"
                aria-label="Aproximar"
                @click="aproximar(0.1)"
              >
                +
              </button>
            </div>
            <p class="foto-ajuda">
              A imagem é reduzida para {{ LARGURA }} × {{ ALTURA }} pixels aqui no seu aparelho.
            </p>
            <div class="foto-acoes">
              <button type="button" class="botao botao-primario" @click="usarEstaFoto">
                Usar esta foto
              </button>
              <button type="button" class="botao botao-secundario" @click="cancelar">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="etapa === 'processando'">
        <p class="foto-titulo">Preparando a sua foto…</p>
        <div
          class="foto-barra"
          role="progressbar"
          :aria-valuenow="progresso"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Preparo da foto"
        >
          <div :style="{ width: `${progresso}%` }"></div>
        </div>
        <p class="foto-ajuda">Isso acontece aqui no seu navegador e leva alguns segundos.</p>
      </template>

      <template v-else-if="etapa === 'erro'">
        <div class="aviso aviso-erro" role="alert">
          <p>{{ erro }}</p>
          <div class="foto-acoes">
            <button type="button" class="botao botao-primario" @click="trocar">
              Escolher outra foto
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="foto-pronta">
          <img :src="previa" alt="Prévia da foto que vai para o crachá" />
          <div class="foto-controles">
            <p class="foto-titulo">Foto pronta</p>
            <p class="foto-ajuda">
              {{ LARGURA }} × {{ ALTURA }} pixels, {{ tamanhoPronto }}. Ela só é enviada quando você
              conclui o cadastro.
            </p>
            <div class="foto-acoes">
              <button type="button" class="botao botao-secundario" @click="trocar">
                Trocar a foto
              </button>
              <button type="button" class="botao botao-secundario" @click="cancelar">
                Remover
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.foto-area {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  align-items: flex-start;
}

.foto-dicas {
  margin: 0;
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  max-width: 48ch;
}

.foto-recorte,
.foto-pronta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e5);
  align-items: flex-start;
}

.foto-moldura {
  position: relative;
  overflow: hidden;
  border: var(--borda-campo) solid var(--borda);
  border-radius: var(--raio);
  background: var(--superficie-forte);
  cursor: move;
  touch-action: none;
}

.foto-moldura img {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: none;
  user-select: none;
  pointer-events: none;
}

.foto-pronta img {
  width: 160px;
  height: 200px;
  object-fit: cover;
  border: 1px solid var(--borda-suave);
  border-radius: var(--raio);
}

.foto-controles {
  flex: 1;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.foto-zoom {
  display: flex;
  align-items: center;
  gap: var(--e2);
}

.foto-zoom input[type='range'] {
  flex: 1;
  min-width: 120px;
  min-height: 44px;
  accent-color: var(--primaria);
}

.foto-passo {
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  font-size: 22px;
  font-weight: 700;
}

.foto-acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}

.foto-titulo {
  margin: 0;
  font-weight: 700;
}

.foto-ajuda {
  margin: 0;
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
  max-width: 44ch;
}

.foto-barra {
  width: 100%;
  max-width: 360px;
  height: 16px;
  background: var(--superficie-forte);
  border: 1px solid var(--borda-suave);
  border-radius: 999px;
  overflow: hidden;
}

.foto-barra div {
  height: 100%;
  background: var(--primaria);
}
</style>
