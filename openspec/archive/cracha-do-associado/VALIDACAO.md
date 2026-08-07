# Validação item a item — `cracha-do-associado`

Data: 2026-08-07 · Executor: Claude Code · T6.5

Os **39 cenários** da spec, cada um com onde é verificado e o veredito. A regra do
`ESTADO.md` vale aqui: `[FEITO]` não é `[VALIDADO]`, e este documento existe para a
diferença sumir.

**Nenhum cenário fica sem veredito.** Onde a verificação é manual, está escrito que é
manual, com o que foi feito e quando — carimbar automático o que ninguém percorreu seria
o mesmo defeito que o parecer de ontem apontou.

## Onde as verificações moram

| Sigla | O quê                                                              |
| ----- | ------------------------------------------------------------------ |
| **U** | `npm test` — 130 testes, leem código-fonte e banco local           |
| **A** | `npm run aceite` — 117 verificações no workerd real, com navegador |
| **M** | conferência manual, com a data                                     |

## Número de registro (7 cenários)

Esta funcionalidade é de `cadastro-e-login`; aqui ela só é consumida (ADR-013).

| Cenário                                    | Onde                                                                    | Veredito   |
| ------------------------------------------ | ----------------------------------------------------------------------- | ---------- |
| Número gerado ao concluir o cadastro       | A — o cadastro devolve `APPD-AAAA-XXXXXX` e a área o exibe              | **passou** |
| Sequencial preenchido com zeros à esquerda | U — `test/registro.spec.ts`, formato                                    | **passou** |
| Sequencial recomeça a cada ano civil       | U — `test/registro.spec.ts`                                             | **passou** |
| Número é único no banco                    | U — `test/emissao-concorrente.spec.ts`, 10 rodadas × 50 emissões        | **passou** |
| Número é imutável                          | U — nenhuma rota escreve `numeroRegistro` depois da criação (varredura) | **passou** |
| Duas conclusões simultâneas não colidem    | U — colisão forçada em `test/emissao-concorrente.spec.ts`               | **passou** |
| Número exibido em fonte tabular            | A — `font-variant-numeric` na área, no crachá e na verificação          | **passou** |

## Foto: envio, recorte e armazenamento (11 cenários)

| Cenário                                                       | Onde                                                                                                                                                                 | Veredito                |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Recorte acontece no cliente e a imagem original não sobe      | A — o gate sobe um JPEG e o servidor recebe 400 × 500                                                                                                                | **passou**              |
| Recorte operável só pelo teclado                              | A — setas e `+`/`−` movem e aproximam; botões de 44 px                                                                                                               | **passou**              |
| Foto acima do teto rígido é rejeitada com instrução           | U — `test/foto.spec.ts`, teto de 102.400 conferido nos dois lados                                                                                                    | **passou**              |
| Arquivo de origem grande demais é recusado antes de processar | U — limite de 10 MB em `shared/foto.ts`, checado antes de decodificar                                                                                                | **passou**              |
| Arquivo que não é imagem é recusado                           | U — `test/foto.spec.ts` recusa PNG legítimo e cabeçalho truncado                                                                                                     | **passou**              |
| Servidor não confia no cliente                                | U — `dimensoesJpeg` lê SOI e marcador de quadro dos bytes recebidos                                                                                                  | **passou**              |
| Gravação passa pela interface `ArmazenamentoFoto`             | U — `test/vazamento.spec.ts`: nenhuma rota toca `schema.fotos` direto                                                                                                | **passou**              |
| Progresso do processamento é determinado                      | A — `role="progressbar"` com `aria-valuenow`, sem animação em laço                                                                                                   | **passou**              |
| Foto exige sessão                                             | A — `GET /api/area/foto` responde 401 sem cookie                                                                                                                     | **passou**              |
| Foto de outra pessoa responde igual a foto inexistente        | **por construção** — a rota **não aceita parâmetro de usuário**, então não existe foto alheia para pedir. O cenário previa escolher entre 403 e 404; a escolha sumiu | **passou, por desenho** |
| Foto aparece na verificação, embutida e sem URL própria       | A — a resposta traz `data:image/jpeg;base64,` e nenhuma URL de imagem                                                                                                | **passou**              |

> O cenário "Foto nunca aparece na verificação pública" foi **substituído** pelo de cima em
> 2026-08-07: o [ADR-015](../../../docs/adr/adr-015-verificacao-publica-exibe-foto-e-cuidador.md)
> mudou a decisão, e cenário que contradiz ADR aceito é registro mentindo.

## Crachá, exportação e opt-in (9 cenários)

