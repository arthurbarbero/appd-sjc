/**
 * Máscaras de digitação, compartilhadas entre o formulário de atendimento e `/area/dados`.
 *
 * Estavam declaradas dentro de `app/pages/atendimento/inscricao.vue` porque só havia uma
 * tela com campos mascarados. Ao aparecer a segunda, copiar seria repetir também o bug do
 * `aplicarMascara` documentado abaixo — que já custou uma rodada de teste do dono.
 *
 * Auto-importadas pelo Nuxt 4 (`app/utils/`).
 */

export function soDigitos(v: string) {
  return v.replace(/\D/g, '')
}

/**
 * Aplica a máscara e **devolve o valor ao input**.
 *
 * Sem a segunda parte existe um bug sutil: quando a máscara descarta o caractere
 * digitado (por já ter 11 dígitos), o valor calculado é idêntico ao anterior, o Vue não
 * vê mudança, não repinta — e o caractere a mais **fica visível no campo**. O modelo
 * fica certo e a tela mente, o que é pior do que os dois errados.
 */
export function aplicarMascara(evento: Event, mascara: (v: string) => string): string {
  const alvo = evento.target as HTMLInputElement
  const formatado = mascara(alvo.value)
  if (alvo.value !== formatado) alvo.value = formatado
  return formatado
}

export function mascaraTelefone(v: string) {
  const d = soDigitos(v).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function mascaraCep(v: string) {
  const d = soDigitos(v).slice(0, 8)
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`
}

export function mascaraCpf(v: string) {
  const d = soDigitos(v).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function mascaraData(v: string) {
  const d = soDigitos(v).slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}
