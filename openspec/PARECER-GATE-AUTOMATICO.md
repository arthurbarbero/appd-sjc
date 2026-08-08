# Parecer do gate — 2026-08-07

Terceira passada do `revisor-spec`. As duas anteriores (`PARECER-GATE.md` e
`PARECER-GATE-T5.md`) foram **autorrevisão**: eu auditando a spec que eu mesmo escrevi. O
segundo parecer registrou por escrito que isso não vale como gate e exigiu um revisor
independente. Ao ser informado da pendência, o dono respondeu **"se arrume"**.

## Como isto foi arrumado, e como não foi

A passada de 2026-08-07 foi feita por um teste que auditava a parte mecânica da Definition
of Ready. Ele encontrou o que está registrado abaixo, e **foi removido no mesmo dia**, por
decisão do dono:

> "Atualizar PROGRESS e coisa dos ritos não é código para se utilizar de `npm test`, sou
> terminantemente contra isso. `npm test` é para código, não regra de negócio ou arquivo
> md de IA."

A decisão está aceita e não se rediscute: **`npm test` cobre o produto, não o rito**. O
gate volta a ser trabalho de quem escreve — e o registro de hoje serve para que a próxima
passada saiba o que conferir:

| O que conferir                                                | Regra da skill           |
| ------------------------------------------------------------- | ------------------------ |
| Toda change tem proposal, spec e tasks                        | estrutura do fluxo       |
| Todo requisito é coberto por cenário ou por rastreabilidade   | DoR item 3 (aceite)      |
| Nenhuma linha de requisito usa adjetivo sem medida            | DoR item 1 (ambiguidade) |
| Toda change declara fora de escopo                            | DoR item 3 (escopo)      |
| Toda change nomeia dono                                       | DoR item 3 (escopo)      |
| Todo ADR citado existe e não está listado como "não escrito"  | DoR item 3 (ADR)         |
| Nenhuma spec carrega segredo                                  | DoR item 3 (credencial)  |
| Nenhuma change está em `changes/` e `archive/` ao mesmo tempo | coerência do rito        |
| Change arquivada não tem task em aberto                       | coerência do rito        |
| Nenhum link relativo aponta para arquivo que não existe       | coerência do registro    |
| Nenhuma task depende de change já arquivada                   | coerência do registro    |
| O gate de aceite roda **duas vezes seguidas** sem reprovar    | coerência do gate        |

As três últimas entraram na auditoria manual de 2026-08-07, e as três acharam defeito na
primeira passada: 15 links quebrados, uma task esperando change arquivada, e um gate que
reprovava cinco verificações quando rodado duas vezes — porque a própria rajada de teste
deixava a cota estourada.

## O que nenhuma checagem cobre

Mérito. Se o requisito é o certo, se o escopo é o que a APPD precisa, se a decisão de
produto está boa, se o texto da tela serve para quem vai lê-lo. Isso continua sendo do
dono da área, como os dois pareceres anteriores já diziam.

O que a lista acima faz é separar **forma** de **mérito** — 25 dos bloqueios do primeiro
gate eram de forma, e forma se confere por checklist. O mérito não.

## O que o gate achou nesta passada

Não foi uma formalidade. A primeira execução reprovou **dez** checagens, e nove eram
defeito real:

**Quatro ADRs citados que nunca foram escritos.** `ADR-008` (múltipla escolha como JSON),
`ADR-009` (anti-abuso sem CAPTCHA), `ADR-010` (implementar antes de especificar) e
`ADR-011` (publicar com selo "A confirmar") eram referência, em quatro specs, para
documento nenhum. Duas dessas decisões já estavam **implementadas** havia dois dias. Os
quatro foram escritos.

**`ADR-006` continuava sem existir, e continuava citado.** Era decisão que o dono não tinha
tomado, e escrevê-lo para calar o teste seria pior do que a citação órfã. **Fechado no fim
do mesmo dia**: conteúdo de página vive no código, não em banco
([ADR-006](../docs/adr/adr-006-conteudo-de-pagina-vive-no-codigo.md)). A lista de ADRs
reservados e não escritos está zerada.

