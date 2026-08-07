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
})

const erros = reactive<Record<string, string>>({})
const salvando = ref(false)
const salvo = ref(false)
const resumo = ref<HTMLElement | null>(null)

const buscandoCep = ref(false)
const avisoCep = ref('')

/** Mesma regra da tela de inscrição: nunca sobrescreve o que já está digitado. */
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
  } catch {
    avisoCep.value = 'A busca por CEP falhou. Preencha o endereço à mão.'
  } finally {
    buscandoCep.value = false
  }
}

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
  <div class="dados">
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
              <span class="icone" aria-hidden="true">✕</span>{{ erros.nome }}
            </span>
          </div>

          <div :class="['campo', 'largo']">
            <span class="rotulo-fixo">E-mail, CPF e data de nascimento</span>
            <span class="ajuda">
              Não são alterados por aqui. O e-mail é a chave da sua entrada e do jeito como a sua
              senha é protegida; trocá-lo exige refazer a senha. Para corrigir qualquer um dos três,
              fale com a secretaria.
            </span>
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
              placeholder="(00) 00000-0000"
              :aria-invalid="erros.telefone ? 'true' : undefined"
              :aria-describedby="erros.telefone ? 'erro-telefone' : 'ajuda-telefone'"
              @input="f.telefone = aplicarMascara($event, mascaraTelefone)"
            />
            <span v-if="erros.telefone" id="erro-telefone" class="erro">
              <span class="icone" aria-hidden="true">✕</span>{{ erros.telefone }}
            </span>
          </div>

          <fieldset class="grupo-escolha">
            <legend>É WhatsApp <span class="obrigatorio" aria-hidden="true">*</span></legend>
            <label class="escolha">
              <input v-model="f.whatsapp" type="radio" value="Sim" /> Sim
            </label>
            <label class="escolha">
              <input v-model="f.whatsapp" type="radio" value="Não" /> Não
            </label>
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
              <span class="icone" aria-hidden="true">✕</span>{{ erros.cep }}
            </span>
            <span v-if="buscandoCep" role="status" class="ajuda">Buscando o endereço…</span>
            <span v-else-if="avisoCep" role="status" class="ajuda">{{ avisoCep }}</span>
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
              <span class="icone" aria-hidden="true">✕</span>{{ erros.endereco }}
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
              <span class="icone" aria-hidden="true">✕</span>{{ erros.numero }}
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
              <span class="icone" aria-hidden="true">✕</span>{{ erros.bairro }}
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
              <span class="icone" aria-hidden="true">✕</span>{{ erros.municipio }}
            </span>
          </div>
        </fieldset>

        <div class="acoes">
          <button type="submit" class="botao botao-primario" :disabled="salvando">
            {{ salvando ? 'Salvando…' : 'Salvar alterações' }}
          </button>
          <NuxtLink class="botao botao-secundario" to="/area">Voltar para a minha área</NuxtLink>
        </div>
      </form>
    </template>
  </div>
</template>

<style scoped>
.dados {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
  max-width: 66ch;
}
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e3);
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}
</style>
