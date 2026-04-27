import { arrayMove } from "@dnd-kit/sortable";

import type { BoardRecord, BoardsResponse, CardRecord, ColumnRecord } from "@/types/board";

function sortCards(cards: CardRecord[]) {
  return [...cards].sort((left, right) => left.position - right.position);
}

function reindexCards(cards: CardRecord[], columnId: string) {
  return cards.map((card, index) => ({
    ...card,
    columnId,
    position: index,
  }));
}

function reindexColumns(columns: ColumnRecord[]) {
  return columns.map((column, index) => ({
    ...column,
    position: index,
  }));
}

export function reorderBoardColumns(board: BoardRecord, activeColumnId: string, overColumnId: string) {
  const columns = [...board.columns].sort((left, right) => left.position - right.position);
  const activeIndex = columns.findIndex((column) => column.id === activeColumnId);
  const overIndex = columns.findIndex((column) => column.id === overColumnId);

  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return board;
  }

  return {
    ...board,
    columns: reindexColumns(arrayMove(columns, activeIndex, overIndex)),
  };
}

export function moveCardInBoard(
  board: BoardRecord,
  options: {
    cardId: string;
    targetColumnId: string;
    targetPosition: number;
  },
) {
  const columns = board.columns.map((column) => ({
    ...column,
    cards: sortCards(column.cards),
  }));

  const sourceColumn = columns.find((column) => column.cards.some((card) => card.id === options.cardId));
  const targetColumn = columns.find((column) => column.id === options.targetColumnId);

  if (!sourceColumn || !targetColumn) {
    return board;
  }

  const card = sourceColumn.cards.find((item) => item.id === options.cardId);

  if (!card) {
    return board;
  }

  const nextSourceCards = sourceColumn.cards.filter((item) => item.id !== options.cardId);
  const nextTargetCards = targetColumn.id === sourceColumn.id ? nextSourceCards : [...targetColumn.cards];
  const safePosition = Math.max(0, Math.min(options.targetPosition, nextTargetCards.length));

  nextTargetCards.splice(safePosition, 0, {
    ...card,
    columnId: targetColumn.id,
  });

  const updatedColumns = columns.map((column) => {
    if (column.id === sourceColumn.id && column.id === targetColumn.id) {
      return {
        ...column,
        cards: reindexCards(nextTargetCards, column.id),
      };
    }

    if (column.id === sourceColumn.id) {
      return {
        ...column,
        cards: reindexCards(nextSourceCards, column.id),
      };
    }

    if (column.id === targetColumn.id) {
      return {
        ...column,
        cards: reindexCards(nextTargetCards, column.id),
      };
    }

    return column;
  });

  return {
    ...board,
    columns: updatedColumns,
  };
}

export function replaceBoardInList(list: BoardsResponse | undefined, board: BoardRecord) {
  if (!list) {
    return list;
  }

  return {
    boards: list.boards.map((item) => (item.id === board.id ? board : item)),
  };
}

export function prependBoardToList(list: BoardsResponse | undefined, board: BoardRecord) {
  if (!list) {
    return {
      boards: [board],
    };
  }

  return {
    boards: [board, ...list.boards],
  };
}

export function removeBoardFromList(list: BoardsResponse | undefined, boardId: string) {
  if (!list) {
    return list;
  }

  return {
    boards: list.boards.filter((item) => item.id !== boardId),
  };
}

export function updateBoardDetails(
  board: BoardRecord,
  input: {
    title?: string;
    description?: string;
  },
) {
  return {
    ...board,
    title: input.title ?? board.title,
    description: input.description === undefined ? board.description : input.description,
  };
}

export function removeColumnFromBoard(board: BoardRecord, columnId: string) {
  return {
    ...board,
    columns: board.columns
      .filter((column) => column.id !== columnId)
      .map((column, index) => ({
        ...column,
        position: index,
      })),
  };
}

export function updateCardInBoard(board: BoardRecord, nextCard: CardRecord) {
  return {
    ...board,
    columns: board.columns.map((column) => {
      if (!column.cards.some((card) => card.id === nextCard.id)) {
        return column;
      }

      return {
        ...column,
        cards: column.cards.map((card) => (card.id === nextCard.id ? nextCard : card)),
      };
    }),
  };
}

export function removeCardFromBoard(board: BoardRecord, cardId: string) {
  return {
    ...board,
    columns: board.columns.map((column) => {
      const filteredCards = column.cards.filter((card) => card.id !== cardId);

      if (filteredCards.length === column.cards.length) {
        return column;
      }

      return {
        ...column,
        cards: filteredCards.map((card, index) => ({
          ...card,
          position: index,
        })),
      };
    }),
  };
}
