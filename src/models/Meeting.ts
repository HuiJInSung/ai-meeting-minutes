import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";

// 與會者
const participantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true }, // 例如：主持人、PM、工程師
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

// 逐字稿片段（有說話者與時間軸時使用）
const transcriptSegmentSchema = new Schema(
  {
    speaker: { type: String, trim: true },
    startTime: { type: Number }, // 秒
    endTime: { type: Number }, // 秒
    text: { type: String, required: true },
  },
  { _id: false }
);

// 待辦事項
const actionItemSchema = new Schema({
  task: { type: String, required: true },
  owner: { type: String, trim: true },
  dueDate: { type: String, trim: true }, // AI 照逐字稿原文填，例如「下週五」
  status: {
    type: String,
    enum: ["todo", "in_progress", "done"],
    default: "todo",
  },
});

// AI 整理結果
const aiResultSchema = new Schema(
  {
    summary: { type: String }, // 會議摘要
    keyPoints: { type: [String], default: [] }, // 重點
    decisions: { type: [String], default: [] }, // 決議事項
    actionItems: { type: [actionItemSchema], default: [] }, // 待辦事項
    openQuestions: { type: [String], default: [] }, // 待釐清 / 未決問題
    topics: { type: [String], default: [] }, // 討論主題
    model: { type: String }, // 使用的 AI 模型
    generatedAt: { type: Date },
  },
  { _id: false }
);

// 錄音檔（存在 Vercel Blob）
const audioSchema = new Schema(
  {
    url: { type: String, required: true }, // Blob 網址，只在伺服器端使用
    pathname: { type: String, required: true },
    originalName: { type: String },
    contentType: { type: String },
    size: { type: Number }, // bytes
  },
  { _id: false }
);

const meetingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 擁有者
    title: { type: String, required: true, trim: true },
    meetingDate: { type: Date, default: Date.now },
    durationMinutes: { type: Number },
    location: { type: String, trim: true }, // 會議室或線上連結
    participants: { type: [participantSchema], default: [] },
    tags: { type: [String], default: [] },

    // 逐字稿
    transcript: {
      fullText: { type: String, default: "" }, // 完整逐字稿
      segments: { type: [transcriptSegmentSchema], default: [] },
      language: { type: String, default: "zh-TW" },
      source: {
        type: String,
        enum: ["paste", "upload", "recording"],
        default: "paste",
      },
    },

    audio: { type: audioSchema, default: undefined },

    // AI 整理後的內容
    ai: { type: aiResultSchema, default: undefined },

    // 處理狀態
    status: {
      type: String,
      enum: ["draft", "processing", "completed", "failed"],
      default: "draft",
      index: true,
    },
    errorMessage: { type: String }, // AI 處理失敗時的錯誤訊息
  },
  { timestamps: true } // 自動加 createdAt / updatedAt
);

meetingSchema.index({ userId: 1, createdAt: -1 }); // 查某人的歷史紀錄

export type Meeting = InferSchemaType<typeof meetingSchema>;

// 熱更新會重新執行這個檔案：先移除舊的 model 再註冊，才會套用最新的欄位設定
if (models.Meeting) deleteModel("Meeting");
export const MeetingModel: Model<Meeting> = model<Meeting>("Meeting", meetingSchema);
