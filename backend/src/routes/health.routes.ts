import type { FastifyInstance } from "fastify";

import { getHealthController } from "../controllers/health.controller.js";
import { healthRouteSchema } from "../docs/openapi.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", {
    schema: healthRouteSchema,
  }, getHealthController);
}