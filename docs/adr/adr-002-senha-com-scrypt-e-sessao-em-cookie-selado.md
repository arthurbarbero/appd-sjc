# ADR-002: Senha com scrypt do `node:crypto` e sessão em cookie selado

Status: Aceito
Data: 2026-08-05
Decisores: Arthur Barbero (dono do projeto), Claude Code (execução do spike)

## Contexto

A área do associado exige login. Guardar senha de pessoa com deficiência num repo
público e num free tier significa que qualquer atalho aqui vira notícia ruim. O
runtime é o **workerd**, não o Node: não dá para assumir que `bcrypt`, `argon2` ou
qualquer binding nativo funcione. Também não há servidor com estado para guardar
sessão, e adicionar um KV/Redis aumenta superfície e risco de custo.

## Decisão

Vamos usar **scrypt do `node:crypto`** (sob a flag `nodejs_compat`) para derivar o
hash da senha, e **sessão em cookie selado** via `nuxt-auth-utils`, com a chave em
Cloudflare Secret — porque scrypt está disponível no runtime sem dependência nativa,
e o cookie selado dispensa qualquer store de sessão.

## Alternativas consideradas

| Alternativa                | Prós                                        | Contras                                                       | Por que NÃO                                                                   |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| bcrypt / argon2 (nativo)   | padrão de mercado, muito material           | binding nativo; não roda no workerd                           | tecnicamente inviável na plataforma escolhida                                 |
| PBKDF2 via WebCrypto       | disponível nativamente, sem `nodejs_compat` | mais fraco contra ataque com hardware dedicado no mesmo custo | scrypt funciona; sem motivo para descer para PBKDF2                           |
| Sessão em tabela no D1     | revogação imediata e trivial                | uma leitura de banco por requisição, dentro da cota de linhas | custo por requisição sem ganho proporcional nesta escala                      |
| OAuth de terceiro (Google) | zero senha guardada                         | exclui quem não tem conta Google; dependência externa         | público-alvo tem baixa afinidade digital; login simples é requisito de acesso |

## Consequências

- **Positivas**: nenhuma dependência nativa; sem store de sessão para operar ou pagar;
  o segredo vive só em Cloudflare Secret, nunca no repo público.
- **Negativas / dívida**:
  - Cookie selado **não é revogável na hora**: logout invalida o cookie no cliente, mas
    um cookie roubado vale até expirar. Mitigação: TTL curto e rotação da chave.
  - Depende de `nodejs_compat` continuar entregando `scrypt`. É flag de compatibilidade,
    não contrato eterno.
  - Parâmetros do scrypt (N, r, p) precisam ser fixados e revisados: o limite de CPU do
    Worker é curto, então o custo do hash não pode estourar o tempo da requisição.
    **Pendente de definição na change `cadastro-e-login`** — o spike usou os padrões.
  - Recuperação de senha exige envio de e-mail, que ainda não tem solução de custo zero
    definida. Item aberto para a Fase 3.
- **Gatilho de revisão**: se `scrypt` sumir do `nodejs_compat`, se o hash passar de
  ~50 ms de CPU por requisição, ou se surgir necessidade de revogar sessão na hora
  (por exemplo, painel administrativo com dado de terceiros) — reabrir.

## Evidência (spike, timebox 30 min)

Commit `b7e321d`, rodado com `wrangler dev` (workerd real, `compatibility_flags:
["nodejs_compat"]`):

```json
{ "scrypt": { "ok": true, "confere": true, "recusaErrada": true, "bytes": 64 } }
```

Ou seja: `scrypt` derivou 64 bytes, `timingSafeEqual` confirmou a senha correta e
recusou a errada. `randomBytes` também funcionou. O risco principal da stack de auth
está descartado **antes** de qualquer linha de tela.
