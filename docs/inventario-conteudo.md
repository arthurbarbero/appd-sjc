# Inventário de conteúdo do site atual da APPD-SJC

**O que é este documento.** Levantamento de fato do conteúdo publicado hoje em
`https://www.appd.org.br`, para servir de base ao redesenho do site do zero. É inventário,
não recomendação: descreve o que existe, não o que deveria existir.

**Fonte.** Site atual da APPD-SJC (`https://www.appd.org.br`), plus `sitemap.xml`,
`robots.txt` e os formulários Google linkados a partir dele.

**Data de acesso.** 2026-08-05. Todas as afirmações abaixo valem para essa data; o site é
editável pela associação e pode mudar sem aviso.

**Método.** HTML bruto de cada página baixado e analisado (títulos, headings, `alt`, links,
textos ricos), mais a versão mobile do HTML da home para desempatar a ordem visual dos
blocos. Nenhuma imagem foi baixada — apenas catalogada por URL.

**Regra de honestidade.** Onde a informação não existe no site, está escrito
"não encontrado no site". Nada foi inferido ou completado por suposição. O que não deu para
verificar está na tabela final.

> **Aviso LGPD.** O site expõe dados pessoais em pelo menos dois pontos (ver seção 11). Este
> documento registra a existência e a localização desses dados, mas **não transcreve** nomes
> de participantes. Nomes e telefones de responsáveis técnicos de projeto foram transcritos
> por serem o canal de contato institucional publicado — ainda assim, confirmar autorização
> antes de republicar.

---

## 1. Mapa de páginas

Fonte da lista completa: `https://www.appd.org.br/sitemap.xml` →
`https://www.appd.org.br/pages-sitemap.xml` (acesso em 2026-08-05; `lastmod` de todas as
páginas: `2025-05-22`).

São **15 páginas**. Todas responderam **HTTP 200**. Apenas **8 entradas** aparecem no menu de
navegação; **7 páginas são órfãs** (não alcançáveis pelo menu, só por URL direta, pelo sitemap
ou por link interno de outra página órfã).

| #   | URL                                  | Título (`<title>`)                                     | Propósito em uma linha                                                            | Status                                    |
| --- | ------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | `/` (slug interno: `nossa-historia`) | APPD - Associação da Pessoas Portadoras de Deficiencia | Home: contatos no topo e 6 blocos de serviço/ação que levam a formulários Google. | 200, viva                                 |
| 2   | `/projetos-sociais`                  | Projetos Sociais \| APPD                               | Índice visual dos projetos — só imagens, **sem nenhum texto próprio**.            | 200, viva mas vazia de texto              |
| 3   | `/bocha-adaptada`                    | Bocha Paralímpica \| APPD                              | Projeto Bocha Paralímpica: responsável, locais e horários de treino.              | 200, viva                                 |
| 4   | `/oficina-inclusiva-mao-na-roda`     | Oficina Inclusiva Mão na Roda \| APPD                  | Projeto de manutenção de cadeira de rodas, muletas, andadores e bengalas.         | 200, viva                                 |
| 5   | `/artesao-da`                        | Artesão da Inclusão \| APPD                            | Projeto de capacitação e comercialização de artesanato como renda alternativa.    | 200, viva                                 |
| 6   | `/sobre-nos`                         | Sobre nós \| APPD                                      | Texto institucional: fundação, objetivo, compromisso e perfil do presidente.      | 200, viva                                 |
| 7   | `/colaborador`                       | Central de Doações \| APPD                             | Como doar: boleto, telemarketing e campanha de doação em espécie.                 | 200, viva                                 |
| 8   | `/contato`                           | Entre em contato \| APPD                               | Endereço da sede + formulário de contato (nome, e-mail, assunto, mensagem).       | 200, viva                                 |
| 9   | `/comtrad`                           | Comtrad \| APPD                                        | Comissão dos Usuários do Transporte Adaptado — regras e finalidade.               | 200, viva, **órfã** (fora do menu)        |
| 10  | `/eventos`                           | EVENTOS \| APPD                                        | Convite para jantar beneficente de **20/04/2024** (evento já passado).            | 200, viva, **órfã** e desatualizada       |
| 11  | `/regimento-interno`                 | REGIMENTO INTERNO \| APPD                              | Regimento interno em 6 blocos (atendimento, voluntariado, contribuição etc.).     | 200, viva, **órfã**                       |
| 12  | `/certificados`                      | Certificado Raça e Racismo \| APPD                     | Lista de participantes com link para o PDF do certificado de cada um.             | 200, viva, **órfã**, expõe dados pessoais |
| 13  | `/certificados-1`                    | Certificados \| APPD                                   | Hub com 2 banners: leva a `/certificados` e `/swin-four-changer`.                 | 200, viva, **órfã**                       |
| 14  | `/swim-4-ghange`                     | CADASTRO DE VOLUNTARIOS \| APPD                        | Cadastro de voluntários para evento de **15/12/2019** (evento já passado).        | 200, viva, **órfã** e desatualizada       |
| 15  | `/swin-four-changer`                 | swin four changer \| APPD                              | Página de certificado do SWIM 4 CHANGE — instrui a contatar o organizador.        | 200, viva, **órfã**                       |

Notas do mapa:

- `https://www.appd.org.br/nossa-historia` responde **301** e redireciona para a home. É o slug
  interno da página inicial no Wix.
- `http://appd.org.br/` responde **301** para `https://appd.org.br/` — o redirecionamento para
  HTTPS existe e funciona.
- O menu tem os itens: `APPD`, `Projetos Sociais` (com submenu `Bocha Paralímpica`,
  `Oficina Inclusiva Mão na Roda`, `Artesão da Inclusão`), `Sobre nós`, `Central de Doações`,
  `Entre em contato`, e um item de estouro `More`. No HTML servido, `More` não expõe nenhuma
  página adicional.
- `/certificados-1` é a única página órfã que aponta para outras órfãs (`/certificados` e
  `/swin-four-changer`) — mas ela própria não é alcançável pelo menu.
- Em `/projetos-sociais` há **3 imagens de projeto e apenas 2 links** no corpo (para
  `/bocha-adaptada` e `/oficina-inclusiva-mao-na-roda`). A terceira imagem não é clicável, ou
  seja, o Artesão da Inclusão não é alcançável a partir da própria página de projetos.

---

## 2. Textos institucionais na íntegra (verbatim)

Todos os trechos abaixo foram copiados literalmente do HTML das páginas indicadas, acesso em
2026-08-05. Quebras de linha e maiúsculas preservadas como no original, inclusive erros de
grafia e concordância. Cortes marcados com `[...]`.

### 2.1. `/sobre-nos` — apresentação

> Olá!!!
>
> Deixe-me entrar em seu convívio social e nos apresentar:
>
> Nós somos da APPD - Associação Das Pessoas com Deficiência de São José dos Campos.

### 2.2. `/sobre-nos` — fundação e objetivo

> Fundada em 29 de março de 2006 a partir da iniciativa da Srª Maria Claudete da Silveira
> Rabelo de Moura juntamente com pessoas com os mesmos ideais a APPD vem trabalhando junto à
> sociedade para melhorar a qualidade de vida das Pessoas Com Deficiência de nossa região.
>
> Temos como objetivo Localizar, Orientar e Inserir na Sociedade as Pessoas com Deficiência e
> amparar aquelas que têm mais dificuldades.

### 2.3. `/sobre-nos` — compromisso

> Nosso compromisso é levar o máximo de informações possível, pois vemos o crescimento
> continuo de pessoas adquirindo algum tipo deficiência, seja ela temporária ou definitiva,
> decorrente de acidentes, principalmente entre jovens; e a luta de muitos em sua inclusão
> social.

### 2.4. `/sobre-nos` — "Nosso Presidente"

