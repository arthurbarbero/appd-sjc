# Proposal: painel administrativo

- ID: PROP-20260807-painel-administrativo
- Origem: decisões do dono em 2026-08-07, ao longo da sessão
- Dono do conteúdo: Arthur Barbero · Execução: Claude Code
- Status: **rascunho** — vira spec depois da revisão do dono

## Por que existe

Duas coisas que hoje não têm dono:

**Ninguém consegue refazer a senha de ninguém.** Quem esquece perde a conta. O
[ADR-016](../../../docs/adr/adr-016-recuperacao-de-senha.md) resolve em dois estágios, e o
primeiro é este painel — é ele que faz o caminho humano deixar de ser promessa vazia: a
secretaria atende o telefone **porque tem a ferramenta**.

**A associação não enxerga os próprios dados.** Hoje ela baixa planilha. Quantas pessoas
procuram fisioterapia, quantas por tipo de deficiência, quantas em cada projeto — nada
disso é consultável.

Isto **supersede** a parte do [ADR-014](../../../docs/adr/adr-014-inscricao-como-registro-de-interesse.md)
que empurrava o painel para a V1.1.

## Escopo

### Perfis e acesso

- **Uma base só de usuários, com coluna de perfil.** Duas bases significam dois caminhos de
  login, duas derivações de senha e dois lugares para errar segurança — e quebram no caso
  que vai acontecer: alguém da secretaria que também é associado teria duas contas com o
  mesmo e-mail. As colunas pessoais de `usuarios` já são anuláveis (a exclusão anonimiza),
  então administrador com e-mail e senha e o resto vazio cabe sem gambiarra.
- **`root` é um usuário administrador**, não um segredo de infraestrutura — decisão do dono
  em 2026-08-07, corrigindo a minha proposta anterior de semear por Cloudflare Secret. O
  que o distingue é poder criar o **primeiro** administrador.
- **Tela simples de criar administrador**: e-mail e senha, e só. Administrador não preenche
  os 15 campos do formulário de atendimento — ele não é pessoa atendida.
- Root e administrador podem criar outros administradores.

### Gerência de contas

- Listar e buscar associados.
- Ver a ficha de um associado.
- **Disparar troca de senha** — nunca escolher a senha da pessoa, nunca ver hash.
- Ativar e inativar cadastro.

### Relatórios

- **Exportação em CSV sobre todos os dados**, com filtros. Inclui o campo 12 — decisão do
  dono em 2026-08-07: existe consentimento registrado, e a associação precisa dos próprios
  números. CSV, e não `.xlsx`: abre no Excel igual, sem dependência nova e sem estourar o
  orçamento de CPU do Worker.
- **Exportação em PDF**, mais apresentável, com **menos filtros** que o CSV: uma listagem
  bonita de associados e suas escolhas já serve.
- Filtros relevantes: tipo de deficiência, atendimento procurado, projeto, dias, bairro,
  situação, período de cadastro.

### Trilha de auditoria

Toda ação administrativa sobre a conta de outra pessoa grava **quem fez, o quê e quando** —
inclusive exportação de relatório. Sem isso, "a secretaria refez a senha" é afirmação sem
prova, e num sistema com dado de saúde isso não se sustenta.

## Fora de escopo

- Edição do cadastro de terceiro pelo administrador. Ele **dispara** troca de senha e muda
  situação; corrigir dado é da própria pessoa (ADR-014).
- Painel com gráfico, cruzamento livre ou ferramenta de exploração. Ver a seção abaixo.
- Envio de e-mail. É o segundo estágio do ADR-016 e depende da chave do SendGrid.

## O que a análise dos dados achou, e contraria a suspeita inicial

O dono levantou que o jeito como as escolhas estão guardadas dificultaria o relatório —
`deficiencias`, `atendimentos` e `dias` são **arrays JSON em coluna de texto**
([ADR-008](../../../docs/adr/adr-008-multipla-escolha-como-json-em-texto.md)).

**Medido em 2026-08-07, no D1 local: não dificulta.** O SQLite tem `json_each`, e a
agregação sai numa consulta:

```sql
SELECT j.value AS deficiencia, COUNT(*) AS n
FROM inscricoes_atendimento, json_each(deficiencias) AS j
GROUP BY j.value
```

Rodou e devolveu a contagem por tipo. **Nenhuma mudança de schema é necessária** para os
filtros que a associação precisa.

A limitação real é outra, e é menor: não há índice sobre o conteúdo do JSON, então cada
consulta varre a tabela. Para uma associação com centenas — ou alguns milhares — de
registros, isso é irrelevante. Se um dia deixar de ser, o caminho é tabela de ligação, e
não trocar o formato.

### A fraqueza que existe de verdade

Os campos **`deficiencia_outro` e `atendimento_outro` são texto livre**. Texto livre não
agrupa: "cadeirante", "usa cadeira de rodas" e "cadeira de rodas" viram três linhas
distintas num relatório. É a única coisa que compromete o número.

O remédio **não é mudar o schema**: é curadoria periódica — o administrador vê o que mais
apareceu em "Outro" e o dono decide promover à lista fechada. A change deve entregar a
**tela que mostra os "Outro" agrupados por frequência**, que é o insumo dessa decisão.

### O que o modelo responde hoje, sem mudar nada

Pessoas por tipo de deficiência · por atendimento procurado · por projeto · por dia da
semana · por bairro e município · por situação · por período de cadastro · com e sem foto ·
com e sem inscrição · faixa etária, derivada de `nascimento`.

O que ele **não** responde, e é bom saber antes: nada sobre atendimento **prestado** —
quantas sessões, com quem, quando. O site guarda **registro de interesse**, não prontuário
(ADR-014, ADR-017). Relatório de atendimento realizado exigiria um produto diferente, e
está fora daqui.

## Impacto

- **Toca dado sensível?** Sim, e mais que qualquer change anterior: exportação em massa do
  campo 12. Exige trilha de auditoria e revisão do dono antes de virar task.
- **Toca produção / custo real?** Não. Mesmo Worker e D1.
- **Schema**: coluna de perfil em `usuarios` e tabela de auditoria. Como `modelo-de-dados`
  está arquivada, vale a regra do adendo dela — coluna nova cabe; tabela nova é mudança de
  contrato e reabre a change.

## Próximo passo no fluxo

proposal (este) → **revisão do dono** → spec com critérios Gherkin → tasks → design das
telas no Claude Design → implementação.

**Nada começa antes da spec.** A regra do `CLAUDE.md` vale inteira aqui, inclusive a de
nenhuma tela antes do design aprovado.
