<script setup lang="ts">
import { encode } from 'uqr'

/*
  QR Code em SVG.

  **Sim, precisa de biblioteca — e não por preguiça.** QR Code não é um desenho de
  quadradinhos: é um código corretor de erros. Para montar um, é preciso escolher modo e
  versão pelo tamanho do dado, calcular a paridade Reed-Solomon sobre GF(256), intercalar
  os blocos, aplicar as oito máscaras candidatas, pontuar cada uma por quatro regras de
  penalidade e ficar com a menor. São algumas centenas de linhas que teriam de ser testadas
  contra leitores reais. Escrever isso à mão seria manter um codec para economizar 96 KB.

  O que dava para economizar era o **peso**, e aí a primeira escolha estava errada: o
  pacote `qrcode` arrasta `pngjs`, `yargs` e `dijkstrajs` — três dependências para uma CLI
  que nunca vamos usar. `uqr` faz a mesma coisa sem dependência nenhuma, é do mesmo
  ecossistema (unjs) que o Nitro e roda em qualquer runtime.

  Usamos `encode`, que devolve só a matriz, e **montamos o SVG como elementos Vue**. A
  função `renderSVG` da própria biblioteca devolveria uma string, que só entraria na
  página por `v-html` — uma porta de XSS aberta para poupar dez linhas. Aqui não existe
  string de marcação em lugar nenhum.

  Gerar no servidor não estoura os 10 ms do plano gratuito (ADR-005): é aritmética sobre
  uma matriz de ~30 × 30, sem I/O. Em troca, o código aparece **sem depender de JavaScript
  no aparelho** — o que importa num site cujo público inclui quem navega com recurso
  limitado.

  **SVG e não PNG**: o crachá vai ser impresso, e QR impresso a partir de bitmap
  redimensionado é QR que a câmera não lê. Vetor imprime nítido em qualquer tamanho.
*/

const props = withDefaults(defineProps<{ valor: string; tamanho?: number }>(), { tamanho: 128 })

/*
  Correção `M` recupera cerca de 15% de sujeira: o crachá vai andar em bolso e mochila. O
  custo é um código um pouco mais denso, não uma leitura mais lenta.

  `border: 2` é a zona silenciosa em volta. Sem ela, leitor encostado na borda do cartão
  falha — o erro mais comum em QR impresso, e que não aparece em teste feito na tela.
*/
const qr = computed(() => encode(props.valor, { ecc: 'M', border: 2 }))

/**
 * Um `<path>` só para o código inteiro.
 *
 * Um `<rect>` por módulo geraria perto de mil elementos por crachá — lento para o
 * navegador e pesado para a impressora. Cada módulo vira um quadrado de lado 1 no mesmo
 * caminho, e o `viewBox` cuida da escala.
 */
const caminho = computed(() => {
  const partes: string[] = []
  qr.value.data.forEach((linha, y) => {
    linha.forEach((preto, x) => {
      if (preto) partes.push(`M${x} ${y}h1v1h-1z`)
    })
  })
  return partes.join('')
})
</script>

<template>
  <!--
    `role="img"` com rótulo: sem isto o leitor de tela anuncia o SVG como um punhado de
    retângulos. O rótulo diz para onde o código leva, não que ele é um QR Code.
  -->
  <svg
    class="qr"
    :viewBox="`0 0 ${qr.size} ${qr.size}`"
    :width="tamanho"
    :height="tamanho"
    role="img"
    :aria-label="`Código que abre ${valor}`"
    shape-rendering="crispEdges"
  >
    <rect :width="qr.size" :height="qr.size" fill="#ffffff" />
    <path :d="caminho" fill="#000000" />
  </svg>
</template>

<style scoped>
.qr {
  flex: none;
  display: block;
  /*
    Preto sobre branco fixo, fora dos tokens de tema de propósito: câmera lê contraste,
    não paleta, e QR que segue o modo escuro do site deixa de ser lido.
  */
  border: 1px solid var(--borda);
  border-radius: var(--raio-p);
}
</style>
