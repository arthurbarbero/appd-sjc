# Spec: Conta, senha e sessão

- ID: SPEC-cadastro-e-login Deriva de: PROP-20260805-cadastro-e-login
- Status: **rascunho** — não é código enquanto não passar no gate da seção
  "Definition of Ready"
- Dono do conteúdo: Arthur Barbero Aprovador da spec: Arthur Barbero
- Versão: v2 Data: 2026-08-06
- **Fonte da verdade das tabelas**: [`modelo-de-dados`](../modelo-de-dados/spec.md)

> **v2 (2026-08-06)** — reescrita contra o contrato de dados, depois do gate. Mudou:
> a conta nasce no formulário de atendimento, não em rota própria
> ([ADR-012](../../../docs/adr/adr-012-cadastro-embutido-no-formulario.md)); saem a foto
> e as quatro telas da área, que passam a ter dono único
> ([ADR-013](../../../docs/adr/adr-013-fronteira-de-rotas-entre-changes.md)); e o
> bloqueio por tentativas deixa de enumerar usuários (bloqueio B13 do gate).

## Objetivo

Dar à conta da APPD-SJC uma senha guardada direito, uma sessão confiável e um número de
registro único e imutável — sem depender de e-mail, sem login social e sem que o sistema
revele a terceiros quem é associado.

**Esta change não tem tela de cadastro e não tem tela da área.** A conta é criada pelo
formulário de atendimento (ADR-012) e as telas de `/area/*` são de `area-do-associado` e
`cracha-do-associado` (ADR-013). O que é daqui: a tabela `usuarios` como consumidora do
contrato de dados, a senha, a sessão, `/entrar`, `/sair`, a redefinição de senha, a
emissão do `numero_registro` e a **guarda de rota** de `/area/*`.

## Vocabulário (termos que teriam dupla leitura)

- **Conta** — linha na tabela `usuarios`, com e-mail e CPF únicos e hash de senha. Uma
  conta é de **uma pessoa atendida** (ADR-012).
- **Associado** — pessoa com conta criada, o que hoje acontece ao enviar o formulário de
  atendimento.
- **Sessão** — cookie selado por `nuxt-auth-utils`. Não há registro de sessão no servidor.
- **Sessão expirada** — cookie ausente, adulterado ou vencido. Os três têm o mesmo efeito.
- **Excluir conta** — o contrato está no `modelo-de-dados` REQ-28, e a tela é de
  `area-do-associado`. Não é "apagar tudo": há dado retido por obrigação legal.
- **Bloqueio de entrada** — recusa temporária de tentativas para um e-mail. Não desativa a
  conta nem exige liberação manual.
- **Requisitos da senha** — o texto exibido **antes** de digitar. Nunca aparecem pela
  primeira vez como mensagem de erro.
- **Custo zero** — sem cobrança e **sem cartão de crédito cadastrado**. Free tier que exige
  cartão não conta como custo zero.

---

## Requisitos

### Grupo A — Dados e domínio

**REQ-1** — A tabela `usuarios` é definida pela spec
[`modelo-de-dados`](../modelo-de-dados/spec.md) (REQ-7). **Esta change não cria, não
renomeia e não remove coluna** — ela é a dona do **comportamento** de `usuarios`: quem
grava a senha, quem emite o número, quem escreve `situacao`.

Mudou em relação à v1: a referência da foto saiu (a foto tem tabela própria, dona de
`cracha-do-associado`), entraram `cpf` e `situacao`, e o aceite do termo deixou de ser
coluna aqui — ele mora em `consentimentos`, append-only.

**REQ-2** — O sistema DEVE gerar o `numero_registro` no formato
`APPD-<ano com 4 dígitos>-<sequencial com 5 dígitos, preenchido com zeros à esquerda>`,
validado pela expressão `^APPD-\d{4}-\d{5}$`, no momento em que o cadastro é concluído
com sucesso — nunca antes, nunca em rascunho. O ano é o ano corrente da conclusão do
cadastro. A coluna DEVE ter restrição de unicidade no banco.

**REQ-3** — O `numero_registro` DEVE ser imutável: nenhuma rota, formulário ou operação
de alteração de dados pode modificá-lo depois de gravado. Uma tentativa de alteração
DEVE ser recusada com erro e registrada em log, sem alterar o valor.

**REQ-4** — O sequencial DEVE ser único **dentro do ano** e resistente a cadastros
simultâneos: duas conclusões de cadastro concorrentes NÃO PODEM produzir o mesmo
`numero_registro`. A garantia DEVE vir da restrição de unicidade do banco, com nova
tentativa em caso de colisão, em no máximo 5 tentativas; esgotadas as tentativas, o
cadastro falha com mensagem de erro e o evento é registrado em log. Ler o maior
sequencial e somar 1 sem restrição de unicidade não satisfaz este requisito.

**REQ-5** — O sequencial DEVE reiniciar em `00001` a cada ano novo, e o limite de
`99999` cadastros por ano DEVE ser tratado como erro explícito, não como estouro
silencioso. Cenário de aceite obrigatório (era órfão no gate): com o sequencial em
`99999`, a conclusão seguinte falha com mensagem própria e evento em log, e **nenhuma
linha parcial** permanece.

**REQ-5a** — **Buraco na sequência é esperado e aceitável.** A retentativa do REQ-4 pula
números; a exigência de sequência consecutiva do `cracha-do-associado` REQ-5 está
revogada (ADR-013). Ninguém é prejudicado por um número faltando, e a alternativa —
"ler o maior e somar 1" — quebra com cadastros simultâneos.

**REQ-5b** — **Esta change é a dona única do `numero_registro`** (ADR-013).
`cracha-do-associado` apenas o exibe. Existe uma função de emissão, num lugar só, e
nenhuma outra rota calcula número.

### Grupo B — Senha

