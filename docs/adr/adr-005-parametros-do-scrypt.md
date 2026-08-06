# ADR-005: Parâmetros do scrypt e o teto de CPU do Workers

Status: **Aceito** — opção F, decidida por Arthur Barbero em 2026-08-06.
Data da medição: 2026-08-06
Medição: Claude Code · Decisor: Arthur Barbero

> **Decisão do dono, 2026-08-06:** vale a **opção F** — o cálculo caro roda no navegador e
> o servidor guarda um `SHA-256` com sal próprio. O dono recusou o plano pago e recusou
> pagar o custo de CPU no servidor. A opção B (PBKDF2 no servidor) fica sem objeto e não
> precisa mais ser medida.

## Contexto

A task T-1 de `cadastro-e-login` pedia para escolher `N`, `r` e `p` do scrypt com número
**medido no workerd real**, não estimado, e registrar aqui. A medição foi feita — e o que
ela achou não é um parâmetro, é um problema de plataforma.

### O que foi medido

Rota temporária em `wrangler dev` (workerd real, não o dev server do Nuxt), 15 execuções
por combinação, `scryptSync` do `node:crypto` sob `nodejs_compat`, saída de 64 bytes:

| N          | r   | Memória | Mediana | Máximo   |
| ---------- | --- | ------- | ------- | -------- |
| 4.096      | 8   | 4 MiB   | 12,0 ms | 15,0 ms  |
| 8.192      | 4   | 4 MiB   | 13,0 ms | 18,0 ms  |
| 8.192      | 8   | 8 MiB   | 25,0 ms | 28,0 ms  |
| 16.384     | 4   | 8 MiB   | 26,0 ms | 29,0 ms  |
| **16.384** | 8   | 16 MiB  | 48,0 ms | 56,0 ms  |
| 32.768     | 8   | 32 MiB  | 98,0 ms | 106,0 ms |

`N = 16.384, r = 8, p = 1` é o mínimo que o OWASP recomenda, e é o padrão do
`node:crypto` que o spike da Fase 0 usou sem medir.

### O teto que muda tudo

