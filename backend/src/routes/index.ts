import type { FastifyInstance } from "fastify";

import { authRoutes } from "./auth.routes.js";
import { boardRoutes } from "./board.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(authRoutes, {
    prefix: "/auth",
  });
  await app.register(boardRoutes, {
    prefix: "/boards",
  });
  await app.register(healthRoutes);
}