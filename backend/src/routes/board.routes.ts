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
import {
  createBoardRouteSchema,
  createCardRouteSchema,
  createColumnRouteSchema,
  deleteBoardRouteSchema,
  deleteCardRouteSchema,
  deleteColumnRouteSchema,
  getBoardRouteSchema,
  listBoardAuditRouteSchema,
  listBoardsRouteSchema,
  moveCardRouteSchema,
  reorderColumnsRouteSchema,
  updateBoardRouteSchema,
  updateCardRouteSchema,
} from "../docs/openapi.js";
import { authenticateRequest } from "../middlewares/auth.middleware.js";
import { ensureBoardOwnership } from "../middlewares/ownership.middleware.js";

export async function boardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticateRequest);

  app.get("/", {
    schema: listBoardsRouteSchema,
  }, listBoardsController);
  app.post("/", {
    schema: createBoardRouteSchema,
  }, createBoardController);

  app.get("/:id", {
    preHandler: ensureBoardOwnership,
    schema: getBoardRouteSchema,
  }, getBoardController);
  app.patch("/:id", {
    preHandler: ensureBoardOwnership,
    schema: updateBoardRouteSchema,
  }, updateBoardController);
  app.delete("/:id", {
    preHandler: ensureBoardOwnership,
    schema: deleteBoardRouteSchema,
  }, deleteBoardController);
  app.get("/:id/audit", {
    preHandler: ensureBoardOwnership,
    schema: listBoardAuditRouteSchema,
  }, listBoardAuditLogsController);

  app.post("/:boardId/columns", {
    preHandler: ensureBoardOwnership,
    schema: createColumnRouteSchema,
  }, createColumnController);
  app.patch("/:boardId/columns/reorder", {
    preHandler: ensureBoardOwnership,
    schema: reorderColumnsRouteSchema,
  }, reorderColumnsController);
  app.delete("/:boardId/columns/:columnId", {
    preHandler: ensureBoardOwnership,
    schema: deleteColumnRouteSchema,
  }, deleteColumnController);

  app.post("/:boardId/cards", {
    preHandler: ensureBoardOwnership,
    schema: createCardRouteSchema,
  }, createCardController);
  app.patch("/:boardId/cards/:cardId", {
    preHandler: ensureBoardOwnership,
    schema: updateCardRouteSchema,
  }, updateCardController);
  app.patch("/:boardId/cards/:cardId/move", {
    preHandler: ensureBoardOwnership,
    schema: moveCardRouteSchema,
  }, moveCardController);
  app.delete("/:boardId/cards/:cardId", {
    preHandler: ensureBoardOwnership,
    schema: deleteCardRouteSchema,
  }, deleteCardController);
}