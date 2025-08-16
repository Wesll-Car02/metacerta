import React from 'react';
import { Cliente } from './types';

type PlanState = {
  id_cliente: string;
  peso_atual: string;
  peso_meta: string;
  semanas: string;
  data_inicio: string;
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
  const [edits, setEdits] = React.useState<Record<number, string>>({});

  const loadClientes = async () => {
    const data = await fetch('http://localhost:3001/clientes').then((r) => r.json());
    setClientes(data);
  };

  React.useEffect(() => {
    loadClientes();
  }, []);

  const criarPlano = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const salvarPeso = async (id: number) => {
    const valor = edits[id];
    if (valor === undefined) return;
    await fetch(`http://localhost:3001/previsoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peso_atual: Number(valor) }),
    });
    setEdits((e) => ({ ...e, [id]: '' }));
    await loadClientes();
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
        <h2>Clientes</h2>
        {clientes.map((c) => (
          <div key={c.id} className="cliente">
            <strong>{c.nome}</strong>
            <ul>
              {c.previsoes.map((p) => (
                <li key={p.id}>
                  {new Date(p.data_pesagem).toLocaleDateString()} - Previsto {p.peso_previsto}kg
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Peso atual"
                    value={edits[p.id] ?? (p.peso_atual || '')}
                    onChange={(e) =>
                      setEdits((ed) => ({ ...ed, [p.id]: e.target.value }))
                    }
                  />
                  <button onClick={() => salvarPeso(p.id)}>Salvar</button>
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

