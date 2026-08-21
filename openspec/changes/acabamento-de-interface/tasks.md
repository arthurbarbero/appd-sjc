# Tasks: acabamento de interface

- Spec: [`spec.md`](spec.md) · Proposal: [`proposal.md`](proposal.md)
- Fases 1 e 3 não dependem de terceiros. **A Fase 2 para no canvas** — nenhuma tela dela
  começa antes do design aprovado, pela regra do `CLAUDE.md`.

Cada task fecha com os cenários Gherkin que ela cobre passando em `npm test` ou
`npm run aceite`, e com `npm run lint` e `npm run typecheck` limpos.

## Fase 1 — a causa comum e os defeitos

### T1 — O sistema de largura

Cobre REQ-1 a REQ-6.

Tirar `max-width: var(--medida)` do seletor `p` em `app/assets/css/base.css:50`; criar o
portador explícito de texto corrido e o token único de largura de bloco; varrer as páginas
que hoje declaram largura por conta própria (`AppdOferta.vue`, `inscricao.vue`,
`comtrad.vue`, `regimento.vue`, `sobre.vue`) e passá-las ao token.

**Aceite**: os cinco cenários de "A largura do conteúdo". A varredura é do repositório
inteiro, não das telas citadas no vídeo — a lição do marcador de lugar que sobreviveu na
rota vizinha.

### T2 — B2, o salto de rolagem — **NÃO REPRODUZIU**

Cobre REQ-8, REQ-9.

A task exigia nomear a causa antes de corrigir. O resultado da investigação é que **não
há defeito confirmado no código**, e por isso nada foi corrigido — mexer aqui seria
inventar conserto para sintoma que não se manifesta.

O que foi tentado, em 2026-08-20:

| Hipótese                                      | Como foi testada                                                                                   | Resultado                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------- |
| Rolagem preservada ao trocar de seção         | Playwright, conta criada no dev, clique em cada item do menu com a página no topo e rolada         | `scrollY` volta a 0 sempre    |
| Posição restaurada ao voltar para `/area`     | Sequência exata do vídeo: `/area` rolada → `/area/cracha` → "Início"                               | `scrollY` = 0 nas duas voltas |
| Clique em região neutra rola                  | Clique em área sem controle, página rolada                                                         | `scrollY` não muda            |
| Layout shift (conteúdo que carrega e empurra) | `PerformanceObserver` de `layout-shift` em `/area`, `/area/cracha` e `/`, no dev **e** em produção | CLS = 0,0000 em todas         |

O que o vídeo mostra, e sustenta a leitura de estado transitório: o dono deu um refresh
e disse "por aqui tá normal" (09:26); mais tarde relatou "fiz um refresh esquisito"
(11:49). Na mesma sessão há um popup do LastPass aberto sobre a página (08:22).

**O que falta**, e é do dono: dizer se o salto volta a acontecer, de preferência com as
extensões do navegador desativadas. Se voltar, a gravação desse momento fecha a causa.

Enquanto isso, REQ-8 e REQ-9 viram **teste de regressão** no aceite — o comportamento
correto de hoje fica travado, e uma regressão futura reprova.

### T3 — B1, a foto ausente no cartão da área

Cobre REQ-7.

**Aceite**: cenário "A foto enviada aparece no cartão da área".

### T4 — B3, o recorte em branco

Cobre REQ-10.

**Aceite**: cenário "Sair do recorte sem confirmar preserva a foto".

### T5 — A mensagem de erro sem o ícone

Cobre REQ-11 a REQ-13.

Remover o `<span class="icone">✕</span>` de todos os campos; ajustar o corpo do texto sem
passar do piso de 15px; **conferir campo a campo se a frase diz o que está errado** — é
ela que passa a carregar a sinalização não-cromática.

**Aceite**: os dois cenários de "A mensagem de erro", e o teste de acessibilidade não
acusa erro sinalizado só por cor.

## Fase 2 — cabeçalho e navegação — **BLOQUEADA: espera o canvas**

### T6 — Design das três telas

Cobre REQ-14 a REQ-19.

Preparar o prompt e os tokens; o dono opera o canvas; ler o resultado com DesignSync e
auditar em `docs/`. Sem isto, T7 e T8 não começam.

### T7 — Cabeçalho e menu deslizante

Cobre REQ-14 a REQ-17, REQ-42, REQ-43, REQ-47.

### T8 — Área do associado em menu lateral

Cobre REQ-18, REQ-19, REQ-44, REQ-45.

## Fase 3 — conteúdo e campos

### T9 — Início

Cobre REQ-21, REQ-22.

### T10 — Cadastro: o que sai e o que muda de forma

Cobre REQ-23, REQ-24, REQ-28, REQ-29.

### T11 — Cadastro: os campos 20 e 21

Cobre REQ-25 a REQ-27.

Migration com as colunas `estado` e `pais`; a consulta de CEP passa a devolver a UF;
`docs/campos-formulario.md` ganha os dois campos com data e dono da decisão; a regra do
`CLAUDE.md` é reescrita para dizer o que ela sempre quis dizer — os 15 originais não
mudam, acrescentar é decisão do dono.

**Aceite**: os cinco cenários de "Os campos novos do endereço".

### T12 — Área do associado: conteúdo e comportamento

Cobre REQ-31 a REQ-36.

### T13 — Excluir conta e crachá: o texto que sai

Cobre REQ-37, REQ-38.

### T14 — Sobre e Contato

Cobre REQ-39, REQ-40, REQ-41.

REQ-39 depende de conteúdo do dono: a tela precisa comportar as duas biografias com a
mesma profundidade, mas o texto da fundadora é dele.

## Fechamento

### T15 — Gate de validação — **PENDENTE, com um achado**

`npm test` está verde: **307 testes**, contra 233 antes desta change. `npm run lint`,
`npm run typecheck` e `npm run build` também passam.

`npm run aceite` **ainda não passou**, e a razão precisa ser investigada com calma, não no
fim de uma sessão longa:

- O percurso ganhou os campos 20 e 21 no preenchimento (sem isso ele nem chegava à área).
- Depois disso, ele avança até a etapa 6 e **falha em `/area/excluir`, que redireciona
  para `/entrar?sessao=terminada`** — a sessão não existe mais nesse ponto. As etapas
  anteriores, inclusive a retirada de consentimento em `/seus-direitos`, acontecem com
  sessão válida.
- Reproduzido isoladamente, `/area/excluir` funciona: conta criada, consentimento
  retirado, a tela abre com o botão no lugar. **O percurso completo é que perde a
  sessão**, e não a tela.
- Ainda não sei se isto é regressão desta change ou comportamento que já existia — o
  percurso não rodava desde 2026-08-11. **Descobrir isso é o primeiro passo**: rodar o
  aceite no commit `330a9b4`, antes de qualquer mudança daqui, e comparar.

Cuidado que custou tempo nesta sessão e vale registrar: rodar o aceite várias vezes
seguidas, junto de scripts de reprodução que também criam conta, **estoura a cota de 12
cadastros por 15 minutos** e o percurso passa a falhar com 429 em lugares que parecem
outro defeito. Limpar com `wrangler d1 execute appd-sjc --local --command "DELETE FROM
tentativas;"`.

### T15b — Fechamento

Rodar `npm test`, `npm run aceite`, lint, typecheck e a passada de acessibilidade;
escrever `VALIDACAO.md` com o veredito de cada cenário e onde ele roda, no padrão das três
changes já arquivadas; atualizar `PROGRESS.md` e o `openspec/README.md`.

A change **não vai para `archive/`** enquanto a Fase 2 estiver aberta.