Transcrito porque é texto institucional sobre o representante legal da associação. Os nomes
dos filhos foram substituídos por `[...]` — são dados de terceiros que não precisam ser
republicados. O texto original contém dado de saúde (categoria sensível pela LGPD, art. 5º,
II): a republicação precisa de consentimento expresso e atual do titular.

> Nosso Presidente
>
> Luiz Carlos Lucas Barbosa, casado Pai de dois filhos, [...] e [...], atuou como motorista
> profissional durante 15 anos.
>
> Em 07 de setembro de 2007 estava com sua família num momento de descontração ao mergulhar
> atingiu um banco de areia que sofreu uma lesão medular deixando tetraplégico.
>
> No ano de 2009 realizou um tratamento de reabilitação por 3 meses no Centro de Reabilitação
> Sarah Kubitschek onde adquiriu conhecimento, e se deparou com a triste realidade,
> percebendo as dificuldades das pessoas com deficiências e seus familiares em conseguir um
> tratamento de ponta.
>
> Atualmente como Presidente da APPD, depois de anos, retornou aos estudos, abrindo mão na
> área de Transporte e Logística e ingressou no curso de Serviço Social para melhor
> desempenhar suas atividades.
>
> Além de seu serviço voluntário como Presidente da APPD, atua como palestrante e trabalha em
> busca parceiros e colaboradores com intuito de ampliar nossos atendimentos.

### 2.5. Cabeçalho institucional (repetido em todas as páginas)

> APPD
>
> Associação das Pessoas Portadoras de Deficiência
>
> São Jose dos Campos

### 2.6. Rodapé institucional (repetido em todas as 15 páginas)

> © 2006 por APPD. CNPJ Nº. 08.074.883/0001-96 - Inscr. Municipal Nº.154.420 - Utilidade
> Pública n° 7.477/08

### 2.7. `/comtrad` — apresentação da comissão

> O uso do transporte tornou-se essencial às Pessoas Com Deficiência, pois para muitos é a
> única forma de conseguirem ter acesso às atividades asseguradas pela norma do artigo 8º do
> Estatuto do Deficiente, em suas diversas áreas de atuação (saúde, trabalho, educação,
> esporte, lazer, etc.), alguns deles fornecidos pela própria Prefeitura, bem como interagir
> com os demais.
>
> Com isto, a APPD – Associação das Pessoas Portadoras de Deficiência, resolveu criar uma
> comissão independente para facilitar a comunicação dos usuários deste serviço.
>
> O COMTRAD é uma comissão independente formada por usuários ativos do transporte adaptado. A
> função de APPD é dar suporte jurídico quando necessário e seu vinculo será restrito somente
> a pessoas associadas à comissão.

### 2.8. `/comtrad` — regulamento

> COMTRAD
>
> COMISSAO DOS USUARIOS DO TRANSPORTE ADAPTADO
>
> São José dos Campos – SP
>
> I. COMTRAD - Responsabilidade Judicial
>
> 1.1. - Visar à efetiva aplicação do disposto na norma do artigo 4º da Lei 13.146 de 2015.
>
> 1.2. - Manter Igualdade e respeito às garantias constitucionais das pessoas com deficiência,
> tal como a Dignidade da Pessoa Humana, presente na norma do artigo 1º, III, da Constituição
> da República Federativa do Brasil e os demais previstos na norma do artigo 5º, caput, do
> mesmo diploma legal.
>
> 1.3. - Aplicar o decreto nº 9647/99 de 09 de março de 1999, posteriormente substituído pelo
> decreto 13.107/08 de 20 de maio de 2008.
>
> II. COMTRAD - Finalidade
>
> 2.1. - Unificar a classe das pessoas com deficiência que usa o transporte adaptado de são
> Jose Dos Campos com a finalidade de manter o serviço em sua excelência e totalidade de
> acordo com o decreto 13.107/08 de 20 de maio de 2008.
>
> 2.2. - Fiscalizar e não permitir que alterações sejam feita no decreto, a não ser que seja
> para melhoria do serviço e crescimento para o bem comum das pessoas com deficiência.
>
> 2.3. - Lutar pela sua ampliação, pois se trata de um serviço essencial à pessoa com
> deficiência, acompanhando o desenvolvimento do município.
>
> 2.4. - Esclarecer aos usuários sobre os direitos e deveres que a pessoa com deficiência tem
> para melhor desenvolvimento do serviço incluindo as penalidades pelo mau uso previsto no
> decreto.
>
> III. COMTRAD – adesão e Formação da Comissão
>
> 3.1. - A adesão é voluntária e somente permitida a credenciados ativos e sem custo algum
> através do saite, rede social ou contato telefônico, podendo cancelar seu cadastro sem
> pré-aviso e sem ônus para ambas as partes.
>
> 3.2. - A comissão é formada por usuários ou representantes legais ativos que usam o
> transporte adaptado e que esteja em dia com a secretaria de transporte e cadastrado no
> COMTRAD
>
> IV. COMTRAD – Considerações
>
> O COMTRAD terá um compromisso somente com os usuários que forem cadastrados na comissão.
> Suas ações são conjuntas não dando suporte individual, exceto em casos de denuncia que leve
> ao mau funcionamento do sistema.

### 2.9. `/regimento-interno` — regimento interno completo

> ♿REGIMENTO INTERNO APPD♿
>
> 1 - QUANTO AO ATENDIMENTO INTERNO
>
> Os interessados que desejarem participar de algum dos projetos da Associação devem
> obrigatoriamente se cadastrar no SITE e aceitar os regimentos internos assim como o termo de
> colaboração da instituição
>
> Os atendidos da Associação segue o regimento do Artigo 18⁰ Do Estatuto QUANTO AO HORÁRIO DE
> ATENDIMENTO
>
> O horário de atendimento é estabelecido pela diretoria executiva após análise com
> coordenadores de projetos
>
> Os horários de atendimento de cada projeto fica na responsabilidade do coordenador do
> projeto após a aprovação da diretoria
>
> Os horários de atendimentos destinado aos associados poderá ser alterado (sob aviso) caso
> haja a necessidade de remanejamento ou logística interna
>
> 2 - QUANTO AO SERVIÇO VOLUNTÁRIO
>
> O voluntário acompanha a LEI FEDERAL N⁰ 9.608/98 (Lei do Voluntário) conforme Artigo 15⁰ do
> Estatuto
>
> O voluntário é submetido a uma entrevista com um coordenador ou supervisor de projeto para
> testar suas aptidões e pode ser designado a atividades em qualquer uma das áreas disponíveis
> pela Associação
>
> O voluntariado deve ser acompanhado por um coordenador ou supervisor da Associação e deve
> respeitar as regras internas prevista neste regimento
>
> 3 - QUANTO À REALIZAÇÃO DOS PROJETOS
>
> São desenvolvidos de formas diretas ou indiretas, com apoio ou desenvolvimento próprio,
> acompanhando as regras do Artigo 4⁰ do Estatuto
>
> 4 - QUANTO ÀS REUNIÕES DE ASSEMBLEIAS
>
> Assembleia Geral uma vez por ano
>
> Conselho Fiscal a cada seis meses
>
> Direção Executiva uma vez por mês ou quando solicitado pela Presidência
>
> 5 - QUANTO A MANUTENÇÃO
>
> É de responsabilidade de todos, sem exclusão, a manutenção das estruturas, preservação de
> bens e instalações internas da Associação
>
> Caso haja algum dano ao patrimônio da Instituição ocasionado por algum dos associados o
> mesmo deverá assumir o prejuízo
>
> 6 - QUANTO ÀS CONTRIBUIÇÕES FINANCEIRA
>
> Conforme Artigo 19⁰ Parágrafo Único do Estatuto, é de responsabilidade da diretoria a
> fixação de valores das contribuições mensais/anuais e poderá apresentar valores distintos
> após análise econômica financeira do associado
>
> Os Carnês de Contribuição é retirado na Sede da Associação
>
> Os pagamentos podem ser realizados na Sede da Associação ou via PIX diretamente na conta da
> Instituição
>
> Os associados que realizar os pagamentos por PIX devem encaminhar os recibos no número de
> WhatsApp anexado na capa do Carnê de Contribuição
>
> O associado será automaticamente excluído caso haja inadimplência de três meses consecutivos
> no pagamento da contribuição, exceto caso haja justificativa acertada com a diretoria
> conforme Artigo 20⁰ do Estatuto
>
> A contribuição não dá direito a exclusividade aos atendimentos nos projetos da Associação,
> já que os valores são destinados a manutenção da Instituição

