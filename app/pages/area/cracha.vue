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

const temFoto = computed(() => Boolean(data.value?.foto))

/** Abre o recorte para quem já tem foto. Fecha sozinho quando a nova foto entra. */
const trocandoFoto = ref(false)
const tituloDaTroca = ref('Mudar a minha foto')

/*
  A rota que serve a foto guardada, para o recorte poder reabri-la. Constante e não
  literal: com o caminho cru no atributo, o Vite tenta resolvê-lo como asset em tempo de
  build e o `npm run build` falha enquanto o dev passa.
*/
const ROTA_FOTO = '/api/area/foto'
const campoFoto = ref<{ editarAtual: () => Promise<void> } | null>(null)

/** Abre o recorte já carregado com a foto atual, sem passar pelo seletor de arquivo. */
async function ajustarFoto() {
  trocandoFoto.value = true
  await nextTick()
  await campoFoto.value?.editarAtual()
}
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
    // Só recolhe o bloco de troca quando a foto nova entrou de verdade: em caso de erro,
    // o recorte precisa continuar na tela para a pessoa tentar de novo.
    trocandoFoto.value = false
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

/**
 * O opt-in de imprimir o CID.
 *
 * Espelha `alternarOptIn` de propósito, inclusive na volta da caixa quando a gravação
 * falha: caixa que mostra um estado que o banco não tem é a pior falha possível aqui,
 * porque a pessoa acharia que escolheu.
 *
 * O texto de confirmação diz o que **não** muda, e não é redundância: a diferença entre
 * este opt-in e o do tipo de deficiência é justamente que aquele também libera a página
 * pública, e este nunca (ADR-020).
 */
