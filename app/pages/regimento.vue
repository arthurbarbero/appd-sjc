<script setup lang="ts">
import { ASSOCIACAO, REGIMENTO } from '~~/shared/conteudo'

/*
  Regimento interno.

  No site atual isto está numa página órfã, sem entrada no menu — ou seja, existe e
  ninguém acha. É o documento que responde as perguntas mais concretas de quem vai se
  associar, então aqui ele tem lugar no rodapé e é linkado de onde a regra se aplica.
*/

useHead({
  title: 'Regimento interno — APPD São José dos Campos',
  meta: [
    {
      name: 'description',
      content:
        'As regras internas da APPD: atendimento, trabalho voluntário, reuniões, contribuição do associado e conservação do espaço.',
    },
  ],
})

const sede = ASSOCIACAO.telefones[0]!
</script>

<template>
  <div class="regimento">
    <header class="topo">
      <h1>Regimento interno</h1>
      <p class="lide">
        As regras que valem para quem é atendido, para quem é voluntário e para quem é associado.
        Todo mundo que participa de um projeto aceita este regimento no cadastro.
      </p>
    </header>

    <nav aria-labelledby="sumario" class="sumario">
      <h2 id="sumario">Nesta página</h2>
      <ol>
        <li v-for="(secao, i) in REGIMENTO" :key="secao.titulo">
          <a :href="`#secao-${i}`">{{ secao.titulo }}</a>
        </li>
      </ol>
    </nav>

    <section
      v-for="(secao, i) in REGIMENTO"
      :id="`secao-${i}`"
      :key="secao.titulo"
      :aria-labelledby="`titulo-${i}`"
    >
      <h2 :id="`titulo-${i}`">{{ secao.titulo }}</h2>
      <ul class="regras">
        <li v-for="item in secao.itens" :key="item">{{ item }}</li>
      </ul>
    </section>

    <AppdAviso tipo="atencao" titulo="O estatuto ainda não está publicado">
      <span>
        Este regimento cita vários artigos do estatuto da associação, que não está disponível
        online. Pedimos o documento e ele entra aqui quando chegar. Enquanto isso, dúvida sobre
        qualquer regra: <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
        >.
      </span>
    </AppdAviso>

    <section aria-labelledby="proximo" class="proximo">
      <h2 id="proximo">Quer participar?</h2>
      <p>O cadastro é o primeiro passo, e é onde você aceita este regimento.</p>
      <div class="botoes">
        <NuxtLink to="/atendimento/inscricao" class="botao botao-primario">
          Fazer meu cadastro
        </NuxtLink>
        <NuxtLink to="/contato" class="botao botao-secundario">Tirar uma dúvida</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.regimento {
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

.sumario {
  background: var(--superficie);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.sumario h2 {
  font-size: var(--texto-titulo-m);
}

.sumario ol {
  margin: 0;
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}

.sumario a {
  min-height: var(--alvo-min);
  display: inline-flex;
  align-items: center;
}

section {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  scroll-margin-top: var(--e4);
}

.regras {
  margin: 0;
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  max-width: var(--medida);
}

.proximo {
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
</style>
