# ADR-015: a verificação pública exibe foto e contato de cuidador

Status: **Aceito, com a parte do tipo de deficiência superada** pelo
[ADR-019](adr-019-consentimento-governa-a-verificacao-publica.md) em 2026-08-07 — o opt-in
passou a governar também a página pública. O resto do ADR (foto e cuidador) continua
valendo.
Data: 2026-08-07
Decisores: Arthur Barbero (dono do projeto)

Substitui parcialmente o REQ-28 e o REQ-34 da spec `cracha-do-associado` v2.

## Contexto

A página `/verificar/<numero_registro>` é pública, sem login, aberta quase sempre pela
câmera do celular ao ler o QR Code impresso no crachá. A spec v2 a limitava a três campos
— nome, número e situação — e mandava a própria tela declarar que não mostra mais nada.

O desenho no Claude Design foi feito pelo dono com foto e contato de cuidador. Ao ser
questionado, ele manteve a decisão.

## Decisão

**A verificação pública exibe foto e, quando houver, o contato de cuidador**, além de
nome, número e situação.

**O tipo de deficiência continua fora**, por decisão do mesmo dono no mesmo dia: é dado
sensível do Art. 11 da LGPD e a exposição numa página sem autenticação não tem base legal
que a sustente. Essa parte da proteção original fica de pé, inclusive os testes que a
guardam.

## Por que não é o mesmo risco de antes

A restrição original tratava os cinco campos como uma coisa só. Não são:

**Foto.** O crachá impresso já mostra o rosto, e quem abre a página está com o crachá na
mão. Sem a foto, a verificação prova que o número existe — não que quem está na frente do
verificador é o dono dele, que é a pergunta que a página existe para responder.

**Cuidador.** É dado de uma terceira pessoa, que não usou o site e não aceitou termo
nenhum. É o item de maior custo desta decisão e está assumido abaixo.

**Tipo de deficiência.** Categoria diferente das outras duas: sensível por lei, não por
prudência. Fica fora.

O `numero_registro` é sorteado, não sequencial ([ADR-007](adr-007-numero-de-registro-sorteado.md)),
então não existe caminho de enumeração: não dá para varrer a base pedindo número após
número. O limite de 20 consultas por minuto por hash de IP (REQ-33) continua valendo, e
passa a proteger também a imagem.

## Consequências

**A favor**: a página passa a responder a pergunta real de quem escaneia. O caso de uso do
doador que recebe agente na porta — risco R4 das pendências — só fecha com rosto.

**Contra, e assumido**: o contato de cuidador vira dado público de alguém que nunca
interagiu com o site e não tem como pedir remoção pelo caminho normal do titular. **Isto
precisa entrar na conversa com a APPD** como pendência própria: o cuidador tem de ser
avisado, e o cadastro precisa oferecer à pessoa não preencher esse campo.

**Contra, e assumido**: a foto passa a ser servida em rota pública. A imagem sai só pela
rota de verificação, sem URL direta e dentro do limite de consultas — não vira arquivo
estático endereçável.

## O que muda no repositório

- `CLAUDE.md`: o inegociável "nada além de nome, número e status" é substituído por
  "nada do campo 12 (tipo de deficiência)".
- Spec `cracha-do-associado`: REQ-28 passa a admitir cinco campos; REQ-34 tira foto e
  cuidador da declaração do que a página não mostra e mantém o resto.
- `docs/prompts-design/verificacao-cracha.md`: a espinha e o prompt são reescritos.
- **Não muda**: REQ-29 e REQ-30 (resposta idêntica para número inexistente e mal
  formatado), REQ-32 (sem busca por nome), REQ-33 (limite por hash de IP) e os testes
  bloqueantes de vazamento do campo 12 — `cracha` T6.1, `area` T6.1 e `consentimento` T12.
- **Não muda** o REQ-28a: conta excluída não exibe nome, e agora também não exibe foto nem
  cuidador — os três foram apagados.
