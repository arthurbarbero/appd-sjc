<script setup lang="ts">
import { ASSOCIACAO } from '~~/shared/conteudo'

useHead({ title: 'Contato — APPD São José dos Campos' })

const assuntos = [
  { valor: 'atendimento', rotulo: 'Quero atendimento' },
  { valor: 'doar', rotulo: 'Quero doar' },
  { valor: 'voluntario', rotulo: 'Quero ser voluntário' },
  { valor: 'outro', rotulo: 'Outro assunto' },
]

const form = reactive({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' })

/*
  Quem já entrou não redigita o que a associação já tem (2026-08-20).

  "Se eu tô logado, por que você já não [preenche]?" — e a pergunta é justa: nome, e-mail
  e telefone estão no cadastro. Os campos continuam editáveis, porque a pessoa pode querer
  ser respondida em outro contato.

  A busca é condicionada à sessão e falha em silêncio: esta é uma página pública, e um
  erro ao buscar dados de conta não pode atrapalhar quem só quer escrever uma mensagem.
*/
const { loggedIn } = useUserSession()

if (loggedIn.value) {
  const { data: conta } = await useFetch('/api/area/meus-dados', {
    onResponseError: () => {},
  })
  watchEffect(() => {
    const c = conta.value?.conta
    if (!c) return
    if (!form.nome) form.nome = c.nome ?? ''
    if (!form.email) form.email = c.email ?? ''
    if (!form.telefone) form.telefone = mascararTelefone(c.telefone ?? '')
  })
}
const erros = reactive<Record<string, string>>({})
const enviado = ref(false)

function mascararTelefone(valor: string) {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function aoDigitarTelefone(e: Event) {
  const alvo = e.target as HTMLInputElement
  form.telefone = mascararTelefone(alvo.value)
}

function enviar() {
  for (const k of Object.keys(erros)) erros[k] = ''
  Object.keys(erros).forEach((k) => {
    if (!erros[k]) Reflect.deleteProperty(erros, k)
  })
  if (!form.nome.trim()) erros.nome = 'Escreva o seu nome para a associação saber com quem falar.'
  if (!form.email.trim() && !form.telefone.trim()) {
    erros.email = 'Deixe um e-mail ou um telefone, senão não temos como responder.'
  }
  if (!form.assunto) erros.assunto = 'Escolha o assunto para a mensagem chegar a quem responde.'
  if (!form.mensagem.trim()) erros.mensagem = 'Escreva a sua mensagem.'

  if (Object.keys(erros).length === 0) enviado.value = true
}
</script>

<template>
  <div class="contato">
    <header class="topo">
      <h1>Contato</h1>
      <p class="lide">
        O jeito mais rápido de falar com a associação é por telefone. Se preferir escrever, o
        formulário está logo abaixo.
      </p>
    </header>

    <!--
      Telefone é **texto com botão de copiar**, não botão de bloco (REQ-16). O bloco
      inteiro clicável ocupava a tela no celular e discava sem querer — e ligação errada
      não se desfaz. Quem quer ligar continua podendo: o número vira link `tel:` só no
      celular, onde discar é a ação natural (a regra está no CSS abaixo).
    -->
    <section aria-labelledby="canais">
      <h2 id="canais">Falar com uma pessoa</h2>
      <ul class="canais">
        <li v-for="t in ASSOCIACAO.telefones" :key="t.e164">
          <p class="rotulo">{{ t.rotulo }}</p>
          <AppdCopiar :valor="t.numero" o-que="Telefone" />
          <a :href="`tel:${t.e164}`" class="ligar">Ligar agora</a>
        </li>
        <li>
          <p class="rotulo">E-mail</p>
          <AppdCopiar :valor="ASSOCIACAO.email" o-que="E-mail" />
          <a :href="`mailto:${ASSOCIACAO.email}`" class="ligar">Abrir no meu e-mail</a>
        </li>
      </ul>
      <p class="endereco">
        <strong>Sede:</strong> {{ ASSOCIACAO.endereco.logradouro }} —
        {{ ASSOCIACAO.endereco.bairro }}, {{ ASSOCIACAO.endereco.cidade }}/{{
          ASSOCIACAO.endereco.uf
        }}, CEP {{ ASSOCIACAO.endereco.cep }}
      </p>
      <p class="horario">
        <AppdSelo /> O horário de funcionamento da sede ainda não foi informado pela associação.
      </p>
    </section>

    <section aria-labelledby="escrever">
      <h2 id="escrever">Escrever uma mensagem</h2>

      <!--
        O aviso "Este formulário ainda não envia" saiu em 2026-08-21, por decisão do dono:

        > tira esse negócio de "ainda não envia" (…) era uma coisa que eu falei pra você,
        > não era pra escrever

        Fica registrado o que isto custa, porque o custo é real e é dele a decisão: o
        formulário continua **sem destinatário** — a associação ainda não informou qual
        e-mail recebe (`docs/pendencias-appd.md`, item 4) —, e a tela deixou de dizer isso
        antes de a pessoa escrever. Quem procura ajuda escreve a mensagem inteira e só
        descobre depois do clique.

        O que sobrou de verdadeiro está na confirmação abaixo, que aparece depois do envio,
        e nos telefones logo acima, que funcionam hoje. Quando o e-mail existir, esta
        ressalva perde o objeto.
      -->
      <AppdAviso v-if="enviado" tipo="sucesso" titulo="Mensagem conferida, mas não enviada">
        <span>
          O que você escreveu está completo e sem erro. Ele <strong>não foi enviado</strong>:
          continua faltando o destinatário. Leve o assunto pelo telefone acima.
        </span>
      </AppdAviso>

      <AppdAviso v-else-if="Object.keys(erros).length" tipo="erro" titulo="Faltam informações">
        <ul class="lista-erros">
          <li v-for="(msg, campo) in erros" :key="campo">
            <a :href="`#${campo}`">{{ msg }}</a>
          </li>
        </ul>
      </AppdAviso>

      <form novalidate class="formulario" @submit.prevent="enviar">
        <div :class="['campo', { 'campo-erro': erros.nome }]">
          <label for="nome">Nome <span class="obrigatorio" aria-hidden="true">*</span></label>
          <span id="ajuda-nome" class="ajuda">Obrigatório.</span>
          <input
            id="nome"
            v-model="form.nome"
            type="text"
            autocomplete="name"
            :aria-invalid="erros.nome ? 'true' : undefined"
            :aria-describedby="erros.nome ? 'erro-nome' : 'ajuda-nome'"
          />
          <span v-if="erros.nome" id="erro-nome" class="erro">
            {{ erros.nome }}
          </span>
        </div>

        <div :class="['campo', { 'campo-erro': erros.email }]">
          <label for="email">E-mail</label>
          <span id="ajuda-email" class="ajuda">Deixe um e-mail ou um telefone.</span>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            :aria-invalid="erros.email ? 'true' : undefined"
            :aria-describedby="erros.email ? 'erro-email' : 'ajuda-email'"
          />
          <span v-if="erros.email" id="erro-email" class="erro">
            {{ erros.email }}
          </span>
        </div>

        <div class="campo">
          <label for="telefone">Telefone</label>
          <span id="ajuda-telefone" class="ajuda">Com DDD. Exemplo: (12) 99165-7059.</span>
          <input
            id="telefone"
            :value="form.telefone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="(00) 00000-0000"
            aria-describedby="ajuda-telefone"
            @input="aoDigitarTelefone"
          />
        </div>

        <fieldset class="grupo-escolha">
          <legend>Assunto <span class="obrigatorio" aria-hidden="true">*</span></legend>
          <label v-for="a in assuntos" :key="a.valor" class="escolha">
            <input v-model="form.assunto" type="radio" name="assunto" :value="a.valor" />
            {{ a.rotulo }}
          </label>
          <span v-if="erros.assunto" id="erro-assunto" class="erro">
            {{ erros.assunto }}
          </span>
        </fieldset>

        <AppdAviso v-if="form.assunto === 'atendimento'" tipo="atencao" titulo="Atalho">
          <span>
            Para pedir atendimento, o caminho mais rápido é o cadastro:
            <NuxtLink to="/atendimento/inscricao">fazer meu cadastro</NuxtLink>. Você pode enviar a
            mensagem mesmo assim.
          </span>
        </AppdAviso>

        <div :class="['campo', { 'campo-erro': erros.mensagem }]">
          <label for="mensagem">
            Mensagem <span class="obrigatorio" aria-hidden="true">*</span>
          </label>
          <textarea
            id="mensagem"
            v-model="form.mensagem"
            rows="5"
            :aria-invalid="erros.mensagem ? 'true' : undefined"
            :aria-describedby="erros.mensagem ? 'erro-mensagem' : undefined"
          ></textarea>
          <span v-if="erros.mensagem" id="erro-mensagem" class="erro">
            {{ erros.mensagem }}
          </span>
        </div>

        <div class="envio">
          <!--
            O rótulo voltou a ser "Enviar mensagem" em 2026-08-21, junto com a saída do
            aviso — o dono mandou tirar a frase dos dois lugares.

            Ele dizia "Conferir o que escrevi (ainda não envia)", que era honesto e feio. O
            que fica no lugar promete o que o sistema ainda não cumpre, e a única defesa
            contra isso é a confirmação logo acima, que aparece depois do clique e continua
            dizendo a verdade.
          -->
          <button type="submit" class="botao botao-primario">Enviar mensagem</button>
          <p class="discreto">
            <AppdSelo /> O prazo de resposta será publicado quando a associação definir quem
            responde.
          </p>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.contato {
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

.canais {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--e3);
}

.canais > li {
  display: flex;
  flex-direction: column;
  gap: var(--e1);
  padding: var(--e3);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  background: var(--fundo);
}

.canais .rotulo {
  color: var(--texto-suave);
  font-size: var(--texto-rotulo);
}

/*
  "Ligar agora" é link de texto, e só aparece em tela de toque — num computador, `tel:`
  costuma abrir um programa que a pessoa não pediu, e o número copiado resolve. Em
  celular, discar é a ação natural, e escondê-la seria pior do que o botão de bloco que
  esta tela acabou de tirar.
*/
.ligar {
  display: none;
  align-items: center;
  min-height: var(--alvo-min);
  font-size: var(--texto-rotulo);
}

@media (hover: none) and (pointer: coarse) {
  .ligar {
    display: inline-flex;
  }
}

.horario {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e2);
  color: var(--texto-suave);
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
  max-width: var(--bloco-medio);
}

.lista-erros {
  margin: 0;
  padding-left: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}

.lista-erros a {
  color: inherit;
}

.envio {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.discreto {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e2);
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
}
</style>
