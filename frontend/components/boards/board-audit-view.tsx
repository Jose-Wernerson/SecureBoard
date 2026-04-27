"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";

import { listBoardAuditRequest } from "@/lib/api/boards";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

type BoardAuditViewProps = {
  boardId: string;
};

const actionClassName = {
  CREATE: "bg-lime-300/15 text-lime-200 ring-1 ring-lime-300/20",
  UPDATE: "bg-cyan-300/15 text-cyan-200 ring-1 ring-cyan-300/20",
  DELETE: "bg-rose-400/15 text-rose-200 ring-1 ring-rose-300/20",
} as const;

const entityClassName = {
  BOARD: "text-white",
  COLUMN: "text-cyan-100",
  CARD: "text-lime-100",
} as const;

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function formatPayload(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }

  return JSON.stringify(value, null, 2);
}

export function BoardAuditView({ boardId }: BoardAuditViewProps) {
  const auditQuery = useQuery({
    queryKey: queryKeys.boards.audit(boardId),
    queryFn: () => listBoardAuditRequest(boardId),
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white" href={`/boards/${boardId}`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar para o board
            </Link>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">Auditoria do board</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Histórico de alterações registrado pelo backend, incluindo snapshots anteriores e novos para board, column e card.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Activity className="h-4 w-4 text-lime-200" />
              Eventos
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">{auditQuery.data?.audit.length ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 backdrop-blur">
        {auditQuery.isLoading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-300">Carregando trilha de auditoria...</div>
        ) : null}

        {auditQuery.isError ? (
          <div className="px-6 py-10 text-sm text-rose-200">{auditQuery.error.message}</div>
        ) : null}

        {!auditQuery.isLoading && !auditQuery.isError ? (
          auditQuery.data?.audit.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-slate-950/55 text-left text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                  <tr>
                    <th className="px-5 py-4">Timestamp</th>
                    <th className="px-5 py-4">Ação</th>
                    <th className="px-5 py-4">Entidade</th>
                    <th className="px-5 py-4">Anterior</th>
                    <th className="px-5 py-4">Novo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {auditQuery.data.audit.map((entry) => (
                    <tr className="align-top" key={entry.id}>
                      <td className="px-5 py-4 text-slate-300">{formatTimestamp(entry.createdAt)}</td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase", actionClassName[entry.action])}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("font-semibold tracking-[0.18em] uppercase", entityClassName[entry.entity])}>{entry.entity}</span>
                      </td>
                      <td className="px-5 py-4">
                        <pre className="max-w-md overflow-x-auto rounded-[1.2rem] border border-white/10 bg-slate-950/65 p-4 text-xs leading-6 text-slate-300">{formatPayload(entry.oldData)}</pre>
                      </td>
                      <td className="px-5 py-4">
                        <pre className="max-w-md overflow-x-auto rounded-[1.2rem] border border-white/10 bg-slate-950/65 p-4 text-xs leading-6 text-slate-300">{formatPayload(entry.newData)}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm leading-7 text-slate-400">Nenhum evento de auditoria encontrado para este board.</div>
          )
        ) : null}
      </section>
    </div>
  );
}