### 2.10. O que NÃO existe como texto institucional

Não encontrado no site, em nenhuma página: declaração de **missão**, **visão** e **valores**
como seções nomeadas; composição da **diretoria** (só o presidente é citado); **relatório de
atividades**, **prestação de contas** ou **balanço**; **estatuto** em PDF; **política de
privacidade**; **número de assistidos** atendidos; **parceiros** ou **patrocinadores**.

---

## 3. Projetos e serviços divulgados

O site divulga serviços em dois lugares que **não são o mesmo conjunto**: os blocos da home e
as páginas de projeto do menu. Segue o que cada um diz.

### 3.1. Projetos com página própria (menu "Projetos Sociais")

| Projeto                           | Página                           | Descrição publicada                                                                                  | Público                                                                                                              | Horários / condições                                                                                                                       |
| --------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Bocha Paralímpica**             | `/bocha-adaptada`                | Não há parágrafo descritivo. A página só traz responsável técnico, locais e horários de treino.      | Não encontrado no site                                                                                               | Praça de Esportes Pedro Otavio: seg/qua/sex, 13:00–16:30. Centro Esportivo Palmeiras São José: ter/qui, 13:00–16:30. Endereços na seção 5. |
| **Oficina Inclusiva Mão na Roda** | `/oficina-inclusiva-mao-na-roda` | Manutenção de cadeira de rodas, muletas, andadores e bengalas (texto verbatim em 3.2).               | "famílias carentes que não têm condições de manter ou adquirir um equipamento funcional e digno aos seus assistidos" | Não encontrado no site. Só telefones de informação.                                                                                        |
| **Artesão da Inclusão**           | `/artesao-da`                    | Capacitação e comercialização de artesanato como fonte de renda alternativa (texto verbatim em 3.3). | Famílias de pessoas com deficiência (justificativa de renda no texto)                                                | Não encontrado no site. Só telefones de informação.                                                                                        |

### 3.2. `/oficina-inclusiva-mao-na-roda` — texto verbatim

> Fundamentais para a locomoção, a cadeira de rodas, as muletas, os andadores e as bengalas
> são aparelhos primários e fundamentais que auxiliam as Pessoas com Deficiência, definitiva
> ou temporária, em suas atividades diárias e como tal, precisam de manutenção.
>
> A autonomia na locomoção define a qualidade de vida da Pessoa com Deficiência.
>
> O projeto Oficina Inclusiva Mão na Roda nasceu com a finalidade de dar suporte a famílias
> carentes que não têm condições de manter ou adquirir um equipamento funcional e digno aos
> seus assistidos.

Contato publicado na página:

> RESPONSÁVEL TÉCNICO
>
> Bill
>
> INFORMAÇÕES:
>
> (12) 3346-0605
>
> 98830-4815 / 99124-7257

### 3.3. `/artesao-da` — texto verbatim

> Pesquisas comprovam que a renda per capita das famílias de Pessoas com Deficiência é em
> média 50% a 70% menor que as demais famílias que pertencem ao mesmo grupo social.
>
> Isso ocorre porque na maioria das vezes algum membro da família tem que deixar de exercer
> sua vida profissional ou reduzir sua jornada de trabalho para se dedicar aos cuidados
> pessoais.
>
> O projeto Artesão da Inclusão visa capacitar e comercializar os produtos, com a finalidade
> de introduzir uma fonte de renda alternativa sem atrapalhar o convívio diário e os cuidados
> para com seus entes queridos.

Contato publicado na página:

> PARA MAIS INFORMAÇÕES
>
> +55 12 3346 0605
>
> +55 12 98803 3600

A afirmação sobre renda per capita é apresentada sem fonte: o site diz "Pesquisas comprovam"
e não cita qual pesquisa.

### 3.4. `/bocha-adaptada` — texto verbatim

> RESPONSÁVEL TÉCNICO
>
> Educador Físico José Guardia
>
> Prof. Zézinho
>
> +55 12 98159 3336
>
> 12 3931 6534

> TREINAMENTOS
>
> Praça de Esportes Pedro Otavio
>
> Rua Palmares 841 - Pq Industrial
>
> São José dos Campos / SP
>
> SEGUNDAS - QUARTAS - SEXTAS
>
> das 13:00 as 16:30
>
> Centro Esportivo Palmeiras São José
>
> Rua Saudades de Querencia 225
>
> Palmeiras de São José
>
> São José dos Campos / SP
>
> TERÇAS E QUINTAS
>
> das 13:00 as 16:30

### 3.5. Blocos da home (sem página própria)

A home tem **6 blocos** rotulados por um `<h2>` cada, e cada bloco (exceto o último) leva a um
formulário Google. **Nenhum deles tem página de conteúdo no site** — não há descrição, público,
horário ou condição para nenhum:

| Bloco (`<h2>` na home) | Destino do link                                                                                       | Formulário de destino (título real) |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Artesão da inclusão    | `https://forms.gle/mT29U4RjCWtoQztHA`                                                                 | CADASTRO DE ATENDIMENTO 2026        |
| Fisioterapia           | `https://forms.gle/mT29U4RjCWtoQztHA`                                                                 | CADASTRO DE ATENDIMENTO 2026        |
| Serviço Social         | `https://forms.gle/mT29U4RjCWtoQztHA`                                                                 | CADASTRO DE ATENDIMENTO 2026        |
| Informática Nota 10    | `https://docs.google.com/forms/d/e/1FAIpQLSf1SVsu6DtLeUFdu3veBtFChume6rB9bfkzI5MT7ggRsJYhWg/viewform` | CADASTRO DE ATENDIMENTO 2026        |
| Orientações Gerais     | `https://forms.gle/mT29U4RjCWtoQztHA`                                                                 | CADASTRO DE ATENDIMENTO 2026        |
| CONTRIBUIÇÃO SOLIDARIA | Nenhum link identificado no HTML                                                                      | —                                   |

Três achados desta tabela:

1. `forms.gle/mT29U4RjCWtoQztHA` e o link `viewform` **são o mesmo formulário** — o encurtador
   resolve para exatamente a mesma URL. Ou seja, os 5 blocos com link levam todos ao **mesmo
   destino**, apesar de prometerem 5 serviços diferentes.
2. Existem **dois links extras** no topo da home, acima dos blocos legendados, que não têm
   legenda `<h2>` associada: um leva ao mesmo CADASTRO DE ATENDIMENTO 2026 e o outro é o link
   `/edit` descrito na seção 9.
3. **"Informática Nota 10" não aparece em nenhum outro lugar do site.** Não tem página, não
   está no menu, não está em `/projetos-sociais` e não é opção do formulário de atendimento
   (ver seção 12). Só existe como legenda de um bloco da home.

### 3.6. Outras iniciativas citadas (sem status atual)

| Iniciativa                   | Onde aparece                                   | Situação observável                                                                    |
| ---------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| COMTRAD                      | `/comtrad` (órfã)                              | Regulamento completo publicado; não há data, formulário de adesão nem contato próprio. |
| Solidariedade à Flor da Pele | `/colaborador`                                 | Descrito como projeto de campanhas de arrecadação (texto na seção 7).                  |
| SWIM 4 CHANGE                | `/swim-4-ghange`, `/swin-four-changer` (órfãs) | Evento de **15/12/2019**; cadastro de voluntários ainda no ar.                         |
| Certificado Raça e Racismo   | `/certificados` (órfã)                         | Lista de certificados individuais em PDF; sem data.                                    |
| 3º Encontro TOTEAJUDANDOPCD  | `/eventos` (órfã)                              | Jantar beneficente de **20/04/2024**, voucher a R$ 150,00; página ainda no ar.         |

