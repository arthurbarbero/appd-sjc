# Spec: Formulário de Atendimento

- ID: SPEC-formulario-atendimento Deriva de: PROP-20260805-formulario-atendimento
- Status: rascunho (aguarda aprovação do dono)
- Dono do conteúdo: Arthur Barbero · Aprovador da spec: Arthur Barbero
- Versão: v1 Data: 2026-08-05
- Fonte da verdade dos campos: [`docs/campos-formulario.md`](../../../docs/campos-formulario.md)
- Desenho aprovado: [prompt do formulário](../../../docs/prompts-design/formulario.md)

> **Dado de exemplo.** Todo nome, telefone, endereço e data que aparecem nesta spec são
> **fictícios**, criados para o teste. A única exceção é o telefone da sede,
> `(12) 3346-0605`, que é número institucional publicado da própria APPD — não é
> telefone de pessoa física.

## Objetivo

Fazer o Cadastro de Atendimento 2026 gravar de verdade: persistir a inscrição no D1,
validar com o mesmo schema no cliente e no servidor, e devolver à pessoa um número de
protocolo com uma confirmação que diga o que acontece depois — sem nunca apagar o que
ela digitou.

## Decisões travadas (o que não se rediscute dentro desta change)

| #   | Decisão                                                       | Vira ADR |
| --- | ------------------------------------------------------------- | -------- |
| D1  | Os 15 campos são réplica fiel; duas exceções de forma         | não      |
| D2  | Schema Zod único; o servidor revalida e não confia no cliente | não      |
| D3  | Protocolo `ATD-<ano>-<5 dígitos>`, do `id` autoincrement      | ADR-007  |
| D4  | Múltipla escolha persistida como array JSON em coluna TEXT    | ADR-008  |
| D5  | Anti-abuso por limite horário com IP hasheado; sem CAPTCHA    | ADR-009  |
| D6  | Sem salvamento parcial na V1; aviso ao sair da página         | não      |
| D7  | Marcar "Outro" torna obrigatório o campo de especificação     | não      |
| D8  | Nenhum conteúdo de campo do formulário vai para log           | não      |

**As duas exceções de forma do D1**, já decididas e registradas em
`docs/campos-formulario.md`:

1. **Data de nascimento** — no formulário original é texto livre, o que produz data em
   cinco formatos diferentes. Aqui é campo com máscara `00/00/0000` e calendário como
   atalho. Digitar continua sendo o caminho principal. A pergunta é a mesma.
2. **Caixa alta e baixa** — os rótulos originais estão em CAIXA ALTA; na tela são
   renderizados em caixa alta e baixa ("Telefone para contato"), com as **mesmas
   palavras**. Caixa alta apaga o contorno da palavra e reduz a legibilidade justamente
   para quem este site precisa atender.

Nenhuma outra diferença é permitida: rótulo, ordem e obrigatoriedade dos 15 campos são
os do formulário oficial. Divergência encontrada vira item em `docs/pendencias-appd.md`,
não vira alteração unilateral.

## Requisitos

### Persistência

- **REQ-1** — O sistema DEVE persistir cada inscrição aceita em uma linha da tabela
  `inscricoes_atendimento` no D1, criada por schema Drizzle em
  `server/database/schema.ts` e aplicada por **migration versionada** em
  `drizzle/migrations` (gerada por `npm run db:generate`). Alteração de schema por
  `push` direto no banco é proibida.
- **REQ-2** — A tabela DEVE conter exatamente as colunas da seção "Modelo de dados",
  com os tipos, obrigatoriedades e limites ali definidos. Coluna nova exige migration
  nova.
- **REQ-3** — Toda marca de tempo persistida DEVE estar em UTC, formato ISO 8601
  (`aaaa-mm-ddThh:mm:ss.sssZ`). A exibição na tela é em `America/Sao_Paulo`.
- **REQ-4** — O sistema NÃO DEVE persistir endereço IP em texto claro. O controle de
  abuso usa HMAC-SHA-256 do IP com segredo lido de variável de ambiente
  (Cloudflare Secrets), e as linhas de controle são apagadas quando passam de 1 hora.

### Protocolo

- **REQ-5** — Toda inscrição aceita DEVE receber um protocolo no formato
  `ATD-<ano com 4 dígitos>-<sequencial com no mínimo 5 dígitos, preenchido com zeros>`,
  onde o ano é o do recebimento em `America/Sao_Paulo` e o sequencial é o `id`
  autoincrement da linha. Exemplo: `ATD-2026-00042`.
- **REQ-6** — O protocolo DEVE ser único, imutável e nunca reaproveitado, inclusive
  depois de exclusão de linha. O sequencial NÃO reinicia a cada ano (o ano no protocolo
  é informativo). Sequencial derivado de `MAX(...)+1` é proibido: gera colisão.
- **REQ-7** — O protocolo do atendimento NÃO DEVE usar o prefixo `APPD-`, reservado ao
  número de registro do associado (`shared/utils/registro.ts`, change
  `cracha-do-associado`).

### Validação espelhada

- **REQ-8** — DEVE existir **um único** schema Zod, em `shared/validacao/inscricao.ts`,
  exportando o esquema e o tipo inferido. Cliente e servidor importam esse mesmo módulo.
  Duplicar regra de validação em qualquer outro arquivo é defeito.
- **REQ-9** — O servidor DEVE revalidar o payload inteiro com esse schema antes de
  qualquer escrita, independentemente do que o cliente tenha validado.
