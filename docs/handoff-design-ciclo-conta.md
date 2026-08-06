# Handoff das telas do ciclo de conta — 2026-08-06

Telas geradas pelo dono no Claude Design e lidas do projeto `appd-sjc`
(`templates/entrar/Entrar.dc.html` e `templates/area/Area.dc.html`) via DesignSync.

**Aprovadas.** O que segue são as correções que a implementação aplica — todas por
regra escrita do projeto, nenhuma por gosto. Registradas porque handoff que se corrige
em silêncio vira divergência que ninguém sabe explicar seis meses depois.

## O que veio certo, e vale dizer

- **Login com os sete estados**, incluindo os dois que nasceram do ADR-005: "Entrando…"
  com o aviso de que pode demorar em celular antigo, e o bloco de "sem JavaScript" com o
  telefone da secretaria em destaque igual, não como letra miúda.
- **Área com oito estados**, com a exclusão em página mais modal, o modal com
  `role="dialog"`, `aria-modal` e `aria-labelledby`, e o botão preenchido sendo
  **Cancelar**, não o destrutivo.
- **A nota de implementação do modal** ficou no próprio layout: foco nunca começa no
  botão de excluir, `Esc` fecha sem apagar, foco preso e devolvido ao fechar.
- Tipo de deficiência **não aparece** no crachá nem em Meus dados, com a linha que
  explica onde consultar. É o REQ-5 de `area-do-associado` respeitado no desenho.

## Correção 1 — fontes por CDN do Google

As duas telas trazem `<link>` para `fonts.googleapis.com`. **Não vai para o código.**

Carregar fonte do Google entrega o IP de cada visitante a um terceiro, sem base legal e
sem o visitante saber. Num site de associação de pessoas com deficiência, o IP diz que
aquela pessoa visitou **este** site. O projeto já usa Fontsource com a Atkinson
Hyperlegible servida do próprio domínio — foi decidido na Fase 2 e vale aqui.

É a mesma correção do handoff anterior; o canvas volta a gerar CDN porque não sabe da
decisão. Não é erro do dono.

## Correção 2 — as opções dos campos não são as do formulário oficial

A tela "Corrigir meu cadastro" gerou opções inventadas. `CLAUDE.md` proíbe alterar os 15
campos, e `docs/campos-formulario.md` é a réplica fiel. O que vale:

| Campo               | O canvas gerou                                                   | O que vale (formulário oficial)                                                                               |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Tipo de deficiência | Física · Visual · Auditiva · Intelectual                         | Física · Intelectual ou Neurodivergentes · **Sensorial (visão, audição, fala)** · **Outro**                   |
| Tipo de atendimento | Fisioterapia · Serviço Social · Psicologia · Orientação jurídica | **Empréstimo Equipamentos** · Fisioterapia · **Orientações Gerais** · Psicologia · Serviço Social · **Outro** |
| Melhores dias       | Segunda a sexta                                                  | Segundas a Sextas · **Qualquer Dia da Semana**                                                                |

Três diferenças que importam:

1. **"Orientação jurídica" não existe** no catálogo da APPD. Publicar um serviço que a
   associação não oferece é promessa que ela vai ter de desmentir no telefone.
2. **"Sensorial (visão, audição, fala)" é uma opção só**, não duas. Separar em visual e
   auditiva muda a pergunta que a associação faz.
3. **"Outro" falta nos dois grupos**, e é o que abre o campo de texto livre — é por ele
   que alguém pede Bocha ou Informática, que não estão na lista (pendência 1b da APPD).

Marcar "Outro" torna o campo de especificação obrigatório (D7 da spec).

## Correção 3 — rótulo dos dias

O canvas usou "Segunda-feira"; o formulário oficial usa "Segundas". Diferença pequena e
mesmo assim vale a regra: os rótulos são réplica fiel, e a lista é validada caractere a
caractere contra `docs/campos-formulario.md` no teste do schema.

## O que a implementação aproveita como está

Estrutura, hierarquia, espaçamento, ordem dos blocos, copy de tudo que não é opção de
campo, os estados e as marcações de acessibilidade. O layout é o do canvas.
