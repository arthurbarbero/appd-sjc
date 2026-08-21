<script setup lang="ts">
import { ASSOCIACAO } from '~~/shared/conteudo'

/*
  `/area/cracha-impressao` — a folha A4, sozinha numa tela só dela.

  Decisão do dono em 2026-08-07: a pré-visualização saiu de dentro de `/area/cracha`. O
  motivo é que ela não é um bloco da página — é **o documento**. Numa tela própria, a folha
  ocupa o que precisa, o `Ctrl+P` do navegador pega a página inteira sem cabeçalho e
  navegação em volta, e a rolagem horizontal em tela estreita deixa de ser problema de
  acessibilidade da área do associado: aqui rolar a folha é o esperado, como em qualquer
  visualizador de documento.

  Sem `AreaNavegacao` e sem os blocos da área, de propósito. Quem chega aqui veio imprimir.
*/

/*
  **Sem layout nenhum** (`layout: false`). Não é preferência: com o layout padrão, o
  `Ctrl+P` levava junto cabeçalho, menu, rodapé de quatro colunas e uma segunda página com
  o COMTRAD. O dono mandou o PDF e o defeito estava lá inteiro.

  `@media print` sozinho não resolvia, porque cabeçalho e rodapé vêm do layout, fora desta
  página — não havia como marcá-los para sumir daqui.
*/
definePageMeta({ layout: false })

useHead({
  title: 'Crachá para impressão — APPD São José dos Campos',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const sede = ASSOCIACAO.telefones[0]!
const origem = useRequestURL().origin

const { data, pending, error } = await useFetch('/api/area/cracha')

const urlVerificacao = computed(() => `${origem}/verificar/${data.value?.numeroRegistro ?? ''}`)
const temFoto = computed(() => Boolean(data.value?.foto))

function imprimir() {
  window.print()
}

/*
  A tela abre em aba nova. Fechar é o gesto certo — voltar levaria a lugar nenhum, porque
  esta aba não tem histórico. Se alguém chegou por link direto, `window.close()` é ignorado
  pelo navegador e o caminho de volta fica no link abaixo.
*/
function fechar() {
  window.close()
}
</script>

<template>
  <div class="impressao">
    <!-- `nao-imprime`: tudo aqui some no papel. Só a folha vai. -->
    <div class="nao-imprime cabecalho-impressao">
      <div>
        <h1>Crachá para impressão</h1>
        <p class="atencao">
          Imprima em <strong>100%</strong>. Não use a opção de ajustar à página, senão o crachá sai
          menor que o tamanho certo.
        </p>
      </div>
      <div class="acoes">
        <button v-if="temFoto" type="button" class="botao botao-primario" @click="imprimir">
          Imprimir
        </button>
        <button type="button" class="botao botao-secundario" @click="fechar">Fechar</button>
      </div>
      <p class="volta">
        Esta tela abriu em outra aba. Se ela não fechar, use
        <NuxtLink to="/area/cracha">Meu crachá</NuxtLink>.
      </p>
    </div>

    <p v-if="pending" role="status" class="nao-imprime carregando">Carregando o seu crachá…</p>

    <AppdAviso v-else-if="error" tipo="erro" titulo="Não conseguimos carregar" class="nao-imprime">
      <span>
        Tente recarregar a página. Se continuar, ligue para
        <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
        >.
      </span>
    </AppdAviso>

    <AppdAviso v-else-if="!temFoto" tipo="atencao" titulo="Falta a sua foto" class="nao-imprime">
      <span>
        O crachá precisa de foto para ser impresso.
        <NuxtLink to="/area/cracha">Enviar minha foto</NuxtLink>.
      </span>
    </AppdAviso>

    <!--
      A folha rola na horizontal em tela estreita. `tabindex` custa uma linha e evita que
      quem usa só o teclado fique sem alcançar a folha — mesma régua do axe
      (`scrollable-region-focusable`) que já pegou este caso em 2026-08-07.
    -->
    <div
      v-else-if="data"
      class="folha-rolagem"
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
            :cid="data.cidNoCracha ? data.cid : null"
            :cras="data.cras"
            :credencial-transporte="data.credencialTransporte"
            :emissao="data.emissao"
            :url-verificacao="urlVerificacao"
          />
        </div>
        <div class="corte">
          <AppdCracha
            lado="verso"
            :nome="data.nome ?? ''"
            :numero-registro="data.numeroRegistro"
            :situacao="data.situacao"
            :contato-emergencia="data.contatoEmergencia"
            :cuidador-nome="data.cuidadorNome"
            :url-verificacao="urlVerificacao"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  Sem layout, a página não herda margem nenhuma — o respiro tem de vir daqui. E ele some
  na impressão, onde a margem quem define é o navegador.
*/
.impressao {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
  max-width: 1080px;
  margin: 0 auto;
  padding: var(--e5) var(--e4);
}

.cabecalho-impressao {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e4);
  justify-content: space-between;
  align-items: flex-start;
}

.atencao {
  max-width: var(--medida);
  font-size: var(--texto-corpo-g);
}

.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e2);
}

.volta {
  flex-basis: 100%;
  font-size: var(--texto-rotulo);
  color: var(--texto-suave);
  margin: 0;
}

.folha-rolagem {
  overflow-x: auto;
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
  left: -6mm;
  width: 4mm;
  height: 1px;
  background: var(--texto);
}

.corte::before {
  top: 0;
}

.corte::after {
  bottom: 0;
}

/*
  No papel some tudo menos a folha, e a folha perde borda e sombra — que são pistas de
  tela, não do documento. Sem isto, o navegador imprime cabeçalho, botões e uma moldura
  cinza em volta do cartão.
*/
@media print {
  .nao-imprime {
    display: none !important;
  }

  .impressao {
    gap: 0;
    padding: 0;
    margin: 0;
    max-width: none;
  }

  .folha-rolagem {
    overflow: visible;
  }

  .folha {
    border: none;
    box-shadow: none;
    padding: 0;
    width: auto;
    height: auto;
  }
}
</style>
