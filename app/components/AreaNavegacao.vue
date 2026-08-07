<script setup lang="ts">
/*
  Navegação da área do associado.

  O item atual é marcado por sublinhado espesso **e** `aria-current="page"` — nunca só por
  cor. Quem não distingue as cores continua sabendo onde está, e o leitor de tela anuncia.
*/

defineProps<{ atual: 'painel' | 'dados' | 'inscricoes' | 'excluir' }>()

/*
  "Sair" fica aqui, e não no cabeçalho do site: sair é ação de quem está na área, e o
  cabeçalho é do site inteiro.

  A rota `/api/conta/sair` existia desde 2026-08-06 e **nenhuma tela a chamava** — dava
  para entrar e não dava para sair, a não ser apagando o cookie na mão. É o que acontece
  quando a API vem antes da tela e ninguém percorre o percurso inteiro.

  `sessao.fetch()` antes de navegar: o servidor apaga o cookie, mas quem desenha o
  cabeçalho é o estado do cliente, e sem reler ele continuaria dizendo "Minha área".
*/
const sessao = useUserSession()
const saindo = ref(false)

async function sair() {
  saindo.value = true
  try {
    await $fetch('/api/conta/sair', { method: 'POST' })
  } finally {
    await sessao.fetch()
    await navigateTo('/')
  }
}
</script>

<template>
  <nav aria-label="Área do associado">
    <ul>
      <li>
        <NuxtLink to="/area" :aria-current="atual === 'painel' ? 'page' : undefined">
          Início
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/area/dados" :aria-current="atual === 'dados' ? 'page' : undefined">
          Meus dados
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/area/inscricoes" :aria-current="atual === 'inscricoes' ? 'page' : undefined">
          Meu cadastro
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/area/excluir" :aria-current="atual === 'excluir' ? 'page' : undefined">
          Excluir conta
        </NuxtLink>
      </li>
      <li class="fim">
        <button type="button" class="sair" :disabled="saindo" @click="sair">
          {{ saindo ? 'Saindo…' : 'Sair' }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
nav {
  border-bottom: 1px solid var(--borda-suave);
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--e1);
}
a {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: var(--alvo-min);
  padding: 0 12px;
  color: var(--texto);
  font-weight: 700;
  text-decoration: none;
}
a:visited {
  color: var(--texto);
}
/* Empurra "Sair" para a outra ponta: sair não é irmão dos assuntos da área. */
.fim {
  margin-left: auto;
}
.sair {
  min-height: var(--alvo-min);
  padding: 0 12px;
  border: 0;
  background: none;
  color: var(--link);
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}
.sair:hover {
  background: var(--superficie-forte);
}
a[aria-current='page']::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 4px;
  background: var(--primaria);
}
</style>
