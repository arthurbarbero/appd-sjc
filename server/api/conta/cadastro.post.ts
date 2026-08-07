/**
 * `POST /api/conta/cadastro` — o envio do formulário de atendimento.
 *
 * Grava **três linhas numa transação só** (`formulario-atendimento` REQ-1): a conta em
 * `usuarios`, os interesses em `inscricoes_atendimento` e o aceite do Art. 11 em
 * `consentimentos`. Falhou uma, nenhuma fica.
 *
 * O que **não** está aqui, de propósito: a foto. Ela é a única parte fora da transação
 * (REQ-7f), porque perder o cadastro inteiro porque a foto falhou é o pior negócio
 * possível para quem preencheu 18 campos.
 */

import { eq } from 'drizzle-orm'
import { esquemaInscricao } from '~~/shared/inscricao'
import { SENHA_MINIMO, normalizaEmail } from '~~/shared/senha'

/** Converte `dd/mm/aaaa` para o `aaaa-mm-dd` que o banco exige. */
function paraDataIso(brasileira: string): string {
  const [dia, mes, ano] = brasileira.split('/')
  return `${ano}-${mes}-${dia}`
}

/**
 * Limite de cadastros por hora, por hash de IP (REQ-4, REQ-22).
 *
 * Doze é folgado para o uso real — uma família cadastrando várias pessoas do mesmo
 * aparelho cabe — e apertado para o que se quer impedir: um laço criando conta em série,
 * cada uma consumindo linha no D1 e um número de registro.
 *
 * O IP nunca é gravado em claro: a chave é `HMAC-SHA-256` (`server/utils/limite.ts`).
 * Guardar o IP de quem procura uma associação de pessoas com deficiência seria produzir
 * exatamente o registro que este mecanismo existe para não criar.
 */
const LIMITE = { escopo: 'inscricao', maximo: 12, janelaSegundos: 3600 } as const

/**
 * Teto do corpo, **derivado dos campos**, não chutado.
 *
 * Todo campo de texto do schema tem `.max()`, e a soma deles com o overhead de JSON fica
 * abaixo de 4 KB. Os 16 KB daqui são o dobro do dobro disso: nunca recusam um cadastro
 * legítimo e cortam qualquer tentativa de mandar volume.
 *
 * Sem os `.max()` do schema este número seria consolo — o corpo passaria, seria
 * transformado e só então recusado. A ordem certa é: teto barato aqui, limite por campo lá.
 */
const MAXIMO_CORPO = 16 * 1024

