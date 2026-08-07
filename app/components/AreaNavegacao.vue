<script setup lang="ts">
/*
  Navegação da área do associado.

  O item atual é marcado por sublinhado espesso **e** `aria-current="page"` — nunca só por
  cor. Quem não distingue as cores continua sabendo onde está, e o leitor de tela anuncia.
*/

defineProps<{ atual: 'painel' | 'dados' | 'inscricoes' | 'excluir' }>()
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
