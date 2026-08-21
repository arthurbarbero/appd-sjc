<script setup lang="ts">
import { esquemaMeusDados } from '~~/shared/inscricao'

/*
  Meus dados — `/area/dados`. Fatia 3 de `area-do-associado` (REQ-15 a REQ-17).

  **A validação é a mesma do servidor**, importada, não reescrita: `esquemaMeusDados` é o
  objeto que a rota `PUT /api/area/meus-dados` também usa. Enquanto a régua for uma só,
  "o cliente aceitou e o servidor recusou" deixa de ser uma classe de bug possível.

  **O que esta tela não altera, e por quê** — e-mail, CPF e data de nascimento não têm
  campo aqui. O e-mail entra no sal da derivação da senha no navegador: trocá-lo sem
  refazer a derivação transformaria a senha atual em senha errada, sem aviso. O motivo
  completo de cada exclusão está junto do schema, em `shared/inscricao.ts`.

  **Ressalva de rito**: esta tela não passou pelo Claude Design como o CLAUDE.md exige.
  Ela reusa os componentes de campo já aprovados no formulário de atendimento e a casca da
  área, e a exceção está registrada em `openspec/ESTADO.md` em vez de ficar escondida.
*/

useHead({ title: 'Meus dados — APPD São José dos Campos' })

const { data, pending } = await useFetch('/api/area/meus-dados')

const f = reactive({
  nome: '',
  telefone: '',
  whatsapp: 'Sim',
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  municipio: '',
  estado: '',
  pais: '',
})

watchEffect(() => {
  const conta = data.value?.conta
  if (!conta) return
  f.nome = conta.nome ?? ''
  f.telefone = mascaraTelefone(conta.telefone ?? '')
  f.whatsapp = conta.telefoneWhatsapp ?? 'Sim'
  f.cep = mascaraCep(conta.cep ?? '')
  f.endereco = conta.endereco ?? ''
  f.numero = conta.numero ?? ''
  f.complemento = conta.complemento ?? ''
  f.bairro = conta.bairro ?? ''
  f.municipio = conta.municipio ?? ''
  f.estado = conta.estado ?? ''
  f.pais = conta.pais ?? 'Brasil'
})

/** Os três que a tela exibe travados. Vêm do servidor e nunca entram em `f`. */
const conta = computed(() => data.value?.conta ?? null)

/*
  O banco guarda a data em ISO; a tela mostra no formato de quem lê.

  Sem isto o campo travado exibia "1978-03-12" — que é o jeito de guardar, não o jeito de
  ler, e destoa do próprio formulário de cadastro, que pede e mostra dia/mês/ano.
*/
const nascimentoLegivel = computed(() => {
  const bruto = conta.value?.nascimento ?? ''
  const iso = bruto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : bruto
})

const erros = reactive<Record<string, string>>({})
const salvando = ref(false)
const salvo = ref(false)
const resumo = ref<HTMLElement | null>(null)

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
  } finally {
    buscandoCep.value = false
  }
}

/*
  Nada mudou ainda?

  Até 2026-08-20 "Salvar alterações" ficava disponível numa tela recém-aberta, e apertá-lo
  gravava por cima com os mesmos valores. Botão que aceita o clique sem ter o que fazer
  ensina que o clique não significa nada.

  A comparação é contra o que o servidor devolveu, normalizado pelo mesmo `corpo()` que
  seria enviado — assim máscara de telefone e CEP não contam como alteração.
*/
const alterado = computed(() => {
  const c = conta.value
  if (!c) return false
  const atual = corpo()
  const original = {
    nome: (c.nome ?? '').trim(),
    telefone: mascaraTelefone(c.telefone ?? ''),
    telefoneWhatsapp: c.telefoneWhatsapp ?? 'Sim',
    cep: soDigitos(c.cep ?? ''),
    endereco: (c.endereco ?? '').trim(),
    numero: (c.numero ?? '').trim(),
    ...((c.complemento ?? '').trim() ? { complemento: (c.complemento ?? '').trim() } : {}),
    bairro: (c.bairro ?? '').trim(),
    municipio: (c.municipio ?? '').trim(),
    estado: (c.estado ?? '').trim(),
    pais: (c.pais ?? 'Brasil').trim(),
  }
  return JSON.stringify(atual) !== JSON.stringify(original)
})

