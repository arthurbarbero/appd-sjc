# Formulário CADASTRO DE ATENDIMENTO 2026 — fonte da verdade

Extraído do formulário real em uso pela APPD-SJC. **Este arquivo manda**: rótulos,
ordem e obrigatoriedade dos campos são réplica fiel do original e não mudam sem
decisão da associação. O que a gente melhora é o que está em volta — acessibilidade,
validação, base legal, mensagem de erro —, nunca a lista de perguntas.

Data do levantamento: 2026-08-05.

## Uma exceção de forma: caixa alta e baixa

Os rótulos abaixo estão como no formulário original, em CAIXA ALTA. Na tela, eles são
renderizados em caixa alta e baixa — "Nome", "Telefone para contato" —, com as **mesmas
palavras**. Caixa alta apaga o contorno da palavra e reduz a legibilidade, justamente
para quem este site precisa atender. É mudança de apresentação, não de pergunta.

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

**3. TELEFONE PARA CONTATO** — obrigatório, com máscara. Desde 2026-08-21 o campo nasce
com `+55` escrito e o valor é guardado em formato internacional (`+5512991657059`); a
pessoa pode apagar o código do país, e quem mora fora do Brasil precisa poder. É o canal do primeiro contato:
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

**12. POSSUI ALGUMA DEFICIÊNCIA** — checkbox de múltipla escolha, **opcional desde
2026-08-21**. Opções exatas:

- `Física`
- `Intelectual ou Neurodivergentes`
- `Sensorial (visão, audição, fala)`
- `Outro` → abre campo de texto livre

> **Dado sensível.** Este campo é dado de saúde, protegido pelo Art. 11 da LGPD. Exige
> consentimento específico e destacado, com registro de versão do termo e data/hora do
> aceite. Não pode ser tratado com a mesma base legal dos outros campos, não aparece no
> crachá sem opt-in explícito, e nunca aparece na verificação pública. Ver a change
> `consentimento-e-privacidade`.

> **Deixou de ser obrigatório em 2026-08-21**, por decisão do dono: "eu posso não ter
> nenhuma deficiência e querer ser voluntário (…) aqui é um cadastro, não só de quem tem
> deficiência". Isto **altera um dos 15 originais**, e por isso está registrado com a
> citação: a regra do `CLAUDE.md` protege os originais de mudança que não seja do dono, e
> esta é dele.
>
> A consequência que não é óbvia: **o consentimento do Art. 11 passou a ser condicional**.
> Sem deficiência marcada não há dado de saúde a tratar, e pedir a autorização assim mesmo
> seria colher consentimento sobre o vazio — o contrário do que o artigo exige, que é
> autorização específica para uma finalidade.

**13. Tipo de Atendimento** — checkbox de múltipla escolha, **opcional desde 2026-08-21**
(mesma decisão do campo 12). Opções exatas:

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

**14. Melhores dias** — checkbox de múltipla escolha, **opcional desde 2026-08-21** (mesma
decisão do campo 12). Rótulo completo:
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

## Campos acrescentados por decisão do dono

Não alteram nenhum dos 15 acima: são acréscimo. Ordem na tela: os 15 originais, depois
o endereço ganha o CEP, e a conta vem no fim, antes do consentimento.

| #   | Rótulo | Tipo              | Obrigatório | Decisão                                                   |
| --- | ------ | ----------------- | ----------- | --------------------------------------------------------- |
| 16  | CEP    | texto com máscara | Sim         | dono, 2026-08-06                                          |
| 17  | E-MAIL | e-mail            | Sim         | [ADR-012](adr/adr-012-cadastro-embutido-no-formulario.md) |
| 18  | CPF    | texto com máscara | Sim         | ADR-012                                                   |
| 19  | SENHA  | senha             | Sim         | ADR-012                                                   |
| 20  | ESTADO | texto             | Sim         | dono, 2026-08-20                                          |
| 21  | PAÍS   | texto             | Sim         | dono, 2026-08-20                                          |

Os quatro seguintes existem para o **crachá impresso** servir ao que o cartão de papel da
associação serve. Todos **opcionais**: o cadastro conclui sem qualquer um deles.

