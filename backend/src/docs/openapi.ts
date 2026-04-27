import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

import { env } from "../config/env.js";

const securityResponseHeaders = {
  "Content-Security-Policy": {
    $ref: "#/components/headers/ContentSecurityPolicy",
  },
  "Cross-Origin-Opener-Policy": {
    $ref: "#/components/headers/CrossOriginOpenerPolicy",
  },
  "Cross-Origin-Resource-Policy": {
    $ref: "#/components/headers/CrossOriginResourcePolicy",
  },
  "Origin-Agent-Cluster": {
    $ref: "#/components/headers/OriginAgentCluster",
  },
  "Referrer-Policy": {
    $ref: "#/components/headers/ReferrerPolicy",
  },
  "Strict-Transport-Security": {
    $ref: "#/components/headers/StrictTransportSecurity",
  },
  "X-Content-Type-Options": {
    $ref: "#/components/headers/XContentTypeOptions",
  },
  "X-DNS-Prefetch-Control": {
    $ref: "#/components/headers/XDNSPrefetchControl",
  },
  "X-Download-Options": {
    $ref: "#/components/headers/XDownloadOptions",
  },
  "X-Frame-Options": {
    $ref: "#/components/headers/XFrameOptions",
  },
  "X-Permitted-Cross-Domain-Policies": {
    $ref: "#/components/headers/XPermittedCrossDomainPolicies",
  },
  "X-XSS-Protection": {
    $ref: "#/components/headers/XXSSProtection",
  },
} as const;

const authCookieResponseHeaders = {
  ...securityResponseHeaders,
  "Set-Cookie": {
    $ref: "#/components/headers/RefreshTokenCookie",
  },
} as const;

function refSchema(schemaId: string) {
  return {
    $ref: `${schemaId}#`,
  } as const;
}

function jsonResponse(
  description: string,
  schemaId: string,
  options?: {
    example?: Record<string, unknown>;
    headers?: typeof securityResponseHeaders | typeof authCookieResponseHeaders;
  },
) {
  return {
    description,
    headers: options?.headers ?? securityResponseHeaders,
    allOf: [refSchema(schemaId)],
    ...(options?.example ? { example: options.example } : {}),
  };
}

function appErrorResponse(
  description: string,
  example: {
    message: string;
    code: string;
  },
) {
  return jsonResponse(description, "AppErrorResponse", {
    example,
  });
}

function validationErrorResponse(example: Record<string, unknown>) {
  return jsonResponse("Payload, params ou formato do request invalido.", "ValidationErrorResponse", {
    example,
  });
}

function noContentResponse(
  description: string,
  headers: typeof securityResponseHeaders | typeof authCookieResponseHeaders = securityResponseHeaders,
) {
  return {
    description,
    headers,
  };
}

const authenticatedUserSchema = {
  $id: "AuthenticatedUser",
  type: "object",
  additionalProperties: false,
  required: ["id", "email", "name", "role"],
  properties: {
    id: { type: "string", example: "cmauj0s820000l408m9hs4lmi" },
    email: { type: "string", format: "email", example: "alice@secureboard.app" },
    name: { type: ["string", "null"], example: "Alice Silva" },
    role: { type: "string", example: "member" },
  },
} as const;

const cardSchema = {
  $id: "Card",
  type: "object",
  additionalProperties: false,
  required: ["id", "boardId", "columnId", "title", "description", "position", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", example: "cmauj53c30009l4087dpj7rlh" },
    boardId: { type: "string", example: "cmauj2p1i0003l408fpl9m6su" },
    columnId: { type: "string", example: "cmauj4l2u0007l408tu83d8xw" },
    title: { type: "string", example: "Adicionar coluna de backlog" },
    description: {
      type: ["string", "null"],
      example: "Criar coluna inicial para capturar demandas do sprint.",
    },
    position: { type: "integer", minimum: 0, example: 0 },
    createdAt: { type: "string", format: "date-time", example: "2026-04-26T21:15:00.000Z" },
    updatedAt: { type: "string", format: "date-time", example: "2026-04-26T21:15:00.000Z" },
  },
} as const;

const columnSchema = {
  $id: "Column",
  type: "object",
  additionalProperties: false,
  required: ["id", "boardId", "title", "position", "cards", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", example: "cmauj4l2u0007l408tu83d8xw" },
    boardId: { type: "string", example: "cmauj2p1i0003l408fpl9m6su" },
    title: { type: "string", example: "Em andamento" },
    position: { type: "integer", minimum: 0, example: 1 },
    cards: {
      type: "array",
      items: refSchema("Card"),
      example: [],
    },
    createdAt: { type: "string", format: "date-time", example: "2026-04-26T21:10:00.000Z" },
    updatedAt: { type: "string", format: "date-time", example: "2026-04-26T21:10:00.000Z" },
  },
} as const;

