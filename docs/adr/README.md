# Decisões de arquitetura (ADR)

Fonte única da numeração. **Antes de escrever um ADR novo, reserve o número aqui** —
seis changes foram especificadas em paralelo em 2026-08-05 e quatro reservaram o mesmo
`ADR-003` para coisas diferentes. Renumerar depois é barato; descobrir a colisão no
meio da implementação, não.

Reversão de decisão é por ADR novo que substitui o anterior, nunca por apagamento.

## Escritos

| Nº  | Decisão                                                                                             | Status |
| --- | --------------------------------------------------------------------------------------------------- | ------ |
| 001 | [Cloudflare Workers + D1 como plataforma](adr-001-cloudflare-workers-d1.md)                         | Aceito |
| 002 | [Senha com scrypt e sessão em cookie selado](adr-002-senha-com-scrypt-e-sessao-em-cookie-selado.md) | Aceito |
| 003 | [Foto do crachá como BLOB no D1](adr-003-foto-do-cracha-como-blob-no-d1.md)                         | Aceito |
| 004 | [Liberação imediata do crachá](adr-004-liberacao-imediata-do-cracha.md)                             | Aceito |

## Reservados pelas specs, ainda não escritos

Cada um bloqueia a implementação da change que o pediu.

| Nº  | Decisão a registrar                                                 | Pedido por                    |
| --- | ------------------------------------------------------------------- | ----------------------------- |
| 005 | Parâmetros do scrypt (N, r, p) e o teto de CPU por requisição       | `cadastro-e-login`            |
| 006 | Onde vive o texto das versões do termo de consentimento             | `consentimento-e-privacidade` |
| 007 | Protocolo de inscrição em espaço de numeração próprio (`ATD-`)      | `formulario-atendimento`      |
| 008 | Múltipla escolha guardada como JSON no D1                           | `formulario-atendimento`      |
| 009 | Anti-abuso sem CAPTCHA, com IP hasheado                             | `formulario-atendimento`      |
| 010 | Implementar antes de especificar: por que o site veio antes da spec | `site-institucional`          |
| 011 | Publicar com marcação "A confirmar" em vez de esperar a APPD        | `site-institucional`          |

## Por que 007 existe

`APPD-<ano>-<sequencial>` é o número de registro do associado, gerado no cadastro e
imutável. O protocolo da inscrição de atendimento é outra coisa, de outra tabela, e não
pode compartilhar o formato — daí `ATD-<ano>-<sequencial>`. Dois documentos diferentes
com o mesmo formato de número viram confusão no atendimento e no suporte.
