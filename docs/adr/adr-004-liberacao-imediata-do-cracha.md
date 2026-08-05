# ADR-004: Liberação imediata do crachá, sem aprovação prévia

Status: Aceito
Data: 2026-08-05
Decisores: Arthur Barbero (dono do projeto)

## Contexto

O crachá do associado tem número de registro, foto e um QR Code que leva a uma página
pública de verificação. A pergunta é quem libera: a pessoa gera o crachá assim que
conclui o cadastro, ou a associação aprova antes?

A APPD não tem hoje um fluxo administrativo definido nem alguém designado para essa
triagem. O painel administrativo está previsto só para a V1.1. Exigir aprovação sem ter
quem aprove significa, na prática, ninguém receber crachá nenhum.

## Decisão

Nesta versão, **o crachá é liberado imediatamente** ao concluir o cadastro, sem
aprovação prévia da associação. Decisão consciente do dono do projeto, tomada com o
risco na mesa.

## Alternativas consideradas

| Alternativa                        | Prós                                           | Contras                                          | Por que NÃO                                              |
| ---------------------------------- | ---------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| Aprovação prévia pela associação   | ninguém se identifica como associado sem sê-lo | exige painel e pessoa designada, que não existem | vira fila parada: sem quem aprove, ninguém recebe crachá |
| Crachá só depois do 1º atendimento | vínculo real comprovado                        | quem está na fila fica sem documento por meses   | o crachá também serve para quem ainda espera vaga        |
| Sem crachá nesta versão            | zero risco                                     | remove um item do escopo que a associação pediu  | o crachá é parte do produto, não enfeite                 |

## Consequências

- **Positivas**: a pessoa resolve sozinha, sem depender da disponibilidade de ninguém;
  não cria fila administrativa que a associação não tem como atender.
- **Negativas / dívida**:
  - **Qualquer pessoa que preencha o cadastro obtém um crachá.** O documento atesta que
    houve um cadastro, não que houve um vínculo verificado. A página de verificação
    precisa deixar isso claro em vez de sugerir credencial verificada.
  - Nome no crachá é o que a pessoa digitou. Não há conferência com documento.
  - Se a associação passar a usar o crachá para dar acesso físico ou benefício, esta
    decisão vira problema de segurança na hora.
- **Gatilho de revisão**: no momento em que o crachá passar a dar acesso a qualquer
  coisa — espaço, benefício, desconto —, ou quando existir o painel administrativo com
  alguém designado para triagem, este ADR é reaberto. A mitigação já prevista é o campo
  de **situação** na verificação pública, que permite invalidar um crachá sem apagar o
  registro.

## Registro de responsabilidade

Este é um caso em que o produto aceita um risco conhecido para não travar. A escolha é
do dono do projeto e está documentada aqui exatamente para que ninguém a descubra por
acidente depois — e para que a APPD possa discordar com informação na mão.
