# Tasks — `revisao-de-interface`

Ordem sugerida: o que quebra primeiro, o que engana depois, o que é estética por último.

## T1 — O que está quebrado

- [x] **T1.1** — Cabeçalho em uma linha; `nav` vira container flex e o bloco de conta
      empilha no celular em vez de cair para fora (REQ-1, REQ-3). _Feito em 2026-08-07._
- [x] **T1.2** — Concluir o cadastro leva para `/area` logado, com a confirmação e o
      número exibidos lá; a tela intermediária deixa de existir (REQ-20).
      _Feito em 2026-08-07._
- [ ] **T1.3** — Conferir em 360px cada tela pública, procurando rolagem horizontal e
      sobreposição. **Aceite**: os dois primeiros cenários da spec.

## T2 — O que engana quem lê

- [ ] **T2.1** — Remover da home o bloco "Antes de pedir atendimento" com a fila de vagas
      (REQ-8), e varrer as **telas** atrás de qualquer outra afirmação de fila.
      **Aceite**: o cenário "Nenhuma tela afirma que existe fila de vagas" — que é teste,
      não conferência visual, justamente porque a conferência visual já falhou uma vez.
- [ ] **T2.2** — Aviso no formulário de contato de que a mensagem ainda não é enviada,
      com telefone e WhatsApp como caminho que funciona (REQ-18).
- [ ] **T2.3** — Remover os blocos inventados: três passos, "Como funciona", as duas
      frases sobre "um cadastro só", e "O que já é público" no Sobre
      (REQ-9 a REQ-13).

## T3 — Interação

- [ ] **T3.1** — Padrão de cartão clicável em `design-system/base.css`: área inteira,
      estado de ponteiro e de foco, **um link só** envolvendo o título (REQ-4 a REQ-7).
- [ ] **T3.2** — Aplicar em home, atendimento e projetos, mais o bloco "Procurando um
      projeto?" (REQ-14).
- [ ] **T3.3** — Contato: telefone vira texto com botão de copiar, com confirmação em
      região `aria-live` e alternativa sem `navigator.clipboard` (REQ-16, REQ-17).

## T4 — Conteúdo

- [ ] **T4.1** — Comparar `/sobre` com o site original usando
      `docs/inventario-conteudo.md`, listar o que falta e completar (REQ-15).
- [ ] **T4.2** — Transformar em opções próprias o que hoje é texto livre em "Outro",
      incluindo os quatro projetos (REQ-19).
      **Antes de codar**: registrar em `docs/pendencias-appd.md` que isto **altera as
      perguntas do formulário oficial**, contra o que `docs/campos-formulario.md` trava.
      É decisão do dono e vale; mas quem recebe as inscrições construiu o atendimento em
      cima das perguntas atuais, e precisa saber.
- [ ] **T4.3** — Logo da APPD no rodapé (REQ-21).

## T5 — Gate

- [ ] **T5.1** — `axe` sem violação de nível A ou AA nas telas tocadas.
- [ ] **T5.2** — Percorrer os sete cenários de aceite, um a um, com veredito registrado.