**REQ-6** — O sistema DEVE derivar o hash da senha com `scrypt` do `node:crypto`, com
sal aleatório de no mínimo 16 bytes por usuário, gerado por `randomBytes`, e saída de 64
bytes. A senha em texto claro NÃO PODE ser persistida em lugar nenhum.

**REQ-7** — Os parâmetros `N`, `r` e `p` do scrypt DEVEM ser fixados em constante
única do código, versionados junto com cada hash gravado, e **medidos no runtime workerd
real** antes de qualquer tela ir para produção. O custo de CPU do hash DEVE ficar em no
máximo **50 ms (p95)** por requisição, conforme o gatilho de revisão do ADR-002. O
resultado da medição, com os valores escolhidos e o método, DEVE ser registrado em ADR
próprio (ADR-005). Enquanto o ADR-005 não existir, este requisito está **em aberto** e
bloqueia a conclusão da change.

**REQ-8** — A verificação de senha DEVE usar comparação em tempo constante
(`timingSafeEqual`). Comparação com `===` sobre o hash não satisfaz este requisito.

**REQ-9** — A senha DEVE ter no mínimo **10 caracteres**, sem qualquer exigência de
símbolo, letra maiúscula ou dígito. O sistema NÃO PODE recusar espaços nem limitar o
comprimento máximo abaixo de 200 caracteres. Os requisitos DEVEM estar visíveis abaixo
do rótulo do campo **antes da primeira digitação**, no estado vazio da tela.

**REQ-10** — A senha, o hash e o sal NÃO PODEM aparecer em: log de aplicação, log de
erro, mensagem de exceção, corpo de resposta HTTP, parâmetro de URL, campo oculto de
formulário ou payload de telemetria. O log de um cadastro ou login DEVE identificar o
usuário por identificador interno ou `numero_registro`, nunca por senha e nunca por
e-mail completo.

### Grupo C — Sessão

**REQ-11** — A sessão DEVE ser um cookie selado emitido por `nuxt-auth-utils`, com os
atributos `HttpOnly`, `Secure`, `SameSite=Lax` e `Path=/`. O conteúdo selado DEVE conter
apenas identificador interno, `numero_registro`, primeiro nome e data/hora de emissão —
nunca senha, hash, e-mail, endereço ou qualquer dado de saúde.

**REQ-12** — A sessão DEVE expirar em no máximo **7 dias** a partir da emissão. Cookie
ausente, adulterado ou expirado DEVE produzir exatamente o mesmo resultado: o acesso é
recusado e a pessoa é levada para `/entrar` com uma mensagem que explica que a sessão
terminou. O sistema NÃO PODE responder com página de erro genérica nem com tela em
branco.

**REQ-13** — Toda rota sob `/area/*` e toda rota de API que leia ou altere dado de conta
DEVEM verificar a sessão **no servidor**. Esconder o link no cliente não satisfaz este
requisito. Requisição sem sessão válida para uma API DEVE responder 401 sem revelar se o
recurso existe.

**REQ-14** — O logout DEVE apagar o cookie de sessão e levar a pessoa para a home com
confirmação visível de que saiu. O sistema DEVE informar, na área do associado, que sair
não invalida o acesso em outro aparelho até o prazo do REQ-12 — a limitação está aceita
no ADR-002 e não pode virar promessa falsa na interface.

**REQ-15** — A chave `NUXT_SESSION_PASSWORD` DEVE vir de Cloudflare Secret em produção e
de `.dev.vars` em desenvolvimento, com no mínimo 32 caracteres. Ela NÃO PODE ser
versionada, impressa em log, exposta em resposta ou ter valor padrão embutido no código.
A aplicação DEVE recusar-se a subir se a chave estiver ausente ou menor que 32
caracteres, com mensagem que diz o que fazer e não mostra o valor.

### Grupo D — Criação da conta

**REQ-16** — **Não existe rota `/cadastro` separada.** A conta é criada pelo formulário
de atendimento (ADR-012), que é dono da tela e dos campos. `/cadastro`, se existir,
DEVE ser um redirecionamento 301 para `/atendimento/inscricao`.

> Duas telas criando conta com conjuntos de campo diferentes é exatamente o tipo de
> divergência que reprovou as seis changes no gate. Se um dia a APPD quiser conta sem
> pedido de atendimento, isso vira change nova, com a tela e os campos decididos ali —
> não uma segunda porta improvisada aqui.

**REQ-17** — Esta change NÃO PODE perguntar tipo de deficiência nem qualquer outro dado
de saúde, e nenhuma rota daqui pode lê-lo ou devolvê-lo. Esse dado é do formulário de
atendimento, com consentimento próprio (Art. 11 da LGPD).

**REQ-18** — O e-mail DEVE ser normalizado antes de gravar (espaços removidos das
pontas, convertido para minúsculas) e ser único. Tentativa de cadastro com e-mail já
existente DEVE ser recusada com a mensagem "Este e-mail já tem uma conta. Entre ou
recupere a sua senha.", acompanhada de link para `/entrar`.

> **Vazamento aceito e registrado (R-6) — `[condicional a Q-1]`.** Esta mensagem revela
> que o e-mail é de um associado. A alternativa sem vazamento depende de envio de
> e-mail, bloqueado por R-1. A decisão é do dono do projeto (Q-1) e vira ADR; enquanto
> ela não sair, **o cenário de aceite que fixa esta redação fica marcado como
> condicional** e não blinda a decisão (apontamento C.1 do gate).
>
> Vale para as **três** portas, não só esta: a mensagem do cadastro (aqui), a de troca
> de e-mail (REQ-31, que saiu desta change) e o bloqueio por tentativas (REQ-26a, já
> fechado). Fechar só uma é gastar usabilidade sem comprar privacidade.

