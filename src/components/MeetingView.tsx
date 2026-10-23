"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CheckIcon, CopyIcon, DocIcon, SparkIcon, UserIcon, ClockIcon } from "@/components/icons";
import type { MeetingDetail } from "@/lib/meeting-types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 把整理結果轉成純文字，方便貼到 Slack / Email
function toPlainText(meeting: MeetingDetail) {
  const m = meeting.minutes;
  if (!m) return meeting.transcript;
  return [
    `# ${meeting.title}`,
    "",
    "【摘要】",
    m.summary,
    "",
    "【重點】",
    ...m.keyPoints.map((p, i) => `${i + 1}. ${p}`),
    "",
    "【待辦事項】",
    ...(m.actionItems.length
      ? m.actionItems.map((a) => `- ${a.task}（負責人：${a.owner ?? "未指定"}；期限：${a.dueDate ?? "未指定"}）`)
      : ["（無）"]),
  ].join("\n");
}

function Panel({
  icon,
  title,
  aside,
  children,
}: {
  icon: ReactNode;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 font-serif text-lg font-black">
          <span className="grid size-8 place-items-center rounded-lg bg-sunken text-ink-soft">{icon}</span>
          {title}
        </h3>
        {aside}
      </header>
      {children}
    </section>
  );
}

// 錄音 API 以串流回傳、沒有總長度，瀏覽器無法顯示時間軸與拖曳
// 所以先整個下載成本機 blob 再播放（單檔最多 25MB）
function AudioPlayer({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
      {src ? (
        <audio controls preload="metadata" src={src} className="h-10 w-full" />
      ) : (
        <div className="flex h-10 items-center gap-3 px-2 text-sm text-muted">
          {failed ? (
            "錄音載入失敗，請重新整理頁面再試一次"
          ) : (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-line border-t-accent" />
              錄音載入中…
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Count({ n }: { n: number }) {
  return <span className="rounded-full bg-sunken px-2.5 py-0.5 font-mono text-xs text-muted">{n}</span>;
}

export default function MeetingView({ meeting }: { meeting: MeetingDetail }) {
  const { minutes } = meeting;
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const longTranscript = meeting.transcript.length > 600;

  async function copy() {
    try {
      await navigator.clipboard.writeText(toPlainText(meeting));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 瀏覽器不允許存取剪貼簿時就略過
    }
  }

  return (
    <article className="flex animate-rise flex-col gap-5">
      {/* 標題列 */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="font-serif text-2xl font-black leading-snug break-words sm:text-3xl">{meeting.title}</h2>
          <p className="text-sm text-muted">{formatDate(meeting.createdAt)}</p>
        </div>
        <button
          onClick={copy}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-line bg-surface px-4 text-sm font-medium transition hover:border-ink"
        >
          {copied ? <CheckIcon className="size-4 text-sage" /> : <CopyIcon className="size-4" />}
          {copied ? "已複製" : "複製會議記錄"}
        </button>
      </header>

      {/* 錄音 */}
      {meeting.audio && <AudioPlayer url={meeting.audio.url} />}

      {meeting.minutesError && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {meeting.minutesError}
        </p>
      )}

      {minutes && (
        <>
          {/* 摘要 */}
          <section className="relative overflow-hidden rounded-2xl bg-ink p-6 text-paper sm:p-8">
            <span className="pointer-events-none absolute -right-2 -top-10 font-serif text-[10rem] font-black leading-none text-white/5">
              摘
            </span>
            <p className="relative font-mono text-xs uppercase tracking-[0.2em] text-accent">Summary ・ 摘要</p>
            <p className="relative mt-3 font-serif text-lg leading-9 sm:text-xl sm:leading-10">{minutes.summary}</p>
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            {/* 重點 */}
            <Panel icon={<SparkIcon className="size-4" />} title="重點" aside={<Count n={minutes.keyPoints.length} />}>
              {minutes.keyPoints.length > 0 ? (
                <ol className="flex flex-col gap-3">
                  {minutes.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 leading-7">
                      <span className="mt-0.5 font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <span className="min-w-0">{point}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted">沒有整理出重點</p>
              )}
            </Panel>

            {/* 待辦 */}
            <Panel icon={<CheckIcon className="size-4" />} title="待辦事項" aside={<Count n={minutes.actionItems.length} />}>
              {minutes.actionItems.length > 0 ? (
                <ul className="flex flex-col gap-2.5">
                  {minutes.actionItems.map((item, i) => (
                    <li key={i} className="flex gap-3 rounded-xl border border-line bg-paper p-3.5">
                      <span className="mt-1 size-4 shrink-0 rounded-[5px] border-[1.5px] border-ink/30" />
                      <div className="flex min-w-0 flex-col gap-2">
                        <span className="leading-6">{item.task}</span>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                              item.owner ? "bg-accent-soft text-accent" : "bg-sunken text-muted"
                            }`}
                          >
                            <UserIcon className="size-3" />
                            {item.owner ?? "未指定"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                              item.dueDate ? "bg-sage-soft text-sage" : "bg-sunken text-muted"
                            }`}
                          >
                            <ClockIcon className="size-3" />
                            {item.dueDate ?? "未指定"}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">這場會議沒有待辦事項</p>
              )}
            </Panel>
          </div>
        </>
      )}

      {/* 逐字稿 */}
      <Panel icon={<DocIcon className="size-4" />} title="逐字稿" aside={<span className="font-mono text-xs text-muted">{meeting.transcript.length} 字</span>}>
        <div className="relative">
          <p
            className={`whitespace-pre-wrap break-words leading-8 text-ink-soft ${
              longTranscript && !expanded ? "max-h-64 overflow-hidden" : ""
            }`}
          >
            {meeting.transcript || "（沒有辨識到內容）"}
          </p>
          {longTranscript && !expanded && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
          )}
        </div>
        {longTranscript && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="self-start text-sm font-medium underline decoration-accent decoration-2 underline-offset-4"
          >
            {expanded ? "收合" : "展開全文"}
          </button>
        )}
      </Panel>
    </article>
  );
}
