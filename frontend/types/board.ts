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

export type CreateBoardInput = {
  title: string;
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

export type ReorderColumnsInput = {
  orderedColumnIds: string[];
};

export type MoveCardInput = {
  targetColumnId: string;
  targetPosition: number;
};
