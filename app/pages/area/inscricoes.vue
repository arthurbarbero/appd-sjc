<script setup lang="ts">
import { ATENDIMENTOS, DEFICIENCIAS, DIAS } from '~~/shared/inscricao'

/*
  Corrigir meu cadastro — `/area/inscricoes`.

  É o requisito que nasceu do ADR-014 e o que a pessoa ganha em relação à planilha de
  hoje: ela conserta o próprio dado, sem depender de ligar para a associação.

  **Esta é a única tela da área que exibe tipo de deficiência**, e exibe justamente porque
  é onde ele se corrige. O painel não recebe o campo (a rota dele nem devolve).

  As opções vêm de `shared/inscricao` — as mesmas do formulário oficial. O canvas
  havia gerado uma lista inventada, com "Orientação jurídica", que a APPD não oferece; a
  correção está em `docs/handoff-design-ciclo-conta.md`.
*/

useHead({ title: 'Corrigir meu cadastro — APPD São José dos Campos' })

const { data, pending } = await useFetch('/api/area/inscricao')

const f = reactive({
  deficiencias: [] as string[],
  deficienciaOutro: '',
  atendimentos: [] as string[],
  atendimentoOutro: '',
  dias: [] as string[],
})

watchEffect(() => {
  if (!data.value) return
  Object.assign(f, data.value)
})

const erros = reactive<Record<string, string>>({})
const salvando = ref(false)
const salvo = ref(false)
const resumo = ref<HTMLElement | null>(null)

async function salvar() {
  for (const k of Object.keys(erros)) Reflect.deleteProperty(erros, k)
  salvo.value = false
  salvando.value = true
  try {
    await $fetch('/api/area/inscricao', {
      method: 'PUT',
      body: {
        deficiencias: f.deficiencias,
        ...(f.deficienciaOutro.trim() ? { deficienciaOutro: f.deficienciaOutro.trim() } : {}),
        atendimentos: f.atendimentos,
        ...(f.atendimentoOutro.trim() ? { atendimentoOutro: f.atendimentoOutro.trim() } : {}),
        dias: f.dias,
      },
    })
    salvo.value = true
    /*
      Volta ao topo e põe o foco na confirmação — o mesmo que `/area/dados` já fazia.

      Faltava só aqui, e o dono notou a diferença entre as duas telas em 2026-08-21: "no
      meu cadastro, quando eu salvo, não tá subindo… nos meus dados acontece". Quem salva
      no fim de um formulário longo fica olhando para o mesmo lugar, sem sinal de que deu
      certo, e quem usa leitor de tela não ouve nada.
    */
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    resumo.value?.focus()
  } catch (erro: unknown) {
    const dados = (erro as { data?: { data?: { erros?: Record<string, string> } } })?.data?.data
    Object.assign(erros, dados?.erros ?? { formulario: 'Não conseguimos salvar agora.' })
    // Nada do que a pessoa marcou é perdido: `f` continua como está.
    await nextTick()
    resumo.value?.focus()
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="correcao area-moldura">
    <h1>Corrigir meu cadastro</h1>
    <AreaNavegacao atual="inscricoes" />

    <p v-if="pending" role="status">Carregando seu cadastro…</p>

    <template v-else>
      <p>Corrija sempre que precisar. A associação usa esta informação para entrar em contato.</p>

      <div
        v-if="Object.keys(erros).length"
        ref="resumo"
        class="aviso aviso-erro"
        role="alert"
        tabindex="-1"
      >
        <span class="icone" aria-hidden="true">✕</span>
        <div>
          <p><strong>Falta corrigir:</strong></p>
          <ul>
            <li v-for="(mensagem, campo) in erros" :key="campo">{{ mensagem }}</li>
          </ul>
          <p>Nada do que você já marcou foi perdido.</p>
        </div>
      </div>

      <AppdAviso v-if="salvo" tipo="sucesso" titulo="Cadastro corrigido">
        <span>As alterações foram salvas.</span>
      </AppdAviso>

      <form novalidate @submit.prevent="salvar">
        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.deficiencias }]">
          <legend>Tipo de deficiência</legend>
          <span class="ajuda">
            Marque quantas precisar. Esta informação não aparece no crachá nem no painel.
          </span>
          <label v-for="d in DEFICIENCIAS" :key="d" class="escolha">
            <input v-model="f.deficiencias" type="checkbox" :value="d" />
            {{ d }}
          </label>
          <div v-if="f.deficiencias.includes('Outro')" class="campo">
            <label for="def-outro">Qual?</label>
            <input id="def-outro" v-model="f.deficienciaOutro" type="text" />
          </div>
        </fieldset>

        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.atendimentos }]">
          <legend>Tipo de atendimento</legend>
          <span class="ajuda">Marque quantos precisar.</span>
          <label v-for="a in ATENDIMENTOS" :key="a" class="escolha">
            <input v-model="f.atendimentos" type="checkbox" :value="a" />
            {{ a }}
          </label>
          <div v-if="f.atendimentos.includes('Outro')" class="campo">
            <label for="ate-outro">Qual?</label>
            <input id="ate-outro" v-model="f.atendimentoOutro" type="text" />
          </div>
        </fieldset>

        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.dias }]">
          <legend>Melhores dias</legend>
          <span class="ajuda">
            Marque pelo menos um dia — é assim que a associação sabe quando ligar. As sessões são
            somente no período da manhã.
          </span>
          <label v-for="d in DIAS" :key="d" class="escolha">
            <input v-model="f.dias" type="checkbox" :value="d" />
            {{ d }}
          </label>
        </fieldset>

        <div class="acoes">
          <button type="submit" class="botao botao-primario" :disabled="salvando">
            {{ salvando ? 'Salvando…' : 'Salvar alterações' }}
          </button>
          <NuxtLink class="botao botao-secundario" to="/area">Cancelar</NuxtLink>
        </div>
      </form>
    </template>
  </div>
</template>

<style scoped>
/*
  A coluna vem de `.area-moldura`, em base.css.

  Esta regra declarava `display: flex; flex-direction: column`, e o estilo com escopo da
  página carrega depois do base — mesma especificidade, cascata a favor dela. O resultado
  era o menu na esquerda e o conteúdo embaixo dele, em vez de ao lado. O que sobra aqui é
  só o que é da tela; a forma da área é da moldura.
*/
form {
  display: flex;
  flex-direction: column;
  gap: var(--e5);
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}
</style>
