<div align="center">

# APPD São José dos Campos

**Site e área do associado da Associação das Pessoas com Deficiência de São José dos Campos**

[![CI](https://github.com/arthurbarbero/appd-sjc/actions/workflows/ci.yml/badge.svg)](https://github.com/arthurbarbero/appd-sjc/actions/workflows/ci.yml)
[![Publicar](https://github.com/arthurbarbero/appd-sjc/actions/workflows/deploy.yml/badge.svg)](https://github.com/arthurbarbero/appd-sjc/actions/workflows/deploy.yml)

[Ver funcionando](https://appd-sjc.appd-sjc.workers.dev) · [Estado do projeto](PROGRESS.md)

</div>

---

## O que é este projeto

A **APPD-SJC** é uma associação sem fins lucrativos fundada em 2006, em São José dos
Campos. Ela atende pessoas com deficiência e suas famílias com fisioterapia, psicologia,
serviço social, orientação e empréstimo de equipamento, e mantém quatro projetos
contínuos de esporte, artesanato, manutenção e inclusão digital.

Este repositório traz o site da associação e uma **área do associado**: quem se cadastra
entra, vê o que a associação tem sobre ele, corrige o que estiver errado e pode apagar
tudo quando quiser.

É trabalho voluntário, com autorização da associação para usar marca e conteúdo.
**Ainda não é o site oficial** — o oficial é [appd.org.br](https://www.appd.org.br). O
endereço acima é demonstração, o banco por trás dele não é de produção, e **não deve
receber dado de pessoa real**.

### O que já funciona

- **Site institucional** — 17 páginas públicas: serviços, projetos, sobre, contato e doações.
- **Cadastro de atendimento** — o formulário de 15 campos da associação, que também cria a conta.
- **Conta e sessão** — entrar, sair, sessão em cookie por 7 dias.
- **Área do associado** — painel, alteração dos próprios dados, correção do cadastro e exclusão de conta.
- **Crachá** — número de registro e QR Code de verificação.

---

## Tecnologias

Esta seção descreve o que cada ferramenta faz e qual papel ela cumpre aqui — o
repositório também serve para quem quer estudar uma aplicação Nuxt completa, com banco,
autenticação e publicação automatizada.

### Interface

| Ferramenta                                                        | O que faz                                                                                                                                                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Nuxt 4](https://nuxt.com)**                                    | Framework construído sobre o Vue. Cuida do roteamento (cada arquivo em `app/pages/` vira uma URL), da renderização no servidor, da importação automática de componentes e do servidor HTTP. |
| **[Vue 3](https://vuejs.org)**                                    | Biblioteca de interface. A tela é descrita como função do estado: muda o dado, a tela se redesenha sozinha.                                                                                 |
| **[TypeScript](https://www.typescriptlang.org)** em modo `strict` | JavaScript com tipos conferidos antes de rodar. O erro aparece no editor, não em produção.                                                                                                  |
| **CSS com tokens próprios**                                       | As variáveis de cor, espaço e tipografia ficam em [`app/assets/css/tokens.css`](app/assets/css/) e a folha base as consome. Sem framework de estilo.                                        |
| **[@fontsource](https://fontsource.org)**                         | Empacota a fonte [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/) — desenhada para leitura com baixa visão — dentro do próprio site, sem CDN.                            |

**Renderização no servidor (SSR).** O Nuxt monta o HTML da primeira tela no servidor e
envia pronto; o JavaScript assume depois, sem recarregar a página. Na prática: o conteúdo
aparece antes de o JavaScript carregar, e leitor de tela e buscador leem a página mesmo
sem ele.

### Servidor e dados

| Ferramenta                                                           | O que faz                                                                                                                                                                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **[Cloudflare Workers](https://developers.cloudflare.com/workers/)** | Executa o código do servidor na borda da rede, perto de quem acessa. Não há máquina para manter.                                                                                                                         |
| **[Nitro](https://nitro.build)** (preset `cloudflare_module`)        | Motor de servidor do Nuxt. Compila o mesmo código para alvos diferentes; aqui, para o runtime da Cloudflare.                                                                                                             |
| **[Cloudflare D1](https://developers.cloudflare.com/d1/)**           | Banco SQLite gerenciado, acessado pelo Worker por um _binding_ declarado em [`wrangler.jsonc`](wrangler.jsonc).                                                                                                          |
| **[Drizzle ORM](https://orm.drizzle.team)**                          | As tabelas são declaradas em TypeScript ([`server/database/schema.ts`](server/database/schema.ts)) e o Drizzle gera a migration SQL correspondente, que fica versionada em [`drizzle/migrations/`](drizzle/migrations/). |
| **[Zod](https://zod.dev)**                                           | Valida o dado que entra e infere o tipo TypeScript a partir da própria validação. Os schemas vivem em [`shared/`](shared/) e são importados pelo navegador e pelo servidor.                                              |
| **[nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)**     | Sessão num cookie assinado e criptografado. O conteúdo da sessão viaja no próprio cookie, sem tabela de sessão no banco.                                                                                                 |
| **[@noble/hashes](https://github.com/paulmillr/noble-hashes)**       | Implementação de `scrypt` que roda no navegador, usada para derivar a senha antes do envio.                                                                                                                              |
| **[uqr](https://github.com/unjs/uqr)**                               | Gera a matriz do QR Code do crachá, sem dependências.                                                                                                                                                                    |

**Como o dado é validado.** O mesmo schema Zod roda nos dois lados, e as regras
equivalentes existem também como `CHECK` no SQLite. O Zod produz a mensagem em português
que a pessoa lê; o banco recusa dado fora do formato venha de onde vier.

**Como a senha é guardada.** O navegador deriva a senha com `scrypt` e envia o resultado;
o servidor aplica um segundo hash com sal próprio e guarda apenas esse valor. A senha em
texto não existe em coluna nenhuma.

### Qualidade e publicação

| Ferramenta                                                             | O que faz                                                                                                                                                                                          |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Vitest](https://vitest.dev)**                                       | Testes rápidos, sem navegador: restrições do banco, geração do número de registro, regressão de conteúdo das telas e auditoria das specs.                                                          |
| **[Playwright](https://playwright.dev)**                               | Dirige um navegador real contra o runtime do Cloudflare para percorrer o ciclo completo de conta.                                                                                                  |
| **[axe-core](https://github.com/dequelabs/axe-core)**                  | Auditoria automatizada de acessibilidade, níveis A e AA.                                                                                                                                           |
| **[ESLint](https://eslint.org)** e **[Prettier](https://prettier.io)** | Erro provável e formatação.                                                                                                                                                                        |
| **[gitleaks](https://github.com/gitleaks/gitleaks)**                   | Procura credencial no que está sendo commitado e no histórico completo.                                                                                                                            |
| **[wrangler](https://developers.cloudflare.com/workers/wrangler/)**    | CLI da Cloudflare: roda o Worker localmente, aplica migrations no D1 e publica.                                                                                                                    |
| **GitHub Actions**                                                     | [`ci.yml`](.github/workflows/ci.yml) roda formatação, lint, typecheck, testes e gitleaks. [`deploy.yml`](.github/workflows/deploy.yml) aplica as migrations e publica, e só depois que a CI passa. |

---

## Como rodar

Requisitos: **Node 22 ou superior** e npm. Nenhuma conta na Cloudflare é necessária — o
`wrangler` simula Workers e D1 no seu computador.

```bash
npm install
npm run dev              # http://localhost:3000
```

Isso já entrega o site institucional inteiro. Para exercitar a **área do associado**, que
precisa de banco:

```bash
npm run db:aplicar:local   # aplica as migrations no SQLite local
npm run db:seed:local      # popula com dado fictício (opcional)
npm run cf:dev             # build + runtime real do Cloudflare em :8787
```

`npm run dev` roda em Node e recarrega ao salvar; `npm run cf:dev` roda no mesmo runtime
que a produção usa, que é mais restrito. Use o segundo antes de dar algo por pronto.

### Comandos

| Comando                              | O que faz                                                            |
| ------------------------------------ | -------------------------------------------------------------------- |
| `npm run dev`                        | Servidor de desenvolvimento com recarga ao salvar                    |
| `npm run cf:dev`                     | Build + `wrangler dev`: runtime real do Cloudflare                   |
| `npm test`                           | Testes rápidos, sem navegador                                        |
| `npm run aceite`                     | Navegador real: ciclo completo de conta, sete larguras de tela e axe |
| `npm run lint` · `npm run typecheck` | ESLint e `vue-tsc`                                                   |
| `npm run format`                     | Prettier                                                             |
| `npm run db:generate`                | Gera a migration SQL a partir do schema                              |
| `npm run db:aplicar:local`           | Aplica as migrations no D1 local                                     |
| `npm run db:seed:local`              | Popula o banco local com dado fictício                               |
| `npm run cf:parar`                   | Encerra `wrangler` órfão (no Windows, destrava o build)              |

O gate de aceite também roda contra um endereço publicado:

```bash
APPD_BASE=https://appd-sjc.appd-sjc.workers.dev npm run aceite
```

### Variáveis de ambiente

Copie [`.dev.vars.example`](.dev.vars.example) para `.dev.vars` — ele não é versionado.
Em produção, os valores são secrets do Worker.

---

## Estrutura

Layout padrão do Nuxt 4, com quatro pastas próprias.

```
app/                 interface — o que roda no navegador
├─ assets/css/       tokens e folha base
├─ components/       componentes reutilizáveis (auto-importados)
├─ layouts/          casca comum: cabeçalho, rodapé
├─ middleware/       guardas de rota no cliente
├─ pages/            cada arquivo é uma URL
└─ utils/            funções de apoio (auto-importadas)

server/              o que roda no Worker
├─ api/              endpoints HTTP
├─ database/         schema Drizzle
├─ middleware/       guardas de rota no servidor
└─ utils/            sessão, banco, senha, número de registro

shared/              usado pelos dois lados — schemas Zod, conteúdo, domínio
drizzle/migrations/  SQL versionado
public/              arquivos servidos como estão

test/                Vitest, mais o gate de aceite em test/aceite/
docs/                conteúdo, decisões de arquitetura, design system
openspec/            requisitos e tarefas por mudança
scripts/             utilitários chamados pelos comandos npm
```

---

## Contribuindo

Antes de abrir PR:

```bash
npm run lint && npm run typecheck && npm test
```

Se a mudança toca alguma tela, rode também `npm run aceite`.

As regras do repositório estão em [CLAUDE.md](CLAUDE.md), e o histórico de decisões em
[`docs/adr/`](docs/adr/).

---

## Licença

A definir junto com a APPD-SJC. O código será aberto; **marca, logo, fotos e textos
institucionais pertencem à associação** e não estão cobertos pela licença do código.
