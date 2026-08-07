/**
 * Schema do D1 (Drizzle) — as cinco tabelas do projeto.
 *
 * Fonte da verdade: `openspec/changes/modelo-de-dados/spec.md`. **Nenhuma outra change
 * cria, renomeia ou remove coluna daqui** (ADR-013). Precisou de coluna nova? A discussão
 * volta para aquela spec antes de virar código.
 *
 * Toda alteração vira migration versionada (`npm run db:generate`), nunca `push` direto.
 *
 * Duas convenções que valem para o arquivo inteiro:
 *
 * - **Toda restrição que o SQLite sabe expressar existe aqui** (REQ-4), não só na
 *   validação em Zod. Validação em código é camada adicional, nunca substituta: uma rota
 *   nova que esqueça o Zod ainda assim esbarra no banco.
 * - **Data e hora são TEXT em ISO-8601 UTC com sufixo `Z`** (REQ-3), conferido por GLOB.
 *   Não existe coluna de data em fuso local nem inteiro epoch.
 */

import { sql } from 'drizzle-orm'
import { blob, check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Formato de coluna de texto, expresso de um jeito que o **D1 aceita**.
 *
 * Dois limites do SQLite do D1 que só aparecem rodando, e derrubaram as duas primeiras
 * versões deste arquivo:
 *
 * 1. **Interpolar uma string JS num `sql` do Drizzle vira parâmetro**, e a migration sai
 *    com `GLOB ?`. Placeholder em arquivo de migration não roda. Daí o `sql.raw`.
 * 2. **GLOB aceita no máximo 10 classes de caractere** (`[0-9]`) por padrão; na 11ª o D1
 *    responde `LIKE or GLOB pattern too complex`. O molde de data ISO tinha 19 classes, e
 *    o do hash de HMAC teria 64.
 *
 * A saída é separar as duas perguntas: **`LIKE` com `_`** confere o formato, sem usar
 * classe nenhuma, e **um único `NOT GLOB '*[^conjunto]*'`** confere o alfabeto. Como o
 * `LIKE` do SQLite ignora caixa em ASCII e o `GLOB` não, o segundo também é o que impede
 * `appd-2026-00001` de passar por `APPD-2026-00001`.
 *
 * Detalhe que custou tempo: o `node:sqlite` dos testes é mais permissivo e aceitava os
 * padrões longos. O teste ficava verde e o banco de verdade recusava — "passou no teste" e
 * "roda no runtime" são afirmações diferentes, e aqui só a segunda importa.
 */
const formato = (coluna: unknown, tamanho: number, molde: string, conjunto: string) =>
  sql`length(${coluna}) = ${sql.raw(String(tamanho))}
    AND ${coluna} LIKE ${sql.raw(`'${molde}'`)}
    AND ${coluna} NOT GLOB ${sql.raw(`'*[^${conjunto}]*'`)}`

/** `2026-08-06T14:03:11Z` — o formato do REQ-3. */
const isoUtc = (c: unknown) => formato(c, 20, '____-__-__T__:__:__Z', '0-9:TZ-')
/** `aaaa-mm-dd`, para data de nascimento. */
const dataSimples = (c: unknown) => formato(c, 10, '____-__-__', '0-9-')
/**
 * `APPD-2026-K7M2QX` — o formato do REQ-8, sorteado e não sequencial (ADR-007).
 *
 * O conjunto exclui `0`, `O`, `1`, `I` e `L` no sufixo, porque o número é ditado por
 * telefone. O `LIKE` confere a estrutura; o `NOT GLOB` confere que nenhum caractere fora
 * do alfabeto entrou — e, sendo o GLOB sensível a caixa, também barra `appd-2026-k7m2qx`.
 */
const numeroRegistroValido = (c: unknown) =>
  sql`${formato(c, 16, 'APPD-____-______', 'A-Z0-9-')}
    AND substr(${c}, 11, 6) NOT GLOB '*[^A-Z2-9]*'`
/** Só dígitos, ou só hexadecimal minúsculo, com comprimento exato. */
const soDigitos = (c: unknown, n: number) =>
  sql`length(${c}) = ${sql.raw(String(n))} AND ${c} NOT GLOB '*[^0-9]*'`
const soHex = (c: unknown, n: number) =>
  sql`length(${c}) = ${sql.raw(String(n))} AND ${c} NOT GLOB '*[^0-9a-f]*'`

/**
 * Uma linha por **pessoa atendida**. Criada pelo envio do formulário de atendimento
 * (ADR-012): não existe tela de cadastro separada.
 *
 * Sobre as colunas de identidade serem NULL-áveis: a exclusão de conta (REQ-28) apaga
 * nome, e-mail, CPF, contato e endereço, mas **preserva o `numero_registro`** para que um
 * crachá antigo nunca passe a identificar outra pessoa. Declarar essas colunas NOT NULL
 * tornaria a exclusão impossível de executar. Em vez de afrouxar a regra, ela fica
 * condicionada à situação: enquanto a conta está `ativo`, todas são obrigatórias — é o
 * CHECK `usuarios_ativo_completo`. Some a possibilidade de existir conta ativa sem nome,
 * e continua sendo possível anonimizar.
 */
export const usuarios = sqliteTable(
  'usuarios',
  {
    id: text('id').primaryKey(),
    numeroRegistro: text('numero_registro').notNull().unique(),

    // Identidade e credenciais — apagadas na exclusão (REQ-28).
    email: text('email').unique(),
    cpf: text('cpf').unique(),
    senhaHash: text('senha_hash'),
    /** JSON com `N`, `r`, `p` e o sal. Versionado por linha para permitir re-hash. */
    senhaParams: text('senha_params'),

    // Campos 1 a 11 do formulário oficial (`docs/campos-formulario.md`).
    nome: text('nome'),
    nascimento: text('nascimento'),
    telefone: text('telefone'),
    telefoneWhatsapp: text('telefone_whatsapp'),
    cep: text('cep'),
    endereco: text('endereco'),
    numero: text('numero'),
    complemento: text('complemento'),
    bairro: text('bairro'),
    municipio: text('municipio'),
    cuidadorNome: text('cuidador_nome'),
    cuidadorContato: text('cuidador_contato'),

    situacao: text('situacao').notNull().default('ativo'),
    /**
     * Opt-in de imprimir o tipo de deficiência **no crachá** (`cracha-do-associado`
     * REQ-25 e REQ-26).
     *
     * Nasce em 0 e assim permanece até a pessoa marcar, de propósito: é a escolha de
     * expor dado sensível do Art. 11 num documento que qualquer pessoa vê. Vale
     * **exclusivamente** para o crachá renderizado e exportado — nenhum efeito em
     * `/verificar`, na área ou em resposta de API pública.
     *
     * A coluna é de `modelo-de-dados` por ADR-013, e aquela change já estava arquivada
     * quando esta precisou existir. Está registrado no `tasks.md` de lá, com a data e o
     * motivo, em vez de a tabela ganhar coluna que o contrato não menciona.
     */
    crachaMostraDeficiencia: integer('cracha_mostra_deficiencia', { mode: 'boolean' })
      .notNull()
      .default(false),
    /** UUID v4 gerado pelo cliente; dedupe de clique duplo. NULL depois da exclusão. */
    chaveIdempotencia: text('chave_idempotencia').unique(),

    criadoEm: text('criado_em').notNull(),
    atualizadoEm: text('atualizado_em').notNull(),
  },
  (t) => [
    check('usuarios_numero_registro_formato', numeroRegistroValido(t.numeroRegistro)),
    check('usuarios_situacao', sql`${t.situacao} IN ('ativo', 'inativo')`),
    // E-mail sempre normalizado (REQ-7): comparar minúsculas com maiúsculas deixaria
    // duas contas conviverem com o "mesmo" endereço.
    check(
      'usuarios_email_normalizado',
      sql`${t.email} IS NULL OR (${t.email} = lower(${t.email}) AND ${t.email} = trim(${t.email}))`,
    ),
    check('usuarios_cpf_digitos', sql`${t.cpf} IS NULL OR (${soDigitos(t.cpf, 11)})`),
    check('usuarios_nome_tamanho', sql`${t.nome} IS NULL OR length(${t.nome}) BETWEEN 2 AND 120`),
    check(
      'usuarios_nascimento_formato',
      sql`${t.nascimento} IS NULL OR (${dataSimples(t.nascimento)})`,
    ),
    check(
      'usuarios_telefone_digitos',
      sql`${t.telefone} IS NULL OR (${t.telefone} NOT GLOB '*[^0-9]*' AND length(${t.telefone}) IN (10, 11))`,
    ),
    check(
      'usuarios_whatsapp',
      sql`${t.telefoneWhatsapp} IS NULL OR ${t.telefoneWhatsapp} IN ('Sim', 'Não')`,
    ),
    // 8 dígitos, sem hífen. Guardar com máscara é guardar formatação, não dado.
    check('usuarios_cep_digitos', sql`${t.cep} IS NULL OR (${soDigitos(t.cep, 8)})`),
    check(
      'usuarios_endereco_tamanho',
      sql`${t.endereco} IS NULL OR length(${t.endereco}) BETWEEN 3 AND 300`,
    ),
    check(
      'usuarios_numero_tamanho',
      sql`${t.numero} IS NULL OR length(${t.numero}) BETWEEN 1 AND 20`,
    ),
    check(
      'usuarios_complemento_tamanho',
      sql`${t.complemento} IS NULL OR length(${t.complemento}) <= 60`,
    ),
    check(
      'usuarios_bairro_tamanho',
      sql`${t.bairro} IS NULL OR length(${t.bairro}) BETWEEN 2 AND 80`,
    ),
    check(
      'usuarios_municipio_tamanho',
      sql`${t.municipio} IS NULL OR length(${t.municipio}) BETWEEN 2 AND 80`,
    ),
    check(
      'usuarios_cuidador_nome_tamanho',
      sql`${t.cuidadorNome} IS NULL OR length(${t.cuidadorNome}) <= 120`,
    ),
    check(
      'usuarios_cuidador_contato_digitos',
      sql`${t.cuidadorContato} IS NULL OR (${t.cuidadorContato} NOT GLOB '*[^0-9]*' AND length(${t.cuidadorContato}) IN (10, 11))`,
    ),
    check('usuarios_criado_em_utc', isoUtc(t.criadoEm)),
    check('usuarios_atualizado_em_utc', isoUtc(t.atualizadoEm)),
    // O CHECK que substitui os NOT NULL: conta ativa tem tudo; conta inativa é anônima.
    check(
      'usuarios_ativo_completo',
      sql`${t.situacao} = 'inativo' OR (
        ${t.email} IS NOT NULL AND ${t.cpf} IS NOT NULL AND ${t.senhaHash} IS NOT NULL
        AND ${t.senhaParams} IS NOT NULL AND ${t.nome} IS NOT NULL
        AND ${t.nascimento} IS NOT NULL AND ${t.telefone} IS NOT NULL
        AND ${t.telefoneWhatsapp} IS NOT NULL AND ${t.endereco} IS NOT NULL
        AND ${t.numero} IS NOT NULL AND ${t.bairro} IS NOT NULL AND ${t.municipio} IS NOT NULL
        AND ${t.cep} IS NOT NULL
      )`,
    ),
  ],
)

/**
 * Uma linha por pessoa — **no máximo uma** (REQ-15). Não é histórico de pedidos: é o
 * retrato atual do que a pessoa precisa, e ela edita (ADR-014).
 *
 * `status` tem um valor só de propósito. Três valores dos quais dois são inalcançáveis é
 * ficção com cara de contrato; quando a APPD passar a operar fila, o vocabulário cresce
 * aqui e no `modelo-de-dados`, não numa spec de tela.
 */
export const inscricoesAtendimento = sqliteTable(
  'inscricoes_atendimento',
  {
    id: text('id').primaryKey(),
    usuarioId: text('usuario_id')
      .notNull()
      .unique()
      .references(() => usuarios.id, { onDelete: 'cascade' }),

    // Campos 12 a 15. Múltipla escolha como array JSON em TEXT (ADR-008 a escrever).
    deficiencias: text('deficiencias').notNull(),
    deficienciaOutro: text('deficiencia_outro'),
    atendimentos: text('atendimentos').notNull(),
    atendimentoOutro: text('atendimento_outro'),
    dias: text('dias').notNull(),
    cienciaContribuicao: text('ciencia_contribuicao').notNull(),

    status: text('status').notNull().default('Interesse registrado'),
    criadoEm: text('criado_em').notNull(),
    atualizadoEm: text('atualizado_em').notNull(),
  },
  (t) => [
    check('inscricoes_status', sql`${t.status} = 'Interesse registrado'`),
    check('inscricoes_ciencia', sql`${t.cienciaContribuicao} = 'Ciente'`),
    // json_valid + json_array_length garantem "array JSON com pelo menos um item" no
    // próprio banco: string solta e array vazio são recusados na escrita.
    check(
      'inscricoes_deficiencias_json',
      sql`json_valid(${t.deficiencias}) AND json_type(${t.deficiencias}) = 'array' AND json_array_length(${t.deficiencias}) >= 1`,
    ),
    check(
      'inscricoes_atendimentos_json',
      sql`json_valid(${t.atendimentos}) AND json_type(${t.atendimentos}) = 'array' AND json_array_length(${t.atendimentos}) >= 1`,
    ),
    check(
      'inscricoes_dias_json',
      sql`json_valid(${t.dias}) AND json_type(${t.dias}) = 'array' AND json_array_length(${t.dias}) >= 1`,
    ),
    check(
      'inscricoes_outro_tamanho',
      sql`(${t.deficienciaOutro} IS NULL OR length(${t.deficienciaOutro}) BETWEEN 2 AND 100)
        AND (${t.atendimentoOutro} IS NULL OR length(${t.atendimentoOutro}) BETWEEN 2 AND 100)`,
    ),
    check('inscricoes_criado_em_utc', isoUtc(t.criadoEm)),
    check('inscricoes_atualizado_em_utc', isoUtc(t.atualizadoEm)),
  ],
)

/**
 * Livro-razão append-only do Art. 11 da LGPD.
 *
 * A FK **não** tem `ON DELETE CASCADE`, e isso é deliberado (REQ-25): estas linhas são a
 * prova de que o tratamento teve base legal, e precisam sobreviver à exclusão da conta.
 * Depois dela apontam para uma linha anonimizada e não contêm dado sensível — só o
 * identificador do termo, a versão e o carimbo.
 *
 * Nenhuma coluna guarda IP ou user-agent (REQ-23): o registro precisa provar **o quê**,
 * **quando** e **por quem**, não de onde.
 */
export const consentimentos = sqliteTable(
  'consentimentos',
  {
    id: text('id').primaryKey(),
    usuarioId: text('usuario_id')
      .notNull()
      .references(() => usuarios.id),
    termoId: text('termo_id').notNull(),
    versao: text('versao').notNull(),
    /** SHA-256 hex do texto exibido à pessoa — prova do que ela leu, não do que existe hoje. */
    hash: text('hash').notNull(),
    evento: text('evento').notNull(),
    registradoEm: text('registrado_em').notNull(),
    origem: text('origem').notNull(),
  },
  (t) => [
    index('consentimentos_busca').on(t.usuarioId, t.termoId, t.registradoEm),
    check('consentimentos_evento', sql`${t.evento} IN ('aceite', 'revogacao')`),
    check('consentimentos_hash_formato', soHex(t.hash, 64)),
    check('consentimentos_registrado_em_utc', isoUtc(t.registradoEm)),
  ],
)

/**
 * Foto do crachá como BLOB no D1 (ADR-003) — R2 exige método de pagamento, e a restrição
 * do projeto é custo zero sem cartão.
 *
 * O teto de 102.400 bytes está no banco, não só no cliente: o recorte acontece no
 * navegador, e servidor que confia no cliente não é servidor.
 */
export const fotos = sqliteTable(
  'fotos',
  {
    id: text('id').primaryKey(),
    usuarioId: text('usuario_id')
      .notNull()
      .unique()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    conteudo: blob('conteudo').notNull(),
    tipo: text('tipo').notNull(),
    largura: integer('largura').notNull(),
    altura: integer('altura').notNull(),
    criadoEm: text('criado_em').notNull(),
    atualizadoEm: text('atualizado_em').notNull(),
  },
  (t) => [
    check('fotos_tamanho', sql`length(${t.conteudo}) <= 102400`),
    check('fotos_tipo', sql`${t.tipo} = 'image/jpeg'`),
    check('fotos_dimensoes', sql`${t.largura} = 400 AND ${t.altura} = 500`),
    check('fotos_criado_em_utc', isoUtc(t.criadoEm)),
    check('fotos_atualizado_em_utc', isoUtc(t.atualizadoEm)),
  ],
)

/**
 * Limites de frequência dos três fluxos que precisam deles.
 *
 * `chave_hash` guarda `HMAC-SHA-256(<identificador>, segredo)` — hash do **IP** em
 * `inscricao` e `verificacao`, hash do **e-mail normalizado** em `login`. Nunca o valor em
 * claro: um mecanismo antienumeração que guardasse os e-mails tentados seria ele mesmo a
 * lista que se quer proteger.
 *
 * O nome da coluna é neutro de propósito. Na primeira versão ela se chamava `ip_hash`, e
 * foi justamente isso que impediu o contador de login de ter onde morar (bloqueio B-T5-1).
 */
export const tentativas = sqliteTable(
  'tentativas',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chaveHash: text('chave_hash').notNull(),
    escopo: text('escopo').notNull(),
    criadoEm: text('criado_em').notNull(),
  },
  (t) => [
    index('tentativas_busca').on(t.chaveHash, t.escopo, t.criadoEm),
    check('tentativas_escopo', sql`${t.escopo} IN ('inscricao', 'verificacao', 'login')`),
    check('tentativas_chave_formato', soHex(t.chaveHash, 64)),
    check('tentativas_criado_em_utc', isoUtc(t.criadoEm)),
  ],
)
