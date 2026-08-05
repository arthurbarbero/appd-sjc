<script setup lang="ts">
import { PROJETOS, acharOferta } from '~~/shared/conteudo'

const rota = useRoute()
const oferta = computed(() => acharOferta(String(rota.params.slug)))

if (!oferta.value || !PROJETOS.some((p) => p.slug === oferta.value?.slug)) {
  throw createError({ statusCode: 404, statusMessage: 'Projeto não encontrado', fatal: true })
}

useHead({ title: `${oferta.value!.nome} — APPD São José dos Campos` })
</script>

<template>
  <AppdOferta v-if="oferta" :oferta="oferta" tipo="projetos" />
</template>
