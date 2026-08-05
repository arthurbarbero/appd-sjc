<script setup lang="ts">
import { ASSOCIACAO, REGRAS_ATENDIMENTO } from '~~/shared/conteudo'

/*
  Cadastro de Atendimento 2026 — réplica fiel dos 15 campos do formulário oficial.
  Rótulos, ordem e obrigatoriedade não mudam (ver docs/campos-formulario.md). O que
  muda é o que está em volta: máscara, erro por campo, consentimento do Art. 11.

  Ainda não envia nada: não há rota de servidor nem banco. A tela existe para validar o
  desenho e a experiência de preenchimento.
*/

useHead({ title: 'Cadastro de Atendimento 2026 — APPD São José dos Campos' })
const sede = ASSOCIACAO.telefones[0]!

const DEFICIENCIAS = [
  'Física',
  'Intelectual ou Neurodivergentes',
  'Sensorial (visão, audição, fala)',
  'Outro',
]
const ATENDIMENTOS = [
  'Empréstimo Equipamentos',
  'Fisioterapia',
  'Orientações Gerais',
  'Psicologia',
  'Serviço Social',
  'Outro',
]
const DIAS = ['Segundas', 'Terças', 'Quartas', 'Quintas', 'Sextas', 'Qualquer Dia da Semana']

const f = reactive({
  nome: '',
  nascimento: '',
  telefone: '',
  whatsapp: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  municipio: '',
  cuidadorNome: '',
  cuidadorContato: '',
  deficiencias: [] as string[],
  deficienciaOutro: '',
  atendimentos: [] as string[],
  atendimentoOutro: '',
  dias: [] as string[],
  ciente: '',
  consentimento: false,
})

const erros = reactive<Record<string, string>>({})
const enviado = ref(false)
const resumoErro = ref<HTMLElement | null>(null)

function soDigitos(v: string) {
  return v.replace(/\D/g, '')
}