const boardSchema = {
  $id: "Board",
  type: "object",
  additionalProperties: false,
  required: ["id", "userId", "title", "description", "columns", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", example: "cmauj2p1i0003l408fpl9m6su" },
    userId: { type: "string", example: "cmauj0s820000l408m9hs4lmi" },
    title: { type: "string", example: "Roadmap Q2" },
    description: {
      type: ["string", "null"],
      example: "Board principal para prioridades de produto e engenharia.",
    },
    columns: {
      type: "array",
      items: refSchema("Column"),
    },
    createdAt: { type: "string", format: "date-time", example: "2026-04-26T21:00:00.000Z" },
    updatedAt: { type: "string", format: "date-time", example: "2026-04-26T21:20:00.000Z" },
  },
} as const;

const auditLogSchema = {
  $id: "AuditLog",
  type: "object",
  additionalProperties: false,
  required: ["id", "boardId", "userId", "action", "entity", "entityId", "oldData", "newData", "ipAddress", "createdAt"],
  properties: {
    id: { type: "string", example: "cmauj8ii7000dl4082mffav0m" },
    boardId: { type: "string", example: "cmauj2p1i0003l408fpl9m6su" },
    userId: { type: "string", example: "cmauj0s820000l408m9hs4lmi" },
    action: { type: "string", enum: ["CREATE", "UPDATE", "DELETE"], example: "UPDATE" },
    entity: { type: "string", enum: ["BOARD", "COLUMN", "CARD"], example: "CARD" },
    entityId: { type: "string", example: "cmauj53c30009l4087dpj7rlh" },
    oldData: {
      oneOf: [
        { type: "object", additionalProperties: true },
        { type: "array", items: {} },
        { type: "null" },
      ],
      example: {
        id: "cmauj53c30009l4087dpj7rlh",
        title: "Adicionar coluna de backlog",
        columnId: "cmauj4l2u0007l408tu83d8xw",
      },
    },
    newData: {
      oneOf: [
        { type: "object", additionalProperties: true },
        { type: "array", items: {} },
        { type: "null" },
      ],
      example: {
        id: "cmauj53c30009l4087dpj7rlh",
        title: "Adicionar coluna inicial de backlog",
        columnId: "cmauj4l2u0007l408tu83d8xw",
      },
    },
    ipAddress: { type: ["string", "null"], example: "127.0.0.1" },
    createdAt: { type: "string", format: "date-time", example: "2026-04-26T21:25:00.000Z" },
  },
} as const;

const registerRequestSchema = {
  $id: "RegisterRequest",
  type: "object",
  additionalProperties: false,
  required: ["email", "password"],
  properties: {
    email: {
      type: "string",
      format: "email",
      maxLength: 255,
      description: "Email unico do usuario. E normalizado para lowercase antes da persistencia.",
      example: "alice@secureboard.app",
    },
    name: {
      type: "string",
      minLength: 2,
      maxLength: 80,
      description: "Nome de exibicao opcional do usuario.",
      example: "Alice Silva",
    },
    password: {
      type: "string",
      minLength: 12,
      maxLength: 128,
      description: "Senha forte com pelo menos uma letra maiuscula, uma minuscula, um numero e um caractere especial.",
      example: "Sup3r$ecretPass!",
    },
  },
} as const;

const loginRequestSchema = {
  $id: "LoginRequest",
  type: "object",
  additionalProperties: false,
  required: ["email", "password"],
  properties: {
    email: {
      type: "string",
      format: "email",
      maxLength: 255,
      description: "Email cadastrado do usuario.",
      example: "alice@secureboard.app",
    },
    password: {
      type: "string",
      minLength: 1,
      description: "Senha em texto puro enviada apenas no fluxo de login.",
      example: "Sup3r$ecretPass!",
    },
  },
} as const;

const createBoardRequestSchema = {
  $id: "CreateBoardRequest",
  type: "object",
  additionalProperties: false,
  required: ["title"],
  properties: {
    title: {
      type: "string",
      minLength: 1,
      maxLength: 120,
      description: "Titulo principal do board Kanban.",
      example: "Roadmap Q2",
    },
    description: {
      type: "string",
      maxLength: 5000,
      description: "Descricao opcional com contexto do board.",
      example: "Board principal para produto, engenharia e compliance.",
    },
  },
} as const;

