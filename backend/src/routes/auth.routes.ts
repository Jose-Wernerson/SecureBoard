import type { FastifyInstance } from "fastify";

import {
  loginController,
  logoutController,
  meController,
  refreshTokenController,
  registerController,
} from "../controllers/auth.controller.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", registerController);
  app.post("/login", loginController);
  app.post("/refresh", refreshTokenController);
  app.post("/logout", logoutController);
  app.get("/me", {
    preHandler: authenticateRequest,
  }, meController);
}