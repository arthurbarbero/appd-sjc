# Proposal: pedidos da APPD

- Data: 2026-08-21
- Origem: a **associação** revisou o site e mandou cinco pontos pelo dono
- Prioridade: **antes de tudo** — decisão do dono
- Changes tocadas: `formulario-atendimento` (campos 13, 23 e 24),
  `site-institucional` (projetos), `cadastro-e-login` (limite de frequência)

## Por que esta change vem primeiro

Os cinco pontos não vieram de mim nem do dono olhando a tela: vieram de **quem atende**. É a
primeira vez que a associação revisa o site desde que ele existe, e três dos cinco são
correções de fato — o site diz coisa que não corresponde ao que a APPD faz hoje.

Isso muda a natureza do trabalho. Ajuste que o dono pede é preferência dele sobre o produto
dele; ajuste que a APPD pede é **informação nova sobre o mundo**, e o site está errado até
ser corrigido.

## Os cinco pontos

### 1. "CRAS de referência" vira "Número do CRAS"

Rótulo do campo 23. Trivial de fazer, e vale entender por que a APPD corrigiu: "de
referência" é o vocabulário de quem trabalha na rede socioassistencial — o CRAS de
referência é o que atende aquele território. Quem preenche o formulário não fala assim, e
diante do rótulo antigo hesita entre escrever o nome da unidade e o número.

O rótulo novo diz o que se espera na caixa. **No crachá o rótulo continua `CRAS`**, como no
cartão de papel — lá o espaço é o que manda, e o número é o único valor possível.

### 2. A credencial de transporte ganha o nome que a pessoa conhece

O campo 24 diz hoje "Opcional. O número do passe municipal.". A APPD mandou acrescentar
`Para quem utiliza do "Acesso Já"`.

Também parece pequeno, e não é: **"passe municipal" é o nome do documento; "Acesso Já" é o
nome que a pessoa ouviu no balcão**. Quem tem a credencial não sabe necessariamente que ela
é "o passe municipal" — sabe que tem o Acesso Já. Um campo opcional cujo rótulo a pessoa não
reconhece é um campo que ela pula.

### 3. Bocha Paralímpica sai do site inteiro

> remover de todo o site, não tem mais

O projeto **acabou**. Isso é a informação nova, e ela é maior que os dois itens acima
somados: o site anuncia hoje um esporte com locais de treino, horários e responsável
técnico, e uma pessoa com deficiência severa pode atravessar a cidade por causa dele.

Sai de todos os lugares em que existe:

| Onde                                           | O que acontece                                |
| ---------------------------------------------- | --------------------------------------------- |
| `PROJETOS` em `shared/conteudo.ts`             | o projeto sai, com página, horários e locais  |
| `/projetos/bocha-paralimpica`                  | a rota deixa de existir                       |
| `ATENDIMENTOS` em `shared/inscricao.ts`        | sai da lista do campo 13                      |
| Textos da home, do hub de atendimento e da 404 | as menções saem                               |
| Prompts de design e documentos de inventário   | ganham a marca de que o projeto foi encerrado |

**O ponto que exige decisão de engenharia**: há inscrições gravadas com `Bocha Paralímpica`
no campo 13. Tirar o valor do vocabulário fechado faria o Zod recusar essas inscrições na
próxima vez que a pessoa abrisse `/area/inscricoes` para corrigir qualquer outra coisa — o
cadastro dela viraria inválido por causa de um projeto que acabou. A spec vai tratar isso; o
princípio é o mesmo do `DEFICIENCIA_NAO_CONSENTIDA`: **o que já foi gravado continua legível,
e só a oferta some**.

E fica registrado o que se perde: a página tem os únicos horários e endereços de treino que
o projeto publicou. Se ele voltar, essa informação some com a change — o histórico do git a
guarda, e este parágrafo diz onde procurar.

### 4. O limite de cadastros não cabe num mutirão

> existe multidão também, então precisamos aumentar os limites de ratelimit

