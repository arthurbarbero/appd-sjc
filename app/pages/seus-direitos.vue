<script setup lang="ts">
import { ASSOCIACAO } from '~~/shared/conteudo'
import { semConsentimento } from '~~/shared/inscricao'

/*
  Seus direitos — T9 e T10 de `consentimento-e-privacidade`.

  Desenho aprovado no Claude Design (`templates/direitos/Direitos.dc.html`), com as
  correções de `docs/handoff-design-privacidade.md`.

  A página é **pública**: quem chega pelo rodapé sem conta precisa ver quais são os
  direitos e por onde pedir. O bloco com os dados só aparece para quem tem sessão — e não
  é "estado de erro" para quem não tem, é o caminho de entrar.
*/

const sessao = useUserSession()
const sede = ASSOCIACAO.telefones[0]!

const { data: copia, refresh } = await useFetch('/api/area/copia', {
  // A rota exige sessão. Pedir sem ela devolveria 401 e sujaria o console de quem só veio
  // ler a página — o dado aparece quando há a quem mostrar.
  immediate: sessao.loggedIn.value,
  watch: [sessao.loggedIn],
})

const retirado = computed(() => !!copia.value?.inscricao?.consentimentoRetirado)

const deficienciasEmTexto = computed(() => {
  const lista = copia.value?.inscricao?.deficiencias ?? []
  if (!lista.length) return 'Não informado'
  // A palavra do estado não é um tipo de deficiência, e a tela não a exibe como se fosse.
  if (semConsentimento(lista)) return 'Não informado — consentimento retirado'
  return lista.join(', ')
})

