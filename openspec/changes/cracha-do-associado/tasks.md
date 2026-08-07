# Tasks: Crachá do associado e verificação pública

Deriva de SPEC-cracha-do-associado v3. Fatias verticais: cada uma entrega algo verificável
sozinho e tem aceite ligado a cenário Gherkin da spec. Dono padrão: Arthur Barbero
(decisão) / Claude Code (execução). Nada começa antes do gate do revisor-spec.

## Fatia 0 — Gates que destravam o resto

- [x] **T0.1 — ADR de armazenamento de foto.** Já escrito: `docs/adr/adr-003-foto-do-cracha-como-blob-no-d1.md`
      com contexto (R2 exige método de pagamento, ADR-001 já aponta a lacuna), decisão (BLOB no
      D1 atrás de `ArmazenamentoFoto`), alternativas (R2, Cloudflare Images, base64 em texto,
      hospedagem doada) e consequências, incluindo os números de capacidade do REQ-37.
      **Aceite**: ADR aceito e assinado pelo dono; cenários de "Capacidade e limites do D1"
      referenciam os mesmos números.
- [x] **T0.2 — ADR de liberação imediata.** Já escrito:
      `docs/adr/adr-004-liberacao-imediata-do-cracha.md`: sem aprovação prévia nesta versão,
      com o gatilho de revisão explícito (a APPD pedir moderação, ou aparecer uso indevido).
      **Aceite**: ADR aceito; REQ-27 aponta para ele.
- [x] **T0.3 — Gate do revisor-spec.** Rodado em 2026-08-07: veredito **READY** na forma,
      registrado em `openspec/PARECER-GATE-AUTOMATICO.md`. Mérito continua sendo do dono.
- [x] **T0.4 — Design aprovado no Claude Design.** As **duas** telas foram geradas pelo
      dono em 2026-08-07 (`templates/cracha/` e `templates/verificar/` no projeto do
      canvas) e lidas por DesignSync. Handoff, com as quatro correções que a implementação
      aplica, em [handoff-design-cracha.md](../../../docs/handoff-design-cracha.md).
      **Destrava as fatias 3, 4 e 5.**

## Fatia 1 — Número de registro: movida para `cadastro-e-login`

**T1.1 a T1.4 não existem mais aqui** (ADR-013). A coluna é de `modelo-de-dados`, o emissor
é de `cadastro-e-login`, e a T1.2 original — "lê o maior sequencial do ano e grava o
próximo" — está **revogada**: quebra com cadastros simultâneos, e contradizia frontalmente
o REQ-4 da change dona (bloqueio B10 do gate).

- [x] **T1.0** — Conferido: a emissão é de `cadastro-e-login` e roda no cadastro; esta change só
      exibe o número. _Feito em 2026-08-07._

## Fatia 2 — Armazenamento da foto (sem tela)

- [x] **T2.1** — Interface `ArmazenamentoFoto` em `shared/foto.ts`, implementação D1/BLOB em
      `server/utils/foto.ts`. **Aceite**: nenhuma rota referencia `schema.fotos` direto — só o
      utilitário. _Feito em 2026-08-07._
- [x] **T2.2** — Migration da tabela de foto (BLOB, dono, tipo, bytes, criado_em).
      _Feita dentro de `modelo-de-dados` e aplicada no D1: `fotos` em
      `server/database/schema.ts`, com os `CHECK` de 102.400 bytes, `image/jpeg` e
      400 × 500. Marcada em 2026-08-07, ao ser conferida na auditoria._
- [x] **T2.3** — `PUT /api/area/foto`, com revalidação nos bytes recebidos: SOI e marcador de
      quadro do JPEG, dimensão 400 × 500 lida do cabeçalho, teto de 102.400. **Aceite**: os 9
      testes de `test/foto.spec.ts` — inclusive PNG legítimo recusado e cabeçalho truncado.
      _Feito em 2026-08-07._
- [x] **T2.4** — `GET /api/area/foto`: 401 sem sessão. A rota **não aceita parâmetro de
      usuário** — sem parâmetro não há foto alheia para pedir, e some a escolha entre 403 e 404,
      que confirmariam as duas a existência do cadastro. _Feito em 2026-08-07._
- [ ] **T2.5** — Métrica de ocupação (contagem × tamanho médio) exposta ao operador.
      **Aceite**: REQ-38.

## Fatia 3 — Envio, recorte e compressão no navegador

- [x] **T3.1** — `app/components/AppdFoto.vue`: moldura 4:5, arrasto por ponteiro, setas movem,
      `+` e `−` aproximam, e os mesmos controles como botão de 44 px. _Feito em 2026-08-07._
- [x] **T3.2** — Compressão em `canvas`: 400 × 500, JPEG 0,75, tamanho medido e exibido.
      _Feito em 2026-08-07._
- [x] **T3.3** — Teto rígido no cliente e no servidor, com o tamanho obtido na mensagem. Nada de
      baixar qualidade nem recortar mais para caber. _Feito em 2026-08-07._
- [x] **T3.4** — As duas recusas acontecem antes de qualquer processamento. _Feito em 2026-08-07._
- [x] **T3.5** — `role="progressbar"` com `aria-valuenow`, dentro da região `aria-live` que
      envolve os cinco estados. _Feito em 2026-08-07._
