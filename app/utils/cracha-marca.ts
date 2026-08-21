/**
 * O grafismo da APPD, embutido no pacote — não buscado.
 *
 * As listras azuis, o campo verde e o brasão amarelo são o que faz o cartão ser
 * reconhecido de longe como documento da associação. Eles vinham de `/marca/logo-appd.png`
 * e continuam vindo ali no resto do site; **aqui**, não podem.
 *
 * O motivo é o REQ-4 de `cracha-impresso`: a geração do PNG e do PDF acontece inteira no
 * aparelho, com **zero requisições de rede**, e o `npm run aceite` conta as requisições
 * durante a exportação para provar isso. Um `new Image()` apontando para `/marca/...` é
 * uma requisição — de mesma origem, cacheada, invisível na tela e ainda assim uma
 * requisição. O requisito quebraria sem que nada parecesse errado, que é a pior forma de
 * um requisito quebrar.
 *
 * `?inline` faz o Vite embutir o arquivo como `data:` URI no bundle. Custa ~62 KB de
 * base64 no JavaScript da página do crachá, e é o preço de a promessa continuar
 * verdadeira.
 */

import grafismo from '~/assets/marca/logo-appd.png?inline'

export const GRAFISMO_APPD: string = grafismo

/**
 * As cores do cartão de papel.
 *
 * Ficam aqui, e não em `tokens.css`, de propósito: elas **não** são do design system do
 * site. São a paleta do material impresso da associação, e o ADR-021 as declara como
 * exceção válida só para o crachá. Deixá-las nos tokens seria convidar a próxima tela a
 * usá-las.
 */
export const COR_CARTAO = {
  /** Azul da faixa superior e da moldura da foto. */
  azul: '#22357a',
  /** Verde do campo, usado nas bordas das caixas. */
  verde: '#00913f',
  /** Amarelo do brasão — só como filete, nunca como fundo de texto. */
  amarelo: '#f2c800',
  /** Texto sobre as caixas claras. */
  texto: '#14161a',
  /** Rótulo pequeno acima do valor. */
  rotulo: '#41474f',
  /** Fundo das caixas: branco quase opaco, para o grafismo aparecer sem prejudicar a leitura. */
  caixa: 'rgba(255, 255, 255, 0.93)',
  /** Situação ativa e não-ativa, nos mesmos tons do resto do site. */
  ok: '#2f5116',
  atencao: '#7a4a10',
} as const
