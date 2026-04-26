import { existsSync } from "node:fs";
import path from "node:path";

import { config as loadEnv } from "dotenv";

const envTestPath = path.resolve(process.cwd(), ".env.test");

if (existsSync(envTestPath)) {
  loadEnv({ path: envTestPath, override: true });
}

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.DATABASE_TEST_URL ?? process.env.DATABASE_URL;
process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? "test-access-secret-with-at-least-32-chars";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret-with-at-least-32-chars";
process.env.ACCESS_TOKEN_TTL_MINUTES = process.env.ACCESS_TOKEN_TTL_MINUTES ?? "15";
process.env.REFRESH_TOKEN_TTL_DAYS = process.env.REFRESH_TOKEN_TTL_DAYS ?? "7";
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ?? "12";
process.env.COOKIE_SECURE = process.env.COOKIE_SECURE ?? "false";