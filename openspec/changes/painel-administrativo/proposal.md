# Proposal: painel administrativo

- ID: PROP-20260807-painel-administrativo
- Origem: decisões do dono em 2026-08-07, ampliadas pelo pedido da APPD em 2026-08-21 e
  fechadas em 2026-08-23
- Dono do conteúdo: Arthur Barbero · Execução: Claude Code
- Status: **pronta para virar spec** — as quatro decisões que a travavam foram tomadas

## Por que existe

Três coisas que hoje não têm dono.

**Ninguém consegue refazer a senha de ninguém.** Quem esquece perde a conta. O
[ADR-016](../../../docs/adr/adr-016-recuperacao-de-senha.md) resolve em dois estágios, e o
primeiro é este painel — é ele que faz o caminho humano deixar de ser promessa vazia: a
secretaria atende o telefone **porque tem a ferramenta**.

**A associação não enxerga os próprios dados.** Hoje ela baixa planilha. Quantas pessoas
procuram fisioterapia, quantas por tipo de deficiência, quantas em cada projeto — nada
disso é consultável.

**O login pesa demais para parte do público.** Pedido da APPD, trazido pelo dono em
2026-08-21: quem atende precisa poder cadastrar a pessoa que está na frente dele.

Isto **supersede** a parte do [ADR-014](../../../docs/adr/adr-014-inscricao-como-registro-de-interesse.md)
que empurrava o painel para a V1.1.

## As quatro decisões que travavam esta change

Estavam registradas aqui como pendentes desde 2026-08-21. O dono fechou as quatro em
2026-08-23, e três delas mudam o produto.

| Questão                               | Decisão                                                               |
| ------------------------------------- | --------------------------------------------------------------------- |
| Quem marca o consentimento do Art. 11 | **O atendente**, no cadastro presencial                               |
| Como a senha chega à pessoa           | **Senha provisória** entregue no balcão, **sem troca obrigatória**    |
| Quem não tem e-mail                   | **Não é problema do sistema** — resolve-se no balcão                  |
| Perfis                                | **Dois**: administrador, com acesso a tudo, e o usuário comum de hoje |

### O que cada uma custa, escrito antes de a spec começar

**A senha provisória vira a senha definitiva.** Sem troca obrigatória e sem "esqueci minha
senha" — que depende do domínio, [ADR-016](../../../docs/adr/adr-016-recuperacao-de-senha.md)
— a senha que o atendente entregou é a que a pessoa vai usar por tempo indeterminado. Ela
foi gerada por outra pessoa, escrita num papel e conhecida por quem atendeu. É o custo
aceito, e ele encolhe no dia em que a recuperação existir.

**Dois perfis significam que administrador vê tudo.** Quem cadastra no balcão é a mesma
conta que exporta o CSV com o campo 12 de todos. Uma conta administrativa comprometida
entrega o cadastro inteiro, e a única defesa é a trilha de auditoria — que registra depois,
e não impede antes. Foi escolha do dono pela simplicidade, e está aqui para que ninguém
descubra isso lendo o código.

**O e-mail continua obrigatório.** Nada muda no modelo: `usuarios.email` segue sendo a chave
do login e o sal da derivação. Quem chega sem endereço é caso de balcão, e o sistema não
tem nada a dizer sobre isso.

## Escopo

### Perfis e acesso

**Dois perfis, numa base só de usuários, com coluna de perfil.** Duas bases significariam
dois caminhos de login, duas derivações de senha e dois lugares para errar segurança — e
quebrariam no caso que vai acontecer: alguém da secretaria que também é associado teria duas
contas com o mesmo e-mail.

- **`administrador`** — acesso a tudo o que este painel oferece.
- **O perfil comum**, que é o que toda conta tem hoje.

> **Sobre o nome do segundo perfil.** O dono chamou os dois de "administrador e voluntário".
> `voluntario` colide com um sentido que a palavra já tem neste projeto desde 2026-08-21 —
> quem se cadastra **sem** deficiência para ajudar a associação —, e o perfil comum vale para
> todo mundo, inclusive quem é atendido. A spec precisa de um nome que não confunda as duas
> coisas; a sugestão é `associado`, e a escolha é do dono.

As colunas pessoais de `usuarios` já são anuláveis (a exclusão anonimiza), então
administrador com e-mail e senha e o resto vazio cabe sem gambiarra.

