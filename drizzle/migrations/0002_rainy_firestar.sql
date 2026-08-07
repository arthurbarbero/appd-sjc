PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_usuarios` (
	`id` text PRIMARY KEY NOT NULL,
	`numero_registro` text NOT NULL,
	`email` text,
	`cpf` text,
	`senha_hash` text,
	`senha_params` text,
	`nome` text,
	`nascimento` text,
	`telefone` text,
	`telefone_whatsapp` text,
	`cep` text,
	`endereco` text,
	`numero` text,
	`complemento` text,
	`bairro` text,
	`municipio` text,
	`cuidador_nome` text,
	`cuidador_contato` text,
	`situacao` text DEFAULT 'ativo' NOT NULL,
	`chave_idempotencia` text,
	`criado_em` text NOT NULL,
	`atualizado_em` text NOT NULL,
	CONSTRAINT "usuarios_numero_registro_formato" CHECK(length("__new_usuarios"."numero_registro") = 16
    AND "__new_usuarios"."numero_registro" LIKE 'APPD-____-______'
    AND "__new_usuarios"."numero_registro" NOT GLOB '*[^A-Z0-9-]*'
    AND substr("__new_usuarios"."numero_registro", 11, 6) NOT GLOB '*[^A-Z2-9]*'),
	CONSTRAINT "usuarios_situacao" CHECK("__new_usuarios"."situacao" IN ('ativo', 'inativo')),
	CONSTRAINT "usuarios_email_normalizado" CHECK("__new_usuarios"."email" IS NULL OR ("__new_usuarios"."email" = lower("__new_usuarios"."email") AND "__new_usuarios"."email" = trim("__new_usuarios"."email"))),
	CONSTRAINT "usuarios_cpf_digitos" CHECK("__new_usuarios"."cpf" IS NULL OR (length("__new_usuarios"."cpf") = 11 AND "__new_usuarios"."cpf" NOT GLOB '*[^0-9]*')),
	CONSTRAINT "usuarios_nome_tamanho" CHECK("__new_usuarios"."nome" IS NULL OR length("__new_usuarios"."nome") BETWEEN 2 AND 120),
	CONSTRAINT "usuarios_nascimento_formato" CHECK("__new_usuarios"."nascimento" IS NULL OR (length("__new_usuarios"."nascimento") = 10
    AND "__new_usuarios"."nascimento" LIKE '____-__-__'
    AND "__new_usuarios"."nascimento" NOT GLOB '*[^0-9-]*')),
	CONSTRAINT "usuarios_telefone_digitos" CHECK("__new_usuarios"."telefone" IS NULL OR ("__new_usuarios"."telefone" NOT GLOB '*[^0-9]*' AND length("__new_usuarios"."telefone") IN (10, 11))),
	CONSTRAINT "usuarios_whatsapp" CHECK("__new_usuarios"."telefone_whatsapp" IS NULL OR "__new_usuarios"."telefone_whatsapp" IN ('Sim', 'Não')),
	CONSTRAINT "usuarios_cep_digitos" CHECK("__new_usuarios"."cep" IS NULL OR (length("__new_usuarios"."cep") = 8 AND "__new_usuarios"."cep" NOT GLOB '*[^0-9]*')),
	CONSTRAINT "usuarios_endereco_tamanho" CHECK("__new_usuarios"."endereco" IS NULL OR length("__new_usuarios"."endereco") BETWEEN 3 AND 300),
	CONSTRAINT "usuarios_numero_tamanho" CHECK("__new_usuarios"."numero" IS NULL OR length("__new_usuarios"."numero") BETWEEN 1 AND 20),
	CONSTRAINT "usuarios_complemento_tamanho" CHECK("__new_usuarios"."complemento" IS NULL OR length("__new_usuarios"."complemento") <= 60),
	CONSTRAINT "usuarios_bairro_tamanho" CHECK("__new_usuarios"."bairro" IS NULL OR length("__new_usuarios"."bairro") BETWEEN 2 AND 80),
	CONSTRAINT "usuarios_municipio_tamanho" CHECK("__new_usuarios"."municipio" IS NULL OR length("__new_usuarios"."municipio") BETWEEN 2 AND 80),
	CONSTRAINT "usuarios_cuidador_nome_tamanho" CHECK("__new_usuarios"."cuidador_nome" IS NULL OR length("__new_usuarios"."cuidador_nome") <= 120),
	CONSTRAINT "usuarios_cuidador_contato_digitos" CHECK("__new_usuarios"."cuidador_contato" IS NULL OR ("__new_usuarios"."cuidador_contato" NOT GLOB '*[^0-9]*' AND length("__new_usuarios"."cuidador_contato") IN (10, 11))),
	CONSTRAINT "usuarios_criado_em_utc" CHECK(length("__new_usuarios"."criado_em") = 20
    AND "__new_usuarios"."criado_em" LIKE '____-__-__T__:__:__Z'
    AND "__new_usuarios"."criado_em" NOT GLOB '*[^0-9:TZ-]*'),
	CONSTRAINT "usuarios_atualizado_em_utc" CHECK(length("__new_usuarios"."atualizado_em") = 20
    AND "__new_usuarios"."atualizado_em" LIKE '____-__-__T__:__:__Z'
    AND "__new_usuarios"."atualizado_em" NOT GLOB '*[^0-9:TZ-]*'),
	CONSTRAINT "usuarios_ativo_completo" CHECK("__new_usuarios"."situacao" = 'inativo' OR (
        "__new_usuarios"."email" IS NOT NULL AND "__new_usuarios"."cpf" IS NOT NULL AND "__new_usuarios"."senha_hash" IS NOT NULL
        AND "__new_usuarios"."senha_params" IS NOT NULL AND "__new_usuarios"."nome" IS NOT NULL
        AND "__new_usuarios"."nascimento" IS NOT NULL AND "__new_usuarios"."telefone" IS NOT NULL
        AND "__new_usuarios"."telefone_whatsapp" IS NOT NULL AND "__new_usuarios"."endereco" IS NOT NULL
        AND "__new_usuarios"."numero" IS NOT NULL AND "__new_usuarios"."bairro" IS NOT NULL AND "__new_usuarios"."municipio" IS NOT NULL
        AND "__new_usuarios"."cep" IS NOT NULL
      ))
);
--> statement-breakpoint
-- ATENÇÃO — linha corrigida à mão.
--
-- O drizzle-kit gerou `SELECT ... "cep" ... FROM usuarios`, mas `usuarios` ainda não tem
-- essa coluna: ela está nascendo nesta migration. O SQLite não recusa — pela regra de
-- compatibilidade dele, um identificador desconhecido entre aspas duplas vira **literal
-- de texto**, e cada linha copiada receberia a string 'cep' no lugar do CEP.
--
-- Aqui isso estourou no CHECK de 8 dígitos e ficou visível. Numa tabela sem restrição,
-- teria passado em silêncio e corrompido todas as linhas.
--
-- Coluna nova em tabela existente entra como NULL. Se um dia precisar de valor, o
-- preenchimento é passo declarado da migration, nunca efeito colateral de um SELECT.
INSERT INTO `__new_usuarios`("id", "numero_registro", "email", "cpf", "senha_hash", "senha_params", "nome", "nascimento", "telefone", "telefone_whatsapp", "cep", "endereco", "numero", "complemento", "bairro", "municipio", "cuidador_nome", "cuidador_contato", "situacao", "chave_idempotencia", "criado_em", "atualizado_em") SELECT "id", "numero_registro", "email", "cpf", "senha_hash", "senha_params", "nome", "nascimento", "telefone", "telefone_whatsapp", NULL, "endereco", "numero", "complemento", "bairro", "municipio", "cuidador_nome", "cuidador_contato", "situacao", "chave_idempotencia", "criado_em", "atualizado_em" FROM `usuarios`;--> statement-breakpoint
DROP TABLE `usuarios`;--> statement-breakpoint
ALTER TABLE `__new_usuarios` RENAME TO `usuarios`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_numero_registro_unique` ON `usuarios` (`numero_registro`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_cpf_unique` ON `usuarios` (`cpf`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_chave_idempotencia_unique` ON `usuarios` (`chave_idempotencia`);