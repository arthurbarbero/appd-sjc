# Tasks: Crachá do associado e verificação pública

Deriva de SPEC-cracha-do-associado v1. Fatias verticais: cada uma entrega algo verificável
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
- [ ] **T0.3 — Gate do revisor-spec.** Rodar a auditoria sobre esta spec.
      **Aceite**: veredito READY registrado, ou lista de bloqueios com dono.
      **Nota**: o gate **confere** a autoauditoria, não a substitui — foi o bloqueio B19.
      A seção "Definition of Ready" da spec agora existe e é preenchida antes de rodar.
- [ ] **T0.4 — Design aprovado no Claude Design** para `/area/cracha` (seis estados) e
      `/verificar/<numero>` (quatro estados), com handoff bundle. **Aceite**: bundle entregue e
      checklist de aceite visual dos dois prompts de design todo marcado. **Bloqueia toda tela.**

## Fatia 1 — Número de registro: movida para `cadastro-e-login`

**T1.1 a T1.4 não existem mais aqui** (ADR-013). A coluna é de `modelo-de-dados`, o emissor
é de `cadastro-e-login`, e a T1.2 original — "lê o maior sequencial do ano e grava o
próximo" — está **revogada**: quebra com cadastros simultâneos, e contradizia frontalmente
o REQ-4 da change dona (bloqueio B10 do gate).

- [ ] **T1.0** — Conferir que a emissão de `cadastro-e-login` está entregue e que
      `formatarNumeroRegistro` de `shared/utils/registro.ts` é usada por ela.
      **Aceite**: os cenários de número daquela change passam; esta change só exibe.

## Fatia 2 — Armazenamento da foto (sem tela)

- [ ] **T2.1** — Interface `ArmazenamentoFoto` em `shared/` com `gravar`, `ler` e `apagar`, mais a
      implementação D1/BLOB em `server/`. **Aceite**: cenário "Gravação passa pela interface
      ArmazenamentoFoto"; nenhuma rota referencia a tabela direto.
- [ ] **T2.2** — Migration da tabela de foto (BLOB, dono, tipo, bytes, criado_em).
- [ ] **T2.3** — Rota de gravação com revalidação server-side: MIME pelos bytes iniciais,
      dimensões 400 × 500, tamanho ≤ 102.400. **Aceite**: cenário "Servidor não confia no cliente".
- [ ] **T2.4** — Rota autenticada de leitura da foto, com 401 sem sessão e 404 para foto alheia.
      **Aceite**: cenários "Foto exige sessão" e "Foto de outra pessoa responde igual a foto
      inexistente".
- [ ] **T2.5** — Métrica de ocupação (contagem × tamanho médio) exposta ao operador.
      **Aceite**: REQ-38.

## Fatia 3 — Envio, recorte e compressão no navegador

- [ ] **T3.1** — Componente recortador 4:5 com moldura fixa, arrasto, aproximação e **controle por
      teclado** (setas, `+`, `−`) e botões de 44 px. **Aceite**: cenário "Recorte operável só pelo
      teclado".
- [ ] **T3.2** — Pipeline de compressão em canvas: 400 × 500, JPEG 0,75, medição do resultado.
      **Aceite**: cenário "Recorte acontece no cliente e a imagem original não sobe".
- [ ] **T3.3** — Teto rígido: rejeitar acima de 102.400 bytes com o tamanho obtido e instrução; sem
      degradação silenciosa. **Aceite**: cenário "Foto acima do teto rígido é rejeitada com
      instrução".
- [ ] **T3.4** — Recusas antes de processar: arquivo > 10 MB e tipo não suportado. **Aceite**:
      cenários "Arquivo de origem grande demais" e "Arquivo que não é imagem".
- [ ] **T3.5** — Estado de processamento com `progressbar` determinado e `aria-live`. **Aceite**:
      cenários "Progresso do processamento é determinado" e "Resultado anunciado por região viva".
- [ ] **T3.6** — Falha de rede no envio preserva o recorte e oferece "Tentar de novo".
- [ ] **T3.7** — Ausência de `canvas.toBlob`: mensagem de orientação, nunca envio da original.

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
      apenas** nome, número e situação (nunca `SELECT *`). **Aceite**: cenários "Número válido de
      associado ativo" e "Verificação funciona sem JavaScript".
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
      `/verificar/<numero>` procurando qualquer campo do cadastro fora dos três permitidos.
      **Bloqueante**: falhou, a change não fecha.
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
