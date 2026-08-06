# Spec: Crachá do associado e verificação pública

- ID: SPEC-cracha-do-associado Deriva de: PROP-20260805-cracha-do-associado
- Status: rascunho (aguarda gate do revisor-spec e aprovação do dono)
- Dono do conteúdo: Arthur Barbero · Aprovador da spec: Arthur Barbero
- Versão: v2 · Data: 2026-08-06
- **Fonte da verdade das tabelas**: [`modelo-de-dados`](../modelo-de-dados/spec.md)

> **v2.1 (2026-08-06)** — a foto volta a ter entrada no formulário de atendimento, como
> campo opcional, por decisão do dono. Esta change continua dona do componente, do limite e
> do armazenamento; a outra apenas chama (REQ-8a).
>
> **v2 (2026-08-06)** — reescrita contra o contrato de dados, depois do gate. Esta change
> passa a ser **dona única de `/area/cracha` e da foto inteira**, incluindo o envio, que
> antes estava dividido com `cadastro-e-login`
> ([ADR-013](../../../docs/adr/adr-013-fronteira-de-rotas-entre-changes.md)). Em troca,
> deixa de reivindicar a **emissão** do `numero_registro`: ela é de `cadastro-e-login`, e
> aqui o número é só exibido.

> **Todos os dados de exemplo desta spec são fictícios.** "Maria Aparecida da Silva",
> `APPD-2026-00042` e qualquer telefone ou endereço de pessoa citados em cenário são
> invenção para teste. Nenhum dado de pessoa real entra em spec, seed, fixture ou repo.

## Objetivo

Dar a cada associado um número de registro imutável e um crachá que ele mesmo gera, baixa e
imprime pelo navegador, conferível por qualquer pessoa em um endereço público que expõe
exatamente três informações: nome, número e situação.

## Glossário (termos que não podem ter dupla leitura)

| Termo                 | Definição desta spec                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| `numero_registro`     | Cadeia que casa com `^APPD-\d{4}-\d{5}$`. Chave pública do associado.   |
| Situação              | Valor de `situacao`: `ativo` ou `inativo`. Só isso é público.           |
| Foto do crachá        | JPEG 400 × 500 px produzido no navegador, guardado como BLOB no D1.     |
| Teto rígido           | Limite que rejeita, nunca degrada em silêncio: 100 KB = 102.400 bytes.  |
| Exportação            | Geração do arquivo PNG ou PDF, inteira no navegador da pessoa.          |
| Opt-in de deficiência | Escolha de imprimir o tipo de deficiência **no crachá**, e só nele.     |
| Liberação imediata    | Crachá utilizável assim que a foto é aceita, sem revisão humana prévia. |

## Requisitos

### Número de registro

- **REQ-1**: O `numero_registro` DEVE casar com a expressão `^APPD-\d{4}-\d{5}$`, onde os
  quatro primeiros dígitos são o ano civil da conclusão do cadastro e os cinco últimos são o
  sequencial daquele ano, preenchido com zeros à esquerda. Exemplo fictício:
  `APPD-2026-00042`.
- **REQ-2 a REQ-6**: **A emissão do número não é desta change** (ADR-013). Quem gera é
  `cadastro-e-login` (REQ-2 a REQ-5b de lá), no momento em que o cadastro é concluído. Esta
  change **consome e exibe**, e depende daquele contrato: formato, unicidade garantida pelo
  banco e imutabilidade.

  > **Bloqueio B10 do gate.** A v1 tinha, na task T1.2, "transação que lê o maior sequencial
  > do ano e grava o próximo", enquanto `cadastro-e-login` exigia unicidade pelo banco com
  > retentativa e dizia, com todas as letras, que ler-o-maior-e-somar-1 **não satisfaz** o
  > requisito. Dois emissores, dois algoritmos, cada um reprovando no gate do outro. O
  > algoritmo que fica é o da change dona, porque o daqui quebra com cadastros simultâneos.
  >
  > Junto com ele cai a exigência de sequência **consecutiva sem buraco** que estava no
  > REQ-5 da v1: retentativa pula números por construção, e um número faltando não prejudica
  > ninguém. `cadastro-e-login` REQ-5a registra isso como comportamento esperado, não defeito.

- **REQ-7**: Toda exibição do `numero_registro` na interface DEVE usar
  `font-variant-numeric: tabular-nums`.

### Foto do crachá

- **REQ-8**: A foto DEVE ser obrigatória **para o crachá existir**, e opcional em todo o
  resto. Sem foto aceita, as ações de exportação ficam desabilitadas **com o motivo escrito
  em texto ao lado**, nunca apenas esmaecidas — e nenhuma outra função do site é bloqueada.
