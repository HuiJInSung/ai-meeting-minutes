import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import {
  ArrowIcon,
  CheckIcon,
  ClockIcon,
  DocIcon,
  LockIcon,
  SparkIcon,
  UploadIcon,
  WaveIcon,
} from "@/components/icons";

// Landing page：介紹服務、適合誰、怎麼開始，導向註冊
export default function LandingPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <Nav />
      <main className="flex flex-col">
        <Hero />
        <HowItWorks />
        <Deliverables />
        <Audience />
        <GetStarted />
        <Privacy />
        <SignupTicket />
      </main>
      <Footer />
    </div>
  );
}

/* ───────── 共用 ───────── */

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">{children}</p>
  );
}

function SectionTitle({ eyebrow, title, desc }: { eyebrow: string; title: ReactNode; desc?: string }) {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-serif text-3xl font-black leading-tight tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {desc && <p className="text-base leading-8 text-muted sm:text-lg">{desc}</p>}
    </div>
  );
}

function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition hover:bg-accent hover:text-accent-ink"
    >
      {children}
      <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ───────── 導覽列 ───────── */

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
          <a href="#how" className="hover:text-accent">怎麼運作</a>
          <a href="#who" className="hover:text-accent">適合誰</a>
          <a href="#start" className="hover:text-accent">開始使用</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink">
            登入
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-accent hover:text-accent-ink"
          >
            註冊
          </Link>
        </div>
      </Container>
    </header>
  );
}

/* ───────── Hero ───────── */

function Hero() {
  return (
    <section className="relative">
      <div className="grain pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <Container className="relative grid items-center gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-28 lg:pt-24">
        <div className="flex animate-rise flex-col gap-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft">
            <span className="size-1.5 rounded-full bg-accent" />
            AI 會議記錄・上傳錄音就好
          </span>

          <h1 className="font-serif text-[2.6rem] font-black leading-[1.15] tracking-tight sm:text-6xl lg:text-[4.2rem]">
            會議開完，
            <br />
            紀錄已經
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">寫好了</span>
              <span className="absolute inset-x-0 bottom-[0.08em] -z-0 h-[0.32em] -rotate-1 rounded-sm bg-accent/30" />
            </span>
            。
          </h1>

          <p className="max-w-xl text-base leading-8 text-ink-soft sm:text-lg sm:leading-9">
            把會議錄音丟進來，議記會轉成完整逐字稿，再整理出
            <strong className="font-medium text-ink">摘要、重點與待辦事項</strong>
            ——誰要做什麼、什麼時候要好，一眼看清楚。
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryButton href="/signup">建立帳號，開始使用</PrimaryButton>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-surface px-6 text-[15px] font-medium hover:border-ink"
            >
              我已經有帳號
            </Link>
          </div>

          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>支援 mp3・m4a・wav・webm 等格式</span>
            <span className="hidden h-3 w-px bg-line sm:block" />
            <span>單檔最大 25MB</span>
          </p>
        </div>

        <HeroDemo />
      </Container>
    </section>
  );
}

// 示意畫面：錄音 → 整理好的會議記錄（純展示，非真實資料）
function HeroDemo() {
  const bars = [5, 9, 14, 8, 18, 12, 22, 15, 10, 19, 13, 7, 16, 11, 20, 9, 14, 6, 12, 17, 8, 13];
  return (
    <div className="relative mx-auto w-full max-w-md animate-rise [animation-delay:150ms] lg:max-w-none">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-accent-soft/60 blur-2xl" />

      {/* 錄音檔 */}
      <div className="relative z-10 ml-auto w-[88%] rotate-[1.5deg] rounded-2xl border border-line bg-surface p-4 shadow-[0_18px_40px_-24px_rgba(26,24,20,0.45)]">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-paper">
            <WaveIcon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">產品週會_1023.m4a</p>
            <p className="font-mono text-[11px] text-muted">00:42:18 ・ 18.6 MB</p>
          </div>
          <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[11px] font-medium text-sage">已上傳</span>
        </div>
        <div className="mt-4 flex h-7 items-center justify-between" aria-hidden>
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-[3px] origin-center animate-wave rounded-full bg-accent/80 sm:w-1"
              style={{ height: `${h + 6}px`, animationDelay: `${(i % 7) * 120}ms` }}
            />
          ))}
        </div>
      </div>

      {/* 整理結果 */}
      <div className="relative -mt-3 w-[94%] -rotate-1 rounded-2xl border border-line bg-surface p-5 shadow-[0_30px_60px_-30px_rgba(26,24,20,0.5)] sm:p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">會議記錄</p>
          <span className="inline-flex items-center gap-1 text-[11px] text-sage">
            <CheckIcon className="size-3.5" /> 整理完成
          </span>
        </div>

        <p className="mt-3 font-serif text-lg font-black">新產品上線時程確認</p>
        <p className="mt-2 text-sm leading-7 text-ink-soft">
          確認新版 App 於下個月 15 日上線，上線前完成壓力測試與客服教育訓練。
        </p>

        <div className="mt-4 border-t border-dashed border-line pt-4">
          <p className="text-xs font-medium text-muted">待辦事項</p>
          <ul className="mt-2.5 flex flex-col gap-2 text-sm">
            {[
              ["準備壓力測試報告", "小明", "下週五"],
              ["整理客服 FAQ", "Amy", "月底前"],
            ].map(([task, owner, due]) => (
              <li key={task} className="flex items-center gap-2.5">
                <span className="grid size-4 shrink-0 place-items-center rounded-[5px] border border-ink/30" />
                <span className="min-w-0 flex-1 truncate">{task}</span>
                <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-soft">
                  {owner}・{due}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 便利貼 */}
      <div className="absolute -bottom-6 right-0 z-20 rotate-[4deg] rounded-md bg-[#ffd966] px-3 py-2 font-serif text-sm font-black text-[#3b2f00] shadow-lg sm:-right-4">
        不用再邊開會邊打字 ✍︎
      </div>
    </div>
  );
}