function mascaraTelefone(v: string) {
  const d = soDigitos(v).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function mascaraData(v: string) {
  const d = soDigitos(v).slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

function dataValida(v: string) {
  const d = soDigitos(v)
  if (d.length !== 8) return false
  const dia = +d.slice(0, 2)
  const mes = +d.slice(2, 4)
  const ano = +d.slice(4)
  if (mes < 1 || mes > 12 || dia < 1 || ano < 1900) return false
  const data = new Date(ano, mes - 1, dia)
  if (data.getDate() !== dia || data.getMonth() !== mes - 1) return false
  return data.getTime() <= Date.now()
}

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

function validar() {
  for (const k of Object.keys(erros)) erros[k] = ''
  Object.keys(erros).forEach((k) => {
    if (!erros[k]) Reflect.deleteProperty(erros, k)
  })

  if (!f.nome.trim()) erros.nome = 'Escreva o nome de quem vai ser atendido.'

  if (!f.nascimento.trim()) {
    erros.nascimento = 'Informe a data de nascimento, no formato dia/mês/ano.'
  } else if (!dataValida(f.nascimento)) {
    const d = soDigitos(f.nascimento)
    const mes = +d.slice(2, 4)
    erros.nascimento =
      d.length === 8 && mes >= 1 && mes <= 12
        ? `Esta data não existe. Confira o dia de ${MESES[mes - 1]}.`
        : 'A data precisa ter dia, mês e ano. Exemplo: 12/03/1978.'
  }

  const tel = soDigitos(f.telefone)
  if (!tel) erros.telefone = 'Informe um telefone: é por ele que vem o primeiro contato.'
  else if (tel.length < 10) erros.telefone = 'O telefone precisa ter DDD. Exemplo: (12) 99165-7059.'

  if (!f.whatsapp) erros.whatsapp = 'Diga se este número tem WhatsApp.'
  if (!f.endereco.trim()) erros.endereco = 'Informe a rua, avenida ou travessa.'
  if (!f.numero.trim()) erros.numero = 'Informe o número. Se não houver, escreva s/n.'
  if (!f.bairro.trim()) erros.bairro = 'Informe o bairro.'
  if (!f.municipio.trim()) erros.municipio = 'Informe o município.'

  if (!f.deficiencias.length) erros.deficiencias = 'Marque pelo menos uma opção.'
  if (!f.atendimentos.length) erros.atendimentos = 'Marque pelo menos um tipo de atendimento.'
  if (!f.dias.length) erros.dias = 'Marque pelo menos um dia.'
  if (!f.ciente) erros.ciente = 'Marque "Ciente" para concluir.'
  if (!f.consentimento) {
    erros.consentimento =
      'Sem esta autorização a associação não pode registrar a informação sobre deficiência.'
  }

  return Object.keys(erros).length === 0
}

async function enviar() {
  if (validar()) {
    enviado.value = true
    return
  }
  await nextTick()
  resumoErro.value?.focus()
}

const numeroFicticio = 'APPD-2026-00042'
</script>

<template>
  <div class="inscricao">
    <header class="topo">
      <h1>Cadastro de Atendimento 2026</h1>
      <p class="lide">
        Um cadastro só, para qualquer um dos atendimentos da associação. Leva poucos minutos.
      </p>
    </header>

    <AppdAviso tipo="destaque" titulo="Antes de começar">
      <ul class="lista">
        <li v-for="regra in REGRAS_ATENDIMENTO" :key="regra">{{ regra }}</li>
      </ul>
    </AppdAviso>

    <AppdAviso tipo="atencao" titulo="Esta é uma demonstração local">
      <span>
        O formulário ainda não envia nada: não existe banco de dados nem servidor ligado. Ele está
        aqui para você conferir o preenchimento, os erros e a tela de confirmação.
      </span>
    </AppdAviso>

    <div v-if="enviado" class="sucesso">
      <AppdAviso tipo="sucesso" titulo="Cadastro preenchido">
        <span>
          Numa versão publicada, você entraria na fila agora e receberia o número de registro
          abaixo.
        </span>
      </AppdAviso>
      <p class="registro">{{ numeroFicticio }}</p>
      <div class="o-que-acontece">
        <h2>O que aconteceria agora</h2>
        <ol class="lista">
          <li>Seu cadastro entra na fila de vagas.</li>
          <li>A associação liga para {{ f.telefone || 'o telefone informado' }}.</li>
          <li>No primeiro atendimento, você recebe as orientações gerais.</li>
        </ol>
        <p>
          Mudou de telefone? Avise pelo <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
          >.
        </p>
      </div>
      <button type="button" class="botao botao-secundario" @click="enviado = false">
        Voltar ao formulário
      </button>
    </div>

    <form v-else novalidate class="formulario" @submit.prevent="enviar">
      <div
        v-if="Object.keys(erros).length"
        ref="resumoErro"
        class="aviso aviso-erro"
        role="alert"
        tabindex="-1"
      >
        <span class="icone" aria-hidden="true">✕</span>
        <div class="conteudo">
          <strong>
            {{
              Object.keys(erros).length === 1
                ? 'Falta 1 campo para enviar'
                : `Faltam ${Object.keys(erros).length} campos para enviar`
            }}
          </strong>
          <ul class="lista-erros">
            <li v-for="(msg, campo) in erros" :key="campo">
              <a :href="`#${campo}`">{{ msg }}</a>
            </li>
          </ul>
          <span class="preservado">Suas outras respostas foram mantidas.</span>
        </div>
      </div>

      <fieldset class="secao">
        <legend>1. Quem vai ser atendido</legend>

        <div :class="['campo', { 'campo-erro': erros.nome }]">
          <label for="nome">Nome <span class="obrigatorio" aria-hidden="true">*</span></label>
          <span id="ajuda-nome" class="ajuda">Obrigatório. Nome de quem vai ser atendido.</span>
          <input
            id="nome"
            v-model="f.nome"
            type="text"
            autocomplete="name"
            :aria-invalid="erros.nome ? 'true' : undefined"
            :aria-describedby="erros.nome ? 'erro-nome' : 'ajuda-nome'"
          />
          <span v-if="erros.nome" id="erro-nome" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.nome }}
          </span>
        </div>

        <div :class="['campo', { 'campo-erro': erros.nascimento }]">
          <label for="nascimento">
            Data de nascimento <span class="obrigatorio" aria-hidden="true">*</span>
          </label>
          <span id="ajuda-nascimento" class="ajuda">
            Obrigatório. Escreva no formato dia/mês/ano. Exemplo: 12/03/1978.
          </span>
          <input
            id="nascimento"
            :value="f.nascimento"
            type="text"
            inputmode="numeric"
            autocomplete="bday"
            placeholder="dd/mm/aaaa"
            maxlength="10"
            :aria-invalid="erros.nascimento ? 'true' : undefined"
            :aria-describedby="erros.nascimento ? 'erro-nascimento' : 'ajuda-nascimento'"
            @input="f.nascimento = mascaraData(($event.target as HTMLInputElement).value)"
          />
          <span v-if="erros.nascimento" id="erro-nascimento" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.nascimento }}
          </span>
        </div>

        <div :class="['campo', { 'campo-erro': erros.telefone }]">
          <label for="telefone">
            Telefone para contato <span class="obrigatorio" aria-hidden="true">*</span>
          </label>
          <span id="ajuda-telefone" class="ajuda">
            Obrigatório, com DDD. É por ele que vem o primeiro contato.
          </span>
          <input
            id="telefone"
            :value="f.telefone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="(00) 00000-0000"
            :aria-invalid="erros.telefone ? 'true' : undefined"
            :aria-describedby="erros.telefone ? 'erro-telefone' : 'ajuda-telefone'"
            @input="f.telefone = mascaraTelefone(($event.target as HTMLInputElement).value)"
          />
          <span v-if="erros.telefone" id="erro-telefone" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.telefone }}
          </span>
        </div>

        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.whatsapp }]">
          <legend id="whatsapp">
            É WhatsApp <span class="obrigatorio" aria-hidden="true">*</span>
          </legend>
          <label class="escolha"><input v-model="f.whatsapp" type="radio" value="Sim" /> Sim</label>
          <label class="escolha"><input v-model="f.whatsapp" type="radio" value="Não" /> Não</label>
          <span v-if="erros.whatsapp" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.whatsapp }}
          </span>
        </fieldset>
      </fieldset>

      <fieldset class="secao">
        <legend>2. Onde você mora</legend>

        <div :class="['campo', 'largo', { 'campo-erro': erros.endereco }]">
          <label for="endereco">
            Endereço (rua/avenida/travessa) <span class="obrigatorio" aria-hidden="true">*</span>
          </label>
          <span id="ajuda-endereco" class="ajuda">Obrigatório.</span>
          <textarea
            id="endereco"
            v-model="f.endereco"
            rows="2"
            autocomplete="street-address"
            :aria-invalid="erros.endereco ? 'true' : undefined"
            :aria-describedby="erros.endereco ? 'erro-endereco' : 'ajuda-endereco'"
          ></textarea>
          <span v-if="erros.endereco" id="erro-endereco" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.endereco }}
          </span>
        </div>

        <div :class="['campo', { 'campo-erro': erros.numero }]">
          <label for="numero">Número <span class="obrigatorio" aria-hidden="true">*</span></label>
          <span id="ajuda-numero" class="ajuda">Obrigatório. Sem número? Escreva s/n.</span>
          <input
            id="numero"
            v-model="f.numero"
            type="text"
            :aria-invalid="erros.numero ? 'true' : undefined"
            :aria-describedby="erros.numero ? 'erro-numero' : 'ajuda-numero'"
          />
          <span v-if="erros.numero" id="erro-numero" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.numero }}
          </span>
        </div>

        <div class="campo">
          <label for="complemento">Complemento (se houver)</label>
          <span id="ajuda-complemento" class="ajuda">Opcional. Bloco, apartamento, fundos.</span>
          <input
            id="complemento"
            v-model="f.complemento"
            type="text"
            aria-describedby="ajuda-complemento"
          />
        </div>

        <div :class="['campo', { 'campo-erro': erros.bairro }]">
          <label for="bairro">Bairro <span class="obrigatorio" aria-hidden="true">*</span></label>
          <span id="ajuda-bairro" class="ajuda">Obrigatório.</span>
          <input
            id="bairro"
            v-model="f.bairro"
            type="text"
            :aria-invalid="erros.bairro ? 'true' : undefined"
            :aria-describedby="erros.bairro ? 'erro-bairro' : 'ajuda-bairro'"
          />
          <span v-if="erros.bairro" id="erro-bairro" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.bairro }}
          </span>
        </div>

        <div :class="['campo', { 'campo-erro': erros.municipio }]">
          <label for="municipio">
            Município <span class="obrigatorio" aria-hidden="true">*</span>
          </label>
          <span id="ajuda-municipio" class="ajuda">
            Obrigatório. A associação também atende quem mora fora de São José dos Campos.
          </span>
          <input
            id="municipio"
            v-model="f.municipio"
            type="text"
            :aria-invalid="erros.municipio ? 'true' : undefined"
            :aria-describedby="erros.municipio ? 'erro-municipio' : 'ajuda-municipio'"
          />
          <span v-if="erros.municipio" id="erro-municipio" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.municipio }}
          </span>
        </div>
      </fieldset>

      <fieldset class="secao">
        <legend>3. Cuidador, se houver</legend>
        <p class="explicacao">Preencha só se outra pessoa acompanha o atendimento.</p>

        <div class="campo">
          <label for="cuidador">Nome do cuidador (se necessário)</label>
          <span id="ajuda-cuidador" class="ajuda">Opcional.</span>
          <input
            id="cuidador"
            v-model="f.cuidadorNome"
            type="text"
            aria-describedby="ajuda-cuidador"
          />
        </div>

        <div class="campo">
          <label for="cuidador-contato">Contato do cuidador</label>
          <span id="ajuda-cuidador-contato" class="ajuda">Opcional, com DDD.</span>
          <input
            id="cuidador-contato"
            :value="f.cuidadorContato"
            type="tel"
            inputmode="tel"
            placeholder="(00) 00000-0000"
            aria-describedby="ajuda-cuidador-contato"
            @input="f.cuidadorContato = mascaraTelefone(($event.target as HTMLInputElement).value)"
          />
        </div>
      </fieldset>

      <fieldset class="secao">
        <legend>4. Sobre o atendimento</legend>

        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.deficiencias }]">
          <legend id="deficiencias">
            Possui alguma deficiência <span class="obrigatorio" aria-hidden="true">*</span>
          </legend>
          <span class="ajuda">Obrigatório. Pode marcar mais de uma.</span>
          <label v-for="d in DEFICIENCIAS" :key="d" class="escolha">
            <input v-model="f.deficiencias" type="checkbox" :value="d" />
            {{ d }}
          </label>
          <div v-if="f.deficiencias.includes('Outro')" class="campo aninhado">
            <label for="deficiencia-outro">Qual?</label>
            <input id="deficiencia-outro" v-model="f.deficienciaOutro" type="text" />
          </div>
          <span v-if="erros.deficiencias" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.deficiencias }}
          </span>
        </fieldset>

        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.atendimentos }]">
          <legend id="atendimentos">
            Tipo de Atendimento <span class="obrigatorio" aria-hidden="true">*</span>
          </legend>
          <span class="ajuda">
            Obrigatório. Pode marcar mais de um. Para participar de um projeto (Bocha, Mão na Roda,
            Artesão, Informática), marque "Outro" e escreva o nome.
          </span>
          <label v-for="a in ATENDIMENTOS" :key="a" class="escolha">
            <input v-model="f.atendimentos" type="checkbox" :value="a" />
            {{ a }}
          </label>
          <div v-if="f.atendimentos.includes('Outro')" class="campo aninhado">
            <label for="atendimento-outro">Qual?</label>
            <input id="atendimento-outro" v-model="f.atendimentoOutro" type="text" />
          </div>
          <span v-if="erros.atendimentos" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.atendimentos }}
          </span>
        </fieldset>

        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.dias }]">
          <legend id="dias">
            Melhores dias <span class="obrigatorio" aria-hidden="true">*</span>
          </legend>
          <span class="ajuda">
            Obrigatório. <strong>As sessões acontecem somente no período da manhã.</strong>
          </span>
          <label v-for="d in DIAS" :key="d" class="escolha">
            <input v-model="f.dias" type="checkbox" :value="d" />
            {{ d }}
          </label>
          <span v-if="erros.dias" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.dias }}
          </span>
        </fieldset>
      </fieldset>

      <fieldset class="secao consentimento">
        <legend>5. Consentimento</legend>

        <p>
          A informação sobre deficiência é <strong>dado de saúde</strong>. A Lei Geral de Proteção
          de Dados trata esse tipo de dado como sensível e exige a sua autorização específica para
          registrá-lo — separada de qualquer outra concordância.
        </p>

        <div :class="['grupo-escolha', 'consentir', { 'campo-erro': erros.consentimento }]">
          <label class="escolha" for="consentimento">
            <input id="consentimento" v-model="f.consentimento" type="checkbox" />
            Autorizo a APPD a tratar a minha informação sobre deficiência para organizar o meu
            atendimento.
          </label>
          <span v-if="erros.consentimento" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.consentimento }}
          </span>
        </div>

        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.ciente }]">
          <legend id="ciente">
            Ciência da Contribuição Solidária
            <span class="obrigatorio" aria-hidden="true">*</span>
          </legend>
          <p class="explicacao">
            Para a manutenção do projeto, é solicitada uma contribuição solidária. O valor sugerido
            é de <strong>R$ 50,00 por mês</strong>, e pode ser alterado conforme a situação de cada
            pessoa atendida.
          </p>
          <label class="escolha">
            <input v-model="f.ciente" type="radio" value="Ciente" />
            Ciente
          </label>
          <span v-if="erros.ciente" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.ciente }}
          </span>
        </fieldset>
      </fieldset>

      <div class="envio">
        <button type="submit" class="botao botao-primario">Enviar meu cadastro</button>
        <p class="alternativa">
          Prefere preencher por telefone? Ligue para
          <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a>
        </p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.inscricao {
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

.formulario {
  display: flex;
  flex-direction: column;
  gap: var(--e5);
  max-width: 44rem;
}

.secao {
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}

.secao > legend {
  font-size: var(--texto-titulo-m);
  font-weight: var(--peso-forte);
  padding: 0 var(--e2);
}

.consentimento {
  border-color: var(--borda);
  border-width: var(--borda-campo);
  background: var(--superficie);
}

.consentir {
  background: var(--fundo);
}

.campo.largo {
  max-width: 100%;
}

.campo.aninhado {
  margin-top: var(--e2);
  margin-left: var(--e5);
}

.grupo-escolha .ajuda {
  color: var(--texto-suave);
  font-size: var(--texto-rotulo);
  padding: 0 var(--e2);
}

.explicacao {
  color: var(--texto-suave);
  max-width: var(--medida);
}

.lista,
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

.preservado {
  font-weight: var(--peso-forte);
}

.campo-erro {
  border-color: var(--erro);
}

.envio {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.alternativa {
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
}

.sucesso {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
  max-width: 44rem;
}

.registro {
  font-size: var(--texto-titulo-g);
  font-weight: var(--peso-forte);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  background: var(--superficie);
  border: var(--borda-campo) solid var(--borda);
  border-radius: var(--raio);
  padding: var(--e4);
  text-align: center;
}

.o-que-acontece {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}
</style>
