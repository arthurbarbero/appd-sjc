# Spec — `modelo-de-dados`

Contrato de dado persistido do projeto. **Esta spec manda sobre as outras seis**:
nenhuma change cria, renomeia ou remove coluna. Divergência encontrada volta para cá.

Decisões que fundamentam: [ADR-012](../../../docs/adr/adr-012-cadastro-embutido-no-formulario.md)
(cadastro embutido, conta por pessoa), [ADR-013](../../../docs/adr/adr-013-fronteira-de-rotas-entre-changes.md)
(dono por recurso), [ADR-014](../../../docs/adr/adr-014-inscricao-como-registro-de-interesse.md)
(inscrição editável, sem fila), [ADR-003](../../../docs/adr/adr-003-foto-do-cracha-como-blob-no-d1.md)
(foto como BLOB).

## Vocabulário

- **Pessoa atendida** — o ser humano que recebe o atendimento da APPD. É o dono da
  conta, mesmo quando quem digita é o cuidador.
- **Conta** — uma linha em `usuarios`. Uma conta = uma pessoa atendida.
- **Inscrição** — uma linha em `inscricoes_atendimento`. Registro do que a pessoa
  precisa, editável por ela. Não é matrícula, não é vaga, não é fila.
- **Aceite** — uma linha em `consentimentos`. Registro imutável de um consentimento
  dado ou revogado, com versão e hash do texto exibido.

## Regras gerais

- **REQ-1** — Todo schema DEVE ser declarado em `server/database/schema.ts` com Drizzle
  e aplicado por migration gerada com `npm run db:generate` e versionada em
  `drizzle/migrations`. `drizzle-kit push` direto no banco é **proibido**, em qualquer
  ambiente.
- **REQ-2** — Nome de tabela e de coluna em `snake_case` e em pt-BR, sem abreviação
  inventada. Identificador de linha em `id`; chave estrangeira em `<tabela_singular>_id`.
- **REQ-3** — Toda data/hora DEVE ser TEXT em ISO-8601 UTC com sufixo `Z`
  (`2026-08-06T14:03:11Z`). Não existe coluna de data em fuso local, nem inteiro epoch.
- **REQ-4** — Toda restrição de integridade que o SQLite consegue expressar — `UNIQUE`,
  `NOT NULL`, `CHECK`, `FOREIGN KEY` — DEVE existir **no banco**, não só em validação de
  aplicação. Validação em código é camada adicional, nunca substituta.
- **REQ-5** — Nenhuma coluna guarda endereço IP, user-agent ou geolocalização em texto
  claro, em nenhuma tabela. Onde IP for necessário, ver REQ-30.
- **REQ-6** — Seed e fixture usam **apenas dado fictício explícito**, com nomes
  reconhecíveis como falsos. Nenhum dado de pessoa real entra no repositório.

## Tabela `usuarios`

Uma linha por pessoa atendida. Criada pelo envio do formulário de atendimento
(ADR-012). Dona: `cadastro-e-login`.

- **REQ-7** — A tabela `usuarios` DEVE ter exatamente as colunas abaixo.

  **As colunas de identidade e contato são NULL-áveis, e isso não é frouxidão.** Declará-las
  `NOT NULL` tornaria a exclusão do REQ-28 impossível de executar: ela apaga nome, e-mail,
  CPF e contato, mas **preserva o `numero_registro`**, então a linha continua existindo. Em
  vez de afrouxar a regra, ela fica condicionada: enquanto `situacao = 'ativo'`, todas são
  obrigatórias por `CHECK` (`usuarios_ativo_completo`). Não existe conta ativa sem nome, e
  continua sendo possível anonimizar. Divergência encontrada na implementação da T1 e
  resolvida aqui antes do código.

