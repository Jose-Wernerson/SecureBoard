"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import type { ApiError } from "@/types/auth";
import type { CardRecord } from "@/types/board";

const schema = z.object({
  title: z.string().trim().min(1, "Informe um título para o card.").max(200, "Use no máximo 200 caracteres."),
  description: z.string().trim().max(10000, "Use no máximo 10000 caracteres.").optional(),
});

type CardEditFormData = z.infer<typeof schema>;

type CardEditModalProps = {
  card: CardRecord;
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: CardEditFormData) => Promise<void>;
};

export function CardEditModal({ card, open, isPending, onClose, onSubmit }: CardEditModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CardEditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: card.title,
      description: card.description ?? "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      title: card.title,
      description: card.description ?? "",
    });
    setApiError(null);
  }, [card.description, card.title, open, reset]);

  async function submit(values: CardEditFormData) {
    setApiError(null);

    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      const apiResponse = error as ApiError;
      const fieldErrors = apiResponse.errors?.fieldErrors ?? {};

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        const message = messages?.[0];

        if (message && (field === "title" || field === "description")) {
          setError(field, { message });
        }
      });

      setApiError(apiResponse.message);
    }
  }

  return (
    <Modal
      description="Edite o conteúdo do card. A lista da coluna e o board serão atualizados no cache local."
      footer={(
        <>
          <Button disabled={isPending} onClick={onClose} type="button" variant="ghost">
            Cancelar
          </Button>
          <Button disabled={isPending} form="card-edit-form" type="submit">
            {isPending ? "Salvando..." : "Salvar card"}
          </Button>
        </>
      )}
      onClose={onClose}
      open={open}
      title="Editar card"
    >
      <form className="space-y-4" id="card-edit-form" onSubmit={handleSubmit(submit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="edit-card-title">
            Título
          </label>
          <Input id="edit-card-title" {...register("title")} />
          {errors.title ? <p className="text-sm text-rose-300">{errors.title.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="edit-card-description">
            Descrição
          </label>
          <Textarea className="min-h-32" id="edit-card-description" {...register("description")} />
          {errors.description ? <p className="text-sm text-rose-300">{errors.description.message}</p> : null}
        </div>

        {apiError ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{apiError}</p> : null}
      </form>
    </Modal>
  );
}