# Prompts para o Claude Design

Um arquivo por tela. Você cola o bloco em `claude.ai/design`; eu não opero o canvas.

## Antes de colar qualquer prompt

1. Abra o projeto de design system **`appd-sjc`** no Claude Design e deixe ele
   selecionado na sessão. É de lá que vêm cor, tipografia, espaçamento e componentes —
   sem isso o app inventa a própria estética.
2. Confira que os cartões apareceram no painel: Fundamentos (cores, tipografia), Ações,
   Formulário (campos, escolhas), Feedback (avisos) e Estrutura.

## As 16 telas

**Lote piloto — gerado e aprovado em 2026-08-05.** Validou o design system antes de
escrever o resto. Se eu escrevesse os 16 de uma vez e o sistema mudasse na primeira
tela, seriam 16 retrabalhos — e foi bom não ter feito, porque o sistema mudou mesmo
(ver [refino-v2.md](refino-v2.md)).

| Tela                        | Rota                     | Papel                                     |
| --------------------------- | ------------------------ | ----------------------------------------- |
| [Home](home.md)             | `/`                      | Cabeçalho, rodapé, cartão e as duas ações |
| [Serviço](servico.md)       | `/atendimento/<slug>`    | Template de 5 telas                       |
| [Formulário](formulario.md) | `/atendimento/inscricao` | 15 campos, dado sensível, erro por campo  |

**Lote 1 — públicas.** Fecham o site institucional e destravam a primeira change da
Fase 3.

| Tela                                    | Rota                  |
| --------------------------------------- | --------------------- |
| [Atendimento (hub)](atendimento-hub.md) | `/atendimento`        |
| [Projetos (lista)](projetos-lista.md)   | `/projetos`           |
| [Projeto (detalhe)](projeto-detalhe.md) | `/projetos/<slug>`    |
| [Central de Doações](doacoes.md)        | `/doar`               |
| [Contato](contato.md)                   | `/contato`            |
| [404 útil](404.md)                      | qualquer rota perdida |

**Lote 2 — conta, documento e legais.** Só entram na Fase 4.

| Tela                                           | Rota                  |
| ---------------------------------------------- | --------------------- |
| [Sobre nós](sobre.md)                          | `/sobre`              |
| [Cadastro](cadastro.md)                        | `/cadastro`           |
| [Login](login.md)                              | `/entrar`             |
| [Área do Associado](area-do-associado.md)      | `/area`               |
| [Crachá](cracha.md)                            | `/area/cracha`        |
| [Verificação do crachá](verificacao-cracha.md) | `/verificar/<numero>` |
| [Privacidade e Seus direitos](privacidade.md)  | `/privacidade`        |

## Decisões que valem para mais de uma tela

Se você mudar uma destas, mude em todos os prompts afetados:

- **Ação destrutiva nunca é preenchida.** Excluir conta e excluir dados usam botão
  contornado em vermelho; a ação preenchida da página é a saída segura ("Cancelar").
- **Confirmação destrutiva usa caixas de seleção, não digitação de palavra.** Teclar
  "EXCLUIR" em maiúsculas é barreira para quem tem dificuldade motora ou intelectual —
  exatamente o público deste site. Vale em `area-do-associado.md` e `privacidade.md`.
- **Nenhum telefone pessoal de responsável técnico é publicado** sem autorização
  registrada. Só os números da associação.
- **Contribuição solidária aparece uma vez só**, no campo 15 do formulário.
- **Nada que pareça dado real quando não é**: a chave PIX de exemplo é o literal
  `CHAVE-PIX-AQUI` e o QR de exemplo é um quadrado neutro, sem padrão de módulos — QR
  desenhado "de mentira" é escaneável de verdade.
- **Projeto sem informação confirmada tem o mesmo peso visual** de projeto confirmado.
  Muda a frase e ganha o selo textual "A confirmar"; não fica esmaecido nem menor.

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
