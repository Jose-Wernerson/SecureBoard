"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ApiError } from "@/types/auth";

const schema = z.object({
  title: z.string().trim().min(1, "Informe um título para o card.").max(200, "Use no máximo 200 caracteres."),
  description: z.string().trim().max(10000, "Use no máximo 10000 caracteres.").optional(),
});

type CreateCardFormData = z.infer<typeof schema>;

type CreateCardFormProps = {
  isPending: boolean;
  onSubmit: (input: CreateCardFormData) => Promise<void>;
};

export function CreateCardForm({ isPending, onSubmit }: CreateCardFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCardFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function submit(values: CreateCardFormData) {
    setApiError(null);

    try {
      await onSubmit(values);
      reset();
    } catch (error) {
      setApiError((error as ApiError).message);
    }
  }

  return (
    <form className="space-y-3 border-t border-white/10 pt-4" onSubmit={handleSubmit(submit)}>
      <Input placeholder="Novo card" {...register("title")} />
      {errors.title ? <p className="text-sm text-rose-300">{errors.title.message}</p> : null}

      <Textarea className="min-h-24" placeholder="Descrição opcional" {...register("description")} />
      {errors.description ? <p className="text-sm text-rose-300">{errors.description.message}</p> : null}

      {apiError ? <p className="text-sm text-rose-300">{apiError}</p> : null}

      <Button className="h-11 w-full" disabled={isPending} type="submit" variant="secondary">
        {isPending ? "Salvando..." : "Adicionar card"}
      </Button>
    </form>
  );
}
