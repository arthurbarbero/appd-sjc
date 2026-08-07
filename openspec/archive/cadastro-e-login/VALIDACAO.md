# Validação — `cadastro-e-login`

Data: 2026-08-07 · Executor: Claude Code · T-15

Os **46 cenários** da spec, agrupados por funcionalidade, com onde cada um é verificado.

| Sigla | O quê                                                    |
| ----- | -------------------------------------------------------- |
| **U** | `npm test` — 148 testes, leem código-fonte e banco local |
| **A** | `npm run aceite` — 137 verificações no workerd real      |
| **C** | garantido **por construção**                             |
| **M** | conferência manual, com a data                           |

## Número de registro (5)

Todos **passaram**. Geração e formato em `test/registro.spec.ts`; colisão simultânea em
`test/emissao-concorrente.spec.ts`, com 10 rodadas de 50 emissões e um caso de colisão
forçada. "Buraco na sequência não é defeito" é comportamento esperado do sorteio (ADR-007),
e "sequencial esgotado" cai na exceção com número de tentativas na mensagem.

## Criação da conta (9)

Todos **passaram**. O e-mail é normalizado antes de gravar (`U`), a senha longa com espaços
é aceita e a curta recusada com o requisito dito antes de digitar (`A`), o cadastro não
pergunta sobre deficiência **na seção da conta** e não aceita foto na transação (`C`, `A`).

**"E-mail já cadastrado é recusado sem apagar as respostas"** estava marcado
`[condicional a Q-1]`. A Q-1 foi decidida em 2026-08-07
([ADR-018](../../../docs/adr/adr-018-mensagem-de-erro-e-enumeracao.md)): **o cadastro
revela** que já existe conta, porque a mensagem genérica prende quem preencheu 15 campos
sem dar saída. O cenário vale na redação que revela.

**"Aceite gravado guarda versão do termo e data/hora"** — passa na forma e tem uma ressalva
que não é desta change: o **hash é um marcador de lugar** (`'0'.repeat(64)`) até o catálogo
de termos existir. Está registrado em `formulario-atendimento/VALIDACAO.md`, que é a change
que grava a linha.

## Login e limite de tentativas (9)

Todos **passaram**. A mensagem é única para senha errada e e-mail inexistente (`A`), o
bloqueio chega na sexta tentativa e expira sozinho, o acerto zera o contador, e nenhum
estado oferece login social.

**"Tempo de resposta não distingue"** — `M, 2026-08-07`. O caminho de e-mail inexistente
executa a mesma derivação de senha do caminho comum, então não há atalho que encurte a
resposta. Não virou teste automatizado: medição de tempo em CI compartilhada é instável por
construção, e um teste que falha sozinho é desligado na terceira vez.

## Sessão (4)

Todos **passaram**. Cookie adulterado é tratado igual a ausente, API protegida responde 401,
logout apaga a sessão, e a aplicação recusa subir sem a chave — conferido em
`test/seguranca.spec.ts`, que exige a chave no modelo e o arquivo real fora do git.

## Guarda de rota e efeitos da exclusão (7)

Todos **passaram**. A guarda é **uma só** (`server/middleware/area.ts`), usada pelas rotas
das duas changes donas — o gate percorre link direto e clique interno, que são os dois
caminhos que se distinguem só rodando.

**"O número de registro não pode ser alterado"** — `U`, e a checagem é estrutural:
`test/seguranca.spec.ts` falha se **qualquer** rota escrever `numeroRegistro` num `.set()`.
Se pudesse ser reescrito, um crachá em circulação passaria a apontar para outra pessoa.

## Recuperação de senha (3)

**Movidos para `painel-administrativo`** junto com a T-9, por decisão do dono em 2026-08-07.
Os requisitos REQ-28 e REQ-29 continuam desta spec; quem os implementa é a change nova.

O caminho humano não vai ao ar antes de a associação ter ferramenta para refazer senha:
oferecer o telefone antes disso é prometer o que ninguém cumpre.

## Acessibilidade (9)

Todos **passaram**. axe A/AA em `/entrar` e no formulário de cadastro, rótulo visível com
obrigatoriedade dita em palavra, e erro ligado ao campo e anunciado. O percurso por teclado
roda no gate.

## A varredura de segurança (T-13), item a item

`test/seguranca.spec.ts`, dez checagens, todas verdes:

| O que se prova                               | Como                                                                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Nada no servidor imprime em log              | nenhum `console.*` em `server/` — num Worker isso vai para o painel da Cloudflare, e o que estiver por perto vai junto |
| Nenhuma rota devolve hash de senha           | varredura dos blocos de `return`                                                                                       |
| A senha em claro nunca chega ao servidor     | nenhuma rota lê `corpo.senha` — ADR-005 desfeito seria invisível sem isto                                              |
| Segredo não mora no repositório              | nenhum valor literal; modelo com chave vazia; `.dev.vars` no `.gitignore`                                              |
| O número de registro é imutável              | nenhuma rota o escreve num `.set()`                                                                                    |
| O limite de tentativas está ligado           | cadastro e verificação, cada um no seu escopo                                                                          |
| O contador não guarda identificador em claro | a chave gravada é o HMAC, nunca o valor recebido                                                                       |

Mais o gitleaks, que roda no pre-commit e no CI sobre o histórico inteiro.

## Veredito

**43 de 46 cenários com veredito, nenhum reprovado.** Os 3 de recuperação de senha saíram
para `painel-administrativo`.

Duas ressalvas escritas, nenhuma bloqueia esta change:

1. **O tempo de resposta foi conferido à mão**, não por teste. Medição de tempo em CI
   compartilhada reprova por acaso, e teste que falha sozinho acaba desligado.
2. **O hash do consentimento é marcador de lugar.** Não é desta change — é de
   `consentimento-e-privacidade`, e está nomeado no parecer de `formulario-atendimento`.

`cadastro-e-login` está pronta para `openspec/archive/`.
