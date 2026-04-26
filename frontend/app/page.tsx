export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(196,255,163,0.18),_transparent_30%),linear-gradient(135deg,_#09111b_0%,_#101826_55%,_#162133_100%)] text-stone-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-12 px-6 py-16 sm:px-10 lg:px-12">
        <div className="inline-flex w-fit items-center rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-medium tracking-[0.22em] text-emerald-200 uppercase backdrop-blur">
          SecureBoard Portfolio
        </div>

        <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <h1 className="max-w-4xl text-5xl leading-[0.95] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
              Full stack architecture with security as a product feature.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              SecureBoard is a portfolio project built to demonstrate a hardened backend in Node.js,
              a modern frontend in Next.js and an implementation path aligned with OWASP principles.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
                href="https://github.com/Jose-Wernerson/SecureBoard"
                target="_blank"
                rel="noreferrer"
              >
                View repository
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
                href="/"
              >
                Start building modules
              </a>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-xs font-medium tracking-[0.28em] text-emerald-200 uppercase">
                Planned stack
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>Node.js + TypeScript API with validation and middleware hardening</li>
                <li>Next.js App Router interface with Tailwind CSS</li>
                <li>PostgreSQL with Prisma ORM and Dockerized local setup</li>
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <article className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                <p className="text-3xl font-semibold text-emerald-200">OWASP</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Validation, auth boundaries and secure defaults from the start.</p>
              </article>
              <article className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                <p className="text-3xl font-semibold text-cyan-200">RBAC</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Role-based access planned for dashboard and admin surfaces.</p>
              </article>
              <article className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                <p className="text-3xl font-semibold text-amber-200">Audit</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Action trails and operational visibility for critical flows.</p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
