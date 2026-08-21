# Validação — acabamento de interface

Parecer do gate, no padrão das três changes já arquivadas: cada requisito com onde ele é
verificado e qual o veredito. O que ficou de fora está dito, e não escondido.

- Data: 2026-08-20
- `npm test`: **329 testes**, 12 arquivos, todos passando (eram 233 antes da change)
- `npm run aceite`: **211/211 verificações** no workerd real, em duas execuções seguidas
  (eram 143 antes da change)
- `npm run lint`, `npm run typecheck`, `npm run build`: limpos

## Como ler o "onde"

- **vitest** — `test/acabamento-de-interface.spec.ts`, que lê o código-fonte das telas.
  Serve para o que volta por alguém redigitar, não por bug de renderização: é o argumento
  de `revisao-de-interface.spec.ts`, e o histórico do projeto o justifica.
- **aceite** — `test/aceite/percurso.mjs`, no workerd de verdade, com navegador. Serve
  para o que só existe renderizado: largura medida, foco, rolagem, alvo de toque.
- **axe** — `@axe-core/playwright` com as tags WCAG 2.0/2.1/2.2 A e AA.

## Fase 1 — a causa comum e os defeitos

| Req             | Onde         | Veredito                                                                                           |
| --------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| REQ-1           | vitest       | **passa** — nenhuma regra limita a largura de `p` por ser `p`                                      |
| REQ-2           | vitest       | **passa** — a medida vive em `.prosa`                                                              |
| REQ-3           | vitest       | **passa** — teste percorre todas as telas e reprova largura fora de token; três exceções nomeadas  |
| REQ-4, REQ-5    | aceite       | **passa** — sem rolagem horizontal em 360, 414 e 768px                                             |
| REQ-6           | vitest       | **passa** — a medida continua existindo como token                                                 |
| REQ-7           | vitest       | **passa** — o cartão serve `/api/area/foto`; nenhum bloco desenha a palavra "Foto"                 |
| REQ-8           | código       | **passa** — `app/router.options.ts` leva toda navegação ao topo                                    |
| REQ-9           | —            | **dispensado pelo dono** em 2026-08-20; o salto não reproduziu. Ver T2                             |
| REQ-10          | vitest       | **passa** — cancelar restaura a foto anterior em vez de esvaziar                                   |
| REQ-11 a REQ-13 | vitest + axe | **passa** — o `✕` saiu de 28 lugares; a frase carrega a sinalização, ligada por `aria-describedby` |

## Fase 2 — cabeçalho e navegação

**Sem passar pelo Claude Design**, por liberação do dono. No lugar do gate de design
entrou medição, e é ela que sustenta esta seção.

| Req            | Onde         | Veredito                                                                         |
| -------------- | ------------ | -------------------------------------------------------------------------------- |
| REQ-14         | vitest       | **passa** — o nome sai da tela por `clip-path`, não por `display: none`          |
| REQ-15         | vitest       | **passa** — o botão é ícone e mantém `aria-label` alternando com o estado        |
| REQ-16         | vitest       | **passa** — `position: fixed` + `translateX(100%)`; a rolagem do fundo é travada |
| REQ-17         | vitest       | **passa** — os mesmos links, mais o link de conta                                |
| REQ-18, REQ-19 | vitest       | **passa** — a moldura de duas colunas, e nenhuma tela declara a própria          |
| REQ-20         | axe          | **passa** — os critérios de teclado foram medidos junto, não deixados para o fim |
| REQ-42, REQ-43 | axe + manual | **passa** — `Esc` fecha e devolve o foco; `inert` nos dois lados                 |
| REQ-44, REQ-45 | vitest       | **passa** — `aria-current` mais barra à esquerda, meio não-cromático             |
| REQ-47         | vitest       | **passa** — `prefers-reduced-motion` desliga o deslize                           |
| REQ-48         | aceite       | **passa** — o botão do menu mede 44px em 360, 414 e 768px                        |

**axe A/AA sem violação**: `/` a 390px (painel fechado **e** aberto), `/` a 1000px, `/` a
1280px, `/area`, `/area/dados` e `/area/excluir` a 1280px, `/area` a 390px.

