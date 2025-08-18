import express from 'express';
import cors from 'cors';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, generateToken, AuthRequest } from './auth';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// User registration
app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, role, clienteId } = req.body as {
      nome: string;
      email: string;
      senha: string;
      role: Role;
      clienteId?: number;
    };
    const hashed = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: hashed, role, clienteId },
    });
    res.status(201).json(usuario);
  } catch (e: any) {
    res.status(400).json({ error: 'Invalid data', details: e.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, senha } = req.body as { email: string; senha: string };
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  const token = generateToken({ id: usuario.id, role: usuario.role, clienteId: usuario.clienteId });
  res.json({ token, role: usuario.role, clienteId: usuario.clienteId });
});

app.get('/clientes', authenticate, async (req: AuthRequest, res) => {
  if (req.user?.role === 'TREINADOR') {
    const clientes = await prisma.cliente.findMany({
      where: { treinadorId: req.user.id },
      include: { objetivo: true, previsoes: true },
    });
    return res.json(clientes);
  }
  if (req.user?.clienteId) {
    const cliente = await prisma.cliente.findUnique({
      where: { id: req.user.clienteId },
      include: { objetivo: true, previsoes: true },
    });
    return res.json(cliente ? [cliente] : []);
  }
  res.json([]);
});

app.post('/clientes', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    if (req.user?.role === 'TREINADOR') {
      data.treinadorId = req.user.id;
    }
    const cliente = await prisma.cliente.create({ data });
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

app.get('/previsoes', authenticate, async (req: AuthRequest, res) => {
  if (req.user?.role === 'TREINADOR') {
    const previsoes = await prisma.previsao.findMany({
      where: { cliente: { treinadorId: req.user.id } },
      include: { cliente: true },
    });
    return res.json(previsoes);
  }
  if (req.user?.clienteId) {
    const previsoes = await prisma.previsao.findMany({
      where: { id_cliente: req.user.clienteId },
      include: { cliente: true },
    });
    return res.json(previsoes);
  }
  res.json([]);
});

app.post('/previsoes', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    if (req.user?.role === 'CLIENTE' && req.user.clienteId) {
      data.id_cliente = req.user.clienteId;
    } else if (req.user?.role === 'TREINADOR') {
      const cliente = await prisma.cliente.findFirst({
        where: { id: data.id_cliente, treinadorId: req.user.id },
      });
      if (!cliente) return res.status(403).json({ error: 'Sem acesso ao cliente' });
    }
    const previsao = await prisma.previsao.create({ data });
    res.status(201).json(previsao);
  } catch (e: any) {
    res.status(400).json({ error: 'Invalid data', details: e.message });
  }
});

// Generate weekly predictions based on start weight, goal and number of weeks
app.post('/previsoes/planejar', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id_cliente, peso_atual, peso_meta, semanas, data_inicio } = req.body as {
      id_cliente?: number;
      peso_atual: number;
      peso_meta: number;
      semanas: number;
      data_inicio?: string;
    };
    const clientId = req.user?.role === 'CLIENTE' ? req.user.clienteId : id_cliente;
    if (!clientId) {
      return res.status(400).json({ error: 'id_cliente required' });
    }
    if (req.user?.role === 'TREINADOR') {
      const cliente = await prisma.cliente.findFirst({
        where: { id: clientId, treinadorId: req.user.id },
      });
      if (!cliente) return res.status(403).json({ error: 'Sem acesso ao cliente' });
    }
    const startDate = data_inicio ? new Date(data_inicio) : new Date();
    const step = (peso_meta - peso_atual) / semanas;

    const entries = Array.from({ length: semanas }).map((_, i) => {
      const data_pesagem = new Date(startDate);
      data_pesagem.setDate(startDate.getDate() + (i + 1) * 7);
      return {
        id_cliente: clientId,
        data_pesagem,
        peso_previsto: Number((peso_atual + step * (i + 1)).toFixed(2)),
        peso_atual: null,
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
app.put('/previsoes/:id', authenticate, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);

  try {
    const raw = req.body?.peso_atual;

    // aceita null/undefined para limpar a medição
    const pesoAtual =
      raw === null || raw === undefined || raw === ''
        ? null
        : Math.round(Number(raw) * 100) / 100;

    if (pesoAtual !== null && !Number.isFinite(pesoAtual)) {
      return res.status(400).json({ error: 'Invalid peso_atual' });
    }

    const existing = await prisma.previsao.findUnique({ include: { cliente: true }, where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (
      req.user?.role === 'CLIENTE' && existing.id_cliente !== req.user.clienteId
    ) {
      return res.status(403).json({ error: 'Sem acesso' });
    }
    if (
      req.user?.role === 'TREINADOR' && existing.cliente.treinadorId !== req.user.id
    ) {
      return res.status(403).json({ error: 'Sem acesso' });
    }
    const previsao = await prisma.previsao.update({
      where: { id },
      data: { peso_atual: pesoAtual },
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