export default defineEventHandler(async (event) => {
  const bd = usarBanco(event)

  const bruto = await readRawBody(event, false)
  if (bruto && bruto.length > MAXIMO_CORPO) {
    throw createError({
      statusCode: 413,
      statusMessage: 'O envio é maior que o esperado para este formulário.',
    })
  }

  const { excedeu } = await registrarTentativa(event, bd, ipDoPedido(event), LIMITE)
  if (excedeu) {
    throw createError({
      statusCode: 429,
      data: {
        erros: {
          formulario:
            'Muitos cadastros seguidos deste aparelho. Espere um pouco e tente de novo, ou ligue para a associação.',
        },
      },
    })
  }

  const corpo = JSON.parse(new TextDecoder().decode(bruto ?? new Uint8Array()) || '{}')

  // O servidor revalida tudo com o mesmo schema do cliente (REQ-9). O que a tela
  // conferiu não conta: quem chama a API direto não passou por tela nenhuma.
  //
  // `chaveDerivada` sai antes de validar, e `senha` entra como preenchimento: o schema é
  // `.strict()` e é compartilhado com o cliente, onde o campo é a senha digitada. Aqui a
  // senha nunca chega — o que chega é a chave já derivada no navegador (ADR-005).
  const chave = typeof corpo?.chaveDerivada === 'string' ? corpo.chaveDerivada : ''
  const { chaveDerivada: _ignorada, ...camposDoFormulario } = corpo ?? {}
  const validado = esquemaInscricao.safeParse({
    ...camposDoFormulario,
    senha: 'x'.repeat(SENHA_MINIMO),
  })
  if (!validado.success || !/^[0-9a-f]{64}$/.test(chave)) {
    const erros: Record<string, string> = {}
    for (const p of validado.success ? [] : validado.error.issues) {
      erros[String(p.path[0] ?? 'formulario')] = p.message
    }
    if (!/^[0-9a-f]{64}$/.test(chave)) {
      erros.senha = 'Não foi possível preparar sua senha no navegador. Tente de novo.'
    }
    throw createError({ statusCode: 422, data: { erros } })
  }

  const d = validado.data
  const email = normalizaEmail(d.email)
  const agora = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

  // Idempotência (REQ-24): o mesmo envio repetido devolve o que já foi criado, sem
  // criar segunda conta. É o clique duplo e a retentativa depois de erro de rede.
  const jaEnviado = await bd.query.usuarios.findFirst({
    where: eq(schema.usuarios.chaveIdempotencia, d.chaveIdempotencia),
    columns: { numeroRegistro: true },
  })
  if (jaEnviado) {
    setResponseStatus(event, 200)
    return { numeroRegistro: jaEnviado.numeroRegistro, recebidoEm: agora }
  }

  const senha = prepararSenha(chave)
  const id = crypto.randomUUID()

  const numeroRegistro = await emitirNumeroRegistro(anoCorrente(), async (numero) => {
    try {
      // Transação lógica: o D1 executa `batch` como unidade atômica.
      await bd.batch([
        bd.insert(schema.usuarios).values({
          id,
          numeroRegistro: numero,
          email,
          cpf: d.cpf,
          senhaHash: senha.hash,
          senhaParams: senha.params,
          nome: d.nome,
          nascimento: paraDataIso(d.nascimento),
          telefone: d.telefone,
          telefoneWhatsapp: d.telefoneWhatsapp,
          cep: d.cep,
          endereco: d.endereco,
          numero: d.numero,
          complemento: d.complemento ?? null,
          bairro: d.bairro,
          municipio: d.municipio,
          cuidadorNome: d.cuidadorNome ?? null,
          cuidadorContato: d.cuidadorContato ?? null,
          situacao: 'ativo',
          chaveIdempotencia: d.chaveIdempotencia,
          criadoEm: agora,
          atualizadoEm: agora,
        }),
        bd.insert(schema.inscricoesAtendimento).values({
          id: crypto.randomUUID(),
          usuarioId: id,
          deficiencias: JSON.stringify(d.deficiencias),
          deficienciaOutro: d.deficienciaOutro ?? null,
          atendimentos: JSON.stringify(d.atendimentos),
          atendimentoOutro: d.atendimentoOutro ?? null,
          dias: JSON.stringify(d.dias),
          cienciaContribuicao: 'Ciente',
          status: 'Interesse registrado',
          criadoEm: agora,
          atualizadoEm: agora,
        }),
        bd.insert(schema.consentimentos).values({
          id: crypto.randomUUID(),
          usuarioId: id,
          termoId: 'deficiencia-art11',
          versao: 'v1',
          // Placeholder até o catálogo de termos existir (ADR-006). O formato é o
          // definitivo — 64 hexadecimais — para não mascarar erro de schema.
          hash: '0'.repeat(64),
          evento: 'aceite',
          registradoEm: agora,
          origem: '/atendimento/inscricao',
        }),
      ])
      return true
    } catch (erro) {
      const texto = String(erro)
      // Colisão do número: tenta o próximo. Qualquer outra coisa é erro de verdade.
      if (texto.includes('numero_registro')) return false
      if (texto.includes('usuarios.email')) {
        throw createError({
          statusCode: 422,
          data: {
            erros: {
              email: 'Este e-mail já tem uma conta. Entre ou recupere a sua senha.',
            },
          },
        })
      }
      if (texto.includes('usuarios.cpf')) {
        throw createError({
          statusCode: 422,
          data: { erros: { cpf: 'Já existe um cadastro com este CPF.' } },
        })
      }
      throw erro
    }
  })

  await abrirSessao(event, {
    id,
    numeroRegistro,
    primeiroNome: d.nome.split(' ')[0] ?? d.nome,
    emitidaEm: agora,
  })

  setResponseStatus(event, 201)
  return { numeroRegistro, recebidoEm: agora }
})
