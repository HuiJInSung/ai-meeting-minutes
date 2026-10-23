"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import Logo from "@/components/Logo";
import { CheckIcon } from "@/components/icons";

const inputClass =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-ink focus:ring-4 focus:ring-ink/5";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState(isSignup ? signup : login, undefined);

  return (
    <div className="grid flex-1 lg:grid-cols-[1fr_1.1fr]">
      {/* 左側品牌區（桌機才顯示） */}
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
        <div className="grain absolute inset-0 opacity-30" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative flex flex-col gap-8">
          <p className="font-serif text-4xl font-black leading-snug">
            專心開會，
            <br />
            <span className="text-accent">筆記交給我們。</span>
          </p>
          <ul className="flex flex-col gap-3 text-paper/75">
            {["上傳錄音，自動產生繁體中文逐字稿", "摘要、重點、待辦事項一次整理好", "錄音私有保存，只有你看得到"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-white/10">
                  <CheckIcon className="size-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative font-mono text-xs text-paper/40">議記 ・ AI MEETING MINUTES</p>
      </aside>

      {/* 表單區 */}
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 py-12">
          <header className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl font-black">{isSignup ? "建立你的帳號" : "歡迎回來"}</h1>
            <p className="text-muted">
              {isSignup ? "註冊後就能開始上傳會議錄音。" : "登入後繼續整理你的會議記錄。"}
            </p>
          </header>

          <form action={action} className="flex flex-col gap-5">
            {isSignup && (
              <label className="flex flex-col gap-2 text-sm font-medium">
                名稱
                <input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="例如：王小明"
                  defaultValue={state?.fields?.name}
                  className={inputClass}
                />
              </label>
            )}
            <label className="flex flex-col gap-2 text-sm font-medium">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                defaultValue={state?.fields?.email}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className="flex items-baseline justify-between">
                密碼
                {isSignup && <span className="text-xs font-normal text-muted">至少 8 個字元</span>}
              </span>
              <input
                name="password"
                type="password"
                required
                minLength={isSignup ? 8 : undefined}
                autoComplete={isSignup ? "new-password" : "current-password"}
                className={inputClass}
              />
            </label>

            {state?.error && (
              <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 h-12 rounded-full bg-ink text-[15px] font-medium text-paper transition hover:bg-accent hover:text-accent-ink disabled:pointer-events-none disabled:opacity-50"
            >
              {pending ? "處理中…" : isSignup ? "註冊並開始使用" : "登入"}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            {isSignup ? "已經有帳號了？" : "還沒有帳號？"}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="ml-1 font-medium text-ink underline decoration-accent decoration-2 underline-offset-4"
            >
              {isSignup ? "登入" : "立即註冊"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
