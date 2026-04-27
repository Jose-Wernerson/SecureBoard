"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { CardEditModal } from "@/components/boards/card-edit-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import type { CardRecord } from "@/types/board";

type BoardCardItemProps = {
  card: CardRecord;
  isDragOverlay?: boolean;
  isDeleting?: boolean;
  isUpdating?: boolean;
  onDelete?: () => Promise<void>;
  onUpdate?: (input: { title: string; description?: string }) => Promise<void>;
};

export function BoardCardItem({
  card,
  isDragOverlay = false,
  isDeleting = false,
  isUpdating = false,
  onDelete,
  onUpdate,
}: BoardCardItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const sortable = useSortable({
    id: card.id,
    data: {
      type: "card",
      cardId: card.id,
      columnId: card.columnId,
    },
    disabled: isDragOverlay,
  });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      };

  return (
    <>
      <article
        ref={isDragOverlay ? undefined : sortable.setNodeRef}
        className={cn(
          "rounded-[1.4rem] border border-white/10 bg-slate-950/72 p-4 shadow-lg shadow-black/20",
          !isDragOverlay && "touch-none",
          sortable.isDragging && "opacity-40",
        )}
        style={style}
      >
        <div className="flex items-start gap-3">
          <button
            className="mt-0.5 rounded-xl p-1 text-slate-500 transition hover:bg-white/8 hover:text-white"
            type="button"
            {...(isDragOverlay ? {} : sortable.attributes)}
            {...(isDragOverlay ? {} : sortable.listeners)}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-semibold text-white">{card.title}</h4>

              {!isDragOverlay ? (
                <div className="flex items-center gap-1">
                  <button
                    className="rounded-xl p-1.5 text-slate-500 transition hover:bg-white/8 hover:text-white"
                    onClick={() => setIsEditOpen(true)}
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-xl p-1.5 text-slate-500 transition hover:bg-rose-500/12 hover:text-rose-200"
                    onClick={() => {
                      setConfirmError(null);
                      setIsConfirmOpen(true);
                    }}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>

            <p className="text-sm leading-6 text-slate-400">{card.description ?? "Sem descrição."}</p>
          </div>
        </div>
      </article>

      {!isDragOverlay && onUpdate ? (
        <CardEditModal
          card={card}
          isPending={isUpdating}
          onClose={() => {
            if (!isUpdating) {
              setIsEditOpen(false);
            }
          }}
          onSubmit={onUpdate}
          open={isEditOpen}
        />
      ) : null}

      {!isDragOverlay && onDelete ? (
        <ConfirmDialog
          confirmLabel="Excluir card"
          description="Tem certeza? O card será removido da coluna e a ordenação restante será recompactada."
          errorMessage={confirmError}
          isPending={isDeleting}
          onClose={() => {
            if (!isDeleting) {
              setIsConfirmOpen(false);
              setConfirmError(null);
            }
          }}
          onConfirm={async () => {
            setConfirmError(null);

            try {
              await onDelete();
              setIsConfirmOpen(false);
            } catch (error) {
              setConfirmError(error instanceof Error ? error.message : "Nao foi possivel excluir o card.");
            }
          }}
          open={isConfirmOpen}
          title="Excluir card"
        />
      ) : null}
    </>
  );
}
