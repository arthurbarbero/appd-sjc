/**
 * `GET /api/area/cracha` — o que o crachá imprime, e nada além.
 *
 * Fatia 4 de `cracha-do-associado`. A projeção é a lista do REQ-20 e do REQ-21, e o
 * REQ-22 é o que ela **não** traz: endereço, telefone da pessoa, data de nascimento,
 * cuidador e e-mail ficam de fora porque não vão para o cartão.
 *
 * O tipo de deficiência só sai daqui **se a pessoa marcou o opt-in** (REQ-25). Sem a
 * marca, o campo não é consultado — a proteção está na consulta, não na disciplina de
 * quem escreve o template.
 */

import { eq } from 'drizzle-orm'
import { TIPO_ARMAZENADO } from '~~/shared/foto'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const bd = usarBanco(event)

  const conta = await bd.query.usuarios.findFirst({
    where: eq(schema.usuarios.id, sessao.id),
    columns: {
      nome: true,
      numeroRegistro: true,
      situacao: true,
      crachaMostraDeficiencia: true,
      // Campos do cartão de papel (2026-08-21). Nenhum é sensível por si.
      cras: true,
      credencialTransporte: true,
      contatoEmergencia: true,
      cuidadorNome: true,
      cuidadorContato: true,
      criadoEm: true,
      // O opt-in, não o dado: o CID só é buscado se ele estiver ligado, logo abaixo.
      cidNoCracha: true,
      /*
        O valor vem para responder **uma** pergunta — existe CID guardado? —, e não para
        ir à tela. É o que permite a área oferecer o opt-in de impressão a quem tem CID
        sem que o diagnóstico trafegue enquanto a impressão está desligada.

        Sem isto a lógica ficava circular: a tela só mostrava o controle se recebesse o
        CID, e a rota só mandava o CID se o controle já estivesse ligado.
      */
      cid: true,
    },
  })
  if (!conta) throw createError({ statusCode: 401 })

  // Só consulta o campo 12 quando ele vai ser impresso. Sem opt-in, o dado sensível não
  // chega nem a sair do banco.
  const deficiencias = conta.crachaMostraDeficiencia
    ? await bd.query.inscricoesAtendimento
        .findFirst({
          where: eq(schema.inscricoesAtendimento.usuarioId, sessao.id),
          columns: { deficiencias: true },
        })
        .then((i) => (i ? (JSON.parse(i.deficiencias) as string[]) : []))
    : []

  /*
    O CID sai do banco **só** quando vai ser impresso — mesma regra que já valia para o
    campo 12, e pelo mesmo motivo: sem opt-in, dado sensível não chega nem a ser lido.

    A diferença em relação ao campo 12 é o que acontece depois. Aquele, com opt-in, também
    aparece em `/verificar`; este nunca aparece lá, em nenhuma hipótese (ADR-020).
  */
  const cid = conta.cidNoCracha ? conta.cid : null

  const foto = await armazenamentoFoto(bd).ler(sessao.id)

  setHeader(event, 'Cache-Control', 'private, no-store')

  return {
    nome: conta.nome,
    numeroRegistro: conta.numeroRegistro,
    situacao: conta.situacao as 'ativo' | 'inativo',
    mostraDeficiencia: conta.crachaMostraDeficiencia,
    deficiencias,
    cidNoCracha: conta.cidNoCracha,
    /* Booleano, não o valor: a tela precisa saber que existe, não qual é. */
    temCid: Boolean(conta.cid),
    cid,
    cras: conta.cras,
    credencialTransporte: conta.credencialTransporte,
    /*
      Sem contato de emergência, cai para o do cuidador — é o que "contato se houver"
      quer dizer. A queda acontece aqui, e não no componente, para a tela de impressão e a
      de tela mostrarem exatamente a mesma coisa.
    */
    contatoEmergencia: conta.contatoEmergencia ?? conta.cuidadorContato,
    cuidadorNome: conta.cuidadorNome,
    emissao: conta.criadoEm,
    foto: foto ? `data:${TIPO_ARMAZENADO};base64,${paraBase64(foto.conteudo)}` : null,
  }
})

function paraBase64(bytes: Uint8Array): string {
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return btoa(binario)
}
