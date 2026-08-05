# Parecer do gate — 2026-08-05

Revisor: Especificador (papel `revisor-spec`), sem poder de decisão sobre mérito — apenas
sobre forma, ambiguidade, testabilidade e escopo. Poder de veto exercido.

Escopo revisado: as seis changes de `openspec/changes/`, contra `openspec/README.md`,
`docs/adr/README.md`, `docs/campos-formulario.md`, `docs/pendencias-appd.md` e `CLAUDE.md`.

**Nenhuma das seis passa.** Isso não é reprovação do trabalho: as seis specs são densas,
com Gherkin de verdade e fora-de-escopo explícito. O que reprova é o que só aparece quando
as seis são lidas juntas — cinco changes escrevem contratos diferentes para as mesmas
rotas, três algoritmos incompatíveis para o mesmo número, e dois campos que nenhuma change
cria mas três consomem.

## Veredito por change

| Change                        | Veredito      | Bloqueios nomeados                                                                                                 |
| ----------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `site-institucional`          | **NÃO-READY** | B1 PIX, B2 dado sensível em `/sobre` e galeria, B3 contagem 17/18, B4 ADR-010/011                                  |
| `consentimento-e-privacidade` | **NÃO-READY** | B5 `usuario_id`, B6 `/area/excluir` triplo, B7 REQ-17 inexequível, B8 ADR-006, B9 REQ-11 ambíguo                   |
| `cadastro-e-login`            | **NÃO-READY** | B10 `numero_registro` duplicado, B11 foto 5 MB × 10 MB, B12 `situacao` órfã, B13 bloqueio enumera, B14 ADR-005     |
| `formulario-atendimento`      | **NÃO-READY** | B15 REQ-42 órfão, B16 confirmação promete fila sem leitor, B17 sem `usuario_id` a área não lê, B18 ADR-007/008/009 |
| `cracha-do-associado`         | **NÃO-READY** | B10, B11, B12, B19 sem Definition of Ready, B20 `/area/cracha` triplo, B21 IP sem regra                            |
| `area-do-associado`           | **NÃO-READY** | B17, B6, B20, B22 escopo diz 4 rotas e requisitos entregam 5, B23 contrato de exclusão divergente                  |

Transversal às seis: **B24 — a régua de acessibilidade tem dois valores diferentes** no
projeto (detalhe na seção própria).

### `site-institucional`

- **B1 — a chave PIX é uma invenção com cara de dado real.** O REQ-24 diz que chave PIX
  "nunca é inventada, nem como placeholder", e que "só entra dado real publicado". O
  cenário de aceite correspondente verifica que "ela é idêntica ao CNPJ registrado da
  associação". Isso não prova nada: um CNPJ é um CNPJ; **chave PIX-CNPJ só existe se a
  associação a registrou no banco dela**, e `docs/pendencias-appd.md` P0-2 diz que a chave
  "não está publicada em lugar nenhum" e continua sendo pergunta aberta. A task B.1 admite:
  "a estrutura do payload BR Code e o CRC foram conferidos; que o banco aceite, não". O
  cenário é, portanto, **não testável para o que importa**: passa verde com uma chave que
  não recebe dinheiro. Efeito no doador: QR que falha no app do banco, na única tela que
  traz receita. Correção: ou B.1 é executada (escanear com app de banco real) antes de
  `/doar` sair do estado de rascunho, ou o bloco do PIX recebe o mesmo selo "A confirmar"
  do resto e o cenário passa a exigir a confirmação prática, não a igualdade com o CNPJ.
- **B2 — os dois riscos de dado pessoal do próprio site não viraram requisito.** R2 (nome
  do presidente com histórico clínico — dado de saúde, Art. 11) e R3 (galeria com rostos de
  assistidos, sem termo de imagem) estão em `docs/pendencias-appd.md` e nas tasks B.4/B.5,
  mas **não existe nenhum REQ nem nenhum cenário Gherkin** que impeça a publicação desse
  conteúdo. `consentimento-e-privacidade` empurrou o texto do presidente para cá no
  fora-de-escopo dela; aqui ele não foi recebido por requisito nenhum. Buraco de escopo
  entre duas changes: o controle mais sensível do site ficou sem dono. Correção: REQ novo
  em `site-institucional`, com cenário que falhe enquanto B.5 e o termo de imagem de R3 não
  existirem — na mesma forma dos cenários de `[A CONFIRMAR]` que a change já sabe escrever.