- **REQ-8a**: A foto tem **duas portas de entrada e um caminho só**: o campo opcional do
  formulário de atendimento (`formulario-atendimento` REQ-7d) e `/area/cracha`. As duas
  usam **este** componente de recorte e compressão, **este** limite e **esta** interface de
  armazenamento. Esta change é a dona dos três; a outra chama.

  > **Como isso não vira o B11 de novo.** O bloqueio do gate não era "duas telas enviam
  > foto" — era **dois limites diferentes**: 5 MB aceitos no cadastro contra 102.400 bytes
  > exigidos aqui, o que fazia o cadastro gravar o que o crachá recusava. Com um componente
  > só, o limite é o mesmo por construção, e não há como divergir de novo.

- **REQ-9**: O sistema DEVE aceitar arquivos de origem `image/jpeg`, `image/png` e
  `image/webp` com até **10 MB antes do processamento no navegador**. Outro tipo ou tamanho
  maior é recusado antes de qualquer processamento, com mensagem que diz o que fazer.

  > **Bloqueio B11 do gate, e o que ele era de verdade.** A v1 de `cadastro-e-login` aceitava
  > **5 MB** no cadastro e gravava direto; aqui o teto de entrada era 10 MB, mas o que chega
  > ao servidor precisa ser 400 × 500 px e ≤ 102.400 bytes (REQ-11, REQ-12, REQ-14). Uma foto
  > aceita lá era recusada aqui. O ADR-013 resolve pela posse: **o cadastro não recebe foto**,
  > e existe um caminho só, este. Os dois números convivem sem conflito porque medem coisas
  > diferentes — 10 MB é o que a pessoa pode escolher do celular, 102.400 bytes é o que sai do
  > recorte e da compressão no navegador.

- **REQ-10**: O recorte DEVE ocorrer no navegador, com moldura fixa de proporção 4:5, e DEVE
  ser inteiramente operável por teclado: setas movem a imagem, `+` e `−` aproximam e afastam,
  e existem botões visíveis de aproximar e afastar com alvo de no mínimo 44 × 44 px, com 8 px
  de folga entre alvos vizinhos (régua única do projeto).
- **REQ-11**: A compressão DEVE ocorrer no navegador via `canvas`, produzindo JPEG de
  exatamente 400 × 500 px com qualidade 0,75.
- **REQ-12**: Se o resultado da compressão exceder o teto rígido de 102.400 bytes, o sistema
  DEVE recusar a foto e exibir o tamanho obtido e a instrução do que fazer. É proibido
  reduzir a qualidade abaixo de 0,75, recortar mais, ou enviar assim mesmo.
- **REQ-13**: Durante o envio, recorte e compressão, o sistema NÃO DEVE fazer nenhuma
  requisição de rede além do `PUT`/`POST` final que grava a foto já pronta.
- **REQ-14**: O servidor NÃO DEVE confiar no cliente: ao receber a foto, revalida tipo MIME
  real pelos bytes iniciais, dimensões 400 × 500 e tamanho ≤ 102.400 bytes, e rejeita com
  HTTP 400 o que não casar.
- **REQ-15**: A foto DEVE ser gravada como BLOB no D1, através da interface
  `ArmazenamentoFoto` (`gravar`, `ler`, `apagar`), de modo que trocar o meio de armazenamento
  no futuro não exija tocar em rota, componente ou tela.
- **REQ-16**: A foto DEVE ser servida apenas por rota autenticada. Requisição sem sessão
  válida recebe HTTP 401 e nenhum byte de imagem.
- **REQ-17**: Requisição autenticada pedindo a foto de outro associado DEVE receber HTTP 404
  — o mesmo código de uma foto inexistente —, para não confirmar a existência do cadastro
  alheio.
- **REQ-18**: A foto NÃO DEVE ser servida, embutida, referenciada ou cacheada em nenhuma
  rota pública, incluindo `/verificar/<numero_registro>`.

### Crachá e exportação

- **REQ-19**: O crachá DEVE ser renderizado em HTML/CSS na proporção de cartão vertical
  54 × 85,6 mm, com frente e verso rotulados.
- **REQ-20**: A frente DEVE conter, e apenas: nome da associação, foto, nome completo,
  rótulo "Registro" com o `numero_registro`, e a situação apresentada por ícone **e** texto.
