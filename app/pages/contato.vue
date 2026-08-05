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

    <section aria-labelledby="canais">
      <h2 id="canais">Falar com uma pessoa</h2>
      <ul class="canais">
        <li v-for="t in ASSOCIACAO.telefones" :key="t.e164">
          <a :href="`tel:${t.e164}`" class="canal">
            <span class="numero">{{ t.numero }}</span>
            <span class="rotulo">{{ t.rotulo }}</span>
          </a>
        </li>
        <li>
          <a :href="`mailto:${ASSOCIACAO.email}`" class="canal">
            <span class="numero">{{ ASSOCIACAO.email }}</span>
            <span class="rotulo">E-mail</span>
          </a>
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

      <AppdAviso v-if="enviado" tipo="sucesso" titulo="Mensagem registrada">
        <span>
          Esta é uma demonstração local: nada foi enviado ainda, porque a associação ainda não
          informou qual e-mail recebe as mensagens do site.
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
            <span class="icone" aria-hidden="true">✕</span>{{ erros.nome }}
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
            <span class="icone" aria-hidden="true">✕</span>{{ erros.email }}
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
            <span class="icone" aria-hidden="true">✕</span>{{ erros.assunto }}
          </span>
        </fieldset>

        <AppdAviso v-if="form.assunto === 'atendimento'" tipo="atencao" titulo="Atalho">
          <span>
            Para pedir atendimento, o caminho mais rápido é o cadastro:
            <NuxtLink to="/atendimento/inscricao">fazer meu cadastro</NuxtLink>. Você pode enviar a
            mensagem mesmo assim.
          </span>
        </AppdAviso>

        <div :class="['campo', 'largo', { 'campo-erro': erros.mensagem }]">
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
            <span class="icone" aria-hidden="true">✕</span>{{ erros.mensagem }}
          </span>
        </div>

        <div class="envio">
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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--e3);
}

.canal {
  display: flex;
  flex-direction: column;
  gap: var(--e1);
  min-height: 72px;
  justify-content: center;
  padding: var(--e3);
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  background: var(--fundo);
  box-shadow: var(--sombra-1);
  text-decoration: none;
}

.canal .numero {
  font-weight: var(--peso-forte);
  font-size: var(--texto-corpo-g);
}

.canal .rotulo {
  color: var(--texto-suave);
  font-size: var(--texto-rotulo);
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
  max-width: 36rem;
}

.campo.largo {
  max-width: 100%;
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
