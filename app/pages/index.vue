<script setup lang="ts">
import { ASSOCIACAO, DOACAO_EM_ESPECIE, PROJETOS, SERVICOS } from '~~/shared/conteudo'

useHead({
  title: `${ASSOCIACAO.nome} — atendimento e convivência para pessoas com deficiência`,
  meta: [
    {
      name: 'description',
      content:
        'Associação das Pessoas Portadoras de Deficiência de São José dos Campos. Fisioterapia, psicologia, serviço social, empréstimo de equipamentos e projetos de esporte e geração de renda.',
    },
  ],
})
</script>

<template>
  <div class="home">
    <section class="abertura">
      <h1>{{ ASSOCIACAO.nomeCompleto }}</h1>
      <p class="lide">
        Atendimento, reabilitação e convivência para pessoas com deficiência e suas famílias, desde
        {{ ASSOCIACAO.fundacao }}.
      </p>

      <div class="acoes">
        <div class="acao">
          <NuxtLink to="/atendimento/inscricao" class="botao botao-primario">
            Preciso de atendimento
          </NuxtLink>
          <p class="apoio">Cadastro gratuito. A associação entra em contato pelo telefone.</p>
        </div>
        <div class="acao">
          <NuxtLink to="/doar" class="botao botao-secundario">Quero doar</NuxtLink>
          <p class="apoio">Doação de equipamento, fralda ou alimento.</p>
        </div>
      </div>
    </section>

    <!--
      O bloco "Antes de pedir atendimento" saiu (REQ-8). Ele afirmava que "as vagas são
      chamadas conforme abrem" — uma fila que a APPD não opera (ADR-014). O horário da
      manhã, que era a parte verdadeira, vive na página de cada serviço, onde quem está
      decidindo procura.
    -->

    <section aria-labelledby="atendimento">
      <div class="cabeca-secao">
        <h2 id="atendimento">Atendimento</h2>
        <p>Os cinco serviços que você pode pedir pelo cadastro de atendimento.</p>
      </div>
      <!--
        Cartão inteiro clicável, com um único link envolvendo o título (REQ-4 a REQ-6).
        O "Ver como funciona" do rodapé deixou de ser link: era o segundo caminho para o
        mesmo lugar, e virava a segunda parada do Tab no mesmo cartão.
      -->
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

    <section aria-labelledby="projetos">
      <div class="cabeca-secao">
        <h2 id="projetos">Projetos</h2>
        <p>Atividades contínuas de esporte, geração de renda, manutenção e inclusão digital.</p>
      </div>
      <ul class="grade">
        <li v-for="p in PROJETOS" :key="p.slug">
          <article class="cartao cartao-clicavel">
            <h3>
              <NuxtLink :to="`/projetos/${p.slug}`" class="gatilho">{{ p.nome }}</NuxtLink>
            </h3>
            <p>{{ p.resumo }}</p>
            <p class="rodape-cartao" aria-hidden="true">Ver como funciona</p>
          </article>
        </li>
      </ul>
    </section>

    <section aria-labelledby="ajudar" class="ajudar">
      <div class="cabeca-secao">
        <h2 id="ajudar">Como ajudar de outras formas</h2>
      </div>
      <div class="duas">
        <div>
          <h3>Doação de itens</h3>
          <p>A associação precisa hoje de:</p>
          <ul class="lista">
            <li v-for="item in DOACAO_EM_ESPECIE" :key="item">{{ item }}</li>
          </ul>
          <p><NuxtLink to="/doar">Combinar a retirada</NuxtLink></p>
        </div>
        <div>
          <h3>Voluntariado</h3>
          <p>
            Se você quer doar horas do seu trabalho, fale com a associação e conte o que sabe fazer.
          </p>
          <p><NuxtLink to="/contato">Falar sobre voluntariado</NuxtLink></p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: var(--e6);
}

.abertura {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.lide {
  font-size: var(--texto-corpo-g);
  color: var(--texto-suave);
}

.acoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--e4);
  margin-top: var(--e2);
  max-width: var(--bloco-medio);
}

.acao {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.acao .botao {
  width: 100%;
}

.apoio {
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
}

.cabeca-secao {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  margin-bottom: var(--e4);
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

.duas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--e5);
}

.duas h3 {
  margin-bottom: var(--e2);
}

.duas p {
  margin-bottom: var(--e2);
}

.lista {
  margin: 0 0 var(--e2);
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}
</style>