**REQ-19** — A validação DEVE ser espelhada cliente e servidor **com o mesmo schema
Zod**, e o servidor NÃO PODE confiar em nada que venha do cliente. Um cadastro enviado
direto para a API, sem passar pela tela, DEVE sofrer exatamente as mesmas recusas.

**REQ-20** — Em caso de erro de validação, **todas as respostas válidas DEVEM
permanecer preenchidas**, inclusive a foto já escolhida. O erro DEVE ser específico por
campo, dizer o que fazer e trazer exemplo quando houver formato esperado. "Campo
inválido" e "Erro no formulário" não satisfazem este requisito.

**REQ-21** — O aceite da política de privacidade DEVE ser uma caixa de seleção
**desmarcada por padrão**, obrigatória, e o sistema DEVE gravar a **versão do termo** e a
**data/hora do aceite** — **numa linha da tabela `consentimentos`**, nunca em coluna de
`usuarios`. Caixa pré-marcada, aceite implícito por uso ou aceite por rolagem não
satisfazem este requisito.

> Na v1 estas eram duas colunas de `usuarios`. Duplicar o registro do aceite é o começo de
> dois históricos que divergem, e faz a revogação não alcançar o dado — foi a raiz do B5.
> `modelo-de-dados` REQ-19 e REQ-21 proíbem; este requisito passa a dizer onde grava para
> que a redação não autorize o contrário (bloqueio B-T5-4).

**REQ-22** — A foto é **opcional** e NÃO PODE bloquear a criação da conta. Esta change não
a recebe nem a processa: o campo fica no formulário de atendimento
(`formulario-atendimento` REQ-7d), e o componente, o limite e o armazenamento são de
`cracha-do-associado` (REQ-8a de lá).

> O limite de **5 MB** que existia aqui na v1 está revogado. Ele criava fotos que o crachá
> recusava — 5 MB aceitos no cadastro contra 102.400 bytes exigidos na geração — e era o
> bloqueio B11 do gate. Agora há um componente só, então o limite é o mesmo por construção.

**REQ-23** — A tela de confirmação é do `formulario-atendimento` (REQ-32 de lá). Desta
change vem apenas a garantia de que o `numero_registro` exibido é o gravado, e a de que
a confirmação NÃO PODE prometer envio de e-mail enquanto R-1 estiver aberto.

### Grupo E — Login e proteção

**REQ-24** — O login em `/entrar` DEVE aceitar e-mail e senha. NÃO PODE existir nenhum
botão de login social, em nenhum estado da tela.

**REQ-25** — A mensagem de falha de login DEVE ser **idêntica** para senha errada e para
e-mail inexistente: "E-mail ou senha não confere. Confira e tente de novo." O código de
status HTTP, o corpo da resposta e o comportamento da tela DEVEM ser iguais nos dois
casos. O e-mail digitado permanece preenchido; o campo de senha é limpo.

**REQ-26** — O sistema DEVE recusar tentativas de login após **5 tentativas falhas
dentro de 15 minutos**, bloqueando por **15 minutos**. A tela de bloqueio DEVE dizer por
quanto tempo, a que horas libera, e oferecer recuperação de senha e o telefone da
secretaria. O contador DEVE ser persistido no D1 (não há KV nem Redis no projeto) e DEVE
ser zerado em login bem-sucedido. O bloqueio NÃO PODE desativar a conta nem exigir
intervenção humana para liberar.

**REQ-26a** — **O contador vale para a chave digitada, exista conta ou não.** Cinco
tentativas com um e-mail inexistente produzem exatamente o mesmo bloqueio, com a mesma
tela, o mesmo status HTTP, o mesmo corpo e o mesmo horário de liberação que cinco
tentativas com um e-mail existente.

> **Bloqueio B13 do gate.** Na v1, o bloqueio era "para um mesmo e-mail" e só disparava
> quando a conta existia — então cinco tentativas respondiam a mesma pergunta que o
> REQ-25 protege. A proteção estava na mensagem de erro e o vazamento entrava pela porta
> do lado, com o agravante de permitir **varrer uma lista** de e-mails, o que a mensagem
> do cadastro não permite. Fechar isto é barato; deixar aberto é o pior dos dois mundos.

**REQ-26b** — A chave do contador NÃO PODE ser o e-mail em texto claro na tabela. DEVE
ser `HMAC-SHA-256(e-mail normalizado, segredo)`, pela mesma regra do IP
(`modelo-de-dados` REQ-30) — senão o próprio mecanismo antienumeração vira uma lista de
e-mails tentados, guardada em claro.

**REQ-27** — O tempo de resposta do login NÃO PODE distinguir e-mail inexistente de
senha errada de forma observável: quando o e-mail não existe, o sistema DEVE executar
trabalho equivalente ao da verificação de senha antes de responder. Responder de
imediato para e-mail inexistente não satisfaz este requisito.

### Grupo F — Recuperação de senha

**REQ-28** — O caminho **humano** de recuperação DEVE existir e ser publicado, sem
depender de nenhum serviço externo: o associado liga para a secretaria — (12) 3346-0605
— e a senha é refeita presencialmente ou por telefone. Este caminho DEVE aparecer em
**todos** os estados de falha de login e na tela de recuperação, com o telefone visível
no corpo da página, não apenas no rodapé.

**REQ-29** — O fluxo de recuperação **por e-mail** é **condicional** e NÃO PODE ser
publicado enquanto não existir uma solução de envio de custo zero aprovada pelo dono do
projeto (risco R-1). Especificado para quando for liberado:

- o token DEVE ser aleatório, de uso único, com validade de **1 hora**, guardado no
  banco **apenas como hash** e invalidado no primeiro uso ou ao expirar;
- a confirmação DEVE usar a redação "Se existir uma conta com esse e-mail, enviamos o
  link de recuperação.", que não revela se o e-mail existe;
- a mesma redação e o mesmo tempo de resposta valem para e-mail existente e inexistente;
- usar o token DEVE invalidar todas as sessões possíveis daquele usuário na medida em
  que o cookie selado permitir, e o limite do REQ-12 DEVE ser dito na tela;
