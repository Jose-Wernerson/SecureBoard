import type {
  AuditAction,
  AuditEntity,
  Board,
  Card,
  Column,
  Prisma,
} from "@prisma/client";

import { prisma } from "./prisma.js";
import type {
  CreateBoardInput,
  CreateCardInput,
  CreateColumnInput,
  MoveCardInput,
  ReorderColumnsInput,
  UpdateBoardInput,
  UpdateCardInput,
} from "../modules/boards/board.schema.js";
import { AppError } from "../utils/app-error.js";

type AuditPayload = {
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  boardId: string;
  userId: string;
  ipAddress?: string;
  oldData?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  newData?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
};

type ActorContext = {
  userId: string;
  ipAddress?: string;
};

const boardInclude = {
  columns: {
    orderBy: {
      position: "asc",
    },
    include: {
      cards: {
        orderBy: {
          position: "asc",
        },
      },
    },
  },
} satisfies Prisma.BoardInclude;

function assertBoardAccess<T>(value: T | null): T {
  if (!value) {
    throw new AppError(404, "Board not found", "BOARD_NOT_FOUND");
  }

  return value;
}

function assertColumnAccess<T>(value: T | null): T {
  if (!value) {
    throw new AppError(404, "Column not found", "COLUMN_NOT_FOUND");
  }

  return value;
}

function assertCardAccess<T>(value: T | null): T {
  if (!value) {
    throw new AppError(404, "Card not found", "CARD_NOT_FOUND");
  }

  return value;
}

function clampPosition(position: number, maxPosition: number) {
  return Math.max(0, Math.min(position, maxPosition));
}

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function createAuditLog(tx: Prisma.TransactionClient, payload: AuditPayload) {
  await tx.auditLog.create({
    data: {
      boardId: payload.boardId,
      userId: payload.userId,
      action: payload.action,
      entity: payload.entity,
      entityId: payload.entityId,
      oldData: payload.oldData,
      newData: payload.newData,
      ipAddress: payload.ipAddress,
    },
  });
}

async function reorderColumnsInTx(tx: Prisma.TransactionClient, boardId: string, orderedColumnIds: string[]) {
  const columns = await tx.column.findMany({
    where: {
      boardId,
    },
    orderBy: {
      position: "asc",
    },
  });

  if (columns.length !== orderedColumnIds.length) {
    throw new AppError(400, "Column reorder payload is incomplete", "INVALID_COLUMN_ORDER");
  }

  const currentIds = new Set(columns.map((column) => column.id));
  const nextIds = new Set(orderedColumnIds);

  if (currentIds.size !== nextIds.size || orderedColumnIds.some((id) => !currentIds.has(id))) {
    throw new AppError(400, "Column reorder payload is invalid", "INVALID_COLUMN_ORDER");
  }

  const offset = columns.length + 1;

  for (const column of columns) {
    await tx.column.update({
      where: {
        id: column.id,
      },
      data: {
        position: column.position + offset,
      },
    });
  }

  for (const [index, columnId] of orderedColumnIds.entries()) {
    await tx.column.update({
      where: {
        id: columnId,
      },
      data: {
        position: index,
      },
    });
  }
}

async function setCardOrderInColumnTx(
  tx: Prisma.TransactionClient,
  columnId: string,
  orderedCardIds: string[],
) {
  const cards = await tx.card.findMany({
    where: {
      columnId,
    },
    orderBy: {
      position: "asc",
    },
  });

  if (cards.length !== orderedCardIds.length) {
    throw new AppError(400, "Card reorder payload is incomplete", "INVALID_CARD_ORDER");
  }

  const currentIds = new Set(cards.map((card) => card.id));
  const nextIds = new Set(orderedCardIds);

  if (currentIds.size !== nextIds.size || orderedCardIds.some((id) => !currentIds.has(id))) {
    throw new AppError(400, "Card reorder payload is invalid", "INVALID_CARD_ORDER");
  }

  const offset = cards.length + 1;

  for (const card of cards) {
    await tx.card.update({
      where: {
        id: card.id,
      },
      data: {
        position: card.position + offset,
      },
    });
  }

  for (const [index, cardId] of orderedCardIds.entries()) {
    await tx.card.update({
      where: {
        id: cardId,
      },
      data: {
        position: index,
      },
    });
  }
}

async function getOwnedBoardOrThrow(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      userId,
    },
    include: boardInclude,
  });

  return assertBoardAccess(board);
}

async function getOwnedColumnOrThrow(tx: Prisma.TransactionClient, boardId: string, columnId: string, userId: string) {
  const column = await tx.column.findFirst({
    where: {
      id: columnId,
      boardId,
      board: {
        userId,
      },
    },
  });

  return assertColumnAccess(column);
}

async function getOwnedCardOrThrow(tx: Prisma.TransactionClient, boardId: string, cardId: string, userId: string) {
  const card = await tx.card.findFirst({
    where: {
      id: cardId,
      boardId,
      board: {
        userId,
      },
    },
  });

  return assertCardAccess(card);
}

