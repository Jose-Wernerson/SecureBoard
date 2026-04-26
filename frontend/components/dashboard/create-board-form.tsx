"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBoardRequest } from "@/lib/api/boards";
import { queryKeys } from "@/lib/query-keys";
import type { ApiError } from "@/types/auth";

const createBoardSchema = z.object({
  title: z.string().trim().min(1, "Informe um título para o board.").max(120, "Use no máximo 120 caracteres."),
  description: z.string().trim().max(5000, "Use no máximo 5000 caracteres.").optional(),
});

type CreateBoardFormData = z.infer<typeof createBoardSchema>;

export function CreateBoardForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<CreateBoardFormData>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createBoardRequest,
    onSuccess: () => {
      reset();
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.list });
    },
    onError: (error: ApiError) => {
      const fieldErrors = error.errors?.fieldErrors ?? {};

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        const message = messages?.[0];

        if (message && (field === "title" || field === "description")) {
          setError(field, { message });
        }
      });
    },
  });

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">Create board</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Novo board</h2>
        </div>

        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-slate-950">
          <Plus className="h-6 w-6" />
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="board-title">
            Título
          </label>
          <Input id="board-title" placeholder="Ex.: Product roadmap" {...register("title")} />
          {errors.title ? <p className="text-sm text-rose-300">{errors.title.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="board-description">
            Descrição
          </label>
          <Textarea id="board-description" placeholder="Contexto do board, objetivos e instruções para o time." {...register("description")} />
          {errors.description ? <p className="text-sm text-rose-300">{errors.description.message}</p> : null}
        </div>

        {mutation.error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{mutation.error.message}</p> : null}

        <Button className="h-12 w-full" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "Criando..." : "Criar board"}
        </Button>
      </form>
    </section>
  );
}
