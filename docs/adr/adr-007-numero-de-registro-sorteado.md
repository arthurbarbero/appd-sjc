# ADR-007: Número de registro sorteado, não sequencial

Status: Aceito
Data: 2026-08-06
Decisores: Arthur Barbero (dono do projeto)

## Contexto

O `numero_registro` identifica o associado, aparece no crachá e é o que a pessoa dita por
telefone para a secretaria. O desenho até aqui era `APPD-<ano>-<sequencial de 5 dígitos>`,
com a unicidade garantida pela restrição do banco e nova tentativa em caso de colisão.

O dono questionou a premissa: o número **não precisa ser sequencial**, e sortear até dar
certo é remendo para um problema que não precisava existir.

## O que a revisão achou, e é mais grave

**Numeração sequencial deixa a lista de associados montável por qualquer pessoa.**

A rota `/verificar/<numero>` é pública por desenho — é o que permite conferir um crachá
sem login — e mostra nome, número e situação. Com numeração sequencial, basta pedir
`APPD-2026-00001`, `00002`, `00003` e seguir: em poucos minutos alguém tem o cadastro
inteiro da APPD, com nomes.

O limite de 20 consultas por minuto por IP (`cracha-do-associado` REQ-33) atrasa isso,
não impede. E o dado exposto não é trivial: a lista diz quem é associado de uma
**associação de pessoas com deficiência**. É a mesma categoria de risco que fez o projeto
proibir tipo de deficiência no crachá e na verificação pública.

**Defeito secundário, de implementação:** para escolher o próximo sequencial, o emissor
contava as linhas do ano a cada cadastro — varredura da tabela inteira. Funciona com três
linhas de teste; degrada com três mil.

## Decisão

`APPD-<ano>-<6 caracteres sorteados>`. Exemplo: **`APPD-2026-K7M2QX`**.

- **Alfabeto de 31 símbolos**, sem `0`, `O`, `1`, `I` e `L`. Não é purismo: este número é
  ditado por telefone para alguém anotando à mão, e "zero ou ó" é confusão garantida.
- **31⁶ ≈ 887 milhões** de combinações. Para a ordem de grandeza da APPD, colisão é
  praticamente impossível — e, se acontecer, a restrição `UNIQUE` do banco recusa e o
  emissor sorteia de novo.
- **Sorteio por `crypto.getRandomValues`**, não `Math.random`: o número identifica uma
  pessoa numa página pública, e sorteio previsível derrota o motivo de ele ser sorteado.
- **Rejeição do resto** no mapeamento byte → símbolo, para não enviesar os primeiros
  caracteres do alfabeto.
- **O ano fica.** É útil para a associação e para quem lê o crachá, e o dono mencionou
  querer algo vinculado à data. Ele revela o ano de entrada, o que é informação bem menos
  sensível do que a posição na lista.

## Alternativas consideradas

| Alternativa                        | Prós                                       | Contras                                                                     | Por que NÃO                                           |
| ---------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| Sequencial com retentativa (antes) | legível, ordenado, a APPD sabe quantos são | **lista pública montável**; varredura da tabela a cada cadastro             | o vazamento é o problema, e ele não tem mitigação boa |
| UUID v4 completo                   | colisão descartável                        | 36 caracteres, impossível de ditar por telefone                             | o número é lido em voz alta na secretaria             |
| Derivado do horário (base36)       | curto, único por construção                | adjacentes ficam parecidos; ainda dá para varrer vizinhança e revela a hora | resolve o comprimento, não resolve a enumeração       |
| Formato de placa (`ABC1D23`)       | familiar                                   | mistura letra e dígito em posição fixa sem ganho                            | mesma coisa que o escolhido, com menos entropia       |

## Consequências

- **Positivas**: a lista de associados deixa de ser enumerável; a emissão vira uma
  operação só, sem consulta prévia; some a corrida entre cadastros simultâneos por
  construção, não por retentativa.
- **Negativas / dívida**:
  - **A APPD perde o "somos N associados" de graça.** Antes o último número dizia isso.
    Agora exige contar. É `SELECT count(*)`, mas alguém vai sentir falta.
  - Números não têm ordem: dois associados não conseguem saber quem entrou antes pelo
    número. Não havia requisito disso.
  - Um caractere a mais que o formato anterior (16 contra 15).
- **Gatilho de revisão**: se a verificação pública deixar de ser pública, o argumento
  principal cai — mas aí o custo de voltar a sequencial seria renumerar todo mundo, o que
  o REQ-3 proíbe. Na prática, esta decisão é definitiva.

## Nota sobre a validação no banco

O `CHECK` ficou em duas partes, e a separação tem motivo: o **ano** contém `0` e `1`,
que o alfabeto do **sufixo** exclui. Um único conjunto de caracteres para a coluna inteira
recusaria `APPD-2026-…` por causa do `0` de 2026. Então a estrutura e o alfabeto geral
valem para a coluna toda, e uma segunda condição confere só os seis últimos caracteres.

Erro cometido e corrigido na implementação — registrado porque quem for mexer no `CHECK`
vai tropeçar no mesmo lugar.
