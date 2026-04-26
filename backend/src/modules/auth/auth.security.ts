import { randomUUID } from "node:crypto";

import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../../config/env.js";
import type {
  AccessTokenPayload,
  AuthenticatedUser,
  RefreshTokenPayload,
} from "../../models/auth.model.js";
import { AppError } from "../../utils/app-error.js";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function generateAccessToken(user: AuthenticatedUser) {
  const payload: AccessTokenPayload = {
    ...user,
    sub: user.id,
    type: "access",
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    audience: "secureboard-client",
    expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`,
    issuer: "secureboard-api",
  });
}

export function generateRefreshToken(user: AuthenticatedUser) {
  const payload: RefreshTokenPayload = {
    ...user,
    sub: user.id,
    jti: randomUUID(),
    type: "refresh",
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    audience: "secureboard-client",
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`,
    issuer: "secureboard-api",
  });
}

export function decodeRefreshToken(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      audience: "secureboard-client",
      issuer: "secureboard-api",
    });

    if (typeof payload === "string" || payload.type !== "refresh") {
      throw new AppError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    return payload as RefreshTokenPayload & JwtPayload;
  } catch {
    throw new AppError(401, "Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
  }
}

export function verifyAccessToken(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      audience: "secureboard-client",
      issuer: "secureboard-api",
    });

    if (
      typeof payload === "string"
      || payload.type !== "access"
      || typeof payload.sub !== "string"
      || typeof payload.email !== "string"
      || typeof payload.role !== "string"
    ) {
      throw new AppError(401, "Invalid access token", "INVALID_ACCESS_TOKEN");
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? null,
      role: payload.role,
    } satisfies AuthenticatedUser;
  } catch {
    throw new AppError(401, "Invalid or expired access token", "INVALID_ACCESS_TOKEN");
  }
}