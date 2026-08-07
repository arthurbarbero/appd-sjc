<script setup lang="ts">
import { ASSOCIACAO } from '~~/shared/conteudo'

/*
  Excluir minha conta — `/area/excluir`. Uma página, um modal (ADR-013).

  Substituiu três desenhos diferentes que conviviam antes do gate: três telas numa change,
  duas caixas de seleção noutra, e uma terceira coisa na terceira. Decisão do dono.

  Os requisitos de acessibilidade do modal são **bloqueantes** (REQ-22a), e cada um existe
  por um motivo específico:

  - o foco nunca começa no botão de excluir — quem navega por teclado apertaria Enter por
    reflexo e apagaria a conta sem ler;
  - `Esc` fecha sem apagar;
  - o foco fica preso dentro do modal, senão o Tab passeia por uma página que a pessoa
    não consegue ver;
  - ao fechar, o foco volta para o botão que o abriu, para ela não se perder na página.
*/

useHead({ title: 'Excluir minha conta — APPD São José dos Campos' })

const sede = ASSOCIACAO.telefones[0]!
const modalAberto = ref(false)
const excluindo = ref(false)
const erro = ref('')

const botaoAbrir = ref<HTMLButtonElement | null>(null)
const modal = ref<HTMLElement | null>(null)
const botaoCancelar = ref<HTMLButtonElement | null>(null)

async function abrir() {
  modalAberto.value = true
  await nextTick()
  botaoCancelar.value?.focus()
}

function fechar() {
  modalAberto.value = false
  botaoAbrir.value?.focus()
}

/** Prende o foco: Tab no último volta para o primeiro, Shift+Tab no primeiro vai ao último. */
function prenderFoco(evento: KeyboardEvent) {
  if (evento.key === 'Escape') {
    fechar()
    return
  }
  if (evento.key !== 'Tab' || !modal.value) return

  const focaveis = modal.value.querySelectorAll<HTMLElement>('button, [href]')
  const primeiro = focaveis[0]
  const ultimo = focaveis[focaveis.length - 1]
  if (!primeiro || !ultimo) return

  if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault()
    ultimo.focus()
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault()
    primeiro.focus()
  }
}

async function excluir() {
  excluindo.value = true
  erro.value = ''
  try {
    await $fetch('/api/area/excluir', { method: 'POST' })
    await navigateTo('/?conta=excluida')
  } catch {
    erro.value = 'Não conseguimos apagar agora. Tente de novo ou ligue para a secretaria.'
    excluindo.value = false
  }
}
</script>

<template>
  <div class="excluir">
    <h1>Excluir minha conta</h1>
    <AreaNavegacao atual="excluir" />

    <p>Antes de apagar, leia o que acontece com as suas informações.</p>

    <section aria-labelledby="t-apagado">
      <h2 id="t-apagado">O que é apagado</h2>
      <ul>
        <li>Sua conta e sua senha</li>
        <li>Seu e-mail, telefone e endereço</li>
        <li>Seu cadastro de atendimento, incluindo a informação sobre deficiência</li>
        <li>Sua foto do crachá</li>
        <li>O seu acesso a esta área</li>
      </ul>
    </section>

    <section aria-labelledby="t-mantido">
      <h2 id="t-mantido">O que a associação precisa manter</h2>
      <ul>
        <li>O seu número de registro</li>
        <li>O registro de que você autorizou o tratamento dos seus dados</li>
      </ul>
      <p>
        Por obrigação legal, esses dois itens não são apagados. O número fica guardado para que
        nenhum crachá antigo passe a identificar outra pessoa.
      </p>
      <p class="confirmar">
        <AppdSelo />
        O prazo exato de guarda ainda será confirmado pela associação.
      </p>
    </section>

    <AppdAviso tipo="atencao" titulo="Isto não pode ser desfeito">
      <span>
        A exclusão é definitiva. Para voltar a ser atendido, você precisará fazer um cadastro novo.
      </span>
    </AppdAviso>

    <AppdAviso v-if="erro" tipo="erro" titulo="Não conseguimos apagar">
      <span>{{ erro }}</span>
    </AppdAviso>

    <div class="acoes">
      <NuxtLink class="botao botao-primario" to="/area">Voltar para a minha área</NuxtLink>
      <button ref="botaoAbrir" type="button" class="botao botao-destrutivo" @click="abrir">
        Excluir minha conta
      </button>
    </div>

    <p>
      Prefere resolver com uma pessoa? Ligue para
      <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
      >.
    </p>

    <div v-if="modalAberto" class="fundo" @keydown="prenderFoco">
      <div
        ref="modal"
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="t-certeza"
        aria-describedby="d-certeza"
      >
        <h2 id="t-certeza">Tem certeza?</h2>
        <p id="d-certeza">
          Sua conta e seus dados serão apagados agora. Isso não pode ser desfeito.
        </p>
        <div class="acoes">
          <button ref="botaoCancelar" type="button" class="botao botao-primario" @click="fechar">
            Cancelar
          </button>
          <button
            type="button"
            class="botao botao-destrutivo"
            :disabled="excluindo"
            @click="excluir"
          >
            {{ excluindo ? 'Apagando…' : 'Excluir minha conta' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.excluir {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
  max-width: 66ch;
}
h2 {
  margin-top: 0;
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}
.confirmar {
  display: flex;
  align-items: center;
  gap: var(--e2);
}
.fundo {
  position: fixed;
  inset: 0;
  background: rgb(20 22 26 / 60%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--e3);
  z-index: 10;
}
.modal {
  background: var(--fundo);
  border-radius: var(--raio);
  box-shadow: var(--sombra-2);
  padding: var(--e5);
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}
</style>
