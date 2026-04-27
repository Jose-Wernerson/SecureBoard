export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  boards: {
    list: ["boards"] as const,
    detail: (boardId: string) => ["boards", boardId] as const,
    audit: (boardId: string) => ["boards", boardId, "audit"] as const,
  },
};