**Como nasce o primeiro administrador.** Não há tela para isso, e não pode haver: uma tela
que cria o primeiro administrador é uma tela que cria o segundo se alguém a alcançar antes.
A promoção da primeira conta é feita **por comando**, contra o banco, por quem tem a chave
da Cloudflare — o mesmo nível de acesso que já poderia fazer qualquer coisa. Depois disso, é
o administrador quem cria os outros.

A proposta anterior tinha um perfil `root` que existia só para criar o primeiro
administrador. Com dois perfis, ele perde o objeto: o que o `root` faria é exatamente o que
o comando faz, e um perfil a mais é uma superfície a mais.

### Gerência de contas

- Listar e buscar associados.
- Ver a ficha de um associado.
- **Refazer a senha** — gerando uma provisória, nunca escolhendo a senha da pessoa e nunca
  vendo hash.
- Ativar e inativar cadastro.
- **Criar a conta no lugar da pessoa**, com ela ali na frente.

#### O cadastro presencial

A porta continua sendo **e-mail e senha**, com a derivação do
[ADR-005](../../../docs/adr/adr-005-parametros-do-scrypt.md). Não nasce um segundo caminho de
autenticação — nada de entrar por CPF, por código de balcão ou por sessão sem senha. Dito
pelo dono com todas as letras:

> não quero outro tipo de login, só formas de ter como o administrador fazer e gerenciar os
> usuários

O que nasce é a capacidade de **um atendente preencher o formulário no lugar da pessoa**. Na
prática, é a mesma tela de inscrição que já existe, com três diferenças:

1. **Quem está autenticado é o atendente**, e não a pessoa cadastrada.
2. **A senha é gerada pelo sistema** e entregue no balcão.
3. **A origem do registro é o painel**, e não `/atendimento/inscricao` — os consentimentos
   já guardam de onde vieram, e essa coluna passa a distinguir os dois caminhos.

**A derivação da senha acontece no navegador do atendente**, e não no da pessoa. O desenho
do ADR-005 continua exato — o servidor recebe a chave derivada e nunca a senha —, mas quem
digitou não foi a titular, e o registro precisa poder dizer isso. É o que a origem faz.

**O consentimento do Art. 11 é registrado pelo atendente**, com a origem própria. Decisão do
dono em 2026-08-23.

### Relatórios

- **Exportação em CSV sobre todos os dados**, com filtros. Inclui o campo 12 — decisão do
  dono em 2026-08-07: existe consentimento registrado, e a associação precisa dos próprios
  números. CSV, e não `.xlsx`: abre no Excel igual, sem dependência nova e sem estourar o
  orçamento de CPU do Worker.
- **Exportação em PDF**, mais apresentável, com **menos filtros** que o CSV: uma listagem
  bonita de associados e suas escolhas já serve.
- Filtros relevantes: tipo de deficiência, atendimento procurado, projeto, dias, bairro,
  situação, período de cadastro.

### Trilha de auditoria

Toda ação administrativa sobre a conta de outra pessoa grava **quem fez, o quê e quando** —
inclusive exportação de relatório e criação de conta. Sem isso, "a secretaria refez a senha"
é afirmação sem prova, e num sistema com dado de saúde isso não se sustenta.

Com dois perfis e administrador vendo tudo, a trilha deixa de ser boa prática e passa a ser
**a única defesa que sobra**. Ela precisa ser escrita antes das telas, e não depois.

## Fatiamento sugerido

A change é grande demais para uma entrega só, e as partes têm riscos muito diferentes. A
sugestão, em ordem:

| Fatia                             | O que entrega                                                 | Por que nesta ordem                                                    |
| --------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **1. Perfil, acesso e auditoria** | coluna de perfil, guarda de rota, tabela e gravação da trilha | nada administrativo deve existir antes do que registra o que foi feito |
| **2. Refazer senha**              | listar, buscar, ficha, senha provisória                       | é o que o ADR-016 espera, e o que a secretaria pede ao telefone        |
| **3. Cadastro presencial**        | a tela de inscrição operada pelo atendente                    | depende de 1 e 2, e é a que mexe em consentimento                      |
| **4. Relatórios**                 | CSV com filtros, PDF, e os "Outro" agrupados por frequência   | a mais perigosa: exportação em massa do campo 12                       |