- **B3 — a contagem de páginas não fecha.** REQ-1 diz "12 rotas públicas que renderizam 18
  páginas" e lista 17 caminhos; os `Exemplos` do Gherkin listam 17; três esquemas dizem
  "as 18 páginas do REQ-1 mais a 404" — somando a 404 duas vezes, se ela já está nas 18; e
  o REQ-33 exige que o `sitemap.xml` traga "as 18 URLs públicas", o que colocaria a 404 no
  sitemap. Quem for escrever o teste tem de adivinhar entre 17 e 18. Correção: fixar
  "17 URLs públicas + a 404", e o sitemap com 17.
- **B4 — ADR com número já ocupado.** As tasks 7.1 e 7.2 mandam escrever `adr-003-*` e
  `adr-004-*`; 003 e 004 já existem (foto BLOB e liberação imediata). `docs/adr/README.md`
  reservou **010 e 011** para esta change. As tasks não foram atualizadas.
- Além dos bloqueios, três defeitos menores de forma: `Exemplos:` em prosa ("as 18 páginas
  do REQ-1") não é tabela e não roda; REQ-8 tem aceite disjuntivo (busca real **ou** campo
  removido), o que é legítimo mas exige a decisão do dono antes da task, não depois.
- **O que está bom:** a marcação de estado por requisito ([FEITO]/[PARCIAL]/[PENDENTE]) com
  a ressalva de que "feito" não é "provado" é o melhor padrão de honestidade das seis.

### `consentimento-e-privacidade`

- **B5** — contradição A, arbitrada abaixo.
- **B6** — `/area/excluir` com três donos e três contratos incompatíveis, arbitrado abaixo.
- **B7 — REQ-17 não é executável com o modelo de dados existente.** O requisito manda a
  exclusão apagar "o campo de tipo de deficiência". Esse campo vive em
  `inscricoes_atendimento`, tabela que — por decisão explícita de `formulario-atendimento`
  — **não tem `usuario_id`**. Não há chave para localizar as inscrições da pessoa. O REQ é
  verificável no papel e impossível no código. Mesma raiz do B5.
- **B8 — ADR.** A task T1 entrega `docs/adr/adr-003-<slug>.md`; 003 está ocupado e o README
  reservou **006**.
- **B9 — ambiguidade em REQ-11.** "DEVE exigir novo aceite" convive com "enquanto o novo
  aceite não é dado, o tratamento anterior permanece válido e a conta continua acessível";
  o Gherkin diz "o sistema **pede** o aceite". Exigir e pedir são coisas diferentes: um
  leitor implementa modal bloqueante, outro implementa aviso dispensável. Não há cenário
  para "a pessoa fecha o aviso e continua" — que é o caso mais provável. Correção: definir
  em uma frase se o aviso é dispensável, quantas vezes reaparece, e escrever o cenário.
