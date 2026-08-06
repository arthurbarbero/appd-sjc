# ADR-013: Fronteira de rotas e de dados entre as changes

Status: Aceito
Data: 2026-08-06
Decisores: Arthur Barbero (dono do projeto)

## Contexto

Seis changes foram especificadas em paralelo em 2026-08-05, sem contrato de dados
escrito antes. Cinco delas escreveram requisitos para as mesmas rotas de `/area`, e
três reivindicaram o mesmo `/area/cracha`. O `numero_registro` ganhou dois donos com
dois algoritmos incompatíveis; a foto ganhou dois limites de tamanho (5 MB e 10 MB);
a exclusão de conta ganhou três listas diferentes do que apaga. São os bloqueios B6,
B10, B11, B20, B22 e B23 do parecer do gate.

Nenhum desses conflitos é ambiguidade de redação. Todos são o mesmo recurso descrito
por dois contratos que nunca se leram — falha de condução do fluxo de spec, não das
specs. O `openspec/README.md` já publicava a fronteira certa; as specs não a seguiram.

## Decisão

**Vale a fronteira do `openspec/README.md`.** Cada rota e cada recurso tem um dono só.

| Change                        | É dona de                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `modelo-de-dados`             | todas as tabelas, colunas, chaves e migrations. Nenhuma outra change cria coluna.                                             |
| `cadastro-e-login`            | `usuarios`, senha, sessão, login, logout, redefinição de senha, guarda de rota de `/area/*`, e a emissão do `numero_registro` |
| `formulario-atendimento`      | `/atendimento/inscricao`, os 15 campos + os 3 do cadastro, a validação e a gravação da inscrição                              |
| `consentimento-e-privacidade` | `/privacidade`, `/seus-direitos`, o catálogo versionado de termos e a gravação do aceite                                      |
| `area-do-associado`           | `/area`, `/area/dados`, `/area/inscricoes` e `/area/excluir`                                                                  |
| `cracha-do-associado`         | `/area/cracha` inteira — incluindo o envio, o recorte e o armazenamento da foto — e `/verificar/<numero>`                     |
| `site-institucional`          | as 17 rotas públicas e a 404                                                                                                  |

### Os quatro conflitos, resolvidos nominalmente

1. **`numero_registro`** — dono é `cadastro-e-login`, que o emite ao concluir o
   cadastro. O algoritmo é o do REQ-4 daquela change: unicidade garantida por
   restrição do banco, com nova tentativa em caso de colisão, no máximo 5 tentativas.
   O "ler o maior sequencial do ano e somar 1" da task T1.2 de `cracha-do-associado`
   **é revogado** — quebra com cadastros simultâneos. Junto com ele cai a exigência de
   sequência **consecutiva sem buraco** (`cracha-do-associado` REQ-5): retentativa
   deixa buracos, e buraco na numeração não prejudica ninguém. `cracha-do-associado`
   apenas **exibe** o número.

2. **Foto** — dona é `cracha-do-associado`, um limite só: recorte para 400 × 500 px no
   navegador, JPEG, **teto rígido de 102.400 bytes**, revalidado pelos bytes no
   servidor (ADR-003). O REQ-22 de `cadastro-e-login`, que aceitava 5 MB no cadastro,
   **é revogado**: o cadastro não recebe foto; ele aponta para `/area/cracha`.

3. **`/area/cracha`** — dona é `cracha-do-associado`. `cadastro-e-login` REQ-33 e
   `area-do-associado` REQ-12 a REQ-14 saem. A área do associado pode **linkar** para
   a rota; não especifica o que tem dentro dela.

4. **Exclusão de conta** — dona é `area-do-associado`, em `/area/excluir`.
   `consentimento-e-privacidade` cede o fluxo e fica só com o **conteúdo** que a tela
   precisa exibir (o que é retido, por quê, e a base legal). `cadastro-e-login` fica só
   com o efeito na tabela `usuarios`. Uma lista de exclusão, escrita uma vez, na change
   dona — e ela vive na spec do `modelo-de-dados`, porque é contrato de dados.

### A tela de exclusão

**Uma página, um modal.** O botão de excluir abre um modal que pergunta se a pessoa
tem certeza; confirmou, executa. Decisão do dono em 2026-08-06, substituindo tanto as
três telas de `consentimento-e-privacidade` quanto a confirmação por duas caixas de
seleção decidida na Fase 2.

Requisitos de acessibilidade do modal, bloqueantes:

- foco preso dentro do modal enquanto ele estiver aberto;
- `Esc` fecha sem excluir;
- ao abrir, o foco vai para o texto ou para o botão de cancelar — **nunca** para o
  botão de confirmar;
- ao fechar, o foco volta para o botão que o abriu;
- `role="dialog"`, `aria-modal="true"` e rótulo acessível ligado ao título;
- o botão de confirmar diz o que faz ("Excluir minha conta"), não "OK".

## Consequências

- **Positivas**: seis bloqueios do gate caem de uma vez; some o ciclo de dependência
  entre `cadastro-e-login` e `cracha-do-associado`; o grafo de execução do parecer
  fecha sem ciclo.
- **Negativas / dívida**:
  - `cadastro-e-login` perde os REQ-30 a REQ-35 e as tasks T-10 e T-11;
    `area-do-associado` perde os REQ-12 a REQ-14 e as tasks T2.4/T2.5;
    `consentimento-e-privacidade` perde os REQ-17/REQ-18 do fluxo de exclusão;
    `cracha-do-associado` perde o REQ-5 e a T1.2. Reescrita já orçada.
  - A regra "quem é dono de rota é dono do contrato dela" precisa valer também para as
    changes futuras (`painel-admin`), ou o problema volta.
- **Gatilho de revisão**: change nova que precise escrever numa tabela de que não é
  dona. Nesse caso a discussão é na spec do `modelo-de-dados`, não na change.

## Nota de responsabilidade

O emaranhado não veio das specs: veio de eu ter posto seis agentes escrevendo em
paralelo sem contrato de dados anterior e sem dono declarado por recurso. O registro
disso, como padrão a não repetir, está no vault em
`aprendizados/specs-em-paralelo-colidem`.
