<script setup lang="ts">
/*
  Selo "A confirmar": marca o que a associação ainda não confirmou.
  Sempre com texto por extenso — nunca só cor, nunca só ícone.
*/
withDefaults(defineProps<{ texto?: string }>(), { texto: 'A confirmar' })
</script>

<template>
  <span class="selo selo-confirmar">
    <span aria-hidden="true">◇</span>
    {{ texto }}
  </span>
</template>

<style scoped>
.selo-confirmar {
  background: var(--aviso-fundo);
  color: var(--aviso);
  border: var(--borda-largura) solid var(--aviso);
}
</style>
