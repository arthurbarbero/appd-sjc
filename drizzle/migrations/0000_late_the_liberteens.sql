CREATE TABLE `consentimentos` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`termo_id` text NOT NULL,
	`versao` text NOT NULL,
	`hash` text NOT NULL,
	`evento` text NOT NULL,
	`registrado_em` text NOT NULL,
	`origem` text NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "consentimentos_evento" CHECK("consentimentos"."evento" IN ('aceite', 'revogacao')),
	CONSTRAINT "consentimentos_hash_formato" CHECK(length("consentimentos"."hash") = 64 AND "consentimentos"."hash" NOT GLOB '*[^0-9a-f]*'),
	CONSTRAINT "consentimentos_registrado_em_utc" CHECK(length("consentimentos"."registrado_em") = 20
    AND "consentimentos"."registrado_em" LIKE '____-__-__T__:__:__Z'
    AND "consentimentos"."registrado_em" NOT GLOB '*[^0-9:TZ-]*')
);
--> statement-breakpoint
CREATE INDEX `consentimentos_busca` ON `consentimentos` (`usuario_id`,`termo_id`,`registrado_em`);--> statement-breakpoint
CREATE TABLE `fotos` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`conteudo` blob NOT NULL,
	`tipo` text NOT NULL,
	`largura` integer NOT NULL,
	`altura` integer NOT NULL,
	`criado_em` text NOT NULL,
	`atualizado_em` text NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "fotos_tamanho" CHECK(length("fotos"."conteudo") <= 102400),
	CONSTRAINT "fotos_tipo" CHECK("fotos"."tipo" = 'image/jpeg'),
	CONSTRAINT "fotos_dimensoes" CHECK("fotos"."largura" = 400 AND "fotos"."altura" = 500),
	CONSTRAINT "fotos_criado_em_utc" CHECK(length("fotos"."criado_em") = 20
    AND "fotos"."criado_em" LIKE '____-__-__T__:__:__Z'
    AND "fotos"."criado_em" NOT GLOB '*[^0-9:TZ-]*'),
	CONSTRAINT "fotos_atualizado_em_utc" CHECK(length("fotos"."atualizado_em") = 20
    AND "fotos"."atualizado_em" LIKE '____-__-__T__:__:__Z'
    AND "fotos"."atualizado_em" NOT GLOB '*[^0-9:TZ-]*')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fotos_usuario_id_unique` ON `fotos` (`usuario_id`);--> statement-breakpoint
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
	CONSTRAINT "inscricoes_deficiencias_json" CHECK(json_valid("inscricoes_atendimento"."deficiencias") AND json_type("inscricoes_atendimento"."deficiencias") = 'array' AND json_array_length("inscricoes_atendimento"."deficiencias") >= 1),
	CONSTRAINT "inscricoes_atendimentos_json" CHECK(json_valid("inscricoes_atendimento"."atendimentos") AND json_type("inscricoes_atendimento"."atendimentos") = 'array' AND json_array_length("inscricoes_atendimento"."atendimentos") >= 1),
	CONSTRAINT "inscricoes_dias_json" CHECK(json_valid("inscricoes_atendimento"."dias") AND json_type("inscricoes_atendimento"."dias") = 'array' AND json_array_length("inscricoes_atendimento"."dias") >= 1),
	CONSTRAINT "inscricoes_outro_tamanho" CHECK(("inscricoes_atendimento"."deficiencia_outro" IS NULL OR length("inscricoes_atendimento"."deficiencia_outro") BETWEEN 2 AND 100)
        AND ("inscricoes_atendimento"."atendimento_outro" IS NULL OR length("inscricoes_atendimento"."atendimento_outro") BETWEEN 2 AND 100)),
	CONSTRAINT "inscricoes_criado_em_utc" CHECK(length("inscricoes_atendimento"."criado_em") = 20
    AND "inscricoes_atendimento"."criado_em" LIKE '____-__-__T__:__:__Z'
    AND "inscricoes_atendimento"."criado_em" NOT GLOB '*[^0-9:TZ-]*'),
	CONSTRAINT "inscricoes_atualizado_em_utc" CHECK(length("inscricoes_atendimento"."atualizado_em") = 20
    AND "inscricoes_atendimento"."atualizado_em" LIKE '____-__-__T__:__:__Z'
    AND "inscricoes_atendimento"."atualizado_em" NOT GLOB '*[^0-9:TZ-]*')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inscricoes_atendimento_usuario_id_unique` ON `inscricoes_atendimento` (`usuario_id`);--> statement-breakpoint
