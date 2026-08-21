# Tasks: crachá impresso

- Spec: [`spec.md`](spec.md) · Proposal: [`proposal.md`](proposal.md) ·
  [ADR-020](../../../docs/adr/adr-020-cid-no-cadastro-e-no-cracha.md)

Cada task fecha com os cenários que ela cobre passando, e com `npm run lint`,
`npm run typecheck` e `npm run build` limpos.

**A ordem não é arbitrária.** O CID vem antes do layout de propósito: se as travas do
ADR-020 não estiverem de pé, não existe cartão para imprimi-lo. Trabalhar o desenho
primeiro criaria a tentação de "só deixar o campo aparecer" enquanto o consentimento fica
para depois — e é assim que dado sensível vaza.

## Fase A — as travas do CID

### T1 — Termo do CID no catálogo

Cobre REQ-11, REQ-12.

Slug próprio, **não** uma versão nova do termo do Art. 11: são finalidades diferentes, e o
histórico precisa distinguir "autorizei a tratar minha deficiência" de "autorizei a guardar
meu diagnóstico". Texto que nomeia a finalidade, sem palavra que empurre a marcar.

### T2 — Colunas e migration

Cobre REQ-18 a REQ-21, contrato de dados.

`cid`, `cidNoCracha`, `cras`, `credencialTransporte`, `contatoEmergencia`. Todas anuláveis
menos o opt-in, que nasce em 0. O CID **nunca** dentro do campo 12.

### T3 — Coleta com consentimento próprio

Cobre REQ-10, REQ-11, REQ-13.

Campo opcional no formulário; recusa com 422 quando vier CID sem consentimento; gravação do
aceite com hash do termo exibido. O opt-in de impressão é outro controle, e nasce
desmarcado.

**Aceite**: os três cenários de "O CID é opcional, e nada depende dele".

### T4 — A proibição transversal ganha o segundo alvo

Cobre REQ-15, REQ-17.

O teste que hoje garante que o campo 12 não vaza para rota pública passa a cobrir o CID —
**sem a exceção sob opt-in** que o campo 12 tem. Vale para `/verificar`, para
`/api/verificar` e para qualquer rota pública que venha a existir.

**Aceite**: os dois cenários de "O CID nunca é público", com o opt-in de impressão marcado.

### T5 — Retirada apaga o CID

Cobre REQ-16.

Uma transação: apaga o CID, desliga o opt-in de impressão, grava a revogação apontando para
o termo que a pessoa aceitou. É o desenho que a retirada do campo 12 já usa — e o mesmo
lugar onde, em 11/08, um marcador de lugar sobreviveu numa rota vizinha. Varrer, não
corrigir onde foi visto.

## Fase B — o cartão

### T6 — Desenho da tira

Cobre REQ-7, REQ-8, REQ-9.

Inspirado no cartão da associação: faixa, marca, disposição. **Decisão do dono**: leva ao
canvas, ou faço aqui com medição no lugar do gate de design, como na
`acabamento-de-interface`. Sem essa definição, T7 não começa.

A foto do cartão físico **não entra no repositório** — descrição em medidas.

### T7 — Frente e verso lado a lado

Cobre REQ-1 a REQ-6.

Tira deitada, cada metade em paisagem, margem de corte, nosso número, geração local. Vale
para o PDF, o PNG e `/area/cracha-impressao`.

### T8 — Emissão, contato e a escala da prévia

Cobre REQ-5, REQ-21, REQ-23, REQ-24.

Emissão derivada da data do cadastro; contato de emergência com queda para o do cuidador;
prévia em escala legível; e **nada de validade** — nem campo, nem frase.

## Fechamento

### T9 — Gate

`npm test`, `npm run aceite`, lint, typecheck, build e axe em `/area/cracha`,
`/area/cracha-impressao` e no formulário com os campos novos. `VALIDACAO.md` item a item,
no padrão das changes arquivadas.

**Uma verificação que esta change não pode dispensar**: a suíte precisa provar que o CID
não sai em rota pública **com o opt-in de impressão marcado**. É o estado em que o erro
seria invisível, porque a pessoa autorizou alguma coisa — só não foi aquela.