- **REQ-21**: O verso DEVE conter: QR Code apontando para `/verificar/<numero_registro>` no
  domínio do site, o mesmo endereço escrito por extenso em texto legível, endereço e CNPJ da
  associação, telefone, e a frase "Este crachá identifica a pessoa associada e não substitui
  documento oficial com foto."
- **REQ-22**: O crachá NÃO DEVE conter endereço da pessoa, telefone da pessoa, data de
  nascimento, nome ou contato de cuidador, e-mail, nem qualquer dado do campo 12 do formulário
  sem o opt-in do REQ-25.
- **REQ-23**: A exportação em PNG e em PDF DEVE ser produzida integralmente no navegador,
  sem chamada a serviço externo e sem rota de renderização no servidor. Durante a exportação,
  zero requisições de rede.
- **REQ-24**: A tela DEVE informar em texto visível, com corpo ≥ 15 px, que o arquivo é
  gerado no próprio navegador e não é enviado para fora.
- **REQ-25**: O opt-in de tipo de deficiência DEVE ser uma caixa de seleção única, **separada
  das demais**, **desmarcada por padrão**, com texto que descreve só a consequência de marcar
  e a de não marcar. É proibido usar as palavras "recomendado", "ajuda", "facilita" ou
  equivalentes, pré-marcar, destacar com cor de ação ou acompanhar de emoji ou selo.
- **REQ-26**: Marcar o opt-in DEVE afetar **exclusivamente** o crachá renderizado e exportado.
  Nenhum efeito em `/verificar/<numero_registro>`, na área do associado ou em qualquer
  resposta de API pública.
- **REQ-27**: O crachá DEVE ficar disponível assim que a foto for aceita — liberação imediata.
  A interface NÃO DEVE exibir estado "em análise", "aguardando aprovação", selo de validação
  ou promessa de revisão pela associação.

### Verificação pública

- **REQ-28a**: Para conta **excluída**, `/verificar/<numero>` DEVE responder HTTP 200,
  exibir o número e a situação `inativo`, e **não exibir nome** — o nome foi apagado
  (`modelo-de-dados` REQ-29). O `numero_registro` é preservado e nunca reutilizado, para que
  um crachá antigo não passe a identificar outra pessoa. Isso fecha o bloqueio B23 e o
  `[A CONFIRMAR]` que `area-do-associado` tinha no assunto.
- **REQ-28**: `GET /verificar/<numero_registro>` DEVE responder HTTP 200 e exibir, no máximo,
  três campos de dado: nome, `numero_registro` e situação. Nenhum outro campo do cadastro
  pode aparecer no HTML, no JSON embutido, em atributo `data-*`, em comentário, em cabeçalho
  HTTP ou em qualquer resposta de API consumida pela página.
- **REQ-29**: A resposta para número inexistente e para número fora do formato DEVE ser
  **byte a byte idêntica** no bloco de resultado: mesmo status HTTP 200, mesmo texto, mesma
  estrutura. É proibido dizer que o formato está errado, apontar quantos dígitos faltam,
  sugerir número parecido ou validar o padrão na tela.
- **REQ-30**: Para não vazar por tempo de resposta, o servidor DEVE executar a mesma consulta
  ao banco nos dois casos do REQ-29, inclusive quando a entrada não casa com o formato.
- **REQ-31**: Situação `inativo` DEVE ser apresentada como informação, não como erro: sem
  vermelho, sem a palavra "inválido", sem "fraude", sem explicação do motivo da inatividade,
  e com o próximo passo (telefone da associação) oferecido.
- **REQ-32**: A página NÃO DEVE oferecer busca por nome, sugestão enquanto digita, listagem
  de associados, exportação em lote ou qualquer endpoint que aceite consulta por outro campo
  que não o `numero_registro` completo.
- **REQ-33a**: O endereço IP usado no limite do REQ-33 NUNCA é gravado em texto claro. Vale a
  **regra única do projeto** (`modelo-de-dados` REQ-30): `HMAC-SHA-256(ip, segredo)`, com o
  segredo em Cloudflare Secrets, na mesma tabela `tentativas` usada pelo formulário, com
  `escopo = 'verificacao'`. Era o bloqueio B21 — mesma categoria de dado, duas regras.
- **REQ-33**: O sistema DEVE limitar consultas de verificação a **20 por minuto por hash
  de IP** (nunca pelo IP em claro — ver REQ-33a);
  acima disso responde HTTP 429 com mensagem neutra, idêntica para qualquer número.
- **REQ-34**: A página DEVE exibir, em texto corrido de corpo normal (não em nota de rodapé),
  a declaração explícita do que ela não mostra: endereço, telefone, data de nascimento,
  contato de cuidador, tipo de deficiência e foto.