Cada fatia fecha com gate próprio. A 4 não começa antes de a 1 estar no ar e funcionando.

## Fora de escopo

- **Qualquer forma nova de autenticação.** A porta continua sendo e-mail e senha.
- Edição do cadastro de terceiro pelo administrador. Ele **cria** a conta, refaz senha e muda
  situação; corrigir dado depois é da própria pessoa (ADR-014).
- Painel com gráfico, cruzamento livre ou ferramenta de exploração. Ver a seção abaixo.
- Envio de e-mail. É o segundo estágio do ADR-016 e depende do domínio.
- Troca obrigatória de senha no primeiro acesso — decisão do dono: a pessoa troca quando
  quiser, pela recuperação, que virá depois.

## O que a análise dos dados achou, e contraria a suspeita inicial

O dono levantou que o jeito como as escolhas estão guardadas dificultaria o relatório —
`deficiencias`, `atendimentos` e `dias` são **arrays JSON em coluna de texto**
([ADR-008](../../../docs/adr/adr-008-multipla-escolha-como-json-em-texto.md)).

**Medido em 2026-08-07, no D1 local: não dificulta.** O SQLite tem `json_each`, e a
agregação sai numa consulta:

```sql
SELECT j.value AS deficiencia, COUNT(*) AS n
FROM inscricoes_atendimento, json_each(deficiencias) AS j
GROUP BY j.value
```

Rodou e devolveu a contagem por tipo. **Nenhuma mudança de schema é necessária** para os
filtros que a associação precisa.

A limitação real é outra, e é menor: não há índice sobre o conteúdo do JSON, então cada
consulta varre a tabela. Para uma associação com centenas — ou alguns milhares — de
registros, isso é irrelevante. Se um dia deixar de ser, o caminho é tabela de ligação, e
não trocar o formato.

### A fraqueza que existe de verdade

Os campos **`deficiencia_outro` e `atendimento_outro` são texto livre**. Texto livre não
agrupa: "cadeirante", "usa cadeira de rodas" e "cadeira de rodas" viram três linhas
distintas num relatório. É a única coisa que compromete o número.

O remédio **não é mudar o schema**: é curadoria periódica — o administrador vê o que mais
apareceu em "Outro" e o dono decide promover à lista fechada. A change deve entregar a
**tela que mostra os "Outro" agrupados por frequência**, que é o insumo dessa decisão.

### O que o modelo responde hoje, sem mudar nada

Pessoas por tipo de deficiência · por atendimento procurado · por projeto · por dia da
semana · por bairro e município · por situação · por período de cadastro · com e sem foto ·
com e sem inscrição · faixa etária, derivada de `nascimento`.

O que ele **não** responde, e é bom saber antes: nada sobre atendimento **prestado** —
quantas sessões, com quem, quando. O site guarda **registro de interesse**, não prontuário
(ADR-014, ADR-017). Relatório de atendimento realizado exigiria um produto diferente, e
está fora daqui.

## Impacto

- **Toca dado sensível?** Sim, e mais que qualquer change anterior: exportação em massa do
  campo 12, e criação de conta por terceiro. Exige trilha de auditoria antes de qualquer
  tela.
- **Toca produção / custo real?** Não. Mesmo Worker e D1.
- **Schema**: coluna de perfil em `usuarios` e tabela de auditoria. Como `modelo-de-dados`
  está arquivada, vale a regra do adendo dela — coluna nova cabe; tabela nova é mudança de
  contrato e reabre a change.
- **Migration**: recriação de tabela, com a lição de 2026-08-21 valendo — o D1 local com
  banco vazio não prova nada sobre o D1 remoto com dados, e migration não leva comentário de
  bloco.

## Decisões que ainda faltam, e não travam a spec

1. **O nome do perfil comum** (ver a nota acima). Trava só a migration, não o desenho.
2. **Quem é administrador na APPD**, e quantas contas existem no começo. É informação da
   associação, não decisão de produto.

## Próximo passo no fluxo

proposal (este) → **spec com critérios Gherkin** → tasks → design das telas no Claude
Design → implementação, fatia por fatia.

**Nada começa antes da spec.** A regra do `CLAUDE.md` vale inteira aqui, inclusive a de
nenhuma tela antes do design aprovado.
