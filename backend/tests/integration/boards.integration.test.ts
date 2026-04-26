import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";

import { createRedisMock } from "../helpers/mock-redis.js";
import { disconnectDatabase, resetDatabase } from "../helpers/test-db.js";

const redisMock = createRedisMock();

jest.unstable_mockModule("../../src/services/redis.js", () => ({
  redis: redisMock,
}));

type AuthSession = {
  accessToken: string;
  userId: string;
};

describe("boards integration", () => {
  let createTestApp: typeof import("../helpers/test-app.js").createTestApp;
  let app: Awaited<ReturnType<typeof import("../helpers/test-app.js").createTestApp>>;

  beforeAll(async () => {
    ({ createTestApp } = await import("../helpers/test-app.js"));
    app = await createTestApp();
  });

  beforeEach(async () => {
    redisMock.reset();
    await resetDatabase();
  });

  afterAll(async () => {
    await app.close();
    await disconnectDatabase();
  });

  async function createSession(email: string): Promise<AuthSession> {
    const password = "StrongPassword123!";

    const registerResponse = await request(app.server)
      .post("/auth/register")
      .send({
        email,
        name: email.split("@")[0],
        password,
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app.server)
      .post("/auth/login")
      .send({
        email,
        password,
      });

    expect(loginResponse.status).toBe(200);

    return {
      accessToken: loginResponse.body.accessToken,
      userId: registerResponse.body.user.id,
    };
  }

  it("creates, lists, fetches, updates and deletes a board", async () => {
    const session = await createSession("owner@example.com");

    const createResponse = await request(app.server)
      .post("/boards")
      .set("authorization", `Bearer ${session.accessToken}`)
      .send({
        title: "Platform roadmap",
        description: "Initial scope",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe("Platform roadmap");
    const boardId = createResponse.body.id as string;

    const listResponse = await request(app.server)
      .get("/boards")
      .set("authorization", `Bearer ${session.accessToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.boards).toHaveLength(1);
    expect(listResponse.body.boards[0].id).toBe(boardId);

    const getResponse = await request(app.server)
      .get(`/boards/${boardId}`)
      .set("authorization", `Bearer ${session.accessToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(boardId);

    const updateResponse = await request(app.server)
      .patch(`/boards/${boardId}`)
      .set("authorization", `Bearer ${session.accessToken}`)
      .send({
        title: "Updated roadmap",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.title).toBe("Updated roadmap");

    const deleteResponse = await request(app.server)
      .delete(`/boards/${boardId}`)
      .set("authorization", `Bearer ${session.accessToken}`);

    expect(deleteResponse.status).toBe(204);

    const afterDeleteResponse = await request(app.server)
      .get(`/boards/${boardId}`)
      .set("authorization", `Bearer ${session.accessToken}`);

    expect(afterDeleteResponse.status).toBe(404);
    expect(afterDeleteResponse.body.code).toBe("BOARD_NOT_FOUND");
  });

  it("returns 403 when another user tries to access the board", async () => {
    const owner = await createSession("owner@example.com");
    const intruder = await createSession("intruder@example.com");

    const createResponse = await request(app.server)
      .post("/boards")
      .set("authorization", `Bearer ${owner.accessToken}`)
      .send({
        title: "Private board",
      });

    expect(createResponse.status).toBe(201);

    const response = await request(app.server)
      .get(`/boards/${createResponse.body.id}`)
      .set("authorization", `Bearer ${intruder.accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "Forbidden board access",
      code: "FORBIDDEN_BOARD_ACCESS",
    });
  });
});