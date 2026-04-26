"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const router = useRouter();
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">Authenticated session</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Boards protegidos por JWT</h1>
      </div>

      <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-slate-950/65 px-4 py-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{user?.name ?? "Usuário SecureBoard"}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{user?.email ?? "sem-sessao"}</p>
        </div>

        <Button className="h-10 px-3" onClick={handleLogout} variant="secondary">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
