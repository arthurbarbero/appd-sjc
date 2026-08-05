# ADR-003: Foto do crachá como BLOB no D1

Status: Aceito
Data: 2026-08-05
Decisores: Arthur Barbero (dono do projeto), Claude Code

## Contexto

O crachá do associado exige foto. A escolha natural para arquivo binário é um serviço
de storage de objeto — no ecossistema Cloudflare, o R2. Só que **o R2 exige método de
pagamento cadastrado**, e a restrição do projeto é custo zero sem cartão (ADR-001).

O volume é pequeno e previsível: uma foto por associado, tirada uma vez, servida
poucas vezes. Não é galeria, não é upload em massa, não tem transformação de imagem.

## Decisão

Vamos guardar a foto do crachá como **BLOB numa coluna do D1**, com o processamento de
imagem feito **no navegador da pessoa** antes do envio: recorte para 400x500, conversão
para JPEG com qualidade 0,75 e **teto rígido de 100 KB** — acima disso o envio é
recusado com instrução do que fazer.

O acesso passa por uma interface `ArmazenamentoFoto`, com uma implementação para o D1.
Trocar por R2 depois é implementar a mesma interface, sem tocar no resto.

## Alternativas consideradas

| Alternativa                                       | Prós                            | Contras                                                  | Por que NÃO                                                     |
| ------------------------------------------------- | ------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| Cloudflare R2                                     | feito para isso; barato; escala | **exige método de pagamento cadastrado**                 | quebra a restrição inegociável do projeto                       |
| Serviço externo gratuito (Imgur, Cloudinary free) | sem custo direto                | foto de pessoa com deficiência num terceiro sem contrato | dado pessoal em serviço de terceiro sem base legal nem contrato |
| Base64 numa coluna de texto                       | simples                         | ~33% maior que o binário, e o D1 já aceita BLOB          | desperdício de espaço sem ganho nenhum                          |
| Não guardar foto; crachá sem foto                 | zero problema de storage        | crachá sem foto não identifica ninguém                   | esvazia o produto — o crachá existe para identificar            |

## Consequências

- **Positivas**: custo zero mantido; nenhum dado de pessoa sai da infraestrutura do
  projeto; o recorte no cliente elimina a necessidade de biblioteca de imagem no
  servidor, que não rodaria bem no workerd mesmo.
- **Negativas / dívida**:
  - Foto no banco infla o tamanho do D1 e, com ele, o tempo de backup e de restauração.
  - Limite do D1: **2 MB por linha** e **500 MB por banco** no plano gratuito. Com foto
    de 100 KB, o teto teórico é da ordem de milhares de associados — folga real para o
    tamanho da APPD, mas não é infinito.
  - Servir BLOB pelo Worker gasta CPU e conta na cota de requisições. Mitigação: rota
    autenticada com cache no cliente.
  - O teto de 100 KB implica compressão visível. Para crachá impresso em 54x85,6 mm
    é suficiente; para ampliação, não.
- **Gatilho de revisão**: banco passando de ~350 MB, ou necessidade de mais de uma foto
  por pessoa, ou a associação passando a ter cartão corporativo — aí o R2 volta à mesa,
  e a troca custa uma implementação da interface.

## Nota sobre privacidade

A foto **nunca** é servida em rota pública. A verificação pública do crachá
(`/verificar/<numero>`) mostra apenas nome, número e situação — sem foto, sem endereço,
sem telefone, sem tipo de deficiência. Ver ADR-004 e a change
`cracha-do-associado`.
