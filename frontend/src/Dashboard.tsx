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

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [idCliente, setIdCliente] = React.useState('');

  React.useEffect(() => {
    fetch('http://localhost:3001/clientes')
      .then(r => r.json())
      .then(setClientes);
  }, []);

  const cliente = clientes.find(c => c.id === Number(idCliente));
  const previsoes = cliente ? [...cliente.previsoes].sort((a, b) =>
    new Date(a.data_pesagem).getTime() - new Date(b.data_pesagem).getTime()
  ) : [];

  const data = {
    labels: previsoes.map(p => new Date(p.data_pesagem).toLocaleDateString()),
    datasets: [
      {
        label: 'Peso',
        data: previsoes.map(p => p.peso_atual),
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
      <select value={idCliente} onChange={e => setIdCliente(e.target.value)}>
        <option value="">Selecione o cliente</option>
        {clientes.map(c => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>
      {cliente && <Line data={data} />}
    </div>
  );
};

export default Dashboard;

