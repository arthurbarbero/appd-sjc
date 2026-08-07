# Prompt — Verificação pública do crachá

Rota `/verificar/<numero_registro>`. Pública de propósito, sem login, quase sempre
aberta pela câmera do celular ao ler o QR Code do crachá.

## A espinha

**Decisão que a tela ajuda a tomar:** "essa pessoa é mesmo associada à APPD?" — em
menos de cinco segundos, de pé, na porta da sede ou na calçada, com uma mão só.

**O que o olho vê primeiro, segundo, terceiro:**

1. A situação: associado ativo, ou não.
2. O nome e o número conferidos.
3. Nada. E esse "nada" é o requisito mais importante das quatro telas.

**A tela mostra cinco informações: foto, nome, número de registro, situação e, quando
houver, o contato de cuidador** — decisão do dono em 2026-08-07,
[ADR-015](../adr/adr-015-verificacao-publica-exibe-foto-e-cuidador.md). A foto está aqui
porque sem rosto a página prova que o número existe, não que quem está na frente do
verificador é o dono dele.

**O tipo de deficiência continua terminantemente fora**, e com ele endereço, telefone e
data de nascimento. O campo 12 é dado sensível do Art. 11 da LGPD e a página é pública:
não é preferência de desenho, é a única restrição desta tela que não se negocia. Ela
continua declarando, em texto normal logo abaixo do bloco de resposta, o que não mostra.

**Não ajude quem está adivinhando número.** A resposta para um número que não existe é
idêntica à resposta para um número mal digitado ou fora de formato: mesma frase, mesmo
bloco, mesma altura de tela. Nunca "esse formato está errado", nunca "número existe mas
está inativo… ou não", nunca sugestão de número parecido, nunca busca por nome.

**Por que a tela existe além do crachá:** a associação capta doação por telefone com
agente que recolhe presencialmente (risco R4 das pendências). Um doador precisa de um
lugar onde confira se a pessoa que bateu na porta dele é da APPD. Esse uso ainda depende
de confirmação da associação, então entra na tela marcado.

**Estados:** número válido e ativo; número válido com situação inativa; número que não
existe; e a chegada por leitura de QR Code no celular, em 360px.

---

## O prompt

