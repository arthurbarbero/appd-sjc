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

/*
  O menu estreito é um painel que se sobrepõe à página, e não uma sanfona que a empurra
  para baixo (2026-08-20). Isso muda o que ele precisa fazer para continuar acessível:

  - **Esc fecha**, e o foco volta ao botão que abriu. Quem abriu por teclado não fica
    preso num painel sem saber como sair.
  - **O foco não escapa** para o conteúdo atrás enquanto ele está aberto. Um painel que
    cobre a página mas deixa o Tab passar por baixo é pior que a sanfona: a pessoa navega
    para links que não consegue ver.
  - **A página de trás não rola.** Sem isso, rolar dentro do painel arrasta o conteúdo
    atrás e a pessoa fecha o menu num lugar diferente de onde estava.

  Nada disso vale na largura em que o menu é uma barra normal — por isso tudo é ligado e
  desligado por `menuAberto`, que só fica verdadeiro onde existe o botão.
*/
const painel = ref<HTMLElement | null>(null)
const botaoMenu = ref<HTMLElement | null>(null)

/*
  Em que largura o menu é painel, e não barra.

  Precisa ser sabido no script, e não só no CSS, porque o painel fechado tem de ficar
  `inert` — fora da ordem de tabulação e fora da árvore de acessibilidade. Esconder por
  `visibility` faria isso, mas impede focar o primeiro link no mesmo quadro em que o
  painel abre, e o foco acabava ficando para trás.

  O ponto de quebra está escrito duas vezes, aqui e no CSS, e não há como não estar. Se um
  mudar, o outro muda junto — é o mesmo par que a divisória da conta já mantinha alinhado.
*/
const PONTO_DE_QUEBRA = '(max-width: 860px)'
const estreito = ref(false)

onMounted(() => {
  const consulta = window.matchMedia(PONTO_DE_QUEBRA)
  estreito.value = consulta.matches
  consulta.addEventListener('change', (evento) => {
    estreito.value = evento.matches
    // Alargou a janela com o painel aberto: ele deixa de existir, e o estado tem de saber.
    if (!evento.matches) menuAberto.value = false
  })
})

const FOCAVEIS =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

function aoTeclar(evento: KeyboardEvent) {
  if (!menuAberto.value) return

  if (evento.key === 'Escape') {
    evento.preventDefault()
    fecharMenu()
    return
  }

  if (evento.key !== 'Tab' || !painel.value) return

  const alvos = [...painel.value.querySelectorAll<HTMLElement>(FOCAVEIS)].filter(
    (el) => el.offsetParent !== null,
  )
  if (alvos.length === 0) return

  const primeiro = alvos[0]!
  const ultimo = alvos[alvos.length - 1]!
  const atual = document.activeElement

  if (evento.shiftKey && (atual === primeiro || !painel.value.contains(atual))) {
    evento.preventDefault()
    ultimo.focus()
  } else if (!evento.shiftKey && atual === ultimo) {
    evento.preventDefault()
    primeiro.focus()
  }
}

function fecharMenu() {
  menuAberto.value = false
  botaoMenu.value?.focus()
}

function alternarMenu() {
  menuAberto.value = !menuAberto.value
}

watch(menuAberto, async (aberto) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = aberto ? 'hidden' : ''
  if (!aberto) return
  await nextTick()
  const primeiro = painel.value?.querySelector<HTMLElement>(FOCAVEIS)
  primeiro?.focus()
})

onMounted(() => document.addEventListener('keydown', aoTeclar))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', aoTeclar)
  document.body.style.overflow = ''
})

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

      <!--
        Ícone de três traços, e não a palavra "Menu" (2026-08-20).

        O rótulo acessível continua sendo texto: `aria-label` muda entre "Abrir menu" e
        "Fechar menu" conforme o estado, e `aria-expanded` diz o estado a quem usa leitor
        de tela. Trocar a palavra visível pelo ícone não pode custar o nome do controle.
      -->
      <button
        ref="botaoMenu"
        type="button"
        class="alternar"
        :aria-expanded="menuAberto"
        aria-controls="menu-principal"
        :aria-label="menuAberto ? 'Fechar menu' : 'Abrir menu'"
        @click="alternarMenu"
      >
        <span class="tracos" aria-hidden="true"></span>
      </button>

      <!--
        A cortina fecha o painel ao ser tocada e escurece o que está atrás, dizendo que a
        página continua ali. `aria-hidden` porque quem usa teclado fecha por Esc e quem
        usa leitor de tela fecha pelo botão — a cortina não acrescenta nada a eles.
      -->
      <div v-if="menuAberto" class="cortina" aria-hidden="true" @click="fecharMenu"></div>

      <nav
        id="menu-principal"
        ref="painel"
        aria-label="Principal"
        :class="{ aberto: menuAberto }"
        :inert="estreito && !menuAberto"
      >
        <!--
          Um botão de fechar dentro do painel.

          O hambúrguer que abriu fica atrás da cortina quando o painel cobre a direita da
          tela, então quem abriu por toque não tem para onde voltar: sobraria tocar fora,
          que ninguém descobre sozinho, ou o Esc, que não existe em telefone. Este botão é
          a saída visível — e por isso ele é o primeiro item do painel, que é onde o foco
          entra ao abrir.
        -->
        <button type="button" class="fechar" aria-label="Fechar menu" @click="fecharMenu">
          <span aria-hidden="true">✕</span>
        </button>

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

    <!--
      Com o painel aberto, tudo o que está atrás fica inerte.

      O laço de Tab em `aoTeclar` já devolvia o foco ao início do painel, mas ele é código
      nosso reagindo a uma tecla; `inert` é o navegador tirando a região inteira da ordem
      de tabulação e da árvore de acessibilidade, o que também cobre atalho de leitor de
      tela e clique. Os dois juntos: o laço mantém o ciclo dentro do painel, o `inert`
      garante que não haja para onde escapar.
    -->
    <main id="conteudo" class="conteudo" :inert="estreito && menuAberto">
      <slot />
    </main>

    <footer class="rodape sobre-escuro" :inert="estreito && menuAberto">
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
          <NuxtLink to="/privacidade">Política de Privacidade</NuxtLink>
          <NuxtLink to="/seus-direitos">Seus direitos</NuxtLink>
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
  /*
    O painel fechado fica em `translateX(100%)`, isto é, fora da borda direita. Sem esta
    linha ele empurraria a largura do documento e apareceria uma barra de rolagem lateral
    numa página que não tem conteúdo lateral nenhum.
  */
  overflow-x: hidden;
}

