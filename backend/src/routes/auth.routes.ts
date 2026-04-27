import type { FastifyInstance } from "fastify";

import {
  loginController,
  logoutController,
  meController,
  refreshTokenController,
  registerController,
} from "../controllers/auth.controller.js";
import {
  loginRouteSchema,
  logoutRouteSchema,
  meRouteSchema,
  refreshRouteSchema,
  registerRouteSchema,
} from "../docs/openapi.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", {
    schema: registerRouteSchema,
  }, registerController);

  app.post("/login", {
    schema: loginRouteSchema,
  }, loginController);

  app.post("/refresh", {
    schema: refreshRouteSchema,
  }, refreshTokenController);

  app.post("/logout", {
    schema: logoutRouteSchema,
  }, logoutController);

  app.get("/me", {
    preHandler: authenticateRequest,
    schema: meRouteSchema,
  }, meController);
}