import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import Fastify from "fastify";

import { env } from "./config/env.js";
import { registerOpenApi } from "./docs/openapi.js";
import { registerErrorHandler } from "./middlewares/error-handler.js";
import { registerRoutes } from "./routes/index.js";

export function buildApp() {
  const app = Fastify({
    ajv: {
      customOptions: {
        strict: false,
      },
    },
    trustProxy: true,
    logger:
      env.NODE_ENV === "development"
        ? {
            transport: {
              target: "pino-pretty",
              options: {
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
            },
          }
        : true,
  });

  registerErrorHandler(app);

  app.register(fastifyCookie);
  app.register(fastifyHelmet);
  app.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  app.register(async (scopedApp) => {
    await registerOpenApi(scopedApp);
    await registerRoutes(scopedApp);
  });

  return app;
}