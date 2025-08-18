import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: Dashboard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (!token && to.path !== '/login') {
    next('/login');
  } else if (token && to.path === '/login') {
    next('/');
  } else {
    next();
  }
});

export default router;
