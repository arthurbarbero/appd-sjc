<script setup lang="ts">
import { ASSOCIACAO, REGRAS_ATENDIMENTO } from '~~/shared/conteudo'
import { SENHA_MINIMO, normalizaEmail } from '~~/shared/auth/derivacao'
import { cpfValido } from '~~/shared/validacao/inscricao'
import { derivarChave } from '~/utils/derivar-senha'

/*
  Cadastro de Atendimento 2026 — réplica fiel dos 15 campos do formulário oficial.
  Rótulos, ordem e obrigatoriedade não mudam (ver docs/campos-formulario.md). O que
  muda é o que está em volta: máscara, erro por campo, consentimento do Art. 11.

  Desde o ADR-012 esta tela também **cria a conta**: não existe cadastro separado. Daí os
  três campos além dos 15 — e-mail, CPF e senha —, e a derivação da senha antes do envio.

  A senha nunca sai daqui. O que viaja é a chave derivada por scrypt no próprio navegador
  (ADR-005), porque o custo que protege a senha não cabe nos 10 ms de CPU do plano
  gratuito do Workers.
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
  cep: '',
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
  email: '',
  cpf: '',
  senha: '',
})

/** Gerada uma vez ao abrir a página: clique duplo e retentativa não viram dois cadastros. */
const chaveIdempotencia = crypto.randomUUID()

const enviando = ref(false)
const numeroRegistro = ref('')
const erroGeral = ref('')

const buscandoCep = ref(false)
const avisoCep = ref('')

/**
 * Preenche endereço, bairro e município a partir do CEP.
 *
 * Três decisões dentro de uma função pequena:
 *
 * - a consulta passa pelo **nosso** servidor (`/api/cep/...`), não direto pelo ViaCEP,
 *   para não entregar o IP do visitante a um terceiro;
 * - o preenchimento **nunca sobrescreve** o que a pessoa já digitou — corrigir texto que
 *   sumiu sozinho é pior do que digitar do zero;
 * - CEP não encontrado ou serviço fora do ar **não bloqueia nada**: avisa e segue. O
 *   endereço continua sendo digitável à mão, que é o caminho que sempre funciona.
 */
async function buscarCep() {
  const cep = soDigitos(f.cep)
  avisoCep.value = ''
  if (cep.length !== 8) return

  buscandoCep.value = true
  try {
    const r = await $fetch<{
      encontrado: boolean
      indisponivel?: boolean
      endereco?: string
      bairro?: string
      municipio?: string
    }>(`/api/cep/${cep}`)

    if (!r.encontrado) {
      avisoCep.value = r.indisponivel
        ? 'A busca por CEP está fora do ar. Preencha o endereço à mão.'
        : 'Não encontramos este CEP. Confira, ou preencha o endereço à mão.'
      return
    }
    if (!f.endereco.trim() && r.endereco) f.endereco = r.endereco
    if (!f.bairro.trim() && r.bairro) f.bairro = r.bairro
    if (!f.municipio.trim() && r.municipio) f.municipio = r.municipio
    Reflect.deleteProperty(erros, 'endereco')
    Reflect.deleteProperty(erros, 'bairro')
    Reflect.deleteProperty(erros, 'municipio')
  } catch {
    avisoCep.value = 'A busca por CEP falhou. Preencha o endereço à mão.'
  } finally {
    buscandoCep.value = false
  }
}

const erros = reactive<Record<string, string>>({})
const enviado = ref(false)
const resumoErro = ref<HTMLElement | null>(null)

function soDigitos(v: string) {
  return v.replace(/\D/g, '')
}

/**
 * Aplica a máscara e **devolve o valor ao input**.
 *
 * Sem a segunda parte existe um bug sutil: quando a máscara descarta o caractere
 * digitado (por já ter 11 dígitos), o valor calculado é idêntico ao anterior, o Vue não
 * vê mudança, não repinta — e o caractere a mais **fica visível no campo**. O modelo
 * fica certo e a tela mente, o que é pior do que os dois errados.
 */
function aplicarMascara(evento: Event, mascara: (v: string) => string): string {
  const alvo = evento.target as HTMLInputElement
  const formatado = mascara(alvo.value)
  if (alvo.value !== formatado) alvo.value = formatado
  return formatado
}

