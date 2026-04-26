"use client";

import { useQuery } from "@tanstack/react-query";

import { CreateBoardForm } from "@/components/dashboard/create-board-form";
import { BoardCard } from "@/components/dashboard/board-card";
import { listBoardsRequest } from "@/lib/api/boards";
import { queryKeys } from "@/lib/query-keys";

export default function DashboardPage() {
  const boardsQuery = useQuery({
    queryKey: queryKeys.boards.list,
    queryFn: listBoardsRequest,
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <CreateBoardForm />

        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">Dashboard</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Seus boards</h2>
            </div>

            <p className="text-sm text-slate-400">Cacheado por React Query com refetch e invalidação segmentada.</p>
          </div>

          {boardsQuery.isLoading ? (
            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-slate-950/60 px-5 py-12 text-center text-sm text-slate-300">
              Carregando boards...
            </div>
          ) : null}

          {boardsQuery.isError ? (
            <div className="mt-6 rounded-[1.6rem] border border-rose-400/20 bg-rose-500/10 px-5 py-10 text-sm text-rose-200">
              {boardsQuery.error.message}
            </div>
          ) : null}

          {!boardsQuery.isLoading && !boardsQuery.isError ? (
            boardsQuery.data?.boards.length ? (
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {boardsQuery.data.boards.map((board) => (
                  <BoardCard board={board} key={board.id} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.6rem] border border-dashed border-white/15 bg-slate-950/45 px-5 py-12 text-center text-sm leading-7 text-slate-400">
                Nenhum board encontrado. Crie o primeiro board para abrir a visualização com colunas e cards.
              </div>
            )
          ) : null}
        </div>
      </section>
    </div>
  );
}
