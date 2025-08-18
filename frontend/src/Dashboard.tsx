import React from 'react';
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Cliente } from './types';
import { API_URL } from './api';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [idCliente, setIdCliente] = React.useState('');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  React.useEffect(() => {
    fetch(`${API_URL}/clientes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setClientes(data);
        if (role === 'CLIENTE' && data.length > 0) {
          setIdCliente(String(data[0].id));
        }
      });
  }, [token, role]);

  const cliente = clientes.find((c) => c.id === Number(idCliente));
  const previsoes = cliente
    ? [...cliente.previsoes].sort(
        (a, b) => new Date(a.data_pesagem).getTime() - new Date(b.data_pesagem).getTime()
      )
    : [];

  const ultimoPesoEntry = [...previsoes]
    .filter((p) => p.peso_atual !== null)
    .slice(-1)[0];
  const ultimoPeso = ultimoPesoEntry?.peso_atual ?? null;
  const pesoMeta = previsoes.length
    ? previsoes[previsoes.length - 1].peso_previsto
    : null;
  const diff =
    ultimoPeso !== null && pesoMeta
      ? (((ultimoPeso - pesoMeta) / pesoMeta) * 100).toFixed(2)
      : null;

  const handleAdd = async () => {
    const peso = prompt('Informe o peso');
    if (!peso) return;
    await fetch(`${API_URL}/previsoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id_cliente: Number(idCliente), data_pesagem: new Date(), peso_atual: Number(peso), peso_previsto: Number(peso) }),
    });
    const data = await fetch(`${API_URL}/clientes`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    setClientes(data);
  };

  const data = {
    labels: previsoes.map(p => new Date(p.data_pesagem).toLocaleDateString('pt-BR')),
    datasets: [
      {
        label: 'Peso',
        data: previsoes.map(p => (p.peso_atual ?? null)),
        borderColor: '#0d6efd',
        fill: false,
      },
      {
        label: 'Previsto',
        data: previsoes.map(p => p.peso_previsto),
        borderColor: '#fd7e14',
        fill: false,
      },
    ],
  };

  return (
    <div className="card">
      <h2>Dashboard</h2>
      {role === 'TREINADOR' && (
        <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)}>
          <option value="">Selecione o cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      )}
      {cliente && (
        <>
          <p>Último peso: {ultimoPeso ?? '-'}</p>
          <p>Peso meta: {pesoMeta ?? '-'}</p>
          <p>
            Diferença: {diff !== null ? `${diff}%` : '-'}
          </p>
          <button onClick={handleAdd}>+</button>
          <Line data={data} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
