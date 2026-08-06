# Proposal: Consentimento específico do Art. 11 e privacidade do titular

- ID: PROP-20260805-consentimento-e-privacidade Status: em discussão
- Origem: `openspec/README.md` (change 2 da Fase 3) · `docs/campos-formulario.md` campo 12 ·
  `docs/prompts-design/privacidade.md` · decisões do dono de 2026-08-05
- Autor do registro: Especificador (Claude Code) Dono do conteúdo: Arthur Barbero
- Data: 2026-08-06 Versão: v2 (reescrita contra `modelo-de-dados`, depois do gate)

## Motivação (por quê)

O formulário de atendimento pergunta, no campo 12, **qual é a deficiência da pessoa**. Isso é
dado referente à saúde e, portanto, dado pessoal sensível pelo Art. 5º, II da Lei 13.709/2018
(LGPD). O Art. 11, I permite tratá-lo quando o titular consente "de forma específica e
destacada, para finalidades específicas" — o oposto do "li e aceito os termos" genérico, que o
Art. 8º, §4º declara nulo.

Hoje não existe nada disso. O site atual coleta por um Google Forms, não publica política de
privacidade, não tem canal para a pessoa exercer direito nenhum e ainda expõe dado pessoal em
página aberta: 37 certificados individuais em PDF público (`docs/inventario-conteudo.md`
seção 10) e o histórico clínico do presidente na página institucional. O site novo não pode
repetir isso — e, sem esta change, a change `formulario-atendimento` não tem base legal para
existir.

O que muda quando isso entra: a pessoa sabe o que a associação guarda, consente de forma
separada e reversível, e tem um caminho concreto para conferir, corrigir, levar embora ou
apagar a própria informação. E a associação passa a ter prova de **com o que** cada pessoa
concordou e **quando** — que é exatamente o que o registro versionado do aceite resolve.

## Escopo (o que entra)

- Página `/privacidade` — Política de Privacidade em linguagem simples, com sumário navegável
  e o dispositivo legal em bloco secundário depois da explicação.
- Página `/seus-direitos` — um cartão por direito do Art. 18, com verbo de ação.
- **Termo de consentimento específico do Art. 11**, versionado: cada versão tem identificador,
  data de vigência, hash do texto e classificação da mudança (material ou editorial). Versão
  publicada é imutável.
- **Registro do aceite**: qual versão do termo a pessoa aceitou, com data e hora, gravado em
  tabela própria no D1, em modo append-only (revogação é linha nova, nunca edição da
  anterior).
- **Fluxo de exercício de direitos**: confirmação de existência, acesso, correção,
  portabilidade, revogação do consentimento e exclusão — incluindo o fluxo de exclusão em
  três telas (pedido, confirmação, recibo).
- Tabela `consentimentos` no D1, com migration versionada.
- Regra transversal: **tipo de deficiência nunca aparece na verificação pública do crachá**, e
  só aparece no crachá mediante opt-in separado.

## Fora de escopo (o que NÃO entra)

- **A coleta em si** — os 15 campos, a validação e a persistência da inscrição são da change
  `formulario-atendimento`. Aqui se define o consentimento e o registro dele, não o formulário.
- **A conta** — cadastro, login, senha e sessão são da change `cadastro-e-login`. Esta change
  consome `usuarios.id`, não o cria.
- **A tela pública de verificação** (`/verificar/<numero>`) e o crachá — são da change
  `cracha-do-associado`. Aqui entra só a **proibição** de expor o dado sensível nelas, como
  critério de aceite herdado.
- **A rota `/certificados`** e os 37 PDFs individuais: o dono decidiu em 2026-08-05 que a rota
  fica **fora do escopo do site novo**. O que sobra é a pendência PB-3 (o que a APPD faz com os
  arquivos que continuam públicos no site atual) — decisão da associação, não deste projeto.
- **O texto do presidente em `/sobre`** (risco R2 de `docs/pendencias-appd.md`): é conteúdo
  institucional, tratado na change `site-institucional`.
- **Painel administrativo** de gestão de pedidos de titular — V1.1.
- **Envio de e-mail** (aviso de nova versão do termo, recibo por e-mail): não há solução de
  custo zero definida no projeto. Toda comunicação desta change acontece na tela.
- **Anonimização e bloqueio** (Art. 18, IV) como funcionalidade automatizada.

## Impacto

- **Toca dado sensível?** Sim — é a change que existe por causa disso. Gate de revisão do dono
  obrigatório antes de virar task, e gate de validação item a item antes do archive.
- **Toca produção / custo real?** Não. Roda no mesmo Worker + D1 já decididos (ADR-001).
- **Arquitetura/stack afetada?** Uma decisão nova: **onde vive o texto das versões do termo**
  (versionado no repo, com o hash gravado no aceite, ou linhas em tabela no D1). Decisão do
  arquiteto → **ADR-006**, primeira task desta change.
- **Dependências**: `cadastro-e-login` (tabela `usuarios`) para amarrar o aceite a uma pessoa.
  `formulario-atendimento` é quem consome o consentimento. `cracha-do-associado` herda a
  proibição de exposição. O design das duas telas já existe em
  `docs/prompts-design/privacidade.md`; falta gerar e aprovar no Claude Design antes de
  implementar.

## Premissas e questões abertas

- Premissa: a APPD é a controladora dos dados. O site é operado pelo projeto, e a hospedagem
  (Cloudflare) é operadora que trata os dados apenas para manter o site no ar.
- Premissa: não há compartilhamento com terceiro, venda de dado, publicidade nem rastreador.
  Se isso mudar, a política muda junto e vira mudança **material** do termo.
- **Cinco pendências bloqueantes** estão registradas na spec (PB-1 a PB-5). Nenhuma impede
  escrever o código; todas impedem o **archive** desta change e a publicação do site no domínio
  da APPD. Não se inventa prazo, nome de encarregado nem formato de protocolo.

## Próximo passo no fluxo

proposal → spec (`spec.md`) → critério de aceite Gherkin (dentro da spec) → tasks
(`tasks.md`) → ADR-006 → design aprovado no Claude Design → implementação.