Serviços que o site **não** descreve em lugar nenhum, apesar de o formulário oficial oferecer:
**Empréstimo de Equipamentos** e **Psicologia**. Ver seção 12.

---

## 4. Contatos

### 4.1. Endereço da sede (`/contato`, verbatim)

> Contatos
>
> Rua Acássia Pereira, nº 136
>
> Campos dos Alemães
>
> São José dos Campos/SP
>
> CEP:.12239-530

O CEP está publicado como `CEP:.12239-530`, com um ponto entre os dois-pontos e o número.

### 4.2. Telefones e e-mail (home, verbatim)

> 12 - 3346 0605

> 12 - 99165 7059-Secretaria
>
> 12 - 99124 7257-Serviço Social

> appdsjc@gmail.com

### 4.3. Consolidado de canais publicados

| Canal                | Valor                                                   | Onde aparece                                                  |
| -------------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| Telefone fixo        | (12) 3346-0605                                          | Home, `/oficina-inclusiva-mao-na-roda`, `/artesao-da`         |
| Celular Secretaria   | (12) 99165-7059                                         | Home (texto) e link WhatsApp da home desktop                  |
| Celular Serv. Social | (12) 99124-7257                                         | Home, `/oficina-inclusiva-mao-na-roda`, `/eventos` (WhatsApp) |
| Celular adicional    | (12) 98830-4815                                         | `/oficina-inclusiva-mao-na-roda`                              |
| Celular adicional    | (12) 98803-3600                                         | `/artesao-da` (link WhatsApp)                                 |
| E-mail               | appdsjc@gmail.com                                       | Home (texto e `mailto:`)                                      |
| WhatsApp             | `https://wa.me/5512991657059`                           | Home (versão desktop)                                         |
| WhatsApp             | `https://wa.me/12988033600`                             | `/artesao-da`                                                 |
| WhatsApp             | `https://wa.me/1233460605`                              | `/artesao-da` — **link inválido**, ver seção 9                |
| WhatsApp             | `https://wa.me/+55‹U+202A›‹U+202A›12991257059`          | Home (versão mobile) — **link inválido**, ver seção 9         |
| Formulário           | `/contato`, campos: Nome\*, E-mail\*, Assunto, Mensagem | `/contato`                                                    |

O formulário de `/contato` é um formulário nativo do Wix. Campos `nome-*` e `email`
obrigatórios; `assunto` e `mensagem` opcionais. Não há aviso de privacidade, nem informação de
para onde a mensagem é enviada, nem prazo de resposta.

### 4.4. Horário de funcionamento e mapa

- **Horário de funcionamento da sede: não encontrado no site.** Nenhuma página publica dias ou
  horários de atendimento da sede. O `/regimento-interno` diz apenas que "O horário de
  atendimento é estabelecido pela diretoria executiva".
- **Mapa da sede: não encontrado no site.** A página `/contato` traz o endereço em texto, sem
  mapa embutido nem link para o Google Maps.
- Os únicos links de mapa do site estão em `/bocha-adaptada` e apontam para os **locais de
  treino**, não para a sede:
  - `https://www.google.com.br/maps/place/Pra%C3%A7a+de+Esportes+Doutor+Pedro+Ot%C3%A1vio/...`
  - `https://www.google.com.br/maps/place/Centro+Esportivo+Palmeiras+de+S%C3%A3o+Jos%C3%A9/...`

---

## 5. Redes sociais e presença externa

| Rede / recurso             | URL                                             | Linkado no site?          | Sinais de atividade (2026-08-05)                                                                                                                      |
| -------------------------- | ----------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Instagram `@appdsjc`       | `https://www.instagram.com/appdsjc/`            | Sim, ícone na home        | Perfil vivo: "Appd SJC", 1.096 seguidores, 339 publicações. Data do último post não visível sem login.                                                |
| Facebook `appdsjc`         | `https://www.facebook.com/appdsjc`              | Sim, ícone na home        | Página viva: "Appd PessoasCom Deficiencia", 4.441 curtidas, "14 falando sobre isso". Data do último post não visível sem login.                       |
| Facebook Bocha Paralímpica | `https://www.facebook.com/bochaparalimpicasjc/` | Sim, em `/bocha-adaptada` | Página viva: "APPD - Bocha Paralímpica São José dos Campos", 2.274 curtidas.                                                                          |
| Facebook `AppdPcD2017`     | `https://www.facebook.com/AppdPcD2017/`         | **Não**                   | Página viva e homônima: "APPD - Associação das Pessoas Portadoras de Deficiência S.J.C", 1.955 curtidas. Encontrada por busca externa, não pelo site. |
| Site externo SWIM 4 CHANGE | `https://swim4change.com/`                      | Sim, em `/swim-4-ghange`  | Terceiro; não avaliado.                                                                                                                               |
| YouTube                    | —                                               | —                         | **Não encontrado no site** e não localizado em busca.                                                                                                 |
| LinkedIn / TikTok / X      | —                                               | —                         | **Não encontrado no site.**                                                                                                                           |

Achado: existem **duas páginas de Facebook institucionais** para a mesma associação, e o site
só aponta para uma delas. Isso divide audiência e deixa a segunda página sem manutenção
declarada.

---

## 6. Doação

**Existe uma seção de doação:** `/colaborador` ("Central de Doações"), linkada no menu
principal. Texto verbatim:

> Central de Doações
>
> A Central de Doações tem como função arrecadar recursos para garantir que a APPD possa
> oferecer o que há de melhor aos seus assistidos.
>
> Todos os nossos recursos vêm da generosidade de nossos colaboradores.

> Boleto de Contribuição Solidária.
>
> Apresentando este boleto em qualquer Casa Lotérica ou Agência Bancária, poderá depositar
> qualquer valor que será destinado a nossos Projetos Sociais.

> Telemarketing
>
> Você pode ser contatado(a) a qualquer momento!
>
> Quando nossa equipe de agentes de captação entrar em contato, por telefone, apresentar a
> APPD e solicitar sua contribuição, com informações que comprovam a importância da doação e a
> seriedade com que nosso trabalho é realizado, você perceberá o quanto sua participação é
> importante!
>
> É fundamental apenas certificar-se que a sua doação está indo para a APPD, sempre
> verificando o recibo impresso pela APPD e o crachá do mensageiro designado para receber sua
> importante contribuição!

> Solidariedade à Flor da Pele
>
> Esse Projeto desenvolve Campanhas de Arrecadação e Recebe qualquer tipo de Doação que venha
> atender aos nossos Assistidos.
>
> Entrando em Contato, nós retiraremos sua doação.
>
> Atualmente o que mais necessitamos é:
>
> Fraldas descartáveis geriátricas;
>
> Cadeiras de rodas ou de banho
>
> Alimentos não perecíveis.

> Qualquer doação é bem vinda, porém temos que analisar para ver se é viável aos nossos
> assistidos.

> A equipe da Central de Doações nunca menciona o nome do paciente ou o estágio da sua doença,
> pois a preservação da imagem e da identidade dos assistidos são para nós, mais importante
> que tudo.
>
> Portanto, quando receber uma ligação da Central de Doações da APPD, lembre-se que são nossos
> assistidos, que mais uma vez, agradecerão seu gesto em defesa da vida!

### 6.1. Meios de doação — o que existe e o que não existe

