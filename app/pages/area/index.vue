<script setup lang="ts">
import { ASSOCIACAO } from '~~/shared/conteudo'

/*
  Painel da área do associado — `/area`. Layout do canvas aprovado em 2026-08-06.

  A estética é de **lista de assuntos, não dashboard**: quem chega tem um motivo
  específico (ver se o cadastro está certo, mostrar o crachá, corrigir um telefone), e
  cartão de métrica com número gigante não ajuda nisso.

  **Nenhum bloco exibe tipo de deficiência** (REQ-5). A rota que alimenta esta tela nem
  devolve o campo — a proteção está na projeção do SQL, não na disciplina de quem escreve
  o template.
*/

useHead({ title: 'Minha área — APPD São José dos Campos' })

const sede = ASSOCIACAO.telefones[0]!
const rota = useRoute()
const { data, pending, error } = await useFetch('/api/area/meus-dados')

/** Chega preenchido quando a pessoa acabou de concluir o cadastro. */
const recemCadastrada = computed(() => String(rota.query.cadastro ?? ''))

/*
  A foto é a única parte do cadastro que pode falhar sozinha (REQ-7f de
  `formulario-atendimento`): ela sobe depois da transação, já com a sessão aberta. Quando
  falha, o cadastro está gravado e só a imagem ficou para trás — e a tela precisa dizer
  isso, senão a pessoa fica achando que perdeu tudo por causa de uma foto.
*/
const fotoFalhou = computed(() => rota.query.foto === 'falhou')

/*
  Endereço público de conferência do crachá.

  A origem vem do pedido, não de uma constante: em `workers.dev`, em pré-visualização e no
  domínio da APPD o valor é diferente, e um QR apontando para o ambiente errado é um QR
  que leva a lugar nenhum na mão de quem confere.

  **A página `/verificar/<numero>` ainda não existe** — é a Fatia 5 de
  `cracha-do-associado`, travada pela T0.4 (design aprovado). Até ela subir, este código
  leva a um 404. Está registrado em `openspec/ESTADO.md`.
*/
const origem = useRequestURL().origin
const urlVerificacao = (numero: string) => `${origem}/verificar/${numero}`

function dataBr(iso?: string | null) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

/*
  O banco guarda só dígitos — é o formato certo para comparar e para discar. Quem lê
  espera pontuação: `12239-530`, `(12) 99165-7059`. Formatar na exibição, e não na
  gravação, mantém as duas coisas certas.
*/
function cepBr(cep?: string | null) {
  if (!cep || cep.length !== 8) return cep ?? '—'
  return `${cep.slice(0, 5)}-${cep.slice(5)}`
}
</script>

