# Prompts para o Claude Design

Um arquivo por tela. Você cola o bloco em `claude.ai/design`; eu não opero o canvas.

## Antes de colar qualquer prompt

1. Abra o projeto de design system **`appd-sjc`** no Claude Design e deixe ele
   selecionado na sessão. É de lá que vêm cor, tipografia, espaçamento e componentes —
   sem isso o app inventa a própria estética.
2. Confira que os cartões apareceram no painel: Fundamentos (cores, tipografia), Ações,
   Formulário (campos, escolhas), Feedback (avisos) e Estrutura.

## Ordem do lote piloto

| Ordem | Tela                        | Por que primeiro                                                  |
| ----- | --------------------------- | ----------------------------------------------------------------- |
| 1     | [Home](home.md)             | Define cabeçalho, rodapé, cartão e as duas ações principais.      |
| 2     | [Serviço](servico.md)       | Template que vale por 5 telas. Exercita conteúdo longo e leitura. |
| 3     | [Formulário](formulario.md) | O caso mais difícil: 15 campos, dado sensível, erro por campo.    |

Aprovadas as três, escrevo os prompts das 13 restantes com o sistema já validado. Se eu
escrevesse os 16 agora e o sistema mudasse na primeira tela, seriam 16 retrabalhos.

## Como usar cada arquivo

Cada um tem quatro partes:

- **A espinha** — a decisão que a tela ajuda a tomar, a hierarquia e os estados. Leia
  antes; é o que permite julgar se o resultado presta.
- **O prompt** — o bloco para colar, inteiro, de uma vez.
- **Aceite visual** — a lista de conferência. Reprovou um item, volta ao canvas.
- **Se sair errado** — o refino específico daquela tela.

## Disciplina de cota

Duas sessões no Claude Design consomem perto de 60% do limite semanal do plano Pro.
Por isso os prompts são densos e específicos: prompt certo de primeira economiza sessão.
Para ajuste fino, use o painel de **Tweaks** (não gasta token de chat), não o chat.

## O texto gerado é rascunho

O microcopy que o app inventa não vai para o site. Os textos definitivos estão em
[servicos/](../servicos/) e em [campos-formulario.md](../campos-formulario.md). Se o
app trocar "Fazer meu cadastro" por "Comece sua jornada", isso volta atrás na revisão.
