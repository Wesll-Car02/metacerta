import React from 'react';
import { Objetivo } from './types';

const CadastroCliente: React.FC = () => {
  const [nome, setNome] = React.useState('');
  const [dataNascimento, setDataNascimento] = React.useState('');
  const [peso, setPeso] = React.useState('');
  const [altura, setAltura] = React.useState('');
  const [percentGordura, setPercentGordura] = React.useState('');
  const [percentMassa, setPercentMassa] = React.useState('');
  const [idObjetivo, setIdObjetivo] = React.useState('');
  const [objetivos, setObjetivos] = React.useState<Objetivo[]>([]);
  const token = localStorage.getItem('token');

  React.useEffect(() => {
    fetch('http://localhost:3001/objetivos')
      .then((r) => r.json())
      .then(setObjetivos);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:3001/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nome,
        data_nascimento: dataNascimento || null,
        peso: peso ? Number(peso) : null,
        altura: altura ? Number(altura) : null,
        percent_gordura: percentGordura ? Number(percentGordura) : null,
        percent_massa: percentMassa ? Number(percentMassa) : null,
        id_objetivo: idObjetivo ? Number(idObjetivo) : null,
      }),
    });
    setNome('');
    setDataNascimento('');
    setPeso('');
    setAltura('');
    setPercentGordura('');
    setPercentMassa('');
    setIdObjetivo('');
  };

  return (
    <div className="card">
      <h2>Cadastrar Cliente</h2>
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Nome do cliente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />

        <input
          type="number"
          step="0.1"
          placeholder="Peso inicial"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
        />

        <input
          type="number"
          step="0.01"
          placeholder="Altura (m)"
          value={altura}
          onChange={(e) => setAltura(e.target.value)}
        />

        <input
          type="number"
          step="0.1"
          placeholder="% Gordura"
          value={percentGordura}
          onChange={(e) => setPercentGordura(e.target.value)}
        />

        <input
          type="number"
          step="0.1"
          placeholder="% Massa Magra"
          value={percentMassa}
          onChange={(e) => setPercentMassa(e.target.value)}
        />

        <select value={idObjetivo} onChange={(e) => setIdObjetivo(e.target.value)}>
          <option value="">Selecione o objetivo</option>
          {objetivos.map((o) => (
            <option key={o.id} value={o.id}>
              {o.descricao}
            </option>
          ))}
        </select>

        <button type="submit">Salvar</button>
      </form>
    </div>
  );
};

export default CadastroCliente;

