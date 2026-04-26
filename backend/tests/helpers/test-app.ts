import { buildApp } from "../../src/app.js";

export async function createTestApp() {
  const app = buildApp();
  await app.ready();
  return app;
}