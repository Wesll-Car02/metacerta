import React from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Home from './Home';
import CadastroCliente from './CadastroCliente';
import Dashboard from './Dashboard';
import Login from './Login';

const App: React.FC = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('clienteId');
    navigate('/login');
  };

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div className="container">
      <h1>Gestão de Peso</h1>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/previsoes">Previsões</Link>
        <Link to="/cadastro">Cadastrar Cliente</Link>
        <button onClick={handleLogout}>Sair</button>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/previsoes" element={<Home />} />
        <Route path="/cadastro" element={<CadastroCliente />} />
      </Routes>
    </div>
  );
};

export default App;

