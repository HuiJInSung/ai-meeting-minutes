"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { UploadIcon, WaveIcon } from "@/components/icons";
import type { MeetingDetail } from "@/lib/meeting-types";

const MAX_MB = 25;
const ACCEPT = "audio/*,.m4a,.mp3,.mp4,.wav,.webm,.ogg,.flac";

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatElapsed(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function AudioUploader({
  onUploaded,
}: {
  onUploaded: (meeting: MeetingDetail) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // 處理中顯示經過時間
  useEffect(() => {
    if (!loading) return;
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => {
      clearInterval(timer);
      setElapsed(0);
    };
  }, [loading]);

  function pickFile(next: File | null) {
    setError(null);
    if (next && next.size > MAX_MB * 1024 * 1024) {
      setFile(null);
      setError(`「${next.name}」超過 ${MAX_MB}MB 上限，請先壓縮或切段。`);
      return;
    }
    setFile(next);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (loading) return;
    pickFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "轉錄失敗");

      onUploaded(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading && file) {
    return <Processing fileName={file.name} elapsed={elapsed} />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`group relative flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed px-6 py-12 text-center transition sm:py-16 ${
          dragging ? "border-accent bg-accent-soft/60" : "border-line bg-surface hover:border-ink/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        <span
          className={`grid size-14 place-items-center rounded-2xl transition ${
            dragging ? "bg-accent text-accent-ink" : "bg-ink text-paper group-hover:-translate-y-0.5"
          }`}
        >
          <UploadIcon className="size-6" />
        </span>
        <div className="flex flex-col gap-1.5">
          {/* 手機沒有拖曳，直接提示點選 */}
          <p className="font-serif text-xl font-black">
            {dragging ? (
              "放開就上傳"
            ) : (
              <>
                <span className="sm:hidden">點一下選擇錄音檔</span>
                <span className="hidden sm:inline">拖曳錄音檔到這裡</span>
              </>
            )}
          </p>
          <p className="text-sm text-muted">
            <span className="hidden sm:inline">
              或<span className="mx-1 font-medium text-ink underline decoration-accent decoration-2 underline-offset-4">點此選擇檔案</span>・
            </span>
            mp3、m4a、wav、webm 等，最大 {MAX_MB}MB
          </p>
        </div>
      </label>

      {file && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 sm:flex-row sm:items-center sm:p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <WaveIcon />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{file.name}</p>
              <p className="font-mono text-xs text-muted">{formatSize(file.size)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="h-11 flex-1 rounded-full px-4 text-sm text-muted hover:bg-sunken hover:text-ink sm:flex-none"
            >
              移除
            </button>
            <button
              type="submit"
              className="h-11 flex-[2] rounded-full bg-ink px-6 text-sm font-medium text-paper transition hover:bg-accent hover:text-accent-ink sm:flex-none"
            >
              開始整理
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}

// 處理中畫面：API 是一次完成的，這裡只列出正在進行的工作，不假裝顯示進度
function Processing({ fileName, elapsed }: { fileName: string; elapsed: number }) {
  const bars = Array.from({ length: 28 }, (_, i) => 8 + ((i * 7) % 20));
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-8 rounded-2xl border border-line bg-surface px-6 py-10 sm:px-10 sm:py-12"
    >
      <div className="flex h-12 items-center justify-center gap-1" aria-hidden>
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-1.5 origin-center animate-wave rounded-full bg-accent"
            style={{ height: `${h + 12}px`, animationDelay: `${(i % 9) * 110}ms` }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-serif text-xl font-black">正在整理你的會議…</p>
        <p className="max-w-full truncate text-sm text-muted">{fileName}</p>
        <p className="font-mono text-sm text-ink-soft">已經過 {formatElapsed(elapsed)}</p>
      </div>
      <ul className="mx-auto grid w-full max-w-md gap-2 text-sm text-ink-soft">
        {["上傳錄音檔", "AI 轉成逐字稿", "整理摘要、重點與待辦", "儲存到你的歷史紀錄"].map((t) => (
          <li key={t} className="flex items-center gap-3 rounded-xl bg-sunken px-4 py-2.5">
            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-accent" />
            {t}
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-muted">錄音越長需要越久，一小時的會議可能要幾分鐘，請不要關閉頁面。</p>
    </div>
  );
}