- enquanto R-1 estiver aberto, nenhuma tela pode oferecer este fluxo nem prometer envio.

### Grupo G — Guarda de rota (o que sobrou da área)

> **Disputa resolvida (risco R-8).** O
> [ADR-013](../../../docs/adr/adr-013-fronteira-de-rotas-entre-changes.md) deu `/area`,
> `/area/dados`, `/area/inscricoes` e `/area/excluir` para `area-do-associado`, e
> `/area/cracha` inteira para `cracha-do-associado`. Os **REQ-30 a REQ-35 da v1 estão
> revogados**: eram cinco changes escrevendo contrato para as mesmas telas (bloqueios
> B6, B20 e B22 do gate). Fica aqui só a guarda de rota, que é autenticação.

**REQ-30** — Esta change DEVE entregar a **guarda de rota** de `/area/*`: um middleware
de servidor que verifica a sessão antes de qualquer handler de tela ou de API sob esse
prefixo, conforme REQ-13. Ele é único e vale para as rotas das duas changes donas — nem
`area-do-associado` nem `cracha-do-associado` implementam verificação própria.

**REQ-31** — Alterar o e-mail da conta acontece em `/area/dados`, tela de
`area-do-associado`. Desta change vem só a regra: a unicidade do REQ-18 continua valendo
na alteração, e a mensagem de e-mail já usado é a **mesma** do cadastro — a mesma porta
de vazamento, a mesma decisão pendente de Q-1, nunca duas redações diferentes.

**REQ-32** — Concluída a exclusão de conta (contrato em `modelo-de-dados` REQ-28), esta
change DEVE: invalidar a sessão imediatamente, impedir novo login com aquele e-mail, e
garantir que `numero_registro` seja preservado e **nunca reutilizado**. O que é apagado e
o que é retido está no contrato de dados, escrito uma vez só — não aqui.

**REQ-33** — `situacao` nasce `ativo` e o **único** escritor é o fluxo de exclusão, que
grava `inativo` (`modelo-de-dados` REQ-12). Nenhuma outra rota desta change escreve nessa
coluna. Inativação manual pela APPD é `painel-admin`, V1.1.

### Grupo H — Acessibilidade (bloqueante)

**REQ-36** — Toda tela desta change DEVE cumprir WCAG 2.2 AA como critério bloqueante,
verificado por teste automatizado com axe **e** por navegação manual só por teclado:

- rótulo **visível** acima de cada campo, em caixa alta e baixa; `placeholder` nunca
  substitui rótulo;
- campo obrigatório marcado por asterisco **e** pela palavra "obrigatório" no texto de
  ajuda;
- mensagem de erro ligada ao campo por `aria-describedby`, e resumo de erros com
  `role="alert"` que recebe foco ao aparecer;
- foco visível de 3px na cor `#0f4c93` com 2px de folga, em todo elemento interativo;
- ordem de foco igual à ordem visual; nenhuma armadilha de teclado;
- alvo de toque de no mínimo **44 × 44 px com 8 px de folga entre alvos vizinhos** —
  régua única do projeto —, incluindo o botão "Mostrar senha", os links
  de recuperação e as caixas de seleção da exclusão, com rótulo clicável;
- nada sinalizado só por cor: erro e status têm ícone e texto;
- elemento desabilitado sempre com o motivo em texto ao lado, nunca só por opacidade;
- corpo de texto de no mínimo 17px, nada abaixo de 15px;
- um `h1` por página e hierarquia de headings sem pular nível;
- em viewport de 360px, nada estoura horizontalmente e nenhum par de campos fica lado a
  lado;
- `prefers-reduced-motion` respeitado; nenhum indicador que gire indefinidamente.

**REQ-37** — O botão de mostrar senha DEVE ter rótulo **em texto** ("Mostrar senha" /
"Ocultar senha"), estado em `aria-pressed` e o alvo do REQ-36. NÃO PODE existir campo de
confirmação de senha.

---

## Comportamento esperado

**Caminho feliz do cadastro** — a pessoa abre `/cadastro`, lê que criar conta não é
pedir atendimento, preenche cinco campos, vê os requisitos da senha antes de digitar,
marca o aceite da privacidade, envia; o servidor valida com o mesmo schema Zod, gera o
hash com scrypt, grava a linha em `usuarios` com o `numero_registro` gerado sob restrição
de unicidade, emite o cookie de sessão e mostra a confirmação com o número em destaque.

**Caminho feliz do login** — a pessoa abre `/entrar`, informa e-mail e senha, o servidor
busca pelo e-mail normalizado, verifica o hash em tempo constante, zera o contador de
tentativas, emite o cookie selado e leva para `/area`.

**Erros e bordas**

- **E-mail já cadastrado** — recusa com a mensagem do REQ-18 e link para entrar; o resto
  do formulário continua preenchido.
- **Senha com menos de 10 caracteres** — recusa por campo, dizendo o mínimo; demais
  respostas preservadas.
- **Foto acima de 5 MB ou em formato não aceito** — recusa só a foto; a conta ainda pode
  ser criada sem ela.
- **Colisão de sequencial** — nova tentativa, até 5; esgotado, erro explícito e log.
- **Senha errada** — mensagem única do REQ-25; senha limpa, e-mail preservado.
- **E-mail inexistente** — idêntico ao caso acima, inclusive no tempo de resposta.
- **Sexta tentativa falha em 15 min** — bloqueio de 15 min, com horário de liberação,
  recuperação de senha e telefone da secretaria.
- **Cookie ausente, adulterado ou expirado** — recusa igual nos três casos; leva a
  `/entrar` explicando que a sessão terminou.
