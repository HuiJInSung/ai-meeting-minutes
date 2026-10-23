import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { MeetingModel, type Meeting } from "@/models/Meeting";
import type { MeetingDetail, MeetingListItem } from "@/lib/meeting-types";

type MeetingDoc = Meeting & { _id: { toString(): string } };

// 錄音檔一律經過我們的 API 播放，不把 Blob 原始網址給前端
export function audioPath(meetingId: string) {
  return `/api/meetings/${meetingId}/audio`;
}

export function toMeetingDetail(doc: MeetingDoc): MeetingDetail {
  const id = doc._id.toString();
  return {
    id,
    title: doc.title,
    createdAt: new Date(doc.createdAt).toISOString(),
    status: doc.status,
    transcript: doc.transcript?.fullText ?? "",
    minutes: doc.ai
      ? {
          summary: doc.ai.summary ?? "",
          keyPoints: doc.ai.keyPoints ?? [],
          actionItems: (doc.ai.actionItems ?? []).map((item) => ({
            task: item.task,
            owner: item.owner ?? null,
            dueDate: item.dueDate ?? null,
          })),
        }
      : null,
    minutesError: doc.errorMessage ?? null,
    audio: doc.audio
      ? {
          url: audioPath(id),
          originalName: doc.audio.originalName ?? null,
          contentType: doc.audio.contentType ?? null,
          size: doc.audio.size ?? null,
        }
      : null,
  };
}

// 以下查詢都必須帶 userId，確保只拿得到自己的資料
export async function listMeetings(userId: string): Promise<MeetingListItem[]> {
  await connectDB();
  const docs = await MeetingModel.find({ userId })
    .sort({ createdAt: -1 })
    .select("title createdAt status ai.summary audio.size")
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    createdAt: new Date(doc.createdAt).toISOString(),
    status: doc.status,
    summary: doc.ai?.summary ?? null,
    hasAudio: Boolean(doc.audio),
  }));
}

export async function findMeeting(userId: string, meetingId: string) {
  if (!isValidObjectId(meetingId)) return null;
  await connectDB();
  return MeetingModel.findOne({ _id: meetingId, userId }).lean<MeetingDoc>();
}
