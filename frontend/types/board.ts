export type CardRecord = {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type ColumnRecord = {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  cards: CardRecord[];
};

export type BoardRecord = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  columns: ColumnRecord[];
};

export type BoardsResponse = {
  boards: BoardRecord[];
};

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export type AuditEntity = "BOARD" | "COLUMN" | "CARD";

export type AuditLogRecord = {
  id: string;
  boardId: string;
  userId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  oldData: unknown;
  newData: unknown;
  ipAddress: string | null;
  createdAt: string;
};

export type AuditResponse = {
  audit: AuditLogRecord[];
};

export type CreateBoardInput = {
  title: string;
  description?: string;
};

export type UpdateBoardInput = {
  title?: string;
  description?: string;
};

export type CreateColumnInput = {
  title: string;
};

export type CreateCardInput = {
  columnId: string;
  title: string;
  description?: string;
};

export type UpdateCardInput = {
  title?: string;
  description?: string;
};

export type ReorderColumnsInput = {
  orderedColumnIds: string[];
};

export type MoveCardInput = {
  targetColumnId: string;
  targetPosition: number;
};
