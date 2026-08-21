# Spec: cartão fiel e cadastro aberto

- ID: SPEC-20260821b-cartao-fiel-e-cadastro-aberto
- Proposal: [`proposal.md`](proposal.md), com as três decisões do dono em 2026-08-21
- Emenda estrutural: [ADR-020](../../../docs/adr/adr-020-cid-no-cadastro-e-no-cracha.md),
  cujo REQ-13 (opt-in próprio de impressão) é **revogado** por decisão do dono
- Decisão nova: [ADR-021](../../../docs/adr/adr-021-cracha-replica-o-cartao-de-papel.md)

## Objetivo

Fazer o crachá do site ser o cartão da APPD, e não uma releitura dele. Abrir o cadastro a
quem não tem deficiência. E tirar da área do associado cinco telas de branco que estavam
lá desde ontem.

## O defeito crítico (REQ-1 a REQ-3)

- **REQ-1** — Nenhuma página da área do associado tem espaço vazio depois do último
  elemento de conteúdo. Medida objetiva: a distância entre o fim do último filho de
  `.area-moldura` e o fim da própria moldura é **menor que uma linha de grade**.
- **REQ-2** — A coluna da navegação continua ao lado do conteúdo, e não acima dele, nas
  larguras em que hoje já fica ao lado. A correção do vazio não pode custar o layout.
- **REQ-3** — Existe teste que reprova a volta do defeito **medindo a página**, e não
  lendo o CSS. Um teste que procure `span 200` no arquivo não pegaria a próxima forma de
  produzir vazio; um que meça a folga, sim.

## O cartão (REQ-4 a REQ-16)

### Fidelidade (REQ-4 a REQ-7)

