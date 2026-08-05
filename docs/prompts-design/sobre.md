# Prompt — Sobre nós (`/sobre`)

A página que o doador abre antes de doar e o voluntário abre antes de se oferecer. É também a
página com o problema legal mais sério do site atual: `/sobre-nos` publica o nome do presidente
junto de histórico clínico detalhado e nomes de dois filhos. **Dado de saúde é sensível pelo
Art. 11 da LGPD**, inclusive quando o próprio titular autoriza. Esta tela é desenhada sem nada
disso.

## A espinha

**Decisão que a tela ajuda a tomar, e em quanto tempo:** em menos de um minuto, a pessoa decide
se esta associação é real e séria o bastante para receber o dinheiro dela, o tempo dela, ou a
confiança de um familiar.

**O que o olho vê primeiro, segundo, terceiro:**

1. O que a associação é e faz, em uma frase, com ano de fundação e cidade.
2. O que ela oferece hoje — atendimento e projetos, com link para cada página.
3. Quem responde por ela, e os documentos que comprovam.

**O corte que esta tela faz, e por quê:** a seção do presidente traz cargo e atuação
institucional, e **nada de saúde**: sem acidente, sem diagnóstico, sem tratamento, sem datas
clínicas, sem nome de familiar. Isso não é edição de estilo, é remoção de dado sensível
republicado sem base legal registrada. Um bloco `[A CONFIRMAR]` na própria tela diz que a
associação decide o que quer republicar — a decisão é dela, e precisa ser por escrito.

**A correção de linguagem:** o site atual se apresenta como "Associação das Pessoas Portadoras
de Deficiência", inclusive no título das páginas. Termo superado. Em toda a tela, **pessoa com
deficiência**.

**O buraco que a tela mostra em vez de esconder:** não existem publicados missão declarada,
visão, valores, composição da diretoria, estatuto, prestação de contas nem número de assistidos.
Cada um aparece marcado `[A CONFIRMAR]`, do jeito que ficará quando existir. Só o regimento
interno já é público hoje, e é o único link real da seção de documentos.

**Estados:** a versão publicável hoje, com as marcações; a versão com tudo confirmado, para a
associação ver o que ganha ao responder; e 360px.

---

## O prompt

