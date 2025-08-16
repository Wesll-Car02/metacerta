import React from 'react';
import { Cliente } from './types';

type PlanState = {
  id_cliente: string;
  peso_atual: string;
  peso_meta: string;
  semanas: string;
  data_inicio: string;
};

type FormState = {
  id_cliente: string;
  data_pesagem: string;
  peso_atual: string;
  peso_previsto: string;
};

const Home: React.FC = () => {
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [plan, setPlan] = React.useState<PlanState>({
    id_cliente: '',
    peso_atual: '',
    peso_meta: '',
    semanas: '',
    data_inicio: '',
  });
  const [form, setForm] = React.useState<FormState>({
    id_cliente: '',
    data_pesagem: '',
    peso_atual: '',
    peso_previsto: '',
  });
  const [edits, setEdits] = React.useState<Record<number, string>>({});

  const loadClientes = async () => {
    try {
      const res = await fetch('http://localhost:3001/clientes');
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error('Erro ao carregar clientes', err);
    }
  };

  React.useEffect(() => {
    loadClientes();
  }, []);

  // Fluxo 1: Criar Plano de Peso (planejamento)
  const criarPlano = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/previsoes/planejar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: Number(plan.id_cliente),
          peso_atual: Number(plan.peso_atual),
          peso_meta: Number(plan.peso_meta),
          semanas: Number(plan.semanas),
          data_inicio: plan.data_inicio,
        }),
      });
      setPlan({ id_cliente: '', peso_atual: '', peso_meta: '', semanas: '', data_inicio: '' });
      await loadClientes();
    } catch (err) {
      console.error('Erro ao criar plano', err);
    }
  };

  // Fluxo 2: Adicionar Previsão (registro pontual)
  const submitPrev = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/previsoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: Number(form.id_cliente),
          data_pesagem: form.data_pesagem,
          peso_atual: Number(form.peso_atual),
          peso_previsto: Number(form.peso_previsto),
        }),
      });
      setForm({ id_cliente: '', data_pesagem: '', peso_atual: '', peso_previsto: '' });
      await loadClientes();
    } catch (err) {
      console.error('Erro ao adicionar previsão', err);
    }
  };

  // Atualizar peso atual de uma previsão existente
  const salvarPeso = async (id: number) => {
    const valor = edits[id];
    if (valor === undefined || valor === '') return;
    try {
      await fetch(`http://localhost:3001/previsoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peso_atual: Number(valor) }),
      });
      setEdits((e) => ({ ...e, [id]: '' }));
      await loadClientes();
    } catch (err) {
      console.error('Erro ao salvar peso', err);
    }
  };

  return (
    <>
      <div className="card">
        <h2>Criar Plano de Peso</h2>
        <form onSubmit={criarPlano}>
          <select
            value={plan.id_cliente}
            onChange={(e) => setPlan({ ...plan, id_cliente: e.target.value })}
            required
          >
            <option value="">Selecione o cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.1"
            placeholder="Peso atual"
            value={plan.peso_atual}
            onChange={(e) => setPlan({ ...plan, peso_atual: e.target.value })}
            required
          />

          <input
            type="number"
            step="0.1"
            placeholder="Peso meta"
            value={plan.peso_meta}
            onChange={(e) => setPlan({ ...plan, peso_meta: e.target.value })}
            required
          />

          <input
            type="number"
            placeholder="Semanas"
            value={plan.semanas}
            onChange={(e) => setPlan({ ...plan, semanas: e.target.value })}
            required
          />

          <input
            type="date"
            value={plan.data_inicio}
            onChange={(e) => setPlan({ ...plan, data_inicio: e.target.value })}
            required
          />

          <button type="submit">Gerar</button>
        </form>
      </div>

      <div className="card">
        <h2>Adicionar Previsão</h2>
        <form onSubmit={submitPrev}>
          <select
            value={form.id_cliente}
            onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
            required
          >
            <option value="">Selecione o cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.data_pesagem}
            onChange={(e) => setForm({ ...form, data_pesagem: e.target.value })}
            required
          />

          <input
            type="number"
            step="0.1"
            placeholder="Peso atual"
            value={form.peso_atual}
            onChange={(e) => setForm({ ...form, peso_atual: e.target.value })}
            required
          />

          <input
            type="number"
            step="0.1"
            placeholder="Peso previsto"
            value={form.peso_previsto}
            onChange={(e) => setForm({ ...form, peso_previsto: e.target.value })}
            required
          />

          <button type="submit">Salvar</button>
        </form>
      </div>

      <div className="card">
        <h2>Clientes</h2>
        {clientes.map((c) => (
          <div key={c.id} className="cliente">
            <strong>{c.nome}</strong>
            <ul>
              {c.previsoes.map((p) => (
                <li key={p.id}>
                  {new Date(p.data_pesagem).toLocaleDateString('pt-BR')} — Previsto: {p.peso_previsto}kg • Atual:{' '}
                  {p.peso_atual ?? '-'}kg
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Atualizar peso"
                    value={edits[p.id] ?? ''}
                    onChange={(e) => setEdits((ed) => ({ ...ed, [p.id]: e.target.value }))}
                    style={{ marginLeft: 8 }}
                  />
                  <button onClick={() => salvarPeso(p.id)} style={{ marginLeft: 4 }}>
                    Salvar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
