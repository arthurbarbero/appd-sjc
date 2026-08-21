# Pendências — o que só a APPD-SJC pode resolver

Levantado em 2026-08-05 a partir de [inventario-conteudo.md](inventario-conteudo.md).
Cada item traz a **pergunta objetiva** para levar à associação, **o que trava** se não
vier resposta, e **o que fazemos enquanto isso** — porque nenhum item aqui pode parar o
projeto inteiro.

Prioridade: **P0** bloqueia design ou implementação de uma tela específica · **P1**
compromete a qualidade da entrega · **P2** melhora, mas dá para viver sem.

---

## Riscos que a associação precisa conhecer hoje

Não são pedidos: são achados do site atual que envolvem dado pessoal e devem ser
decididos antes de qualquer migração de conteúdo.

### R1. 37 certificados individuais em PDF, públicos e sem autenticação

`/certificados` publica uma lista de nomes de participantes, cada um ligado a um PDF
individual em URL pública e indexável. **Não vamos migrar isso** sem decisão explícita.
Pergunta: essas pessoas autorizaram a publicação do nome? A associação quer manter o
recurso? Se sim, a versão nova só deve entregar o certificado a quem se identificar.

### R2. Dado de saúde de pessoa identificada na página institucional

`/sobre-nos` publica o nome do presidente junto de histórico clínico (lesão medular,
tetraplegia, tratamento e datas), nomes de dois filhos e retrato. Dado de saúde é
sensível pelo Art. 11 da LGPD, inclusive quando a própria pessoa autoriza — o que muda
é a base legal, não a natureza do dado.
Pergunta: o presidente **confirma por escrito** que quer esse texto no site novo, com
esse nível de detalhe? Há versão mais curta que preserve a história sem o prontuário?

### R3. Galerias com rostos de assistidos

`/bocha-adaptada` tem ~24 imagens migradas do Facebook, com fotos de atividade que
provavelmente mostram assistidos identificáveis. Você autorizou reaproveitar fotos do
site atual — mas autorização do **projeto** não é autorização de **imagem das pessoas**.
Pergunta: existe termo de autorização de uso de imagem assinado? De quem? Onde está?
Enquanto não houver, usamos apenas fotos sem rosto identificável ou fotos novas.

### R4. Telemarketing de doação com "mensageiro" que recolhe dinheiro presencialmente

`/colaborador` descreve captação por telefone com um agente que vai até o doador
receber a contribuição, conferindo recibo e crachá. É um modelo que golpista imita com
facilidade, e o site não oferece nenhuma forma de o doador verificar se a ligação é
real. Isso conversa direto com a página de verificação pública do crachá que já está no
escopo (`/verificar/<numero>`).
Pergunta: o telemarketing continua ativo? Podemos publicar um canal oficial de
conferência ("recebeu uma ligação? confira aqui") e estender o crachá aos captadores?

---

## P0 — Bloqueiam design ou implementação

### 1. O catálogo de serviços real (bloqueia Home, Projetos Sociais e o Formulário)

O site e o formulário oferecem conjuntos quase disjuntos. Do inventário:

| Serviço                    | No formulário | Página no site | Bloco na home |
| -------------------------- | ------------- | -------------- | ------------- |
| Empréstimo de Equipamentos | Sim           | Não            | Não           |
| Psicologia                 | Sim           | Não            | Não           |
| Fisioterapia               | Sim           | Não            | Só legenda    |
| Serviço Social             | Sim           | Não            | Só legenda    |
| Orientações Gerais         | Sim           | Não            | Só legenda    |
| Informática Nota 10        | **Não**       | Não            | Só legenda    |
| Artesão da Inclusão        | **Não**       | Sim            | Sim           |
| Bocha Paralímpica          | **Não**       | Sim            | Não           |
| Oficina Mão na Roda        | **Não**       | Sim            | Não           |

Perguntas: **quais destes existem hoje, em 2026?** Para cada um que existe: uma frase
do que é, para quem, em que dia e horário, e como a pessoa entra.

O que trava: a lista de Projetos Sociais, os cards da home e a decisão de qual serviço
usa o formulário de atendimento e qual usa outro caminho.

**Enquanto isso**: o site novo publica **as nove páginas** (decisão do dono,
2026-08-05), cada uma com conteúdo pesquisado sobre a área e marcação `[A CONFIRMAR]`
em tudo que descreve especificamente a APPD. Rascunhos em [servicos/](servicos/) — é o
material que a associação precisa revisar item a item.

### 1b. Bocha, Artesão, Mão na Roda e Informática não são opções do formulário

