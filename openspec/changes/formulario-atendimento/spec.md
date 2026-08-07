# Spec: Formulário de Atendimento

- ID: SPEC-formulario-atendimento Deriva de: PROP-20260805-formulario-atendimento
- Status: rascunho (aguarda aprovação do dono)
- Dono do conteúdo: Arthur Barbero · Aprovador da spec: Arthur Barbero
- Versão: v2 Data: 2026-08-06
- Fonte da verdade dos campos: [`docs/campos-formulario.md`](../../../docs/campos-formulario.md)
- **Fonte da verdade das tabelas**: [`modelo-de-dados`](../modelo-de-dados/spec.md) —
  esta change não cria coluna nenhuma
- Desenho aprovado: [prompt do formulário](../../../docs/prompts-design/formulario.md)

> **v2.1 (2026-08-06)** — foto opcional de volta ao formulário, por decisão do dono, com o
> componente e o limite únicos de `cracha-do-associado` (REQ-7d a REQ-7f).
>
> **v2 (2026-08-06)** — reescrita contra o contrato de dados, depois do gate. Mudou:
> o formulário passa a criar a conta ([ADR-012](../../../docs/adr/adr-012-cadastro-embutido-no-formulario.md)),
> saem o protocolo `ATD-`, a coluna `possivel_duplicata` e as colunas duplicadas de
> consentimento; o status passa a ter um valor só e a confirmação deixa de prometer
> fila ([ADR-014](../../../docs/adr/adr-014-inscricao-como-registro-de-interesse.md)).

> **Dado de exemplo.** Todo nome, telefone, endereço e data que aparecem nesta spec são
> **fictícios**, criados para o teste. A única exceção é o telefone da sede,
> `(12) 3346-0605`, que é número institucional publicado da própria APPD — não é
> telefone de pessoa física.

## Objetivo

Fazer o Cadastro de Atendimento 2026 gravar de verdade: criar a conta da pessoa,
persistir seus interesses no D1, validar com o mesmo schema no cliente e no servidor, e
devolver uma confirmação que diga exatamente o que acontece depois — sem nunca apagar o
que ela digitou.

O que a pessoa ganha em relação ao Google Forms de hoje: **ela volta e edita o próprio
cadastro**. Por isso o formulário cria conta; sem conta, o cadastro seria de novo uma
linha de planilha que ela nunca mais alcança.

## Decisões travadas (o que não se rediscute dentro desta change)

| #   | Decisão                                                        | Vira ADR |
| --- | -------------------------------------------------------------- | -------- |
| D1  | Os 15 campos são réplica fiel; duas exceções de forma          | não      |
| D2  | Schema Zod único; o servidor revalida e não confia no cliente  | não      |
| D3  | ~~Protocolo `ATD-`~~ — **revogado**: o formulário cria a conta | ADR-012  |
| D4  | Múltipla escolha persistida como array JSON em coluna TEXT     | ADR-008  |
| D5  | Anti-abuso por limite horário com IP hasheado; sem CAPTCHA     | ADR-009  |
| D6  | Sem salvamento parcial na V1; aviso ao sair da página          | não      |
| D7  | Marcar "Outro" torna obrigatório o campo de especificação      | não      |
| D8  | Nenhum conteúdo de campo do formulário vai para log            | não      |
| D9  | 3 campos acrescentados aos 15: e-mail, CPF e senha             | ADR-012  |
| D10 | Um status só: `Interesse registrado`. Não há fila nem vaga     | ADR-014  |
| D11 | Foto opcional no formulário, com o componente do crachá        | ADR-013  |

**Sobre o D3** — o protocolo `ATD-<ano>-<sequencial>` existia para ancorar o aceite do
termo de quem preenchesse sem conta. Com o D9, toda inscrição pertence a um usuário e o
`numero_registro` já identifica a pessoa: o protocolo ficou sem função e foi removido do
modelo. ADR-007 foi liberado.

**Sobre o D9** — são **acréscimo**, não alteração: nenhum dos 15 rótulos originais muda,
some ou troca de obrigatoriedade. O D1 continua valendo integralmente. A pergunta pelo
CPF está em `docs/pendencias-appd.md` (item 4b) para a associação confirmar.

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

