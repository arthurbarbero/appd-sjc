<div align="center">

# APPD São José dos Campos

**Site e área do associado da Associação das Pessoas com Deficiência de São José dos Campos**

Acessibilidade WCAG 2.2 AA como requisito bloqueante · Custo de operação R$ 0 · LGPD desde o schema

[![CI](https://github.com/arthurbarbero/appd-sjc/actions/workflows/ci.yml/badge.svg)](https://github.com/arthurbarbero/appd-sjc/actions/workflows/ci.yml)
[![Publicar](https://github.com/arthurbarbero/appd-sjc/actions/workflows/deploy.yml/badge.svg)](https://github.com/arthurbarbero/appd-sjc/actions/workflows/deploy.yml)

[Ver funcionando](https://appd-sjc.appd-sjc.workers.dev) · [Decisões de arquitetura](docs/adr/) · [Estado do projeto](PROGRESS.md)

</div>

---

## O que é este projeto

A **APPD-SJC** é uma associação sem fins lucrativos fundada em 2006, em São José dos
Campos. Ela atende pessoas com deficiência e suas famílias com fisioterapia, psicologia,
serviço social, orientação e empréstimo de equipamento, e mantém quatro projetos
contínuos de esporte, artesanato, manutenção e inclusão digital.

Hoje o cadastro de quem procura atendimento é um formulário que vira planilha. Quem se
cadastra não tem como conferir nem corrigir o próprio dado: precisa ligar. Este projeto
substitui isso por um site com **área do associado** — a pessoa entra, vê o que a
associação tem sobre ela, corrige o que estiver errado e pode apagar tudo quando quiser.

É trabalho voluntário, com autorização da associação para usar marca e conteúdo.
**Ainda não é o site oficial** — o oficial é [appd.org.br](https://www.appd.org.br). O
endereço acima é demonstração, o banco por trás dele não é de produção, e **não deve
receber dado de pessoa real**.

### As três restrições que explicam quase toda escolha técnica daqui

Se algo neste repositório parecer uma decisão estranha, é quase certo que uma destas
três a explica.

**1. Acessibilidade é o produto, não um item de checklist.** O público do site é
exatamente a população que a web costuma deixar de fora. Contraste AA, navegação
completa por teclado, foco visível, alvo de 44 px, nada sinalizado só por cor, texto
base de 17 px, `prefers-reduced-motion` respeitado. É critério de aceite bloqueante por
tela — se reprovar, a tela não sobe.

**2. Custo de operação R$ 0, sem cartão de crédito.** Uma associação voluntária não
assume mensalidade de hospedagem. Isso elimina de saída quase toda a infraestrutura
usual e é o motivo de o projeto rodar inteiro no plano gratuito da Cloudflare — com um
teto de **10 ms de CPU por requisição** que muda como se guarda uma senha (ver
[ADR-005](docs/adr/adr-005-parametros-do-scrypt.md)).

**3. O repositório é público e o sistema trata dado sensível.** Tipo de deficiência é
dado de saúde, categoria especial pelo Art. 11 da LGPD. Nenhuma credencial, foto ou dado
de pessoa real entra aqui; os dados de teste são fictícios e declarados; o `gitleaks`
varre o histórico completo a cada commit e a cada push.

---

## Tecnologias, e o que cada uma resolve

Esta seção existe para quem chegou aqui querendo aprender. Cada item diz **o que a
ferramenta faz**, **por que ela está neste projeto** e, quando houver, **o que foi
descartado no lugar dela**.

### Interface

| Ferramenta                                                        | O que faz                                                                                                                                                                  |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Nuxt 4](https://nuxt.com)**                                    | Framework sobre o Vue. Cuida de roteamento (cada arquivo em `app/pages/` vira uma URL), renderização no servidor, importação automática de componentes e do servidor HTTP. |
| **[Vue 3](https://vuejs.org)**                                    | Biblioteca de interface. Descreve a tela como função do estado: muda o dado, a tela se redesenha sozinha.                                                                  |
| **[TypeScript](https://www.typescriptlang.org)** em modo `strict` | JavaScript com tipos conferidos antes de rodar. Pega no editor o erro que apareceria só em produção.                                                                       |

**Por que renderizar no servidor (SSR).** A primeira tela chega pronta em HTML, então
quem está com internet ruim ou aparelho antigo vê conteúdo antes de o JavaScript
carregar — e leitor de tela e buscador leem a página mesmo sem JavaScript. Numa
aplicação só-cliente, a primeira coisa que chega é uma página em branco.

**Estilo em CSS puro, sem framework.** Não há Tailwind nem biblioteca de componentes
aqui, e é decisão consciente: as regras de acessibilidade deste projeto (alvo mínimo,
foco visível, contraste) precisam ser garantidas em **um** lugar, e um sistema de
tokens próprio em [`app/assets/css/`](app/assets/css/) faz isso melhor do que classes
utilitárias espalhadas por 30 templates. O custo é escrever mais CSS; o ganho é que
nenhuma tela consegue "esquecer" a regra.

**Fonte auto-hospedada** ([Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/),
desenhada para baixa visão) via `@fontsource`. Buscar fonte num CDN entregaria o IP de
cada visitante a um terceiro — inaceitável num site que trata dado de saúde.

### Servidor e dados

| Ferramenta                                                           | O que faz                                                                                                                           |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **[Cloudflare Workers](https://developers.cloudflare.com/workers/)** | Executa o código do servidor na borda da rede, perto de quem acessa. Não há servidor para manter nem para pagar quando ninguém usa. |
| **[Nitro](https://nitro.build)** (preset `cloudflare_module`)        | Motor de servidor do Nuxt. Compila o mesmo código para alvos diferentes; aqui, para o runtime da Cloudflare.                        |
| **[Cloudflare D1](https://developers.cloudflare.com/d1/)**           | Banco SQLite gerenciado, também no plano gratuito.                                                                                  |
| **[Drizzle ORM](https://orm.drizzle.team)**                          | Descreve as tabelas em TypeScript e **gera as migrations em SQL**, que são versionadas e revisadas.                                 |
| **[Zod](https://zod.dev)**                                           | Valida dado de entrada e infere o tipo a partir da validação.                                                                       |
| **[nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)**     | Sessão em cookie assinado e criptografado, sem tabela de sessão no banco.                                                           |

**Migrations versionadas, nunca `push`.** O Drizzle oferece um modo que sincroniza o
banco direto com o schema. Ele é proibido aqui: toda mudança de estrutura vira um arquivo
SQL em [`drizzle/migrations/`](drizzle/migrations/) que alguém lê antes de aplicar. Foi
o que salvou o projeto de um bug real — o gerador emitiu `SELECT "cep" FROM usuarios`
para uma coluna que ainda não existia, e o SQLite trata identificador desconhecido entre
aspas duplas como **literal de texto**: cada linha teria recebido a string `'cep'` no
lugar do CEP, em silêncio.

**Validação no cliente e no servidor, com o mesmo objeto.** O schema Zod vive em
[`shared/`](shared/) e é importado pelos dois lados. Enquanto a régua for uma só, "o
formulário aceitou e a API recusou" deixa de ser uma classe de bug possível.

**As regras também estão no banco.** Cada restrição do Zod tem um `CHECK` correspondente
no SQLite. É redundância proposital: o Zod dá a mensagem em português que a pessoa lê; o
banco garante que nenhuma rota escreva lixo, nem uma rota nova que esqueça o Zod.

### Segurança

**A senha é derivada no navegador, não no servidor.** É a decisão menos óbvia do projeto
([ADR-005](docs/adr/adr-005-parametros-do-scrypt.md)). Guardar senha exige um algoritmo
**lento de propósito** — é o que torna caro testar bilhões de palpites depois de um
vazamento. O mínimo recomendado pelo OWASP para o `scrypt` custou 48 ms de CPU medidos no
runtime da Cloudflare, e o plano gratuito dá 10 ms por requisição inteira. As duas
restrições do projeto não cabiam juntas.

A saída: o aparelho da pessoa faz a conta cara e envia o resultado; o servidor re-embaralha
com sal próprio e guarda só isso. **A lentidão que protege não sumiu — mudou de máquina.**

E a pergunta que sempre volta: rate-limit não substitui isso. O rate-limit defende o
formulário de login; o hash lento defende o banco **depois que ele vaza**, quando o
atacante roda as tentativas na máquina dele.

**Sem CAPTCHA, em lugar nenhum** ([ADR-009](docs/adr/adr-009-anti-abuso-sem-captcha.md)).
CAPTCHA é barreira de acessibilidade documentada: o visual exclui quem tem baixa visão, o
de áudio exclui quem tem deficiência auditiva. O público deste site é exatamente quem ele
rejeita. O anti-abuso é limite por janela de tempo, com o identificador guardado como
HMAC — o IP entra na função e não sai dela.

**O número de registro é sorteado, não sequencial**
([ADR-007](docs/adr/adr-007-numero-de-registro-sorteado.md)). A página de verificação do
crachá é pública; com numeração sequencial, qualquer pessoa pediria 00001, 00002 e
montaria a lista de associados de uma associação de pessoas com deficiência. O alfabeto
exclui `0`, `O`, `1`, `I` e `L`, porque o número é ditado por telefone.

### Qualidade

| Ferramenta                                                         | O que faz                                                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **[Vitest](https://vitest.dev)**                                   | Testes rápidos: restrições do banco, emissão concorrente, regressão de interface e auditoria das specs. |
| **[Playwright](https://playwright.dev)**                           | Dirige um navegador de verdade contra o runtime real.                                                   |
| **[axe-core](https://github.com/dequelabs/axe-core)**              | Auditoria automatizada de acessibilidade, níveis A e AA.                                                |
| **[ESLint](https://eslint.org) + [Prettier](https://prettier.io)** | Erro provável e formatação — duas coisas diferentes, duas ferramentas.                                  |
| **[gitleaks](https://github.com/gitleaks/gitleaks)**               | Procura credencial no que está sendo commitado e no histórico completo.                                 |

**O aceite não depende de ninguém ler.** Este projeto tem 276 critérios de aceite
escritos em Gherkin, e critério que exige leitura humana é um portão que nunca fecha.
Duas camadas resolvem isso: uma lê o **código-fonte** das telas e falha se um texto
removido voltar (rápida, roda sempre); outra sobe o **workerd real** e percorre cadastrar
→ área → corrigir → sair → entrar → excluir, mede rolagem horizontal em sete larguras e
roda o axe em dez telas.

Ela roda contra produção também: `APPD_BASE=https://... npm run aceite`.

---

## Como rodar

Requisitos: **Node 22 ou superior** e npm. Nenhuma conta na Cloudflare é necessária — o
`wrangler` simula Workers e D1 no seu computador.

```bash
npm install
npm run dev              # http://localhost:3000
```

Isso já dá o site institucional inteiro. Para exercitar a **área do associado**, que
precisa de banco:

```bash
npm run db:aplicar:local   # aplica as migrations no SQLite local
npm run db:seed:local      # popula com dado fictício (opcional)
npm run cf:dev             # build + runtime real do Cloudflare em :8787
```

> **Por que dois modos.** `npm run dev` é rápido e recarrega ao salvar, mas roda em
> Node — e Node é mais permissivo que o runtime da Cloudflare. As duas armadilhas que
> mais custaram tempo neste projeto (o limite de dez classes de caractere por padrão
> `GLOB` no D1 e o teto de 10 ms de CPU) **passaram no `dev` e falharam no `cf:dev`**.
> Antes de dar algo por pronto, rode no runtime real.

### Comandos

| Comando                              | O que faz                                                             |
| ------------------------------------ | --------------------------------------------------------------------- |
| `npm run dev`                        | Servidor de desenvolvimento com recarga ao salvar                     |
| `npm run cf:dev`                     | Build + `wrangler dev`: o runtime que a produção usa                  |
| `npm test`                           | Testes rápidos, sem navegador                                         |
| `npm run aceite`                     | Gate de aceite: navegador real, ciclo completo, sete larguras, axe    |
| `npm run lint` / `npm run typecheck` | ESLint e `vue-tsc`                                                    |
| `npm run format`                     | Prettier                                                              |
| `npm run db:generate`                | Gera a migration SQL a partir do schema — **revise o arquivo gerado** |
| `npm run db:aplicar:local`           | Aplica as migrations no D1 local                                      |
| `npm run cf:parar`                   | Encerra `wrangler` órfão (Windows: destrava o `EBUSY` no build)       |

---

## Estrutura

Layout padrão do Nuxt 4, com quatro pastas próprias.

```
app/                 interface — o que roda no navegador
├─ assets/css/       tokens e folha base do design system
├─ components/       componentes reutilizáveis (auto-importados)
├─ layouts/          casca comum: cabeçalho, rodapé
├─ middleware/       guardas de rota no cliente
├─ pages/            cada arquivo é uma URL
└─ utils/            funções de apoio (auto-importadas)

server/              o que roda no Worker
├─ api/              endpoints HTTP
├─ database/         schema Drizzle — a fonte da verdade das tabelas
├─ middleware/       guardas de rota no servidor
└─ utils/            sessão, banco, senha, emissão de número

shared/              código usado pelos dois lados — schemas Zod, conteúdo, domínio
drizzle/migrations/  SQL versionado, revisado, nunca gerado direto no banco
public/              arquivos servidos como estão

test/                Vitest, mais o gate de aceite em test/aceite/
docs/                inventário de conteúdo, ADRs, pendências, prompts de design
openspec/            o rito: changes em andamento e arquivadas
scripts/             utilitários de desenvolvimento chamados pelos comandos npm
```

**Guardas de rota nos dois lados, de propósito.** A do servidor vale para link direto,
recarregamento e navegador sem JavaScript; a do cliente vale para navegação interna, que
não passa pelo servidor. Quem manda é a do servidor — se as duas discordarem, a resposta
HTTP é a verdade.

---

## Como o projeto é conduzido

Toda mudança relevante vira uma pasta em [`openspec/changes/`](openspec/changes/) com
proposta, requisitos e tarefas, e só é arquivada depois que os critérios de aceite
passam. Decisões que não devem ser rediscutidas viram **ADR** em
[`docs/adr/`](docs/adr/) — contexto, decisão, alternativas recusadas e consequências.

Duas regras vieram de erro cometido aqui, e estão escritas para não se repetirem:

**Tarefa marcada no mesmo commit da entrega.** Não existe "marco depois" — o depois é
exatamente onde o registro se descola do código. Um único dia produtivo bastou para o
`openspec/` passar a descrever um projeto diferente do que estava no disco.

**`[FEITO]` não é `[VALIDADO]`.** Código rodando não é critério de aceite percorrido.
Confundir os dois é o que transforma arquivar em carimbo.

O histórico completo, incluindo o dia em que o rito foi abandonado e como foi
reconciliado, está em [`openspec/ESTADO.md`](openspec/ESTADO.md).

---

## Contribuindo

Antes de abrir PR, leia [CLAUDE.md](CLAUDE.md) — ele resume as regras do repositório em
uma página — e rode:

```bash
npm run lint && npm run typecheck && npm test
```

Se a mudança toca alguma tela, rode também `npm run aceite`.

Três coisas que não passam em revisão: credencial ou dado de pessoa real versionado;
tela que reprova no axe em nível A ou AA; e regra de validação duplicada em vez de
importada de `shared/`.

Bug de acessibilidade tem prioridade sobre qualquer outra coisa.

---

## Licença

A definir junto com a APPD-SJC. O código será aberto; **marca, logo, fotos e textos
institucionais pertencem à associação** e não estão cobertos pela licença do código.
