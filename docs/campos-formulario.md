# Formulário CADASTRO DE ATENDIMENTO 2026 — fonte da verdade

Extraído do formulário real em uso pela APPD-SJC. **Este arquivo manda**: rótulos,
ordem e obrigatoriedade dos campos são réplica fiel do original e não mudam sem
decisão da associação. O que a gente melhora é o que está em volta — acessibilidade,
validação, base legal, mensagem de erro —, nunca a lista de perguntas.

Data do levantamento: 2026-08-05.

## Por que não pode mudar

A APPD já opera com essas perguntas: o atendimento, a fila e o critério de vaga foram
construídos em cima delas. Trocar rótulo ou tirar campo por conta própria significa
entregar um sistema que responde a uma pergunta diferente da que a associação faz.
Divergência encontrada vira item em [pendencias-appd.md](pendencias-appd.md), não vira
alteração unilateral.

## Bloco introdutório da tela

Adaptado do texto do formulário atual. O conteúdo é o mesmo; a forma foi organizada
em tópicos porque parede de texto é barreira de acessibilidade.

- Os atendimentos são agendados conforme o surgimento de vagas.
- Mantenha o telefone atualizado — é por ele que vem o primeiro contato.
- As orientações gerais são repassadas no primeiro atendimento.
- Todos devem respeitar o regimento interno da instituição.

## Os 15 campos

| #   | Rótulo (exato)                    | Tipo                | Obrigatório |
| --- | --------------------------------- | ------------------- | ----------- |
| 1   | NOME                              | texto               | Sim         |
| 2   | DATA DE NASCIMENTO                | data                | Sim         |
| 3   | TELEFONE PARA CONTATO             | texto com máscara   | Sim         |
| 4   | É WHATSAPP                        | rádio               | Sim         |
| 5   | ENDEREÇO (rua/avenida/travessa)   | textarea            | Sim         |
| 6   | NÚMERO                            | texto               | Sim         |
| 7   | COMPLEMENTO (se houver)           | texto               | Não         |
| 8   | BAIRRO                            | texto               | Sim         |
| 9   | MUNICÍPIO                         | texto               | Sim         |
| 10  | NOME DO CUIDADOR (se necessário)  | texto               | Não         |
| 11  | CONTATO DO CUIDADOR               | texto               | Não         |
| 12  | POSSUI ALGUMA DEFICIÊNCIA         | checkbox (múltipla) | Sim         |
| 13  | Tipo de Atendimento               | checkbox (múltipla) | Sim         |
| 14  | Melhores dias                     | checkbox (múltipla) | Sim         |
| 15  | Ciência da Contribuição Solidária | rádio               | Sim         |

### Detalhe campo a campo

**1. NOME** — texto livre, obrigatório. Nome completo da pessoa que será atendida (não
do cuidador; o cuidador tem os campos 10 e 11).

**2. DATA DE NASCIMENTO** — obrigatório. **Divergência consciente com o original**: no
formulário atual é texto livre, o que produz data em cinco formatos diferentes. Aqui
vira campo de data com componente acessível, aceitando digitação direta em `dd/mm/aaaa`
além do seletor. É melhoria de forma, não de conteúdo — a pergunta é a mesma.

**3. TELEFONE PARA CONTATO** — obrigatório, com máscara. É o canal do primeiro contato:
o bloco introdutório diz explicitamente para mantê-lo atualizado. Aceitar celular e
fixo. A máscara nunca pode impedir o envio — se o número não casar com o padrão
esperado, avisar, não bloquear silenciosamente.

**4. É WHATSAPP** — rádio, obrigatório. Opções exatas: `Sim` / `Não`.

**5. ENDEREÇO (rua/avenida/travessa)** — textarea, obrigatório.

**6. NÚMERO** — texto, obrigatório. Texto e não número: existe "s/n", "123-A", "Km 4".

**7. COMPLEMENTO (se houver)** — texto, opcional.

**8. BAIRRO** — texto, obrigatório.

**9. MUNICÍPIO** — texto, obrigatório. Mantido como texto livre: a APPD atende gente de
fora de São José dos Campos, e uma lista fechada excluiria essas pessoas.

**10. NOME DO CUIDADOR (se necessário)** — texto, opcional.

**11. CONTATO DO CUIDADOR** — texto, opcional.

**12. POSSUI ALGUMA DEFICIÊNCIA** — checkbox de múltipla escolha, obrigatório (pelo
menos uma). Opções exatas:

- `Física`
- `Intelectual ou Neurodivergentes`
- `Sensorial (visão, audição, fala)`
- `Outro` → abre campo de texto livre

> **Dado sensível.** Este campo é dado de saúde, protegido pelo Art. 11 da LGPD. Exige
> consentimento específico e destacado, com registro de versão do termo e data/hora do
> aceite. Não pode ser tratado com a mesma base legal dos outros campos, não aparece no
> crachá sem opt-in explícito, e nunca aparece na verificação pública. Ver a change
> `consentimento-e-privacidade`.

**13. Tipo de Atendimento** — checkbox de múltipla escolha, obrigatório (pelo menos
uma). Opções exatas:

- `Empréstimo Equipamentos`
- `Fisioterapia`
- `Orientações Gerais`
- `Psicologia`
- `Serviço Social`
- `Outro` → abre campo de texto livre

> **Divergência a resolver com a APPD.** Esta lista não bate com os projetos
> divulgados no site atual (Informática Nota 10, Artesão da Inclusão, Bocha
> Paralímpica, Oficina Mão na Roda) — e o site não menciona Psicologia nem Empréstimo
> de Equipamentos. Mantemos as opções do formulário como estão até a associação
> esclarecer. Ver [pendencias-appd.md](pendencias-appd.md).

**14. Melhores dias** — checkbox de múltipla escolha, obrigatório. Rótulo completo:
_"Melhores dias (sessões SOMENTE no período da manhã)"_. A informação do período faz
parte do rótulo e não pode ser escondida em tooltip. Opções exatas:

- `Segundas`
- `Terças`
- `Quartas`
- `Quintas`
- `Sextas`
- `Qualquer Dia da Semana`

**15. Ciência da Contribuição Solidária** — rádio, obrigatório. Opção única: `Ciente`.
Texto que acompanha: contribuição solidária sugerida de R$ 50,00 mensais, ajustável
conforme a situação de cada atendido.

> Um rádio com uma opção só é, na prática, uma confirmação de leitura. O texto do valor
> e da possibilidade de ajuste precisa estar visível ao lado do controle, não em link
> ou modal: ninguém pode declarar ciência de algo que não leu. E precisa ficar claro
> que é **sugerida e ajustável** — não é condição de atendimento.

## Regras que valem para o formulário inteiro

- **Validação espelhada** cliente e servidor com o mesmo schema Zod. O servidor nunca
  confia no cliente.
- **Erro por campo**, com texto que diz o que fazer, associado ao campo via
  `aria-describedby` e anunciado por região `aria-live`. Nada de "erro no formulário".
- **Erro não apaga resposta.** Formulário de 15 campos preenchido por pessoa com
  deficiência motora não pode zerar porque o telefone veio com um dígito a menos.
- **Nada sinalizado só por cor** — erro tem ícone e texto.
- **Alvo de toque ≥44px** em todo checkbox e rádio, com rótulo clicável.
- **Ordem de foco** igual à ordem visual; grupos de checkbox em `fieldset` com
  `legend` igual ao rótulo do campo.
- **Salvamento parcial** é desejável mas depende de conta criada; decisão fica na
  change `formulario-atendimento`.
