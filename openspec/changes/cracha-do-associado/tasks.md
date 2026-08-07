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

- [ ] **T1.0** — Conferir que a emissão de `cadastro-e-login` está entregue e que
      `formatarNumeroRegistro` de `shared/registro.ts` é usada por ela.
      **Aceite**: os cenários de número daquela change passam; esta change só exibe.

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
- [ ] **T3.6** — Falha de rede no envio preserva o recorte e oferece "Tentar de novo".
- [x] **T3.7** — Sem `canvas.toBlob`, a tela orienta e **não** envia a original. _Feito em
      2026-08-07._

## Fatia 4 — Crachá e exportação

- [ ] **T4.1** — Componente do crachá em HTML/CSS, frente e verso, proporção 54 × 85,6 mm, com os
      campos do REQ-20 e REQ-21 e nada além. **Aceite**: cenário "Crachá não expõe dado além do
      previsto".
- [ ] **T4.2** — QR Code gerado apontando para `/verificar/<numero_registro>`, com a URL por
      extenso. **Aceite**: cenário "QR Code resolve para a verificação pública".
- [ ] **T4.3** — Exportação PNG e PDF no navegador, com teste que conta requisições de rede.
      **Aceite**: cenário "Exportação acontece sem servidor".
- [ ] **T4.4** — Pré-visualização de impressão A4 em 100%, com marcas de corte e a instrução de não
      ajustar à página.
- [ ] **T4.5** — Opt-in do tipo de deficiência: caixa separada, desmarcada por padrão, texto neutro,
      persistência da escolha, efeito restrito ao crachá. **Aceite**: cenários "Opt-in vem
      desmarcado por padrão" e "Opt-in marcado afeta só o crachá".
- [ ] **T4.6** — Estado sem foto com ações desabilitadas **e motivo escrito**; ausência de qualquer
      texto de análise ou aprovação. **Aceite**: cenários "Sem foto, baixar fica desabilitado" e
      "Liberação é imediata".

## Fatia 5 — Verificação pública

- [ ] **T5.1** — Rota `/verificar/<numero>` renderizada no servidor, com projeção que **seleciona
      apenas** nome, número, situação, foto e contato de cuidador (nunca `SELECT *`, e **nunca** o
      campo 12 — ADR-015). **Aceite**: cenários "Número válido de associado ativo" e "Verificação
      funciona sem JavaScript".
- [ ] **T5.2** — Resposta única para inexistente e mal formatado, com a mesma consulta ao banco nos
      dois casos. **Aceite**: cenários "Número inexistente e número mal formatado respondem igual"
      e "Consulta ao banco também ocorre para entrada mal formatada".
- [ ] **T5.3** — Situação inativa como informação, não como erro. **Aceite**: cenário "Número
      válido de cadastro inativo".
- [ ] **T5.4** — Declaração explícita do que a página não mostra, em corpo normal. **Aceite**:
      cenário "Página declara o que não mostra".
- [ ] **T5.5** — Campo único de consulta manual, sem busca por nome nem sugestão. **Aceite**:
      cenário "Não existe busca por nome nem sugestão".
- [ ] **T5.6** — Limite de 20 consultas por minuto por IP, com 429 neutro. **Aceite**: cenário
      "Rajada de consultas é limitada".
- [ ] **T5.7** — Bloco "Recebeu uma ligação da APPD?" marcado `[A CONFIRMAR]` até a associação
      responder.

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
