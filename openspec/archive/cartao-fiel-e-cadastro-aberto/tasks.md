# Tasks: cartão fiel e cadastro aberto

- Spec: [`spec.md`](spec.md) · Proposal: [`proposal.md`](proposal.md)

Cada task fecha com os cenários que ela cobre passando, e com `npm run lint`,
`npm run typecheck` e `npm run build` limpos. O `npm run aceite` roda **uma vez, no fim** —
ele demora, e rodá-lo a cada task foi o que atrasou o dia de ontem.

**A ordem tem motivo.** O defeito crítico vem primeiro porque é o único que já está no ar
afetando todo mundo. O formulário vem antes do cartão porque o cartão desenha o que o
formulário coleta: fazer o desenho primeiro seria desenhar campos cujo formato ainda vai
mudar.

## Fase A — o vazio branco

### T1 — Tirar as 4.800 px de nada

Cobre REQ-1, REQ-2.

`grid-row: 2 / span 200` some. A coluna da esquerda continua ao lado do conteúdo, e o
espaçamento entre os blocos da direita passa a vir de margem, não de `row-gap` — porque é o
gap das linhas implícitas que produz o vazio.

### T2 — Teste que mede, e não que lê

Cobre REQ-3.

Playwright abre cada página da área e compara o fim do último filho com o fim da moldura.
Reprova acima de uma linha de folga. Precisa medir, porque a próxima forma de criar vazio
não vai se chamar `span 200`.

## Fase B — o formulário

### T3 — Deficiência, atendimento e dias opcionais

Cobre REQ-21, REQ-23, REQ-24.

Zod deixa de exigir os três. O consentimento do Art. 11 passa a ser condicional, e o texto
que hoje diz "marque pelo menos uma opção" sai dos três blocos.

### T4 — Consentimento do Art. 11 só quando há deficiência

Cobre REQ-22.

Refine no esquema e caixa condicional na tela. Sem deficiência marcada, o bloco de
consentimento não aparece e o cadastro conclui. Com deficiência marcada e consentimento em
branco, o cadastro é recusado — como hoje.

### T5 — Telefone em formato internacional

Cobre REQ-29, REQ-30.

`+55` como valor inicial dos três campos de telefone, apagável. Validação aceita o formato
internacional. Nenhuma migração.

### T6 — Reorganizar os blocos

Cobre REQ-25 a REQ-28.

O bloco 3b desaparece. CID sobe para o bloco 1 com o consentimento próprio abaixo dele.
CRAS e credencial abrem o bloco de atendimento. Contato de emergência desce para debaixo do
contato do cuidador, com o texto de que pode ficar em branco.

### T7 — Numeração e documentação dos campos

Cobre REQ-25 a REQ-28 (consequência).

`docs/campos-formulario.md` acompanha a ordem nova. Documento que descreve outra ordem é
pior que documento nenhum: ele é consultado.

## Fase C — o cartão

### T8 — O grafismo, embutido

Cobre REQ-18.

O brasão e o fundo entram como recurso embutido no pacote, não buscado em tempo de
execução, para a exportação continuar com zero requisições de rede.

### T9 — A frente

Cobre REQ-4, REQ-6, REQ-8, REQ-10, REQ-11.

Faixa azul, grafismo, foto com moldura, caixas de rótulo e valor. Todos os campos, sempre —
inclusive vazios. CPF e endereço impressos.

### T10 — O verso

Cobre REQ-5, REQ-9, REQ-10.

Marca d'água, emissão, pessoa de contato e número de contato com esses rótulos, endereço,
telefones, site e linha institucional.

### T11 — O CID sem opt-in de impressão

Cobre REQ-12, REQ-13.

A caixa de "mostrar o CID no crachá" sai da área do associado. O termo do CID passa a dizer
que autorizar é autorizar imprimir. A rota do crachá devolve o CID quando existe. `/verificar`
continua sem CID, e o teste transversal continua guardando isso — é a trava que fica.

### T12 — O arquivo baixado desenha o cartão de agora

Cobre REQ-17, REQ-19.

`cracha-arquivo.ts` reescrito no formato deitado, com os campos do REQ-8 e REQ-9. Teste que
compara os campos que a tela mostra com os que o arquivo desenha.

### T13 — A folha sem vão

Cobre REQ-20.

Frente e verso encostados. Marcas de corte só nas bordas externas; a linha do meio é dobra.

## Fase D — acabamento

### T14 — O cabeçalho que não quebra

Cobre REQ-31.

Medir em que largura o menu deixa de caber e mover os pontos de quebra para lá. A medição é
a tarefa: os pontos de hoje foram escolhidos por estimativa, e é por isso que há duas faixas
quebradas.

### T15 — Os três cortes de texto e de posição

Cobre REQ-32, REQ-33, REQ-34.

"Mudar a minha foto" desce. A frase do crachá sai. O "ainda não envia" sai do contato.

### T16 — ADR-021 e emenda ao ADR-020

Cobre REQ-7, REQ-11, REQ-12.

O ADR-021 registra a réplica do cartão e o que ela custa. O ADR-020 recebe a emenda que
revoga o REQ-13 e diz quem decidiu.

## Fase E — o gate

### T17 — axe, teclado e o percurso inteiro

Cobre REQ-35 a REQ-37.

`npm test`, `npm run aceite`, axe nas quatro telas. E a passada de axe na tela de impressão
**com o CID ligado**, que ficou como ressalva 1 de `cracha-impresso` e vence aqui.
