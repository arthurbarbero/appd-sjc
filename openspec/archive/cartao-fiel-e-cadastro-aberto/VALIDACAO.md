# Validação — cartão fiel e cadastro aberto

Parecer do gate, no padrão das changes arquivadas. O que ficou de fora está dito, e não
escondido.

- Data: 2026-08-21
- `npm test`: **386 testes**, 15 arquivos
- `npm run aceite`: **276/276**, zero falhas
- `npm run lint`, `npm run typecheck`, `npm run build`: limpos
- Decisão estrutural: [ADR-021](../../../docs/adr/adr-021-cracha-replica-o-cartao-de-papel.md),
  que emenda o [ADR-020](../../../docs/adr/adr-020-cid-no-cadastro-e-no-cracha.md)

## O defeito crítico, e por que ele passou

`grid-row: 2 / span 200` na navegação lateral criava duzentas linhas implícitas. Vazias
elas medem zero; o `row-gap` de 24 px entre elas, não. **4.800 px de branco no fim de toda
página da área do associado**, desde a change anterior.

A medição: moldura de 5.760 px, conteúdo terminando em 1.229. Depois da correção,
1.080 px de moldura e folga zero.

O que vale registrar não é a linha de CSS. É que **375 testes verdes não viram**, e não
podiam ver: todos olhavam conteúdo, e a página tinha todo o conteúdo no lugar certo — com
cinco telas de branco depois. O teste que entrou (`5d` do aceite) mede a **folga**, não o
CSS: um teste que procurasse `span 200` no arquivo não pegaria a próxima forma de produzir
vazio.

E o dono estava certo sobre o sintoma e errado sobre a causa — "depois que eu cliquei ali
em PDF" —, o que é o normal de quem relata. O PDF não causava nada; ele só dava motivo para
rolar até lá.

## Requisitos

| Req             | Onde                         | Veredito                                                             |
| --------------- | ---------------------------- | -------------------------------------------------------------------- |
| REQ-1 a REQ-3   | aceite 5d                    | **passa** — folga de 0 px nas cinco telas da área                    |
| REQ-4 a REQ-7   | navegador                    | **passa** — grafismo, faixa, caixas e foto do cartão de papel        |
| REQ-8 a REQ-10  | `cracha-arquivo.spec.ts`     | **passa** — os mesmos rótulos nos dois desenhos, e nenhum com `v-if` |
| REQ-11          | navegador + ADR-021          | **passa** — CPF e endereço impressos, consequência registrada        |
| REQ-12          | `cracha-impresso.spec.ts`    | **passa** — sem opt-in de impressão; o texto do termo diz as duas    |
| REQ-13          | aceite + `vazamento.spec.ts` | **passa** — ver abaixo                                               |
| REQ-14 a REQ-16 | vitest                       | **passa** — emissão derivada, sem validade, número do site           |
| REQ-17 a REQ-19 | `cracha-arquivo.spec.ts`     | **passa** — o arquivo desenha o cartão de agora                      |
| REQ-20          | navegador + vitest           | **passa** — tira colada, corte só nas pontas                         |
| REQ-21 a REQ-24 | aceite 5e                    | **passa** — cadastro sem deficiência conclui e o crachá dele abre    |
| REQ-25 a REQ-28 | navegador                    | **passa** — bloco 3b extinto, campos redistribuídos                  |
| REQ-29, REQ-30  | aceite + vitest              | **passa** — `+55` no campo, E.164 no banco                           |
| REQ-31          | aceite 5c                    | **passa** — três fontes, passo de 8 px, zero larguras quebradas      |
| REQ-32 a REQ-34 | vitest + navegador           | **passa** — os três cortes                                           |
| REQ-35 a REQ-37 | axe                          | **passa** — inclusive a impressão **com CID ligado** (ver abaixo)    |

## A ressalva de ontem que venceu hoje

O parecer de `cracha-impresso` deixou como ressalva 1 uma passada de axe na tela de
impressão **com o CID ligado**. Ela não acontecia porque a conta do percurso não tinha CID
— todas as verificações do crachá rodavam no estado em que o dado não existe, que é o
estado em que um vazamento não pode acontecer.

A conta do percurso passou a informar CID. Com isso:

- o axe da impressão roda com o diagnóstico na tela, nas duas larguras;
- `/verificar` passa a ter algo para **não** encontrar, e `G82` e `cid` entraram na lista de
  proibidos da varredura de JSON;
- o histórico de `/seus-direitos` passa a ter dois aceites, e o gate confere que retirar o
  do Art. 11 **não** retira o do CID.

## Sete defeitos meus, achados pela medição

1. **O consentimento do Art. 11 era falsificado pelo cliente.** `consentimentoSaude: true`
   fixo no corpo da requisição — o mesmo defeito que o CID teve ontem, no campo mais antigo
   do formulário. Enquanto a deficiência era obrigatória ele ficava sem efeito visível; com
   o consentimento condicional, passaria a valer.
2. **A validação do cliente continuou exigindo as três múltiplas escolhas** depois de o
   esquema ter deixado de exigir. O servidor aceitava e a tela recusava: três mensagens de
   erro em campos opcionais.
3. **O QR foi pedido em pixels** num cartão medido em milímetros — 20 mm num cartão de 54, e
   o rodapé da frente vazou para fora. Numa peça de medida fixa, um valor em pixel estraga a
   conta inteira.
4. **A marca d'água do verso saiu mancha**: `background-blend-mode` sobre branco translúcido
   deixou o brasão escuro demais, e a linha de CNPJ ficou ilegível por cima dele.
5. **A foto saiu esticada no arquivo baixado.** `drawImage` com largura e altura de destino
   deforma; a tela nunca teve o defeito porque o CSS recorta. Mais um lugar em que tela e
   arquivo divergiam sem erro.
