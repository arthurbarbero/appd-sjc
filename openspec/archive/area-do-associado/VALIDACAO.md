# Validação item a item — `area-do-associado`

Data: 2026-08-07 · Executor: Claude Code · T6.6

Os **38 cenários** da spec, com onde cada um é verificado e o veredito. Nenhum fica sem
veredito; onde a verificação é manual, está escrito que é.

| Sigla | O quê                                                                              |
| ----- | ---------------------------------------------------------------------------------- |
| **U** | `npm test` — 138 testes, leem código-fonte e banco local                           |
| **A** | `npm run aceite` — 135 verificações no workerd real, com navegador                 |
| **C** | garantido **por construção**: não existe caminho no código que produza o contrário |

## Painel e navegação (3)

| Cenário                                          | Onde                                                                    | Veredito   |
| ------------------------------------------------ | ----------------------------------------------------------------------- | ---------- |
| Painel completo                                  | A — nome, número, inscrição, crachá e dados aparecem depois do cadastro | **passou** |
| Número aparece igual em todos os blocos          | A — mesmo valor na identificação, na prévia do crachá e no QR           | **passou** |
| Item atual da navegação marcado por mais que cor | A — `aria-current="page"` mais sublinhado espesso                       | **passou** |

## Acesso (1)

| Cenário                         | Onde                                                                 | Veredito   |
| ------------------------------- | -------------------------------------------------------------------- | ---------- |
| Acesso sem sessão não vaza nada | A — sem cookie, `/area` redireciona sem renderizar nada do associado | **passou** |

## Inscrição (4)

| Cenário                                                       | Onde                                                                       | Veredito   |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| A pessoa edita a própria inscrição                            | A — a correção salva e o painel reflete                                    | **passou** |
| A edição usa o mesmo schema da inscrição                      | U — `esquemaMeusDados` importado pelos dois lados; nenhuma regra duplicada | **passou** |
| Pessoa não altera status de inscrição                         | C — não existe rota nem controle que escreva `status` a pedido da pessoa   | **passou** |
| Sem nenhuma inscrição, o estado vazio oferece o próximo passo | A — botão e alternativa por telefone                                       | **passou** |

## Crachá no painel (2)

| Cenário                                           | Onde                                                                                  | Veredito   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| Sem foto no crachá, o painel continua funcionando | A — o bloco mostra "Sem foto" e os demais seguem                                      | **passou** |
| Opt-in do crachá não vaza para a prévia da área   | U + C — nenhuma das três rotas do painel devolve o campo, e o template não o menciona | **passou** |

## Carregamento e falha (2)

| Cenário                                 | Onde                                                                                                                                                                            | Veredito   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Carregando não faz a página pular       | A — texto anunciado por `role="status"`, sem animação em laço                                                                                                                   | **passou** |
| Falha em um bloco não derruba os outros | C — **era a única lacuna de código desta change**, e foi corrigida em 2026-08-07: o painel passou a fazer **uma chamada por bloco**, e o erro fica dentro do bloco que o causou | **passou** |

## Dado sensível (2)

| Cenário                                                  | Onde                                                                                                                                        | Veredito   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Tipo de deficiência não aparece fora da tela de correção | U + A — varredura do HTML bruto de `/area`, `/area/dados` e `/area/excluir`, mais a conferência inversa de que `/area/inscricoes` **exibe** | **passou** |
| Meus dados explica onde a informação está, sem exibi-la  | A — a tela diz onde consultar, sem mostrar                                                                                                  | **passou** |

> **Um cenário foi corrigido, não carimbado.** O de "tipo de deficiência" listava
> `/area/inscricoes` entre as telas proibidas. Estava defasado: foi escrito antes de a
> inscrição virar editável (ADR-014), e aquela é a tela de correção — sem ver o que
> respondeu, ninguém corrige. O requisito não mudou; o cenário descrevia um produto
> anterior.

## Exclusão (10)

