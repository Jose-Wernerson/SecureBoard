import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";

import { createRedisMock } from "../helpers/mock-redis.js";
import { disconnectDatabase, resetDatabase } from "../helpers/test-db.js";

const redisMock = createRedisMock();

jest.unstable_mockModule("../../src/services/redis.js", () => ({
  redis: redisMock,
}));

describe("auth integration", () => {
  let createTestApp: typeof import("../helpers/test-app.js").createTestApp;
  let refreshTokenCookieName: string;
  let app: Awaited<ReturnType<typeof import("../helpers/test-app.js").createTestApp>>;

  beforeAll(async () => {
    const [{ createTestApp: createApp }, authService] = await Promise.all([
      import("../helpers/test-app.js"),
      import("../../src/services/auth.service.js"),
    ]);

    createTestApp = createApp;
    refreshTokenCookieName = authService.REFRESH_TOKEN_COOKIE;
    app = await createTestApp();
  });

  beforeEach(async () => {
    redisMock.reset();
    await resetDatabase();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    await disconnectDatabase();
  });

  it("registers and logs in a user", async () => {
    const registerResponse = await request(app.server)
      .post("/auth/register")
      .send({
        email: "alice@example.com",
        name: "Alice",
        password: "StrongPassword123!",
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user).toMatchObject({
      email: "alice@example.com",
      name: "Alice",
      role: "member",
    });

    const loginResponse = await request(app.server)
      .post("/auth/login")
      .send({
        email: "alice@example.com",
        password: "StrongPassword123!",
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toEqual(expect.any(String));
    expect(loginResponse.body.user.email).toBe("alice@example.com");
    expect(String(loginResponse.headers["set-cookie"])).toContain(refreshTokenCookieName);
  });

  it("rejects protected routes without bearer token", async () => {
    const response = await request(app.server).get("/boards");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Missing bearer token",
      code: "MISSING_BEARER_TOKEN",
    });
  });

  it("rate limits login after six failed attempts", async () => {
    await request(app.server)
      .post("/auth/register")
      .send({
        email: "alice@example.com",
        name: "Alice",
        password: "StrongPassword123!",
      })
      .expect(201);

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await request(app.server)
        .post("/auth/login")
        .send({
          email: "alice@example.com",
          password: "WrongPassword123!",
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe("INVALID_CREDENTIALS");
    }

    const limitedResponse = await request(app.server)
      .post("/auth/login")
      .send({
        email: "alice@example.com",
        password: "WrongPassword123!",
      });

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.body).toEqual({
      message: "Too many login attempts. Try again later.",
      code: "LOGIN_RATE_LIMITED",
    });
  });
});