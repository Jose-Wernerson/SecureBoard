import type { FastifyReply, FastifyRequest } from "fastify";

import { verifyAccessToken } from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";

export async function authenticateRequest(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError(401, "Missing bearer token", "MISSING_BEARER_TOKEN");
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new AppError(401, "Missing bearer token", "MISSING_BEARER_TOKEN");
  }

  request.authUser = verifyAccessToken(token);
}