**Nove requisitos sem critério de aceite.** Quatro em `area-do-associado` (os de edição da
inscrição, REQ-11 e derivados — implementados e nunca traçados), três em
`formulario-atendimento`, um em `cracha-do-associado`, e o `modelo-de-dados` inteiro sem
rastreabilidade explícita. Corrigidos com cenários novos e uma tabela requisito → onde é
verificado.

**Uma falha era do próprio gate**: duas specs declaram requisito sem marcador de lista, e
a auditoria pulava a change inteira acusando "não declara requisito nenhum". Corrigida — e
vale registrar que um gate com falso negativo é pior que gate nenhum, porque dá a
sensação de cobertura.

## Veredito por change

| Change                        | Forma | Pode arquivar?                                                          |
| ----------------------------- | ----- | ----------------------------------------------------------------------- |
| `modelo-de-dados`             | READY | **arquivada** em 2026-08-07                                             |
| `revisao-de-interface`        | READY | **arquivada** em 2026-08-07                                             |
| `site-institucional`          | READY | não — 15 tasks abertas (peso por rota, redirecionamentos, sitemap, 404) |
| `cadastro-e-login`            | READY | **arquivada** em 2026-08-07, com 43 dos 46 cenários validados           |
| `formulario-atendimento`      | READY | não — T9 e T10 esperam o catálogo completo de termos                    |
| `area-do-associado`           | READY | **arquivada** em 2026-08-07, com os 38 cenários validados item a item   |
| `cracha-do-associado`         | READY | **arquivada** em 2026-08-07, com os 39 cenários validados item a item   |
| `consentimento-e-privacidade` | READY | não — sem implementação; T4 destravada pelo ADR-006 em 2026-08-07       |

**READY na forma não é pronto para arquivar.** As duas coisas se confundiram na primeira
passada e é bom deixar dito: READY significa que a spec pode virar task. Arquivar exige a
task feita **e** o critério percorrido.

## O que falta, por change, para arquivar

**`cadastro-e-login`** — **arquivada em 2026-08-07**. Os 3 cenários de recuperação de senha
saíram para `painel-administrativo` junto com a T-9. A varredura de segurança da T-13 virou
`test/seguranca.spec.ts`, com dez checagens estruturais.

**`formulario-atendimento`** — 8 das 10 tasks fechadas. A guarda anti-abuso entrou em
2026-08-07, e o hash do consentimento deixou de ser marcador de lugar. O que resta (T9 e
T10) espera o **catálogo completo de termos**, que é de `consentimento-e-privacidade`.

**`area-do-associado`** — **arquivada em 2026-08-07**, com os 38 cenários validados. A única
lacuna de código era o painel fazer uma chamada só: virou uma por bloco, por decisão do
dono. Um cenário foi **corrigido** em vez de carimbado — o de tipo de deficiência listava a
tela de correção entre as proibidas, e estava defasado desde o ADR-014.

**`site-institucional`** — 15 tasks, quase todas de medição (peso por rota, CLS, contraste
renderizado) e de SEO (301 das 7 URLs antigas, sitemap, robots). Nenhuma depende de
terceiro. Quatro saíram da lista em 2026-08-07: os ADR-010 e ADR-011, o QR do PIX conferido
pelo dono no app do banco, e a logo em vetor — encerrada por decisão dele.

**`cracha-do-associado`** — **arquivada em 2026-08-07**, e é a primeira change a fechar com
validação item a item dos cenários, não só com as tasks marcadas. Os 39 têm veredito em
[`archive/cracha-do-associado/VALIDACAO.md`](archive/cracha-do-associado/VALIDACAO.md),
com duas ressalvas escritas em vez de escondidas: as marcas de corte não foram conferidas
em papel, e o limite de consultas foi medido à mão fora do gate.

Vale registrar o que a exigência da T6.2 — axe nas **duas** larguras — encontrou: a folha
A4 da pré-visualização rola na horizontal a 360 px e não recebia foco de teclado. A 1280 px
ela não rola, e o defeito não existia. Requisito que parece redundante às vezes é o único
que enxerga.

**`consentimento-e-privacidade`** — sem implementação. O ADR-006 **destravou a T4** em
2026-08-07. Continuam parados: as telas (esperam o canvas) e o archive (espera PB-1 a PB-5
com a APPD e o jurídico).
