/**
 * `GET /api/verificar/<numero>` — a consulta pública do crachá.
 *
 * Fatia 5 de `cracha-do-associado`. Três regras mandam nesta rota, e todas existem para
 * não ajudar quem está adivinhando número:
 *
 * 1. **Resposta idêntica** para número inexistente e para número fora de formato (REQ-29).
 *    Nada de "o formato correto é APPD-AAAA-XXXXXX": dica de formato é ajuda ao atacante.
 * 2. **A mesma consulta ao banco nos dois casos** (REQ-30), inclusive quando a entrada nem
 *    parece um número. Sem isso, o tempo de resposta conta o que a mensagem cala.
 * 3. **Projeção explícita** (REQ-28): a consulta seleciona coluna por coluna. Um
 *    `SELECT *` aqui é o vazamento a uma refatoração de distância.
 *
 * O que a página mostra está no
 * [ADR-015](../../../docs/adr/adr-015-verificacao-publica-exibe-foto-e-cuidador.md): foto,
 * nome, número, situação e contato de cuidador. **Nunca** o tipo de deficiência — campo 12,
 * dado sensível do Art. 11 —, endereço, telefone da pessoa, e-mail, CPF ou nascimento.
 */

import { eq } from 'drizzle-orm'
import { PADRAO_NUMERO_REGISTRO } from '~~/shared/registro'
import { TIPO_ARMAZENADO } from '~~/shared/foto'

/** 20 por minuto por hash de IP (REQ-33). */
const LIMITE = { escopo: 'verificacao', maximo: 20, janelaSegundos: 60 } as const

export interface RespostaVerificacao {
  encontrado: boolean
  nome?: string
  numero?: string
  situacao?: 'ativo' | 'inativo'
  cuidador?: string
  foto?: string
}

export default defineEventHandler(async (event): Promise<RespostaVerificacao> => {
  const bd = usarBanco(event)

  const { excedeu } = await registrarTentativa(event, bd, ipDoPedido(event), LIMITE)
  if (excedeu) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Muitas consultas seguidas. Espere um minuto e tente de novo.',
    })
  }

  const pedido = String(getRouterParam(event, 'numero') ?? '')

  /*
    O número mal formatado vira uma consulta que não casa com nada, em vez de um `return`
    antecipado. Parece desperdício e é o requisito: dois caminhos de código produzem dois
    tempos de resposta, e o tempo diria o que a mensagem não diz.
  */
  const numero = PADRAO_NUMERO_REGISTRO.test(pedido) ? pedido : '-'

  const [conta] = await bd
    .select({
      id: schema.usuarios.id,
      nome: schema.usuarios.nome,
      numeroRegistro: schema.usuarios.numeroRegistro,
      situacao: schema.usuarios.situacao,
      cuidadorNome: schema.usuarios.cuidadorNome,
      cuidadorContato: schema.usuarios.cuidadorContato,
    })
    .from(schema.usuarios)
    .where(eq(schema.usuarios.numeroRegistro, numero))
    .limit(1)

  if (!conta) return { encontrado: false }

  /*
    Conta excluída (REQ-28a): a anonimização apaga o nome e mantém o `numero_registro`,
    para que um crachá antigo não passe a identificar outra pessoa. Sem nome, não há foto
    nem cuidador para mostrar — os três foram apagados juntos.
  */
  const anonimizada = !conta.nome

  const foto = anonimizada ? null : await armazenamentoFoto(bd).ler(conta.id)

  setHeader(event, 'Cache-Control', 'private, no-store')

  return {
    encontrado: true,
    numero: conta.numeroRegistro,
    situacao: conta.situacao as 'ativo' | 'inativo',
    ...(anonimizada ? {} : { nome: conta.nome! }),
    ...(anonimizada || !conta.cuidadorNome
      ? {}
      : {
          cuidador: conta.cuidadorContato
            ? `${conta.cuidadorNome} — ${conta.cuidadorContato}`
            : conta.cuidadorNome,
        }),
    // Embutida na resposta, sem URL de imagem endereçável (ADR-015, correção 4 do handoff).
    ...(foto ? { foto: `data:${TIPO_ARMAZENADO};base64,${paraBase64(foto.conteudo)}` } : {}),
  }
})

function paraBase64(bytes: Uint8Array): string {
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return btoa(binario)
}