CREATE TABLE `tentativas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chave_hash` text NOT NULL,
	`escopo` text NOT NULL,
	`criado_em` text NOT NULL,
	CONSTRAINT "tentativas_escopo" CHECK("tentativas"."escopo" IN ('inscricao', 'verificacao', 'login')),
	CONSTRAINT "tentativas_chave_formato" CHECK(length("tentativas"."chave_hash") = 64 AND "tentativas"."chave_hash" NOT GLOB '*[^0-9a-f]*'),
	CONSTRAINT "tentativas_criado_em_utc" CHECK(length("tentativas"."criado_em") = 20
    AND "tentativas"."criado_em" LIKE '____-__-__T__:__:__Z'
    AND "tentativas"."criado_em" NOT GLOB '*[^0-9:TZ-]*')
);
--> statement-breakpoint
CREATE INDEX `tentativas_busca` ON `tentativas` (`chave_hash`,`escopo`,`criado_em`);--> statement-breakpoint
CREATE TABLE `usuarios` (
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
	CONSTRAINT "usuarios_numero_registro_formato" CHECK(length("usuarios"."numero_registro") = 15
    AND "usuarios"."numero_registro" LIKE 'APPD-____-_____'
    AND "usuarios"."numero_registro" NOT GLOB '*[^A-Z0-9-]*'),
	CONSTRAINT "usuarios_situacao" CHECK("usuarios"."situacao" IN ('ativo', 'inativo')),
	CONSTRAINT "usuarios_email_normalizado" CHECK("usuarios"."email" IS NULL OR ("usuarios"."email" = lower("usuarios"."email") AND "usuarios"."email" = trim("usuarios"."email"))),
	CONSTRAINT "usuarios_cpf_digitos" CHECK("usuarios"."cpf" IS NULL OR (length("usuarios"."cpf") = 11 AND "usuarios"."cpf" NOT GLOB '*[^0-9]*')),
	CONSTRAINT "usuarios_nome_tamanho" CHECK("usuarios"."nome" IS NULL OR length("usuarios"."nome") BETWEEN 2 AND 120),
	CONSTRAINT "usuarios_nascimento_formato" CHECK("usuarios"."nascimento" IS NULL OR (length("usuarios"."nascimento") = 10
    AND "usuarios"."nascimento" LIKE '____-__-__'
    AND "usuarios"."nascimento" NOT GLOB '*[^0-9-]*')),
	CONSTRAINT "usuarios_telefone_digitos" CHECK("usuarios"."telefone" IS NULL OR ("usuarios"."telefone" NOT GLOB '*[^0-9]*' AND length("usuarios"."telefone") IN (10, 11))),
	CONSTRAINT "usuarios_whatsapp" CHECK("usuarios"."telefone_whatsapp" IS NULL OR "usuarios"."telefone_whatsapp" IN ('Sim', 'Não')),
	CONSTRAINT "usuarios_endereco_tamanho" CHECK("usuarios"."endereco" IS NULL OR length("usuarios"."endereco") BETWEEN 3 AND 300),
	CONSTRAINT "usuarios_numero_tamanho" CHECK("usuarios"."numero" IS NULL OR length("usuarios"."numero") BETWEEN 1 AND 20),
	CONSTRAINT "usuarios_complemento_tamanho" CHECK("usuarios"."complemento" IS NULL OR length("usuarios"."complemento") <= 60),
	CONSTRAINT "usuarios_bairro_tamanho" CHECK("usuarios"."bairro" IS NULL OR length("usuarios"."bairro") BETWEEN 2 AND 80),
	CONSTRAINT "usuarios_municipio_tamanho" CHECK("usuarios"."municipio" IS NULL OR length("usuarios"."municipio") BETWEEN 2 AND 80),
	CONSTRAINT "usuarios_cuidador_nome_tamanho" CHECK("usuarios"."cuidador_nome" IS NULL OR length("usuarios"."cuidador_nome") <= 120),
	CONSTRAINT "usuarios_cuidador_contato_digitos" CHECK("usuarios"."cuidador_contato" IS NULL OR ("usuarios"."cuidador_contato" NOT GLOB '*[^0-9]*' AND length("usuarios"."cuidador_contato") IN (10, 11))),
	CONSTRAINT "usuarios_criado_em_utc" CHECK(length("usuarios"."criado_em") = 20
    AND "usuarios"."criado_em" LIKE '____-__-__T__:__:__Z'
    AND "usuarios"."criado_em" NOT GLOB '*[^0-9:TZ-]*'),
	CONSTRAINT "usuarios_atualizado_em_utc" CHECK(length("usuarios"."atualizado_em") = 20
    AND "usuarios"."atualizado_em" LIKE '____-__-__T__:__:__Z'
    AND "usuarios"."atualizado_em" NOT GLOB '*[^0-9:TZ-]*'),
	CONSTRAINT "usuarios_ativo_completo" CHECK("usuarios"."situacao" = 'inativo' OR (
        "usuarios"."email" IS NOT NULL AND "usuarios"."cpf" IS NOT NULL AND "usuarios"."senha_hash" IS NOT NULL
        AND "usuarios"."senha_params" IS NOT NULL AND "usuarios"."nome" IS NOT NULL
        AND "usuarios"."nascimento" IS NOT NULL AND "usuarios"."telefone" IS NOT NULL
        AND "usuarios"."telefone_whatsapp" IS NOT NULL AND "usuarios"."endereco" IS NOT NULL
        AND "usuarios"."numero" IS NOT NULL AND "usuarios"."bairro" IS NOT NULL AND "usuarios"."municipio" IS NOT NULL
      ))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_numero_registro_unique` ON `usuarios` (`numero_registro`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_cpf_unique` ON `usuarios` (`cpf`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_chave_idempotencia_unique` ON `usuarios` (`chave_idempotencia`);