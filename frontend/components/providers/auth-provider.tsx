"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getCurrentUserRequest, loginRequest, logoutRequest, registerRequest } from "@/lib/api/auth";
import { clearSession, getSessionSnapshot, hydrateSession, setSession, subscribeSession, subscribeUnauthenticated } from "@/lib/auth-session";
import { queryKeys } from "@/lib/query-keys";
import type { ApiError, AuthUser, LoginInput, RegisterInput } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  accessToken: string | null;
  status: AuthStatus;
  user: AuthUser | null;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [snapshot, setSnapshot] = useState(() => hydrateSession());
  const [status, setStatus] = useState<AuthStatus>(() => (getSessionSnapshot().accessToken ? "loading" : "unauthenticated"));

  useEffect(() => {
    const unsubscribeSession = subscribeSession((nextSnapshot) => {
      setSnapshot(nextSnapshot);
    });
    const unsubscribeUnauthenticated = subscribeUnauthenticated(() => {
      setStatus("unauthenticated");
    });

    const currentSnapshot = getSessionSnapshot();

    if (!currentSnapshot.accessToken) {
      return () => {
        unsubscribeSession();
        unsubscribeUnauthenticated();
      };
    }

    const accessToken = currentSnapshot.accessToken;

    let isMounted = true;

    void (async () => {
      try {
        const response = await getCurrentUserRequest();

        if (!isMounted) {
          return;
        }

        setSession({
          accessToken,
          user: response.user,
        });
        queryClient.setQueryData(queryKeys.auth.me, response);
        setStatus("authenticated");
      } catch {
        if (!isMounted) {
          return;
        }

        clearSession();
        queryClient.removeQueries({ queryKey: queryKeys.auth.me });
        setStatus("unauthenticated");
      }
    })();

    return () => {
      isMounted = false;
      unsubscribeSession();
      unsubscribeUnauthenticated();
    };
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: snapshot.accessToken,
      status,
      user: snapshot.user,
      async login(input) {
        setStatus("loading");

        try {
          const response = await loginRequest(input);
          setSession(response);
          queryClient.setQueryData(queryKeys.auth.me, { user: response.user });
          setStatus("authenticated");

          return response.user;
        } catch (error) {
          setStatus("unauthenticated");
          throw error as ApiError;
        }
      },
      async register(input) {
        setStatus("loading");

        try {
          await registerRequest(input);
          const response = await loginRequest({
            email: input.email,
            password: input.password,
          });

          setSession(response);
          queryClient.setQueryData(queryKeys.auth.me, { user: response.user });
          setStatus("authenticated");

          return response.user;
        } catch (error) {
          setStatus("unauthenticated");
          throw error as ApiError;
        }
      },
      async logout() {
        try {
          await logoutRequest();
        } finally {
          clearSession();
          queryClient.removeQueries({ queryKey: queryKeys.auth.me });
          queryClient.removeQueries({ queryKey: queryKeys.boards.list });
          setStatus("unauthenticated");
        }
      },
    }),
    [queryClient, snapshot.accessToken, snapshot.user, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
