<script setup lang="ts">
import { ASSOCIACAO } from '~~/shared/conteudo'

const menu = [
  { rotulo: 'Início', para: '/' },
  { rotulo: 'Atendimento', para: '/atendimento' },
  { rotulo: 'Projetos', para: '/projetos' },
  { rotulo: 'Doar', para: '/doar' },
  { rotulo: 'Sobre nós', para: '/sobre' },
  { rotulo: 'Contato', para: '/contato' },
]

/**
 * Quem já entrou vê "Minha área"; quem não entrou vê "Entrar".
 *
 * O link fica **fora** da lista do menu principal, separado por uma divisória: os seis
 * itens são o site institucional, e a conta é outra coisa. Misturar os dois faria o menu
 * público mudar de tamanho conforme quem olha.
 */
const { loggedIn } = useUserSession()

const menuAberto = ref(false)
const rota = useRoute()
watch(
  () => rota.path,
  () => (menuAberto.value = false),
)

const atual = (para: string) =>
  para === '/' ? rota.path === '/' : rota.path.startsWith(para) ? 'page' : undefined
</script>

<template>
  <div class="pagina">
    <a class="pular" href="#conteudo">Pular para o conteúdo</a>

    <header class="cabecalho">
      <NuxtLink to="/" class="marca">
        <!--
          alt vazio de propósito: o nome da associação está no texto ao lado, e leitor
          de tela anunciando duas vezes é ruído, não acessibilidade.
        -->
        <img src="/marca/logo-appd.png" alt="" width="600" height="345" class="logo" />
        <span class="nome">APPD<br />São José dos Campos</span>
      </NuxtLink>

      <button
        type="button"
        class="botao botao-secundario alternar"
        :aria-expanded="menuAberto"
        aria-controls="menu-principal"
        @click="menuAberto = !menuAberto"
      >
        Menu
      </button>

      <nav id="menu-principal" aria-label="Principal" :class="{ aberto: menuAberto }">
        <ul>
          <li v-for="item in menu" :key="item.para">
            <NuxtLink :to="item.para" :aria-current="atual(item.para) ? 'page' : undefined">
              {{ item.rotulo }}
            </NuxtLink>
          </li>
        </ul>
        <div class="conta">
          <NuxtLink v-if="loggedIn" to="/area" :aria-current="atual('/area')">Minha área</NuxtLink>
          <NuxtLink v-else to="/entrar" :aria-current="atual('/entrar')">Entrar</NuxtLink>
        </div>
      </nav>
    </header>

    <main id="conteudo" class="conteudo">
      <slot />
    </main>

    <footer class="rodape sobre-escuro">
      <div class="colunas">
        <div class="coluna">
          <!--
            Logo no rodapé (REQ-21). `alt` vazio porque o nome da associação está escrito
            logo abaixo: leitor de tela anunciando duas vezes é ruído, não acessibilidade.
            Largura e altura declaradas para a imagem não empurrar o rodapé ao carregar.
          -->
          <img
            src="/marca/logo-appd.png"
            alt=""
            width="600"
            height="345"
            loading="lazy"
            class="logo-rodape"
          />
          <p class="titulo-rodape">{{ ASSOCIACAO.nome }}</p>
          <p class="discreto">
            {{ ASSOCIACAO.endereco.logradouro }} — {{ ASSOCIACAO.endereco.bairro }}<br />
            {{ ASSOCIACAO.endereco.cidade }}/{{ ASSOCIACAO.endereco.uf }}, CEP
            {{ ASSOCIACAO.endereco.cep }}
          </p>
          <p class="discreto">CNPJ {{ ASSOCIACAO.cnpj }}</p>
        </div>

        <div class="coluna">
          <p class="titulo-rodape">Fale com a gente</p>
          <a v-for="t in ASSOCIACAO.telefones" :key="t.e164" :href="`tel:${t.e164}`">
            {{ t.numero }} <span class="discreto">— {{ t.rotulo }}</span>
          </a>
          <a :href="`mailto:${ASSOCIACAO.email}`">{{ ASSOCIACAO.email }}</a>
        </div>

        <div class="coluna">
          <p class="titulo-rodape">Redes sociais</p>
          <a v-for="rede in ASSOCIACAO.redes" :key="rede.url" :href="rede.url">{{ rede.nome }}</a>
        </div>

        <div class="coluna">
          <p class="titulo-rodape">Institucional</p>
          <NuxtLink to="/sobre">Sobre nós</NuxtLink>
          <NuxtLink to="/regimento">Regimento interno</NuxtLink>
          <NuxtLink to="/comtrad">COMTRAD</NuxtLink>
        </div>
      </div>

      <p class="discreto aviso-rodape">
        Site em construção por trabalho voluntário. As informações estão sendo revisadas com a
        associação.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.pagina {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.conteudo {
  flex: 1;
  width: 100%;
  max-width: 1120px;
  margin-inline: auto;
  padding: var(--e5) clamp(var(--e3), 4vw, var(--e6)) var(--e7);
  display: flex;
  flex-direction: column;
  gap: var(--e6);
}

.marca,
.marca:visited {
  display: flex;
  align-items: center;
  gap: var(--e3);
  text-decoration: none;
  color: var(--texto);
}

.logo {
  height: 76px;
  width: auto;
  border-radius: var(--raio-p);
}

.nome {
  font-weight: var(--peso-forte);
  line-height: 1.2;
  font-size: var(--texto-rotulo);
}

.alternar {
  display: none;
}

.cabecalho nav .conta {
  display: flex;
  align-items: center;
  padding-left: var(--e2);
  border-left: 1px solid var(--borda-suave);
}
/*
  A divisória vertical só vira horizontal quando a navegação **já** virou coluna, e isso
  acontece em 860px (a regra do menu sanfonado, mais abaixo). Enquanto os dois números
  discordavam — a divisória em 900, o menu em 860 —, a faixa de 861 a 900px recebia
  `width: 100%` numa navegação ainda horizontal, e o bloco da conta caía para a segunda
  linha. Era o mesmo defeito do REQ-1, sobrevivendo numa faixa estreita de largura.
  Se um dos dois mudar, o outro muda junto.
*/
@media (width <= 860px) {
  .cabecalho nav .conta {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid var(--borda-suave);
    padding-top: var(--e2);
    width: 100%;
  }
}
.cabecalho nav .conta a {
  font-weight: 700;
  color: var(--primaria);
}
.cabecalho nav .conta a:visited {
  color: var(--primaria);
}
.cabecalho nav ul {
  gap: var(--e1);
}

/* Rodapé */
.colunas {
  width: 100%;
  max-width: 1120px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--e5);
}