| Meio                          | Status no site                                                                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chave PIX**                 | **Não encontrado no site.** Nenhuma chave PIX é publicada em nenhuma página.                                                                                                      |
| **Conta bancária**            | **Não encontrado no site.** Banco, agência e conta não aparecem em texto em nenhuma página.                                                                                       |
| **Boleto**                    | Existe: PDF em `https://www.appd.org.br/_files/ugd/c97ec7_38f1516fcd69456aa946c392d0d77471.pdf` (200 OK). Ver ressalva abaixo.                                                    |
| **Cartão / gateway**          | **Não encontrado no site.** Não há botão de doação online, checkout ou integração de pagamento.                                                                                   |
| **Telemarketing**             | Existe como texto descritivo. Sem telefone, sem horário, sem forma de o doador iniciar o contato.                                                                                 |
| **Doação em espécie**         | Existe (fraldas geriátricas, cadeiras de rodas/banho, alimentos não perecíveis), com retirada mediante contato.                                                                   |
| **Contribuição de associado** | Citada em `/regimento-interno`: "Os pagamentos podem ser realizados na Sede da Associação ou via PIX diretamente na conta da Instituição". **A chave PIX em si não é publicada.** |
| **Valor sugerido**            | Só aparece dentro do formulário de atendimento: "é solicitado uma CONTRIBUIÇÃO SOLIDARIA! O valor sugerido é de R$ 50,00 (mensais)". Não aparece em nenhuma página do site.       |

Ressalvas sobre o boleto:

- O PDF é uma **imagem escaneada** (fluxo `DCTDecode`, sem camada de texto). Não é possível ler
  seu conteúdo por extração automática, nem saber se traz código de barras válido, dados
  bancários, valor ou vencimento. Também é ilegível para leitor de tela.
- O cabeçalho HTTP `last-modified` do arquivo é **2016-07-01**. O boleto tem cerca de 10 anos.
- O bloco "CONTRIBUIÇÃO SOLIDARIA" da home **não tem link** — quem clica não vai a lugar nenhum.

---

## 7. Imagens (catalogadas, não baixadas)

URLs abaixo estão na forma servida pelo Wix (`https://static.wixstatic.com/media/<id>` seguido
de parâmetros de corte/redimensionamento que foram omitidos por brevidade). **Nenhum arquivo
foi baixado.**

### 7.1. Identidade

| Arquivo                                           | O que retrata | Pessoas identificáveis | Onde                                                                                        |
| ------------------------------------------------- | ------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| `c97ec7_5f9aa7772929413ca292b3506ca9f596~mv2.png` | Logo da APPD  | Não                    | Todas as 15 páginas (2x por página: header e mobile). Também é a imagem `og:image` do site. |

### 7.2. Home (15 imagens)

| Arquivo                                           | O que retrata                      | Pessoas identificáveis |
| ------------------------------------------------- | ---------------------------------- | ---------------------- |
| `c97ec7_86f70b1be68a4543959e3cd0baf58bb7~mv2.png` | Ícone de telefone                  | Não                    |
| `c97ec7_8fcba129532c4ca7964ec9d91b9ec58a~mv2.png` | Ícone de WhatsApp                  | Não                    |
| `c97ec7_cbe25d08aaca4c35bead86ad5155254f.png`     | Ícone de e-mail                    | Não                    |
| `11062b_55e4be1e75564866b6c28290f9a9d271~mv2.png` | Ícone Instagram (alt="Instagram")  | Não                    |
| `11062b_2381e8a6e7444f4f902e7b649aa3f0ac~mv2.png` | Ícone Facebook (alt="Facebook")    | Não                    |
| `c97ec7_eac92fc3f3004ee49b86a85bca54e076~mv2.png` | Banner (alt = `1707999731571.png`) | Não verificado         |
| `c97ec7_4c54b2588ebb4044aa1b23db4303cd12~mv2.png` | Ícone de bloco de serviço          | Não                    |
| `c97ec7_63d3b3e346404676bc61a9091332600c~mv2.png` | Ícone de bloco de serviço          | Não                    |
| `c97ec7_a9b1c9d038e94018af206a0bca8ee999~mv2.png` | Banner (alt = `1712245189587.png`) | Não verificado         |
| `c97ec7_33ee15be8c9d4c4fa99cd5219dacbbc8~mv2.png` | Ícone de bloco de serviço          | Não                    |
| `c97ec7_cbae5e83df0948c78b196574aeb04f3c~mv2.png` | Ícone de bloco de serviço          | Não                    |
| `c97ec7_ec90df9aa3bf49b0870b088592bd5c6f~mv2.png` | Ícone de bloco de serviço          | Não                    |
| `c97ec7_d6b6c66bcc064da5a16a9171e8872bb8f000.jpg` | Imagem do rodapé (373x373)         | Não verificado         |

### 7.3. `/sobre-nos`

| Arquivo                                       | O que retrata                                           | Pessoas identificáveis                    |
| --------------------------------------------- | ------------------------------------------------------- | ----------------------------------------- |
| `c97ec7_242e24c8325c46fe99f614ab30b6fbbf.png` | Imagem ao lado do texto de apresentação (218x212)       | Não verificado                            |
| `c97ec7_adc13541b5744f6292df8093aa43f702.jpg` | Retrato do presidente, sob a legenda "Nosso Presidente" | **SIM** — retrato de pessoa identificável |

### 7.4. `/bocha-adaptada` (24 imagens, a maior galeria do site)

| Arquivo                                           | `alt` no HTML                                     | Pessoas identificáveis                       |
| ------------------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| `c97ec7_8f8ba79593384413896663f76c589b76~mv2.png` | (vazio)                                           | Não verificado                               |
| `c97ec7_a009cc5930f44abeaf7dacfcb834e613~mv2.jpg` | `bocha 3.jpg`                                     | **Provável** — foto de atividade esportiva   |
| `c97ec7_cb1173521d1145ba96e0bbb8c7970967~mv2.jpg` | `bocha2.jpg`                                      | **Provável** — foto de atividade esportiva   |
| `c97ec7_cf9fffedc9a541698767e16646777702~mv2.jpg` | `bocha 1.jpg`                                     | **Provável** — foto de atividade esportiva   |
| `c97ec7_4ce6fde649ce4d0b984a673d65e3207e~mv2.png` | (vazio) — 600x1948, provável cartaz vertical      | Não verificado                               |
| `c97ec7_992e6adf45274411b1f65ed77b3886a1~mv2.jpg` | `21314684_1442287919195492_2334485129220421329_n` | **Provável** — galeria de fotos de atividade |
| `c97ec7_d19b56ab24c14baf8e65b4fa632972db~mv2.jpg` | `23905607_1516778201746463_6549422055634071107_n` | **Provável**                                 |
| `c97ec7_35085704197240fba6584a9f6102c7a9~mv2.jpg` | `23244256_1498889686868648_4206654428707954021_n` | **Provável**                                 |
| `c97ec7_af5d4f1e51d54ef0b7399d09b029cf40~mv2.jpg` | `23319480_1498900960200854_6245063018767297885_n` | **Provável**                                 |
| `c97ec7_7e9f5dd3bd7144ef9d76c09c181bdba7~mv2.jpg` | `23434844_1498890273535256_6485451618376291527_n` | **Provável**                                 |
| `c97ec7_bc6c0245add54ce2a56d12f5203aad0e~mv2.jpg` | `23244575_1498889836868633_4246531626110709394_n` | **Provável**                                 |
| `c97ec7_2c64ff0311dc405a83953654da0baf7a~mv2.jpg` | `23231626_1498897813534502_399581595128658465_n`  | **Provável**                                 |
| `c97ec7_9efbc67621b9465c8a89417bca3b5927~mv2.jpg` | `23244295_1498890090201941_2492454979164198606_n` | **Provável**                                 |
| `c97ec7_eece0f7d80b04cffa3fee8cea01ecd59~mv2.png` | (vazio) — 234x65, provável logo de parceiro       | Não                                          |
| `c97ec7_125b468e472549a092c7e6f3223733c1~mv2.png` | (vazio) — 234x64, provável logo de parceiro       | Não                                          |

