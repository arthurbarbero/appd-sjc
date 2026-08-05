/**
 * Schema do D1 (Drizzle). Ainda vazio de propósito.
 *
 * As tabelas nascem uma a uma, cada uma com a sua change em `openspec/changes/`:
 * `usuarios` em `cadastro-e-login`, inscrições em `formulario-atendimento`, e assim
 * por diante. Toda alteração aqui vira migration versionada (`npm run db:generate`),
 * nunca `push` direto no banco.
 *
 * A tabela `spike_ping` do spike da Fase 0 foi removida junto com a rota temporária;
 * a prova de que Drizzle + D1 funcionam está no commit b7e321d e no ADR-001.
 */
export {}