.coluna {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}

.coluna a {
  min-height: var(--alvo-min);
  display: inline-flex;
  align-items: center;
}

.logo-rodape {
  height: 64px;
  width: auto;
  border-radius: var(--raio-p);
  /* Fundo claro fixo: a marca tem verde e azul sobre branco e some no rodapé escuro. */
  background: #fff;
  padding: 4px;
  margin-bottom: var(--e1);
  align-self: flex-start;
}

.titulo-rodape {
  font-weight: var(--peso-forte);
  font-size: var(--texto-corpo-g);
}

.aviso-rodape {
  width: 100%;
  max-width: 1120px;
  margin-inline: auto;
  border-top: var(--borda-largura) solid rgba(255, 255, 255, 0.2);
  padding-top: var(--e3);
}

@media (max-width: 860px) {
  .alternar {
    display: inline-flex;
  }

  .cabecalho nav {
    display: none;
    width: 100%;
  }

  .cabecalho nav.aberto {
    display: block;
    border-top: var(--borda-largura) solid var(--borda-suave);
    padding-top: var(--e2);
  }

  /*
    Aqui só o que muda com o menu sanfonado. A divisória e a cor do link da conta já vêm
    da regra de ≤860px acima — repeti-las nesta media query trazia de volta o
    `border-left` vertical que aquela regra tinha acabado de tirar, porque esta vem
    depois na cascata.
  */
  .cabecalho nav ul {
    flex-direction: column;
  }

  .cabecalho nav a {
    width: 100%;
  }
}
</style>
