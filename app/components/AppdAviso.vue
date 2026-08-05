<script setup lang="ts">
/*
  Bloco de aviso. Todo aviso tem ícone, texto e borda — nunca só cor, para quem não
  distingue vermelho de verde entender igual.
*/
const props = withDefaults(
  defineProps<{
    tipo?: 'atencao' | 'erro' | 'sucesso' | 'destaque'
    titulo?: string
  }>(),
  { tipo: 'atencao', titulo: '' },
)

const icones = {
  atencao: '!',
  erro: '✕',
  sucesso: '✓',
  destaque: '◆',
} as const

const papel = computed(() =>
  props.tipo === 'erro' ? 'alert' : props.tipo === 'sucesso' ? 'status' : undefined,
)
</script>

<template>
  <div :class="['aviso', `aviso-${tipo}`]" :role="papel">
    <span class="icone" aria-hidden="true">{{ icones[tipo] }}</span>
    <div class="conteudo">
      <strong v-if="titulo">{{ titulo }}</strong>
      <slot />
    </div>
  </div>
</template>
