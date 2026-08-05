<script setup lang="ts">
import { ASSOCIACAO, PROJETOS, REGRAS_ATENDIMENTO, SERVICOS } from '~~/shared/conteudo'

useHead({ title: 'Atendimento — APPD São José dos Campos' })
const sede = ASSOCIACAO.telefones[0]!
</script>

<template>
  <div class="hub">
    <header class="topo">
      <h1>Atendimento</h1>
      <p class="lide">
        A associação atende pessoas com deficiência e suas famílias na sede, em Campos dos Alemães.
        Todos os atendimentos começam pelo mesmo cadastro.
      </p>
    </header>

    <AppdAviso tipo="destaque" titulo="Como funciona">
      <ul class="lista">
        <li v-for="regra in REGRAS_ATENDIMENTO" :key="regra">{{ regra }}</li>
      </ul>
    </AppdAviso>

    <section aria-labelledby="passos">
      <h2 id="passos">Três passos</h2>
      <ol class="passos">
        <li>
          <strong>Você preenche o cadastro.</strong> São 15 perguntas sobre você, onde mora e de que
          tipo de atendimento precisa.
        </li>
        <li>
          <strong>Você entra na fila.</strong> As vagas são chamadas conforme abrem, e não por ordem
          de chegada apenas.
        </li>
        <li>
          <strong>A associação liga para você.</strong> É por isso que o telefone precisa estar
          certo e atualizado.
        </li>
      </ol>
    </section>

    <section aria-labelledby="servicos">
      <h2 id="servicos">Os cinco atendimentos</h2>
      <ul class="grade">
        <li v-for="s in SERVICOS" :key="s.slug">
          <article class="cartao">
            <h3>{{ s.nome }}</h3>
            <p>{{ s.resumo }}</p>
            <p class="rodape-cartao">
              <NuxtLink :to="`/atendimento/${s.slug}`">Ver como funciona</NuxtLink>
            </p>
          </article>
        </li>
      </ul>
    </section>

    <section aria-labelledby="acao" class="acao">
      <h2 id="acao">Pedir atendimento</h2>
      <p>Um cadastro só, para qualquer um dos cinco atendimentos. Gratuito.</p>
      <div class="botoes">
        <NuxtLink to="/atendimento/inscricao" class="botao botao-primario">
          Fazer meu cadastro
        </NuxtLink>
        <a :href="`tel:${sede.e164}`" class="botao botao-secundario">
          Prefere por telefone? {{ sede.numero }}
        </a>
      </div>
    </section>

    <section aria-labelledby="projetos" class="projetos">
      <h2 id="projetos">Procurando um projeto?</h2>
      <p>
        Esporte, artesanato, informática e manutenção de equipamento são projetos contínuos e entram
        por outro caminho.
      </p>
      <p>
        <NuxtLink to="/projetos"> Ver os {{ PROJETOS.length }} projetos </NuxtLink>
      </p>
    </section>
  </div>
</template>

<style scoped>
.hub {
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
  gap: var(--e1);
}

.passos {
  margin: 0;
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  max-width: var(--medida);
}

.grade {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--e4);
}

.grade > li {
  display: flex;
}

.grade .cartao {
  width: 100%;
}

.botoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}

.projetos {
  background: var(--superficie);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
}
</style>
