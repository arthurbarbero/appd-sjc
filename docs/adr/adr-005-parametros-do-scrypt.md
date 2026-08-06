# ADR-005: Parâmetros do scrypt e o teto de CPU do Workers

Status: **PROPOSTO — aguarda decisão do dono.** Não é decisão tomada.
Data da medição: 2026-08-06
Medição: Claude Code · Decisor: Arthur Barbero

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

| Opção                                                   | O que ganha                                 | O que custa                                                                                                                   |
| ------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **A. Plano pago do Workers** (US$ 5/mês)                | scrypt no parâmetro do OWASP, sem gambiarra | **quebra a restrição inegociável**: exige cartão. Decisão do dono, não do projeto                                             |
| **B. PBKDF2 pelo WebCrypto**                            | é o que a plataforma oferece nativamente    | o workerd **limita a 100.000 iterações**; o OWASP pede 210.000 para SHA-512. Fica abaixo do padrão atual, e não dá para subir |
| **C. scrypt fraco, dentro dos 10 ms**                   | mantém custo zero e a biblioteca já provada | `N = 4.096` é 4× abaixo do mínimo do OWASP, e ainda estoura o teto. Pior dos dois mundos                                      |
| **D. Hash em duas etapas: cliente + servidor**          | tira o custo caro do Worker                 | hash no cliente vira a senha; se o banco vazar, o hash **é** a credencial. Não resolve, muda de lugar                         |
| **E. Autenticação sem senha** (link por e-mail, código) | some o problema do KDF                      | **depende de enviar e-mail ou SMS**, que é o risco R-1, hoje sem caminho de custo zero. Troca um bloqueio por outro           |

## Recomendação do medidor, não decisão

**Nenhuma opção é boa, e isso precisa estar dito antes de qualquer escolha.**

Se a decisão for manter custo zero, **B** é a menos ruim: PBKDF2 a 100.000 iterações com
SHA-512 é abaixo do padrão de 2023 do OWASP, mas é um KDF de verdade, com sal por usuário,
nativo da plataforma, e não depende de e-mail. A dívida ficaria escrita: um vazamento do
banco expõe senhas a um ataque mais barato do que deveria.

Se o dono aceitar cadastrar cartão, **A** resolve de vez e é a única que atende o padrão.
Isso é decisão dele — `CLAUDE.md` proíbe que eu tome.

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
