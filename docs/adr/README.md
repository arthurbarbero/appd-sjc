# Decisões de arquitetura (ADR)

Fonte única da numeração. **Antes de escrever um ADR novo, reserve o número aqui** —
seis changes foram especificadas em paralelo em 2026-08-05 e quatro reservaram o mesmo
`ADR-003` para coisas diferentes. Renumerar depois é barato; descobrir a colisão no
meio da implementação, não.

Reversão de decisão é por ADR novo que substitui o anterior, nunca por apagamento.

## Escritos

| Nº  | Decisão                                                                                             | Status |
| --- | --------------------------------------------------------------------------------------------------- | ------ |
| 001 | [Cloudflare Workers + D1 como plataforma](adr-001-cloudflare-workers-d1.md)                         | Aceito |
| 002 | [Senha com scrypt e sessão em cookie selado](adr-002-senha-com-scrypt-e-sessao-em-cookie-selado.md) | Aceito |
| 003 | [Foto do crachá como BLOB no D1](adr-003-foto-do-cracha-como-blob-no-d1.md)                         | Aceito |
| 004 | [Liberação imediata do crachá](adr-004-liberacao-imediata-do-cracha.md)                             | Aceito |
| 005 | [Parâmetros do scrypt e o teto de CPU](adr-005-parametros-do-scrypt.md)                             | Aceito |
| 006 | [Conteúdo de página vive no código](adr-006-conteudo-de-pagina-vive-no-codigo.md)                   | Aceito |
| 012 | [Cadastro embutido no formulário](adr-012-cadastro-embutido-no-formulario.md)                       | Aceito |
| 013 | [Fronteira de rotas entre as changes](adr-013-fronteira-de-rotas-entre-changes.md)                  | Aceito |
| 014 | [Inscrição como registro de interesse](adr-014-inscricao-como-registro-de-interesse.md)             | Aceito |
| 015 | [Verificação pública exibe foto e cuidador](adr-015-verificacao-publica-exibe-foto-e-cuidador.md)   | Aceito |
| 016 | [Recuperação de senha: e-mail e painel admin](adr-016-recuperacao-de-senha.md)                      | Aceito |
| 017 | [O site não retém nada após a exclusão](adr-017-retencao-apos-exclusao.md)                          | Aceito |
| 018 | [Mensagem de erro e enumeração de conta](adr-018-mensagem-de-erro-e-enumeracao.md)                  | Aceito |

> **O ADR-016 foi reescrito no mesmo dia.** A primeira redação concluía que enviar e-mail
> exigia verificar domínio por DNS. Estava errado — confundi **enviar** com **chegar na
> caixa de entrada**. O dono apontou, a apuração foi refeita com oito buscas a mais, e a
> decisão mudou duas vezes no mesmo dia — a segunda por escolha dele: SendGrid gratuito
> agora, aceitando o risco de spam, mais painel administrativo. As duas coisas, não uma.

**017 e 018 foram decididos por mim, não pelo dono** — ele delegou os três em
2026-08-07 ("a pesquisa que fará é você mesmo", "tanto faz, faz o que achar melhor", "você
quem decide agora, depois a APPD revisa"). Estão marcados como aceitos porque a delegação
foi explícita, e o 017 tem revisão da APPD marcada dentro dele.

012, 013 e 014 resolvem, juntos, os bloqueios B5, B6, B7, B10, B11, B16, B17, B20, B22 e
B23 do primeiro parecer do gate (`openspec/PARECER-GATE.md`, apagado em 2026-08-07 depois
de os bloqueios estarem fechados; está no histórico do git).

**005 nasceu de uma medição que virou problema de plataforma**: nenhum parâmetro
defensável de scrypt cabe nos 10 ms de CPU do plano gratuito. A saída aceita foi mover o
cálculo caro para o navegador — a proteção continua existindo, só mudou de máquina.

## Reservados pelas specs, ainda não escritos

**Nenhum.** A lista zerou em 2026-08-07 com o ADR-006.

> **006 saiu desta lista** no mesmo dia: o dono decidiu que conteúdo de página não mora em
> banco de dados, e a decisão vale além do termo de consentimento — virou a regra geral do
> projeto.
>
> **008, 009, 010 e 011 saíram desta lista em 2026-08-07**, porque foram escritos. Eles
> estavam citados em quatro specs havia dois dias, apontando para documento nenhum — duas
> das decisões já estavam **implementadas**. Quem achou foi `test/gate-spec.spec.ts`, que
> falha quando uma spec cita ADR que não existe nem está reservado aqui. É a razão de esta
> tabela existir de forma legível por máquina: enquanto ela era só prosa, a lista crescia
> sem ninguém notar.

> **Correção de 2026-08-07**: esta seção dizia que o **ADR-005 estava escrito mas não
> decidido**. Estava errado desde 2026-08-06 — o dono escolheu a opção F naquele dia, está
> no cabeçalho do próprio ADR, e o código que roda em produção é ela.

> **Correção de 2026-08-07**: esta seção listava o caminho de e-mail de redefinição de
> senha como "ainda por decidir, sem número reservado". Decidido no mesmo dia — é o
> ADR-016.

## Sobre o 007

O número 007 chegou a ser reservado para o protocolo `ATD-<ano>-<sequencial>`, que existia
para ancorar o aceite do termo de quem preenchesse o formulário **sem conta**. Com o
[ADR-012](adr-012-cadastro-embutido-no-formulario.md) toda inscrição passou a pertencer a
um usuário, o protocolo ficou sem função, e o número voltou a ficar livre.

Foi reaproveitado em 2026-08-06 para a decisão do número de registro sorteado — que, por
coincidência, também é sobre numeração, e sobre o mesmo erro: numeração previsível expõe
mais do que parece.
