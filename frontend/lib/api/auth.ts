import { api } from "@/lib/api/client";
import type { AuthResponse, LoginInput, MeResponse, RegisterInput } from "@/types/auth";

export async function loginRequest(input: LoginInput) {
  const response = await api.post<AuthResponse>("/auth/login", input);

  return response.data;
}

export async function registerRequest(input: RegisterInput) {
  const response = await api.post<{ user: AuthResponse["user"] }>("/auth/register", input);

  return response.data;
}

export async function logoutRequest() {
  await api.post("/auth/logout");
}

export async function getCurrentUserRequest() {
  const response = await api.get<MeResponse>("/auth/me");

  return response.data;
}
