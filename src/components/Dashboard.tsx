"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AudioUploader from "@/components/AudioUploader";
import MeetingView from "@/components/MeetingView";
import { ArrowIcon, DocIcon, PlusIcon } from "@/components/icons";
import type { MeetingDetail, MeetingListItem } from "@/lib/meeting-types";

async function fetchJson<T>(url: string, onUnauthorized: () => void): Promise<T> {
  const res = await fetch(url);
  if (res.status === 401) {
    onUnauthorized();
    throw new Error("請先登入");
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "讀取失敗");
  return data;
}

function toListItem(meeting: MeetingDetail): MeetingListItem {
  return {
    id: meeting.id,
    title: meeting.title,
    createdAt: meeting.createdAt,
    status: meeting.status,
    summary: meeting.minutes?.summary ?? null,
    hasAudio: Boolean(meeting.audio),
  };
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingListItem[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MeetingDetail | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<{ meetings: MeetingListItem[] }>("/api/meetings", () => router.push("/login"))
      .then((data) => setMeetings(data.meetings))
      .catch((err) => setListError(err.message));
  }, [router]);

  async function openMeeting(id: string) {
    setSelecting(id);
    setDetailError(null);
    try {
      setSelected(await fetchJson<MeetingDetail>(`/api/meetings/${id}`, () => router.push("/login")));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : String(err));
    } finally {
      setSelecting(null);
    }
  }

  function handleUploaded(meeting: MeetingDetail) {
    setMeetings((prev) => [toListItem(meeting), ...(prev ?? [])]);
    setSelected(meeting);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    setSelected(null);
    setDetailError(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-8">
      {/* 歷史紀錄：手機上看單筆時隱藏 */}
      <aside className={`${selected ? "hidden lg:flex" : "flex"} order-2 flex-col gap-4 lg:sticky lg:top-24 lg:order-1 lg:max-h-[calc(100dvh-8rem)]`}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-black">
            歷史紀錄
            {meetings && meetings.length > 0 && (
              <span className="ml-2 font-mono text-xs font-normal text-muted">{meetings.length}</span>
            )}
          </h2>
          <button
            onClick={startNew}
            className="hidden items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper transition hover:bg-accent hover:text-accent-ink lg:inline-flex"
          >
            <PlusIcon className="size-3.5" />
            新會議
          </button>
        </div>

        {listError && <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{listError}</p>}

        {!meetings && !listError && (
          <ul className="flex flex-col gap-2" aria-label="載入中">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-[4.5rem] animate-pulse rounded-xl bg-sunken" />
            ))}
          </ul>
        )}

        {meetings?.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-10 text-center">
            <DocIcon className="size-6 text-muted" />
            <p className="text-sm text-muted">還沒有會議紀錄，上傳第一段錄音吧。</p>
          </div>
        )}

        {meetings && meetings.length > 0 && (
          <ul className="-mx-1 flex flex-col gap-1.5 overflow-y-auto px-1 pb-1">
            {meetings.map((m) => {
              const active = selected?.id === m.id;
              return (
                <li key={m.id}>
                  <button
                    onClick={() => openMeeting(m.id)}
                    aria-current={active ? "true" : undefined}
                    className={`group flex w-full flex-col gap-1 rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-ink bg-surface shadow-[0_8px_24px_-16px_rgba(26,24,20,0.5)]"
                        : "border-transparent hover:border-line hover:bg-surface"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`size-1.5 shrink-0 rounded-full ${m.status === "failed" ? "bg-danger" : active ? "bg-accent" : "bg-line"}`} />
                      <span className="min-w-0 flex-1 truncate font-medium">{m.title}</span>
                      {selecting === m.id && <span className="size-3 animate-spin rounded-full border-2 border-line border-t-accent" />}
                    </span>
                    <span className="pl-3.5 font-mono text-[11px] text-muted">
                      {shortDate(m.createdAt)}
                      {m.status === "failed" && <span className="ml-2 text-danger">整理失敗</span>}
                    </span>
                    {m.summary && <span className="line-clamp-2 pl-3.5 text-xs leading-5 text-muted">{m.summary}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* 主畫面：上傳或查看單筆 */}
      <section className="order-1 min-w-0 lg:order-2">
        {detailError && (
          <p className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{detailError}</p>
        )}

        {selected ? (
          <div className="flex flex-col gap-5">
            <button
              onClick={startNew}
              className="inline-flex items-center gap-1.5 self-start rounded-full px-1 text-sm text-muted hover:text-ink lg:hidden"
            >
              <ArrowIcon className="size-4 rotate-180" />
              返回列表
            </button>
            <MeetingView key={selected.id} meeting={selected} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-serif text-2xl font-black sm:text-3xl">整理一場新會議</h1>
              <p className="text-muted">上傳錄音檔，幾分鐘後拿到逐字稿、摘要、重點與待辦事項。</p>
            </div>
            <AudioUploader onUploaded={handleUploaded} />
          </div>
        )}
      </section>
    </div>
  );
}