- **REQ-1** — Um envio aceito DEVE gravar, **numa única transação**: uma linha em
  `usuarios` (campos 1 a 11 mais e-mail, CPF e senha), uma linha em
  `inscricoes_atendimento` (campos 12 a 15) e uma linha em `consentimentos` (o aceite do
  Art. 11). Falha em qualquer uma DEVE desfazer as três — nunca fica conta sem
  inscrição, nem inscrição sem aceite.
- **REQ-2** — As colunas, tipos, limites e restrições são os da spec
  [`modelo-de-dados`](../modelo-de-dados/spec.md). **Esta change não cria, não renomeia e
  não remove coluna.** Necessidade de coluna nova volta para lá antes de virar código.
- **REQ-3** — Toda marca de tempo persistida DEVE estar em UTC, ISO-8601 com sufixo `Z`
  (`modelo-de-dados` REQ-3). A exibição na tela é em `America/Sao_Paulo`.
- **REQ-4** — O sistema NÃO DEVE persistir endereço IP em texto claro; vale a regra única
  do projeto (`modelo-de-dados` REQ-30): HMAC-SHA-256 do IP com segredo de Cloudflare
  Secrets, linhas apagadas depois de 1 hora, limite de 10 envios por hash por hora.

### Cadastro embutido (campos 16, 17 e 18)

- **REQ-5** — O formulário DEVE pedir **e-mail**, **CPF** e **senha**, depois dos 15
  campos originais e antes do bloco de consentimento. São perguntas novas (D9), e o
  bloco DEVE explicar por que existem: "para você entrar depois e corrigir seu
  cadastro".
- **REQ-6** — O e-mail DEVE ser normalizado (`trim` + minúsculas) antes de gravar e de
  comparar. E-mail já cadastrado DEVE ser recusado com 422 e mensagem que ofereça o
  caminho de entrar na conta existente.
- **REQ-7** — O CPF DEVE ser validado pelos dígitos verificadores, não só pelo
  comprimento, e persistido só com dígitos. CPF já cadastrado DEVE ser recusado com 422 e
  mensagem que diga que essa pessoa já tem cadastro.
- **REQ-7a** — A regra da senha é a do `cadastro-e-login` **REQ-9**, que é a dona: sem
  exigência de símbolo, maiúscula ou dígito, sem recusar espaços, e com o comprimento
  mínimo definido lá. Esta change **não repete o número** — importa a regra do mesmo
  schema Zod. O hash também é de lá (scrypt, ADR-002 e ADR-005).
- **REQ-7b** — Nenhuma confirmação por e-mail bloqueia o envio. A pessoa termina o
  cadastro e já está dentro; verificação de e-mail, se um dia existir, é posterior e não
  condiciona o atendimento.
- **REQ-7c** — Uma conta é de **uma pessoa atendida** (ADR-012). Quem cuida de duas
  pessoas cria dois cadastros, com dois e-mails e dois CPFs. A tela DEVE dizer isso no
  bloco do REQ-5, para a pessoa não descobrir no segundo cadastro.
- **REQ-7d** — O formulário DEVE ter um campo de **foto, opcional**, que NÃO PODE bloquear
  o envio em hipótese alguma. Quem não enviar agora envia depois em `/area/cracha`, e a
  tela DEVE dizer isso ao lado do campo.
- **REQ-7e** — A foto usa **o mesmo componente de recorte e compressão** de
  `cracha-do-associado` (REQ-10 a REQ-12 de lá): arquivo de origem até 10 MB, recorte 4:5
  no navegador, JPEG de 400 × 500 px e teto rígido de 102.400 bytes no que sobe. **Um
  componente, um limite, dois lugares de entrada.** Esta change não reimplementa recorte,
  não define limite próprio e não fala com a tabela `fotos` — chama a interface
  `ArmazenamentoFoto` daquela change.
- **REQ-7f** — Falha ao processar ou gravar a foto **não derruba o cadastro**: a conta, a
  inscrição e o aceite são gravados assim mesmo, e a tela de confirmação diz que a foto não
  entrou e oferece o caminho de enviá-la depois. A foto é a única parte do envio que fica
  **fora** da transação do REQ-1, justamente para não custar o cadastro inteiro.

### Validação espelhada

- **REQ-8** — DEVE existir **um único** schema Zod, em `shared/validacao/inscricao.ts`,
  exportando o esquema e o tipo inferido. Cliente e servidor importam esse mesmo módulo.
  Duplicar regra de validação em qualquer outro arquivo é defeito.
- **REQ-9** — O servidor DEVE revalidar o payload inteiro com esse schema antes de
  qualquer escrita, independentemente do que o cliente tenha validado.
