import { ArrowRight, Layers3, Rows3 } from "lucide-react";
import Link from "next/link";

import { formatBoardDate } from "@/lib/utils";
import type { BoardRecord } from "@/types/board";

type BoardCardProps = {
  board: BoardRecord;
};

export function BoardCard({ board }: BoardCardProps) {
  const totalCards = board.columns.reduce((sum, column) => sum + column.cards.length, 0);

  return (
    <article className="group rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-lime-300/25 hover:bg-white/9">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">Board</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{board.title}</h2>
        </div>

        <Link
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-slate-200 transition group-hover:border-lime-300/20 group-hover:text-lime-200"
          href={`/boards/${board.id}`}
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      <p className="mt-4 min-h-14 text-sm leading-7 text-slate-400">{board.description ?? "Sem descrição. Use este board para organizar colunas e cards com drag-and-drop."}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Rows3 className="h-4 w-4 text-cyan-200" />
            Colunas
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">{board.columns.length}</p>
        </div>
        <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Layers3 className="h-4 w-4 text-lime-200" />
            Cards
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">{totalCards}</p>
        </div>
      </div>

      <p className="mt-6 text-xs tracking-[0.22em] text-slate-500 uppercase">Atualizado em {formatBoardDate(board.updatedAt)}</p>
    </article>
  );
}
