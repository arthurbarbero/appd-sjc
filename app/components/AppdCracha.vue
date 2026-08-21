<script setup lang="ts">
/*
  O crachá em HTML/CSS, frente e verso.

  Histórico curto, porque ele explica o desenho: nasceu em pé e genérico
  (`cracha-do-associado`), virou deitado e inspirado no cartão de papel
  (`cracha-impresso`), e em 2026-08-21 o dono viu o resultado e disse o que faltava:

  > o cartão tinha que estar noventa por cento igual aquele lá, não o que você fez

  Agora é réplica. O que isso muda, em ordem de importância:

  1. **O grafismo da associação entra.** Listras azuis, campo verde e brasão — é o que faz
     alguém reconhecer o documento na porta do ônibus antes de ler qualquer palavra.
  2. **Os campos são os do papel**: nome, nascimento, número, CRAS, credencial, CPF, QR e
     CID na frente; emissão, contato e os dados da associação no verso.
  3. **Todo campo aparece sempre**, preenchido ou não — decisão do dono: "é melhor do que
     não existir o campo (…) quando não preenchido não coloca nada na frente". Um cartão
     cujo desenho muda conforme o cadastro não é reconhecível como documento.

  ## O que **não** foi copiado, e por quê

  - **Validade** e "válida somente com a contribuição solidária em dia": o site não sabe se
    a contribuição está em dia, e imprimir seria sustentar o que não se pode. Decisão do
    dono em 2026-08-21, mantida no dia seguinte.
  - **O número sequencial `00001/CD`**: revela o tamanho do cadastro por contagem. Fica o
    nosso, `APPD-2026-XXXXXX`.
  - **Os logos de PIX, Caixa e Sicoob**: são dados de recebimento da associação, e quem
    decide estampá-los num documento que vai ao bolso de terceiros é quem responde pela
    conta.

  ## Acessibilidade não é negociada pela fidelidade

  O cartão de papel usa cinza claro sobre branco em várias caixas. Aqui os tons são os que
  passam no AA, a fonte é a do projeto e a situação do cadastro sai por ícone **e** texto —
  quem imprime em preto e branco continua lendo. Fidelidade visual não autoriza texto
  ilegível (REQ-6).

  As medidas seguem em **milímetros**: é o que faz a prévia sair no tamanho de verdade. Em
  pixels, o cartão pareceria certo na tela e sairia errado no papel.
*/

import { ASSOCIACAO, enderecoEmLinha } from '~~/shared/conteudo'
import { GRAFISMO_APPD } from '~/utils/cracha-marca'

const props = defineProps<{
  lado: 'frente' | 'verso'
  nome: string
  numeroRegistro: string
  situacao: 'ativo' | 'inativo'
  foto?: string | null
  deficiencias?: string[]
  urlVerificacao: string
  /* Campos do cartão de papel. Todos opcionais — o rótulo fica, o valor pode faltar. */
  cid?: string | null
  cras?: string | null
  credencialTransporte?: string | null
  contatoEmergencia?: string | null
  cuidadorNome?: string | null
  emissao?: string | null
  nascimento?: string | null
  cpf?: string | null
  enderecoPessoa?: string | null
}>()

const ativo = computed(() => props.situacao === 'ativo')
const sede = ASSOCIACAO.telefones[0]!
const secretaria = ASSOCIACAO.telefones[1]!

/*
  O grafismo entra como **variável CSS**, e não como `background-image` em linha.

  O verso precisa dele em marca d'água, e marca d'água com `opacity` no elemento levaria o
  texto junto. Com a URL numa variável, o CSS a aplica onde quiser — no verso, numa camada
  própria atrás do conteúdo.
*/
const fundoGrafismo = computed(() => ({ '--grafismo': `url(${GRAFISMO_APPD})` }))

/**
 * Telefone legível, a partir do E.164 que o banco guarda.
 *
 * Num cartão de emergência o formato cru é o pior possível: quem vai discar está com
 * pressa e lê `+5512988428319` de uma vez, sem os agrupamentos que o olho usa para não
 * errar. Número de fora do Brasil sai como veio — inventar agrupamento para um país que
 * não conhecemos atrapalha mais que ajuda.
 */
