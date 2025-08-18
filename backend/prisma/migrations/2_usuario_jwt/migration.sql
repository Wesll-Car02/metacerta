-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENTE', 'TREINADOR');

-- CreateTable
CREATE TABLE "Usuario" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senha" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "clienteId" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Usuario_clienteId_key" ON "Usuario"("clienteId");

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN "treinadorId" INTEGER;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_treinadorId_fkey" FOREIGN KEY ("treinadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
