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

As duas últimas linhas entraram na auditoria manual de 2026-08-07, e as duas acharam
defeito na primeira passada: 15 links quebrados e uma task esperando change arquivada.

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
| `site-institucional`          | READY | não — 17 tasks abertas (peso por rota, redirecionamentos, sitemap, 404) |
| `cadastro-e-login`            | READY | não — critérios de aceite não percorridos                               |
| `formulario-atendimento`      | READY | não — critérios não percorridos; a foto opcional do REQ-7d não existe   |
| `area-do-associado`           | READY | não — 28 tasks abertas, incluindo o bloco do crachá                     |
| `cracha-do-associado`         | READY | **arquivada** em 2026-08-07, com os 39 cenários validados item a item   |
| `consentimento-e-privacidade` | READY | não — sem implementação; T4 destravada pelo ADR-006 em 2026-08-07       |

**READY na forma não é pronto para arquivar.** As duas coisas se confundiram na primeira
passada e é bom deixar dito: READY significa que a spec pode virar task. Arquivar exige a
task feita **e** o critério percorrido.

## O que falta, por change, para arquivar

**`cadastro-e-login`** — os cenários de sessão, login e emissão do número já rodam dentro
de `npm run aceite`, mas as tasks do arquivo estão em formato `[FEITO]` sem checkbox e sem
veredito por cenário. Falta mapear cada cenário para onde ele roda, como foi feito em
`revisao-de-interface`, e fechar o que sobrar. Também falta a redefinição de senha, que
depende de caminho de e-mail ou SMS gratuito — pesquisa em aberto.

**`formulario-atendimento`** — mesma situação, mais o REQ-40 (procedência do termo de
consentimento), que depende de `consentimento-e-privacidade`.

**`area-do-associado`** — o bloco do crachá no painel depende de `cracha-do-associado`; a
linha "Seus direitos" depende de `consentimento-e-privacidade`. As duas Fatias 3 e 4 estão
entregues; as Fatias 1, 2, 5 e 6 têm código rodando sem veredito registrado.

**`site-institucional`** — 17 tasks, quase todas de medição (peso por rota, CLS, contraste
renderizado) e de SEO (301 das 7 URLs antigas, sitemap, robots). Nenhuma depende de
terceiro. As duas que saíram da lista eram os ADR-010 e ADR-011, escritos em 2026-08-07 e
marcados na auditoria do mesmo dia.

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
