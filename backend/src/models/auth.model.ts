import type { User } from "@prisma/client";

export type AuthenticatedUser = Pick<User, "id" | "email" | "name" | "role">;

export type AccessTokenPayload = AuthenticatedUser & {
  sub: string;
  type: "access";
};

export type RefreshTokenPayload = AuthenticatedUser & {
  sub: string;
  jti: string;
  type: "refresh";
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
};