const updateBoardRequestSchema = {
  $id: "UpdateBoardRequest",
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    title: {
      type: "string",
      minLength: 1,
      maxLength: 120,
      description: "Novo titulo do board.",
      example: "Roadmap Q2 revisado",
    },
    description: {
      type: "string",
      maxLength: 5000,
      description: "Nova descricao do board. Envie string vazia para limpar o campo se a regra de negocio permitir.",
      example: "Escopo revisado com prioridades de maio e junho.",
    },
  },
} as const;

const createColumnRequestSchema = {
  $id: "CreateColumnRequest",
  type: "object",
  additionalProperties: false,
  required: ["title"],
  properties: {
    title: {
      type: "string",
      minLength: 1,
      maxLength: 120,
      description: "Titulo da coluna a ser adicionada ao board.",
      example: "Backlog",
    },
  },
} as const;

const reorderColumnsRequestSchema = {
  $id: "ReorderColumnsRequest",
  type: "object",
  additionalProperties: false,
  required: ["orderedColumnIds"],
  properties: {
    orderedColumnIds: {
      type: "array",
      minItems: 1,
      description: "Lista completa dos ids das colunas na ordem final desejada.",
      items: { type: "string", minLength: 1 },
      example: ["cmauj4l2u0006l408r3w30iwh", "cmauj4l2u0007l408tu83d8xw", "cmauj4l2u0008l408l7d27nqp"],
    },
  },
} as const;

const createCardRequestSchema = {
  $id: "CreateCardRequest",
  type: "object",
  additionalProperties: false,
  required: ["columnId", "title"],
  properties: {
    columnId: {
      type: "string",
      minLength: 1,
      description: "Id da coluna de destino dentro do board informado na URL.",
      example: "cmauj4l2u0007l408tu83d8xw",
    },
    title: {
      type: "string",
      minLength: 1,
      maxLength: 200,
      description: "Titulo curto do card.",
      example: "Preparar threat model do board",
    },
    description: {
      type: "string",
      maxLength: 10000,
      description: "Descricao opcional com detalhes operacionais da tarefa.",
      example: "Mapear superfícies de ataque, owners e ações de mitigação.",
    },
  },
} as const;

const updateCardRequestSchema = {
  $id: "UpdateCardRequest",
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    title: {
      type: "string",
      minLength: 1,
      maxLength: 200,
      description: "Novo titulo do card.",
      example: "Preparar threat model atualizado",
    },
    description: {
      type: "string",
      maxLength: 10000,
      description: "Nova descricao detalhada do card.",
      example: "Adicionar revisão de CSP, cookies e segregação de permissões.",
    },
  },
} as const;

const moveCardRequestSchema = {
  $id: "MoveCardRequest",
  type: "object",
  additionalProperties: false,
  required: ["targetColumnId", "targetPosition"],
  properties: {
    targetColumnId: {
      type: "string",
      minLength: 1,
      description: "Id da coluna de destino do card.",
      example: "cmauj4l2u0008l408l7d27nqp",
    },
    targetPosition: {
      type: "integer",
      minimum: 0,
      description: "Posicao final desejada dentro da coluna de destino.",
      example: 0,
    },
  },
} as const;

const boardIdParamsSchema = {
  $id: "BoardIdParams",
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: {
      type: "string",
      minLength: 1,
      description: "Identificador do board.",
      example: "cmauj2p1i0003l408fpl9m6su",
    },
  },
} as const;

const boardScopedParamsSchema = {
  $id: "BoardScopedParams",
  type: "object",
  additionalProperties: false,
  required: ["boardId"],
  properties: {
    boardId: {
      type: "string",
      minLength: 1,
      description: "Identificador do board escopado na rota.",
      example: "cmauj2p1i0003l408fpl9m6su",
    },
  },
} as const;

const columnParamsSchema = {
  $id: "ColumnParams",
  type: "object",
  additionalProperties: false,
  required: ["boardId", "columnId"],
  properties: {
    boardId: {
      type: "string",
      minLength: 1,
      description: "Identificador do board pai.",
      example: "cmauj2p1i0003l408fpl9m6su",
    },
    columnId: {
      type: "string",
      minLength: 1,
      description: "Identificador da coluna.",
      example: "cmauj4l2u0007l408tu83d8xw",
    },
  },
} as const;

