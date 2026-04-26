import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(198,255,102,0.12),_transparent_20%),linear-gradient(165deg,_#07111d_0%,_#0d1827_48%,_#16253a_100%)] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar />

        <div className="flex min-w-0 flex-col gap-6">
          <AppHeader />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