| Coluna               | Tipo | Obrig. | Restrição / regra                                         | Campo do formulário |
| -------------------- | ---- | ------ | --------------------------------------------------------- | ------------------- |
| `id`                 | TEXT | sim    | PK, UUID v4                                               | —                   |
| `numero_registro`    | TEXT | sim    | UNIQUE, `^APPD-\d{4}-\d{5}$`, imutável                    | —                   |
| `email`              | TEXT | sim    | UNIQUE, normalizado (`trim` + minúsculas)                 | novo (ADR-012)      |
| `cpf`                | TEXT | sim    | UNIQUE, 11 dígitos, só números, dígito verificador válido | novo (ADR-012)      |
| `senha_hash`         | TEXT | sim    | scrypt, ver ADR-002 e ADR-005                             | novo (ADR-012)      |
| `senha_params`       | TEXT | sim    | JSON com `N`, `r`, `p` e o sal usado                      | —                   |
| `nome`               | TEXT | sim    | 2 a 120 caracteres                                        | 1                   |
| `nascimento`         | TEXT | sim    | `aaaa-mm-dd`                                              | 2                   |
| `telefone`           | TEXT | sim    | 10 ou 11 dígitos, só números                              | 3                   |
| `telefone_whatsapp`  | TEXT | sim    | CHECK ∈ (`Sim`, `Não`)                                    | 4                   |
| `endereco`           | TEXT | sim    | 3 a 300 caracteres                                        | 5                   |
| `numero`             | TEXT | sim    | 1 a 20 caracteres (texto: existe `s/n`, `123-A`, `Km 4`)  | 6                   |
| `complemento`        | TEXT | não    | até 60 caracteres                                         | 7                   |
| `bairro`             | TEXT | sim    | 2 a 80 caracteres                                         | 8                   |
| `municipio`          | TEXT | sim    | 2 a 80 caracteres, texto livre                            | 9                   |
| `cuidador_nome`      | TEXT | não    | até 120 caracteres                                        | 10                  |
| `cuidador_contato`   | TEXT | não    | vazio ou 10/11 dígitos                                    | 11                  |
| `situacao`           | TEXT | sim    | CHECK ∈ (`ativo`, `inativo`), padrão `ativo`              | —                   |
| `chave_idempotencia` | TEXT | não    | UNIQUE quando preenchida, UUID v4                         | —                   |
| `criado_em`          | TEXT | sim    | ISO UTC                                                   | —                   |
| `atualizado_em`      | TEXT | sim    | ISO UTC                                                   | —                   |

- **REQ-8** — `numero_registro` DEVE ser gerado no momento da conclusão do cadastro,
  nunca antes, e DEVE ser imutável: nenhuma rota pode alterá-lo depois de gravado.
- **REQ-9** — A unicidade do `numero_registro` DEVE vir da restrição `UNIQUE` do banco,
  com nova tentativa em caso de colisão, no máximo 5 tentativas. Ler o maior sequencial
  do ano e somar 1 **não satisfaz** este requisito. Buraco na sequência é aceitável e
  esperado: nenhum requisito exige numeração consecutiva (revoga
  `cracha-do-associado` REQ-5).
- **REQ-10** — O sequencial reinicia em `00001` a cada ano. Esgotar `99999` num ano DEVE
  produzir erro explícito, registrado em log, nunca estouro silencioso.
- **REQ-11** — A senha em texto claro NÃO PODE existir em coluna nenhuma, em nenhuma
  tabela, nem em coluna de log, nem em coluna de auditoria.
- **REQ-12** — `situacao` nasce `ativo`. **O único escritor autorizado é o fluxo de
  exclusão de conta** (REQ-28), que grava `inativo`. Nenhuma outra rota, tarefa ou
  migration escreve nesta coluna na V1. (Fecha B12: a coluna passa a ter autor.)
- **REQ-13** — `email` e `cpf` são chaves de pessoas **diferentes**: duas contas nunca
  compartilham e-mail, e nunca compartilham CPF. Uma pessoa que cuida de duas pessoas
  atendidas cria duas contas (ADR-012).

