import { BoardView } from "@/components/boards/board-view";

type BoardPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;

  return <BoardView boardId={boardId} />;
}