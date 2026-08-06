# ADR-012: O cadastro está embutido no formulário de atendimento

Status: Aceito
Data: 2026-08-06
Decisores: Arthur Barbero (dono do projeto)

## Contexto

O formulário de atendimento da APPD é preenchido hoje sem conta: a pessoa abre um
Google Forms, responde 15 perguntas e envia. As seis changes escritas em 2026-08-05
divergiram justamente aqui — `consentimento-e-privacidade` definiu
`consentimentos.usuario_id` como NOT NULL, enquanto `formulario-atendimento` decidiu
que a inscrição não teria vínculo com usuário nenhum. As duas não podem estar certas,
e o mesmo furo derrubava a listagem "minhas inscrições" da área do associado e o
requisito de apagar o tipo de deficiência na exclusão de conta (bloqueios B5, B7 e
B17 do parecer do gate).

A alternativa recomendada pelo revisor era tornar o vínculo opcional e ancorar o
aceite num protocolo. O dono decidiu o caminho oposto e mais simples.

## Decisão

**O formulário de atendimento cria a conta.** Não existem dois fluxos: quem preenche o
formulário se cadastra no mesmo ato.

Consequência direta no modelo: `consentimentos.usuario_id` é **NOT NULL** e o vínculo
entre inscrição e pessoa é obrigatório. A contradição some por construção.

### Campos novos

O formulário real não tem e-mail, não tem CPF e não tem senha. Embutir o cadastro
acrescenta **três perguntas** às 15 existentes:

| Campo  | Papel                                    | Restrição no banco |
| ------ | ---------------------------------------- | ------------------ |
| E-mail | identificador de login                   | UNIQUE             |
| CPF    | identificador da pessoa atendida         | UNIQUE             |
| Senha  | autenticação (scrypt, ver ADR-002 e 005) | —                  |

`CLAUDE.md` proíbe alterar os 15 campos por conta própria; esta é a decisão do dono
que autoriza a exceção, e ela é **acréscimo**, não alteração: nenhum dos 15 rótulos
originais muda, some ou troca de obrigatoriedade.

### Uma conta por pessoa atendida

A conta é da **pessoa que será atendida**, não de quem digita. Uma mãe com dois filhos
com deficiência cria duas contas, com dois e-mails e dois CPFs. Decisão explícita do
dono em 2026-08-06, depois de o modelo alternativo (uma conta de cuidador contendo
várias pessoas) ser proposto e recusado.

Os campos 10 e 11 do formulário (nome e contato do cuidador) continuam existindo como
**dados de contato** da conta, não como dono dela.

## Alternativas consideradas

| Alternativa                                         | Prós                                                | Contras                                                            | Por que NÃO                                                      |
| --------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Vínculo opcional + protocolo (recomendação do gate) | não acrescenta campo nenhum ao formulário           | quem preenche sem conta nunca vê nem edita a inscrição             | o objetivo do projeto é justamente a pessoa gerenciar o cadastro |
| Cadastro separado, antes do formulário              | separa responsabilidades                            | dois formulários seguidos, e o público desistiria entre um e outro | fricção onde o produto menos pode ter                            |
| Uma conta de cuidador com várias pessoas            | atende a mãe com dois filhos sem criar dois e-mails | modelo mais complexo, e mistura quem opera com quem é atendido     | recusado pelo dono: a conta é da pessoa atendida                 |

## Consequências

- **Positivas**:
  - Some a contradição que reprovou três changes no gate. `usuario_id` NOT NULL vale
    em toda parte, e a área do associado consegue listar e editar a inscrição.
  - Some o `protocolo` (`ATD-<ano>-<sequencial>`): ele existia para ancorar o aceite de
    quem não tinha conta. Com toda inscrição ligada a um usuário, o `numero_registro`
    já identifica a pessoa. **ADR-007 fica sem objeto** e é liberado.
  - Some a duplicação das colunas de consentimento em `inscricoes_atendimento`: o
    aceite mora só na tabela `consentimentos`, que é append-only.
- **Negativas / dívida**:
  - **Três perguntas a mais num formulário longo, para um público com pouca fluência
    digital.** É a barreira de entrada subindo na única porta do serviço. Mitigações
    obrigatórias na spec: nenhuma confirmação de e-mail bloqueia o envio, e a senha não
    exige composição decorativa (símbolo, maiúscula) — só comprimento mínimo.
  - **Quem não tem e-mail não se inscreve sozinho.** Parte do público atendido depende
    de terceiro para isso. Precisa estar previsto no atendimento presencial da APPD.
  - **Toda pessoa passa a ter senha, logo toda pessoa vai esquecê-la.** Redefinir senha
    exige enviar e-mail ou SMS, e o projeto **não tem caminho de custo zero para isso**.
    Isso não bloqueia o modelo de dados; **bloqueia o login ir ao ar**. Pesquisa em
    aberto no `PROGRESS.md`.
  - CPF é dado pessoal novo que a APPD não coleta hoje. Entra em
    `docs/pendencias-appd.md` para a associação confirmar.
- **Gatilho de revisão**: se a APPD relatar que pessoas estão desistindo no cadastro,
  ou se o atendimento presencial virar o caminho majoritário de inscrição, este ADR é
  reaberto — o caminho de volta é o vínculo opcional que o gate recomendava.
