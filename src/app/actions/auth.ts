"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { createSession, deleteSession } from "@/lib/session";
import { UserModel } from "@/models/User";

export type AuthFormState = {
  error?: string;
  fields?: { name?: string; email?: string };
} | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function readFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { name, email, password } = readFields(formData);
  const fields = { name, email };

  if (!name) return { error: "請輸入名稱", fields };
  if (!EMAIL_RE.test(email)) return { error: "Email 格式不正確", fields };
  if (password.length < MIN_PASSWORD) {
    return { error: `密碼至少要 ${MIN_PASSWORD} 個字元`, fields };
  }

  await connectDB();
  if (await UserModel.exists({ email })) {
    return { error: "這個 Email 已經註冊過了", fields };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, passwordHash });

  await createSession(user._id.toString());
  redirect("/app");
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readFields(formData);
  const fields = { email };

  if (!email || !password) return { error: "請輸入 Email 和密碼", fields };

  await connectDB();
  const user = await UserModel.findOne({ email }).select("passwordHash").lean();
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) return { error: "Email 或密碼錯誤", fields };

  await createSession(user._id.toString());
  redirect("/app");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