- **B25 (menor) — "alterar meus dados" tem três donos.** REQ-16 daqui, REQ-31 de
  `cadastro-e-login` e REQ-15/16 de `area-do-associado` especificam a mesma correção de
  telefone. O Gherkin desta change chega a testar a tela da vizinha ("ele corrige o
  telefone pela área do associado"). Um contrato precisa ceder.
- **O que está bom:** a tabela de base legal conferida na fonte, com data, e o REQ-10
  (proibir IP e user-agent no registro de consentimento) são exemplares. Minimização
  escrita como requisito, não como intenção.

### `cadastro-e-login`

- **B10 — dois algoritmos incompatíveis para o mesmo `numero_registro`.** REQ-4 aqui:
  unicidade garantida pelo banco com nova tentativa, e "ler o maior sequencial e somar 1
  **não satisfaz** este requisito". Task T1.2 de `cracha-do-associado`: "transação que **lê
  o maior sequencial do ano** e grava o próximo". E o REQ-5 de lá exige números "distintos
  e **consecutivos**, sem buraco silencioso na sequência" — o que a retentativa desta
  change não garante. Duas tasks vão implementar o mesmo emissor, de dois jeitos, e cada
  uma reprova no gate da outra.
- **B11 — a foto tem dois limites.** REQ-22 daqui aceita até **5 MB** no cadastro e grava
  via `ArmazenamentoFoto`. REQ-9 de `cracha-do-associado` aceita até **10 MB** e exige que o
  que chega ao servidor seja **400 × 500 px, ≤ 102.400 bytes**, revalidado pelos bytes
  (REQ-14). Uma foto aceita pelo cadastro segundo o REQ-22 é rejeitada pelo REQ-14 do
  crachá. O upload do cadastro grava algo que o crachá recusa.
- **B12 — `situacao` não é criada por ninguém.** `/verificar/<numero>` (cracha REQ-28,
  REQ-31) e a prévia da área (REQ-12) dependem de `situacao` ∈ {`ativo`,`inativo`}. A lista
  mínima de colunas de `usuarios` (REQ-1 daqui) não a inclui, nenhuma change cria a coluna e
  nenhuma define quem escreve a transição — a proposal do crachá registra como
  `[A CONFIRMAR]` se a APPD pode inativar. Três consumidores, zero produtor.
- **B13 — a proteção contra enumeração tem um furo que ninguém nomeou.** REQ-25 e REQ-27
  igualam mensagem, status, corpo e tempo entre senha errada e e-mail inexistente. Mas o
  REQ-26 manda bloquear "para um mesmo e-mail" após 5 tentativas, com tela que diz o tempo e
  o horário de liberação: **e-mail inexistente nunca bloqueia**, então cinco tentativas
  bastam para descobrir se a conta existe. O REQ-26 não exige comportamento idêntico para
  e-mail inexistente, e não há cenário sobre isso. Correção: o contador vale para a chave
  digitada, exista conta ou não, e a tela de bloqueio é idêntica nos dois casos.
- **B14 — ADR.** T-1 entrega `adr-003-parametros-do-scrypt.md`; reservado **005**.
- Defeitos de rastreabilidade: a proposal cita "REQ-25 e REQ-26" para o risco R-1 (na spec
  são REQ-28 e REQ-29) e "REQ-30" para o estado vazio de inscrições (é REQ-32). Mapa errado
  é o que faz alguém implementar o requisito vizinho.
- **O que está bom:** o vocabulário no topo (o que é "conta", "sessão expirada", "custo
  zero") elimina dupla leitura antes de o requisito aparecer. Deveria ser copiado nas seis.

### `formulario-atendimento`

- **B15 — REQ-42 é um bloqueio disfarçado de requisito.** A própria tabela de
  rastreabilidade registra "sem cenário, exige decisão". Requisito cujo conteúdo é "existe
  uma contradição não resolvida" não é contrato: é item de pauta. Honesto, e ainda assim
  reprova o gate — nenhuma spec vira task com um REQ órfão declarado.
- **B16 — a confirmação promete uma fila que ninguém opera.** REQ-32 manda a tela dizer que
  "o cadastro entra na fila de vagas". Na V1 **ninguém lê a tabela** (painel é V1.1) e
  **ninguém muda status** (REQ-45), então toda inscrição fica eternamente `Na fila`. Isso
  colide de frente com o REQ-26 de `site-institucional`: "nenhuma tela pode prometer um
  efeito que não acontece". A change trata o risco como gate de publicação (T9), o que está
  certo, mas o texto da confirmação continua sendo uma promessa não cumprida. Ver a seção
  "O que impede a publicação".
- **B17** — sem `usuario_id`, `area-do-associado` não consegue listar inscrição nenhuma.
  Arbitrado abaixo junto com A.
- **B18 — ADR.** T0 entrega `adr-003`, `adr-004` e `adr-005`; 003 e 004 estão ocupados e o
  README reservou **007, 008 e 009**.
- Defeito de rastreabilidade: a proposal manda a frase honesta do prazo para o "REQ-17"; é
  o REQ-33.
- **O que está bom:** REQ-16 (a máscara nunca bloqueia a digitação, com tabela de colagens)
  e REQ-28 (erro nunca apaga resposta, testado em cinco caminhos de falha) são os melhores
  requisitos de acessibilidade real do conjunto — acessibilidade que não vira relatório de
  axe.

### `cracha-do-associado`

- **B19 — não tem seção de Definition of Ready.** É a única change, junto com
  `area-do-associado`, que não se autoaudita e não emite veredito próprio nem lista
  bloqueios com dono. A `tasks.md` delega isso a T0.3 ("rodar o gate"), o que inverte a
  ordem: o gate confere a autoauditoria, não a substitui.
- **B10, B11, B12** — acima.
- **B20 — `/area/cracha` tem três donos.** Aqui (seis estados, recorte, compressão,
  exportação), em `cadastro-e-login` REQ-33 (exibir número, enviar/substituir foto) e em
  `area-do-associado` REQ-12–14 + tasks T2.4/T2.5 (prévia, "Ver meu crachá", "Baixar para
  imprimir"). Três contratos, uma tela.
- **B21 — o padrão de privacidade de IP não é o mesmo do projeto.** REQ-33 limita a
  verificação a 20 consultas por minuto por IP e **não diz como o IP é tratado**;
  `formulario-atendimento` REQ-4 proíbe IP em texto claro e exige HMAC com segredo. Mesma
  categoria de dado, duas regras. Correção: uma regra só, escrita onde ela nasce.
- Defeito de rastreabilidade: a proposal cita "REQ-24" para o cálculo de capacidade; é
  REQ-36/REQ-37.
- **O que está bom:** REQ-29 e REQ-30 (resposta byte a byte idêntica para número
  inexistente e mal formatado, com a mesma consulta ao banco nos dois casos) fecham o canal
  lateral de tempo. É o requisito de privacidade mais bem escrito das seis changes.

### `area-do-associado`

- **B22 — o escopo declara quatro rotas e os requisitos entregam cinco.** A proposal lista
  `/area`, `/area/inscricoes`, `/area/dados` e `/area/excluir`; os REQ-12 a REQ-14, o
  Gherkin e as tasks T2.4/T2.5 entregam também `/area/cracha`. Fora-de-escopo furado dentro
  da própria change.
- **B23 — o contrato de exclusão diverge dos vizinhos.** REQ-26 daqui lista o que apaga e
  **não menciona** preservar o `numero_registro`; `cadastro-e-login` REQ-35 exige preservá-lo
  e impedir reuso; `consentimento-e-privacidade` REQ-17 manda apagar "conta … e o crachá".
  E o REQ-27 daqui deixa `[A CONFIRMAR]` o que `/verificar/<numero>` faz depois da exclusão,
  enquanto `cracha-do-associado` REQ-28 garante HTTP 200 com nome, número e situação para
  todo número. Três listas de exclusão diferentes para os mesmos dados.
- **B17** — REQ-8, REQ-9 e REQ-10 (listar inscrições da pessoa) são inexequíveis: não há
  chave ligando inscrição a associado. É o bloco central da change.
- **B6, B20** — acima.
- **Dependência não declarada:** a change vizinha registrou o conflito de escopo (risco R-8
  de `cadastro-e-login`, com dono e caminho de decisão); esta **não menciona o conflito em
  lugar nenhum**, e ainda atribui o `numero_registro` a `cracha-do-associado` nas premissas,
  quando `cadastro-e-login` reivindica a geração. Sem Definition of Ready também aqui.
- **O que está bom:** REQ-5 (nenhuma tela da área renderiza tipo de deficiência, nem em
  `data-*`, comentário ou JSON embutido) com a task T6.1 de varredura bloqueante é a forma
  certa de transformar uma proibição em teste.

### B24 — a acessibilidade é de primeira classe nas seis, com duas réguas diferentes

Nas seis changes a acessibilidade é requisito bloqueante de verdade, não apêndice: tem REQ
próprio, cenário Gherkin, task de verificação com veto do QA e, em quatro delas, teste que
segura o gate. Isso está certo e é o melhor traço do conjunto. O problema é a régua:

| Change                        | Critério de aprovação no axe                  |
| ----------------------------- | --------------------------------------------- |
| `site-institucional`          | zero violação de impacto `serious`/`critical` |
| `cracha-do-associado`         | zero violação de impacto `serious`/`critical` |
| `area-do-associado`           | zero violação de impacto `serious`/`critical` |
| `cadastro-e-login`            | zero violação de **nível A ou AA**            |
| `consentimento-e-privacidade` | zero violação de **nível A ou AA**            |
| `formulario-atendimento`      | zero violação de **nível A ou AA**            |

São eixos diferentes: `serious`/`critical` é a severidade que o axe atribui; nível A/AA é a
conformidade WCAG. Uma violação de AA com impacto `moderate` — rótulo de campo ligado por
`aria-labelledby` quebrado, por exemplo — **reprova em três changes e passa em três**, no
mesmo site, para o mesmo público. `CLAUDE.md` diz que WCAG 2.2 AA é o produto; a régua que
mede isso é a de nível, não a de severidade.

**Recomendação:** uma régua só, escrita uma vez — zero violação de nível A ou AA, com as de
severidade `moderate`/`minor` fora de AA virando lista com dono e prazo, como
`site-institucional` REQ-21 já propõe. Sendo um número igual nas seis, ele vive em um lugar
só (a configuração do axe no CI), não em seis specs.

Um segundo desalinhamento na mesma família, menor: o alvo de toque tem `≥ 44 px` em cinco
changes e `≥ 44 px com 8 px de folga` em `area-do-associado` (REQ-31). Folga entre alvos é
critério bom — só precisa valer para as seis ou para nenhuma.

## Contradições arbitradas

Arbitragem = recomendação fundamentada do revisor. A decisão de mérito é do dono; o que o
gate exige é que **exista uma decisão registrada** antes de qualquer task.

### A — `consentimentos.usuario_id NOT NULL` × formulário preenchido sem conta

As duas não podem estar certas, e a incompatibilidade é maior do que o enunciado: ela
também derruba o REQ-17 de `consentimento-e-privacidade` (apagar o tipo de deficiência sem
chave para achá-lo) e os REQ-8 a REQ-10 de `area-do-associado` (listar "minhas inscrições"
sem vínculo). Um mesmo furo, três changes.

**Recomendação: tornar o vínculo opcional e o registro do aceite polimórfico.** Ou seja:
`consentimentos.usuario_id` passa a ser NULL-ável, ganha ao lado uma coluna `protocolo`
(NULL-ável), e a tabela passa a exigir por CHECK que **exatamente um dos dois** esteja
preenchido. O aceite do Art. 11 feito sem conta se ancora no protocolo da inscrição; o
feito com conta, no usuário. As colunas de consentimento duplicadas em
`inscricoes_atendimento` (REQ-39) saem — dois registros do mesmo aceite é o começo de dois
históricos que divergem.

Por quê: (1) a alternativa "exigir conta para pedir atendimento" muda a regra de negócio da
APPD, que hoje atende quem preenche um Google Forms sem cadastro — não é decisão do
projeto; (2) a alternativa "manter dois registros separados" faz a revogação do
consentimento (REQ-13) não alcançar a inscrição, que é justamente onde o dado sensível
está; (3) o vínculo opcional resolve de graça o `usuario_id` que `area-do-associado`
precisa: quem tem conta e preenche autenticado fica ligado, quem não tem, não.

Custo assumido: quem preencheu sem conta não vê a inscrição na área — e isso precisa estar
escrito na tela de confirmação, não descoberto depois.

**Vira ADR** (o novo número, depois da renumeração da seção final), com as duas specs na
mesa. Enquanto não sair, nem `formulario-atendimento` nem `consentimento-e-privacidade`
liberam task de persistência.

### B — `cadastro-e-login` × `area-do-associado` disputando `/area`

Confirmo a divergência e ela é pior do que descrita: são **três** changes sobre `/area`, não
duas. `consentimento-e-privacidade` REQ-17/REQ-18 também reivindica `/area/excluir` — e com
contrato incompatível: **três telas** (pedido, confirmação, recibo) e **uma** caixa de
seleção, contra **uma** página e **duas** caixas nas outras duas changes. E `/area/cracha` é
reivindicada por `cadastro-e-login` REQ-33, `cracha-do-associado` e `area-do-associado`.

O `openspec/README.md` original separa autenticação em `cadastro-e-login` e telas da área em
`area-do-associado`. As specs **não** refletem isso: `cadastro-e-login` absorveu a área
(Grupo G, REQ-30 a REQ-35, declarado como "absorção de escopo" na proposal e como risco R-8),
e `area-do-associado` escreveu as mesmas rotas sem sequer registrar o conflito.

**Recomendação: valer o README original.** `area-do-associado` é a dona de `/area`,
`/area/dados`, `/area/inscricoes` e `/area/excluir`. `cadastro-e-login` fica com `usuarios`,
senha, sessão, login, logout, recuperação e a **guarda de rota** de `/area/*` (REQ-13) — e
perde REQ-30 a REQ-35 e as tasks T-10 e T-11. `cracha-do-associado` é a dona de
`/area/cracha` inteira, incluindo o envio da foto: `cadastro-e-login` REQ-22 deixa de aceitar
foto no cadastro e passa a apontar para lá (o que também resolve o B11, os 5 MB × 10 MB).
`consentimento-e-privacidade` fica com `/privacidade`, `/seus-direitos`, o catálogo de termos
e o registro do aceite, e **cede o fluxo de exclusão** para `area-do-associado`, mantendo
apenas os requisitos de conteúdo que a tela de exclusão precisa exibir (o que é retido, por
que, e a base legal).

Por quê: é a fronteira que o README já publicou, é a que a própria `cadastro-e-login`
recomenda no R-8, e é a que produz o menor retrabalho — `area-do-associado` é mais detalhada
em estado de tela (carregando, sem foto, degradação por bloco), que é o que essa tela é.

Sobre a exclusão em si: **duas caixas de seleção, uma página**. A versão de três telas do
`consentimento-e-privacidade` (pedido → confirmação → recibo) acrescenta dois passos de
navegação a um fluxo que o público deste site percorre com dificuldade motora; a fricção
necessária já vem das duas caixas, e as três changes concordam em proibir digitar palavra de
confirmação. O recibo vira um bloco na mesma página, não uma rota.

Consequência que precisa ser executada junto: `cadastro-e-login` perde `numero_registro` para
`cracha-do-associado`, **ou** o contrário — mas não os dois (ver A e a seção de ordem: é aqui
que nasce o único ciclo real de dependência do conjunto).

### C — enumeração de usuários: login protege, cadastro entrega

A spec **trata**, não só registra: o risco tem número (R-6), pergunta (Q-1), dono nomeado
(Arthur Barbero), exige ADR, e o REQ-18 diz por escrito que será reescrito se a decisão for
outra. Isso é o padrão certo. Três reparos:

1. O cenário de aceite **já fixa a mensagem que vaza** ("Este e-mail já tem uma conta.").
   Enquanto Q-1 não for respondida, esse cenário é um teste que blinda a decisão ainda não
   tomada. Ele precisa ficar marcado como condicional, como os `[condicional a R-1]` da
   recuperação de senha — a change já sabe fazer isso.
2. O vazamento tem **três portas, não uma**, e só a do cadastro foi mapeada: o REQ-31
   (trocar e-mail com mensagem específica de unicidade) e, principalmente, o REQ-26 — o
   bloqueio por tentativas só acontece para e-mail existente, então cinco tentativas
   respondem a mesma pergunta que a mensagem do cadastro. Ver B13. Fechar só o cadastro e
   deixar o bloqueio aberto é gastar usabilidade sem comprar privacidade.
3. **Recomendação de mérito, para a decisão do dono:** aceitar o vazamento no cadastro,
   como a spec propõe, **e** fechar as outras duas portas. O público deste site paga caro por
   uma mensagem genérica ("não foi possível concluir") que não diz o que fazer; e o vazamento
   do cadastro exige que o atacante já saiba o e-mail-alvo, enquanto o do bloqueio permite
   varrer uma lista. Fechar o barato e caro-de-usabilidade e deixar aberto o caro-de-risco é
   o pior dos dois mundos.

### D — vocabulário de status da inscrição

**Batem.** `formulario-atendimento` REQ-43 define exatamente `Na fila`, `Em atendimento` e
`Encerrada`; `area-do-associado` REQ-9 consome os três valores, com ícone e texto, sem
divergência de grafia. A dependência está declarada nos dois lados. Nada a corrigir aqui.

O que **não** bate é a máquina de estados por trás do vocabulário: REQ-45 proíbe qualquer
rota de alterar `status`, REQ-44 manda toda inscrição nascer `Na fila`, e o único autorizado
a mover — `painel-admin` — é V1.1. Na V1, portanto, os três valores existem no contrato e
**dois deles são inalcançáveis**. O caminho feliz de `area-do-associado` descreve "duas
inscrições com status Na fila e Em atendimento", um estado que a V1 não sabe produzir: é um
cenário que só passa com fixture, nunca com o sistema. Correção mínima: `area-do-associado`
declara que na V1 só `Na fila` ocorre de fato, e o cenário do painel completo é marcado como
dependente de `painel-admin`.

## O que impede a publicação

Publicar aqui = pôr a change no ar com dado de pessoa real, em `*.workers.dev` ou no domínio
da APPD. Em ordem de gravidade.

1. **Ninguém lê as inscrições, e a tela diz que alguém lê.** É o risco de produto central.
   Hoje a associação recebe por Google Forms, e alguém abre aquela caixa. Depois desta change
   a inscrição vai para uma tabela D1 que, na V1, **nenhuma pessoa e nenhuma tela consultam** —
   `painel-admin` é V1.1 —, enquanto a confirmação afirma que "o cadastro entrou na fila de
   vagas" (REQ-32). Isso é exatamente o que o REQ-26 de `site-institucional` proíbe.
   Pior: o formulário **já está no ar em modo demonstração**, linkado pelas nove landing
   pages, e quem preenche hoje sai sem nada — nem linha gravada, nem e-mail para a
   associação. A perda de cadastro **já começou**, antes de qualquer publicação.
   **Exijo antes de ir ao ar, nesta ordem:** (a) resposta da APPD a "quem lê as inscrições
   enquanto o painel não existe" (task T9); (b) enquanto não houver resposta, o
   `/atendimento/inscricao` no ar aponta para o Google Forms atual, não para a tela de
   demonstração — nenhuma change escreveu isso, e é a diferença entre migrar e perder
   cadastro; (c) plano de virada escrito: em que dia o formulário novo passa a valer, quem
   confere que as duas caixas estão vazias no intervalo, e o que acontece com quem preencheu
   no meio. Sem (c), a troca perde inscrições que ninguém vai saber que existiram.
2. **PB-1 sem resposta e a tela de exclusão no ar.** `[A CONFIRMAR]` no lugar do prazo de
   retenção é honesto para um rascunho; publicado, é uma tela de exercício de direito da LGPD
   que não sabe responder o que a associação guarda. Exijo PB-1 e PB-2 (encarregado)
   respondidas antes de `/seus-direitos` e `/area/excluir` receberem dado real.
3. **B2 — o texto do presidente e as galerias com rostos.** Dado de saúde de pessoa
   identificada e imagem de assistidos sem termo. Não pode ir ao domínio da APPD sem B.5 e
   sem o termo de imagem de R3, e hoje não existe requisito que segure isso.
4. **B1 — a chave PIX não escaneada.** Doador que tenta pagar e falha não tenta de novo.
5. **`robots.txt` liberando tudo (REQ-34, PARCIAL).** A task 6.3 acerta ao pôr o robots
   antes do 301: indexação de `/area/` e `/verificar/` não se desfaz. Nenhuma rota
   autenticada pode existir antes dele.
6. **Zero teste de acessibilidade no projeto** (REQ-21, PENDENTE), com `CLAUDE.md`
   prometendo "Vitest + axe" e o `package.json` sem axe. Acessibilidade é o produto; nada de
   novo vai ao ar antes de o passo existir e ser bloqueante no CI.

## Requisitos órfãos e cenários não automatizáveis

**Órfãos** (requisito sem cenário que diga passou/falhou):

- `formulario-atendimento` **REQ-42** — órfão declarado pela própria spec. É bloqueio, não
  requisito.
- `cadastro-e-login` **REQ-7** e **REQ-27** — dependem de `<N, r, p>` e `<limite_ms>` ainda
  não medidos. Cenário existe, mas compara contra um valor que não existe: não é
  automatizável hoje. A própria spec nomeia os dois; mantidos aqui porque bloqueiam a task.
- `cadastro-e-login` **REQ-5** (limite de 99.999 por ano tratado como erro explícito) — sem
  cenário. `cracha-do-associado` cobre o equivalente (REQ-6) por task, não por Gherkin.
- `cadastro-e-login` **REQ-10** (senha/hash/sal fora de log, URL, telemetria) — só existe
  como item de checklist na T-13, sem cenário Gherkin. É o requisito de segurança mais
  importante da change e o único sem teste escrito.
- `cracha-do-associado` **REQ-38** (métrica de ocupação) — coberto só por task.
- `site-institucional` **REQ-24**, na parte do PIX — tem cenário, mas o cenário não testa a
  afirmação do requisito (ver B1). Órfão funcional.
- **`situacao`** — nenhum requisito de nenhuma change cria a coluna nem define quem a
  escreve, e três changes a leem. Órfão ao contrário: consumidor sem produtor.

**Cenários que não dão para automatizar como estão:**

- `site-institucional`: os três blocos `Exemplos: as 18 páginas do REQ-1 mais a 404` não são
  tabela — não geram execução. Reescrever como tabela ou como lista carregada de
  `shared/conteudo.ts`.
- `site-institucional`, "Zoom de 200% preserva conteúdo e função": "todo conteúdo continua
  legível e todo controle continua operável" é julgamento humano. Vira `[manual]` explícito
  (a spec já tem essa convenção e não a usou aqui) ou vira medição objetiva.
- `cadastro-e-login`, "Tempo de resposta não distingue…": 50 medições de mediana com
  `<limite_ms>` indefinido, num runtime compartilhado, é teste instável por construção.
  Precisa de limite medido **e** de política de retentativa, ou vira teste que falha
  aleatoriamente e é desligado no terceiro mês.
- `consentimento-e-privacidade`, "A cópia dos dados inclui o histórico de consentimentos":
  "o mesmo conteúdo é apresentado em tela, legível sem baixar arquivo" — "legível" não é
  verificável. Trocar por asserção sobre os campos presentes na tela.
- `area-do-associado`, "Painel completo": depende de uma inscrição em `Em atendimento`, que
  a V1 não produz (ver D).
- Todos os cenários de exclusão de conta, nas três changes que a especificam: enquanto B6
  não for arbitrado, cada um deles reprova contra o contrato das outras duas.

## Ordem de execução recomendada

Checagem de ciclo: com o `numero_registro` como está — gerado na conclusão do cadastro
(`cadastro-e-login` REQ-2) **e** especificado em `cracha-do-associado` REQ-1 a REQ-7, que por
sua vez depende da sessão de `cadastro-e-login` — **há ciclo**. Ele desaparece assim que a
arbitragem B decidir um único dono do número. Com A e B decididas, o grafo fecha sem ciclo.

**Fase 0 — decisões (nenhuma linha de código).** Não é sequência: é pré-condição.

1. Arbitrar A (vínculo do consentimento) e B (dono de `/area`, de `/area/cracha`, do
   `numero_registro` e do fluxo de exclusão). São as duas que reescrevem requisito em quatro
   changes.
2. Responder Q-1 (C), Q-3 (contador de tentativas) e a decisão de B13.
3. **Renumerar os ADRs das tasks** conforme `docs/adr/README.md` — cinco das seis changes
   apontam para 003/004/005 já ocupados: `cadastro-e-login` T-1 → **005**;
   `consentimento-e-privacidade` T1 → **006**; `formulario-atendimento` T0 → **007, 008,
   009**; `site-institucional` 7.1/7.2 → **010, 011**. As tasks T0.1 e T0.2 de
   `cracha-do-associado` já foram escritas como ADR-003 e ADR-004 e podem ser marcadas
   concluídas. É meia hora de trabalho e evita exatamente a colisão que o README já
   documenta ter acontecido quatro vezes.
4. Levar PB-1 a PB-5, R2, R3 e P0-2 (PIX) à APPD. Roda em paralelo com tudo.

**Fase 1 — `site-institucional`, parte de verificação.** É a única change sem dependência de
banco e já implementada; o que falta é prova. Ordem interna já proposta na `tasks.md` é boa,
com uma inversão: `robots.txt` (6.3) e o teste estrutural (5.4) primeiro, depois axe (5.2),
contraste renderizado (5.1), 301 (6.1), sitemap (6.2). Fechar aqui entrega o passo de axe
bloqueante no CI, que **as outras cinco changes reutilizam** — nenhuma delas precisa montar
a infraestrutura de acessibilidade de novo.

**Fase 2 — `cadastro-e-login`, fundação sem tela.** T-1 (scrypt medido) → T-2 (`usuarios`,
já com `situacao` e com a coluna de vínculo decidida em A) → T-3 (emissor do número, dono
único definido em B) → T-4 (sessão) → T-5 (cadastro no servidor) → T-7 (login, com B13
corrigido) → T-8 (guarda de rota). Nenhuma tela.

**Fase 3 — `consentimento-e-privacidade`, catálogo e páginas.** T4 (catálogo versionado, que
não depende de nada) pode começar já na Fase 1; T5/T6 (tabela e gravação do aceite) esperam
a Fase 2. `/privacidade` e `/seus-direitos` são estáticas e podem sair antes do resto.

**Fase 4 — `formulario-atendimento`.** Depende de A resolvida e do módulo de termos da Fase 3. É a change de maior valor entregue e a primeira que deve ir ao ar — condicionada aos itens
1 e 6 de "O que impede a publicação".

**Fase 5 — `cracha-do-associado`.** Fatias 1 e 2 (número e armazenamento) podem antecipar
para a Fase 2, já que não têm tela; o resto depende do design aprovado.

**Fase 6 — `area-do-associado`.** Última: consome sessão, inscrições, número e foto. É a
change com mais dependências e a que menos sofre por esperar.

Regra que vale para as seis: **nenhuma tarefa de tela começa sem o design aprovado no Claude
Design** (regra central do `CLAUDE.md`). Hoje isso bloqueia tela em cinco das seis changes, e
é o gargalo real do cronograma — não o código.

## O que eu mudaria se pudesse mudar uma coisa só

**Escreveria, antes de qualquer uma das seis, uma spec do modelo de dados compartilhado.**

Seis changes foram especificadas em paralelo, cada uma com excelente disciplina interna, e
todas as contradições que este parecer levanta nascem no mesmo lugar: **as tabelas**.
`usuario_id` NOT NULL contra formulário sem conta; `numero_registro` com dois donos e dois
algoritmos; `situacao` com três leitores e nenhum autor; a foto com dois limites de tamanho;
três listas diferentes do que a exclusão apaga. Nenhuma dessas é ambiguidade de redação —
todas são o mesmo campo descrito por dois contratos que nunca se leram.

Uma spec de domínio compartilhado — as tabelas, as chaves entre elas, quem escreve cada
coluna e quem só lê — teria custado uma sessão e teria eliminado, sozinha, dez dos vinte e
cinco bloqueios deste parecer. Nada disso apareceria como conflito de rota se o vínculo entre
inscrição e associado já estivesse decidido antes de as seis changes começarem a escrever.

Fica como recomendação para a próxima leva: **contrato de dados primeiro, contrato de tela
depois**. A régua do `fluxo-spec` calibra o rito pelo tamanho da mudança; ela ainda não
calibra pelo número de changes que tocam o mesmo dado ao mesmo tempo — e é isso que
aconteceu aqui.

---

## Nota do Claude Code sobre dois pontos do parecer (2026-08-05)

Duas ressalvas ao revisor, registradas para não virarem trabalho desnecessário:

1. **A chave PIX foi conferida.** O parecer trata como bloqueio o fato de a chave nunca
   ter sido escaneada. O dono confirmou em 2026-08-05 que escaneou o QR e ele resolve.
   O bloqueio cai; o que permanece é o requisito de reconferir sempre que o payload
   mudar, porque o CRC não prova que o banco aceita.

2. **O site não está publicado.** O parecer diz que o formulário "perde cadastro hoje".
   Ele roda só em `localhost`: nenhuma pessoa real acessou e nada foi perdido até
   agora. O risco é real, mas materializa **na publicação**, não hoje — e a exigência
   de apontar para o Google Forms enquanto não houver quem leia as inscrições continua
   valendo como condição de virada.

O resto do parecer permanece como está.