Derivado do item acima, mas é uma pergunta separada e objetiva. O campo "Tipo de
Atendimento" tem cinco opções — Empréstimo Equipamentos, Fisioterapia, Orientações
Gerais, Psicologia, Serviço Social — e **nenhum dos quatro projetos está lá**. Hoje,
quem quer entrar na Bocha só consegue pedir marcando `Outro` e escrevendo o nome. No
caso do Artesão e da Informática isso é pior: o bloco da home leva justamente a esse
formulário, então a pessoa clica no que foi oferecido e não encontra a opção.

Pergunta: os quatro projetos devem virar opção do campo "Tipo de Atendimento", ou eles
entram por outro caminho (contato direto com o responsável)?

**Resolvido pelo dono em 2026-08-07** (ver item 4a): os quatro projetos **viraram opções**
do campo "Tipo de Atendimento". O aviso "marque `Outro` e escreva o nome" saiu das páginas
de projeto, porque deixou de ser verdade. A pergunta à APPD continua de pé — não sobre o
que fazer, mas sobre confirmar a lista nova e o efeito em quem lê as inscrições.

### 2. Chave PIX e dados de doação (bloqueia a Central de Doações)

O regimento interno diz que se paga "via PIX diretamente na conta da Instituição", mas
**a chave não está publicada em lugar nenhum**. Não há conta bancária, não há gateway.
O único meio concreto é um boleto em PDF escaneado com `last-modified` de **2016-07-01**
— dez anos atrás, ilegível para leitor de tela, e sem como saber se o código de barras
ainda vale.

Perguntas: qual é a chave PIX oficial (e de qual CNPJ)? O boleto de 2016 ainda é
válido? Querem um QR Code PIX estático gerado a partir da chave — que é gratuito e
resolve doação por celular sem gateway nem taxa?

O que trava: a tela Central de Doações inteira. É a tela que traz dinheiro.

**Enquanto isso**: desenhamos a tela com o espaço do PIX reservado e publicamos os
canais que existem (doação em espécie e contato). Não colocamos boleto de 2016 no ar.

### 3. Logo em vetor (bloqueia o design system)

Você determinou que a logo é intocável. Para mantê-la fiel precisamos do arquivo
original em vetor (SVG, AI, EPS ou PDF editável). O que existe no site é bitmap do Wix.

O que trava: o DESIGN.md e o design system da Fase 2 — logo em bitmap escalada vira
borrão no crachá e na impressão.

**Enquanto isso**: usamos a versão bitmap de maior resolução disponível, marcada como
provisória. Não redesenhamos a logo.

### 4. Para quem vai a mensagem do formulário de contato

O formulário do site atual é nativo do Wix e o destinatário está no painel deles — não
dá para descobrir de fora. No site novo, alguém precisa receber.

Pergunta: qual e-mail recebe? Quem responde e em quanto tempo? (O prazo vai escrito na
tela — promessa que a gente publica, a associação cumpre.)

O que trava: a tela de Contato e a mensagem de sucesso do envio.

### 4a. As opções de escolha múltipla vão mudar

Decisão do dono em 2026-08-07: o que hoje só existe como texto livre dentro de "Outro"
vira **opção própria** na lista — incluindo os quatro projetos (Bocha Paralímpica, Oficina
Mão na Roda, Artesão da Inclusão, Informática Nota 10). O "Outro" fica para o que é
realmente outro.

**Isto altera as perguntas do formulário oficial**, contra a regra de réplica fiel de
[campos-formulario.md](campos-formulario.md). É decisão do dono e vale — e a associação
precisa saber, porque **o atendimento foi construído em cima das perguntas atuais**: quem
lê a planilha hoje sabe interpretar "Outro: bocha", e passa a ver uma coluna nova.

Pergunta: a APPD confirma a lista nova? Faltou alguma opção que hoje chega escrita à mão?

O que trava: nada de imediato. Mas mudar opção depois que houver inscrição real significa
decidir o que fazer com o que já foi respondido.

### 4b. Três perguntas novas no formulário: e-mail, CPF e senha

Decisão do dono do projeto em 2026-08-06 ([ADR-012](adr/adr-012-cadastro-embutido-no-formulario.md)):
o formulário de atendimento passa a criar a conta da pessoa no mesmo ato, para que ela
possa depois **entrar no site e editar o próprio cadastro** — o que a planilha de hoje
não permite. Isso acrescenta três perguntas às 15 existentes. Nenhuma das 15 muda.

