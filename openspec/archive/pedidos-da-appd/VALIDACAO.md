# Validação — pedidos da APPD

Parecer do gate, no padrão das changes arquivadas. O que ficou de fora está dito, e não
escondido.

- Data: 2026-08-21
- `npm test`: **417 testes**, 18 arquivos
- `npm run aceite`: **283/283**, zero falhas
- `npm run lint`, `npm run typecheck`, `npm run build`: limpos
- Decisão estrutural: [ADR-022](../../../docs/adr/adr-022-modo-atendimento-para-mutirao.md)

## Requisitos

| Req             | Onde                                | Veredito                                                         |
| --------------- | ----------------------------------- | ---------------------------------------------------------------- |
| REQ-1 a REQ-4   | `revisao-de-interface` + aceite     | **passa** — projeto fora, rota em 404, opção fora, textos limpos |
| REQ-5           | decisão registrada                  | **passa** — sem tratamento do gravado, com o motivo escrito      |
| REQ-6 a REQ-9   | `endereco-por-cep.spec.ts`          | **passa** — 11 cenários, inclusive os que não substituem         |
| REQ-10 a REQ-16 | `modo-atendimento.spec.ts` + aceite | **passa** — ver a tabela de fronteira abaixo                     |
| REQ-17, REQ-18  | navegador                           | **passa** — "Número do CRAS" e o "Acesso Já"                     |
| REQ-19 a REQ-21 | axe + aceite                        | **passa** — inclusive a tela nova                                |

## A fronteira do modo atendimento

Ele mexe na única defesa que o cadastro tem contra criação em massa, e envelhece de um jeito
previsível: alguém precisa de mais uma coisa no balcão, e a coisa entra ali porque "já tem o
modo ligado". Foi assim que muito painel administrativo nasceu sem ninguém decidir criar um —
e este projeto tem um painel a decidir, com perguntas sérias em aberto.

| Trava                                                 | Onde é verificada            | Veredito  |
| ----------------------------------------------------- | ---------------------------- | --------- |
| Não toca consentimento, tabela de usuários nem sessão | `modo-atendimento.spec.ts`   | **passa** |
| A resposta não devolve dado de pessoa                 | `modo-atendimento.spec.ts`   | **passa** |
| A tela não lista nada nem leva à área                 | `modo-atendimento.spec.ts`   | **passa** |
| Sem o segredo, não liga **e** não aceita cookie       | `modo-atendimento.spec.ts`   | **passa** |
| O prazo está dentro do selo, não só no `maxAge`       | `modo-atendimento.spec.ts`   | **passa** |
| A senha é contada no limite de frequência             | `seguranca.spec.ts` + aceite | **passa** |
| Ligado, a área do associado continua barrada          | aceite                       | **passa** |
| O teto do público continua em 12 por 15 minutos       | `modo-atendimento.spec.ts`   | **passa** |

O gate **reprova** quando `MODO_ATENDIMENTO_SENHA` não está no ambiente, em vez de pular o
cenário: um modo que nunca foi exercitado é um modo que ninguém sabe se funciona.

## Três decisões de desenho que valem registro

**O teto sobe por navegador, não por IP.** Reconhecer o IP da associação é o desenho que
ocorre primeiro e envelhece pior — a rede muda, o mutirão às vezes é fora da sede, e um IP
numa lista é uma porta que ninguém lembra de fechar. Pior: exigiria guardar o IP para
comparar, contra a regra de nunca guardar identificador em claro.

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

1. **O segredo precisa ser posto no Cloudflare** antes de o modo funcionar em produção:
   `npx wrangler secret put MODO_ATENDIMENTO_SENHA`. Até lá o modo **não liga**, e o site se
   comporta exatamente como antes — que é o comportamento certo para configuração ausente,
   mas quem esperar o mutirão funcionar vai se surpreender.
2. **O teto de 120 por 15 minutos é estimativa nossa.** Precisa vir de quantas pessoas a APPD
   atende num mutirão (`docs/pendencias-appd.md`, item 4c).
3. **A senha é compartilhada entre atendentes**, e senha compartilhada vaza. O que ela dá não
   é acesso a dado — é a capacidade de poluir o banco. Mitigado pelo prazo de seis horas e
   pela troca do segredo sem deploy.
4. **As fotos do projeto encerrado continuam versionadas** em `public/imagens/`, servidas
   publicamente, agora sem nenhuma página que as use. São rostos de atletas com deficiência.
   Apagar arquivo é irreversível e não estava no pedido: **fica como decisão para o dono.**
5. **O Facebook do projeto continua no ar** anunciando os treinos, com 2.274 curtidas. Fora
   do alcance deste repositório, e agora em `docs/pendencias-appd.md`.
6. **A tela `/atendimento/modo` é superfície nova** que não é para o público. `noindex`, mas
   responde a quem souber a URL. Não é segredo: a senha é que é.
