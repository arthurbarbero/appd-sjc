---
version: alpha
name: 'APPD-SJC'
description: 'Institucional, direto e legível. Contraste alto, formas retas, nada decorativo na frente do conteúdo.'
colors:
  background: '#ffffff'
  on-background: '#1a1a1a'
  surface: '#f5f2ea'
  outline: '#8d7158'
  primary: '#8b0000'
  on-primary: '#ffffff'
  secondary: '#4e5d2e'
  on-secondary: '#ffffff'
typography:
  display:
    fontFamily: 'Atkinson Hyperlegible Next'
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1.15
  headline-lg:
    fontFamily: 'Atkinson Hyperlegible Next'
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
  headline-md:
    fontFamily: 'Atkinson Hyperlegible Next'
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
  body-lg:
    fontFamily: 'Atkinson Hyperlegible Next'
    fontSize: 19px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: 'Atkinson Hyperlegible Next'
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.6
  label-sm:
    fontFamily: 'Atkinson Hyperlegible Next'
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.4
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
components:
  button-primary:
    backgroundColor: '#8b0000'
    typography: '{typography.body-md}'
    rounded: 0px
    height: 48px
  button-secondary:
    backgroundColor: transparent
    typography: '{typography.body-md}'
    rounded: 0px
    height: 48px
---

# Design System: APPD-SJC

Fonte de verdade da marca para o site novo da **Associação das Pessoas com Deficiência
de São José dos Campos**. Lido pelo Claude Design e pelo Claude Code.

Extraído do site atual com `brandmd` em 2026-08-05 e **auditado contra WCAG 2.2 AA**. O
que passou foi mantido; o que reprovou foi ajustado, e cada ajuste está justificado
abaixo. Nada aqui é escolha estética solta: ou veio da marca, ou veio de um requisito de
acessibilidade.

## Princípio que decide empate

Quando legibilidade e estética discordarem, **legibilidade ganha**. Este é o site de uma
associação de pessoas com deficiência: se a pessoa não consegue ler, o site falhou, por
mais bonito que esteja.

---

## Cores

### O que foi herdado e passou

| Token        | Hex       | Papel                  | Contraste            |
| ------------ | --------- | ---------------------- | -------------------- |
| `--primaria` | `#8b0000` | Ação principal, marca  | 10,01:1 com branco   |
| `--verde`    | `#4e5d2e` | Institucional, rodapé  | 7,17:1 com branco    |
| `--amarelo`  | `#bbb070` | Superfície de destaque | 7,92:1 com `#1a1a1a` |
| `--laranja`  | `#724923` | Aviso                  | 7,80:1 com branco    |
| `--fundo`    | `#ffffff` | Fundo da página        | —                    |

### O que reprovou e foi ajustado

| Herdado   | Ajustado  | Motivo                                                                                                                             |
| --------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `#b8a28e` | `#8d7158` | Borda a 2,44:1 no branco — reprova o mínimo de 3:1 para componente de interface. Escurecido até 4,53:1, mantendo o matiz.          |
| `#000000` | `#1a1a1a` | Preto puro sobre branco puro a 21:1 causa fadiga e cintilação para parte dos leitores. `#1a1a1a` entrega 17,4:1, folga suficiente. |

### Regra dura do amarelo

`#bbb070` com **texto branco dá 2,20:1** — reprova qualquer critério. O amarelo só
aceita texto escuro (`#1a1a1a`, 7,92:1). Nenhuma exceção, nenhum "só nesse título".

### Paleta completa

```css
:root {
  /* base */
  --fundo: #ffffff;
  --superficie: #f5f2ea; /* neutro quente, derivado do amarelo da marca */
  --texto: #1a1a1a;
  --texto-suave: #5b5347; /* 7,57:1 no fundo; 6,77:1 na superfície */
  --borda: #8d7158; /* borda com significado: campo, tabela, card */
  --borda-suave: #aa9078; /* 3,01:1 — só divisória decorativa */

  /* marca */
  --primaria: #8b0000;
  --sobre-primaria: #ffffff;
  --verde: #4e5d2e;
  --sobre-verde: #ffffff;
  --amarelo: #bbb070;
  --sobre-amarelo: #1a1a1a;

  /* semântica — todas derivadas da própria marca */
  --erro: #8b0000;
  --erro-fundo: #fdecea;
  --sucesso: #4e5d2e;
  --sucesso-fundo: #eef2e6;
  --aviso: #724923;
  --aviso-fundo: #f9f0e5;

  /* link */
  --link: #0000ee; /* herdado, 9,40:1 — ver ressalva */
  --link-visitado: #551a8b;

  /* foco */
  --foco: #8b0000;
  --foco-sobre-escuro: #ffffff;
}
```