**Além delas, o CEP** virou obrigatório (decisão do dono, 2026-08-06), com busca
automática de rua, bairro e cidade. São **quatro** campos novos no total.

Pergunta: a APPD concorda em pedir **CPF**? É dado que a associação não coleta hoje.
Ele serve para impedir cadastro duplicado da mesma pessoa; se a associação preferir não
pedir, o e-mail sozinho passa a ser a chave e a duplicidade volta a ser possível.

Segunda pergunta, operacional: **parte do público não tem e-mail** e vai precisar de
ajuda para se cadastrar. A associação consegue fazer isso presencialmente na sede?

O que trava: nada de imediato — o modelo de dados já foi escrito com CPF. Uma recusa da
associação custa uma migration, não uma reescrita.

---

### 4c. Quantas pessoas a APPD cadastra num mutirão

**Bloqueia o teto do limite de cadastros.** A associação pediu para aumentá-lo — "existe
multidão também" —, e o número precisa vir de quem faz o mutirão, não de estimativa nossa.

O limite existe contra cadastro automatizado em massa, e do lado do servidor um mutirão
legítimo é indistinguível de um robô: mesma rede, muitas vezes o mesmo aparelho, uma
inscrição atrás da outra. Um teto folgado demais desliga a proteção; um teto apertado demais
manda a fila embora.

Perguntas a levar:

1. Quantas pessoas vocês cadastram num mutirão, e em quanto tempo?
2. É de um aparelho só, ou cada pessoa usa o celular dela?
3. Com que frequência isso acontece — uma vez por mês, por semestre?

Enquanto não houver resposta, o teto continua em **12 cadastros por IP a cada 15 minutos**.

### 4d. O projeto de Bocha Paralímpica acabou

Informado pela associação em 2026-08-21: "remover de todo o site, não tem mais".

**Não é pendência, é confirmação registrada** — está aqui porque o site anunciava horários e
locais de treino, e uma pessoa podia atravessar a cidade por causa disso. A remoção é a
change `pedidos-da-appd`.

Fica uma pergunta, para o dia em que houver reunião: **o Facebook do projeto continua no
ar** (`facebook.com/bochaparalimpicasjc`, 2.274 curtidas) e ainda anuncia os treinos. Quem
encerra aquela página, ou ela fica?

## P1 — Comprometem a qualidade

### 5. Regras do atendimento que hoje só existem dentro do formulário

Vagas por fila, sessões **somente de manhã** e contribuição sugerida de **R$ 50,00
mensais** só aparecem depois que a pessoa clica no formulário. Quem tem compromisso de
manhã descobre tarde; quem não pode contribuir descobre no fim.

Pergunta: podemos publicar essas três regras **antes** do formulário, na página do
serviço? Confirmam que a contribuição é sugerida e ajustável, e que não condiciona o
atendimento?

**Correção de texto na origem (2026-08-06).** O bloco de abertura do formulário atual
diz que "os atendimentos são agendados conforme o surgimento de vagas". Segundo o dono
do projeto, isso está desatualizado: **hoje não existe fila de vagas nem matrícula** —
marcar "Fisioterapia" ou "Bocha" sinaliza interesse, e alguém da APPD entra em contato.
O site novo passa a dizer isso ([ADR-014](adr/adr-014-inscricao-como-registro-de-interesse.md)).
Pergunta: a associação confirma, e vai corrigir o texto no formulário atual enquanto ele
estiver no ar? Não alteramos texto da APPD por conta própria.

### 6. Horário de funcionamento da sede

Nenhuma página publica dia ou horário de atendimento da sede. O regimento só diz que
"o horário é estabelecido pela diretoria executiva".
Pergunta: qual é o horário? Precisa agendar antes de ir?

### 7. Telefones — qual é qual

Cinco números circulam pelo site, com rótulo inconsistente:

| Número          | Rótulo publicado                 |
| --------------- | -------------------------------- |
| (12) 3346-0605  | fixo geral                       |
| (12) 99165-7059 | Secretaria                       |
| (12) 99124-7257 | Serviço Social                   |
| (12) 98830-4815 | sem rótulo (Oficina Mão na Roda) |
| (12) 98803-3600 | sem rótulo (Artesão)             |
| (12) 3931-6534  | sem rótulo (Bocha)               |

Perguntas: quais estão ativos? Qual é **o** número de WhatsApp oficial? Os sem rótulo
são da associação ou pessoais de responsáveis técnicos?

Nota técnica que não depende deles: o link de WhatsApp da home **na versão mobile** tem
dois caracteres invisíveis (U+202A) na URL e um número que não bate com nenhum telefone
publicado. Na prática, **quem acessa pelo celular não consegue falar com a associação**.
No site novo isso já nasce resolvido.

