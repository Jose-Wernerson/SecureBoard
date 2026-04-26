import type { FastifyReply, FastifyRequest } from "fastify";

import { loginSchema, registerSchema } from "../modules/auth/auth.schema.js";
import {
  loginUser,
  logoutUser,
  REFRESH_TOKEN_COOKIE,
  refreshTokenCookieOptions,
  refreshUserSession,
  registerUser,
} from "../services/auth.service.js";
import { sanitizeObjectStrings } from "../utils/sanitize.js";
import { AppError } from "../utils/app-error.js";

const AUTH_COOKIE_CLEAR_OPTIONS = {
  ...refreshTokenCookieOptions,
  maxAge: 0,
};

export async function registerController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const payload = registerSchema.parse(
    sanitizeObjectStrings(request.body ?? {}, new Set(["password"])),
  );
  const result = await registerUser(payload);

  return reply.status(201).send(result);
}

export async function loginController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const payload = loginSchema.parse(
    sanitizeObjectStrings(request.body ?? {}, new Set(["password"])),
  );
  const result = await loginUser(payload, request.ip);

  reply.setCookie(
    REFRESH_TOKEN_COOKIE,
    result.refreshToken,
    refreshTokenCookieOptions,
  );

  return reply.status(200).send({
    accessToken: result.accessToken,
    user: result.user,
  });
}

export async function refreshTokenController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];

  if (!refreshToken) {
    throw new AppError(401, "Refresh token not provided", "MISSING_REFRESH_TOKEN");
  }

  const result = await refreshUserSession(refreshToken);

  reply.setCookie(
    REFRESH_TOKEN_COOKIE,
    result.refreshToken,
    refreshTokenCookieOptions,
  );

  return reply.status(200).send({
    accessToken: result.accessToken,
    user: result.user,
  });
}

export async function logoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  await logoutUser(request.cookies[REFRESH_TOKEN_COOKIE]);
  reply.clearCookie(REFRESH_TOKEN_COOKIE, AUTH_COOKIE_CLEAR_OPTIONS);

  return reply.status(204).send();
}

export async function meController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.authUser) {
    throw new AppError(401, "Unauthenticated request", "UNAUTHENTICATED");
  }

  return reply.status(200).send({
    user: request.authUser,
  });
}