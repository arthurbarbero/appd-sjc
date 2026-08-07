# Proposal — `modelo-de-dados`

Data: 2026-08-06 · Autor: Claude Code · Dono da decisão: Arthur Barbero
Nível do rito (`fluxo-spec`): **Grande** — cria o contrato de dado persistido do projeto.

## Origem

O gate de 2026-08-05 reprovou as seis changes da Fase 3 com 25 bloqueios. O parecer
fecha nomeando a causa raiz:

> Escreveria, antes de qualquer uma das seis, uma spec do modelo de dados compartilhado.
> […] todas as contradições que este parecer levanta nascem no mesmo lugar: **as
> tabelas**. […] Uma spec de domínio compartilhado teria eliminado, sozinha, dez dos
> vinte e cinco bloqueios.

Esta change é essa spec, escrita depois em vez de antes. Não é retrabalho de conceito:
é o contrato que faltava, agora com três decisões do dono na mão (ADR-012, 013, 014)
que as seis changes não tinham quando foram escritas.

## Problema

Cinco defeitos concretos, todos de dado, todos impossíveis de resolver dentro de uma
change só:

1. `consentimentos.usuario_id NOT NULL` contra formulário preenchido sem conta (B5),
   que arrastava junto o apagamento do tipo de deficiência (B7) e a listagem "minhas
   inscrições" (B17).
2. `numero_registro` com dois donos e dois algoritmos incompatíveis (B10).
3. `situacao` com três leitores e nenhum autor — nenhuma change cria a coluna (B12).
4. Foto com dois limites de tamanho, 5 MB numa change e 102.400 bytes noutra (B11).
5. Três listas diferentes do que a exclusão de conta apaga (B23).

## Escopo

**Entra:** as tabelas do D1, suas colunas, tipos, restrições, chaves e índices; quem
escreve cada coluna e quem só lê; o contrato de exclusão de conta; as migrations
versionadas em `drizzle/migrations`; o schema Drizzle em `server/database/schema.ts`;
os tipos e schemas Zod compartilhados que derivam dele.

**Não entra:** nenhuma rota, nenhuma tela, nenhum componente, nenhuma regra de
apresentação. Esta change não renderiza nada. Também não entram os parâmetros do
scrypt (ADR-005, change `cadastro-e-login`) nem o catálogo de textos de termo
(ADR-006, change `consentimento-e-privacidade`) — aqui só as colunas que os guardam.

## Impacto nas changes existentes

Todas as seis precisam de reescrita parcial. Nenhuma cria coluna a partir daqui.

| Change                        | O que muda                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `formulario-atendimento`      | ganha os 3 campos de cadastro; perde `protocolo`, `possivel_duplicata`, as colunas duplicadas de consentimento e o vocabulário de 3 status |
| `cadastro-e-login`            | perde REQ-22 (foto) e REQ-30 a REQ-35 (telas da área); mantém a emissão do `numero_registro`                                               |
| `consentimento-e-privacidade` | `usuario_id` NOT NULL passa a ser exequível; cede o fluxo de exclusão                                                                      |
| `cracha-do-associado`         | perde REQ-5 (sequência consecutiva) e a T1.2 (ler o maior e somar 1); ganha a posse exclusiva da foto                                      |
| `area-do-associado`           | ganha a edição da inscrição e o fluxo de exclusão; perde `/area/cracha`                                                                    |
| `site-institucional`          | sem impacto de dado                                                                                                                        |

## Riscos

- **R-1 — a spec de dados também pode estar errada.** Mitigação: ela é a única fonte, e
  divergência encontrada na implementação volta para cá antes de virar código.
- **R-2 — reescrever seis changes consome uma sessão inteira** e nada de novo é
  entregue nesse intervalo. Aceito: o custo alternativo é implementar contradição.
- **R-3 — decisão de dado sem a APPD na mesa.** CPF é pergunta nova. Registrado em
  `docs/pendencias-appd.md`; se a associação recusar, o CPF sai e `email` fica sendo a
  única chave — mudança de uma migration, não de arquitetura.

## Critério de pronto

A change fecha quando: as cinco tabelas existem em migration versionada e aplicada no
D1 local; os testes de restrição passam; as seis changes foram reescritas para apontar
para cá; e o gate do `revisor-spec` roda de novo sobre o conjunto e aprova.
