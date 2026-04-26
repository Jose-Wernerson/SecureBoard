"use client";

import { LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full max-w-xs flex-col rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-2xl shadow-black/20 backdrop-blur xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
      <div className="rounded-[1.6rem] border border-lime-300/15 bg-slate-950/70 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-slate-950">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">SecureBoard</p>
            <p className="text-lg font-semibold tracking-[-0.03em] text-white">Workspace</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Um shell autenticado para explorar boards, fluxos de sessão e interações com cache previsível.
        </p>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white",
                isActive && "bg-lime-300/12 text-white ring-1 ring-lime-300/25",
              )}
              href={link.href}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
