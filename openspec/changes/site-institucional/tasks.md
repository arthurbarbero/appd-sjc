# Tasks: Site institucional público da APPD-SJC

- Deriva de: SPEC-site-institucional · Data: 2026-08-05 · Versão: v1
- Dono padrão: Arthur Barbero (dono do projeto). Onde o dono é **APPD**, a task está
  bloqueada por resposta da associação e não pode ser fechada por dentro do time.

Convenção: `[x]` concluída · `[ ]` pendente. Toda task tem aceite verificável — nenhuma
fecha por "parece pronto". As concluídas foram implementadas **antes** desta spec (ver
`proposal.md`); marcá-las como feitas registra o que existe, e não substitui o gate de
validação, que ainda vai rodar cenário a cenário.

---

## Fatia 1 — Fundação de conteúdo e layout [CONCLUÍDA]

- [x] **1.1 Fonte única de conteúdo** — `shared/conteudo.ts` com associação, regras de
      atendimento, 5 serviços, 4 projetos, pessoas, PIX, doação em espécie, regimento e
      COMTRAD, cada oferta com lista `aConfirmar`.
      _Aceite_: nenhuma página tem texto institucional embutido no template.
      _Dono_: Arthur.
- [x] **1.2 Layout comum** — cabeçalho com marca, menu de 6 itens com `aria-current`,
      botão de menu mobile com `aria-expanded`/`aria-controls`, `<main id="conteudo">`,
      rodapé em 4 colunas.
      _Aceite_: cenários "Menu principal" (3 cenários) passam. _Dono_: Arthur.
- [x] **1.3 "Pular para o conteúdo"** como primeiro elemento focável, visível ao foco.
      _Aceite_: cenário "O primeiro Tab é o pular para o conteúdo". _Dono_: Arthur.
- [x] **1.4 `lang="pt-BR"`** no `<html>` via `nuxt.config.ts`.
      _Aceite_: cenário "Documento declara o idioma" em todas as rotas. _Dono_: Arthur.
- [x] **1.5 Fonte auto-hospedada** (Fontsource, Atkinson Hyperlegible) — zero CDN, zero
      IP de visitante entregue a terceiro.
      _Aceite_: cenário "Nenhuma requisição sai para host de terceiro". _Dono_: Arthur.

## Fatia 2 — Páginas de descoberta e ação [CONCLUÍDA]

- [x] **2.1 Home** com a hierarquia decidida: quem somos em uma frase, ação primária
      (atendimento), ação secundária (doar), cards de serviços e projetos levando à página
      própria, outras formas de ajudar.
      _Aceite_: cenários "Card de serviço leva à página do serviço" e "Nenhum destino se
      repete em mais de dois blocos". _Dono_: Arthur.
- [x] **2.2 Hub `/atendimento`** e **`/projetos`** com as duas famílias separadas pelo
      critério do formulário oficial. _Dono_: Arthur.
- [x] **2.3 As 9 landing pages** (5 serviços + 4 projetos) na mesma espinha, conteúdo
      pesquisado com fonte, marcação "A confirmar" no que descreve a APPD.
      _Aceite_: esquema "A página do serviço traz a espinha na ordem". _Dono_: Arthur.
- [x] **2.4 As três regras do atendimento acima do botão** — fila, período da manhã,
      contribuição sugerida.
      _Aceite_: cenário "As três regras aparecem antes do botão". _Dono_: Arthur.
- [x] **2.5 Central de Doações** com favorecido, CNPJ, destino do dinheiro, doação em
      espécie e o bloco "Recebeu uma ligação da APPD?".
      _Aceite_: cenário "Público 2 chega à chave PIX". _Dono_: Arthur.
- [x] **2.6 Contato**, **Sobre nós**, **Regimento interno** e **COMTRAD** — os dois
      últimos saem da orfandade e ganham entrada no rodapé. _Dono_: Arthur.
- [x] **2.7 Página 404 útil** com HTTP 404 real, `h1` próprio, duas ações principais, os 9
      serviços e projetos e o telefone da sede.
      _Aceite_: cenários "Rota inexistente responde 404 de verdade" e "A 404 oferece as
      duas ações". _Dono_: Arthur.

## Fatia 3 — Acessibilidade construída na origem [CONCLUÍDA na implementação]

Concluída como **código**; a prova automatizada é a Fatia 6 e ainda não existe.

- [x] **3.1 Um `h1` por página** em todas as 18 páginas. _Dono_: Arthur.
- [x] **3.2 Foco de 3px com folga de 2px** em `design-system/base.css`, nenhum
      `outline: none` órfão. _Dono_: Arthur.