- **API chamada sem sessão** — 401, sem revelar se o recurso existe.
- **`NUXT_SESSION_PASSWORD` ausente ou curta** — a aplicação não sobe; a mensagem diz o
  que configurar e não mostra valor.
- **D1 indisponível no cadastro** — erro que pede nova tentativa e oferece o telefone;
  nada é gravado pela metade.
- **Exclusão com só uma caixa marcada** — botão segue desabilitado, com o motivo em texto.

---

## Fora de escopo (explícito)

Repete o `proposal.md` para que a spec se sustente sozinha: **não** faz o crachá nem a
verificação pública; **não** faz o formulário de atendimento nem o modelo de inscrição;
**não** escreve a política de privacidade nem o consentimento de dado sensível; **não**
faz painel administrativo; **não** tem login social; **não** confirma e-mail no cadastro;
**não** cadastra voluntário; **não** revoga sessão na hora nem lista sessões ativas;
**não** implementa envio de e-mail enquanto R-1 estiver aberto.

## Premissas e dependências

- ADR-001 (Workers + D1 + Drizzle) e ADR-002 (scrypt + cookie selado), ambos aceitos.
- ADR-005 (parâmetros do scrypt) **ainda não existe** e é pré-requisito do REQ-7.
- `nuxt-auth-utils` ainda não está no `package.json`: precisa rodar no workerd sob
  `nodejs_compat` antes de a tarefa de sessão ser considerada viável.
- `shared/utils/registro.ts` já formata o número; falta a regra de geração e unicidade.
- `server/database/schema.ts` está vazio: esta change cria a primeira tabela do projeto.
- Design das telas `/cadastro`, `/entrar` e `/area/*` aprovado no Claude Design — pela
  regra central do `CLAUDE.md`, é pré-requisito de qualquer implementação de tela.
- Respostas às questões abertas Q-1 (vazamento no cadastro), Q-2 (retenção na exclusão)
  e Q-3 (onde persistir o contador de tentativas).

---

## Critério de aceite

Cada cenário é um teste. `<...>` marca valor a fixar na implementação. Nenhum cenário
usa senha, chave ou dado de pessoa real: os exemplos usam o domínio reservado
`example.com` e descrevem senhas por comprimento, nunca por conteúdo.

### Funcionalidade: Cadastro de conta

Cobre REQ-1 a REQ-5, REQ-16 a REQ-23 da SPEC-cadastro-e-login.

```gherkin
Cenário: Cadastro concluído gera número de registro no formato exigido
  Dado que não existe conta com o e-mail "associada@example.com"
  E que estou na tela "/cadastro" com os cinco campos obrigatórios preenchidos
  E que a senha informada tem 14 caracteres
  E que a caixa "Li e aceito a Política de Privacidade" está marcada
  Quando eu envio o formulário
  Então uma linha é criada na tabela "usuarios" com o e-mail normalizado
  E o número de registro gravado casa com "^APPD-\d{4}-\d{5}$"
  E o ano do número é o ano corrente
  E a tela de confirmação exibe o número em destaque
  E a tela de confirmação NÃO menciona envio de e-mail
  E a coluna de senha em texto claro não existe na tabela

Cenário: Dois cadastros simultâneos não recebem o mesmo número de registro
  Dado que o último sequencial do ano corrente é 41
  Quando duas conclusões de cadastro são processadas ao mesmo tempo
  Então os dois números gerados são diferentes entre si
  E ambos casam com "^APPD-\d{4}-\d{5}$"
  E nenhuma linha é gravada com número duplicado

Cenário: Sequencial reinicia no primeiro cadastro do ano seguinte
  Dado que o último número gerado foi "APPD-2026-00042"
  E que a data corrente passou para 1 de janeiro de 2027
  Quando um cadastro é concluído
  Então o número gerado é "APPD-2027-00001"

Cenário: Sequencial esgotado no ano falha com erro explícito
  # Cobre REQ-5, que era requisito órfão no gate
  Dado que o sequencial do ano corrente chegou a "99999"
  Quando mais um cadastro é concluído
  Então a resposta é erro com mensagem própria, não estouro silencioso
  E o evento é registrado em log
  E nenhuma linha parcial permanece no banco

Cenário: Buraco na sequência não é defeito
  # Cobre REQ-5a — a retentativa do REQ-4 pula números por construção
  Dado que a emissão colidiu uma vez e usou a segunda tentativa
  Então existe um número não usado entre dois números emitidos
  E nenhum teste falha por causa disso

Cenário: [condicional a Q-1] E-mail já cadastrado é recusado sem apagar as respostas
  Dado que já existe conta com o e-mail "associada@example.com"
  E que preenchi todos os campos e marquei a privacidade
  Quando eu envio o formulário
  Então nenhuma conta nova é criada
  E a mensagem exibida é "Este e-mail já tem uma conta. Entre ou recupere a sua senha."
  E existe um link para "/entrar"
  E todas as respostas continuam preenchidas
  # A redação acima fica condicional até Q-1 ser respondida: fixá-la antes da decisão
  # blindaria uma escolha que ainda não foi feita (apontamento C.1 do gate).

Cenário: E-mail é normalizado antes de gravar
  Dado que informei o e-mail "  Associada@Example.com  "
  Quando o cadastro é concluído
  Então o valor gravado é "associada@example.com"

Cenário: Senha curta é recusada e o requisito já estava dito antes de digitar
  Dado que abri o formulário de cadastro e não digitei nada ainda
  Então o texto abaixo do rótulo do campo de senha já informa o mínimo de 10 caracteres
  Quando eu informo uma senha de 8 caracteres e envio o formulário
  Então a conta não é criada
  E o erro do campo de senha diz que o mínimo é 10 caracteres
  E o erro está ligado ao campo pelo atributo "aria-describedby"
  E os demais campos preenchidos continuam preenchidos

Cenário: Senha longa com espaços é aceita
  Dado que informei uma senha de 40 caracteres contendo espaços
  Quando o cadastro é concluído
  Então a conta é criada
  E o login com a mesma senha funciona em seguida

Cenário: A criação de conta não pede nem aceita foto
  Quando o cadastro é concluído
  Então nenhuma linha é criada em "fotos"
  E nenhum campo de arquivo existe na tela de cadastro
  E o caminho para enviar a foto é "/area/cracha"

Cenário: Aceite da privacidade é obrigatório e nasce desmarcado
  Dado que abri o formulário de cadastro
  Então a caixa "Li e aceito a Política de Privacidade" está desmarcada
  Quando eu envio o formulário com todos os campos válidos e a caixa desmarcada
  Então a conta não é criada
  E o erro aponta a caixa de privacidade

Cenário: Aceite gravado guarda versão do termo e data/hora
  Dado que a versão corrente do termo é "<versao>"
  Quando o cadastro é concluído com a caixa marcada
  Então a linha gravada contém a versão "<versao>"
  E contém a data/hora do aceite

Cenário: O cadastro não pergunta sobre deficiência
  Dado que abri "/cadastro"
  Então nenhum campo do formulário pergunta tipo de deficiência
  E nenhum campo do formulário pede dado de saúde

Cenário: API de cadastro recusa o que a tela recusaria
  Dado que envio uma requisição direta à API de cadastro
  E que a senha tem 8 caracteres e o aceite de privacidade vem ausente
  Quando a requisição é processada
  Então a resposta é de erro de validação
  E nenhuma conta é criada
  E os erros apontam a senha e o aceite
```