- **REQ-4** — A **frente** reproduz o cartão de papel: faixa superior azul-marinho com
  "APPD" em caixa alta e grande, e abaixo o nome por extenso em duas linhas; fundo com o
  grafismo da associação (listras, verde e o brasão em marca d'água); foto retrato à
  esquerda com moldura; à direita, caixas claras arredondadas, cada uma com rótulo pequeno
  em cima e valor em negrito embaixo.
- **REQ-5** — O **verso** reproduz o de papel: brasão em marca d'água ao centro, blocos de
  emissão e de contato no topo, o endereço e os telefones da associação ao centro, e a
  linha de CNPJ, utilidade pública e inscrição municipal no rodapé.
- **REQ-6** — A tipografia continua sendo a do projeto (Atkinson Hyperlegible) e o
  contraste continua sob a regra de acessibilidade. Fidelidade visual **não** autoriza
  texto ilegível: onde o cartão de papel usa cinza claro sobre branco, o nosso usa o tom
  que passa no AA.
- **REQ-7** — Isto é uma **exceção declarada** ao design system v2, registrada no ADR-021,
  e vale só para o crachá. Nenhuma tela do site herda esta estética.

### Campos (REQ-8 a REQ-13)

- **REQ-8** — A frente traz, nesta ordem: **Nome**, **Nascimento**, **Número APPD**,
  **CRAS**, **Credencial Transporte**, **CPF**, o **QR Code** e o bloco de **CID**.
- **REQ-9** — O verso traz: **Emissão**, **Pessoa de contato** e **Número de contato**, o
  endereço da associação, os telefones, o site e a linha institucional.
- **REQ-10** — **Todo campo previsto aparece sempre**, preenchido ou não. Sem valor, o
  rótulo fica e o espaço fica em branco — nunca some. É a decisão do dono, e a razão dela
  é de uso: um cartão cujo desenho muda conforme o cadastro não é reconhecível como
  documento.
- **REQ-11** — **CPF e endereço são impressos sem opt-in.** Decisão do dono, registrada no
  ADR-021 com a consequência escrita.
- **REQ-12** — **O CID é impresso sempre que houver CID guardado.** O opt-in próprio de
  impressão (REQ-13 de `cracha-impresso`) **deixa de existir**: consentir em ceder o CID
  passa a ser consentir em imprimi-lo, e o texto do termo diz isso com todas as letras.
- **REQ-13** — **O CID continua fora de `/verificar`, sem exceção nenhuma.** Esta é a trava
  do ADR-020 que não muda, e é ela que o teste transversal guarda.

### Emissão, validade e número (REQ-14 a REQ-16)

- **REQ-14** — A **emissão** continua derivada da data do cadastro.
- **REQ-15** — **Não há validade** e não há a frase sobre contribuição em dia, embora as
  duas estejam no cartão de papel. Decisão do dono de 2026-08-21, mantida.
- **REQ-16** — O número impresso continua sendo `APPD-2026-XXXXXX`. O sequencial
  `00001/CD` do papel não volta: ele revela o tamanho do cadastro por contagem.

## O arquivo baixado (REQ-17 a REQ-20)

- **REQ-17** — O PNG e o PDF desenham **o mesmo cartão que a tela mostra**: deitado,
  85,6 x 54 mm, com todos os campos do REQ-8 e REQ-9. Hoje eles desenham o cartão em pé de
  duas versões atrás, e ninguém percebeu porque o arquivo abre sem erro.
- **REQ-18** — A exportação continua **sem nenhuma requisição de rede** (REQ-4 de
  `cracha-impresso`). O grafismo da associação entra embutido no pacote, não buscado.
- **REQ-19** — Existe teste que reprova o dia em que a tela e o arquivo divergirem de novo.
- **REQ-20** — Na folha A4, frente e verso ficam **encostados**, sem vão entre eles: a
  pessoa corta a tira inteira e dobra ao meio. As marcas de corte ficam nas bordas
  externas, e a linha do meio é dobra, não corte.

## O formulário (REQ-21 a REQ-30)

### Obrigatoriedade (REQ-21 a REQ-24)

- **REQ-21** — **Deficiência**, **tipo de atendimento** e **melhores dias** passam a ser
  **opcionais**. O cadastro conclui sem nenhum dos três.
- **REQ-22** — O **consentimento do Art. 11** só é exigido quando há deficiência marcada.
  Sem deficiência não há dado de saúde a consentir, e pedir a assinatura mesmo assim é
  colher consentimento vazio.
- **REQ-23** — Nome, nascimento, telefone, endereço, e-mail, CPF, senha e ciência da
  contribuição **continuam obrigatórios**. Decisão do dono.
- **REQ-24** — Nenhuma tela quebra por falta desses dados: crachá, verificação, área do
  associado e o e-mail de confirmação funcionam com os três campos vazios.

### Organização (REQ-25 a REQ-28)

- **REQ-25** — O bloco **"3b. Para o seu crachá, se você quiser" deixa de existir**.
- **REQ-26** — O **CID** passa para o bloco 1, "Quem vai ser atendido", como campo
  opcional, com o consentimento próprio logo abaixo dele.
- **REQ-27** — **CRAS** e **Credencial de Transporte** passam para o início do bloco de
  atendimento.
- **REQ-28** — **Contato de emergência** passa para logo abaixo do contato do cuidador, com
  o texto dizendo que pode ficar em branco quando for a mesma pessoa.

### Telefone (REQ-29, REQ-30)

- **REQ-29** — Todo campo de telefone começa com **`+55`** já escrito, e a pessoa pode
  apagar — quem mora fora do Brasil precisa poder.
- **REQ-30** — O telefone é guardado em **formato internacional**. Sem migração dos
  cadastros existentes, por decisão do dono.

## Acabamento (REQ-31 a REQ-34)

- **REQ-31** — O **cabeçalho não quebra em duas linhas em nenhuma largura**. Onde o menu
  inteiro não couber ao lado da marca, ou a marca encolhe, ou o menu vira o painel — nunca
  uma segunda linha.
- **REQ-32** — O botão **"Mudar a minha foto" fica abaixo** dos dois lados do cartão, junto
  das ações de baixar.
- **REQ-33** — A frase "Seu crachá fica pronto assim que você envia a foto. Você mesmo
  baixa e imprime." **sai** de `/area/cracha`.
- **REQ-34** — O aviso "Este formulário ainda não envia" **sai** da página de contato.

## Acessibilidade (bloqueante)

- **REQ-35** — axe A/AA sem violação em `/area/cracha`, `/area/cracha-impressao`,
  `/atendimento/inscricao` e `/contato` depois de todas as mudanças.
- **REQ-36** — O formulário continua operável só por teclado, e os campos que trocaram de
  bloco continuam com rótulo, `aria-describedby` e mensagem de erro próprios.
- **REQ-37** — O cartão continua legível em preto e branco: cor nunca é o único portador de
  informação, nem no grafismo novo.

## Contrato de dados

Nenhuma coluna nova. Três mudam de formato:

| Coluna                                             | Antes         | Depois           |
| -------------------------------------------------- | ------------- | ---------------- |
| `telefone`, `cuidadorContato`, `contatoEmergencia` | `12991657059` | `+5512991657059` |

`cidNoCracha` deixa de ser lida pela aplicação. A coluna **permanece no banco** e sai da
superfície: derrubá-la agora exigiria migração destrutiva por uma decisão que tem um dia
de idade.

## Fora de escopo

- Validade, vigência e qualquer relação com pagamento.
- Logos e dados de recebimento (PIX, Caixa, Sicoob) no verso.
- Migração dos telefones já gravados.
- Cadastro separado de voluntário/doador: o dono escolheu abrir o formulário existente.
