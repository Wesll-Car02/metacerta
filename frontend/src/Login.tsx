import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './api';

const Login: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [tipo, setTipo] = React.useState<'aluno' | 'treinador'>('aluno');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      if (data.clienteId) localStorage.setItem('clienteId', data.clienteId);
      navigate('/');
    } else {
      alert('Login inválido');
    }
  };

  return (
    <div className="card">
      <div className="login-options">
        <button
          type="button"
          className={tipo === 'aluno' ? 'active' : ''}
          onClick={() => setTipo('aluno')}
        >
          Login aluno
        </button>
        <button
          type="button"
          className={tipo === 'treinador' ? 'active' : ''}
          onClick={() => setTipo('treinador')}
        >
          Login treinador
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <h2>{tipo === 'aluno' ? 'Login Aluno' : 'Login Treinador'}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