### Funcionalidade: Login, sessão e logout

Cobre REQ-6, REQ-8, REQ-11 a REQ-14, REQ-24 a REQ-27.

```gherkin
Cenário: Login correto abre a área do associado
  Dado que existe conta ativa com o e-mail "associada@example.com"
  E que informo esse e-mail e a senha correta
  Quando eu envio o formulário de "/entrar"
  Então sou levada para "/area"
  E o painel exibe meu nome e meu número de registro
  E é definido um cookie de sessão com HttpOnly, Secure, SameSite=Lax e Path=/
  E o conteúdo selado do cookie não contém e-mail, senha nem hash

Cenário: Senha errada mostra a mensagem única
  Dado que existe conta com o e-mail "associada@example.com"
  Quando eu informo esse e-mail com a senha errada e envio
  Então a mensagem exibida é "E-mail ou senha não confere. Confira e tente de novo."
  E o e-mail digitado continua preenchido
  E o campo de senha está vazio
  E nenhum cookie de sessão é definido

Cenário: E-mail inexistente mostra exatamente a mesma mensagem
  Dado que não existe conta com o e-mail "ninguem@example.com"
  Quando eu informo esse e-mail com qualquer senha e envio
  Então a mensagem exibida é "E-mail ou senha não confere. Confira e tente de novo."
  E o código de status da resposta é igual ao do cenário de senha errada
  E o corpo da resposta é igual ao do cenário de senha errada
  E a tela em nenhum momento diz que o e-mail não está cadastrado

Cenário: Tempo de resposta não distingue e-mail inexistente de senha errada
  Dado que meço o tempo de 50 tentativas com e-mail existente e senha errada
  E que meço o tempo de 50 tentativas com e-mail inexistente
  Quando comparo as duas medianas
  Então a diferença entre elas é menor que <limite_ms> milissegundos

Cenário: Sexta tentativa falha bloqueia a entrada por 15 minutos
  Dado que houve 5 tentativas falhas para "associada@example.com" nos últimos 15 minutos
  Quando eu tento entrar de novo, mesmo com a senha correta
  Então a entrada é recusada
  E a tela informa que o bloqueio dura 15 minutos e diz o horário de liberação
  E a tela oferece a recuperação de senha e o telefone (12) 3346-0605
  E o botão desabilitado tem o motivo dito em texto ao lado
  E a conta continua existindo e não exige liberação manual

Cenário: Login bem-sucedido zera o contador de tentativas
  Dado que houve 3 tentativas falhas para "associada@example.com"
  Quando eu entro com a senha correta
  Então o contador de tentativas daquele e-mail volta a zero

Cenário: Bloqueio expira sozinho depois de 15 minutos
  Dado que a entrada de "associada@example.com" foi bloqueada há 16 minutos
  Quando eu entro com a senha correta
  Então sou levada para "/area"

Cenário: Nenhum estado da tela de entrar oferece login social
  Dado que percorro os estados vazio, senha errada, bloqueado, recuperação e confirmação
  Então nenhum deles contém botão de entrar com Google, Facebook, Apple ou outra rede

Cenário: Sessão expirada leva para entrar, explicando
  Dado que possuo um cookie de sessão emitido há 8 dias
  Quando eu abro "/area"
  Então sou levada para "/entrar"
  E a tela explica que a sessão terminou e que preciso entrar de novo
  E nenhuma página de erro genérica é exibida

Cenário: Cookie adulterado é tratado igual a cookie ausente
  Dado que altero um byte do cookie de sessão
  Quando eu abro "/area"
  Então o resultado é idêntico ao de abrir "/area" sem cookie nenhum

Cenário: API protegida responde 401 sem sessão
  Dado que não possuo cookie de sessão
  Quando eu chamo a API que lê os meus dados
  Então a resposta é 401
  E o corpo não informa se a conta consultada existe

Cenário: Logout apaga a sessão
  Dado que estou com sessão válida em "/area"
  Quando eu aciono "Sair"
  Então o cookie de sessão é removido
  E sou levada para a home com confirmação visível de que saí
  E abrir "/area" em seguida me leva para "/entrar"

Cenário: A aplicação não sobe sem a chave de sessão
  Dado que a variável NUXT_SESSION_PASSWORD está ausente
  Quando a aplicação inicia
  Então a inicialização falha com mensagem que diz o que configurar
  E a mensagem não imprime nenhum valor de chave
```

