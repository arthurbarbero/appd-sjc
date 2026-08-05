<script setup lang="ts">
import { SERVICOS, acharOferta } from '~~/shared/conteudo'

const rota = useRoute()
const oferta = computed(() => acharOferta(String(rota.params.slug)))

if (!oferta.value || !SERVICOS.some((s) => s.slug === oferta.value?.slug)) {
  throw createError({ statusCode: 404, statusMessage: 'Serviço não encontrado', fatal: true })
}

useHead({ title: `${oferta.value!.nome} — APPD São José dos Campos` })
</script>

<template>
  <AppdOferta v-if="oferta" :oferta="oferta" tipo="atendimento" />
</template>
