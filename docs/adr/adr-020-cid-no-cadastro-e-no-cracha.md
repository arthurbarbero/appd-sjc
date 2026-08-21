# ADR-020: o CID entra no cadastro e pode sair no crachá, sob consentimento próprio

Status: Aceito, **parcialmente emendado** pelo
[ADR-021](adr-021-cracha-replica-o-cartao-de-papel.md) no mesmo dia
Data: 2026-08-21
Decisores: Arthur Barbero (dono do projeto)

> **Emenda de 2026-08-21.** A segunda das três travas abaixo — o **opt-in próprio para
> imprimir**, separado do consentimento de coleta — foi **revogada** por decisão do dono
> horas depois de escrita: "o CID pode entrar junto do consentimento atual existente".
> Quem autoriza guardar autoriza imprimir, e o texto do formulário passou a dizer isso
> antes da caixa.
>
> **A trava do `/verificar` continua inteira e sem exceção**, e é a que este ADR existe
> para sustentar. O raciocínio abaixo sobre por que guardar e imprimir são decisões
> diferentes fica registrado como está: ele não deixou de ser verdadeiro por ter perdido.

Estende o [ADR-019](adr-019-consentimento-governa-a-verificacao-publica.md), que já fizera
o consentimento governar o que a verificação pública mostra. Aqui entra um dado **mais
sensível** que o tipo de deficiência, e por isso ele ganha regra própria em vez de pegar
carona na existente.

## Contexto

O crachá que a APPD usa hoje imprime, na frente e em corpo grande, `CID G82.4 ·
TETRAPLEGIA · Cadeirante`. O dono decidiu em 2026-08-21 que o site vai coletar o CID no
formulário e poder imprimi-lo no crachá, para que o cartão gerado sirva ao que o cartão de
papel serve.

**A decisão é legítima e tem uso real.** O CID abre porta: atendimento prioritário, passe
livre municipal, isenções. Um cartão sem ele obriga a pessoa a carregar laudo à parte, e é
justamente essa fricção que a associação existe para reduzir.

O que precisa ficar registrado é o que muda de grau.

### O CID não é "mais um campo de deficiência"

O campo 12 guarda `Física`, `Intelectual ou Neurodivergentes`, `Sensorial`, `Outro`. Isso
**descreve** uma condição em categoria larga. O CID **diagnostica**: `G82.4` é
tetraplegia espástica, com nome, código e classificação clínica. Os dois são dado de saúde
do Art. 11 da LGPD; só o segundo é prontuário.

E há uma diferença que não é jurídica, é física: **o crachá vai no bolso e é mostrado a
quem pedir.** A página `/verificar` alguém precisa procurar; o cartão impresso é entregue
na mão de um porteiro, de um cobrador, de um atendente. O CID impresso é o dado mais
exposto que este projeto vai produzir.

Por isso ele não herda o consentimento do campo 12. Consentimento do Art. 11 é
**específico por finalidade**, e "organizar o meu atendimento" não cobre "imprimir o meu
diagnóstico num documento que eu mostro na rua".

## Decisão

**O CID entra**, como campo **opcional** do formulário, e pode ser impresso no crachá —
sob três travas, todas obrigatórias:

1. **Coletar exige consentimento próprio**, separado do consentimento do campo 12, com
   texto que nomeia a finalidade e a versão do termo registrada como qualquer outro aceite.
2. **Imprimir exige opt-in próprio**, separado do consentimento de coleta e do opt-in do
   tipo de deficiência. Guardar o CID e estampá-lo são decisões diferentes, e a pessoa
   toma as duas.
3. **O CID nunca aparece em `/verificar`.** Nem sob opt-in, nem sob consentimento, nem por
   parâmetro. A página é pública e indexável por quem tem o número; diagnóstico ali é
   irreversível.

**Nada no site depende do CID.** Sem ele, o cadastro conclui, o crachá sai, a verificação
funciona. Campo opcional que vira obrigatório na prática é campo obrigatório com outro
nome.

## O que isso obriga, e não é opcional

- **Coluna própria em `usuarios`, anulável**, apagada na exclusão junto das demais colunas
  pessoais (ADR-017). Nunca dentro do campo 12: misturar categoria e diagnóstico na mesma
  coluna faz toda leitura do campo 12 passar a carregar diagnóstico.
- **Registro de consentimento versionado**, na tabela `consentimentos`, com hash do termo
  exibido — o mesmo mecanismo do Art. 11 que já existe. Um termo novo, não o mesmo texto.
- **Retirada apaga o CID**, como a retirada do campo 12 já apaga o tipo de deficiência, e
  desliga o opt-in de impressão junto. Uma transação só.
- **A proibição transversal ganha um segundo alvo.** O teste que garante que o campo 12 não
  vaza para rota pública passa a cobrir o CID, com a diferença de que para o CID **não
  existe exceção sob opt-in**.
- **O texto da tela precisa dizer o que a impressão significa**: que o cartão será mostrado
  a terceiros, e que o diagnóstico estará nele. Sem eufemismo e sem "recomendado".

## Alternativas consideradas

**Não coletar, e imprimir só o tipo de deficiência.** Era a posição do proposal, e o dono
recusou com razão prática: o cartão da APPD tem CID porque o CID é o que os serviços
pedem. Um crachá que não serve para o que a pessoa precisa é bonito e inútil.

**Coletar e imprimir sempre, como o cartão de papel faz.** Recusada. O cartão de papel foi
desenhado quando ninguém tinha escolha; aqui a pessoa tem, e tirar essa escolha para imitar
o papel seria copiar o defeito junto com a forma.

**Aproveitar o consentimento do campo 12.** Recusada por ser exatamente o que o Art. 11
proíbe: consentimento genérico para tratamento de dado sensível. Também seria mentira — o
termo atual fala em organizar atendimento, não em imprimir diagnóstico.

## Consequências

**Ganho:** o crachá gerado passa a servir ao que o de papel serve, e a pessoa deixa de
depender da associação para ter um cartão que funciona na porta do ônibus.

**Custo, e é real:** este projeto passa a guardar diagnóstico. Toda decisão futura sobre
exportação, relatório e painel administrativo herda esse peso — o `painel-administrativo`,
que já previa exportação em massa do campo 12, agora precisa decidir o que faz com o CID
antes de existir.

**O risco que fica:** uma pessoa marca o opt-in de impressão sem dimensionar quantas vezes
mostrará o cartão. A trava contra isso é o texto da tela, e é uma trava fraca. Se aparecer
sinal de que as pessoas marcam sem entender, a resposta é revisar o texto — não silenciar
o dado.