### 8. Textos institucionais — validação e lacunas

Você autorizou copiar e melhorar. Só falta a associação confirmar o que hoje **não
existe** em lugar nenhum do site: missão, visão e valores como declaração; composição da
diretoria; estatuto; prestação de contas; número de assistidos atendidos; parceiros.

Pergunta: existem esses textos fora do site? Quais podem ser publicados?
Impacto: doador procura transparência antes de doar. Sem prestação de contas nem número
de atendidos, a Central de Doações fica sem argumento.

### 8a. A biografia da fundadora — SEM OBJETO desde 2026-08-20

Levantado na revisão do dono de 2026-08-20: "tem muito mais dados sobre essa pessoa lá
que você não trouxe, e desse cara você trouxe tudo — quero que traga tudo dos dois".

**Conferido na fonte, em 20/08**: `appd.org.br/sobre-nos` traz a seção "Nosso Presidente"
com a biografia inteira de Luiz Carlos Lucas Barbosa, e sobre Maria Claudete apenas a
frase de que a APPD foi "fundada em 29 de março de 2006 a partir da iniciativa da Srª
Maria Claudete da Silveira Rabelo de Moura juntamente com pessoas com os mesmos ideais".
**Não há biografia dela publicada.** A assimetria da tela vem da fonte, não da
transcrição — nós republicamos tudo o que existia dos dois.

Pergunta: a associação tem, fora do site, um texto sobre a fundadora — trajetória, o que
a levou a fundar, papel atual? Pode ser publicado?
Impacto: a página `/sobre` mostra um parágrafo para quem fundou e cinco para quem preside.
A tela já comporta biografias do mesmo tamanho; falta o texto.

**Encerrada pelo dono em 2026-08-20**: "ignora o texto da fundadora porque não tem mesmo".
A assimetria fica como está, e é honesta — republicamos tudo o que existia sobre as duas
pessoas. Se algum dia aparecer um texto sobre Maria Claudete, a tela o recebe sem mudança:
`bio` já é uma lista de parágrafos.

### 9. Páginas órfãs e conteúdo vencido

Sete páginas estão no ar sem entrada no menu, incluindo um evento de **15/12/2019** com
cadastro de voluntários aberto e um jantar beneficente de **20/04/2024** com voucher a
R$ 150,00 ainda anunciado como disponível.

Pergunta: item por item — migrar, arquivar ou descartar? Especificamente: **COMTRAD**
está ativo? Há regulamento completo no ar e nenhuma forma de aderir.

### 10. Duas páginas de Facebook

Existem `facebook.com/appdsjc` (4.441 curtidas) e `facebook.com/AppdPcD2017` (1.955
curtidas), ambas vivas, ambas institucionais. O site só linka a primeira.
Pergunta: qual é a oficial? A outra pode ser encerrada ou fundida?

### 11. "CADASTRO DE ATENDIMENTO 2026" — o ano no nome

Pergunta: existe um formulário novo a cada ano? Quem troca o link quando vira o ano?
Isso muda o desenho: se a inscrição é por ciclo anual, o sistema precisa de campo de
ciclo, não de um formulário eterno.

---

## P2 — Desejáveis

12. **Fotos novas** com autorização, de atividade real e boa resolução — as do site são
    pequenas, comprimidas pelo Wix e algumas migradas do Facebook.
13. **Selo/registro**: CNPJ 08.074.883/0001-96 já temos. Existe CEBAS, utilidade
    pública municipal, registro no CMDCA/COMAS? São credenciais que doador procura.
14. **Quem administra o site hoje** (conta Wix, domínio appd.org.br, e-mail) — necessário
    para o plano de handover da Fase 5.
15. **Analytics**: existe? Saber quais páginas as pessoas procuram hoje ajudaria a
    priorizar, mas dá para viver sem.

---

## Resumo para levar à reunião

Se der para perguntar só cinco coisas, pergunte estas:

1. Quais serviços a APPD oferece **hoje**, e como a pessoa entra em cada um?
2. Qual é a chave PIX?
3. Onde está a logo em vetor?
4. Qual e-mail recebe as mensagens do site, e quem responde?
5. O texto sobre o presidente em `/sobre-nos`, com o histórico clínico, pode ser
   republicado como está?

E uma sexta, se sobrar tempo: podemos pedir **CPF** no formulário, para a pessoa ter
conta e conseguir editar o próprio cadastro depois? (item 4b)
