import OpenAI from "openai";

// 只在伺服器端使用，金鑰不會送到瀏覽器
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const TRANSCRIBE_MODEL = "gpt-transcribe";
export const SUMMARY_MODEL = "gpt-5.4-mini";

// OpenAI 語音轉文字單檔上限 25MB
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
