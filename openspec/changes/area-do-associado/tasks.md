# Tasks: Área do associado

Deriva de SPEC-area-do-associado v1. Fatias verticais: cada uma entrega algo verificável
sozinho e tem aceite ligado a cenário Gherkin da spec. Dono padrão: Arthur Barbero (decisão) /
Claude Code (execução). Nada começa antes do gate do revisor-spec.

## Fatia 0 — Gates que destravam o resto

- [ ] **T0.1 — Gate do revisor-spec.** Rodar a auditoria de Definition of Ready sobre esta
      spec. **Aceite**: veredito READY registrado, ou lista de bloqueios com dono.
- [ ] **T0.2 — Resposta da APPD e do jurídico** sobre o que a associação é obrigada a manter
      após a exclusão e por quanto tempo. Registrar em
      [pendencias-appd.md](../../../docs/pendencias-appd.md). **Aceite**: resposta registrada,
      ou decisão do dono de publicar com `[A CONFIRMAR]` visível. **Bloqueia T4.6 e T4.7.**
- [ ] **T0.3 — Decisão do dono**: exclusão imediata ou com janela de arrependimento. A spec v1
      assume imediata. **Aceite**: decisão registrada; se mudar, vira ADR e a spec sobe para v2.
- [ ] **T0.4 — Design aprovado no Claude Design** para os cinco estados (painel completo, sem
      inscrição, sem foto, carregando, exclusão), com handoff bundle. **Aceite**: bundle
      entregue e checklist de aceite visual do prompt de design todo marcado. **Bloqueia toda
      tela.**
- [ ] **T0.5 — Vocabulário de status alinhado** com `formulario-atendimento`: "Na fila", "Em
      atendimento", "Encerrada". **Aceite**: valores idênticos nas duas specs, ou esta spec
      atualizada antes do código.

## Fatia 1 — Acesso e casca da área

- [ ] **T1.1** — Middleware de rota que exige sessão em `/area/*`, redireciona ao login com o
      destino preservado e não renderiza nada do associado no caminho. **Aceite**: cenário
      "Acesso sem sessão não vaza nada".
- [ ] **T1.2** — Layout da área com cabeçalho (primeiro nome + "Sair"), rodapé padrão e
      navegação com `aria-current="page"` e sublinhado espesso. **Aceite**: cenário "Item atual
      da navegação marcado por mais que cor".
- [ ] **T1.3** — Bloco de identificação com nome, `numero_registro` em `tabular-nums` e a linha
      "Este número é seu e não muda." **Aceite**: cenários "Painel completo" e "Número aparece
      igual em todos os blocos".

## Fatia 2 — Blocos de leitura (inscrições e crachá)

- [ ] **T2.1** — Consulta de inscrições da pessoa, com projeção que **não** traz o campo 12.
      **Aceite**: cenário "Tipo de deficiência não aparece em nenhuma tela".
- [ ] **T2.2** — Bloco e página `/area/inscricoes`: tipo, data do pedido, status com ícone e
      texto; sem nenhum controle de alteração de status. **Aceite**: cenários "Painel completo"
      e "Pessoa não altera status de inscrição".
- [ ] **T2.3** — Estado vazio de inscrições que oferece o próximo passo, com botão para o
      formulário e a alternativa por telefone. **Aceite**: cenário "Sem nenhuma inscrição, o
      estado vazio oferece o próximo passo".
- [ ] **T2.4** — Bloco "Meu crachá": prévia com foto, nome, número, situação, a linha sobre o
      endereço público de verificação, e as ações "Ver meu crachá" e "Baixar para imprimir".
      **Aceite**: cenário "Painel completo".
- [ ] **T2.5** — Estado sem foto: espaço reservado "Sem foto", explicação e "Enviar minha foto",
      com o resto do painel intacto. **Aceite**: cenário "Sem foto no crachá, o painel continua
      funcionando".
- [ ] **T2.6** — Garantia de que o opt-in do crachá não afeta a prévia da área. **Aceite**:
      cenário "Opt-in do crachá não vaza para a prévia da área".

## Fatia 3 — Meus dados

- [ ] **T3.1** — Página `/area/dados` em leitura: rótulo visível acima do valor, sem campo 12.
      **Aceite**: cenário "Meus dados explica onde a informação está, sem exibi-la".
- [ ] **T3.2** — Linha explicativa apontando "Seus direitos" e o telefone da associação.
- [ ] **T3.3** — Formulário de alteração com schema Zod compartilhado cliente/servidor, erro por
      campo, `aria-describedby` e `aria-live`. **Aceite**: cenário "Servidor valida com o mesmo
      schema do cliente".
