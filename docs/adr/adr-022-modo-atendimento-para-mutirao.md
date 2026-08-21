# ADR-022: o teto de cadastros sobe por navegador e por senha, não para todo mundo

Status: Aceito
Data: 2026-08-21
Decisores: Arthur Barbero (dono do projeto), a partir de pedido da APPD

## Contexto

A associação pediu, pelo dono:

> existe multidão também, então precisamos aumentar os limites de ratelimit

O cadastro é limitado a **12 por IP a cada 15 minutos**. O limite não é enfeite: o formulário
cria conta, e criar conta em massa é o abuso óbvio de um site que aceita cadastro aberto.

A APPD cadastra em **mutirão**: fila de pessoas no balcão, uma rede de wi-fi, muitas vezes um
aparelho só, uma inscrição atrás da outra. Do lado do servidor isso é **indistinguível** de
um robô — mesma origem, mesma cadência, mesmo padrão. O limite faz exatamente o que foi
escrito para fazer, e o que ele barra é o atendimento.

## As saídas que não foram tomadas

**Aumentar o teto para todos.** É a leitura literal do pedido, e enfraquece a proteção 24
horas por dia para resolver quatro horas por mês. O número teria de ser alto o bastante para
uma fila inteira — e nesse patamar ele deixa de proteger de qualquer coisa.

**Reconhecer o IP da associação.** É o desenho que ocorre primeiro e envelhece pior: a rede
muda, o mutirão às vezes acontece fora da sede, e um IP numa lista é uma porta que ninguém
lembra de fechar. Além disso exigiria guardar o IP para comparar — e o projeto tem regra
explícita de **nunca** guardar identificador em claro (`modelo-de-dados` REQ-30).

**Deixar o atendente entrar numa conta administrativa.** Resolveria e traria junto o painel
administrativo inteiro, que tem change própria e decisões de fundo pendentes — entre elas
quem responde pelo consentimento do Art. 11 quando é o atendente que preenche. Um limite de
frequência não é lugar para essa decisão entrar de carona.

## Decisão

**O teto sobe para o navegador que provar ser o balcão, por tempo limitado.**

- Ligar exige uma **senha guardada em Cloudflare Secrets** (`MODO_ATENDIMENTO_SENHA`), e nada
  mais. Sem o segredo configurado, o modo **não liga** — a mesma falha fechada do segredo do
  limite de frequência.
- O modo vale **seis horas** e vive num cookie `__Host-` selado por HMAC, com o prazo
  **dentro** do selo. `maxAge` é instrução ao navegador, e navegador é do outro lado; o que
  impede a prorrogação é o HMAC cobrir a data.
- A rota que confere a senha **conta tentativas**, no escopo `login`. Rota que confere senha
  e não conta é rota de força bruta.
- O teto do público **não muda**: continua 12 por 15 minutos.

## O que este modo não faz, e por que está escrito aqui

Não dispensa consentimento, não afrouxa validação, não abre dado de ninguém, não dá acesso a
tela nenhuma, não identifica quem o ligou. **Ele mexe num número, e só.**

Isto não é descrição, é fronteira. Um recurso assim envelhece de um jeito previsível: alguém
precisa de mais uma coisa no balcão, e a coisa entra aqui porque "já tem o modo ligado". Foi
assim que muito painel administrativo nasceu sem ninguém decidir criar um — e este projeto
tem um painel a decidir, com perguntas sérias em aberto.

`test/modo-atendimento.spec.ts` guarda a fronteira: o utilitário não pode mencionar
consentimento, tabela de usuários nem sessão; a rota não pode devolver dado de pessoa; a tela
não pode listar nada nem levar à área do associado.

## Consequências

### O que se ganha

O mutirão funciona sem que a proteção do resto do tempo mude. E quem opera precisa saber uma
senha, não configurar nada.

### O que se perde, dito por inteiro

**A senha é compartilhada entre atendentes**, e senha compartilhada vaza. O que ela dá a
quem a tiver é o direito de fazer muitos cadastros de um navegador — não é acesso a dado, mas
é a capacidade de poluir o banco. A mitigação é o prazo curto e a possibilidade de trocar o
segredo a qualquer momento, sem deploy de código.

**O teto de 120 por 15 minutos é provisório.** Ele precisa vir de quantas pessoas a APPD
atende num mutirão, e a pergunta está em `docs/pendencias-appd.md`, item 4c. Enquanto não
houver resposta, o número é uma estimativa nossa — oito por minuto sustentados, mais do que
uma fila de balcão consegue.

**Há uma tela nova no site que não é para o público.** `/atendimento/modo` responde a quem
souber a URL, com `noindex`. Não é segredo: a senha é que é. Mas é superfície, e superfície
se conta.

### Operação

O segredo precisa ser posto no Cloudflare antes de o modo funcionar em produção:

```bash
npx wrangler secret put MODO_ATENDIMENTO_SENHA
```

Até lá o modo **não liga**, e o site se comporta exatamente como antes desta change — que é
o comportamento certo para uma configuração ausente.
