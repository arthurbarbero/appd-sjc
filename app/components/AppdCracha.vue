<script setup lang="ts">
/*
  O crachá em HTML/CSS, frente e verso — `cracha-do-associado` REQ-19 a REQ-22.

  As medidas estão em **milímetros**, não em pixels: é o que faz a pré-visualização de
  impressão sair no tamanho de verdade (54 × 85,6 mm, o cartão padrão). Em pixels, o
  cartão pareceria certo na tela e sairia errado no papel.

  O que aparece aqui é a lista fechada do REQ-20 e do REQ-21. O REQ-22 é o que **não**
  aparece: endereço da pessoa, telefone dela, data de nascimento, cuidador e e-mail não
  entram no cartão, e o tipo de deficiência só entra com o opt-in marcado.
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
}>()

const ativo = computed(() => props.situacao === 'ativo')
const sede = ASSOCIACAO.telefones[0]!
</script>

<template>
  <div :class="['cracha', `cracha-${lado}`]">
    <template v-if="lado === 'frente'">
      <div class="faixa">{{ ASSOCIACAO.nome }}</div>

      <img v-if="foto" class="foto" :src="foto" :alt="`Foto de ${nome}`" />
      <div v-else class="foto sem-foto" aria-hidden="true">Sem foto</div>

      <p class="nome">{{ nome }}</p>

      <p class="rotulo">Registro</p>
      <p class="numero">{{ numeroRegistro }}</p>

      <!-- Situação por ícone **e** texto: quem imprime em preto e branco continua lendo. -->
      <p :class="['situacao', ativo ? 'ok' : 'atencao']">
        <span aria-hidden="true">{{ ativo ? '✓' : '!' }}</span>
        {{ ativo ? 'Associado ativo' : 'Cadastro não ativo' }}
      </p>

      <p v-if="deficiencias?.length" class="deficiencia">{{ deficiencias.join(' · ') }}</p>
    </template>

    <template v-else>
      <AppdQrCode :valor="urlVerificacao" :tamanho="120" />
      <p class="url">{{ urlVerificacao }}</p>

      <div class="associacao">
        <p>{{ enderecoEmLinha }}</p>
        <p>CNPJ {{ ASSOCIACAO.cnpj }}</p>
        <p>{{ sede.numero }}</p>
      </div>

      <p class="ressalva">
        Este crachá identifica a pessoa associada e não substitui documento oficial com foto.
      </p>
    </template>
  </div>
</template>

<style scoped>
.cracha {
  width: 54mm;
  height: 85.6mm;
  box-sizing: border-box;
  background: #fff;
  color: var(--texto);
  border: 0.3mm solid var(--borda-suave);
  border-radius: 2mm;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  /* Base em mm para tudo escalar junto quando o cartão for ampliado na tela. */
  font-size: 2.6mm;
  line-height: 1.25;
}

.cracha p {
  margin: 0;
}

.faixa {
  width: 100%;
  background: var(--primaria);
  color: var(--sobre-primaria);
  font-weight: var(--peso-forte);
  padding: 2mm 3mm;
  font-size: 2.4mm;
}

.foto {
  width: 26mm;
  height: 32.5mm;
  object-fit: cover;
  border: 0.3mm solid var(--borda-suave);
  margin-top: 4mm;
}

.sem-foto {
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  color: var(--texto-suave);
  background: var(--superficie);
}

.nome {
  margin-top: 4mm;
  padding: 0 3mm;
  font-size: 3.4mm;
  font-weight: var(--peso-forte);
}

.rotulo {
  margin-top: 3mm;
  font-size: 2.2mm;
  font-weight: var(--peso-forte);
  color: var(--texto-suave);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.numero {
  font-size: 3.6mm;
  font-weight: var(--peso-forte);
  font-variant-numeric: tabular-nums;
}

.situacao {
  margin-top: 3mm;
  font-size: 2.6mm;
  font-weight: var(--peso-forte);
}

.situacao.ok {
  color: var(--verde);
}

.situacao.atencao {
  color: var(--aviso);
}

.deficiencia {
  margin-top: 2mm;
  padding: 0 3mm;
  font-size: 2.4mm;
  color: var(--texto-suave);
}

.cracha-verso {
  justify-content: flex-start;
  padding: 5mm 3mm;
  gap: 3mm;
}

.url {
  font-size: 2mm;
  color: var(--texto-suave);
  word-break: break-all;
}

.associacao {
  font-size: 2.2mm;
  display: flex;
  flex-direction: column;
  gap: 0.8mm;
}

.ressalva {
  margin-top: auto;
  font-size: 2mm;
  font-weight: var(--peso-forte);
  color: var(--texto-suave);
}
</style>
