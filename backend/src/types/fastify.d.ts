import "fastify";

import type { AuthenticatedUser } from "../models/auth.model.js";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: AuthenticatedUser;
  }
}