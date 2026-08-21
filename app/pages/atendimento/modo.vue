<script setup lang="ts">
/*
  `/atendimento/modo` — a tela em que o atendente liga o modo de mutirão.

  Ela existe porque sem ela o recurso não é usável: alguém teria de disparar a requisição à
  mão. É a tela mais simples do site de propósito — um campo de senha e um botão —, e o que
  ela faz é elevar o teto de cadastros **deste navegador** por seis horas.

  **Não é o painel administrativo, e não é uma porta de entrada.** Não mostra dado de
  ninguém, não abre tela nenhuma, não dá acesso a cadastro. Se algum dia aparecer aqui um
  segundo botão que faça outra coisa, é sinal de que o painel entrou pela porta dos fundos —
  e o painel tem change própria, com decisões de fundo que esta tela não tomou.

  `noindex` porque ela é para quem trabalha na associação, e não para quem procura
  atendimento. Não é segredo — a senha é que é.
*/

useHead({
  title: 'Modo atendimento — APPD São José dos Campos',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const senha = ref('')
const enviando = ref(false)
const erro = ref('')
const ligado = ref(false)

async function ligar() {
  erro.value = ''
  enviando.value = true
  try {
    await $fetch('/api/atendimento/modo', { method: 'POST', body: { senha: senha.value } })
    ligado.value = true
    senha.value = ''
  } catch (e) {
    const dados = (e as { data?: { data?: { motivo?: string } } })?.data?.data
    erro.value = dados?.motivo ?? 'Não conseguimos ligar o modo agora. Tente de novo.'
  } finally {
    enviando.value = false
  }
}

async function desligar() {
  erro.value = ''
  await $fetch('/api/atendimento/modo', { method: 'POST', body: { desligar: true } })
  ligado.value = false
}
</script>

<template>
  <div class="pagina-modo">
    <h1>Modo atendimento</h1>

    <div class="prosa">
      <p>
        Esta tela é para quem cadastra pessoas no balcão da associação. Com o modo ligado, este
        aparelho pode fazer muitos cadastros seguidos sem ser barrado — o que acontece quando vários
        cadastros saem da mesma rede em pouco tempo.
      </p>
      <p>
        O modo vale por <strong>6 horas</strong> e só neste navegador. Ele não muda mais nada: o
        formulário continua igual, e cada pessoa continua autorizando o que precisa autorizar.
      </p>
    </div>

    <AppdAviso v-if="ligado" tipo="sucesso" titulo="Modo atendimento ligado">
      <span>
        Vale por 6 horas neste aparelho. Pode ir para o
        <NuxtLink to="/atendimento/inscricao">formulário de cadastro</NuxtLink>.
      </span>
      <button type="button" class="botao botao-secundario" @click="desligar">Desligar agora</button>
    </AppdAviso>

    <form v-else class="formulario" @submit.prevent="ligar">
      <div :class="['campo', 'curto', { 'campo-erro': erro }]">
        <label for="senha-atendimento">Senha do atendimento</label>
        <span id="ajuda-senha" class="ajuda">A associação informa esta senha a quem atende.</span>
        <input
          id="senha-atendimento"
          v-model="senha"
          type="password"
          autocomplete="off"
          :aria-invalid="erro ? 'true' : undefined"
          :aria-describedby="erro ? 'erro-senha' : 'ajuda-senha'"
        />
        <span v-if="erro" id="erro-senha" class="erro" role="alert">{{ erro }}</span>
      </div>

      <button type="submit" class="botao botao-primario" :disabled="enviando">
        {{ enviando ? 'Ligando…' : 'Ligar o modo atendimento' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.pagina-modo {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  align-items: flex-start;
}
</style>