export async function createBoard(input: CreateBoardInput, actor: ActorContext) {
  return prisma.$transaction(async (tx) => {
    const board = await tx.board.create({
      data: {
        userId: actor.userId,
        title: input.title,
        description: input.description,
      },
      include: boardInclude,
    });

    await createAuditLog(tx, {
      boardId: board.id,
      userId: actor.userId,
      action: "CREATE",
      entity: "BOARD",
      entityId: board.id,
      newData: toJsonValue(board),
      ipAddress: actor.ipAddress,
    });

    return board;
  });
}

export async function listBoards(userId: string) {
  return prisma.board.findMany({
    where: {
      userId,
    },
    include: boardInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getBoardById(boardId: string, userId: string) {
  return getOwnedBoardOrThrow(boardId, userId);
}

export async function updateBoard(boardId: string, userId: string, input: UpdateBoardInput, actor: ActorContext) {
  return prisma.$transaction(async (tx) => {
    const existingBoard = assertBoardAccess(await tx.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
      include: boardInclude,
    }));

    const updatedBoard = await tx.board.update({
      where: {
        id: boardId,
      },
      data: {
        title: input.title ?? existingBoard.title,
        description: input.description === undefined ? existingBoard.description : input.description,
      },
      include: boardInclude,
    });

    await createAuditLog(tx, {
      boardId,
      userId: actor.userId,
      action: "UPDATE",
      entity: "BOARD",
      entityId: boardId,
      oldData: toJsonValue(existingBoard),
      newData: toJsonValue(updatedBoard),
      ipAddress: actor.ipAddress,
    });

    return updatedBoard;
  });
}

export async function deleteBoard(boardId: string, userId: string, actor: ActorContext) {
  return prisma.$transaction(async (tx) => {
    const existingBoard = assertBoardAccess(await tx.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
      include: boardInclude,
    }));

    await createAuditLog(tx, {
      boardId,
      userId: actor.userId,
      action: "DELETE",
      entity: "BOARD",
      entityId: boardId,
      oldData: toJsonValue(existingBoard),
      ipAddress: actor.ipAddress,
    });

    await tx.board.delete({
      where: {
        id: boardId,
      },
    });
  });
}

