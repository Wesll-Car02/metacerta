import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // trainer account
  const trainerEmail = 'treinador@example.com';
  const alunoEmail = 'aluno@example.com';

  const trainerPassword = await bcrypt.hash('treinador123', 10);
  const alunoPassword = await bcrypt.hash('aluno123', 10);

  const trainer = await prisma.usuario.upsert({
    where: { email: trainerEmail },
    update: {},
    create: {
      nome: 'Treinador Exemplo',
      email: trainerEmail,
      senha: trainerPassword,
      role: 'TREINADOR',
    },
  });

  const existingAluno = await prisma.usuario.findUnique({ where: { email: alunoEmail } });
  if (!existingAluno) {
    const cliente = await prisma.cliente.create({
      data: {
        nome: 'Aluno Exemplo',
        treinadorId: trainer.id,
      },
    });

    await prisma.usuario.create({
      data: {
        nome: 'Aluno Exemplo',
        email: alunoEmail,
        senha: alunoPassword,
        role: 'CLIENTE',
        clienteId: cliente.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
