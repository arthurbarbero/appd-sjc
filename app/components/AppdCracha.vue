<script setup lang="ts">
/*
  O crachá em HTML/CSS, frente e verso — `cracha-do-associado` REQ-19 a REQ-22, redesenhado
  em `cracha-impresso` (2026-08-21).

  ## Paisagem, e não retrato

  O cartão nasceu 54 × 85,6 mm, em pé. O da associação é 85,6 × 54 mm, deitado — que é
  também o ISO/IEC 7810 ID-1, a medida de carteira de motorista e cartão de banco. Virar
  não foi capricho: um cartão em pé não entra na janelinha da carteira de ninguém.

  As medidas seguem em **milímetros**, e é o que faz a pré-visualização sair no tamanho de
  verdade. Em pixels, o cartão pareceria certo na tela e sairia errado no papel.

  ## O que aparece, e o que não

  A lista do REQ-20 e do REQ-21, mais os campos que o cartão de papel tem e o dono pediu:
  CRAS, credencial de transporte, contato de emergência e emissão.

  O REQ-22 é o que **não** aparece: endereço da pessoa, e-mail e data de nascimento não
  entram. O tipo de deficiência entra só com o opt-in dele; o **CID**, só com o opt-in
  próprio dele (ADR-020) — e nenhum dos dois aparece na página pública de verificação.
*/

import { ASSOCIACAO, enderecoEmLinha } from '~~/shared/conteudo'

const props = defineProps<{
  lado: 'frente' | 'verso'
  nome: string
  numeroRegistro: string
  situacao: 'ativo' | 'inativo'
  foto?: string | null
  deficiencias?: string[]
  urlVerificacao: string
  /* Campos do cartão de papel, todos opcionais — o cartão sai sem qualquer um deles. */
  cid?: string | null
  cras?: string | null
  credencialTransporte?: string | null
  contatoEmergencia?: string | null
  cuidadorNome?: string | null
  emissao?: string | null
}>()

const ativo = computed(() => props.situacao === 'ativo')
const sede = ASSOCIACAO.telefones[0]!

/*
  O telefone sai formatado, como em qualquer outro lugar do site.

  O banco guarda só os dígitos, e num cartão de emergência esse é o pior formato possível:
  quem vai discar está com pressa e lê `12988428319` de uma vez, sem os agrupamentos que o
  olho usa para não errar.
*/
const emergenciaLegivel = computed(() => {
  const d = (props.contatoEmergencia ?? '').replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return props.contatoEmergencia ?? ''
})

/** Data de emissão em dia/mês/ano — o cartão é lido por pessoas, não por banco de dados. */
const emissaoLegivel = computed(() => {
  const bruto = props.emissao ?? ''
  const iso = bruto.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : ''
})
</script>

<template>
  <div :class="['cracha', `cracha-${lado}`]">
    <template v-if="lado === 'frente'">
      <div class="faixa">{{ ASSOCIACAO.nome }}</div>

      <!--
        Deitado, a frente é duas colunas: retrato à esquerda, dados à direita. É a
        disposição do cartão da associação, e é também a que aproveita a largura — em pé,
        a foto empurrava tudo para baixo e sobrava faixa vazia dos lados.
      -->
      <div class="corpo">
        <div class="coluna-foto">
          <img v-if="foto" class="foto" :src="foto" :alt="`Foto de ${nome}`" />
          <div v-else class="foto sem-foto" aria-hidden="true">Sem foto</div>
        </div>

        <div class="coluna-dados">
          <p class="nome">{{ nome }}</p>

          <div class="linha-dado">
            <span class="rotulo">Registro</span>
            <span class="numero">{{ numeroRegistro }}</span>
          </div>

          <div v-if="emissaoLegivel" class="linha-dado">
            <span class="rotulo">Emissão</span>
            <span class="valor">{{ emissaoLegivel }}</span>
          </div>

          <div v-if="cras" class="linha-dado">
            <span class="rotulo">CRAS</span>
            <span class="valor">{{ cras }}</span>
          </div>

          <div v-if="credencialTransporte" class="linha-dado">
            <span class="rotulo">Credencial</span>
            <span class="valor">{{ credencialTransporte }}</span>
          </div>

          <!-- Situação por ícone **e** texto: quem imprime em preto e branco continua lendo. -->
          <p :class="['situacao', ativo ? 'ok' : 'atencao']">
            <span aria-hidden="true">{{ ativo ? '✓' : '!' }}</span>
            {{ ativo ? 'Associado ativo' : 'Cadastro não ativo' }}
          </p>

          <p v-if="deficiencias?.length" class="deficiencia">{{ deficiencias.join(' · ') }}</p>

          <!--
            O CID entra por um opt-in próprio, e quem decide se ele chega até aqui é a
            tela: este componente só desenha o que recebe. A regra está no ADR-020.
          -->
          <p v-if="cid" class="cid">CID {{ cid }}</p>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="corpo">
        <div class="coluna-qr">
          <AppdQrCode :valor="urlVerificacao" :tamanho="120" />
          <p class="url">{{ urlVerificacao }}</p>
        </div>

        <div class="coluna-verso">
          <div v-if="contatoEmergencia || cuidadorNome" class="emergencia">
            <p class="rotulo">Em caso de emergência</p>
            <p v-if="cuidadorNome" class="valor">{{ cuidadorNome }}</p>
            <p v-if="emergenciaLegivel" class="valor numero">{{ emergenciaLegivel }}</p>
          </div>

          <div class="associacao">
            <p>{{ enderecoEmLinha }}</p>
            <p>CNPJ {{ ASSOCIACAO.cnpj }}</p>
            <p>{{ sede.numero }}</p>
          </div>

          <p class="ressalva">
            Este crachá identifica a pessoa associada e não substitui documento oficial com foto.
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/*
  85,6 × 54 mm: ISO/IEC 7810 ID-1, a medida da carteira de motorista e do cartão de banco.
  É a do cartão da associação, e é a que entra na janelinha de uma carteira.
*/
.cracha {
  width: 85.6mm;
  height: 54mm;
  box-sizing: border-box;
  background: #fff;
  color: var(--texto);
  border: 0.3mm solid var(--borda-suave);
  border-radius: 2mm;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* Base em mm para tudo escalar junto quando o cartão for ampliado na tela. */
  font-size: 2.4mm;
  line-height: 1.25;
}

