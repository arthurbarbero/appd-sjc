# Arquitetura de informação

Como o conteúdo se organiza e por onde cada pessoa passa. Escrito em 2026-08-05 a
partir de [inventario-conteudo.md](inventario-conteudo.md) e de
[campos-formulario.md](campos-formulario.md). É o insumo dos prompts de design da
Fase 2 — não descreve layout, descreve **o que precisa estar ao alcance de quem**.

## Princípios que mandam nas decisões abaixo

1. **Uma ação principal por público, visível sem rolar.** O site atual tem seis blocos
   iguais na home, cinco levando ao mesmo formulário. Isso não é escolha, é ruído.
2. **Ninguém chega pela home.** A pessoa cai de uma busca ou de um link no WhatsApp
   direto numa página interna. Toda página se explica sozinha e oferece o próximo passo.
3. **Acessibilidade é arquitetura, não acabamento.** Navegação por teclado, um `h1` por
   página, hierarquia de headings real, link com texto que faz sentido fora de contexto.
   Hoje o site tem `h1` em 1 de 15 páginas e 10 páginas sem heading nenhum.
4. **Linguagem simples.** O público inclui pessoas com deficiência intelectual e
   familiares idosos. Frase curta, voz ativa, sem jargão de terceiro setor.
5. **Todo serviço tem página, e nenhuma página inventa fato.** Cada serviço e projeto
   ganha uma landing page própria com conteúdo de verdade sobre a área — pesquisado,
   com fonte. O que descreve especificamente a APPD e não pôde ser verificado fica
   marcado `[A CONFIRMAR]`, para a associação revisar antes de publicar. Página existe;
   promessa não inventada. Ver [servicos/](servicos/) e
   [pendencias-appd.md](pendencias-appd.md).

---

## Os três públicos

### Público 1 — Pessoa com deficiência e sua família

**Quem é**: quem precisa de atendimento (fisioterapia, psicologia, serviço social,
empréstimo de equipamento, orientação) e a família ou cuidador que muitas vezes navega
no lugar dela.

**Ação principal**: **pedir atendimento** → formulário de atendimento.

**O que precisa saber antes de clicar**, e que hoje só descobre depois de abrir o
formulário: que a vaga entra em fila, que **as sessões são só de manhã**, e que existe
uma contribuição sugerida de R$ 50,00 mensais, ajustável. Esconder isso até a última
tela desperdiça o tempo de quem não pode de manhã e constrange quem não pode contribuir.
**Vai para cima**, na página do serviço, antes do botão.

**Barreiras reais**: leitor de tela; navegação só por teclado; baixa afinidade digital;
formulário longo preenchido por terceiro; conexão móvel ruim. O caminho até o formulário
não pode ter mais de dois cliques a partir de qualquer página.

**Percurso**: qualquer página → _Preciso de atendimento_ → página do serviço (o que é,
para quem, quando, o que esperar) → formulário → confirmação com o que acontece agora e
por qual telefone virá o contato.

### Público 2 — Doador

**Quem é**: pessoa física da cidade, ex-doador do boleto, empresa local. Chega por
busca, por indicação ou por campanha.

**Ação principal**: **doar** → PIX (quando a chave existir; ver P0-2 nas pendências).

**O que precisa antes de doar**: prova de que a associação é real e séria. Hoje o site
não publica prestação de contas, número de assistidos, diretoria nem estatuto — e a
única forma concreta de doar é um boleto escaneado de 2016. Doador não deposita em quem
não consegue verificar.

**O que a Central de Doações precisa entregar**: PIX com QR Code copiável, doação em
espécie (a lista de necessidades atuais é ótima e é conteúdo pronto — fraldas
geriátricas, cadeiras de rodas e de banho, alimentos), CNPJ visível, e o destino do
dinheiro em uma frase concreta.

**Ponto sensível**: a captação por telefone com agente que recolhe presencialmente
(R4 nas pendências) exige uma página de verificação — "recebeu uma ligação da APPD?
confira aqui". Isso protege o doador e a reputação da associação, e reaproveita a
verificação pública de crachá que já está no escopo.

**Percurso**: home → _Doar_ → Central de Doações → PIX copiado, ou lista de itens e
contato para retirada.

### Público 3 — Voluntário

**Quem é**: estudante de fisioterapia, terapia ocupacional ou educação física; artesão;
profissional que quer doar horas; empresa buscando ação social.

**Ação principal**: **se oferecer** → contato com assunto pré-selecionado.

**Situação atual**: o site **não tem nada** para este público. Nenhuma página, nenhum
formulário, nenhuma menção — exceto um cadastro de voluntários de um evento de 2019 que
continua no ar, órfão. Quem quer ajudar hoje não tem por onde.

