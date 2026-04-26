type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export function AuthShell({ eyebrow, title, description, footer, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(198,255,102,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(66,153,225,0.16),_transparent_28%),linear-gradient(145deg,_#08101c_0%,_#101a2a_48%,_#18253a_100%)] px-6 py-10 text-white sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-60" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">
          <div className="space-y-6">
            <span className="inline-flex w-fit rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs font-semibold tracking-[0.28em] text-lime-200 uppercase">
              {eyebrow}
            </span>

            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
                Organize seus boards com um frontend orientado por segurança.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Sessão com refresh token, cache previsível com React Query e uma interface pronta para evoluir com RBAC,
                auditoria e fluxos colaborativos.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <article className="rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-5">
              <p className="text-sm font-semibold text-lime-200">JWT</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Refresh automático com redirecionamento para login em falhas de autenticação.</p>
            </article>
            <article className="rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-5">
              <p className="text-sm font-semibold text-cyan-200">DnD</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Boards com colunas e cards movidos por drag-and-drop e update otimista.</p>
            </article>
            <article className="rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-5">
              <p className="text-sm font-semibold text-amber-200">Query Cache</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Invalidação segmentada para dashboard e board detail sem reloading manual.</p>
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/78 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-400 uppercase">SecureBoard Access</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em]">{title}</h2>
            <p className="text-sm leading-7 text-slate-400">{description}</p>
          </div>

          {children}

          <div className="mt-8 border-t border-white/10 pt-6 text-sm text-slate-400">{footer}</div>
        </section>
      </div>
    </main>
  );
}
