/**
 * Implementação de `ArmazenamentoFoto` sobre BLOB no D1.
 *
 * É a **única** parte do servidor que conhece a tabela `fotos`. Rota nenhuma consulta
 * `schema.fotos` direto — se alguém precisar, o lugar de acrescentar é aqui, senão a
 * interface do REQ-15 vira decoração e trocar de meio volta a custar o projeto inteiro.
 *
 * A escolha do BLOB, e não do R2, está no
 * [ADR-003](../../docs/adr/adr-003-foto-do-cracha-como-blob-no-d1.md): R2 exige método de
 * pagamento e o projeto roda a custo zero.
 */

import { eq } from 'drizzle-orm'
import type { ArmazenamentoFoto, FotoGravada } from '~~/shared/foto'
import { TIPO_ARMAZENADO } from '~~/shared/foto'
import type { Banco } from './bd'

const agora = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

/** Devolve bytes venha o D1 com `Uint8Array`, com `ArrayBuffer` ou com array de números. */
function paraBytes(valor: unknown): Uint8Array {
  if (valor instanceof Uint8Array) return valor
  if (valor instanceof ArrayBuffer) return new Uint8Array(valor)
  if (Array.isArray(valor)) return Uint8Array.from(valor as number[])
  return new Uint8Array()
}

export function armazenamentoFoto(bd: Banco): ArmazenamentoFoto {
  return {
    async gravar(usuarioId, foto) {
      const instante = agora()
      // Uma foto por pessoa: `usuario_id` é UNIQUE, e reenviar substitui em vez de
      // acumular. Sem isso, cada tentativa de recorte deixaria lixo de 100 KB no banco.
      await bd
        .insert(schema.fotos)
        .values({
          id: crypto.randomUUID(),
          usuarioId,
          conteudo: foto.conteudo,
          tipo: foto.tipo,
          largura: foto.largura,
          altura: foto.altura,
          criadoEm: instante,
          atualizadoEm: instante,
        })
        .onConflictDoUpdate({
          target: schema.fotos.usuarioId,
          set: {
            conteudo: foto.conteudo,
            tipo: foto.tipo,
            largura: foto.largura,
            altura: foto.altura,
            atualizadoEm: instante,
          },
        })
    },

    async ler(usuarioId) {
      const linha = await bd.query.fotos.findFirst({
        where: eq(schema.fotos.usuarioId, usuarioId),
      })
      if (!linha) return null
      return {
        conteudo: paraBytes(linha.conteudo),
        tipo: linha.tipo ?? TIPO_ARMAZENADO,
        largura: linha.largura,
        altura: linha.altura,
      } satisfies FotoGravada
    },

    async apagar(usuarioId) {
      await bd.delete(schema.fotos).where(eq(schema.fotos.usuarioId, usuarioId))
    },
  }
}