- **REQ-10** — O schema DEVE ser estrito (`.strict()`): payload com campo desconhecido é
  recusado com 422, não ignorado em silêncio.
- **REQ-11** — O servidor DEVE ignorar qualquer valor derivado enviado pelo cliente
  (`id`, `numero_registro`, `situacao`, `status`, `criado_em`). Esses valores são sempre
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
  `{ "numeroRegistro": "APPD-2026-00042", "recebidoEm": "<ISO UTC>" }`. A resposta NÃO
  DEVE conter senha, hash, CPF nem qualquer campo do bloco de deficiência.
- **REQ-21** — Resposta de dado inválido: **422** com
  `{ "erros": { "<campo>": "<mensagem>" } }`, um par por campo com problema. O servidor
  NÃO DEVE devolver stack trace nem detalhe interno.
- **REQ-22** — Resposta de excesso: **429** com mensagem que oferece o telefone da sede
  como alternativa. Falha interna: **500** com mensagem genérica, sem detalhe técnico e
  com a mesma alternativa por telefone.

### Idempotência e duplicata

- **REQ-23** — O cliente DEVE gerar uma chave de idempotência (UUID v4) no carregamento
  do formulário e enviá-la em todo envio. A chave é gravada em
  `usuarios.chave_idempotencia`, que é UNIQUE.
- **REQ-24** — Envio repetido com a mesma chave DEVE devolver **200** com o
  `numeroRegistro` já existente e NÃO DEVE criar segunda conta.
- **REQ-25** — Enquanto um envio está em andamento, o botão DEVE estar desabilitado, com
  o rótulo "Enviando…".
- **REQ-26** — **Duplicata deixou de ser heurística.** `cpf` é UNIQUE
  (`modelo-de-dados` REQ-7): a mesma pessoa não se cadastra duas vezes, e a colisão é
  recusada pelo banco com a mensagem do REQ-7. A coluna `possivel_duplicata` e a regra
  de "mesmo nome + nascimento + telefone nas últimas 24 h" estão **revogadas** — eram
  aproximação para um mundo sem identificador; agora há identificador.

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
- **REQ-32** — A confirmação DEVE conter, nesta ordem: o **número de registro** em
  destaque; o que de fato acontece agora — **os interesses ficaram registrados e alguém
  da APPD entra em contato**; **por qual canal** vem o contato (ligação para o telefone
  informado, exibido na tela); que a pessoa **pode entrar a qualquer momento e corrigir
  o cadastro**, com o link para `/area`; e o que fazer se o telefone mudar (editar pela
  área ou ligar para a sede, `(12) 3346-0605`).

  **Proibido nesta tela**, por ADR-014: as palavras "fila", "vaga", "posição",
  "matrícula", "aula" e qualquer prazo numérico. A APPD não opera fila nem matrícula, e
  o REQ-26 de `site-institucional` proíbe tela que prometa efeito que não acontece.

- **REQ-33** — Nenhum prazo é exibido. Não existe constante de prazo, não existe frase
  de prazo, e não há o que a APPD informar aqui: sem fila, não há chamada por ordem. A
  única promessa da tela é "alguém entra em contato", que é o que a associação faz.

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
- **REQ-37** — O bloco introdutório DEVE trazer as regras de `REGRAS_ATENDIMENTO` que
  continuam verdadeiras — **sessões só de manhã** e **telefone atualizado** — e NÃO DEVE
  mencionar contribuição nem valor. A regra de "fila por vaga" **sai**: ela veio do texto
  do formulário atual, que está desatualizado na origem (ADR-014); a correção do texto da
  APPD está em `docs/pendencias-appd.md`, item 5.
- **REQ-38** — O aviso "Esta é uma demonstração local" DEVE ser removido quando a rota
  estiver ligada.

### Consentimento (fronteira com outra change)

- **REQ-39** — O aceite DEVE ser gravado **numa linha da tabela `consentimentos`**, junto
  com a conta e a inscrição, na mesma transação do REQ-1. As colunas duplicadas de
  consentimento dentro de `inscricoes_atendimento` estão **revogadas**: dois registros do
  mesmo aceite é o começo de dois históricos que divergem (`modelo-de-dados` REQ-19).
  Vocabulário: `termo_id` = `deficiencia-art11`, `versao` monotônica (`v1`, `v2`, …),
  `origem` = `/atendimento/inscricao`.
