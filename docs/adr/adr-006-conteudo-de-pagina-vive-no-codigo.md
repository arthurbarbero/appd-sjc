# ADR-006: conteúdo de página vive no código, não no banco

Status: Aceito
Data: 2026-08-07
Decisores: Arthur Barbero (dono do projeto)

## Contexto

A change `consentimento-e-privacidade` precisa de versões do termo do Art. 11 da LGPD, e
a spec exige (REQ-2) que **versão publicada seja imutável**: editar o texto de uma versão
vigente tem de fazer a verificação de integridade falhar, com teste automatizado
bloqueando. Correção de texto se faz publicando versão nova.

A task T1 daquela change deixou a pergunta em aberto entre duas saídas: catálogo
versionado no repositório, com hash conferido em teste, ou linhas numa tabela do D1.

A pergunta é maior que o termo. O projeto já tem conteúdo institucional em
`shared/conteudo.ts` e os textos das nove páginas de serviço em `docs/servicos/` — ou
seja, a prática já era código. O que faltava era a regra escrita, e enquanto ela não
existia a alternativa "tabela no banco" continuava sobre a mesa em cada spec nova.

## Decisão

**Conteúdo de página vive no código, versionado no git. Não existe conteúdo de página em
banco de dados.**

Vale para o termo de consentimento, para o texto institucional e para qualquer texto que
uma tela exiba: ele é módulo do repositório, entra por commit e sai por commit.

Para o termo especificamente, isso significa: catálogo de versões como arquivos do repo,
cada versão com `termo_id`, `versao`, `data_vigencia`, `tipo_mudanca` e `hash`. O hash é
conferido por teste no `npm test`; alterar o texto de uma versão publicada faz o teste
ficar vermelho.

### A fronteira, que precisa ficar escrita

O que o banco continua guardando é **registro de fato, não conteúdo**: quem aceitou, qual
hash de termo foi exibido, quando, e os eventos de revogação. A tabela `consentimentos`
não muda por causa deste ADR — ela é a prova jurídica do aceite, é append-only e é dado
de pessoa, não texto de página.

A regra é: **texto que a tela mostra igual para todo mundo é código; dado que pertence a
uma pessoa é banco.**

## Alternativas consideradas

**Linhas numa tabela do D1.** Recusada. Publicar versão nova viraria um `INSERT`, sem
deploy — a única vantagem real. O custo é onde a imutabilidade passaria a morar: num
banco sem histórico, sem revisão e sem diff, onde um `UPDATE` de uma linha reescreve
silenciosamente um termo que alguém já aceitou. O teste de integridade precisaria de
banco para rodar, e um teste que depende de estado externo é o primeiro a ser desligado
quando incomoda.

**Híbrido: texto no repo, metadados no banco.** Recusada por partir a mesma informação em
dois lugares que se desatualizam separadamente. A data de vigência de uma versão é parte
da versão.

## Consequências

**A favor**: a imutabilidade passa a ser propriedade do git e da CI, sem código de runtime
para mantê-la. O texto ganha revisão por diff antes de ir ao ar, que é exatamente o que se
quer de um termo jurídico. O cenário Gherkin do REQ-2 — "quando o texto do arquivo da
versão v1 é alterado" — já estava escrito assumindo arquivo, e passa a bater com a
implementação.

**Contra, e assumido**: publicar versão nova do termo exige deploy. Numa associação que
publica termo novo raramente, e cuja publicação já é `git push`, isso não é atrito real —
e o deploy traz junto a revisão que o `INSERT` não teria.

**Efeito nas tasks**: destrava a T4 de `consentimento-e-privacidade` (catálogo de termos).
A T5 daquela change está descrita como bloqueada por `usuarios` não existir; **esse
bloqueio caiu** — `usuarios` e `consentimentos` existem no schema desde que
`modelo-de-dados` foi arquivada.

**Gatilho de revisão**: se a APPD passar a precisar de gente não técnica editando texto
sem deploy, este ADR é revisto por ADR novo — a saída seria um CMS ou um editor com PR
automático, nunca uma tabela editável à mão.