<template>
  <div class="area">
    <h1>Minha área</h1>

    <AppdAviso v-if="recemCadastrada" tipo="sucesso" titulo="Cadastro enviado">
      <span>
        Seus interesses ficaram registrados e a sua conta foi criada. Seu número de registro é
        <strong>{{ recemCadastrada }}</strong> — ele é seu e não muda. A associação entra em contato
        pelo telefone que você informou.
      </span>
    </AppdAviso>

    <AppdAviso v-if="fotoFalhou" tipo="atencao" titulo="A foto não subiu">
      <span>
        Seu cadastro foi gravado normalmente — só a foto do crachá não chegou. Nada se perdeu: envie
        a foto quando quiser, e o crachá fica pronto na hora.
      </span>
    </AppdAviso>

    <p v-if="pending" role="status" class="carregando">Carregando suas informações…</p>

    <AppdAviso v-else-if="error" tipo="erro" titulo="Não conseguimos carregar">
      <span>
        Tente recarregar a página. Se continuar, ligue para
        <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a
        >.
      </span>
    </AppdAviso>

    <template v-else-if="data">
      <div class="identificacao">
        <p class="nome">{{ data.conta.nome }}</p>
        <p class="numero">
          Registro <strong>{{ data.conta.numeroRegistro }}</strong>
        </p>
        <p class="fixo">Este número é seu e não muda.</p>
      </div>

      <AreaNavegacao atual="painel" />

      <section class="cartao destaque" aria-labelledby="t-inscricao">
        <h2 id="t-inscricao">Minhas inscrições</h2>

        <template v-if="data.inscricao">
          <p class="linha-estado">
            <span class="selo selo-sucesso">
              <span aria-hidden="true">✓</span> {{ data.inscricao.status }}
            </span>
            <span class="quando">Pedido em {{ dataBr(data.inscricao.criadoEm) }}</span>
          </p>
          <dl>
            <div>
              <dt>Atendimentos marcados</dt>
              <dd>{{ data.inscricao.atendimentos.join(', ') }}</dd>
            </div>
            <div>
              <dt>Melhores dias</dt>
              <dd>{{ data.inscricao.dias.join(', ') }}</dd>
            </div>
          </dl>
          <p>A associação entra em contato pelo telefone que você informou.</p>
          <div class="acoes">
            <NuxtLink class="botao botao-primario" to="/area/inscricoes">
              Corrigir meu cadastro
            </NuxtLink>
          </div>
        </template>

        <template v-else>
          <h3>Você ainda não pediu atendimento</h3>
          <p>
            O cadastro é gratuito. Seus interesses ficam registrados e a associação entra em contato
            pelo telefone.
          </p>
          <!--
            Aponta para `/area/inscricoes`, e não para o formulário público: quem está
            aqui já tem conta, e o formulário cria conta nova. Desde a guarda de
            `server/middleware/area.ts`, aquele caminho devolveria a pessoa para cá.
          -->
          <NuxtLink class="botao botao-primario" to="/area/inscricoes">
            Fazer meu Cadastro de Atendimento
          </NuxtLink>
          <p>
            Prefere por telefone? <a :href="`tel:${sede.e164}`">{{ sede.numero }}</a>
          </p>
        </template>
      </section>

      <div class="duas-colunas">
        <section class="cartao" aria-labelledby="t-cracha">
          <h2 id="t-cracha">Meu crachá</h2>
          <div class="previa">
            <div v-if="data.temFoto" class="foto" aria-hidden="true">Foto</div>
            <div v-else class="foto sem-foto">Sem foto</div>
            <div>
              <p class="nome-cracha">{{ data.conta.nome }}</p>
              <p>{{ data.conta.numeroRegistro }}</p>
            </div>
          </div>
          <p v-if="!data.temFoto" class="aviso-foto">O crachá precisa de foto para ser impresso.</p>

          <div class="acoes">
            <NuxtLink class="botao botao-primario" to="/area/cracha">
              {{ data.temFoto ? 'Ver e baixar meu crachá' : 'Enviar minha foto' }}
            </NuxtLink>
          </div>

          <!--
            O mesmo código que vai no verso do crachá (`cracha-do-associado` REQ-21). A URL
            aparece escrita por extenso ao lado, e isso é requisito e não redundância: quem
            está do outro lado do balcão pode não ter câmera, ou não saber usar a do
            aparelho, e precisa poder digitar.
          -->
          <div class="verificacao">
            <AppdQrCode :valor="urlVerificacao(data.conta.numeroRegistro)" :tamanho="112" />
            <div>
              <p class="explicacao">Quem receber seu crachá confere aqui que ele é seu:</p>
              <p class="endereco-verificacao">{{ urlVerificacao(data.conta.numeroRegistro) }}</p>
              <p class="explicacao">
                A página mostra sua foto, nome, número e situação. Nunca o tipo de deficiência.
              </p>
            </div>
          </div>
        </section>

        <section class="cartao" aria-labelledby="t-dados">
          <h2 id="t-dados">Meus dados</h2>
          <dl>
            <div>
              <dt>Nome</dt>
              <dd>{{ data.conta.nome }}</dd>
            </div>
            <div>
              <dt>Data de nascimento</dt>
              <dd>{{ dataBr(data.conta.nascimento) }}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{{ data.conta.email }}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{{ mascaraTelefone(data.conta.telefone ?? '') }}</dd>
            </div>
            <div>
              <dt>Endereço</dt>
              <dd>
                {{ data.conta.endereco }}, {{ data.conta.numero
                }}<template v-if="data.conta.complemento">, {{ data.conta.complemento }}</template>
                <br />
                {{ data.conta.bairro }} — {{ data.conta.municipio }}
                <br />
                CEP {{ cepBr(data.conta.cep) }}
              </dd>
            </div>
          </dl>
          <div class="acoes">
            <NuxtLink class="botao botao-secundario" to="/area/dados">Alterar meus dados</NuxtLink>
          </div>
          <p class="explicacao nota">
            A informação sobre deficiência que você deu no Cadastro de Atendimento não é exibida
            aqui. Para consultar ou corrigir, use
            <NuxtLink to="/area/inscricoes">Corrigir meu cadastro</NuxtLink>.
          </p>
        </section>
      </div>

      <section class="excluir" aria-labelledby="t-excluir">
        <h2 id="t-excluir">Excluir minha conta</h2>
        <p>Você pode apagar sua conta quando quiser. É um direito seu pela LGPD.</p>
        <NuxtLink class="botao botao-destrutivo" to="/area/excluir">Excluir minha conta</NuxtLink>
      </section>
    </template>
  </div>