Os `alt` no formato `NNNNNNNN_NNNNNNNNNNNNNNN_NNNNNNNNNNNNNNNNNNN_n` são nomes de arquivo de
fotos exportadas do Facebook. Isso indica **galeria de fotos de atividade migrada do Facebook**,
com forte probabilidade de rostos de assistidos. **Cada uma dessas fotos precisa de checagem de
autorização de uso de imagem antes de reaproveitar no site novo.**

### 7.5. Demais páginas

| Página                           | Arquivo                                           | O que retrata                                                                                     | Pessoas identificáveis           |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| `/projetos-sociais`              | `c97ec7_8f8ba79593384413896663f76c589b76~mv2.png` | Card de projeto (144x202)                                                                         | Não verificado                   |
| `/projetos-sociais`              | `c97ec7_f4255106208240399592ed2852586a06~mv2.jpg` | Card de projeto (375x227)                                                                         | **Provável** — foto de atividade |
| `/projetos-sociais`              | `c97ec7_0bf304bf0d844fc28d60c0863cadd02a~mv2.png` | Card de projeto (409x204) — **sem link**                                                          | Não verificado                   |
| `/oficina-inclusiva-mao-na-roda` | `c97ec7_f4255106208240399592ed2852586a06~mv2.jpg` | Foto do projeto; `alt` = `19146071_1923348307948843_92110403334970` (nome de arquivo do Facebook) | **Provável**                     |
| `/oficina-inclusiva-mao-na-roda` | `c97ec7_e5a361b0765f4a62a21f9ba072f12527~mv2.jpg` | Retrato do responsável técnico; `alt` = `Billappdfoto1.JPG`                                       | **SIM** — retrato                |
| `/artesao-da`                    | `c97ec7_4c54b2588ebb4044aa1b23db4303cd12~mv2.png` | Ícone; `alt` = `1694546282148.png`                                                                | Não                              |
| `/colaborador`                   | `c97ec7_547c06f9d82e4c45abc444823120dd69~mv2.png` | Miniatura do boleto (214x180)                                                                     | Não                              |
| `/colaborador`                   | `c97ec7_983fc8e5c02f4fd89278bac8f4ed615b.png`     | Ilustração (600x600)                                                                              | Não verificado                   |
| `/colaborador`                   | `c97ec7_bcc2777c18c74f2d8b6243eae2e00a58.png`     | Ilustração da seção de contato (320x214)                                                          | Não verificado                   |
| `/certificados`                  | `c97ec7_1cde9ad8919b4ce6a85f7d5593ea63fe~mv2.png` | Imagem da página de certificados                                                                  | Não verificado                   |
| `/eventos`                       | 11 imagens (banners e fotos de artistas)          | Divulgação do jantar de 20/04/2024                                                                | **Provável** — fotos dos músicos |
| `/contato`                       | só o logo                                         | —                                                                                                 | Não                              |
| `/comtrad`, `/regimento-interno` | só o logo                                         | —                                                                                                 | Não                              |

Contagem por página (total de `<img>` no HTML, incluindo as duas cópias do logo): home 15,
`/bocha-adaptada` 24, `/eventos` 11, `/colaborador` 5, `/projetos-sociais` 5,
`/oficina-inclusiva-mao-na-roda` 4, `/sobre-nos` 4, `/comtrad` 4, `/certificados-1` 4,
`/artesao-da` 3, `/regimento-interno` 3, `/certificados` 3, `/swim-4-ghange` 3,
`/swin-four-changer` 3, `/contato` 2.

---

## 8. Links quebrados ou enganosos

Nenhum link do site retorna erro HTTP — todos os 15 caminhos internos e todos os destinos
externos respondem 200. Os problemas são de **destino errado, permissão ou URL malformada**,
que é pior: o visitante clica, algo abre, e o que abre não é o que foi prometido.

### 8.1. `/edit` de formulário Google na home — CONFIRMADO

- **Onde:** home, na área dos blocos de serviço.
- **URL publicada:**
  `https://docs.google.com/forms/d/1_exUVbd6KlGiXP5YsyPXFzdZJw9AuVcVwL4jGtISjos/edit`
- **O que é `/edit`:** é a URL do **modo de edição** do formulário, a área administrativa de
  quem é dono do formulário. Não é o endereço de resposta (`/viewform`).
- **O que acontece com o visitante:** o Google redireciona para
  `.../viewform?edit_requested=true` — ou seja, o visitante cai num fluxo de **solicitação de
  acesso de edição** ao formulário da associação, não num formulário para preencher.
- **Agravante que o levantamento revelou:** esse formulário **não é de Fisioterapia**. O título
  real dele é **"Cadastro de Visitas / Reunião"**, e a descrição do próprio formulário diz, em
  letras maiúsculas:

  > 🚨 ATENÇÃO 🚨
  >
  > ✖️ Este cadastro É SOMENTE PARA VISITAS.
  >
  > Para ATENDIMENTOS CLIQUE AQUI

  Ou seja: além de estar no modo administrativo, o link leva ao formulário **errado** — o de
  agendamento de visita à sede, não o de atendimento.

- **Severidade: alta.** É simultaneamente (a) exposição da URL administrativa do formulário,
  (b) fluxo quebrado para o visitante e (c) informação enganosa sobre o serviço.

### 8.2. Cinco blocos de serviço, um destino só

Os blocos "Artesão da inclusão", "Fisioterapia", "Serviço Social", "Informática Nota 10" e
"Orientações Gerais" **levam todos ao mesmo formulário** ("CADASTRO DE ATENDIMENTO 2026"), por
dois caminhos diferentes (`forms.gle/mT29U4RjCWtoQztHA` e o `viewform` correspondente, que são
a mesma URL). O visitante que clica em "Informática Nota 10" chega a um formulário onde
Informática **não é uma das opções**. **Enganoso, severidade média-alta.**

### 8.3. `https://wa.me/1233460605` — link de WhatsApp inválido

- **Onde:** `/artesao-da`, no texto "+55 12 3346 0605".
- **Problema:** `3346-0605` é um **telefone fixo**, não WhatsApp, e o número está sem o código
  do país (`55`). O `wa.me` não resolve para conversa válida.

### 8.4. WhatsApp da home mobile — URL com caracteres invisíveis e número divergente

- **Onde:** home, versão mobile do HTML.
- **URL publicada:** `https://wa.me/+55‪‪12991257059` — contém **dois caracteres de
  controle Unicode U+202A** (LEFT-TO-RIGHT EMBEDDING) invisíveis, colados no meio da URL.
  Isso quebra o link.
- **Agravante:** o número `12991257059` **não corresponde a nenhum telefone publicado no site**.
  A versão desktop da mesma home usa `5512991657059` (Secretaria, 99165-7059). O número da
  versão mobile não bate com a Secretaria (99165-7059) nem com o Serviço Social (99124-7257).
- **Efeito:** quem acessa pelo celular — que é a maioria do tráfego típico — clica no WhatsApp
  e não fala com a associação. **Severidade alta.**

### 8.5. Bloco "CONTRIBUIÇÃO SOLIDARIA" sem link

Na home, o bloco com legenda "CONTRIBUIÇÃO SOLIDARIA" **não tem link nenhum** no HTML. O
elemento parece clicável (mesmo formato dos outros cinco) e não é. **Severidade média** — é o
caminho de doação na página mais visitada.

### 8.6. Card sem link em `/projetos-sociais`

A página tem 3 cards de projeto e apenas 2 links. O card do Artesão da Inclusão não é clicável.

### 8.7. Sete páginas órfãs

`/comtrad`, `/eventos`, `/regimento-interno`, `/certificados`, `/certificados-1`,
`/swim-4-ghange` e `/swin-four-changer` estão publicadas, indexáveis (o `robots.txt` permite
tudo) e **não têm nenhum caminho de navegação a partir do menu**. Duas delas divulgam eventos
já passados (2019 e 2024) como se estivessem ativos. **Severidade média** — conteúdo velho no
ar, encontrável por busca.

