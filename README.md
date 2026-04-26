# SecureBoard

![Node.js](https://img.shields.io/badge/Node.js-22-3C873A?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)
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
|   |-- prisma/
|   |   `-- .gitkeep
|   |-- src/
|   |   |-- config/
|   |   |   `-- .gitkeep
|   |   |-- middlewares/
|   |   |   `-- .gitkeep
|   |   |-- modules/
|   |   |   `-- .gitkeep
|   |   |-- routes/
|   |   |   `-- .gitkeep
|   |   |-- services/
|   |   |   `-- .gitkeep
|   |   |-- types/
|   |   |   `-- .gitkeep
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
|   |   `-- .gitkeep
|   |-- components/
|   |   `-- .gitkeep
|   |-- hooks/
|   |   `-- .gitkeep
|   |-- lib/
|   |   `-- .gitkeep
|   |-- public/
|   |   `-- .gitkeep
|   |-- styles/
|   |   `-- .gitkeep
|   `-- types/
|       `-- .gitkeep
|-- .gitignore
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

### 2. Estrategia recomendada de bootstrap

Como este repositório ainda esta na fase inicial de estrutura, o caminho sugerido e:

```bash
# frontend
npx create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*"

# backend
mkdir backend
cd backend
npm init -y
npm install express cors helmet morgan zod dotenv
npm install @prisma/client
npm install -D typescript tsx ts-node-dev @types/node @types/express @types/cors @types/morgan prisma
```

### 3. Fluxo esperado para desenvolvimento

```bash
# na raiz, subir banco e servicos auxiliares via Docker
docker compose up -d

# em outro terminal, iniciar backend
cd backend
npm run dev

# em outro terminal, iniciar frontend
cd frontend
npm run dev
```

O frontend deve ficar disponivel em http://localhost:3000 e a API pode ser exposta, por exemplo, em http://localhost:3333.

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

- adicionar package.json na raiz para scripts compartilhados
- configurar docker-compose.yml com PostgreSQL
- iniciar scaffold do backend com Express e Prisma
- iniciar scaffold do frontend com Next.js e Tailwind
- adicionar CI para lint, testes e analise de seguranca

## Licenca

Uso educacional e demonstrativo para portfólio. Defina uma licenca formal antes da publicacao.
