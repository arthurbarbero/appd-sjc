<script setup lang="ts">
import { ASSOCIACAO, enderecoEmLinha } from '~~/shared/conteudo'
import { baixarPdf, baixarPng, type DadosCracha } from '~/utils/cracha-arquivo'

/*
  `/area/cracha` — a pessoa gera o próprio crachá, baixa e imprime.

  Desenho aprovado no Claude Design em 2026-08-07 (`templates/cracha/`), com as correções
  de `docs/handoff-design-cracha.md`.

  **Liberação imediata** (ADR-004, REQ-27): o crachá fica pronto assim que a foto é aceita.
  Nenhum estado de "em análise", "aguardando aprovação" ou selo de validação — a APPD não
  opera moderação, e prometer revisão seria a mesma promessa vazia da fila de vagas.

  **O arquivo é gerado aqui, no aparelho** (REQ-23). Nada é enviado para fora na
  exportação, e a tela diz isso em texto de corpo normal (REQ-24).
*/

useHead({ title: 'Meu crachá — APPD São José dos Campos' })

const sede = ASSOCIACAO.telefones[0]!
const origem = useRequestURL().origin

const { data, pending, error, refresh } = await useFetch('/api/area/cracha')

const enviandoFoto = ref<Blob | null>(null)
const salvandoFoto = ref(false)
const erroEnvio = ref('')
const exportando = ref('')
const erroExportar = ref('')
const impressao = ref(false)

const temFoto = computed(() => Boolean(data.value?.foto))
const urlVerificacao = computed(() => `${origem}/verificar/${data.value?.numeroRegistro ?? ''}`)

const dadosCracha = computed<DadosCracha>(() => ({
  nome: data.value?.nome ?? '',
  numeroRegistro: data.value?.numeroRegistro ?? '',
  situacao: data.value?.situacao ?? 'ativo',
  foto: data.value?.foto ?? null,
  deficiencias: data.value?.deficiencias ?? [],
  urlVerificacao: urlVerificacao.value,
  associacao: {
    nome: ASSOCIACAO.nome,
    endereco: enderecoEmLinha,
    cnpj: ASSOCIACAO.cnpj,
    telefone: sede.numero,
  },
}))

/**
 * Sobe a foto recortada pelo componente.
 *
 * Falha de rede **preserva o recorte** (T3.6): o blob continua em `enviandoFoto`, e a tela
 * oferece "Tentar de novo" em vez de mandar a pessoa recortar tudo outra vez. Recortar de
 * novo, no público deste site, é o passo em que se desiste.
 */
async function enviarFoto() {
  const blob = enviandoFoto.value
  if (!blob) return
  salvandoFoto.value = true
  erroEnvio.value = ''
  try {
    await $fetch('/api/area/foto', {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'image/jpeg' },
    })
    enviandoFoto.value = null
    await refresh()
  } catch {
    erroEnvio.value =
      'Não conseguimos enviar a foto agora. Seu recorte continua aqui — tente de novo em instantes.'
  } finally {
    salvandoFoto.value = false
  }
}

watch(enviandoFoto, (blob) => {
  if (blob) enviarFoto()
})

const confirmacaoOptIn = ref('')
const erroOptIn = ref('')

/**
 * Grava a escolha de imprimir o tipo de deficiência no crachá.
 *
 * É consentimento para expor dado sensível do Art. 11 num documento que qualquer pessoa
 * vê, e por isso a tela **confirma que gravou** em vez de deixar a caixa marcada sem
 * garantia. Se a gravação falhar, a caixa volta ao valor real: caixa que mostra um estado
 * que o banco não tem é a pior falha possível aqui — a pessoa acharia que escolheu.
 */
async function alternarOptIn(evento: Event) {
  const caixa = evento.target as HTMLInputElement
  const marcado = caixa.checked
  confirmacaoOptIn.value = ''
  erroOptIn.value = ''
  try {
    await $fetch('/api/area/cracha', { method: 'PUT', body: { mostraDeficiencia: marcado } })
    await refresh()
    confirmacaoOptIn.value = marcado
      ? 'Escolha guardada: o tipo de deficiência passa a aparecer no crachá e na página pública de verificação.'
      : 'Escolha guardada: o tipo de deficiência não aparece no crachá nem na página pública.'
  } catch {
    caixa.checked = !marcado
    erroOptIn.value = 'Não conseguimos guardar a sua escolha agora. Nada mudou — tente de novo.'
  }
}

async function exportar(formato: 'png' | 'pdf') {
  exportando.value = formato
  erroExportar.value = ''
  try {
    await (formato === 'png' ? baixarPng : baixarPdf)(dadosCracha.value)
  } catch {
    erroExportar.value =
      'Não conseguimos gerar o arquivo neste navegador. Tente por outro, ou use a opção de imprimir.'
  } finally {
    exportando.value = ''
  }
}
</script>