- **REQ-35**: A página DEVE ser legível e responder sem JavaScript: o resultado da rota
  `/verificar/<numero_registro>` é renderizado no servidor.

### Capacidade e limites técnicos

- **REQ-36**: O sistema DEVE respeitar o teto de 2.000.000 bytes por linha do D1. Com foto de
  102.400 bytes, a linha do associado usa no máximo ~5% do teto — folga confortável, inclusive
  se algum dia a foto for guardada em base64 (≈136.534 bytes, ~7%).
- **REQ-37**: A capacidade DEVE ser documentada e verificada por teste de estimativa. Com o
  banco gratuito de 500 MB (524.288.000 bytes) do ADR-001 e um custo de ~106.496 bytes por
  associado (102.400 de foto + ~4 KB de dados textuais e inscrições):
  - **teto duro de 500 MB → ~4.900 associados**;
  - **gatilho de revisão do ADR-001, em 350 MB → ~3.400 associados**.
    Esses números DEVEM aparecer no ADR de armazenamento de foto e ser reavaliados se a APPD
    informar volume acima de 3.000 associados.
- **REQ-38** `[verificado por task, não por Gherkin]`: O sistema DEVE registrar métrica simples de ocupação (contagem de fotos ×
  tamanho médio) acessível ao operador, para que o gatilho de 350 MB seja percebido antes de
  virar problema.

### Acessibilidade (bloqueante)

- **REQ-39**: As duas telas DEVEM atender WCAG 2.2 AA, verificado por axe sem violação de
  **nível A ou AA** — a régua única do projeto, medida pela conformidade WCAG e não pela
  severidade que o axe atribui: um único `h1`, hierarquia de headings sem pulo,
  contraste AA, foco visível de 3 px com 2 px de folga, alvos ≥ 44 px com 8 px de folga
  entre alvos vizinhos, corpo ≥ 17 px (nada
  abaixo de 15 px), texto não justificado, `prefers-reduced-motion` respeitado.
- **REQ-40**: Situação do crachá e resultado da verificação DEVEM ser comunicados por ícone
  **e** texto, nunca só por cor.
- **REQ-41**: O resultado do envio de foto e o resultado da consulta de verificação DEVEM ser
  anunciados em região `aria-live="polite"`.
- **REQ-42**: O indicador de progresso do processamento da foto DEVE ser determinado
  (`progressbar` com valor), nunca uma animação que gire indefinidamente.

### Privacidade e repositório

- **REQ-43**: Nenhuma foto, nenhum dado de pessoa real e nenhum banco local DEVEM ser
  versionados. Fixtures e seeds usam apenas dado fictício, marcado como fictício no arquivo.

## Comportamento esperado

**Caminho feliz.** A pessoa conclui o cadastro e recebe `APPD-2026-00042`. Abre
`/area/cracha`, vê o lugar do crachá vazio e o botão "Enviar minha foto". Escolhe uma imagem
de 3 MB, ajusta o enquadramento na moldura 4:5 com teclado ou toque, confirma. O navegador
reduz para 400 × 500 e gera um JPEG de 62 KB, que sobe e é aceito. O crachá aparece na hora,
frente e verso, com a caixa do tipo de deficiência desmarcada. Ela clica "Baixar em PDF" e o
arquivo é gerado localmente. Na portaria, alguém lê o QR Code, cai em
`/verificar/APPD-2026-00042` e vê três linhas: nome, número, "Associado ativo".

**Erros e bordas.**

- Foto que não cabe em 100 KB depois da compressão: recusada com o tamanho obtido e a
  instrução de tentar outra imagem. O crachá permanece no estado anterior; nada é gravado.
- Arquivo que não é imagem, ou acima de 10 MB: recusado antes de processar.
- Falha de rede no envio: a foto recortada permanece na tela, o botão "Tentar de novo" reenvia
  o mesmo resultado sem exigir novo recorte.
- Número consultado que não existe, ou digitado como `appd 2026 42`, `12345` ou string vazia:
  resposta única e idêntica, sem dica de formato.
- Cadastro inativo consultado: informa que o número existe e o cadastro não está ativo, sem
  linguagem de erro e sem motivo.
- Sessão expirada ao pedir a foto: HTTP 401, tela pede login novamente e não quebra o crachá.
- Navegador sem suporte a `canvas.toBlob`: mensagem que orienta a usar outro navegador ou
  ligar para a associação, nunca um envio silencioso da imagem original.

## Fora de escopo

