import { api } from "@/lib/api/client";
import type {
  BoardRecord,
  BoardsResponse,
  CreateBoardInput,
  CreateCardInput,
  CreateColumnInput,
  MoveCardInput,
  ReorderColumnsInput,
} from "@/types/board";

export async function listBoardsRequest() {
  const response = await api.get<BoardsResponse>("/boards");

  return response.data;
}

export async function getBoardRequest(boardId: string) {
  const response = await api.get<BoardRecord>(`/boards/${boardId}`);

  return response.data;
}

export async function createBoardRequest(input: CreateBoardInput) {
  const response = await api.post<BoardRecord>("/boards", input);

  return response.data;
}

export async function createColumnRequest(boardId: string, input: CreateColumnInput) {
  const response = await api.post<BoardRecord["columns"][number]>(`/boards/${boardId}/columns`, input);

  return response.data;
}

export async function createCardRequest(boardId: string, input: CreateCardInput) {
  const response = await api.post<BoardRecord["columns"][number]["cards"][number]>(`/boards/${boardId}/cards`, input);

  return response.data;
}

export async function reorderColumnsRequest(boardId: string, input: ReorderColumnsInput) {
  const response = await api.patch<{ columns: BoardRecord["columns"] }>(
    `/boards/${boardId}/columns/reorder`,
    input,
  );

  return response.data;
}

export async function moveCardRequest(boardId: string, cardId: string, input: MoveCardInput) {
  const response = await api.patch<BoardRecord["columns"][number]["cards"][number]>(
    `/boards/${boardId}/cards/${cardId}/move`,
    input,
  );

  return response.data;
}
