import { api } from "@/lib/api/client";
import type {
  AuditResponse,
  BoardRecord,
  BoardsResponse,
  CreateBoardInput,
  CreateCardInput,
  CreateColumnInput,
  MoveCardInput,
  ReorderColumnsInput,
  UpdateBoardInput,
  UpdateCardInput,
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

export async function updateBoardRequest(boardId: string, input: UpdateBoardInput) {
  const response = await api.patch<BoardRecord>(`/boards/${boardId}`, input);

  return response.data;
}

export async function deleteBoardRequest(boardId: string) {
  await api.delete(`/boards/${boardId}`);
}

export async function createColumnRequest(boardId: string, input: CreateColumnInput) {
  const response = await api.post<BoardRecord["columns"][number]>(`/boards/${boardId}/columns`, input);

  return response.data;
}

export async function deleteColumnRequest(boardId: string, columnId: string) {
  await api.delete(`/boards/${boardId}/columns/${columnId}`);
}

export async function createCardRequest(boardId: string, input: CreateCardInput) {
  const response = await api.post<BoardRecord["columns"][number]["cards"][number]>(`/boards/${boardId}/cards`, input);

  return response.data;
}

export async function updateCardRequest(boardId: string, cardId: string, input: UpdateCardInput) {
  const response = await api.patch<BoardRecord["columns"][number]["cards"][number]>(`/boards/${boardId}/cards/${cardId}`, input);

  return response.data;
}

export async function deleteCardRequest(boardId: string, cardId: string) {
  await api.delete(`/boards/${boardId}/cards/${cardId}`);
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

export async function listBoardAuditRequest(boardId: string) {
  const response = await api.get<AuditResponse>(`/boards/${boardId}/audit`);

  return response.data;
}
