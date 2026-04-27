"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";

import { BoardCardItem } from "@/components/boards/board-card-item";
import { CreateCardForm } from "@/components/boards/create-card-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import type { ColumnRecord } from "@/types/board";

type BoardColumnProps = {
  column: ColumnRecord;
  isCreatingCard: boolean;
  isDeleting: boolean;
  onCreateCard: (input: { title: string; description?: string }) => Promise<void>;
  onDeleteColumn: () => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
  onUpdateCard: (cardId: string, input: { title: string; description?: string }) => Promise<void>;
  deletingCardId: string | null;
  updatingCardId: string | null;
};

export function BoardColumn({
  column,
  isCreatingCard,
  isDeleting,
  onCreateCard,
  onDeleteColumn,
  onDeleteCard,
  onUpdateCard,
  deletingCardId,
  updatingCardId,
}: BoardColumnProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: column.id,
    data: {
      type: "column",
      columnId: column.id,
    },
  });
  const { isOver, setNodeRef: setDropzoneRef } = useDroppable({
    id: `column-dropzone-${column.id}`,
    data: {
      type: "column-dropzone",
      columnId: column.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[320px] min-w-[320px] flex-col rounded-[1.8rem] border border-white/10 bg-white/6 p-4 shadow-xl shadow-black/15 backdrop-blur",
        isDragging && "opacity-45",
      )}
      style={style}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">Coluna</p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">{column.title}</h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-rose-500/12 hover:text-rose-200"
            onClick={() => {
              setConfirmError(null);
              setIsConfirmOpen(true);
            }}
            type="button"
          >
            <Trash2 className="h-5 w-5" />
          </button>

          <button className="rounded-2xl p-2 text-slate-400 hover:bg-white/8 hover:text-white" type="button" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        ref={setDropzoneRef}
        className={cn(
          "flex min-h-32 flex-1 flex-col gap-3 rounded-[1.4rem] border border-transparent p-1 transition",
          isOver && "border-lime-300/25 bg-lime-300/6",
        )}
      >
        <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {column.cards.length ? (
            column.cards.map((card) => (
              <BoardCardItem
                card={card}
                isDeleting={deletingCardId === card.id}
                isUpdating={updatingCardId === card.id}
                key={card.id}
                onDelete={() => onDeleteCard(card.id)}
                onUpdate={(input) => onUpdateCard(card.id, input)}
              />
            ))
          ) : (
            <div className="rounded-[1.3rem] border border-dashed border-white/12 bg-slate-950/50 px-4 py-8 text-center text-sm text-slate-500">
              Arraste um card para esta coluna ou crie um novo item abaixo.
            </div>
          )}
        </SortableContext>
      </div>

      <div className="mt-4">
        <CreateCardForm isPending={isCreatingCard} onSubmit={onCreateCard} />
      </div>

      <ConfirmDialog
        confirmLabel="Excluir coluna"
        description="Tem certeza? Todos os cards dessa coluna serão removidos em cascata pelo backend."
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
            await onDeleteColumn();
            setIsConfirmOpen(false);
          } catch (error) {
            setConfirmError(error instanceof Error ? error.message : "Nao foi possivel excluir a coluna.");
          }
        }}
        open={isConfirmOpen}
        title="Excluir coluna"
      />
    </section>
  );
}
