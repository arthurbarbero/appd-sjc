/*
  Popula o D1 local com dado FICTÍCIO para desenvolvimento — `modelo-de-dados` T2.3.

  Regra que não se negocia: **nenhum dado de pessoa real entra aqui** (REQ-6). Os nomes
  são reconhecivelmente falsos, os e-mails usam o TLD reservado `.test` (RFC 2606), os
  telefones ficam na faixa 90000-000X, e os CPFs abaixo são os exemplos que circulam em
  material de teste — válidos pelo dígito verificador, atribuídos a ninguém.

  O que ele NÃO cria: foto e consentimento com hash de termo real. A foto exigiria um JPEG
  de verdade, e o hash do termo depende do catálogo que ainda não existe (ADR-006).

  Uso: node scripts/seed-local.mjs | npx wrangler d1 execute appd-sjc --local --file=-
  Ou:  npm run db:seed:local

  É idempotente: apaga o que ele mesmo criou (ids com prefixo `seed-`) antes de inserir.
*/

const AGORA = '2026-08-06T12:00:00Z'

const PESSOAS = [
  {
    id: 'seed-1',
    numero: 'APPD-2026-K7M2QX',
    email: 'maria.ficticia@exemplo.test',
    cpf: '39053344705',
    nome: 'Maria Fictícia da Silva',
    nascimento: '1978-03-12',
    telefone: '12900000001',
    whatsapp: 'Sim',
    bairro: 'Campos dos Alemães',
    deficiencias: ['Física'],
    atendimentos: ['Fisioterapia', 'Serviço Social'],
    dias: ['Segundas', 'Quartas'],
  },
  {
    id: 'seed-2',
    numero: 'APPD-2026-P4NRT9',
    email: 'joao.exemplo@exemplo.test',
    cpf: '52998224725',
    nome: 'João Exemplo de Teste',
    nascimento: '1995-11-04',
    telefone: '12900000002',
    whatsapp: 'Não',
    bairro: 'Bairro de Teste',
    deficiencias: ['Sensorial (visão, audição, fala)'],
    atendimentos: ['Orientações Gerais'],
    dias: ['Qualquer Dia da Semana'],
  },
  {
    // Conta excluída, para exercitar o estado anônimo do REQ-28 sem rodar o fluxo.
    id: 'seed-3',
    numero: 'APPD-2026-W8HXJ3',
    inativa: true,
  },
]

const aspas = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`)

const linhas = [
  '-- Dado fictício de desenvolvimento. Nenhuma pessoa real. Ver scripts/seed-local.mjs.',
  "DELETE FROM consentimentos WHERE usuario_id LIKE 'seed-%';",
  "DELETE FROM inscricoes_atendimento WHERE usuario_id LIKE 'seed-%';",
  "DELETE FROM fotos WHERE usuario_id LIKE 'seed-%';",
  "DELETE FROM usuarios WHERE id LIKE 'seed-%';",
]

for (const p of PESSOAS) {
  if (p.inativa) {
    linhas.push(
      `INSERT INTO usuarios (id, numero_registro, situacao, criado_em, atualizado_em)
       VALUES (${aspas(p.id)}, ${aspas(p.numero)}, 'inativo', ${aspas(AGORA)}, ${aspas(AGORA)});`,
    )
    continue
  }

  linhas.push(
    `INSERT INTO usuarios (id, numero_registro, email, cpf, senha_hash, senha_params, nome,
       nascimento, telefone, telefone_whatsapp, endereco, numero, bairro, municipio,
       situacao, criado_em, atualizado_em)
     VALUES (${aspas(p.id)}, ${aspas(p.numero)}, ${aspas(p.email)}, ${aspas(p.cpf)},
       'hash-ficticio-nao-e-senha', '{"N":16384,"r":8,"p":1,"sal":"ficticio"}',
       ${aspas(p.nome)}, ${aspas(p.nascimento)}, ${aspas(p.telefone)}, ${aspas(p.whatsapp)},
       'Rua Fictícia de Teste', 's/n', ${aspas(p.bairro)}, 'São José dos Campos',
       'ativo', ${aspas(AGORA)}, ${aspas(AGORA)});`,
  )

  linhas.push(
    `INSERT INTO inscricoes_atendimento (id, usuario_id, deficiencias, atendimentos, dias,
       ciencia_contribuicao, status, criado_em, atualizado_em)
     VALUES (${aspas(`insc-${p.id}`)}, ${aspas(p.id)}, ${aspas(JSON.stringify(p.deficiencias))},
       ${aspas(JSON.stringify(p.atendimentos))}, ${aspas(JSON.stringify(p.dias))},
       'Ciente', 'Interesse registrado', ${aspas(AGORA)}, ${aspas(AGORA)});`,
  )
}

process.stdout.write(linhas.join('\n') + '\n')
