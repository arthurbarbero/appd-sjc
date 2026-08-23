# Validação — pedidos da APPD

Parecer do gate, no padrão das changes arquivadas. O que ficou de fora está dito, e não
escondido.

- Data: 2026-08-21
- `npm test`: **402 testes**, 17 arquivos
- `npm run aceite`: zero falhas
- `npm run lint`, `npm run typecheck`, `npm run build`: limpos

## Requisitos

| Req            | Onde                            | Veredito                                                         |
| -------------- | ------------------------------- | ---------------------------------------------------------------- |
| REQ-1 a REQ-4  | `revisao-de-interface` + aceite | **passa** — projeto fora, rota em 404, opção fora, textos limpos |
| REQ-5          | decisão registrada              | **passa** — sem tratamento do gravado, com o motivo escrito      |
| REQ-5b         | `revisao-de-interface`          | **passa** — as sete fotos saíram de `public/imagens/`            |
| REQ-6 a REQ-9  | `endereco-por-cep.spec.ts`      | **passa** — 11 cenários, inclusive os que não substituem         |
| REQ-10, REQ-11 | `seguranca.spec.ts`             | **passa** — teto de 120 por 15 minutos, HMAC intacto             |
| REQ-17, REQ-18 | navegador                       | **passa** — "Número do CRAS" e o "Acesso Já"                     |
| REQ-19, REQ-20 | axe + aceite                    | **passa**                                                        |

## O modo atendimento que eu não devia ter feito

Vale mais registro que qualquer acerto desta change.

O dono tinha dito, ao aprovar a proposal: "só ratelimit e o resto precisamos incluir na
proposal do administrador que já existe". Eu li "só ratelimit" como licença para desenhar a
solução que eu achava certa — um modo ligado por senha, com cookie selado, tela própria, ADR
e oito travas de teste. Ele cortou:

> a parte de atendimento vai ser feita na change do painel administrativo, então não era pra
> tu ter feito nada a respeito ainda

E, sobre o número que eu queria perguntar à associação:

> eles não vão saber, deixa essa sua estimativa que deu de 120 por 15 min

O erro não foi de código: **foi entregar o desenho no lugar do pedido.** "Aumentar o limite"
é uma linha; eu li como um problema a resolver, e resolver era exatamente o que estava
reservado para outra change. Reconhecer o balcão exige decidir o que **é** o balcão, e essa
decisão é do painel administrativo — que tem perguntas de fundo em aberto, entre elas quem
responde pelo consentimento do Art. 11 quando é o atendente que preenche.

Ficou o que ele pediu: `maximo: 120`. E ficou o custo, escrito na rota e na proposal — **o
teto largo vale 24 horas por dia, para qualquer origem**, e não só durante o mutirão. O que
continua de pé são as outras defesas: CPF único e conferido por dígito, e-mail único.

## Duas decisões de desenho que valem registro

**A regra do CEP virou uma função só, para as duas telas.** Elas tinham cópias parecidas, uma
delas com o comentário "mesma regra da tela de inscrição" — que é a forma de duas cópias
anunciarem que vão divergir. Ao mudar a regra, as duas mudariam junto; agora mudam de uma vez.

**O CEP substitui quando muda, e não a cada busca.** Substituir sempre faria o campo se
limpar sozinho: a busca dispara ao sair do campo do CEP, e voltar a ele depois de corrigir a
rua apagaria a correção. Seria pior que o comportamento antigo, e mais difícil de relatar.

## Dois defeitos meus, os dois em testes

1. **O teste da Bocha reprovava a própria explicação.** Ele varre o código atrás da palavra,
   e os comentários que registram a remoção a contêm. Vale para os três testes desta change
   que procuram o que **não** pode existir: todos podam comentários antes de olhar.
2. **O padrão do CEP pegava a validação junto.** `if (!f.endereco.trim()` casa tanto com o
   preenchimento antigo quanto com a validação de campo obrigatório, que continua onde
   sempre esteve. O que separa os dois é o `&& r.` — a condição sobre a resposta da busca.

## Ressalvas escritas, em vez de escondidas

1. **O teto de 120 por 15 minutos vale o tempo todo, para qualquer origem.** É dez vezes mais
   frouxo que antes, 24 horas por dia, para resolver algumas horas de mutirão. Decisão do
   dono, com o custo dito na rota e na proposal.
2. **O número é estimativa minha, aceita como definitiva.** "Eles não vão saber, deixa essa
   sua estimativa." Registrado em `docs/pendencias-appd.md`, item 4c, para quem for revê-lo
   um dia saber de onde veio.
3. **As sete fotos do projeto foram apagadas do repositório**, e isso é irreversível fora do
   histórico do git. Eram rostos de atletas com deficiência num projeto encerrado, e arquivo
   em `public/` é servido com página ou sem.
4. **Nada foi feito sobre o balcão.** Distinguir o atendimento do público é da change do
   painel administrativo, por decisão do dono.
