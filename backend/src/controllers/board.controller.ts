import type { FastifyReply, FastifyRequest } from "fastify";

import {
  boardParamsSchema,
  boardScopedParamsSchema,
  cardParamsSchema,
  columnParamsSchema,
  createBoardSchema,
  createCardSchema,
  createColumnSchema,
  moveCardSchema,
  reorderColumnsSchema,
  updateBoardSchema,
  updateCardSchema,
} from "../modules/boards/board.schema.js";
import {
  createBoard,
  createCard,
  createColumn,
  deleteBoard,
  deleteCard,
  deleteColumn,
  getBoardById,
  listBoardAuditLogs,
  listBoards,
  moveCard,
  reorderColumns,
  updateBoard,
  updateCard,
} from "../services/board.service.js";
import { sanitizeObjectStrings } from "../utils/sanitize.js";
import { AppError } from "../utils/app-error.js";

function getActor(request: FastifyRequest) {
  if (!request.authUser) {
    throw new AppError(401, "Unauthenticated request", "UNAUTHENTICATED");
  }

  return {
    userId: request.authUser.id,
    ipAddress: request.ip,
  };
}

export async function createBoardController(request: FastifyRequest, reply: FastifyReply) {
  const payload = createBoardSchema.parse(sanitizeObjectStrings(request.body ?? {}));
  const board = await createBoard(payload, getActor(request));

  return reply.status(201).send(board);
}

export async function listBoardsController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const boards = await listBoards(actor.userId);

  return reply.status(200).send({ boards });
}

export async function getBoardController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = boardParamsSchema.parse(request.params ?? {});
  const board = await getBoardById(params.id, actor.userId);

  return reply.status(200).send(board);
}

export async function updateBoardController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = boardParamsSchema.parse(request.params ?? {});
  const payload = updateBoardSchema.parse(sanitizeObjectStrings(request.body ?? {}));
  const board = await updateBoard(params.id, actor.userId, payload, actor);

  return reply.status(200).send(board);
}

export async function deleteBoardController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = boardParamsSchema.parse(request.params ?? {});
  await deleteBoard(params.id, actor.userId, actor);

  return reply.status(204).send();
}

export async function createColumnController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = boardScopedParamsSchema.parse(request.params ?? {});
  const payload = createColumnSchema.parse(sanitizeObjectStrings(request.body ?? {}));
  const column = await createColumn(params.boardId, actor.userId, payload, actor);

  return reply.status(201).send(column);
}

export async function reorderColumnsController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = boardScopedParamsSchema.parse(request.params ?? {});
  const payload = reorderColumnsSchema.parse(request.body ?? {});
  const columns = await reorderColumns(params.boardId, actor.userId, payload, actor);

  return reply.status(200).send({ columns });
}

export async function deleteColumnController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = columnParamsSchema.parse(request.params ?? {});
  await deleteColumn(params.boardId, params.columnId, actor.userId, actor);

  return reply.status(204).send();
}

export async function createCardController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = boardScopedParamsSchema.parse(request.params ?? {});
  const payload = createCardSchema.parse(sanitizeObjectStrings(request.body ?? {}));
  const card = await createCard(params.boardId, actor.userId, payload, actor);

  return reply.status(201).send(card);
}

export async function updateCardController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = cardParamsSchema.parse(request.params ?? {});
  const payload = updateCardSchema.parse(sanitizeObjectStrings(request.body ?? {}));
  const card = await updateCard(params.boardId, params.cardId, actor.userId, payload, actor);

  return reply.status(200).send(card);
}

export async function moveCardController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = cardParamsSchema.parse(request.params ?? {});
  const payload = moveCardSchema.parse(request.body ?? {});
  const card = await moveCard(params.boardId, params.cardId, actor.userId, payload, actor);

  return reply.status(200).send(card);
}

export async function deleteCardController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = cardParamsSchema.parse(request.params ?? {});
  await deleteCard(params.boardId, params.cardId, actor.userId, actor);

  return reply.status(204).send();
}

export async function listBoardAuditLogsController(request: FastifyRequest, reply: FastifyReply) {
  const actor = getActor(request);
  const params = boardParamsSchema.parse(request.params ?? {});
  const audit = await listBoardAuditLogs(params.id, actor.userId);

  return reply.status(200).send({ audit });
}