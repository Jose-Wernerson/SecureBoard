import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import { clearSession, getSessionSnapshot, notifyUnauthenticated, setSession } from "@/lib/auth-session";
import { env } from "@/lib/env";
import type { ApiError, AuthResponse } from "@/types/auth";

type RequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

type ErrorPayload = {
  message?: string;
  code?: string;
  errors?: ApiError["errors"];
};

const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

let refreshPromise: Promise<AuthResponse> | null = null;

function applyAccessToken(config: RequestConfig, token: string) {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;

  return config;
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ErrorPayload>(error)) {
    return {
      statusCode: error.response?.status ?? 500,
      message: error.response?.data?.message ?? error.message ?? "Request failed",
      code: error.response?.data?.code,
      errors: error.response?.data?.errors,
    };
  }

  return {
    statusCode: 500,
    message: error instanceof Error ? error.message : "Unexpected error",
  };
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = refreshClient.post<AuthResponse>("/auth/refresh").then((response) => response.data);
    refreshPromise.finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const request = config as RequestConfig;
  const token = getSessionSnapshot().accessToken;

  if (!token) {
    return request;
  }

  return applyAccessToken(request, token);
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorPayload>) => {
    const request = error.config as RequestConfig | undefined;
    const statusCode = error.response?.status;
    const requestUrl = request?.url ?? "";
    const shouldSkipRefresh =
      request?._retry ||
      request?.skipAuthRefresh ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (statusCode !== 401 || !request || shouldSkipRefresh) {
      return Promise.reject(toApiError(error));
    }

    try {
      request._retry = true;
      const refreshedSession = await refreshSession();
      setSession(refreshedSession);
      applyAccessToken(request, refreshedSession.accessToken);

      return api(request);
    } catch (refreshError) {
      clearSession();
      notifyUnauthenticated();

      return Promise.reject(toApiError(refreshError));
    }
  },
);

export { api };