function legivel(telefone?: string | null): string {
  const bruto = telefone ?? ''
  if (!bruto) return ''
  const d = bruto.replace(/\D/g, '')
  const nacional = bruto.startsWith('+55') ? d.slice(2) : bruto.startsWith('+') ? '' : d
  if (nacional.length === 11) {
    return `(${nacional.slice(0, 2)}) ${nacional.slice(2, 7)}-${nacional.slice(7)}`
  }
  if (nacional.length === 10) {
    return `(${nacional.slice(0, 2)}) ${nacional.slice(2, 6)}-${nacional.slice(6)}`
  }
  return bruto
}

const emergenciaLegivel = computed(() => legivel(props.contatoEmergencia))

/** Data em dia/mês/ano — o cartão é lido por pessoas, não por banco de dados. */
function porExtenso(iso?: string | null): string {
  const partes = (iso ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : ''
}

const emissaoLegivel = computed(() => porExtenso(props.emissao))
const nascimentoLegivel = computed(() => porExtenso(props.nascimento))

/** CPF com a pontuação de sempre: é assim que ele é conferido no balcão. */
const cpfLegivel = computed(() => {
  const d = (props.cpf ?? '').replace(/\D/g, '')
  if (d.length !== 11) return props.cpf ?? ''
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
})
</script>

<template>
  <div :class="['cracha', `cracha-${lado}`]">
    <!-- ─────────────────────────────── FRENTE ─────────────────────────────── -->
    <template v-if="lado === 'frente'">
      <!--
        A faixa é a parte que o olho reconhece antes de ler. No papel ela traz a sigla em
        corpo grande e o nome por extenso em duas linhas abaixo — e é assim aqui.
      -->
      <div class="faixa">
        <p class="sigla">APPD</p>
        <p class="extenso">Associação das Pessoas Portadoras de Deficiência</p>
        <p class="extenso">{{ ASSOCIACAO.endereco.cidade }}-{{ ASSOCIACAO.endereco.uf }}</p>
      </div>

      <div class="corpo" :style="fundoGrafismo">
        <div class="coluna-foto">
          <img v-if="foto" class="foto" :src="foto" :alt="`Foto de ${nome}`" />
          <div v-else class="foto sem-foto" aria-hidden="true"></div>
        </div>

        <div class="coluna-dados">
          <!--
            Cada caixa tem rótulo pequeno em cima e valor em negrito embaixo, como no papel.

            **Nenhuma tem `v-if`**, e essa é a decisão do dono: "o cartão precisa ter todos
            os campos mesmo que não preenchido; quando não preenchido não coloca nada na
            frente". Sem valor, o rótulo fica e a linha fica vazia.
          -->
          <div class="caixa larga">
            <span class="rotulo">Nome</span>
            <span class="valor destaque">{{ nome }}</span>
          </div>

          <div class="dupla">
            <div class="caixa">
              <span class="rotulo">Nascimento</span>
              <span class="valor">{{ nascimentoLegivel }}</span>
            </div>
            <div class="caixa">
              <span class="rotulo">Número APPD</span>
              <span class="valor numero">{{ numeroRegistro }}</span>
            </div>
          </div>

          <div class="dupla">
            <div class="caixa">
              <span class="rotulo">CRAS</span>
              <span class="valor">{{ cras ?? '' }}</span>
            </div>
            <div class="caixa">
              <span class="rotulo">Credencial Transporte</span>
              <span class="valor">{{ credencialTransporte ?? '' }}</span>
            </div>
          </div>

          <div class="caixa larga">
            <span class="rotulo">CPF</span>
            <span class="valor numero">{{ cpfLegivel }}</span>
          </div>

          <div class="faixa-inferior">
            <AppdQrCode :valor="urlVerificacao" :tamanho="48" />

            <div class="caixa bloco-cid">
              <!--
                O CID sai sempre que houver CID guardado (2026-08-21).

                Havia um opt-in próprio para imprimir, separado do consentimento de coleta;
                o dono mandou juntá-los, e o texto do formulário passou a dizer que
                autorizar é autorizar imprimir. A trava que **fica**, inteira e sem exceção,
                é a outra: `/verificar` nunca mostra o CID (ADR-020).

                O tipo de deficiência continua com opt-in próprio, e o dele também libera a
                página pública — são regras diferentes de propósito.
              -->
              <span class="rotulo">CID</span>
              <span class="valor destaque">{{ cid ?? '' }}</span>
              <span v-if="deficiencias?.length" class="deficiencia">
                {{ deficiencias.join(' · ') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ─────────────────────────────── VERSO ─────────────────────────────── -->
    <template v-else>
      <div class="corpo verso" :style="fundoGrafismo">
        <div class="topo-verso">
          <div class="caixa clara">
            <span class="rotulo grande">Emissão</span>
            <span class="valor destaque">{{ emissaoLegivel }}</span>
          </div>
          <!--
            No papel, o lugar da direita é da validade. Ela não existe aqui, por decisão do
            dono, e deixar o espaço vazio quebraria o equilíbrio do cartão sem ganhar nada.
            O que entra é a situação do cadastro: informação verdadeira, que o site sabe, e
            que o cartão já mostrava antes de virar réplica.
          -->
          <div class="caixa clara">
            <span class="rotulo grande">Situação</span>
            <span :class="['valor', 'destaque', ativo ? 'ok' : 'atencao']">
              <span aria-hidden="true">{{ ativo ? '✓' : '!' }}</span>
              {{ ativo ? 'Associado ativo' : 'Cadastro não ativo' }}
            </span>
          </div>
        </div>

        <div class="topo-verso">
          <div class="caixa clara">
            <!--
              "Pessoa de contato" e "Número de contato", e não "Em caso de emergência" com
              dois valores soltos embaixo. O dono viu o cartão gerado e disse exatamente
              isso: "tem que falar aqui pessoa de contato, número de contato". Ele estava
              lendo um nome e um telefone sem saber de quem eram.
            -->
            <span class="rotulo">Pessoa de contato</span>
            <span class="valor">{{ cuidadorNome ?? '' }}</span>
          </div>
          <div class="caixa clara">
            <span class="rotulo">Número de contato</span>
            <span class="valor numero">{{ emergenciaLegivel }}</span>
          </div>
        </div>

        <p class="endereco-pessoa">{{ enderecoPessoa ?? '' }}</p>

        <div class="institucional">
          <p class="site">A P P D . O R G . B R</p>
          <p>{{ enderecoEmLinha }}</p>
          <p>{{ sede.numero }} / {{ secretaria.numero }}</p>
        </div>

        <p class="ressalva">
          Este crachá identifica a pessoa associada e não substitui documento oficial com foto.
          Confira em {{ urlVerificacao }}
        </p>

        <p class="registro-legal">
          CNPJ {{ ASSOCIACAO.cnpj }} · Utilidade Pública {{ ASSOCIACAO.utilidadePublica }} ·
          Inscrição Municipal {{ ASSOCIACAO.inscricaoMunicipal }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
/*
  85,6 × 54 mm: ISO/IEC 7810 ID-1, a medida da carteira de motorista e do cartão de banco.
  É a do cartão da associação, e é a que entra na janelinha de uma carteira.

  **Tudo aqui é em milímetros, inclusive o QR.** A primeira versão pediu o QR em pixels e
  ele saiu com 20 mm num cartão de 54 — o rodapé da frente vazou para fora do cartão. Numa
  peça de medida fixa, um único valor em pixel estraga a conta inteira.
*/
.cracha {
  width: 85.6mm;
  height: 54mm;
  box-sizing: border-box;
  background: #fff;
  color: #14161a;
  border: 0.3mm solid #c8ccd2;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-size: 2.1mm;
  line-height: 1.2;
  font-family: 'Atkinson Hyperlegible Next', system-ui, sans-serif;
}

.cracha p {
  margin: 0;
}

/* ── Faixa da frente ────────────────────────────────────────────────────────── */

.faixa {
  flex: none;
  background: #22357a;
  color: #fff;
  padding: 0.8mm 2mm 1mm;
  text-align: center;
}

.sigla {
  font-size: 5mm;
  font-weight: 800;
  letter-spacing: 0.4mm;
  line-height: 1.05;
}

.extenso {
  font-size: 1.8mm;
  line-height: 1.2;
}

/* ── Corpo, com o grafismo da associação ────────────────────────────────────── */

/*
  O grafismo do logo já é o do cartão: listras à esquerda, campo verde à direita e o brasão
  ao centro. Usá-lo inteiro, em vez de redesenhar as três partes em CSS, é o que garante
  que a nossa versão e o material impresso não divirjam quando a associação atualizar a
  marca — há um arquivo só, e ele é a fonte.
*/
.corpo {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 1.4mm;
  padding: 1.4mm;
  background-color: #fff;
  background-image: var(--grafismo);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.coluna-foto {
  flex: none;
  width: 21mm;
}

.foto {
  width: 21mm;
  height: 100%;
  object-fit: cover;
  border: 0.5mm solid #22357a;
  display: block;
}

.sem-foto {
  background: rgba(255, 255, 255, 0.93);
}

.coluna-dados {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7mm;
}

/* ── As caixas de rótulo e valor ────────────────────────────────────────────── */

/*
  Fundo quase opaco por cima do grafismo: o cartão de papel faz o mesmo, e é o que permite
  ter fundo colorido sem que a leitura dependa de sorte. `0.93` foi o ponto em que o texto
  passa no AA sobre a parte mais escura do grafismo — o azul das listras.
*/
.caixa {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.93);
  border: 0.25mm solid #00913f;
  border-radius: 1.2mm;
  padding: 0.4mm 1.2mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.caixa.larga {
  flex: none;
}

.caixa.clara {
  border-color: #c8ccd2;
}

.dupla {
  display: flex;
  gap: 1mm;
  flex: none;
}

.rotulo {
  font-size: 1.6mm;
  color: #41474f;
  line-height: 1.1;
}

.rotulo.grande {
  font-size: 2.2mm;
}

.valor {
  font-size: 2.2mm;
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
  /* Reserva a linha do valor mesmo vazio: o desenho não pode mudar com o cadastro. */
  min-height: 2.6mm;
  /* Nome longo encolhe a caixa em vez de estourar o cartão, que tem medida fixa. */
  overflow: hidden;
}

.valor.destaque {
  font-size: 2.5mm;
}

.valor.ok {
  color: #2f5116;
}

.valor.atencao {
  color: #7a4a10;
}

/* ── Rodapé da frente: QR e CID ─────────────────────────────────────────────── */

.faixa-inferior {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 1mm;
  align-items: stretch;
}

/*
  O QR em milímetros, sobrepondo o tamanho em pixels que o componente pede. Fundo branco e
  respiro em volta porque o QR é lido por câmera, e leitor de QR sobre fundo colorido é
  onde a leitura falha na porta do ônibus.
*/
.faixa-inferior :deep(svg) {
  width: 12.5mm;
  height: 12.5mm;
  background: #fff;
  padding: 0.4mm;
  border-radius: 0.8mm;
  flex: none;
  align-self: center;
}

.bloco-cid {
  justify-content: center;
}

.deficiencia {
  font-size: 1.6mm;
  color: #41474f;
  line-height: 1.1;
}

/* ── Verso ──────────────────────────────────────────────────────────────────── */

/*
  No verso o grafismo é marca d'água numa **camada própria**, atrás do conteúdo.

  A primeira tentativa usou `background-blend-mode` sobre um branco translúcido, e o brasão
  saiu escuro demais: a ressalva e a linha de CNPJ ficaram por cima dele, ilegíveis. Aqui a
  opacidade está no pseudo-elemento, então ela não alcança o texto — que é a diferença
  entre marca d'água e mancha.
*/
.corpo.verso {
  position: relative;
  flex-direction: column;
  gap: 0.8mm;
  background-image: none;
  text-align: center;
}

.corpo.verso::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--grafismo);
  background-size: cover;
  background-position: center;
  opacity: 0.1;
}

.corpo.verso > * {
  position: relative;
}

.topo-verso {
  display: flex;
  gap: 1mm;
  flex: none;
}

.topo-verso .caixa {
  text-align: center;
}

.endereco-pessoa {
  flex: none;
  font-size: 1.7mm;
  color: #14161a;
  background: rgba(255, 255, 255, 0.93);
  border-radius: 1mm;
  padding: 0.4mm 1mm;
  min-height: 2.3mm;
}

.institucional {
  flex: none;
  font-size: 1.8mm;
  line-height: 1.25;
  background: rgba(255, 255, 255, 0.93);
  border-radius: 1mm;
  padding: 0.5mm 1mm;
}

.site {
  font-size: 2.2mm;
  font-weight: 800;
  letter-spacing: 0.05mm;
}

.ressalva {
  flex: none;
  font-size: 1.5mm;
  color: #41474f;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.registro-legal {
  margin-top: auto;
  font-size: 1.4mm;
  color: #41474f;
  line-height: 1.15;
}
</style>