<template>
  <div class="pagina-cracha">
    <h1>Meu crachá</h1>
    <p class="chamada">
      Seu crachá fica pronto assim que você envia a foto. Você mesmo baixa e imprime.
    </p>

    <AreaNavegacao atual="cracha" />

    <p v-if="pending" role="status" class="carregando">Carregando o seu crachá…</p>

    <AppdAviso v-else-if="error" tipo="erro" titulo="Não conseguimos carregar">
      <span>
        Tente recarregar a página. Se continuar, ligue para
        <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
        >.
      </span>
    </AppdAviso>

    <template v-else-if="data">
      <div aria-live="polite">
        <!-- Estado 1 — sem foto ainda -->
        <section v-if="!temFoto" class="sem-foto-bloco">
          <h2>Falta a sua foto para o crachá ficar pronto</h2>
          <AppdFoto v-model="enviandoFoto" rotulo="Foto para o crachá" />
        </section>

        <p v-if="salvandoFoto" role="status" class="carregando">Guardando a sua foto…</p>

        <!-- T3.6: o recorte não se perde quando a rede falha -->
        <AppdAviso v-if="erroEnvio" tipo="erro" titulo="A foto não subiu">
          <span>{{ erroEnvio }}</span>
          <button type="button" class="botao botao-primario" @click="enviarFoto">
            Tentar de novo
          </button>
        </AppdAviso>

        <!-- Estado 5 — crachá pronto -->
        <div v-if="temFoto" class="lados">
          <figure>
            <figcaption>Frente</figcaption>
            <AppdCracha
              lado="frente"
              :nome="data.nome ?? ''"
              :numero-registro="data.numeroRegistro"
              :situacao="data.situacao"
              :foto="data.foto"
              :deficiencias="data.deficiencias"
              :url-verificacao="urlVerificacao"
            />
          </figure>
          <figure>
            <figcaption>Verso</figcaption>
            <AppdCracha
              lado="verso"
              :nome="data.nome ?? ''"
              :numero-registro="data.numeroRegistro"
              :situacao="data.situacao"
              :url-verificacao="urlVerificacao"
            />
          </figure>
        </div>
      </div>

      <!-- Ações de baixar -->
      <div class="acoes-baixar">
        <template v-if="temFoto">
          <button
            type="button"
            class="botao botao-primario"
            :disabled="Boolean(exportando)"
            @click="exportar('png')"
          >
            {{ exportando === 'png' ? 'Gerando…' : 'Baixar em PNG' }}
          </button>
          <button
            type="button"
            class="botao botao-secundario"
            :disabled="Boolean(exportando)"
            @click="exportar('pdf')"
          >
            {{ exportando === 'pdf' ? 'Gerando…' : 'Baixar em PDF' }}
          </button>
          <button type="button" class="botao botao-secundario" @click="impressao = !impressao">
            {{ impressao ? 'Esconder' : 'Ver como fica impresso' }}
          </button>
        </template>

        <!-- Estado desabilitado sempre com o motivo escrito ao lado (REQ-8, T4.6) -->
        <template v-else>
          <button type="button" class="botao botao-primario" disabled aria-describedby="motivo">
            Baixar em PNG
          </button>
          <button type="button" class="botao botao-secundario" disabled aria-describedby="motivo">
            Baixar em PDF
          </button>
          <p id="motivo" class="motivo">Para baixar, primeiro envie a sua foto.</p>
        </template>
      </div>

      <AppdAviso v-if="erroExportar" tipo="erro" titulo="Não deu para gerar o arquivo">
        <span>{{ erroExportar }}</span>
      </AppdAviso>

      <!-- REQ-24: em corpo normal, não em nota de rodapé -->
      <p class="local">O arquivo é gerado aqui no seu navegador. Nada é enviado para fora.</p>

      <!-- Estado 6 — pré-visualização de impressão -->
      <section v-if="impressao && temFoto" class="impressao" aria-labelledby="t-impressao">
        <h2 id="t-impressao">Como fica impresso</h2>
        <p class="atencao-impressao">
          Imprima em 100%. Não use a opção de ajustar à página, senão o crachá sai menor que o
          tamanho certo.
        </p>
        <!--
          `tabindex="0"` porque a folha A4 rola na horizontal em tela estreita, e região
          que rola sem receber foco é intransponível para quem não usa mouse — a régua é a
          `scrollable-region-focusable` do axe, que reprovou aqui a 360 px.
        -->
        <div
          class="rolagem-folha"
          tabindex="0"
          role="group"
          aria-label="Folha A4 com o crachá em tamanho real"
        >
          <div class="folha">
            <div class="corte">
              <AppdCracha
                lado="frente"
                :nome="data.nome ?? ''"
                :numero-registro="data.numeroRegistro"
                :situacao="data.situacao"
                :foto="data.foto"
                :deficiencias="data.deficiencias"
                :url-verificacao="urlVerificacao"
              />
            </div>
            <div class="corte">
              <AppdCracha
                lado="verso"
                :nome="data.nome ?? ''"
                :numero-registro="data.numeroRegistro"
                :situacao="data.situacao"
                :url-verificacao="urlVerificacao"
              />
            </div>
          </div>
        </div>
      </section>

      <!--
        REQ-25: caixa única, separada das demais, desmarcada por padrão. O texto descreve
        só a consequência de marcar e a de não marcar — nada de "recomendado", "ajuda" ou
        "facilita", nada de emoji, nada de cor de ação.
      -->
      <section class="cartao opt-in" aria-labelledby="t-aparece">
        <h2 id="t-aparece">O que aparece no meu crachá</h2>
        <p>
          Estão impressos o seu nome, o número de registro, a situação do cadastro, a sua foto e o
          QR Code de verificação.
        </p>

        <div class="escolha-optin">
          <!--
            A situação de agora, escrita antes da caixa. Sem ela, quem chega precisa inferir
            a própria escolha do estado de um controle — e é justamente isso que fica ambíguo
            para quem usa leitor de tela ou tem dificuldade de leitura, que é parte do
            público deste site.
          -->
          <p class="estado-atual">
            <strong
              >Hoje o seu crachá {{ data.mostraDeficiencia ? 'mostra' : 'não mostra' }}</strong
            >
            o seu tipo de deficiência.
          </p>

          <label class="escolha" for="optin-deficiencia">
            <input
              id="optin-deficiencia"
              type="checkbox"
              :checked="data.mostraDeficiencia"
              aria-describedby="consequencias"
              @change="alternarOptIn"
            />
            <span>Mostrar o meu tipo de deficiência no crachá</span>
          </label>

          <div id="consequencias">
            <!--
              Esta redação mudou em 2026-08-07 com o ADR-019, e a mudança não é cosmética:
              antes ela prometia que a página pública nunca mostraria. Consentimento colhido
              com informação errada não é consentimento — o texto precisa dizer os **dois**
              destinos, sem rodeio e sem letra miúda.
            -->
            <p>
              Se você marcar, a palavra Física, Intelectual ou Neurodivergentes, Sensorial (visão,
              audição, fala) ou Outro passa a aparecer em <strong>dois lugares</strong>: impressa na
              frente do crachá, visível para quem vir o documento, e na
              <strong>página de verificação, que é pública</strong> — qualquer pessoa com o seu
              número de registro abre e vê.
            </p>
            <p>
              Se você não marcar, essa informação não aparece em nenhum dos dois. É assim que a sua
              conta começa, e continua assim até você mudar.
            </p>
            <p>
              A sua escolha fica <strong>guardada na sua conta</strong> e vale a partir de agora, no
              crachá e na página pública. Você pode mudá-la aqui quando quiser, e desmarcar tira dos
              dois lugares na hora.
            </p>
          </div>

          <p v-if="confirmacaoOptIn" class="confirmacao" role="status">{{ confirmacaoOptIn }}</p>
          <p v-if="erroOptIn" class="erro" role="alert">{{ erroOptIn }}</p>
        </div>
      </section>

      <div class="rodape-cracha">
        <p>
          Não consegue imprimir? Fale com a associação:
          <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
          >.
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pagina-cracha {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}

