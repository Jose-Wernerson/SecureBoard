import { describe, expect, it } from "@jest/globals";

import {
  decodeRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyAccessToken,
  verifyPassword,
} from "../../src/modules/auth/auth.security.js";
import { AppError } from "../../src/utils/app-error.js";

const user = {
  id: "user_test_123",
  email: "alice@example.com",
  name: "Alice",
  role: "member",
};

describe("auth security", () => {
  it("hashes the password and validates it correctly", async () => {
    const password = "StrongPassword123!";
    const passwordHash = await hashPassword(password);

    expect(passwordHash).not.toBe(password);
    await expect(verifyPassword(password, passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("WrongPassword123!", passwordHash)).resolves.toBe(false);
  });

  it("generates and validates an access token", () => {
    const accessToken = generateAccessToken(user);

    expect(verifyAccessToken(accessToken)).toEqual(user);
  });

  it("generates and validates a refresh token payload", () => {
    const refreshToken = generateRefreshToken(user);
    const payload = decodeRefreshToken(refreshToken);

    expect(payload.sub).toBe(user.id);
    expect(payload.email).toBe(user.email);
    expect(payload.type).toBe("refresh");
    expect(typeof payload.jti).toBe("string");
  });

  it("rejects a tampered access token", () => {
    const accessToken = generateAccessToken(user);
    const tamperedToken = `${accessToken}broken`;

    expect(() => verifyAccessToken(tamperedToken)).toThrow(AppError);
    expect(() => verifyAccessToken(tamperedToken)).toThrow(
      "Invalid or expired access token",
    );
  });
});