Repetido aqui de propósito, para cortar scope creep na hora da task: autenticação e sessão
(`cadastro-e-login`); consentimento do Art. 11 e política de privacidade
(`consentimento-e-privacidade`); aprovação prévia, moderação e revogação administrativa
(`painel-admin`); impressão física pela associação; assinatura digital ou selo de segurança;
busca por nome, listagem ou consulta em lote; substituição de documento oficial.

## Premissas e dependências

- Sessão e tabela de usuários entregues por `cadastro-e-login`.
- Texto da política de privacidade entregue por `consentimento-e-privacidade`.
- Design de `/area/cracha` e `/verificar/<numero>` aprovado no Claude Design antes de qualquer
  HTML — regra central do `CLAUDE.md`.
- D1 + Drizzle com migrations versionadas (ADR-001). Nenhum uso de R2 ou serviço com cartão.
- Biblioteca de QR Code que rode no runtime `workerd` ou 100% no cliente, sem I/O de Node.
- ADRs a escrever antes da implementação: armazenamento de foto como BLOB no D1 (lacuna
  apontada pelo ADR-001) e liberação imediata sem aprovação prévia.

---

## Critérios de aceite (Gherkin)

Todos os dados abaixo são fictícios.

```gherkin
Funcionalidade: Número de registro
  Cobre REQ-1 a REQ-7 da SPEC-cracha-do-associado

  Cenário: Número gerado ao concluir o cadastro
    Dado que não existe nenhum registro emitido no ano de 2026
    Quando uma pessoa fictícia conclui o cadastro em 2026
    Então o sistema grava o numero_registro "APPD-2026-00001"
    E o valor casa com a expressão "^APPD-\d{4}-\d{5}$"

  Cenário: Sequencial preenchido com zeros à esquerda
    Dado que já existem 41 registros emitidos em 2026
    Quando uma pessoa fictícia conclui o cadastro em 2026
    Então o sistema grava o numero_registro "APPD-2026-00042"

  Cenário: Sequencial recomeça a cada ano civil
    Dado que o último registro emitido é "APPD-2026-00042"
    Quando uma pessoa fictícia conclui o cadastro em 2027
    Então o sistema grava o numero_registro "APPD-2027-00001"

  Cenário: Número é único no banco
    Dado que existe o registro "APPD-2026-00042"
    Quando uma gravação tenta inserir outro registro com "APPD-2026-00042"
    Então o banco recusa a operação pela restrição UNIQUE
    E nenhuma linha adicional é criada

  Cenário: Número é imutável
    Dado um associado fictício com numero_registro "APPD-2026-00042"
    Quando uma requisição tenta alterar o numero_registro para "APPD-2026-00099"
    Então o sistema responde com erro
    E o valor no banco continua "APPD-2026-00042"

  Cenário: Duas conclusões simultâneas não colidem
    Dado que já existem 41 registros emitidos em 2026
    Quando duas conclusões de cadastro ocorrem no mesmo instante
    Então os números emitidos são "APPD-2026-00042" e "APPD-2026-00043"
    E nenhum dos dois se repete

  Cenário: Número exibido em fonte tabular
    Dado um associado fictício com crachá pronto
    Quando a tela /area/cracha é renderizada
    Então o elemento do numero_registro tem font-variant-numeric igual a "tabular-nums"
```