.chamada {
  font-size: var(--texto-corpo-g);
  max-width: 56ch;
}

.sem-foto-bloco {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

.lados {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e5);
}

figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

figcaption {
  font-size: var(--texto-rotulo);
  font-weight: var(--peso-forte);
  color: var(--texto-suave);
}

.acoes-baixar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e3);
}

.motivo {
  margin: 0;
  max-width: 32ch;
}

.local {
  margin: 0;
  color: var(--texto-suave);
  max-width: 40ch;
}

.atencao-impressao {
  font-weight: var(--peso-forte);
  max-width: 52ch;
}

.rolagem-folha {
  overflow-x: auto;
  padding-bottom: var(--e2);
}

.folha {
  width: 210mm;
  height: 297mm;
  background: #fff;
  border: 1px solid var(--borda-suave);
  box-shadow: var(--sombra-2);
  padding: 20mm;
  box-sizing: border-box;
  display: flex;
  gap: 10mm;
  align-items: flex-start;
}

/* Marcas de corte finas, para saber onde cortar sem invadir o cartão. */
.corte {
  position: relative;
}

.corte::before,
.corte::after {
  content: '';
  position: absolute;
  background: var(--texto);
}

.corte::before {
  left: -6mm;
  top: 0;
  width: 4mm;
  height: 1px;
}

.corte::after {
  left: -6mm;
  bottom: 0;
  width: 4mm;
  height: 1px;
}

.escolha-optin {
  border-top: 1px solid var(--borda-suave);
  padding-top: var(--e3);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.escolha-optin p {
  max-width: 60ch;
}

#consequencias {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.estado-atual {
  font-size: var(--texto-corpo-g);
}

.confirmacao {
  color: var(--verde);
  font-weight: var(--peso-forte);
}
</style>
