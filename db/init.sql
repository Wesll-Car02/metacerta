-- Clean up existing objects
DROP TABLE IF EXISTS "Previsao" CASCADE;
DROP TABLE IF EXISTS "Usuario" CASCADE;
DROP TABLE IF EXISTS "Cliente" CASCADE;
DROP TABLE IF EXISTS "Objetivo" CASCADE;
DROP TYPE IF EXISTS "Role";

-- Enum for user roles
CREATE TYPE "Role" AS ENUM ('CLIENTE', 'TREINADOR');

-- Objetivo table
CREATE TABLE "Objetivo" (
  "id" SERIAL PRIMARY KEY,
  "descricao" TEXT NOT NULL,
  "data_cadastro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cliente table
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
  "percent_massa" DOUBLE PRECISION,
  "treinadorId" INTEGER
);

-- Usuario table
CREATE TABLE "Usuario" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "senha" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "clienteId" INTEGER UNIQUE
);

ALTER TABLE "Usuario"
  ADD CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId")
  REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Cliente"
  ADD CONSTRAINT "Cliente_treinadorId_fkey" FOREIGN KEY ("treinadorId")
  REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Previsao table
CREATE TABLE "Previsao" (
  "id" SERIAL PRIMARY KEY,
  "data_cadastro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_pesagem" DATE NOT NULL,
  "id_cliente" INTEGER REFERENCES "Cliente"("id") ON DELETE CASCADE,
  "peso_atual" DOUBLE PRECISION,
  "peso_previsto" DOUBLE PRECISION NOT NULL
);

CREATE INDEX "Previsao_cliente_idx" ON "Previsao" ("id_cliente");