```gherkin
Funcionalidade: Envio, recorte e compressão da foto no navegador
  Cobre REQ-8 a REQ-15 da SPEC-cracha-do-associado

  Cenário: Recorte acontece no cliente e a imagem original não sobe
    Dado um associado fictício autenticado em /area/cracha
    E uma imagem de origem de 3 MB e 3000 x 4000 px
    Quando ele conclui o recorte na moldura 4:5 e confirma com "Usar esta foto"
    Então o navegador produz um JPEG de exatamente 400 x 500 px com qualidade 0,75
    E a única requisição de rede do fluxo é o envio do JPEG já reduzido
    E o corpo enviado é menor ou igual a 102400 bytes

  Cenário: Recorte operável só pelo teclado
    Dado o recortador aberto com uma imagem carregada
    Quando o foco está na área de recorte e são pressionadas as setas e as teclas "+" e "-"
    Então a imagem se move e a aproximação muda sem uso de mouse ou gesto
    E os botões de aproximar e afastar têm alvo de no mínimo 44 x 44 px, com 8 px de folga

  Cenário: Foto acima do teto rígido é rejeitada com instrução
    Dado um associado fictício autenticado em /area/cracha
    E uma imagem que, comprimida a 400 x 500 e qualidade 0,75, resulta em 118000 bytes
    Quando ele confirma o recorte
    Então o sistema recusa a foto
    E exibe um bloco de erro com o tamanho obtido e a instrução "Escolher outra foto"
    E não reduz a qualidade abaixo de 0,75 nem recorta mais para caber
    E nenhuma foto é gravada no banco

  Cenário: Arquivo de origem grande demais é recusado antes de processar
    Dado um associado fictício autenticado em /area/cracha
    Quando ele escolhe um arquivo de 14 MB
    Então o sistema recusa antes de abrir o recortador
    E a mensagem diz o tamanho do arquivo e oferece "Escolher outra foto" e "Tirar foto agora"
    E a mensagem não culpa a pessoa nem usa a expressão "erro inesperado"

  Cenário: Arquivo que não é imagem é recusado
    Dado um associado fictício autenticado em /area/cracha
    Quando ele escolhe um arquivo "documento.pdf"
    Então o sistema recusa o arquivo e diz quais formatos aceita

  Cenário: Servidor não confia no cliente
    Dado uma requisição autenticada montada fora da interface
    Quando ela envia um JPEG de 600 x 750 px com 90000 bytes
    Então o servidor responde HTTP 400
    E nenhuma foto é gravada

  Cenário: Gravação passa pela interface ArmazenamentoFoto
    Dado uma foto válida de 62000 bytes
    Quando o servidor a grava
    Então a gravação ocorre pelo método "gravar" de ArmazenamentoFoto
    E nenhuma rota ou componente referencia diretamente a tabela de fotos

  Cenário: Progresso do processamento é determinado
    Dado o processamento da foto em andamento
    Quando a tela exibe o indicador de progresso
    Então o indicador tem papel "progressbar" com valor numérico
    E não há animação em laço infinito
```

```gherkin
Funcionalidade: Acesso à foto do crachá
  Cobre REQ-16 a REQ-18 da SPEC-cracha-do-associado

  Cenário: Foto exige sessão
    Dado um associado fictício com foto gravada
    Quando a rota da foto é chamada sem cookie de sessão
    Então a resposta é HTTP 401
    E o corpo não contém nenhum byte de imagem

  Cenário: Foto de outra pessoa responde igual a foto inexistente
    Dado dois associados fictícios, A com foto e B sem foto
    Quando B, autenticado, pede a foto de A
    Então a resposta é HTTP 404
    E é idêntica à resposta de um pedido de foto que não existe

  Cenário: Foto nunca aparece na verificação pública
    Dado um associado fictício ativo com foto gravada
    Quando alguém abre /verificar/APPD-2026-00042 sem sessão
    Então o HTML não contém nenhuma tag de imagem da pessoa
    E nenhuma requisição da página aponta para a rota de foto
```

```gherkin
Funcionalidade: Crachá, exportação e opt-in de deficiência
  Cobre REQ-19 a REQ-27 da SPEC-cracha-do-associado

  Cenário: Exportação acontece sem servidor
    Dado um associado fictício com crachá pronto e o monitor de rede ativo
    Quando ele aciona "Baixar em PNG" e depois "Baixar em PDF"
    Então dois arquivos são gerados no navegador
    E o número de requisições de rede durante a exportação é zero

  Cenário: QR Code resolve para a verificação pública
    Dado o verso do crachá do associado fictício "APPD-2026-00042"
    Quando o conteúdo do QR Code é decodificado
    Então o valor é a URL do site terminada em "/verificar/APPD-2026-00042"
    E a mesma URL aparece escrita por extenso em texto legível abaixo do QR Code
    E abrir essa URL responde HTTP 200 com o bloco de resposta da verificação

  Cenário: Crachá não expõe dado além do previsto
    Dado um associado fictício com endereço, telefone, data de nascimento e cuidador
      preenchidos no cadastro
    Quando o crachá é renderizado
    Então o conteúdo da frente e do verso não contém endereço da pessoa, telefone da pessoa,
      data de nascimento, nome de cuidador, contato de cuidador nem e-mail

  Cenário: Opt-in de deficiência vem desmarcado por padrão
    Dado um associado fictício que nunca alterou a preferência
    Quando /area/cracha é aberta
    Então a caixa "Mostrar o meu tipo de deficiência no crachá" está desmarcada
    E o crachá renderizado não contém nenhuma das palavras "Física", "Intelectual ou
      Neurodivergentes", "Sensorial (visão, audição, fala)" ou "Outro"
    E o texto ao redor da caixa não contém "recomendado", "ajuda" nem "facilita"

  Cenário: Opt-in marcado afeta só o crachá
    Dado um associado fictício ativo com tipo de deficiência "Física" no cadastro
    Quando ele marca a caixa "Mostrar o meu tipo de deficiência no crachá"
    Então a palavra "Física" passa a aparecer na frente do crachá
    E a página /verificar/APPD-2026-00042 continua sem nenhuma menção a deficiência
    E nenhuma resposta de API pública passa a conter o campo

  Cenário: Liberação é imediata
    Dado um associado fictício que acabou de ter a foto aceita
    Quando /area/cracha é recarregada
    Então o crachá está pronto e as ações de baixar estão habilitadas
    E a tela não contém os textos "em análise", "aguardando aprovação" nem "validado pela
      associação"

  Cenário: Sem foto, baixar fica desabilitado com motivo escrito
    Dado um associado fictício sem foto
    Quando /area/cracha é aberta
    Então os botões "Baixar em PNG" e "Baixar em PDF" estão desabilitados
    E ao lado deles há o texto que explica que falta a foto
```

