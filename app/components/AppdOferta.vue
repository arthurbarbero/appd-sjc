<script setup lang="ts">
import type { Oferta } from '~~/shared/conteudo'
import { ASSOCIACAO } from '~~/shared/conteudo'

/*
  Template das nove páginas de serviço e de projeto. A diferença entre um serviço e um
  projeto é o caminho de entrada: serviço é opção do formulário oficial, projeto não é —
  e a tela precisa dizer isso, em vez de mandar a pessoa descobrir sozinha.
*/
const props = defineProps<{ oferta: Oferta; tipo: 'atendimento' | 'projetos' }>()

const sede = ASSOCIACAO.telefones[0]!
</script>

<template>
  <article class="oferta">
    <nav aria-label="Trilha">
      <NuxtLink to="/">Início</NuxtLink>
      <span aria-hidden="true">›</span>
      <NuxtLink :to="`/${props.tipo}`">
        {{ props.tipo === 'atendimento' ? 'Atendimento' : 'Projetos' }}
      </NuxtLink>
      <span aria-hidden="true">›</span>
      <span aria-current="page">{{ oferta.nome }}</span>
    </nav>

    <header class="topo">
      <h1>{{ oferta.nome }}</h1>
      <p class="lide">{{ oferta.resumo }}</p>
    </header>

    <AppdAviso tipo="destaque" titulo="Antes de você se cadastrar">
      <ul class="lista-aviso">
        <li>As vagas são chamadas conforme abrem — o cadastro entra em fila.</li>
        <li>As sessões acontecem somente no período da manhã.</li>
      </ul>
    </AppdAviso>

    <section v-if="oferta.horarios" aria-labelledby="horarios">
      <h2 id="horarios">Onde e quando acontece</h2>
      <div class="rolagem">
        <table>
          <caption>
            Locais e horários de treino
          </caption>
          <thead>
            <tr>
              <th scope="col">Local</th>
              <th scope="col">Dias</th>
              <th scope="col">Horário</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in oferta.horarios" :key="h.local">
              <th scope="row">
                {{ h.local }}
                <span class="endereco">{{ h.endereco }}</span>
              </th>
              <td>{{ h.dias }}</td>
              <td>{{ h.horario }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section aria-labelledby="para-quem">
      <h2 id="para-quem">Para quem é</h2>
      <ul class="lista">
        <li v-for="item in oferta.paraQuem" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section aria-labelledby="sobre">
      <h2 id="sobre">O que é, e por que faz diferença</h2>
      <p v-for="(p, i) in oferta.sobre" :key="i">{{ p }}</p>
    </section>

    <section aria-labelledby="esperar">
      <h2 id="esperar">O que esperar</h2>
      <ul class="lista">
        <li v-for="item in oferta.oQueEsperar" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section aria-labelledby="na-appd" class="bloco-appd">
      <h2 id="na-appd">Como funciona na APPD</h2>
      <ul class="lista">
        <li v-for="item in oferta.naAppd" :key="item">{{ item }}</li>
      </ul>

      <div class="pendencias">
        <p class="titulo-pendencia"><AppdSelo /> O que ainda não foi confirmado pela associação</p>
        <ul class="lista">
          <li v-for="item in oferta.aConfirmar" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section aria-labelledby="acao" class="acao">
      <h2 id="acao">Quer participar?</h2>

      <AppdAviso v-if="!oferta.noFormulario" tipo="atencao" titulo="Como pedir, hoje">
        <span>
          {{ oferta.nome }} ainda não é uma das opções do campo "Tipo de Atendimento" do formulário.
          Marque <strong>Outro</strong> e escreva o nome do projeto. A associação já está avaliando
          incluir os projetos na lista.
        </span>
      </AppdAviso>

      <p>O primeiro passo é o cadastro de atendimento. É gratuito e leva poucos minutos.</p>

      <div class="botoes">
        <NuxtLink to="/atendimento/inscricao" class="botao botao-primario">
          Fazer meu cadastro
        </NuxtLink>
        <a :href="`tel:${sede.e164}`" class="botao botao-secundario">
          Falar por telefone: {{ sede.numero }}
        </a>
      </div>
    </section>
  </article>
</template>

<style scoped>
.oferta {
  display: flex;
  flex-direction: column;
  gap: var(--e5);
}

nav[aria-label='Trilha'] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e2);
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
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

.lista,
.lista-aviso {
  margin: 0;
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  max-width: var(--medida);
}

.bloco-appd {
  background: var(--superficie);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
}

.pendencias {
  border-top: var(--borda-largura) solid var(--borda-suave);
  padding-top: var(--e3);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.titulo-pendencia {
  display: flex;
  align-items: center;
  gap: var(--e2);
  font-weight: var(--peso-forte);
}

.endereco {
  display: block;
  font-weight: var(--peso-normal);
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
}

.botoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}
</style>