6. **O ponto de quebra do cabeçalho foi medido deslogado.** "Minha área" é mais largo que
   "Entrar" — a navegação passa de 707 para 748 px —, e a primeira correção ainda deixava
   faixa quebrada. Medir o estado mais fácil é como um ponto de quebra nasce errado.
7. **O teste de fonte grande simulava o que não existe.** Mexer em
   `document.documentElement.style.fontSize` faz o layout crescer sem mover nenhuma media
   query: em media query, `em` mede a fonte **do navegador**, não a do documento. O teste
   reprovava o produto por um defeito dele mesmo. Corrigido com `Page.setFontSizes` do CDP.

E um oitavo, que não era meu de hoje mas passou dois dias no ar: **o PNG e o PDF
desenhavam o cartão de duas versões atrás**. Ninguém percebeu porque o arquivo abre sem
erro — ele estava certo, só era de outro cartão. O dono baixou três.

## A migration, e o que ela ensinou no deploy

`0006` recria `inscricoes_atendimento` e `usuarios` — em SQLite um `CHECK` não se altera, a
tabela é refeita. Duas coisas foram escritas à mão sobre o que o drizzle-kit gerou:

1. **Nenhum `PRAGMA`: a migration simplesmente não viola.** As filhas vão para cópias sem
   restrição (`CREATE TABLE tmp_x AS SELECT * FROM x`), são esvaziadas, as tabelas são
   recriadas e os dados voltam.

   Cheguei aqui por eliminação, e as duas tentativas anteriores valem registro:

   - **`defer_foreign_keys`** — a receita recomendada quando a migration roda dentro de
     transação, e o D1 roda. O deploy respondeu `D1 DB was reset and rolled back (…)
FOREIGN KEY constraint failed`.
   - **`foreign_keys=OFF`** — o que o drizzle-kit escreve, e o que a migration `0002` usou
     para recriar `usuarios` inteiro com sucesso. Falhou igual.

   A `0002` tinha passado porque o banco estava **vazio**: recriar `usuarios` só viola
   chave estrangeira quando há linhas filhas apontando para ela. Foi essa a lição, e ela é
   maior que o PRAGMA — **o D1 local com banco vazio não prova nada sobre o D1 remoto com
   dados**. Três deploys reprovados até isso ficar claro.

   O teste que entrou aplica a última migration sobre um banco **com** usuário, inscrição,
   foto e consentimento, e com `foreign_keys = ON`. É o cenário do remoto, e agora ele roda
   no `npm test`.

2. **A cópia do telefone passa por um `CASE`** que prefixa `+55` no que não tem prefixo. O
   CHECK novo exige código de país, e um `SELECT "telefone"` cru faria a migration abortar.
   Não é migração de dados — o dono dispensou —, é o mínimo para a recriação não cair.

**E dois defeitos meus, os dois só visíveis no deploy.** O D1 local e o D1 remoto não são o
mesmo motor para migrations, e esta foi a lição do dia:

1. **Comentário de bloco.** O arquivo tinha `/* ... */` explicando as decisões acima, e o
   remoto responde `SQL code did not contain a statement`. O local aceita.
2. **PRAGMA de chave estrangeira, nas duas formas.** Descrito acima: o local aceita porque
   está vazio; o remoto tem dados e recusa.

Nos dois casos a migration passou no `db:migrate`, nos testes e nas 276 verificações de
aceite para reprovar no deploy, com a branch já na main. **Os dois viraram teste**: um sobre
o arquivo (comentário de bloco, ao lado dos dois que já moravam ali — placeholder de bind e
GLOB com mais de dez classes), outro sobre o comportamento, aplicando a migration em cima de
dados com FK ligada.

## Ressalvas escritas, em vez de escondidas

1. **A página de contato deixou de avisar que o formulário não envia.** Decisão do dono, e
   o custo é real: o destinatário continua não existindo (`docs/pendencias-appd.md`, item
   4), e agora quem procura ajuda escreve a mensagem inteira antes de descobrir. O que
   sobrou de verdadeiro é a confirmação depois do clique e os telefones acima dela.
2. **O CID perdeu o meio-termo.** Quem quiser o diagnóstico guardado sem imprimi-lo não tem
   mais esse caminho, e quem se arrepender precisa retirar a autorização inteira — o que
   apaga o CID. Compensação possível e feita: o texto da caixa diz, antes de ela ser
   marcada, que autorizar é autorizar imprimir.
3. **Um crachá perdido passa a entregar CPF, endereço e diagnóstico juntos.** É o que o
   cartão de papel já faz, e é dele que este é cópia. Registrado no ADR-021 com o motivo:
   reconhecimento, não segurança.
4. **O hambúrguer aparece mais cedo no computador** — 992 px em fonte padrão, contra 860
   antes. É o preço de o cabeçalho não quebrar em nenhuma largura, e a alternativa seria
   encurtar a navegação, que é decisão de conteúdo.
5. **Nenhuma medição usou impressora de verdade.** A tira cabe na folha por aritmética e na
   tela por medida em milímetros. Segue sendo a ressalva 4 do parecer de ontem, e continua
   dependendo de alguém imprimir.
6. **O CID não é validado contra a tabela oficial**, por decisão de escopo. Um erro de
   digitação sai impresso.

## Por que a change pode ir para `archive/`

As ressalvas 1 a 4 são decisões do dono com o custo escrito, não pendências. A 5 depende de
papel e a 6 é escopo declarado. O gate do produto passou: 386 testes, 276 verificações de
aceite, axe limpo nas quatro telas — inclusive a de impressão com o CID na tela.