- [x] **3.3 Alvo mínimo de 44px** (`--alvo-min`) aplicado a botões, links de navegação,
      links de rodapé e controles. _Dono_: Arthur.
- [x] **3.4 Contraste AA calculado e documentado** em `DESIGN.md`; duas cores herdadas
      reprovaram e foram trocadas (borda marrom 2,44:1 → cinza 4,53:1; link roxo →
      `#0f4c93`, 8,48:1). _Dono_: Arthur. **Medição do renderizado fica na task 5.1.**
- [x] **3.5 Nada só por cor** — selo "A confirmar" com texto por extenso, erro de
      formulário com texto e lista de links no topo. _Dono_: Arthur.
- [x] **3.6 Texto base de 17px** e `prefers-reduced-motion` nos tokens. _Dono_: Arthur.

## Fatia 4 — Imagens e desempenho [CONCLUÍDA em parte]

- [x] **4.1 36 imagens convertidas para WebP** — 8,3 MB → 1,4 MB (−83%); logo 289 KB →
      45 KB; maior arquivo restante 116 KB.
      _Aceite_: cenário "Toda imagem de conteúdo é WebP". _Dono_: Arthur.
- [x] **4.2 Imagem de galeria com `loading="lazy"` e `decoding="async"`.**
      _Aceite_: cenário "Imagem abaixo da dobra é adiada". _Dono_: Arthur.
- [ ] **4.3 Medir o peso por rota no build de produção** e corrigir o que estourar o
      orçamento (REQ-30).
      _Aceite_: relatório com o total transferido de cada uma das 18 rotas; nenhuma rota
      sem galeria acima de 500 KB, nenhuma com galeria acima de 1 MB. _Dono_: Arthur.
- [ ] **4.4 Medir CLS e declarar dimensão nas imagens da galeria** (REQ-29).
      _Aceite_: CLS ≤ 0,1 em cada uma das 18 páginas, medido em 3G rápido. _Dono_: Arthur.

---

## Fatia 5 — O que ficou faltando: verificação [PENDENTE]

- [ ] **5.1 Verificar contraste renderizado, não calculado** (REQ-13).
      Percorrer as 18 páginas no navegador medindo a cor efetivamente pintada — token não
      prova pixel: sobreposição, opacidade herdada, sombra e imagem de fundo mudam o
      resultado. Incluir texto sobre imagem na galeria da Bocha e texto no rodapé escuro.
      _Aceite_: os 3 cenários de "Contraste medido no renderizado" passam; a planilha de
      pares medidos fica versionada em `docs/relatorios/`. _Dono_: Arthur.
- [ ] **5.2 Auditoria de acessibilidade automatizada com axe** (REQ-21).
      Adicionar `axe-core` + executor de navegador, rodar sobre as 18 páginas **e** sobre
      dois estados (formulário de contato submetido vazio, menu mobile aberto), e tornar o
      passo bloqueante no CI. Hoje o `CLAUDE.md` promete "Vitest + axe" e o `package.json`
      **não tem axe** — a promessa está descoberta.
      _Aceite_: os 3 cenários de "Auditoria automatizada" passam, com zero violação
      `serious`/`critical`, e o CI falha quando uma violação é introduzida de propósito.
      _Dono_: Arthur.
- [ ] **5.3 Teste ponta a ponta do caminho crítico** (REQ-22).
      Um fluxo por público, operado só pelo teclado, mais o caso de borda da cópia do PIX
      sem `navigator.clipboard`. Hoje o projeto tem **4 testes unitários de um formatador
      de número de registro** e nada de fluxo.
      _Aceite_: os 4 cenários de "Caminho crítico ponta a ponta" passam no CI.
      _Dono_: Arthur.
- [ ] **5.4 Teste estrutural das 18 páginas** — um `h1`, hierarquia sem salto, `alt` em
      toda imagem, `title` único, nenhum `tel:` fora de `ASSOCIACAO.telefones`, nenhum
      caractere U+202A–U+202E em href. É barato e pega regressão de conteúdo.
      _Aceite_: os esquemas de cenário de "Um h1 e hierarquia" e de "Nada apresentado como
      fato" rodam no CI. _Dono_: Arthur.

## Fatia 6 — O que ficou faltando: rotas e SEO técnico [PENDENTE]

- [ ] **6.1 Redirecionamento 301 das 7 URLs antigas** (REQ-32).
      Listado em `docs/arquitetura-informacao.md` desde a Fase 1 e **não implementado**.
      Precisa funcionar no runtime workerd, não só no `nuxt dev` — é o runtime que vai
      atender o público. Sem isso, todo link já compartilhado por WhatsApp desde 2016 cai
      na 404 no dia da virada.
      _Aceite_: o esquema "URL antiga com equivalente redireciona com 301" passa nas 7
      linhas, o esquema das 5 URLs sem equivalente responde 404, e nenhum redirecionamento
      leva mais de 1 salto. _Dono_: Arthur.
