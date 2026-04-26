import type { FastifyInstance } from "fastify";

import { getHealthController } from "../controllers/health.controller.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", getHealthController);
}