- **REQ-10** — O schema DEVE ser estrito (`.strict()`): payload com campo desconhecido é
  recusado com 422, não ignorado em silêncio.
- **REQ-11** — O servidor DEVE ignorar qualquer valor derivado enviado pelo cliente
  (`id`, `protocolo`, `criado_em`, `possivel_duplicata`). Esses valores são sempre
  calculados no servidor.
- **REQ-12** — Campo de escolha (12, 13, 14, 4, 15) DEVE ser validado contra a lista
  exata de opções de `docs/campos-formulario.md`. Valor fora da lista é recusado com 422.
- **REQ-13** — As mensagens de erro DEVEM nascer do próprio schema, de modo que a
  mensagem que o cliente mostra e a que o servidor devolve sejam **idênticas** para a
  mesma violação.

### Regras de campo

- **REQ-14** — Data de nascimento: aceita `dd/mm/aaaa`; DEVE existir no calendário
  (31/02 é recusada), DEVE ser anterior ou igual à data de hoje em `America/Sao_Paulo` e
  o ano DEVE estar entre 1900 e o ano corrente. É persistida como `aaaa-mm-dd`.
- **REQ-15** — Telefone para contato: DEVE ter 10 dígitos (fixo com DDD) ou 11 dígitos
  (celular com DDD); o DDD DEVE estar entre 11 e 99. É persistido só com dígitos. O
  mesmo vale para "Contato do cuidador", que é opcional — se vazio, não valida; se
  preenchido, vale a regra inteira.
- **REQ-16** — A máscara NÃO DEVE bloquear a digitação: colar `12991657059`, colar
  `+55 12 99165-7059` e colar `(12) 3346-0605` produzem valor aceito; apagar um
  caractere no meio não embaralha o restante; número fixo de 8 dígitos com DDD é aceito.
  A máscara nunca recusa tecla em silêncio.
- **REQ-17** — Campos de múltipla escolha (12, 13, 14) DEVEM exigir pelo menos uma opção
  marcada, com mensagem específica por campo.
- **REQ-18** — Marcar `Outro` nos campos 12 e 13 DEVE revelar um campo de texto
  associado, e esse texto passa a ser **obrigatório**, com 2 a 100 caracteres (D7).
  Desmarcar `Outro` esconde o campo e descarta o valor.

### Contrato da rota

- **REQ-19** — DEVE existir a rota `POST /api/atendimento/inscricao`. Outro verbo
  responde 405. Payload maior que 16 KB responde 413.
- **REQ-20** — Resposta de sucesso: **201** com
  `{ "protocolo": "ATD-2026-00042", "recebidoEm": "<ISO UTC>" }`.
- **REQ-21** — Resposta de dado inválido: **422** com
  `{ "erros": { "<campo>": "<mensagem>" } }`, um par por campo com problema. O servidor
  NÃO DEVE devolver stack trace nem detalhe interno.
- **REQ-22** — Resposta de excesso: **429** com mensagem que oferece o telefone da sede
  como alternativa. Falha interna: **500** com mensagem genérica, sem detalhe técnico e
  com a mesma alternativa por telefone.

### Idempotência e duplicata

- **REQ-23** — O cliente DEVE gerar uma chave de idempotência (UUID v4) no carregamento
  do formulário e enviá-la em todo envio. A chave é UNIQUE na tabela.
- **REQ-24** — Envio repetido com a mesma chave DEVE devolver **200** com o protocolo já
  existente e NÃO DEVE criar segunda linha.
- **REQ-25** — Enquanto um envio está em andamento, o botão DEVE estar desabilitado, com
  o rótulo "Enviando…".
- **REQ-26** — Inscrição com mesmo nome normalizado (minúsculas, sem acento, espaços
  colapsados), mesma data de nascimento e mesmo telefone de outra inscrição das últimas
  24 horas DEVE ser gravada normalmente, com `possivel_duplicata = 1`. Duplicata
  suspeita **não bloqueia** a pessoa: quem triagem faz é gente, no painel (V1.1).

### Estados da tela

- **REQ-27** — A tela DEVE ter os quatro estados: vazio, erro, enviando e sucesso. Não
  há assistente de várias etapas: é página única com seções.
- **REQ-28** — **Erro nunca apaga resposta.** Depois de qualquer erro — de validação do
  cliente, 422 do servidor, 429, 500 ou falha de rede — todos os campos preenchidos
  DEVEM continuar com o valor que a pessoa digitou, incluindo escolhas marcadas e o
  texto do `Outro`. Recarregar a página no envio é proibido.
