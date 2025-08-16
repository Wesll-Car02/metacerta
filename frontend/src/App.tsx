import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import CadastroCliente from './CadastroCliente';
import Dashboard from './Dashboard';

const App: React.FC = () => {
  return (
    <div className="container">
      <h1>Gestão de Peso</h1>
      <nav>
        <Link to="/">Previsões</Link>
        <Link to="/cadastro">Cadastrar Cliente</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<CadastroCliente />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;

