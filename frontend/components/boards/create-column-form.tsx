"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiError } from "@/types/auth";

const schema = z.object({
  title: z.string().trim().min(1, "Informe um título.").max(120, "Use no máximo 120 caracteres."),
});

type CreateColumnFormData = z.infer<typeof schema>;

type CreateColumnFormProps = {
  isPending: boolean;
  onSubmit: (input: CreateColumnFormData) => Promise<void>;
};

export function CreateColumnForm({ isPending, onSubmit }: CreateColumnFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateColumnFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
    },
  });

  async function submit(values: CreateColumnFormData) {
    setApiError(null);

    try {
      await onSubmit(values);
      reset();
    } catch (error) {
      setApiError((error as ApiError).message);
    }
  }

  return (
    <section className="w-[320px] min-w-[320px] rounded-[1.8rem] border border-dashed border-white/14 bg-white/5 p-4">
      <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-slate-300">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          <Plus className="h-5 w-5" />
        </span>
        Nova coluna
      </div>

      <form className="space-y-3" onSubmit={handleSubmit(submit)}>
        <Input placeholder="Ex.: In progress" {...register("title")} />
        {errors.title ? <p className="text-sm text-rose-300">{errors.title.message}</p> : null}
        {apiError ? <p className="text-sm text-rose-300">{apiError}</p> : null}
        <Button className="h-11 w-full" disabled={isPending} type="submit" variant="secondary">
          {isPending ? "Criando..." : "Adicionar coluna"}
        </Button>
      </form>
    </section>
  );
}