### 8.8. Boleto de 2016

O PDF de contribuição solidária tem `last-modified` de **2016-07-01**. Não foi possível
verificar se código de barras, valor ou dados bancários ainda são válidos (é imagem escaneada).
**Precisa de conferência da associação.**

---

## 9. Aspectos técnicos observáveis

### 9.1. Plataforma

- **Wix.** `<meta name="generator" content="Wix.com Website Builder">`; mídia servida por
  `static.wixstatic.com`; runtime `thunderbolt`; `X-Wix-Published-Version: 555`.
- Site ID do Wix presente no HTML (`X-Wix-Meta-Site-Id`).
- `sitemap.xml` gerado pelo Wix (`generatedBy="WIX"`), com `lastmod` uniforme `2025-05-22` —
  que é a data de republicação do site, não necessariamente a de edição de cada página.

### 9.2. HTTPS e redirecionamento

- HTTPS ativo e válido em todas as páginas.
- `http://appd.org.br/` → **301** para `https://appd.org.br/`. Redirecionamento correto.

### 9.3. Responsividade

- `<meta name="viewport" content="width=device-width, initial-scale=1">` presente.
- O Wix serve **layout separado para mobile** (HTML diferente conforme o User-Agent), não um
  layout fluido único. Funciona, mas cria o risco já materializado na seção 8.4: **o conteúdo
  das duas versões pode divergir**, e diverge (o link de WhatsApp da home).

### 9.4. Acessibilidade — problemas inferíveis do HTML

| Problema                                 | Evidência                                                                                                                                                                                                  | Impacto                                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Sem `<h1>` em 14 das 15 páginas**      | Só `/eventos` tem `<h1>` — e o texto dele é "NAVE DE BACALHAU COM AZEITONa", um item do cardápio do jantar.                                                                                                | Leitor de tela não encontra o título principal da página. Falha WCAG de estrutura. |
| **Páginas sem nenhum heading**           | `/sobre-nos`, `/projetos-sociais`, `/bocha-adaptada`, `/contato`, `/comtrad`, `/regimento-interno`, `/certificados`, `/certificados-1`, `/swim-4-ghange`, `/swin-four-changer` têm **zero** `<h1>`–`<h6>`. | Navegação por títulos é impossível nessas 10 páginas.                              |
| **`alt` ausente ou vazio**               | Home: 11 de 15 imagens sem `alt` útil. `/colaborador`: 5 de 5. `/sobre-nos`: 4 de 4 — incluindo o retrato do presidente. `/comtrad`: 4 de 4.                                                               | Imagens de conteúdo invisíveis para leitor de tela.                                |
| **`alt` preenchido com nome de arquivo** | `1707999731571.png`, `Billappdfoto1.JPG`, `bocha 3.jpg`, `23905607_1516778201746463_...`                                                                                                                   | Pior que `alt` vazio: o leitor de tela lê a string do nome de arquivo.             |
| **Sem `<label>` no formulário**          | `/contato` usa apenas `placeholder` ("Nome \*", "E-mail \*", "Assunto", "Mensagem"); nenhum `<label>` no HTML.                                                                                             | O rótulo some ao digitar e não é anunciado corretamente.                           |
| **Hierarquia de headings quebrada**      | Home tem 6 `<h2>` e nenhum `<h1>`; `/eventos` tem `<h1>` depois dos `<h2>`.                                                                                                                                | Ordem de leitura estrutural incoerente.                                            |
| **Contraste**                            | Não verificado — depende de CSS renderizado e de cor computada, fora do alcance da análise estática feita aqui.                                                                                            | —                                                                                  |

Ironia relevante para o projeto: é o site de uma associação de pessoas com deficiência.
Acessibilidade aqui não é conformidade, é o produto.

### 9.5. Idioma e SEO

- `<html lang="pt">` — idioma declarado. Correto, embora `pt-BR` fosse mais preciso.
- **`<meta name="description">` ausente em todas as 15 páginas.**
- Open Graph presente só na home (`og:title`, `og:image`, `og:url`, `og:site_name`,
  `og:type`); `og:description` não encontrado. O `og:image` é o logo, não uma imagem de
  compartilhamento.
- Twitter Card configurado na home com o mesmo título e a mesma imagem.
- `robots.txt` padrão do Wix: `Allow: /`, com bloqueio só de `*?lightbox=` e do `PetalBot`.
  **Todas as páginas órfãs são indexáveis.**

### 9.6. Nomenclatura

O site usa **"Pessoas Portadoras de Deficiência"** no cabeçalho de todas as 15 páginas e no
`<title>` da home. Em `/sobre-nos`, o texto usa **"Pessoas com Deficiência"**. A terminologia
oficial adotada pela Lei 13.146/2015 (Estatuto da Pessoa com Deficiência) — citada pelo próprio
site em `/comtrad` — é "pessoa com deficiência". **A marca institucional do site contradiz a lei
que o site cita.** Registro como fato observado; a decisão sobre trocar ou não é da associação.

---

## 10. Dados pessoais expostos (registro, sem transcrição)

Conforme a regra deste levantamento, nomes de participantes **não foram copiados**. Registro
apenas onde estão:

| Onde                             | O que aparece                                                                                                                                                                                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/certificados`                  | Lista pública de participantes de uma atividade ("Certificado Raça e Racismo"), cada nome ligado a um **PDF individual de certificado**. Contei **37 links distintos** para PDFs em `https://www.appd.org.br/_files/ugd/*.pdf`. Os PDFs são públicos, sem autenticação. |
| `/sobre-nos`                     | Nome do presidente + **dado de saúde** (lesão medular, tetraplegia, tratamento e datas) + nomes de dois filhos + retrato fotográfico.                                                                                                                                   |
| `/oficina-inclusiva-mao-na-roda` | Nome e retrato do responsável técnico.                                                                                                                                                                                                                                  |
| `/bocha-adaptada`                | Nome do responsável técnico + celular pessoal + galeria de ~8 fotos de atividade provavelmente com rostos de assistidos.                                                                                                                                                |
| `/swin-four-changer`             | Nome e celular pessoal do organizador do certificado.                                                                                                                                                                                                                   |

Isto é registro factual, não parecer jurídico. A associação precisa decidir o que reaproveitar e
com qual base legal.

---

## 11. A divergência: o que o formulário oferece × o que o site divulga

Esta é a inconsistência central encontrada, e ela é mais grave do que a hipótese inicial: os
dois conjuntos não apenas quase não se encontram — **o site inteiro aponta para um único
formulário que oferece serviços que o site não descreve.**

### 11.1. O que o formulário oficial oferece

Formulário **"CADASTRO DE ATENDIMENTO 2026"**
(`https://docs.google.com/forms/d/e/1FAIpQLSf1SVsu6DtLeUFdu3veBtFChume6rB9bfkzI5MT7ggRsJYhWg/viewform`,
acessado em 2026-08-05). Pergunta "Tipo de Atendimento", opções, verbatim:

1. Empréstimo Equipamentos
2. Fisioterapia
3. Orientações Gerais
4. Psicologia
5. Serviço Social

Outras regras que o formulário declara e o **site não menciona em lugar nenhum**:

> ⚠️ Os Atendimentos são AGENDADOS CONFORME O SURGIMENTO DAS VAGAS!

> AS SESSÕES SÃO REALIZADOS SOMENTE NO PERÍODO DA MANHÃ. SELECIONE O(s) MELHOR(es) DIA(s) PARA
> OS ATENDIMENTO(s)

(opções: segundas, terças, quartas, quintas, sextas, qualquer dia da semana)

> ❗️Para MANUTENÇÃO do PROJETO, é solicitado uma CONTRIBUIÇÃO SOLIDARIA! O valor sugerido é de
> R$ 50,00 (mensais) podendo ser alterado conforme a situação de cada Atendido!

