<script setup lang="ts">
/*
  Botão de copiar um valor curto (telefone, e-mail, chave PIX).

  Nasceu do REQ-16: telefone **não pode ser botão grande**. No celular um telefone como
  bloco clicável ocupa a tela e é fácil de acionar sem querer — e acionar sem querer ali é
  fazer uma ligação. Copiar se desfaz; discar não.

  Três cuidados que não são detalhe:

  - a confirmação vai para uma região `aria-live="polite"` **fora do botão**, porque
    trocar o texto do próprio botão faz o leitor de tela reanunciar o controle enquanto o
    foco está nele, e a pessoa ouve "Copiado" no lugar de saber onde está;
  - `navigator.clipboard` só existe em contexto seguro e pode faltar; quando falta, o
    valor é **selecionado** e a mensagem manda teclar Ctrl+C, em vez de o botão falhar em
    silêncio;
  - o rótulo diz **o que** copia ("Copiar telefone"), e não só "Copiar" — numa lista de
    três números, três botões idênticos não dizem nada a quem navega por leitor de tela.
*/

const props = defineProps<{ valor: string; oQue: string }>()

const aviso = ref('')
const alvo = useTemplateRef<HTMLElement>('alvo')
let limpar: ReturnType<typeof setTimeout> | undefined

function selecionarValor() {
  const no = alvo.value
  if (!no) return
  const faixa = document.createRange()
  faixa.selectNodeContents(no)
  const selecao = window.getSelection()
  selecao?.removeAllRanges()
  selecao?.addRange(faixa)
}

async function copiar() {
  clearTimeout(limpar)
  try {
    if (!navigator.clipboard) throw new Error('sem area de transferencia')
    await navigator.clipboard.writeText(props.valor)
    aviso.value = `${props.oQue} copiado.`
  } catch {
    selecionarValor()
    aviso.value = `Não conseguimos copiar. O ${props.oQue.toLowerCase()} está selecionado — tecle Ctrl+C.`
  }
  // A mensagem some depois de um tempo para não virar ruído permanente na tela.
  limpar = setTimeout(() => (aviso.value = ''), 6000)
}

onBeforeUnmount(() => clearTimeout(limpar))
</script>

<template>
  <span class="copiavel">
    <span ref="alvo" class="valor">{{ valor }}</span>
    <button type="button" class="botao botao-secundario acao" @click="copiar">
      Copiar <span class="so-leitor-de-tela">{{ oQue.toLowerCase() }}</span>
    </button>
    <span class="aviso-copia" role="status" aria-live="polite">{{ aviso }}</span>
  </span>
</template>

<style scoped>
.copiavel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e2);
}
.valor {
  font-weight: var(--peso-forte);
  font-size: var(--texto-corpo-g);
  /* Números lado a lado ficam alinhados, e o dígito não dança conforme a largura. */
  font-variant-numeric: tabular-nums;
  /* Selecionável de propósito: é o caminho que funciona quando copiar falha. */
  user-select: all;
}
.acao {
  /* Alvo menor que o de um botão de bloco, e ainda assim nunca abaixo dos 44px. */
  min-height: var(--alvo-min);
  padding-inline: var(--e3);
}
.aviso-copia {
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
  flex-basis: 100%;
}
.aviso-copia:empty {
  display: none;
}
</style>
