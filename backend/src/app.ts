import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import Fastify from "fastify";

import { env } from "./config/env.js";
import { registerErrorHandler } from "./middlewares/error-handler.js";
import { registerRoutes } from "./routes/index.js";

export function buildApp() {
  const app = Fastify({
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

  app.register(fastifyHelmet);
  app.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  app.register(registerRoutes);

  return app;
}