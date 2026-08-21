<script setup lang="ts">
/*
  Navegação da área do associado.

  O item atual é marcado por sublinhado espesso **e** `aria-current="page"` — nunca só por
  cor. Quem não distingue as cores continua sabendo onde está, e o leitor de tela anuncia.
*/

defineProps<{ atual: 'painel' | 'cracha' | 'dados' | 'inscricoes' | 'excluir' }>()

/*
  "Sair" fica aqui, e não no cabeçalho do site: sair é ação de quem está na área, e o
  cabeçalho é do site inteiro.

  A rota `/api/conta/sair` existia desde 2026-08-06 e **nenhuma tela a chamava** — dava
  para entrar e não dava para sair, a não ser apagando o cookie na mão. É o que acontece
  quando a API vem antes da tela e ninguém percorre o percurso inteiro.

  `sessao.fetch()` antes de navegar: o servidor apaga o cookie, mas quem desenha o
  cabeçalho é o estado do cliente, e sem reler ele continuaria dizendo "Minha área".
*/
const sessao = useUserSession()
const saindo = ref(false)

async function sair() {
  saindo.value = true
  try {
    await $fetch('/api/conta/sair', { method: 'POST' })
  } finally {
    await sessao.fetch()
    await navigateTo('/')
  }
}
</script>

<template>
  <nav aria-label="Área do associado">
    <ul>
      <li>
        <NuxtLink to="/area" :aria-current="atual === 'painel' ? 'page' : undefined">
          Início
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/area/cracha" :aria-current="atual === 'cracha' ? 'page' : undefined">
          Meu crachá
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/area/dados" :aria-current="atual === 'dados' ? 'page' : undefined">
          Meus dados
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/area/inscricoes" :aria-current="atual === 'inscricoes' ? 'page' : undefined">
          Meu cadastro
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/area/excluir" :aria-current="atual === 'excluir' ? 'page' : undefined">
          Excluir conta
        </NuxtLink>
      </li>
      <li class="fim">
        <button type="button" class="sair" :disabled="saindo" @click="sair">
          {{ saindo ? 'Saindo…' : 'Sair' }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}

a {
  position: relative;
  display: flex;
  align-items: center;
  min-height: var(--alvo-min);
  padding: 0 var(--e3);
  border-radius: var(--raio-botao);
  color: var(--texto);
  font-weight: 700;
  text-decoration: none;
}

a:hover {
  background: var(--superficie);
}
a:visited {
  color: var(--texto);
}
/*
  "Sair" separado dos assuntos da área por uma divisória, e não pelo empurrão até a outra
  ponta — numa coluna não existe outra ponta. O motivo de separar continua o mesmo: sair
  não é irmão de "meu crachá" e "meus dados".
*/
.fim {
  margin-top: var(--e2);
  padding-top: var(--e2);
  border-top: 1px solid var(--borda-suave);
}
/*
  "Sair" na cor da marca, não no azul de link.

  `--link` é o azul reservado a link de texto corrido, e nesta barra ele destoava de tudo
  ao redor — "bagulho azul", disse o dono em 2026-08-20. `--primaria` é a mesma cor de
  "Entrar" e "Minha área" no cabeçalho, que são as outras duas ações de sessão do site;
  10,01:1 sobre o fundo, bem acima do AA.
*/
.sair {
  min-height: var(--alvo-min);
  padding: 0 12px;
  border: 0;
  background: none;
  color: var(--primaria);
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}
.sair:hover {
  background: var(--superficie-forte);
}
/*
  A seção atual ganha uma barra à esquerda, e não um sublinhado embaixo.

  O sublinhado nasceu da fileira horizontal, onde a espessura embaixo era a borda da
  "aba". Numa coluna ele viraria um traço solto sob o texto, fácil de confundir com link
  sublinhado. A barra acompanha a direção da lista e continua sendo meio não-cromático —
  a cor sozinha nunca marcou nada aqui, e `aria-current` segue no template.
*/
a[aria-current='page'] {
  background: var(--primaria-tenue);
  color: var(--primaria);
}

a[aria-current='page']::after {
  content: '';
  position: absolute;
  left: 0;
  top: var(--e1);
  bottom: var(--e1);
  width: 4px;
  border-radius: 2px;
  background: var(--primaria);
}

/*
  No telefone, uma fileira que rola — não uma que quebra.

  Cinco seções mais "Sair" não cabem na largura de um telefone, e com `flex-wrap` elas
  desciam para duas e três linhas, com o "Sair" sobrando sozinho na última. O dono viu e
  descreveu como "muito feio", e estava certo: a altura da navegação passava a depender do
  comprimento dos rótulos.

  Fileira rolável é o padrão consolidado para este caso — poucas seções, todas do mesmo
  nível, trocadas com frequência. Foi preferida a um accordion porque navegar não deveria
  custar dois toques: o accordion esconde os destinos e obriga a abrir antes de escolher.

  Três cuidados que a rolagem lateral exige, e sem os quais ela vira armadilha:

  - `overscroll-behavior-x: contain` para o gesto não escapar para a página e virar
    "voltar" do navegador;
  - `scroll-snap` para o item parar alinhado, em vez de meio cortado;
  - a máscara nas bordas, que mostra que há mais coisa depois do que se vê. Sem ela, uma
    fileira cortada no talo parece uma fileira que acabou.

  A rolagem é do container, nunca da página — o gate de aceite reprova rolagem horizontal
  no documento, e com razão.
*/
@media (max-width: 760px) {
  nav {
    border-bottom: 1px solid var(--borda-suave);
    padding-bottom: var(--e2);
    gap: var(--e2);
    /*
      `min-width: 0` é o que faz a fileira rolar em vez de transbordar.

      Sem ele, um item de flex adota a largura do próprio conteúdo — os seis rótulos
      somavam 702px numa tela de 360, o `ul` esticava o `nav` junto, e `overflow-x: auto`
      não tinha o que rolar porque `scrollWidth` e `clientWidth` eram iguais.

      O pior é o que isso escondia: o `overflow-x: hidden` da página cortava o excesso, e
      "Sair" ficava fora da tela **sem rolagem que o alcançasse** — um item de navegação
      inalcançável, com o teste de rolagem horizontal passando.
    */
    min-width: 0;
    /*
      `width: 100%` amarra o `nav` à largura do pai. Só `min-width: 0` não bastava: em
      coluna, o item de flex ainda cresce até o conteúdo, e a fileira de 702px esticava o
      `nav` junto — sobrava transbordo, não rolagem.
    */
    width: 100%;
  }

  ul {
    flex-direction: row;
    flex-wrap: nowrap;
    min-width: 0;
    width: 100%;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    padding-bottom: var(--e1);
    mask-image: linear-gradient(
      to right,
      transparent 0,
      #000 12px,
      #000 calc(100% - 20px),
      transparent 100%
    );
  }

  ul::-webkit-scrollbar {
    display: none;
  }

  li {
    flex: none;
    scroll-snap-align: start;
  }

  a {
    white-space: nowrap;
  }

  /*
    "Sair" continua sendo o último, e continua separado — mas por uma divisória vertical,
    que é a que faz sentido numa fileira. A horizontal era da coluna.
  */
  .fim {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
    margin-left: var(--e2);
    padding-left: var(--e3);
    border-left: 1px solid var(--borda-suave);
  }

  a[aria-current='page']::after {
    left: var(--e2);
    right: var(--e2);
    top: auto;
    bottom: 0;
    width: auto;
    height: 4px;
  }
}
</style>
