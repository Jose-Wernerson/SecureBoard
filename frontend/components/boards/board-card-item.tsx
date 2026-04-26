"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CardRecord } from "@/types/board";

type BoardCardItemProps = {
  card: CardRecord;
  isDragOverlay?: boolean;
};

export function BoardCardItem({ card, isDragOverlay = false }: BoardCardItemProps) {
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
    <article
      ref={isDragOverlay ? undefined : sortable.setNodeRef}
      className={cn(
        "rounded-[1.4rem] border border-white/10 bg-slate-950/72 p-4 shadow-lg shadow-black/20",
        !isDragOverlay && "touch-none",
        sortable.isDragging && "opacity-40",
      )}
      style={style}
      {...(isDragOverlay ? {} : sortable.attributes)}
      {...(isDragOverlay ? {} : sortable.listeners)}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-slate-500">
          <GripVertical className="h-4 w-4" />
        </span>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">{card.title}</h4>
          <p className="text-sm leading-6 text-slate-400">{card.description ?? "Sem descrição."}</p>
        </div>
      </div>
    </article>
  );
}
