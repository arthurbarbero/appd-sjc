<script setup lang="ts">
import { ASSOCIACAO, PROJETOS, SERVICOS } from '~~/shared/conteudo'

useHead({ title: 'Atendimento — APPD São José dos Campos' })
const sede = ASSOCIACAO.telefones[0]!
</script>

<template>
  <div class="hub">
    <header class="topo">
      <h1>Atendimento</h1>
      <p class="lide">
        A associação atende pessoas com deficiência e suas famílias na sede, em Campos dos Alemães.
      </p>
    </header>

    <!--
      Saíram daqui, todos por decisão do dono em 2026-08-07 (REQ-9 a REQ-12): o bloco
      "Como funciona", a seção "Três passos" e as duas frases sobre "um cadastro só".
      Nenhum deles existe no site original — eu os escrevi na Fase 2 — e o passo 2
      descrevia a fila de vagas que a APPD não opera (ADR-014).
    -->

    <section aria-labelledby="servicos">
      <h2 id="servicos">Os cinco atendimentos</h2>
      <ul class="grade">
        <li v-for="s in SERVICOS" :key="s.slug">
          <article class="cartao cartao-clicavel">
            <h3>
              <NuxtLink :to="`/atendimento/${s.slug}`" class="gatilho">{{ s.nome }}</NuxtLink>
            </h3>
            <p>{{ s.resumo }}</p>
            <p class="rodape-cartao" aria-hidden="true">Ver como funciona</p>
          </article>
        </li>
      </ul>
    </section>

    <section aria-labelledby="acao" class="acao">
      <h2 id="acao">Pedir atendimento</h2>
      <div class="botoes">
        <NuxtLink to="/atendimento/inscricao" class="botao botao-primario">
          Fazer meu cadastro
        </NuxtLink>
        <a :href="`tel:${sede.e164}`" class="botao botao-secundario">
          Prefere por telefone? {{ sede.numero }}
        </a>
      </div>
    </section>

    <!-- "Procurando um projeto?" deixa de ser link solto e vira cartão clicável (REQ-14). -->
    <section aria-labelledby="projetos">
      <article class="cartao cartao-clicavel projetos">
        <h2 id="projetos">
          <NuxtLink to="/projetos" class="gatilho">Procurando um projeto?</NuxtLink>
        </h2>
        <p>
          Esporte, artesanato, informática e manutenção de equipamento são projetos contínuos e
          entram por outro caminho.
        </p>
        <p class="rodape-cartao" aria-hidden="true">Ver os {{ PROJETOS.length }} projetos</p>
      </article>
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
}
.projetos h2 {
  font-size: var(--texto-titulo-m);
}
</style>