const cardParamsSchema = {
  $id: "CardParams",
  type: "object",
  additionalProperties: false,
  required: ["boardId", "cardId"],
  properties: {
    boardId: {
      type: "string",
      minLength: 1,
      description: "Identificador do board pai.",
      example: "cmauj2p1i0003l408fpl9m6su",
    },
    cardId: {
      type: "string",
      minLength: 1,
      description: "Identificador do card.",
      example: "cmauj53c30009l4087dpj7rlh",
    },
  },
} as const;

const refreshCookieHeaderSchema = {
  $id: "RefreshCookieHeader",
  type: "object",
  additionalProperties: true,
  required: ["cookie"],
  properties: {
    cookie: {
      type: "string",
      description: "Header Cookie contendo secureboard_refresh_token emitido por /auth/login ou /auth/refresh.",
      example: "secureboard_refresh_token=opaque.jwt.token",
    },
  },
} as const;

const logoutCookieHeaderSchema = {
  $id: "LogoutCookieHeader",
  type: "object",
  additionalProperties: true,
  properties: {
    cookie: {
      type: "string",
      description: "Header Cookie com secureboard_refresh_token. Opcional, pois o endpoint e idempotente.",
      example: "secureboard_refresh_token=opaque.jwt.token",
    },
  },
} as const;

const healthResponseSchema = {
  $id: "HealthResponse",
  type: "object",
  additionalProperties: false,
  required: ["service", "status", "timestamp", "uptime", "connections"],
  properties: {
    service: {
      type: "string",
      example: "secureboard-api",
    },
    status: {
      type: "string",
      enum: ["ok", "degraded"],
      example: "ok",
    },
    timestamp: {
      type: "string",
      format: "date-time",
      example: "2026-04-26T21:35:00.000Z",
    },
    uptime: {
      type: "number",
      example: 1842.57,
    },
    connections: {
      type: "object",
      additionalProperties: false,
      required: ["database", "redis"],
      properties: {
        database: {
          type: "string",
          enum: ["up", "down"],
          example: "up",
        },
        redis: {
          type: "string",
          enum: ["up", "down"],
          example: "up",
        },
      },
    },
  },
} as const;

const registerResponseSchema = {
  $id: "RegisterResponse",
  type: "object",
  additionalProperties: false,
  required: ["user"],
  properties: {
    user: refSchema("AuthenticatedUser"),
  },
} as const;

const authSessionResponseSchema = {
  $id: "AuthSessionResponse",
  type: "object",
  additionalProperties: false,
  required: ["accessToken", "user"],
  properties: {
    accessToken: {
      type: "string",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secureboard.access-token",
    },
    user: refSchema("AuthenticatedUser"),
  },
} as const;

const meResponseSchema = {
  $id: "MeResponse",
  type: "object",
  additionalProperties: false,
  required: ["user"],
  properties: {
    user: refSchema("AuthenticatedUser"),
  },
} as const;

const boardsListResponseSchema = {
  $id: "BoardsListResponse",
  type: "object",
  additionalProperties: false,
  required: ["boards"],
  properties: {
    boards: {
      type: "array",
      items: refSchema("Board"),
    },
  },
} as const;

const reorderedColumnsResponseSchema = {
  $id: "ReorderedColumnsResponse",
  type: "object",
  additionalProperties: false,
  required: ["columns"],
  properties: {
    columns: {
      type: "array",
      items: refSchema("Column"),
    },
  },
} as const;

const auditListResponseSchema = {
  $id: "AuditListResponse",
  type: "object",
  additionalProperties: false,
  required: ["audit"],
  properties: {
    audit: {
      type: "array",
      items: refSchema("AuditLog"),
    },
  },
} as const;

const appErrorResponseSchema = {
  $id: "AppErrorResponse",
  type: "object",
  additionalProperties: false,
  required: ["message", "code"],
  properties: {
    message: { type: "string", example: "Missing bearer token" },
    code: { type: "string", example: "MISSING_BEARER_TOKEN" },
  },
} as const;

const validationErrorResponseSchema = {
  $id: "ValidationErrorResponse",
  type: "object",
  additionalProperties: false,
  required: ["message", "errors"],
  properties: {
    message: { type: "string", example: "Validation failed" },
    errors: {
      type: "object",
      additionalProperties: false,
      required: ["formErrors", "fieldErrors"],
      properties: {
        formErrors: {
          type: "array",
          items: { type: "string" },
          example: [],
        },
        fieldErrors: {
          type: "object",
          additionalProperties: {
            type: "array",
            items: { type: "string" },
          },
          example: {
            password: ["Password must include at least one special character"],
          },
        },
      },
    },
  },
} as const;

