# ADR-019: o consentimento governa o que a verificação pública mostra

Status: Aceito
Data: 2026-08-07
Decisores: Arthur Barbero (dono do projeto)

Substitui a parte do [ADR-015](adr-015-verificacao-publica-exibe-foto-e-cuidador.md) que
mantinha o tipo de deficiência fora de `/verificar` em qualquer hipótese, e o REQ-26 da
spec `cracha-do-associado`, que dizia que o opt-in não tem efeito naquela página.

## Contexto

O ADR-015 decidiu que a verificação pública exibe foto e contato de cuidador, e deixou o
tipo de deficiência de fora — **em qualquer caso**, marcado o opt-in ou não. A justificativa
que escrevi foi: dado sensível do Art. 11 numa página sem autenticação "não tem base legal
que a sustente".

O dono apontou o furo, e ele é grande:

> "Na `/verificar` eu não disse que nunca deveria mostrar o tipo de deficiência. Eu disse
> que, dado o consentimento, se sim, mostre. Senão faria sentido eu ter mandado criar toda
> a parte do consentimento?"

**Ele está certo.** Eu tratei "dado sensível" como proibição absoluta e ignorei que o
consentimento é precisamente o que autoriza — é a base legal do Art. 11, I. E construí a
tela de consentimento eu mesmo, três horas antes, para depois escrever que ela não vale
onde mais importa.

## Decisão

**O opt-in do REQ-25 governa as duas exibições: o crachá impresso e `/verificar`.**

- **Desmarcado** (o padrão, e continua nascendo assim): o tipo de deficiência não aparece
  em lugar nenhum — nem no cartão, nem na página pública.
- **Marcado**: aparece nos dois.

Não existe estado intermediário. Duas caixas separadas — uma para o papel, outra para a
web — seriam uma pergunta a mais para o público que menos aguenta pergunta a mais, e a
distinção não corresponde a nada no mundo real: quem mostra o crachá numa portaria já está
mostrando para desconhecido.

## O que isso obriga, e não é opcional

**O texto do consentimento tem de dizer a verdade nova.** Hoje ele afirma o contrário:
_"a página pública de verificação nunca mostra essa informação, marcando ou não"_.
Consentimento colhido com informação errada não é consentimento — é o defeito mais grave
que este ADR cria se a tela não mudar junto.

A redação passa a dizer, sem eufemismo, que marcar publica o tipo de deficiência **no
crachá e na página que qualquer pessoa abre com o número**.

**As proteções que continuam de pé**, e são o que torna a decisão defensável:

- a caixa nasce **desmarcada**, e só a própria pessoa marca;
- sem a marca, a rota **não consulta** o campo — o dado não sai do banco;
- o número de registro é sorteado ([ADR-007](adr-007-numero-de-registro-sorteado.md)), então
  não há como varrer a base;
- o limite de 20 consultas por minuto por hash de IP continua valendo;
- a escolha é reversível a qualquer momento, e desmarcar tira dos dois lugares.

## Alternativas consideradas

**Manter fora da página pública, como o ADR-015.** É o que estava escrito, e cai por
contradizer a decisão do dono e por esvaziar o consentimento que o próprio projeto colhe.

**Duas caixas, uma por destino.** Recusada acima: pergunta a mais sem ganho real.

**Mostrar sempre, sem opt-in.** Nunca esteve na mesa: aí sim não haveria base legal.

## Consequências

**A favor**: o consentimento passa a valer para o que a pessoa efetivamente autorizou. Para
quem quer que o crachá comunique a deficiência — em portaria, em atendimento prioritário —
a verificação passa a confirmar o que o cartão diz.

**Contra, e assumido**: quem marcar publica dado de saúde numa página aberta. É escolha
informada da pessoa, e a tela precisa deixar isso desconfortavelmente claro.

**Efeito no rito**: `cracha-do-associado` **volta de `archive/`**. Mudar contrato de change
arquivada não se faz por adendo — a regra escrita no `tasks.md` de `modelo-de-dados` é que
adendo cabe para o que não muda contrato; isto muda três requisitos. Ela é reimplementada,
revalidada e arquivada de novo.

**Gatilho de revisão**: se a APPD ou o jurídico dela entender que o consentimento colhido
nesta forma não sustenta a publicação, este ADR cai e o ADR-015 volta a valer inteiro.
