<script setup lang="ts">
import { ASSOCIACAO } from '~~/shared/conteudo'
import { SENHA_MINIMO, normalizaEmail } from '~~/shared/senha'
import { ATENDIMENTOS, DDI_PADRAO, DEFICIENCIAS, DIAS, cpfValido } from '~~/shared/inscricao'
import { versaoVigente } from '~~/shared/termos'
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
const sessao = useUserSession()

/*
  As três listas vinham copiadas aqui, palavra por palavra, ao lado do módulo que já as
  declarava. Copiar vocabulário fechado é o jeito mais silencioso de duas telas
  divergirem: acrescentei os quatro projetos em `ATENDIMENTOS` (REQ-19) e **o formulário
  não teria mudado** — o cadastro ofereceria seis opções e a tela de correção, dez.
  Agora vêm de `shared/inscricao`, o mesmo módulo que valida no servidor.
*/

/*
  O código do país já escrito nos campos de telefone (2026-08-21).

  Decisão do dono: "comece a colocar o +55 como default, a pessoa pode apagar se quiser".
  O "pode apagar" é a parte que obriga o resto — validação, máscara e o CHECK do banco
  aceitam qualquer código de país, senão o campo aceitaria a edição e o servidor recusaria
  depois.
*/
const f = reactive({
  nome: '',
  nascimento: '',
  telefone: DDI_PADRAO,
  whatsapp: '',
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  municipio: '',
  estado: '',
  // País nasce preenchido: a associação atende São José dos Campos e região, e obrigar a
  // digitar "Brasil" seria trabalho sem informação. Continua editável.
  pais: 'Brasil',
  cuidadorNome: '',
  cuidadorContato: DDI_PADRAO,
  // Campos 22 a 25 (crachá impresso). Todos opcionais.
  cid: '',
  consentimentoCid: false,
  cras: '',
  credencialTransporte: '',
  contatoEmergencia: DDI_PADRAO,
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

/**
 * Um campo de telefone que só tem o código do país está **vazio**.
 *
 * Sem isto, `+55` sozinho viajaria como telefone informado, seria normalizado para `+55` e
 * recusado pela validação — a pessoa levaria um erro num campo opcional que ela não tocou.
 */
const preenchido = (telefone: string) => telefone.replace(/\D/g, '').length > 2

/** Gerada uma vez ao abrir a página: clique duplo e retentativa não viram dois cadastros. */
const chaveIdempotencia = crypto.randomUUID()

/*
  A versão do termo é resolvida **uma vez, ao abrir a página**, e o hash dela viaja no
  envio (`consentimento-e-privacidade` REQ-8). Se uma versão nova entrar em vigor enquanto
  a pessoa preenche, o que fica gravado continua sendo o que ela leu — não o que passou a
  valer no meio do caminho.

  **Ressalva escrita em vez de escondida**: hoje o bloco 7 desta tela mostra uma paráfrase
  do termo, não o texto do catálogo. O hash é do texto do catálogo, então "hash do que foi
  exibido" só fica literalmente verdadeiro quando a T7 trocar este bloco pelo componente
  que renderiza o texto versionado. Até lá, o registro aponta para a versão certa e o texto
  em tela diz a mesma coisa em outras palavras.
*/
const termoExibido = versaoVigente('deficiencia-art11')
/*
  O termo do CID é outro, e a tela o resolve separado de propósito: são duas autorizações,
  e o hash que vai junto do envio precisa ser o do texto que a pessoa leu para **cada uma**.
*/
const termoCidExibido = versaoVigente('cid-diagnostico')

/**
 * Foto do crachá: opcional, e **fora** da transação do cadastro (REQ-7f).
 *
 * Ela só sobe depois que a conta existe e a sessão está aberta, porque a rota que a
 * recebe é autenticada. Se o envio da foto falhar, a conta, a inscrição e o aceite já
 * estão gravados — a foto é a única parte do formulário que pode falhar sozinha, de
 * propósito: perder o cadastro inteiro por causa de uma imagem seria o pior negócio
 * possível para quem acabou de preencher 15 campos.
 */
const fotoCracha = ref<Blob | null>(null)
const fotoFalhou = ref(false)

const enviando = ref(false)
const numeroRegistro = ref('')
const erroGeral = ref('')

const buscandoCep = ref(false)
const avisoCep = ref('')
/*
  O CEP que preencheu o endereço da última vez.

  Sem ele, "substituir quando o CEP muda" viraria "substituir toda vez": sair do campo e
  voltar dispara a busca de novo, e a correção que a pessoa acabou de digitar na rua
  desapareceria sem que ninguém tivesse pedido.
*/
const cepQuePreencheu = ref('')
const avisoSubstituicao = ref('')

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
/*
  A regra vive em `app/utils/endereco-por-cep.ts` desde 2026-08-21, e não mais aqui.

  Ela estava copiada nesta tela e na outra, e mudou de lado no mesmo dia: a associação pediu
  que **o CEP novo substitua** o endereço já preenchido. Duas cópias mudando junto é o
  arranjo que produz duas telas com regras diferentes.
*/
async function buscarCep() {
  buscandoCep.value = true
  try {
    const r = await preencherPorCep(f.cep, f, cepQuePreencheu.value, (cep) =>
      $fetch<EnderecoDoCep>(`/api/cep/${cep}`),
    )
    avisoCep.value = r.aviso
    cepQuePreencheu.value = r.cepQuePreencheu
    // A pessoa precisa saber que o que ela tinha escrito foi trocado — quem pôs o
    // complemento dentro do campo da rua acabou de perdê-lo.
    avisoSubstituicao.value = r.substituiu
      ? 'Preenchemos rua, bairro, cidade e estado com os dados deste CEP.'
      : ''
    for (const campo of ['endereco', 'bairro', 'municipio', 'estado']) {
      if (f[campo as 'endereco'].trim()) Reflect.deleteProperty(erros, campo)
    }
  } finally {
    buscandoCep.value = false
  }
}

const erros = reactive<Record<string, string>>({})
const enviado = ref(false)
const resumoErro = ref<HTMLElement | null>(null)

// `soDigitos`, `aplicarMascara` e as quatro máscaras vivem em `app/utils/mascaras.ts`
// desde que `/area/dados` passou a precisar das mesmas. Auto-importadas.

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

  /*
    O campo nasce com `+55` escrito, então "vazio" passou a ser "só o código do país".

    Sem esta conta, quem não tocasse no telefone veria "informe um telefone" com o campo
    aparentemente preenchido — e quem apagasse o `+55` para escrever um número estrangeiro
    seria recusado por um mínimo de dígitos que não vale lá fora.
  */
  const tel = soDigitos(f.telefone)
  const digitosDoNumero = f.telefone.trim().startsWith('+') ? tel.slice(2) : tel
  if (!digitosDoNumero) {
    erros.telefone = 'Informe um telefone: é por ele que vem o primeiro contato.'
  } else if (tel.length < 10) {
    erros.telefone =
      'O telefone precisa ter código do país, DDD e número. Exemplo: +55 12 99165-7059.'
  }

  if (!f.whatsapp) erros.whatsapp = 'Diga se este número tem WhatsApp.'
  const cep = soDigitos(f.cep)
  if (!cep) erros.cep = 'Informe o CEP.'
  else if (cep.length !== 8) erros.cep = 'O CEP tem 8 números. Exemplo: 12239-530.'

  if (!f.endereco.trim()) erros.endereco = 'Informe a rua, avenida ou travessa.'
  if (!f.numero.trim()) erros.numero = 'Informe o número. Se não houver, escreva s/n.'
  if (!f.bairro.trim()) erros.bairro = 'Informe o bairro.'
  if (!f.municipio.trim()) erros.municipio = 'Informe o município.'

  /*
    As três múltiplas escolhas deixaram de ser exigidas em 2026-08-21.

    A validação daqui existe para dar a mensagem em pt-BR no campo certo antes de a
    requisição sair; a régua de verdade é o `esquemaInscricao`, que os dois lados importam.
    Enquanto esta cópia continuasse exigindo, o esquema aceitaria o cadastro sem deficiência
    e a **tela** o recusaria — que foi exatamente o que aconteceu no primeiro teste do
    cadastro de voluntário, com três mensagens de erro em campos opcionais.
  */
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
  // O consentimento do Art. 11 só é exigido quando há dado de saúde a autorizar — a mesma
  // condição do esquema, e pelo mesmo motivo.
  if (f.deficiencias.length && !f.consentimento) {
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
        estado: f.estado.trim(),
        pais: f.pais.trim(),
        ...(f.cras.trim() ? { cras: f.cras.trim() } : {}),
        ...(f.credencialTransporte.trim()
          ? { credencialTransporte: f.credencialTransporte.trim() }
          : {}),
        ...(preenchido(f.contatoEmergencia) ? { contatoEmergencia: f.contatoEmergencia } : {}),
        /*
          O CID só viaja acompanhado da autorização e do hash do termo lido. Sem CID, os
          três campos ficam de fora do corpo — e o servidor nem chega a consultar o
          catálogo.
        */
        /*
          O consentimento vai como a pessoa o deixou, e **nunca** fixo em `true`.

          Na primeira versão deste bloco eu mandei `consentimentoCid: true` junto do CID,
          e o efeito foi anular a caixa: o cliente afirmava a autorização que o servidor
          iria conferir. O teste de ponta a ponta pegou — enviou o CID sem marcar nada e o
          cadastro passou. Num campo comum seria bug; num consentimento do Art. 11 é a
          própria trava se desligando sozinha.

          Sem a caixa marcada, o esquema recusa com 422 e a tela mostra por quê.
        */
        ...(f.cid.trim()
          ? {
              cid: f.cid.trim(),
              ...(f.consentimentoCid ? { consentimentoCid: true as const } : {}),
              termoCidHash: termoCidExibido.hash,
            }
          : {}),
        ...(f.cuidadorNome.trim() ? { cuidadorNome: f.cuidadorNome.trim() } : {}),
        ...(preenchido(f.cuidadorContato) ? { cuidadorContato: f.cuidadorContato } : {}),
        deficiencias: f.deficiencias,
        ...(f.deficienciaOutro.trim() ? { deficienciaOutro: f.deficienciaOutro.trim() } : {}),
        atendimentos: f.atendimentos,
        ...(f.atendimentoOutro.trim() ? { atendimentoOutro: f.atendimentoOutro.trim() } : {}),
        dias: f.dias,
        cienciaContribuicao: 'Ciente',
        email: normalizaEmail(f.email),
        cpf: soDigitos(f.cpf),
        /*
          O mesmo cuidado que o CID já tinha, agora aqui — e ele faltava.

          Isto era `consentimentoSaude: true` fixo, o que anulava a caixa exatamente como o
          `consentimentoCid: true` fixo anulava a dela em 2026-08-21. Enquanto o campo 12
          era obrigatório o defeito ficava sem efeito visível, porque quem não marcava a
          caixa também não passava por outras validações. Com o consentimento condicional
          ele passaria a valer: quem marcasse deficiência e deixasse a caixa em branco teria
          o cliente afirmando a autorização por ele.

          Vai como a pessoa deixou. Se faltar, o esquema recusa com 422 e a tela diz por quê.
        */
        ...(f.consentimento
          ? { consentimentoSaude: true as const, termoHash: termoExibido.hash }
          : {}),
        chaveIdempotencia,
        chaveDerivada,
      },
    })
    // Concluir o cadastro já entra na conta: a sessão foi aberta pelo servidor no mesmo
    // pedido. Mandar para a área é o que a pessoa espera, e evita uma tela intermediária
    // que só existia porque o cadastro não gravava nada.
    numeroRegistro.value = resposta.numeroRegistro
    // Relê a sessão que o servidor acabou de abrir, senão o cabeçalho continua oferecendo
    // "Entrar" para quem já entrou. Mesmo motivo detalhado em `app/pages/entrar.vue`.
    await sessao.fetch()

    // A foto vai aqui, com a sessão já aberta e o cadastro já gravado. Falhar aqui não
    // desfaz nada: a pessoa entra na área e envia de novo em `/area/cracha` (REQ-7f).
    if (fotoCracha.value) {
      try {
        await $fetch('/api/area/foto', {
          method: 'PUT',
          body: fotoCracha.value,
          headers: { 'Content-Type': 'image/jpeg' },
        })
      } catch {
        fotoFalhou.value = true
      }
    }

    await navigateTo({
      path: '/area',
      query: {
        cadastro: resposta.numeroRegistro,
        ...(fotoFalhou.value ? { foto: 'falhou' } : {}),
      },
    })
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
        Leva poucos minutos. Marque tudo de que você precisa; a associação entra em contato pelo
        telefone que você informar.
      </p>
    </header>

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
            {{ erros.nome }}
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
            {{ erros.nascimento }}
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
            {{ erros.telefone }}
          </span>
        </div>

        <fieldset :class="['grupo-escolha', 'em-linha', { 'campo-erro': erros.whatsapp }]">
          <legend id="whatsapp">
            É WhatsApp <span class="obrigatorio" aria-hidden="true">*</span>
          </legend>
          <div class="escolhas">
            <label class="escolha"
              ><input v-model="f.whatsapp" type="radio" value="Sim" /> Sim</label
            >
            <label class="escolha"
              ><input v-model="f.whatsapp" type="radio" value="Não" /> Não</label
            >
          </div>
          <span v-if="erros.whatsapp" class="erro">
            {{ erros.whatsapp }}
          </span>
        </fieldset>
        <!--
          O CID no bloco de quem vai ser atendido (2026-08-21).

          Subiu do bloco de consentimento por decisão do dono — "o CID, pra mim, tem que ir
          lá em cima". A autorização vem colada nele, e não lá embaixo: informar o código
          **é** o ato que precisa de consentimento, e separá-los criaria o intervalo em que
          a pessoa digita o diagnóstico sem ter lido o que autoriza.

          A caixa aparece só depois que há algo escrito. Pedir autorização para um dado que
          ninguém informou é ruído, e caixa marcada sem dado seria consentimento de nada.
        -->
        <div class="cid-bloco">
          <div class="campo">
            <label for="cid">CID</label>
            <span id="ajuda-cid" class="ajuda">
              Opcional. É o código do seu diagnóstico, como está no laudo — por exemplo, G82.4.
            </span>
            <input id="cid" v-model="f.cid" type="text" aria-describedby="ajuda-cid" />
          </div>

          <div
            v-if="f.cid.trim()"
            :class="['grupo-escolha', 'consentir', { 'campo-erro': erros.consentimentoCid }]"
          >
            <p class="explicacao">
              O CID diz mais sobre a sua saúde do que o tipo de deficiência: aquele descreve a
              condição em linhas gerais, este identifica o diagnóstico. Por isso precisa de uma
              autorização separada.
            </p>
            <label class="escolha" for="consentimento-cid">
              <input id="consentimento-cid" v-model="f.consentimentoCid" type="checkbox" />
              Autorizo a APPD a guardar o meu CID e a imprimi-lo no meu crachá.
            </label>
            <!--
              O texto mudou em 2026-08-21, e a mudança não é de redação.

              Até aqui havia duas decisões: guardar e imprimir, cada uma com a sua caixa.
              O dono mandou juntá-las — "o CID pode entrar junto do consentimento atual
              existente". Com uma caixa só, ela precisa dizer as duas coisas, senão vira
              autorização obtida por omissão. O que **não** muda é a outra trava: a página
              pública nunca mostra o CID, marcado ou não (ADR-020).
            -->
            <p class="explicacao">
              Marcar autoriza as duas coisas: guardar o código e <strong>imprimi-lo</strong> na
              frente do crachá, que é o documento que você mostra a quem pedir. Ele
              <strong>nunca</strong> aparece na página pública de verificação.
            </p>
            <span v-if="erros.consentimentoCid" id="erro-cid" class="erro">
              {{ erros.consentimentoCid }}
            </span>
          </div>
        </div>
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
            {{ erros.cep }}
          </span>
          <span v-if="buscandoCep" role="status" class="ajuda">Buscando o endereço…</span>
          <span v-else-if="avisoCep" role="status" class="ajuda">{{ avisoCep }}</span>
          <!--
            O aviso de que o endereço foi **trocado** (2026-08-21).

            Desde que o CEP novo passou a substituir, alguém pode perder o que digitou — quem
            escreveu "apto 42" dentro do campo da rua, por exemplo. Trocar em silêncio seria
            a pessoa descobrir depois de enviar, ou não descobrir. `role="status"` porque
            quem usa leitor de tela também precisa saber.
          -->
          <span v-else-if="avisoSubstituicao" role="status" class="ajuda">
            {{ avisoSubstituicao }}
          </span>
        </div>

        <div :class="['campo', { 'campo-erro': erros.endereco }]">
          <label for="endereco">
            Endereço (rua/avenida/travessa) <span class="obrigatorio" aria-hidden="true">*</span>
          </label>
          <span id="ajuda-endereco" class="ajuda">Obrigatório.</span>
          <!--
            Caixa de uma linha, não `textarea` (2026-08-20).

            O campo era `textarea` por réplica do formulário de papel, onde a linha do
            endereço é larga. Na tela, a caixa alta sugeria texto longo num campo que
            recebe uma linha — "podia ser uma caixa normal de texto", disse o dono.
            Rótulo, ordem e obrigatoriedade seguem intactos: a réplica é do conteúdo do
            formulário, não do controle usado para preenchê-lo.
          -->
          <input
            id="endereco"
            v-model="f.endereco"
            type="text"
            autocomplete="street-address"
            :aria-invalid="erros.endereco ? 'true' : undefined"
            :aria-describedby="erros.endereco ? 'erro-endereco' : 'ajuda-endereco'"
          />
          <span v-if="erros.endereco" id="erro-endereco" class="erro">
            {{ erros.endereco }}
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
            {{ erros.numero }}
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
            {{ erros.bairro }}
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
            {{ erros.municipio }}
          </span>
        </div>

        <!--
          Campos 20 e 21, acrescentados em 2026-08-20. Vêm depois do município porque é
          onde a leitura do endereço termina: rua, número, bairro, cidade, estado, país.
        -->
        <div :class="['campo', { 'campo-erro': erros.estado }]">
          <label for="estado">Estado <span class="obrigatorio" aria-hidden="true">*</span></label>
          <span id="ajuda-estado" class="ajuda">
            Obrigatório. Ao informar o CEP, preenchemos para você.
          </span>
          <input
            id="estado"
            v-model="f.estado"
            type="text"
            autocomplete="address-level1"
            :aria-invalid="erros.estado ? 'true' : undefined"
            :aria-describedby="erros.estado ? 'erro-estado' : 'ajuda-estado'"
          />
          <span v-if="erros.estado" id="erro-estado" class="erro">
            {{ erros.estado }}
          </span>
        </div>

        <div :class="['campo', { 'campo-erro': erros.pais }]">
          <label for="pais">País <span class="obrigatorio" aria-hidden="true">*</span></label>
          <span id="ajuda-pais" class="ajuda">Obrigatório.</span>
          <input
            id="pais"
            v-model="f.pais"
            type="text"
            autocomplete="country-name"
            :aria-invalid="erros.pais ? 'true' : undefined"
            :aria-describedby="erros.pais ? 'erro-pais' : 'ajuda-pais'"
          />
          <span v-if="erros.pais" id="erro-pais" class="erro">
            {{ erros.pais }}
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
            placeholder="+55 (00) 00000-0000"
            aria-describedby="ajuda-cuidador-contato"
            @input="f.cuidadorContato = aplicarMascara($event, mascaraTelefone)"
          />
        </div>

        <!--
          Contato de emergência, logo abaixo do do cuidador (2026-08-21).

          O dono viu os dois em blocos separados e disse o que via: "pra mim cuidador e
          contato de emergência é a mesma coisa, não faz muito sentido ter os dois". Ele
          tem razão no caso comum — a pessoa que acompanha é a pessoa a quem se liga. Em vez
          de fundir os campos, que perderia o caso em que **não** são a mesma pessoa, eles
          ficam vizinhos e a ajuda diz o que fazer quando coincidem.
        -->
        <div class="campo">
          <label for="contato-emergencia">Contato de emergência</label>
          <span id="ajuda-emergencia" class="ajuda">
            Opcional, com DDD. Se for a mesma pessoa do contato acima, deixe em branco — o crachá
            usa o do cuidador.
          </span>
          <input
            id="contato-emergencia"
            :value="f.contatoEmergencia"
            type="tel"
            inputmode="tel"
            placeholder="+55 (00) 00000-0000"
            aria-describedby="ajuda-emergencia"
            @input="f.contatoEmergencia = aplicarMascara($event, mascaraTelefone)"
          />
        </div>
      </fieldset>

      <fieldset class="secao">
        <legend>4. Sobre o atendimento</legend>

        <!--
          CRAS e credencial abrem o bloco, e não têm mais um bloco só deles (2026-08-21).

          O "3b. Para o seu crachá" foi cortado por decisão do dono — "não precisa ter 3b,
          nem falar que é pro crachá". Ele estava certo pelo motivo que não disse: um bloco
          inteiro chamado "para o seu crachá" ensinava que aqueles dados servem para o
          documento, quando servem para o atendimento. O CRAS é a porta de entrada da rede
          pública; a credencial é o transporte que traz a pessoa até aqui.
        -->
        <!--
          "Número do CRAS", e não "CRAS de referência" — correção da associação, 2026-08-21.

          "De referência" é o vocabulário de quem trabalha na rede socioassistencial: o CRAS
          de referência é o que atende aquele território. Quem preenche o formulário não fala
          assim, e diante do rótulo antigo hesita entre escrever o nome da unidade e o
          número. O rótulo novo diz o que se espera na caixa.

          No crachá o rótulo continua `CRAS`, como no cartão de papel: lá o espaço é o que
          manda, e o número é o único valor possível.
        -->
        <div class="campo">
          <label for="cras">Número do CRAS</label>
          <span id="ajuda-cras" class="ajuda">Opcional.</span>
          <input id="cras" v-model="f.cras" type="text" aria-describedby="ajuda-cras" />
        </div>

        <!--
          O "Acesso Já" na ajuda — correção da associação, 2026-08-21.

          "Passe municipal" é o nome do documento; "Acesso Já" é o nome que a pessoa ouviu no
          balcão. Quem tem a credencial não sabe necessariamente que ela é o passe municipal —
          sabe que tem o Acesso Já. Campo opcional cujo rótulo a pessoa não reconhece é campo
          que ela pula.
        -->
        <div class="campo">
          <label for="credencial">Credencial de transporte</label>
          <span id="ajuda-credencial" class="ajuda">
            Opcional. Para quem utiliza o "Acesso Já", o passe municipal de transporte.
          </span>
          <input
            id="credencial"
            v-model="f.credencialTransporte"
            type="text"
            aria-describedby="ajuda-credencial"
          />
        </div>

        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.deficiencias }]">
          <legend id="deficiencias">Possui alguma deficiência</legend>
          <!--
            Deixou de ser obrigatório em 2026-08-21, por decisão do dono:

            > eu posso não ter nenhuma deficiência e querer ser voluntário, e só pra ajudar
            > eles (…) aqui é um cadastro, não só de quem tem deficiência

            O que isso reorganiza é maior que um asterisco: o consentimento do Art. 11 logo
            abaixo passa a aparecer **só** quando há deficiência marcada, porque sem dado de
            saúde não há finalidade a autorizar.
          -->
          <span class="ajuda">Opcional. Pode marcar mais de uma.</span>
          <label v-for="d in DEFICIENCIAS" :key="d" class="escolha">
            <input v-model="f.deficiencias" type="checkbox" :value="d" />
            {{ d }}
          </label>
          <div v-if="f.deficiencias.includes('Outro')" class="campo aninhado">
            <label for="deficiencia-outro">Qual?</label>
            <input id="deficiencia-outro" v-model="f.deficienciaOutro" type="text" />
          </div>
          <span v-if="erros.deficiencias" class="erro">
            {{ erros.deficiencias }}
          </span>
        </fieldset>

        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.atendimentos }]">
          <legend id="atendimentos">Tipo de Atendimento</legend>
          <span class="ajuda">
            Opcional. Pode marcar mais de um. Para participar de um projeto (Mão na Roda, Artesão,
            Informática), marque "Outro" e escreva o nome.
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
            {{ erros.atendimentos }}
          </span>
        </fieldset>

        <fieldset :class="['grupo-escolha', { 'campo-erro': erros.dias }]">
          <legend id="dias">Melhores dias</legend>
          <span class="ajuda">
            Opcional. <strong>As sessões acontecem somente no período da manhã.</strong>
          </span>
          <label v-for="d in DIAS" :key="d" class="escolha">
            <input v-model="f.dias" type="checkbox" :value="d" />
            {{ d }}
          </label>
          <span v-if="erros.dias" class="erro">
            {{ erros.dias }}
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
            {{ erros.email }}
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
            placeholder="000.000.000-00"
            autocomplete="off"
            :aria-invalid="erros.cpf ? 'true' : undefined"
            aria-describedby="ajuda-cpf"
            @input="f.cpf = aplicarMascara($event, mascaraCpf)"
          />
          <span v-if="erros.cpf" class="erro">
            {{ erros.cpf }}
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
            {{ erros.senha }}
          </span>
        </div>
      </fieldset>

      <fieldset class="secao">
        <legend>6. Foto do crachá (opcional)</legend>

        <p>
          Se quiser, já deixe a foto pronta agora. Ela vale só para o crachá do associado.
          <strong>Não é obrigatória</strong>: você pode concluir o cadastro sem ela e enviar depois,
          quando quiser, pela sua área.
        </p>

        <AppdFoto v-model="fotoCracha" rotulo="Foto para o crachá (opcional)" />
      </fieldset>

      <fieldset class="secao consentimento">
        <legend>7. Consentimento</legend>

        <!--
          A autorização do Art. 11 aparece **só quando há deficiência marcada** (2026-08-21).

          Com o campo 12 opcional, quem se cadastra para ser voluntário não informa condição
          de saúde nenhuma — e pedir a autorização assim mesmo seria colher consentimento
          sobre o vazio, que é o contrário do que o artigo exige: autorização específica
          para uma finalidade. Uma caixa que ninguém precisa marcar também ensina que
          marcar caixas é formalidade, e essa é a lição errada para o bloco onde ela mais
          importa.

          O esquema exige o mesmo par pelo mesmo critério, então tela e servidor não podem
          divergir sem o teste reprovar.
        -->
        <template v-if="f.deficiencias.length">
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
              {{ erros.consentimento }}
            </span>
          </div>
        </template>

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
            {{ erros.ciente }}
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
  max-width: var(--bloco-medio);
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

.cid-bloco {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
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
  max-width: var(--bloco-medio);
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