function registerReusableSchemas(app: FastifyInstance) {
  const schemas = [
    authenticatedUserSchema,
    cardSchema,
    columnSchema,
    boardSchema,
    auditLogSchema,
    registerRequestSchema,
    loginRequestSchema,
    createBoardRequestSchema,
    updateBoardRequestSchema,
    createColumnRequestSchema,
    reorderColumnsRequestSchema,
    createCardRequestSchema,
    updateCardRequestSchema,
    moveCardRequestSchema,
    boardIdParamsSchema,
    boardScopedParamsSchema,
    columnParamsSchema,
    cardParamsSchema,
    refreshCookieHeaderSchema,
    logoutCookieHeaderSchema,
    registerResponseSchema,
    authSessionResponseSchema,
    meResponseSchema,
    boardsListResponseSchema,
    reorderedColumnsResponseSchema,
    auditListResponseSchema,
    healthResponseSchema,
    appErrorResponseSchema,
    validationErrorResponseSchema,
  ] as const;

  for (const schema of schemas) {
    app.addSchema(schema);
  }
}

export async function registerOpenApi(app: FastifyInstance) {
  registerReusableSchemas(app);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "SecureBoard API",
        version: "1.0.0",
        description: [
          "API REST do SecureBoard para autenticacao, gestao de boards Kanban, colunas, cards e trilha de auditoria.",
          "",
          "## Security",
          "",
          "Controles OWASP documentados nesta API:",
          "- Autenticacao com JWT Bearer de curta duracao e refresh token HttpOnly com SameSite=Strict.",
          "- Hash de senha com regras de complexidade forte e revogacao de refresh tokens.",
          "- Protecoes de headers via Helmet: CSP, frame-ancestors negado, MIME sniffing bloqueado, politicas de referrer e isolamento de origem.",
          "- Controle de acesso por ownership em boards, colunas e cards, evitando IDOR/BOLA.",
          "- Sanitizacao de strings antes da persistencia para reduzir risco de XSS armazenado.",
          "- Rate limiting por IP no login para mitigacao de brute force.",
          "- Auditoria de alteracoes em board, column e card para rastreabilidade.",
        ].join("\n"),
      },
      servers: [
        {
          url: `http://${env.HOST === "0.0.0.0" ? "localhost" : env.HOST}:${env.PORT}`,
          description: "Ambiente local",
        },
      ],
      tags: [
        { name: "Auth", description: "Cadastro, autenticacao, refresh e encerramento de sessao." },
        { name: "Boards", description: "CRUD de boards e consulta consolidada do Kanban." },
        { name: "Columns", description: "Criacao, reordenacao e remocao de colunas dentro de um board." },
        { name: "Cards", description: "Criacao, atualizacao, movimentacao e remocao de cards." },
        { name: "Audit", description: "Consulta do historico de alteracoes rastreadas por board." },
        { name: "Health", description: "Status operacional da API e das dependencias principais." },
        {
          name: "Security",
          description: "Resumo OWASP: JWT Bearer, refresh token HttpOnly, Helmet, ownership checks, sanitizacao, rate limit e auditoria.",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Envie o access token retornado por /auth/login ou /auth/refresh no header Authorization: Bearer <token>.",
          },
        },
        headers: {
          ContentSecurityPolicy: {
            description: "Politica CSP padrao aplicada pelo Helmet para reduzir XSS, clickjacking indireto e injeção de recursos.",
            schema: {
              type: "string",
              example: "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
            },
          },
          CrossOriginOpenerPolicy: {
            description: "Isola o contexto de navegação para reduzir riscos de cross-origin window access.",
            schema: { type: "string", example: "same-origin" },
          },
          CrossOriginResourcePolicy: {
            description: "Restringe o compartilhamento de recursos para a mesma origem.",
            schema: { type: "string", example: "same-origin" },
          },
          OriginAgentCluster: {
            description: "Solicita isolamento do documento em um agent cluster dedicado.",
            schema: { type: "string", example: "?1" },
          },
          ReferrerPolicy: {
            description: "Limita vazamento de URL de origem em navegacao e requests subsequentes.",
            schema: { type: "string", example: "no-referrer" },
          },
          StrictTransportSecurity: {
            description: "Forca uso de HTTPS por navegadores compatíveis em ambientes seguros.",
            schema: { type: "string", example: "max-age=31536000; includeSubDomains" },
          },
          XContentTypeOptions: {
            description: "Bloqueia MIME sniffing no browser.",
            schema: { type: "string", example: "nosniff" },
          },
          XDNSPrefetchControl: {
            description: "Desabilita DNS prefetch para reduzir vazamento de metadados.",
            schema: { type: "string", example: "off" },
          },
          XDownloadOptions: {
            description: "Evita abertura automática de downloads em clientes legados.",
            schema: { type: "string", example: "noopen" },
          },
          XFrameOptions: {
            description: "Impede renderização em frame/iframe de terceiros para mitigar clickjacking.",
            schema: { type: "string", example: "SAMEORIGIN" },
          },
          XPermittedCrossDomainPolicies: {
            description: "Bloqueia politicas cross-domain legadas do Adobe/Flash.",
            schema: { type: "string", example: "none" },
          },
          XXSSProtection: {
            description: "Desabilita filtros XSS legados inseguros em navegadores antigos.",
            schema: { type: "string", example: "0" },
          },
          RefreshTokenCookie: {
            description: "Cookie HttpOnly com refresh token, enviado em login, refresh e logout.",
            schema: {
              type: "string",
              example: "secureboard_refresh_token=opaque.jwt.token; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict; Secure",
            },
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    staticCSP: true,
    transformStaticCSP: (header) => header,
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      displayRequestDuration: true,
    },
  });
}

