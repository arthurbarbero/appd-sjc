<script setup lang="ts">
import { ASSOCIACAO, PROJETOS, SERVICOS } from '~~/shared/conteudo'

/*
  Sobre nós.

  O site atual publica, nesta página, o nome do presidente junto de histórico clínico
  detalhado — lesão medular, tetraplegia, tratamento, datas — e o nome de dois filhos.
  Isso é dado de saúde, sensível pelo Art. 11 da LGPD, e não foi republicado aqui.
  A associação decide por escrito o que quer publicar sobre a diretoria.
*/

useHead({
  title: 'Sobre nós — APPD São José dos Campos',
  meta: [
    {
      name: 'description',
      content: `Quem é a ${ASSOCIACAO.nomeCompleto}, o que faz e onde fica. Fundada em ${ASSOCIACAO.fundacao}.`,
    },
  ],
})

const anos = new Date().getFullYear() - ASSOCIACAO.fundacao
</script>

<template>
  <div class="sobre">
    <header class="topo">
      <h1>Sobre nós</h1>
      <p class="lide">
        A {{ ASSOCIACAO.nomeCompleto }} atende pessoas com deficiência e suas famílias em São José
        dos Campos desde {{ ASSOCIACAO.fundacao }}.
      </p>
    </header>

    <section aria-labelledby="quem">
      <h2 id="quem">Quem somos</h2>
      <p>
        A APPD é uma associação sem fins lucrativos, formada por pessoas com deficiência, suas
        famílias e voluntários. São {{ anos }} anos de atividade na cidade.
      </p>
      <p>
        O trabalho tem duas frentes. De um lado, o atendimento direto: fisioterapia, psicologia,
        serviço social, orientação e empréstimo de equipamento. De outro, os projetos contínuos, que
        são espaço de convivência, esporte, aprendizado e geração de renda.
      </p>
      <p>
        A associação se mantém com doação e com a contribuição solidária de quem é atendido — um
        valor sugerido, ajustável, que nunca condiciona o atendimento.
      </p>
    </section>

    <section aria-labelledby="numeros">
      <h2 id="numeros">O que a associação faz hoje</h2>
      <div class="grade">
        <div class="bloco">
          <p class="numero">{{ SERVICOS.length }}</p>
          <p class="rotulo">
            tipos de atendimento, do primeiro acolhimento ao empréstimo de equipamento
          </p>
          <p><NuxtLink to="/atendimento">Ver os atendimentos</NuxtLink></p>
        </div>
        <div class="bloco">
          <p class="numero">{{ PROJETOS.length }}</p>
          <p class="rotulo">projetos contínuos, de esporte a inclusão digital</p>
          <p><NuxtLink to="/projetos">Ver os projetos</NuxtLink></p>
        </div>
        <div class="bloco">
          <p class="numero">{{ anos }}</p>
          <p class="rotulo">anos de atividade em São José dos Campos</p>
        </div>
      </div>
      <p class="nota">
        <AppdSelo /> O número de pessoas atendidas ainda não foi informado pela associação.
      </p>
    </section>

    <section aria-labelledby="diretoria">
      <h2 id="diretoria">Diretoria</h2>
      <AppdAviso tipo="atencao" titulo="Em revisão com a associação">
        <span>
          O site anterior publicava o nome do presidente junto do histórico de saúde dele e do nome
          de familiares. Informação de saúde é dado sensível pela LGPD, mesmo quando a própria
          pessoa autoriza — por isso não foi republicada aqui. A composição da diretoria entra nesta
          página quando a associação definir, por escrito, o que quer publicar.
        </span>
      </AppdAviso>
    </section>

    <section aria-labelledby="transparencia">
      <h2 id="transparencia">Transparência</h2>
      <p>
        Estes documentos ainda não foram publicados pela associação. Quando chegarem, ficam
        disponíveis aqui para qualquer pessoa consultar.
      </p>
      <ul class="pendentes">
        <li><AppdSelo /> Estatuto</li>
        <li><AppdSelo /> Prestação de contas</li>
        <li><AppdSelo /> Relatório de atividades</li>
        <li><AppdSelo /> Missão, visão e valores como declaração formal</li>
      </ul>
      <p>
        O que já é público: CNPJ <strong>{{ ASSOCIACAO.cnpj }}</strong
        >, com sede na {{ ASSOCIACAO.endereco.logradouro }}, {{ ASSOCIACAO.endereco.bairro }}.
      </p>
    </section>

    <section aria-labelledby="voluntario" class="voluntario">
      <h2 id="voluntario">Quer ajudar?</h2>
      <p>
        A associação aceita voluntários. Se você tem tempo e alguma habilidade para oferecer —
        profissional de saúde, artesão, professor, motorista, quem entende de manutenção —, fale com
        a gente e conte o que sabe fazer.
      </p>
      <div class="botoes">
        <NuxtLink to="/contato" class="botao botao-primario">Quero ser voluntário</NuxtLink>
        <NuxtLink to="/doar" class="botao botao-secundario">Prefiro doar</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sobre {
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

.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--e4);
}

.bloco {
  background: var(--superficie);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.numero {
  font-size: var(--texto-titulo-g);
  font-weight: var(--peso-forte);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.rotulo {
  color: var(--texto-suave);
}

.nota,
.pendentes li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e2);
}

.pendentes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.voluntario {
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
