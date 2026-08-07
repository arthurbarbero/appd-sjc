# Proposal — `revisao-de-interface`

Data: 2026-08-07 · Autor: Claude Code · Dono da decisão: Arthur Barbero
Nível do rito (`fluxo-spec`): **Média** — várias telas, sem tocar contrato de dado.

## Origem

Sessão de uso do dono em 2026-08-06, navegando o site rodando em `localhost:8787`. São
achados de quem usou, não de quem leu o código — e por isso valem mais do que a minha
revisão: eu olhava se a regra estava cumprida, ele olhava se a tela servia.

## Problema

Três famílias de defeito, e uma delas eu tinha declarado resolvida:

1. **Conteúdo que não existe no site original ou que virou mentira.** Blocos inventados
   por mim durante a Fase 2, e textos que descrevem a fila de vagas — que o
   [ADR-014](../../../docs/adr/adr-014-inscricao-como-registro-de-interesse.md) já
   revogou. Eu varri "fila" nas specs e no `conteudo.ts`, mas **não varri as telas**:
   sobrou na home e no hub de atendimento.
2. **Interação datada.** Cartão de serviço com o título estático e um link azul embaixo,
   telefone virando botão grande, ação principal escondida em link de texto. Some o
   afeto de site institucional e sobra formulário de 1998.
3. **Cabeçalho quebrado**, por mudança minha de ontem: o link de conta entrou sem ajuste
   do container e caiu para fora da linha.

## Escopo

**Entra:** conteúdo e interação das telas públicas — home, hub de atendimento, projetos,
sobre, contato — mais o cabeçalho e o rodapé. Todo o cartão de serviço e de projeto vira
área clicável inteira, com estado de foco e de passagem do ponteiro.

**Não entra:** contrato de dado, rota de servidor, regra de negócio, e as telas de
`/area/*`, que acabaram de ser desenhadas e ainda não foram usadas por ninguém.

## Impacto

- `shared/conteudo.ts` perde blocos e ganha as opções que hoje só existem como texto
  livre em "Outro" (ponto 3 do dono).
- `app/assets/css/base.css` ganha o padrão de cartão clicável, para as três telas usarem o
  mesmo — e não três variações parecidas.
- Nenhuma migration, nenhuma alteração de API.

## Riscos

- **R-1 — remover conteúdo que a APPD queria.** Os blocos a remover foram escritos por
  mim, não vieram do site original; mesmo assim, a associação revisa antes de publicar.
  Mitigação: o que sai fica registrado nesta change, não some do histórico.
- **R-2 — transformar opção de texto livre em opção fixa muda a pergunta do formulário.**
  O `docs/campos-formulario.md` diz que a lista é réplica fiel. Esta change **cria opções
  novas** por decisão do dono, e isso vai para `docs/pendencias-appd.md` como divergência
  a validar com a associação, não como fato consumado.

## Critério de pronto

Cada item da spec verificado na tela, em 360px e em 1280px, e o `axe` sem violação de
nível A ou AA nas telas tocadas.
