import React from 'react';

const CadastroCliente: React.FC = () => {
  const [nome, setNome] = React.useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:3001/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    });
    setNome('');
  };

  return (
    <div className="card">
      <h2>Cadastrar Cliente</h2>
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Nome do cliente"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
        <button type="submit">Salvar</button>
      </form>
    </div>
  );
};

export default CadastroCliente;

