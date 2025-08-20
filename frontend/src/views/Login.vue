<template>
  <div class="login-wrapper">
    <div class="card login">
      <div class="login-options">
        <button
          type="button"
          :class="{ active: tipo === 'aluno' }"
          @click="tipo = 'aluno'"
        >
          Login aluno
        </button>
        <button
          type="button"
          :class="{ active: tipo === 'treinador' }"
          @click="tipo = 'treinador'"
        >
          Login treinador
        </button>
      </div>
      <form @submit.prevent="handleSubmit">
        <h2>{{ tipo === 'aluno' ? 'Login Aluno' : 'Login Treinador' }}</h2>
        <input type="email" placeholder="Email" v-model="email" />
        <input type="password" placeholder="Senha" v-model="senha" />
        <button type="submit">Entrar</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { API_URL } from '../api';

const email = ref('');
const senha = ref('');
const tipo = ref<'aluno' | 'treinador'>('aluno');
const error = ref('');
const router = useRouter();

const handleSubmit = async () => {
  error.value = '';
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: email.value, senha: senha.value }),
  });
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('role', data.role);
    if (data.clienteId) localStorage.setItem('clienteId', data.clienteId);
    router.push('/');
  } else {
    const err = await res.json().catch(() => ({ error: 'Login inválido' }));
    error.value = err.error || 'Login inválido';
  }
};
</script>
