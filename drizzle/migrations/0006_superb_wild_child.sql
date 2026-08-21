CREATE TABLE `tmp_inscricoes` AS SELECT * FROM `inscricoes_atendimento`;--> statement-breakpoint
CREATE TABLE `tmp_fotos` AS SELECT * FROM `fotos`;--> statement-breakpoint
CREATE TABLE `tmp_consentimentos` AS SELECT * FROM `consentimentos`;--> statement-breakpoint
DELETE FROM `inscricoes_atendimento`;--> statement-breakpoint
DELETE FROM `fotos`;--> statement-breakpoint
DELETE FROM `consentimentos`;--> statement-breakpoint
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
	`estado` text,
	`pais` text,
	`cuidador_nome` text,
	`cuidador_contato` text,
	`situacao` text DEFAULT 'ativo' NOT NULL,
	`cracha_mostra_deficiencia` integer DEFAULT false NOT NULL,
	`cid` text,
	`cid_no_cracha` integer DEFAULT false NOT NULL,
	`cras` text,
	`credencial_transporte` text,
	`contato_emergencia` text,
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
	CONSTRAINT "usuarios_telefone_digitos" CHECK("__new_usuarios"."telefone" IS NULL OR (substr("__new_usuarios"."telefone", 1, 1) = '+'
    AND substr("__new_usuarios"."telefone", 2) NOT GLOB '*[^0-9]*'
    AND length("__new_usuarios"."telefone") BETWEEN 9 AND 16)),
	CONSTRAINT "usuarios_whatsapp" CHECK("__new_usuarios"."telefone_whatsapp" IS NULL OR "__new_usuarios"."telefone_whatsapp" IN ('Sim', 'Não')),
	CONSTRAINT "usuarios_cep_digitos" CHECK("__new_usuarios"."cep" IS NULL OR (length("__new_usuarios"."cep") = 8 AND "__new_usuarios"."cep" NOT GLOB '*[^0-9]*')),
	CONSTRAINT "usuarios_endereco_tamanho" CHECK("__new_usuarios"."endereco" IS NULL OR length("__new_usuarios"."endereco") BETWEEN 3 AND 300),
	CONSTRAINT "usuarios_numero_tamanho" CHECK("__new_usuarios"."numero" IS NULL OR length("__new_usuarios"."numero") BETWEEN 1 AND 20),
	CONSTRAINT "usuarios_complemento_tamanho" CHECK("__new_usuarios"."complemento" IS NULL OR length("__new_usuarios"."complemento") <= 60),
	CONSTRAINT "usuarios_bairro_tamanho" CHECK("__new_usuarios"."bairro" IS NULL OR length("__new_usuarios"."bairro") BETWEEN 2 AND 80),
	CONSTRAINT "usuarios_municipio_tamanho" CHECK("__new_usuarios"."municipio" IS NULL OR length("__new_usuarios"."municipio") BETWEEN 2 AND 80),
	CONSTRAINT "usuarios_cuidador_nome_tamanho" CHECK("__new_usuarios"."cuidador_nome" IS NULL OR length("__new_usuarios"."cuidador_nome") <= 120),
	CONSTRAINT "usuarios_cuidador_contato_digitos" CHECK("__new_usuarios"."cuidador_contato" IS NULL OR (substr("__new_usuarios"."cuidador_contato", 1, 1) = '+'
    AND substr("__new_usuarios"."cuidador_contato", 2) NOT GLOB '*[^0-9]*'
    AND length("__new_usuarios"."cuidador_contato") BETWEEN 9 AND 16)),
	CONSTRAINT "usuarios_contato_emergencia_digitos" CHECK("__new_usuarios"."contato_emergencia" IS NULL OR (substr("__new_usuarios"."contato_emergencia", 1, 1) = '+'
    AND substr("__new_usuarios"."contato_emergencia", 2) NOT GLOB '*[^0-9]*'
    AND length("__new_usuarios"."contato_emergencia") BETWEEN 9 AND 16)),
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
);--> statement-breakpoint
INSERT INTO `__new_usuarios`("id", "numero_registro", "email", "cpf", "senha_hash", "senha_params", "nome", "nascimento", "telefone", "telefone_whatsapp", "cep", "endereco", "numero", "complemento", "bairro", "municipio", "estado", "pais", "cuidador_nome", "cuidador_contato", "situacao", "cracha_mostra_deficiencia", "cid", "cid_no_cracha", "cras", "credencial_transporte", "contato_emergencia", "chave_idempotencia", "criado_em", "atualizado_em") SELECT "id", "numero_registro", "email", "cpf", "senha_hash", "senha_params", "nome", "nascimento", CASE WHEN "telefone" IS NULL OR "telefone" = '' THEN "telefone" WHEN "telefone" LIKE '+%' THEN "telefone" ELSE '+55' || "telefone" END, "telefone_whatsapp", "cep", "endereco", "numero", "complemento", "bairro", "municipio", "estado", "pais", "cuidador_nome", CASE WHEN "cuidador_contato" IS NULL OR "cuidador_contato" = '' THEN "cuidador_contato" WHEN "cuidador_contato" LIKE '+%' THEN "cuidador_contato" ELSE '+55' || "cuidador_contato" END, "situacao", "cracha_mostra_deficiencia", "cid", "cid_no_cracha", "cras", "credencial_transporte", CASE WHEN "contato_emergencia" IS NULL OR "contato_emergencia" = '' THEN "contato_emergencia" WHEN "contato_emergencia" LIKE '+%' THEN "contato_emergencia" ELSE '+55' || "contato_emergencia" END, "chave_idempotencia", "criado_em", "atualizado_em" FROM `usuarios`;--> statement-breakpoint
DROP TABLE `usuarios`;--> statement-breakpoint
ALTER TABLE `__new_usuarios` RENAME TO `usuarios`;--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_numero_registro_unique` ON `usuarios` (`numero_registro`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_cpf_unique` ON `usuarios` (`cpf`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_chave_idempotencia_unique` ON `usuarios` (`chave_idempotencia`);--> statement-breakpoint
DROP TABLE `inscricoes_atendimento`;--> statement-breakpoint
CREATE TABLE `inscricoes_atendimento` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`deficiencias` text NOT NULL,
	`deficiencia_outro` text,
	`atendimentos` text NOT NULL,
	`atendimento_outro` text,
	`dias` text NOT NULL,
	`ciencia_contribuicao` text NOT NULL,
	`status` text DEFAULT 'Interesse registrado' NOT NULL,
	`criado_em` text NOT NULL,
	`atualizado_em` text NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "inscricoes_status" CHECK("inscricoes_atendimento"."status" = 'Interesse registrado'),
	CONSTRAINT "inscricoes_ciencia" CHECK("inscricoes_atendimento"."ciencia_contribuicao" = 'Ciente'),
	CONSTRAINT "inscricoes_deficiencias_json" CHECK(json_valid("inscricoes_atendimento"."deficiencias") AND json_type("inscricoes_atendimento"."deficiencias") = 'array' AND json_array_length("inscricoes_atendimento"."deficiencias") >= 0),
	CONSTRAINT "inscricoes_atendimentos_json" CHECK(json_valid("inscricoes_atendimento"."atendimentos") AND json_type("inscricoes_atendimento"."atendimentos") = 'array' AND json_array_length("inscricoes_atendimento"."atendimentos") >= 0),
	CONSTRAINT "inscricoes_dias_json" CHECK(json_valid("inscricoes_atendimento"."dias") AND json_type("inscricoes_atendimento"."dias") = 'array' AND json_array_length("inscricoes_atendimento"."dias") >= 0),
	CONSTRAINT "inscricoes_outro_tamanho" CHECK(("inscricoes_atendimento"."deficiencia_outro" IS NULL OR length("inscricoes_atendimento"."deficiencia_outro") BETWEEN 2 AND 100)
        AND ("inscricoes_atendimento"."atendimento_outro" IS NULL OR length("inscricoes_atendimento"."atendimento_outro") BETWEEN 2 AND 100)),
	CONSTRAINT "inscricoes_criado_em_utc" CHECK(length("inscricoes_atendimento"."criado_em") = 20
    AND "inscricoes_atendimento"."criado_em" LIKE '____-__-__T__:__:__Z'
    AND "inscricoes_atendimento"."criado_em" NOT GLOB '*[^0-9:TZ-]*'),
	CONSTRAINT "inscricoes_atualizado_em_utc" CHECK(length("inscricoes_atendimento"."atualizado_em") = 20
    AND "inscricoes_atendimento"."atualizado_em" LIKE '____-__-__T__:__:__Z'
    AND "inscricoes_atendimento"."atualizado_em" NOT GLOB '*[^0-9:TZ-]*')
);--> statement-breakpoint
CREATE UNIQUE INDEX `inscricoes_atendimento_usuario_id_unique` ON `inscricoes_atendimento` (`usuario_id`);--> statement-breakpoint
INSERT INTO `inscricoes_atendimento` SELECT * FROM `tmp_inscricoes`;--> statement-breakpoint
INSERT INTO `fotos` SELECT * FROM `tmp_fotos`;--> statement-breakpoint
INSERT INTO `consentimentos` SELECT * FROM `tmp_consentimentos`;--> statement-breakpoint
DROP TABLE `tmp_inscricoes`;--> statement-breakpoint
DROP TABLE `tmp_fotos`;--> statement-breakpoint
DROP TABLE `tmp_consentimentos`;