### 11.2. O que o site divulga

| Origem                  | Itens divulgados                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Menu "Projetos Sociais" | Bocha Paralímpica, Oficina Inclusiva Mão na Roda, Artesão da Inclusão                                              |
| Blocos da home          | Artesão da inclusão, Fisioterapia, Serviço Social, Informática Nota 10, Orientações Gerais, CONTRIBUIÇÃO SOLIDARIA |
| Páginas órfãs           | COMTRAD, Solidariedade à Flor da Pele, SWIM 4 CHANGE, Certificado Raça e Racismo                                   |

### 11.3. Cruzamento

| Serviço / projeto                | No formulário? | Página no site?          | Bloco na home? | Situação                                                                  |
| -------------------------------- | -------------- | ------------------------ | -------------- | ------------------------------------------------------------------------- |
| **Empréstimo de Equipamentos**   | Sim            | Não                      | Não            | Oferecido no formulário, **invisível no site**.                           |
| **Psicologia**                   | Sim            | Não                      | Não            | Oferecido no formulário, **invisível no site**.                           |
| **Fisioterapia**                 | Sim            | Não                      | Sim            | Só existe como legenda de bloco; sem descrição, público ou horário.       |
| **Serviço Social**               | Sim            | Não                      | Sim            | Idem. Há um telefone rotulado "Serviço Social" na home.                   |
| **Orientações Gerais**           | Sim            | Não                      | Sim            | Idem.                                                                     |
| **Informática Nota 10**          | **Não**        | Não                      | Sim            | Divulgado na home e **não é opção do formulário** para onde o bloco leva. |
| **Artesão da Inclusão**          | **Não**        | Sim                      | Sim            | Tem página, mas o bloco leva a um formulário que não o oferece.           |
| **Bocha Paralímpica**            | **Não**        | Sim                      | Não            | Tem página com horários; sem caminho de inscrição.                        |
| **Oficina Mão na Roda**          | **Não**        | Sim                      | Não            | Tem página; sem caminho de inscrição.                                     |
| **COMTRAD**                      | **Não**        | Sim (órfã)               | Não            | Regulamento no ar, sem caminho de adesão.                                 |
| **Solidariedade à Flor da Pele** | **Não**        | Citado em `/colaborador` | Não            | Descrito, sem página própria.                                             |

### 11.4. Perguntas para a associação esclarecer

Lista derivada apenas dos fatos acima — o inventário não presume as respostas:

1. **Empréstimo de Equipamentos** e **Psicologia** estão ativos hoje? Se sim, por que não estão
   no site? Quem atende, quando, com que critério?
2. **Informática Nota 10** ainda existe? Se sim, por que não é opção do formulário de
   atendimento? Se não, por que ainda está na home?
3. **Fisioterapia, Serviço Social e Orientações Gerais** têm descrição, público-alvo, horário e
   condição? Nenhum dos três tem uma linha de texto no site.
4. **Bocha, Oficina Mão na Roda e Artesão** entram por qual caminho? O formulário de atendimento
   não os oferece, e as páginas deles não têm formulário nem instrução de inscrição.
5. O formulário se chama **"CADASTRO DE ATENDIMENTO 2026"** — existe um por ano? Quem troca o
   link no site quando vira o ano?
6. As regras que só existem dentro do formulário — **vagas por fila**, **atendimento só de
   manhã**, **contribuição sugerida de R$ 50,00 mensais** — deveriam estar visíveis no site
   antes da pessoa preencher o cadastro?
7. O formulário **"Cadastro de Visitas / Reunião"** deveria estar linkado na home? Hoje ele
   está, mas pela URL administrativa (`/edit`) e sem legenda que o identifique.
8. **COMTRAD** está ativo? A página está no ar, órfã, com regulamento completo e sem forma de
   adesão.
9. Qual é a chave **PIX** da instituição? O regimento cita PIX como forma de pagamento, mas a
   chave não está publicada em lugar nenhum.
10. O **boleto de 2016** ainda é válido?
11. Qual das **duas páginas de Facebook** é a oficial?
12. Os **37 certificados individuais** em PDF e as fotos de atividade têm autorização de uso e
    devem ser migrados?

---

## 12. O que NÃO consegui verificar

| Item                                                                                    | Motivo                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Qual bloco visual da home carrega o link `/edit`                                        | O Wix posiciona os componentes por CSS/JSON externo, e o JSON de layout da página responde **403** para acesso anônimo. Pela ordem do HTML mobile, os 5 blocos legendados apontam todos para o CADASTRO DE ATENDIMENTO 2026, e o `/edit` é um dos dois links sem legenda no topo. Uma leitura renderizada anterior atribuiu o `/edit` ao bloco "Fisioterapia". **Confirmado que o link existe e está quebrado; a atribuição visual precisa de conferência num navegador.** |
| Conteúdo do boleto (dados bancários, código de barras, validade)                        | O PDF é imagem escaneada (`DCTDecode`), sem camada de texto, e não há OCR disponível no ambiente. Não foi renderizado.                                                                                                                                                                                                                                                                                                                                                     |
| Data do último post no Instagram e no Facebook                                          | Ambas as plataformas exigem login para exibir o feed. Só foram lidos os metadados públicos (nome, seguidores, curtidas).                                                                                                                                                                                                                                                                                                                                                   |
| Existência de canal no YouTube                                                          | Não há link no site e a busca externa não retornou canal atribuível à APPD-SJC. Ausência de evidência, não evidência de ausência.                                                                                                                                                                                                                                                                                                                                          |
| Contraste de cores (WCAG AA/AAA)                                                        | Exige CSS renderizado e cor computada; a análise foi estática sobre o HTML. Não foi executado navegador.                                                                                                                                                                                                                                                                                                                                                                   |
| O que cada imagem retrata de fato, e quem aparece nela                                  | As imagens **não foram baixadas nem visualizadas**, por instrução. A coluna "pessoas identificáveis" é inferida do `alt`, do nome de arquivo e das dimensões — é indício, não confirmação.                                                                                                                                                                                                                                                                                 |
| Se as fotos de atividade têm autorização de uso de imagem                               | Informação interna da associação; não é observável no site.                                                                                                                                                                                                                                                                                                                                                                                                                |
| Se os projetos e horários publicados ainda valem em 2026                                | O site não tem data de atualização por página. O `lastmod` do sitemap (`2025-05-22`) é de republicação da plataforma, não de revisão de conteúdo.                                                                                                                                                                                                                                                                                                                          |
| Para onde vai a mensagem do formulário de `/contato`                                    | É formulário nativo do Wix; o destinatário é configurado no painel administrativo, não aparece no HTML.                                                                                                                                                                                                                                                                                                                                                                    |
| Se `/comtrad`, `/eventos` e as demais órfãs são intencionalmente ocultas ou esquecidas  | Só a associação sabe. Do lado técnico: estão publicadas, respondem 200 e são indexáveis.                                                                                                                                                                                                                                                                                                                                                                                   |
| Número exato de participantes em `/certificados`                                        | Contei **37 links distintos** para PDF. Uma leitura renderizada anterior indicou "41 nomes". A divergência pode ser nome sem link ou link repetido. Não foi reconciliada porque exigiria transcrever os nomes.                                                                                                                                                                                                                                                             |
| Se o telefone `12 3931 6534` em `/bocha-adaptada` é da associação ou do local de treino | O site publica o número sem rótulo, logo abaixo do responsável técnico.                                                                                                                                                                                                                                                                                                                                                                                                    |
| Volume de tráfego, origem dos visitantes, páginas mais acessadas                        | Requer acesso ao painel de analytics da associação.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Se existe estatuto, relatório de atividades ou prestação de contas em algum lugar       | Não estão publicados no site. Podem existir fora dele.                                                                                                                                                                                                                                                                                                                                                                                                                     |
