import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import Dashboard from "@/components/Dashboard";
import Logo from "@/components/Logo";
import { requireUser } from "@/lib/dal";

// 工作台：上傳錄音、查看歷史會議記錄（需登入）
export default function AppPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo href="/app" />
          <Suspense fallback={<span className="h-9 w-32 animate-pulse rounded-full bg-sunken" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Dashboard />
      </main>
    </div>
  );
}

// 讀登入狀態，沒登入會被導到 /login
async function UserMenu() {
  const user = await requireUser();
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="flex min-w-0 items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft font-serif text-sm font-black text-accent">
          {user.name.slice(0, 1)}
        </span>
        <span className="max-w-[8rem] truncate text-sm font-medium sm:max-w-[12rem]">{user.name}</span>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-full px-3 py-2 text-sm text-muted transition hover:bg-sunken hover:text-ink"
        >
          登出
        </button>
      </form>
    </div>
  );
}
