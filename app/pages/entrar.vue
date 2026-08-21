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
          <!--
            Ícone de olho, e não a palavra (2026-08-21).

            "Mostrar senha" escrito ao lado do campo ocupava quase tanto quanto o próprio
            campo no telefone, e empurrava a senha para uma caixa estreita — "esse mostrar
            senha gigantesco é feio", disse o dono.

            O **nome do controle continua sendo texto**: `aria-label` alterna entre
            "Mostrar senha" e "Ocultar senha", que é o que leitor de tela anuncia. Trocar
            a palavra visível pelo desenho não pode custar o nome — foi o mesmo cuidado
            que o hambúrguer do menu exigiu.

            Sem `aria-pressed` junto: com o rótulo já dizendo a ação seguinte, o estado
            pressionado faria o leitor anunciar duas informações que se contradizem.
          -->
          <button
            type="button"
            class="olho"
            :aria-label="senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'"
            :disabled="!temJs || entrando"
            @click="senhaVisivel = !senhaVisivel"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
              <path
                v-if="!senhaVisivel"
                d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
                fill="currentColor"
              />
              <template v-else>
                <path
                  d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
                  fill="currentColor"
                  opacity="0.45"
                />
                <path
                  d="M4 3.5 20.5 20"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  fill="none"
                />
              </template>
            </svg>
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
  max-width: var(--bloco-estreito);
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
/*
  O olho fica **dentro** do campo, e o campo vai até a borda.

  Antes ele era um botão ao lado, e isso custava duas coisas ao mesmo tempo: encurtava a
  caixa da senha e a deixava mais estreita que a do e-mail logo acima. "Esse botão podia
  tá dentro do campo, e o campo até o limite, pra ficar na mesma largura", disse o dono em
  2026-08-21 — e o desalinho entre os dois campos era o que mais saltava.

  `padding-right` reserva o espaço do ícone dentro do controle, para o texto da senha
  nunca correr por baixo dele.
*/
.com-olho {
  position: relative;
}

.com-olho input {
  width: 100%;
  padding-right: calc(var(--alvo-min) + var(--e1));
}

/*
  Alvo de 44px em quadrado, que é o mínimo do WCAG 2.5.8 e também o que a mão precisa.
  Sem borda: ele mora dentro da linha do campo, e um segundo retângulo ao lado do
  primeiro criaria a impressão de dois controles de mesmo peso.
*/
.olho {
  position: absolute;
  right: var(--e1);
  /* Centralizado na altura do controle, independente de quanto ele meça. */
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--alvo-min);
  height: var(--alvo-min);
  padding: 0;
  border: 0;
  border-radius: var(--raio-botao);
  background: none;
  color: var(--texto-suave);
  cursor: pointer;
}

.olho:hover:not(:disabled) {
  background: var(--superficie-forte);
  color: var(--texto);
}

.olho:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
