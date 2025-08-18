-- Clean up potentially conflicting indexes from previous runs
DROP INDEX IF EXISTS "Usuario_clienteId_key";

CREATE TABLE "Objetivo" (
  "id" SERIAL PRIMARY KEY,
  "descricao" TEXT NOT NULL,
  "data_cadastro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Cliente" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "data_nascimento" DATE,
  "peso" DOUBLE PRECISION,
  "altura" DOUBLE PRECISION,
  "id_objetivo" INTEGER REFERENCES "Objetivo"("id"),
  "status" BOOLEAN NOT NULL DEFAULT TRUE,
  "data_cadastro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "percent_gordura" DOUBLE PRECISION,
  "percent_massa" DOUBLE PRECISION
);

CREATE TABLE "Previsao" (
  "id" SERIAL PRIMARY KEY,
  "data_cadastro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_pesagem" DATE NOT NULL,
  "id_cliente" INTEGER REFERENCES "Cliente"("id") ON DELETE CASCADE,
  "peso_atual" DOUBLE PRECISION NOT NULL,
  "peso_previsto" DOUBLE PRECISION NOT NULL
);

CREATE INDEX "Previsao_cliente_idx" ON "Previsao" ("id_cliente");