/* ───────── 怎麼運作 ───────── */

function HowItWorks() {
  const steps = [
    {
      icon: <UploadIcon />,
      title: "上傳錄音",
      desc: "手機錄音、線上會議匯出的音檔都可以，選檔或拖曳進來就好。",
    },
    {
      icon: <DocIcon />,
      title: "轉成逐字稿",
      desc: "AI 語音辨識把整場會議轉成繁體中文逐字稿，一字不漏留下紀錄。",
    },
    {
      icon: <SparkIcon />,
      title: "整理成會議記錄",
      desc: "自動歸納摘要、重點與待辦事項，標出負責人與期限。",
    },
  ];

  return (
    <section id="how" className="scroll-mt-20 border-y border-line bg-surface py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionTitle
          eyebrow="How it works"
          title="從錄音到會議記錄，只要三步"
          desc="你只需要做第一步。剩下的，議記會在幾分鐘內幫你完成。"
        />
        <ol className="grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="relative flex flex-col gap-5 rounded-2xl border border-line bg-paper p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-ink text-paper">{step.icon}</span>
                <span className="font-mono text-sm text-muted">0{i + 1}</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-xl font-black">{step.title}</h3>
                <p className="leading-7 text-ink-soft">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowIcon className="absolute -right-4 top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-surface text-muted md:block" />
              )}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ───────── 你會拿到 ───────── */

function Deliverables() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionTitle
          eyebrow="What you get"
          title={
            <>
              每一場會議，都留下
              <br className="hidden sm:block" />
              一份看得懂、找得到的紀錄
            </>
          }
        />

        <div className="grid gap-5 md:grid-cols-6">
          <Card className="md:col-span-4" label="摘要" title="三十秒看懂一小時的會">
            <p className="font-serif text-lg leading-9 text-ink-soft">
              「本次會議確認新產品上線時程，決議於下個月 15 日正式上線，並分配測試與客服準備工作⋯⋯」
            </p>
          </Card>

          <Card className="md:col-span-2" label="重點" title="決議與共識，條列清楚">
            <ul className="flex flex-col gap-2.5 text-ink-soft">
              {["上線日期確定", "需先完成壓力測試", "客服需教育訓練"].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="font-mono text-sm text-accent">0{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="md:col-span-3" label="待辦事項" title="誰做什麼、何時完成">
            <div className="flex flex-wrap gap-2">
              {["負責人", "期限", "具體任務"].map((t) => (
                <span key={t} className="rounded-full border border-line bg-paper px-3 py-1 text-sm text-ink-soft">
                  {t}
                </span>
              ))}
            </div>
            <p className="text-sm leading-7 text-muted">逐字稿沒提到的負責人或期限，會標示「未指定」，不會亂猜。</p>
          </Card>

          <Card className="md:col-span-3" label="逐字稿＋錄音" title="原始內容永遠都在">
            <p className="leading-7 text-ink-soft">
              完整逐字稿與原始錄音一起保存，對內容有疑問時，隨時回頭聽、回頭查。
            </p>
          </Card>
        </div>
      </Container>
    </section>
  );
}

