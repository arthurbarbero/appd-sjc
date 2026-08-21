# Revisão do dono em vídeo — 2026-08-20

Origem: gravação de 16min40s (`Gravando 2026-08-20 184755.mp4`), o dono percorrendo
<https://appd-sjc.appd-sjc.workers.dev> no ar e comentando tela por tela. Transcrição
automática em [`revisao-dono-2026-08-20-transcricao.md`](revisao-dono-2026-08-20-transcricao.md);
cada item abaixo foi conferido contra o quadro do vídeo no minuto citado, porque a
transcrição sozinha erra nome de campo.

Telas percorridas, na ordem: `/` → `/contato` → `/atendimento/inscricao` (cadastro
completo, com foto e consentimento) → `/area` → `/area/cracha` (PNG, PDF e impressão) →
`/area/dados` → `/area/inscricoes` → `/area/excluir` → `/projetos/bocha-paralimpica` →
`/doar` → `/sobre` → `/contato`.

**O que o dono elogiou**, e portanto não se mexe: a tipografia e o aspecto geral (00:06),
o rodapé (00:59), os links de "Combinar a retirada" e "Falar sobre voluntariado" (01:05 a
01:25), a máscara de telefone e a de data (03:56, 04:16), a disposição de `/area/inscricoes`
(10:03), o Pix da `/doar` (14:55) e a seção de transparência (14:59).

## 1. Transversal — vale para todas as telas

| #   | Minuto                            | O que ele disse                                                                                                                                                              | Leitura                                                                                                                                                                                                                                               |
| --- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | 00:20, 02:13, 11:50, 12:48, 15:07 | "as coisas não vão até o fim", "tudo pequenininho espremido", "por que tá cortado? o espaço é grande aqui", "ficou pequenininho de novo"                                     | O texto ocupa metade da largura disponível. Causa: `p { max-width: var(--medida) }` global com `--medida: 68ch` (`app/assets/css/base.css:50`, `tokens.css:69`) dentro de um container de 1120px (`app/layouts/default.vue:142`). Repetiu em 7 telas. |
| T2  | 03:37                             | "todas essas divisões de tela precisam ter [padrão] e precisam ser bem centralizadas; tem que ser do tamanho do bloco"                                                       | Padronizar largura e centralização dos blocos entre as telas, em vez de cada página resolver a sua.                                                                                                                                                   |
| T3  | 02:39                             | "ele cabe perfeitamente aqui em cima… nesse tamanho o [texto APPD] pode sair, fica só o logo, esses todos vêm pra cima"                                                      | Em largura intermediária, esconder o texto "APPD / São José dos Campos" e manter só o símbolo, subindo os seis links para a mesma linha do cabeçalho.                                                                                                 |
| T4  | 02:53 a 03:32                     | "isso aqui é feio… podia ser só aquele hambúrguer, os três tracejadinhos. Quando eu clicasse, vinha da direita pra esquerda, por cima. Só pra não ter esse blanco pra baixo" | Trocar o botão com a palavra "Menu" por ícone hambúrguer; abrir em painel deslizante da direita, sobrepondo o conteúdo, em vez de empurrar a página para baixo. Mesmos links.                                                                         |
| T5  | 07:56                             | "ficou feio com esse x, podia ser só frase vermelha, um pouquinho menor, igual a esse aqui, não precisa ter o x"                                                             | Mensagem de erro do campo: sem o "✕" colado no texto, só a frase em vermelho, um corpo menor, igual ao padrão dos outros campos.                                                                                                                      |

## 2. Defeitos

| #   | Minuto                     | O que acontece                                                                                                                                                                                                      |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | 08:13                      | "ponto negativo, a foto não apareceu mesmo tendo subido" — a foto enviada no cadastro não aparece no cartão de `/area`; aparece em `/area/cracha`.                                                                  |
| B2  | 08:31, 09:14, 09:26, 13:30 | "ele tá indo lá pra baixo quando eu clico aqui, não faz sentido" — clicar na navegação da área rola a página para baixo. Piorou durante a gravação: "agora eu clico em qualquer lugar e ele vai pra baixo. Um bug". |
| B3  | 06:42 a 06:50              | "se eu fizer esse clicar antes de apertar, deixa branco. A gente não pode deixar branco" — no recorte da foto, sair antes de confirmar deixa a imagem em branco.                                                    |

## 3. Início (`/`)

| #   | Minuto | Pedido                                                                                                     |
| --- | ------ | ---------------------------------------------------------------------------------------------------------- |
| H1  | 00:30  | Remover as duas legendas sob os botões do herói ("Cadastro gratuito…" e "Doação de equipamento, fralda…"). |
| H2  | 00:43  | Seção Atendimento: remover a linha de apoio, "deixa só os quadrados" (os cards).                           |
| H3  | 00:51  | Seção Projetos: o mesmo.                                                                                   |

## 4. Cadastro de atendimento (`/atendimento/inscricao`)