> Página institucional "Sobre nós" de um site responsivo (desktop 1280px, mobile 360px) da APPD
> São José dos Campos, associação sem fins lucrativos de pessoas com deficiência, fundada em 2006.
> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta, amarelo
> `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo `#6f7782`, link e foco
> em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson Hyperlegible com corpo de 17px e título
> de página em 56px, raio de 10px em bloco e campo, elevação discreta, espaçamento generoso
> com base 8.
> Quem lê é um doador avaliando se a associação é confiável, ou alguém decidindo se doa horas de
> trabalho. É uma página de **leitura**, em coluna única, largura de linha entre 60 e 75
> caracteres, subtítulos frequentes para permitir varredura. A estética é institucional sóbria e
> contemporânea, de relatório bem diagramado: hierarquia por tamanho de texto, blocos com borda
> leve e canto suave, dados verificáveis em destaque tipográfico. **Evite** o kit padrão de
> página institucional: linha do tempo com ícones, grade de "nossos valores" com três ícones
> ilustrados, número gigante de impacto com contador animado, citação decorativa em fonte
> grande, foto de banco de imagem com pessoa sorrindo, retrato inspiracional de pessoa com
> deficiência, degradê, vidro fosco, sombra pesada e faixa gigante antes do conteúdo.
> **Prefira** texto direto em segunda pessoa, frases curtas e dado conferível.
>
> Conteúdo, nesta ordem:
>
> 1. **Trilha de navegação**: Início › Sobre nós.
> 2. **`h1`** "Sobre nós" e, em 19px: "A APPD é uma associação sem fins lucrativos de pessoas
>    com deficiência, em São José dos Campos, fundada em 2006." Sem imagem atrás do texto.
> 3. **"O que fazemos"** — dois ou três parágrafos curtos de texto corrido: localizar, orientar
>    e incluir na sociedade as pessoas com deficiência, e amparar quem tem mais dificuldade; e o
>    compromisso de levar informação, porque cresce o número de pessoas que adquirem alguma
>    deficiência, muitas vezes por acidente, e enfrentam a luta pela inclusão. Linguagem simples,
>    voz ativa, frases de no máximo 25 palavras. Use sempre "pessoa com deficiência" — nunca
>    "portadora de deficiência".
> 4. **"Como começou"** — parágrafo único: fundada em 29 de março de 2006, por iniciativa da
>    Sra. Maria Claudete da Silveira Rabelo de Moura com um grupo de pessoas com os mesmos
>    ideais. Sem linha do tempo, sem marcos decorativos.
> 5. **"O que oferecemos hoje"** — duas listas compactas de links, com título próprio, sem
>    virar cartões grandes (a home já tem os cartões): "Atendimento" com Fisioterapia,
>    Psicologia, Serviço Social, Orientações Gerais e Empréstimo de Equipamentos; "Projetos"
>    com Bocha Paralímpica, Oficina Mão na Roda, Artesão da Inclusão e Informática Nota 10.
>    Cada item leva à página daquele serviço.
> 6. **"Quem responde pela associação"** — bloco com fundo `#f7f8f9`, borda `#e2e5e9` e raio de
>    10px, contendo:
>    - o nome "Luiz Carlos Lucas Barbosa", o cargo "Presidente", e duas ou três linhas
>      **estritamente institucionais**: exerce a presidência como trabalho voluntário, estuda
>      Serviço Social para atuar melhor na associação, e trabalha como palestrante e na busca de
>      parceiros e colaboradores para ampliar os atendimentos;
>    - um espaço reservado de retrato, quadrado, neutro, **sem foto**, com a legenda "Foto
>      `[A CONFIRMAR]` — publicar só com autorização por escrito";
>    - a linha "Diretoria: `[A CONFIRMAR]`";
>    - e, ao final do bloco, um aviso com fundo `#fdf3e3`, borda esquerda de 4px em `#7a4a10`,
>      ícone textual e texto escuro: "`[A CONFIRMAR]` — o site atual publica também o histórico
>      de saúde do presidente. Isso é dado sensível pelo Art. 11 da LGPD e não foi republicado
>      aqui. A associação decide, por escrito, o que quer publicar."
>
>    **Regra dura: não escreva nesta tela nenhuma informação de saúde de nenhuma pessoa** — nada
>    de acidente, lesão, diagnóstico, tratamento, internação, data clínica ou nome de familiar,
>    nem em legenda, nem em texto de exemplo.
>
> 7. **"Documentos e transparência"** — lista de linhas com o nome do documento à esquerda e o
>    status à direita, com rótulo textual além da cor: "Regimento interno — Abrir (PDF)", que é
>    o único que já existe hoje; "Estatuto — `[A CONFIRMAR]`"; "Prestação de contas —
>    `[A CONFIRMAR]`"; "Pessoas atendidas por ano — `[A CONFIRMAR]`". Abaixo, em bloco de
>    superfície: CNPJ 08.074.883/0001-96, Inscrição Municipal 154.420, Utilidade Pública nº
>    7.477/08, e o endereço Rua Acássia Pereira 136, Campos dos Alemães, São José dos Campos/SP,
>    CEP 12239-530. Não use ícone de alerta vermelho nas pendências — é pendência, não erro.
> 8. **"Missão, visão e valores"** — bloco pequeno com a frase honesta "Ainda não publicados
>    como declaração. `[A CONFIRMAR]`" e o desenho de como ficará: três subtítulos com um
>    parágrafo cada. Não escreva missão, visão nem valores inventados.
> 9. **"Quer ajudar?"** — dois caminhos lado a lado no desktop e empilhados no mobile:
>    "Ser voluntário", com uma linha sobre o que a associação aceita ("Áreas aceitas:
>    `[A CONFIRMAR]`") e botão primário preenchido "Quero ser voluntário" levando ao contato com
>    esse assunto já marcado; e "Doar", com botão contornado "Ver como doar" levando à Central
>    de Doações. Uma ação preenchida só.
> 10. **Rodapé** em `#14161a` com texto branco, igual ao da home.
>
> Acessibilidade como requisito de layout: um único `h1`; hierarquia de headings sem pular
> nível; foco visível com anel de 3px `#0f4c93` e 2px de folga; alvos de no mínimo 44px com 8px
> de folga; nada sinalizado apenas por cor; texto não justificado; largura de linha entre 60 e
> 75 caracteres; nada abaixo de 15px; nenhum texto sobre imagem.
>
> Renderize estas três telas:
>
> 1. **Versão publicável hoje** — com todas as marcações `[A CONFIRMAR]` no lugar.
> 2. **Versão com tudo confirmado** — a mesma página com diretoria listada em quatro nomes
>    genéricos de exemplo, estatuto e prestação de contas como links de PDF, e missão, visão e
>    valores preenchidos com texto genérico de exemplo. Quero ver quanto a página melhora
>    quando a associação responder — e quero ver se as marcações somem sem deixar buraco de
>    espaçamento.
> 3. **Mobile em 360px** da versão publicável hoje.

---

## Aceite visual

- [ ] Nenhuma informação de saúde de nenhuma pessoa, em nenhum lugar da tela.
- [ ] Nenhum nome de familiar do presidente.
- [ ] O bloco do presidente tem cargo e atuação institucional, e o aviso `[A CONFIRMAR]` sobre a
      decisão da associação.
- [ ] O espaço de retrato está vazio e legendado, sem foto.
- [ ] "Pessoa com deficiência" em todo lugar; "portadora" não aparece nenhuma vez.
- [ ] CNPJ, Inscrição Municipal e Utilidade Pública aparecem sem precisar rolar até o rodapé.
- [ ] O regimento interno é o único documento com link real; os outros três estão marcados.
- [ ] Missão, visão e valores não foram inventados.
- [ ] Voluntariado tem entrada visível e leva ao contato com o assunto já marcado.
- [ ] Só existe uma ação preenchida na página.
- [ ] Nenhuma linha do tempo, nenhum contador animado, nenhuma foto de banco de imagem.
- [ ] Em 360px a leitura continua confortável, sem rolagem horizontal.

## Se sair errado

- **Voltou o histórico clínico** (ou uma versão "suavizada" dele): reprovação dura. Gere de novo
  com "nenhuma informação de saúde de nenhuma pessoa nesta tela, nem resumida".
- **Apareceu foto de pessoa com deficiência em pose inspiracional**: peça "remova toda imagem de
  pessoa; o espaço de retrato do presidente fica vazio e legendado".
- **Virou página de ONG genérica** (valores com ícones, linha do tempo, número gigante): peça
  "remova a grade de valores com ícones, a linha do tempo e a estatística destacada; esta página
  é texto e documento".
- **Missão e visão vieram escritas**: reprovação de conteúdo. Peça o bloco com "Ainda não
  publicados como declaração. `[A CONFIRMAR]`".
- **As pendências viraram alertas vermelhos**: peça "pendência não é erro; use rótulo textual
  `[A CONFIRMAR]` em bloco neutro".
