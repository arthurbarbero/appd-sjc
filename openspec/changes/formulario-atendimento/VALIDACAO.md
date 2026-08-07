# Validação — `formulario-atendimento`

Data: 2026-08-07 · Executor: Claude Code · T10 parcial

**Esta change NÃO arquiva hoje**, e o motivo é externo. Está tudo escrito abaixo.

## O que ficou pronto

| Task                          | Onde se verifica                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| T0 — ADR-008 e ADR-009        | escritos, com status Aceito                                                                      |
| T2 — schema Zod compartilhado | `npm test`: nenhuma regra de validação duplicada; listas conferidas caractere a caractere        |
| T3 — transação de três linhas | `npm run aceite`: o cadastro grava conta, inscrição e aceite, e o clique duplo gera uma linha só |
| T4 — guarda anti-abuso        | **entregue em 2026-08-07**; ver abaixo                                                           |
| T5 — tela ligada ao servidor  | aceite: erro não apaga resposta, "Enviando…", sem recarregamento                                 |
| T5b — foto opcional           | aceite: sobe um JPEG de verdade pelo componente de recorte                                       |
| T6 — confirmação honesta      | aceite: número em destaque, sem prazo numérico, telefone da pessoa                               |
| T7 — acessibilidade           | aceite: axe A/AA no formulário, e o percurso por teclado                                         |
| T8 — réplica fiel             | `npm test`: "R$ 50" aparece exatamente uma vez                                                   |

## T4, a guarda que faltava — e o que o dono corrigiu no caminho

Eu tinha proposto um teto genérico de corpo como proteção principal. Ele desmontou:

> "Como ele mandaria um corpo de 50 MB? Você deveria lapidar isso no formulário, limitando
> os caracteres em um número aceitável para cada campo."

Está certo, e a ordem importa. **O limite por campo é a proteção; o teto de corpo é a
rede de baixo.** Auditei os campos: todos os de texto já tinham `.max()`, **menos dois** —
`email` e `cpf`. Sem eles, um corpo de megabytes chegava a ser decodificado e transformado
antes de ser recusado. Fechados em 254 (RFC 5321) e 20.

Com todos limitados, a soma dos campos fica **abaixo de 4 KB**. O teto de corpo virou
16 KB — derivado disso, não chutado: nunca recusa cadastro legítimo, e corta volume.

**Rate limit**: 12 cadastros por hora por hash de IP. Folgado para uma família cadastrando
várias pessoas do mesmo aparelho; apertado para um laço criando conta em série. O IP nunca
é gravado em claro — guardar o IP de quem procura uma associação de pessoas com deficiência
seria produzir exatamente o registro que o mecanismo existe para não criar.

Medido no aceite: corpo de 20 KB devolve 413, e rajada do mesmo IP devolve 429.

## Um critério de aceite que foi retirado, e por quê

A T6 exigia **teste que falhasse se as palavras "fila", "vaga", "posição" ou "matrícula"
aparecessem na tela**. Retirado por correção do dono:

> "Quando eu digo 'remove tal coisa', é diferente de dizer 'nunca mais utilize tal coisa'."

Ele pediu, em 06/08, uma varredura removendo a promessa de fila de vagas — que a APPD não
opera. Eu transformei o pedido numa regra permanente com teste. A varredura foi feita, o
texto está certo, e proibir palavra para sempre engessa sem proteger nada.

## O que trava o arquivamento

**T9 — gate de publicação.** Depende de `consentimento-e-privacidade`, que não tem uma
linha implementada. E há um defeito concreto que ela precisa resolver:

> **O consentimento é gravado com hash zerado.** `server/api/conta/cadastro.post.ts` escreve
> `hash: '0'.repeat(64)` — um marcador de lugar até o catálogo de termos existir. O formato
> é o definitivo, para não mascarar erro de schema, mas o valor não prova nada.
>
> Isso importa mais do que parece: o hash existe para ser **prova do texto que a pessoa
> leu**. Um registro de aceite com hash falso parece prova e não é — pior que não ter campo
> nenhum, porque quem consultar depois vai acreditar nele.
>
> Enquanto o catálogo não existir, **nenhum cadastro com dado de pessoa real pode ir ao ar**.
> Hoje isso está protegido de fato: o endereço no ar é de demonstração e o banco não é de
> produção.

**T10 — validação e arquivamento.** Fica aberta junto com a T9.

## Veredito

**Oito das dez tasks fechadas.** As duas que restam dependem de `consentimento-e-privacidade`,
e nenhuma delas depende de trabalho desta change.

`formulario-atendimento` **permanece em `changes/`**, com o bloqueio nomeado.
