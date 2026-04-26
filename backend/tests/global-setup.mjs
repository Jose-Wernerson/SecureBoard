import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { config as loadEnv } from "dotenv";

const rootDir = process.cwd();
export default async function globalSetup() {
  const envTestPath = path.join(rootDir, ".env.test");

  if (existsSync(envTestPath)) {
    loadEnv({ path: envTestPath, override: true });
  }

  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = process.env.DATABASE_TEST_URL ?? process.env.DATABASE_URL;
  process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
  process.env.JWT_ACCESS_SECRET =
    process.env.JWT_ACCESS_SECRET ?? "test-access-secret-with-at-least-32-chars";
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret-with-at-least-32-chars";
  process.env.ACCESS_TOKEN_TTL_MINUTES = process.env.ACCESS_TOKEN_TTL_MINUTES ?? "15";
  process.env.REFRESH_TOKEN_TTL_DAYS = process.env.REFRESH_TOKEN_TTL_DAYS ?? "7";
  process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ?? "12";
  process.env.COOKIE_SECURE = process.env.COOKIE_SECURE ?? "false";

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL or DATABASE_TEST_URL must be defined for tests");
  }

  execSync("npx prisma migrate deploy", {
    cwd: rootDir,
    env: process.env,
    shell: true,
    stdio: "inherit",
  });
}