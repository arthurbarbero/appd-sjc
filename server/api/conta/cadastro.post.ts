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
import { versaoPorHash } from '~~/shared/termos'
import { SENHA_MINIMO, normalizaEmail } from '~~/shared/senha'

/** Converte `dd/mm/aaaa` para o `aaaa-mm-dd` que o banco exige. */
function paraDataIso(brasileira: string): string {
  const [dia, mes, ano] = brasileira.split('/')
  return `${ano}-${mes}-${dia}`
}

/**
 * Limite de cadastros por hash de IP (REQ-4, REQ-22). **Contador próprio desta rota**: o
 * escopo `inscricao` não é compartilhado com a verificação nem com o login.
 *
 * O que ele impede: um laço criando conta em série, cada uma consumindo linha no D1 e um
 * número de registro.
 *
 * **Os números são um chute informado, sem medição.** O site não tem histórico de uso, e
 * não há dado sobre quantas pessoas se cadastram de uma mesma rede. Doze em quinze minutos
 * é apertado o bastante para o corte chegar em segundos num laço automatizado, e folgado
 * para o uso que se imagina — mas "se imagina" é a palavra certa, e está escrita de
 * propósito.
 *
 * **Gatilho de revisão**: aparecer relato de bloqueio indevido, o número sobe; aparecer
 * abuso que passou, desce. Sem um dos dois, mexer aqui é trocar um chute por outro.
 *
 * O IP nunca é gravado em claro: a chave é `HMAC-SHA-256` (`server/utils/limite.ts`).
 * Guardar o IP de quem procura uma associação de pessoas com deficiência seria produzir
 * exatamente o registro que este mecanismo existe para não criar.
 */
const LIMITE = { escopo: 'inscricao', maximo: 12, janelaSegundos: 900 } as const

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

  /*
    Vale o termo que foi **exibido**, não o vigente agora (`consentimento-e-privacidade`
    REQ-8). Se a versão virou entre a renderização da tela e o envio, o que a pessoa leu
    continua sendo o que ela leu — gravar a versão nova seria registrar um aceite que nunca
    aconteceu.

    Hash que não existe no catálogo é recusado: prova que ninguém consegue conferir é pior
    que campo vazio, porque o vazio se vê e o falso se acredita.
  */
  /*
    Sem deficiência marcada não há dado do Art. 11, e não há aceite a resolver.

    O esquema já garante o par (marcou deficiência => mandou autorização e hash), então
    aqui a ausência do termo é a ausência do dado, não um envio incompleto. Registrar um
    aceite mesmo assim seria escrever no livro-razão do Art. 11 uma linha sobre nada.
  */
  const exigeArt11 = d.deficiencias.length > 0
  const termo = exigeArt11 ? versaoPorHash(d.termoHash ?? '') : null
  if (exigeArt11 && !termo) {
    throw createError({
      statusCode: 422,
      data: {
        erros: {
          consentimentoSaude:
            'O termo de autorização mudou enquanto você preenchia. Recarregue a página e leia o texto novo antes de enviar.',
        },
      },
    })
  }

  /*
    O termo do CID, quando houver CID.

    Mesma exigência do termo do Art. 11, e pelo mesmo motivo: hash que não existe no
    catálogo é recusado, porque prova que ninguém consegue conferir é pior que campo
    vazio. Sem CID, nada disso acontece — o campo é opcional de verdade (ADR-020).
  */
  const termoCid = d.cid ? versaoPorHash(d.termoCidHash ?? '') : null
  if (d.cid && !termoCid) {
    throw createError({
      statusCode: 422,
      data: {
        erros: {
          consentimentoCid:
            'O termo do CID mudou enquanto você preenchia. Recarregue a página e leia o texto novo antes de enviar.',
        },
      },
    })
  }

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
          estado: d.estado,
          pais: d.pais,
          cuidadorNome: d.cuidadorNome ?? null,
          cuidadorContato: d.cuidadorContato ?? null,
          // Campos 22 a 25. O CID entra só com consentimento — garantido pelo esquema e
          // pela checagem do termo acima. `cidNoCracha` nasce falso: guardar não é imprimir.
          cid: d.cid ?? null,
          cras: d.cras ?? null,
          credencialTransporte: d.credencialTransporte ?? null,
          contatoEmergencia: d.contatoEmergencia ?? null,
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
        ...(termo
          ? [
              bd.insert(schema.consentimentos).values({
                id: crypto.randomUUID(),
                usuarioId: id,
                termoId: termo.termoId,
                versao: termo.versao,
                // SHA-256 do texto que a pessoa leu, resolvido no catálogo pelo hash que a
                // tela exibiu. Até 2026-08-07 isto era '0' repetido 64 vezes — um valor que
                // **parecia** prova e não era, o que é pior que campo vazio: o vazio se vê,
                // o falso se acredita.
                hash: termo.hash,
                evento: 'aceite',
                registradoEm: agora,
                origem: '/atendimento/inscricao',
              }),
            ]
          : []),
        /*
          O aceite do CID é **outra linha**, com `termoId` próprio.

          Não é detalhe de modelagem: é o que permite responder, anos depois, qual das duas
          autorizações a pessoa deu. Uma linha só, com o termo do Art. 11, diria que ela
          autorizou o atendimento — e calaria sobre o diagnóstico.

          `...(termoCid ? [...] : [])` porque sem CID não há aceite a registrar, e gravar
          consentimento de algo que não foi informado é ruído no histórico.
        */
        ...(termoCid
          ? [
              bd.insert(schema.consentimentos).values({
                id: crypto.randomUUID(),
                usuarioId: id,
                termoId: termoCid.termoId,
                versao: termoCid.versao,
                hash: termoCid.hash,
                evento: 'aceite',
                registradoEm: agora,
                origem: '/atendimento/inscricao',
              }),
            ]
          : []),
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