## Tabela `inscricoes_atendimento`

Uma linha por pessoa atendida — **no máximo uma**. Dona: `formulario-atendimento`.

- **REQ-14** — A tabela DEVE ter exatamente as colunas abaixo.

| Coluna                 | Tipo | Obrig. | Restrição / regra                                   | Campo |
| ---------------------- | ---- | ------ | --------------------------------------------------- | ----- |
| `id`                   | TEXT | sim    | PK, UUID v4                                         | —     |
| `usuario_id`           | TEXT | sim    | **UNIQUE**, FK → `usuarios.id`, `ON DELETE CASCADE` | —     |
| `deficiencias`         | TEXT | sim    | JSON array, ≥ 1 item do vocabulário fechado         | 12    |
| `deficiencia_outro`    | TEXT | não    | 2 a 100 caracteres; obrigatório se `Outro` marcado  | 12    |
| `atendimentos`         | TEXT | sim    | JSON array, ≥ 1 item do vocabulário fechado         | 13    |
| `atendimento_outro`    | TEXT | não    | 2 a 100 caracteres; obrigatório se `Outro` marcado  | 13    |
| `dias`                 | TEXT | sim    | JSON array, ≥ 1 item do vocabulário fechado         | 14    |
| `ciencia_contribuicao` | TEXT | sim    | CHECK = `Ciente`                                    | 15    |
| `status`               | TEXT | sim    | CHECK = `Interesse registrado`                      | —     |
| `criado_em`            | TEXT | sim    | ISO UTC                                             | —     |
| `atualizado_em`        | TEXT | sim    | ISO UTC, atualizado a cada edição                   | —     |

- **REQ-15** — `usuario_id` DEVE ser `UNIQUE`: uma pessoa tem uma inscrição, que ela
  edita (ADR-014). Segunda inserção para o mesmo usuário DEVE falhar no banco.
- **REQ-16** — `status` tem **um valor só**, `Interesse registrado`. O vocabulário
  `Na fila` / `Em atendimento` / `Encerrada` está revogado (ADR-014): a APPD não opera
  fila nem matrícula, e enum cujos valores são inalcançáveis não é contrato.
- **REQ-17** — A edição DEVE alterar a linha existente e atualizar `atualizado_em`.
  Não há versionamento nem histórico na V1 — dívida consciente registrada no ADR-014.
- **REQ-18** — Múltipla escolha é guardada como **array JSON em coluna TEXT** (ADR-008
  a escrever), sempre com vocabulário fechado validado por Zod na escrita e na leitura.
  Valor fora do vocabulário DEVE falhar, nunca ser guardado "por garantia".
- **REQ-19** — As colunas de consentimento **não existem aqui**. O aceite mora só em
  `consentimentos` (REQ-20). Dois registros do mesmo aceite são o começo de dois
  históricos que divergem.
- **REQ-20** — Não existe coluna `protocolo` nem `possivel_duplicata`. A primeira
  perdeu a função com o cadastro embutido (ADR-012); a segunda ficou impossível, porque
  `cpf` é UNIQUE e duplicata não entra.

## Tabela `consentimentos`

Livro-razão append-only do Art. 11 da LGPD. Dona: `consentimento-e-privacidade`.

- **REQ-21** — A tabela DEVE ter exatamente as colunas abaixo.

| Coluna          | Tipo | Obrig. | Restrição / regra                               |
| --------------- | ---- | ------ | ----------------------------------------------- |
| `id`            | TEXT | sim    | PK, UUID v4                                     |
| `usuario_id`    | TEXT | sim    | FK → `usuarios.id`, **sem** `ON DELETE CASCADE` |
| `termo_id`      | TEXT | sim    | ex.: `deficiencia-art11`                        |
| `versao`        | TEXT | sim    | ex.: `v1`                                       |
| `hash`          | TEXT | sim    | SHA-256 hex do texto exibido à pessoa           |
| `evento`        | TEXT | sim    | CHECK ∈ (`aceite`, `revogacao`)                 |
| `registrado_em` | TEXT | sim    | ISO UTC                                         |
| `origem`        | TEXT | sim    | rota de origem, ex.: `/atendimento/inscricao`   |

