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
  const [idClienteLista, setIdClienteLista] = React.useState('');
  const [filtro, setFiltro] = React.useState('');
  const [edits, setEdits] = React.useState<Record<number, string | undefined>>({});

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

  // Criar Plano de Peso (planejamento)
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

  const iniciarEdicao = (id: number, valor: number | null) => {
    setEdits((e) => ({ ...e, [id]: valor?.toString() ?? '' }));
  };

  // Atualizar peso atual de uma previsão existente
  const salvarPeso = async (id: number) => {
    const valor = edits[id];
    if (valor === undefined) return;

    const payload =
      valor === '' ? { peso_atual: null } : { peso_atual: Math.round(Number(valor) * 100) / 100 };

    try {
      await fetch(`http://localhost:3001/previsoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setEdits((e) => {
        const { [id]: _, ...rest } = e;
        return rest;
      });
      await loadClientes();
    } catch (err) {
      console.error('Erro ao salvar peso', err);
    }
  };

  const clientesFiltrados = filtro
    ? clientes.filter((c) => c.nome.toLowerCase().includes(filtro.toLowerCase()))
    : [];

  const renderTabelaCliente = (c: Cliente) => (
    <div key={c.id} className="cliente">
      <strong>{c.nome}</strong>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Previsto</th>
            <th>Peso real</th>
          </tr>
        </thead>
        <tbody>
          {[...c.previsoes]
            .sort((a, b) => new Date(a.data_pesagem).getTime() - new Date(b.data_pesagem).getTime())
            .map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.data_pesagem).toLocaleDateString('pt-BR')}</td>
                <td>{p.peso_previsto.toFixed(2)}kg</td>
                <td>
                  {edits[p.id] !== undefined ? (
                    <>
                      <input
                        type="number"
                        step="0.1"
                        value={edits[p.id]}
                        onChange={(e) => setEdits((ed) => ({ ...ed, [p.id]: e.target.value }))}
                      />
                      <button onClick={() => salvarPeso(p.id)}>Salvar</button>
                    </>
                  ) : (
                    <>
                      {p.peso_atual !== null && `${p.peso_atual.toFixed(2)}kg`}
                      <button onClick={() => iniciarEdicao(p.id, p.peso_atual)}>
                        {p.peso_atual !== null ? 'Editar' : 'Inserir'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

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

        {/* Filtro por nome */}
        <input
          type="text"
          placeholder="Buscar cliente"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ marginRight: 8 }}
        />

        {/* Seleção direta quando não houver filtro */}
        <select
          value={idClienteLista}
          onChange={(e) => setIdClienteLista(e.target.value)}
          disabled={!!filtro.trim()}
        >
          <option value="">Selecione o cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        {/* Se tiver texto no filtro, lista todos os correspondentes; caso contrário, mostra o selecionado */}
        {filtro.trim()
          ? clientesFiltrados.map((c) => renderTabelaCliente(c))
          : (() => {
              const c = clientes.find((cl) => cl.id === Number(idClienteLista));
              return c ? renderTabelaCliente(c) : null;
            })()}
      </div>
    </>
  );
};

export default Home;
