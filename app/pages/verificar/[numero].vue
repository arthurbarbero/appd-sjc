<script setup lang="ts">
import { ASSOCIACAO } from '~~/shared/conteudo'

/*
  Verificação pública do crachá — `/verificar/<numero>`.

  Pública de propósito, sem login, aberta quase sempre pela câmera do celular ao ler o QR
  Code impresso no crachá. A decisão que ela ajuda a tomar é uma só: "essa pessoa é mesmo
  associada à APPD?", em menos de cinco segundos, de pé, com uma mão só.

  Desenho aprovado no Claude Design em 2026-08-07 (`templates/verificar/Verificar.dc.html`),
  com as correções de `docs/handoff-design-cracha.md`.

  **Renderizada no servidor** (REQ-35): quem chega pela câmera pode estar com JavaScript
  desligado, em rede ruim ou em navegador antigo. `useFetch` durante o SSR resolve isso —
  o HTML já sai com a resposta dentro.

  **O que ela mostra está no ADR-015**: foto, nome, número, situação e cuidador. Nunca o
  tipo de deficiência.
*/

const rota = useRoute()
const sede = ASSOCIACAO.telefones[0]!
const numeroPedido = computed(() => String(rota.params.numero ?? ''))

useHead({
  title: 'Verificação de crachá — APPD São José dos Campos',
  // Página de dado de pessoa não entra em índice de busca. É o mesmo motivo do
  // `no-store`: o número é sorteado justamente para não ser descoberto (ADR-007).
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

/*
  Os cabeçalhos vão junto porque, no SSR, quem chama a API é o servidor — sem
  encaminhá-los, o limite de 20 por minuto contaria o IP do Worker, e não o de quem
  consulta. Aí o limite protegeria contra nada e bloquearia todo mundo junto.
*/
const { data, error } = await useFetch(() => `/api/verificar/${numeroPedido.value}`, {
  headers: useRequestHeaders(['cf-connecting-ip', 'x-forwarded-for']),
})

const excedeu = computed(() => (error.value as { statusCode?: number } | null)?.statusCode === 429)
const achou = computed(() => data.value?.encontrado === true)
const ativo = computed(() => data.value?.situacao === 'ativo')

/** Consulta manual, para quem não consegue usar a câmera. */
const digitado = ref('')
function consultar() {
  const valor = digitado.value.trim().toUpperCase()
  if (valor) navigateTo(`/verificar/${encodeURIComponent(valor)}`)
}
</script>

<template>
  <div class="verificar">
    <h1>Verificação de crachá</h1>

    <div aria-live="polite" class="resposta">
      <!--
        Erro de rede e 429 são a única coisa que sai do padrão de resposta única: são
        estado do serviço, não resultado da consulta, e confundir os dois faria a pessoa
        achar que o crachá é falso quando o site é que está ocupado.
      -->
      <div v-if="excedeu" class="cartao neutro" role="status">
        <p class="titulo-resposta">Muitas consultas seguidas.</p>
        <p>
          Espere um minuto e tente de novo. Se precisar de resposta agora, ligue para
          <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
          >.
        </p>
      </div>

      <div v-else-if="error" class="cartao neutro" role="status">
        <p class="titulo-resposta">Não conseguimos consultar agora.</p>
        <p>
          Tente de novo em instantes, ou ligue para
          <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
          >.
        </p>
      </div>

      <!--
        Número inexistente e número mal digitado caem exatamente aqui, com o mesmo texto e
        o mesmo bloco (REQ-29). Nada de dizer que o formato está errado, quantos dígitos
        faltam ou qual número parecido existe.
      -->
      <div v-else-if="!achou" class="cartao neutro">
        <p class="titulo-resposta">
          <span aria-hidden="true">?</span> Não encontramos esse número.
        </p>
        <p>
          Confira o número impresso no crachá e tente de novo. Se continuar assim, ligue para
          <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
          >.
        </p>
      </div>

      <template v-else>
        <div class="cartao cracha">
          <img
            v-if="data?.foto"
            class="retrato"
            :src="data.foto"
            :alt="`Foto de ${data?.nome ?? 'pessoa associada'}`"
          />

          <dl>
            <div v-if="data?.nome">
              <dt>Nome</dt>
              <dd class="nome">{{ data.nome }}</dd>
            </div>
            <div>
              <dt>Número de registro</dt>
              <dd class="numero">{{ data?.numero }}</dd>
            </div>
            <div>
              <dt>Situação</dt>
              <dd>
                <span :class="['selo', ativo ? 'selo-sucesso' : 'selo-atencao']">
                  <span aria-hidden="true">{{ ativo ? '✓' : '!' }}</span>
                  {{ ativo ? 'Associado ativo' : 'Cadastro não ativo' }}
                </span>
              </dd>
            </div>
            <div v-if="data?.cuidador">
              <dt>Contato de cuidador</dt>
              <dd>{{ data.cuidador }}</dd>
            </div>
          </dl>
        </div>

        <p class="frase">
          {{
            ativo
              ? 'Este número pertence a uma pessoa associada à APPD.'
              : 'Este número existe, mas o cadastro não está ativo agora.'
          }}
        </p>
        <p v-if="!ativo">
          Em caso de dúvida, ligue para a associação:
          <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
          >.
        </p>
      </template>
    </div>

    <!--
      A declaração do que a página não mostra fica em corpo normal, logo abaixo da
      resposta, e não em nota de rodapé (REQ-34). Quem chega desconfiado precisa sair
      sabendo que não vazou nada de ninguém.
    -->
    <div class="declaracao">
      <p>
        Esta página não mostra endereço, telefone da pessoa associada, data de nascimento nem tipo
        de deficiência.
      </p>
      <!--
        O desenho do canvas trazia link para "Ler a Política de Privacidade". A página é de
        `consentimento-e-privacidade` e **ainda não existe** — pôr o link agora repetiria o
        erro do QR que levava a 404. Volta quando a rota subir.
      -->
      <p>A associação não publica esses dados em nenhum endereço público.</p>
    </div>

    <form class="consulta" @submit.prevent="consultar">
      <label for="numero-cracha">Digite o número do crachá</label>
      <span id="ajuda-numero" class="ajuda">
        Está impresso no crachá, por exemplo: APPD-2026-K7M2XP
      </span>
      <div class="linha">
        <input
          id="numero-cracha"
          v-model="digitado"
          type="text"
          inputmode="text"
          autocomplete="off"
          spellcheck="false"
          aria-describedby="ajuda-numero"
        />
        <button type="submit" class="botao botao-primario">Verificar</button>
      </div>
    </form>

    <section class="cartao" aria-labelledby="ligacao">
      <h2 id="ligacao">
        Recebeu uma ligação da APPD?
        <AppdSelo texto="A confirmar" />
      </h2>
      <p>
        Quem for até a casa do doador retirar uma doação deve apresentar crachá com número de
        registro. Confira esse número aqui antes de entregar qualquer coisa.
      </p>
      <p>
        Dúvida? Ligue para a associação: <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a>
      </p>
    </section>
  </div>
</template>

<style scoped>
.verificar {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--e6);
}

.resposta {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.cracha {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e5);
  align-items: flex-start;
}

.retrato {
  width: 132px;
  height: 165px;
  object-fit: cover;
  border: 1px solid var(--borda-suave);
  border-radius: var(--raio);
  flex: none;
}

.cracha dl {
  flex: 1;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  margin: 0;
}

.cracha dt {
  font-size: var(--texto-rotulo);
  font-weight: var(--peso-forte);
  color: var(--texto-suave);
}

.cracha dd {
  margin: 0;
}

.nome {
  font-size: var(--texto-titulo-m);
  font-weight: var(--peso-forte);
  line-height: 1.25;
}

.numero {
  font-size: var(--texto-titulo-g);
  font-weight: var(--peso-forte);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}

.neutro {
  background: var(--superficie);
}

.titulo-resposta {
  font-size: var(--texto-titulo-m);
  font-weight: var(--peso-forte);
  margin: 0 0 var(--e2);
}

.frase {
  font-size: var(--texto-corpo-g);
  max-width: 56ch;
}

.declaracao {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  max-width: 60ch;
}

.consulta {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  border-top: 1px solid var(--borda-suave);
  padding-top: var(--e5);
}

.consulta label {
  font-size: var(--texto-corpo-g);
  font-weight: var(--peso-forte);
}

.ajuda {
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
}

.linha {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e2);
  margin-top: var(--e2);
}

.linha input {
  flex: 1;
  min-width: 200px;
  font-variant-numeric: tabular-nums;
}

h2 {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e2);
}
</style>