### Ressalva sobre o azul de link

`#0000ee` é o azul padrão do navegador para links não estilizados. Passa em contraste
(9,40:1), então foi mantido, **mas provavelmente não é uma decisão de marca — é ausência
de decisão**. Revisar no canvas. Se mudar, o substituto precisa de 4,5:1 no fundo branco
e ainda ser reconhecível como link.

### O conflito vermelho: ação e erro na mesma cor

`#8b0000` é a cor primária herdada e também a cor natural de erro. Sem regra, o botão
"Doar" fica igual a uma mensagem de falha. A regra:

- **Ação** é vermelho **preenchido**, texto branco, sem borda.
- **Erro** é texto vermelho sobre `--erro-fundo`, com **borda esquerda de 4px e ícone**,
  nunca preenchido.
- **Ação destrutiva** (excluir conta) é vermelho **contornado**, fundo transparente.

Os três nunca se confundem porque diferem em forma, não só em cor — que é exatamente o
que o critério 1.4.1 exige.

---

## Tipografia

### Uma família, escolhida por um motivo

**Atkinson Hyperlegible Next** (SIL OFL, gratuita) em todo o site. Foi desenhada pelo
Braille Institute justamente para leitores com baixa visão: diferencia caracteres que
outras fontes confundem — `I` maiúsculo, `l` minúsculo e `1`; `O` e `0`; `rn` e `m`.
Num site de uma associação de pessoas com deficiência, essa é a escolha óbvia, e é uma
escolha, não um default.

Auto-hospedada no repositório (custo zero, sem CDN externo, sem rastreamento de terceiro
e sem depender de rede alheia).

```css
--fonte:
  'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible', system-ui, -apple-system, 'Segoe UI',
  Roboto, sans-serif;
```

### O que foi descartado do site atual, e por quê

| Herdado                    | Decisão                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lobster** (títulos)      | Sai da interface. Script decorativa reprova em legibilidade para baixa visão e dislexia. Permanece **apenas dentro da logo**, que é imagem. |
| **Comic Sans MS**          | Sai. Aparecia em 8 elementos, sem papel definido.                                                                                           |
| **6 famílias simultâneas** | Vira 1. Arial, Open Sans Condensed, Avenir Heavy e Times New Roman eram acúmulo de anos de edição no Wix, não sistema.                      |
| **Legenda de 10px**        | Vira 15px. 10px é ilegível para o público-alvo — e o corpo do site sobe para 17px.                                                          |

### Escala

| Papel         | Tamanho            | Peso | Entrelinha | Uso                           |
| ------------- | ------------------ | ---- | ---------- | ----------------------------- |
| `display`     | clamp(30px → 44px) | 700  | 1,15       | `h1` de página                |
| `headline-lg` | clamp(26px → 32px) | 700  | 1,2        | `h2` de seção                 |
| `headline-md` | 24px               | 700  | 1,3        | `h3`                          |
| `body-lg`     | 19px               | 400  | 1,6        | texto de abertura             |
| `body-md`     | **17px**           | 400  | 1,6        | texto corrente (piso do site) |
| `label-sm`    | 15px               | 700  | 1,4        | rótulo, legenda (piso duro)   |

Dois pesos apenas: 400 e 700 — como no site atual. Nada abaixo de 15px em lugar nenhum.
Largura de linha entre 60 e 75 caracteres. Nenhum texto justificado (o rio de espaços
atrapalha leitor com dislexia). `text-wrap: balance` nos títulos.

---

## Espaçamento e forma

A escala herdada era ruído — 3, 6, 7, 9, 10, 13, 16 e 38px sem lógica. Substituída por
uma escala de base 8:

