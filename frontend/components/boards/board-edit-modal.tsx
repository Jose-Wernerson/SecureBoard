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
import type { BoardRecord } from "@/types/board";

const schema = z.object({
  title: z.string().trim().min(1, "Informe um título para o board.").max(120, "Use no máximo 120 caracteres."),
  description: z.string().trim().max(5000, "Use no máximo 5000 caracteres.").optional(),
});

type BoardEditFormData = z.infer<typeof schema>;

type BoardEditModalProps = {
  board: BoardRecord;
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: BoardEditFormData) => Promise<void>;
};

export function BoardEditModal({ board, open, isPending, onClose, onSubmit }: BoardEditModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BoardEditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: board.title,
      description: board.description ?? "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      title: board.title,
      description: board.description ?? "",
    });
    setApiError(null);
  }, [board.description, board.title, open, reset]);

  async function submit(values: BoardEditFormData) {
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
      description="Atualize o nome e a descrição do board. O cache do dashboard e da visualização será sincronizado após salvar."
      footer={(
        <>
          <Button disabled={isPending} onClick={onClose} type="button" variant="ghost">
            Cancelar
          </Button>
          <Button disabled={isPending} form="board-edit-form" type="submit">
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </>
      )}
      onClose={onClose}
      open={open}
      title="Editar board"
    >
      <form className="space-y-4" id="board-edit-form" onSubmit={handleSubmit(submit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="edit-board-title">
            Título
          </label>
          <Input id="edit-board-title" {...register("title")} />
          {errors.title ? <p className="text-sm text-rose-300">{errors.title.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="edit-board-description">
            Descrição
          </label>
          <Textarea className="min-h-32" id="edit-board-description" {...register("description")} />
          {errors.description ? <p className="text-sm text-rose-300">{errors.description.message}</p> : null}
        </div>

        {apiError ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{apiError}</p> : null}
      </form>
    </Modal>
  );
}