- **REQ-40** — Os valores de `termo_id`, `versao` e `hash` DEVEM vir do módulo de termos
  exportado pela change `consentimento-e-privacidade` — esta change **não define, não
  versiona e não escreve** texto de termo. Enquanto aquela change não existir, esta
  **não é publicada**, nem em `*.workers.dev` com dado real. Rodar em local com dado
  fictício é permitido.
- **REQ-41** — Payload com consentimento ausente ou falso DEVE ser recusado com 422 e
  nenhuma escrita, mesmo que todos os outros campos estejam válidos.
- **REQ-42** — ~~Fronteira aberta.~~ **Fechada** pelo
  [ADR-012](../../../docs/adr/adr-012-cadastro-embutido-no-formulario.md): o formulário
  cria a conta, então `consentimentos.usuario_id NOT NULL` é exequível e não há
  incompatibilidade a resolver. O requisito órfão apontado pelo gate (B15) deixa de
  existir junto com a contradição que o gerou.

### Status da inscrição (contrato consumido por outras changes)

- **REQ-43** — A coluna `status` tem **um único valor possível**: `Interesse registrado`.
  O vocabulário anterior — `Na fila`, `Em atendimento`, `Encerrada` — está **revogado**
  pelo [ADR-014](../../../docs/adr/adr-014-inscricao-como-registro-de-interesse.md): a
  APPD não opera fila nem matrícula, e dois dos três valores eram inalcançáveis. Enum com
  valor que o sistema não sabe produzir não é contrato, é ficção.
- **REQ-44** — Toda inscrição aceita nasce com `status = "Interesse registrado"`,
  garantido por `CHECK` no banco (`modelo-de-dados` REQ-14).
- **REQ-45** — Nenhuma rota desta change aceita alteração de `status`. Quando existir
  vocabulário maior, quem o escreve é o `painel-admin` (V1.1) — e a decisão volta ao
  `modelo-de-dados`, não a esta spec.
- **REQ-45a** — **A inscrição é editável pela própria pessoa** em `/area/inscricoes`
  (ADR-014). A edição é da change `area-do-associado`; esta change garante apenas que a
  gravação inicial não impeça a edição: nada aqui é write-once além do
  `numero_registro`.

### Acessibilidade (bloqueante, WCAG 2.2 AA)

- **REQ-46** — Cada grupo de rádio e de caixas de seleção DEVE estar em `fieldset` com
  `legend` igual ao rótulo do campo oficial.
- **REQ-47** — Todo alvo de toque (opção, botão, botão do calendário) DEVE ter no mínimo
  **44 × 44 px** de área clicável, incluindo o rótulo, e **8 px de folga** entre alvos
  vizinhos. Régua única do projeto, igual nas seis changes.
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
  o `numero_registro`, o resultado (aceito/recusado), a lista de **nomes de campo** com
  erro e a duração. Senha, CPF e e-mail nunca vão para log, nem hasheados.
- **REQ-54** — Nenhum dado de pessoa real DEVE entrar em teste, seed ou fixture; dado
  fictício é obrigatório e identificado como tal.

## Comportamento esperado

**Caminho feliz.** A pessoa abre a página; o cliente gera a chave de idempotência.
Preenche os 15 campos, mais e-mail, CPF e senha, e envia. O cliente valida; passando,
desabilita o botão, mostra "Enviando…" e faz `POST`. O servidor revalida com o mesmo
schema, checa o limite horário e, numa transação só, grava a conta com o
`numero_registro` emitido, a inscrição e o aceite — e responde 201. A tela troca para a
confirmação com o número de registro e o caminho para entrar e editar depois.

**Alternativos e bordas.**

- Erro só no cliente: nada é enviado; erros aparecem, foco vai para o resumo, respostas
  ficam.
- Erro só no servidor (cliente contornado ou versão antiga em cache): 422, mesmos
  campos e mensagens, respostas ficam.
- Chave de idempotência repetida: 200 com o `numeroRegistro` original, nenhuma conta nova.
- E-mail ou CPF já cadastrado: 422 no campo correspondente, com o caminho de entrar na
  conta existente. Nenhuma linha gravada, respostas ficam.
- Limite horário estourado: 429 com o telefone da sede, respostas ficam.
- Falha do D1 ou exceção: 500 genérico, **nenhuma das três linhas** permanece — a
  transação do REQ-1 é tudo ou nada. Respostas ficam.
