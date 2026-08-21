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
      // Nascimento, que o cartão de papel traz e o nosso não trazia (ADR-021).
      nascimento: true,
      /*
        O CID, sem opt-in de impressão pelo meio (2026-08-21).

        Havia dois consentimentos — guardar e imprimir — e o dono mandou juntá-los no do
        formulário: "o CID pode entrar junto do consentimento atual existente". Quem
        autoriza guardar autoriza imprimir, e a tela do cadastro diz isso com todas as
        letras antes da caixa.

        `cidNoCracha` continua no banco e deixou de ser lido. Derrubar a coluna exigiria
        migração destrutiva por uma decisão de um dia de idade.
      */
      cid: true,
      // Campo 17 e endereço, impressos desde 2026-08-21 por decisão do dono (ADR-021).
      cpf: true,
      endereco: true,
      numero: true,
      complemento: true,
      bairro: true,
      municipio: true,
      estado: true,
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

  const foto = await armazenamentoFoto(bd).ler(sessao.id)

  setHeader(event, 'Cache-Control', 'private, no-store')

  return {
    nome: conta.nome,
    numeroRegistro: conta.numeroRegistro,
    situacao: conta.situacao as 'ativo' | 'inativo',
    mostraDeficiencia: conta.crachaMostraDeficiencia,
    deficiencias,
    /*
      O CID vai para o cartão sempre que existir. A trava que continua de pé, inteira e sem
      exceção, é a outra: `/verificar` nunca o mostra, e o teste transversal em
      `test/vazamento.spec.ts` é quem guarda isso.
    */
    cid: conta.cid,
    cpf: conta.cpf,
    /* Endereço da pessoa, como no cartão de papel. */
    enderecoPessoa: enderecoDaPessoa(conta),
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
    nascimento: conta.nascimento,
    foto: foto ? `data:${TIPO_ARMAZENADO};base64,${paraBase64(foto.conteudo)}` : null,
  }
})

/**
 * O endereço numa linha, como o cartão de papel o traz.
 *
 * Montado aqui, e não no componente, pelo mesmo motivo da queda do contato de emergência:
 * a tela e o arquivo baixado precisam mostrar exatamente a mesma coisa, e duas montagens
 * são duas chances de divergirem.
 */
function enderecoDaPessoa(c: {
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  estado: string | null
}): string {
  const rua = [c.endereco, c.numero].filter(Boolean).join(', ')
  const comComplemento = [rua, c.complemento].filter(Boolean).join(' — ')
  const cidade = [c.municipio, c.estado].filter(Boolean).join('/')
  return [comComplemento, c.bairro, cidade].filter(Boolean).join(' · ')
}

function paraBase64(bytes: Uint8Array): string {
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return btoa(binario)
}
