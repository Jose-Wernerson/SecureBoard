import { createHash, randomUUID } from "node:crypto";

import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";
import type {
  AccessTokenPayload,
  AuthTokens,
  AuthenticatedUser,
  RefreshTokenPayload,
} from "../models/auth.model.js";
import { prisma } from "./prisma.js";
import { redis } from "./redis.js";
import type { LoginInput, RegisterInput } from "../modules/auth/auth.schema.js";
import { AppError } from "../utils/app-error.js";

const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60;

export const REFRESH_TOKEN_COOKIE = "secureboard_refresh_token";

export const refreshTokenCookieOptions = {
  httpOnly: true,
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
  path: "/auth",
  sameSite: "strict" as const,
  secure: env.COOKIE_SECURE,
};

function mapUser(user: AuthenticatedUser): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function ensureRedisConnection() {
  if (redis.isOpen) {
    return;
  }

  try {
    await redis.connect();
  } catch {
    throw new AppError(503, "Rate limit service unavailable", "RATE_LIMIT_UNAVAILABLE");
  }
}

function getLoginAttemptsKey(ipAddress: string) {
  return `auth:login:attempts:${ipAddress}`;
}

function buildAccessToken(user: AuthenticatedUser) {
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

function buildRefreshToken(user: AuthenticatedUser) {
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

function verifyAccessPayload(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      audience: "secureboard-client",
      issuer: "secureboard-api",
    });

    if (typeof payload === "string" || payload.type !== "access") {
      throw new AppError(401, "Invalid access token", "INVALID_ACCESS_TOKEN");
    }

    return payload as AccessTokenPayload & JwtPayload;
  } catch {
    throw new AppError(401, "Invalid or expired access token", "INVALID_ACCESS_TOKEN");
  }
}

function verifyRefreshPayload(token: string) {
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

async function persistRefreshToken(userId: string, refreshToken: string) {
  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt,
    },
  });
}

async function revokeAllUserRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

async function assertLoginRateLimit(ipAddress: string) {
  await ensureRedisConnection();

  const attempts = await redis.get(getLoginAttemptsKey(ipAddress));
  const totalAttempts = Number(attempts ?? 0);

  if (totalAttempts >= LOGIN_ATTEMPT_LIMIT) {
    throw new AppError(
      429,
      "Too many login attempts. Try again later.",
      "LOGIN_RATE_LIMITED",
    );
  }
}

async function registerFailedLoginAttempt(ipAddress: string) {
  await ensureRedisConnection();

  const key = getLoginAttemptsKey(ipAddress);
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, LOGIN_ATTEMPT_WINDOW_SECONDS);
  }
}

async function clearLoginAttempts(ipAddress: string) {
  await ensureRedisConnection();
  await redis.del(getLoginAttemptsKey(ipAddress));
}

function buildAuthTokens(user: AuthenticatedUser): AuthTokens {
  const mappedUser = mapUser(user);

  return {
    accessToken: buildAccessToken(mappedUser),
    refreshToken: buildRefreshToken(mappedUser),
    user: mappedUser,
  };
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new AppError(409, "Email already in use", "EMAIL_ALREADY_IN_USE");
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return {
    user: mapUser(user),
  };
}

export async function loginUser(input: LoginInput, ipAddress: string) {
  await assertLoginRateLimit(ipAddress);

  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    await registerFailedLoginAttempt(ipAddress);
    throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    await registerFailedLoginAttempt(ipAddress);
    throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  await clearLoginAttempts(ipAddress);

  const tokens = buildAuthTokens(user);
  await persistRefreshToken(user.id, tokens.refreshToken);

  return tokens;
}

export function verifyAccessToken(token: string) {
  const payload = verifyAccessPayload(token);

  return mapUser({
    id: payload.sub,
    email: payload.email,
    name: payload.name ?? null,
    role: payload.role,
  });
}

export async function refreshUserSession(refreshToken: string) {
  const payload = verifyRefreshPayload(refreshToken);
  const now = new Date();
  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!storedToken) {
    throw new AppError(401, "Refresh token not recognized", "INVALID_REFRESH_TOKEN");
  }

  if (storedToken.revokedAt || storedToken.expiresAt <= now) {
    await revokeAllUserRefreshTokens(storedToken.userId);
    throw new AppError(401, "Refresh token has been invalidated", "INVALID_REFRESH_TOKEN");
  }

  if (payload.sub !== storedToken.userId) {
    await revokeAllUserRefreshTokens(storedToken.userId);
    throw new AppError(401, "Refresh token mismatch", "INVALID_REFRESH_TOKEN");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: storedToken.userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    await revokeAllUserRefreshTokens(storedToken.userId);
    throw new AppError(401, "User no longer exists", "INVALID_REFRESH_TOKEN");
  }

  const nextTokens = buildAuthTokens(user);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: now,
      },
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(nextTokens.refreshToken),
        userId: user.id,
        expiresAt: new Date(
          Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
    }),
  ]);

  return nextTokens;
}

export async function logoutUser(refreshToken?: string) {
  if (!refreshToken) {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}