Duas coisas que a medição pegou e a leitura não teria pegado, ambas erros meus:

1. Esconder o nome da marca com `display: none` deixou o **link sem nome acessível** — a
   imagem tem `alt` vazio de propósito, então o nome era o único texto. O axe acusou
   `link-name` só nas larguras em que o nome sumia.
2. O painel precisou de `inert` no lugar de `visibility: hidden`: com `visibility`, o foco
   não entrava no painel no mesmo quadro em que ele abria.

E uma que só o uso pegaria: o hambúrguer fica atrás da cortina quando o painel abre, então
quem usa toque não teria como fechar. O painel tem botão de fechar, e ele é o primeiro
item — que é onde o foco entra.

## Fase 3 — conteúdo e campos

| Req             | Onde    | Veredito                                                                             |
| --------------- | ------- | ------------------------------------------------------------------------------------ |
| REQ-21, REQ-22  | leitura | **passa** — legendas e linhas de apoio removidas                                     |
| REQ-23          | leitura | **passa** — o bloco "Antes de começar" saiu                                          |
| REQ-24          | leitura | **passa** — o campo 5 é caixa de uma linha; rótulo, ordem e obrigatoriedade intactos |
| REQ-25 a REQ-27 | aceite  | **passa** — campos 20 e 21 gravam; estado vem do CEP; país nasce "Brasil"            |
| REQ-28          | leitura | **passa** — a máscara já existia; entrou o formato anunciado antes de digitar        |
| REQ-29          | vitest  | **passa** — pinça de dois dedos no recorte; os botões e o teclado continuam          |
| REQ-30          | aceite  | **passa** — o campo 7 não foi tocado                                                 |
| REQ-31 a REQ-33 | leitura | **passa**                                                                            |
| REQ-34, REQ-35  | aceite  | **passa** — salvar exige alteração; ao salvar, volta ao topo com foco                |
| REQ-36          | leitura | **passa** — "Sair" na cor da marca                                                   |
| REQ-37          | leitura | **passa** — o parágrafo da ficha em papel saiu                                       |
| REQ-38          | aceite  | **passa** — o gate agora exige a **ausência** da frase                               |
| REQ-39          | —       | **bloqueado pela fonte** — não existe biografia da fundadora. Pendência 8a           |
| REQ-40          | leitura | **passa** — quem está autenticado encontra os campos preenchidos                     |
| REQ-41          | leitura | **passa** — o rótulo diz que ainda não envia                                         |
| REQ-46          | axe     | **passa** — `readonly`, não `disabled`; contraste AA mantido                         |

## Ressalvas escritas, em vez de escondidas

1. **REQ-29, o zoom por toque no recorte.** O gesto de pinça foi implementado e tem teste
   de código, mas **nenhuma medição aqui usou um aparelho de toque de verdade** — o
   navegador do gate não tem tela sensível. Fica como conferência manual num telefone
   antes de a change ir para `archive/`. Ao escrever esta validação eu havia marcado o
   requisito como "parcial" sem ter implementado nada; o registro fica para lembrar que o
   parecer se confere contra o código, não contra a memória.
2. **REQ-39, as duas biografias.** A tela já comporta biografias do mesmo tamanho; o que
   falta é o texto, e ele não existe em lugar nenhum. Conferido na fonte em 20/08.
3. **O atendimento de manhã saiu do site.** Era a única frase que dizia isso, e estava no
   bloco que o dono mandou remover. A constante segue em `shared/conteudo.ts`.
4. **REQ-24 de `cracha-do-associado` foi revogado** por esta change. Está marcado na spec
   arquivada, e o gate passou a exigir a ausência da frase — para que ninguém a recoloque
   achando que corrige um esquecimento.

## Por que a change não vai para `archive/`

A Fase 4 (crachá impresso) saiu daqui e vira proposal próprio; a ressalva 1 espera
conferência manual; e a 2 espera conteúdo do dono. O gate **do produto** passou.
