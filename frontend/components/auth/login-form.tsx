"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import type { ApiError } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, status } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  async function onSubmit(values: LoginFormData) {
    setApiError(null);

    try {
      await login(values);
      router.replace("/dashboard");
    } catch (error) {
      const apiResponse = error as ApiError;
      const fieldErrors = apiResponse.errors?.fieldErrors ?? {};

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        const message = messages?.[0];

        if (message && (field === "email" || field === "password")) {
          setError(field, { message });
        }
      });

      setApiError(apiResponse.message);
    }
  }

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Entrar na sua conta"
      description="Use suas credenciais para acessar o dashboard e continuar organizando seus boards."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link className="font-semibold text-lime-200 hover:text-lime-100" href="/register">
            Criar conta
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="email">
            E-mail
          </label>
          <Input id="email" placeholder="voce@empresa.com" type="email" {...register("email")} />
          {errors.email ? <p className="text-sm text-rose-300">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="password">
            Senha
          </label>
          <Input id="password" placeholder="Sua senha segura" type="password" {...register("password")} />
          {errors.password ? <p className="text-sm text-rose-300">{errors.password.message}</p> : null}
        </div>

        {apiError ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{apiError}</p> : null}

        <Button className="h-12 w-full" disabled={isSubmitting || status === "loading"} type="submit">
          {isSubmitting ? "Autenticando..." : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}
