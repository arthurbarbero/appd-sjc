<script setup lang="ts">
import { ASSOCIACAO, PESSOAS, PROJETOS, SERVICOS } from '~~/shared/conteudo'

/*
  Sobre nós.

  As duas pessoas que fundaram e presidem a associação aparecem aqui com nome, cargo e
  retrato — decisão do dono do projeto, que tem autorização da associação.

  Esta página reproduz **tudo** o que está no "Sobre nós" do site atual (REQ-15):
  apresentação, fundação, objetivo, compromisso e o texto sobre o presidente, incluindo o
  histórico dele. A autorização de usar o conteúdo é da associação, e o dono do projeto
  já a confirmou duas vezes.

  A única coisa que fica fora é o **nome dos dois filhos** do presidente. A autorização é
  da associação sobre o conteúdo dela e não alcança terceiros que não decidiram nada — e
  o nome deles não acrescenta uma linha ao que o texto conta.
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
        famílias e voluntários. Foi fundada em {{ ASSOCIACAO.fundacaoPorExtenso }}, a partir da
        iniciativa da Sra. Maria Claudete da Silveira Rabelo de Moura junto de pessoas com os mesmos
        ideais — são {{ anos }} anos trabalhando com a sociedade para melhorar a qualidade de vida
        das pessoas com deficiência da região.
      </p>
      <p>
        O objetivo declarado desde o começo é <strong>localizar, orientar e inserir</strong> na
        sociedade as pessoas com deficiência, e amparar quem tem mais dificuldade.
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

    <section aria-labelledby="compromisso">
      <h2 id="compromisso">Nosso compromisso</h2>
      <p>
        O compromisso da APPD é levar o máximo de informação possível. O número de pessoas que
        adquirem algum tipo de deficiência — temporária ou definitiva, muitas vezes por acidente e
        principalmente entre jovens — cresce de forma contínua, e com ele a luta de muitas delas
        pela inclusão social.
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

    <section aria-labelledby="pessoas" class="pessoas">
      <div class="cabeca">
        <h2 id="pessoas">Quem começou e quem conduz</h2>
        <p>
          A associação nasceu de uma iniciativa pessoal e é presidida por quem vive a mesma
          realidade de quem ela atende.
        </p>
      </div>

      <ul class="lista-pessoas">
        <li v-for="pessoa in PESSOAS" :key="pessoa.nome">
          <article class="pessoa">
            <img :src="pessoa.foto" :alt="pessoa.alt" decoding="async" />
            <div class="dados">
              <p class="papel">{{ pessoa.papel }}</p>
              <h3>{{ pessoa.nome }}</h3>
              <p v-for="(paragrafo, i) in pessoa.bio" :key="i">{{ paragrafo }}</p>
            </div>
          </article>
        </li>
      </ul>

      <p class="nota">
        <AppdSelo /> A composição completa da diretoria ainda não foi informada pela associação.
      </p>
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
      </ul>

      <!--
        O título "O que já é público" saiu (REQ-13). Ele opunha esta tabela à lista de
        documentos pendentes acima, num contraste que eu inventei; a legenda da tabela já
        diz o que ela é, e é ela que o leitor de tela anuncia.
      -->
      <div class="rolagem">
        <table>
          <caption>
            Registros da associação
          </caption>
          <tbody>
            <tr>
              <th scope="row">Razão social</th>
              <td>{{ ASSOCIACAO.nomeCompleto }}</td>
            </tr>
            <tr>
              <th scope="row">CNPJ</th>
              <td>{{ ASSOCIACAO.cnpj }}</td>
            </tr>
            <tr>
              <th scope="row">Inscrição Municipal</th>
              <td>{{ ASSOCIACAO.inscricaoMunicipal }}</td>
            </tr>
            <tr>
              <th scope="row">Utilidade Pública</th>
              <td>nº {{ ASSOCIACAO.utilidadePublica }}</td>
            </tr>
            <tr>
              <th scope="row">Fundação</th>
              <td>{{ ASSOCIACAO.fundacaoPorExtenso }}</td>
            </tr>
            <tr>
              <th scope="row">Sede</th>
              <td>
                {{ ASSOCIACAO.endereco.logradouro }} — {{ ASSOCIACAO.endereco.bairro }},
                {{ ASSOCIACAO.endereco.cidade }}/{{ ASSOCIACAO.endereco.uf }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section aria-labelledby="voluntario" class="voluntario">
      <h2 id="voluntario">Quer ajudar?</h2>
      <p>
        A associação aceita voluntários, seguindo a Lei Federal nº 9.608/98, a Lei do Voluntário. Se
        você tem tempo e alguma habilidade para oferecer — profissional de saúde, artesão,
        professor, motorista, quem entende de manutenção —, fale com a gente e conte o que sabe
        fazer.
      </p>
      <p>Como funciona, pelo regimento interno:</p>
      <ul class="lista-voluntario">
        <li>
          Você passa por uma entrevista com um coordenador ou supervisor de projeto, que avalia onde
          a sua habilidade se encaixa.
        </li>
        <li>Pode ser designado para qualquer área disponível na associação.</li>
        <li>O trabalho é sempre acompanhado por um coordenador ou supervisor.</li>
      </ul>
      <p>As regras completas estão no <NuxtLink to="/regimento">regimento interno</NuxtLink>.</p>
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

.lista-voluntario {
  margin: 0;
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  max-width: var(--medida);
}
.pessoas {
  gap: var(--e5);
}

.cabeca {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.lista-pessoas {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e5);
}

.pessoa {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: var(--e5);
  align-items: start;
}

.pessoa img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: center;
  border-radius: var(--raio);
  border: var(--borda-largura) solid var(--borda-suave);
  background: var(--superficie);
}

.dados {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  max-width: var(--medida);
}

.papel {
  font-size: var(--texto-rotulo);
  font-weight: var(--peso-forte);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primaria);
}

.dados h3 {
  font-size: var(--texto-titulo-m);
}

@media (max-width: 720px) {
  .pessoa {
    grid-template-columns: 1fr;
    gap: var(--e3);
  }

  .pessoa img {
    max-width: 220px;
  }
}
</style>