.conteudo {
  flex: 1;
  width: 100%;
  max-width: var(--bloco);
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

/* ---------- o botão de três traços ---------- */

.alternar {
  display: none;
  align-items: center;
  justify-content: center;
  width: var(--alvo-min);
  height: var(--alvo-min);
  padding: 0;
  border: var(--borda-largura) solid var(--borda-suave);
  border-radius: var(--raio-botao);
  background: var(--fundo);
  color: var(--texto);
  cursor: pointer;
}

.alternar:hover {
  border-color: var(--primaria);
  background: var(--primaria-tenue);
}

/*
  Os três traços saem de um elemento só: o do meio é o próprio `span`, os de fora são os
  pseudoelementos. Menos nó no DOM e nada para um leitor de tela tropeçar — o nome do
  controle está no `aria-label` do botão.
*/
.tracos,
.tracos::before,
.tracos::after {
  display: block;
  width: 22px;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
}

.tracos {
  position: relative;
}

.tracos::before,
.tracos::after {
  content: '';
  position: absolute;
  left: 0;
}

.tracos::before {
  top: -7px;
}

.tracos::after {
  top: 7px;
}

/*
  O botão de fechar só existe onde existe o painel. Na barra larga ele seria um ✕ solto no
  meio da navegação.
*/
.fechar {
  display: none;
  align-self: flex-end;
  align-items: center;
  justify-content: center;
  width: var(--alvo-min);
  height: var(--alvo-min);
  padding: 0;
  border: 0;
  border-radius: var(--raio-botao);
  background: none;
  color: var(--texto);
  font-size: var(--texto-titulo-m);
  line-height: 1;
  cursor: pointer;
}

.fechar:hover {
  background: var(--superficie-forte);
}

/* ---------- a cortina atrás do painel ---------- */

.cortina {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(20, 22, 26, 0.5);
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
  max-width: var(--bloco);
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
  max-width: var(--bloco);
  margin-inline: auto;
  border-top: var(--borda-largura) solid rgba(255, 255, 255, 0.2);
  padding-top: var(--e3);
}

/*
  Largura intermediária: o nome escrito sai, o símbolo fica.

  Entre 861 e 1080px os seis links, o bloco da conta e o nome por extenso disputavam a
  mesma linha, e o nome era a parte que podia sair sem perda — ele está no rodapé de toda
  página, e o símbolo continua levando para o início. "Pode ficar só o logo, esses todos
  vêm pra cima", disse o dono em 2026-08-20.
*/
@media (max-width: 1080px) {
  /*
    O nome sai da tela, **não** da árvore de acessibilidade.

    Com `display: none` o axe acusou `link-name`: a marca é um link cujo único texto é
    este nome — a imagem ao lado tem `alt` vazio de propósito, porque duplicava a leitura.
    Escondido assim, o link fica sem nome nenhum para quem usa leitor de tela, e o defeito
    aparece só nas larguras em que o nome some. É a receita de `.so-leitor-de-tela`,
    repetida aqui porque media query não troca classe.
  */
  .marca .nome {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  .logo {
    height: 60px;
  }
}

/*
  Abaixo de 860px o menu vira painel sobreposto, deslizando da direita.

  Antes ele era uma sanfona que empurrava a página para baixo — "só pra não ter esse
  blanco pra baixo", foi o pedido. O painel cobre parte da tela, escurece o resto e
  devolve a página intacta ao fechar, sem mexer na posição de rolagem.

  `translateX(100%)` no estado fechado, e não `display: none`: é o que permite deslizar.
  A visibilidade é desligada junto para o painel fechado não receber foco.
*/
@media (max-width: 860px) {
  .alternar {
    display: inline-flex;
  }

  .cabecalho nav {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    width: min(320px, 85vw);
    display: flex;
    flex-direction: column;
    gap: var(--e2);
    padding: var(--e3) var(--e4) var(--e4);
    background: var(--fundo);
    border-left: var(--borda-largura) solid var(--borda-suave);
    box-shadow: var(--sombra-2);
    overflow-y: auto;
    transform: translateX(100%);
    transition: transform var(--transicao);
  }

  .cabecalho nav.aberto {
    transform: translateX(0);
  }

  .fechar {
    display: inline-flex;
  }

  .cabecalho nav ul {
    flex-direction: column;
    gap: var(--e1);
  }

  .cabecalho nav a {
    width: 100%;
  }

  /* Dentro do painel a conta é o último item da coluna, não um bloco ao lado. */
  .cabecalho nav .conta {
    margin-top: auto;
  }
}

/*
  Movimento reduzido: o painel aparece, não desliza.

  A regra global de `prefers-reduced-motion` em tokens.css já zera a duração de todas as
  transições; esta existe porque o painel não pode depender **só** dela para funcionar —
  se a transição some, `visibility` precisa mudar na hora, ou o painel fica invisível.
*/
@media (prefers-reduced-motion: reduce) {
  .cabecalho nav {
    transition: none;
  }
}
</style>
