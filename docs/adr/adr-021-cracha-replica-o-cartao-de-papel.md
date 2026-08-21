# ADR-021: o crachá replica o cartão de papel, com CPF e endereço impressos

Status: Aceito
Data: 2026-08-21
Decisores: Arthur Barbero (dono do projeto)

Emenda o [ADR-020](adr-020-cid-no-cadastro-e-no-cracha.md), que tem um dia de idade: o
REQ-13 dele — opt-in próprio para imprimir o CID — fica **revogado**. O que o ADR-020 tem
de mais importante continua de pé, e está dito abaixo.

## Contexto

O crachá gerado pelo site nasceu com identidade própria, deliberadamente: o design system
v2 existe para o site novo não herdar a estética do material antigo. Em `cracha-impresso`
(2026-08-21) ele ficou **inspirado** no cartão da associação — faixa, marca e disposição em
duas colunas —, e o parecer daquela change registrou a ressalva de que a fidelidade era
decisão minha de escopo e o dono podia querer mais.

Quis. No mesmo dia, revendo o resultado:

> na verdade o cartão tinha que estar noventa por cento igual aquele lá, não o que você fez

E, perguntado até onde ia a cópia, respondeu que ia até os campos: **aparência e também os
campos e endereço**, sem opt-in, exceto o CID, que entra junto do consentimento que já
existe no formulário.

## Decisão

**1. O crachá é réplica do cartão de papel**, e não uma releitura dele. Grafismo da
associação, faixa com a sigla em corpo grande, caixas claras de rótulo e valor, foto com
moldura — a disposição que a pessoa já reconhece.

**2. Os campos impressos são os do papel**: nome, nascimento, número, CRAS, credencial de
transporte, CPF, QR e CID na frente; emissão, pessoa de contato, número de contato,
endereço da pessoa e os dados da associação no verso.

**3. Todo campo aparece sempre**, preenchido ou não.

**4. CPF e endereço são impressos sem opt-in.**

**5. O CID é impresso sempre que houver CID guardado.** O consentimento do formulário passa
a autorizar as duas coisas, e o texto dele diz isso antes da caixa.

**6. A trava do ADR-020 que não muda: o CID nunca aparece em `/verificar`**, sob nenhuma
condição, sem exceção nenhuma. É a única das três que sobrevive, e é a que mais importa.

## Consequências

### O que se ganha

Reconhecimento. Um documento de identificação vale pelo que faz na porta do ônibus, e o
que ele faz lá depende de o cobrador reconhecê-lo em dois segundos. Um cartão bonito e
diferente do que a associação usa há anos não é neutro: ele é um cartão que ninguém viu
antes, apresentado por quem mais precisa que não haja discussão.

### O que se perde, dito por inteiro

**Um crachá perdido na rua passa a entregar CPF, endereço e diagnóstico juntos.** Não é
exagero de quem escreve o ADR: é a lista literal do que está impresso. Antes, o cartão
identificava; agora ele qualifica, localiza e diagnostica a pessoa.

Três coisas atenuam, e nenhuma resolve:

- o cartão de papel da APPD **já faz exatamente isso** hoje, e é dele que este é cópia;
- o CID continua exigindo consentimento específico, gravado com hash do texto lido;
- a página pública continua sem CID e sem CPF, então o dano de perder o cartão não se
  multiplica pela internet.

O que não atenua, e vale escrever: **o cartão de papel não é o padrão de segurança deste
projeto.** Ele é o material que o projeto foi escrito para substituir. Copiá-lo é decisão
do dono, e o motivo dela é reconhecimento — não segurança.

### O opt-in que deixou de existir

O ADR-020 separava "guardar" de "imprimir" porque são decisões diferentes: ceder o
diagnóstico à associação e estampá-lo num cartão que se mostra na rua não são o mesmo ato.
Com uma caixa só, quem quiser o CID guardado sem imprimi-lo **não tem mais esse caminho**,
e quem se arrepender precisa retirar a autorização inteira em `/seus-direitos` — o que
apaga o CID.

A única compensação possível foi feita: o texto da caixa diz, antes de ela ser marcada, que
autorizar é autorizar imprimir. Autorização obtida por omissão era o defeito que as duas
caixas existiam para evitar; com uma caixa só, o texto é o que resta.

### Exceção declarada ao design system

O grafismo, a paleta e a tipografia em caixa alta do cartão são **exceção registrada** ao
design system v2, e valem só para o crachá. As cores vivem em `app/utils/cracha-marca.ts`,
fora de `tokens.css`, exatamente para que nenhuma tela do site as herde por conveniência.

Acessibilidade não entra na exceção: contraste AA, a fonte do projeto e a situação do
cadastro por ícone **e** texto continuam valendo. Onde o cartão de papel usa cinza claro
sobre branco, o nosso usa o tom que passa.

## O que continua fora

- **Validade** e "válida somente com a contribuição solidária em dia", que o papel traz. O
  site não sabe se a contribuição está em dia, e imprimir seria sustentar o que não se
  pode. Decisão do dono em 2026-08-21, mantida.
- **O sequencial `00001/CD`**: revela o tamanho do cadastro por contagem.
- **Logos e dados de recebimento** (PIX, Caixa, Sicoob) do verso: são dados financeiros da
  associação, e estampá-los num documento que vai ao bolso de terceiros é decisão de quem
  responde pela conta.
