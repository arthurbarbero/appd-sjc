/**
 * A busca de endereço por CEP, compartilhada entre o formulário de atendimento e
 * `/area/dados`.
 *
 * Estava copiada nas duas telas, com o comentário "mesma regra da tela de inscrição" numa
 * delas — que é a forma de duas cópias anunciarem que vão divergir. Ao mudar a regra em
 * 2026-08-21 as duas precisariam mudar junto, e é aqui que elas passam a mudar de uma vez.
 *
 * ## A regra mudou, e mudou de lado
 *
 * Até aqui a busca preenchia **só campo vazio**, para não apagar o que a pessoa digitou. A
 * associação pediu o contrário, e o dono confirmou: **CEP novo substitui rua, bairro,
 * município e estado**.
 *
 * As duas regras são defensáveis, e a diferença é quem preenche. Para quem preenche o
 * próprio cadastro em casa, o CEP é a última coisa que digita, e substituir apagaria o que
 * ela acabou de escrever. Para o atendente que confere o endereço com a pessoa na frente, o
 * CEP é a primeira, e o que estava lá é justamente o que se quer trocar.
 *
 * ## Por que "quando muda", e não "toda vez"
 *
 * Substituir a cada busca faria o campo se apagar sozinho: sair do CEP e voltar dispara a
 * busca de novo, e a correção que a pessoa acabou de digitar na rua desapareceria sem que
 * ninguém tivesse pedido. Guardar qual CEP preencheu o endereço da última vez limita a
 * substituição ao caso em que a pessoa **trocou o CEP** — que é o caso que a associação
 * descreveu.
 */

export interface EnderecoDoCep {
  encontrado: boolean
  indisponivel?: boolean
  endereco?: string
  bairro?: string
  municipio?: string
  uf?: string
}

/** Os quatro campos que a busca preenche. */
export interface CamposDeEndereco {
  endereco: string
  bairro: string
  municipio: string
  estado: string
}

export interface ResultadoDaBusca {
  /** Mensagem para a pessoa quando a busca não deu certo. Vazia quando deu. */
  aviso: string
  /** Se os campos foram trocados — o que a tela precisa anunciar em região viva. */
  substituiu: boolean
}

/**
 * Busca o CEP e preenche os campos, devolvendo o que a tela precisa dizer.
 *
 * `cepQuePreencheu` é o CEP que preencheu o endereço na última busca bem-sucedida; a função
 * o atualiza pela referência devolvida. A tela guarda esse valor entre chamadas.
 */
export async function preencherPorCep(
  cepDigitado: string,
  campos: CamposDeEndereco,
  cepQuePreencheu: string,
  buscar: (cep: string) => Promise<EnderecoDoCep>,
): Promise<ResultadoDaBusca & { cepQuePreencheu: string }> {
  const cep = cepDigitado.replace(/\D/g, '')
  if (cep.length !== 8) return { aviso: '', substituiu: false, cepQuePreencheu }

  let r: EnderecoDoCep
  try {
    r = await buscar(cep)
  } catch {
    return {
      aviso: 'A busca por CEP falhou. Preencha o endereço à mão.',
      substituiu: false,
      cepQuePreencheu,
    }
  }

  if (!r.encontrado) {
    return {
      aviso: r.indisponivel
        ? 'A busca por CEP está fora do ar. Preencha o endereço à mão.'
        : 'Não encontramos este CEP. Confira, ou preencha o endereço à mão.',
      substituiu: false,
      cepQuePreencheu,
    }
  }

  /*
    Substitui quando o CEP mudou; preenche o que estiver vazio em qualquer caso.

    O segundo caso é o do primeiro preenchimento e o de quem apagou um campo à mão — nos
    dois, não há nada a perder, e deixar em branco seria trabalho que a busca podia poupar.
  */
  const mudou = cep !== cepQuePreencheu
  let substituiu = false
  const poe = (campo: keyof CamposDeEndereco, valor?: string) => {
    if (!valor) return
    if (mudou && campos[campo].trim() && campos[campo] !== valor) substituiu = true
    if (mudou || !campos[campo].trim()) campos[campo] = valor
  }
  poe('endereco', r.endereco)
  poe('bairro', r.bairro)
  poe('municipio', r.municipio)
  // A rota já devolvia a UF desde sempre; até 2026-08-20 ninguém a usava.
  poe('estado', r.uf)

  return { aviso: '', substituiu, cepQuePreencheu: cep }
}
