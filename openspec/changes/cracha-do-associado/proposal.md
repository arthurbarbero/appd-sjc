# Proposal: Crachá do associado e verificação pública

- ID: PROP-20260805-cracha-do-associado Status: em discussão
- Origem: decisão do dono em 2026-08-05, materializada nos prompts de design
  [cracha.md](../../../docs/prompts-design/cracha.md) e
  [verificacao-cracha.md](../../../docs/prompts-design/verificacao-cracha.md);
  rota já prevista em [arquitetura-informacao.md](../../../docs/arquitetura-informacao.md)
- Autor do registro: Claude Code (especificador) · Dono do conteúdo: Arthur Barbero
- Data: 2026-08-05 Versão: v1 · Nível da régua: **Grande**

## Motivação (por quê)

Hoje a APPD não tem como provar que alguém é associado. Isso produz dois problemas
concretos:

1. **O associado não tem documento.** Quem chega na sede, ou quem precisa se identificar
   num serviço parceiro, depende da memória de quem atende. Não existe número, não existe
   crachá, não existe nada que a pessoa leve no bolso.
2. **O doador não tem como conferir.** A associação capta doação por telefone com agente
   que recolhe presencialmente (risco R4 em
   [pendencias-appd.md](../../../docs/pendencias-appd.md)). Sem uma página pública de
   conferência, qualquer pessoa pode bater na porta de um doador dizendo que é da APPD.

O crachá resolve os dois com o mesmo artefato: um documento que a pessoa gera sozinha e um
endereço público onde qualquer um confere o número — sem que a conferência exponha um único
dado a mais do que nome, número e situação.

## Escopo (o que entra)

- **Número de registro** no formato `APPD-<ano>-<sequencial de 5 dígitos>`, único e
  imutável, gerado no momento em que o cadastro é concluído.
- **Foto obrigatória**, enviada, recortada em 4:5 e comprimida **no navegador da pessoa**
  (canvas, 400 × 500 px, JPEG qualidade 0,75, teto rígido de 100 KB), armazenada como
  BLOB no D1 atrás da interface `ArmazenamentoFoto`.
- **Rota autenticada de foto**, servindo o BLOB só para a própria pessoa dona da foto.
- **Tela `/area/cracha`** com os seis estados desenhados: sem foto, recortando, processando,
  erro de foto grande demais, crachá pronto (frente e verso) e pré-visualização de impressão.
- **Exportação PNG e PDF geradas no navegador**, sem servidor de renderização e sem
  serviço externo.
- **QR Code** apontando para `/verificar/<numero_registro>`, com o endereço também escrito
  por extenso no verso.
- **Página pública `/verificar/<numero_registro>`** mostrando **apenas nome, número e
  situação**, com consulta manual por campo de texto.
- **Opt-in do tipo de deficiência no crachá**: caixa de seleção separada, desmarcada por
  padrão, texto neutro, efeito restrito ao crachá impresso.
- Critérios de acessibilidade WCAG 2.2 AA como aceite bloqueante das duas telas.

## Fora de escopo (o que NÃO entra)

- **Autenticação, sessão, cadastro e senha** — são da change `cadastro-e-login`. Esta
  change consome a sessão pronta; não define login, não define recuperação de senha.
- **Consentimento do Art. 11 da LGPD e política de privacidade** — são da change
  `consentimento-e-privacidade`. Aqui só existe o opt-in de exibição no crachá, que é
  decisão de apresentação e não base legal de tratamento.
- **Aprovação prévia do crachá pela associação.** Nesta versão a liberação é imediata.
  Não há fila de análise, não há status "em revisão", não há painel de moderação.
- **Painel administrativo** para emitir, revogar ou inativar crachá em massa — fica na
  change `painel-admin`.
- **Impressão física pela associação**, envio por correio, cartão em PVC.
- **Assinatura digital, certificado ICP-Brasil, holograma ou qualquer selo de segurança**.
  O documento se prova pela página de verificação, não por enfeite impresso.
- **Busca por nome, listagem de associados ou API pública de consulta em lote.**
- **Substituição de documento oficial com foto** — o crachá diz isso no próprio verso.

## Impacto

- **Toca dado sensível?** Sim, por tabela: o tipo de deficiência (campo 12 de
  [campos-formulario.md](../../../docs/campos-formulario.md), Art. 11 da LGPD) pode ser
  impresso no crachá mediante opt-in, e a foto é dado pessoal biométrico de fato. Por isso
  a verificação pública é o requisito mais duro da change e tem gate de revisão próprio.
- **Toca custo real?** Não. Recorte, compressão e exportação rodam no navegador; storage é
  o D1 do free tier. Nenhum serviço externo, nenhum método de pagamento.
- **Arquitetura afetada?** Sim, em dois pontos que precisam virar ADR:
  - **foto como BLOB no D1** em vez de object storage — o ADR-001 já aponta a lacuna
    ("ver ADR de armazenamento de foto (Fase 3)"), porque R2 exige método de pagamento
    cadastrado e isso quebra a restrição inegociável de custo zero sem cartão;
  - **liberação imediata sem aprovação prévia**, que é decisão de produto do dono.
- **Dependências**: `cadastro-e-login` (sessão e tabela de usuários),
  `consentimento-e-privacidade` (texto da política e registro do aceite), design aprovado
  no Claude Design para `/area/cracha` e `/verificar/<numero>` antes de qualquer HTML.

## Premissas e questões abertas

- Premissa: o volume da APPD é de ordem de centenas de associados, não dezenas de milhares
  — ver o cálculo de capacidade na spec (REQ-24). Se a associação informar volume maior,
  o ADR de armazenamento de foto reabre.
- Premissa: todo associado tem acesso a um aparelho capaz de tirar ou escolher uma foto.
  A alternativa humana (telefone da associação) cobre quem não tem.
- `[A CONFIRMAR]` com a APPD: se a associação quer poder inativar um crachá e por qual
  critério. Enquanto não houver resposta, a situação vem da própria situação do cadastro.
- `[A CONFIRMAR]` com a APPD: o bloco "Recebeu uma ligação da APPD?" na página de
  verificação depende da confirmação de que a captação presencial existe e como funciona.
- Questão aberta para o dono: prazo de guarda da foto após exclusão de conta — a change
  `area-do-associado` assume apagamento imediato; se o jurídico pedir retenção, muda lá.

## Próximo passo no fluxo

proposal → spec (REQ + Gherkin) → gate do revisor-spec → tasks → design aprovado →
implementação → validação item a item.
