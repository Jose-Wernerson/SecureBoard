import type { FastifyReply, FastifyRequest } from "fastify";

import { prisma } from "../services/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function ensureBoardOwnership(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  if (!request.authUser) {
    throw new AppError(401, "Unauthenticated request", "UNAUTHENTICATED");
  }

  const params = (request.params ?? {}) as {
    id?: string;
    boardId?: string;
  };
  const boardId = params.boardId ?? params.id;

  if (!boardId) {
    throw new AppError(400, "Board id is required", "BOARD_ID_REQUIRED");
  }

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      userId: request.authUser.id,
    },
    select: {
      id: true,
    },
  });

  if (!board) {
    throw new AppError(404, "Board not found", "BOARD_NOT_FOUND");
  }
}