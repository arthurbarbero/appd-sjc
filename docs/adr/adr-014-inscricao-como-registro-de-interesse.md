# ADR-014: A inscrição é registro de interesse, editável, sem fila e sem matrícula

Status: Aceito

> **Superseção parcial em 2026-08-07.** A parte que empurrava o **painel de
> gerenciamento** para a V1.1 caiu: o dono decidiu que o acesso de administrador —
> gerenciar usuários, refazer senha — entra na V1, e é a próxima change. Ver
> [ADR-016](adr-016-recuperacao-de-senha.md). O resto do ADR continua
> valendo: não existe fila nem matrícula, e o status tem um valor só.
> Data: 2026-08-06
> Decisores: Arthur Barbero (dono do projeto)

## Contexto

O parecer do gate elegeu como risco número 1 de publicação o seguinte: a tela de
confirmação diria "seu cadastro entrou na fila de vagas" (`formulario-atendimento`
REQ-32), mas na V1 **ninguém lê a tabela** — o painel administrativo é V1.1 — e
**ninguém muda status** (REQ-45). Toda inscrição ficaria eternamente `Na fila`, o que
viola frontalmente o REQ-26 de `site-institucional`: nenhuma tela pode prometer um
efeito que não acontece.

A saída proposta era manter o formulário apontando para o Google Forms até a APPD
designar quem lê. O dono corrigiu a premissa em 2026-08-06, com conhecimento do
funcionamento real da associação:

- o formulário atual **já é pouco usado**: a APPD baixa a planilha e divide entre as
  pessoas manualmente;
- **não existe fila de vagas nem matrícula em aula.** Marcar "Fisioterapia" ou "Bocha"
  não matricula ninguém;
- o que a marcação significa é **sinalizar interesse** até que alguém da APPD atenda.

Ou seja: o vocabulário de status das specs descrevia um processo que a associação não
executa. O problema nunca foi "falta quem leia"; foi a tela prometer coisa errada.

## Decisão

**A inscrição é um registro de interesse da pessoa, editável por ela, sem fila e sem
matrícula.**

1. **Um valor de status, não três.** O vocabulário `Na fila` / `Em atendimento` /
   `Encerrada` (`formulario-atendimento` REQ-43) é revogado.
   Fica `Interesse registrado`, único valor possível na V1. Um enum de um valor é
   honesto; três valores dos quais dois são inalcançáveis é ficção com cara de contrato.
2. **A tela de confirmação diz o que de fato acontece:** os interesses ficaram
   registrados e alguém da APPD entra em contato pelo telefone informado. Nada de
   fila, vaga, posição, prazo ou agendamento.
3. **A inscrição é editável pela própria pessoa**, em `/area/inscricoes`. É requisito
   novo: as seis changes assumiram inscrição escrita uma vez e nunca mais tocada.
4. **Uma inscrição por pessoa** (`usuario_id` UNIQUE). Não é histórico de pedidos: é o
   retrato atual do que a pessoa precisa. Mudou a necessidade, ela edita.
5. **O formulário novo substitui o Google Forms** quando for ao ar. A ressalva do
   parecer — apontar para o Forms até haver leitor — **cai**, porque não há promessa a
   cumprir e porque a APPD passa a ter a informação num lugar que a própria pessoa
   mantém atualizado, o que a planilha nunca deu.

## Alternativas consideradas

| Alternativa                                     | Prós                                | Contras                                                                     | Por que NÃO                                                    |
| ----------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Manter os três status e o painel na V1.1        | pronto para quando o painel existir | dois dos três valores inalcançáveis; cenário de aceite só passa com fixture | contrato que descreve processo inexistente                     |
| Manter o link para o Google Forms na publicação | zero risco de perder cadastro       | congela o projeto no que ele veio substituir                                | não há promessa descumprida a evitar: a premissa do risco caiu |
| Inscrição imutável, com histórico de pedidos    | preserva o que foi pedido e quando  | a pessoa não corrige nem o próprio telefone sem abrir pedido novo           | o objetivo declarado é a pessoa gerenciar o próprio cadastro   |

## Consequências

- **Positivas**: cai o bloqueio de publicação nº 1 do parecer e o B16; cai o cenário de
  `area-do-associado` que dependia de um status que a V1 não produz (contradição D);
  a APPD passa a ter dado que se mantém atualizado sozinho, em vez de planilha que
  envelhece no dia seguinte ao download.
- **Negativas / dívida**:
  - **Editar apaga o que havia antes.** Não há histórico: se a associação um dia
    precisar saber quando a pessoa pediu fisioterapia pela primeira vez, o dado não
    existe. Mitigação mínima na spec: coluna `atualizado_em`. Histórico de verdade é
    decisão de outra versão.
  - **Ainda não existe tela para a APPD ler as inscrições.** Isso deixou de ser
    bloqueio de publicação, mas continua sendo a próxima entrega de valor: sem ela, a
    associação segue dependendo de exportação manual.
  - O texto de abertura do formulário atual — "os atendimentos são agendados conforme o
    surgimento de vagas" — está **desatualizado na origem**. É texto da APPD; entra em
    `docs/pendencias-appd.md` para a associação corrigir, não é alterado por nós.
- **Gatilho de revisão**: no dia em que a APPD passar a operar fila ou turma com vaga
  limitada, o vocabulário de status volta à mesa — e aí ele nasce com quem o escreve
  definido, que é o que faltava.

## Escopo nomeado da versão seguinte

Painel de gerenciamento da plataforma, com perfis distintos para quem opera a APPD
(change `painel-admin`, já prevista no `openspec/README.md` como item 7). Fica
registrado como escopo com nome, não como "depois a gente vê".