export const registerRouteSchema = {
  tags: ["Auth"],
  summary: "Registrar usuario",
  description: "Cria uma nova conta com politica de senha forte. A senha e validada contra complexidade minima antes de ser armazenada com hash.",
  body: refSchema("RegisterRequest"),
  security: [],
  response: {
    201: jsonResponse("Usuario criado com sucesso.", "RegisterResponse", {
      example: {
        user: {
          id: "cmauj0s820000l408m9hs4lmi",
          email: "alice@secureboard.app",
          name: "Alice Silva",
          role: "member",
        },
      },
    }),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          password: ["Password must include at least one uppercase letter"],
        },
      },
    }),
    409: appErrorResponse("Email ja cadastrado.", {
      message: "Email already in use",
      code: "EMAIL_ALREADY_IN_USE",
    }),
  },
};

export const loginRouteSchema = {
  tags: ["Auth"],
  summary: "Autenticar usuario",
  description: "Valida credenciais, aplica rate limiting por IP e retorna access token JWT. O refresh token e devolvido em cookie HttpOnly seguro.",
  body: refSchema("LoginRequest"),
  security: [],
  response: {
    200: jsonResponse("Login realizado com sucesso.", "AuthSessionResponse", {
      headers: authCookieResponseHeaders,
      example: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secureboard.access-token",
        user: {
          id: "cmauj0s820000l408m9hs4lmi",
          email: "alice@secureboard.app",
          name: "Alice Silva",
          role: "member",
        },
      },
    }),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          email: ["Invalid email"],
        },
      },
    }),
    401: appErrorResponse("Credenciais invalidas.", {
      message: "Invalid credentials",
      code: "INVALID_CREDENTIALS",
    }),
    429: appErrorResponse("Muitas tentativas de login no intervalo configurado.", {
      message: "Too many login attempts. Try again later.",
      code: "LOGIN_RATE_LIMITED",
    }),
    503: appErrorResponse("Servico de rate limit indisponivel.", {
      message: "Rate limit service unavailable",
      code: "RATE_LIMIT_UNAVAILABLE",
    }),
  },
};

export const refreshRouteSchema = {
  tags: ["Auth"],
  summary: "Renovar sessao",
  description: "Lê o cookie secureboard_refresh_token, valida o token armazenado e emite um novo access token e um novo refresh token rotacionado.",
  headers: refSchema("RefreshCookieHeader"),
  security: [],
  response: {
    200: jsonResponse("Sessao renovada com sucesso.", "AuthSessionResponse", {
      headers: authCookieResponseHeaders,
      example: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secureboard.rotated-access-token",
        user: {
          id: "cmauj0s820000l408m9hs4lmi",
          email: "alice@secureboard.app",
          name: "Alice Silva",
          role: "member",
        },
      },
    }),
    401: appErrorResponse("Refresh token ausente, invalido, expirado ou revogado.", {
      message: "Refresh token not provided",
      code: "MISSING_REFRESH_TOKEN",
    }),
  },
};

export const logoutRouteSchema = {
  tags: ["Auth"],
  summary: "Encerrar sessao",
  description: "Revoga o refresh token atual quando presente e envia um Set-Cookie para limpeza do cookie de sessao.",
  headers: refSchema("LogoutCookieHeader"),
  security: [],
  response: {
    204: noContentResponse("Logout processado. Mesmo sem cookie, a operacao e idempotente.", authCookieResponseHeaders),
  },
};

