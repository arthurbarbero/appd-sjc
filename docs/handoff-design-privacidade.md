# Handoff das telas de privacidade e direitos — 2026-08-11

Telas geradas pelo dono no Claude Design, projeto `appd-sjc`, e lidas por DesignSync:
`templates/privacidade/Privacidade.dc.html` e `templates/direitos/Direitos.dc.html`.

**Aprovadas.** Fecham a **T3** de `consentimento-e-privacidade`, que travava T7 a T10 e a
T13. O que segue são as correções que a implementação aplica — todas por regra escrita ou
por decisão registrada, nenhuma por gosto.

Foram geradas a partir da **v2** do prompt ([prompts-design/privacidade.md](prompts-design/privacidade.md)),
reescrita horas antes justamente porque a v1 mandava desenhar cinco coisas que tinham
deixado de ser verdade. Deu certo: nenhum dos cinco defeitos que a v1 teria produzido está
nas telas.

## O que veio certo, e vale dizer

- **A seção de guarda não tem `[A CONFIRMAR]`.** Ela diz o que o ADR-017 decidiu — os dados
  saem na hora, o site não guarda prontuário, e ficam só o número de registro sem vínculo e
  o registro do consentimento. Era o ponto onde a v1 teria publicado uma pendência falsa.
- **A frase da foto é a estreita e correta**: aparece na verificação, e o que ela não tem é
  endereço próprio. Nada de "a foto nunca é pública", que seria mentira desde o ADR-015.
- **O dado sensível tem as duas situações do opt-in lado a lado**, e a tela diz que marcar
  vale para o crachá **e** para a página pública (ADR-019).
- **`[A CONFIRMAR]` aparece exatamente duas vezes**, nas duas pendências que são da
  associação: encarregado (PB-2) e prazo de resposta (PB-4). Em selo com borda tracejada,
  no corpo do texto, com contraste de texto normal.
- **A retirada do consentimento acontece na própria página**, em dois cliques, com região
  `aria-live` envolvendo os três estados — pedido, confirmação e feito. Sem tela
  intermediária, como o REQ-13 exige.
- **O histórico de consentimento está desenhado como tabela** com evento, versão, data e
  hora e impressão digital do texto. É o que a T9 precisa exibir, e o desenho já resolve o
  problema de mostrar um hash de 64 caracteres numa tela de celular: monoespaçado e
  encurtado.
- **A exclusão é caminho, não formulário**: botão contornado que leva para a tela que já
  existe. O fluxo de três telas da v1 não voltou.

## Correção 1 — fontes por CDN do Google

As duas telas trazem `<link>` para `fonts.googleapis.com`. **Não vai para o código.**

Carregar fonte do Google entrega o IP de cada visitante a um terceiro, sem base legal e sem
o visitante saber — e nesta página, que é justamente a que promete o contrário, seria a
contradição mais cara possível. É a quarta vez que aparece: o canvas volta a gerar CDN
porque não sabe da decisão. Não é erro do dono. A fonte é servida do próprio domínio.

## Correção 2 — a rota é `/seus-direitos`, não `/direitos`

O canvas nomeou a pasta `templates/direitos/`. A rota do produto é **`/seus-direitos`**, que
é o que a spec usa em REQ-13, REQ-14 e nos cenários de aceite. Os links entre as duas
páginas e o do rodapé usam a rota do produto.

## Correção 3 — dado fictício com domínio que existe

O bloco de dados guardados usa `maria.aparecida@exemplo.com.br` e o número
`APPD-2026-00042`. Nenhum dos dois entra no código, porque ali o conteúdo vem do banco da
pessoa autenticada — mas os dois merecem registro, porque é assim que dado inventado
vira dado publicado:

- `exemplo.com.br` **é um domínio que pode existir**. O projeto usa `.invalid`, `.test` e
  `exemplo.invalido`, e há teste que reprova o contrário no seed.
- `APPD-2026-00042` sugere numeração sequencial. O número real é **sorteado** (ADR-007),
  exatamente para não vazar quantas pessoas se cadastraram. Mock com formato sequencial é
  o tipo de detalhe que alguém copia sem perceber.

## Correção 4 — dois cartões, uma âncora só

Os dois vão para `#meus-dados`. Não é defeito de layout: é o mesmo bloco respondendo às
duas perguntas, e o Art. 19 trata confirmação e acesso juntos. A implementação mantém os
dois cartões — os verbos são diferentes e a pessoa procura por um ou por outro — apontando
para o mesmo destino.

## O que o desenho decide e o banco hoje proíbe

**Esta é a única coisa que o handoff não resolve sozinho, e ela precisa de decisão.**

A tela de retirada afirma, na confirmação e no estado final, que o tipo de deficiência
**sai do cadastro**: "Não informado — consentimento retirado". Está certo, e é a leitura
correta do Art. 8º, §5º — revogar consentimento de dado sensível sem parar de tratar o dado
é revogação de fachada. A própria spec já apontava para isso quando explicou por que o
aceite não podia morar em duas tabelas: a revogação precisa **alcançar a inscrição, que é
onde o dado sensível está**.

O banco não deixa. A tabela `inscricoes_atendimento` tem esta restrição, do contrato de
dados de `modelo-de-dados`, que está arquivada:

```sql
CHECK (json_valid(deficiencias) AND json_type(deficiencias) = 'array'
       AND json_array_length(deficiencias) >= 1)
```

Array vazio é recusado na escrita. As saídas possíveis, com o custo de cada uma:

1. **Migration que relaxa a restrição para `>= 0`.** Uma linha de SQL, e o significado do
   campo passa a ser "as deficiências informadas, que podem ser nenhuma". Custo: mexe num
   contrato arquivado, e o `>= 1` existia para impedir cadastro sem resposta no campo 12 —
   proteção que passa a depender só do Zod, na entrada.
2. **Apagar a linha inteira de `inscricoes_atendimento`.** Custo alto e errado: leva junto
   atendimentos procurados e dias disponíveis, que não são dado sensível e que a pessoa não
   pediu para apagar.
3. **Manter o dado e só registrar a revogação.** Custo: a tela mente. Descartada.

**Recomendação: a 1.** É a única que faz a tela dizer a verdade sem apagar o que ninguém
mandou apagar. Vira ADR e migration versionada, e a validação de entrada continua exigindo
pelo menos uma escolha no cadastro — o que muda é só o que o sistema aceita **depois** de
uma revogação.

## Ordem de implementação

| Task | Tela ou peça                          | Depende de                       |
| ---- | ------------------------------------- | -------------------------------- |
| T8   | `/privacidade`                        | nada — só conteúdo               |
| T7   | componente da caixa de consentimento  | o texto do catálogo em tela      |
| T9   | `/seus-direitos` e a cópia dos dados  | T8 (link entre as duas)          |
| T10  | revogação                             | **a decisão acima**              |
| T11  | texto do bloco de exclusão            | nada (a PB-1 caiu com o ADR-017) |
| T13  | auditoria de acessibilidade das telas | T8, T9, T10                      |
