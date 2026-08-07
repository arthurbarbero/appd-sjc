# ADR-010: implementar o site institucional antes de escrever a spec

Status: Aceito
Data: 2026-08-07
Decisores: Arthur Barbero (dono do projeto)

## Contexto

O `fluxo-spec` da base manda escrever proposal, spec e tasks antes do código em mudança de
porte médio ou grande. O site institucional — 17 páginas públicas, sem banco — foi feito
ao contrário: o código veio primeiro e os 35 requisitos foram escritos depois, a partir do
que já estava na tela.

Isso não foi descuido; foi escolha do dono, para ter o que mostrar à associação. Mas ficou
sem registro por dois dias, e a task 7.1 de `site-institucional` existia justamente para
consertar isso. A auditoria mecânica de 2026-08-07 achou a citação de `ADR-010` sem ADR.

## Decisão

**Vale o que foi feito**: o site institucional fica com a spec escrita depois do código, e
não é reescrito para simular o contrário.

**A exceção não se estende.** Toda change que toca banco, sessão ou dado de pessoa segue o
fluxo na ordem: spec antes, código depois. `modelo-de-dados` foi a primeira a cumprir isso
e é o contrato de referência das demais.

## Alternativas consideradas

**Reescrever a spec como se tivesse vindo antes.** Recusada por ser mentira no registro, e
mentira do tipo caro: quem lesse depois acharia que o processo funcionou e repetiria o
atalho achando que era o rito.

**Jogar o site fora e refazer pelo fluxo.** Recusada. O custo é alto e o benefício é
teórico: as 17 páginas são conteúdo institucional sem regra de negócio, onde o risco de
"código antes da spec" é baixo. A régua do `fluxo-spec` existe para proteger contrato e
dado persistido, e não há nem um nem outro aqui.

**Deixar sem ADR.** Foi o estado real por dois dias, e é o que este documento corrige. Sem
registro, a exceção vira precedente silencioso.

## Consequências

**Custo assumido, escrito com todas as letras**: 35 requisitos nasceram descrevendo o que
já existia, o que os torna estruturalmente incapazes de terem reprovado alguma coisa.
Nenhum deles estava provado por teste na data em que a spec foi escrita. A validação veio
depois, em 2026-08-07, com o gate automatizado.

**Efeito prático**: a spec de `site-institucional` serve como documentação e como rede
contra regressão, não como contrato negociado antes da obra. Ao ler os requisitos dela,
lembrar disto.

**Condição de reversão**: se aparecer requisito do site institucional que a implementação
não cumpre, ele vale — a spec manda, mesmo tendo nascido depois. É o que a torna útil daqui
para a frente.