export async function createColumn(boardId: string, userId: string, input: CreateColumnInput, actor: ActorContext) {
  return prisma.$transaction(async (tx) => {
    await assertBoardAccess(await tx.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
      select: {
        id: true,
      },
    }));

    const position = await tx.column.count({
      where: {
        boardId,
      },
    });

    const column = await tx.column.create({
      data: {
        boardId,
        title: input.title,
        position,
      },
      include: {
        cards: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    await createAuditLog(tx, {
      boardId,
      userId: actor.userId,
      action: "CREATE",
      entity: "COLUMN",
      entityId: column.id,
      newData: toJsonValue(column),
      ipAddress: actor.ipAddress,
    });

    return column;
  });
}

export async function reorderColumns(boardId: string, userId: string, input: ReorderColumnsInput, actor: ActorContext) {
  return prisma.$transaction(async (tx) => {
    const existingColumns = await tx.column.findMany({
      where: {
        boardId,
        board: {
          userId,
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    if (existingColumns.length === 0) {
      throw new AppError(400, "Board does not have columns to reorder", "EMPTY_COLUMN_LIST");
    }

    await reorderColumnsInTx(tx, boardId, input.orderedColumnIds);

    const updatedColumns = await tx.column.findMany({
      where: {
        boardId,
      },
      orderBy: {
        position: "asc",
      },
      include: {
        cards: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    await createAuditLog(tx, {
      boardId,
      userId: actor.userId,
      action: "UPDATE",
      entity: "COLUMN",
      entityId: boardId,
      oldData: toJsonValue(existingColumns),
      newData: toJsonValue(updatedColumns),
      ipAddress: actor.ipAddress,
    });

    return updatedColumns;
  });
}

export async function deleteColumn(boardId: string, columnId: string, userId: string, actor: ActorContext) {
  return prisma.$transaction(async (tx) => {
    const existingColumn = await getOwnedColumnOrThrow(tx, boardId, columnId, userId);
    const columnSnapshot = await tx.column.findUnique({
      where: {
        id: existingColumn.id,
      },
      include: {
        cards: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    await createAuditLog(tx, {
      boardId,
      userId: actor.userId,
      action: "DELETE",
      entity: "COLUMN",
      entityId: columnId,
      oldData: toJsonValue(columnSnapshot),
      ipAddress: actor.ipAddress,
    });

    await tx.column.delete({
      where: {
        id: columnId,
      },
    });

    const remainingColumns = await tx.column.findMany({
      where: {
        boardId,
      },
      orderBy: {
        position: "asc",
      },
    });

    await reorderColumnsInTx(tx, boardId, remainingColumns.map((column) => column.id));
  });
}

export async function createCard(boardId: string, userId: string, input: CreateCardInput, actor: ActorContext) {
  return prisma.$transaction(async (tx) => {
    await getOwnedColumnOrThrow(tx, boardId, input.columnId, userId);

    const position = await tx.card.count({
      where: {
        columnId: input.columnId,
      },
    });

    const card = await tx.card.create({
      data: {
        boardId,
        columnId: input.columnId,
        title: input.title,
        description: input.description,
        position,
      },
    });

    await createAuditLog(tx, {
      boardId,
      userId: actor.userId,
      action: "CREATE",
      entity: "CARD",
      entityId: card.id,
      newData: toJsonValue(card),
      ipAddress: actor.ipAddress,
    });

    return card;
  });
}

export async function updateCard(boardId: string, cardId: string, userId: string, input: UpdateCardInput, actor: ActorContext) {
  return prisma.$transaction(async (tx) => {
    const existingCard = await getOwnedCardOrThrow(tx, boardId, cardId, userId);
    const updatedCard = await tx.card.update({
      where: {
        id: cardId,
      },
      data: {
        title: input.title ?? existingCard.title,
        description: input.description === undefined ? existingCard.description : input.description,
      },
    });

    await createAuditLog(tx, {
      boardId,
      userId: actor.userId,
      action: "UPDATE",
      entity: "CARD",
      entityId: cardId,
      oldData: toJsonValue(existingCard),
      newData: toJsonValue(updatedCard),
      ipAddress: actor.ipAddress,
    });

    return updatedCard;
  });
}

export async function moveCard(boardId: string, cardId: string, userId: string, input: MoveCardInput, actor: ActorContext) {
  return prisma.$transaction(async (tx) => {
    const card = await getOwnedCardOrThrow(tx, boardId, cardId, userId);
    await getOwnedColumnOrThrow(tx, boardId, input.targetColumnId, userId);

    const sourceCards = await tx.card.findMany({
      where: {
        columnId: card.columnId,
      },
      orderBy: {
        position: "asc",
      },
    });

    const destinationCards = card.columnId === input.targetColumnId
      ? sourceCards
      : await tx.card.findMany({
          where: {
            columnId: input.targetColumnId,
          },
          orderBy: {
            position: "asc",
          },
        });

    const previousCard = {
      ...card,
    };

    if (card.columnId === input.targetColumnId) {
      const reorderedIds = sourceCards.filter((item) => item.id !== cardId).map((item) => item.id);
      const nextPosition = clampPosition(input.targetPosition, reorderedIds.length);
      reorderedIds.splice(nextPosition, 0, cardId);
      await setCardOrderInColumnTx(tx, card.columnId, reorderedIds);
    } else {
      const sourceIds = sourceCards.filter((item) => item.id !== cardId).map((item) => item.id);
      const destinationIds = destinationCards.map((item) => item.id);
      const nextPosition = clampPosition(input.targetPosition, destinationIds.length);

      await tx.card.update({
        where: {
          id: cardId,
        },
        data: {
          columnId: input.targetColumnId,
          position: destinationIds.length + 1,
        },
      });

      destinationIds.splice(nextPosition, 0, cardId);
      await setCardOrderInColumnTx(tx, card.columnId, sourceIds);
      await setCardOrderInColumnTx(tx, input.targetColumnId, destinationIds);
    }

    const movedCard = await tx.card.findUnique({
      where: {
        id: cardId,
      },
    });

    await createAuditLog(tx, {
      boardId,
      userId: actor.userId,
      action: "UPDATE",
      entity: "CARD",
      entityId: cardId,
      oldData: toJsonValue(previousCard),
      newData: toJsonValue(movedCard),
      ipAddress: actor.ipAddress,
    });

    return assertCardAccess(movedCard);
  });
}

export async function deleteCard(boardId: string, cardId: string, userId: string, actor: ActorContext) {
  return prisma.$transaction(async (tx) => {
    const existingCard = await getOwnedCardOrThrow(tx, boardId, cardId, userId);

    await createAuditLog(tx, {
      boardId,
      userId: actor.userId,
      action: "DELETE",
      entity: "CARD",
      entityId: cardId,
      oldData: toJsonValue(existingCard),
      ipAddress: actor.ipAddress,
    });

    await tx.card.delete({
      where: {
        id: cardId,
      },
    });

    const remainingCardIds = (await tx.card.findMany({
      where: {
        columnId: existingCard.columnId,
      },
      orderBy: {
        position: "asc",
      },
      select: {
        id: true,
      },
    })).map((card) => card.id);

    if (remainingCardIds.length > 0) {
      await setCardOrderInColumnTx(tx, existingCard.columnId, remainingCardIds);
    }
  });
}

export async function listBoardAuditLogs(boardId: string, userId: string) {
  await assertBoardAccess(await prisma.board.findFirst({
    where: {
      id: boardId,
      userId,
    },
    select: {
      id: true,
    },
  }));

  return prisma.auditLog.findMany({
    where: {
      boardId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export type BoardWithRelations = Prisma.BoardGetPayload<{
  include: typeof boardInclude;
}>;
export type ColumnWithCards = Column & { cards: Card[] };
export type BoardRecord = Board;