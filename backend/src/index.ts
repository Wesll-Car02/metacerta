import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/clientes', async (_req, res) => {
  const clientes = await prisma.cliente.findMany({
    include: { objetivo: true, previsoes: true }
  });
  res.json(clientes);
});

app.post('/clientes', async (req, res) => {
  try {
    const cliente = await prisma.cliente.create({ data: req.body });
    res.status(201).json(cliente);
  } catch (e: any) {
    res.status(400).json({ error: 'Invalid data', details: e.message });
  }
});

app.get('/objetivos', async (_req, res) => {
  const objetivos = await prisma.objetivo.findMany();
  res.json(objetivos);
});

app.post('/objetivos', async (req, res) => {
  try {
    const objetivo = await prisma.objetivo.create({ data: req.body });
    res.status(201).json(objetivo);
  } catch (e: any) {
    res.status(400).json({ error: 'Invalid data', details: e.message });
  }
});

app.get('/previsoes', async (_req, res) => {
  const previsoes = await prisma.previsao.findMany({ include: { cliente: true } });
  res.json(previsoes);
});

app.post('/previsoes', async (req, res) => {
  try {
    const previsao = await prisma.previsao.create({ data: req.body });
    res.status(201).json(previsao);
  } catch (e: any) {
    res.status(400).json({ error: 'Invalid data', details: e.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
