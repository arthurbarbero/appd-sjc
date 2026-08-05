<script setup lang="ts">
import { PROJETOS } from '~~/shared/conteudo'

useHead({ title: 'Projetos — APPD São José dos Campos' })
</script>

<template>
  <div class="lista-projetos">
    <header class="topo">
      <h1>Projetos</h1>
      <p class="lide">
        Atividades contínuas da associação: esporte, geração de renda, manutenção de equipamento e
        inclusão digital.
      </p>
    </header>

    <AppdAviso tipo="atencao" titulo="Como entrar em um projeto, hoje">
      <span>
        Os projetos ainda não são opções do campo "Tipo de Atendimento" do formulário. Faça o
        cadastro, marque <strong>Outro</strong> e escreva o nome do projeto que você quer.
      </span>
    </AppdAviso>

    <ul class="blocos">
      <li v-for="p in PROJETOS" :key="p.slug">
        <article class="cartao bloco">
          <div class="cabeca">
            <h2>{{ p.nome }}</h2>
            <AppdSelo v-if="!p.horarios" />
          </div>
          <p>{{ p.resumo }}</p>
          <p v-if="p.horarios" class="detalhe">
            Treinos de segunda a sexta, das 13h às 16h30, em dois locais da cidade.
          </p>
          <p v-else class="detalhe">
            Dias, horários e como participar ainda estão sendo confirmados com a associação.
          </p>
          <p class="rodape-cartao">
            <NuxtLink :to="`/projetos/${p.slug}`">Ver {{ p.nome }}</NuxtLink>
          </p>
        </article>
      </li>
    </ul>

    <section aria-labelledby="acao" class="acao">
      <h2 id="acao">Quer participar de um projeto?</h2>
      <p>O caminho é o cadastro de atendimento, marcando a opção "Outro".</p>
      <p>
        <NuxtLink to="/atendimento/inscricao" class="botao botao-primario">
          Fazer meu cadastro
        </NuxtLink>
      </p>
    </section>
  </div>
</template>

<style scoped>
.lista-projetos {
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

.blocos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}

.bloco {
  gap: var(--e2);
}

.cabeca {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e3);
}

.cabeca h2 {
  font-size: var(--texto-titulo-m);
}

.detalhe {
  color: var(--texto-suave);
}

section {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}
</style>