Índice em (`usuario_id`, `termo_id`, `registrado_em`).

- **REQ-22** — A tabela é **append-only na aplicação**: revogação e alteração de termo
  gravam linha nova. Nenhuma rota executa `UPDATE` nem `DELETE` aqui.
- **REQ-23** — Nenhuma coluna guarda IP nem user-agent (reforça REQ-5). O registro
  precisa provar **o quê**, **quando** e **por quem**, não de onde.
- **REQ-24** — `usuario_id` é NOT NULL e exequível, porque toda inscrição pertence a uma
  conta (ADR-012). (Fecha B5 e B7.)
- **REQ-25** — As linhas de `consentimentos` **sobrevivem à exclusão da conta**: são a
  prova de que o tratamento teve base legal. Depois da exclusão elas apontam para uma
  linha de `usuarios` anonimizada, e não contêm dado sensível — só o identificador do
  termo, a versão e o carimbo. Por isso a FK **não** tem `ON DELETE CASCADE`.

## Tabela `fotos`

Foto do crachá, BLOB no D1 (ADR-003). Dona: `cracha-do-associado`.

- **REQ-26** — A tabela DEVE ter: `id` (TEXT PK, UUID v4), `usuario_id` (TEXT NOT NULL,
  **UNIQUE**, FK → `usuarios.id`, `ON DELETE CASCADE`), `conteudo` (BLOB NOT NULL, com
  `CHECK (length(conteudo) <= 102400)`), `tipo` (TEXT NOT NULL, CHECK = `image/jpeg`),
  `largura` (INT NOT NULL, CHECK = 400), `altura` (INT NOT NULL, CHECK = 500),
  `criado_em` e `atualizado_em` (TEXT ISO UTC).

  **Um limite só no projeto: 400 × 500 px, ≤ 102.400 bytes.** O limite de 5 MB do
  REQ-22 de `cadastro-e-login` está revogado (ADR-013). Fecha B11.

- **REQ-27** — A foto NUNCA é servida em rota pública. Só a própria pessoa autenticada
  e o próprio crachá a acessam. `/verificar/<numero>` não expõe foto em hipótese alguma.

## Contrato de exclusão de conta

Lista única do que a exclusão faz. Dona: `area-do-associado`, rota `/area/excluir`.
Fecha B23 — substitui as três listas divergentes.

- **REQ-28** — Confirmada a exclusão, numa única transação:

