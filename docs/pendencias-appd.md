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

**Enquanto isso**: o site novo publica **só o que tem descrição verificável** (Bocha,
Mão na Roda, Artesão) e mantém as opções do formulário intactas, com uma página de
serviço "em revisão" para os demais. Melhor uma lista curta e verdadeira do que seis
promessas vazias.

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

---

## P1 — Comprometem a qualidade

### 5. Regras do atendimento que hoje só existem dentro do formulário

Vagas por fila, sessões **somente de manhã** e contribuição sugerida de **R$ 50,00
mensais** só aparecem depois que a pessoa clica no formulário. Quem tem compromisso de
manhã descobre tarde; quem não pode contribuir descobre no fim.

Pergunta: podemos publicar essas três regras **antes** do formulário, na página do
serviço? Confirmam que a contribuição é sugerida e ajustável, e que não condiciona o
atendimento?

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
