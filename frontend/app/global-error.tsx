"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(198,255,102,0.12),_transparent_20%),linear-gradient(165deg,_#07111d_0%,_#0d1827_48%,_#16253a_100%)] text-white">
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <section className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-black/30 backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">SecureBoard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">Ocorreu um erro inesperado</h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              A aplicação encontrou uma falha crítica ao carregar esta rota. Você pode tentar novamente ou voltar mais tarde.
            </p>

            {error.digest ? (
              <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs tracking-[0.18em] text-slate-400 uppercase">
                Digest: {error.digest}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={reset} type="button">
                Tentar novamente
              </Button>
              <Button onClick={() => window.location.assign("/")} type="button" variant="secondary">
                Voltar ao início
              </Button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}