.cracha p {
  margin: 0;
}

/* A faixa da associação, que é o que o olho reconhece de longe no cartão de papel. */
.faixa {
  width: 100%;
  background: var(--primaria);
  color: var(--sobre-primaria);
  font-weight: var(--peso-forte);
  padding: 1.6mm 3mm;
  font-size: 2.4mm;
  text-align: center;
}

.corpo {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 3mm;
  padding: 2.5mm 3mm;
}

.coluna-foto {
  flex: none;
}

.coluna-dados {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1mm;
}

.foto {
  width: 24mm;
  height: 30mm;
  object-fit: cover;
  border: 0.3mm solid var(--borda-suave);
  border-radius: 1mm;
}

.sem-foto {
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  color: var(--texto-suave);
  background: var(--superficie);
  text-align: center;
}

.nome {
  font-size: 3.2mm;
  font-weight: var(--peso-forte);
  line-height: 1.15;
}

/*
  Rótulo e valor na mesma linha, com o rótulo em largura fixa.

  Em pé havia espaço para empilhar; deitado, cada linha empilhada custava altura que a
  próxima informação precisava. Alinhar os valores também os torna comparáveis de relance,
  que é como um cartão é lido — procurando um número específico, não lendo do começo.
*/
.linha-dado {
  display: flex;
  align-items: baseline;
  gap: 1.5mm;
}

.rotulo {
  flex: none;
  width: 18mm;
  font-size: 2mm;
  font-weight: var(--peso-forte);
  color: var(--texto-suave);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.numero {
  font-weight: var(--peso-forte);
  font-variant-numeric: tabular-nums;
}

.linha-dado .numero {
  font-size: 2.8mm;
}

.valor {
  font-size: 2.4mm;
}

.situacao {
  margin-top: auto;
  font-size: 2.4mm;
  font-weight: var(--peso-forte);
}

.situacao.ok {
  color: var(--verde);
}

.situacao.atencao {
  color: var(--aviso);
}

.deficiencia {
  font-size: 2.2mm;
  color: var(--texto-suave);
}

/*
  O CID em destaque, e não em nota de rodapé.

  Quem marca o opt-in de imprimi-lo faz isso para mostrá-lo a um atendente, e é ele que a
  pessoa vai apontar com o dedo. Escondê-lo no canto contrariaria a única razão de ele
  estar aqui — e não muda nada quanto a quem o vê, porque quem vê o cartão vê o cartão
  inteiro.
*/
.cid {
  font-size: 2.6mm;
  font-weight: var(--peso-forte);
}

/* ---------- verso ---------- */

.cracha-verso .corpo {
  align-items: flex-start;
}

.coluna-qr {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1mm;
}

.coluna-verso {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2mm;
}

.url {
  font-size: 1.7mm;
  color: var(--texto-suave);
  word-break: break-all;
  max-width: 30mm;
  text-align: center;
}

/*
  O contato de emergência é a informação que justifica alguém pegar este cartão da mão de
  quem não pode falar. Por isso é a primeira do verso, e não está em corpo menor.
*/
.emergencia .rotulo {
  width: auto;
}

.emergencia .valor {
  font-weight: var(--peso-forte);
}

.associacao {
  font-size: 2mm;
  color: var(--texto-suave);
}

.ressalva {
  margin-top: auto;
  font-size: 1.9mm;
  font-weight: var(--peso-forte);
}
</style>
