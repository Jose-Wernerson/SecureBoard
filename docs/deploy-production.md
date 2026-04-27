# Deploy em Producao

## Backend no Railway

### Arquivos usados

- `backend/Dockerfile`
- `backend/scripts/start-production.mjs`
- `railway.json`
- `.dockerignore`

### O que a imagem faz

- instala dependencias do monorepo com `npm ci`
- gera o Prisma Client
- compila o backend TypeScript
- monta uma imagem final menor com dependencias de runtime
- executa `prisma migrate deploy` automaticamente antes de subir a API

### Passo a passo no Railway

1. Crie um novo projeto no Railway conectado ao repositório do SecureBoard.
2. No serviço do backend, use o repositório inteiro como raiz do serviço.
3. Garanta que o deploy use o `railway.json` da raiz e o `backend/Dockerfile`.
4. Adicione um serviço PostgreSQL no mesmo projeto.
5. Adicione um serviço Redis no mesmo projeto.
6. No serviço do backend, configure as variáveis de ambiente abaixo.

### Variáveis de ambiente do backend

Defina no serviço Railway do backend:

- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=${{RAILWAY_TCP_PROXY_PORT}}` ou deixe o Railway injetar `PORT`
- `DATABASE_URL=<connection string do PostgreSQL do Railway>`
- `REDIS_URL=<connection string do Redis do Railway>`
- `CORS_ORIGIN=https://seu-frontend.vercel.app`
- `JWT_ACCESS_SECRET=<segredo forte com 32+ caracteres>`
- `JWT_REFRESH_SECRET=<segredo forte com 32+ caracteres>`
- `ACCESS_TOKEN_TTL_MINUTES=15`
- `REFRESH_TOKEN_TTL_DAYS=7`
- `BCRYPT_ROUNDS=12`
- `COOKIE_SECURE=true`

### Observacoes de producao

- em producao, use `CORS_ORIGIN` com o dominio exato do frontend
- `COOKIE_SECURE=true` e obrigatorio em HTTPS
- `trustProxy` ja foi habilitado no Fastify para funcionar corretamente atras do proxy do Railway

## Frontend no Vercel

### Arquivos usados

- `frontend/vercel.json`
- `frontend/next.config.ts`

### Passo a passo no Vercel

1. Importe o mesmo repositório no Vercel.
2. Configure o Root Directory do projeto como `frontend`.
3. O framework deve ser detectado como Next.js.
4. Defina a variavel de ambiente abaixo.

### Variavel de ambiente do frontend

- `NEXT_PUBLIC_API_URL=https://seu-backend.up.railway.app`

### Observacoes de App Router

- o App Router funciona nativamente no Vercel sem rewrite extra
- as rotas dinamicas como `/boards/[boardId]` e `/boards/[boardId]/audit` sao tratadas automaticamente pelo Next.js

## Logs em producao

### Railway

- abra o servico do backend
- entre em `Deployments` e abra o deploy ativo
- use a aba de logs em tempo real para validar boot, migrations e requests

### Vercel

- abra o projeto do frontend
- entre em `Deployments`
- abra o deploy desejado para ver build logs e runtime logs

## Dominio customizado

### Railway

1. Abra o servico do backend.
2. Entre em `Settings` > `Domains`.
3. Adicione o subdominio desejado.
4. Configure os registros DNS solicitados pelo Railway.

### Vercel

1. Abra o projeto do frontend.
2. Entre em `Settings` > `Domains`.
3. Adicione o dominio ou subdominio.
4. Aponte os registros DNS para a Vercel conforme instrucoes do painel.

## Checklist final de seguranca

- backend com `NODE_ENV=production`
- frontend apontando para HTTPS do backend
- backend com `COOKIE_SECURE=true`
- backend com `CORS_ORIGIN` restrito ao dominio do frontend
- segredos JWT fortes e rotacionaveis
- HTTPS habilitado em Railway e Vercel
- headers de seguranca ativos no backend via Helmet
- headers de seguranca ativos no frontend via Next.js
- Swagger exposto apenas se fizer sentido em producao
- revisar logs para confirmar `prisma migrate deploy` executando sem erro
- validar `/health` apos cada deploy