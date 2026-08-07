# ADR-018: entrada e recuperação não revelam conta; o cadastro revela, e diz por quê

Status: Aceito
Data: 2026-08-07
Decisores: Claude Code (decisão delegada por Arthur Barbero em 2026-08-07: "tanto faz, faz
o que achar melhor")

Fecha a Q-1 e a T-0.1 de `cadastro-e-login`.

## Contexto

Três telas podem revelar que um e-mail tem conta: entrada, cadastro e recuperação de
senha. A pergunta era se as mensagens devem ser uniformes — proteção clássica contra
enumeração — ou se podem dizer a verdade.

Neste site a enumeração não vaza só "existe conta". Vaza que **aquela pessoa procurou uma
associação de pessoas com deficiência**, o que é informação sobre saúde por inferência. O
peso é maior que o de um site comum, e é por isso que a pergunta existia.

## Decisão

**Depende da tela, porque o custo de mentir é diferente em cada uma.**

**Entrada (`/entrar`): resposta única.** Senha errada e e-mail inexistente produzem o mesmo
status, o mesmo corpo e o mesmo tempo de resposta. O bloqueio por tentativas conta igual
nos dois casos — cinco tentativas com e-mail inexistente produzem o mesmo bloqueio, byte a
byte, que cinco com e-mail existente. Isso já estava na spec (REQ-24 a REQ-27) e continua.

**Recuperação de senha: resposta única.** Mesma redação para e-mail conhecido e
desconhecido, sem confirmar nada.

**Cadastro: diz que já existe conta com aquele e-mail ou CPF.** É onde a proteção custa
mais do que entrega.

## Por que o cadastro é diferente

Uma mensagem genérica no cadastro não protege: **deixa a pessoa presa**. Ela preencheu 15
campos, não consegue concluir e não sabe por quê. O público deste site é justamente quem
menos vai insistir diante de um erro que não explica nada.

A recuperação de senha está sendo construída — painel administrativo primeiro, e-mail
depois ([ADR-016](adr-016-recuperacao-de-senha.md)). Mesmo com ela
pronta, a conta é do cadastro: dizer "já existe conta com este e-mail" é a informação que
faz a pessoa ir para o lugar certo em vez de tentar de novo com outro dado.

E a proteção seria fraca de qualquer jeito: quem quer enumerar tenta o cadastro, e um
"não foi possível concluir" genérico ainda distingue sucesso de fracasso. Mentir aqui
custa a usabilidade de todo mundo e devolve pouca privacidade.

O que **mitiga**, e é o que fica implementado:

1. O limite de 20 tentativas por hora por hash de IP (REQ-4, REQ-22) já cobre esta rota, e
   é o que impede varredura em massa. O risco residual é o ataque **dirigido**, contra um
   e-mail que o atacante já conhece — cenário estreito.
2. A mensagem diz apenas que já existe conta. **Não confirma nome, telefone, número de
   registro nem qualquer outro dado**, e é idêntica para e-mail e para CPF, sem dizer qual
   dos dois bateu.
3. O texto oferece a saída: entrar, ou falar com a associação pelo telefone.

## Alternativas consideradas

**Uniformizar as três.** Recusada pelo que está acima: proteção fraca contra atacante
dirigido e custo alto para a pessoa legítima.

**Cadastro em duas etapas, confirmando o e-mail antes de mostrar o formulário.** É a saída
tecnicamente correta, e fica para quando houver envio de e-mail — ver o gatilho abaixo.
Acrescentar uma etapa de confirmação a um formulário de 15 campos, num site cujo público
tem dificuldade de leitura e de motricidade, não é escolha barata: entra quando o ganho de
privacidade for medido contra a desistência que ela causa, não por reflexo.

## Consequências

**A favor**: quem já tem conta descobre na hora e sabe o que fazer. As duas telas onde a
enumeração é barata de evitar continuam protegidas.

**Contra, e assumido**: quem souber o e-mail de uma pessoa e tentar cadastrá-lo descobre
que ela tem conta na APPD. Está registrado como risco aceito, com dono e data, e não como
descuido.

**Gatilho de revisão**: quando existir confirmação de e-mail, o cadastro passa a responder
sempre igual e manda a informação por e-mail. É o mesmo evento do ADR-016.
