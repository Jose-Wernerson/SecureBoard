"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutPanelLeft, Layers3 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { BoardCardItem } from "@/components/boards/board-card-item";
import { BoardColumn } from "@/components/boards/board-column";
import { CreateColumnForm } from "@/components/boards/create-column-form";
import {
  createCardRequest,
  createColumnRequest,
  getBoardRequest,
  moveCardRequest,
  reorderColumnsRequest,
} from "@/lib/api/boards";
import { moveCardInBoard, reorderBoardColumns, replaceBoardInList } from "@/lib/board-utils";
import { queryKeys } from "@/lib/query-keys";
import type { BoardRecord, BoardsResponse, CardRecord } from "@/types/board";

type BoardViewProps = {
  boardId: string;
};

type ActiveDrag =
  | {
      type: "column";
      columnId: string;
      title: string;
    }
  | {
      type: "card";
      card: CardRecord;
    }
  | null;

function findCardPosition(board: BoardRecord, cardId: string) {
  for (const column of board.columns) {
    const index = column.cards.findIndex((card) => card.id === cardId);

    if (index !== -1) {
      return {
        column,
        index,
      };
    }
  }

  return null;
}

export function BoardView({ boardId }: BoardViewProps) {
  const queryClient = useQueryClient();
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const boardQuery = useQuery({
    queryKey: queryKeys.boards.detail(boardId),
    queryFn: () => getBoardRequest(boardId),
  });

  const createColumnMutation = useMutation({
    mutationFn: (input: { title: string }) => createColumnRequest(boardId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.list });
    },
  });

  const createCardMutation = useMutation({
    mutationFn: (input: { columnId: string; title: string; description?: string }) => createCardRequest(boardId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.list });
    },
  });

  const reorderColumnsMutation = useMutation({
    mutationFn: (input: { orderedColumnIds: string[] }) => reorderColumnsRequest(boardId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.boards.detail(boardId) });

      const previousBoard = queryClient.getQueryData<BoardRecord>(queryKeys.boards.detail(boardId));
      const previousBoards = queryClient.getQueryData<BoardsResponse>(queryKeys.boards.list);

      if (previousBoard) {
        const activeColumnId = previousBoard.columns.find((column, index) => input.orderedColumnIds[index] !== column.id)?.id ?? previousBoard.columns[0]?.id;
        const overColumnId = input.orderedColumnIds.find((columnId, index) => previousBoard.columns[index]?.id !== columnId) ?? input.orderedColumnIds[0];
        const nextBoard = activeColumnId && overColumnId ? reorderBoardColumns(previousBoard, activeColumnId, overColumnId) : previousBoard;

        queryClient.setQueryData(queryKeys.boards.detail(boardId), nextBoard);
        queryClient.setQueryData(queryKeys.boards.list, replaceBoardInList(previousBoards, nextBoard));
      }

      return {
        previousBoard,
        previousBoards,
      };
    },
    onError: (_error, _input, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(queryKeys.boards.detail(boardId), context.previousBoard);
      }

      if (context?.previousBoards) {
        queryClient.setQueryData(queryKeys.boards.list, context.previousBoards);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.list });
    },
  });

  const moveCardMutation = useMutation({
    mutationFn: (input: { cardId: string; targetColumnId: string; targetPosition: number }) =>
      moveCardRequest(boardId, input.cardId, {
        targetColumnId: input.targetColumnId,
        targetPosition: input.targetPosition,
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.boards.detail(boardId) });

      const previousBoard = queryClient.getQueryData<BoardRecord>(queryKeys.boards.detail(boardId));
      const previousBoards = queryClient.getQueryData<BoardsResponse>(queryKeys.boards.list);

      if (previousBoard) {
        const nextBoard = moveCardInBoard(previousBoard, input);

        queryClient.setQueryData(queryKeys.boards.detail(boardId), nextBoard);
        queryClient.setQueryData(queryKeys.boards.list, replaceBoardInList(previousBoards, nextBoard));
      }

      return {
        previousBoard,
        previousBoards,
      };
    },
    onError: (_error, _input, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(queryKeys.boards.detail(boardId), context.previousBoard);
      }

      if (context?.previousBoards) {
        queryClient.setQueryData(queryKeys.boards.list, context.previousBoards);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.list });
    },
  });

  const sortedColumns = useMemo(
    () => [...(boardQuery.data?.columns ?? [])].sort((left, right) => left.position - right.position),
    [boardQuery.data?.columns],
  );

  function handleDragStart(event: DragStartEvent) {
    const dragType = event.active.data.current?.type;

    if (dragType === "column") {
      const column = sortedColumns.find((item) => item.id === event.active.id);

      if (column) {
        setActiveDrag({
          type: "column",
          columnId: column.id,
          title: column.title,
        });
      }

      return;
    }

    if (dragType === "card" && boardQuery.data) {
      const result = findCardPosition(boardQuery.data, String(event.active.id));

      if (result) {
        setActiveDrag({
          type: "card",
          card: result.column.cards[result.index],
        });
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);

    const { active, over } = event;

    if (!over || !boardQuery.data) {
      return;
    }

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "column" && overType === "column") {
      if (active.id === over.id) {
        return;
      }

      const nextBoard = reorderBoardColumns(boardQuery.data, String(active.id), String(over.id));
      const orderedColumnIds = nextBoard.columns.map((column) => column.id);

      reorderColumnsMutation.mutate({ orderedColumnIds });
      return;
    }

    if (activeType !== "card") {
      return;
    }

    let targetColumnId: string | null = null;
    let targetPosition = 0;

    if (overType === "card") {
      const overColumnId = String(over.data.current?.columnId);
      const overColumn = boardQuery.data.columns.find((column) => column.id === overColumnId);

      if (!overColumn) {
        return;
      }

      targetColumnId = overColumnId;
      targetPosition = overColumn.cards.findIndex((card) => card.id === over.id);
    }

    if (overType === "column-dropzone") {
      const overColumnId = String(over.data.current?.columnId);
      const overColumn = boardQuery.data.columns.find((column) => column.id === overColumnId);

      if (!overColumn) {
        return;
      }

      targetColumnId = overColumnId;
      targetPosition = overColumn.cards.length;
    }

    if (!targetColumnId) {
      return;
    }

    const currentPosition = findCardPosition(boardQuery.data, String(active.id));

    if (!currentPosition) {
      return;
    }

    if (currentPosition.column.id === targetColumnId && currentPosition.index === targetPosition) {
      return;
    }

    moveCardMutation.mutate({
      cardId: String(active.id),
      targetColumnId,
      targetPosition,
    });
  }

  if (boardQuery.isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/6 px-5 py-12 text-center text-sm text-slate-300 backdrop-blur">
        Carregando board...
      </div>
    );
  }

  if (boardQuery.isError || !boardQuery.data) {
    return (
      <div className="rounded-[2rem] border border-rose-400/20 bg-rose-500/10 px-5 py-10 text-sm text-rose-200 backdrop-blur">
        {boardQuery.error?.message ?? "Nao foi possivel carregar o board."}
      </div>
    );
  }

  const totalCards = boardQuery.data.columns.reduce((sum, column) => sum + column.cards.length, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link className="text-sm font-medium text-slate-400 hover:text-white" href="/dashboard">
              Voltar para o dashboard
            </Link>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{boardQuery.data.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              {boardQuery.data.description ?? "Sem descrição. Use este board como área de trabalho para testar movimentos entre colunas com atualizações otimistas."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <LayoutPanelLeft className="h-4 w-4 text-cyan-200" />
                Colunas
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">{boardQuery.data.columns.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Layers3 className="h-4 w-4 text-lime-200" />
                Cards
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCards}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
          <SortableContext items={sortedColumns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {sortedColumns.map((column) => (
                <BoardColumn
                  column={column}
                  isCreatingCard={createCardMutation.isPending}
                  key={column.id}
                  onCreateCard={(input) => createCardMutation.mutateAsync({
                    columnId: column.id,
                    title: input.title,
                    description: input.description,
                  }).then(() => undefined)}
                />
              ))}

              <CreateColumnForm
                isPending={createColumnMutation.isPending}
                onSubmit={(input) => createColumnMutation.mutateAsync(input).then(() => undefined)}
              />
            </div>
          </SortableContext>

          <DragOverlay>
            {activeDrag?.type === "card" ? <BoardCardItem card={activeDrag.card} isDragOverlay /> : null}
            {activeDrag?.type === "column" ? (
              <div className="w-[320px] rounded-[1.8rem] border border-lime-300/20 bg-slate-900/90 p-4 text-white shadow-2xl shadow-black/35 backdrop-blur">
                <p className="text-xs font-semibold tracking-[0.28em] text-lime-200 uppercase">Movendo coluna</p>
                <h3 className="mt-3 text-lg font-semibold">{activeDrag.title}</h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>
    </div>
  );
}
