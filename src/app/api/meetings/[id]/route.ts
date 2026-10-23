import { findCurrentUser, unauthorized } from "@/lib/dal";
import { findMeeting, toMeetingDetail } from "@/lib/meetings";

// 單筆會議紀錄（含逐字稿、整理結果、錄音連結）：GET /api/meetings/:id
export async function GET(_req: Request, ctx: RouteContext<"/api/meetings/[id]">) {
  const user = await findCurrentUser();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const meeting = await findMeeting(user.id, id);
  // 別人的紀錄一律當作不存在
  if (!meeting) return Response.json({ error: "找不到這筆會議紀錄" }, { status: 404 });

  return Response.json(toMeetingDetail(meeting));
}