```gherkin
Funcionalidade: Verificação pública do crachá
  Cobre REQ-28 a REQ-35 da SPEC-cracha-do-associado

  Cenário: Número válido de associado ativo
    Dado o associado fictício "Maria Aparecida da Silva", "APPD-2026-00042", situação ativo
    Quando alguém sem sessão abre /verificar/APPD-2026-00042
    Então a resposta é HTTP 200
    E o bloco de resposta mostra exatamente três campos: Nome, Número de registro e Situação
    E a situação aparece com ícone e com o texto "Associado ativo"
    E o HTML não contém endereço, telefone, data de nascimento, cuidador, e-mail, tipo de
      deficiência nem imagem da pessoa

  Cenário: Número válido de cadastro inativo
    Dado o associado fictício "APPD-2026-00043" com situação inativo
    Quando alguém sem sessão abre /verificar/APPD-2026-00043
    Então a resposta é HTTP 200
    E o texto exibido é "Este número existe, mas o cadastro não está ativo agora."
    E há o próximo passo com o telefone da associação
    E o bloco não usa a cor de erro nem as palavras "inválido", "fraude" ou "negado"
    E o motivo da inatividade não é exibido

  Cenário: Número inexistente e número mal formatado respondem igual
    Dado que não existe o registro "APPD-2026-99999"
    Quando alguém consulta "APPD-2026-99999" e depois consulta "appd 2026 42"
    Então as duas respostas têm o mesmo status HTTP 200
    E o bloco de resultado das duas é idêntico caractere a caractere
    E nenhuma das duas menciona formato, quantidade de dígitos ou número parecido

  Cenário: Consulta ao banco também ocorre para entrada mal formatada
    Dado o monitor de consultas ao D1 ativo
    Quando alguém consulta "12345"
    Então o servidor executa a mesma consulta que executaria para um número bem formatado

  Cenário: Página declara o que não mostra
    Quando alguém abre /verificar/APPD-2026-00042
    Então existe, em texto de corpo normal, a declaração de que a página não mostra endereço,
      telefone, data de nascimento, contato de cuidador, tipo de deficiência nem foto
    E essa declaração está imediatamente abaixo do bloco de resposta

  Cenário: Não existe busca por nome nem sugestão
    Quando alguém abre /verificar/APPD-2026-00042
    Então há um único campo de consulta, rotulado "Digite o número do crachá"
    E não há campo de nome, lista de resultados nem sugestão enquanto digita
    E nenhuma rota do site aceita consulta pública por nome

  Cenário: Rajada de consultas é limitada
    Dado um mesmo endereço IP
    Quando ele faz 21 consultas de verificação dentro de um minuto
    Então a 21ª resposta é HTTP 429
    E a mensagem é neutra e igual para qualquer número consultado

  Cenário: Verificação funciona sem JavaScript
    Dado um navegador com JavaScript desativado
    Quando ele abre /verificar/APPD-2026-00042
    Então o nome, o número e a situação são legíveis no HTML entregue pelo servidor
```

```gherkin
Funcionalidade: Capacidade e limites do D1
  Cobre REQ-36 a REQ-38 da SPEC-cracha-do-associado

  Cenário: Linha do associado cabe com folga no teto de 2 MB
    Dado um associado fictício com foto de 102400 bytes
    Quando o tamanho total da linha é medido
    Então ele é menor que 5% do teto de 2000000 bytes por linha do D1

  Cenário: Estimativa de capacidade documentada
    Dado o custo de 106496 bytes por associado (foto de 102400 mais 4 KB de dados)
    Quando a capacidade é calculada
    Então o teto de 500 MB comporta cerca de 4900 associados
    E o gatilho de revisão de 350 MB do ADR-001 é atingido por volta de 3400 associados
    E esses dois números constam do ADR de armazenamento de foto
```