- **REQ-29** — O erro DEVE aparecer em dois lugares: resumo no topo, com `role="alert"`,
  `tabindex="-1"` e foco movido para ele, contendo a contagem ("Faltam 2 campos para
  enviar") e um link âncora por campo; e mensagem específica abaixo do campo, ligada por
  `aria-describedby`, com `aria-invalid="true"` no controle.
- **REQ-30** — A mensagem de erro DEVE dizer o que fazer, com exemplo quando o formato
  importa. "Campo inválido" é reprovação.
- **REQ-31** — O estado "enviando" DEVE avisar para não fechar a página e NÃO DEVE usar
  animação infinita; qualquer movimento respeita `prefers-reduced-motion`.
- **REQ-32** — A confirmação DEVE conter, nesta ordem: o protocolo em destaque; o que
  acontece agora (o cadastro entra na fila de vagas); **por qual canal** vem o contato
  (ligação para o telefone informado, exibido na tela); **em quanto tempo**; e o que
  fazer se o telefone mudar (ligar para a sede, `(12) 3346-0605`).
- **REQ-33** — O prazo do REQ-32 DEVE vir de uma constante única em
  `shared/conteudo.ts`. Enquanto a APPD não informar o prazo, a constante contém a frase
  honesta acordada — "As vagas são chamadas conforme abrem; a associação não trabalha
  com prazo fixo" — e a tela NÃO DEVE exibir nenhum prazo numérico. Inventar prazo é
  defeito bloqueante.

### Conteúdo obrigatório da tela

- **REQ-34** — O valor da contribuição solidária (`R$ 50,00`) DEVE aparecer **uma única
  vez** em toda a página, dentro do bloco do campo 15, ao lado do controle — nunca em
  modal, link, tooltip ou no topo da página.
- **REQ-35** — Ao lado do campo 15 DEVE estar visível que a contribuição é **sugerida e
  ajustável** conforme a situação de cada atendido e que, pelo regimento interno,
  **não dá prioridade nem exclusividade** no atendimento.
- **REQ-36** — Os quatro projetos (Bocha Paralímpica, Oficina Mão na Roda, Artesão da
  Inclusão, Informática Nota 10) NÃO são opções do campo 13. O texto de ajuda do campo
  13 DEVE orientar quem quer entrar num projeto a marcar `Outro` e escrever o nome.
  Transformá-los em opção depende de resposta da APPD
  (`docs/pendencias-appd.md`, item 1b) e exige nova versão desta spec.
- **REQ-37** — O bloco introdutório DEVE trazer as três regras de
  `REGRAS_ATENDIMENTO` (fila por vaga, sessões só de manhã, telefone atualizado) e NÃO
  DEVE mencionar contribuição nem valor.
- **REQ-38** — O aviso "Esta é uma demonstração local" DEVE ser removido quando a rota
  estiver ligada.

### Consentimento (fronteira com outra change)

- **REQ-39** — A linha gravada DEVE conter `consentimento_saude` (aceito, sempre 1),
  `consentimento_termo`, `consentimento_versao`, `consentimento_hash` (hash do texto
  exibido) e `consentimento_em` (ISO UTC). Sem os cinco, a escrita é recusada. O
  vocabulário é o de `consentimento-e-privacidade`: `termo_id` = `deficiencia-art11`,
  `versao` = string monotônica (`v1`, `v2`, …).
- **REQ-40** — Os valores de `consentimento_termo`, `consentimento_versao` e
  `consentimento_hash` DEVEM vir do módulo de termos exportado pela change
  `consentimento-e-privacidade` — esta change **não define, não versiona e não escreve**
  texto de termo. Enquanto aquela change não existir, esta **não é publicada**, nem em
  `*.workers.dev` com dado real. Rodar em local com dado fictício é permitido.
- **REQ-41** — Payload com consentimento ausente ou falso DEVE ser recusado com 422 e
  nenhuma escrita, mesmo que todos os outros campos estejam válidos.
- **REQ-42** — **Fronteira aberta, com dono nomeado.** A tabela `consentimentos` de
  `consentimento-e-privacidade` tem `usuario_id TEXT NOT NULL`, e o formulário é
  preenchido **sem conta** na V1. Enquanto essa incompatibilidade não for resolvida, o
  registro do aceite feito no formulário mora nas colunas da própria inscrição
  (REQ-39), que é o registro atômico daquele envio. A decisão de unificar — tornar
  `usuario_id` opcional com `protocolo` ao lado, ou manter os dois registros — é de
  Arthur Barbero, com as duas changes na mesa, e vira ADR. Nenhuma das duas specs pode
  decidir sozinha.

### Status da inscrição (contrato consumido por outras changes)

- **REQ-43** — A linha DEVE ter a coluna `status`, com vocabulário fechado e exatamente
  estes três valores: `Na fila`, `Em atendimento`, `Encerrada`. É este o vocabulário que
  `area-do-associado` (REQ-9) e `painel-admin` consomem; mudar valor aqui quebra as duas.
- **REQ-44** — Toda inscrição aceita DEVE nascer com `status = "Na fila"`.
- **REQ-45** — Nenhuma rota desta change DEVE aceitar alteração de `status`. Quem muda
  status é o painel administrativo (V1.1); a pessoa nunca muda, nem por payload.

### Acessibilidade (bloqueante, WCAG 2.2 AA)

- **REQ-46** — Cada grupo de rádio e de caixas de seleção DEVE estar em `fieldset` com
  `legend` igual ao rótulo do campo oficial.
- **REQ-47** — Todo alvo de toque (opção, botão, botão do calendário) DEVE ter no mínimo
  44 × 44 px de área clicável, incluindo o rótulo, com folga entre opções.
- **REQ-48** — A ordem de foco DEVE ser igual à ordem visual, e todo o formulário DEVE
  ser operável só por teclado, incluindo abrir e fechar o calendário e sair dele sem
  armadilha de foco.
- **REQ-49** — Nada DEVE ser sinalizado só por cor: erro tem ícone e texto.
- **REQ-50** — Campo obrigatório DEVE ser marcado pelo asterisco **e** pela palavra
  "obrigatório" no texto de ajuda.
- **REQ-51** — A tela DEVE passar em `axe` sem violação de nível A ou AA, nos quatro
  estados, em 360 px e em 1280 px.
- **REQ-52** — Em 360 px NÃO DEVE haver par de campos lado a lado.

### Registro e privacidade operacional

- **REQ-53** — Nenhum conteúdo de campo do formulário DEVE ir para log — nem nome, nem
  telefone, nem endereço, nem deficiência. O log de um envio contém, no máximo,
  protocolo, resultado (aceito/recusado), lista de **nomes de campo** com erro e
  duração.
- **REQ-54** — Nenhum dado de pessoa real DEVE entrar em teste, seed ou fixture; dado
  fictício é obrigatório e identificado como tal.

## Comportamento esperado

**Caminho feliz.** A pessoa abre a página; o cliente gera a chave de idempotência.
Preenche, envia. O cliente valida; passando, desabilita o botão, mostra "Enviando…" e
faz `POST`. O servidor revalida com o mesmo schema, checa o limite horário, grava a
linha, calcula o protocolo a partir do `id`, marca duplicata suspeita se for o caso e
responde 201. A tela troca para a confirmação com o protocolo.

**Alternativos e bordas.**

- Erro só no cliente: nada é enviado; erros aparecem, foco vai para o resumo, respostas
  ficam.
- Erro só no servidor (cliente contornado ou versão antiga em cache): 422, mesmos
  campos e mensagens, respostas ficam.
- Chave de idempotência repetida: 200 com o protocolo original, nenhuma linha nova.
- Limite horário estourado: 429 com o telefone da sede, respostas ficam.
- Falha do D1 ou exceção: 500 genérico, nenhuma linha parcial, respostas ficam.
- Falha de rede (`fetch` rejeitado): mensagem de "não conseguimos enviar agora, tente de
  novo", respostas ficam, mesma chave é reusada na retentativa.
- Pessoa tenta sair com formulário preenchido e não enviado: aviso nativo do navegador
  (D6). Depois do sucesso, o aviso é desligado.

## Modelo de dados

Tabela `inscricoes_atendimento` (D1/SQLite; nome de coluna em `snake_case`).

| Coluna                 | Tipo | Obrig. | Regra                              |
| ---------------------- | ---- | ------ | ---------------------------------- |
| `id`                   | INT  | sim    | PK autoincrement                   |
| `protocolo`            | TEXT | sim    | UNIQUE, `ATD-<ano>-<5+ dígitos>`   |
| `chave_idempotencia`   | TEXT | sim    | UNIQUE, UUID v4                    |
| `nome`                 | TEXT | sim    | 2 a 120 caracteres (campo 1)       |
| `nascimento`           | TEXT | sim    | `aaaa-mm-dd` (campo 2)             |
| `telefone`             | TEXT | sim    | 10 ou 11 dígitos (campo 3)         |
| `telefone_whatsapp`    | TEXT | sim    | `Sim` \| `Não` (campo 4)           |
| `endereco`             | TEXT | sim    | 3 a 300 caracteres (campo 5)       |
| `numero`               | TEXT | sim    | 1 a 20 caracteres (campo 6)        |
| `complemento`          | TEXT | não    | até 60 caracteres (campo 7)        |
| `bairro`               | TEXT | sim    | 2 a 80 caracteres (campo 8)        |
| `municipio`            | TEXT | sim    | 2 a 80 caracteres (campo 9)        |
| `cuidador_nome`        | TEXT | não    | até 120 caracteres (campo 10)      |
| `cuidador_contato`     | TEXT | não    | vazio ou 10/11 dígitos (campo 11)  |
| `deficiencias`         | TEXT | sim    | JSON, ≥1 item da lista (campo 12)  |
| `deficiencia_outro`    | TEXT | não    | 2 a 100 se `Outro` marcado         |
| `atendimentos`         | TEXT | sim    | JSON, ≥1 item da lista (campo 13)  |
| `atendimento_outro`    | TEXT | não    | 2 a 100 se `Outro` marcado         |
| `dias`                 | TEXT | sim    | JSON, ≥1 item da lista (campo 14)  |
| `ciencia_contribuicao` | TEXT | sim    | `Ciente` (campo 15)                |
| `consentimento_saude`  | INT  | sim    | sempre 1                           |
| `consentimento_termo`  | TEXT | sim    | `deficiencia-art11`                |
| `consentimento_versao` | TEXT | sim    | versão do termo (`v1`, `v2`, …)    |
| `consentimento_hash`   | TEXT | sim    | hash do texto exibido              |
| `consentimento_em`     | TEXT | sim    | ISO UTC                            |
| `status`               | TEXT | sim    | vocabulário do REQ-43, inicia fila |
| `possivel_duplicata`   | INT  | sim    | 0 ou 1, padrão 0                   |
| `criado_em`            | TEXT | sim    | ISO UTC                            |

Tabela auxiliar `envios_recentes`: `id` (PK), `ip_hash` (TEXT, HMAC-SHA-256),
`criado_em` (TEXT ISO UTC). Índice em (`ip_hash`, `criado_em`). Linhas com mais de 1
hora são apagadas a cada escrita. Limite: **10 envios por hash por hora**, escolhido
para não travar quem preenche pela associação para várias pessoas na mesma rede.

## Fora de escopo

Igual ao da proposal, repetido aqui porque é contrato: consentimento do Art. 11 em si;
conta de usuário e vínculo `usuario_id`; painel de leitura das inscrições; salvamento
parcial; consulta, edição e cancelamento pela pessoa; e-mail ou WhatsApp de
confirmação; alteração de qualquer um dos 15 campos; inclusão dos quatro projetos no
campo 13.

## Premissas e dependências

- ADR-001 (Workers + D1 + Drizzle) vale; nada aqui exige serviço com cartão.
- Zod 4 e Drizzle já estão no `package.json`; nenhuma dependência nova é necessária.
- `consentimento-e-privacidade` precisa entregar a constante de versão do termo e a
  página de política — **dependência dura**, ver REQ-40.
- `cracha-do-associado` é dona do formato `APPD-<ano>-<sequencial>`; ver REQ-7.
- `cadastro-e-login` destrava salvamento parcial e `usuario_id` — fora desta change.
- `painel-admin` (V1.1) é quem lê o que esta change grava; o risco R1 da proposal
  continua aberto até a APPD dizer quem recebe enquanto o painel não existe.
- Segredo do HMAC vem de Cloudflare Secrets / `.dev.vars`; nunca versionado.

## Critério de aceite (Gherkin)

Todo dado abaixo é **fictício**.

```gherkin
Funcionalidade: Envio da inscrição de atendimento
  Cobre REQ-1, REQ-5, REQ-19, REQ-20, REQ-39, REQ-43 a REQ-45 da
  SPEC-formulario-atendimento

  Contexto:
    Dado que o banco local está migrado e vazio
    E que a versão vigente do termo do Art. 11 é "v1"

  Cenário: Envio válido grava a inscrição e devolve protocolo
    Dado que preenchi os 15 campos com dados fictícios válidos
      | campo      | valor                        |
      | Nome       | Maria Fictícia da Silva      |
      | Nascimento | 12/03/1978                   |
      | Telefone   | (12) 90000-0001              |
      | WhatsApp   | Sim                          |
      | Endereço   | Rua de Teste                 |
      | Número     | s/n                          |
      | Bairro     | Bairro Fictício              |
      | Município  | São José dos Campos          |
      | Deficiência| Física                       |
      | Atendimento| Fisioterapia                 |
      | Dias       | Segundas                     |
      | Ciência    | Ciente                       |
    E que marquei a autorização de tratamento do dado de saúde
    Quando envio o formulário
    Então a resposta é 201 com um protocolo no formato "ATD-2026-#####"
    E existe exatamente 1 linha em "inscricoes_atendimento"
    E essa linha tem "consentimento_termo" igual a "deficiencia-art11",
      "consentimento_versao" igual a "v1", o hash do texto exibido e
      "consentimento_em" em UTC
    E a tela mostra a confirmação com o protocolo em destaque

  Cenário: Inscrição nasce "Na fila" e o status não é alterável pelo cliente
    Quando envio uma inscrição válida
    Então a coluna "status" da linha gravada é "Na fila"
    E um payload que traga "status": "Em atendimento" recebe 422
    E nenhuma rota desta change aceita alteração de status

  Cenário: Protocolo é único e não reaproveita sequencial
    Dado que já existem 2 inscrições, a última com protocolo "ATD-2026-00002"
    E que a inscrição "ATD-2026-00002" foi apagada do banco
    Quando envio uma nova inscrição válida
    Então o protocolo devolvido é "ATD-2026-00003"
    E nenhum protocolo existente foi alterado

  Cenário: Protocolo não usa o prefixo do crachá
    Quando envio uma inscrição válida
    Então o protocolo NÃO começa com "APPD-"
```

```gherkin
Funcionalidade: Erro nunca apaga resposta
  Cobre REQ-28, REQ-29, REQ-30 da SPEC-formulario-atendimento

  Cenário: Campo obrigatório vazio bloqueia e preserva as demais respostas
    Dado que preenchi os 14 primeiros campos com dados fictícios válidos
    E que deixei "Melhores dias" sem nenhuma opção marcada
    Quando clico em "Enviar meu cadastro"
    Então nenhuma requisição é enviada ao servidor
    E o resumo no topo diz "Falta 1 campo para enviar" e tem role="alert"
    E o foco está no resumo
    E o campo "Melhores dias" mostra "Marque pelo menos um dia."
    E os 14 campos anteriores continuam com exatamente os valores que digitei
    E a caixa de autorização do dado de saúde continua marcada

  Cenário: Erro devolvido pelo servidor também preserva as respostas
    Dado que preenchi os 15 campos com dados fictícios válidos
    E que o servidor responde 422 com erro no campo "telefone"
    Quando envio o formulário
    Então a página NÃO é recarregada
    E todos os 15 campos continuam preenchidos
    E o erro do telefone aparece abaixo do campo, com ícone e texto

  Cenário: Falha de rede preserva as respostas e permite tentar de novo
    Dado que preenchi os 15 campos com dados fictícios válidos
    E que a requisição falha por rede indisponível
    Quando envio o formulário
    Então vejo uma mensagem dizendo que não foi possível enviar agora
    E todos os campos continuam preenchidos
    E o botão volta a ficar habilitado
    E a nova tentativa usa a mesma chave de idempotência

  Cenário: Aviso ao sair com formulário preenchido e não enviado
    Dado que preenchi ao menos um campo
    Quando tento fechar a aba ou navegar para outra página
    Então o navegador pede confirmação antes de sair
    E depois de um envio bem-sucedido esse aviso não aparece mais
```

```gherkin
Funcionalidade: Data de nascimento
  Cobre REQ-14 da SPEC-formulario-atendimento

  Cenário: Data que não existe no calendário é recusada com mensagem explicativa
    Dado que digitei "31/02/1990" em "Data de nascimento"
    Quando envio o formulário
    Então o campo mostra "Esta data não existe. Confira o dia de fevereiro."
    E o envio é bloqueado
    E as demais respostas continuam preenchidas

  Esquema do Cenário: Datas recusadas com a mensagem certa
    Dado que digitei "<entrada>" em "Data de nascimento"
    Quando envio o formulário
    Então o campo mostra "<mensagem>"

    Exemplos:
      | entrada    | mensagem                                                  |
      | 12/13/1978 | A data precisa ter dia, mês e ano. Exemplo: 12/03/1978.   |
      | 12/03      | A data precisa ter dia, mês e ano. Exemplo: 12/03/1978.   |
      | 01/01/2099 | A data de nascimento não pode estar no futuro.            |
      | 05/07/1850 | Confira o ano: aceitamos de 1900 até hoje.                |

  Cenário: Data válida é persistida em formato ISO
    Dado que digitei "12/03/1978" em "Data de nascimento"
    Quando envio uma inscrição válida
    Então a coluna "nascimento" guarda "1978-03-12"
```

```gherkin
Funcionalidade: Telefone e máscara não bloqueante
  Cobre REQ-15, REQ-16 da SPEC-formulario-atendimento

  Cenário: Telefone sem DDD é recusado com exemplo
    Dado que digitei "991650001" em "Telefone para contato"
    Quando envio o formulário
    Então o campo mostra "O telefone precisa ter DDD. Exemplo: (12) 99165-7059."
    E o envio é bloqueado
    E as demais respostas continuam preenchidas

  Cenário: Telefone fixo de 8 dígitos com DDD é aceito
    Dado que digitei "1233460605" em "Telefone para contato"
    Quando envio uma inscrição válida
    Então a resposta é 201
    E a coluna "telefone" guarda "1233460605"

  Esquema do Cenário: Colar número em formatos diferentes funciona
    Dado que colei "<colado>" em "Telefone para contato"
    Então o campo exibe "<exibido>"
    E o valor enviado ao servidor é "<enviado>"

    Exemplos:
      | colado             | exibido           | enviado     |
      | 12900000001        | (12) 90000-0001   | 12900000001 |
      | +55 12 90000-0001  | (12) 90000-0001   | 12900000001 |
      | (12) 3346-0605     | (12) 3346-0605    | 1233460605  |

  Cenário: Apagar um caractere no meio não embaralha o resto
    Dado que o campo "Telefone para contato" contém "(12) 90000-0001"
    Quando apago o dígito na quinta posição visível
    Então o campo contém "(12) 9000-0001"
    E o cursor continua na posição correspondente ao caractere apagado
    E nenhuma tecla foi recusada em silêncio
```

```gherkin
Funcionalidade: Campos de múltipla escolha e "Outro"
  Cobre REQ-17, REQ-18, REQ-36 da SPEC-formulario-atendimento

  Cenário: Múltipla escolha exige pelo menos uma opção
    Dado que não marquei nenhuma opção em "Possui alguma deficiência"
    Quando envio o formulário
    Então o campo mostra "Marque pelo menos uma opção."
    E o envio é bloqueado

  Cenário: Marcar "Outro" abre o campo de texto e o torna obrigatório
    Dado que estou no campo "Tipo de Atendimento"
    Quando marco a opção "Outro"
    Então aparece um campo de texto rotulado "Qual?" associado ao grupo
    E o foco pode alcançá-lo pela ordem natural de tabulação
    Quando envio o formulário com esse texto vazio
    Então o campo mostra "Escreva qual atendimento você procura."
    E o envio é bloqueado

  Cenário: Desmarcar "Outro" esconde o campo e descarta o texto
    Dado que marquei "Outro" e escrevi "Bocha Paralímpica"
    Quando desmarco "Outro"
    Então o campo de texto desaparece
    E o valor enviado ao servidor não contém "atendimentoOutro"

  Cenário: Projeto é pedido por "Outro", porque não é opção do campo 13
    Quando abro o campo "Tipo de Atendimento"
    Então as opções são exatamente Empréstimo Equipamentos, Fisioterapia,
      Orientações Gerais, Psicologia, Serviço Social e Outro
    E o texto de ajuda diz para marcar "Outro" e escrever o nome do projeto
      quando a pessoa quer Bocha, Mão na Roda, Artesão ou Informática
```

```gherkin
Funcionalidade: Envio duplicado
  Cobre REQ-23, REQ-24, REQ-25, REQ-26 da SPEC-formulario-atendimento

  Cenário: Clique duplo no botão não cria duas inscrições
    Dado que preenchi os 15 campos com dados fictícios válidos
    Quando clico em "Enviar meu cadastro" duas vezes em menos de 1 segundo
    Então o botão fica desabilitado com o rótulo "Enviando…" após o primeiro clique
    E existe exatamente 1 linha em "inscricoes_atendimento"

  Cenário: Reenvio com a mesma chave devolve o mesmo protocolo
    Dado que enviei uma inscrição válida e recebi "ATD-2026-00001"
    Quando envio outra vez o mesmo payload, com a mesma chave de idempotência
    Então a resposta é 200 com o protocolo "ATD-2026-00001"
    E continua existindo exatamente 1 linha em "inscricoes_atendimento"

  Cenário: Duplicata suspeita é gravada e sinalizada, nunca bloqueada
    Dado que existe uma inscrição de "Maria Fictícia da Silva", 12/03/1978,
      telefone "12900000001", criada há 2 horas
    Quando chega outra inscrição com esses mesmos três dados e chave nova
    Então a resposta é 201
    E a nova linha tem "possivel_duplicata" igual a 1
    E a pessoa não vê nenhum bloqueio nem aviso de duplicidade
```

```gherkin
Funcionalidade: O servidor não confia no cliente
  Cobre REQ-9, REQ-10, REQ-11, REQ-12, REQ-21, REQ-41 da SPEC-formulario-atendimento

  Cenário: Payload adulterado que passou pelo cliente é recusado
    Dado um payload montado fora do navegador, com telefone "123"
    E com "atendimentos" igual a ["Cirurgia"], que não está na lista oficial
    Quando faço POST em "/api/atendimento/inscricao"
    Então a resposta é 422
    E o corpo é {"erros": {"telefone": "...", "atendimentos": "..."}}
    E nenhuma linha foi gravada

  Cenário: Campo desconhecido é recusado, não ignorado
    Dado um payload válido acrescido do campo "prioridade": true
    Quando faço POST em "/api/atendimento/inscricao"
    Então a resposta é 422
    E nenhuma linha foi gravada

  Cenário: Valor derivado enviado pelo cliente é ignorado
    Dado um payload válido que também traz "protocolo": "ATD-2026-99999"
      e "possivelDuplicata": 0
    Quando faço POST em "/api/atendimento/inscricao"
    Então a resposta é 422 por campo desconhecido
    E, se o schema aceitasse, o protocolo gravado seria o calculado no servidor

  Cenário: Sem consentimento do Art. 11 não há escrita
    Dado um payload com os 15 campos válidos e "consentimentoSaude": false
    Quando faço POST em "/api/atendimento/inscricao"
    Então a resposta é 422 com erro no campo do consentimento
    E nenhuma linha foi gravada

  Cenário: Verbo errado e payload gigante
    Quando faço GET em "/api/atendimento/inscricao"
    Então a resposta é 405
    Quando faço POST com corpo de 32 KB
    Então a resposta é 413
    E nenhuma linha foi gravada

  Cenário: Mesma mensagem no cliente e no servidor
    Dado que o telefone "991650001" é recusado pelo cliente com uma mensagem
    Quando o mesmo valor é enviado direto ao servidor
    Então a mensagem do campo "telefone" na resposta 422 é idêntica, caractere a
      caractere, à que o cliente exibiu
```

```gherkin
Funcionalidade: Limite de envios e falhas de infraestrutura
  Cobre REQ-4, REQ-22, REQ-53 da SPEC-formulario-atendimento

  Cenário: Décimo primeiro envio na mesma hora recebe 429 com alternativa
    Dado que 10 envios válidos partiram do mesmo IP na última hora
    Quando chega o décimo primeiro envio
    Então a resposta é 429
    E a mensagem oferece ligar para (12) 3346-0605
    E as respostas continuam preenchidas na tela

  Cenário: IP nunca é gravado em texto claro
    Dado que um envio partiu do IP fictício "203.0.113.7"
    Quando consulto a tabela "envios_recentes"
    Então nenhuma coluna contém "203.0.113.7"
    E "ip_hash" tem 64 caracteres hexadecimais

  Cenário: Falha do banco responde 500 sem detalhe técnico e sem linha parcial
    Dado que o D1 falha na escrita
    Quando envio uma inscrição válida
    Então a resposta é 500 com mensagem genérica e o telefone da sede
    E o corpo não contém stack trace, nome de tabela nem SQL
    E nenhuma linha foi gravada

  Cenário: Log não registra conteúdo de campo
    Quando um envio é recusado por telefone inválido
    Então o log contém o nome do campo "telefone" e o resultado "recusado"
    E o log NÃO contém o valor digitado, o nome da pessoa, o endereço
      nem qualquer opção de deficiência
```

```gherkin
Funcionalidade: Confirmação e conteúdo obrigatório da tela
  Cobre REQ-32, REQ-33, REQ-34, REQ-35, REQ-37, REQ-38 da SPEC-formulario-atendimento

  Cenário: A confirmação diz o que acontece, por qual canal e em quanto tempo
    Dado que enviei uma inscrição válida com telefone "(12) 90000-0001"
    Quando a confirmação aparece
    Então vejo o protocolo em destaque
    E vejo que o cadastro entrou na fila de vagas
    E vejo que o contato vem por ligação para "(12) 90000-0001"
    E vejo o prazo exatamente como está na constante de conteúdo
    E vejo o que fazer se o telefone mudar, com o número (12) 3346-0605

  Cenário: Nenhum prazo é inventado
    Dado que a APPD ainda não informou prazo de retorno
    Quando a confirmação aparece
    Então o texto do prazo é o da constante acordada
    E a tela não exibe nenhuma quantidade de dias, semanas ou meses

  Cenário: O valor da contribuição aparece uma vez só
    Quando abro o formulário no estado vazio
    Então a expressão "R$ 50" aparece exatamente 1 vez em toda a página
    E essa ocorrência está dentro do bloco do campo "Ciência da Contribuição
      Solidária"
    E ao lado do controle está escrito que o valor é sugerido e ajustável
    E ao lado do controle está escrito que a contribuição não dá prioridade
      nem exclusividade no atendimento
    E o bloco introdutório do topo não menciona contribuição nem valor

  Cenário: O aviso de demonstração sai do ar quando a rota existe
    Quando abro o formulário com a rota ligada
    Então não existe na página o aviso "Esta é uma demonstração local"
```

```gherkin
Funcionalidade: Acessibilidade do formulário
  Cobre REQ-29, REQ-46 a REQ-52 da SPEC-formulario-atendimento

  Cenário: Grupos de escolha usam fieldset e legend com o rótulo oficial
    Quando inspeciono os campos 4, 12, 13, 14 e 15
    Então cada um está dentro de um "fieldset"
    E o "legend" contém exatamente as palavras do rótulo oficial, em caixa alta
      e baixa
    E o grupo do campo 14 mostra que as sessões são somente no período da manhã

  Cenário: Mensagem de erro é ligada ao campo por aria-describedby
    Dado que o campo "Bairro" está com erro
    Quando inspeciono o controle
    Então ele tem aria-invalid="true"
    E o aria-describedby aponta para o id do elemento com a mensagem de erro
    E o leitor de tela anuncia rótulo, ajuda e erro ao focar o campo

  Cenário: O resumo de erros tem role="alert" e recebe o foco
    Dado que envio o formulário com 2 campos inválidos
    Quando os erros aparecem
    Então existe um elemento com role="alert" e tabindex="-1" no topo do
      formulário
    E o foco do documento está nesse elemento
    E ele lista 2 links, um por campo, e cada link leva o foco ao campo
      correspondente

  Cenário: Alvo de toque de 44px com rótulo clicável
    Quando meço a área clicável de cada opção de rádio e caixa de seleção
    Então nenhuma tem largura ou altura menor que 44 px
    E clicar no texto do rótulo alterna a opção
    E há folga vertical entre opções vizinhas

  Cenário: Ordem de foco igual à ordem visual, do topo ao botão
    Quando percorro o formulário só com Tab, do início ao fim
    Então a sequência de foco segue a ordem visual dos 15 campos
    E o foco é sempre visível
    E o calendário abre pelo teclado, fecha com Esc e devolve o foco ao campo
      de data

  Cenário: Nada é sinalizado só por cor
    Dado que 2 campos estão com erro
    Quando simulo visão sem percepção de cor
    Então cada campo com erro continua identificável por ícone e por texto

  Cenário: Sem violação de acessibilidade automatizável
    Quando rodo axe nos estados vazio, erro, enviando e sucesso, em 360 px e
      1280 px
    Então não há violação de nível A nem AA
    E em 360 px nenhum par de campos está lado a lado
```

## Rastreabilidade

| Requisito      | Cenários de aceite                              | Onde vive o teste             |
| -------------- | ----------------------------------------------- | ----------------------------- |
| REQ-1 a REQ-7  | Envio da inscrição (4 cenários)                 | integração da rota + migração |
| REQ-8 a REQ-13 | Servidor não confia no cliente (6 cenários)     | unitário do schema + rota     |
| REQ-14         | Data de nascimento (3 cenários, 4 exemplos)     | unitário do schema + tela     |
| REQ-15, 16     | Telefone e máscara (4 cenários, 3 exemplos)     | unitário + componente         |
| REQ-17, 18     | Múltipla escolha e "Outro" (4 cenários)         | unitário + componente         |
| REQ-19 a 22    | Contrato da rota + limites (4 cenários)         | integração da rota            |
| REQ-23 a 26    | Envio duplicado (3 cenários)                    | integração da rota            |
| REQ-27 a 31    | Erro nunca apaga resposta (4 cenários)          | componente                    |
| REQ-32 a 38    | Confirmação e conteúdo (4 cenários)             | componente + teste de texto   |
| REQ-39 a 41    | Consentimento (2 cenários) + gate de publicação | integração da rota            |
| REQ-42         | fronteira aberta — sem cenário, exige decisão   | ADR (dono nomeado)            |
| REQ-43 a 45    | Status inicial e não alterável (1 cenário)      | integração da rota            |
| REQ-46 a 52    | Acessibilidade (7 cenários)                     | axe + teclado                 |
| REQ-53, 54     | Log e dado fictício (2 cenários)                | integração + revisão          |

## Veredito do gate (Definition of Ready)

- Spec aprovada: **pendente** — falta a assinatura do dono nas decisões D3, D4 e D5
  (ADR-007, ADR-008, ADR-009).
- Priorizada: **pendente** — prioridade é do coordenador, não desta spec.
- Critério de aceite testável: **sim** — 43 cenários Gherkin, cobrindo caminho feliz,
  bordas, falha de infraestrutura, adulteração e acessibilidade.

Bloqueios conhecidos, cada um com dono:

- `[dependência]` REQ-40: publicação travada até `consentimento-e-privacidade` entregar
  termo, versão e hash. Dono: Arthur Barbero.
- `[contradição entre changes]` REQ-42: `consentimentos.usuario_id` é NOT NULL na spec
  de `consentimento-e-privacidade`, e este formulário é preenchido sem conta. As duas
  specs não podem fechar assim. Dono: Arthur Barbero, com as duas na mesa; vira ADR.
- `[escopo]` Risco R1 da proposal: ninguém lê as inscrições até `painel-admin` (V1.1).
  Dono: APPD-SJC — pergunta objetiva já registrada.
- `[conteúdo]` REQ-33: prazo de retorno depende de resposta da APPD. Dono: APPD-SJC.
  Sem resposta, vale a frase honesta — isso não trava a implementação.
- `[decisão]` D3 muda o prefixo mostrado na confirmação (`APPD-` → `ATD-`) em relação
  ao mock de design. Dono: Arthur Barbero.