- [ ] **T3.4** — Preservação das respostas em caso de erro. **Aceite**: cenário "Erro de
      validação não apaga o que já foi digitado".

## Fatia 4 — Excluir minha conta

- [ ] **T4.1** — Bloco no painel: último, com divisória, borda vermelha, `h2` próprio, visível
      sem interação, botão contornado. **Aceite**: cenário "Painel completo".
- [ ] **T4.2** — Página `/area/excluir` própria, sem modal e sem elemento com papel `dialog`.
      **Aceite**: cenário "Confirmação acontece em página própria, não em modal".
- [ ] **T4.3** — Os três blocos explicativos, com `[A CONFIRMAR]` visível no que a associação
      mantém. **Aceite**: cenário "A página explica o que sai, o que fica e que é irreversível".
- [ ] **T4.4** — Dupla confirmação por duas caixas de seleção desmarcadas; **teste que falha se
      aparecer qualquer campo de texto pedindo palavra de confirmação**. **Aceite**: cenários
      "Dupla confirmação por caixas de seleção, nunca por digitação" e "Com uma só caixa marcada,
      o botão continua bloqueado e diz por quê".
- [ ] **T4.5** — "Cancelar e voltar" como único botão preenchido da página. **Aceite**: cenário
      "A ação preenchida é a saída segura".
- [ ] **T4.6** — Rotina de exclusão: apaga credenciais, e-mail, telefone, endereço, contato de
      cuidador e a foto via `ArmazenamentoFoto.apagar`; encerra a sessão; leva a uma página de
      confirmação pública. **Aceite**: cenários "Exclusão confirmada apaga os dados e a foto" e
      "Depois de excluir, a área não abre". **Depende de T0.2.**
- [ ] **T4.7** — Efeito na verificação pública: o nome deixa de aparecer em
      `/verificar/<numero>`. **Aceite**: cenário "Depois de excluir, a verificação pública não
      mostra mais o nome". **Depende de T0.2** para decidir entre remover ou inativar.
- [ ] **T4.8** — Alternativa humana com o telefone da associação. **Aceite**: cenário
      "Alternativa humana disponível".

## Fatia 5 — Estados de carregamento e falha

- [ ] **T5.1** — Espaço reservado com a mesma altura do conteúdo final, texto anunciado em
      `aria-live="polite"`, sem animação em laço. **Aceite**: cenário "Carregando não faz a
      página pular".
- [ ] **T5.2** — Degradação por bloco: falha isolada não derruba os demais. **Aceite**: cenário
      "Falha em um bloco não derruba os outros".

## Fatia 6 — Validação e fechamento

- [ ] **T6.1** — **Teste bloqueante de dado sensível**: varredura das cinco telas e de todas as
      respostas de API da área procurando qualquer valor do campo 12, inclusive em HTML oculto,
      `data-*`, comentário e JSON embutido. Falhou, a change não fecha.
- [ ] **T6.2** — axe em 1280 px e 360 px nos cinco estados. **Aceite**: cenário "Sem violação de
      acessibilidade automatizável".
- [ ] **T6.3** — Percurso completo de exclusão só com teclado, gravado no relatório de validação.
      **Aceite**: cenário "Percurso completo de exclusão só com teclado".
- [ ] **T6.4** — Auditoria de estado desabilitado e de rolagem horizontal em 360 px. **Aceite**:
      cenários "Desabilitado sempre diz o motivo" e "Em 360 px nada estoura horizontalmente".
- [ ] **T6.5** — Seeds e fixtures só com dado fictício, marcado como fictício; gitleaks verde.
      **Aceite**: REQ-35.
- [ ] **T6.6** — Validação item a item contra todos os cenários Gherkin (skill
      `validacao-aceite`), atualização do `PROGRESS.md` e movimentação para
      `openspec/archive/area-do-associado/`.

## Sequência e dependências

```
T0.1 T0.3 T0.4 T0.5  →  Fatia 1  →  Fatia 2  →  Fatia 3  →  Fatia 5
T0.2 ────────────────────────────────────────→  Fatia 4
Fatias 2, 3, 4 e 5  →  Fatia 6
```

Esta change depende de `cadastro-e-login` (sessão), `formulario-atendimento` (inscrições) e
`cracha-do-associado` (número, foto, `ArmazenamentoFoto`). A Fatia 4 é a única que pode ser
bloqueada por resposta externa (T0.2) — as demais avançam sem ela.