```gherkin
Funcionalidade: Acessibilidade das telas do crachá e da verificação
  Cobre REQ-39 a REQ-42 da SPEC-cracha-do-associado

  Cenário: Sem violação de acessibilidade automatizável
    Dado /area/cracha em cada um dos seis estados e /verificar/<numero> em cada um dos três
    Quando axe é executado em cada tela, em 1280 px e em 360 px
    Então não há violação de nível A nem AA
    # Régua única do projeto, na configuração do axe no CI, nunca repetida por change.
    E cada tela tem exatamente um h1 e nenhuma quebra de nível de heading

  Cenário: Percurso completo por teclado
    Dado /area/cracha aberta sem foto
    Quando a navegação é feita só com Tab, Shift+Tab, setas, Enter e Espaço
    Então é possível enviar a foto, recortar, confirmar e acionar as duas exportações
    E o anel de foco de 3 px com 2 px de folga é visível em todos os elementos focáveis

  Cenário: Resultado anunciado por região viva
    Dado um leitor de tela ativo
    Quando a foto é aceita, e depois quando uma consulta de verificação retorna
    Então o resultado é anunciado por região aria-live="polite"

  Cenário: Estado nunca depende só de cor
    Quando a situação do crachá e o resultado da verificação são renderizados
    Então cada um traz ícone e texto além da cor
    E a leitura em escala de cinza preserva a distinção entre ativo e inativo
```

## Rastreabilidade

| Bloco de requisitos | REQ        | Funcionalidade Gherkin                     |
| ------------------- | ---------- | ------------------------------------------ |
| Número de registro  | REQ-1..7   | Número de registro                         |
| Foto no navegador   | REQ-8..15  | Envio, recorte e compressão da foto        |
| Acesso à foto       | REQ-16..18 | Acesso à foto do crachá                    |
| Crachá e opt-in     | REQ-19..27 | Crachá, exportação e opt-in                |
| Verificação pública | REQ-28..35 | Verificação pública do crachá              |
| Capacidade          | REQ-36..38 | Capacidade e limites do D1                 |
| Acessibilidade      | REQ-39..42 | Acessibilidade das telas                   |
| Privacidade do repo | REQ-43     | coberto por gitleaks no pre-commit e no CI |

## Definition of Ready — auditoria desta spec

Seção que faltava na v1 e reprovou no gate (bloqueio B19): esta change delegava a
autoauditoria à task T0.3, "rodar o gate". Isso inverte a ordem — o gate **confere** o que
a spec declara sobre si mesma, não escreve no lugar dela.

| Item                          | Situação                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| Spec sem ambiguidade pendente | **Não** — dois bloqueios abertos, abaixo                     |
| Priorizada                    | Do coordenador; não é decisão desta spec                     |
| Critério de aceite testável   | **Sim**, com uma exceção declarada: REQ-38, coberto por task |

**Bloqueios, cada um com dono:**

- `[dependência]` **`modelo-de-dados` e `cadastro-e-login` precisam fechar antes.** Esta
  change não cria coluna e não emite número — consome os dois. Dono: **Arthur Barbero**.
- `[escopo] R-7` — nem `/area/cracha` (seis estados) nem `/verificar/<numero>` (quatro
  estados) têm design aprovado no Claude Design. Dono: **Arthur Barbero**. Bloqueia toda
  tarefa de tela, que aqui é quase tudo.
- `[APPD]` Se a associação pode **inativar** um crachá, e quem faz isso, continua
  `[A CONFIRMAR]`. Não bloqueia: na V1 `situacao` só é escrita pela exclusão de conta
  (`modelo-de-dados` REQ-12), e inativação manual é `painel-admin`, V1.1.

**Resolvidos desde a v1:**

- ~~B10, dois algoritmos para o `numero_registro`~~ — a emissão saiu daqui (ADR-013).
- ~~B11, foto com dois limites~~ — esta change é dona única da foto; 10 MB é o que a pessoa
  escolhe, 102.400 bytes é o que chega ao servidor.
- ~~B12, `situacao` sem autor~~ — `modelo-de-dados` REQ-12 nomeou o escritor.
- ~~B20, `/area/cracha` com três donos~~ — é desta change, inteira.
- ~~B21, IP sem regra~~ — REQ-33a aponta para a regra única do projeto.

**Veredito: NÃO-READY para tarefa de tela** (R-7), **READY para as fatias sem tela** assim
que as duas dependências fecharem.