### Funcionalidade: Recuperação de senha

Cobre REQ-28 e REQ-29. O segundo bloco só é executável quando R-1 for resolvido.

```gherkin
Cenário: O caminho humano aparece em toda falha de entrada
  Dado que estou na tela de senha errada, na de bloqueio ou na de recuperação
  Então o telefone (12) 3346-0605 aparece no corpo da página, não só no rodapé
  E o texto diz que a secretaria refaz a senha

Cenário: O fluxo por e-mail não é publicado enquanto o risco R-1 estiver aberto
  Dado que não existe solução de envio de e-mail de custo zero aprovada
  Quando eu percorro "/entrar" e a tela de recuperação
  Então nenhuma tela promete que um e-mail foi ou será enviado
  E o caminho oferecido é o telefone da secretaria

Cenário: [condicional a R-1] Confirmação de recuperação não revela se o e-mail existe
  Dado que o envio de e-mail está liberado
  E que informo um e-mail que não tem conta
  Quando eu peço a recuperação
  Então a confirmação exibida é "Se existir uma conta com esse e-mail, enviamos o link
    de recuperação."
  E a mesma frase é exibida quando o e-mail existe
  E o tempo de resposta é equivalente nos dois casos

Cenário: [condicional a R-1] Token de recuperação vale uma vez e por uma hora
  Dado que o envio de e-mail está liberado
  E que recebi um token de recuperação válido
  Quando eu uso o token para definir uma nova senha
  Então a senha é alterada
  E usar o mesmo token de novo é recusado
  E um token com mais de 1 hora é recusado
  E o banco guarda apenas o hash do token, nunca o token em texto claro
```

### Funcionalidade: Guarda de rota e efeitos da exclusão

Cobre REQ-30 a REQ-33. **As telas de `/area/*` não são desta change** (ADR-013): os
cenários de painel, dados, inscrições, crachá e da página de exclusão vivem em
`area-do-associado` e `cracha-do-associado`. Aqui só o que é autenticação.

```gherkin
Cenário: Rota da área sem sessão é recusada no servidor
  Dado que não tenho cookie de sessão
  Quando peço "/area/dados" direto pela URL
  Então sou levada para "/entrar" com a mensagem de sessão terminada
  E o handler da tela não chega a executar
  E nenhuma consulta ao banco foi feita com dado da conta

Cenário: A guarda é uma só, para as rotas das duas changes donas
  Quando percorro todas as rotas sob "/area/"
  Então todas passam pelo mesmo middleware de sessão
  E nenhuma rota implementa verificação própria

Cenário: API da área sem sessão responde 401 sem revelar existência
  Dado que não tenho sessão válida
  Quando chamo uma API sob "/api/area/" com um identificador que existe
  E depois com um identificador que não existe
  Então as duas respostas são 401, com corpo idêntico

Cenário: O número de registro não pode ser alterado
  Dado que estou autenticada
  Quando envio uma requisição de alteração de dados incluindo um número de registro novo
  Então a alteração do número é recusada
  E o valor no banco continua o mesmo
  E o evento é registrado em log

Cenário: [condicional a Q-1] Trocar o e-mail respeita a unicidade
  Dado que existe outra conta com o e-mail "outra@example.com"
  Quando eu tento alterar o meu e-mail para "outra@example.com"
  Então a alteração é recusada com a MESMA mensagem do cadastro
  # Mesma porta de vazamento, mesma decisão pendente: nunca duas redações diferentes.

Cenário: Concluída a exclusão, a sessão morre e o e-mail não volta a entrar
  Dado que o fluxo de exclusão de "/area/excluir" foi concluído
  Então a minha sessão é encerrada imediatamente
  E tentar entrar com o e-mail anterior falha com a mensagem única do login
  E o meu número de registro permanece registrado
  E ele não é atribuído a nenhuma conta nova

Cenário: A situação só é escrita pela exclusão
  Dado uma conta recém-criada
  Então "situacao" é "ativo"
  Quando qualquer outra rota desta change é executada
  Então "situacao" continua "ativo"
  E só o fluxo de exclusão a grava como "inativo"
```

### Funcionalidade: Acessibilidade

Cobre REQ-36 e REQ-37. Executar nas telas **desta change** — `/entrar`, `/sair` e a de
redefinição de senha —, nos estados vazio, com erro, enviando e concluído. As telas de
`/area/*` são auditadas nas changes donas, com a mesma régua.

```gherkin
Esquema do Cenário: Rótulo visível e obrigatoriedade dita em palavra
  Dado que abro a página "<rota>"
  Então cada campo tem rótulo visível acima dele, em caixa alta e baixa
  E nenhum campo usa o placeholder como único rótulo
  E cada campo obrigatório é marcado por asterisco e pela palavra "obrigatório"

  Exemplos:
    | rota                  |
    | /entrar               |
    | /recuperar-senha      |

Cenário: Erro é ligado ao campo e anunciado
  Dado que envio "/entrar" com dois campos inválidos
  Então o resumo de erros tem role="alert" e recebe o foco
  E cada campo com erro tem aria-invalid="true"
  E a mensagem de cada erro está ligada ao campo por aria-describedby
  E cada erro tem ícone e texto, não apenas cor

Cenário: Foco visível e ordem de foco
  Dado que percorro a página só pelo teclado
  Então todo elemento interativo mostra contorno de foco de 3px na cor #0f4c93
  E o contorno tem 2px de folga em relação ao elemento
  E a ordem de foco é igual à ordem visual
  E não existe ponto em que o foco fique preso

Cenário: Alvo de toque mínimo de 44px com folga de 8px
  Dado que abro a página em viewport de 360px de largura
  Então todo botão, link de ação e caixa de seleção tem no mínimo 44 por 44 pixels
  E a distância entre alvos vizinhos é de no mínimo 8 pixels
  E o botão "Mostrar senha" tem no mínimo 44 por 44 pixels e atributo aria-pressed
  E o rótulo de cada caixa de seleção é clicável

Cenário: Estrutura e legibilidade
  Dado que abro qualquer página desta change
  Então existe exatamente um h1
  E a hierarquia de headings não pula nível
  E o corpo de texto tem no mínimo 17px e nenhum texto fica abaixo de 15px
  E em viewport de 360px nada estoura horizontalmente
  E nenhum par de campos fica lado a lado

Cenário: Verificação automatizada sem violação
  Dado que executo o axe em cada rota desta change, em cada estado
  Então não há violação de nível A nem AA
  E o resultado é bloqueante para o gate de entrega
  # Régua única do projeto, na configuração do axe no CI, nunca repetida por change.
```