- Falha de rede (`fetch` rejeitado): mensagem de "não conseguimos enviar agora, tente de
  novo", respostas ficam, mesma chave é reusada na retentativa.
- Pessoa tenta sair com formulário preenchido e não enviado: aviso nativo do navegador
  (D6). Depois do sucesso, o aviso é desligado.

## Modelo de dados

**Não mora aqui.** As colunas, tipos, limites e restrições estão em
[`modelo-de-dados`](../modelo-de-dados/spec.md) — uma tabela descrita num lugar só.

O que esta change escreve, e onde:

| Tabela                   | O que esta change grava                         | Referência              |
| ------------------------ | ----------------------------------------------- | ----------------------- |
| `usuarios`               | campos 1 a 11, e-mail, CPF, hash da senha       | `modelo-de-dados` REQ-7 |
| `inscricoes_atendimento` | campos 12 a 15                                  | REQ-14                  |
| `consentimentos`         | o aceite do Art. 11, com versão, hash e carimbo | REQ-21                  |
| `tentativas`             | o hash do IP para o limite horário              | REQ-31                  |

As três primeiras, numa transação só (REQ-1). O `numero_registro` é emitido pela change
`cadastro-e-login` (ADR-013) e esta change o consome, não o calcula.

```gherkin
Funcionalidade: Procedência do consentimento e dado fictício
  Cobre REQ-40 e REQ-54 da SPEC-formulario-atendimento

  Cenário: O aceite gravado aponta para a versão do termo, não para texto solto
    Dado o catálogo de termos com a versão vigente
    Quando uma inscrição é concluída
    Então a linha de consentimentos traz termo_id, versao e hash vindos do catálogo
    E nenhum dos três é escrito à mão pela rota

  Cenário: Nenhum dado de pessoa real entra em teste, seed ou fixture
    Quando percorro os testes, os seeds e as fixtures do repositório
    Então todo CPF é gerado na hora ou está marcado como fictício
    E todo e-mail termina em exemplo.invalido
    E o gitleaks passa sobre o histórico completo
```

## Fora de escopo

Igual ao da proposal, repetido aqui porque é contrato: consentimento do Art. 11 em si;
conta de usuário e vínculo `usuario_id`; painel de leitura das inscrições; salvamento
parcial; consulta, edição e cancelamento pela pessoa; e-mail ou WhatsApp de
confirmação; alteração de qualquer um dos 15 campos; inclusão dos quatro projetos no
campo 13.

## Premissas e dependências

- ADR-001 (Workers + D1 + Drizzle) vale; nada aqui exige serviço com cartão.
- Zod 4 e Drizzle já estão no `package.json`; nenhuma dependência nova é necessária.
- **`modelo-de-dados` é dependência dura**: as tabelas precisam existir antes de
  qualquer código desta change.
- `consentimento-e-privacidade` precisa entregar a constante de versão do termo e a
  página de política — **dependência dura**, ver REQ-40.
- `cadastro-e-login` é dona do `numero_registro` e do hash de senha (ADR-013): esta
  change chama, não reimplementa.
- `area-do-associado` é dona da edição da inscrição; esta change só garante que a
  gravação inicial não a impeça (REQ-45a).
