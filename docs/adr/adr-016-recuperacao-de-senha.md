# ADR-016: recuperação de senha por e-mail e por painel administrativo

Status: Aceito
Data: 2026-08-07
Decisores: Arthur Barbero (painel admin) · Claude Code (pesquisa, delegada por ele)

> **Correção do mesmo dia.** A primeira redação deste ADR concluía que "todo caminho
> gratuito exige verificar um domínio por DNS". **Estava errado**, e o dono apontou —
> "por que eu preciso de DNS pra mandar e-mail???". A pergunta era boa: eu tinha
> confundido **enviar** com **chegar na caixa de entrada**, e tratado política de um
> provedor como se fosse exigência do protocolo. O texto abaixo é a apuração refeita,
> com oito buscas a mais.

## Contexto

Desde o [ADR-012](adr-012-cadastro-embutido-no-formulario.md) toda pessoa cadastrada tem
senha, e não existe caminho de recuperação. Hoje, **quem esquece a senha perde a conta**.

## DNS não é exigência para enviar. É para chegar.

A parte que eu tinha errado, dita direito:

**Enviar não exige domínio nenhum.** SendGrid, Mailjet e Brevo aceitam **verificação de
remetente avulso**: você prova que controla um endereço — clicando num link ou digitando
um código que chega naquela caixa — e passa a enviar para **qualquer destinatário**.
Nenhum registro de DNS envolvido. A documentação da SendGrid é explícita: a verificação de
remetente avulso "é a forma rápida de verificar sua identidade **quando você não tem
acesso ao DNS do domínio**".

**O que o DNS resolve é outra coisa: alinhamento.** SPF, DKIM e DMARC são registros
publicados no DNS do domínio que aparece no `From:`. Eles respondem à pergunta que o
servidor do destinatário faz: "o servidor que me entregou esta mensagem tem autorização de
quem assina o remetente?" Sem essa autorização publicada, a mensagem chega — e vai para
spam.

**E aqui mora o problema real, que não é o DNS: é o Gmail.** Desde **1º de fevereiro de
2024** o `gmail.com` publica `p=quarantine`. Uma mensagem com `From: appdsjc@gmail.com`
enviada por SendGrid, Mailjet ou Brevo falha o alinhamento DMARC — o servidor que entregou
não é o do Google — e cai **na pasta de spam** do destinatário. A Brevo vai além e
**substitui** endereço de domínio gratuito usado como remetente.

E-mail de redefinição de senha em spam produz a mesma perda de conta, com a diferença de a
pessoa achar que o site está quebrado.

### O caminho que fura isso sem domínio nenhum

**Enviar pelo próprio Google, com a conta da associação.** Aí o `From:` é `@gmail.com`
**e** quem entrega é o Google: o alinhamento fecha, e a mensagem vai para a caixa de
entrada. Pela API do Gmail (REST, chamável do Worker) ou por SMTP, com limite da ordem de
500 mensagens por dia — muito acima do que uma associação deste tamanho precisa. Custo
zero, DNS nenhum.

O que ele exige é **credencial do Google da APPD**, com o OAuth correspondente. É decisão
e acesso do dono e da associação, não meus.

## Decisão

**As duas coisas, e não uma ou outra** — decisão do dono em 2026-08-07: _"independente de
ter painel de admin, precisamos ter uma forma via e-mail para o usuário se auto-atender.
Vamos usar o SendGrid gratuito mais simples, independente de barrar no Gmail; depois que eu
tiver o domínio certinho fazemos o resto para parar de cair no spam."_

**1. Redefinição por e-mail via SendGrid**, plano gratuito (100/dia), com **verificação de
remetente avulso** — sem DNS, sem domínio. A entrega imperfeita é **custo aceito e
consciente**, não descuido: autoatendimento que funciona para parte das pessoas vale mais
que nenhum, e esperar o domínio adiaria indefinidamente algo que já custa contas hoje.

O que a implementação faz para o custo doer menos:

