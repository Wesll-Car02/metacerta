import React from 'react';
import { Cliente } from './types';

type FormState = {
  id_cliente: string;
  data_pesagem: string;
  peso_atual: string;
  peso_previsto: string;
};

const Home: React.FC = () => {
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [form, setForm] = React.useState<FormState>({
    id_cliente: '',
    data_pesagem: '',
    peso_atual: '',
    peso_previsto: '',
  });

  const loadClientes = async () => {
    const data = await fetch('http://localhost:3001/clientes').then(r => r.json());
    setClientes(data);
  };

  React.useEffect(() => {
    loadClientes();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  return (
    <>
      <div className="card">
        <h2>Adicionar Previsão</h2>
        <form onSubmit={submit}>
          <select
            value={form.id_cliente}
            onChange={e => setForm({ ...form, id_cliente: e.target.value })}
            required
          >
            <option value="">Selecione o cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.data_pesagem}
            onChange={e => setForm({ ...form, data_pesagem: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.1"
            placeholder="Peso atual"
            value={form.peso_atual}
            onChange={e => setForm({ ...form, peso_atual: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.1"
            placeholder="Peso previsto"
            value={form.peso_previsto}
            onChange={e => setForm({ ...form, peso_previsto: e.target.value })}
            required
          />
          <button type="submit">Salvar</button>
        </form>
      </div>
      <div className="card">
        <h2>Clientes</h2>
        {clientes.map(c => (
          <div key={c.id} className="cliente">
            <strong>{c.nome}</strong>
            <ul>
              {c.previsoes.map(p => (
                <li key={p.id}>
                  {new Date(p.data_pesagem).toLocaleDateString()} - {p.peso_atual}kg / {p.peso_previsto}kg
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