- ~~`painel-admin` (V1.1) é quem lê o que esta change grava.~~ **Deixou de ser risco de
  publicação** (ADR-014): não há promessa de fila a cumprir, e a pessoa mantém o próprio
  cadastro. O painel continua sendo a próxima entrega de valor para a APPD, não um
  bloqueio.
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

  Cenário: Envio válido cria conta, inscrição e aceite numa transação
    Dado que preenchi os 15 campos com dados fictícios válidos
      | campo       | valor                   |
      | Nome        | Maria Fictícia da Silva |
      | Nascimento  | 12/03/1978              |
      | Telefone    | (12) 90000-0001         |
      | WhatsApp    | Sim                     |
      | Endereço    | Rua de Teste            |
      | Número      | s/n                     |
      | Bairro      | Bairro Fictício         |
      | Município   | São José dos Campos     |
      | Deficiência | Física                  |
      | Atendimento | Fisioterapia            |
      | Dias        | Segundas                |
      | Ciência     | Ciente                  |
    E que preenchi os 3 campos de cadastro
      | campo  | valor                      |
      | E-mail | maria.ficticia@exemplo.test |
      | CPF    | 39053344705                |
      | Senha  | senha-de-teste-123         |
    E que marquei a autorização de tratamento do dado de saúde
    Quando envio o formulário
    Então a resposta é 201 com "numeroRegistro" no formato "APPD-2026-#####"
    E existe exatamente 1 linha em "usuarios" com o e-mail normalizado
    E existe exatamente 1 linha em "inscricoes_atendimento" ligada a ela
    E existe exatamente 1 linha em "consentimentos" com termo "deficiencia-art11",
      versão "v1", o hash do texto exibido, evento "aceite" e carimbo em UTC
    E nenhuma coluna de consentimento existe em "inscricoes_atendimento"
    E a tela mostra a confirmação com o número de registro em destaque

  Cenário: Inscrição nasce com o único status possível
    Quando envio uma inscrição válida
    Então a coluna "status" da linha gravada é "Interesse registrado"
    E um payload que traga "status": "Na fila" recebe 422
    E nenhuma rota desta change aceita alteração de status

  Cenário: E-mail já cadastrado é recusado sem gravar nada
    Dado que já existe uma conta com "maria.ficticia@exemplo.test"
    Quando envio um formulário válido com esse mesmo e-mail
    Então a resposta é 422 com erro no campo de e-mail
    E a mensagem oferece o caminho de entrar na conta existente
    E o banco continua com exatamente 1 linha em "usuarios"

  Cenário: CPF já cadastrado é recusado sem gravar nada
    Dado que já existe uma conta com o CPF "39053344705"
    Quando envio um formulário válido com esse mesmo CPF e outro e-mail
    Então a resposta é 422 com erro no campo de CPF
    E o banco continua com exatamente 1 linha em "usuarios"

  Cenário: Falha no meio da transação não deixa conta órfã
    Dado que a gravação em "consentimentos" falha
    Quando envio um formulário válido
    Então a resposta é 500 com mensagem genérica
    E não existe linha nenhuma em "usuarios"
    E não existe linha nenhuma em "inscricoes_atendimento"

  Cenário: Sem foto, o cadastro é concluído normalmente
    Dado que preenchi o formulário válido e não escolhi foto nenhuma
    Quando envio
    Então a resposta é 201
    E nenhuma linha existe em "fotos" para essa conta
    E a confirmação oferece o caminho de enviar a foto depois, em "/area/cracha"

  Cenário: Com foto, sobe o que o componente do crachá produziu
    Dado que escolhi uma imagem de 6 MB e ajustei o recorte
    Quando envio
    Então o que chega ao servidor tem 400 por 500 pixels
    E no máximo 102.400 bytes
    E o servidor revalida os bytes antes de gravar

  Cenário: Falha na foto não custa o cadastro
    Dado um formulário válido com foto
    E que a gravação da foto falha
    Quando envio
    Então a conta, a inscrição e o aceite continuam gravados
    E a confirmação avisa que a foto não entrou e diz como enviar depois

  Cenário: A senha exige comprimento e nada mais
    Quando envio um formulário com a senha "abcdefgh"
    Então a resposta é 201
    E nenhuma mensagem exige símbolo, maiúscula ou número
    E a senha em texto claro não aparece em nenhuma coluna de nenhuma tabela
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

  Cenário: Reenvio com a mesma chave devolve o mesmo número de registro
    Dado que enviei uma inscrição válida e recebi "APPD-2026-00001"
    Quando envio outra vez o mesmo payload, com a mesma chave de idempotência
    Então a resposta é 200 com "numeroRegistro" igual a "APPD-2026-00001"
    E continua existindo exatamente 1 linha em "usuarios"
    E continua existindo exatamente 1 linha em "inscricoes_atendimento"

  Cenário: A mesma pessoa não se cadastra duas vezes
    Dado que existe uma conta com o CPF "39053344705"
    Quando chega outro envio com esse CPF, chave de idempotência nova e outro e-mail
    Então a resposta é 422 com erro no campo de CPF
    E nenhuma segunda conta é criada
    E nenhuma heurística de nome, nascimento ou telefone é consultada
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
    Dado um payload válido que também traz "numeroRegistro": "APPD-2026-99999"
      e "situacao": "inativo"
    Quando faço POST em "/api/atendimento/inscricao"
    Então a resposta é 422 por campo desconhecido
    E, se o schema aceitasse, os dois valores gravados seriam os do servidor

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
    Quando consulto a tabela "tentativas"
    Então nenhuma coluna contém "203.0.113.7"
    E "chave_hash" tem 64 caracteres hexadecimais

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

  Cenário: A confirmação diz o que acontece e por qual canal
    Dado que enviei uma inscrição válida com telefone "(12) 90000-0001"
    Quando a confirmação aparece
    Então vejo o número de registro em destaque
    E vejo que os interesses ficaram registrados e que a APPD entra em contato
    E vejo que o contato vem por ligação para "(12) 90000-0001"
    E vejo que posso entrar e corrigir meu cadastro, com o link para "/area"
    E vejo o que fazer se o telefone mudar, com o número (12) 3346-0605

  Cenário: A confirmação não promete o que a APPD não faz
    Quando a confirmação aparece
    Então o texto não contém "fila"
    E não contém "vaga"
    E não contém "posição"
    E não contém "matrícula"
    E não exibe nenhuma quantidade de dias, semanas ou meses

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

  Cenário: Alvo de toque de 44px com rótulo clicável e folga de 8px
    Quando meço a área clicável de cada opção de rádio e caixa de seleção
    Então nenhuma tem largura ou altura menor que 44 px
    E clicar no texto do rótulo alterna a opção
    E a distância entre alvos vizinhos é de no mínimo 8 px

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
| REQ-1 a REQ-4  | Envio grava as três linhas numa transação       | integração da rota + migração |
| REQ-5 a REQ-7c | Cadastro embutido (4 cenários)                  | integração da rota            |
| REQ-8 a REQ-13 | Servidor não confia no cliente (6 cenários)     | unitário do schema + rota     |
| REQ-14         | Data de nascimento (3 cenários, 4 exemplos)     | unitário do schema + tela     |
| REQ-15, 16     | Telefone e máscara (4 cenários, 3 exemplos)     | unitário + componente         |
| REQ-17, 18     | Múltipla escolha e "Outro" (4 cenários)         | unitário + componente         |
| REQ-19 a 22    | Contrato da rota + limites (4 cenários)         | integração da rota            |
| REQ-23 a 26    | Idempotência e CPF único (2 cenários)           | integração da rota            |
| REQ-27 a 31    | Erro nunca apaga resposta (4 cenários)          | componente                    |
| REQ-32 a 38    | Confirmação e conteúdo (4 cenários)             | componente + teste de texto   |
| REQ-39 a 41    | Consentimento (2 cenários) + gate de publicação | integração da rota            |
| REQ-42         | resolvido pelo ADR-012 — sem cenário próprio    | —                             |
| REQ-43 a 45a   | Status único e não alterável (1 cenário)        | integração da rota            |
| REQ-46 a 52    | Acessibilidade (7 cenários)                     | axe + teclado                 |
| REQ-53, 54     | Log e dado fictício (2 cenários)                | integração + revisão          |