- a tela avisa, **antes do envio**, que a mensagem pode chegar na caixa de spam, e manda
  procurar lá;
- oferece, no mesmo lugar e com o mesmo peso visual, o telefone da associação — caminho que
  não depende de e-mail nenhum;
- a chave da API vive em **Cloudflare Secrets**, nunca no repositório.

**2. Painel administrativo.** Também decidido pelo dono, e não é substituto: é o caminho de
quem não recebeu o e-mail, não tem e-mail acessível ou não consegue operar o fluxo sozinho
— que, no público deste site, não é caso de borda.

Isto **supersede** a parte do [ADR-014](adr-014-inscricao-como-registro-de-interesse.md)
que empurrava o painel de gerenciamento para a V1.1. Ele volta para a V1, e vira change
própria.

**3. Quando houver `appd.org.br`**, verificar o domínio no próprio SendGrid — SPF, DKIM e
DMARC. O spam se resolve sem trocar de provedor nem reescrever código: muda o remetente.

| Rota                                      | O que exige                      | Entregabilidade                | Quando                            |
| ----------------------------------------- | -------------------------------- | ------------------------------ | --------------------------------- |
| **SendGrid, remetente avulso**            | verificar um endereço por código | ruim no Gmail (`p=quarantine`) | **agora**                         |
| **SendGrid com `appd.org.br` verificado** | publicação no domínio da APPD    | boa                            | depois                            |
| API do Gmail com a conta da APPD          | credencial OAuth da associação   | boa                            | alternativa, se o domínio demorar |

### O que preciso de você para ligar isto

A conta no SendGrid e a chave de API são suas para criar — não crio conta em serviço
externo por iniciativa própria. Preciso da chave e de qual endereço será verificado como
remetente. Nada disso entra no repositório.

## O que a pesquisa achou sobre os provedores

Para quando a escolha chegar — e com a ressalva de que plano gratuito muda: a MailerSend
cortou o dela em 83% em oito meses.

| Provedor                       | Gratuito em 2026-08-07               | Remetente avulso sem DNS?                               |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------- |
| **Resend**                     | 3.000/mês, 100/dia                   | Não — sem domínio só envia para o dono da conta         |
| **Mailjet**                    | 6.000/mês, 200/dia                   | **Sim**                                                 |
| **SendGrid**                   | 100/dia                              | **Sim**                                                 |
| **Brevo**                      | 300/dia, dividido com marketing      | Sim, mas substitui remetente de domínio gratuito        |
| **MailerSend**                 | 500/mês (era 3.000 até dez/2025)     | —                                                       |
| **MailChannels**               | encerrado para Workers em 31/08/2024 | —                                                       |
| **`send_email` da Cloudflare** | grátis, sem chave de API             | Só entrega a endereços verificados **da própria conta** |

## Alternativas consideradas

~~**ESP com o Gmail da associação como remetente avulso.** Recusada pelo `p=quarantine`.~~
**Virou a decisão**, por escolha do dono no mesmo dia: entrega imperfeita agora vale mais
que entrega perfeita depois. Eu tinha tratado "pode cair em spam" como impeditivo; é
custo, e quem decide se o custo compensa é ele.

**Registrar domínio próprio por R$ 40/ano.** Recusada: não é custo zero, e um
`appdsjc.org.br` paralelo ao `appd.org.br` confunde quem procura a APPD.

**Pergunta secreta.** Recusada: mecanismo de recuperação notoriamente fraco.

## Consequências

**A favor**: a recuperação deixa de depender de terceiro. O painel admin resolve o caso
real de uma associação pequena — a pessoa liga, a secretaria refaz — e o e-mail vira
melhoria, não pré-requisito.

**Contra, e assumido**: parte das mensagens vai cair em spam enquanto o remetente for
avulso, e a tela precisa dizer isso em vez de deixar a pessoa esperando.

**Gatilho de revisão**: credencial do Google da APPD disponível, ou publicação em
`appd.org.br`. Nos dois casos, remedir os planos antes de escolher.
