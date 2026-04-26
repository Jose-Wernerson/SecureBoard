import type { FastifyInstance } from "fastify";

import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoutes);
}