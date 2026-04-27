"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isPending?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isPending = false,
  errorMessage,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      description={description}
      footer={(
        <>
          <Button disabled={isPending} onClick={onClose} type="button" variant="ghost">
            Cancelar
          </Button>
          <Button disabled={isPending} onClick={() => void onConfirm()} type="button" variant="danger">
            {isPending ? "Processando..." : confirmLabel}
          </Button>
        </>
      )}
      onClose={onClose}
      open={open}
      title={title}
    >
      <div className="rounded-[1.6rem] border border-rose-400/15 bg-rose-500/10 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-400/15 text-rose-200">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-rose-100">Ação destrutiva</p>
            <p className="mt-2 text-sm leading-7 text-rose-100/80">Essa ação não pode ser desfeita. Confira se você está removendo o item correto.</p>
          </div>
        </div>
      </div>

      {errorMessage ? <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{errorMessage}</p> : null}
    </Modal>
  );
}