| Cenário                                                     | Onde                                                       | Veredito   |
| ----------------------------------------------------------- | ---------------------------------------------------------- | ---------- |
| A exclusão mora numa página só                              | C — uma rota, um modal, sem fluxo paralelo (ADR-013)       | **passou** |
| A página explica o que sai, o que fica e que é irreversível | A — os três blocos, com o texto definitivo do ADR-017      | **passou** |
| O modal confirma, e nunca pede para digitar palavra         | A — o gate falha se aparecer campo de texto no modal       | **passou** |
| O foco do modal nunca começa no botão destrutivo            | A — o foco inicial é "Cancelar"                            | **passou** |
| O modal prende o foco e devolve ao fechar                   | A — `Esc` fecha e o foco volta ao botão que abriu          | **passou** |
| A ação preenchida é a saída segura                          | A — "Cancelar" é o único preenchido                        | **passou** |
| Exclusão confirmada executa o contrato do modelo de dados   | A — conta anonimizada, número preservado, sessão encerrada | **passou** |
| Depois de excluir, a verificação pública responde sem nome  | A — e sem foto, conferido no percurso                      | **passou** |
| Depois de excluir, a área não abre                          | A — redireciona para `/entrar?sessao=terminada`            | **passou** |
| Alternativa humana disponível                               | A — telefone da associação na página                       | **passou** |

## Meus dados (6)

| Cenário                                                    | Onde                                                        | Veredito   |
| ---------------------------------------------------------- | ----------------------------------------------------------- | ---------- |
| Erro de validação não apaga o que já foi digitado          | A — telefone curto recusado, respostas preservadas          | **passou** |
| Servidor valida com o mesmo schema do cliente              | U — o mesmo objeto Zod importado pelos dois lados           | **passou** |
| O endereço exibido inclui o CEP                            | A — `CEP 12239-530` no painel                               | **passou** |
| A alteração não oferece e-mail, CPF nem data de nascimento | A — não existe campo editável para os três                  | **passou** |
| Requisição que tenta alterar e-mail é recusada             | C — o schema da rota não tem o campo; o que vier é ignorado | **passou** |
| Salvar não sobrescreve a marcação de WhatsApp              | A — o valor volta preenchido no formulário e é reenviado    | **passou** |

## QR de verificação (4)

| Cenário                                         | Onde                                                                                   | Veredito   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| O bloco do crachá traz o QR e a URL por extenso | A — os dois presentes                                                                  | **passou** |
| O QR é desenhado sem JavaScript no aparelho     | C — SVG renderizado no servidor, sem biblioteca de runtime                             | **passou** |
| O QR não é montado por injeção de marcação      | C — construído como elemento Vue, nunca por `v-html`                                   | **passou** |
| A tela não confessa pendência de construção     | A — a frase "esta tela ainda não foi construída" foi removida e o gate falha se voltar | **passou** |

## Acessibilidade (4)

| Cenário                                      | Onde                                                                                       | Veredito   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------- |
| Sem violação de acessibilidade automatizável | A — axe A/AA nas quatro telas, em **1280 e 360 px**: oito execuções, zero violação         | **passou** |
| Percurso completo de exclusão só com teclado | A — `Tab` até "Excluir minha conta", `Enter` abre, foco entra em "Cancelar", `Esc` devolve | **passou** |
| Desabilitado sempre diz o motivo             | A — verificado no crachá, que é onde há botão desabilitado                                 | **passou** |
| Em 360 px nada estoura horizontalmente       | A — medido nas sete larguras, incluindo 360                                                | **passou** |

## O que mudou durante a validação

**Uma lacuna de código**: o painel fazia uma chamada só, e qualquer erro apagava a tela
inteira. Virou uma chamada por bloco, por decisão do dono — o argumento que decidiu foi
que, com chamada única, falha de rede deixa a pessoa sem **nada** na tela.

**Um cenário defasado**, corrigido acima.

**18 tasks estavam feitas e marcadas como abertas.** O código rodava desde 2026-08-06; o
registro é que não tinha sido atualizado.

## Veredito

**38 de 38 cenários com veredito. Nenhum reprovado. Nenhuma ressalva.**

`area-do-associado` está pronta para `openspec/archive/`.