export const healthRouteSchema = {
  tags: ["Health"],
  summary: "Health check",
  description: "Retorna o estado atual da API, do banco e do Redis. Quando alguma dependencia esta indisponivel, a resposta muda para degraded com status HTTP 503.",
  security: [],
  response: {
    200: jsonResponse("Servico e dependencias principais operando normalmente.", "HealthResponse", {
      example: {
        service: "secureboard-api",
        status: "ok",
        timestamp: "2026-04-26T21:35:00.000Z",
        uptime: 1842.57,
        connections: {
          database: "up",
          redis: "up",
        },
      },
    }),
    503: jsonResponse("Servico degradado por indisponibilidade parcial de dependencias.", "HealthResponse", {
      example: {
        service: "secureboard-api",
        status: "degraded",
        timestamp: "2026-04-26T21:36:00.000Z",
        uptime: 1850.23,
        connections: {
          database: "up",
          redis: "down",
        },
      },
    }),
  },
};

export const meRouteSchema = {
  tags: ["Auth"],
  summary: "Obter usuario autenticado",
  description: "Retorna os dados do usuario autenticado a partir do access token Bearer valido.",
  security: [{ bearerAuth: [] }],
  response: {
    200: jsonResponse("Usuario autenticado retornado com sucesso.", "MeResponse", {
      example: {
        user: {
          id: "cmauj0s820000l408m9hs4lmi",
          email: "alice@secureboard.app",
          name: "Alice Silva",
          role: "member",
        },
      },
    }),
    401: appErrorResponse("Requisicao sem Bearer token ou com token invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
  },
};

export const listBoardsRouteSchema = {
  tags: ["Boards"],
  summary: "Listar boards",
  description: "Retorna todos os boards do usuario autenticado com colunas e cards ordenados por posicao.",
  security: [{ bearerAuth: [] }],
  response: {
    200: jsonResponse("Boards retornados com sucesso.", "BoardsListResponse"),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
  },
};

export const createBoardRouteSchema = {
  tags: ["Boards"],
  summary: "Criar board",
  description: "Cria um novo board vazio para o usuario autenticado e registra auditoria de criacao.",
  body: refSchema("CreateBoardRequest"),
  security: [{ bearerAuth: [] }],
  response: {
    201: jsonResponse("Board criado com sucesso.", "Board"),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          title: ["String must contain at least 1 character(s)"],
        },
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
  },
};

export const getBoardRouteSchema = {
  tags: ["Boards"],
  summary: "Obter board por id",
  description: "Retorna um board completo com colunas e cards. O acesso e restrito ao owner do recurso.",
  params: refSchema("BoardIdParams"),
  security: [{ bearerAuth: [] }],
  response: {
    200: jsonResponse("Board retornado com sucesso.", "Board"),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          id: ["Identifier is required"],
        },
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Board inexistente.", {
      message: "Board not found",
      code: "BOARD_NOT_FOUND",
    }),
  },
};

export const updateBoardRouteSchema = {
  tags: ["Boards"],
  summary: "Atualizar board",
  description: "Atualiza titulo e/ou descricao do board e grava auditoria com snapshot anterior e posterior.",
  params: refSchema("BoardIdParams"),
  body: refSchema("UpdateBoardRequest"),
  security: [{ bearerAuth: [] }],
  response: {
    200: jsonResponse("Board atualizado com sucesso.", "Board"),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: ["At least one field must be provided"],
        fieldErrors: {},
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Board inexistente.", {
      message: "Board not found",
      code: "BOARD_NOT_FOUND",
    }),
  },
};

export const deleteBoardRouteSchema = {
  tags: ["Boards"],
  summary: "Remover board",
  description: "Exclui o board e todas as entidades relacionadas por cascade no banco. A acao e auditada.",
  params: refSchema("BoardIdParams"),
  security: [{ bearerAuth: [] }],
  response: {
    204: noContentResponse("Board removido com sucesso."),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          id: ["Identifier is required"],
        },
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Board inexistente.", {
      message: "Board not found",
      code: "BOARD_NOT_FOUND",
    }),
  },
};

export const listBoardAuditRouteSchema = {
  tags: ["Audit"],
  summary: "Listar auditoria do board",
  description: "Retorna o historico de alteracoes do board em ordem decrescente de criacao.",
  params: refSchema("BoardIdParams"),
  security: [{ bearerAuth: [] }],
  response: {
    200: jsonResponse("Auditoria retornada com sucesso.", "AuditListResponse"),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          id: ["Identifier is required"],
        },
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Board inexistente.", {
      message: "Board not found",
      code: "BOARD_NOT_FOUND",
    }),
  },
};

