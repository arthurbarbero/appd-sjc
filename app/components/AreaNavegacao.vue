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

/*
  A mesma rota que o cartão de `/area` usa. Constante, e não literal no `src`, porque com
  o caminho cru o Vite tenta resolvê-lo como asset e o build de produção quebra.

  `useFetch` com chave fixa: as cinco telas da área montam esta navegação, e sem a chave
  cada uma pediria de novo a mesma resposta ao trocar de seção.
*/
const ROTA_FOTO = '/api/area/foto'
const { data: dadosFoto } = await useFetch('/api/area/tem-foto', { key: 'area-tem-foto' })
const temFoto = computed(() => dadosFoto.value?.temFoto === true)

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
    <!--
      O cabeçalho mínimo da área: a foto e nada mais.

      "Esse de cima tá ok, eu até colocaria pra ficar mini — tipo bem mini, só foto e o
      linkinho", disse o dono em 2026-08-20, no lugar do cartão que repetia nome e número
      a cada visita. Quem não enviou foto não vê moldura vazia: o bloco simplesmente não
      existe, porque um retângulo tracejado no alto de toda tela cobra sem necessidade.

      `alt` vazio: é a mesma pessoa que está logada, e o nome dela está no cabeçalho do
      site. Anunciar "sua foto" a cada tela da área é ruído.
    -->
    <img v-if="temFoto" :src="ROTA_FOTO" alt="" width="72" height="90" class="retrato" />

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

.retrato {
  width: 72px;
  height: 90px;
  object-fit: cover;
  border-radius: var(--raio-p);
  border: var(--borda-largura) solid var(--borda-suave);
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

/* Na faixa estreita a navegação volta a ser fileira, e a marca volta a ser embaixo. */
@media (max-width: 760px) {
  nav {
    border-bottom: 1px solid var(--borda-suave);
    padding-bottom: var(--e2);
  }

  .retrato {
    display: none;
  }

  ul {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .fim {
    margin-left: auto;
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
