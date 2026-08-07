# ADR-016: a redefinição de senha por e-mail espera o domínio, não o provedor

Status: Aceito
Data: 2026-08-07
Decisores: Claude Code (pesquisa e decisão delegadas por Arthur Barbero em 2026-08-07)

## Contexto

Desde o [ADR-012](adr-012-cadastro-embutido-no-formulario.md) toda pessoa cadastrada tem
senha, e não existe caminho de recuperação. Hoje, **quem esquece a senha perde a conta** —
é a lacuna mais séria do que está no ar.

O item estava registrado como "pesquisar caminho gratuito de e-mail ou SMS", com a
restrição inegociável do projeto: custo zero, sem cartão de crédito.

A pesquisa foi feita em 2026-08-07, dez buscas, e chegou a uma conclusão diferente da
pergunta.

## O que a pesquisa achou

| Caminho                                          | Situação em 2026-08-07                                                                                                                                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MailChannels** pelo Worker                     | Encerrado para Cloudflare Workers em **31/08/2024**. Era a rota gratuita clássica; não existe mais.                                                                                                                     |
| **Cloudflare `send_email` binding**              | Gratuito e sem chave de API, mas só entrega a **endereços de destino verificados na própria conta** enquanto não houver domínio de envio integrado. Serve para alerta interno, não para escrever a um usuário qualquer. |
| **Resend** (recomendado pela própria Cloudflare) | 3.000/mês e 100/dia no plano gratuito. **Sem domínio verificado**, só envia de `onboarding@resend.dev` e **só para o e-mail do próprio dono da conta** — é modo de teste.                                               |
| **Brevo**                                        | 300/dia, compartilhados entre marketing e transacional. Tecnicamente envia sem verificar domínio, ao custo de entregabilidade — password reset caindo em spam é a mesma perda de conta com passo a mais.                |
| **MailerSend**                                   | Cortou o plano gratuito de 3.000 para **500/mês** em dezembro de 2025, e as fontes divergem sobre exigir cartão.                                                                                                        |

**O padrão é o mesmo em todos**: alcançar destinatário arbitrário exige verificar um
domínio por DNS. O projeto **não tem domínio** — vive em `*.workers.dev`, cujo DNS não é
nosso —, e `appd.org.br` é da APPD, que o `CLAUDE.md` proíbe tocar sem aprovação.

Registrar um `.org.br` próprio custaria R$ 40/ano e exige CNPJ e estatuto de entidade sem
fins lucrativos: não é gratuito, e criaria um domínio paralelo ao da associação, que é
pior do que não ter.

## Decisão

**A redefinição de senha por e-mail não é bloqueada por falta de provedor gratuito. É
bloqueada pela ausência de domínio, e destrava no mesmo evento que o resto do projeto
espera: a publicação em `appd.org.br` com aprovação da APPD.**

No dia em que o site estiver no domínio da associação, Resend (3.000/mês) ou Brevo
(300/dia) cobrem com folga uma associação deste tamanho, a custo zero. A escolha entre os
dois fica para aquele momento, com os números remedidos — plano gratuito muda, e este ADR
é a prova disso: a MailerSend cortou o dela em 83% em oito meses.

**Enquanto isso, vale o caminho humano** (T-9.1 de `cadastro-e-login`): o telefone da
secretaria aparece no corpo de toda tela de falha de entrada e na tela de recuperação, e
o texto diz que quem refaz a senha é a associação.

## A parte incômoda, que fica escrita

**A associação não tem hoje ferramenta para refazer a senha de ninguém.** O painel
administrativo é da V1.1. Oferecer o telefone sem isso é prometer o que ninguém consegue
cumprir — exatamente o defeito que o [ADR-014](adr-014-inscricao-como-registro-de-interesse.md)
corrigiu quando a tela prometia fila de vagas que a APPD não opera.

Portanto o caminho humano **só vai ao ar junto com** uma operação autenticada mínima que
permita à associação disparar a troca. Sem ela, a tela não promete atendimento telefônico:
diz que a recuperação ainda não existe, e que a pessoa deve procurar a associação para
resolver caso a caso. Preferir a verdade desconfortável à promessa vazia é regra do
projeto, não estilo.

## Alternativas consideradas

**Brevo sem verificar domínio, aceitando a entregabilidade ruim.** Recusada: e-mail de
recuperação que cai em spam produz a mesma perda de conta, com a diferença de a pessoa
achar que o site está quebrado. E criar conta em serviço externo é decisão do dono, não
minha.

**Registrar domínio próprio por R$ 40/ano.** Recusada por duas razões, e a segunda é a que
pesa: não é custo zero, e um `appdsjc.org.br` paralelo ao `appd.org.br` da associação
confunde quem procura a APPD e cria identidade que não é nossa para criar.

**Pergunta secreta ou código pelo WhatsApp da secretaria.** Recusada: a primeira é
mecanismo de recuperação notoriamente fraco, e a segunda transforma trabalho voluntário em
plantão.

## Consequências

**A favor**: a pesquisa deixa de ser item aberto e vira dependência nomeada, com o evento
que a destrava. O que parecia problema técnico sem saída é a mesma espera que o projeto
inteiro já tem.

**Contra, e assumido**: até lá, quem esquece a senha depende de contato com a associação.

**Gatilho de revisão**: publicação em `appd.org.br`, ou o dono decidir registrar domínio
próprio. Nos dois casos, remedir os planos gratuitos antes de escolher.
