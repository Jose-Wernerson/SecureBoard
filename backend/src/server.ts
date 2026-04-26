import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./services/prisma.js";
import { redis } from "./services/redis.js";

const app = buildApp();

const start = async () => {
  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

const shutdown = async (signal: NodeJS.Signals) => {
  app.log.info({ signal }, "Shutting down SecureBoard API");

  await app.close();
  await Promise.allSettled([prisma.$disconnect(), redis.quit()]);

  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await start();