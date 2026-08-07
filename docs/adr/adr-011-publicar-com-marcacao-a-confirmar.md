# ADR-011: publicar com selo "A confirmar" em vez de esperar a revisão da APPD

Status: Aceito
Data: 2026-08-07
Decisores: Arthur Barbero (dono do projeto)

## Contexto

O discovery do site atual levantou dezenas de informações que **a associação ainda não
confirmou**: horário de funcionamento da sede, quem é o profissional responsável por cada
atendimento, dias e horários de três dos quatro projetos, número de pessoas atendidas,
composição da diretoria. Estão listadas em `docs/pendencias-appd.md`.

Havia duas saídas: segurar as páginas até a APPD responder, ou publicá-las marcando o que
não está confirmado. A decisão foi tomada em 2026-08-05 e implementada; a task 7.2 de
`site-institucional` pedia o ADR, que não foi escrito. A auditoria mecânica de 2026-08-07
achou a citação órfã.

## Decisão

**As páginas vão ao ar com o que se sabe, e o que não se sabe aparece com o selo "A
confirmar"** — texto visível, não só cor, ao lado da informação faltante.

Nada é inventado para preencher lacuna. Onde falta dado, a tela diz que falta.

## Alternativas consideradas

**Esperar a APPD responder.** Recusada: a associação é voluntária e a resposta pode levar
semanas. Nesse tempo, quem procura atendimento continua com o site antigo, que tem menos
informação e nenhuma marcação de incerteza.

**Publicar sem o selo, só omitindo o que falta.** Recusada, e é a alternativa perigosa:
uma página que não menciona horário parece completa. Quem lê conclui que não há horário
definido, ou liga achando que qualquer hora serve. **Omissão silenciosa é pior que lacuna
declarada** — a lacuna declarada leva a pessoa a telefonar, que é o que resolve.

**Preencher com o que é provável.** Recusada sem discussão: seria inventar dado sobre uma
associação real, num site que leva o nome dela.

## Consequências

**A favor**: o site vai ao ar útil; cada selo é uma pergunta objetiva registrada em
`docs/pendencias-appd.md`, o que transforma a revisão da APPD numa lista curta em vez de
uma leitura do site inteiro.

**Contra, e assumido**: a página fica com aparência de rascunho enquanto os selos não
saem. É o preço, e é preferível ao contrário.

**Condição de saída, e é dura**: os selos são aceitáveis em `*.workers.dev`, que é
endereço de demonstração. **Nada vai para o domínio da APPD antes de a associação revisar
o conteúdo** — regra do `CLAUDE.md`, e ela não cai por este ADR. O selo compra tempo para
mostrar o trabalho, não para publicar no nome deles sem revisão.
