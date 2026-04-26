# SecureBoard

![Node.js](https://img.shields.io/badge/Node.js-22-3C873A?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-26-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Plataforma de portfólio com foco em segurança para demonstrar arquitetura full stack moderna, boas práticas de desenvolvimento seguro e organização em monorepo. O projeto separa responsabilidades entre backend e frontend, com PostgreSQL como banco principal e Docker para padronização do ambiente local.

## Visao Geral

O SecureBoard foi pensado como um projeto de portfólio para evidenciar:

- organizacao de monorepo para aplicacoes full stack
- backend em Node.js com TypeScript e foco em seguranca
- frontend em Next.js com Tailwind CSS
- persistencia em PostgreSQL
- ambiente reproduzivel com Docker
- preocupacao explicita com controles recomendados pelo OWASP

## Estrutura do Projeto

```text
SecureBoard/
|-- backend/
|   |-- .env.example
|   |-- package.json
|   |-- prisma/
|   |   |-- .gitkeep
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- config/
|   |   |   |-- .gitkeep
|   |   |   `-- env.ts
|   |   |-- middlewares/
|   |   |   `-- .gitkeep
|   |   |-- modules/
|   |   |   `-- .gitkeep
|   |   |-- routes/
|   |   |   |-- .gitkeep
|   |   |   `-- index.ts
|   |   |-- services/
|   |   |   `-- .gitkeep
|   |   |-- types/
|   |   |   `-- .gitkeep
|   |   |-- app.ts
|   |   |-- server.ts
|   |   `-- utils/
|   |       `-- .gitkeep
|   `-- tests/
|       `-- .gitkeep
|-- docker/
|   `-- .gitkeep
|-- docs/
|   `-- .gitkeep
|-- frontend/
|   |-- app/
|   |   |-- favicon.ico
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- components/
|   |   `-- .gitkeep
|   |-- hooks/
|   |   `-- .gitkeep
|   |-- lib/
|   |   `-- .gitkeep
|   |-- package.json
|   |-- public/
|   |   |-- file.svg
|   |   |-- globe.svg
|   |   |-- next.svg
|   |   |-- vercel.svg
|   |   `-- window.svg
|   |-- styles/
|   |   `-- .gitkeep
|   |-- eslint.config.mjs
|   |-- next.config.ts
|   |-- postcss.config.mjs
|   `-- tsconfig.json
|-- package.json
|   `-- types/
|       `-- .gitkeep
|-- .gitignore
|-- package-lock.json
`-- README.md
```

## Features Planejadas

- autenticacao com JWT e refresh token
- controle de acesso por papeis e permissoes
- dashboard com metricas e cards de seguranca
- auditoria de acoes sensiveis
- painel administrativo para gerenciamento de usuarios
- validacao de entrada e saneamento de dados
- rate limiting e protecao contra abuso
- logs estruturados e observabilidade
- documentacao de API
- pipeline de testes e analise estatica

## Como Rodar Localmente

### 1. Requisitos

- Node.js 22+
- npm 10+ ou pnpm
- Docker e Docker Compose
- PostgreSQL 16+ se optar por rodar sem container

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar ambiente do backend

```bash
cd backend
copy .env.example .env
cd ..
```

Atualize a DATABASE_URL conforme seu PostgreSQL local ou container.

### 4. Fluxo de desenvolvimento

```bash
# terminal 1 - backend
npm run dev:backend

# terminal 2 - frontend
npm run dev:frontend
```

O frontend fica em http://localhost:3000 e a API responde, por padrao, em http://localhost:3333.

### 5. Validacao basica

```bash
npm run build:frontend
npm run build:backend
```

## Seguranca

O projeto sera guiado por principios alinhados ao OWASP Top 10 e ao OWASP ASVS. Controles previstos:

- validacao server-side para toda entrada de usuario
- protecao contra injection com ORM, queries parametrizadas e validacao de schema
- autenticacao robusta e gerenciamento seguro de sessao
- autorizacao por papel com verificacao explicita no backend
- configuracao de cabecalhos HTTP com Helmet
- rate limiting para endpoints sensiveis
- tratamento seguro de erros sem vazamento de stack trace em producao
- armazenamento seguro de segredos via variaveis de ambiente
- auditoria de eventos criticos
- revisao de dependencias e atualizacoes de seguranca

## Proximos Passos

- configurar docker-compose.yml com PostgreSQL
- expandir os modulos de autenticacao e autorizacao
- integrar Prisma migrations e seed inicial
- adicionar CI para lint, testes e analise de seguranca

## Licenca

Uso educacional e demonstrativo para portfólio. Defina uma licenca formal antes da publicacao.