A [documentação da Cloudflare](https://developers.cloudflare.com/workers/platform/limits/)
diz, na tabela de limites:

- **Plano gratuito: 10 ms de CPU por requisição.**
- Plano pago: 30 s por padrão, até 5 min.
- Memória: 128 MiB por isolate (não é o gargalo aqui — nem 32 MiB chega perto).

**Nenhuma combinação medida cabe em 10 ms.** A mais barata da tabela já gasta 12 ms de
mediana, e ela é fraca demais para valer a pena. E os 10 ms são o orçamento da requisição
**inteira**: roteamento, validação Zod, consulta ao D1 e serialização também gastam.

O `ADR-002` fixou o gatilho de revisão em "50 ms (p95)" — número que fazia sentido quando
a referência era latência percebida, e que é **cinco vezes o teto real** da plataforma no
plano que o projeto usa. O gatilho estava calibrado contra a coisa errada.

## O que isso significa

Não é ajuste de parâmetro. É uma das restrições do projeto batendo na outra:

- `CLAUDE.md`: **custo de operação R$ 0, sem cartão cadastrado**.
- `CLAUDE.md`: senha guardada direito, com KDF de custo deliberado.

No plano gratuito do Workers, as duas não cabem juntas com scrypt.

## Opções, com o que cada uma custa

| Opção                                                   | O que ganha                                                      | O que custa                                                                                                                   |
| ------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **A. Plano pago do Workers** (US$ 5/mês)                | scrypt no parâmetro do OWASP, sem gambiarra                      | **quebra a restrição inegociável**: exige cartão. Decisão do dono, não do projeto                                             |
| **B. PBKDF2 pelo WebCrypto**                            | é o que a plataforma oferece nativamente                         | o workerd **limita a 100.000 iterações**; o OWASP pede 210.000 para SHA-512. Fica abaixo do padrão atual, e não dá para subir |
| **C. scrypt fraco, dentro dos 10 ms**                   | mantém custo zero e a biblioteca já provada                      | `N = 4.096` é 4× abaixo do mínimo do OWASP, e ainda estoura o teto. Pior dos dois mundos                                      |
| **F. Custo no navegador, hash rápido no servidor**      | cabe folgado nos 10 ms, custo zero, e o banco continua protegido | exige JavaScript; celular fraco leva ~0,5 s no envio. Ver a seção própria                                                     |
| ~~D. Hash em duas etapas, ingênuo~~                     | —                                                                | descartada: mandar o hash cru sem re-hash no servidor faz o hash virar a credencial                                           |
| **E. Autenticação sem senha** (link por e-mail, código) | some o problema do KDF                                           | **depende de enviar e-mail ou SMS**, que é o risco R-1, hoje sem caminho de custo zero. Troca um bloqueio por outro           |

## Opção F, em detalhe — a recomendada

Descartei isto rápido demais na primeira versão, misturando com uma variante ingênua. O
dono questionou, e olhando de novo é a única que atende as três restrições ao mesmo tempo.

**Como funciona.** O trabalho caro sai do servidor e vai para o navegador:

1. O navegador deriva `chave = scrypt(senha, sal, N=16384, r=8)` — os ~300 ms saem do
   celular da pessoa, uma vez, no envio. O sal é derivado do e-mail normalizado, para que
   a mesma senha em contas diferentes produza chaves diferentes.
2. O navegador manda `chave`, nunca a senha.
3. O servidor **não guarda o que recebeu**. Ele aplica `SHA-256(chave + sal_do_servidor)`
   — menos de 1 ms — e guarda só isso.

**Por que o banco continua protegido.** Quem roubar o banco tem
`SHA-256(scrypt(senha))`. Para testar um palpite, precisa rodar o scrypt de novo, na
máquina dele, a 300 ms por tentativa. A lentidão não sumiu: mudou de máquina. É
exatamente a proteção que o hash lento no servidor daria.

**A diferença em relação à opção D descartada**: lá o valor recebido era gravado como
está, então um vazamento entregava a credencial de login pronta. Aqui o servidor
re-embaralha com sal próprio, e o que está no banco não serve para entrar.

**O que ela custa, honestamente:**

- **Depende de JavaScript no cliente.** Sem JS, não há login. Para este público, precisa
  de caminho alternativo: a secretaria cadastra por telefone (REQ-28 já prevê).
- **Celular fraco demora.** ~300 ms num aparelho recente, possivelmente 1 s num antigo.
  Uma vez, no envio, com estado "Enviando…" na tela. Aceitável; precisa estar no aceite.
- **Não é o desenho de manual.** O manual assume KDF no servidor. Este arranjo é
  legítimo e usado, mas é decisão consciente e precisa estar escrita — está aqui.
- **Replay do valor em trânsito.** Quem interceptar a `chave` entra na conta, igual a
  quem interceptasse a senha. Mitigação: HTTPS obrigatório, que o Workers já impõe.

## As outras, para o registro

Se o dono aceitar cadastrar cartão, **A** resolve sem arranjo nenhum e é a única que
segue o manual. Isso é decisão dele — `CLAUDE.md` proíbe que eu tome.

**B** (PBKDF2 no servidor, 100.000 iterações) fica abaixo do padrão OWASP de 2023 e **nem
foi medida** — pode não caber nos 10 ms.

**C** é o pior dos dois mundos: fraca e ainda estoura o teto.

**E** troca este bloqueio pelo do e-mail, que continua aberto.

## Sobre rate-limit não substituir isto

Registrado porque a pergunta é natural e a resposta não é óbvia: **rate-limit e hash lento
defendem de ataques diferentes.** O rate-limit protege o formulário de login contra quem
tenta adivinhar **pelo site** — e o projeto tem isso (`cadastro-e-login` REQ-26). O hash
lento protege o banco **depois que ele vaza**: aí o atacante roda as tentativas na máquina
dele, onde o rate-limit não existe. Sem custo por tentativa, uma placa de vídeo comum
testa bilhões de senhas por segundo. Com este banco — nome, CPF, endereço e **tipo de
deficiência** —, isso não é risco aceitável.

## O que falta medir antes de decidir

- **PBKDF2 a 100.000 e a 50.000 iterações no workerd**, para saber se a opção B sequer
  cabe nos 10 ms. A medição foi escrita mas não chegou a rodar — o `.output` ficou preso
  por um processo `workerd` que não encerrou, e a rota temporária foi removida antes de
  repetir. **Sem esse número, a opção B é hipótese, não alternativa.**
- Quanto do orçamento de 10 ms sobra depois de roteamento, Zod e D1 — medido com uma rota
  real, não com a rota de laboratório.

## Consequência para as specs

Enquanto isto não for decidido:

- `cadastro-e-login` **REQ-7** continua com `<a definir>` e **bloqueia a conclusão da
  change** — como já está escrito na Definition of Ready dela.
- **REQ-27** (tempo de resposta do login não distingue e-mail inexistente) depende do
  mesmo número: o `<limite_ms>` sai daqui.
- O gatilho de revisão do **ADR-002** precisa ser corrigido de "50 ms p95" para o teto
  real da plataforma, seja qual for a opção escolhida.

Nenhuma linha de código de senha entra antes desta decisão. Não é rito: é que implementar
qualquer uma das cinco opções e trocar depois significa reprocessar hash de todo mundo.
