<script setup lang="ts">
import { ASSOCIACAO, COMTRAD } from '~~/shared/conteudo'

/*
  COMTRAD.

  Não é um projeto da APPD: é uma comissão independente de usuários do transporte
  adaptado, e o papel da associação é dar suporte jurídico. Essa distinção precisa
  ficar clara na tela, senão a página promete uma coisa que a associação não controla.

  No site atual isto está em página órfã, com o regulamento completo e nenhuma forma
  de aderir.
*/

useHead({
  title: `${COMTRAD.nome} — ${COMTRAD.nomeCompleto} — APPD São José dos Campos`,
  meta: [{ name: 'description', content: COMTRAD.resumo }],
})

const sede = ASSOCIACAO.telefones[0]!
</script>

<template>
  <div class="comtrad">
    <header class="topo">
      <p class="olho">{{ COMTRAD.nomeCompleto }}</p>
      <h1>{{ COMTRAD.nome }}</h1>
      <p class="lide">{{ COMTRAD.resumo }}</p>
    </header>

    <AppdAviso tipo="destaque" titulo="Uma comissão, não um projeto da APPD">
      <span>
        O COMTRAD é independente e formado pelos próprios usuários do transporte adaptado. A APPD
        entra com suporte jurídico quando é preciso, e o vínculo se limita a quem está associado à
        comissão.
      </span>
    </AppdAviso>

    <section aria-labelledby="por-que">
      <h2 id="por-que">Por que existe</h2>
      <p v-for="(paragrafo, i) in COMTRAD.porQueExiste" :key="i">{{ paragrafo }}</p>
    </section>

    <section aria-labelledby="finalidade">
      <h2 id="finalidade">O que a comissão faz</h2>
      <ul class="lista">
        <li v-for="item in COMTRAD.finalidades" :key="item">{{ item }}</li>
      </ul>
      <p class="limite">{{ COMTRAD.limite }}</p>
    </section>

    <section aria-labelledby="adesao" class="adesao">
      <h2 id="adesao">Como aderir</h2>
      <ul class="lista">
        <li v-for="item in COMTRAD.adesao" :key="item">{{ item }}</li>
      </ul>
      <div class="botoes">
        <NuxtLink to="/contato" class="botao botao-primario">Quero aderir ao COMTRAD</NuxtLink>
        <a :href="`tel:${sede.e164}`" class="botao botao-secundario">
          Falar por telefone: {{ sede.numero }}
        </a>
      </div>
      <p class="nota">
        <AppdSelo /> A associação ainda não informou quem coordena a comissão hoje nem com que
        frequência ela se reúne.
      </p>
    </section>

    <section aria-labelledby="base">
      <h2 id="base">Em que a comissão se apoia</h2>
      <ul class="lista">
        <li v-for="item in COMTRAD.baseLegal" :key="item">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.comtrad {
  display: flex;
  flex-direction: column;
  gap: var(--e5);
}

.topo {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.lide {
  font-size: var(--texto-corpo-g);
  color: var(--texto-suave);
}

section {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.lista {
  margin: 0;
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  max-width: var(--medida);
}

.limite {
  color: var(--texto-suave);
}

.adesao {
  background: var(--superficie);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
}

.botoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}

.nota {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e2);
  color: var(--texto-suave);
  font-size: var(--texto-rotulo);
}
</style>
