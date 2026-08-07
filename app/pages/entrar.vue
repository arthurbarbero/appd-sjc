<script setup lang="ts">
import { ASSOCIACAO } from '~~/shared/conteudo'
import { normalizaEmail } from '~~/shared/senha'
import { derivarChave } from '~/utils/derivar-senha'

/*
  Entrar — `/entrar`. Layout do canvas aprovado pelo dono em 2026-08-06.

  A tela mais curta do site e uma das que mais reprova: quem não consegue entrar não
  reclama, some. Por isso o telefone da secretaria aparece no corpo da página, não no
  rodapé — para este público, o caminho humano é acessibilidade, não plano B.

  Duas coisas que parecem detalhe e são requisito:

  - **A mensagem de erro é a mesma** para senha errada e para e-mail que não existe
    (REQ-25). Dizer "este e-mail não está cadastrado" entrega a terceiros quem é associado
    de uma associação de pessoas com deficiência.
  - **"Entrando…" é estado de primeira classe** (REQ-6c). O scrypt roda aqui, no aparelho,
    e leva até um segundo em celular antigo. Sem aviso, a pessoa acha que travou e clica
    de novo.
*/

useHead({ title: 'Entrar — APPD São José dos Campos' })
definePageMeta({ layout: 'default' })

const sede = ASSOCIACAO.telefones[0]!
const rota = useRoute()

const email = ref('')
const senha = ref('')
const senhaVisivel = ref(false)
const entrando = ref(false)
const erro = ref('')
const alerta = ref<HTMLElement | null>(null)

/** O middleware manda para cá com `?sessao=terminada` quando o cookie venceu. */
const sessaoTerminada = computed(() => rota.query.sessao === 'terminada')

/**
 * Sem JavaScript não há login, porque a derivação acontece no navegador. A tela precisa
 * dizer isso e oferecer o caminho por telefone (REQ-6b) — falhar em silêncio seria pior.
 * Este bloco começa visível no HTML e é escondido quando o Vue assume.
 */
const temJs = ref(false)
onMounted(() => {
  temJs.value = true
})

const sessao = useUserSession()

async function entrar() {
  erro.value = ''
  if (!email.value.trim() || !senha.value) {
    erro.value = 'Preencha o e-mail e a senha.'
    await nextTick()
    alerta.value?.focus()
    return
  }

  entrando.value = true
  try {
    const chaveDerivada = await derivarChave(senha.value, normalizaEmail(email.value))
    await $fetch('/api/conta/entrar', {
      method: 'POST',
      body: { email: normalizaEmail(email.value), chaveDerivada },
    })
    /*
      Sem esta linha o cabeçalho continua escrito "Entrar" depois de a pessoa entrar.

      O servidor grava o cookie na resposta acima, mas quem desenha o cabeçalho é o
      `loggedIn` do `useUserSession`, que vive no cliente e foi carregado **antes** do
      login. Navegar por dentro do Nuxt não recarrega a página, então esse estado ficava
      congelado em "deslogado" até um F5 — e o link levava para o login de quem já estava
      logado. `fetch()` relê a sessão e acerta o cabeçalho no mesmo instante.
    */
    await sessao.fetch()
    await navigateTo('/area')
  } catch {
    // Mesma frase para senha errada, e-mail inexistente e conta excluída (REQ-25).
    erro.value = 'E-mail ou senha não confere. Confira e tente de novo.'
    senha.value = ''
    await nextTick()
    alerta.value?.focus()
  } finally {
    entrando.value = false
  }
}
</script>

<template>
  <div class="entrar">
    <h1>Entrar na minha conta</h1>
    <p class="abertura">Esta é a entrada de quem já é associado.</p>

    <AppdAviso v-if="!temJs" tipo="atencao" titulo="Este site precisa de JavaScript">
      <span>
        Para entrar com segurança, o navegador precisa estar com JavaScript ligado. Se não for
        possível, ligue para a secretaria: <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a> — a
        gente resolve por telefone.
      </span>
    </AppdAviso>

    <AppdAviso v-if="sessaoTerminada && !erro" tipo="atencao" titulo="Sua sessão terminou">
      <span>Entre de novo para continuar de onde parou.</span>
    </AppdAviso>

    <div v-if="erro" ref="alerta" class="aviso aviso-erro" role="alert" tabindex="-1">
      <span class="icone" aria-hidden="true">✕</span>
      <p>{{ erro }}</p>
    </div>

    <form novalidate @submit.prevent="entrar">
      <div class="campo">
        <label for="email">E-mail <span class="obrigatorio" aria-hidden="true">*</span></label>
        <span id="ajuda-email" class="ajuda">O mesmo e-mail que você usou no cadastro.</span>
        <input
          id="email"
          v-model="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          aria-describedby="ajuda-email"
          :disabled="!temJs || entrando"
        />
      </div>

      <div class="campo">
        <label for="senha">Senha <span class="obrigatorio" aria-hidden="true">*</span></label>
        <div class="com-olho">
          <input
            id="senha"
            v-model="senha"
            :type="senhaVisivel ? 'text' : 'password'"
            autocomplete="current-password"
            :disabled="!temJs || entrando"
          />
          <button
            type="button"
            class="olho"
            :aria-pressed="senhaVisivel"
            :disabled="!temJs || entrando"
            @click="senhaVisivel = !senhaVisivel"
          >
            {{ senhaVisivel ? 'Ocultar senha' : 'Mostrar senha' }}
          </button>
        </div>
      </div>

      <button type="submit" class="botao botao-primario" :disabled="!temJs || entrando">
        {{ entrando ? 'Entrando…' : 'Entrar' }}
      </button>

      <p v-if="entrando" role="status" class="demora">
        Estamos conferindo sua senha com segurança. Em celular mais antigo isso pode levar alguns
        segundos.
      </p>
    </form>

    <div class="sem-conta">
      <p><strong>Ainda não tem conta?</strong></p>
      <NuxtLink to="/atendimento/inscricao">Criar minha conta</NuxtLink>
    </div>

    <p class="ajuda-humana">
      Não está conseguindo entrar? Ligue para a secretaria:
      <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
      >.
    </p>
  </div>
</template>

<style scoped>
.entrar {
  max-width: 440px;
  margin: 0 auto;
  padding: var(--e5) var(--e3) var(--e7);
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}
.abertura {
  margin: calc(var(--e2) * -1) 0 0;
}
form {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}
.campo {
  max-width: 100%;
}
.com-olho {
  display: flex;
  gap: var(--e2);
  align-items: center;
}
.com-olho input {
  flex: 1;
  min-width: 0;
}
.demora {
  margin: 0;
  color: var(--texto-suave);
}
.sem-conta {
  background: var(--superficie);
  border-left: 4px solid var(--borda);
  border-radius: var(--raio);
  padding: var(--e3);
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}
.sem-conta p {
  margin: 0;
}
.ajuda-humana {
  border: 1px solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e3);
  margin: 0;
}
</style>