function Card({
  label,
  title,
  children,
  className = "",
}: {
  label: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 sm:p-8 ${className}`}>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-accent">{label}</p>
        <h3 className="font-serif text-2xl font-black">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ───────── 適合誰 ───────── */

function Audience() {
  const people = [
    { who: "專案經理", scene: "每週例會、跨部門同步，決議和待辦不再散落在各自的筆記裡。" },
    { who: "業務與顧問", scene: "客戶訪談、需求訪談專心聽就好，會後直接拿到重點整理。" },
    { who: "主管與團隊", scene: "會議決策有紀錄可循，沒參加的同事也能快速跟上。" },
    { who: "研究與教學", scene: "使用者訪談、課堂、讀書會，逐字稿方便引用與回顧。" },
  ];

  return (
    <section id="who" className="scroll-mt-20 bg-ink py-20 text-paper sm:py-28">
      <Container className="flex flex-col gap-14">
        <div className="flex max-w-2xl flex-col gap-4">
          <Eyebrow>Who it&apos;s for</Eyebrow>
          <h2 className="font-serif text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            給每個「開會時沒空做筆記」的人
          </h2>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
          {people.map((p) => (
            <li key={p.who} className="flex gap-5 bg-ink p-6 sm:p-8">
              <span className="font-serif text-5xl font-black leading-none text-accent">{p.who[0]}</span>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">{p.who}</h3>
                <p className="leading-7 text-paper/70">{p.scene}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ───────── 怎麼開始 ───────── */

function GetStarted() {
  const steps = [
    { icon: <ClockIcon />, title: "建立帳號", desc: "填名稱、Email 和密碼，不到一分鐘。" },
    { icon: <UploadIcon />, title: "上傳第一段錄音", desc: "登入後在工作台選擇或拖曳音檔，按下「開始整理」。" },
    { icon: <DocIcon />, title: "拿到會議記錄", desc: "幾分鐘後就能看到逐字稿與整理結果，所有紀錄都留在歷史清單裡。" },
  ];

  return (
    <section id="start" className="scroll-mt-20 py-20 sm:py-28">
      <Container className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div className="flex flex-col gap-8">
          <SectionTitle eyebrow="Get started" title="今天的會議，今天就整理好" />
          <div>
            <PrimaryButton href="/signup">立即註冊</PrimaryButton>
          </div>
        </div>
        <ol className="relative ml-[1.15rem] flex flex-col gap-10 border-l border-dashed border-line pl-8 sm:pl-10 lg:ml-0">
          {steps.map((step, i) => (
            <li key={step.title} className="relative flex flex-col gap-2">
              <span className="absolute -left-[3.2rem] top-0 grid size-9 place-items-center rounded-full border border-line bg-surface text-accent sm:-left-[3.7rem]">
                {step.icon}
              </span>
              <p className="font-mono text-xs text-muted">STEP 0{i + 1}</p>
              <h3 className="font-serif text-2xl font-black">{step.title}</h3>
              <p className="leading-7 text-ink-soft">{step.desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ───────── 隱私 ───────── */

function Privacy() {
  return (
    <section className="pb-20 sm:pb-28">
      <Container>
        <div className="flex flex-col gap-6 rounded-2xl border border-line bg-sage-soft p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-10">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sage text-paper">
            <LockIcon className="size-6" />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-2xl font-black text-ink">你的錄音，只有你聽得到</h2>
            <p className="leading-7 text-ink-soft">
              錄音檔以私有方式保存，必須登入本人帳號才能播放；每個人只看得到自己上傳的會議紀錄。
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ───────── 註冊入口 ───────── */

function SignupTicket() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container>
        <div className="relative grid overflow-hidden rounded-[1.75rem] bg-accent text-accent-ink md:grid-cols-[1.4fr_1fr]">
          {/* 票根打孔 */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-[58.33%] hidden w-px border-l-2 border-dashed border-accent-ink/25 md:block"
          />
          <div className="absolute -top-4 left-[58.33%] hidden size-8 -translate-x-1/2 rounded-full bg-paper md:block" />
          <div className="absolute -bottom-4 left-[58.33%] hidden size-8 -translate-x-1/2 rounded-full bg-paper md:block" />

          <div className="relative flex flex-col gap-5 p-8 sm:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-75">Admit one ・ 會議記錄入場券</p>
            <h2 className="font-serif text-3xl font-black leading-tight sm:text-5xl">
              下一場會議，
              <br />
              交給議記做筆記。
            </h2>
            <ul className="flex flex-col gap-2 text-[15px] opacity-90">
              {["逐字稿、摘要、重點、待辦一次到位", "歷史紀錄隨時回顧", "錄音私有保存"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckIcon className="size-4 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-col justify-center gap-4 border-t-2 border-dashed border-accent-ink/25 p-8 sm:p-12 md:border-t-0">
            <Link
              href="/signup"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink text-base font-medium text-paper transition hover:scale-[1.02]"
            >
              建立我的帳號
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="text-center text-sm opacity-80">
              已經有帳號了？
              <Link href="/login" className="ml-1 font-medium underline underline-offset-4">
                直接登入
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ───────── 頁尾 ───────── */

function Footer() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col items-start justify-between gap-4 py-8 text-sm text-muted sm:flex-row sm:items-center">
        <Logo />
        <p>上傳錄音，自動產生會議記錄。</p>
      </Container>
    </footer>
  );
}
