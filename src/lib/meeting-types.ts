// 前後端共用的 API 回傳型別
import type { MeetingMinutes } from "@/lib/summarize";

export type MeetingStatus = "draft" | "processing" | "completed" | "failed";

export type MeetingListItem = {
  id: string;
  title: string;
  createdAt: string;
  status: MeetingStatus;
  summary: string | null;
  hasAudio: boolean;
};

export type MeetingDetail = {
  id: string;
  title: string;
  createdAt: string;
  status: MeetingStatus;
  transcript: string;
  minutes: MeetingMinutes | null;
  minutesError: string | null;
  audio: {
    url: string;
    originalName: string | null;
    contentType: string | null;
    size: number | null;
  } | null;
};