### Funcionalidade: Segredo não vaza por canal lateral

Cobre REQ-10, que era requisito órfão no gate — o mais importante da change e o único
sem cenário escrito.

```gherkin
Cenário: Senha, hash e sal não aparecem em lugar nenhum
  Dado um cadastro concluído com a senha "senha-fictícia-de-teste"
  Quando inspeciono o log de aplicação, o log de erro, o corpo de toda resposta HTTP,
    toda URL gerada e todo campo oculto de formulário
  Então nenhum deles contém a senha
  E nenhum deles contém o hash
  E nenhum deles contém o sal
  E o log identifica a pessoa pelo identificador interno ou pelo número de registro
  E o log não contém o e-mail completo

Cenário: Exceção não vaza segredo na mensagem
  Dado que a verificação de senha lança exceção
  Quando o erro é registrado e respondido
  Então a mensagem não contém a senha nem o hash
  E a resposta HTTP é genérica, sem stack trace
```

---

## Rastreabilidade

| REQ                | Coberto por (funcionalidade)       | Tarefa   |
| ------------------ | ---------------------------------- | -------- |
| REQ-1 a REQ-5b     | Criação da conta                   | T-2, T-3 |
| REQ-6 a REQ-10     | Criação da conta, Login            | T-1, T-5 |
| REQ-11 a REQ-15    | Login, sessão e logout             | T-4, T-8 |
| REQ-16 a REQ-23    | Criação da conta (no formulário)   | T-5, T-6 |
| REQ-24 a REQ-27    | Login, sessão e logout             | T-7      |
| REQ-28, REQ-29     | Recuperação de senha               | T-9      |
| REQ-30 a REQ-33    | Guarda de rota e exclusão          | T-10     |
| REQ-36, REQ-37     | Acessibilidade                     | T-12     |
| REQ-10 (era órfão) | Segredo não vaza por canal lateral | T-13     |

---

## Definition of Ready — auditoria desta spec

| Item                          | Situação                                                  |
| ----------------------------- | --------------------------------------------------------- |
| Spec sem ambiguidade pendente | **Não** — três bloqueios abertos, abaixo                  |
| Priorizada                    | Do coordenador; não é decisão desta spec                  |
| Critério de aceite testável   | **Sim** — todo cenário Gherkin ligado a um REQ, sem órfão |

**Bloqueios que impedem a spec de virar task por inteiro:**

- `[dependência]` **`modelo-de-dados` precisa fechar antes.** Esta change não cria
  coluna. Dono: **Arthur Barbero**.
- `[escopo] Q-1` — REQ-18 assume que o cadastro revela e-mail já existente (R-6).
  Precisa de decisão registrada em ADR. Enquanto não sair, os cenários que fixam a
  redação estão marcados `[condicional a Q-1]`. Dono: **Arthur Barbero**.
- `[escopo] Q-2` — o que a APPD é obrigada a reter, e por quanto tempo. O **contrato de
  exclusão** já está fechado (`modelo-de-dados` REQ-28); o que falta é o **prazo de
  retenção** exibido na tela. Dono: **APPD / jurídico**, levado por Arthur Barbero.
- `[ambiguidade] REQ-7` — `N`, `r` e `p` do scrypt são `<a definir>` até a medição e o
  ADR-005. Dono: **arquiteto**. Bloqueia a conclusão, não o início.
- `[ambiguidade] REQ-27` — `<limite_ms>` precisa de valor medido, não estimado, **e** de
  política de retentativa: 50 medições de mediana num runtime compartilhado, sem isso,
  é teste instável por construção e será desligado no terceiro mês (apontamento do gate).
  Dono: **arquiteto**, junto com T-1.
- `[escopo] R-7` — as telas desta change (`/entrar`, redefinição de senha) não têm design
  aprovado no Claude Design. Dono: **Arthur Barbero**. Bloqueia toda tarefa de tela.
- `[bloqueio de publicação] R-1` — **não há caminho de custo zero para enviar e-mail ou
  SMS**, e com o cadastro embutido (ADR-012) toda pessoa passa a ter senha, logo toda
  pessoa vai esquecê-la. O caminho humano do REQ-28 cobre o mínimo; o fluxo por e-mail
  do REQ-29 não vai ao ar sem isso. Pesquisa em aberto no `PROGRESS.md`.
  Dono: **Arthur Barbero**.
- ~~`[escopo] Q-3` — onde persistir o contador de tentativas.~~ **Resolvido**: D1, com a
  chave em HMAC (REQ-26b). Não há KV nem Redis no projeto.
- ~~`[escopo] R-8` — REQ-30 a REQ-35 duplicados em `area-do-associado`.~~ **Resolvido**
  pelo ADR-013: aquela change é a dona das telas, esta fica com a guarda de rota.

**Veredito: NÃO-READY** enquanto `modelo-de-dados` não fechar e R-1 não tiver caminho.
As tarefas de fundação (T-1 a T-5, T-7, T-8) começam assim que o contrato de dados
estiver aplicado. Ver `tasks.md` para o sequenciamento.