async function alternarCidNoCracha(evento: Event) {
  const caixa = evento.target as HTMLInputElement
  const marcado = caixa.checked
  confirmacaoOptIn.value = ''
  erroOptIn.value = ''
  try {
    await $fetch('/api/area/cracha', { method: 'PUT', body: { cidNoCracha: marcado } })
    await refresh()
    confirmacaoOptIn.value = marcado
      ? 'Escolha guardada: o CID passa a aparecer no crachá. Ele continua fora da página pública.'
      : 'Escolha guardada: o CID não aparece no crachá.'
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
  <div class="pagina-cracha area-moldura">
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

        <!--
          Estado 1b — trocar a foto que já existe (2026-08-21).

          Até aqui o envio de foto só era montado quando **não** havia foto: quem já tinha
          enviado a sua não tinha caminho nenhum para trocá-la, e o dono topou com isso ao
          tentar conferir o recorte. Errar a foto uma vez condenava a pessoa àquela foto.

          Fica fechado por padrão, e não aberto: a tela é sobre o crachá pronto, e um
          seletor de arquivo permanentemente aberto no alto sugere que algo está faltando.
        -->
        <section v-else class="trocar-bloco">
          <!--
            Dois caminhos, porque são duas intenções diferentes (2026-08-21).

            **Ajustar** trabalha sobre a foto que já está guardada: serve para centralizar
            o rosto ou aproximar, sem precisar caçar o arquivo original no aparelho — que
            muitas vezes já nem existe mais.

            **Trocar** pede um arquivo novo, e é o único caminho quando a foto em si é a
            errada.

            Separá-los é o que evita a pergunta que o dono fez ao tentar mexer na foto:
            um botão só, chamado "trocar", não parece prometer reenquadramento.
          -->
          <!--
            Um botão só, e não dois (2026-08-21).

            "Ajustar o enquadramento" e "Trocar a minha foto" eram duas portas para a mesma
            sala: o recorte. O dono viu isso na hora — "pode ser o mesmo botão" —, e ele
            tem razão, porque a diferença entre as duas nunca foi de intenção, e sim de
            **onde a imagem vem**. Agora quem decide isso é o recorte: ele abre com a foto
            de agora, e lá dentro há "Escolher outra imagem" para quem quer outra.

            O caminho curto também ficou mais curto: reenquadrar era o caso comum e exigia
            escolher entre dois botões antes de qualquer coisa.
          -->
          <button
            v-if="!trocandoFoto"
            type="button"
            class="botao botao-secundario compacto"
            @click="ajustarFoto"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path
                d="M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3m-8 0H5a1 1 0 0 1-1-1v-3"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            Mudar a minha foto
          </button>

          <template v-else>
            <h2>{{ tituloDaTroca }}</h2>
            <AppdFoto
              ref="campoFoto"
              v-model="enviandoFoto"
              rotulo="Nova foto para o crachá"
              :imagem-inicial="ROTA_FOTO"
            />
            <button type="button" class="botao botao-fantasma" @click="trocandoFoto = false">
              Manter a foto de agora
            </button>
          </template>
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
              :cid="data.cidNoCracha ? data.cid : null"
              :cras="data.cras"
              :credencial-transporte="data.credencialTransporte"
              :emissao="data.emissao"
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
              :contato-emergencia="data.contatoEmergencia"
              :cuidador-nome="data.cuidadorNome"
              :url-verificacao="urlVerificacao"
            />
          </figure>
        </div>
      </div>

      <!-- Ações de baixar -->
      <div class="acoes-baixar">
        <template v-if="temFoto">
          <!--
            Ícone com rótulo curto, e não ícone sozinho (2026-08-21).

            O dono pediu "só ícones de SVG", e os botões eram grandes demais — isso está
            resolvido: viraram compactos e da mesma cor. Mas o rótulo fica, e a razão é o
            público: quem usa este site inclui pessoas com deficiência intelectual e
            pessoas idosas, e um quadrado com uma seta não diz se o que sai é imagem,
            documento ou impressão. Ícone sozinho transfere para elas o custo de adivinhar.

            O ícone faz o trabalho que o dono queria — reconhecimento rápido e menos peso
            visual —, e a palavra faz o que só ela faz.
          -->
          <button
            type="button"
            class="botao botao-secundario compacto"
            :disabled="Boolean(exportando)"
            @click="exportar('png')"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path
                d="M12 3v10m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ exportando === 'png' ? 'Gerando…' : 'Imagem' }}
            <span class="so-leitor-de-tela">do crachá, em PNG</span>
          </button>
          <button
            type="button"
            class="botao botao-secundario compacto"
            :disabled="Boolean(exportando)"
            @click="exportar('pdf')"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path
                d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v6h5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ exportando === 'pdf' ? 'Gerando…' : 'PDF' }}
            <span class="so-leitor-de-tela">do crachá</span>
          </button>
          <!--
            Abre em **outra aba** (decisão do dono, 2026-08-07). A folha A4 não é um bloco
            desta página, é o documento — e quem manda imprimir não quer perder de vista o
            crachá que estava olhando. `rel="noopener"` porque `target="_blank"` sem isso
            entrega à aba nova uma referência à que a abriu.
          -->
          <a
            class="botao botao-secundario compacto"
            href="/area/cracha-impressao"
            target="_blank"
            rel="noopener"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path
                d="M7 9V4h10v5M7 19H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 15h10v6H7z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Imprimir
            <span class="so-leitor-de-tela">— ver como fica impresso (abre em outra aba)</span>
          </a>
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

      <!--
        As duas linhas "O arquivo é gerado aqui no seu navegador / Nada é enviado para
        fora" saíram em 2026-08-20, por decisão do dono, que as apontou com o mouse.

        Fica registrado o que se perdeu, porque a decisão é dele e o custo é real: elas
        eram a única vez em que a tela dizia ao titular que a foto não sobe para servidor
        nenhum. A garantia continua verdadeira — a geração é local, no navegador — e
        deixou de ser dita. Se a promessa voltar a precisar ser feita, o lugar é aqui.
      -->

      <!--
        REQ-25: caixa única, separada das demais, desmarcada por padrão. O texto descreve
        só a consequência de marcar e a de não marcar — nada de "recomendado", "ajuda" ou
        "facilita", nada de emoji, nada de cor de ação.
      -->
      <!--
        O opt-in do CID aparece **só para quem tem CID guardado**.

        Quem nunca informou não precisa ver uma caixa sobre um dado que não deu — seria
        oferecer a impressão de algo inexistente, e convidar a pergunta errada.
      -->
      <section v-if="data.temCid" class="cartao opt-in" aria-labelledby="t-cid">
        <h2 id="t-cid">O CID no meu crachá</h2>

        <div class="escolha-optin">
          <p class="estado-atual">
            <strong>Hoje o seu crachá {{ data.cidNoCracha ? 'mostra' : 'não mostra' }}</strong>
            o seu CID.
          </p>

          <label class="escolha" for="cid-no-cracha">
            <input
              id="cid-no-cracha"
              type="checkbox"
              :checked="data.cidNoCracha"
              aria-describedby="cid-consequencias"
              @change="alternarCidNoCracha"
            />
            <span>Mostrar o meu CID no crachá</span>
          </label>

          <div id="cid-consequencias">
            <p>
              Se você marcar, o código do seu diagnóstico é impresso na frente do cartão — e o
              cartão é o documento que você mostra a quem pedir.
            </p>
            <p>
              <strong>A página pública de verificação nunca mostra o seu CID</strong>, marcado ou
              não. Ela é aberta a qualquer pessoa que tenha o seu número de registro.
            </p>
            <p>
              Para apagar o CID de vez, retire a autorização em
              <NuxtLink to="/seus-direitos">Seus direitos</NuxtLink>.
            </p>
          </div>
        </div>
      </section>

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
/*
  A coluna vem de `.area-moldura`, em base.css.

  Esta regra declarava `display: flex; flex-direction: column`, e o estilo com escopo da
  página carrega depois do base — mesma especificidade, cascata a favor dela. O resultado
  era o menu na esquerda e o conteúdo embaixo dele, em vez de ao lado. O que sobra aqui é
  só o que é da tela; a forma da área é da moldura.
*/

.trocar-bloco {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e3);
}

/* Botão de ação secundária compacto: cabe mais de um na linha sem virar barra de menu. */
.compacto {
  min-height: var(--alvo-min);
  padding: 0 var(--e3);
}

.chamada {
  font-size: var(--texto-corpo-g);
  max-width: var(--medida);
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
  max-width: var(--medida);
}

.escolha-optin {
  border-top: 1px solid var(--borda-suave);
  padding-top: var(--e3);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.escolha-optin p {
  max-width: var(--medida);
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