| #   | Minuto        | Pedido                                                                                                                                                                                                                             |
| --- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | 02:00         | Remover o bloco amarelo "Antes de começar" inteiro e subir o conteúdo.                                                                                                                                                             |
| C2  | 02:13         | O formulário é estreito demais para a largura do bloco; usar a largura disponível.                                                                                                                                                 |
| C3  | 02:25         | Ao estreitar a janela, o conteúdo escapa para a esquerda em vez de acompanhar o bloco.                                                                                                                                             |
| C4  | 04:19         | Campo Endereço é uma caixa alta de várias linhas; "podia ser uma caixa normal de texto".                                                                                                                                           |
| C5  | 04:36 a 04:53 | Campo Número. Era ambíguo no vídeo — "só tem que ser número, não pode permitir" e, cinco segundos depois, "pode permitir escrever, às vezes é 3 casa 2". **Resolvido pelo dono em 2026-08-20: "deixa do jeito que tá".** Sem ação. |
| C6  | 05:05         | Falta **Estado** e **País** no endereço.                                                                                                                                                                                           |
| C7  | 06:05         | CPF: "era bom ter uma máscara também".                                                                                                                                                                                             |
| C8  | 06:50         | No recorte da foto o zoom só funciona pelo controle, não pelo mouse: "não é um problema, mas na versão mobile deve ficar zoada".                                                                                                   |
| —   | 05:17 a 05:40 | Cogitou pôr os serviços em duas colunas e **desistiu na hora**: "deixa assim mesmo". Sem ação.                                                                                                                                     |

## 5. Área do associado

| #   | Minuto        | Pedido                                                                                                                                                                                                   |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | 08:41 a 09:14 | Reorganizar a navegação: o cabeçalho da área "bem mini, só foto e o linkinho"; as abas viram menu **à esquerda**, o conteúdo aparece **à direita**, "um single page com várias áreas".                   |
| A2  | 09:53         | Remover o cartão com nome e número de registro: "esse número é seu e não muda, não precisa".                                                                                                             |
| A3  | 12:28         | `/area/dados`: em vez do parágrafo explicando por que e-mail, CPF e nascimento não mudam, mostrar os três **campos preenchidos e desabilitados**. "Não precisa ter uma explicação de por que foi feito." |
| A4  | 12:20         | `/area/dados`: as opções de "É WhatsApp" lado a lado, não empilhadas.                                                                                                                                    |
| A5  | 12:59         | "Salvar alterações" fica disponível mesmo sem nada ter mudado; e depois de salvar deveria "no mínimo voltar aqui em cima".                                                                               |
| A6  | 13:12         | Botão **Sair** azul: "não tem nada a ver com o site, bagulho azul".                                                                                                                                      |

## 6. Crachá

| #   | Minuto        | Pedido                                                                                                                                                                                                       |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| K1  | 10:16         | A pré-visualização parece pequena a 100% de zoom. Ele reconhece a intenção ("você quis fazer tamanho real"), mas quer rever.                                                                                 |
| K2  | 10:50 a 11:19 | No PDF, frente e verso saem **empilhados**. Ele quer os dois **lado a lado**, "uma tripa deitada, da esquerda para a direita", com a margem branca para corte.                                               |
| K3  | 11:21         | **Bloqueio explícito**: "antes de mexer aqui, peça pra mim por favor a foto" — ele tem foto do crachá físico atual para replicarmos. **Entregue em 2026-08-20**; ver a Fase 4 do proposal.                   |
| K4  | 11:30         | **Confirmado pelo dono em 2026-08-20**: apagar as duas linhas que ele seleciona com o mouse — "O arquivo é gerado aqui no seu navegador." e "Nada é enviado para fora.", logo abaixo dos botões de download. |

## 7. Excluir conta (`/area/excluir`)

| #   | Minuto | Pedido                                                                                                                                                                        |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | 13:57  | Remover o parágrafo sobre a ficha de atendimento em papel: "se ele nunca teve, então você não vai falar nada". O aviso "Isto não pode ser desfeito" ele leu e aprovou — fica. |

## 8. Projetos, Doar, Sobre, Contato

| #   | Minuto        | Pedido                                                                                                                                                                                                   |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | 14:32 a 14:44 | Projetos: **não mexer agora**. "A maioria nem está mais funcionando; deixa assim e depois eu vou ver." Os `[A CONFIRMAR]` ele revisa em bloco (14:22).                                                   |
| P2  | 14:44 a 15:12 | `/doar` aprovada, exceto a largura (T1) e a disposição da transparência: "não é quebrado, mas não está certo".                                                                                           |
| P3  | 15:19         | `/sobre`: a fundadora tem um parágrafo e o presidente tem quatro. "Tem muito mais dados sobre essa pessoa que você não trouxe… quero que traga tudo dos dois." Ele avisa que o conteúdo ainda vai mudar. |
| P4  | 16:04         | `/contato`: "se eu tô logado, por que você já não [preenche]?" — pré-preencher nome, e-mail e telefone de quem está autenticado.                                                                         |
| P5  | 15:45 a 16:21 | `/contato`: "isso aqui eu não sei pra onde vai — se eu conferir, vai pra onde?" O botão "Conferir minha mensagem" não diz o destino, e o formulário ainda não envia (pendência aberta com a APPD).       |

## O que o dono pediu ao final (16:23 a 16:38)

> "Acho que ele já viu todas as telas. Eu preciso que você organize primeiro, faça um
> plano pra arrumar essas coisas, crie isso como uma change. **Não vá pular nem o rito.**
> E aí me mande o plano antes de começar."

Daí esta pasta e o proposal em `openspec/changes/acabamento-de-interface/`, em rascunho:
nada de código antes da revisão do dono e da spec, conforme `openspec/README.md`.
