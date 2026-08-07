# ADR-008: múltipla escolha guardada como array JSON em coluna TEXT

Status: Aceito
Data: 2026-08-07
Decisores: Arthur Barbero (dono do projeto)

## Contexto

Três campos do formulário oficial aceitam mais de uma resposta: tipo de deficiência, tipo
de atendimento e melhores dias. O contrato de dados precisa dizer onde essas respostas
moram, e a decisão estava citada como `ADR-008` em `formulario-atendimento` (D4) e no
REQ-18 de `modelo-de-dados` desde 2026-08-05 — **sem o ADR existir**. A auditoria mecânica
das specs, escrita em 2026-08-07, achou a citação órfã.

O banco é D1, que é SQLite. Não há tipo array nativo.

## Decisão

Cada campo de múltipla escolha é **uma coluna TEXT contendo um array JSON**, com `CHECK`
garantindo `json_valid`, `json_type = 'array'` e `json_array_length >= 1`.

O vocabulário fechado de cada campo vive em `shared/validacao/inscricao.ts` e é validado
pelo Zod nos dois lados. O banco garante a **forma**; o Zod garante o **conteúdo**.

## Alternativas consideradas

**Tabela de junção** (`inscricao_atendimentos`, uma linha por escolha). É a resposta
relacional canônica e seria a certa se houvesse consulta por escolha — "quantas pessoas
pediram fisioterapia" viraria um `GROUP BY` em vez de varredura de JSON. Recusada por
custo desproporcional na V1: são três campos, com no máximo dez opções cada, num sistema
cuja consulta principal é "a inscrição desta pessoa". Três tabelas a mais, três `JOIN` em
toda leitura e três migrations a manter, para uma pergunta que ninguém faz ainda.

**Colunas booleanas, uma por opção.** Recusada porque acrescentar uma opção viraria
migration — e as opções mudaram em 2026-08-07, quando os quatro projetos entraram na
lista. Teria sido a alternativa mais cara, e a mudança que a provaria errada veio dois
dias depois.

**Texto separado por vírgula.** Recusada: opção com vírgula no nome quebra a leitura, e o
banco não tem como recusar lixo. `json_valid` tem.

## Consequências

**A favor**: uma coluna por campo, sem `JOIN`; acrescentar opção não pede migration; o
`CHECK` recusa lixo mesmo que uma rota nova esqueça o Zod.

**Contra, e assumido**: consulta agregada por escolha exige `json_each`, que não usa
índice. Quando a APPD pedir relatório do tipo "quantos pediram psicologia neste ano", a
saída é a mesma de sempre — ou `json_each` numa base desse tamanho, que aguenta, ou uma
tabela de junção alimentada a partir do JSON. **A reversão é aditiva**: nada do que está
gravado se perde ao criar a tabela depois.

**Limite conhecido**: o banco não sabe o vocabulário. Uma rota que grave
`["Fisioterapia", "banana"]` passa no `CHECK` e é recusada só pelo Zod. Foi decidido
assim porque pôr a lista de opções dentro de um `CHECK` a transformaria em migration a
cada mudança — exatamente o que a alternativa das colunas booleanas tinha de pior.
