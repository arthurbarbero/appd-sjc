# Tasks: pedidos da APPD

- Spec: [`spec.md`](spec.md) · Proposal: [`proposal.md`](proposal.md)

Cada task fecha com `npm run lint`, `npm run typecheck` e `npm run build` limpos. O
`npm run aceite` roda **uma vez, no fim**.

A ordem é a da proposal, e o motivo é qual erro está custando mais agora: a Bocha é a única
informação falsa no ar.

## T1 — Bocha Paralímpica sai do site

Cobre REQ-1 a REQ-5.

Projeto, rota, vocabulário do campo 13 e as menções em texto. Sem tratamento do que está
gravado, por decisão do dono — e com o motivo escrito no lugar em que a próxima pessoa vai
procurar, que é o vocabulário.

## T2 — O CEP substitui quando muda

Cobre REQ-6 a REQ-9.

Guardar qual CEP preencheu o endereço da última vez, e comparar. As duas telas usam a mesma
função: hoje elas têm cópias parecidas, e "parecidas" é o estado que precede "diferentes".

## T3 — O teto do cadastro

Cobre REQ-10, REQ-11.

Um número, numa linha. Foi a task que eu mais complicou: entreguei um modo atendimento
inteiro — senha, cookie selado, tela, ADR e oito travas de teste — e o dono cortou, porque a
parte de atendimento pertence à change do painel administrativo. Registro do que aconteceu,
e não do que eu gostaria de ter feito.

## T4 — Os dois rótulos

Cobre REQ-17, REQ-18.

E `docs/campos-formulario.md` acompanha: documento que descreve outro rótulo é pior que
documento nenhum, porque é consultado.

## T5 — O gate

Cobre REQ-19, REQ-20.

`npm test`, `npm run aceite`, axe nas telas tocadas. Mais a verificação que só o navegador
faz: a 404 respondendo na rota do projeto removido.
