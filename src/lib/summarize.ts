import { SUMMARY_MODEL, openai } from "@/lib/openai";

export type ActionItem = {
  task: string;
  owner: string | null;
  dueDate: string | null;
};

export type MeetingMinutes = {
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
};

// 要求模型照這個格式回傳（Structured Outputs）
const minutesSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "keyPoints", "actionItems"],
  properties: {
    summary: { type: "string", description: "會議摘要，3～5 句" },
    keyPoints: { type: "array", items: { type: "string" }, description: "會議重點" },
    actionItems: {
      type: "array",
      description: "待辦事項",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["task", "owner", "dueDate"],
        properties: {
          task: { type: "string", description: "要做的事" },
          owner: { type: ["string", "null"], description: "負責人，逐字稿沒提到就填 null" },
          dueDate: {
            type: ["string", "null"],
            description: "期限，照逐字稿原文描述（例如「下週五」），沒提到就填 null",
          },
        },
      },
    },
  },
};

const INSTRUCTIONS = `你是專業的會議記錄助理。根據使用者提供的會議逐字稿，整理出摘要、重點與待辦事項。
- 一律使用繁體中文。
- 只根據逐字稿內容整理，不要編造逐字稿沒有的資訊。
- 待辦事項要具體可執行；沒有明確的待辦就回傳空陣列。`;

export async function summarizeTranscript(transcript: string): Promise<MeetingMinutes> {
  const response = await openai.responses.create({
    model: SUMMARY_MODEL,
    instructions: INSTRUCTIONS,
    input: transcript,
    text: {
      format: {
        type: "json_schema",
        name: "meeting_minutes",
        schema: minutesSchema,
        strict: true,
      },
    },
  });

  return JSON.parse(response.output_text) as MeetingMinutes;
}
