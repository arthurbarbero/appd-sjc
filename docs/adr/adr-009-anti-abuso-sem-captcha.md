# ADR-009: anti-abuso por limite horário com IP hasheado, sem CAPTCHA

Status: Aceito
Data: 2026-08-07
Decisores: Arthur Barbero (dono do projeto)

## Contexto

Três rotas ficam abertas a quem não tem conta: o formulário de atendimento, o login e a
verificação pública do crachá. Sem alguma trava, qualquer uma pode ser martelada — o
formulário para encher o banco de lixo, o login para adivinhar senha, a verificação para
enumerar associados.

A decisão estava citada como `ADR-009` em `formulario-atendimento` (D5) desde 2026-08-05
**sem o ADR existir**. A auditoria mecânica de 2026-08-07 achou a citação órfã.

Duas restrições do projeto delimitam o espaço: **acessibilidade WCAG 2.2 AA é o produto**,
e **custo zero sem cartão**.

## Decisão

**Limite por janela de tempo, com o identificador guardado como HMAC-SHA-256, e nenhum
CAPTCHA.**

A tabela `tentativas` guarda `chave_hash`, `escopo` (`inscricao`, `verificacao`, `login`)
e `criado_em`. A chave é `HMAC-SHA-256(<identificador>, segredo)` — o IP entra na função e
**não sai dela**. O segredo é secret do Worker, não está no repositório.

## Alternativas consideradas

**CAPTCHA (reCAPTCHA, hCaptcha, Turnstile).** Recusado, e este é o ponto que não se
negocia neste projeto: CAPTCHA é uma barreira de acessibilidade documentada. O visual
exclui quem tem baixa visão e quem tem deficiência intelectual; o de áudio exclui quem tem
deficiência auditiva, e falha justamente para quem depende dele. **O público deste site é
exatamente a população que o CAPTCHA rejeita.** Pôr um portão que barra a pessoa com
deficiência na porta de uma associação de pessoas com deficiência inverteria o propósito
do sistema. O Turnstile da Cloudflare é menos ruim que os outros e mesmo assim foi
recusado: ele ainda cai no desafio interativo quando o sinal é ruim, e "às vezes barra"
não é aceitável aqui.

**Guardar o IP em texto claro.** Recusado. O IP é dado pessoal, o repositório é público, e
guardar o endereço de quem pede atendimento numa associação de pessoas com deficiência
cria um vazamento em potencial que não paga nada: para contar tentativas, o hash serve
igual. O REQ-5 e o REQ-30 do contrato de dados fecham isso para o projeto inteiro.

**Nada.** Recusado para o login: sem limite, o formulário aceita tentativa ilimitada de
senha, e a derivação lenta (ADR-005) defende o banco **depois** que ele vaza — não defende
o formulário.

## Consequências

**A favor**: ninguém é barrado por não conseguir resolver um desafio; nada de terceiro
carregado na página; o IP não existe em lugar nenhum em texto claro; o limite é ajustável
sem mudar código de tela.

**Contra, e assumido**: o hash não impede quem troca de IP. Contra um atacante com botnet,
o limite por IP não serve — e não vai servir com CAPTCHA também. O que ele protege é o
caso comum: script de um endereço só, e tentativa repetida de senha.

**Limite conhecido**: NAT e rede móvel compartilham IP, então o limite pode atingir quem
não fez nada. Por isso os tetos são generosos e a mensagem de recusa diz para tentar de
novo mais tarde **e** oferece o telefone da associação — o caminho humano nunca é barrado
por limite de requisição.

**Condição de revisão**: se aparecer abuso real que o limite por IP não segure, a saída
não é CAPTCHA; é prova de trabalho no cliente ou fila de moderação. Trocar isto exige ADR
novo.
