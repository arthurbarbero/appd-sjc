<script setup lang="ts">
import { ASSOCIACAO, DOACAO_EM_ESPECIE, PIX } from '~~/shared/conteudo'

useHead({ title: 'Central de Doações — APPD São José dos Campos' })
const sede = ASSOCIACAO.telefones[0]!

const copiado = ref(false)
async function copiarChave() {
  try {
    await navigator.clipboard.writeText(PIX.chave)
    copiado.value = true
    setTimeout(() => (copiado.value = false), 4000)
  } catch {
    // Navegador sem permissão de área de transferência: a chave continua visível
    // e selecionável na tela, então ninguém fica sem o dado.
    copiado.value = false
  }
}
</script>

<template>
  <div class="doar">
    <header class="topo">
      <h1>Central de Doações</h1>
      <p class="lide">
        A associação se mantém com doação. Aqui você vê exatamente para quem está doando e o que é
        preciso hoje.
      </p>
    </header>

    <section aria-labelledby="quem" class="identificacao">
      <h2 id="quem">Para quem você está doando</h2>
      <dl>
        <div>
          <dt>Razão social</dt>
          <dd>{{ ASSOCIACAO.nomeCompleto }}</dd>
        </div>
        <div>
          <dt>CNPJ</dt>
          <dd>{{ ASSOCIACAO.cnpj }}</dd>
        </div>
        <div>
          <dt>Endereço</dt>
          <dd>
            {{ ASSOCIACAO.endereco.logradouro }} — {{ ASSOCIACAO.endereco.bairro }},
            {{ ASSOCIACAO.endereco.cidade }}/{{ ASSOCIACAO.endereco.uf }}
          </dd>
        </div>
        <div>
          <dt>Em atividade desde</dt>
          <dd>{{ ASSOCIACAO.fundacao }}</dd>
        </div>
      </dl>
    </section>

    <section aria-labelledby="especie" class="destaque">
      <h2 id="especie">Doar itens — o caminho que funciona hoje</h2>
      <p>A associação informa precisar destes itens:</p>
      <ul class="lista">
        <li v-for="item in DOACAO_EM_ESPECIE" :key="item">{{ item }}</li>
      </ul>
      <p>
        A associação retira a doação. Combine pelo telefone e diga o que você tem e onde retirar.
      </p>
      <div class="botoes">
        <a :href="`tel:${sede.e164}`" class="botao botao-primario">
          Combinar a retirada: {{ sede.numero }}
        </a>
        <NuxtLink to="/contato" class="botao botao-secundario">Escrever uma mensagem</NuxtLink>
      </div>
    </section>

    <section aria-labelledby="pix" class="pix">
      <h2 id="pix">Doar por PIX</h2>
      <p>
        A chave é o <strong>CNPJ da associação</strong> — o mesmo número que está no rodapé deste
        site e no registro público. Confira antes de transferir: chave de PIX que você não consegue
        verificar é o golpe mais comum que existe.
      </p>

      <div class="pix-caixa">
        <img
          :src="PIX.qr"
          alt="QR Code do PIX da APPD São José dos Campos. A chave também está escrita ao lado."
          width="240"
          height="240"
          class="qr"
        />

        <div class="pix-dados">
          <dl>
            <div>
              <dt>Favorecido</dt>
              <dd>{{ PIX.favorecido }}</dd>
            </div>
            <div>
              <dt>Tipo de chave</dt>
              <dd>{{ PIX.tipo }}</dd>
            </div>
            <div>
              <dt>Chave</dt>
              <dd class="chave">{{ PIX.chaveFormatada }}</dd>
            </div>
          </dl>

          <button type="button" class="botao botao-primario" @click="copiarChave">
            Copiar a chave
          </button>
          <p v-if="copiado" class="copiado" role="status">Chave copiada.</p>
        </div>
      </div>
    </section>

    <section aria-labelledby="ligacao" class="verificacao">
      <h2 id="ligacao">Recebeu uma ligação da APPD?</h2>
      <p>
        A associação faz captação por telefone. Se você recebeu uma ligação pedindo contribuição e
        quer confirmar se é legítima antes de doar, ligue para a sede pelo número publicado aqui:
        <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
        >.
      </p>
      <p class="discreto">
        Nunca informe senha ou dado de cartão por telefone. A associação não pede isso.
      </p>
    </section>

    <section aria-labelledby="transparencia">
      <div class="cabeca">
        <h2 id="transparencia">Transparência</h2>
        <AppdSelo />
      </div>
      <p>
        Prestação de contas, número de pessoas atendidas, composição da diretoria e estatuto ainda
        não foram publicados pela associação. Estão pedidos, e entram aqui quando chegarem.
      </p>
    </section>
  </div>
</template>

<style scoped>
.doar {
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

.cabeca {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e3);
}

.identificacao dl {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--e3);
  margin: 0;
  background: var(--superficie);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
}

.identificacao dt {
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
}

.identificacao dd {
  margin: 0;
  font-weight: var(--peso-forte);
}

.destaque {
  background: var(--superficie);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
}

.lista {
  margin: 0;
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}

.botoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}

.pix-caixa {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e5);
  align-items: flex-start;
  background: var(--superficie);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
}

.qr {
  width: 240px;
  height: 240px;
  background: var(--fundo);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e2);
}

.pix-dados {
  flex: 1;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.pix-dados dl {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.pix-dados dt {
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
}

.pix-dados dd {
  margin: 0;
  font-weight: var(--peso-forte);
}

.chave {
  font-size: var(--texto-titulo-m);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.copiado {
  color: var(--sucesso);
  font-weight: var(--peso-forte);
}

.verificacao {
  border-left: 4px solid var(--aviso);
  background: var(--aviso-fundo);
  border-radius: var(--raio);
  padding: var(--e4);
  color: var(--aviso);
}

.verificacao a {
  color: inherit;
}

.discreto {
  font-size: var(--texto-rotulo);
}
</style>
