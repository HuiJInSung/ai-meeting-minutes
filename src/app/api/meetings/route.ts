import { findCurrentUser, unauthorized } from "@/lib/dal";
import { listMeetings } from "@/lib/meetings";

// 目前使用者的歷史會議紀錄（新到舊）：GET /api/meetings
export async function GET() {
  const user = await findCurrentUser();
  if (!user) return unauthorized();

  return Response.json({ meetings: await listMeetings(user.id) });
}
