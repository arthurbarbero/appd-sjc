/**
 * `GET /api/cep/<cep>` — consulta de endereço por CEP, para preencher o formulário.
 *
 * **Por que passa pelo nosso servidor em vez de o navegador chamar direto.** O ViaCEP é
 * gratuito e não exige chave, então chamar do navegador seria mais simples — e entregaria
 * a cada consulta o **IP do visitante** a um terceiro, junto com o CEP dele. Num site de
 * associação de pessoas com deficiência, esse par diz que alguém daquela região visitou
 * **este** site. É a mesma razão que tirou as fontes do Google do projeto.
 *
 * Do lado do ViaCEP chega o IP do Worker, não o da pessoa.
 *
 * Custo: zero. O ViaCEP é serviço público, sem cadastro e sem cartão.
 */

const CEP_VALIDO = /^\d{8}$/

export default defineEventHandler(async (event) => {
  const cep = String(getRouterParam(event, 'cep') ?? '').replace(/\D/g, '')

  if (!CEP_VALIDO.test(cep)) {
    throw createError({ statusCode: 400, data: { mensagem: 'CEP precisa ter 8 dígitos.' } })
  }

  try {
    const r = await $fetch<{
      erro?: boolean | string
      logradouro?: string
      bairro?: string
      localidade?: string
      uf?: string
    }>(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 4000 })

    // O ViaCEP responde 200 com `{ "erro": true }` para CEP inexistente.
    if (!r || r.erro) return { encontrado: false }

    return {
      encontrado: true,
      endereco: r.logradouro ?? '',
      bairro: r.bairro ?? '',
      municipio: r.localidade ?? '',
      uf: r.uf ?? '',
    }
  } catch {
    // Serviço fora do ar não pode travar o cadastro: a pessoa digita à mão.
    return { encontrado: false, indisponivel: true }
  }
})