## Veredito do gate (Definition of Ready)

- Spec aprovada: **pendente** — falta a assinatura do dono nas decisões D4 e D5
  (ADR-008, ADR-009). D3 e D9 já estão assinadas no ADR-012; D10, no ADR-014.
- Priorizada: **pendente** — prioridade é do coordenador, não desta spec.
- Critério de aceite testável: **sim** — cenários Gherkin cobrindo caminho feliz,
  bordas, falha de infraestrutura, adulteração e acessibilidade.

Bloqueios conhecidos, cada um com dono:

- `[dependência]` **`modelo-de-dados` precisa fechar primeiro.** Nenhuma linha de código
  desta change antes das tabelas existirem. Dono: Arthur Barbero.
- `[dependência]` REQ-40: publicação travada até `consentimento-e-privacidade` entregar
  termo, versão e hash. Dono: Arthur Barbero.
- ~~`[contradição entre changes]` REQ-42~~ — **resolvido** pelo ADR-012.
- ~~`[escopo]` Risco R1: ninguém lê as inscrições até o `painel-admin`.~~ — **premissa
  derrubada** pelo ADR-014: não há fila a operar, e a pessoa mantém o próprio cadastro.
- ~~`[conteúdo]` REQ-33: prazo de retorno.~~ — **sem objeto**: a tela não exibe prazo.
- ~~`[decisão]` D3, prefixo `ATD-` na confirmação.~~ — **sem objeto**: a confirmação
  mostra o `numero_registro` (`APPD-`), que é o que o mock de design já trazia.
- `[APPD]` Pedir CPF é pergunta nova para a associação
  (`docs/pendencias-appd.md`, item 4b). Recusa custa uma migration, não uma reescrita.