| Tabela                   | O que acontece                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fotos`                  | linha **apagada**                                                                                                                                                                                                                                                                                                                         |
| `inscricoes_atendimento` | linha **apagada** — leva junto o tipo de deficiência, que é o dado sensível                                                                                                                                                                                                                                                               |
| `usuarios`               | `nome`, `email`, `cpf`, `senha_hash`, `senha_params`, `nascimento`, `telefone`, `telefone_whatsapp`, `endereco`, `numero`, `complemento`, `bairro`, `municipio`, `cuidador_nome`, `cuidador_contato` e `chave_idempotencia` são **apagados**; `numero_registro` é **preservado**; `situacao` vira `inativo`; `atualizado_em` é atualizado |
| `consentimentos`         | **preservado**, mais uma linha nova com `evento` = `revogacao` (REQ-22, REQ-25)                                                                                                                                                                                                                                                           |
| `tentativas`             | nada — não tem vínculo com pessoa                                                                                                                                                                                                                                                                                                         |

- **REQ-29** — `numero_registro` é preservado e **nunca reutilizado**: crachá emitido no
  passado não pode passar a identificar outra pessoa. Consequência em
  `/verificar/<numero>`: a rota responde HTTP 200, mostra o número e `situacao`
  `inativo`, e **não mostra nome**, porque o nome deixou de existir. Isso resolve o
  `[A CONFIRMAR]` do REQ-27 de `area-do-associado` e ajusta o REQ-28 de
  `cracha-do-associado`, que garantia nome para todo número.

## Tabela `tentativas` — limites de frequência e o que os identifica

- **REQ-30** — **Uma regra para o projeto inteiro** (fecha B21): nada que identifique
  quem fez a tentativa é gravado em texto claro — nem endereço IP, nem e-mail. Onde for
  necessário limitar frequência, guarda-se `HMAC-SHA-256(<identificador>, segredo)`, com
  o segredo vindo de Cloudflare Secrets e **nunca** do repositório.
- **REQ-31** — A tabela `tentativas` DEVE ter: `id` (INTEGER PK autoincrement),
  `chave_hash` (TEXT NOT NULL), `escopo` (TEXT NOT NULL, CHECK ∈ (`inscricao`,
  `verificacao`, `login`)) e `criado_em` (TEXT ISO UTC). Índice em
  (`chave_hash`, `escopo`, `criado_em`). Linhas com mais de uma hora são apagadas a cada
  escrita.

  **O que `chave_hash` guarda depende do escopo**: hash do **IP** em `inscricao` e
  `verificacao`, hash do **e-mail normalizado** em `login`. O nome é neutro de propósito —
  na v1 a coluna se chamava `ip_hash`, o que impedia o terceiro uso.

  > **Bloqueio B-T5-1 do gate T5.** `cadastro-e-login` REQ-26 exige contador de tentativas
  > de login persistido no D1, e REQ-26b exige a chave em HMAC. O contrato da v1 declarava
  > cinco tabelas, nenhuma com lugar para isso, e o cenário de aceite reprovava quem
  > criasse a sexta. Consumidor sem produtor — a mesma classe do B12 do parecer anterior.
  > Resolvido alargando a tabela que já existia, em vez de criar outra: a limpeza por
  > idade e o índice já servem aos três casos.

- **REQ-32** — Limites, por escopo:
  - `inscricao`: **10 envios por hash por hora** — escolhido para não travar quem preenche
    na sede da associação, na mesma rede, para várias pessoas;
  - `verificacao`: **20 consultas por hash por minuto**;
  - `login`: **5 tentativas falhas por hash em 15 minutos**, com bloqueio de 15 minutos
    (`cadastro-e-login` REQ-26). O contador vale para a chave digitada, exista conta ou
    não (REQ-26a de lá) — é o que impede a enumeração de usuários.

## O que não existe

- **REQ-33** — Não existe tabela de sessão. A sessão é cookie selado
  (`nuxt-auth-utils`, ADR-002). Ninguém cria tabela de sessão "para escalar depois".
- **REQ-34** — Não existe tabela de log de acesso, de auditoria de leitura, nem de
  métrica de uso na V1. Cada uma delas seria dado pessoal novo sem base legal escrita.

## Critérios de aceite

Testes em `test/`, contra o D1 local (`wrangler --local`), com dado fictício.

```gherkin
Funcionalidade: Integridade do modelo de dados

  Cenário: A migration cria as cinco tabelas e nenhuma outra
    Dado um banco D1 local vazio
    Quando aplico todas as migrations de "drizzle/migrations"
    Então existem exatamente as tabelas "usuarios", "inscricoes_atendimento",
      "consentimentos", "fotos" e "tentativas"
    E não existe tabela de sessão
    E não existe tabela de log de acesso

  Cenário: E-mail duplicado é recusado pelo banco, não pelo código
    Dado um usuário gravado com o e-mail "fulano@exemplo.test"
    Quando insiro outro usuário com o mesmo e-mail, direto por SQL
    Então o banco recusa a inserção por violação de restrição UNIQUE

  Cenário: CPF duplicado é recusado pelo banco
    Dado um usuário gravado com o CPF "39053344705"
    Quando insiro outro usuário com o mesmo CPF, direto por SQL
    Então o banco recusa a inserção por violação de restrição UNIQUE

  Cenário: Uma pessoa não tem duas inscrições
    Dado um usuário com uma inscrição gravada
    Quando insiro uma segunda inscrição com o mesmo "usuario_id"
    Então o banco recusa a inserção por violação de restrição UNIQUE

  Cenário: Status fora do vocabulário é recusado
    Quando insiro uma inscrição com status "Na fila"
    Então o banco recusa a inserção por violação de CHECK

  Cenário: Foto acima do teto é recusada pelo banco
    Quando insiro uma foto com 102.401 bytes de conteúdo
    Então o banco recusa a inserção por violação de CHECK

  Cenário: Situação só aceita os dois valores previstos
    Quando atualizo "situacao" de um usuário para "pendente"
    Então o banco recusa a alteração por violação de CHECK

  Cenário: O número de registro não é alterável
    Dado um usuário com "numero_registro" igual a "APPD-2026-00001"
    Quando a camada de dados tenta alterar esse valor
    Então a operação é recusada com erro
    E o valor no banco continua "APPD-2026-00001"

  Cenário: Cadastros simultâneos não produzem o mesmo número
    Dado 50 conclusões de cadastro disparadas em paralelo
    Quando todas terminam
    Então existem 50 valores distintos de "numero_registro"
    E nenhuma delas gravou por "ler o maior sequencial e somar 1"

  Cenário: A exclusão apaga o dado sensível e preserva o número
    Dado um usuário com inscrição, foto e dois consentimentos
    Quando o fluxo de exclusão de conta é executado
    Então não existe linha em "inscricoes_atendimento" para esse usuário
    E não existe linha em "fotos" para esse usuário
    E as colunas de identificação e contato em "usuarios" estão vazias
    E "numero_registro" continua igual ao valor original
    E "situacao" é "inativo"
    E as duas linhas originais em "consentimentos" continuam intactas
    E existe uma terceira linha em "consentimentos" com evento "revogacao"

  Cenário: Nenhuma tabela guarda IP nem e-mail de tentativa em texto claro
    Dado um envio de formulário vindo do IP "203.0.113.7"
    E cinco tentativas de login falhas para "alguem@exemplo.test"
    Quando consulto todas as colunas de todas as tabelas
    Então nenhum valor contém "203.0.113.7"
    E nenhuma linha de "tentativas" contém "alguem@exemplo.test"
    E toda "chave_hash" tem 64 caracteres hexadecimais
    E os três escopos gravados são apenas "inscricao", "verificacao" ou "login"

  Cenário: Toda data gravada está em UTC com sufixo Z
    Dado um usuário, uma inscrição e um consentimento recém-gravados
    Quando leio todas as colunas de data e hora
    Então todas casam com "^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$"

  Cenário: Nenhuma coluna guarda senha em texto claro
    Quando listo o nome de todas as colunas de todas as tabelas
    Então nenhuma se chama "senha", "password" ou "senha_clara"
    E o valor de "senha_hash" difere da senha usada no cadastro
```

## Rastreabilidade

| Bloqueio do gate | Resolvido por        |
| ---------------- | -------------------- |
| B5, B7, B17      | REQ-24 (via ADR-012) |
| B10              | REQ-9                |
| B11              | REQ-26               |
| B12              | REQ-12               |
| B21              | REQ-30               |
| B23              | REQ-28, REQ-29       |
| B16              | REQ-16 (via ADR-014) |
| B6, B20, B22     | ADR-013              |

## Fora de escopo

Nenhuma rota, nenhuma tela, nenhum componente. Nenhum parâmetro de scrypt (ADR-005).
Nenhum texto de termo (ADR-006). Nenhum painel administrativo (V1.1). Nenhum envio de
e-mail. Nenhuma anonimização automatizada além do REQ-28.