Hoje são **12 cadastros por IP a cada 15 minutos**. A APPD cadastra em mutirão: uma fila de
pessoas, um wi-fi, muitas vezes um aparelho só. Do lado do servidor isso é indistinguível de
um robô — e o limite existe justamente contra o robô.

Aumentar o número para todo mundo é a saída errada: ela enfraquece a proteção 24 horas por
dia para resolver quatro horas por mês. A spec vai desenhar a separação entre **o público**,
que continua com um teto baixo, e **o atendimento**, que precisa de teto alto por algumas
horas — sem que a distinção dependa de reconhecer o IP da associação, que muda.

O que já se sabe e delimita o desenho:

- o identificador **nunca** é gravado em claro (HMAC, `modelo-de-dados` REQ-30), e isso não
  muda;
- sem o segredo do limite, a aplicação **recusa contar** em vez de contar em claro;
- o teto novo precisa de um número, e o número tem de vir de quantas pessoas a APPD atende
  num mutirão. **Isso é pergunta para a associação**, e entra em `docs/pendencias-appd.md`.

### 5. O CEP volta a substituir o endereço

> quando já tem endereço o autocomplete do CEP não substitui o preenchido

É o comportamento atual, e era decisão registrada: a busca preenche **só campo vazio**, para
não apagar o que a pessoa digitou. O dono confirmou que a APPD quer o contrário — **digitar
um CEP novo passa a substituir rua, bairro, cidade e estado**.

A decisão antiga protegia quem digita; a nova protege quem **corrige**. As duas são
legítimas, e a diferença é quem preenche: para quem preenche o próprio cadastro em casa, o
CEP é a última coisa; para o atendente que confere o endereço com a pessoa na frente, o CEP
é a primeira, e o que estava lá é o que se quer trocar.

A troca não é gratuita, e a spec precisa dizer o que fazer com isso: **quem escreveu o
complemento dentro do campo da rua perde o que escreveu** quando o CEP mudar. Substituir só
quando o CEP **muda** — e não a cada busca — limita o estrago ao caso em que a pessoa
pediu; a spec fixa isso como requisito.

## O que sai desta change, por decisão do dono

O ponto do login para pessoas vulneráveis:

> ver como fica esse login para pessoas vulneráveis [talvez deixar o admin poder criar
> cadastros com e-mail]

**Fica de fora daqui e entra na proposal do painel administrativo**, que já existe. E com um
limite dito com todas as letras pelo dono:

> não quero outro tipo de login, só formas de ter como o administrador fazer e gerenciar os
> usuários

Ou seja: **não** nasce um segundo caminho de autenticação — nada de entrar por CPF, por
código enviado no balcão ou por sessão sem senha. O que nasce é a capacidade de o
administrador **criar e gerenciar contas** das pessoas atendidas.

E isso esbarra num bloqueio já conhecido, que a proposal do painel precisa encarar de frente:
**o site não consegue enviar e-mail** enquanto não houver o domínio `appd.org.br`
([ADR-016](../../../docs/adr/adr-016-recuperacao-de-senha-depende-do-dominio.md)). Se o
administrador cria a conta, a senha tem de chegar à pessoa por algum caminho que não seja
e-mail — e esse caminho é a decisão de fundo daquela change, não desta.

## Ordem sugerida

1. **Bocha** — é a única correção de informação errada no ar, e a única em que alguém pode
   se deslocar por causa do que o site diz.
2. **CEP** — muda comportamento que o atendimento usa todo dia.
3. **Limite de frequência** — depende do número que a APPD ainda precisa dar, mas o desenho
   pode ser feito antes.
4. **Os dois rótulos** — rápidos, e sem risco.

## Fora de escopo

- Qualquer forma nova de autenticação.
- O painel administrativo em si.
- Reescrever os documentos de inventário do site antigo: eles registram o que **havia**, e
  não o que há. Ganham a marca de encerrado, não a exclusão.
