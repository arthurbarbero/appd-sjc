# Validação — crachá impresso

Parecer do gate, no padrão das changes arquivadas. O que ficou de fora está dito, e não
escondido.

- Data: 2026-08-21
- `npm test`: **375 testes**, 14 arquivos
- `npm run lint`, `npm run typecheck`, `npm run build`: limpos
- Decisão estrutural: [ADR-020](../../../docs/adr/adr-020-cid-no-cadastro-e-no-cracha.md)

## A parte que mais importa: as travas do CID

Este é o primeiro dado **diagnóstico** que o projeto guarda, e o único que vai impresso num
documento que a pessoa mostra na rua. As travas do ADR-020 não são requisito entre outros:
são a condição de a decisão do dono se sustentar.

| Trava                                        | Onde é verificada                            | Veredito  |
| -------------------------------------------- | -------------------------------------------- | --------- |
| Termo próprio, não versão do Art. 11         | `cracha-impresso.spec.ts` + `termos.spec.ts` | **passa** |
| Consentimento próprio para guardar           | esquema exercitado no vitest + ponta a ponta | **passa** |
| Opt-in próprio para imprimir                 | `cracha-impresso.spec.ts` + navegador        | **passa** |
| **Nunca em `/verificar`, sem exceção**       | `vazamento.spec.ts` + ponta a ponta          | **passa** |
| Retirada apaga dado, marca e grava revogação | `cracha-impresso.spec.ts`                    | **passa** |

**A verificação que esta change não podia dispensar** — e não dispensou: o CID fica fora da
página pública **com o opt-in de impressão ligado**. Conferido no navegador, no JSON e no
HTML. É o estado em que o erro seria invisível, porque a pessoa autorizou alguma coisa, só
não foi aquela.

## Requisitos

| Req             | Onde                           | Veredito                                                            |
| --------------- | ------------------------------ | ------------------------------------------------------------------- |
| REQ-1 a REQ-3   | navegador + vitest             | **passa** — tira deitada, dois cartões lado a lado, margem de corte |
| REQ-4           | aceite                         | **passa** — geração sem requisição de rede                          |
| REQ-5           | navegador                      | **passa** — prévia legível                                          |
| REQ-6           | vitest                         | **passa** — número do site; nada de sequencial                      |
| REQ-7 a REQ-9   | navegador                      | **passa** — faixa, marca e disposição do cartão da associação       |
| REQ-10 a REQ-17 | vitest + navegador             | **passa** — ver a tabela de travas acima                            |
| REQ-18 a REQ-21 | vitest                         | **passa** — campos 22 a 25, todos opcionais                         |
| REQ-22          | `revisao-de-interface.spec.ts` | **passa** — os 15 originais intactos                                |
| REQ-23          | navegador                      | **passa** — emissão derivada da data do cadastro                    |
| REQ-24          | vitest                         | **passa** — nenhuma menção a validade ou contribuição em dia        |
| REQ-25 a REQ-27 | axe                            | **parcial** — ver ressalva 1                                        |

## Cinco defeitos meus, achados antes de sair daqui

Nenhum estava previsto; todos foram pegos por medição, e é o que mais vale registrar.

1. **O consentimento era falsificado pelo cliente.** Eu mandava `consentimentoCid: true`
   fixo junto do CID, o que anulava a caixa — o navegador afirmava a autorização que o
   servidor iria conferir. O teste de ponta a ponta enviou o CID sem marcar nada e o
   cadastro passou. Num campo comum seria bug; num consentimento do Art. 11 é a trava se
   desligando sozinha.
2. **Lógica circular no opt-in.** A tela só oferecia o controle se recebesse o CID, e a
   rota só mandava o CID se o controle estivesse ligado. Resolvido com um booleano: a tela
   precisa saber que existe, não qual é.
3. **A tira não cabia na folha.** Dois cartões deitados somam 171,2 mm e a margem de 20 mm
   deixava 170 úteis — o segundo saía da página sem aviso. O cartão em pé cabia por acaso.
4. **`z.literal(true)` sem mensagem**, pego pelo teste de mensagens escrito no dia anterior.
5. **O histórico filtrava por termo**, e com dois termos passou a esconder metade da
   verdade: a pessoa autorizava guardar o diagnóstico e `/seus-direitos` não mencionava.
   Sem aparecer, não havia o que retirar.

## Ressalvas escritas, em vez de escondidas

1. **REQ-25 a REQ-27, acessibilidade do cartão.** O axe roda nas telas e passa, mas
   **não houve passada de axe na tela de impressão com o CID ligado**, nem conferência de
   teclado no novo opt-in. Fica como verificação antes do archive.
2. **A identidade visual é inspirada, não replicada.** Faixa, marca e disposição em duas
   colunas vieram do cartão da associação; o brasão em marca d'água e o fundo verde-azul
   não. Foi decisão minha de escopo, e o dono pode querer mais fidelidade — é ajuste de
   CSS, não de estrutura.
3. **O CID não é validado contra a tabela oficial**, por decisão de escopo: o site não é
   sistema de saúde. O campo aceita o que a pessoa copia do laudo, e um erro de digitação
   sai impresso.
4. **Nenhuma medição usou impressora de verdade.** A tira cabe na folha por aritmética e
   na tela por medida em milímetros; se o papel sair diferente, é aqui que a conta falha.

## Fechamento, em 2026-08-21

As três pendências venceram no mesmo dia, na change
[`cartao-fiel-e-cadastro-aberto`](../cartao-fiel-e-cadastro-aberto/VALIDACAO.md):

- **Ressalva 1** — a conta do percurso de aceite passou a informar CID, e com isso o axe da
  tela de impressão roda **com o diagnóstico na tela**, nas duas larguras. O teclado no
  controle novo deixou de existir junto com o controle: o opt-in de impressão foi revogado.
- **Ressalva 2** — o dono deu a palavra, e foi contra o que eu tinha feito: "o cartão tinha
  que estar noventa por cento igual aquele lá". O cartão virou réplica, e a exceção ao
  design system está registrada no
  [ADR-021](../../../docs/adr/adr-021-cracha-replica-o-cartao-de-papel.md).
- **Ressalva 4** — a impressão de verdade **continua pendente**, e migrou para o parecer da
  change nova. A tira cabe por aritmética e por milímetro na tela; se o papel sair
  diferente, é aí que a conta falha.

A ressalva 3 (o CID não é validado contra a tabela oficial) segue de pé, por decisão de
escopo.

**Uma trava deste parecer foi revogada no dia seguinte ao dia em que nasceu.** O opt-in
próprio de impressão — a segunda linha da tabela lá em cima — deixou de existir por decisão
do dono. A tabela fica como está, porque ela descreve o que era verdade quando foi escrita,
e o ADR-020 carrega a emenda.
