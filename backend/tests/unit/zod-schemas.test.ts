import { describe, expect, it } from "@jest/globals";

import { loginSchema, registerSchema } from "../../src/modules/auth/auth.schema.js";
import {
  createBoardSchema,
  updateBoardSchema,
} from "../../src/modules/boards/board.schema.js";

describe("zod schemas", () => {
  it("normalizes register payloads and accepts strong passwords", () => {
    const payload = registerSchema.parse({
      email: "  USER@Example.COM  ",
      name: "  Alice Doe  ",
      password: "StrongPassword123!",
    });

    expect(payload).toEqual({
      email: "user@example.com",
      name: "Alice Doe",
      password: "StrongPassword123!",
    });
  });

  it("rejects weak passwords during registration", () => {
    expect(() => registerSchema.parse({
      email: "user@example.com",
      name: "Alice",
      password: "weak",
    })).toThrow();
  });

  it("normalizes login payload email", () => {
    const payload = loginSchema.parse({
      email: "  USER@Example.COM  ",
      password: "StrongPassword123!",
    });

    expect(payload.email).toBe("user@example.com");
  });

  it("rejects empty board updates", () => {
    expect(() => updateBoardSchema.parse({})).toThrow("At least one field must be provided");
  });

  it("accepts valid board creation payloads", () => {
    const payload = createBoardSchema.parse({
      title: "Platform roadmap",
      description: "Quarterly board",
    });

    expect(payload).toEqual({
      title: "Platform roadmap",
      description: "Quarterly board",
    });
  });
});