`4 · 8 · 16 · 24 · 32 · 48 · 64 · 96`

**Cantos retos, raio 0** em tudo. Isso veio do site atual e é mantido de propósito:
diferencia a marca do arredondamento genérico e não custa nada em acessibilidade.

**Sem sombra.** A hierarquia vem de contraste e borda, como já era.

### Alvos de toque

Mínimo **44 × 44px** em qualquer elemento clicável (WCAG 2.2, critério 2.5.8). Na
prática: botão e campo com 48px de altura, checkbox e rádio com área de toque de 44px
incluindo o rótulo, e 8px de folga entre alvos vizinhos.

---

## Foco e estados

O indicador de foco é parte do produto, não detalhe:

```css
:focus-visible {
  outline: 3px solid var(--foco);
  outline-offset: 2px;
}
```

Sobre fundo vermelho ou verde, o anel vira branco (`--foco-sobre-escuro`). Nunca
`outline: none` sem substituto visível. O foco tem 10,01:1 no fundo branco e 4,56:1
sobre o amarelo — passa nos dois.

Estados obrigatórios de todo componente interativo: repouso, foco, sobrevoo, pressionado,
desabilitado e carregando. Desabilitado **não** é só opacidade: precisa manter 3:1 e
dizer por que está desabilitado.

---

## Movimento

O site atual usa animação por `requestAnimationFrame`. No site novo, movimento é
funcional: transição de 150–200ms em mudança de estado, nada que se mova sozinho, nada
que pisque. Carrossel automático está proibido.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Voz

Como o site fala, e isso é design tanto quanto a cor:

- **Segunda pessoa, voz ativa.** "Preencha o cadastro", não "o cadastro deve ser
  preenchido".
- **Frase curta**, no máximo 25 palavras. O público inclui pessoas com deficiência
  intelectual e familiares idosos.
- **Sem jargão de terceiro setor**: nada de "empoderar", "protagonismo", "transformar
  vidas".
- **Sem retrato inspiracional da deficiência**: nada de "superação" ou "exemplo de
  vida".
- **"Pessoa com deficiência"**, sempre. O site atual ainda usa "portadoras de
  deficiência" no próprio título da página — termo superado. Corrigir em todo lugar.
- **Botão diz o que acontece**: "Fazer meu cadastro", não "Saiba mais".
- **Erro diz como resolver**: "O telefone precisa ter DDD e 9 dígitos", não "Campo
  inválido".

---

## Faça e não faça

**Faça**

- Use `--primaria` preenchido para a ação principal da tela — uma por tela.
- Use `--verde` para o rodapé e para marcações institucionais.
- Use `--amarelo` para destacar um aviso importante, sempre com texto escuro.
- Deixe o foco visível em tudo, o tempo todo.
- Escreva rótulo visível em todo campo. `placeholder` não é rótulo.
- Acompanhe toda cor de estado de um ícone e de um texto.

**Não faça**

- Não use texto branco sobre `--amarelo` — 2,20:1, ilegível.
- Não traga Lobster nem Comic Sans para a interface.
- Não desça abaixo de 15px, em nenhuma hipótese.
- Não sinalize nada só por cor.
- Não arredonde cantos: o raio é 0.
- Não coloque sombra para criar hierarquia — use borda e contraste.
- Não use carrossel automático nem conteúdo que se move sozinho.
- Não substitua a logo, não recomponha a logo, não mude a cor da logo.

---

## Logo

**Provisória.** O arquivo em vetor ainda não chegou (pendência P0-3). O design system
usa a versão bitmap do site atual como espaço reservado, tratada como um bloco de
tamanho fixo — trocar pelo vetor depois não deve mexer em mais nada.

A logo é intocável por decisão do dono do projeto: não recolorir, não redesenhar, não
recortar.

---

## Tema escuro

**Fora do escopo da V1.** Os tokens estão em variáveis CSS, então acrescentar depois é
barato. Não vale gastar a Fase 2 nisso enquanto a versão clara ainda não existe.

---

## Origem dos dados

`npx brandmd https://www.appd.org.br`, executado em 2026-08-05 — extração local, sem
custo e sem cota. Saída bruta e auditoria de contraste refeitas a cada mudança de marca.
