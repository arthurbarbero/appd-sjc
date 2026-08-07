# Design system — APPD-SJC

Implementação dos tokens e componentes descritos no [DESIGN.md](../DESIGN.md), que é a
fonte da verdade. Aqui é onde eles viram CSS de verdade e previews que a gente consegue
olhar.

## Arquivos

| Arquivo        | O que é                                                      |
| -------------- | ------------------------------------------------------------ |
| `tokens.css`   | As variáveis. Todo valor auditado contra WCAG 2.2 AA.        |
| `base.css`     | Base e componentes. Nenhum valor cru — tudo sai de variável. |
| `componentes/` | Fragmentos de preview, um por grupo.                         |
| `montar.mjs`   | Embute o CSS em cada fragmento e gera `build/`.              |
| `build/`       | Gerado, fora do git. É o que sobe para o Claude Design.      |

```bash
node docs/design-system/montar.mjs
```

Os previews precisam ser autossuficientes porque o painel do Claude Design não resolve
caminho relativo do repositório — daí o passo de embutir o CSS em vez de usar `<link>`.

## Regra ao mexer aqui

**Não altere um hex sem refazer a conta de contraste.** Todo valor de cor tem uma razão
medida anotada ao lado. Se mudar, recalcule, confirme que passa AA e atualize o
`DESIGN.md` junto — os dois arquivos não podem divergir.

Os previews usam conteúdo real da APPD (rótulos do formulário, horários de treino,
telefones publicados) de propósito: componente testado com texto de mentira esconde
problema de quebra de linha e de tamanho de alvo.

## Estado

- **Fonte**: os previews renderizam no fallback do sistema até o arquivo da Atkinson
  Hyperlegible entrar no repositório. Isso acontece na implementação (Fase 4), quando a
  fonte é auto-hospedada.
- **Logo**: bloco reservado de tamanho fixo. O arquivo em vetor é a pendência P0-3.
- **Tema escuro**: fora do escopo da V1, mas os tokens já estão em variáveis.
