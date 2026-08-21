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
      <!--
        Os dois lados **encostados**, e a tira inteira com marca de corte só em volta.

        O dono viu o vão entre eles e disse o motivo, que é de uso e não de estética: "a
        pessoa vai imprimir e ela vai dobrar aqui, então não pode ter esse espaço, tem que
        tá bem coladinho". Com vão, quem dobra no meio deixa uma aba branca de um lado e
        corta o cartão do outro.
      -->
      <div class="folha">
        <div class="tira">
          <AppdCracha
            lado="frente"
            :nome="data.nome ?? ''"
            :numero-registro="data.numeroRegistro"
            :situacao="data.situacao"
            :foto="data.foto"
            :deficiencias="data.deficiencias"
            :cid="data.cid"
            :cras="data.cras"
            :credencial-transporte="data.credencialTransporte"
            :emissao="data.emissao"
            :nascimento="data.nascimento"
            :cpf="data.cpf"
            :url-verificacao="urlVerificacao"
          />
          <AppdCracha
            lado="verso"
            :nome="data.nome ?? ''"
            :numero-registro="data.numeroRegistro"
            :situacao="data.situacao"
            :contato-emergencia="data.contatoEmergencia"
            :cuidador-nome="data.cuidadorNome"
            :emissao="data.emissao"
            :endereco-pessoa="data.enderecoPessoa"
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

/*
  A conta da folha, com a tira colada.

  Dois cartões de 85,6 mm somam 171,2 mm — sem vão nenhum entre eles, desde 2026-08-21. Com
  12 mm de margem sobram 186 mm úteis, e a tira ocupa 171,2: quase 15 mm de respiro para a
  tesoura, que é o motivo de a margem existir.

  Os 8 mm de vão que havia antes saíram por decisão do dono, e o motivo é a dobra: a tira é
  cortada inteira e dobrada ao meio, e um vão no meio vira aba branca de um lado e corte no
  cartão do outro. A linha central é **dobra**, não corte — por isso a marca de corte
  aparece só nas quatro pontas da tira.
*/
.folha {
  width: 210mm;
  height: 297mm;
  background: #fff;
  border: 1px solid var(--borda-suave);
  box-shadow: var(--sombra-2);
  padding: 12mm;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
}

.tira {
  position: relative;
  display: flex;
  /* Sem gap: os dois lados se encostam para a dobra cair exatamente no meio. */
  gap: 0;
}

/* Marcas de corte finas, nas pontas da tira — nunca entre os dois cartões. */
.tira::before,
.tira::after {
  content: '';
  position: absolute;
  left: -6mm;
  width: 4mm;
  height: 1px;
  background: var(--texto);
}

.tira::before {
  top: 0;
}

.tira::after {
  bottom: 0;
}

/*
  No papel some tudo menos a folha, e a folha perde borda e sombra — que são pistas de
  tela, não do documento. Sem isto, o navegador imprime cabeçalho, botões e uma moldura
  cinza em volta do cartão.
*/
@media print {
  /*
    A margem da folha sai do `@page`, e não do `padding` — corrigido em 2026-08-21.

    No papel a `.folha` perde o `padding: 12mm` (senão ele somaria à margem que a
    impressora já aplica), e o resultado era a tira **colada no canto superior esquerdo**,
    com as marcas de corte a `-6mm` fora da página. Quem corta precisa de folga dos dois
    lados da linha, e as marcas existem para ele não precisar medir.

    `@page` é o lugar certo dessa margem: ela vale para a folha inteira, é o que o
    navegador entende como área imprimível, e não empurra o conteúdo para dentro do
    cartão.
  */
  @page {
    size: A4;
    margin: 12mm;
  }

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

  /*
    O mesmo motivo do cartão: sem isto o navegador descarta fundo e cor ao imprimir, e a
    folha sai branca. Declarado aqui também porque a `.folha` não é filha do `.cracha`, e a
    herança não a alcança.
  */
  .impressao,
  .folha,
  .tira {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
