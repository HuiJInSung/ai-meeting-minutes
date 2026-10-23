import "server-only";
import { isValidObjectId } from "mongoose";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { UserModel } from "@/models/User";

export type CurrentUser = { id: string; name: string; email: string };

// 讀取目前登入的使用者；cookie 無效或使用者已不存在都回傳 null
export async function findCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session || !isValidObjectId(session.userId)) return null;

  await connectDB();
  const user = await UserModel.findById(session.userId).select("name email").lean();
  if (!user) return null;

  return { id: user._id.toString(), name: user.name, email: user.email };
}

// 頁面用：沒登入就導到登入頁
export async function requireUser(): Promise<CurrentUser> {
  const user = await findCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// API 用：沒登入回 401
export function unauthorized() {
  return Response.json({ error: "請先登入" }, { status: 401 });
}
