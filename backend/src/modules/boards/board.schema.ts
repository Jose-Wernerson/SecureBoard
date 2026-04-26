import { z } from "zod";

const cuidSchema = z.string().trim().min(1, "Identifier is required");

export const boardParamsSchema = z.object({
  id: cuidSchema,
});

export const boardScopedParamsSchema = z.object({
  boardId: cuidSchema,
});

export const columnParamsSchema = z.object({
  boardId: cuidSchema,
  columnId: cuidSchema,
});

export const cardParamsSchema = z.object({
  boardId: cuidSchema,
  cardId: cuidSchema,
});

export const createBoardSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(5000).optional(),
});

export const updateBoardSchema = createBoardSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided",
);

export const createColumnSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export const reorderColumnsSchema = z.object({
  orderedColumnIds: z.array(cuidSchema).min(1),
});

export const createCardSchema = z.object({
  columnId: cuidSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).optional(),
});

export const updateCardSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).optional(),
}).refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided",
);

export const moveCardSchema = z.object({
  targetColumnId: cuidSchema,
  targetPosition: z.number().int().min(0),
});

export type BoardParams = z.infer<typeof boardParamsSchema>;
export type BoardScopedParams = z.infer<typeof boardScopedParamsSchema>;
export type ColumnParams = z.infer<typeof columnParamsSchema>;
export type CardParams = z.infer<typeof cardParamsSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;