export const createColumnRouteSchema = {
  tags: ["Columns"],
  summary: "Criar coluna",
  description: "Adiciona uma nova coluna ao final da ordenacao atual do board e registra auditoria.",
  params: refSchema("BoardScopedParams"),
  body: refSchema("CreateColumnRequest"),
  security: [{ bearerAuth: [] }],
  response: {
    201: jsonResponse("Coluna criada com sucesso.", "Column"),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          title: ["String must contain at least 1 character(s)"],
        },
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Board inexistente.", {
      message: "Board not found",
      code: "BOARD_NOT_FOUND",
    }),
  },
};

export const reorderColumnsRouteSchema = {
  tags: ["Columns"],
  summary: "Reordenar colunas",
  description: "Recebe a lista completa de ids de colunas na ordem final desejada. O payload precisa conter todas as colunas do board.",
  params: refSchema("BoardScopedParams"),
  body: refSchema("ReorderColumnsRequest"),
  security: [{ bearerAuth: [] }],
  response: {
    200: jsonResponse("Colunas reordenadas com sucesso.", "ReorderedColumnsResponse"),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          orderedColumnIds: ["Array must contain at least 1 element(s)"],
        },
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Board inexistente.", {
      message: "Board not found",
      code: "BOARD_NOT_FOUND",
    }),
  },
};

export const deleteColumnRouteSchema = {
  tags: ["Columns"],
  summary: "Remover coluna",
  description: "Remove a coluna informada, apaga seus cards por cascade e recompõe a ordenacao restante do board.",
  params: refSchema("ColumnParams"),
  security: [{ bearerAuth: [] }],
  response: {
    204: noContentResponse("Coluna removida com sucesso."),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          columnId: ["Identifier is required"],
        },
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Board ou coluna inexistentes.", {
      message: "Column not found",
      code: "COLUMN_NOT_FOUND",
    }),
  },
};

export const createCardRouteSchema = {
  tags: ["Cards"],
  summary: "Criar card",
  description: "Cria um novo card na coluna informada, na ultima posicao disponivel, e registra auditoria.",
  params: refSchema("BoardScopedParams"),
  body: refSchema("CreateCardRequest"),
  security: [{ bearerAuth: [] }],
  response: {
    201: jsonResponse("Card criado com sucesso.", "Card"),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          title: ["String must contain at least 1 character(s)"],
        },
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Board ou coluna inexistentes.", {
      message: "Column not found",
      code: "COLUMN_NOT_FOUND",
    }),
  },
};

export const updateCardRouteSchema = {
  tags: ["Cards"],
  summary: "Atualizar card",
  description: "Atualiza titulo e/ou descricao do card sem alterar sua posicao atual.",
  params: refSchema("CardParams"),
  body: refSchema("UpdateCardRequest"),
  security: [{ bearerAuth: [] }],
  response: {
    200: jsonResponse("Card atualizado com sucesso.", "Card"),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: ["At least one field must be provided"],
        fieldErrors: {},
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Card inexistente.", {
      message: "Card not found",
      code: "CARD_NOT_FOUND",
    }),
  },
};

export const moveCardRouteSchema = {
  tags: ["Cards"],
  summary: "Mover card",
  description: "Move um card para outra coluna ou outra posicao da mesma coluna, normalizando os indices envolvidos.",
  params: refSchema("CardParams"),
  body: refSchema("MoveCardRequest"),
  security: [{ bearerAuth: [] }],
  response: {
    200: jsonResponse("Card movido com sucesso.", "Card"),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          targetPosition: ["Number must be greater than or equal to 0"],
        },
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Card ou coluna de destino inexistentes.", {
      message: "Card not found",
      code: "CARD_NOT_FOUND",
    }),
  },
};

export const deleteCardRouteSchema = {
  tags: ["Cards"],
  summary: "Remover card",
  description: "Exclui o card informado e recompacta as posicoes restantes dentro da coluna de origem.",
  params: refSchema("CardParams"),
  security: [{ bearerAuth: [] }],
  response: {
    204: noContentResponse("Card removido com sucesso."),
    400: validationErrorResponse({
      message: "Validation failed",
      errors: {
        formErrors: [],
        fieldErrors: {
          cardId: ["Identifier is required"],
        },
      },
    }),
    401: appErrorResponse("Bearer ausente ou invalido.", {
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    }),
    403: appErrorResponse("Board existe, mas pertence a outro usuario.", {
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    }),
    404: appErrorResponse("Card inexistente.", {
      message: "Card not found",
      code: "CARD_NOT_FOUND",
    }),
  },
};