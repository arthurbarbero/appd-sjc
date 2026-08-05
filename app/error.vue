<script setup lang="ts">
import type { NuxtError } from '#app'
import { ASSOCIACAO, PROJETOS, SERVICOS } from '~~/shared/conteudo'

const props = defineProps<{ error: NuxtError }>()

useHead({ title: props.error.statusCode === 404 ? 'Página não encontrada' : 'Erro' })
const sede = ASSOCIACAO.telefones[0]!
const busca = ref('')
</script>

<template>
  <NuxtLayout>
    <div class="erro-pagina">
      <header class="topo">
        <p class="codigo">Erro {{ error.statusCode }}</p>
        <h1>
          {{ error.statusCode === 404 ? 'Esta página não existe mais' : 'Algo deu errado aqui' }}
        </h1>
        <p class="lide">
          {{
            error.statusCode === 404
              ? 'O endereço que você abriu saiu do ar ou mudou de lugar. O site da associação continua aqui embaixo.'
              : 'O problema é nosso, não seu. Tente de novo em alguns instantes ou fale com a associação por telefone.'
          }}
        </p>
      </header>

      <form role="search" class="busca" @submit.prevent>
        <label for="busca">Procurar no site</label>
        <span id="ajuda-busca" class="ajuda">
          Digite o que você procura. Por exemplo: fisioterapia, doação, bocha.
        </span>
        <div class="linha">
          <input id="busca" v-model="busca" type="search" aria-describedby="ajuda-busca" />
          <button type="submit" class="botao botao-secundario">Procurar</button>
        </div>
      </form>

      <div class="acoes">
        <NuxtLink to="/atendimento/inscricao" class="botao botao-primario">
          Preciso de atendimento
        </NuxtLink>
        <NuxtLink to="/doar" class="botao botao-secundario">Quero doar</NuxtLink>
      </div>

      <section aria-labelledby="procurava">
        <h2 id="procurava">O que você procurava?</h2>
        <div class="duas">
          <div>
            <h3>Atendimento</h3>
            <ul class="lista">
              <li v-for="s in SERVICOS" :key="s.slug">
                <NuxtLink :to="`/atendimento/${s.slug}`">{{ s.nome }}</NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h3>Projetos</h3>
            <ul class="lista">
              <li v-for="p in PROJETOS" :key="p.slug">
                <NuxtLink :to="`/projetos/${p.slug}`">{{ p.nome }}</NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="falar" class="falar">
        <h2 id="falar">Falar com uma pessoa</h2>
        <p>
          Telefone da sede: <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a>
        </p>
      </section>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.erro-pagina {
  display: flex;
  flex-direction: column;
  gap: var(--e5);
}

.topo {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.codigo {
  font-size: var(--texto-rotulo);
  font-weight: var(--peso-forte);
  color: var(--texto-suave);
}

.lide {
  font-size: var(--texto-corpo-g);
  color: var(--texto-suave);
}

.busca {
  display: flex;
  flex-direction: column;
  gap: var(--e1);
  max-width: 36rem;
}

.busca label {
  font-weight: var(--peso-forte);
  font-size: var(--texto-corpo-g);
}

.busca .ajuda {
  color: var(--texto-suave);
  font-size: var(--texto-rotulo);
}

.linha {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e2);
}

.linha input {
  flex: 1;
  min-width: 200px;
  min-height: var(--altura-controle);
  padding: var(--e2) var(--e3);
  border: var(--borda-campo) solid var(--borda);
  border-radius: var(--raio);
  font: inherit;
  color: var(--texto);
  background: var(--fundo);
}

.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}

section {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.duas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--e4);
}

.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}

.lista a {
  min-height: var(--alvo-min);
  display: inline-flex;
  align-items: center;
}

.falar {
  background: var(--superficie);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
}
</style>
