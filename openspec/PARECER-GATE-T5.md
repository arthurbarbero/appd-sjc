# Parecer do gate T5 — 2026-08-06

Escopo: as **sete** changes de `openspec/changes/`, com
[`modelo-de-dados`](changes/modelo-de-dados/spec.md) como contrato de referência.
Antecessor: [`PARECER-GATE.md`](PARECER-GATE.md), de 2026-08-05, com 25 bloqueios.

## Limitação declarada deste parecer

O gate de 2026-08-05 foi rodado por um revisor independente, que não havia escrito as
specs. **Este foi rodado por quem as escreveu**, e isso vale menos: quem escreveu tende a
reler o que quis dizer, não o que está escrito. Os quatro bloqueios abaixo foram achados
por varredura mecânica — referência cruzada, valor repetido, consumidor sem produtor —,
não por leitura. **Leitura de mérito continua devendo.**

Recomendação: antes de a primeira migration ir para o D1, rodar um revisor independente
sobre `modelo-de-dados`, que é a change que todas as outras consomem.

## O que aconteceu com os 25 bloqueios do parecer anterior

| Situação                       | Bloqueios                                                         |
| ------------------------------ | ----------------------------------------------------------------- |
| Caíram com as decisões do dono | B1, B2, B5, B6, B7, B10, B11, B12, B15, B16, B17, B20, B22, B23   |
| Fechados na reescrita (forma)  | B3, B4, B8, B9, B13, B14, B18, B19, B21, B24                      |
| Ainda em pé                    | **B25** (menor, "alterar meus dados" com três donos — ver abaixo) |

B25 foi resolvido na prática pelo ADR-013 — `area-do-associado` é a dona de
`/area/dados`, e `cadastro-e-login` REQ-31 ficou só com a regra de unicidade —, mas o
texto de `consentimento-e-privacidade` REQ-16 ainda descreve a mesma correção de telefone.
Não bloqueia; é redundância, não contradição.

## Bloqueios novos

### B-T5-1 — o contador de tentativas de login não tem onde morar

`cadastro-e-login` REQ-26 exige que o contador seja **persistido no D1**, e REQ-26b exige
que a chave seja `HMAC-SHA-256(e-mail, segredo)`. Só que `modelo-de-dados` declara
**exatamente cinco tabelas** — `usuarios`, `inscricoes_atendimento`, `consentimentos`,
`fotos` e `envios_recentes` — e o primeiro cenário de aceite **falha** se existir uma
sexta:

> `Então existem exatamente as tabelas "usuarios", "inscricoes_atendimento",`
> `"consentimentos", "fotos" e "envios_recentes"`

Nenhuma das cinco tem coluna para isso. `envios_recentes` chega perto — já guarda
`ip_hash`, `escopo` e `criado_em` —, mas seu `escopo` é `CHECK ∈ ('inscricao','verificacao')`
e sua chave é hash de **IP**, não de e-mail.

**É a mesma classe do B12 do parecer anterior**: consumidor sem produtor. Um requisito
exige persistência que o contrato de dados não prevê, e o teste do contrato reprova quem
implementar o requisito.

**Correção mínima**: `envios_recentes` ganha `escopo = 'login'` e a coluna passa a se
chamar algo neutro (`chave_hash` em vez de `ip_hash`), porque agora ela guarda hash de IP
**ou** de e-mail conforme o escopo. Alternativa: sexta tabela `tentativas_login`. A
primeira é mais barata e mantém a limpeza por idade que já existe.

**Dono**: Arthur Barbero, com a decisão em `modelo-de-dados`.

### B-T5-2 — referência cruzada quebrada dentro do próprio contrato

`modelo-de-dados` REQ-12 diz:

> "O único escritor autorizado é o fluxo de exclusão de conta **(REQ-27)**, que grava
> `inativo`."

O REQ-27 daquela spec é "A foto NUNCA é servida em rota pública". O contrato de exclusão é
o **REQ-28**. Quem seguir a referência lê o requisito errado.

Defeito de uma palavra, e mesmo assim reprova: o parecer anterior derrubou quatro
rastreabilidades erradas pelo mesmo motivo — mapa errado é o que faz alguém implementar o
requisito vizinho.