- [x] **T3.6** — Falha no envio preserva o recorte: o blob continua em memória e a tela oferece
      "Tentar de novo". Recortar de novo é o passo em que se desiste. _Feito em 2026-08-07._
- [x] **T3.7** — Sem `canvas.toBlob`, a tela orienta e **não** envia a original. _Feito em
      2026-08-07._

## Fatia 4 — Crachá e exportação

- [x] **T4.1** — `AppdCracha.vue`, frente e verso, medidas em **milímetros** para a impressão sair
      no tamanho de verdade. **Aceite**: o gate lê o cartão (não a página) e falha se aparecer
      endereço, telefone ou nascimento da pessoa. _Feito em 2026-08-07._
- [x] **T4.2** — QR no verso, com a URL por extenso ao lado. _Feito em 2026-08-07._
- [x] **T4.3** — PNG e PDF desenhados em `canvas` e montados byte a byte, sem dependência nova:
      as bibliotecas de HTML-para-imagem baixam fonte em tempo de execução, o que quebraria o
      REQ-23 de forma invisível. **Aceite**: o gate conta requisições durante a exportação e exige
      zero — descontando o polling de manifesto do Nuxt, nomeado no teste. _Feito em 2026-08-07._
- [x] **T4.4** — Folha A4 com marcas de corte e a instrução de imprimir em 100%. _Feito em
      2026-08-07._
- [x] **T4.5** — Caixa única e separada, desmarcada por padrão, persistida em
      `usuarios.cracha_mostra_deficiencia`. **Efeito restrito por construção**: sem a marca, a
      rota do crachá **nem consulta** o campo 12 — a proteção está na consulta, não no template.
      **Aceite**: o gate confere que nasce desmarcada e que o texto não usa "recomendado",
      "ajuda" ou "facilita". _Feito em 2026-08-07._
- [x] **T4.6** — Sem foto, baixar fica desabilitado com o motivo em `aria-describedby`. O gate
      falha se aparecer "em análise", "aguardando aprovação" ou selo de validação. _Feito em
      2026-08-07._

## Fatia 5 — Verificação pública

- [x] **T5.1** — `/verificar/<numero>` renderizada no servidor (`useFetch` no SSR), com projeção
      coluna a coluna. **Aceite**: o aceite confere que o nome e o número aparecem, que a situação
      é exibida, e que **nenhum valor do campo 12 aparece no HTML bruto** — atributo e comentário
      inclusive. _Feito em 2026-08-07._
- [x] **T5.2** — Resposta única. O número mal formatado vira consulta que não casa, em vez de
      `return` antecipado: dois caminhos de código produziriam dois tempos de resposta, e o tempo
      diria o que a mensagem cala. **Aceite**: o aceite compara os dois blocos e exige igualdade.
      _Feito em 2026-08-07._
- [x] **T5.3** — Situação inativa em âmbar (`.selo-atencao`), sem vermelho e sem a palavra
      "inválido". _Feito em 2026-08-07._
- [x] **T5.4** — Declaração em corpo normal logo abaixo da resposta. _Feito em 2026-08-07._
- [x] **T5.5** — Campo único, sem busca por nome nem sugestão. _Feito em 2026-08-07._
- [x] **T5.6** — 20 por minuto por **hash** de IP (`server/utils/limite.ts`), com 429 neutro.
      Medido no workerd: 20 passam, a 21ª devolve 429, e outro IP não é afetado. Sem
      `LIMITE_SEGREDO` a rota **recusa contar** em vez de gravar IP em claro.
      _Feito em 2026-08-07._
- [x] **T5.7** — Bloco presente, com o selo "A confirmar" visível. _Feito em 2026-08-07._

## Fatia 6 — Validação e fechamento

- [ ] **T6.1** — Teste de vazamento: varredura do HTML e das respostas de API de
      `/verificar/<numero>` procurando qualquer campo do cadastro fora dos cinco permitidos
      (ADR-015), **em especial o campo 12**. **Bloqueante**: falhou, a change não fecha.
- [ ] **T6.2** — axe em 1280 px e 360 px nas dez telas (seis do crachá, quatro da verificação).
      **Aceite**: cenário "Sem violação de acessibilidade automatizável".
- [ ] **T6.3** — Percurso completo por teclado gravado no relatório de validação. **Aceite**:
      cenário "Percurso completo por teclado".
- [ ] **T6.4** — Seeds e fixtures só com dado fictício, marcado como fictício no arquivo; gitleaks
      verde. **Aceite**: REQ-43.
- [ ] **T6.5** — Validação item a item contra todos os cenários Gherkin (skill `validacao-aceite`),
      atualização do `PROGRESS.md` e movimentação para `openspec/archive/cracha-do-associado/`.

## Sequência e dependências

```
T0.1 T0.2 T0.3 T0.4  →  Fatia 1  →  Fatia 2  →  Fatia 3  →  Fatia 4
                                        └──────────────────→  Fatia 5
Fatia 4 e Fatia 5  →  Fatia 6
```

T0.4 (design aprovado) bloqueia as fatias 3, 4 e 5 — nenhuma tela é implementada antes.
As fatias 1 e 2 podem começar assim que o gate T0.3 passar, porque não têm interface.
