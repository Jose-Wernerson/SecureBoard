import { BoardAuditView } from "@/components/boards/board-audit-view";

type BoardAuditPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function BoardAuditPage({ params }: BoardAuditPageProps) {
  const { boardId } = await params;

  return <BoardAuditView boardId={boardId} />;
}