> Página pública de verificação de crachá de um site institucional responsivo (desktop
> 1280px, mobile 360px) da APPD São José dos Campos, associação de pessoas com
> deficiência. Alguém lê o QR Code de um crachá e cai aqui para conferir se a pessoa é
> associada.
> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta,
> amarelo `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo
> `#6f7782`, link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson
> Hyperlegible com corpo de 17px e título de página em 56px, raio de 10px em bloco e
> campo, elevação discreta, espaçamento generoso com base 8.
> A tela é lida em pé, no celular, em poucos segundos, muitas vezes por alguém idoso e
> desconfiado. A estética é de **consulta pública oficial**: uma resposta grande e curta,
> centrada, cercada de espaço vazio — pense em tela de conferência de documento em
> repartição bem-feita, não em painel de sistema. **Evite** dados pessoais em tabela, selo
> de segurança falso, escudo, cadeado ilustrado, degradê, fundo colorido na tela inteira,
> animação de confirmação e qualquer campo além do de consulta.
> **Prefira** um bloco único de resposta — retrato à esquerda, quatro linhas de dado à
> direita —, muito respiro em volta, e uma declaração explícita do que a página **não**
> mostra.
>
> Conteúdo, nesta ordem:
>
> 1. **Cabeçalho enxuto** — logo (bloco reservado de 48px, retângulo sólido `#8b0000`
>    com o texto LOGO) e o nome "APPD São José dos Campos", com link para o início. Sem
>    menu completo: quem chega aqui veio conferir uma coisa só.
> 2. **`h1`** "Verificação de crachá".
> 3. **Bloco de resposta**, o elemento dominante da tela: fundo `#f7f8f9`, borda
>    `#e2e5e9`, raio de 10px, sombra discreta. À esquerda a **foto em proporção 4:5**, do
>    tamanho de um retrato de documento, com `alt` que diz apenas "Foto de <nome>". À
>    direita, cada linha com rótulo pequeno acima do valor: "Nome", "Número de registro"
>    (em fonte tabular, `APPD-2026-00042`), "Situação" e, quando existir, "Contato de
>    cuidador". A situação aparece como selo com ícone e texto, nunca só cor. Em 360px a
>    foto vai acima e o texto abaixo.
> 4. **Declaração do que não é mostrado**, imediatamente abaixo do bloco de resposta,
>    em texto normal e não em nota de rodapé miúda: "Esta página não mostra endereço,
>    telefone, data de nascimento nem tipo de deficiência." Segunda linha: "A associação
>    não publica esses dados em nenhum endereço público." Com link "Ler a Política de
>    Privacidade".
> 5. **Consulta manual** — um campo único rotulado "Digite o número do crachá", com
>    exemplo no texto de ajuda, `inputmode` de texto, 52px de altura, e o botão
>    "Verificar". Existe porque nem todo mundo consegue usar a câmera. Não há busca por
>    nome, não há sugestão enquanto digita, não há lista de números.
> 6. **Bloco "Recebeu uma ligação da APPD?"**, com fundo `#f7f8f9` e a marcação
>    `[A CONFIRMAR]` visível no título: explica em duas frases que quem for até a casa do
>    doador deve apresentar crachá com número, e que o número pode ser conferido aqui.
>    Telefone da associação para dúvida: (12) 3346-0605.
> 7. **Rodapé** igual ao do resto do site, em `#14161a` com texto branco: endereço (Rua
>    Acássia Pereira 136, Campos dos Alemães, São José dos Campos/SP), CNPJ
>    08.074.883/0001-96, telefone (12) 3346-0605, e-mail appdsjc@gmail.com, e os links
>    Política de Privacidade e Seus direitos.
>
> Renderize estas quatro telas:
>
> 1. **Número válido e ativo** — situação "Associado ativo" como selo verde `#3f5320`
>    sobre `#eef4e4`, com ícone de confirmação e texto. Nome "Maria Aparecida da Silva",
>    número `APPD-2026-00042`. Abaixo do bloco, uma linha explicando o que isso quer
>    dizer: "Este número pertence a uma pessoa associada à APPD."
> 2. **Número válido, situação inativa** — mesma estrutura, selo em `#7a4a10` sobre
>    `#fdf3e3`, com ícone e o texto "Cadastro não ativo". Isto **não** é um erro nem uma
>    acusação: escreva "Este número existe, mas o cadastro não está ativo agora." e ofereça
>    o próximo passo, "Em caso de dúvida, ligue para a associação: (12) 3346-0605." Não
>    use vermelho, não diga "inválido", não diga "fraude" e não explique o motivo da
>    inatividade.
> 3. **Número que não existe** — bloco neutro em `#f7f8f9` com ícone e o texto "Não
>    encontramos esse número.", seguido de "Confira o número impresso no crachá e tente de
>    novo. Se continuar assim, ligue para (12) 3346-0605." A resposta é **exatamente a
>    mesma** para número inexistente e para número digitado fora do formato: mesma frase,
>    mesmo bloco, mesmo tamanho. Não diga que o formato está errado, não valide o padrão
>    na tela, não sugira número parecido, não mostre quantos dígitos faltam.
> 4. **Chegada por QR Code, em 360px** — a mesma página em largura de celular, com o
>    bloco de resposta visível inteiro sem rolar, o número em corpo grande e a declaração
>    do item 4 imediatamente abaixo, ainda acima da dobra sempre que couber.
>
> Acessibilidade como requisito de layout: um único `h1`; foco visível de 3px `#0f4c93`
> com 2px de folga; o campo de consulta e o botão com 44px no mínimo; a situação
> comunicada por ícone e por texto além da cor; o resultado da consulta anunciado por
> região `aria-live`; nada abaixo de 15px; texto não justificado; nada depender de
> câmera, de gesto ou de JavaScript para ser lido.

---

## Aceite visual

- [ ] A tela mostra **foto, nome, número, situação e cuidador quando houver**, e mais
      nada. Qualquer outro dado da pessoa reprova sem discussão.
- [ ] **Tipo de deficiência não aparece em lugar nenhum** — nem no texto, nem em atributo,
      nem em comentário. Este item sozinho reprova a tela.
- [ ] A foto tem `alt` que diz só "Foto de <nome>", sem descrever a pessoa.
- [ ] Existe uma declaração explícita, em texto normal, do que a página não mostra.
- [ ] As respostas de "não existe" e de "formato errado" são idênticas.
- [ ] Não há busca por nome, sugestão de número nem lista de associados.
- [ ] A situação inativa não usa vermelho nem linguagem de erro ou de acusação.
- [ ] O número aparece em fonte tabular.
- [ ] O bloco "Recebeu uma ligação da APPD?" está marcado `[A CONFIRMAR]`.
- [ ] Em 360px a resposta cabe sem rolar.
- [ ] Nenhum escudo, cadeado ilustrado ou selo de segurança falso.

## Se sair errado

- **Apareceu endereço, data de nascimento ou tipo de deficiência**: reprovação dura. Peça
  a renderização de novo com "a página mostra foto, nome, número, situação e contato de
  cuidador; remova todos os outros campos".
- **A tela ficou parecendo um painel de sistema** (tabela, vários blocos, metadados):
  peça "um bloco de resposta só, centrado, com muito espaço vazio em volta".
- **O erro de número inexistente virou didático demais** ("o formato correto é
  APPD-AAAA-NNNNN"): peça a mensagem genérica única — dica de formato ajuda quem tenta
  adivinhar número.
- **A situação inativa saiu vermelha**: peça `#7a4a10` sobre `#fdf3e3` com ícone de
  atenção, e texto que não acusa ninguém.
- **Veio com menu completo e página longa**: peça cabeçalho enxuto; esta tela responde
  uma pergunta e termina.