| Cenário                                               | Onde                                                                                                                | Veredito                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Exportação acontece sem servidor                      | A — o gate **conta requisições** durante a exportação e exige zero                                                  | **passou**              |
| QR Code resolve para a verificação pública            | A — o QR do verso e o do painel apontam para `/verificar/<numero>`, e a página responde                             | **passou**              |
| Crachá não expõe dado além do previsto                | A — lê o cartão, não a página: sem endereço, telefone nem nascimento da pessoa                                      | **passou**              |
| Opt-in de deficiência vem desmarcado por padrão       | A — nasce desmarcado, e o texto não usa "recomendado", "ajuda" nem "facilita"                                       | **passou**              |
| Opt-in marcado afeta só o crachá                      | U + A — sem a marca a rota **nem consulta** o campo 12; marcado, ele entra no cartão e continua fora da verificação | **passou**              |
| Liberação é imediata                                  | A — o gate falha se aparecer "em análise", "aguardando aprovação" ou selo de validação                              | **passou**              |
| Sem foto, baixar fica desabilitado com motivo escrito | A — `disabled` com `aria-describedby` apontando para o motivo                                                       | **passou**              |
| Pré-visualização de impressão em 100%                 | A — a folha A4 traz a instrução de não ajustar à página                                                             | **passou**              |
| Marcas de corte na folha                              | **M, 2026-08-07** — conferidas na tela; a régua de verdade é papel, e ninguém imprimiu ainda                        | **passou com ressalva** |

## Verificação pública (8 cenários)

| Cenário                                                    | Onde                                                                                                                                                                  | Veredito   |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Número válido de associado ativo                           | A — nome, número, situação e foto; sem campo 12 no HTML bruto                                                                                                         | **passou** |
| Número válido de cadastro inativo                          | U — a rota devolve `situacao` como veio do banco; a tela usa âmbar, nunca vermelho                                                                                    | **passou** |
| Número inexistente e número mal formatado respondem igual  | A — os dois blocos comparados **caractere a caractere**                                                                                                               | **passou** |
| Consulta ao banco também ocorre para entrada mal formatada | U — `test/vazamento.spec.ts` confere que não há `return` antecipado antes da consulta                                                                                 | **passou** |
| Página declara o que não mostra                            | A — em corpo normal, logo abaixo da resposta                                                                                                                          | **passou** |
| Não existe busca por nome nem sugestão                     | A — campo único, e a rota só aceita o número completo                                                                                                                 | **passou** |
| Rajada de consultas é limitada                             | **M, 2026-08-07** — medido no workerd: 20 passam, a 21ª devolve 429, outro IP não é afetado. Fora do gate porque estourar o limite atrapalharia os cenários seguintes | **passou** |
| Verificação funciona sem JavaScript                        | A — renderizada no servidor; o `curl` sem JS traz a resposta pronta                                                                                                   | **passou** |

## Capacidade e limites (2 cenários)

| Cenário                                           | Onde                                                                   | Veredito   |
| ------------------------------------------------- | ---------------------------------------------------------------------- | ---------- |
| Linha do associado cabe com folga no teto de 2 MB | U — `CHECK` de 102.400 bytes na tabela `fotos`, mais ~4 KB de texto    | **passou** |
| Estimativa de capacidade documentada              | [ADR-003](../../../docs/adr/adr-003-foto-do-cracha-como-blob-no-d1.md) | **passou** |

## Acessibilidade (4 cenários)

| Cenário                                      | Onde                                                                                 | Veredito   |
| -------------------------------------------- | ------------------------------------------------------------------------------------ | ---------- |
| Sem violação de acessibilidade automatizável | A — axe A/AA a **1280 e 360 px** com o crachá e a impressão abertos                  | **passou** |
| Percurso completo por teclado                | A — o gate tecla `Tab` até "Baixar em PNG" e confere que o foco tem contorno visível | **passou** |
| Resultado anunciado por região viva          | A — `aria-live` envolve os estados da foto e a confirmação do opt-in                 | **passou** |
| Estado nunca depende só de cor               | A — situação sempre com ícone **e** texto, na tela e no cartão impresso              | **passou** |

## O que reprovou no caminho, e foi corrigido

**`scrollable-region-focusable` a 360 px.** A folha A4 da pré-visualização rola na
horizontal em tela estreita e não recebia foco de teclado — região que rola sem foco é
intransponível para quem não usa mouse. Corrigido com `tabindex="0"` e rótulo. **Só
apareceu porque a T6.2 exigia as duas larguras**: a 1280 px a folha não rola, e o defeito
não existia.

**Dois falsos positivos meus**, nomeados para não voltarem: uma asserção que procurava o
CEP da pessoa e casava com o do rodapé, e uma varredura de "deficiencia" que reprovava
`termoId: 'deficiencia-art11'` — identificador do termo, não o dado. Regex larga demais
reprova o inocente e ensina a ignorar o vermelho.

## Veredito

**39 de 39 cenários com veredito. Nenhum reprovado.**

Duas ressalvas ficam escritas, e nenhuma bloqueia:

1. **As marcas de corte não foram conferidas em papel.** A régua de verdade é imprimir e
   medir com régua. Fica como conferência de quem tiver impressora.
2. **O limite de consultas foi medido à mão**, fora do gate, porque estourá-lo atrapalha os
   cenários seguintes do mesmo percurso.

`cracha-do-associado` está pronta para `openspec/archive/`.
