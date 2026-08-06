# Proposal: Área do associado

- ID: PROP-20260805-area-do-associado Status: em discussão
- Origem: decisão do dono em 2026-08-05, materializada no prompt de design
  [area-do-associado.md](../../../docs/prompts-design/area-do-associado.md); rotas já
  previstas em [arquitetura-informacao.md](../../../docs/arquitetura-informacao.md)
- Autor do registro: Claude Code (especificador) · Dono do conteúdo: Arthur Barbero
- Data: 2026-08-06 Versão: v2 · Nível da régua: **Grande**

> **v2 (2026-08-06)** — reescrita contra o contrato de dados, depois do gate. Esta change
> passa a ser dona única de `/area`, `/area/dados`, `/area/inscricoes` e `/area/excluir`
> (ADR-013), perde `/area/cracha`, ganha a edição da inscrição (ADR-014) e troca a dupla
> caixa de seleção por um modal, por decisão do dono.

## Motivação (por quê)

Depois que a pessoa se cadastra, hoje ela não tem para onde voltar. Não sabe se a inscrição
andou, não consegue corrigir um telefone errado — que é exatamente o canal pelo qual a
associação faz o primeiro contato —, não tem como pegar o crachá de novo e não tem como sair
do sistema. Isso produz três custos concretos:

1. **Ligação evitável para a associação.** Toda dúvida de estado ("entrei na fila?") vira
   telefonema para uma equipe pequena.
2. **Telefone desatualizado.** O bloco introdutório do formulário pede que a pessoa mantenha
   o telefone atualizado, mas não existe lugar onde atualizar.
3. **Direito da LGPD sem porta.** Exclusão de conta é direito do titular. Sem uma tela, o
   exercício depende de e-mail e boa vontade.

A área do associado é a porta de volta: quatro assuntos, cada um dizendo o estado atual em
uma linha e oferecendo uma ação nomeada.

## Escopo (o que entra)

- **Painel `/area`** com quatro blocos — Minhas inscrições, Meu crachá, Meus dados e Excluir
  minha conta — e a identificação (nome e `numero_registro`) no topo.
- **`/area/inscricoes`**: consulta **e edição** da inscrição — quais deficiências, quais
  tipos de atendimento e quais dias —, com status por ícone **e** texto. A edição é
  requisito novo do ADR-014: é o que a pessoa ganha em relação à planilha de hoje.
- **`/area/dados`**: consulta e alteração dos dados de contato e endereço.
- **`/area/excluir`**: página própria, com **modal** de confirmação e "Cancelar" como ação
  preenchida.
- **Estados obrigatórios**: painel completo, sem nenhuma inscrição, sem foto no crachá,
  carregando, edição com erro, e confirmação de exclusão.
- **Estado vazio que oferece o próximo passo**, nunca só a ausência.
- **Regra de dado sensível**: o tipo de deficiência não aparece em nenhum bloco da área.
- Acessibilidade WCAG 2.2 AA como aceite bloqueante de todas as telas.

## Fora de escopo (o que NÃO entra)

- **Autenticação, sessão, login, logout e recuperação de senha** — change `cadastro-e-login`.
  Esta change assume a sessão pronta e só a consome.
- **Consentimento do Art. 11, política de privacidade e página "Seus direitos"** — change
  `consentimento-e-privacidade`. A área linka para elas; não escreve o texto legal.
- **`/area/cracha` inteira** — change `cracha-do-associado`, incluindo o envio da foto, a
  geração, a exportação e `/verificar/<numero>` (ADR-013). Aqui existe apenas a **prévia** no
  painel e o link para a tela dela.
- **As tabelas** — change `modelo-de-dados`. Esta change não cria coluna.
- **A guarda de rota de `/area/*`** — change `cadastro-e-login`. Esta change não implementa
  verificação de sessão própria.
- **Criação** da inscrição e os 15+3 campos — change `formulario-atendimento`. A **edição**
  passou a ser desta change (ADR-014).
- **Alteração do status da inscrição pela pessoa.** Na V1 o status tem um valor só; quando
  houver mais, quem move é `painel-admin`.
- **Exportação de dados pessoais em arquivo** (portabilidade da LGPD) — fica para depois, com
  decisão própria.
- **Notificação por e-mail ou SMS** de qualquer mudança de estado.

## Impacto

- **Toca dado sensível?** Sim, por omissão deliberada: o tipo de deficiência existe no banco e
  **não pode** ser renderizado em nenhuma tela desta change. A área é aberta no ônibus e
  mostrada na portaria; exibir dado de saúde ali é vazamento sem necessidade nenhuma.
- **Toca dado destrutivo?** Sim: a exclusão de conta apaga dados, incluindo a foto do crachá.
  Precisa de gate de revisão antes de virar task e de teste que prove o que sobra e o que sai.
- **Toca custo real?** Não. Tudo roda no Worker e no D1 do free tier.
- **Arquitetura afetada?** Não estruturalmente. Consome sessão, tabela de usuários, tabela de
  inscrições e a interface `ArmazenamentoFoto` já definida em `cracha-do-associado`.
- **Dependências**: `cadastro-e-login` (sessão), `formulario-atendimento` (tabela de
  inscrições e vocabulário de status), `cracha-do-associado` (número, foto e prévia do
  crachá), `consentimento-e-privacidade` (destino dos links legais), design aprovado no Claude
  Design antes de qualquer HTML.

## Premissas e questões abertas

- Premissa: os status de inscrição são "Na fila", "Em atendimento" e "Encerrada", conforme o
  prompt de design. Se `formulario-atendimento` definir vocabulário diferente, esta spec é
  atualizada antes do código.
- Premissa: exclusão apaga imediatamente a foto do crachá. Se o jurídico pedir retenção, muda
  o REQ correspondente e vira ADR.
- `[A CONFIRMAR]` com a APPD e o jurídico: a lista exata do que a associação é obrigada a
  manter após a exclusão e por quanto tempo. A tela reserva o lugar do texto; o conteúdo é
  deles. **Sem essa resposta, a tela vai ao ar com a marcação visível, não com texto
  inventado.**
- Questão aberta para o dono: a exclusão é imediata ou tem janela de arrependimento? A spec v1
  assume imediata e irreversível, como diz o desenho; janela de arrependimento seria mudança
  de escopo.

## Próximo passo no fluxo

proposal → spec (REQ + Gherkin) → gate do revisor-spec → tasks → design aprovado →
implementação → validação item a item.