/** Corpo enviado ao servidor — e o mesmo objeto que o schema valida antes de sair daqui. */
function corpo() {
  return {
    nome: f.nome.trim(),
    telefone: f.telefone,
    telefoneWhatsapp: f.whatsapp as 'Sim' | 'Não',
    cep: soDigitos(f.cep),
    endereco: f.endereco.trim(),
    numero: f.numero.trim(),
    ...(f.complemento.trim() ? { complemento: f.complemento.trim() } : {}),
    bairro: f.bairro.trim(),
    municipio: f.municipio.trim(),
    estado: f.estado.trim(),
    pais: f.pais.trim(),
  }
}

async function salvar() {
  for (const k of Object.keys(erros)) Reflect.deleteProperty(erros, k)
  salvo.value = false

  const validado = esquemaMeusDados.safeParse(corpo())
  if (!validado.success) {
    for (const p of validado.error.issues) erros[String(p.path[0] ?? 'formulario')] = p.message
    await nextTick()
    resumo.value?.focus()
    return
  }

  salvando.value = true
  try {
    await $fetch('/api/area/meus-dados', { method: 'PUT', body: corpo() })
    salvo.value = true
    // Recarrega para o painel e o crachá refletirem o nome novo na próxima visita.
    await refreshNuxtData()
    /*
      Volta ao topo e põe o foco na confirmação. Sem isto, quem salvava lá embaixo ficava
      olhando para o mesmo formulário sem sinal de que algo tinha acontecido — e quem usa
      leitor de tela não ouvia nada.
    */
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    resumo.value?.focus()
  } catch (erro: unknown) {
    const dados = (erro as { data?: { data?: { erros?: Record<string, string> } } })?.data?.data
    Object.assign(erros, dados?.erros ?? { formulario: 'Não conseguimos salvar agora.' })
    // Nada do que a pessoa digitou é perdido: `f` continua como está (REQ-17).
    await nextTick()
    resumo.value?.focus()
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="dados area-moldura">
    <h1>Meus dados</h1>
    <AreaNavegacao atual="dados" />

    <p v-if="pending" role="status">Carregando seus dados…</p>

    <template v-else>
      <p>
        Corrija sempre que precisar. A associação usa o telefone e o endereço para entrar em contato
        e para o atendimento em casa.
      </p>

      <div
        v-if="Object.keys(erros).length"
        ref="resumo"
        class="aviso aviso-erro"
        role="alert"
        tabindex="-1"
      >
        <span class="icone" aria-hidden="true">✕</span>
        <div>
          <p><strong>Falta corrigir:</strong></p>
          <ul>
            <li v-for="(mensagem, campo) in erros" :key="campo">{{ mensagem }}</li>
          </ul>
          <p>Nada do que você digitou foi perdido.</p>
        </div>
      </div>

      <AppdAviso v-if="salvo" tipo="sucesso" titulo="Dados salvos">
        <span>As alterações foram gravadas.</span>
      </AppdAviso>

      <form novalidate @submit.prevent="salvar">
        <fieldset class="secao">
          <legend>Quem é você</legend>

          <div :class="['campo', 'largo', { 'campo-erro': erros.nome }]">
            <label for="nome"
              >Nome completo <span class="obrigatorio" aria-hidden="true">*</span></label
            >
            <input
              id="nome"
              v-model="f.nome"
              type="text"
              autocomplete="name"
              :aria-invalid="erros.nome ? 'true' : undefined"
              :aria-describedby="erros.nome ? 'erro-nome' : undefined"
            />
            <span v-if="erros.nome" id="erro-nome" class="erro">
              {{ erros.nome }}
            </span>
          </div>

          <!--
            Os três campos que não se alteram aparecem **preenchidos e travados**, e não
            como parágrafo explicando por que não se alteram (2026-08-20).

            `readonly`, não `disabled`: campo desabilitado sai da ordem de tabulação e
            costuma perder contraste, e estes existem para serem lidos — inclusive por
            quem confere o próprio cadastro com leitor de tela. `readonly` mantém o valor
            focável e legível, e continua recusando edição.

            A explicação de por que eles não mudam saiu junto: quem abre esta tela quer
            conferir os próprios dados, não ler o motivo de uma decisão de arquitetura.
          -->
          <div class="campo">
            <label for="email-fixo">E-mail</label>
            <input id="email-fixo" :value="conta?.email ?? ''" type="text" readonly />
          </div>

          <div class="campo">
            <label for="cpf-fixo">CPF</label>
            <input id="cpf-fixo" :value="mascaraCpf(conta?.cpf ?? '')" type="text" readonly />
          </div>

          <div class="campo">
            <label for="nascimento-fixo">Data de nascimento</label>
            <input id="nascimento-fixo" :value="nascimentoLegivel" type="text" readonly />
          </div>
        </fieldset>

        <fieldset class="secao">
          <legend>Como falar com você</legend>

          <div :class="['campo', { 'campo-erro': erros.telefone }]">
            <label for="telefone"
              >Telefone <span class="obrigatorio" aria-hidden="true">*</span></label
            >
            <span id="ajuda-telefone" class="ajuda">Com DDD. É por ele que vem o contato.</span>
            <input
              id="telefone"
              :value="f.telefone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              placeholder="+55 (00) 00000-0000"
              :aria-invalid="erros.telefone ? 'true' : undefined"
              :aria-describedby="erros.telefone ? 'erro-telefone' : 'ajuda-telefone'"
              @input="f.telefone = aplicarMascara($event, mascaraTelefone)"
            />
            <span v-if="erros.telefone" id="erro-telefone" class="erro">
              {{ erros.telefone }}
            </span>
          </div>

          <!--
            "Sim" e "Não" lado a lado (2026-08-20). Empilhavam porque a `legend` é item do
            mesmo flex do `fieldset` e consumia a linha; o invólucro devolve as duas
            opções à mesma faixa sem tirar a legenda do grupo, que é o que dá nome ao
            conjunto para o leitor de tela.
          -->
          <fieldset class="grupo-escolha em-linha">
            <legend>É WhatsApp <span class="obrigatorio" aria-hidden="true">*</span></legend>
            <div class="escolhas">
              <label class="escolha">
                <input v-model="f.whatsapp" type="radio" value="Sim" /> Sim
              </label>
              <label class="escolha">
                <input v-model="f.whatsapp" type="radio" value="Não" /> Não
              </label>
            </div>
          </fieldset>
        </fieldset>

        <fieldset class="secao">
          <legend>Onde você mora</legend>

          <div :class="['campo', { 'campo-erro': erros.cep }]">
            <label for="cep">CEP <span class="obrigatorio" aria-hidden="true">*</span></label>
            <span id="ajuda-cep" class="ajuda">Ao preencher, buscamos rua, bairro e cidade.</span>
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
            <!-- Mesmo aviso da tela de inscrição: trocar em silêncio é a pessoa descobrir depois. -->
            <span v-else-if="avisoSubstituicao" role="status" class="ajuda">
              {{ avisoSubstituicao }}
            </span>
          </div>

          <div :class="['campo', 'largo', { 'campo-erro': erros.endereco }]">
            <label for="endereco">
              Endereço (rua/avenida/travessa) <span class="obrigatorio" aria-hidden="true">*</span>
            </label>
            <input
              id="endereco"
              v-model="f.endereco"
              type="text"
              autocomplete="street-address"
              :aria-invalid="erros.endereco ? 'true' : undefined"
              :aria-describedby="erros.endereco ? 'erro-endereco' : undefined"
            />
            <span v-if="erros.endereco" id="erro-endereco" class="erro">
              {{ erros.endereco }}
            </span>
          </div>

          <div :class="['campo', { 'campo-erro': erros.numero }]">
            <label for="numero">Número <span class="obrigatorio" aria-hidden="true">*</span></label>
            <span id="ajuda-numero" class="ajuda">Sem número? Escreva "s/n".</span>
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
            <label for="complemento">Complemento</label>
            <span id="ajuda-complemento" class="ajuda">Apartamento, bloco, fundos. Opcional.</span>
            <input
              id="complemento"
              v-model="f.complemento"
              type="text"
              aria-describedby="ajuda-complemento"
            />
          </div>

          <div :class="['campo', { 'campo-erro': erros.bairro }]">
            <label for="bairro">Bairro <span class="obrigatorio" aria-hidden="true">*</span></label>
            <input
              id="bairro"
              v-model="f.bairro"
              type="text"
              :aria-invalid="erros.bairro ? 'true' : undefined"
              :aria-describedby="erros.bairro ? 'erro-bairro' : undefined"
            />
            <span v-if="erros.bairro" id="erro-bairro" class="erro">
              {{ erros.bairro }}
            </span>
          </div>

          <div :class="['campo', { 'campo-erro': erros.municipio }]">
            <label for="municipio">
              Município <span class="obrigatorio" aria-hidden="true">*</span>
            </label>
            <input
              id="municipio"
              v-model="f.municipio"
              type="text"
              :aria-invalid="erros.municipio ? 'true' : undefined"
              :aria-describedby="erros.municipio ? 'erro-municipio' : undefined"
            />
            <span v-if="erros.municipio" id="erro-municipio" class="erro">
              {{ erros.municipio }}
            </span>
          </div>

          <div :class="['campo', { 'campo-erro': erros.estado }]">
            <label for="estado">Estado <span class="obrigatorio" aria-hidden="true">*</span></label>
            <input
              id="estado"
              v-model="f.estado"
              type="text"
              autocomplete="address-level1"
              :aria-invalid="erros.estado ? 'true' : undefined"
              :aria-describedby="erros.estado ? 'erro-estado' : undefined"
            />
            <span v-if="erros.estado" id="erro-estado" class="erro">
              {{ erros.estado }}
            </span>
          </div>

          <div :class="['campo', { 'campo-erro': erros.pais }]">
            <label for="pais">País <span class="obrigatorio" aria-hidden="true">*</span></label>
            <input
              id="pais"
              v-model="f.pais"
              type="text"
              autocomplete="country-name"
              :aria-invalid="erros.pais ? 'true' : undefined"
              :aria-describedby="erros.pais ? 'erro-pais' : undefined"
            />
            <span v-if="erros.pais" id="erro-pais" class="erro">
              {{ erros.pais }}
            </span>
          </div>
        </fieldset>

        <div class="acoes">
          <button type="submit" class="botao botao-primario" :disabled="salvando || !alterado">
            {{ salvando ? 'Salvando…' : 'Salvar alterações' }}
          </button>
          <NuxtLink class="botao botao-secundario" to="/area">Voltar para a minha área</NuxtLink>
        </div>
      </form>
    </template>
  </div>
</template>

<style scoped>
/*
  A coluna vem de `.area-moldura`, em base.css.

  Esta regra declarava `display: flex; flex-direction: column`, e o estilo com escopo da
  página carrega depois do base — mesma especificidade, cascata a favor dela. O resultado
  era o menu na esquerda e o conteúdo embaixo dele, em vez de ao lado. O que sobra aqui é
  só o que é da tela; a forma da área é da moldura.
*/
.secao {
  border: 1px solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e3);
  margin-bottom: var(--e4);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--e3);
}
.secao > legend {
  font-weight: 700;
  font-size: var(--texto-corpo-g);
  padding-inline: var(--e2);
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.largo {
  grid-column: 1 / -1;
}
.rotulo-fixo {
  font-weight: 700;
}
.grupo-escolha {
  border: 0;
  padding: 0;
  margin: 0;
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}
</style>
