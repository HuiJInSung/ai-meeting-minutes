import { put } from "@vercel/blob";
import { findCurrentUser, unauthorized } from "@/lib/dal";
import { toMeetingDetail } from "@/lib/meetings";
import { connectDB } from "@/lib/mongodb";
import { MAX_AUDIO_BYTES, SUMMARY_MODEL, TRANSCRIBE_MODEL, openai } from "@/lib/openai";
import { summarizeTranscript, type MeetingMinutes } from "@/lib/summarize";
import { MeetingModel } from "@/models/Meeting";

// 轉錄長音檔加上 AI 整理可能需要一段時間
export const maxDuration = 300;

// 副檔名 → 音檔類型（瀏覽器沒帶或帶成 octet-stream 時用來補上，播放器才認得）
const AUDIO_TYPES: Record<string, string> = {
  flac: "audio/flac",
  mp3: "audio/mpeg",
  mp4: "audio/mp4",
  mpeg: "audio/mpeg",
  mpga: "audio/mpeg",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  wav: "audio/wav",
  webm: "audio/webm",
};
const ALLOWED_EXTENSIONS = Object.keys(AUDIO_TYPES);

// 上傳音檔 → 轉成逐字稿 → 整理成摘要、重點、待辦事項 → 錄音存 Vercel Blob → 全部存進 MongoDB
// POST /api/transcribe（multipart/form-data，欄位名稱 file）
export async function POST(request: Request) {
  const user = await findCurrentUser();
  if (!user) return unauthorized();

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "伺服器未設定 OPENAI_API_KEY" }, { status: 500 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "伺服器未設定 BLOB_READ_WRITE_TOKEN" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "請用 multipart/form-data 上傳音檔" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "沒有收到音檔" }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return Response.json(
      { error: `不支援的格式，請上傳：${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "音檔超過 25MB 上限" }, { status: 413 });
  }

  let text: string;
  try {
    const result = await openai.audio.transcriptions.create({
      file,
      model: TRANSCRIBE_MODEL,
      response_format: "json",
      // 引導模型輸出繁體中文，否則中文常被轉成簡體
      prompt: "以下是一場台灣公司的會議錄音，請使用繁體中文逐字記錄。",
    });
    text = result.text;
  } catch (error) {
    console.error("轉錄失敗", error);
    return Response.json({ error: `轉錄失敗：${errorMessage(error)}` }, { status: 502 });
  }

  // 整理失敗時仍保存逐字稿，不讓整個請求失敗
  let minutes: MeetingMinutes | null = null;
  let minutesError: string | null = null;
  if (text.trim()) {
    try {
      minutes = await summarizeTranscript(text);
    } catch (error) {
      console.error("整理會議記錄失敗", error);
      minutesError = `整理會議記錄失敗：${errorMessage(error)}`;
    }
  } else {
    minutesError = "沒有辨識到內容，無法整理";
  }

  // AI 分析完才把錄音存到 Vercel Blob（private：只能透過我們的 API 讀取）
  const contentType =
    file.type && file.type !== "application/octet-stream" ? file.type : AUDIO_TYPES[extension];
  let blob;
  try {
    blob = await put(`meetings/${user.id}/${file.name}`, file, {
      access: "private",
      addRandomSuffix: true,
      contentType,
    });
  } catch (error) {
    console.error("錄音檔上傳 Blob 失敗", error);
    return Response.json({ error: `錄音檔儲存失敗：${errorMessage(error)}` }, { status: 502 });
  }

  try {
    await connectDB();
    const meeting = await MeetingModel.create({
      userId: user.id,
      title: file.name.replace(/\.[^.]+$/, ""),
      transcript: { fullText: text, source: "upload" },
      audio: {
        url: blob.url,
        pathname: blob.pathname,
        originalName: file.name,
        contentType,
        size: file.size,
      },
      ai: minutes
        ? { ...minutes, model: SUMMARY_MODEL, generatedAt: new Date() }
        : undefined,
      status: minutes ? "completed" : "failed",
      errorMessage: minutesError ?? undefined,
    });

    return Response.json(toMeetingDetail(meeting.toObject()));
  } catch (error) {
    console.error("儲存會議紀錄失敗", error);
    return Response.json({ error: `儲存會議紀錄失敗：${errorMessage(error)}` }, { status: 500 });
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
