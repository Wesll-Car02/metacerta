# Gestão de Peso - MVP

Sistema SAAS para acompanhamento de peso com backend em Node.js/Express, frontend em React e banco de dados PostgreSQL.

## Executando com Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Banco de dados PostgreSQL: porta 5432

## Estrutura

- `backend/` API Express com Prisma e PostgreSQL
- `frontend/` Aplicação React com Vite
- `docker-compose.yml` Orquestração dos serviços

## Próximos passos

- Autenticação de usuários
- Relatórios e dashboards
- Previsões inteligentes com IA