**Dono**: Claude Code. Correção imediata.

### B-T5-3 — a fila continua no site, e o site está rodando

Este é o grave. O [ADR-014](../docs/adr/adr-014-inscricao-como-registro-de-interesse.md)
estabelece que a APPD **não opera fila de vagas nem matrícula**. A reescrita corrigiu
`formulario-atendimento`, mas a afirmação sobreviveu em três lugares:

1. **`site-institucional` REQ-6** — "As três regras do atendimento — **vaga por fila**,
   sessões somente no período da manhã e contribuição sugerida — DEVEM estar visíveis na
   página do serviço". Está marcado `[FEITO]`, com dois cenários de aceite que **testam a
   presença** do texto sobre fila.
2. **`consentimento-e-privacidade`** — a tela de exclusão informa "que a pessoa **sai da
   fila** de atendimento".
3. **O código que já roda**: `shared/conteudo.ts` traz
   `'As vagas são chamadas conforme abrem — o cadastro entra em fila.'` em
   `REGRAS_ATENDIMENTO`, mais `'A vaga entra em fila…'` repetido nas páginas de serviço.

Ou seja: o site em `localhost` hoje diz a quem entra que existe uma fila de vagas, e há
teste de aceite que **falharia se a frase fosse removida**. Isso viola o REQ-26 da própria
`site-institucional` — "nenhuma tela pode prometer um efeito que não acontece" — e é
exatamente o defeito que o ADR-014 foi escrito para corrigir.

Nada disso está publicado, então ninguém foi enganado. Mas é o único bloqueio deste
parecer que já tem consequência visível na tela.

**Correção**: `REGRAS_ATENDIMENTO` passa a ter duas regras (manhã e telefone atualizado),
o texto das nove páginas de serviço perde a frase da vaga, `site-institucional` REQ-6 e
seus cenários passam a testar **a ausência** da palavra, e a frase da tela de exclusão vira
"deixa de constar como interessada em atendimento".

**Dono**: Claude Code para o texto; Arthur Barbero confirma com a APPD que a descrição nova
está certa.

### B-T5-4 — "gravar a versão do termo e a data/hora" sem dizer onde

`cadastro-e-login` REQ-21 manda "gravar a **versão do termo** e a **data/hora do aceite**"
sem nomear a tabela. Na v1 isso eram colunas de `usuarios`; no contrato novo, o aceite mora
só em `consentimentos` (`modelo-de-dados` REQ-19, REQ-21).

A redação, como está, autoriza alguém a criar as duas colunas em `usuarios` — que é
justamente a duplicação que o REQ-19 proíbe, e a raiz do B5 anterior.

**Dono**: Claude Code. Correção imediata.

## Requisitos órfãos e cenários não automatizáveis

Varredura completa, sete changes:

- **Nenhum requisito órfão não declarado.** Os dois que existem estão marcados no próprio
  texto: `cracha-do-associado` REQ-38 (`[verificado por task, não por Gherkin]`) e
  `site-institucional` REQ-8, cujo aceite é disjuntivo por decisão pendente do dono
  (busca real **ou** campo removido).
- **Nenhum cenário em prosa.** Os três `Exemplos:` que não geravam execução viraram tabela.
- **`site-institucional`, zoom de 200%** — marcado `[manual]`, como a convenção da spec
  já previa.
- **`cadastro-e-login`, teste de tempo de resposta** — continua dependendo de
  `<limite_ms>` medido **e** de política de retentativa, os dois presos ao ADR-005. Está
  declarado como bloqueio na Definition of Ready da change; não é órfão escondido.

## Coerência do contrato de dados

Conferido item a item entre `modelo-de-dados` e as seis consumidoras:

| Item                    | Situação                                                                 |
| ----------------------- | ------------------------------------------------------------------------ |
| `numero_registro`       | ✓ um dono (`cadastro-e-login`), um algoritmo, buraco declarado aceitável |
| Foto                    | ✓ um componente, um limite (10 MB origem → 400×500, 102.400 bytes)       |
| `situacao`              | ✓ produtor nomeado (fluxo de exclusão), dois valores                     |
| Exclusão de conta       | ✓ uma lista, em `modelo-de-dados` REQ-28                                 |
| `status` da inscrição   | ✓ um valor, com `CHECK` no banco                                         |
| Tratamento de IP        | ✓ uma regra (HMAC), duas aplicações                                      |
| Senha                   | ✓ um mínimo, declarado num lugar só                                      |
| Alvo de toque           | ✓ 44 px com 8 px de folga, nas seis                                      |
| Régua de acessibilidade | ✓ nível A/AA, na configuração do axe                                     |
| Contador de login       | ✗ **B-T5-1**                                                             |

## Veredito

```
Gate T5                                  Resultado: NÃO-READY ✗

Bloqueios:
- [escopo]      B-T5-1: contador de tentativas sem tabela.   Dono: Arthur Barbero
- [aceite]      B-T5-2: REQ-12 aponta para o REQ errado.     Dono: Claude Code
- [contradição] B-T5-3: fila/vaga viva em 2 specs e no site. Dono: Claude Code + APPD
- [ambiguidade] B-T5-4: REQ-21 não diz onde grava o aceite.  Dono: Claude Code

Próximo passo: corrigir os quatro e rerodar. Três são de uma linha; o B-T5-1
exige decisão de dado, e é a única que muda o schema.
```

**Comparação honesta com o gate anterior**: 25 bloqueios contra 4, e nenhum deles é
contradição estrutural entre changes — são um furo de contrato, duas referências erradas e
uma limpeza de texto incompleta. O contrato de dados fez o que se esperava dele. Mas ver
"4 em vez de 25" e concluir que está pronto seria ler errado: o parecer anterior teve
revisor independente, este não.

---

## Resolução — 2026-08-06, mesmo dia

Os quatro bloqueios foram corrigidos. O que mudou:

**B-T5-1** — `envios_recentes` virou **`tentativas`**, com `ip_hash` renomeada para
`chave_hash` e o `CHECK` do escopo aceitando `inscricao`, `verificacao` e `login`. O que a
chave guarda depende do escopo: hash de IP nos dois primeiros, hash do e-mail normalizado
no terceiro. Continuam sendo **cinco tabelas** — alargar a que existia custou menos que
criar a sexta, e a limpeza por idade e o índice já serviam aos três casos. REQ-32 passou a
listar os limites por escopo, incluindo as 5 tentativas em 15 minutos do login.

**B-T5-2** — `REQ-27` → `REQ-28` no REQ-12.

**B-T5-3** — a fila saiu de onde ainda estava:

- `shared/conteudo.ts`: `REGRAS_ATENDIMENTO` perdeu a primeira regra e ficou com duas;
  as três repetições de "A vaga entra em fila…" nas páginas de serviço viraram "Seu
  interesse fica registrado e a associação entra em contato pelo telefone que você
  informar"; "Se há critério de prioridade na fila" virou "Como a associação organiza a
  ordem dos atendimentos"; e o texto de Orientações Gerais deixou de dizer que explica
  "como funciona a fila".
- `site-institucional` REQ-6 perdeu a regra da fila e **ganhou a proibição explícita**,
  com um cenário que falha se qualquer uma das 17 páginas contiver "entra em fila" ou
  "fila de vagas". O teste passou de guardião da frase a guardião da ausência dela.
- `consentimento-e-privacidade`: "sai da fila" virou "deixa de constar como interessada
  em atendimento".

As ocorrências que sobraram no conteúdo são de outra coisa e ficam: fila do SUS, vagas de
curso e vagas de emprego da Lei de Cotas.

**B-T5-4** — REQ-21 passou a dizer que grava em `consentimentos`, nunca em coluna de
`usuarios`.

`npm run lint`, `npm run typecheck`, `npm test` e `prettier --check`: verdes.

```
Gate T5, segunda passada                 Resultado: READY ✓ (com ressalva)
```

**A ressalva é a mesma da abertura**: quem revisou escreveu. O veredito vale para o que
varredura mecânica alcança — contradição entre changes, referência quebrada, requisito
órfão, valor repetido. **Não vale como leitura de mérito.** Antes de a primeira migration
ir para o D1, um revisor independente deve passar em `modelo-de-dados`.
