<script setup lang="ts">
import { ASSOCIACAO, POLITICA_PRIVACIDADE } from '~~/shared/conteudo'
import { versaoVigente } from '~~/shared/termos'

/*
  Política de Privacidade — T8 de `consentimento-e-privacidade`.

  Desenho aprovado no Claude Design (`templates/privacidade/Privacidade.dc.html`), com as
  correções de `docs/handoff-design-privacidade.md`: fonte servida do próprio domínio, e a
  rota irmã é `/seus-direitos`.

  As seções vêm de `shared/conteudo.ts` em lista, e o sumário sai da mesma lista. Não é
  organização: é o REQ-21, que exige a ordem do sumário igual à ordem dos `h2`. Sumário
  escrito à mão ao lado de seções escritas à mão diverge no primeiro dia em que alguém
  acrescenta uma seção — e aqui isso seria um documento legal apontando para o lugar errado.
*/

const termo = versaoVigente('deficiencia-art11')

/** "7 de agosto de 2026" — a data que a pessoa lê, a partir da que o catálogo declara. */
const vigenteDesde = new Date(termo.dataVigencia).toLocaleDateString('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const sede = ASSOCIACAO.telefones[0]!

useHead({
  title: 'Política de Privacidade — APPD São José dos Campos',
  meta: [
    {
      name: 'description',
      content:
        'O que a APPD faz com a sua informação, em linguagem simples: o que guarda, para quê, por quanto tempo e como você pede correção ou exclusão.',
    },
  ],
})
</script>

<template>
  <div class="privacidade">
    <header class="topo">
      <h1>Política de Privacidade</h1>
      <p class="lide">O que a APPD faz com a sua informação, em linguagem simples.</p>
      <p class="versao">
        Versão {{ termo.versao.replace('v', '') }} · Em vigor desde {{ vigenteDesde }}
      </p>
      <p>
        <NuxtLink to="/seus-direitos">Ver os seus direitos e pedir correção ou exclusão</NuxtLink>
      </p>
    </header>

    <div class="corpo">
      <nav aria-labelledby="sumario" class="sumario">
        <h2 id="sumario">Nesta página</h2>
        <ul>
          <li v-for="secao in POLITICA_PRIVACIDADE" :key="secao.id">
            <a :href="`#${secao.id}`">{{ secao.titulo }}</a>
          </li>
        </ul>
      </nav>

      <div class="secoes">
        <!--
          `tabindex="-1"` na seção, que é o alvo do link do sumário: sem isso, quem navega
          por teclado clica no sumário, a página rola e o foco fica onde estava — a página
          andou e a pessoa não (REQ-27). Com ele, o alvo recebe foco e o leitor de tela
          anuncia a seção pelo título, que é o que `aria-labelledby` aponta.
        -->
        <section
          v-for="secao in POLITICA_PRIVACIDADE"
          :id="secao.id"
          :key="secao.id"
          :class="['secao', { destaque: secao.destaque }]"
          :aria-labelledby="`titulo-${secao.id}`"
          tabindex="-1"
        >
          <h2 :id="`titulo-${secao.id}`">{{ secao.titulo }}</h2>

          <template v-for="(bloco, i) in secao.blocos" :key="i">
            <p v-if="bloco.tipo === 'p'">{{ bloco.texto }}</p>

            <template v-else-if="bloco.tipo === 'sub'">
              <h3>{{ bloco.titulo }}</h3>
              <ul class="itens">
                <li v-for="item in bloco.itens" :key="item">{{ item }}</li>
              </ul>
            </template>

            <ul v-else-if="bloco.tipo === 'lista'" class="itens">
              <li v-for="item in bloco.itens" :key="item">{{ item }}</li>
            </ul>

            <div v-else-if="bloco.tipo === 'cartoes'" class="cartoes">
              <div v-for="cartao in bloco.itens" :key="cartao.titulo" class="cartao">
                <h3>{{ cartao.titulo }}</h3>
                <p>{{ cartao.texto }}</p>
              </div>
            </div>

            <!--
              A pendência aparece no corpo do texto, com contraste de texto normal (REQ-23).
              Selo apagado em cinza claro seria esconder o que está faltando decidir.
            -->
            <p v-else-if="bloco.tipo === 'confirmar'" class="pendencia">
              {{ bloco.rotulo }}: <AppdSelo />
            </p>

            <!-- Sempre depois da explicação simples, nunca antes (REQ-21). -->
            <div v-else class="lei">
              <p class="rotulo-lei">No termo da lei</p>
              <p>{{ bloco.texto }}</p>
            </div>
          </template>
        </section>

        <section id="contato" class="secao" aria-labelledby="titulo-contato" tabindex="-1">
          <h2 id="titulo-contato">Com quem falar</h2>
          <p>
            Telefone <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
            >. E-mail <a :href="`mailto:${ASSOCIACAO.email}`">{{ ASSOCIACAO.email }}</a
            >.
          </p>
          <p>
            <NuxtLink to="/seus-direitos" class="botao botao-secundario">
              Ver os seus direitos
            </NuxtLink>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.privacidade {
  display: flex;
  flex-direction: column;
  gap: var(--e6);
}

.topo {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  max-width: 62ch;
}

.versao {
  color: var(--texto-suave);
  font-size: var(--texto-rotulo);
  font-weight: var(--peso-forte);
}

.corpo {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--e6);
}

.sumario {
  flex: 1 1 240px;
  border: 1px solid var(--borda-suave);
  border-radius: var(--raio);
  background: var(--superficie);
  padding: var(--e4);
}

/*
  Acima de 1024px o sumário acompanha a rolagem. No celular ele fica no topo, aberto e
  inteiro — nunca atrás de um botão (REQ-21). Documento legal com conteúdo escondido em
  acordeão é barreira, e é o erro que esta página existe para não cometer.
*/
@media (min-width: 64rem) {
  .sumario {
    position: sticky;
    top: var(--e4);
  }
}

.sumario h2 {
  font-size: var(--texto-titulo-m);
  margin-bottom: var(--e2);
}

.sumario ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sumario a {
  display: flex;
  align-items: center;
  min-height: 44px;
}

.secoes {
  flex: 4 1 480px;
  display: flex;
  flex-direction: column;
  gap: var(--e6);
  /* Entre 60 e 75 caracteres por linha (REQ-30). */
  max-width: 70ch;
}

.secao {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.secao h2 {
  font-size: var(--texto-titulo-g);
}

.secao h3 {
  font-size: var(--texto-titulo-m);
}

.destaque {
  border-left: 4px solid var(--primaria);
  padding-left: var(--e4);
}

.itens {
  margin: 0;
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}

.cartoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}

.cartoes .cartao {
  flex: 1 1 260px;
}

.pendencia {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e2);
}

.lei {
  background: var(--superficie);
  border: 1px solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e3) var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}

.rotulo-lei {
  font-size: var(--texto-rotulo);
  font-weight: var(--peso-forte);
  color: var(--texto-suave);
}
</style>
