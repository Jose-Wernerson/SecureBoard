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

const registerSchema = z.object({
  name: z.string().trim().min(2, "Informe pelo menos 2 caracteres.").max(80, "Use no máximo 80 caracteres."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z
    .string()
    .min(12, "A senha precisa ter ao menos 12 caracteres.")
    .max(128, "A senha precisa ter no máximo 128 caracteres.")
    .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula.")
    .regex(/[a-z]/, "Inclua ao menos uma letra minúscula.")
    .regex(/\d/, "Inclua ao menos um número.")
    .regex(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/, "Inclua ao menos um caractere especial."),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, status } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  async function onSubmit(values: RegisterFormData) {
    setApiError(null);

    try {
      await registerUser(values);
      router.replace("/dashboard");
    } catch (error) {
      const apiResponse = error as ApiError;
      const fieldErrors = apiResponse.errors?.fieldErrors ?? {};

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        const message = messages?.[0];

        if (message && (field === "name" || field === "email" || field === "password")) {
          setError(field, { message });
        }
      });

      setApiError(apiResponse.message);
    }
  }

  return (
    <AuthShell
      eyebrow="Sign up"
      title="Criar uma conta"
      description="Cadastre um usuário para acessar o painel, criar boards e experimentar o fluxo completo de autenticação."
      footer={
        <>
          Já possui acesso?{" "}
          <Link className="font-semibold text-lime-200 hover:text-lime-100" href="/login">
            Entrar agora
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="name">
            Nome
          </label>
          <Input id="name" placeholder="Seu nome" type="text" {...register("name")} />
          {errors.name ? <p className="text-sm text-rose-300">{errors.name.message}</p> : null}
        </div>

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
          <Input id="password" placeholder="Crie uma senha forte" type="password" {...register("password")} />
          {errors.password ? <p className="text-sm text-rose-300">{errors.password.message}</p> : null}
        </div>

        {apiError ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{apiError}</p> : null}

        <Button className="h-12 w-full" disabled={isSubmitting || status === "loading"} type="submit">
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </AuthShell>
  );
}
