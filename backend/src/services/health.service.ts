import { prisma } from "./prisma.js";
import { redis } from "./redis.js";
import type { DependencyStatus, HealthStatusResult } from "../models/health.model.js";

async function checkDatabase(): Promise<DependencyStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "up";
  } catch {
    return "down";
  }
}

async function checkRedis(): Promise<DependencyStatus> {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

    await redis.ping();
    return "up";
  } catch {
    return "down";
  }
}

export async function getHealthStatus(): Promise<HealthStatusResult> {
  const [database, redisStatus] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);

  const status =
    database === "up" && redisStatus === "up" ? "ok" : "degraded";

  return {
    httpStatus: status === "ok" ? 200 : 503,
    payload: {
      service: "secureboard-api",
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      connections: {
        database,
        redis: redisStatus,
      },
    },
  };
}