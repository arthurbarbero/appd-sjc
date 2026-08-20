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

### T2 — B2, o salto de rolagem

Cobre REQ-8, REQ-9.

**Reproduzir antes de corrigir.** O defeito degradou durante a gravação, de "ao trocar de
aba" para "a cada clique em qualquer lugar". A task só fecha com a causa nomeada por
escrito na própria task; corrigir o sintoma reprova REQ-9.

**Aceite**: os dois cenários de rolagem, mais a causa registrada.

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

### T11 — Cadastro: os campos 17 e 18

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

### T15 — Gate de validação

Rodar `npm test`, `npm run aceite`, lint, typecheck e a passada de acessibilidade;
escrever `VALIDACAO.md` com o veredito de cada cenário e onde ele roda, no padrão das três
changes já arquivadas; atualizar `PROGRESS.md` e o `openspec/README.md`.

A change **não vai para `archive/`** enquanto a Fase 2 estiver aberta.