- [ ] **6.2 `sitemap.xml`** com as 18 URLs públicas e nenhuma rota de dado de pessoa
      (REQ-33).
      _Aceite_: cenário "sitemap lista as páginas públicas e nada além". _Dono_: Arthur.
- [ ] **6.3 Revisar o `robots.txt`** (REQ-34) — hoje são 2 linhas que liberam tudo e não
      apontam sitemap. Precisa proibir `/area/` e `/verificar/` antes de qualquer
      publicação, porque indexação de dado de pessoa não se desfaz.
      _Aceite_: cenário "robots aponta o sitemap e protege rota com dado de pessoa".
      _Dono_: Arthur.
- [ ] **6.4 Resolver a busca da 404** (REQ-8) — hoje é um campo que aceita texto e
      descarta o `submit`. Decidir entre buscar de verdade sobre `TODAS_AS_OFERTAS` mais as
      páginas institucionais, ou remover o campo e manter só os links diretos.
      "Deixar como está" não é opção: campo que promete e não faz é pior que campo ausente.
      _Aceite_: os 2 primeiros cenários de "Busca da 404" passam (busca real) **ou** o
      terceiro passa (campo removido). _Dono_: Arthur decide; implementação de Arthur.

## Fatia 7 — Registro e fechamento [PENDENTE]

- [ ] **7.1 ADR-010: implementar antes de especificar** — registrar a decisão do dono de
      pular a Fase 3 para ter o site rodando, com o custo assumido (35 requisitos escritos
      depois do código, nenhum provado por teste na data da spec) e a condição de reversão
      (as changes com banco não repetem isso).
      _Aceite_: `docs/adr/adr-003-*.md` com contexto, decisão, alternativas e
      consequências, dono e data. _Dono_: Arthur.
- [ ] **7.2 ADR-011: publicar com marcação "A confirmar"** — registrar a decisão de pôr as
      9 landing pages no ar com selo em vez de esperar a revisão da associação, e a
      condição de saída (a APPD revisa antes de ir ao domínio dela).
      _Aceite_: `docs/adr/adr-004-*.md` completo. _Dono_: Arthur.
- [ ] **7.3 Gate de validação item a item** — rodar `validacao-aceite` contra os 35
      requisitos e emitir parecer.
      _Aceite_: nenhum requisito em [PARCIAL] ou [PENDENTE]; todo cenário com veredito
      registrado. _Dono_: Arthur (papel validador).
- [ ] **7.4 Mover para `openspec/archive/site-institucional/`** depois do gate aprovado.
      _Dono_: Arthur.

---

## Bloqueadas pela APPD (não fecham por dentro do time)

Nenhuma destas impede a entrega técnica desta change, mas todas impedem a **publicação no
domínio da associação**. Fonte: `docs/pendencias-appd.md`.

- [ ] **B.1 Escanear o QR do PIX com o app do banco** (P0-2). A estrutura do payload BR
      Code e o CRC foram conferidos; que o banco aceite, não. _Dono_: Arthur (teste
      prático) — o dado em si já é o CNPJ real.
- [ ] **B.2 E-mail que recebe a mensagem do formulário de contato** (P0-4). Enquanto não
      vier, o REQ-26 mantém a tela dizendo que nada foi enviado. _Dono_: APPD.
- [ ] **B.3 Qual telefone é o WhatsApp oficial** (P1-7). Seis números circulam com rótulo
      inconsistente. _Dono_: APPD.
- [ ] **B.4 Confirmar as fotos das pessoas em `/sobre`** — que a mulher é a fundadora e o
      homem é o presidente é inferência, não informação. _Dono_: APPD.
- [ ] **B.5 Autorização por escrito do texto sobre o presidente** com histórico clínico
      (risco R2, dado sensível do Art. 11 da LGPD). _Dono_: APPD.
- [ ] **B.6 Catálogo de serviços real em 2026** (P0-1) — enquanto não vier, o selo "A
      confirmar" segura. _Dono_: APPD.
- [ ] **B.7 Logo em vetor** (P0-3) — o bitmap atual é provisório. _Dono_: APPD.

---

## Ordem sugerida

5.4 → 5.2 → 5.1 → 6.3 → 6.1 → 6.2 → 6.4 → 4.3 → 4.4 → 7.1 → 7.2 → 7.3 → 7.4.

O teste estrutural (5.4) vem primeiro porque é o mais barato e pega regressão enquanto o
resto anda. O `robots.txt` (6.3) vem antes do 301 porque indexação errada não se desfaz,
e redirecionamento errado se corrige.
