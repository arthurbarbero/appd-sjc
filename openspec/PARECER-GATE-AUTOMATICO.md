# Parecer do gate — 2026-08-07

Terceira passada do `revisor-spec`. As duas anteriores (`PARECER-GATE.md` e
`PARECER-GATE-T5.md`) foram **autorrevisão**: eu auditando a spec que eu mesmo escrevi. O
segundo parecer registrou por escrito que isso não vale como gate e exigiu um revisor
independente. Ao ser informado da pendência, o dono respondeu **"se arrume"**.

## Como isto foi arrumado

Não por ler de novo. Quem escreveu não enxerga o buraco na segunda leitura mais do que na
primeira — foi exatamente o que aconteceu nas duas passadas anteriores.

Foi tirando o julgamento do caminho. A parte da Definition of Ready que não depende de
opinião virou `test/gate-spec.spec.ts`, que roda no `npm test` **de quem quer que tenha
escrito a spec**, hoje e daqui a seis meses.

| O que a máquina confere                                       | Regra da skill           |
| ------------------------------------------------------------- | ------------------------ |
| Toda change tem proposal, spec e tasks                        | estrutura do fluxo       |
| Todo requisito é coberto por cenário ou por rastreabilidade   | DoR item 3 (aceite)      |
| Nenhuma linha de requisito usa adjetivo sem medida            | DoR item 1 (ambiguidade) |
| Toda change declara fora de escopo                            | DoR item 3 (escopo)      |
| Toda change nomeia dono                                       | DoR item 3 (escopo)      |
| Todo ADR citado existe, ou está reservado no índice           | DoR item 3 (ADR)         |
| Nenhuma spec carrega segredo                                  | DoR item 3 (credencial)  |
| Nenhuma change está em `changes/` e `archive/` ao mesmo tempo | coerência do rito        |
| Change arquivada não tem task em aberto                       | coerência do rito        |

**60 checagens, todas verdes** em 2026-08-07.

## O que a máquina NÃO cobre, e nenhuma cobriria

Mérito. Se o requisito é o certo, se o escopo é o que a APPD precisa, se a decisão de
produto está boa, se o texto da tela serve para quem vai lê-lo. Isso continua sendo do
dono da área, como os dois pareceres anteriores já diziam.

O que mudou é a **fronteira**: antes, forma e mérito dependiam os dois da minha leitura, e
25 dos bloqueios do primeiro gate eram de forma. Agora a forma não depende de ninguém
lembrar.

## O que o gate achou nesta passada

Não foi uma formalidade. A primeira execução reprovou **dez** checagens, e nove eram
defeito real:

**Quatro ADRs citados que nunca foram escritos.** `ADR-008` (múltipla escolha como JSON),
`ADR-009` (anti-abuso sem CAPTCHA), `ADR-010` (implementar antes de especificar) e
`ADR-011` (publicar com selo "A confirmar") eram referência, em quatro specs, para
documento nenhum. Duas dessas decisões já estavam **implementadas** havia dois dias. Os
quatro foram escritos.

**`ADR-006` continua sem existir, e continua citado** — mas é decisão que o dono ainda não
tomou, e escrevê-lo para calar o teste seria pior do que a citação órfã. O gate passou a
aceitar reserva declarada no índice, com a change dona nomeada, e falha se a lista de
reservas crescer.

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
| `modelo-de-dados`             | READY | **sim** — tasks fechadas, 169 testes, rastreabilidade completa          |
| `revisao-de-interface`        | READY | **sim** — 15/15, gate de aceite 78/78 rodado contra produção            |
| `site-institucional`          | READY | não — 19 tasks abertas (peso por rota, redirecionamentos, sitemap, 404) |
| `cadastro-e-login`            | READY | não — critérios de aceite não percorridos                               |
| `formulario-atendimento`      | READY | não — critérios de aceite não percorridos                               |
| `area-do-associado`           | READY | não — 29 tasks abertas, incluindo o bloco do crachá                     |
| `cracha-do-associado`         | READY | não — sem implementação; T0.4 (design) trava as fatias 3 a 5            |
| `consentimento-e-privacidade` | READY | não — sem implementação; ADR-006 é pré-requisito                        |

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

**`site-institucional`** — 19 tasks, quase todas de medição (peso por rota, CLS, contraste
renderizado) e de SEO (301 das 7 URLs antigas, sitemap, robots). Nenhuma depende de
terceiro.

**`cracha-do-associado`** e **`consentimento-e-privacidade`** — sem implementação. A
primeira trava na T0.4 (design das dez telas); a segunda, no ADR-006.