**Decisão**: na V1, voluntário **não ganha página própria** nem cadastro. Ganha uma
seção na página Sobre nós e uma opção no formulário de contato ("Quero ser
voluntário"), com as áreas que a associação aceita. Criar um fluxo de cadastro de
voluntário antes de existir alguém para triar candidato produz caixa de entrada
abandonada — pior que não ter.

**Gatilho para promover a voluntário de primeira classe**: a associação indicar quem
recebe e responde essas mensagens.

---

## Hierarquia da home

Ordem de cima para baixo, uma decisão por faixa:

1. **Quem somos, em uma frase** — nome, cidade, o que a associação faz. Resolve o
   visitante que caiu de busca e ainda não sabe onde está.
2. **Preciso de atendimento** — ação primária, o caminho do Público 1. Botão único,
   grande, com texto que diz o que acontece ("pedir atendimento", não "saiba mais").
3. **Doar** — ação secundária, visualmente distinta da primária, não competindo por
   atenção com ela.
4. **O que fazemos** — os cinco serviços de atendimento e os quatro projetos, cada card
   levando à **página própria daquele serviço**, nunca a um formulário genérico. É a
   correção do erro central do site atual, onde cinco cards diferentes levavam ao mesmo
   destino.
5. **Como ajudar de outras formas** — doação em espécie e voluntariado (Público 3).
6. **Onde estamos e como falar com a gente** — endereço, telefone, WhatsApp oficial,
   e-mail, horário.

O que **não** entra na home: seis blocos idênticos apontando para o mesmo destino;
serviço sem uma linha de descrição; evento vencido.

---

## Mapa de navegação

### Menu principal (público, ≤6 itens)

| Item        | Rota           | Serve a quem   |
| ----------- | -------------- | -------------- |
| Início      | `/`            | todos          |
| Projetos    | `/projetos`    | públicos 1 e 3 |
| Atendimento | `/atendimento` | público 1      |
| Doar        | `/doar`        | público 2      |
| Sobre nós   | `/sobre`       | públicos 2 e 3 |
| Contato     | `/contato`     | todos          |

`Entrar` fica fora do menu principal, no canto do cabeçalho: é para quem já é
associado, não é caminho de descoberta.

### Rodapé

Endereço e CNPJ · telefones e WhatsApp oficial · e-mail · redes sociais (a página de
Facebook **oficial**, uma só) · Política de Privacidade · Seus direitos (LGPD) ·
"Recebeu uma ligação da APPD?" (verificação de captador, se aprovado).

### Área autenticada

| Item              | Rota               |
| ----------------- | ------------------ |
| Meus dados        | `/area/dados`      |
| Minhas inscrições | `/area/inscricoes` |
| Meu crachá        | `/area/cracha`     |
| Excluir conta     | `/area/excluir`    |

Verificação pública de crachá: `/verificar/<numero_registro>` — pública de propósito,
mostra **apenas** nome, número e status.

### Rotas completas do site

| Rota                     | Tela (Fase 2)              | Acesso      |
| ------------------------ | -------------------------- | ----------- |
| `/`                      | Home                       | público     |
| `/atendimento`           | Atendimento (hub)          | público     |
| `/atendimento/<slug>`    | Serviço (landing page)     | público     |
| `/atendimento/inscricao` | Formulário de Atendimento  | público     |
| `/projetos`              | Projetos Sociais (lista)   | público     |
| `/projetos/<slug>`       | Projeto (landing page)     | público     |
| `/doar`                  | Central de Doações         | público     |
| `/sobre`                 | Sobre nós                  | público     |
| `/contato`               | Contato                    | público     |
| `/privacidade`           | Política de Privacidade    | público     |
| `/seus-direitos`         | Direitos do titular (LGPD) | público     |
| `/cadastro`              | Cadastro                   | público     |
| `/entrar`                | Login                      | público     |
| `/area/*`                | Área do Associado          | autenticado |
| `/verificar/<numero>`    | Verificação do crachá      | público     |
| `/*` (não encontrado)    | 404 útil                   | público     |

Convenção de URL: minúscula, sem acento, sem sufixo de tecnologia, curta e estável. O
site atual tem `/artesao-da` (truncada), `/swim-4-ghange` e `/swin-four-changer` (duas
grafias erradas da mesma coisa) — URL é contrato público, erro de digitação nela dura
para sempre.

---

## As nove landing pages

Decisão do dono (2026-08-05): **cada serviço e cada projeto ganha uma página própria**,
com conteúdo real sobre a área, e um botão de cadastro no fim. A APPD revisa depois.

A divisão em duas famílias não é estética — ela vem do formulário oficial. O que está
no "Tipo de Atendimento" entra por `/atendimento`; o que não está é atividade contínua
e entra por `/projetos`.

| Página                     | Rota                                   | No formulário? |
| -------------------------- | -------------------------------------- | -------------- |
| Fisioterapia               | `/atendimento/fisioterapia`            | Sim            |
| Psicologia                 | `/atendimento/psicologia`              | Sim            |
| Serviço Social             | `/atendimento/servico-social`          | Sim            |
| Orientações Gerais         | `/atendimento/orientacoes-gerais`      | Sim            |
| Empréstimo de Equipamentos | `/atendimento/emprestimo-equipamentos` | Sim            |
| Bocha Paralímpica          | `/projetos/bocha-paralimpica`          | Não            |
| Oficina Mão na Roda        | `/projetos/mao-na-roda`                | Não            |
| Artesão da Inclusão        | `/projetos/artesao-da-inclusao`        | Não            |
| Informática Nota 10        | `/projetos/informatica-nota-10`        | Não            |

### Anatomia comum

Todas seguem a mesma espinha, o que dá previsibilidade a quem usa leitor de tela e
permite um só componente de tela no design:

1. `h1` com o nome do serviço
2. o que é, em uma frase
3. para quem é
4. o conteúdo de verdade sobre a área — o que a pessoa veio aprender
5. o que esperar na prática
6. como funciona na APPD (fila, período da manhã, contribuição sugerida)
7. perguntas frequentes
8. **chamada para ação: fazer o cadastro**
9. contato humano alternativo (WhatsApp oficial), para quem não vai preencher formulário

O rascunho de conteúdo de cada uma vive em [servicos/](servicos/), um arquivo por
página, com fontes citadas e marcações `[A CONFIRMAR]`.

### O que fazer com dado que não existe

Onde o site atual não publica a informação (horário da sede, responsável, condição de
empréstimo), o texto entra com `[A CONFIRMAR]` bem visível — nunca com valor inventado.
Duas exceções em que inventar seria dano real, e por isso não se faz em nenhuma hipótese:

- **telefone**: um número plausível inventado pode ser a linha de uma pessoa real;
- **chave PIX**: manda dinheiro de doador para a conta de outra pessoa.

Nesses dois casos o campo fica com o dado real publicado hoje, ou vazio e marcado.

---

## Migração das URLs antigas

Quando o site novo assumir o domínio, todo link já compartilhado por WhatsApp continua
existindo por aí. Redirecionamento permanente (301) onde há destino equivalente:

| URL antiga                       | Destino                                                         |
| -------------------------------- | --------------------------------------------------------------- |
| `/sobre-nos`                     | `/sobre`                                                        |
| `/projetos-sociais`              | `/projetos`                                                     |
| `/colaborador`                   | `/doar`                                                         |
| `/contato`                       | `/contato` (mantém)                                             |
| `/bocha-adaptada`                | `/projetos/bocha-paralimpica`                                   |
| `/oficina-inclusiva-mao-na-roda` | `/projetos/mao-na-roda`                                         |
| `/artesao-da`                    | `/projetos/artesao-da-inclusao`                                 |
| `/regimento-interno`             | `/sobre` (ou rota própria, se a APPD quiser manter o documento) |

Sem destino equivalente — **vão para a 404 útil**, conforme decidido: `/comtrad`,
`/eventos`, `/certificados`, `/certificados-1`, `/swim-4-ghange`,
`/swin-four-changer`, e o link `/edit` do formulário Google que hoje está na home.

### A 404 tem trabalho a fazer

Não é página de desculpa. Ela recebe quem clicou num link velho de 2019 e precisa sair
de lá com o que veio buscar:

- explicação em uma frase, sem culpar a pessoa e sem jargão ("Esta página não existe
  mais");
- busca no site;
- os serviços e projetos, com link direto para a página de cada um;
- os dois caminhos principais: pedir atendimento e doar;
- WhatsApp oficial, para quem prefere falar com gente;
- e, quando a rota antiga é conhecida, uma linha dizendo o que houve — "a página de
  Fisioterapia saiu do ar; o atendimento continua, veja aqui".

Precisa responder **HTTP 404 de verdade** (não 200 com cara de erro) e ter `h1`
próprio.

---

## O que o formulário de atendimento herda desta arquitetura

- Mora em `/atendimento`, alcançável em um clique da home e das páginas de projeto.
- As três regras que hoje se escondem dentro do Google Forms — fila, só de manhã,
  contribuição sugerida — aparecem **antes** do primeiro campo.
- Os 15 campos não mudam ([campos-formulario.md](campos-formulario.md)).
- O consentimento do Art. 11 é passo próprio e destacado, nunca uma linha miúda no fim.
- A confirmação diz o que acontece agora, em quanto tempo e por qual canal — o site
  atual entrega o formulário do Google e a pessoa fica sem saber se foi.

## Decisões que este documento assume e a APPD pode derrubar

1. A V1 publica **nove landing pages**, uma por serviço e por projeto, com conteúdo
   pesquisado e marcações `[A CONFIRMAR]` no que descreve a APPD. Decisão do dono: é
   melhor ter a página com aviso de revisão do que não ter página. Revisão da
   associação é passo obrigatório antes de ir ao ar no domínio deles.
2. Voluntário não tem cadastro próprio na V1 — só um assunto no contato. O cadastro de
   **pessoa com deficiência** existe e é central: `/cadastro` mais o formulário de
   atendimento.
3. `Entrar` fica fora do menu principal.
4. O regimento interno continua público (hoje está, em página órfã).
5. Conteúdo vencido (eventos de 2019 e 2024) não migra.