| #   | Rótulo                   | Tipo     | Obrigatório | Decisão                                                                  |
| --- | ------------------------ | -------- | ----------- | ------------------------------------------------------------------------ |
| 22  | CID                      | texto    | **Não**     | dono, 2026-08-21 — [ADR-020](adr/adr-020-cid-no-cadastro-e-no-cracha.md) |
| 23  | CRAS                     | texto    | **Não**     | dono, 2026-08-21                                                         |
| 24  | CREDENCIAL DE TRANSPORTE | texto    | **Não**     | dono, 2026-08-21                                                         |
| 25  | CONTATO DE EMERGÊNCIA    | telefone | **Não**     | dono, 2026-08-21                                                         |

**O campo 22 não é um campo como os outros, e não deve ser tratado como um.** O CID é
diagnóstico — `G82.4` é tetraplegia espástica, com código e classificação clínica —,
enquanto o campo 12 guarda categoria larga. Os dois são dado de saúde do Art. 11; só o 22 é
prontuário, e só ele vai impresso num cartão que a pessoa mostra na rua.

Por isso ele carrega duas travas, e carregou três por algumas horas:

1. **Consentimento próprio** para guardar **e imprimir**, com termo de slug próprio — não é
   versão nova do termo do Art. 11, porque a finalidade é outra.
2. **Nunca em `/verificar`**, sob nenhuma condição. Para o campo 12 há exceção sob opt-in;
   para o 22 **não há exceção**. Esta é a trava que o ADR-020 existe para sustentar.

A terceira era um **opt-in próprio para imprimir**, separado do consentimento de guardar.
Foi revogada em 2026-08-21 pelo [ADR-021](adr/adr-021-cracha-replica-o-cartao-de-papel.md),
por decisão do dono: "o CID pode entrar junto do consentimento atual existente". Com uma
caixa só, ela diz as duas coisas antes de ser marcada — é o que resta no lugar da
separação.

**A ordem dos blocos mudou em 2026-08-21**, e os campos são os mesmos. O bloco "3b. Para o
seu crachá, se você quiser" deixou de existir por decisão do dono — "não precisa ter 3b,
nem falar que é pro crachá". O CID subiu para o bloco 1, com a autorização colada nele;
CRAS e credencial abrem o bloco de atendimento; o contato de emergência ficou logo abaixo
do contato do cuidador, com a nota de que pode ficar em branco quando for a mesma pessoa.

Um bloco chamado "para o seu crachá" ensinava que aqueles dados servem ao documento, quando
servem ao atendimento: o CRAS é a porta de entrada da rede pública, e a credencial é o
transporte que traz a pessoa até aqui.

**Emissão não é campo.** É derivada da data do cadastro, e por isso ninguém a digita e
ninguém a erra. **Validade também não existe** — o cartão de papel a condiciona à
contribuição em dia, e o site não sabe nada sobre pagamento; decisão do dono em 21/08 foi
deixar para depois.

**Estado e país entraram na revisão do dono de 2026-08-20**, pelo mesmo caminho do CEP:
são acréscimo, e nenhum dos 15 originais muda. O estado chega preenchido pela consulta de
CEP — a rota já devolvia a UF e ninguém a usava —, e o país nasce com "Brasil" porque a
associação atende São José dos Campos e região; os dois continuam editáveis.

Na mesma revisão, o campo 5 (endereço) deixou de ser `textarea` e passou a ser caixa de
uma linha. **Rótulo, ordem e obrigatoriedade não mudaram**: a réplica fiel é do conteúdo
do formulário de papel, não do controle de tela usado para preenchê-lo.

**O CEP preenche rua, bairro e município** a partir do ViaCEP, que é gratuito e não exige
cadastro. Três regras nessa busca:

1. A consulta passa pelo **nosso** servidor (`/api/cep/<cep>`), não direto do navegador.
   Chamar direto entregaria o IP de cada visitante a um terceiro, junto com o CEP — e num
   site de associação de pessoas com deficiência esse par diz que alguém daquela região
   visitou **este** site. Mesma razão que tirou as fontes do Google do projeto.
2. O preenchimento **nunca sobrescreve** o que a pessoa já digitou.
3. CEP não encontrado ou serviço fora do ar **não bloqueia**: avisa e o endereço continua
   digitável à mão, que é o caminho que sempre funciona.

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
