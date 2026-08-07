# ADR-017: o site não guarda nada após a exclusão, porque não guarda prontuário

Status: Aceito
Data: 2026-08-07
Decisores: Claude Code (decisão delegada por Arthur Barbero em 2026-08-07: "você quem
decide agora, depois a APPD revisa"). **Sujeito a revisão da APPD e do jurídico dela.**

Fecha a PB-1 de `consentimento-e-privacidade` e a T0.2 de `area-do-associado`.

## Contexto

A pergunta em aberto era: por quanto tempo a associação precisa guardar a ficha de
atendimento depois que a pessoa pede exclusão, e **qual norma obriga isso**? O Art. 16, I
da LGPD autoriza conservar para cumprir obrigação legal ou regulatória — mas não diz qual
obrigação nem por quanto tempo.

A pergunta travava o texto de `/area/excluir` ("o que a associação precisa manter") e a
seção 9 de `/privacidade`, as duas com `[A CONFIRMAR]` visível.

## O que as normas dizem

| Área                         | Norma                                                         | Prazo mínimo                               |
| ---------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| Fisioterapia                 | Resolução **COFFITO 414/2012**                                | 5 anos do último registro                  |
| Psicologia                   | Resoluções **CFP 001/2009** e **006/2019**                    | 5 anos para documentos de atendimento      |
| Prontuário de saúde em geral | **Lei 13.787/2018**                                           | 20 anos da última entrada, para eliminação |
| Serviço social               | CFESS — não localizada norma de prazo de guarda de prontuário | —                                          |
| Reparação civil              | Código Civil                                                  | 3 ou 10 anos, conforme o enquadramento     |

## Decisão

**O prazo de retenção não se aplica ao site, porque o site não guarda prontuário.**

O que este sistema armazena é o **registro de interesse** do
[ADR-014](adr-014-inscricao-como-registro-de-interesse.md): nome, contato, endereço, quais
atendimentos a pessoa procura e em quais dias. **Não há conteúdo clínico**: nenhuma
evolução, nenhuma avaliação, nenhum laudo, nenhuma sessão. Prontuário é o documento do
atendimento prestado, e ele nasce — em papel — na sede da associação, fora deste
repositório.

Portanto, ao pedir exclusão, o site executa o contrato do `modelo-de-dados` REQ-28 **e
nada além**: apaga a inscrição e a foto, anonimiza `usuarios` preservando o
`numero_registro` para que um crachá antigo não passe a identificar outra pessoa, grava a
revogação em `consentimentos` e encerra a sessão.

**Nenhum dado pessoal fica retido no banco por prazo nenhum.** Não existe cópia em
quarentena, não existe exclusão lógica com nome preservado, não existe temporizador de
cinco anos a implementar.

### O que a tela passa a dizer, sem `[A CONFIRMAR]`

> **O que sai daqui:** seu nome, endereço, telefone, e-mail, CPF, data de nascimento, a
> foto do crachá e tudo o que você respondeu no cadastro de atendimento. Sai na hora, e
> não dá para desfazer.
>
> **O que fica:** o número de registro, sem nada ligado a ele — para que um crachá antigo
> não passe a identificar outra pessoa. E o registro de que você aceitou e depois revogou
> o consentimento, com data e hora, que é a prova de que a associação respeitou a sua
> escolha.
>
> **O que este site nunca teve:** ficha de atendimento. Se você já foi atendida na sede, a
> associação guarda esse documento em papel, por obrigação profissional — cinco anos, no
> mínimo, contados do último atendimento (Resolução COFFITO 414/2012 e Resoluções CFP
> 001/2009 e 006/2019). Para pedir a exclusão desse papel, fale com a associação: apagar
> sua conta aqui não apaga o arquivo de lá.

## Alternativas consideradas

**Reter a inscrição por cinco anos, por analogia com o prontuário.** Recusada, e é a
tentação óbvia: aplicar o prazo mais conservador parece prudente. Não é. Guardar dado
pessoal sem obrigação que o justifique é **tratamento sem base legal** — a LGPD autoriza a
conservação, não a exige, e quem conserva precisa dizer por quê. "Por precaução" não é
finalidade.

**Reter por dez anos, pela prescrição civil.** Recusada pelo mesmo motivo, agravado: o
prazo prescricional protege quem eventualmente seja processado. Uma associação
assistencial guardar dado de pessoa com deficiência por uma década para se defender de
processo hipotético é desproporcional ao risco real.

**Deixar `[A CONFIRMAR]` até a APPD responder.** Recusada porque o dono decidiu o
contrário, e porque a marcação estava travando duas telas havia dois dias. A revisão da
associação continua marcada — o que muda é que agora ela revisa um texto, e não um vazio.

## Consequências

**A favor**: some o `[A CONFIRMAR]` de `/area/excluir` e da seção 9 de `/privacidade`; a
Fatia 4 de `area-do-associado` destrava; e o sistema fica mais simples, porque não há
retenção a implementar.

**Contra, e assumido**: se a APPD responder que guarda, sim, ficha de atendimento no
sistema — hoje ela baixa planilha —, este ADR é revisto por ADR novo. A premissa que o
sustenta é verificável numa pergunta.

**O que este ADR não decide**: o que a associação faz com o papel dela. Isso é da APPD e
do conselho profissional de cada área, e a tela diz exatamente isso em vez de fingir que o
botão de excluir alcança a sede.

**Gatilho de revisão**: a APPD passar a registrar atendimento no sistema, ou o jurídico
dela apontar obrigação que a pesquisa não achou — em especial do lado do serviço social,
onde não localizei norma de prazo.