/** Data e hora como a pessoa lê, a partir do ISO em UTC que o banco guarda. */
function quando(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const EVENTOS: Record<string, string> = {
  aceite: 'Autorizou',
  revogacao: 'Retirou a autorização',
}

/*
  Três estados, na mesma página: pedido, confirmação e feito. Dois cliques do cartão ao
  concluído (REQ-13) — tela intermediária aqui seria transformar um direito em percurso.
*/
const etapa = ref<'inicio' | 'confirmando' | 'feito'>('inicio')
const salvando = ref(false)
const erro = ref('')

async function retirar() {
  salvando.value = true
  erro.value = ''
  try {
    await $fetch('/api/area/consentimento', { method: 'POST', body: { revogar: true } })
    await refresh()
    etapa.value = 'feito'
  } catch {
    erro.value = 'Não deu para concluir agora. Tente de novo, ou ligue para a associação.'
    etapa.value = 'inicio'
  } finally {
    salvando.value = false
  }
}

function baixarCopia() {
  const conteudo = JSON.stringify(copia.value, null, 2)
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `meus-dados-appd-${copia.value?.pessoa.numeroRegistro ?? 'appd'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const DIREITOS = [
  {
    titulo: 'Saber se a APPD tem dados seus',
    texto: 'A associação confirma se existe um cadastro no seu nome.',
    acao: 'Confirmar meu cadastro',
    destino: '#meus-dados',
  },
  {
    titulo: 'Ver os seus dados',
    texto: 'Tudo o que está guardado, na tela, sem intermediário.',
    acao: 'Ver os meus dados',
    destino: '#meus-dados',
  },
  {
    titulo: 'Corrigir dado errado',
    texto: 'Nome, telefone, endereço ou qualquer campo desatualizado.',
    acao: 'Pedir correção',
    destino: '/area/dados',
  },
  {
    titulo: 'Pedir cópia para levar a outro lugar',
    texto: 'Um arquivo com os seus dados, em formato que outro serviço lê.',
    acao: 'Pedir cópia dos meus dados',
    destino: '#meus-dados',
  },
  {
    titulo: 'Saber com quem foi compartilhado',
    texto: 'Hoje a resposta é: com ninguém fora da associação.',
    acao: 'Ver o compartilhamento',
    destino: '/privacidade#compartilhamento',
  },
  {
    titulo: 'Retirar o consentimento do dado de deficiência',
    texto: 'Sem apagar a sua conta. Explicado no bloco abaixo.',
    acao: 'Ir para a retirada',
    destino: '#consentimento',
  },
]

useHead({
  title: 'Seus direitos sobre os seus dados — APPD São José dos Campos',
  meta: [
    {
      name: 'description',
      content:
        'Confira, corrija, peça cópia ou apague a sua informação na APPD. Como pedir, por onde, e o que a lei garante.',
    },
  ],
})
</script>

<template>
  <div class="direitos">
    <header class="topo">
      <h1>Seus direitos sobre os seus dados</h1>
      <p class="lide">
        Você pode conferir, corrigir, pedir cópia ou apagar a sua informação. Aqui está como.
      </p>
      <p><NuxtLink to="/privacidade">Ler a Política de Privacidade</NuxtLink></p>
    </header>

    <section aria-labelledby="como-pedir">
      <h2 id="como-pedir">Como pedir</h2>
      <div class="canais">
        <div class="cartao">
          <h3>Pela sua área</h3>
          <p>Quem tem conta resolve sozinho, na hora.</p>
          <p class="rodape-cartao">
            <NuxtLink to="/area">Entrar na área do associado</NuxtLink>
          </p>
        </div>
        <div class="cartao">
          <h3>Por telefone</h3>
          <p>De segunda a sexta, no horário da associação.</p>
          <p class="rodape-cartao">
            <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a>
          </p>
        </div>
        <div class="cartao">
          <h3>Por e-mail</h3>
          <p>Escreva o seu nome completo e o número de registro, se tiver.</p>
          <p class="rodape-cartao">
            <a :href="`mailto:${ASSOCIACAO.email}`">{{ ASSOCIACAO.email }}</a>
          </p>
        </div>
      </div>

      <p class="pendencia">Quem responde e em quanto tempo: <AppdSelo /></p>
      <p class="prazo">
        A LGPD dá uma referência: o pedido para
        <strong>confirmar que existem dados seus e ter acesso a eles</strong> é respondido de
        imediato, em formato simplificado, ou em até 15 dias, em declaração completa. Esse prazo
        vale para esse direito, não para todos. O compromisso da associação para os demais pedidos
        vai ser publicado aqui.
      </p>
    </section>

    <section aria-labelledby="direitos">
      <h2 id="direitos">O que você pode pedir</h2>
      <div class="lista-direitos">
        <div v-for="direito in DIREITOS" :key="direito.titulo" class="cartao">
          <h3>{{ direito.titulo }}</h3>
          <p>{{ direito.texto }}</p>
          <p class="rodape-cartao">
            <NuxtLink
              v-if="direito.destino.startsWith('/')"
              :to="direito.destino"
              class="botao botao-secundario"
            >
              {{ direito.acao }}
            </NuxtLink>
            <a v-else :href="direito.destino" class="botao botao-secundario">{{ direito.acao }}</a>
          </p>
        </div>
      </div>
    </section>

    <section id="meus-dados" aria-labelledby="titulo-meus-dados" tabindex="-1">
      <h2 id="titulo-meus-dados">Os seus dados guardados</h2>

      <AppdAviso v-if="!sessao.loggedIn.value" tipo="atencao" titulo="Entre para ver os seus dados">
        <span>
          Esta parte mostra o que a associação guarda sobre você, e por isso só aparece depois de
          você entrar. <NuxtLink to="/entrar">Entrar na minha conta</NuxtLink>
        </span>
      </AppdAviso>

      <div v-else-if="copia" class="painel">
        <dl class="campos">
          <div>
            <dt>Nome</dt>
            <dd>{{ copia.pessoa.nome ?? '—' }}</dd>
          </div>
          <div>
            <dt>Número de registro</dt>
            <dd class="numeros">{{ copia.pessoa.numeroRegistro }}</dd>
          </div>
          <div>
            <dt>Data de nascimento</dt>
            <dd class="numeros">{{ copia.pessoa.nascimento ?? '—' }}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd class="numeros">{{ copia.pessoa.telefone ?? '—' }}</dd>
          </div>
          <div>
            <dt>E-mail de acesso</dt>
            <dd>{{ copia.pessoa.email ?? '—' }}</dd>
          </div>
          <div>
            <dt>Endereço</dt>
            <dd>
              {{ copia.pessoa.endereco ?? '—'
              }}{{ copia.pessoa.numero ? `, ${copia.pessoa.numero}` : '' }}
            </dd>
          </div>
          <div>
            <dt>Cuidador</dt>
            <dd>{{ copia.pessoa.cuidadorNome ?? 'Não informado' }}</dd>
          </div>
          <div>
            <dt>Tipo de deficiência</dt>
            <dd>{{ deficienciasEmTexto }}</dd>
          </div>
        </dl>

        <div v-if="copia.foto" class="linha-foto">
          <div>
            <p class="rotulo">Foto do crachá</p>
            <p>Guardada só para o crachá. Ela não tem endereço público.</p>
          </div>
          <a class="botao botao-secundario" :href="copia.foto.baixarEm" download>
            Baixar a minha foto
          </a>
        </div>

        <div class="historico">
          <h3>Histórico de consentimento</h3>
          <p v-if="!copia.consentimentos.length">Nenhum evento registrado ainda.</p>
          <div v-else class="rolagem">
            <table>
              <thead>
                <tr>
                  <th scope="col">Evento</th>
                  <th scope="col">Versão do termo</th>
                  <th scope="col">Data e hora</th>
                  <th scope="col">Impressão digital do texto</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="evento in copia.consentimentos"
                  :key="evento.registradoEm + evento.evento"
                >
                  <td>{{ EVENTOS[evento.evento] ?? evento.evento }}</td>
                  <td class="numeros">Versão {{ evento.versao.replace('v', '') }}</td>
                  <td class="numeros">{{ quando(evento.registradoEm) }}</td>
                  <!--
                    O hash inteiro tem 64 caracteres e não cabe em tela de celular. Encurtar
                    é decisão de leitura, não de dado: o valor completo vai inteiro no
                    arquivo que o botão abaixo baixa.
                  -->
                  <td class="digital">
                    <span :title="evento.hash">{{ evento.hash.slice(0, 12) }}…</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="baixar">
          <button type="button" class="botao botao-primario" @click="baixarCopia">
            Baixar em arquivo
          </button>
          <span class="explicacao">
            Vem tudo o que está nesta tela, mais o histórico completo de consentimento, com a
            impressão digital sem encurtar.
          </span>
        </div>
      </div>
    </section>

    <section
      id="consentimento"
      class="destaque"
      aria-labelledby="titulo-consentimento"
      tabindex="-1"
    >
      <h2 id="titulo-consentimento">Retirar o consentimento do dado de deficiência</h2>
      <p>
        Sem esse dado, a associação pode não conseguir organizar o seu atendimento com a equipe
        certa. Retirar o consentimento não apaga a sua conta e não cancela o seu crachá.
      </p>
      <p>Você pode informar de novo depois, quando quiser, na sua área.</p>

      <AppdAviso v-if="!sessao.loggedIn.value" tipo="atencao" titulo="Entre para retirar">
        <span>
          A retirada é feita na sua conta. <NuxtLink to="/entrar">Entrar</NuxtLink>, ou ligue para
          <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a> e peça pelo telefone.
        </span>
      </AppdAviso>

      <!--
        A região é `aria-live` porque os três estados se sucedem no mesmo lugar: sem isso,
        quem usa leitor de tela clica em "Retirar" e nada é anunciado (REQ-29).
      -->
      <div v-else aria-live="polite" class="estados">
        <AppdAviso v-if="retirado && etapa !== 'feito'" tipo="sucesso" titulo="Já está retirado">
          <span>
            O tipo de deficiência não está mais guardado no seu cadastro. O histórico acima mostra
            quando você retirou.
          </span>
        </AppdAviso>

        <template v-else-if="etapa === 'inicio'">
          <p v-if="erro" class="erro"><span aria-hidden="true">✕</span> {{ erro }}</p>
          <div class="acoes">
            <button type="button" class="botao botao-secundario" @click="etapa = 'confirmando'">
              Retirar o consentimento
            </button>
            <span class="explicacao">São dois cliques: este e a confirmação.</span>
          </div>
        </template>

        <div v-else-if="etapa === 'confirmando'" class="confirmar">
          <p class="pergunta">Confirma a retirada?</p>
          <p>
            O tipo de deficiência sai do seu cadastro, do crachá e da página pública de verificação.
            A sua conta continua.
          </p>
          <div class="acoes">
            <button
              type="button"
              class="botao botao-primario"
              :disabled="salvando"
              @click="retirar"
            >
              {{ salvando ? 'Retirando…' : 'Confirmar a retirada' }}
            </button>
            <button type="button" class="botao botao-secundario" @click="etapa = 'inicio'">
              Cancelar
            </button>
          </div>
        </div>

        <AppdAviso v-else tipo="sucesso" titulo="Consentimento retirado.">
          <span>
            O tipo de deficiência saiu do seu cadastro agora. A retirada entrou no histórico acima,
            com data e hora. Você pode informar de novo quando quiser, na sua área.
          </span>
        </AppdAviso>
      </div>
    </section>

    <section aria-labelledby="excluir" class="excluir">
      <h2 id="excluir">Apagar os seus dados</h2>
      <p>
        Você pede, e os seus dados saem na hora. Fica só o número de registro sem nada ligado a ele,
        para que um crachá antigo não passe a identificar outra pessoa.
      </p>
      <p>
        <NuxtLink to="/area/excluir" class="botao botao-destrutivo">Excluir meus dados</NuxtLink>
      </p>
      <p class="explicacao">
        Prefere falar com uma pessoa? Ligue para <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
        >.
      </p>
    </section>
  </div>
</template>

<style scoped>
.direitos {
  display: flex;
  flex-direction: column;
  gap: var(--e6);
}

.direitos > section {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.topo {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  max-width: var(--medida);
}

.direitos p,
.direitos dd {
  max-width: var(--medida);
}

.canais,
.lista-direitos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--e3);
}

.pendencia {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e2);
}

.painel {
  background: var(--superficie);
  border: 1px solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e5);
}

.campos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--e4);
  margin: 0;
}

.campos dt,
.rotulo {
  font-size: var(--texto-rotulo);
  font-weight: var(--peso-forte);
  color: var(--texto-suave);
}

.campos dd {
  margin: 0;
  font-size: var(--texto-corpo-g);
}

.numeros {
  font-variant-numeric: tabular-nums;
}

.linha-foto,
.baixar,
.acoes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e3);
}

.historico {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.digital {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--texto-rotulo);
  white-space: nowrap;
}

.explicacao {
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
}

.destaque {
  border-left: 4px solid var(--primaria);
  padding-left: var(--e4);
}

.estados {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.confirmar {
  background: var(--aviso-fundo);
  border: 1px solid var(--aviso);
  border-left: 4px solid var(--aviso);
  border-radius: var(--raio);
  padding: var(--e4);
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.pergunta {
  color: var(--aviso);
  font-weight: var(--peso-forte);
}

.erro {
  color: var(--erro);
  font-weight: var(--peso-forte);
}

.excluir {
  border-top: 1px solid var(--borda-suave);
  padding-top: var(--e5);
}
</style>
