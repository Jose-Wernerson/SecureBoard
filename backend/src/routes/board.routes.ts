import type { FastifyInstance } from "fastify";

import {
  createBoardController,
  createCardController,
  createColumnController,
  deleteBoardController,
  deleteCardController,
  deleteColumnController,
  getBoardController,
  listBoardAuditLogsController,
  listBoardsController,
  moveCardController,
  reorderColumnsController,
  updateBoardController,
  updateCardController,
} from "../controllers/board.controller.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import { ensureBoardOwnership } from "../middlewares/ownership.middleware.js";

export async function boardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticateRequest);

  app.get("/", listBoardsController);
  app.post("/", createBoardController);

  app.get("/:id", {
    preHandler: ensureBoardOwnership,
  }, getBoardController);
  app.patch("/:id", {
    preHandler: ensureBoardOwnership,
  }, updateBoardController);
  app.delete("/:id", {
    preHandler: ensureBoardOwnership,
  }, deleteBoardController);
  app.get("/:id/audit", {
    preHandler: ensureBoardOwnership,
  }, listBoardAuditLogsController);

  app.post("/:boardId/columns", {
    preHandler: ensureBoardOwnership,
  }, createColumnController);
  app.patch("/:boardId/columns/reorder", {
    preHandler: ensureBoardOwnership,
  }, reorderColumnsController);
  app.delete("/:boardId/columns/:columnId", {
    preHandler: ensureBoardOwnership,
  }, deleteColumnController);

  app.post("/:boardId/cards", {
    preHandler: ensureBoardOwnership,
  }, createCardController);
  app.patch("/:boardId/cards/:cardId", {
    preHandler: ensureBoardOwnership,
  }, updateCardController);
  app.patch("/:boardId/cards/:cardId/move", {
    preHandler: ensureBoardOwnership,
  }, moveCardController);
  app.delete("/:boardId/cards/:cardId", {
    preHandler: ensureBoardOwnership,
  }, deleteCardController);
}