function mascaraTelefone(v: string) {
  const d = soDigitos(v).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function mascaraCep(v: string) {
  const d = soDigitos(v).slice(0, 8)
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`
}

function mascaraCpf(v: string) {
  const d = soDigitos(v).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
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
  const cep = soDigitos(f.cep)
  if (!cep) erros.cep = 'Informe o CEP.'
  else if (cep.length !== 8) erros.cep = 'O CEP tem 8 números. Exemplo: 12239-530.'

  if (!f.endereco.trim()) erros.endereco = 'Informe a rua, avenida ou travessa.'
  if (!f.numero.trim()) erros.numero = 'Informe o número. Se não houver, escreva s/n.'
  if (!f.bairro.trim()) erros.bairro = 'Informe o bairro.'
  if (!f.municipio.trim()) erros.municipio = 'Informe o município.'

  if (!f.deficiencias.length) erros.deficiencias = 'Marque pelo menos uma opção.'
  if (!f.atendimentos.length) erros.atendimentos = 'Marque pelo menos um tipo de atendimento.'
  if (!f.dias.length) erros.dias = 'Marque pelo menos um dia.'
  if (!f.email.trim()) {
    erros.email = 'Informe um e-mail: é com ele que você entra depois para corrigir o cadastro.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizaEmail(f.email))) {
    erros.email = 'Confira o e-mail. Exemplo: maria@gmail.com'
  }

  const cpf = soDigitos(f.cpf)
  if (!cpf) erros.cpf = 'Informe o CPF de quem vai ser atendido.'
  else if (!cpfValido(cpf)) erros.cpf = 'Confira o CPF: os números não fecham.'

  if (!f.senha) erros.senha = 'Crie uma senha para poder entrar depois.'
  else if (f.senha.length < SENHA_MINIMO) {
    erros.senha = `A senha precisa ter pelo menos ${SENHA_MINIMO} caracteres.`
  }

  if (!f.ciente) erros.ciente = 'Marque "Ciente" para concluir.'
  if (!f.consentimento) {
    erros.consentimento =
      'Sem esta autorização a associação não pode registrar a informação sobre deficiência.'
  }

  return Object.keys(erros).length === 0
}

async function enviar() {
  erroGeral.value = ''
  if (!validar()) {
    await nextTick()
    resumoErro.value?.focus()
    return
  }

  enviando.value = true
  try {
    // O trabalho caro acontece aqui, no aparelho da pessoa. Pode levar até um segundo
    // em celular antigo — daí o estado "Enviando…" ser requisito, não enfeite (REQ-6c).
    const chaveDerivada = await derivarChave(f.senha, normalizaEmail(f.email))

    const resposta = await $fetch<{ numeroRegistro: string }>('/api/conta/cadastro', {
      method: 'POST',
      body: {
        nome: f.nome.trim(),
        nascimento: f.nascimento,
        telefone: f.telefone,
        telefoneWhatsapp: f.whatsapp,
        cep: soDigitos(f.cep),
        endereco: f.endereco.trim(),
        numero: f.numero.trim(),
        ...(f.complemento.trim() ? { complemento: f.complemento.trim() } : {}),
        bairro: f.bairro.trim(),
        municipio: f.municipio.trim(),
        ...(f.cuidadorNome.trim() ? { cuidadorNome: f.cuidadorNome.trim() } : {}),
        ...(f.cuidadorContato.trim() ? { cuidadorContato: f.cuidadorContato } : {}),
        deficiencias: f.deficiencias,
        ...(f.deficienciaOutro.trim() ? { deficienciaOutro: f.deficienciaOutro.trim() } : {}),
        atendimentos: f.atendimentos,
        ...(f.atendimentoOutro.trim() ? { atendimentoOutro: f.atendimentoOutro.trim() } : {}),
        dias: f.dias,
        cienciaContribuicao: 'Ciente',
        email: normalizaEmail(f.email),
        cpf: soDigitos(f.cpf),
        consentimentoSaude: true,
        chaveIdempotencia,
        chaveDerivada,
      },
    })
    numeroRegistro.value = resposta.numeroRegistro
    enviado.value = true
  } catch (erro: unknown) {
    // Erro do servidor volta por campo, com a mesma mensagem que o cliente daria.
    const dados = (erro as { data?: { data?: { erros?: Record<string, string> } } })?.data?.data
    if (dados?.erros) {
      Object.assign(erros, dados.erros)
      await nextTick()
      resumoErro.value?.focus()
    } else {
      erroGeral.value =
        'Não conseguimos enviar agora. Suas respostas continuam aqui — tente de novo em instantes.'
    }
  } finally {
    enviando.value = false
  }
}
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

    <div v-if="enviado" class="sucesso">
      <AppdAviso tipo="sucesso" titulo="Cadastro enviado">
        <span>Seus interesses ficaram registrados e a sua conta foi criada.</span>
      </AppdAviso>
      <p class="registro">{{ numeroRegistro }}</p>
      <div class="o-que-acontece">
        <h2>O que acontece agora</h2>
        <ol class="lista">
          <li>
            A associação entra em contato pelo telefone {{ f.telefone || 'que você informou' }}.
          </li>
          <li>Este é o seu número de registro. Ele é seu e não muda.</li>
          <li>Você pode entrar a qualquer momento e corrigir o que precisar.</li>
        </ol>
        <p>
          Mudou de telefone? Corrija na sua área ou avise pelo
          <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
          >.
        </p>
      </div>
      <NuxtLink class="botao botao-primario" to="/area">Ir para a minha área</NuxtLink>
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
            @input="f.nascimento = aplicarMascara($event, mascaraData)"
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
            @input="f.telefone = aplicarMascara($event, mascaraTelefone)"
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

        <div :class="['campo', { 'campo-erro': erros.cep }]">
          <label for="cep">CEP <span class="obrigatorio" aria-hidden="true">*</span></label>
          <span id="ajuda-cep" class="ajuda">
            Obrigatório. Ao preencher, buscamos a rua, o bairro e a cidade para você.
          </span>
          <input
            id="cep"
            :value="f.cep"
            type="text"
            inputmode="numeric"
            autocomplete="postal-code"
            placeholder="00000-000"
            :aria-invalid="erros.cep ? 'true' : undefined"
            :aria-describedby="erros.cep ? 'erro-cep' : 'ajuda-cep'"
            @input="f.cep = aplicarMascara($event, mascaraCep)"
            @blur="buscarCep"
          />
          <span v-if="erros.cep" id="erro-cep" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.cep }}
          </span>
          <span v-if="buscandoCep" role="status" class="ajuda">Buscando o endereço…</span>
          <span v-else-if="avisoCep" role="status" class="ajuda">{{ avisoCep }}</span>
        </div>

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
            @input="f.cuidadorContato = aplicarMascara($event, mascaraTelefone)"
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

      <fieldset class="secao">
        <legend>5. Sua conta</legend>

        <p class="explicacao">
          Estes três dados criam a sua conta. É com eles que você entra depois para
          <strong>corrigir o seu cadastro</strong> sem precisar ligar para a associação.
        </p>
        <p class="explicacao">
          A conta é de quem vai ser atendido. Se você cuida de mais de uma pessoa, faça um cadastro
          para cada uma.
        </p>

        <div :class="['campo', { 'campo-erro': erros.email }]">
          <label for="email">E-mail <span class="obrigatorio" aria-hidden="true">*</span></label>
          <span id="ajuda-email" class="ajuda">Campo obrigatório.</span>
          <input
            id="email"
            v-model="f.email"
            type="email"
            inputmode="email"
            autocomplete="email"
            :aria-invalid="erros.email ? 'true' : undefined"
            aria-describedby="ajuda-email"
          />
          <span v-if="erros.email" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.email }}
          </span>
        </div>

        <div :class="['campo', { 'campo-erro': erros.cpf }]">
          <label for="cpf">CPF <span class="obrigatorio" aria-hidden="true">*</span></label>
          <span id="ajuda-cpf" class="ajuda"
            >Campo obrigatório. Da pessoa que vai ser atendida.</span
          >
          <input
            id="cpf"
            :value="f.cpf"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            :aria-invalid="erros.cpf ? 'true' : undefined"
            aria-describedby="ajuda-cpf"
            @input="f.cpf = aplicarMascara($event, mascaraCpf)"
          />
          <span v-if="erros.cpf" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.cpf }}
          </span>
        </div>

        <div :class="['campo', { 'campo-erro': erros.senha }]">
          <label for="senha">Senha <span class="obrigatorio" aria-hidden="true">*</span></label>
          <span id="ajuda-senha" class="ajuda">
            Campo obrigatório. Pelo menos {{ SENHA_MINIMO }} caracteres. Pode ser uma frase — não
            exigimos símbolo nem letra maiúscula.
          </span>
          <input
            id="senha"
            v-model="f.senha"
            type="password"
            autocomplete="new-password"
            :aria-invalid="erros.senha ? 'true' : undefined"
            aria-describedby="ajuda-senha"
          />
          <span v-if="erros.senha" class="erro">
            <span class="icone" aria-hidden="true">✕</span>{{ erros.senha }}
          </span>
        </div>
      </fieldset>

      <fieldset class="secao consentimento">
        <legend>6. Consentimento</legend>

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
            pessoa atendida. Pelo regimento interno, a contribuição custeia a manutenção da
            instituição e <strong>não dá prioridade nem exclusividade</strong> no atendimento.
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
        <AppdAviso v-if="erroGeral" tipo="erro" titulo="Não conseguimos enviar">
          <span>{{ erroGeral }}</span>
        </AppdAviso>
        <button type="submit" class="botao botao-primario" :disabled="enviando">
          {{ enviando ? 'Enviando…' : 'Enviar meu cadastro' }}
        </button>
        <p v-if="enviando" role="status" class="alternativa">
          Estamos preparando sua senha com segurança. Em celular mais antigo isso pode levar alguns
          segundos.
        </p>
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