</template>

<style scoped>
.area {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}
.identificacao {
  background: var(--superficie);
  border-radius: var(--raio);
  padding: var(--e3);
  max-width: 44ch;
}
.identificacao p {
  margin: 0;
}
.nome {
  font-size: 1.19rem;
  font-weight: 700;
}
.numero {
  font-size: 1.19rem;
  font-variant-numeric: tabular-nums;
}
.fixo {
  font-size: 0.94rem;
  color: var(--texto-suave);
}
.destaque {
  border-color: var(--borda);
  box-shadow: var(--sombra-1);
}
.linha-estado {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--e2);
}
.quando {
  color: var(--texto-suave);
  font-size: 0.94rem;
}
dl {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--e3);
}
dt {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--texto-suave);
}
dd {
  margin: 0;
}
.duas-colunas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--e3);
  align-items: start;
}
.duas-colunas dl {
  grid-template-columns: 1fr;
}
.previa {
  display: flex;
  gap: var(--e3);
  align-items: center;
  border: 1px solid var(--borda-suave);
  border-radius: var(--raio);
  padding: var(--e2);
}
.foto {
  width: 96px;
  height: 120px;
  flex: none;
  border-radius: var(--raio-botao);
  background: var(--superficie-forte);
  color: var(--texto-suave);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.sem-foto {
  background: var(--superficie);
  border: 2px dashed var(--borda);
}
.nome-cracha {
  font-weight: 700;
  margin: 0;
}
.aviso-foto {
  font-weight: 700;
}
.explicacao {
  font-size: 0.94rem;
  color: var(--texto-suave);
}
.nota {
  border-top: 1px solid var(--borda-suave);
  padding-top: var(--e2);
}
.verificacao {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
  align-items: flex-start;
}
.verificacao p {
  margin: 0 0 4px;
}
.endereco-verificacao {
  font-family: var(--fonte-mono, monospace);
  font-size: 0.94rem;
  /* Endereço longo em cartão estreito: quebra em qualquer ponto em vez de estourar. */
  overflow-wrap: anywhere;
}
.excluir {
  border: 1px solid var(--primaria);
  border-radius: var(--raio);
  padding: var(--e3);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  align-items: flex-start;
  margin-top: var(--e3);
}
.excluir h2,
.excluir p {
  margin: 0;
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
}
.carregando {
  font-weight: 700;
}
</style>
