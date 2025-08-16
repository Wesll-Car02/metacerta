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

// Generate weekly predictions based on start weight, goal and number of weeks
app.post('/previsoes/planejar', async (req, res) => {
  try {
    const { id_cliente, peso_atual, peso_meta, semanas, data_inicio } = req.body as {
      id_cliente: number;
      peso_atual: number;
      peso_meta: number;
      semanas: number;
      data_inicio?: string;
    };

    const startDate = data_inicio ? new Date(data_inicio) : new Date();
    const step = (peso_meta - peso_atual) / semanas;

    const entries = Array.from({ length: semanas }).map((_, i) => {
      const data_pesagem = new Date(startDate);
      data_pesagem.setDate(startDate.getDate() + (i + 1) * 7);
      return {
        id_cliente,
        data_pesagem,
        peso_previsto: peso_atual + step * (i + 1),
        peso_atual: 0,
      };
    });

    const created = await prisma.$transaction(
      entries.map((p) => prisma.previsao.create({ data: p }))
    );

    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: 'Invalid data', details: e.message });
  }
});

// Update actual weight for a prediction
app.put('/previsoes/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const previsao = await prisma.previsao.update({
      where: { id },
      data: { peso_atual: req.body.peso_atual },
    });
    res.json(previsao);
  } catch (e: any) {
    res.status(400).json({ error: 'Invalid data', details: e.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
